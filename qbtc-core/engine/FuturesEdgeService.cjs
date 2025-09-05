/**
 * QBTC UNIFIED - Futures Edge Service (Singleton)
 * Purpose: Isolate futures-only microstructure + quantum path-integral logic
 * to avoid duplication/confusion across Decision/Trading engines.
 *
 * Responsibilities:
 * - Own a single FuturesQuantumEdgeEngine instance
 * - Provide uniform APIs to build snapshots, generate signals, and analyze sets of symbols
 * - Record metrics centrally via QBTCMetricsEngine (the engine already does it)
 */

const { TRADING } = require('../shared/constants/QBTCConstants.js');
const BinanceConnector = require('../shared/connectors/BinanceConnector.js');
const Metrics = require('./QBTCMetricsEngine.js');
const FuturesQuantumEdgeEngine = require('./FuturesQuantumEdgeEngine.js');

class FuturesEdgeService {
  constructor() {
    if (FuturesEdgeService._instance) return FuturesEdgeService._instance;

    // Connector (singleton)
    this.connector = BinanceConnector.getInstance();

    // Engine (single owner)
    this.engine = new FuturesQuantumEdgeEngine(this.connector);

    // Latest per-symbol snapshot cache
    this.snapshots = new Map();

    FuturesEdgeService._instance = this;
  }

  static getInstance() {
    if (!FuturesEdgeService._instance) {
      FuturesEdgeService._instance = new FuturesEdgeService();
    }
    return FuturesEdgeService._instance;
  }

  /**
   * Build and store a snapshot for a single symbol
   */
  async buildSnapshot(symbol) {
    const snapshot = await this.engine.buildEdgeSnapshot(symbol);
    if (snapshot) {
      this.snapshots.set(symbol, snapshot);
    }
    return snapshot;
  }

  /**
   * Build snapshots for a list of symbols and return an analysis map
   * { [symbol]: { snapshot, timestamp } }
   */
  async analyzeSymbols(symbols) {
    const result = {};
    const now = Date.now();

    for (const symbol of symbols) {
      try {
        const snap = await this.buildSnapshot(symbol);
        if (snap) {
          result[symbol] = { snapshot: snap, timestamp: now };
        }
      } catch (e) {
        // continue; isolate failures per symbol
      }
    }

    return result;
  }

  /**
   * Generate a signal for a given snapshot or for the latest stored one
   */
  getSignal(input) {
    const snapshot = typeof input === 'string' ? this.snapshots.get(input) : input;
    if (!snapshot) return null;
    return this.engine.getSignal(snapshot);
  }

  /**
   * Helper: analyze default symbols configured in TRADING.SYMBOLS (MAJOR + MINOR)
   */
  async analyzeDefaultSymbols() {
    const symbols = TRADING.SYMBOLS.MAJOR.concat(TRADING.SYMBOLS.MINOR);
    return this.analyzeSymbols(symbols);
  }

  /**
   * Accessors
   */
  getLatestSnapshot(symbol) {
    return this.snapshots.get(symbol) || null;
  }

  getMetricsSummary() {
    return Metrics.getSummary();
  }
}

module.exports = FuturesEdgeService;