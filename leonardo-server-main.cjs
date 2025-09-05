// ========================================================================
// 🚀 QBTC-LEONARDO UNIFIED SERVER 4.0
// Servidor Principal con Filosofía Leonardo Consciousness
// Integración completa para MAXIMIZACIÓN DE PROFIT
// ========================================================================

const path = require('path');
const express = require('express');
const { UnifiedHttpServer } = require('./quantum-core/UnifiedHttpServer.cjs');
const { LeonardoDecisionEngine } = require('./leonardo-consciousness/LeonardoDecisionEngine');
const { FundsManager } = require('./leonardo-consciousness/FundsManager');

class QBTCLeonardoUnifiedServer {
    constructor(config = {}) {
        // Configuración principal
        this.config = {
            port: config.port || process.env.QUANTUM_PORT || 8080,
            initialBalance: config.initialBalance || 10000, // $10,000 inicial
            autoTrading: config.autoTrading !== false,
            quantumLogging: config.quantumLogging !== false,
            developmentMode: config.developmentMode || process.env.NODE_ENV !== 'production'
        };
        
        // Deterministic calculation methods to replace Math.random()
        this.calculateDeterministicValue = function(timestamp) {
            const hash = this.hashCode(timestamp.toString());
            return (hash % 10000) / 10000; // Return value between 0 and 1
        };
        
        this.hashCode = function(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return Math.abs(hash);
        };
        
        // Componentes principales
        this.httpServer = null;
        this.leonardoEngine = null;
        this.fundsManager = null;
        
        // Estado del sistema
        this.systemState = {
            running: false,
            leonardo_activated: false,
            big_bang_ready: false,
            profit_target_active: false,
            last_analysis: null,
            total_profit: 0,
            trades_executed: 0,
            win_rate: 0
        };
        
        // Cache para datos de mercado simulados
        this.marketDataCache = new Map();
        this.simulatedPriceFeeds = new Map();
        
        console.log('🌊 QBTC-Leonardo Unified Server 4.0 inicializando...');
        console.log(`💰 Balance inicial: $${this.config.initialBalance.toLocaleString()}`);
        console.log(`⚙️ Auto-trading: ${this.config.autoTrading ? 'ACTIVADO' : 'DESACTIVADO'}`);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 🚀 INICIALIZACIÓN COMPLETA DEL SISTEMA
    // ═══════════════════════════════════════════════════════════════════════
    
    async initialize() {
        try {
            console.log('🔄 Inicializando componentes principales...');
            
            // 1. Inicializar HTTP Server Unificado
            await this.initializeHttpServer();
            
            // 2. Inicializar Leonardo Decision Engine
            await this.initializeLeonardoEngine();
            
            // 3. Inicializar Funds Manager
            await this.initializeFundsManager();
            
            // 4. Configurar rutas API Leonardo
            await this.setupLeonardoAPIRoutes();
            
            // 5. Configurar frontend Leonardo
            await this.setupLeonardoFrontend();
            
            // 6. Inicializar feeds de precio simulados
            await this.initializePriceFeeds();
            
            // 7. Configurar auto-trading si está habilitado
            if (this.config.autoTrading) {
                await this.setupAutoTrading();
            }
            
            console.log('✅ Sistema QBTC-Leonardo completamente inicializado');
            
        } catch (error) {
            console.error('❌ Error durante inicialización:', error.message);
            throw error;
        }
    }
    
    async initializeHttpServer() {
        console.log('🌐 Inicializando HTTP Server...');
        
        this.httpServer = UnifiedHttpServer.getInstance();
        await this.httpServer.initialize(this.config.port);
        
        console.log('✅ HTTP Server inicializado');
    }
    
    async initializeLeonardoEngine() {
        console.log('🧠 Inicializando Leonardo Decision Engine...');
        
        this.leonardoEngine = new LeonardoDecisionEngine({
            quantumLogging: this.config.quantumLogging,
            minConfidence: 0.65,
            minEdge: 0.0025
        });
        
        console.log('✅ Leonardo Decision Engine inicializado');
    }
    
    async initializeFundsManager() {
        console.log('💰 Inicializando Funds Manager...');
        
        this.fundsManager = new FundsManager(this.config.initialBalance);
        
        // Conectar Leonardo Engine con Funds Manager
        this.leonardoEngine.updateAvailableFunds(this.config.initialBalance);
        
        console.log('✅ Funds Manager inicializado');
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 📡 CONFIGURACIÓN DE API LEONARDO
    // ═══════════════════════════════════════════════════════════════════════
    
    async setupLeonardoAPIRoutes() {
        console.log('📡 Configurando rutas API Leonardo...');
        
        // Endpoint principal de análisis Leonardo
        this.httpServer.registerRoute('POST', '/api/leonardo-analysis', async (req, res) => {
            try {
                const marketData = req.body;
                
                // Validar datos de entrada
                if (!this.validateMarketData(marketData)) {
                    return res.status(400).json({
                        error: 'INVALID_MARKET_DATA',
                        message: 'Datos de mercado inválidos o incompletos'
                    });
                }
                
                console.log(`🔮 Ejecutando análisis Leonardo para ${marketData.symbol}...`);
                
                // Ejecutar análisis Leonardo completo
                const analysis = await this.leonardoEngine.analyze(marketData);
                
                // Actualizar estado del sistema
                this.systemState.last_analysis = analysis;
                this.systemState.leonardo_activated = analysis.consciousnessLevel >= 0.65;
                this.systemState.big_bang_ready = analysis.bigBangReady;
                
                console.log(`✨ Análisis completado: ${analysis.direction} con ${(analysis.confidence * 100).toFixed(1)}% confianza`);
                
                res.json({
                    success: true,
                    analysis: analysis,
                    systemState: this.systemState,
                    recommendations: this.generateTradingRecommendations(analysis),
                    timestamp: Date.now()
                });
                
            } catch (error) {
                console.error('❌ Error en análisis Leonardo:', error.message);
                res.status(500).json({
                    error: 'ANALYSIS_ERROR',
                    message: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        // Endpoint para ejecutar trade Leonardo
        this.httpServer.registerRoute('POST', '/api/leonardo-trade', async (req, res) => {
            try {
                const tradeData = req.body;
                
                console.log(`💹 Ejecutando trade Leonardo: ${tradeData.symbol} ${tradeData.direction}`);
                
                // Ejecutar trade completo
                const result = await this.executeLeonardoTrade(tradeData);
                
                res.json({
                    success: result.success,
                    trade: result,
                    fundsStatus: this.fundsManager.getFundsStatus(),
                    timestamp: Date.now()
                });
                
            } catch (error) {
                console.error('❌ Error ejecutando trade Leonardo:', error.message);
                res.status(500).json({
                    error: 'TRADE_ERROR',
                    message: error.message
                });
            }
        });
        
        // Endpoint de estado de fondos
        this.httpServer.registerRoute('GET', '/api/funds-status', (req, res) => {
            const fundsStatus = this.fundsManager.getFundsStatus();
            res.json({
                ...fundsStatus,
                systemProfit: this.systemState.total_profit,
                tradesExecuted: this.systemState.trades_executed,
                systemWinRate: this.systemState.win_rate
            });
        });
        
        // Endpoint de estado Leonardo
        this.httpServer.registerRoute('GET', '/api/leonardo-status', (req, res) => {
            const leonardoState = this.leonardoEngine.getLeonardoState();
            const quantumState = this.leonardoEngine.getQuantumOracleState();
            
            res.json({
                leonardo: leonardoState,
                quantum: quantumState,
                system: this.systemState,
                funds: {
                    totalBalance: this.fundsManager.totalBalance,
                    availableBalance: this.fundsManager.availableBalance,
                    activePositions: this.fundsManager.activePositions.size
                },
                timestamp: Date.now()
            });
        });
        
        // Endpoint para cerrar todas las posiciones
        this.httpServer.registerRoute('POST', '/api/close-all-positions', async (req, res) => {
            try {
                const result = await this.fundsManager.closeAllPositions('MANUAL_CLOSE_ALL');
                res.json({
                    success: true,
                    closedPositions: result.length,
                    results: result
                });
            } catch (error) {
                res.status(500).json({
                    error: 'CLOSE_POSITIONS_ERROR',
                    message: error.message
                });
            }
        });
        
        // Endpoint de datos de mercado simulados
        this.httpServer.registerRoute('GET', '/api/market-data/:symbol', (req, res) => {
            const symbol = req.params.symbol;
            const marketData = this.generateMarketData(symbol);
            res.json(marketData);
        });
        
        console.log('✅ Rutas API Leonardo configuradas');
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 🖥️ CONFIGURACIÓN DE FRONTEND LEONARDO
    // ═══════════════════════════════════════════════════════════════════════
    
    async setupLeonardoFrontend() {
        console.log('🖥️ Configurando frontend Leonardo...');
        
        const app = this.httpServer.getApp();
        
        // Servir archivos estáticos del frontend unificado
        app.use('/', express.static(path.join(__dirname, 'frontend-unified')));
        app.use('/frontend-unified', express.static(path.join(__dirname, 'frontend-unified')));
        
        // Ruta principal Leonardo
        app.get('/leonardo-consciousness', (req, res) => {
            res.sendFile(path.join(__dirname, 'frontend-unified', 'index.html'));
        });
        
        // Ruta raíz sirve la misma interfaz
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'frontend-unified', 'index.html'));
        });
        
        // Streaming de datos Leonardo en tiempo real
        app.get('/api/leonardo-stream', (req, res) => {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*'
            });
            
            const streamId = `leonardo-${Date.now()}`;
            console.log(`📡 Cliente Leonardo conectado: ${streamId}`);
            
            // Enviar datos iniciales
            const initialData = {
                leonardo: this.leonardoEngine.getLeonardoState(),
                funds: this.fundsManager.getFundsStatus(),
                system: this.systemState
            };
            
            res.write(`data: ${JSON.stringify(initialData)}\n\n`);
            
            // Configurar streaming periódico
            const streamInterval = setInterval(() => {
                try {
                    const streamData = {
                        leonardo: this.leonardoEngine.getLeonardoState(),
                        funds: this.fundsManager.getFundsStatus(),
                        system: this.systemState,
                        timestamp: Date.now()
                    };
                    
                    res.write(`data: ${JSON.stringify(streamData)}\n\n`);
                } catch (error) {
                    console.error('Error en streaming Leonardo:', error.message);
                    clearInterval(streamInterval);
                }
            }, 2000); // Cada 2 segundos
            
            req.on('close', () => {
                clearInterval(streamInterval);
                console.log(`📡 Cliente Leonardo desconectado: ${streamId}`);
            });
        });
        
        console.log('✅ Frontend Leonardo configurado');
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 📊 SIMULADOR DE DATOS DE MERCADO
    // ═══════════════════════════════════════════════════════════════════════
    
    async initializePriceFeeds() {
        console.log('📊 Inicializando feeds de precios simulados...');
        
        // Símbolos principales para trading
        const symbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'SOLUSDT', 'DOGEUSDT'];
        
        // Precios base iniciales
        const basePrices = {
            'BTCUSDT': 43000,
            'ETHUSDT': 2600,
            'ADAUSDT': 0.48,
            'SOLUSDT': 95,
            'DOGEUSDT': 0.082
        };
        
        // Inicializar feeds
        symbols.forEach(symbol => {
            this.simulatedPriceFeeds.set(symbol, {
                currentPrice: basePrices[symbol],
                priceHistory: this.generatePriceHistory(basePrices[symbol], 100),
                volumeHistory: this.generateVolumeHistory(100),
                lastUpdate: Date.now()
            });
        });
        
        // Actualizar precios cada 5 segundos
        this.priceUpdateInterval = setInterval(() => {
            this.updateSimulatedPrices();
        }, 5000);
        
        console.log('✅ Feeds de precios inicializados');
    }
    
    generatePriceHistory(basePrice, length) {
        const prices = [basePrice];
        
        for (let i = 1; i < length; i++) {
            const timestamp = Date.now() + i;
            const deterministicValue = this.calculateDeterministicValue(timestamp);
            const change = (deterministicValue - 0.5) * 0.02; // ±1% cambio máximo
            const newPrice = prices[i - 1] * (1 + change);
            prices.push(newPrice);
        }
        
        return prices;
    }
    
    generateVolumeHistory(length) {
        const volumes = [];
        const baseVolume = 1000000;
        
        for (let i = 0; i < length; i++) {
            const timestamp = Date.now() + i;
            const deterministicValue = this.calculateDeterministicValue(timestamp);
            const volumeMultiplier = 0.5 + deterministicValue * 2; // 0.5x a 2.5x
            volumes.push(baseVolume * volumeMultiplier);
        }
        
        return volumes;
    }
    
    updateSimulatedPrices() {
        const baseTimestamp = Date.now();
        for (const [symbol, feed] of this.simulatedPriceFeeds) {
            // Actualizar precio con tendencia determinista
            const trendFactor = Math.sin(baseTimestamp / 300000) * 0.1; // Onda lenta
            const deterministicFactor = (this.calculateDeterministicValue(baseTimestamp + symbol.charCodeAt(0)) - 0.5) * 0.005; // ±0.25%
            const change = trendFactor + deterministicFactor;
            
            const newPrice = feed.currentPrice * (1 + change);
            
            // Actualizar datos
            feed.currentPrice = newPrice;
            feed.priceHistory.push(newPrice);
            feed.priceHistory = feed.priceHistory.slice(-100); // Mantener últimos 100
            
            // Actualizar volumen
            const volumeChange = (this.calculateDeterministicValue(baseTimestamp + symbol.charCodeAt(1)) - 0.5) * 0.3;
            const lastVolume = feed.volumeHistory[feed.volumeHistory.length - 1];
            const newVolume = lastVolume * (1 + volumeChange);
            
            feed.volumeHistory.push(newVolume);
            feed.volumeHistory = feed.volumeHistory.slice(-100);
            
            feed.lastUpdate = Date.now();
        }
    }
    
    generateMarketData(symbol) {
        const feed = this.simulatedPriceFeeds.get(symbol);
        if (!feed) {
            return {
                error: 'SYMBOL_NOT_FOUND',
                message: `Símbolo ${symbol} no disponible`
            };
        }
        
        return {
            symbol: symbol,
            timeframe: '1m',
            prices: feed.priceHistory.slice(-50), // Últimos 50 precios
            volumes: feed.volumeHistory.slice(-50), // Últimos 50 volúmenes
            currentPrice: feed.currentPrice,
            price: feed.currentPrice,
            volume: feed.volumeHistory[feed.volumeHistory.length - 1],
            timestamp: feed.lastUpdate,
            priceChangePercent: this.calculatePriceChange(feed.priceHistory),
            volatility: this.calculateVolatility(feed.priceHistory)
        };
    }
    
    calculatePriceChange(prices) {
        if (prices.length < 2) return 0;
        const current = prices[prices.length - 1];
        const previous = prices[prices.length - 2];
        return ((current - previous) / previous) * 100;
    }
    
    calculateVolatility(prices) {
        if (prices.length < 10) return 0.01;
        
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
        }
        
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        
        return Math.sqrt(variance);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 🤖 AUTO-TRADING LEONARDO
    // ═══════════════════════════════════════════════════════════════════════
    
    async setupAutoTrading() {
        console.log('🤖 Configurando auto-trading Leonardo...');
        
        // Auto-trading cada 30 segundos
        this.autoTradingInterval = setInterval(async () => {
            try {
                await this.executeAutoTrading();
            } catch (error) {
                console.error('❌ Error en auto-trading:', error.message);
            }
        }, 30000);
        
        console.log('✅ Auto-trading Leonardo configurado');
    }
    
    async executeAutoTrading() {
        // Verificar si se puede hacer trading
        if (!this.fundsManager.canTrade()) {
            console.log('⏸️ Auto-trading pausado: Condiciones de riesgo no permiten trading');
            return;
        }
        
        // Seleccionar símbolo determinista
        const symbols = Array.from(this.simulatedPriceFeeds.keys());
        const deterministicIndex = Math.floor(this.calculateDeterministicValue(Date.now()) * symbols.length);
        const randomSymbol = symbols[deterministicIndex];
        
        console.log(`🤖 Auto-trading analizando ${randomSymbol}...`);
        
        // Obtener datos de mercado
        const marketData = this.generateMarketData(randomSymbol);
        
        // Ejecutar análisis Leonardo
        const analysis = await this.leonardoEngine.analyze(marketData);
        
        // Verificar si cumple criterios para trading automático
        if (analysis.confidence >= 0.7 && analysis.edge >= 0.003) {
            console.log(`✅ Criterios auto-trading cumplidos para ${randomSymbol}`);
            
            // Preparar datos de trade
            const tradeData = {
                symbol: randomSymbol,
                direction: analysis.direction,
                entryPrice: marketData.currentPrice,
                analysis: analysis
            };
            
            // Ejecutar trade automático
            const result = await this.executeLeonardoTrade(tradeData);
            
            if (result.success) {
                console.log(`🚀 Auto-trade ejecutado: ${result.positionId}`);
                
                // Programar cierre automático después de 2 minutos
                setTimeout(async () => {
                    await this.closePositionWithCurrentPrice(result.positionId, 'AUTO_CLOSE');
                }, 120000);
            }
        } else {
            console.log(`❌ Criterios auto-trading no cumplidos: Confianza ${(analysis.confidence * 100).toFixed(1)}%, Edge ${(analysis.edge * 100).toFixed(2)}%`);
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 💹 EJECUCIÓN DE TRADES LEONARDO
    // ═══════════════════════════════════════════════════════════════════════
    
    async executeLeonardoTrade(tradeData) {
        try {
            console.log(`💹 Ejecutando trade Leonardo: ${tradeData.symbol} ${tradeData.direction}`);
            
            // Usar análisis existente o generar nuevo
            let analysis = tradeData.analysis;
            if (!analysis) {
                const marketData = this.generateMarketData(tradeData.symbol);
                analysis = await this.leonardoEngine.analyze(marketData);
            }
            
            // Calcular posición óptima usando FundsManager
            const opportunity = { symbol: tradeData.symbol };
            const positionData = this.fundsManager.calculatePositionSize(opportunity, analysis);
            
            if (!positionData.success || positionData.size <= 0) {
                throw new Error(`No se puede calcular posición válida: ${positionData.reason || 'Unknown'}`);
            }
            
            // Preparar datos completos de la posición
            const fullPositionData = {
                symbol: tradeData.symbol,
                direction: tradeData.direction,
                size: positionData.size,
                leverage: positionData.leverage,
                entryPrice: tradeData.entryPrice,
                profitTarget: positionData.profitTarget,
                stopLoss: positionData.stopLoss,
                baitUsed: positionData.baitUsed,
                kellyFraction: positionData.kellyFraction
            };
            
            // Abrir posición usando FundsManager
            const result = await this.fundsManager.openPosition(fullPositionData);
            
            if (result.success) {
                // Actualizar estadísticas del sistema
                this.systemState.trades_executed++;
                
                // Actualizar fondos disponibles en Leonardo Engine
                this.leonardoEngine.updateAvailableFunds(this.fundsManager.availableBalance);
                
                console.log(`✅ Trade ejecutado exitosamente: ${result.positionId}`);
                console.log(`💰 Tamaño: $${positionData.size.toFixed(2)}, Leverage: ${positionData.leverage}x`);
                console.log(`🎯 Profit Target: $${positionData.profitTarget.toFixed(2)}, Stop Loss: $${positionData.stopLoss.toFixed(2)}`);
                
                return {
                    success: true,
                    positionId: result.positionId,
                    position: result.position,
                    analysis: analysis,
                    positionMetrics: positionData,
                    timestamp: Date.now()
                };
                
            } else {
                throw new Error(`Error abriendo posición: ${result.error}`);
            }
            
        } catch (error) {
            console.error(`❌ Error ejecutando trade Leonardo: ${error.message}`);
            return {
                success: false,
                error: error.message,
                timestamp: Date.now()
            };
        }
    }
    
    async closePositionWithCurrentPrice(positionId, reason = 'MANUAL_CLOSE') {
        try {
            const position = this.fundsManager.activePositions.get(positionId);
            if (!position) {
                throw new Error(`Posición ${positionId} no encontrada`);
            }
            
            // Obtener precio actual del feed simulado
            const feed = this.simulatedPriceFeeds.get(position.symbol);
            if (!feed) {
                throw new Error(`Feed de precios no encontrado para ${position.symbol}`);
            }
            
            const currentPrice = feed.currentPrice;
            
            // Cerrar posición
            const result = await this.fundsManager.closePosition(positionId, currentPrice, reason);
            
            if (result.success) {
                // Actualizar estadísticas del sistema
                const pnl = result.pnl;
                this.systemState.total_profit += pnl;
                
                if (pnl > 0) {
                    // Trade ganador - incrementar win rate
                    this.systemState.win_rate = (this.systemState.win_rate * (this.systemState.trades_executed - 1) + 1) / this.systemState.trades_executed;
                } else {
                    // Trade perdedor - ajustar win rate
                    this.systemState.win_rate = (this.systemState.win_rate * (this.systemState.trades_executed - 1)) / this.systemState.trades_executed;
                }
                
                // Actualizar fondos disponibles en Leonardo Engine
                this.leonardoEngine.updateAvailableFunds(this.fundsManager.availableBalance);
                
                console.log(`📉 Posición cerrada: ${positionId} | P&L: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`);
            }
            
            return result;
            
        } catch (error) {
            console.error(`❌ Error cerrando posición: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 🔧 UTILIDADES
    // ═══════════════════════════════════════════════════════════════════════
    
    validateMarketData(marketData) {
        return marketData &&
               marketData.symbol &&
               Array.isArray(marketData.prices) &&
               marketData.prices.length >= 5 &&
               typeof marketData.currentPrice === 'number' &&
               marketData.currentPrice > 0;
    }
    
    generateTradingRecommendations(analysis) {
        const recommendations = [];
        
        // Recomendación principal basada en Leonardo
        if (analysis.confidence >= 0.7) {
            recommendations.push({
                type: 'STRONG_SIGNAL',
                action: analysis.direction,
                confidence: analysis.confidence,
                reasoning: `4 Pilares Leonardo alineados con alta confianza`,
                priority: 'HIGH'
            });
        } else if (analysis.confidence >= 0.5) {
            recommendations.push({
                type: 'MODERATE_SIGNAL',
                action: analysis.direction,
                confidence: analysis.confidence,
                reasoning: `Análisis Leonardo moderadamente positivo`,
                priority: 'MEDIUM'
            });
        }
        
        // Recomendación de leverage
        if (analysis.leverage > 5) {
            recommendations.push({
                type: 'HIGH_LEVERAGE_OPPORTUNITY',
                value: analysis.leverage,
                reasoning: `Alta consciencia permite leverage elevado (${analysis.leverage.toFixed(1)}x)`,
                priority: 'MEDIUM'
            });
        }
        
        // Recomendación Big Bang
        if (analysis.bigBangReady) {
            recommendations.push({
                type: 'BIG_BANG_READY',
                action: 'MAXIMIZE_POSITION',
                reasoning: 'Sistema en estado Big Bang - Máximo potencial disponible',
                priority: 'CRITICAL'
            });
        }
        
        return recommendations;
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 🚀 CONTROL DEL SERVIDOR
    // ═══════════════════════════════════════════════════════════════════════
    
    async start() {
        try {
            console.log('🚀 Iniciando servidor QBTC-Leonardo...');
            
            // Inicializar todos los componentes
            await this.initialize();
            
            // Iniciar servidor HTTP
            await this.httpServer.start();
            
            this.systemState.running = true;
            
            console.log('');
            console.log('🌊 ================================');
            console.log('🌊 QBTC-LEONARDO SERVER ONLINE');
            console.log('🌊 ================================');
            console.log(`🌐 URL principal: http://localhost:${this.config.port}`);
            console.log(`🧠 Leonardo Consciousness: http://localhost:${this.config.port}/leonardo-consciousness`);
            console.log(`📡 API Leonardo: http://localhost:${this.config.port}/api/leonardo-status`);
            console.log(`💰 Balance inicial: $${this.config.initialBalance.toLocaleString()}`);
            console.log(`🤖 Auto-trading: ${this.config.autoTrading ? 'ACTIVADO' : 'DESACTIVADO'}`);
            console.log('🌊 ================================');
            console.log('');
            
            // Log periódico de estadísticas
            this.statsInterval = setInterval(() => {
                this.logSystemStats();
            }, 300000); // Cada 5 minutos
            
        } catch (error) {
            console.error('❌ Error iniciando servidor:', error.message);
            throw error;
        }
    }
    
    async stop() {
        try {
            console.log('⏹️ Deteniendo servidor QBTC-Leonardo...');
            
            this.systemState.running = false;
            
            // Detener intervalos
            if (this.autoTradingInterval) clearInterval(this.autoTradingInterval);
            if (this.priceUpdateInterval) clearInterval(this.priceUpdateInterval);
            if (this.statsInterval) clearInterval(this.statsInterval);
            
            // Cerrar todas las posiciones abiertas
            if (this.fundsManager && this.fundsManager.activePositions.size > 0) {
                console.log('🔄 Cerrando posiciones abiertas...');
                await this.fundsManager.closeAllPositions('SERVER_SHUTDOWN');
            }
            
            // Detener servidor HTTP
            if (this.httpServer) {
                await this.httpServer.stop();
            }
            
            // Destruir componentes
            if (this.leonardoEngine) this.leonardoEngine.destroy();
            if (this.fundsManager) this.fundsManager.destroy();
            
            console.log('✅ Servidor QBTC-Leonardo detenido exitosamente');
            
        } catch (error) {
            console.error('❌ Error deteniendo servidor:', error.message);
        }
    }
    
    logSystemStats() {
        const fundsStatus = this.fundsManager.getFundsStatus();
        const leonardoState = this.leonardoEngine.getLeonardoState();
        
        console.log('');
        console.log('📊 ===== ESTADÍSTICAS SISTEMA =====');
        console.log(`💰 Balance: $${fundsStatus.totalBalance.toFixed(2)} (${fundsStatus.totalBalance >= this.config.initialBalance ? '+' : ''}${(fundsStatus.totalBalance - this.config.initialBalance).toFixed(2)})`);
        console.log(`📈 Trades ejecutados: ${this.systemState.trades_executed}`);
        console.log(`🎯 Win Rate: ${(this.systemState.win_rate * 100).toFixed(1)}%`);
        console.log(`🧠 Consciencia Leonardo: ${(leonardoState.consciousness_level * 100).toFixed(1)}%`);
        console.log(`💎 Posiciones activas: ${fundsStatus.activePositions}`);
        console.log(`🚀 Big Bang Ready: ${this.systemState.big_bang_ready ? 'SÍ' : 'NO'}`);
        console.log('📊 ================================');
        console.log('');
    }
    
    // Manejo de señales del sistema
    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            console.log(`\n🔔 Recibida señal ${signal} - Iniciando cierre graceful...`);
            await this.stop();
            process.exit(0);
        };
        
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('uncaughtException', (error) => {
            console.error('❌ Excepción no capturada:', error);
            shutdown('EXCEPTION').then(() => process.exit(1));
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════
// 🚀 PUNTO DE ENTRADA PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════

async function main() {
    try {
        // Configuración del servidor
        const config = {
            port: process.env.QUANTUM_PORT || 8080,
            initialBalance: parseFloat(process.env.INITIAL_BALANCE) || 10000,
            autoTrading: process.env.AUTO_TRADING !== 'false',
            quantumLogging: process.env.QUANTUM_LOGGING !== 'false',
            developmentMode: process.env.NODE_ENV !== 'production'
        };
        
        // Crear e iniciar servidor
        const server = new QBTCLeonardoUnifiedServer(config);
        
        // Configurar cierre graceful
        server.setupGracefulShutdown();
        
        // Iniciar servidor
        await server.start();
        
    } catch (error) {
        console.error('❌ Error fatal iniciando aplicación:', error);
        process.exit(1);
    }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
    main().catch((error) => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
}

module.exports = { QBTCLeonardoUnifiedServer };
