/**
 * QBTC UNIFIED - Metrics Engine
 * Engine for collecting futures microstructure and quantum edge metrics
 * Scope: FUTURES ONLY, metrics-driven quantum edge capture
 */

const { METRICS } = require('../shared/constants/QBTCConstants.js');

class QBTCMetricsEngine {
  constructor() {
    if (QBTCMetricsEngine.instance) return QBTCMetricsEngine.instance;

    // Time buckets
    this.intervals = {
      second: METRICS.INTERVALS.SECOND,
      minute: METRICS.INTERVALS.MINUTE,
      hour: METRICS.INTERVALS.HOUR,
      day: METRICS.INTERVALS.DAY,
    };

    // In-memory metric stores
    this.counters = Object.create(null);
    this.gauges = Object.create(null);
    this.histograms = Object.create(null);
    this.summaries = Object.create(null);

    // Latest per-symbol snapshots (futures microstructure)
    this.latestEdgeSnapshot = new Map(); // symbol -> snapshot
    this.latestExecutionStats = new Map(); // symbol -> { slippage, expected, actual, qty, ts }

    // Rolling windows (per symbol) for dashboard/backtesting
    this.rolling = {
      // symbol -> array of snapshots (bounded)
      edge: new Map(),
      // symbol -> array of executions (bounded)
      exec: new Map(),
      maxPoints: 600, // 600 points ~ 1h at 6s cadence or 10m at 1s cadence
    };

    // Init default counters
    this._ensureCounter(METRICS.NAMES.API_REQUESTS);
    this._ensureCounter(METRICS.NAMES.API_ERRORS);
    this._ensureCounter(METRICS.NAMES.TRADING_VOLUME);
    this._ensureCounter(METRICS.NAMES.PROFIT_LOSS);
    this._ensureGauge(METRICS.NAMES.ACTIVE_POSITIONS);
    this._ensureGauge(METRICS.NAMES.MEMORY_USAGE);
    this._ensureGauge(METRICS.NAMES.CPU_USAGE);

    // Futures microstructure gauges (extended)
    const futuresGauges = [
      'funding_rate',
      'funding_curvature',
      'open_interest',
      'open_interest_delta',
      'basis',
      'mark_index_stress',
      'liquidation_density',
      'lob_imbalance_top',
      'lob_imbalance_top5',
      'lob_imbalance_top20',
      'ofi',
      'cvd',
      'adl_pressure',
      'kyle_lambda',
      'spread',
      'spread_velocity',
      'edge_score',
      'edge_entropy',
      'action_integral', // from path integrals of micro-state
    ];
    futuresGauges.forEach(name => this._ensureGauge(name));

    QBTCMetricsEngine.instance = this;
  }

  // Counter utilities
  _ensureCounter(name) {
    if (!this.counters[name]) {
      this.counters[name] = { type: METRICS.TYPES.COUNTER, value: 0 };
    }
  }
  inc(name, value = 1) {
    this._ensureCounter(name);
    this.counters[name].value += value;
  }

  // Gauge utilities
  _ensureGauge(name) {
    if (!this.gauges[name]) {
      this.gauges[name] = { type: METRICS.TYPES.GAUGE, value: 0 };
    }
  }
  setGauge(name, value) {
    this._ensureGauge(name);
    this.gauges[name].value = this._sanitizeNumber(value);
  }
  addGauge(name, delta) {
    this._ensureGauge(name);
    this.gauges[name].value = this._sanitizeNumber(this.gauges[name].value + delta);
  }

  // Histogram utilities (simple fixed buckets)
  _ensureHistogram(name, buckets = [0.001, 0.005, 0.01, 0.02, 0.05, 0.1, 'inf']) {
    if (!this.histograms[name]) {
      this.histograms[name] = {
        type: METRICS.TYPES.HISTOGRAM,
        buckets,
        counts: buckets.map(() => 0),
        sum: 0,
        count: 0,
      };
    }
  }
  observeHistogram(name, value, buckets) {
    this._ensureHistogram(name, buckets);
    const h = this.histograms[name];
    const v = this._sanitizeNumber(value);
    let idx = h.buckets.length - 1;
    for (let i = 0; i < h.buckets.length; i++) {
      const b = h.buckets[i];
      if (b === 'inf' || v <= b) {
        idx = i;
        break;
      }
    }
    h.counts[idx] += 1;
    h.sum += v;
    h.count += 1;
  }

  // Summary utilities (EMA-based)
  _ensureSummary(name, alpha = 0.2) {
    if (!this.summaries[name]) {
      this.summaries[name] = {
        type: METRICS.TYPES.SUMMARY,
        alpha,
        avg: 0,
        initialized: false,
        last: 0,
      };
    }
  }
  observeSummary(name, value, alpha) {
    this._ensureSummary(name, alpha);
    const s = this.summaries[name];
    const v = this._sanitizeNumber(value);
    if (!s.initialized) {
      s.avg = v;
      s.initialized = true;
    } else {
      const a = alpha || s.alpha;
      s.avg = a * v + (1 - a) * s.avg;
    }
    s.last = v;
  }

  // Futures-only: record microstructure and quantum edge snapshot
  // snapshot: {
  //   symbol, ts, fundingRate, fundingCurvature, oi, oiDelta, basis, markStress,
  //   liquidationDensity, lobImbalanceTop, lobImbalanceTop5, lobImbalanceTop20,
  //   ofi, cvd, adlPressure, kyleLambda, spread, spreadVelocity,
  //   edgeScore, edgeEntropy, actionIntegral
  // }
  recordEdgeSnapshot(snapshot) {
    const { symbol } = snapshot;
    if (!symbol) return;

    // Store latest
    this.latestEdgeSnapshot.set(symbol, { ...snapshot });

    // Rolling window
    this._pushRolling(this.rolling.edge, symbol, snapshot);

    // Gauges per global namespace (most recent observed values)
    this.setGauge('funding_rate', snapshot.fundingRate);
    this.setGauge('funding_curvature', snapshot.fundingCurvature);
    this.setGauge('open_interest', snapshot.oi);
    this.setGauge('open_interest_delta', snapshot.oiDelta);
    this.setGauge('basis', snapshot.basis);
    this.setGauge('mark_index_stress', snapshot.markStress);
    this.setGauge('liquidation_density', snapshot.liquidationDensity);
    this.setGauge('lob_imbalance_top', snapshot.lobImbalanceTop);
    this.setGauge('lob_imbalance_top5', snapshot.lobImbalanceTop5);
    this.setGauge('lob_imbalance_top20', snapshot.lobImbalanceTop20);
    this.setGauge('ofi', snapshot.ofi);
    this.setGauge('cvd', snapshot.cvd);
    this.setGauge('adl_pressure', snapshot.adlPressure);
    this.setGauge('kyle_lambda', snapshot.kyleLambda);
    this.setGauge('spread', snapshot.spread);
    this.setGauge('spread_velocity', snapshot.spreadVelocity);
    this.setGauge('edge_score', snapshot.edgeScore);
    this.setGauge('edge_entropy', snapshot.edgeEntropy);
    this.setGauge('action_integral', snapshot.actionIntegral);

    // Distributions
    this.observeHistogram('edge_score_distribution', snapshot.edgeScore, [0.1, 0.25, 0.5, 0.75, 0.9, 'inf']);
    this.observeHistogram('kyle_lambda_distribution', snapshot.kyleLambda, [0.1, 0.5, 1, 2, 5, 'inf']);
    this.observeHistogram('liquidation_density_distribution', snapshot.liquidationDensity, [1, 5, 10, 25, 50, 'inf']);

    // Smooth summaries for stability
    this.observeSummary('edge_score_sma', snapshot.edgeScore, 0.15);
    this.observeSummary('basis_sma', snapshot.basis, 0.2);
    this.observeSummary('funding_rate_sma', snapshot.fundingRate, 0.2);
    this.observeSummary('open_interest_delta_sma', snapshot.oiDelta, 0.25);
    this.observeSummary('ofi_sma', snapshot.ofi, 0.25);
    this.observeSummary('cvd_sma', snapshot.cvd, 0.15);
  }

  // Execution metrics
  recordExecution(symbol, { expectedPrice, actualPrice, qty, side }) {
    const slippage = this._sanitizeNumber((actualPrice - expectedPrice) / expectedPrice);
    const ts = Date.now();
    const rec = { expectedPrice, actualPrice, qty, side, slippage, ts };
    this.latestExecutionStats.set(symbol, rec);
    this._pushRolling(this.rolling.exec, symbol, rec);

    // Global metrics
    this.observeHistogram('execution_slippage', Math.abs(slippage), [0.0005, 0.001, 0.0025, 0.005, 0.01, 'inf']);
    this.observeSummary('execution_slippage_sma', Math.abs(slippage), 0.2);
  }

  // Public getters
  getLatestSnapshot(symbol) {
    return this.latestEdgeSnapshot.get(symbol) || null;
  }

  getRolling(symbol, type = 'edge') {
    const pool = type === 'exec' ? this.rolling.exec : this.rolling.edge;
    return pool.get(symbol) || [];
  }

  getSummary() {
    return {
      ts: Date.now(),
      counters: this._cloneShallow(this.counters),
      gauges: this._cloneShallow(this.gauges),
      histograms: this._cloneHistogram(this.histograms),
      summaries: this._cloneSummary(this.summaries),
      symbols: {
        tracked: this.latestEdgeSnapshot.size,
      },
    };
  }

  // Maintenance
  reset() {
    this.counters = Object.create(null);
    this.gauges = Object.create(null);
    this.histograms = Object.create(null);
    this.summaries = Object.create(null);
    this.latestEdgeSnapshot.clear();
    this.latestExecutionStats.clear();
    this.rolling.edge.clear();
    this.rolling.exec.clear();

    // Recreate base metrics
    this._ensureCounter(METRICS.NAMES.API_REQUESTS);
    this._ensureCounter(METRICS.NAMES.API_ERRORS);
    this._ensureCounter(METRICS.NAMES.TRADING_VOLUME);
    this._ensureCounter(METRICS.NAMES.PROFIT_LOSS);
    this._ensureGauge(METRICS.NAMES.ACTIVE_POSITIONS);
    this._ensureGauge(METRICS.NAMES.MEMORY_USAGE);
    this._ensureGauge(METRICS.NAMES.CPU_USAGE);
  }

  // Internal helpers
  _pushRolling(map, key, value) {
    if (!map.has(key)) map.set(key, []);
    const arr = map.get(key);
    arr.push(value);
    if (arr.length > this.rolling.maxPoints) arr.shift();
  }

  _sanitizeNumber(v) {
    if (v === null || v === undefined) return 0;
    if (Number.isNaN(v)) return 0;
    if (!Number.isFinite(v)) return 0;
    return v;
  }

  _cloneShallow(obj) {
    const out = Object.create(null);
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      out[k] = { ...v };
    }
    return out;
  }

  _cloneHistogram(hm) {
    const out = Object.create(null);
    for (const k of Object.keys(hm)) {
      const h = hm[k];
      out[k] = {
        type: h.type,
        buckets: [...h.buckets],
        counts: [...h.counts],
        sum: h.sum,
        count: h.count,
      };
    }
    return out;
  }

  _cloneSummary(sm) {
    const out = Object.create(null);
    for (const k of Object.keys(sm)) {
      const s = sm[k];
      out[k] = {
        type: s.type,
        alpha: s.alpha,
        avg: s.avg,
        initialized: s.initialized,
        last: s.last,
      };
    }
    return out;
  }
}

module.exports = new QBTCMetricsEngine();