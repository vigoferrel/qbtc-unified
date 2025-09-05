/**
 * QBTC UNIFIED - Futures Quantum Edge Engine with Z-Plane Utility Maximization
 * Futures-only microstructure synthesis + quantum path-integral edge + Z-Plane optimization
 * NOTE: Data provider expected to be BinanceConnector-like with getCandles()
 */

const {
  QUANTUM,
  TRADING,
  FUNDS,
} = require('../shared/constants/QBTCConstants.js');

const Metrics = require('./QBTCMetricsEngine.js'); // singleton metrics engine

class FuturesQuantumEdgeEngine {
  constructor(connector) {
    this.connector = connector; // expect methods: getCandles(symbol, interval, limit)
    this.minEdge = TRADING.CONFIG.MIN_EDGE || 0.0025;

    // weights for edge synthesis (tune via validation)
    this.weights = {
      imbalance: 0.18,
      ofi: 0.14,
      cvd: 0.12,
      oiDelta: 0.12,
      funding: 0.08,
      basis: 0.08,
      markStress: -0.06, // stress reduces edge when extreme
      kyle: -0.06,       // high lambda = high impact cost
      liqDensity: -0.06, // high liquidation concentration increases risk
      spread: -0.05,
      spreadVel: -0.03,
    };

    // Z-PLANE CONFIGURATION
    this.Z_PLANE = {
      // Function coefficients: U(x,y,z) = α*y - β*x + γ*z^φ
      ALPHA_RETURN: 1.0,        // Peso del retorno (Y)
      BETA_RISK: 0.5,          // Peso del riesgo (X)
      GAMMA_UTILITY: 2.0,      // Peso de la utilidad Z
      PHI_FRACTAL: 1.618,      // Exponente fractal (número áureo)
      
      // Z-Plane constants
      Z_UTILITY_WEIGHT: 2.5,   // Peso de la dimensión Z
      MAX_LEVERAGE: 125.0,     // Leverage máximo para Z-optimización
      Z_PLANE_CONSTANT: Math.PI * 1.618033988749895, // ≈ 5.083
      
      // Z-Plane thresholds
      MIN_Z_UTILITY: 0.01,     // Utilidad mínima en dimensión Z
      MAX_DIMENSIONAL_DEVIATION: 2.0, // Máxima desviación entre dimensiones
      COHERENCE_THRESHOLD: 0.01, // Coherencia mínima entre X,Y,Z
      
      // Quantum Z-enhanced metrics
      COLIBRI_BASE: 0.75,      // Base coherencia del colibrí
      HALCON_SURVIVAL_FACTOR: 0.88, // Factor de supervivencia del halcón
      LOG_7919_CONSTANT: Math.log(7919), // Constante logarítmica
    };
  }

  // Main: build per-symbol microstructure snapshot and record metrics
  async buildEdgeSnapshot(symbol) {
    const ts = Date.now();

    // Pull 1m klines for microstructure proxies (only REST available here)
    const klines = await this._safe(() => this.connector.getCandles(symbol, '1m', 200), []);
    if (!klines || klines.length < 30) {
      return null;
    }

    // Series
    const closes = klines.map(k => parseFloat(k.close || k.c || k[4]));
    const opens  = klines.map(k => parseFloat(k.open  || k.o || k[1]));
    const highs  = klines.map(k => parseFloat(k.high  || k.h || k[2]));
    const lows   = klines.map(k => parseFloat(k.low   || k.l || k[3]));
    const vols   = klines.map(k => parseFloat(k.volume || k.v || k[5] || 0));

    // Proxies and metrics
    const { ofi, cvd } = this._computeOFIandCVD(closes, vols);
    const { top, top5, top20 } = this._computeLOBImbalanceProxies(opens, highs, lows, closes);
    const { fundingRate, fundingCurvature } = this._computeFundingProxies(closes); // placeholder proxies
    const { oi, oiDelta } = this._computeOpenInterestProxies(vols); // volume-based proxy
    const { basis, markStress } = this._computeBasisMarkStressProxies(closes, highs, lows);
    const liquidationDensity = this._computeLiquidationDensityProxy(opens, highs, lows, closes);
    const { spread, spreadVelocity } = this._computeSpreadProxies(highs, lows);
    const kyleLambda = this._computeKyleLambdaProxy(closes, vols);

    // Build micro-state for action integral
    const microPath = this._buildMicroPath(closes, vols);
    const actionIntegral = QUANTUM.FEYNMAN.PATH_INTEGRALS.ACTION_INTEGRAL(microPath);

    // Synthesize final edge score with normalized components
    const edgeScore = this._synthesizeEdgeScore({
      top, top5, top20, ofi, cvd, oiDelta, fundingRate, fundingCurvature, basis,
      markStress, kyleLambda, liquidationDensity, spread, spreadVelocity,
    });

    const edgeEntropy = this._computeEntropy([
      top, top5, top20, ofi, cvd, oiDelta, fundingRate, fundingCurvature, basis,
      markStress, kyleLambda, liquidationDensity, spread, spreadVelocity,
    ]);

    // Z-PLANE: Calculate coordinates and enhanced metrics
    const baseSnapshot = {
      symbol,
      ts,
      // futures metrics (proxies until true futures endpoints wired)
      fundingRate,
      fundingCurvature,
      oi,
      oiDelta,
      basis,
      markStress,
      liquidationDensity,
      lobImbalanceTop: top,
      lobImbalanceTop5: top5,
      lobImbalanceTop20: top20,
      ofi,
      cvd,
      adlPressure: this._adlPressureProxy(markStress, liquidationDensity),
      kyleLambda,
      spread,
      spreadVelocity,
      edgeScore,
      edgeEntropy,
      actionIntegral,
    };

    // Z-PLANE OPTIMIZATION: Add Z-Plane data to snapshot
    const zCoordinates = this._calculateZPlaneCoordinates(baseSnapshot);
    const zMetrics = this._calculateZEnhancedMetrics(baseSnapshot, zCoordinates);
    const zTrading = this._calculateZOptimizedTrading(baseSnapshot, zCoordinates, zMetrics);

    const snapshot = {
      ...baseSnapshot,
      // Z-Plane coordinates and utility
      z_plane: {
        coordinates: zCoordinates,
        metrics: zMetrics,
        trading: zTrading,
        utility_function: `U(x,y,z) = ${this.Z_PLANE.ALPHA_RETURN}*y - ${this.Z_PLANE.BETA_RISK}*x + ${this.Z_PLANE.GAMMA_UTILITY}*z^${this.Z_PLANE.PHI_FRACTAL}`,
        z_plane_efficiency: zMetrics.z_plane_efficiency,
        dimensional_coherence: zMetrics.dimensional_coherence
      }
    };

    // Record metrics
    Metrics.recordEdgeSnapshot(snapshot);

    return snapshot;
  }

  // Z-PLANE OPTIMIZATION: Calculate Z-Plane coordinates and utility
  _calculateZPlaneCoordinates(snapshot) {
    const s = snapshot;
    
    // COORDENADA X (RIESGO)
    const baseRisk = 0.02; // 2% riesgo base
    const leverageRiskMultiplier = Math.log(this.Z_PLANE.MAX_LEVERAGE) / 10;
    const marketVolatility = this._clip(s.spreadVelocity * 10, 0, 0.5);
    
    const xRisk = baseRisk * (1 + leverageRiskMultiplier + marketVolatility);
    const x_risk = this._clip(xRisk, 0.001, 0.15); // Máximo 15% riesgo
    
    // COORDENADA Y (RETORNO)
    const baseReturn = Math.abs(s.edgeScore) * 0.05; // Convertir edgeScore a retorno esperado
    const leverageAmplification = Math.sqrt(this.Z_PLANE.MAX_LEVERAGE / 10);
    const gravitationalBoost = Math.abs(s.actionIntegral) / 10;
    
    const yReturn = baseReturn * leverageAmplification * (1 + gravitationalBoost);
    const y_return = this._clip(yReturn, 0.005, 0.60); // Entre 0.5% y 60%
    
    // COORDENADA Z (UTILIDAD CUÁNTICA FRACTAL)
    // Componente de coherencia cuántica
    const edgePs = Math.abs(s.edgeScore) * 1000;
    const quantumCoherence = (edgePs / 1000) * Math.sin(edgePs * Math.PI / 180);
    const quantum_coherence = this._clip(Math.abs(quantumCoherence), 0.1, 1.0);
    
    // Componente de tiempo fractal
    const fractalTimeFactor = edgePs * this.Z_PLANE.LOG_7919_CONSTANT / 100;
    const fractalComponent = Math.tanh(fractalTimeFactor / 10); // Normalizar con tanh
    
    // Componente de entrelazamiento (basado en correlaciones)
    const entanglementFactor = Math.cos(Math.abs(s.actionIntegral) * Math.PI / 180);
    const entanglementComponent = Math.abs(entanglementFactor) * 1.618 / 10;
    
    // Z total como combinación weighted
    let z_utility = (
      quantum_coherence * 0.4 +
      fractalComponent * 0.35 +
      entanglementComponent * 0.25
    );
    
    // Aplicar constante del plano Z
    z_utility *= this.Z_PLANE.Z_PLANE_CONSTANT / 5; // Normalizar
    z_utility = this._clip(z_utility, 0.1, 3.0); // Entre 0.1 y 3.0
    
    // Función de utilidad total: U(x,y,z) = α*y - β*x + γ*z^φ
    const totalUtility = (
      this.Z_PLANE.ALPHA_RETURN * y_return -
      this.Z_PLANE.BETA_RISK * x_risk +
      this.Z_PLANE.GAMMA_UTILITY * Math.pow(z_utility, this.Z_PLANE.PHI_FRACTAL)
    );
    
    return {
      x_risk,
      y_return,
      z_utility,
      total_utility: totalUtility
    };
  }

  // Z-PLANE: Calculate quantum Z-enhanced metrics
  _calculateZEnhancedMetrics(snapshot, zCoordinates) {
    const s = snapshot;
    const z_utility = zCoordinates.z_utility;
    
    // Coherencia del colibrí amplificada por Z
    const z_coherence_boost = z_utility / 2.0 * 0.15;
    const colibri_z_coherence = this._clip(
      this.Z_PLANE.COLIBRI_BASE + z_coherence_boost,
      0.1,
      0.99
    );
    
    // Supervivencia del halcón en dimensión Z
    const halcon_z_survival = this._clip(
      colibri_z_coherence * this.Z_PLANE.HALCON_SURVIVAL_FACTOR * (1 + z_utility * 0.05),
      0.1,
      0.95
    );
    
    // Tiempo fractal extendido por Z
    const edgePs = Math.abs(s.edgeScore) * 1000;
    const base_fractal_time = edgePs * this.Z_PLANE.LOG_7919_CONSTANT / 20;
    const fractal_z_time_extension = base_fractal_time * (1 + z_utility * 0.3);
    
    // Entrelazamiento cuántico en Z
    const quantum_z_entanglement = Math.sin(z_utility * Math.PI / 4) * colibri_z_coherence;
    
    // Coherencia fractal amplificada por Z
    const dimensional_coherence = this._calculateDimensionalCoherence(
      zCoordinates.x_risk,
      zCoordinates.y_return,
      zCoordinates.z_utility
    );
    
    // Eficiencia en el plano Z
    const z_plane_efficiency = z_utility / Math.max(zCoordinates.x_risk, 0.001);
    
    return {
      colibri_z_coherence,
      halcon_z_survival,
      fractal_z_time_extension,
      quantum_z_entanglement,
      dimensional_coherence,
      z_plane_efficiency
    };
  }

  // Z-PLANE: Calculate dimensional coherence between X, Y, Z
  _calculateDimensionalCoherence(x, y, z) {
    try {
      // Calcular desviaciones relativas
      const mean_val = (x + y + z) / 3;
      if (mean_val === 0) return 0.1;
        
      const deviations = [
        Math.abs(x - mean_val) / mean_val,
        Math.abs(y - mean_val) / mean_val,
        Math.abs(z - mean_val) / mean_val
      ];
      const max_deviation = Math.max(...deviations);
      
      // Coherencia = 1 - desviación máxima normalizada
      const coherence = 1 - Math.min(max_deviation / this.Z_PLANE.MAX_DIMENSIONAL_DEVIATION, 1);
      return this._clip(coherence, 0.01, 1.0);
    } catch {
      return 0.1; // En caso de error, valor mínimo
    }
  }

  // Z-PLANE: Calculate Z-optimized trading parameters
  _calculateZOptimizedTrading(snapshot, zCoordinates, zMetrics) {
    const s = snapshot;
    const z_utility = zCoordinates.z_utility;
    
    // Posición amplificada por utilidad Z
    const baseLeverage = this.Z_PLANE.MAX_LEVERAGE;
    const z_enhancement_factor = 1 + (z_utility - 1) * 0.1; // Factor de mejora basado en Z
    const z_optimized_leverage = this._clip(baseLeverage * z_enhancement_factor, 1, 125);
    
    // Profit amplificado por dimensión Z
    const base_profit = zCoordinates.y_return;
    const z_profit_multiplier = 1 + Math.pow(z_utility, 0.5) * 0.2; // Amplificación fractal
    const z_enhanced_profit = base_profit * z_profit_multiplier;
    
    // Estrategia Z-optimizada
    let z_execution_strategy;
    if (z_utility > 1.5 && zCoordinates.y_return > 0.03) {
      z_execution_strategy = "Z_PLANE_ULTRA_AGGRESSIVE_125X";
    } else if (z_utility > 1.0 && zCoordinates.y_return > 0.02) {
      z_execution_strategy = "Z_PLANE_AGGRESSIVE_125X";
    } else if (z_utility > 0.75) {
      z_execution_strategy = "Z_PLANE_MODERATE_125X";
    } else {
      z_execution_strategy = "Z_PLANE_CONSERVATIVE_125X";
    }
    
    // Horizonte temporal óptimo
    const base_horizon = Math.max(zMetrics.fractal_z_time_extension * 60, 15); // Mínimo 15 min
    const z_time_horizon_optimal = Math.floor(base_horizon * (1 + z_utility * 0.1));
    
    return {
      z_optimized_leverage,
      z_enhanced_profit,
      z_execution_strategy,
      z_time_horizon_optimal
    };
  }

  // Strategy decision based purely on futures microstructure metrics with Z-Plane optimization
  // Returns { type: 'BUY'|'SELL', confidence: 0..1, reason, positionSizeFactor, z_plane_data }
  getSignal(snapshot) {
    if (!snapshot) return null;
    const s = snapshot;

    if (Math.abs(s.edgeScore) < this.minEdge) return null;

    // Long bias: positive micro imbalance, positive flow and OI expansion, moderate stress
    const longBias =
      s.lobImbalanceTop > 0 &&
      s.ofi > 0 &&
      s.cvd > 0 &&
      s.oiDelta > 0 &&
      s.markStress < 0.02 &&
      s.kyleLambda < 1.0;

    // Short bias: inverse conditions
    const shortBias =
      s.lobImbalanceTop < 0 &&
      s.ofi < 0 &&
      s.cvd < 0 &&
      s.oiDelta < 0 &&
      s.markStress < 0.02 &&
      s.kyleLambda < 1.0;

    if (!longBias && !shortBias) return null;

    // Z-PLANE OPTIMIZATION: Calculate coordinates and metrics
    const zCoordinates = this._calculateZPlaneCoordinates(s);
    const zMetrics = this._calculateZEnhancedMetrics(s, zCoordinates);
    const zTrading = this._calculateZOptimizedTrading(s, zCoordinates, zMetrics);

    // Z-Enhanced confidence calculation
    const baseConf = this._clip(Math.abs(s.edgeScore) * 1.5, 0, 1);
    const entropyDamp = this._clip(1 - s.edgeEntropy, 0, 1);
    const actionBoost = this._clip(Math.tanh(Math.abs(s.actionIntegral)), 0, 1);
    
    // Z-Plane confidence boost
    const zConfidenceBoost = zMetrics.colibri_z_coherence * zMetrics.dimensional_coherence;
    const zEnhancedConfidence = this._clip(
      0.4 * baseConf +
      0.25 * entropyDamp +
      0.15 * actionBoost +
      0.2 * zConfidenceBoost,
      0, 1
    );

    const type = longBias ? 'BUY' : 'SELL';

    // Z-Enhanced position size factor
    const riskPenalty = this._clip(
      0.2 * this._normPos(s.markStress, 0.01, 0.05) +
      0.2 * this._normPos(s.liquidationDensity, 3, 25) +
      0.2 * this._normPos(s.kyleLambda, 0.2, 2.0) +
      0.4 * (1 - zMetrics.dimensional_coherence), // Penalizar por baja coherencia dimensional
      0, 0.85
    );
    
    // Z-Plane position size enhancement
    const zPositionEnhancement = zCoordinates.z_utility > 1.0 ? 0.1 : 0;
    const positionSizeFactor = this._clip(1 - riskPenalty + zPositionEnhancement, 0.15, 1);

    // Z-Plane enhanced reason
    const baseReason = this._reasonFromSnapshot(type, s);
    const zReason = `Z:${zCoordinates.z_utility.toFixed(2)}|U:${zCoordinates.total_utility.toFixed(2)}|${zTrading.z_execution_strategy}`;
    const enhancedReason = `${baseReason} ${zReason}`;

    return {
      type,
      confidence: zEnhancedConfidence,
      reason: enhancedReason,
      positionSizeFactor,
      z_plane_data: {
        coordinates: zCoordinates,
        metrics: zMetrics,
        trading: zTrading,
        utility_function: `U(x,y,z) = ${this.Z_PLANE.ALPHA_RETURN}*y - ${this.Z_PLANE.BETA_RISK}*x + ${this.Z_PLANE.GAMMA_UTILITY}*z^${this.Z_PLANE.PHI_FRACTAL}`,
        z_plane_efficiency: zMetrics.z_plane_efficiency,
        dimensional_coherence: zMetrics.dimensional_coherence
      }
    };
  }

  // --------- Microstructure helpers (proxies without raw L2/futures endpoints) ---------

  _computeOFIandCVD(closes, vols) {
    let cvd = 0;
    let ofi = 0;
    for (let i = 1; i < closes.length; i++) {
      const ret = closes[i] - closes[i - 1];
      const sign = ret === 0 ? 0 : (ret > 0 ? 1 : -1);
      const v = vols[i] || 0;
      cvd += sign * v;
    }
    // OFI recent window
    const W = 5;
    for (let i = Math.max(1, closes.length - W); i < closes.length; i++) {
      const ret = closes[i] - closes[i - 1];
      const sign = ret === 0 ? 0 : (ret > 0 ? 1 : -1);
      const v = vols[i] || 0;
      ofi += sign * v;
    }
    // Normalize proxies
    const volSum = vols.slice(-20).reduce((a, b) => a + (b || 0), 0) || 1;
    return {
      ofi: ofi / volSum,
      cvd: cvd / (vols.reduce((a, b) => a + (b || 0), 0) || 1),
    };
  }

  _computeLOBImbalanceProxies(opens, highs, lows, closes) {
    // Proxy: position of close within candle range as imbalance estimator
    const n = closes.length;
    const pos = this._closePosition(highs[n - 1], lows[n - 1], closes[n - 1]);
    const pos5 = this._avgPosition(highs.slice(-5), lows.slice(-5), closes.slice(-5));
    const pos20 = this._avgPosition(highs.slice(-20), lows.slice(-20), closes.slice(-20));
    // Map [0..1] to [-1..1]
    return {
      top: 2 * (pos - 0.5),
      top5: 2 * (pos5 - 0.5),
      top20: 2 * (pos20 - 0.5),
    };
  }

  _computeFundingProxies(closes) {
    // Placeholder proxies (until wired to real futures endpoints):
    // fundingRate approx: mean reversion pressure via curvature of short SMA vs long SMA
    const smaFast = this._smaArray(closes, 8);
    const smaSlow = this._smaArray(closes, 48);
    const fundingRate = this._clip((smaFast[smaFast.length - 1] - smaSlow[smaSlow.length - 1]) / (smaSlow[smaSlow.length - 1] || 1), -0.02, 0.02);
    // curvature: 2nd derivative of SMA
    const curv = this._secondDerivative(smaFast.slice(-6));
    const fundingCurvature = this._clip(curv, -0.005, 0.005);
    return { fundingRate, fundingCurvature };
  }

  _computeOpenInterestProxies(vols) {
    // Proxy OI: EMA of volume; ΔOI: last diff
    const ema = this._ema(vols, 0.2);
    const oi = ema[ema.length - 1] || 0;
    const oiDelta = (ema[ema.length - 1] || 0) - (ema[ema.length - 2] || 0);
    return { oi, oiDelta };
  }

  _computeBasisMarkStressProxies(closes, highs, lows) {
    const sma = this._sma(closes, 20);
    const last = closes[closes.length - 1] || 1;
    const basis = (last - sma) / last;
    // mark-index stress proxy: intrabar range ratio
    const range = (highs[highs.length - 1] - lows[lows.length - 1]) || 0;
    const markStress = Math.abs(range / last);
    return { basis, markStress };
  }

  _computeLiquidationDensityProxy(opens, highs, lows, closes) {
    // Proxy: large wick components relative to close over a short window
    const W = 10;
    const start = Math.max(0, opens.length - W);
    let density = 0;
    for (let i = start; i < opens.length; i++) {
      const upWick = Math.max(0, highs[i] - Math.max(opens[i], closes[i]));
      const downWick = Math.max(0, Math.min(opens[i], closes[i]) - lows[i]);
      const denom = Math.max(1e-9, closes[i]);
      density += (upWick + downWick) / denom;
    }
    return density / (W || 1);
  }

  _computeSpreadProxies(highs, lows) {
    const lastSpread = (highs[highs.length - 1] - lows[lows.length - 1]) || 0;
    const prevSpread = (highs[highs.length - 2] - lows[lows.length - 2]) || 0;
    const spread = lastSpread;
    const spreadVelocity = (lastSpread - prevSpread) / (prevSpread || 1);
    return { spread, spreadVelocity };
  }

  _computeKyleLambdaProxy(closes, vols) {
    const ret = (closes[closes.length - 1] - closes[closes.length - 2]) / (closes[closes.length - 2] || 1);
    const vol = vols[vols.length - 1] || 1;
    const lambda = Math.abs(ret) / Math.max(1e-9, vol);
    return this._clip(lambda, 0, 10);
  }

  _adlPressureProxy(markStress, liqDensity) {
    // Simple proxy: combined stress scaled
    return this._clip(0.5 * this._normPos(markStress, 0.005, 0.03) + 0.5 * this._normPos(liqDensity, 3, 25), 0, 1);
  }

  _buildMicroPath(closes, vols) {
    const n = closes.length;
    const p0 = closes[n - 3], p1 = closes[n - 2], p2 = closes[n - 1];
    const v0 = vols[n - 3] || 0.0001, v1 = vols[n - 2] || 0.0001, v2 = vols[n - 1] || 0.0001;
    // Encode price as "price", volatility proxy as sqrt(volume)
    return [
      { time: 0, price: p0, volatility: Math.sqrt(v0) },
      { time: 1, price: p1, volatility: Math.sqrt(v1) },
      { time: 2, price: p2, volatility: Math.sqrt(v2) },
    ];
  }

  _synthesizeEdgeScore(m) {
    // Z-score normalize key metrics over heuristic scales
    const z = {
      imb: this._z(m.top, 0, 0.5) +
           0.6 * this._z(m.top5, 0, 0.4) +
           0.4 * this._z(m.top20, 0, 0.3),
      ofi: this._z(m.ofi, 0, 0.03),
      cvd: this._z(m.cvd, 0, 0.02),
      oiDelta: this._z(m.oiDelta, 0, 5),
      funding: this._z(m.fundingRate, 0, 0.004) + 0.5 * this._z(m.fundingCurvature, 0, 0.0015),
      basis: this._z(m.basis, 0, 0.01),
      markStress: this._z(m.markStress, 0.01, 0.02),
      kyle: this._z(m.kyleLambda, 0.4, 0.5),
      liqDensity: this._z(m.liquidationDensity, 10, 7),
      spread: this._z(m.spread, 0.5, 0.4), // scale arbitrary in price units
      spreadVel: this._z(m.spreadVelocity, 0, 0.3),
    };

    const score =
      this.weights.imb * z.imb +
      this.weights.ofi * z.ofi +
      this.weights.cvd * z.cvd +
      this.weights.oiDelta * z.oiDelta +
      this.weights.funding * z.funding +
      this.weights.basis * z.basis +
      this.weights.markStress * z.markStress +
      this.weights.kyle * z.kyle +
      this.weights.liqDensity * z.liqDensity +
      this.weights.spread * z.spread +
      this.weights.spreadVel * z.spreadVel;

    // clamp to sensible range
    return this._clip(score, -1.5, 1.5);
  }

  _computeEntropy(values) {
    // Normalize values into bins and compute simple entropy
    const bins = new Array(7).fill(0);
    const clamp = (x) => this._clip((x + 1) / 2, 0, 1);
    for (const v of values) {
      const c = clamp(this._tanh(v));
      const idx = Math.min(6, Math.max(0, Math.floor(c * 7)));
      bins[idx] += 1;
    }
    const total = values.length || 1;
    let H = 0;
    for (const b of bins) {
      if (b === 0) continue;
      const p = b / total;
      H -= p * Math.log(p + 1e-12);
    }
    // Normalize entropy to 0..1
    return this._clip(H / Math.log(7), 0, 1);
  }

  _reasonFromSnapshot(type, s) {
    const dir = type === 'BUY' ? '↑' : '↓';
    const parts = [];
    parts.push(`IB:${s.lobImbalanceTop.toFixed(3)}${dir}`);
    parts.push(`OFI:${s.ofi.toFixed(3)}`);
    parts.push(`CVD:${s.cvd.toFixed(3)}`);
    parts.push(`ΔOI:${s.oiDelta.toFixed(2)}`);
    parts.push(`Stress:${s.markStress.toFixed(3)}`);
    parts.push(`λ:${s.kyleLambda.toFixed(3)}`);
    parts.push(`EDGE:${s.edgeScore.toFixed(3)}`);
    return parts.join(' ');
  }

  // --------- Math helpers ---------
  _sma(arr, n) {
    if (!arr || arr.length < 1) return 0;
    const L = Math.min(n, arr.length);
    const sum = arr.slice(-L).reduce((a, b) => a + (b || 0), 0);
    return sum / L;
  }

  _smaArray(arr, n) {
    if (!arr || arr.length < 1) return [];
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      const start = Math.max(0, i - n + 1);
      const window = arr.slice(start, i + 1);
      const sum = window.reduce((a, b) => a + (b || 0), 0);
      result.push(sum / window.length);
    }
    return result;
  }

  _ema(arr, alpha = 0.2) {
    const out = [];
    let prev = arr[0] || 0;
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i] || 0;
      const e = alpha * v + (1 - alpha) * prev;
      out.push(e);
      prev = e;
    }
    return out;
  }

  _secondDerivative(arr) {
    if (!arr || arr.length < 3) return 0;
    const n = arr.length;
    return (arr[n - 1] - 2 * arr[n - 2] + arr[n - 3]);
    // Not scaled by dt for simplicity; acts as curvature proxy
  }

  _closePosition(h, l, c) {
    const range = Math.max(1e-12, h - l);
    return this._clip((c - l) / range, 0, 1);
  }

  _avgPosition(hs, ls, cs) {
    const L = cs.length;
    if (L === 0) return 0.5;
    let s = 0;
    for (let i = 0; i < L; i++) {
      const h = hs[i], l = ls[i], c = cs[i];
      s += this._closePosition(h, l, c);
    }
    return s / L;
  }

  _z(x, mu, sigma) {
    const s = sigma || 1;
    if (s <= 0) return 0;
    return (x - mu) / s;
  }

  _normPos(x, low, high) {
    // normalize x in [low, high] to [0,1], clamp
    if (high <= low) return 0;
    return this._clip((x - low) / (high - low), 0, 1);
  }

  _tanh(x) {
    return Math.tanh(x);
  }

  _clip(x, a, b) {
    return Math.max(a, Math.min(b, x));
  }

  async _safe(fn, fallback) {
    try {
      return await fn();
    } catch (e) {
      return fallback;
    }
  }

  // Z-PLANE: Execution Policy (postOnly/aggressive/reduce-only) optimization
  getExecutionPolicy(signal, zPlaneData) {
    if (!signal || !zPlaneData) {
      return {
        policy: 'CONSERVATIVE',
        reason: 'Missing signal or Z-Plane data',
        leverage: 1.0,
        priority: 'LOW'
      };
    }

    const { type, confidence, positionSizeFactor } = signal;
    const { coordinates, metrics, trading } = zPlaneData;
    const { z_utility, total_utility } = coordinates;
    const { colibri_z_coherence, halcon_z_survival, dimensional_coherence } = metrics;
    const { z_execution_strategy, z_optimized_leverage } = trading;

    // Base execution policy based on Z-Plane strategy
    let policy = 'MODERATE';
    let priority = 'MEDIUM';
    let postOnlyPreference = 0.5; // 0 = aggressive, 1 = postOnly
    let reduceOnlyPreference = 0.0; // 0 = new position, 1 = reduce only

    // Adjust policy based on Z-Plane utility and coherence
    if (z_utility > 1.5 && total_utility > 2.0 && dimensional_coherence > 0.7) {
      policy = 'AGGRESSIVE';
      priority = 'HIGH';
      postOnlyPreference = 0.1; // Very aggressive
    } else if (z_utility > 1.0 && total_utility > 1.0 && dimensional_coherence > 0.5) {
      policy = 'MODERATE_AGGRESSIVE';
      priority = 'MEDIUM_HIGH';
      postOnlyPreference = 0.3;
    } else if (z_utility < 0.5 || dimensional_coherence < 0.3) {
      policy = 'CONSERVATIVE';
      priority = 'LOW';
      postOnlyPreference = 0.8; // Prefer postOnly for low utility
    }

    // Adjust based on survival metrics
    if (halcon_z_survival < 0.5) {
      policy = 'REDUCE_ONLY';
      priority = 'CRITICAL';
      reduceOnlyPreference = 0.9; // Focus on reducing risk
    }

    // Adjust based on confidence
    if (confidence < 0.4) {
      postOnlyPreference = Math.min(postOnlyPreference + 0.3, 1.0);
      priority = 'LOW';
    } else if (confidence > 0.8) {
      postOnlyPreference = Math.max(postOnlyPreference - 0.2, 0.0);
      priority = priority === 'LOW' ? 'MEDIUM' : priority;
    }

    // Final policy determination
    let finalPolicy = policy;
    if (reduceOnlyPreference > 0.7) {
      finalPolicy = 'REDUCE_ONLY';
    } else if (postOnlyPreference > 0.7) {
      finalPolicy = 'POST_ONLY';
    }

    return {
      policy: finalPolicy,
      base_policy: policy,
      reason: this._generateExecutionPolicyReason(
        z_utility,
        total_utility,
        dimensional_coherence,
        halcon_z_survival,
        confidence
      ),
      leverage: z_optimized_leverage,
      priority,
      preferences: {
        postOnly: postOnlyPreference,
        reduceOnly: reduceOnlyPreference,
        aggressive: 1 - postOnlyPreference,
        new_position: 1 - reduceOnlyPreference
      },
      z_plane_factors: {
        utility: z_utility,
        total_utility: total_utility,
        coherence: dimensional_coherence,
        survival: halcon_z_survival,
        colibri_coherence: colibri_z_coherence
      },
      execution_strategy: z_execution_strategy,
      position_size_factor: positionSizeFactor,
      confidence_boost: confidence * dimensional_coherence
    };
  }

  // Z-PLANE: Generate human-readable reason for execution policy
  _generateExecutionPolicyReason(zUtility, totalUtility, coherence, survival, confidence) {
    const reasons = [];
    
    // Utility-based reasons
    if (zUtility > 1.5) {
      reasons.push('High Z-utility');
    } else if (zUtility < 0.5) {
      reasons.push('Low Z-utility');
    }
    
    if (totalUtility > 2.0) {
      reasons.push('Excellent total utility');
    } else if (totalUtility < 0.5) {
      reasons.push('Poor total utility');
    }
    
    // Coherence-based reasons
    if (coherence > 0.7) {
      reasons.push('High dimensional coherence');
    } else if (coherence < 0.3) {
      reasons.push('Low dimensional coherence');
    }
    
    // Survival-based reasons
    if (survival < 0.5) {
      reasons.push('Low survival probability');
    }
    
    // Confidence-based reasons
    if (confidence > 0.8) {
      reasons.push('High confidence');
    } else if (confidence < 0.4) {
      reasons.push('Low confidence');
    }
    
    return reasons.join(', ') || 'Balanced factors';
  }
}

module.exports = FuturesQuantumEdgeEngine;