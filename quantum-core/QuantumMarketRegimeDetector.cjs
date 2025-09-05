// ========================================================================
// 🔮 QUANTUM MARKET REGIME DETECTOR - LEONARDO CONSCIOUSNESS
// Sistema Cuántico de Detección de Regímenes de Mercado
// Basado en PHI, Serie Fibonacci, 7919 Prime, y coherencia cuántica
// ========================================================================

const { EventEmitter } = require('events');
const { LeonardoConstants } = require('../leonardo-consciousness/LeonardoDecisionEngine');
const { AdversityPrimePredictor, PRIME_CONSTANTS } = require('./AdversityPrimePredictor');

// Regímenes de mercado estándar
const MARKET_REGIMES = {
    BULL_TRENDING: 'BULL_TRENDING',
    BEAR_TRENDING: 'BEAR_TRENDING',
    SIDEWAYS_RANGE: 'SIDEWAYS_RANGE',
    HIGH_VOLATILITY_CHAOS: 'HIGH_VOLATILITY_CHAOS',
    LOW_VOLATILITY_STABLE: 'LOW_VOLATILITY_STABLE',
    MEAN_REVERTING: 'MEAN_REVERTING'
};

class QuantumMarketRegimeDetector extends EventEmitter {
    constructor(config = {}) {
        super();

        // Config derivada de constantes del sistema
        this.constants = {
            PHI: LeonardoConstants.PHI,
            EULER: LeonardoConstants.EULER,
            PI: LeonardoConstants.PI,
            FIB: LeonardoConstants.FIBONACCI_SEQUENCE || [34, 55, 89, 144],
            PRIME_7919: LeonardoConstants.PRIME_7919 || PRIME_CONSTANTS?.ADVERSITY_PRIME || 7919,
            VOL_SPIKE_Z: 2.618, // Umbral spike (PHI^2 aprox)
            BW_LOW: 1 / LeonardoConstants.PHI, // ≈ 0.618
            BW_VERY_LOW: 1 / Math.pow(LeonardoConstants.PHI, 2), // ≈ 0.382
            RANGE_ATR_RANGE: [1 / Math.pow(LeonardoConstants.PHI, 2), 1 / LeonardoConstants.PHI], // 0.382 - 0.618
            MOMENTUM_TREND: 0.000618, // Umbral pendiente EMA para tendencia
            STABILITY_MIN_BARS: 34 // Persistencia mínima
        };

        this.config = {
            lookback: config.lookback || 144, // Fibonacci
            updateIntervalMs: config.updateIntervalMs || 5000,
            ...config
        };

        this.state = {
            currentRegime: null,
            probabilities: {},
            coherence: 0,
            stability: 0,
            lastChangeTs: 0,
            lastSymbol: null,
            lastTimeframe: null,
            transitions: 0
        };
    }

    async initialize() {
        this.isInitialized = true;
        return true;
    }

    getHealth() {
        return this.isInitialized ? 'HEALTHY' : 'NOT_INITIALIZED';
    }

    updateFromMarketData({ symbol, prices, volumes = [], timeframe = '1h' }) {
        if (!Array.isArray(prices) || prices.length < 10) return null;
        this.lastSeries = { symbol, prices, volumes, timeframe };
        return this.detect(symbol, timeframe, prices, volumes);
    }

    detect(symbol, timeframe = '1h', prices = null, volumes = null) {
        const series = prices && prices.length ? { prices, volumes: volumes || [] } : this.lastSeries;
        if (!series || !Array.isArray(series.prices) || series.prices.length < 20) return this.getStatus();

        const { prices: P, volumes: V } = series;
        const N = Math.min(P.length, this.config.lookback);
        const slice = P.slice(-N);
        const volSlice = (V && V.length ? V.slice(-N) : new Array(N).fill(0));

        // Indicadores básicos
        const ema20 = this.#ema(slice, 20);
        const ema50 = this.#ema(slice, 50);
        const atr = this.#atrApprox(slice);
        const bbWidth = this.#bollingerBandwidth(slice);
        const momentum = this.#momentum(slice);
        const rangeAtr = this.#rangeOverAtr(slice, atr);
        const zSpike = this.#zscoreReturns(slice);

        // Energías por régimen (ponderadas con PHI)
        const energies = {};
        energies[MARKET_REGIMES.BULL_TRENDING] = this.#energyBull(ema20, ema50, momentum, bbWidth);
        energies[MARKET_REGIMES.BEAR_TRENDING] = this.#energyBear(ema20, ema50, momentum, bbWidth);
        energies[MARKET_REGIMES.SIDEWAYS_RANGE] = this.#energySideways(rangeAtr, bbWidth, momentum);
        energies[MARKET_REGIMES.HIGH_VOLATILITY_CHAOS] = this.#energyChaos(zSpike, atr, bbWidth);
        energies[MARKET_REGIMES.LOW_VOLATILITY_STABLE] = this.#energyStable(bbWidth, atr, momentum);
        energies[MARKET_REGIMES.MEAN_REVERTING] = this.#energyMeanRevert(rangeAtr, momentum, bbWidth);

        const probs = this.#softmax(energies);
        const { regime, coherence } = this.#selectRegime(probs);

        // Estabilidad temporal (persistencia en barras Fibonacci)
        const now = Date.now();
        let stability = this.state.stability;
        if (this.state.currentRegime === regime) {
            const dt = Math.max(1, (now - (this.state.lastChangeTs || now)) / 60000); // minutos
            stability = Math.min(1, stability + Math.min(dt / this.constants.STABILITY_MIN_BARS, 0.05));
        } else {
            stability = 0.1;
        }

        const prevRegime = this.state.currentRegime;
        this.state = {
            currentRegime: regime,
            probabilities: probs,
            coherence,
            stability,
            lastChangeTs: prevRegime === regime ? this.state.lastChangeTs : now,
            lastSymbol: symbol || this.state.lastSymbol,
            lastTimeframe: timeframe || this.state.lastTimeframe,
            transitions: prevRegime && prevRegime !== regime ? (this.state.transitions + 1) : (this.state.transitions || 0)
        };

        if (prevRegime !== regime) {
            this.emit('regime:changed', { from: prevRegime, to: regime, probabilities: probs, coherence, stability, timestamp: now });
        } else {
            this.emit('regime:updated', { regime, probabilities: probs, coherence, stability, timestamp: now });
        }

        return this.getStatus();
    }

    getStatus() {
        return {
            isInitialized: !!this.isInitialized,
            current: this.state.currentRegime,
            probabilities: this.state.probabilities,
            coherence: this.state.coherence,
            stability: this.state.stability,
            lastChangeTs: this.state.lastChangeTs,
            lastSymbol: this.state.lastSymbol,
            lastTimeframe: this.state.lastTimeframe,
            transitions: this.state.transitions || 0,
            regimeParameters: this.#regimeParameters()
        };
    }

    // ========================= Indicadores y energías =====================
    #ema(series, period) {
        if (!series || series.length === 0) return 0;
        if (series.length < period) return series[series.length - 1];
        const k = 2 / (period + 1);
        let ema = series[0];
        for (let i = 1; i < series.length; i++) ema = series[i] * k + ema * (1 - k);
        return ema;
    }

    #atrApprox(series) {
        if (series.length < 2) return 0;
        const changes = [];
        for (let i = 1; i < series.length; i++) changes.push(Math.abs(series[i] - series[i - 1]));
        const mean = changes.reduce((a, b) => a + b, 0) / changes.length;
        return mean / Math.max(1e-8, series[series.length - 1]);
    }

    #bollingerBandwidth(series, period = 20) {
        const N = series.length;
        if (N < period) return 0.5;
        const window = series.slice(-period);
        const mean = window.reduce((a, b) => a + b, 0) / period;
        const variance = window.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / period;
        const std = Math.sqrt(variance);
        const upper = mean + 2 * std;
        const lower = mean - 2 * std;
        const width = (upper - lower) / Math.max(1e-8, mean);
        return Math.max(0, Math.min(2, width));
    }

    #momentum(series) {
        if (series.length < 2) return 0;
        const a = series[0];
        const b = series[series.length - 1];
        return (b - a) / Math.max(1e-8, a);
    }

    #rangeOverAtr(series, atr) {
        const maxP = Math.max(...series);
        const minP = Math.min(...series);
        const range = (maxP - minP) / Math.max(1e-8, series[series.length - 1]);
        const val = range / Math.max(1e-8, atr);
        return Math.max(0, Math.min(5, val));
    }

    #zscoreReturns(series) {
        if (series.length < 10) return 0;
        const rets = [];
        for (let i = 1; i < series.length; i++) rets.push((series[i] - series[i - 1]) / Math.max(1e-8, series[i - 1]));
        const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
        const variance = rets.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / rets.length;
        const std = Math.sqrt(Math.max(1e-12, variance));
        const last = rets[rets.length - 1];
        return Math.abs((last - mean) / std);
    }

    #energyBull(ema20, ema50, momentum, bw) {
        const trend = Math.max(0, (ema20 - ema50) / Math.max(1e-8, ema50));
        const mom = Math.max(0, momentum);
        const bwScore = 1 - Math.min(1, Math.max(0, (bw - this.constants.BW_VERY_LOW) / (this.constants.BW_LOW - this.constants.BW_VERY_LOW)));
        return (trend * (1 / this.constants.PHI)) + (mom * (1 / Math.pow(this.constants.PHI, 2))) + (bwScore * (1 / Math.pow(this.constants.PHI, 3)));
    }

    #energyBear(ema20, ema50, momentum, bw) {
        const trend = Math.max(0, (ema50 - ema20) / Math.max(1e-8, ema50));
        const mom = Math.max(0, -momentum);
        const bwScore = 1 - Math.min(1, Math.max(0, (bw - this.constants.BW_VERY_LOW) / (this.constants.BW_LOW - this.constants.BW_VERY_LOW)));
        return (trend * (1 / this.constants.PHI)) + (mom * (1 / Math.pow(this.constants.PHI, 2))) + (bwScore * (1 / Math.pow(this.constants.PHI, 3)));
    }

    #energySideways(rangeAtr, bw, momentum) {
        const rangeOk = 1 - Math.abs((rangeAtr - (1 / this.constants.PHI)) / (1 / this.constants.PHI));
        const bwOk = 1 - Math.min(1, Math.max(0, (bw - this.constants.BW_VERY_LOW) / (this.constants.BW_LOW - this.constants.BW_VERY_LOW)));
        const momLow = 1 - Math.min(1, Math.abs(momentum) / this.constants.MOMENTUM_TREND);
        return Math.max(0, (rangeOk + bwOk + momLow) / 3);
    }

    #energyChaos(zSpike, atr, bw) {
        const spike = Math.min(1, zSpike / this.constants.VOL_SPIKE_Z);
        const atrHigh = Math.min(1, atr / (this.constants.BW_LOW / 10 + 1e-3));
        const bwWide = Math.min(1, Math.max(0, (bw - this.constants.BW_LOW) / (2 - this.constants.BW_LOW)));
        return Math.max(0, (spike * (1 / this.constants.PHI)) + (atrHigh * 0.3) + (bwWide * 0.3));
    }

    #energyStable(bw, atr, momentum) {
        const bwLow = 1 - Math.min(1, Math.max(0, (bw - this.constants.BW_VERY_LOW) / (this.constants.BW_LOW - this.constants.BW_VERY_LOW)));
        const atrLow = 1 - Math.min(1, atr / (this.constants.BW_LOW / 10 + 1e-3));
        const momLow = 1 - Math.min(1, Math.abs(momentum) / (this.constants.MOMENTUM_TREND * 2));
        return Math.max(0, (bwLow + atrLow + momLow) / 3);
    }

    #energyMeanRevert(rangeAtr, momentum, bw) {
        const rangeTight = 1 - Math.min(1, Math.abs(rangeAtr - (1 / Math.pow(this.constants.PHI, 2))))
        const momRevert = 1 - Math.min(1, Math.abs(momentum) / this.constants.MOMENTUM_TREND);
        const bwMid = 1 - Math.abs((bw - this.constants.BW_LOW) / this.constants.BW_LOW);
        return Math.max(0, (rangeTight + momRevert + bwMid) / 3);
    }

    #softmax(energies) {
        const keys = Object.keys(energies);
        const temp = 1 / this.constants.PHI; // Suaviza
        const exps = keys.map(k => Math.exp(energies[k] / temp));
        const sum = exps.reduce((a, b) => a + b, 0) || 1;
        const probs = {};
        keys.forEach((k, i) => probs[k] = exps[i] / sum);
        return probs;
    }

    #selectRegime(probs) {
        let best = null, pmax = -1;
        Object.entries(probs).forEach(([k, v]) => { if (v > pmax) { pmax = v; best = k; } });
        // Coherencia: concentración de probabilidad penalizada por caos (Feynman ~137)
        const entropy = -Object.values(probs).reduce((s, p) => s + (p > 0 ? p * Math.log(p) : 0), 0);
        const maxEntropy = Math.log(Object.keys(probs).length);
        const coherence = Math.max(0, 1 - (entropy / Math.max(1e-8, maxEntropy)));
        return { regime: best, coherence };
    }

    #regimeParameters() {
        const r = this.state.currentRegime;
        if (!r) return null;
        // Parámetros tácticos derivados de constantes del sistema
        switch (r) {
            case MARKET_REGIMES.BULL_TRENDING:
                return { slMultiplier: 0.618, tpMultipliers: [0.618, 1.0, 1.618], orderType: 'MARKET_OR_STOP', leverageCap: 20 };
            case MARKET_REGIMES.BEAR_TRENDING:
                return { slMultiplier: 0.618, tpMultipliers: [0.618, 1.0, 1.618], orderType: 'MARKET_OR_STOP', leverageCap: 20 };
            case MARKET_REGIMES.SIDEWAYS_RANGE:
                return { slMultiplier: 0.382, tpMultipliers: [0.382, 0.618], orderType: 'LIMIT_MAKER', leverageCap: 7 };
            case MARKET_REGIMES.MEAN_REVERTING:
                return { slMultiplier: 0.5, tpMultipliers: [0.5, 0.888], orderType: 'LIMIT', leverageCap: 5 };
            case MARKET_REGIMES.HIGH_VOLATILITY_CHAOS:
                return { slMultiplier: 1.0, tpMultipliers: [0.618, 1.0, 1.618], orderType: 'MARKET_WITH_GUARD', leverageCap: 5 };
            case MARKET_REGIMES.LOW_VOLATILITY_STABLE:
                return { slMultiplier: 0.5, tpMultipliers: [0.618, 1.0], orderType: 'STOP_LIMIT_PRE_BREAKOUT', leverageCap: 8 };
            default:
                return { slMultiplier: 0.618, tpMultipliers: [0.618], orderType: 'MARKET', leverageCap: 10 };
        }
    }
}

module.exports = { QuantumMarketRegimeDetector, MARKET_REGIMES };


