/**
 * QBTC UNIFIED - Decision Engine Unificado
 * Motor de decisiones que combina Leonardo Consciousness y componentes Quantum
 */

const EventEmitter = require('events');
const { LEONARDO, QUANTUM, TRADING } = require('../shared/constants/QBTCConstants');
const DeterministicMath = require('../shared/utils/DeterministicMath');
const HashUtils = require('../shared/utils/HashUtils');
const BinanceConnector = require('../shared/connectors/BinanceConnector');
const FuturesEdgeService = require('./FuturesEdgeService');
const MetricsEngine = require('./QBTCMetricsEngine');

class QBTCDecisionEngine extends EventEmitter {
    constructor(config = {}) {
        super();
        
        console.log('🧠 QBTC Decision Engine initializing...');
        
        // Configuración
        this.config = {
            minConfidence: config.minConfidence || TRADING.CONFIG.MIN_CONFIDENCE,
            minEdge: config.minEdge || TRADING.CONFIG.MIN_EDGE,
            maxPositions: config.maxPositions || TRADING.CONFIG.MAX_POSITIONS,
            riskPerTrade: config.riskPerTrade || TRADING.CONFIG.RISK_PER_TRADE,
            debug: config.debug || false
        };

        // Estado del motor
        this.state = {
            isActive: false,
            lastUpdate: null,
            decisions: new Map(),
            signals: new Map(),
            performance: {
                totalDecisions: 0,
                correctDecisions: 0,
                winRate: 0,
                avgConfidence: 0
            }
        };

        // Pilares de Leonardo Consciousness
        this.pillars = {
            lambda888: {
                resonance: LEONARDO.LAMBDA_888.RESONANCE,
                frequency: LEONARDO.LAMBDA_888.FREQUENCY,
                harmonic: LEONARDO.LAMBDA_888.HARMONIC,
                coherence: LEONARDO.LAMBDA_888.COHERENCE_THRESHOLD
            },
            fibonacci: {
                phi: LEONARDO.FIBONACCI.PHI,
                psi: LEONARDO.FIBONACCI.PSI,
                prime: LEONARDO.FIBONACCI.PRIME_7919,
                sequence: LEONARDO.FIBONACCI.SEQUENCE
            },
            hookWheel: {
                segments: LEONARDO.HOOK_WHEEL.SEGMENTS,
                radius: LEONARDO.HOOK_WHEEL.WHEEL_RADIUS,
                strength: LEONARDO.HOOK_WHEEL.HOOK_STRENGTH,
                rotationSpeed: LEONARDO.HOOK_WHEEL.ROTATION_SPEED
            },
            colibriHalcon: {
                hummingbird: LEONARDO.COLIBRI_HALCON.HUMMINGBIRD_RATIO,
                hawk: LEONARDO.COLIBRI_HALCON.HAWK_RATIO,
                symbiosis: LEONARDO.COLIBRI_HALCON.SYMBIOSIS_FACTOR,
                balance: LEONARDO.COLIBRI_HALCON.BALANCE_THRESHOLD
            }
        };

        // Estados cuánticos
        this.quantumStates = {
            consciousness: QUANTUM.STATES.CONSCIOUSNESS,
            coherence: QUANTUM.STATES.COHERENCE,
            entropy: QUANTUM.STATES.ENTROPY,
            energy: QUANTUM.STATES.ENERGY,
            resonance: QUANTUM.STATES.RESONANCE,
            alignment: QUANTUM.STATES.ALIGNMENT,
            synchronization: QUANTUM.STATES.SYNCHRONIZATION
        };

        // Análisis de mercado
        this.marketAnalysis = {
            symbols: new Map(),
            trends: new Map(),
            correlations: new Map(),
            volatility: new Map()
        };

        // Conector Binance (singleton)
        this.binanceConnector = BinanceConnector.getInstance();

        // Futures-only Edge Service (aislado, singleton)
        this.edgeService = FuturesEdgeService.getInstance();

        // Snapshots por símbolo (últimos)
        this.edgeSnapshots = new Map();

        // Inicializar
        this.initialize();
    }

    /**
     * Inicializar motor de decisiones
     */
    async initialize() {
        try {
            console.log('[QBTC DECISION ENGINE] Inicializando componentes...');
            
            // Inicializar conector Binance
            await this.binanceConnector.connect();
            
            // Suscribirse a datos de mercado
            await this.subscribeToMarketData();
            
            // Iniciar ciclo de análisis
            this.startAnalysisCycle();
            
            this.state.isActive = true;
            this.state.lastUpdate = Date.now();
            
            console.log('[QBTC DECISION ENGINE] Motor inicializado correctamente');
            this.emit('initialized');
            
        } catch (error) {
            console.error('[QBTC DECISION ENGINE] Error al inicializar:', error.message);
            throw error;
        }
    }

    /**
     * Suscribirse a datos de mercado
     */
    async subscribeToMarketData() {
        try {
            // Suscribirse a stream de precios para símbolos principales
            const symbols = TRADING.SYMBOLS.MAJOR.slice(0, 3); // Limitar a 3 símbolos para monousuario
            
            await this.binanceConnector.subscribeToPriceStream(symbols, (trades) => {
                this.processMarketData(trades);
            });
            
            console.log(`[QBTC DECISION ENGINE] Suscrito a datos de mercado para: ${symbols.join(', ')}`);
            
        } catch (error) {
            console.error('[QBTC DECISION ENGINE] Error al suscribirse a datos de mercado:', error.message);
        }
    }

    /**
     * Procesar datos de mercado
     * Nota: aislado para evitar duplicación de señales. Solo actualiza análisis;
     * las señales se generan en analyzeMarket() usando FuturesEdgeService.
     */
    processMarketData(trades) {
        try {
            trades.forEach(trade => {
                const symbol = trade.symbol;
                this.updateSymbolAnalysis(symbol, trade);
            });
        } catch (error) {
            console.error('[QBTC DECISION ENGINE] Error al procesar datos de mercado:', error.message);
        }
    }

    /**
     * Actualizar análisis de símbolo
     */
    updateSymbolAnalysis(symbol, trade) {
        try {
            if (!this.marketAnalysis.symbols.has(symbol)) {
                this.marketAnalysis.symbols.set(symbol, {
                    lastPrice: 0,
                    volume: 0,
                    trades: [],
                    volatility: 0,
                    trend: 'neutral'
                });
            }

            const analysis = this.marketAnalysis.symbols.get(symbol);
            
            // Actualizar precio y volumen
            analysis.lastPrice = parseFloat(trade.price);
            analysis.volume += parseFloat(trade.quantity);
            analysis.trades.push({
                price: parseFloat(trade.price),
                quantity: parseFloat(trade.quantity),
                timestamp: trade.timestamp || Date.now()
            });

            // Mantener solo últimas 100 operaciones
            if (analysis.trades.length > 100) {
                analysis.trades = analysis.trades.slice(-100);
            }

            // Calcular volatilidad
            analysis.volatility = this.calculateVolatility(analysis.trades);
            
            // Determinar tendencia
            analysis.trend = this.determineTrend(analysis.trades);
            
        } catch (error) {
            console.error(`[QBTC DECISION ENGINE] Error al actualizar análisis de ${symbol}:`, error.message);
        }
    }

    /**
     * Calcular volatilidad
     */
    calculateVolatility(trades) {
        if (trades.length < 2) return 0;
        
        const prices = trades.map(t => t.price);
        const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
        
        return Math.sqrt(variance) / mean; // Volatilidad normalizada
    }

    /**
     * Determinar tendencia
     */
    determineTrend(trades) {
        if (trades.length < 10) return 'neutral';
        
        const prices = trades.map(t => t.price);
        const firstHalf = prices.slice(0, Math.floor(prices.length / 2));
        const secondHalf = prices.slice(Math.floor(prices.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, price) => sum + price, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, price) => sum + price, 0) / secondHalf.length;
        
        const change = (secondAvg - firstAvg) / firstAvg;
        
        if (change > 0.01) return 'uptrend';
        if (change < -0.01) return 'downtrend';
        return 'neutral';
    }

    /**
     * Generar señal de trading
     */
    generateTradingSignal(symbol, timestamp) {
        try {
            const analysis = this.marketAnalysis.symbols.get(symbol);
            if (!analysis) return null;

            // Calcular estados cuánticos deterministas
            const quantumState = DeterministicMath.generateQuantumState(timestamp);
            
            // Calcular valores de los pilares
            const lambdaValues = DeterministicMath.generateLambda888Values(timestamp);
            const hookValues = DeterministicMath.generateHookWheelValues(timestamp);
            const colibriValues = DeterministicMath.generateColibriHalconValues(timestamp);
            
            // Calcular confianza basada en análisis
            const confidence = this.calculateConfidence(analysis, quantumState, lambdaValues, hookValues, colibriValues);
            
            if (confidence < this.config.minConfidence) {
                return null;
            }
            
            // Calcular edge (ventaja)
            const edge = this.calculateEdge(analysis, quantumState);
            
            if (edge < this.config.minEdge) {
                return null;
            }
            
            // Determinar dirección
            const direction = this.determineDirection(analysis, quantumState);
            
            // Calcular tamaño de posición
            const positionSize = this.calculatePositionSize(symbol, confidence, edge);
            
            // Generar señal
            const signal = {
                symbol: symbol,
                direction: direction,
                confidence: confidence,
                edge: edge,
                positionSize: positionSize,
                price: analysis.lastPrice,
                timestamp: timestamp,
                quantumState: quantumState,
                analysis: {
                    trend: analysis.trend,
                    volatility: analysis.volatility,
                    volume: analysis.volume
                },
                pillars: {
                    lambda888: lambdaValues,
                    hookWheel: hookValues,
                    colibriHalcon: colibriValues
                }
            };

            // Actualizar estadísticas
            this.updatePerformanceStats(signal);
            
            return signal;
            
        } catch (error) {
            console.error(`[QBTC DECISION ENGINE] Error al generar señal para ${symbol}:`, error.message);
            return null;
        }
    }

    /**
     * Calcular confianza
     */
    calculateConfidence(analysis, quantumState, lambdaValues, hookValues, colibriValues) {
        try {
            // Factores de confianza
            const trendConfidence = analysis.trend === 'neutral' ? 0.3 : 0.7;
            const volatilityConfidence = Math.max(0, 1 - analysis.volatility);
            const quantumConfidence = (quantumState.coherence + quantumState.consciousness) / 2;
            const lambdaConfidence = lambdaValues.coherence;
            const hookConfidence = hookValues.harmonicSync;
            const colibriConfidence = colibriValues.balanceThreshold;
            
            // Calcular confianza ponderada
            const confidence = (
                trendConfidence * 0.2 +
                volatilityConfidence * 0.2 +
                quantumConfidence * 0.3 +
                lambdaConfidence * 0.1 +
                hookConfidence * 0.1 +
                colibriConfidence * 0.1
            );
            
            return Math.min(1, Math.max(0, confidence));
            
        } catch (error) {
            console.error('[QBTC DECISION ENGINE] Error al calcular confianza:', error.message);
            return 0;
        }
    }

    /**
     * Calcular edge (ventaja)
     */
    calculateEdge(analysis, quantumState) {
        try {
            // Edge basado en tendencia y volatilidad
            const trendEdge = analysis.trend === 'uptrend' ? 0.02 : 
                           analysis.trend === 'downtrend' ? -0.02 : 0;
            const volatilityEdge = analysis.volatility * 0.1;
            const quantumEdge = (quantumState.energy - 0.5) * 0.05;
            
            return trendEdge + volatilityEdge + quantumEdge;
            
        } catch (error) {
            console.error('[QBTC DECISION ENGINE] Error al calcular edge:', error.message);
            return 0;
        }
    }

    /**
     * Determinar dirección
     */
    determineDirection(analysis, quantumState) {
        try {
            const trendScore = analysis.trend === 'uptrend' ? 1 : 
                              analysis.trend === 'downtrend' ? -1 : 0;
            const quantumScore = quantumState.energy > 0.5 ? 1 : -1;
            const totalScore = trendScore + quantumScore;
            
            return totalScore > 0 ? 'BUY' : totalScore < 0 ? 'SELL' : 'HOLD';
            
        } catch (error) {
            console.error('[QBTC DECISION ENGINE] Error al determinar dirección:', error.message);
            return 'HOLD';
        }
    }

    /**
     * Calcular tamaño de posición
     */
    calculatePositionSize(symbol, confidence, edge) {
        try {
            const baseSize = this.config.riskPerTrade;
            const confidenceMultiplier = confidence;
            const edgeMultiplier = Math.abs(edge) * 10;
            
            return baseSize * confidenceMultiplier * edgeMultiplier;
            
        } catch (error) {
            console.error('[QBTC DECISION ENGINE] Error al calcular tamaño de posición:', error.message);
            return 0;
        }
    }

    /**
     * Actualizar estadísticas de rendimiento
     */
    updatePerformanceStats(signal) {
        try {
            this.state.performance.totalDecisions++;
            this.state.performance.avgConfidence = (
                (this.state.performance.avgConfidence * (this.state.performance.totalDecisions - 1) + signal.confidence) /
                this.state.performance.totalDecisions
            );
            
        } catch (error) {
            console.error('[QBTC DECISION ENGINE] Error al actualizar estadísticas:', error.message);
        }
    }

    /**
     * Iniciar ciclo de análisis
     */
    startAnalysisCycle() {
        setInterval(() => {
            if (this.state.isActive) {
                this.analyzeMarket();
            }
        }, 5000); // Análisis cada 5 segundos
    }

    /**
     * Analizar mercado (Futuros-only, edge cuántico de microestructura, aislado)
     */
    async analyzeMarket() {
        try {
            const timestamp = Date.now();
            const symbols = TRADING.SYMBOLS.MAJOR.concat(TRADING.SYMBOLS.MINOR);

            for (const symbol of symbols) {
                try {
                    // Construir snapshot mediante el servicio aislado
                    const snapshot = await this.edgeService.buildSnapshot(symbol);
                    if (!snapshot) continue;

                    this.edgeSnapshots.set(symbol, snapshot);

                    // Obtener señal aislada
                    const edgeSignal = this.edgeService.getSignal(snapshot);

                    if (edgeSignal && edgeSignal.confidence >= this.config.minConfidence) {
                        const signal = {
                            symbol,
                            direction: edgeSignal.type,
                            confidence: edgeSignal.confidence,
                            edge: snapshot.edgeScore,
                            positionSize: this.config.riskPerTrade * (edgeSignal.positionSizeFactor || 1),
                            price: this.marketAnalysis.symbols.get(symbol)?.lastPrice || null,
                            timestamp,
                            reason: edgeSignal.reason,
                            edgeSnapshot: snapshot
                        };

                        this.signals.set(symbol, signal);

                        // Emitir como decisión (unificación)
                        this.decisions.set(symbol, {
                            symbol,
                            action: edgeSignal.type,
                            confidence: edgeSignal.confidence,
                            reason: edgeSignal.reason,
                            timestamp
                        });

                        this.emit('signal', { symbol, signal, timestamp });
                        this.emit('decision', { symbol, decision: this.decisions.get(symbol), timestamp });
                    }
                } catch (errSym) {
                    console.error(`[QBTC DECISION ENGINE] Error analizando ${symbol}:`, errSym.message);
                }
            }

            this.state.lastUpdate = timestamp;
        } catch (error) {
            console.error('[QBTC DECISION ENGINE] Error en ciclo de análisis:', error.message);
        }
    }

    /**
     * Analizar correlaciones
     */
    async analyzeCorrelations() {
        try {
            const symbols = Array.from(this.marketAnalysis.symbols.keys());
            
            for (let i = 0; i < symbols.length; i++) {
                for (let j = i + 1; j < symbols.length; j++) {
                    const symbol1 = symbols[i];
                    const symbol2 = symbols[j];
                    
                    const correlation = this.calculateCorrelation(symbol1, symbol2);
                    this.marketAnalysis.correlations.set(`${symbol1}_${symbol2}`, correlation);
                }
            }
            
        } catch (error) {
            console.error('[QBTC DECISION ENGINE] Error al analizar correlaciones:', error.message);
        }
    }

    /**
     * Calcular correlación entre símbolos
     */
    calculateCorrelation(symbol1, symbol2) {
        try {
            const analysis1 = this.marketAnalysis.symbols.get(symbol1);
            const analysis2 = this.marketAnalysis.symbols.get(symbol2);
            
            if (!analysis1 || !analysis2 || analysis1.trades.length < 10 || analysis2.trades.length < 10) {
                return 0;
            }
            
            // Calcular correlación simple basada en precios
            const prices1 = analysis1.trades.map(t => t.price);
            const prices2 = analysis2.trades.map(t => t.price);
            
            const minLen = Math.min(prices1.length, prices2.length);
            const p1 = prices1.slice(-minLen);
            const p2 = prices2.slice(-minLen);
            
            const mean1 = p1.reduce((sum, price) => sum + price, 0) / p1.length;
            const mean2 = p2.reduce((sum, price) => sum + price, 0) / p2.length;
            
            let numerator = 0;
            let denominator1 = 0;
            let denominator2 = 0;
            
            for (let i = 0; i < minLen; i++) {
                const diff1 = p1[i] - mean1;
                const diff2 = p2[i] - mean2;
                
                numerator += diff1 * diff2;
                denominator1 += diff1 * diff1;
                denominator2 += diff2 * diff2;
            }
            
            const denominator = Math.sqrt(denominator1 * denominator2);
            
            return denominator === 0 ? 0 : numerator / denominator;
            
        } catch (error) {
            console.error('[QBTC DECISION ENGINE] Error al calcular correlación:', error.message);
            return 0;
        }
    }

    /**
     * Tomar decisión
     * Aislado para evitar duplicación: la decisión se deriva de analyzeMarket()
     */
    makeDecision(symbol, analysis, quantumState) {
        // La lógica de decisión está centralizada en analyzeMarket() usando FuturesEdgeService.
        // Evitar generar señales duplicadas aquí.
        return null;
    }

    /**
     * Obtener estado del motor
     */
    getStatus() {
        try {
            return {
                isActive: this.state.isActive,
                lastUpdate: this.state.lastUpdate,
                performance: this.state.performance,
                symbolsTracked: this.marketAnalysis.symbols.size,
                activeSignals: this.signals ? this.signals.size : 0,
                activeDecisions: this.decisions ? this.decisions.size : 0,
                quantumStates: this.quantumStates
            };
        } catch (error) {
            console.error('[QBTC DECISION ENGINE] Error getting status:', error);
            return {
                isActive: false,
                lastUpdate: null,
                performance: {
                    totalDecisions: 0,
                    correctDecisions: 0,
                    winRate: 0,
                    avgConfidence: 0
                },
                symbolsTracked: 0,
                activeSignals: 0,
                activeDecisions: 0,
                quantumStates: {},
                error: error.message
            };
        }
    }

    /**
     * Obtener señal para un símbolo
     */
    getSignal(symbol) {
        return this.signals.get(symbol);
    }

    /**
     * Obtener decisión para un símbolo
     */
    getDecision(symbol) {
        return this.decisions.get(symbol);
    }

    /**
     * Obtener todas las señales activas
     */
    getAllSignals() {
        return Array.from(this.signals.values());
    }

    /**
     * Obtener todas las decisiones activas
     */
    getAllDecisions() {
        return Array.from(this.decisions.values());
    }

    /**
     * Detener motor
     */
    stop() {
        this.state.isActive = false;
        console.log('[QBTC DECISION ENGINE] Motor detenido');
    }

    /**
     * Reiniciar motor
     */
    async restart() {
        try {
            this.stop();
            await this.initialize();
            console.log('[QBTC DECISION ENGINE] Motor reiniciado');
        } catch (error) {
            console.error('[QBTC DECISION ENGINE] Error al reiniciar motor:', error.message);
            throw error;
        }
    }
}

module.exports = QBTCDecisionEngine;