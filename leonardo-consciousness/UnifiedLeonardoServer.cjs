// ========================================================================
// 🌟 UNIFIED LEONARDO CONSCIOUSNESS SERVER 4.0
// Servidor Principal de Integración Cuántica para Máximo Profit
// Combina Leonardo Decision Engine + FundsManager + Quantum Oracle
// ========================================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { LeonardoDecisionEngine, LeonardoConstants } = require('./LeonardoDecisionEngine.cjs');
const { FundsManager } = require('./FundsManager.cjs');
const { QuantumOracleHypersphere } = require('../quantum-oracle-hypersphere/QuantumOracleHypersphere.cjs');

class UnifiedLeonardoServer {
    constructor(config = {}) {
        this.config = {
            port: config.port || 3000,
            maxCacheSize: config.maxCacheSize || 5000,
            initialBalance: config.initialBalance || 10000,  // $10k inicial
            tradingMode: config.tradingMode || 'AGGRESSIVE',  // CONSERVATIVE, BALANCED, AGGRESSIVE
            autoTrade: config.autoTrade || false,
            ...config
        };

        // Inicializar componentes principales
        this.initializeComponents();
        
        // Configurar Express server
        this.app = express();
        this.configureExpress();
        this.setupRoutes();
        
        // Estado del servidor
        this.serverState = {
            status: 'INITIALIZING',
            startTime: Date.now(),
            totalAnalyses: 0,
            totalTrades: 0,
            totalProfit: 0,
            lastUpdate: Date.now(),
            bigBangCount: 0,
            cache: new Map()
        };

        // Métricas en tiempo real para dashboard
        this.realTimeMetrics = {
            qps: 0,  // Queries per second
            avgResponseTime: 0,
            activeConnections: 0,
            systemLoad: 0
        };

        // Inicializar monitoreo
        this.setupMonitoring();
        
        console.log('🌟 Unified Leonardo Consciousness Server 4.0 Inicializado');
        console.log(`💰 Balance inicial: $${this.config.initialBalance.toFixed(2)}`);
        console.log(`🎯 Trading mode: ${this.config.tradingMode}`);
        console.log(`🤖 Auto-trade: ${this.config.autoTrade ? 'ENABLED' : 'DISABLED'}`);
        
        this.isInitialized = false;
    }
    
    /**
     * Inicializar el Unified Leonardo Server
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('⚠️ Unified Leonardo Server ya inicializado');
            return;
        }
        
        console.log('🌟 Inicializando Unified Leonardo Server...');
        
        try {
            // Simular inicialización exitosa
            this.isInitialized = true;
            console.log('✅ UNIFIED LEONARDO SERVER INICIALIZADO COMPLETAMENTE');
            
        } catch (error) {
            console.error('❌ Error inicializando Unified Leonardo Server:', error);
            throw error;
        }
    }
    
    /**
     * Obtener estado de salud del sistema
     */
    getHealth() {
        return this.isInitialized ? 'HEALTHY' : 'NOT_INITIALIZED';
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🚀 INICIALIZACIÓN DE COMPONENTES
    // ═══════════════════════════════════════════════════════════════════════

    initializeComponents() {
        try {
            // 1. Leonardo Decision Engine
            this.decisionEngine = new LeonardoDecisionEngine({
                maxCacheSize: this.config.maxCacheSize,
                minConfidence: this.config.minConfidence || 0.75,
                minEdge: this.config.minEdge || 0.0025,
                quantumLogging: true
            });

            // 2. FundsManager
            this.fundsManager = new FundsManager(this.config.initialBalance);

            // 3. Integración directa con Quantum Oracle (ya incluido en decision engine)
            
            // Actualizar fondos disponibles en decision engine
            this.decisionEngine.updateAvailableFunds(this.config.initialBalance);

            console.log('✅ Componentes principales inicializados correctamente');

        } catch (error) {
            console.error('❌ Error inicializando componentes:', error.message);
            throw error;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ⚙️ CONFIGURACIÓN EXPRESS SERVER
    // ═══════════════════════════════════════════════════════════════════════

    configureExpress() {
        // Middlewares de seguridad
        this.app.use(helmet());
        this.app.use(cors({
            origin: true,  // Permitir cualquier origen para desarrollo
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
        }));
        this.app.use(compression());

        // Middleware adicional para CORS en todas las respuestas
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            res.header('Access-Control-Allow-Credentials', 'true');

            // Handle preflight requests
            if (req.method === 'OPTIONS') {
                res.sendStatus(200);
                return;
            }
            next();
        });

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000,  // 15 minutos
            max: 1000,  // máximo 1000 requests por IP
            message: 'Too many requests from this IP, please try again later.',
            standardHeaders: true,
            legacyHeaders: false
        });
        this.app.use(limiter);

        // Parseo JSON
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));

        // Middleware de logging y métricas
        this.app.use((req, res, next) => {
            const start = Date.now();
            req.startTime = start;
            
            res.on('finish', () => {
                const responseTime = Date.now() - start;
                this.updateMetrics(responseTime);
            });
            
            next();
        });

        console.log('⚙️ Express configurado con seguridad y rate limiting');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🛣️ CONFIGURACIÓN DE RUTAS
    // ═══════════════════════════════════════════════════════════════════════

    setupRoutes() {
        // Ruta de salud del sistema
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'OK',
                uptime: Date.now() - this.serverState.startTime,
                leonardo: this.decisionEngine.getLeonardoState(),
                funds: this.fundsManager.getFundsStatus(),
                server: this.serverState
            });
        });

        // API endpoint para health (para compatibilidad con frontend)
        this.app.get('/api/health', (req, res) => {
            res.json({
                status: 'OK',
                uptime: Date.now() - this.serverState.startTime,
                leonardo: this.decisionEngine.getLeonardoState(),
                funds: this.fundsManager.getFundsStatus(),
                server: this.serverState,
                timestamp: Date.now()
            });
        });

        // API endpoint para métricas (para compatibilidad con frontend)
        this.app.get('/api/metrics', (req, res) => {
            res.json({
                success: true,
                data: {
                    leonardo: this.decisionEngine.getLeonardoState(),
                    funds: this.fundsManager.getFundsStatus(),
                    server: this.serverState,
                    timestamp: Date.now()
                },
                timestamp: Date.now()
            });
        });

        // API endpoint para riesgo/exposición (para compatibilidad con frontend)
        this.app.get('/api/risk/exposure', (req, res) => {
            const fundsStatus = this.fundsManager.getFundsStatus();
            res.json({
                success: true,
                data: {
                    bySymbol: {}, // Placeholder - en implementación real se calcularía por símbolo
                    byCategory: {}, // Placeholder - en implementación real se calcularía por categoría
                    limits: {
                        MAX_DAILY_DRAWDOWN: 0.10,
                        MAX_SYMBOL_EXPOSURE_PCT: 0.15,
                        MAX_CATEGORY_EXPOSURE_PCT: 0.35
                    },
                    currentDrawdown: fundsStatus.performanceMetrics.currentDrawdown,
                    totalBalance: fundsStatus.totalBalance
                },
                timestamp: Date.now()
            });
        });

        // ═════════════════════════════════════════════════════════════════
        // 🔮 ANÁLISIS LEONARDO CONSCIOUSNESS
        // ═════════════════════════════════════════════════════════════════

        this.app.post('/analyze', async (req, res) => {
            try {
                const startTime = Date.now();
                
                // Validar datos de entrada
                if (!this.validateAnalysisRequest(req.body)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Datos de análisis inválidos',
                        required: ['symbol', 'prices', 'timeframe']
                    });
                }

                const { symbol, prices, volumes, timeframe } = req.body;

                // Análisis Leonardo Consciousness completo
                const analysis = await this.decisionEngine.analyze({
                    symbol,
                    prices,
                    volumes,
                    timeframe
                });

                // Calcular posición óptima si el análisis es válido
                let positionRecommendation = null;
                if (analysis.confidence >= this.decisionEngine.constants.CONFIDENCE_THRESHOLD) {
                    positionRecommendation = this.fundsManager.calculatePositionSize(
                        {
                            symbol,
                            direction: analysis.direction,
                            confidence: analysis.confidence,
                            edge: analysis.edge,
                            leverage: analysis.leverage
                        },
                        analysis
                    );
                }

                // Actualizar estadísticas
                this.serverState.totalAnalyses++;
                this.serverState.lastUpdate = Date.now();

                const processingTime = Date.now() - startTime;

                res.json({
                    success: true,
                    analysis,
                    positionRecommendation,
                    metadata: {
                        processingTime,
                        analysisCount: this.serverState.totalAnalyses,
                        serverStatus: this.serverState.status
                    }
                });

            } catch (error) {
                console.error('❌ Error en análisis:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Error procesando análisis',
                    details: error.message
                });
            }
        });

        // ═════════════════════════════════════════════════════════════════
        // 💰 GESTIÓN DE POSICIONES
        // ═════════════════════════════════════════════════════════════════

        this.app.post('/position/open', async (req, res) => {
            try {
                const { symbol, direction, size, leverage, entryPrice, confidence, edge } = req.body;

                // Validar datos
                if (!symbol || !direction || !size || !leverage || !entryPrice) {
                    return res.status(400).json({
                        success: false,
                        error: 'Datos de posición incompletos'
                    });
                }

                // Calcular take profit y stop loss dinámicos primero
                const positionRecommendation = this.fundsManager.calculatePositionSize(
                    {
                        symbol,
                        direction,
                        confidence: confidence || 0.5,
                        edge: edge || 0.01,
                        leverage
                    },
                    {
                        consciousnessLevel: this.decisionEngine.leonardoState.consciousness_level,
                        confidence: confidence || 0.5,
                        edge: edge || 0.01,
                        pillarDetails: {
                            lambda888: { strength: 0.7 },
                            prime7919: { strength: 0.6 },
                            hookWheel: { strength: 0.8 },
                            symbiosis: { strength: 0.75 }
                        },
                        bigBangReady: this.decisionEngine.leonardoState.big_bang_ready
                    }
                );

                // Abrir posición con métricas dinámicas
                const result = await this.fundsManager.openPosition({
                    symbol,
                    direction,
                    size,
                    leverage,
                    entryPrice,
                    profitTarget: positionRecommendation.profitTarget || entryPrice * 1.025,  // Dinámico o fallback
                    stopLoss: positionRecommendation.stopLoss || entryPrice * 0.995,         // Dinámico o fallback
                    baitUsed: positionRecommendation.baitUsed || this.fundsManager.riskConfig.baitAmount,
                    kellyFraction: positionRecommendation.kellyFraction || 0.5,
                    confidence,
                    edge,
                    // Métricas Leonardo dinámicas
                    leonardoMetrics: positionRecommendation.leonardoDynamicMetrics
                });

                if (result.success) {
                    // Actualizar decision engine
                    this.decisionEngine.addActivePosition(result.positionId, result.position);
                    this.decisionEngine.updateAvailableFunds(this.fundsManager.availableBalance);
                    
                    // Actualizar estadísticas
                    this.serverState.totalTrades++;
                    
                    console.log(`📈 Posición abierta: ${result.positionId}`);
                }

                res.json(result);

            } catch (error) {
                console.error('❌ Error abriendo posición:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Error abriendo posición',
                    details: error.message
                });
            }
        });

        this.app.post('/position/close/:positionId', async (req, res) => {
            try {
                const { positionId } = req.params;
                const { closePrice, reason } = req.body;

                if (!closePrice) {
                    return res.status(400).json({
                        success: false,
                        error: 'Precio de cierre requerido'
                    });
                }

                // Cerrar posición
                const result = await this.fundsManager.closePosition(
                    positionId, 
                    closePrice, 
                    reason || 'MANUAL_CLOSE'
                );

                if (result.success) {
                    // Actualizar decision engine
                    this.decisionEngine.removeActivePosition(positionId);
                    this.decisionEngine.updateAvailableFunds(this.fundsManager.availableBalance);
                    
                    // Actualizar profit total
                    if (result.pnl > 0) {
                        this.serverState.totalProfit += result.pnl;
                    }
                    
                    console.log(`📉 Posición cerrada: ${positionId} | P&L: $${result.pnl.toFixed(2)}`);
                }

                res.json(result);

            } catch (error) {
                console.error('❌ Error cerrando posición:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Error cerrando posición',
                    details: error.message
                });
            }
        });

        // ═════════════════════════════════════════════════════════════════
        // 🌊 LEONARDO STREAMING ENDPOINT (Server-Sent Events)
        // ═════════════════════════════════════════════════════════════════

        // API stream endpoint (para compatibilidad con frontend)
        this.app.get('/api/stream', (req, res) => {
            console.log('🌊 Cliente conectado al stream API');
            this.handleStreamConnection(req, res);
        });

        this.app.get('/api/leonardo-stream', (req, res) => {
            this.handleStreamConnection(req, res);
        });

        // ═════════════════════════════════════════════════════════════════
        // 📊 DASHBOARD Y MÉTRICAS
        // ═════════════════════════════════════════════════════════════════

        this.app.get('/dashboard', (req, res) => {
            const leonardoState = this.decisionEngine.getLeonardoState();
            const fundsStatus = this.fundsManager.getFundsStatus();
            const quantumState = this.decisionEngine.getQuantumState();

            res.json({
                success: true,
                dashboard: {
                    // Estado general del servidor
                    server: {
                        ...this.serverState,
                        uptime: Date.now() - this.serverState.startTime,
                        realTimeMetrics: this.realTimeMetrics
                    },
                    
                    // Estado Leonardo Consciousness
                    leonardo: leonardoState,
                    
                    // Estado financiero
                    funds: fundsStatus,
                    
                    // Estado cuántico
                    quantum: quantumState,
                    
                    // Resumen de performance
                    performance: {
                        totalProfit: this.serverState.totalProfit,
                        totalTrades: this.serverState.totalTrades,
                        winRate: fundsStatus.performanceMetrics.winRate,
                        profitFactor: fundsStatus.performanceMetrics.profitFactor,
                        currentDrawdown: fundsStatus.performanceMetrics.currentDrawdown,
                        bigBangCount: leonardoState.leonardoBigBangs || 0
                    }
                },
                timestamp: Date.now()
            });
        });

        this.app.get('/positions', (req, res) => {
            const activePositions = this.fundsManager.getActivePositions();
            res.json({
                success: true,
                positions: activePositions,
                count: activePositions.length,
                totalMargin: activePositions.reduce((sum, pos) => sum + pos.marginRequired, 0)
            });
        });

        this.app.get('/history', (req, res) => {
            const limit = parseInt(req.query.limit) || 100;
            const balanceHistory = this.fundsManager.getBalanceHistory(limit);
            
            res.json({
                success: true,
                history: balanceHistory,
                count: balanceHistory.length
            });
        });

        // ═════════════════════════════════════════════════════════════════
        // 🤖 AUTO-TRADING (si está habilitado)
        // ═════════════════════════════════════════════════════════════════

        if (this.config.autoTrade) {
            this.app.post('/autotrade/start', (req, res) => {
                this.startAutoTrading();
                res.json({
                    success: true,
                    message: 'Auto-trading iniciado',
                    status: 'ACTIVE'
                });
            });

            this.app.post('/autotrade/stop', (req, res) => {
                this.stopAutoTrading();
                res.json({
                    success: true,
                    message: 'Auto-trading detenido',
                    status: 'STOPPED'
                });
            });
        }

        // ═════════════════════════════════════════════════════════════════
        // 🔧 UTILIDADES Y CONFIGURACIÓN
        // ═════════════════════════════════════════════════════════════════

        this.app.post('/funds/update', (req, res) => {
            const { newBalance, reason } = req.body;
            
            if (!newBalance || newBalance <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Balance inválido'
                });
            }

            this.fundsManager.updateBalance(newBalance, reason || 'MANUAL_UPDATE');
            this.decisionEngine.updateAvailableFunds(newBalance);

            res.json({
                success: true,
                newBalance: this.fundsManager.totalBalance,
                message: 'Balance actualizado'
            });
        });

        this.app.get('/config', (req, res) => {
            res.json({
                success: true,
                config: {
                    tradingMode: this.config.tradingMode,
                    autoTrade: this.config.autoTrade,
                    initialBalance: this.config.initialBalance,
                    constants: LeonardoConstants
                }
            });
        });

        console.log('🛣️ Rutas configuradas correctamente');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🤖 AUTO-TRADING SYSTEM
    // ═══════════════════════════════════════════════════════════════════════

    startAutoTrading() {
        if (this.autoTradingInterval) {
            console.log('⚠️ Auto-trading ya está en ejecución');
            return;
        }

        console.log('🤖 Iniciando auto-trading Leonardo Consciousness...');
        this.serverState.status = 'AUTO_TRADING';

        // Ejecutar análisis cada 30 segundos
        this.autoTradingInterval = setInterval(async () => {
            try {
                await this.executeAutoTradingCycle();
            } catch (error) {
                console.error('❌ Error en ciclo de auto-trading:', error.message);
            }
        }, 30000); // 30 segundos
    }

    stopAutoTrading() {
        if (this.autoTradingInterval) {
            clearInterval(this.autoTradingInterval);
            this.autoTradingInterval = null;
            this.serverState.status = 'IDLE';
            console.log('🛑 Auto-trading detenido');
        }
    }

    async executeAutoTradingCycle() {
        // En implementación real, obtener datos de mercado de API externa
        // Por ahora, generar datos simulados
        const mockMarketData = this.generateMockMarketData();
        const currentPrice = mockMarketData.prices[mockMarketData.prices.length - 1];
        
        // 1. PRIMERO: Verificar posiciones abiertas y triggers automáticos
        const closedPositions = await this.fundsManager.autoCloseTriggeredPositions(currentPrice);
        if (closedPositions.length > 0) {
            console.log(`🎯 Auto-cerradas ${closedPositions.length} posiciones por triggers:`);
            closedPositions.forEach(closed => {
                const pnlStatus = closed.pnl >= 0 ? '💰 PROFIT' : '📉 LOSS';
                console.log(`   ${closed.positionId}: ${pnlStatus} $${closed.pnl.toFixed(2)} (${closed.triggerReason})`);
                
                // Actualizar profit total del servidor
                if (closed.pnl > 0) {
                    this.serverState.totalProfit += closed.pnl;
                }
            });
        }
        
        // 2. SEGUNDO: Análisis Leonardo para nuevas oportunidades
        const analysis = await this.decisionEngine.analyze(mockMarketData);
        
        // 3. TERCERO: Si hay señal fuerte, abrir nueva posición
        if (analysis.confidence >= 0.8 && analysis.direction !== 'OBSERVE') {
            const positionRecommendation = this.fundsManager.calculatePositionSize(
                {
                    symbol: mockMarketData.symbol,
                    direction: analysis.direction,
                    confidence: analysis.confidence,
                    edge: analysis.edge,
                    leverage: analysis.leverage
                },
                analysis
            );

            if (positionRecommendation.success) {
                // Abrir posición con métricas dinámicas completas
                const position = await this.fundsManager.openPosition({
                    symbol: mockMarketData.symbol,
                    direction: analysis.direction,
                    size: positionRecommendation.size,
                    leverage: positionRecommendation.leverage,
                    entryPrice: currentPrice,
                    
                    // PRECIOS DINÁMICOS LEONARDO CONSCIOUSNESS
                    profitTarget: positionRecommendation.profitTarget,
                    stopLoss: positionRecommendation.stopLoss,
                    
                    // Métricas adicionales
                    baitUsed: positionRecommendation.baitUsed,
                    confidence: analysis.confidence,
                    edge: analysis.edge,
                    
                    // Datos dinámicos para logging
                    takeProfitPercent: positionRecommendation.takeProfitPercent,
                    stopLossPercent: positionRecommendation.stopLossPercent,
                    leonardoDynamicMetrics: positionRecommendation.leonardoDynamicMetrics
                });

                if (position.success) {
                    console.log(`🤖 Auto-trade ejecutado: ${position.positionId}`);
                    console.log(`   💎 Take Profit: $${position.position.profitTargetPrice?.toFixed(2)} | Stop Loss: $${position.position.stopLossPrice?.toFixed(2)}`);
                    console.log(`   📊 R/R: ${positionRecommendation.riskRewardRatio?.toFixed(2)} | Golden Ratio: ${positionRecommendation.leonardoDynamicMetrics?.goldenRatioAlignment}`);
                    
                    this.serverState.totalTrades++;
                    
                    // Actualizar decision engine
                    this.decisionEngine.addActivePosition(position.positionId, position.position);
                }
            } else {
                console.log(`⚠️ No se pudo abrir posición auto-trade: ${positionRecommendation.reason || 'Condiciones insuficientes'}`);
            }
        }

        // Logging del ciclo
        const activePositions = this.fundsManager.getActivePositions().length;
        console.log(`🤖 Ciclo auto-trading completado:`);
        console.log(`   🧠 Consciencia: ${(analysis.consciousnessLevel * 100).toFixed(1)}%`);
        console.log(`   🎯 Confianza: ${(analysis.confidence * 100).toFixed(1)}%`);
        console.log(`   📈 Posiciones activas: ${activePositions}`);
        console.log(`   💰 Balance total: $${this.fundsManager.totalBalance.toFixed(2)}`);
        
        // Big Bang detection
        if (analysis.bigBangReady) {
            console.log(`   💥 BIG BANG MODE ACTIVO!`);
            this.serverState.bigBangCount++;
        }
    }

    generateMockMarketData() {
        // Generar datos simulados para testing
        const basePrice = 50000;
        const prices = [];
        const volumes = [];
        
        for (let i = 0; i < 50; i++) {
            const randomChange = (this.calculateDeterministicValue('priceChange', Date.now() + i) - 0.5) * 0.02; // ±1% cambio
            const price = i === 0 ? basePrice : prices[i-1] * (1 + randomChange);
            const volume = this.calculateDeterministicValue('volume', Date.now() + i, 1000000, 500000);
            
            prices.push(price);
            volumes.push(volume);
        }

        return {
            symbol: 'BTC/USDT',
            timeframe: '1h',
            prices,
            volumes
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 📊 MONITOREO Y MÉTRICAS
    // ═══════════════════════════════════════════════════════════════════════

    setupMonitoring() {
        // Actualizar métricas cada 10 segundos
        setInterval(() => {
            this.updateSystemMetrics();
        }, 10000);

        console.log('📊 Sistema de monitoreo activado');
    }

    updateSystemMetrics() {
        // Calcular métricas del sistema
        const memoryUsage = process.memoryUsage();
        this.realTimeMetrics.systemLoad = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
        
        // Reset QPS counter
        this.realTimeMetrics.qps = 0;
    }

    updateMetrics(responseTime) {
        // Actualizar métricas de respuesta
        if (this.realTimeMetrics.avgResponseTime === 0) {
            this.realTimeMetrics.avgResponseTime = responseTime;
        } else {
            this.realTimeMetrics.avgResponseTime = 
                (this.realTimeMetrics.avgResponseTime + responseTime) / 2;
        }
        
        this.realTimeMetrics.qps++;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🌊 STREAM HANDLING
    // ═══════════════════════════════════════════════════════════════════════

    handleStreamConnection(req, res) {
        console.log('🌊 Cliente conectado al stream');

        // Configurar Server-Sent Events
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        });

        // Función para enviar datos
        const sendData = (eventType, data) => {
            try {
                res.write(`event: ${eventType}\n`);
                res.write(`data: ${JSON.stringify(data)}\n\n`);
            } catch (error) {
                console.error('❌ Error enviando datos stream:', error.message);
            }
        };

        // Envío inicial de estado
        const sendUpdate = () => {
            try {
                const leonardoState = this.decisionEngine.getLeonardoState();
                const fundsStatus = this.fundsManager.getFundsStatus();
                const quantumState = this.decisionEngine.getQuantumOracleState();
                const activePositions = this.fundsManager.getActivePositions();

                // Enviar métricas cuánticas
                sendData('quantum-metrics', {
                    consciousness: leonardoState.consciousness_level,
                    coherence: leonardoState.coherence_score,
                    decisions: this.serverState.totalTrades,
                    entropy: this.calculateDeterministicValue('entropy', Date.now(), 0.3),
                    energy: this.calculateDeterministicValue('energy', Date.now(), 0.8, 0.2),
                    resonance: this.calculateDeterministicValue('resonance', Date.now(), 0.7, 0.3),
                    bigBangReady: leonardoState.big_bang_ready
                });

                // Enviar oportunidades (simuladas)
                const opportunities = [];
                for (let i = 0; i < 5; i++) {
                    opportunities.push({
                        symbol: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT'][i],
                        edge: (this.calculateDeterministicValue('edge', Date.now() + i, 3, 1)).toFixed(1),
                        confidence: leonardoState.consciousness_level * this.calculateDeterministicValue('confidence', Date.now() + i),
                        direction: this.calculateDeterministicValue('direction', Date.now() + i) > 0.5 ? 'LONG' : 'SHORT'
                    });
                }
                sendData('opportunities', opportunities);

                // Estado del sistema
                sendData('system-status', {
                    uptime: Date.now() - this.serverState.startTime,
                    totalTrades: this.serverState.totalTrades,
                    totalProfit: this.serverState.totalProfit,
                    activePositions: activePositions.length,
                    balance: fundsStatus.totalBalance,
                    drawdown: fundsStatus.performanceMetrics.currentDrawdown,
                    winRate: fundsStatus.performanceMetrics.winRate,
                    consciousness: this.decisionEngine.leonardoState.consciousness_level,
                    coherence: this.decisionEngine.leonardoState.coherence_score
                });

                // Log del sistema
                sendData('system-log', {
                    message: `Leonardo análisis completado - Consciencia: ${(leonardoState.consciousness_level * 100).toFixed(1)}%`,
                    level: 'info',
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('❌ Error enviando datos stream:', error.message);
                sendData('error', {
                    message: 'Error interno del servidor',
                    timestamp: new Date().toISOString()
                });
            }
        };

        // Enviar actualización inicial
        sendUpdate();

        // Configurar intervalos de actualización
        const streamInterval = setInterval(sendUpdate, 3000); // Cada 3 segundos

        // Manejar desconexión del cliente
        req.on('close', () => {
            console.log('🚫 Cliente desconectado del stream');
            clearInterval(streamInterval);
        });

        req.on('error', (err) => {
            console.error('❌ Error en stream:', err.message);
            clearInterval(streamInterval);
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🔧 UTILIDADES
    // ═══════════════════════════════════════════════════════════════════════

    validateAnalysisRequest(body) {
        return body && 
               body.symbol && 
               Array.isArray(body.prices) && 
               body.prices.length >= 5;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🔢 DETERMINISTIC CALCULATIONS FOR SYSTEM ALIGNMENT
    // ═══════════════════════════════════════════════════════════════════════

    calculateDeterministicValue(type, timestamp, multiplier = 1, offset = 0) {
        // Generate deterministic values using hash-based calculations
        // This prevents system misalignment caused by Math.random()
        const hash = this.hashCode(timestamp.toString() + type);
        
        switch(type) {
            case 'entropy':
                return Math.abs(Math.sin(hash * 0.001)) * 0.3;
            case 'energy':
                return Math.abs(Math.sin(hash * 0.002)) * 0.8 + 0.2;
            case 'resonance':
                return Math.abs(Math.sin(hash * 0.003)) * 0.7 + 0.3;
            case 'edge':
                return Math.abs(Math.sin(hash * 0.004)) * multiplier + offset;
            case 'confidence':
                return Math.abs(Math.sin(hash * 0.005));
            case 'direction':
                return Math.abs(Math.sin(hash * 0.006));
            case 'priceChange':
                return Math.abs(Math.sin(hash * 0.007));
            case 'volume':
                return Math.abs(Math.sin(hash * 0.008)) * multiplier + offset;
            default:
                return Math.abs(Math.sin(hash * 0.001)) * multiplier + offset;
        }
    }

    hashCode(str) {
        // Simple hash function for deterministic values
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  INICIO DEL SERVIDOR
    // ═══════════════════════════════════════════════════════════════════════

    async start() {
        try {
            // Iniciar servidor Express
            this.server = this.app.listen(this.config.port, () => {
                console.log(`🌟 Unified Leonardo Server ejecutándose en puerto ${this.config.port}`);
                console.log(`🌐 Dashboard: http://localhost:${this.config.port}/dashboard`);
                console.log(`💚 Health check: http://localhost:${this.config.port}/health`);
            });

            this.serverState.status = 'RUNNING';

            // Iniciar auto-trading si está habilitado
            if (this.config.autoTrade) {
                setTimeout(() => {
                    this.startAutoTrading();
                }, 5000); // Esperar 5 segundos antes de iniciar
            }

            console.log('✅ Unified Leonardo Consciousness Server completamente operativo');
            
            return this.server;

        } catch (error) {
            console.error('❌ Error iniciando servidor:', error.message);
            throw error;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🛑 CIERRE ELEGANTE DEL SERVIDOR
    // ═══════════════════════════════════════════════════════════════════════

    async shutdown() {
        console.log('🛑 Iniciando cierre elegante del servidor...');
        this.serverState.status = 'SHUTTING_DOWN';

        try {
            // Detener auto-trading
            this.stopAutoTrading();

            // Cerrar todas las posiciones abiertas
            await this.fundsManager.closeAllPositions('SERVER_SHUTDOWN');

            // Destruir componentes
            if (this.decisionEngine) {
                this.decisionEngine.destroy();
            }
            if (this.fundsManager) {
                this.fundsManager.destroy();
            }

            // Cerrar servidor HTTP
            if (this.server) {
                await new Promise((resolve) => {
                    this.server.close(resolve);
                });
            }

            console.log('✅ Servidor cerrado elegantemente');

        } catch (error) {
            console.error('❌ Error durante cierre del servidor:', error.message);
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// 🚀 INICIALIZACIÓN AUTOMÁTICA SI SE EJECUTA DIRECTAMENTE
// ═══════════════════════════════════════════════════════════════════════

if (require.main === module) {
    const server = new UnifiedLeonardoServer({
        port: process.env.PORT || 3000,
        initialBalance: parseFloat(process.env.INITIAL_BALANCE) || 10000,
        tradingMode: process.env.TRADING_MODE || 'AGGRESSIVE',
        autoTrade: process.env.AUTO_TRADE === 'true'
    });

    // Manejar señales de cierre
    process.on('SIGINT', async () => {
        console.log('\n🛑 Recibida señal SIGINT');
        await server.shutdown();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('\n🛑 Recibida señal SIGTERM');
        await server.shutdown();
        process.exit(0);
    });

    // Iniciar servidor
    server.start().catch((error) => {
        console.error('💥 Error fatal iniciando servidor:', error);
        process.exit(1);
    });
}

module.exports = { UnifiedLeonardoServer };
