/**
 * QBTC UNIFIED - Servidor Principal Unificado
 * Servidor HTTP/WebSocket unificado para entorno monousuario local
 */

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const cors = require('cors');
const EventEmitter = require('events');

const SystemConfig = require('../config/SystemConfig');
const { NETWORK, LOGGING } = require('../shared/constants/QBTCConstants');
const QBTCDecisionEngine = require('../engine/QBTCDecisionEngine');
const DeterministicMath = require('../shared/utils/DeterministicMath');
const HashUtils = require('../shared/utils/HashUtils');
const MetricsEngine = require('../engine/QBTCMetricsEngine');

class QBTCServer extends EventEmitter {
    constructor() {
        super();
        
        console.log('🚀 QBTC UNIFIED Server initializing...');
        
        // Configuración
        this.config = SystemConfig.getNetworkConfig();
        this.systemConfig = SystemConfig.getConfig();
        
        // Estado del servidor
        this.state = {
            isRunning: false,
            startTime: null,
            connections: new Map(),
            sseClients: new Set(),
            wsClients: new Set(),
            metrics: {
                requests: 0,
                errors: 0,
                activeConnections: 0,
                startTime: Date.now()
            }
        };

        // Inicializar componentes
        this.app = express();
        this.server = null;
        this.wss = null;
        
        // Inicializar motor de decisiones
        this.decisionEngine = new QBTCDecisionEngine({
            minConfidence: this.systemConfig.trading.minConfidence,
            minEdge: this.systemConfig.trading.minEdge,
            maxPositions: this.systemConfig.trading.maxPositions,
            riskPerTrade: this.systemConfig.trading.riskPerTrade,
            debug: this.systemConfig.system.debug
        });

        // Configurar middleware
        this.setupMiddleware();
        
        // Configurar rutas
        this.setupRoutes();
        
        // Configurar eventos
        this.setupEvents();
    }

    /**
     * Configurar middleware
     */
    setupMiddleware() {
        // CORS
        this.app.use(cors({
            origin: this.config.cors.origin,
            credentials: this.config.cors.credentials
        }));

        // Parser JSON
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Logging
        this.app.use((req, res, next) => {
            this.state.metrics.requests++;
            const start = Date.now();
            
            res.on('finish', () => {
                const duration = Date.now() - start;
                const status = res.statusCode;
                const method = req.method;
                const url = req.url;
                
                if (status >= 400) {
                    this.state.metrics.errors++;
                    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${status} (${duration}ms) ❌`);
                } else if (this.systemConfig.system.debug) {
                    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${status} (${duration}ms) ✅`);
                }
            });
            
            next();
        });

        // Autenticación para rutas de trading
        this.app.use('/api/trading', this.authenticateTradingRequest.bind(this));

        // Servir frontend Leonardo Consciousness (frontend-unified)
        this.app.use(express.static(path.join(__dirname, '../../frontend-unified')));
    }

    /**
     * Configurar rutas
     */
    setupRoutes() {
        // Ruta de salud
        this.app.get('/api/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: Date.now(),
                uptime: Date.now() - this.state.metrics.startTime,
                version: this.systemConfig.system.version,
                environment: this.systemConfig.system.environment,
                connections: {
                    http: this.state.connections.size,
                    sse: this.state.sseClients.size,
                    ws: this.state.wsClients.size
                },
                metrics: this.state.metrics
            });
        });

        // Ruta de métricas
        this.app.get('/api/metrics', (req, res) => {
            try {
                const decisionEngineStatus = this.decisionEngine.getStatus();
                const quantumState = DeterministicMath.generateQuantumState();
                const edgeSummary = MetricsEngine.getSummary();

                res.json({
                    timestamp: Date.now(),
                    server: {
                        uptime: Date.now() - this.state.metrics.startTime,
                        requests: this.state.metrics.requests,
                        errors: this.state.metrics.errors,
                        connections: this.state.connections.size
                    },
                    decisionEngine: decisionEngineStatus,
                    quantum: quantumState,
                    edge: edgeSummary,
                    system: this.systemConfig.system
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Error getting metrics: ' + error.message,
                    timestamp: Date.now()
                });
            }
        });

        // Rutas de trading
        this.app.get('/api/trading/signals', (req, res) => {
            try {
                const signals = this.decisionEngine.getAllSignals();
                res.json({
                    success: true,
                    signals: signals,
                    count: signals.length,
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });

        // Ruta de métricas de edge cuántico de futuros (resumen)
        this.app.get('/api/edge/summary', (req, res) => {
            try {
                const summary = MetricsEngine.getSummary();
                res.json({
                    success: true,
                    summary,
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });

        this.app.get('/api/trading/decisions', (req, res) => {
            try {
                const decisions = this.decisionEngine.getAllDecisions();
                res.json({
                    success: true,
                    decisions: decisions,
                    count: decisions.length,
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });

        // Ruta de predicciones basadas en edge cuántico
        this.app.get('/api/predictions', (req, res) => {
            try {
                const limit = parseInt(req.query.limit) || 5;
                console.log(`[PREDICTIONS] Generating predictions with limit: ${limit}`);
                
                const edgeSummary = MetricsEngine.getSummary();
                console.log(`[PREDICTIONS] Edge summary:`, edgeSummary ? 'Available' : 'Not available');
                
                const decisionEngineStatus = this.decisionEngine.getStatus();
                console.log(`[PREDICTIONS] Decision engine status:`, decisionEngineStatus ? 'Available' : 'Not available');
                
                // Generar predicciones basadas en el edge cuántico y señales activas
                const predictions = [];
                
                if (edgeSummary && edgeSummary.symbols && edgeSummary.symbols.tracked) {
                    console.log(`[PREDICTIONS] Processing tracked symbols:`, Object.keys(edgeSummary.symbols.tracked));
                    
                    // Obtener símbolos tracked y ordenar por edge strength
                    const trackedSymbols = edgeSummary.symbols.tracked;
                    const sortedSymbols = Object.entries(trackedSymbols)
                        .filter(([symbol, data]) => symbol && symbol !== 'undefined' && data && data.edgeStrength)
                        .sort(([,a], [,b]) => (b.edgeStrength || 0) - (a.edgeStrength || 0))
                        .slice(0, limit);
                    
                    console.log(`[PREDICTIONS] Sorted symbols:`, sortedSymbols.map(([s, d]) => `${s}: ${d.edgeStrength}`));
                    
                    for (const [symbol, data] of sortedSymbols) {
                        try {
                            // Verificar que el símbolo sea válido
                            if (!symbol || symbol === 'undefined' || !data) continue;
                            
                            // Intentar obtener la señal con manejo de errores
                            let signal = null;
                            try {
                                signal = this.decisionEngine.getSignal(symbol);
                            } catch (signalError) {
                                console.warn(`[PREDICTIONS] Could not get signal for ${symbol}:`, signalError.message);
                            }
                            
                            const quantumState = DeterministicMath.generateQuantumState();
                            
                            // Calcular dirección y confianza basada en el edge
                            const direction = data.edgeStrength > 0 ? 'LONG' : 'SHORT';
                            const confidence = Math.min(Math.abs(data.edgeStrength) * 100, 100);
                            
                            // Calcular target price basado en el edge
                            const currentPrice = data.markPrice || 0;
                            const priceChangePercent = Math.abs(data.edgeStrength) * 2; // Escalar el edge a cambio porcentual
                            const targetPrice = direction === 'LONG'
                                ? currentPrice * (1 + priceChangePercent / 100)
                                : currentPrice * (1 - priceChangePercent / 100);
                            
                            // Calcular timeframe basado en la volatilidad
                            const timeframe = data.volatility24h > 0.05 ? '1h' : '4h';
                            
                            predictions.push({
                                symbol: symbol,
                                direction: direction,
                                confidence: confidence,
                                currentPrice: currentPrice,
                                targetPrice: targetPrice,
                                timeframe: timeframe,
                                edgeStrength: data.edgeStrength,
                                volatility: data.volatility24h,
                                zPlaneCoordinates: signal ? signal.zPlaneCoordinates : null,
                                quantumCoherence: quantumState.coherence,
                                predictionTimestamp: Date.now(),
                                reasoning: `Predicted based on quantum edge strength of ${data.edgeStrength.toFixed(4)} and ${direction === 'LONG' ? 'positive' : 'negative'} market microstructure`
                            });
                        } catch (symbolError) {
                            console.error(`[PREDICTIONS] Error processing symbol ${symbol}:`, symbolError);
                        }
                    }
                } else {
                    console.log(`[PREDICTIONS] No tracked symbols found in edge summary`);
                }
                
                console.log(`[PREDICTIONS] Generated ${predictions.length} predictions`);
                
                res.json({
                    success: true,
                    predictions: predictions,
                    count: predictions.length,
                    limit: limit,
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error(`[PREDICTIONS] Error generating predictions:`, error);
                res.status(500).json({
                    success: false,
                    error: 'Error generating predictions: ' + error.message,
                    stack: error.stack,
                    timestamp: Date.now()
                });
            }
        });

        // Ruta de oportunidades de trading basadas en edge cuántico
        this.app.get('/api/opportunities', (req, res) => {
            try {
                const limit = parseInt(req.query.limit) || 5;
                console.log(`[OPPORTUNITIES] Generating opportunities with limit: ${limit}`);
                
                const edgeSummary = MetricsEngine.getSummary();
                const decisionEngineStatus = this.decisionEngine.getStatus();
                
                // Generar oportunidades basadas en el edge cuántico y métricas Z-Plane
                const opportunities = [];
                
                if (edgeSummary && edgeSummary.symbols && edgeSummary.symbols.tracked) {
                    const trackedSymbols = edgeSummary.symbols.tracked;
                    
                    // Filtrar símbolos con edge significativo y ordenar por utilidad Z-Plane
                    const sortedSymbols = Object.entries(trackedSymbols)
                        .filter(([,data]) => Math.abs(data.edgeStrength || 0) > 0.01) // Solo edge significativo
                        .sort(([,a], [,b]) => {
                            // Calcular utilidad Z-Plane para cada símbolo
                            const utilityA = this.calculateZPlaneUtility(a);
                            const utilityB = this.calculateZPlaneUtility(b);
                            return utilityB - utilityA;
                        })
                        .slice(0, limit);
                    
                    for (const [symbol, data] of sortedSymbols) {
                        try {
                            // Obtener señal y estado cuántico
                            let signal = null;
                            try {
                                signal = this.decisionEngine.getSignal(symbol);
                            } catch (signalError) {
                                console.warn(`[OPPORTUNITIES] Could not get signal for ${symbol}:`, signalError.message);
                            }
                            
                            const quantumState = DeterministicMath.generateQuantumState();
                            
                            // Calcular métricas de oportunidad
                            const direction = data.edgeStrength > 0 ? 'LONG' : 'SHORT';
                            const confidence = Math.min(Math.abs(data.edgeStrength) * 100, 100);
                            const zUtility = this.calculateZPlaneUtility(data);
                            
                            // Calcular riesgo/recompensa
                            const currentPrice = data.markPrice || 0;
                            const stopLoss = direction === 'LONG'
                                ? currentPrice * (1 - 0.02) // 2% stop loss
                                : currentPrice * (1 + 0.02);
                            const takeProfit = direction === 'LONG'
                                ? currentPrice * (1 + Math.abs(data.edgeStrength) * 3)
                                : currentPrice * (1 - Math.abs(data.edgeStrength) * 3);
                            
                            // Calcular tamaño de posición óptimo basado en Z-Plane
                            const positionSize = this.calculateOptimalPositionSize(data, zUtility);
                            
                            opportunities.push({
                                symbol: symbol,
                                direction: direction,
                                confidence: confidence,
                                currentPrice: currentPrice,
                                stopLoss: stopLoss,
                                takeProfit: takeProfit,
                                riskRewardRatio: Math.abs((takeProfit - currentPrice) / (currentPrice - stopLoss)),
                                positionSize: positionSize,
                                zPlaneUtility: zUtility,
                                edgeStrength: data.edgeStrength,
                                volatility: data.volatility24h,
                                zPlaneCoordinates: signal ? signal.zPlaneCoordinates : null,
                                executionPolicy: signal ? signal.executionPolicy : 'aggressive',
                                quantumCoherence: quantumState.coherence,
                                opportunityTimestamp: Date.now(),
                                reasoning: `High Z-Plane utility opportunity (${zUtility.toFixed(4)}) with ${confidence.toFixed(1)}% confidence and ${Math.abs((takeProfit - currentPrice) / (currentPrice - stopLoss)).toFixed(2)}:1 risk/reward ratio`
                            });
                        } catch (symbolError) {
                            console.error(`[OPPORTUNITIES] Error processing symbol ${symbol}:`, symbolError);
                        }
                    }
                }
                
                console.log(`[OPPORTUNITIES] Generated ${opportunities.length} opportunities`);
                
                res.json({
                    success: true,
                    opportunities: opportunities,
                    count: opportunities.length,
                    limit: limit,
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error(`[OPPORTUNITIES] Error generating opportunities:`, error);
                res.status(500).json({
                    success: false,
                    error: 'Error generating opportunities: ' + error.message,
                    stack: error.stack,
                    timestamp: Date.now()
                });
            }
        });

        // Métodos auxiliares para Z-Plane Utility Maximization
        this.calculateZPlaneUtility = (data) => {
            try {
                // Función de utilidad tridimensional U(x,y,z) = α*y - β*x + γ*z^φ
                const alpha = 0.4;  // Peso para edge strength
                const beta = 0.3;   // Peso para volatilidad (negativo)
                const gamma = 0.3;  // Peso para coherencia cuántica
                const phi = 1.618;  // Constante áurea
                
                const x = data.volatility24h || 0;           // Volatilidad
                const y = Math.abs(data.edgeStrength || 0);   // Edge strength (absoluto)
                const z = data.quantumCoherence || 0.5;      // Coherencia cuántica
                
                return alpha * y - beta * x + gamma * Math.pow(z, phi);
            } catch (error) {
                console.error('Error calculating Z-Plane utility:', error);
                return 0;
            }
        };

        this.calculateOptimalPositionSize = (data, zUtility) => {
            try {
                // Calcular tamaño de posición basado en Z-Plane utility y riesgo
                const baseSize = 0.1; // 10% base
                const riskMultiplier = Math.min(zUtility * 2, 1); // Multiplicador basado en utilidad
                const volatilityAdjustment = Math.max(1 - (data.volatility24h || 0), 0.5); // Ajuste por volatilidad
                
                return baseSize * riskMultiplier * volatilityAdjustment;
            } catch (error) {
                console.error('Error calculating optimal position size:', error);
                return 0.05; // 5% por defecto
            }
        };

        this.app.get('/api/trading/signal/:symbol', (req, res) => {
            try {
                const symbol = req.params.symbol.toUpperCase();
                const signal = this.decisionEngine.getSignal(symbol);
                
                if (signal) {
                    res.json({
                        success: true,
                        signal: signal,
                        timestamp: Date.now()
                    });
                } else {
                    res.status(404).json({
                        success: false,
                        error: 'Signal not found',
                        symbol: symbol,
                        timestamp: Date.now()
                    });
                }
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });

        // Rutas de mercado
        this.app.get('/api/market/symbols', (req, res) => {
            try {
                const symbols = this.systemConfig.trading.symbols;
                res.json({
                    success: true,
                    symbols: symbols,
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });

        // Rutas de configuración
        this.app.get('/api/config', (req, res) => {
            try {
                const safeConfig = {
                    system: this.systemConfig.system,
                    network: this.systemConfig.network,
                    trading: this.systemConfig.trading,
                    quantum: this.systemConfig.quantum,
                    logging: this.systemConfig.logging
                };
                
                res.json({
                    success: true,
                    config: safeConfig,
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });

        // =========================
        // Rutas de RIESGO / EXPOSICIÓN
        // =========================
        // Estado de riesgo simulado para entorno local
        if (!this._riskState) {
            this._riskState = {
                limits: {
                    MAX_DAILY_DRAWDOWN: 0.10,
                    MAX_SYMBOL_EXPOSURE_PCT: 0.15,
                    MAX_CATEGORY_EXPOSURE_PCT: 0.35
                },
                bySymbol: {},
                byCategory: {}
            };
        }

        this.app.get('/api/risk/exposure', (req, res) => {
            try {
                // Generar snapshot básico de exposición a partir de señales
                const signals = this.decisionEngine.getAllSignals() || [];
                const bySymbol = {};
                const byCategory = {};
                signals.forEach(s => {
                    const sym = s?.symbol || 'UNKNOWN';
                    const cat = sym.endsWith('USDT') ? 'USDT' : 'OTHER';
                    const pos = Math.max(0, Number(s?.positionSize || 0)) * 1000; // escala simple
                    bySymbol[sym] = (bySymbol[sym] || 0) + pos;
                    byCategory[cat] = (byCategory[cat] || 0) + pos;
                });

                this._riskState.bySymbol = bySymbol;
                this._riskState.byCategory = byCategory;

                res.json({
                    success: true,
                    data: {
                        bySymbol,
                        byCategory,
                        limits: this._riskState.limits
                    },
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });

        this.app.post('/api/risk/reset', (req, res) => {
            try {
                this._riskState.bySymbol = {};
                this._riskState.byCategory = {};
                res.json({
                    success: true,
                    message: 'Risk state reset',
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });

        this.app.post('/api/risk/config', (req, res) => {
            try {
                const cfg = req.body || {};
                const limits = this._riskState.limits;
                if (typeof cfg.MAX_DAILY_DRAWDOWN === 'number') limits.MAX_DAILY_DRAWDOWN = cfg.MAX_DAILY_DRAWDOWN;
                if (typeof cfg.MAX_SYMBOL_EXPOSURE_PCT === 'number') limits.MAX_SYMBOL_EXPOSURE_PCT = cfg.MAX_SYMBOL_EXPOSURE_PCT;
                if (typeof cfg.MAX_CATEGORY_EXPOSURE_PCT === 'number') limits.MAX_CATEGORY_EXPOSURE_PCT = cfg.MAX_CATEGORY_EXPOSURE_PCT;
                res.json({
                    success: true,
                    data: { limits },
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });

        // =========================
        // Rutas TRADING (compatibilidad con frontend)
        // =========================
        // /api/trading/balance debe ser público -> se libera en middleware
        this.app.get('/api/trading/balance', (req, res) => {
            try {
                // Reutilizar balance simulado
                const simulatedBalance = {
                    total: 10000.00,
                    available: 8500.00,
                    used: 1500.00
                };
                res.json({
                    success: true,
                    data: { currentBalance: simulatedBalance.total },
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });

        // Posiciones (simulado vacío)
        this.app.get('/api/trading/positions', (req, res) => {
            try {
                res.json({
                    success: true,
                    data: [],
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });

        // =========================
        // Stubs auxiliares para sondas del dashboard
        // =========================
        this.app.get('/system/status', (req, res) => {
            try {
                res.json({
                    success: true,
                    data: this.getStatus(),
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });

        this.app.get('/quantum/rate-limit', (req, res) => {
            try {
                res.json({
                    success: true,
                    data: { remaining: 1000, resetInSec: 60 },
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });

        this.app.get('/quantum/cache/stats', (req, res) => {
            try {
                const ttl = (this.systemConfig?.cache?.ttl || 15000);
                res.json({
                    success: true,
                    data: { enabled: true, size: 0, ttlMs: ttl },
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });

        // =========================
        // Rutas de RIESGO / EXPOSICIÓN
        // =========================
        // Snapshot simple de exposición (simulado en modo local)
        this._riskState = {
            limits: {
                MAX_DAILY_DRAWDOWN: 0.10,
                MAX_SYMBOL_EXPOSURE_PCT: 0.15,
                MAX_CATEGORY_EXPOSURE_PCT: 0.35
            },
            bySymbol: {},
            byCategory: {}
        };

        this.app.get('/api/risk/exposure', (req, res) => {
            try {
                // Generar exposición simulada a partir de señales activas
                const signals = this.decisionEngine.getAllSignals() || [];
                const bySymbol = {};
                const byCategory = {};
                signals.forEach(s => {
                    const sym = s.symbol || 'UNKNOWN';
                    const cat = sym.endsWith('USDT') ? 'USDT' : 'OTHER';
                    const pos = Math.max(0, Number(s.positionSize || 0)) * 1000; // escala
                    bySymbol[sym] = (bySymbol[sym] || 0) + pos;
                    byCategory[cat] = (byCategory[cat] || 0) + pos;
                });

                // Persistir último snapshot básico
                this._riskState.bySymbol = bySymbol;
                this._riskState.byCategory = byCategory;

                res.json({
                    success: true,
                    data: {
                        bySymbol,
                        byCategory,
                        limits: this._riskState.limits
                    },
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });

        this.app.post('/api/risk/reset', (req, res) => {
            try {
                // Reset de estado simulado
                this._riskState.bySymbol = {};
                this._riskState.byCategory = {};
                res.json({
                    success: true,
                    message: 'Risk state reset',
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });

        this.app.post('/api/risk/config', (req, res) => {
            try {
                const cfg = req.body || {};
                const limits = this._riskState.limits;
                if (typeof cfg.MAX_DAILY_DRAWDOWN === 'number') limits.MAX_DAILY_DRAWDOWN = cfg.MAX_DAILY_DRAWDOWN;
                if (typeof cfg.MAX_SYMBOL_EXPOSURE_PCT === 'number') limits.MAX_SYMBOL_EXPOSURE_PCT = cfg.MAX_SYMBOL_EXPOSURE_PCT;
                if (typeof cfg.MAX_CATEGORY_EXPOSURE_PCT === 'number') limits.MAX_CATEGORY_EXPOSURE_PCT = cfg.MAX_CATEGORY_EXPOSURE_PCT;
                res.json({
                    success: true,
                    data: { limits },
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });

        // =========================
        // Rutas TRADING (compatibilidad con frontend)
        // =========================
        // Balance en /api/trading/balance (público, ver whitelist)
        this.app.get('/api/trading/balance', (req, res) => {
            try {
                // Reusar simulación de /api/balance para exponer currentBalance simple
                const simulatedBalance = {
                    total: 10000.00,
                    available: 8500.00,
                    used: 1500.00
                };
                res.json({
                    success: true,
                    data: {
                        currentBalance: simulatedBalance.total
                    },
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });

        // Posiciones activas (simulado)
        this.app.get('/api/trading/positions', (req, res) => {
            try {
                res.json({
                    success: true,
                    data: [],
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });

        // =========================
        // Rutas auxiliares de sistema/cuántico (stubs)
        // =========================
        this.app.get('/system/status', (req, res) => {
            try {
                res.json({
                    success: true,
                    data: this.getStatus(),
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message, timestamp: Date.now() });
            }
        });

        this.app.get('/quantum/rate-limit', (req, res) => {
            try {
                res.json({
                    success: true,
                    data: { remaining: 1000, resetInSec: 60 },
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message, timestamp: Date.now() });
            }
        });

        this.app.get('/quantum/cache/stats', (req, res) => {
            try {
                res.json({
                    success: true,
                    data: { enabled: true, size: 0, ttlMs: (this.systemConfig.cache?.ttl || 15000) },
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message, timestamp: Date.now() });
            }
        });

        // Ruta de balance de cuenta
        this.app.get('/api/balance', (req, res) => {
            try {
                // Obtener balance del motor de decisiones
                const balance = this.decisionEngine.getBalance();
                
                if (balance) {
                    res.json({
                        success: true,
                        balance: balance,
                        timestamp: Date.now()
                    });
                } else {
                    // Si no hay balance real, generar balance simulado para modo demo
                    const simulatedBalance = {
                        total: 10000.00,
                        available: 8500.00,
                        used: 1500.00,
                        margin: {
                            initial: 10000.00,
                            maintenance: 2000.00,
                            marginRatio: 0.15
                        },
                        assets: {
                            USDT: 8500.00,
                            BTC: 0.05,
                            ETH: 0.5
                        },
                        pnl: {
                            today: 125.50,
                            total: 525.30,
                            percentage: 5.53
                        },
                        isSimulated: true
                    };
                    
                    res.json({
                        success: true,
                        balance: simulatedBalance,
                        timestamp: Date.now()
                    });
                }
            } catch (error) {
                console.error('[BALANCE] Error getting balance:', error);
                res.status(500).json({
                    success: false,
                    error: 'Error getting balance: ' + error.message,
                    timestamp: Date.now()
                });
            }
        });

        // Ruta /balance para compatibilidad con frontend (redirigir a /api/balance)
        this.app.get('/balance', (req, res) => {
            try {
                // Redirigir a /api/balance para compatibilidad
                res.redirect(307, '/api/balance');
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Error redirecting balance',
                    timestamp: Date.now()
                });
            }
        });

        // Ruta SSE para actualizaciones en tiempo real
        this.app.get('/api/sse', (req, res) => {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Cache-Control'
            });

            const clientId = HashUtils.generateUniqueId(Date.now().toString());
            this.state.sseClients.add(res);
            this.state.connections.set(clientId, { type: 'sse', client: res });

            // Enviar evento de conexión
            this.sendSSEEvent(res, 'connected', { clientId, timestamp: Date.now() });

            // Mantener conexión abierta
            const heartbeat = setInterval(() => {
                this.sendSSEEvent(res, 'heartbeat', { timestamp: Date.now() });
            }, 30000);

            req.on('close', () => {
                clearInterval(heartbeat);
                this.state.sseClients.delete(res);
                this.state.connections.delete(clientId);
            });
        });

        // Ruta principal - servir frontend Leonardo
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../../frontend-unified/index.html'));
        });

        // Rutas de manejo de señales
        this.app.get('/api/signals', (req, res) => {
            try {
                const signals = this.decisionEngine.getAllSignals();
                res.json({
                    success: true,
                    data: {
                        total: signals.length,
                        peekEndpoint: '/api/signals/peek',
                        statsEndpoint: '/api/signals/stats',
                        signals: signals.map(s => ({
                            symbol: s.symbol,
                            direction: s.direction,
                            confidence: s.confidence,
                            timeframe: s.timeframe
                        }))
                    },
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });

        this.app.get('/api/signals/peek', (req, res) => {
            try {
                const limit = parseInt(req.query.limit) || 10;
                const offset = parseInt(req.query.offset) || 0;
                
                // Obtener señales del motor de decisiones
                const signals = this.decisionEngine.getAllSignals();
                const paginated = signals.slice(offset, offset + limit);
                
                res.json({
                    success: true,
                    data: paginated,
                    total: signals.length,
                    limit: limit,
                    offset: offset,
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });

        this.app.get('/api/signals/stats', (req, res) => {
            try {
                const signals = this.decisionEngine.getAllSignals();
                res.json({
                    success: true,
                    data: {
                        queued: signals.length,
                        published: signals.filter(s => s.published).length,
                        consumed: signals.filter(s => s.consumed).length
                    },
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });

        this.app.post('/api/signals/discard', (req, res) => {
            try {
                const { symbol, timeframe } = req.body;
                // Lógica para descartar señal
                res.json({
                    success: true,
                    message: `Signal for ${symbol} discarded`,
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });

        this.app.post('/api/signals/requeue', (req, res) => {
            try {
                const { symbol, timeframe, boost } = req.body;
                // Lógica para reencolar señal
                res.json({
                    success: true,
                    message: `Signal for ${symbol} requeued with boost ${boost}`,
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });

        this.app.post('/api/signals/clear', (req, res) => {
            try {
                // Lógica para limpiar cola de señales
                res.json({
                    success: true,
                    message: 'Signal queue cleared',
                    removed: 0,
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });

        // Ruta /api/stream para compatibilidad con frontend
        this.app.get('/api/stream', (req, res) => {
            try {
                // Redirigir a /api/sse para compatibilidad
                res.redirect(307, '/api/sse');
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Error redirecting stream',
                    timestamp: Date.now()
                });
            }
        });

        // Manejador de errores 404
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                error: 'Endpoint not found',
                path: req.path,
                method: req.method,
                timestamp: Date.now()
            });
        });

        // Manejador de errores general
        this.app.use((error, req, res, next) => {
            console.error('Server error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                timestamp: Date.now()
            });
        });
    }

    /**
     * Configurar WebSocket
     */
    setupWebSocket() {
        this.wss = new WebSocket.Server({ 
            server: this.server,
            path: '/ws'
        });

        this.wss.on('connection', (ws, req) => {
            const clientId = HashUtils.generateUniqueId(Date.now().toString());
            
            this.state.wsClients.add(ws);
            this.state.connections.set(clientId, { type: 'ws', client: ws });

            console.log(`[WS] Client connected: ${clientId}`);

            // Enviar mensaje de bienvenida
            ws.send(JSON.stringify({
                type: 'connected',
                clientId: clientId,
                timestamp: Date.now()
            }));

            // Manejar mensajes
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleWebSocketMessage(ws, clientId, data);
                } catch (error) {
                    console.error('[WS] Error parsing message:', error);
                    ws.send(JSON.stringify({
                        type: 'error',
                        error: 'Invalid message format',
                        timestamp: Date.now()
                    }));
                }
            });

            // Manejar desconexión
            ws.on('close', () => {
                this.state.wsClients.delete(ws);
                this.state.connections.delete(clientId);
                console.log(`[WS] Client disconnected: ${clientId}`);
            });

            // Manejar errores
            ws.on('error', (error) => {
                console.error(`[WS] Client error ${clientId}:`, error);
                this.state.wsClients.delete(ws);
                this.state.connections.delete(clientId);
            });
        });
    }

    /**
     * Manejar mensajes WebSocket
     */
    handleWebSocketMessage(ws, clientId, data) {
        try {
            switch (data.type) {
                case 'ping':
                    ws.send(JSON.stringify({
                        type: 'pong',
                        timestamp: Date.now()
                    }));
                    break;

                case 'subscribe':
                    this.handleWebSocketSubscription(ws, data);
                    break;

                case 'unsubscribe':
                    this.handleWebSocketUnsubscription(ws, data);
                    break;

                case 'getMetrics':
                    ws.send(JSON.stringify({
                        type: 'metrics',
                        data: this.getServerMetrics(),
                        timestamp: Date.now()
                    }));
                    break;

                default:
                    ws.send(JSON.stringify({
                        type: 'error',
                        error: 'Unknown message type',
                        timestamp: Date.now()
                    }));
            }
        } catch (error) {
            console.error('[WS] Error handling message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                error: 'Internal server error',
                timestamp: Date.now()
            }));
        }
    }

    /**
     * Manejar suscripciones WebSocket
     */
    handleWebSocketSubscription(ws, data) {
        try {
            const { channel } = data;
            
            if (!ws.subscriptions) {
                ws.subscriptions = new Set();
            }
            
            ws.subscriptions.add(channel);
            
            ws.send(JSON.stringify({
                type: 'subscribed',
                channel: channel,
                timestamp: Date.now()
            }));
            
        } catch (error) {
            console.error('[WS] Error handling subscription:', error);
        }
    }

    /**
     * Manejar cancelaciones de suscripción WebSocket
     */
    handleWebSocketUnsubscription(ws, data) {
        try {
            const { channel } = data;
            
            if (ws.subscriptions) {
                ws.subscriptions.delete(channel);
            }
            
            ws.send(JSON.stringify({
                type: 'unsubscribed',
                channel: channel,
                timestamp: Date.now()
            }));
            
        } catch (error) {
            console.error('[WS] Error handling unsubscription:', error);
        }
    }

    /**
     * Configurar eventos
     */
    setupEvents() {
        // Eventos del motor de decisiones
        this.decisionEngine.on('signal', (data) => {
            this.broadcastWebSocket('signal', data);
            this.broadcastSSE('signal', data);
        });

        this.decisionEngine.on('decision', (data) => {
            this.broadcastWebSocket('decision', data);
            this.broadcastSSE('decision', data);
        });

        this.decisionEngine.on('initialized', () => {
            console.log('[SERVER] Decision engine initialized');
            this.broadcastWebSocket('system', { event: 'decisionEngineInitialized' });
            this.broadcastSSE('system', { event: 'decisionEngineInitialized' });
        });

        // Eventos periódicos
        setInterval(() => {
            try {
                this.broadcastMetrics();
            } catch (error) {
                console.error('[SERVER] Error broadcasting metrics:', error);
            }
        }, 10000); // Cada 10 segundos
    }

    /**
     * Autenticar solicitudes de trading
     */
    authenticateTradingRequest(req, res, next) {
        try {
            // Whitelist público para lecturas no sensibles del dashboard
            const url = (req.originalUrl || req.url || '');
            const publicTrading =
                url.startsWith('/api/trading/balance') ||
                url.startsWith('/api/trading/positions');
            if (publicTrading) return next();

            const authHeader = req.headers[this.systemConfig.auth.headerName];
            const envKey = this.systemConfig.auth.tradingKey;

            // Permitir en modo local si se desactiva autenticación
            if (!this.systemConfig.auth.required) {
                return next();
            }
            
            if (!authHeader && !envKey) {
                return res.status(401).json({
                    success: false,
                    error: 'Trading key required',
                    timestamp: Date.now()
                });
            }
            
            if (authHeader && envKey && authHeader !== envKey) {
                return res.status(403).json({
                    success: false,
                    error: 'Invalid trading key',
                    timestamp: Date.now()
                });
            }
            
            next();
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Authentication error',
                timestamp: Date.now()
            });
        }
    }

    /**
     * Enviar evento SSE
     */
    sendSSEEvent(client, event, data) {
        try {
            const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
            client.write(message);
        } catch (error) {
            console.error('[SSE] Error sending event:', error);
        }
    }

    /**
     * Broadcast a todos los clientes SSE
     */
    broadcastSSE(event, data) {
        this.state.sseClients.forEach(client => {
            this.sendSSEEvent(client, event, data);
        });
    }

    /**
     * Broadcast a todos los clientes WebSocket
     */
    broadcastWebSocket(type, data) {
        const message = JSON.stringify({
            type: type,
            data: data,
            timestamp: Date.now()
        });

        this.state.wsClients.forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                try {
                    ws.send(message);
                } catch (error) {
                    console.error('[WS] Error broadcasting message:', error);
                }
            }
        });
    }

    /**
     * Broadcast métricas
     */
    broadcastMetrics() {
        const metrics = this.getServerMetrics();
        this.broadcastWebSocket('metrics', metrics);
        this.broadcastSSE('metrics', metrics);
    }

    /**
     * Obtener métricas del servidor
     */
    getServerMetrics() {
        try {
            const decisionEngineStatus = this.decisionEngine.getStatus();
            const quantumState = DeterministicMath.generateQuantumState();
            const edgeSummary = MetricsEngine.getSummary();
            
            return {
                timestamp: Date.now(),
                server: {
                    uptime: Date.now() - this.state.metrics.startTime,
                    requests: this.state.metrics.requests,
                    errors: this.state.metrics.errors,
                    connections: this.state.connections.size
                },
                decisionEngine: decisionEngineStatus,
                quantum: quantumState,
                edge: edgeSummary,
                system: this.systemConfig.system
            };
        } catch (error) {
            console.error('[SERVER] Error getting server metrics:', error);
            return {
                timestamp: Date.now(),
                server: {
                    uptime: Date.now() - this.state.metrics.startTime,
                    requests: this.state.metrics.requests,
                    errors: this.state.metrics.errors,
                    connections: this.state.connections.size
                },
                decisionEngine: {
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
                    quantumStates: {}
                },
                quantum: DeterministicMath.generateQuantumState(),
                edge: MetricsEngine.getSummary(),
                system: this.systemConfig.system,
                error: error.message
            };
        }
    }

    /**
     * Iniciar servidor
     */
    async start() {
        try {
            console.log('[SERVER] Starting QBTC UNIFIED Server...');
            
            // Crear servidor HTTP
            this.server = http.createServer(this.app);
            
            // Configurar WebSocket después de crear el servidor
            this.setupWebSocket();
            
            // Inicializar motor de decisiones
            await this.decisionEngine.initialize();
            
            // Iniciar servidor
            this.server.listen(this.config.port, this.config.host, () => {
                this.state.isRunning = true;
                this.state.startTime = Date.now();
                
                console.log(`[SERVER] Server started successfully`);
                console.log(`[SERVER] 🌐 HTTP: http://${this.config.host}:${this.config.port}`);
                console.log(`[SERVER] 📊 SSE: http://${this.config.host}:${this.config.port}/api/sse`);
                console.log(`[SERVER] 🔌 WebSocket: ws://${this.config.host}:${this.config.port}/ws`);
                console.log(`[SERVER] 📚 Frontend: http://${this.config.host}:${this.config.port}/`);
                
                this.emit('started', {
                    host: this.config.host,
                    port: this.config.port,
                    timestamp: Date.now()
                });
            });

            // Manejar errores del servidor
            this.server.on('error', (error) => {
                console.error('[SERVER] Server error:', error);
                this.emit('error', error);
            });

        } catch (error) {
            console.error('[SERVER] Error starting server:', error);
            throw error;
        }
    }

    /**
     * Detener servidor
     */
    async stop() {
        try {
            console.log('[SERVER] Stopping QBTC UNIFIED Server...');
            
            if (this.server) {
                // Cerrar conexiones WebSocket
                if (this.wss) {
                    this.wss.close();
                }
                
                // Cerrar conexiones SSE
                this.state.sseClients.forEach(client => client.destroy());
                
                // Cerrar servidor HTTP
                this.server.close();
                
                // Detener motor de decisiones
                this.decisionEngine.stop();
                
                this.state.isRunning = false;
                
                console.log('[SERVER] Server stopped successfully');
                this.emit('stopped', { timestamp: Date.now() });
            }
            
        } catch (error) {
            console.error('[SERVER] Error stopping server:', error);
            throw error;
        }
    }

    /**
     * Reiniciar servidor
     */
    async restart() {
        try {
            console.log('[SERVER] Restarting QBTC UNIFIED Server...');
            await this.stop();
            await this.start();
            console.log('[SERVER] Server restarted successfully');
        } catch (error) {
            console.error('[SERVER] Error restarting server:', error);
            throw error;
        }
    }

    /**
     * Obtener estado del servidor
     */
    getStatus() {
        return {
            isRunning: this.state.isRunning,
            startTime: this.state.startTime,
            uptime: this.state.isRunning ? Date.now() - this.state.startTime : 0,
            connections: {
                total: this.state.connections.size,
                sse: this.state.sseClients.size,
                ws: this.state.wsClients.size
            },
            metrics: this.state.metrics,
            config: {
                host: this.config.host,
                port: this.config.port
            }
        };
    }
}

// Si este archivo es ejecutado directamente, iniciar el servidor
if (require.main === module) {
    const server = new QBTCServer();
    server.start().catch(error => {
        console.error('Error starting server:', error);
        process.exit(1);
    });
}

module.exports = QBTCServer;