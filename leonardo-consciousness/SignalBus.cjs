/**
 * SignalBus - Bus de Señales Unificado (singleton)
 * Permite publicar oportunidades desde múltiples productores
 * y consumirlas de forma priorizada por un único ejecutor.
 */

const { EventEmitter } = require('events');

class SignalBus extends EventEmitter {
  constructor() {
    super();
    if (SignalBus._instance) return SignalBus._instance;
    this._queue = new Map(); // key -> { opportunity, source, ts }
    this._stats = { published: 0, consumed: 0, dropped: 0 };
    SignalBus._instance = this;
  }

  static getInstance() {
    return new SignalBus();
  }

  _makeKey(op) {
    const sym = (op.symbol || '').toUpperCase();
    const tf = (op.timeframe || '').toLowerCase();
    return tf ? `${sym}:${tf}` : sym;
  }

  _makeKeyFromParts(symbol, timeframe) {
    const sym = String(symbol || '').toUpperCase();
    const tf = String(timeframe || '').toLowerCase();
    return tf ? `${sym}:${tf}` : sym;
  }

  publish(opportunity, source = 'unknown') {
    try {
      if (!opportunity || !opportunity.symbol) return false;
      const key = this._makeKey(opportunity);
      const enriched = {
        ...opportunity,
        source,
        publishedAt: Date.now(),
      };
      // Deduplicación: si existe y la nueva tiene mejor score, reemplazar
      const existing = this._queue.get(key);
      if (!existing || this._compare(enriched, existing.opportunity) > 0) {
        this._queue.set(key, { opportunity: enriched, source, ts: Date.now() });
        this._stats.published += 1;
        this.emit('signal:published', enriched);
        return true;
      }
      this._stats.dropped += 1;
      return false;
    } catch (_) { return false; }
  }

  getNextBatch(maxItems = 10) {
    const items = Array.from(this._queue.values()).map(x => x.opportunity);
    items.sort((a, b) => this._compare(b, a)); // descendente
    const batch = items.slice(0, maxItems);
    // Eliminar del queue
    for (const op of batch) {
      const key = this._makeKey(op);
      this._queue.delete(key);
    }
    this._stats.consumed += batch.length;
    if (batch.length) this.emit('signal:consumed', batch);
    return batch;
  }

  size() { return this._queue.size; }
  stats() { return { ...this._stats, queued: this._queue.size }; }

  peek(maxItems = 10) {
    const items = Array.from(this._queue.values()).map(x => x.opportunity);
    items.sort((a, b) => this._compare(b, a));
    return items.slice(0, maxItems);
  }

  peekFiltered({ symbol, category, source, offset = 0, limit = 10 } = {}) {
    let items = Array.from(this._queue.values()).map(x => x.opportunity);
    if (symbol) {
      const s = String(symbol).toUpperCase();
      items = items.filter(op => String(op.symbol || '').toUpperCase() === s);
    }
    if (category) {
      const c = String(category).toLowerCase();
      items = items.filter(op => String(op.category || '').toLowerCase() === c);
    }
    if (source) {
      const src = String(source).toLowerCase();
      items = items.filter(op => String(op.source || '').toLowerCase() === src);
    }
    items.sort((a, b) => this._compare(b, a));
    const start = Math.max(0, parseInt(offset) || 0);
    const end = start + Math.min(100, Math.max(1, parseInt(limit) || 10));
    return items.slice(start, end);
  }

  discard(symbol, timeframe) {
    try {
      const key = this._makeKeyFromParts(symbol, timeframe);
      return this._queue.delete(key);
    } catch (_) { return false; }
  }

  requeue(symbol, timeframe, boost = 0.1) {
    try {
      const key = this._makeKeyFromParts(symbol, timeframe);
      const entry = this._queue.get(key);
      if (!entry) return false;
      const op = { ...entry.opportunity };
      const base = Number(op.compositeScore);
      if (Number.isFinite(base)) {
        op.compositeScore = Math.max(0, Math.min(1, base + Number(boost || 0)));
      } else if (Number.isFinite(op.potentialProfit)) {
        op.potentialProfit = Number(op.potentialProfit) * (1 + Number(boost || 0));
      } else if (Number.isFinite(op.confidence)) {
        op.confidence = Math.max(0, Math.min(1, Number(op.confidence) + Number(boost || 0)));
      }
      op.publishedAt = Date.now();
      this._queue.set(key, { opportunity: op, source: entry.source, ts: Date.now() });
      this.emit('signal:published', op);
      return true;
    } catch (_) { return false; }
  }

  clear() {
    try {
      const count = this._queue.size;
      this._queue.clear();
      return count;
    } catch (_) { return 0; }
  }

  _scoreOf(op) {
    // Usar compositeScore > potentialProfit > confidence > timestamp
    if (typeof op.compositeScore === 'number') return op.compositeScore;
    if (typeof op.potentialProfit === 'number') return op.potentialProfit;
    if (typeof op.confidence === 'number') return op.confidence;
    return (op.publishedAt || 0) / 1e15; // muy bajo
  }

  _compare(a, b) {
    const sa = this._scoreOf(a);
    const sb = this._scoreOf(b);
    if (sa !== sb) return sa - sb;
    // desempate por timestamp más reciente
    const ta = a.publishedAt || 0;
    const tb = b.publishedAt || 0;
    return ta - tb;
  }
}

module.exports = SignalBus.getInstance();


