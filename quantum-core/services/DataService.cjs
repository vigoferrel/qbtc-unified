const EventEmitter = require('events');
const RateLimiter = require('./RateLimiter.cjs');

/**
 * DataService: Centralized, singleton cache and access layer for market data and account state.
 *
 * Goals:
 * - Single source of truth for exchangeInfo, prices, and balances
 * - De-duplicate concurrent fetches (in-flight promise coalescing)
 * - Cache with TTL to reduce API calls
 * - Optional connector attachment to receive push updates (ticker/balance) and to fetch on cache miss
 * - Lightweight rate limiting to avoid hitting provider limits
 */
class DataService extends EventEmitter {
  static #instance;

  /**
   * @param {object} opts
   * @param {number} [opts.priceTtlMs=1000]
   * @param {number} [opts.balanceTtlMs=5000]
   * @param {number} [opts.exchangeInfoTtlMs=600000]
   * @param {number} [opts.tokensPerInterval=10] Approx requests allowed per interval
   * @param {number} [opts.intervalMs=1000] Interval window in ms for tokensPerInterval
   */
  constructor(opts = {}) {
    super();
    this.opts = {
      priceTtlMs: Number(process.env.DS_PRICE_TTL_MS || opts.priceTtlMs || 1000),
      balanceTtlMs: Number(process.env.DS_BAL_TTL_MS || opts.balanceTtlMs || 5000),
      exchangeInfoTtlMs: Number(process.env.DS_EXINFO_TTL_MS || opts.exchangeInfoTtlMs || 600000),
      tokensPerInterval: Number(process.env.DS_TOKENS_PER_INTERVAL || opts.tokensPerInterval || 10),
      intervalMs: Number(process.env.DS_INTERVAL_MS || opts.intervalMs || 1000),
    };

    this.connector = null;
    this.rateLimiter = new RateLimiter({
      tokensPerInterval: this.opts.tokensPerInterval,
      intervalMs: this.opts.intervalMs,
    });

    // caches
    this._exchangeInfo = { data: null, ts: 0 };
    this._prices = new Map(); // symbol -> { price, ts }
    this._balances = new Map(); // asset -> { free, locked, ts }
    this._klines = new Map(); // key(symbol|interval|limit) -> { data, ts }

    // de-dupe in-flight calls
    this._inFlight = new Map(); // key -> Promise
  }

  /**
   * Returns the singleton instance
   * @param {object} [opts]
   * @returns {DataService}
   */
  static getInstance(opts) {
    if (!DataService.#instance) {
      DataService.#instance = new DataService(opts);
    }
    return DataService.#instance;
  }

  /**
   * Attach a connector to use for fetches and subscribe to push updates if available.
   * The connector is expected to optionally expose:
   *  - on(event, handler) for 'ticker' {symbol, price} and 'balance' {asset, free, locked}
   *  - getExchangeInfo()
   *  - getPrice(symbol) or getTicker(symbol)
   *  - getBalances() or getAccountInfo()
   */
  attachConnector(connector) {
    this.connector = connector;
    if (!connector) return;

    // Subscribe to push updates if supported
    try {
      if (typeof connector.on === 'function') {
        connector.on('ticker', (payload) => {
          try {
            const symbol = (payload.symbol || payload.s || '').toUpperCase();
            const price = Number(payload.price || payload.p || payload.lastPrice || payload.c);
            if (symbol && Number.isFinite(price)) {
              this.recordTickerUpdate(symbol, price);
            }
          } catch (_) { /* ignore malformed */ }
        });
        connector.on('balance', (payload) => {
          try {
            const asset = (payload.asset || payload.a || '').toUpperCase();
            const free = Number(payload.free || payload.f || 0);
            const locked = Number(payload.locked || payload.l || 0);
            if (asset) {
              this.recordBalanceUpdate(asset, { free, locked });
            }
          } catch (_) { /* ignore */ }
        });
      }
    } catch (_) { /* connector may not be EventEmitter */ }
  }

  // INTERNAL: get/put in-flight
  _getInFlight(key) { return this._inFlight.get(key); }
  _setInFlight(key, p) { this._inFlight.set(key, p); p.finally(() => this._inFlight.delete(key)); return p; }

  // PUBLIC API

  async getExchangeInfo({ forceRefresh = false } = {}) {
    const now = Date.now();
    if (!forceRefresh && this._exchangeInfo.data && now - this._exchangeInfo.ts < this.opts.exchangeInfoTtlMs) {
      return this._exchangeInfo.data;
    }
    const key = 'exchangeInfo';
    if (this._getInFlight(key)) return this._getInFlight(key);

    const p = (async () => {
      await this.rateLimiter.acquire();
      if (!this.connector || typeof this.connector.getExchangeInfo !== 'function') {
        throw new Error('DataService: No connector.getExchangeInfo() available. Attach a connector or preload exchangeInfo.');
      }
      const data = await this.connector.getExchangeInfo();
      this._exchangeInfo = { data, ts: Date.now() };
      this.emit('exchangeInfo', data);
      return data;
    })();
    return this._setInFlight(key, p);
  }

  getSymbolFilters(symbol) {
    symbol = (symbol || '').toUpperCase();
    const ex = this._exchangeInfo.data;
    if (!ex || !ex.symbols) return null;
    const s = ex.symbols.find(x => (x.symbol || '').toUpperCase() === symbol);
    if (!s || !Array.isArray(s.filters)) return null;
    const filters = {};
    for (const f of s.filters) {
      if (f.filterType === 'LOT_SIZE') filters.lotSize = f;
      if (f.filterType === 'PRICE_FILTER') filters.priceFilter = f;
      if (f.filterType === 'MIN_NOTIONAL') filters.minNotional = f;
      if (f.filterType === 'MARKET_LOT_SIZE') filters.marketLotSize = f;
    }
    return filters;
  }

  async getPrice(symbol, { maxAgeMs = this.opts.priceTtlMs, forceRefresh = false } = {}) {
    symbol = (symbol || '').toUpperCase();
    const now = Date.now();
    const cached = this._prices.get(symbol);
    if (!forceRefresh && cached && now - cached.ts < maxAgeMs) return cached.price;

    const key = `price:${symbol}`;
    if (this._getInFlight(key)) return this._getInFlight(key);

    const p = (async () => {
      await this.rateLimiter.acquire();
      if (!this.connector) throw new Error('DataService: No connector attached for getPrice().');
      let price;
      if (typeof this.connector.getPrice === 'function') {
        price = await this.connector.getPrice(symbol);
      } else if (typeof this.connector.getTicker === 'function') {
        const t = await this.connector.getTicker(symbol);
        price = Number(t && (t.price || t.lastPrice || t.c));
      } else {
        throw new Error('DataService: Connector lacks getPrice/getTicker.');
      }
      if (!Number.isFinite(price)) throw new Error(`DataService: Invalid price for ${symbol}`);
      this.recordTickerUpdate(symbol, price);
      return price;
    })();
    return this._setInFlight(key, p);
  }

  async getBalances({ forceRefresh = false, maxAgeMs = this.opts.balanceTtlMs } = {}) {
    const now = Date.now();
    const newest = [...this._balances.values()].reduce((acc, v) => Math.max(acc, v.ts || 0), 0);
    const fresh = now - newest < maxAgeMs && this._balances.size > 0;
    if (!forceRefresh && fresh) return this._balancesSnapshot();

    const key = 'balances';
    if (this._getInFlight(key)) return this._getInFlight(key);

    const p = (async () => {
      await this.rateLimiter.acquire();
      if (!this.connector) throw new Error('DataService: No connector attached for getBalances().');
      let balances;
      if (typeof this.connector.getBalances === 'function') {
        balances = await this.connector.getBalances();
      } else if (typeof this.connector.getAccountInfo === 'function') {
        const acc = await this.connector.getAccountInfo();
        balances = acc && (acc.balances || acc.assets || acc.totalWalletBalance);
      } else {
        throw new Error('DataService: Connector lacks getBalances/getAccountInfo.');
      }
      this._ingestBalances(balances);
      this.emit('balances', this._balancesSnapshot());
      return this._balancesSnapshot();
    })();
    return this._setInFlight(key, p);
  }

  // Helpers to record updates coming from push streams or external sources
  recordTickerUpdate(symbol, price) {
    symbol = (symbol || '').toUpperCase();
    if (!symbol || !Number.isFinite(price)) return;
    this._prices.set(symbol, { price: Number(price), ts: Date.now() });
    this.emit('price', { symbol, price: Number(price) });
  }

  recordBalanceUpdate(asset, { free = 0, locked = 0 } = {}) {
    asset = (asset || '').toUpperCase();
    if (!asset) return;
    this._balances.set(asset, { free: Number(free), locked: Number(locked), ts: Date.now() });
    this.emit('balance', { asset, free: Number(free), locked: Number(locked) });
  }

  preloadExchangeInfo(data) {
    this._exchangeInfo = { data, ts: Date.now() };
    this.emit('exchangeInfo', data);
  }

  _ingestBalances(balances) {
    if (Array.isArray(balances)) {
      for (const b of balances) {
        const asset = (b.asset || b.coin || b.a || '').toUpperCase();
        const free = Number(b.free || b.availableBalance || b.f || b.freeBalance || 0);
        const locked = Number(b.locked || b.l || b.lockedBalance || 0);
        if (asset) {
          this._balances.set(asset, { free, locked, ts: Date.now() });
        }
      }
    } else if (balances && typeof balances === 'object') {
      // Futures account summary may expose total* or per-asset structures
      for (const [asset, v] of Object.entries(balances)) {
        const free = Number(v.free || v.available || v.walletBalance || 0);
        const locked = Number(v.locked || v.l || 0);
        this._balances.set(asset.toUpperCase(), { free, locked, ts: Date.now() });
      }
    }
  }

  _balancesSnapshot() {
    const out = {};
    for (const [asset, v] of this._balances.entries()) {
      out[asset] = { free: v.free, locked: v.locked, ts: v.ts };
    }
    return out;
  }

  // Klines (historical candles) with caching and coalescing
  async getKlines(symbol, { interval = '5m', limit = 500, maxAgeMs = 60_000, forceRefresh = false } = {}) {
    symbol = (symbol || '').toUpperCase();
    const key = `klines:${symbol}:${interval}:${limit}`;
    const now = Date.now();
    const cached = this._klines.get(key);
    if (!forceRefresh && cached && now - cached.ts < maxAgeMs) return cached.data;
    if (this._getInFlight(key)) return this._getInFlight(key);

    const p = (async () => {
      await this.rateLimiter.acquire();
      if (!this.connector || typeof this.connector.makeRequest !== 'function') {
        throw new Error('DataService: Connector lacks makeRequest() required for klines.');
      }
      const data = await this.connector.makeRequest('GET', '/fapi/v1/klines', { symbol, interval, limit });
      this._klines.set(key, { data, ts: Date.now() });
      return data;
    })();
    return this._setInFlight(key, p);
  }
}

module.exports = DataService;

