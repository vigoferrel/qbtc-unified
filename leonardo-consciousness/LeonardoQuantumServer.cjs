#!/usr/bin/env node
/**
 * ========================================================================
 * 🎨 LEONARDO CONSCIOUSNESS QUANTUM SERVER
 * ========================================================================
 * 
 * Servidor principal que integra todo el ecosistema Leonardo:
 * - QuantumUnifiedSystem (sistema unificado completo)
 * - FundsManager (gestión de riesgos y trading)
 * - QuantumInfiniteCache (cache cuántico optimizado)
 * - QuantumOracleHypersphere (predicciones hiperdimensionales)
 * 
 * "Obstacles cannot crush me; every obstacle yields to stern resolve"
 * - Leonardo da Vinci
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { EventEmitter } = require('events');
const { QuantumUnifiedSystem } = require('./QuantumUnifiedSystem.cjs');
const path = require('path');

class LeonardoQuantumServer extends EventEmitter {
    constructor() {
        super();
        
        this.config = {
            host: process.env.LEONARDO_HOST || '0.0.0.0',
            port: parseInt(process.env.LEONARDO_PORT) || 3004,
            enableCors: process.env.ENABLE_CORS !== 'false',
            enableWebInterface: process.env.ENABLE_WEB_INTERFACE !== 'false',
            enableAPI: process.env.ENABLE_API !== 'false',
            enableHealthCheck: process.env.ENABLE_MONITORING !== 'false',
            tradingMode: process.env.TRADING_MODE || 'PRODUCTION',
            autoStart: process.env.AUTO_START_TRADING === 'true'
        };
        
        this.app = express();
        this.server = null;
        
        // Inicializar sistema cuántico unificado
        this.quantumSystem = new QuantumUnifiedSystem({
            tradingMode: this.config.tradingMode
        });
        
        // Config de riesgo fallback cuando TradingEngine aún no existe
        this.riskConfig = {
            MAX_DAILY_DRAWDOWN: 0.10,
            MAX_SYMBOL_EXPOSURE_PCT: 0.15,
            MAX_CATEGORY_EXPOSURE_PCT: 0.35,
            MAX_CONCURRENT_TRADES: 3
        };

        this.isInitialized = false;
        this.clients = new Set(); // Para SSE
        
        console.log('🎨 Leonardo Consciousness Quantum Server v2.0');
        console.log(`📡 Puerto: ${this.config.port}`);
        console.log(`💱 Modo Trading: ${this.config.tradingMode}`);
    }
    
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        
        console.log('🚀 Inicializando Leonardo Quantum Server...');
        
        try {
            // Configurar Express
            this.setupExpress();
            
            // Configurar rutas
            this.setupRoutes();
            
            // Inicializar sistema cuántico
            await this.quantumSystem.initialize();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            
            console.log('✅ Leonardo Quantum Server inicializado completamente');
            
        } catch (error) {
            console.error('❌ Error inicializando servidor:', error);
            throw error;
        }
    }
    
    /**
     * Obtener estado de salud del sistema
     */
    getHealth() {
        return {
            status: this.isInitialized ? 'HEALTHY' : 'NOT_INITIALIZED',
            isInitialized: this.isInitialized,
            serverRunning: this.server ? true : false,
            consciousness: this.quantumSystem?.systemState?.globalConsciousness || 0,
            lastUpdate: Date.now()
        };
    }
    
    setupExpress() {
        // Configurar middlewares
        if (this.config.enableCors) {
            this.app.use(cors({
                origin: '*',
                credentials: true,
                optionsSuccessStatus: 200
            }));
        }
        
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        
        // Servir archivos estáticos
        if (this.config.enableWebInterface) {
            this.app.use(express.static(path.join(__dirname, '../public')));
        }
        
        // Logging middleware
        this.app.use((req, res, next) => {
            if (req.path !== '/api/health' && req.path !== '/metrics') {
                console.log(`🌐 ${req.method} ${req.path} - ${req.ip}`);
            }
            next();
        });
    }
    
    setupRoutes() {
        // ═══════════════════════════════════════════════════════════════════
        // 🏠 RUTAS PRINCIPALES
        // ═══════════════════════════════════════════════════════════════════
        
        this.app.get('/', (req, res) => {
            res.json({
                name: 'Leonardo Consciousness Quantum Engine',
                version: '2.0.0',
                status: 'ACTIVE',
                consciousness: this.quantumSystem.systemState.globalConsciousness,
                quote: '"Obstacles cannot crush me; every obstacle yields to stern resolve" - Leonardo da Vinci',
                endpoints: {
                    metrics: '/api/metrics',
                    predictions: '/api/predictions',
                    opportunities: '/api/opportunities',
                    trading: '/api/trading',
                    health: '/api/health',
                    stream: '/api/stream'
                }
            });
        });
        
        // ═══════════════════════════════════════════════════════════════════
        // 📊 RUTAS DE MÉTRICAS Y ESTADO
        // ═══════════════════════════════════════════════════════════════════
        
        this.app.get('/api/metrics', (req, res) => {
            try {
                const metrics = this.quantumSystem.getUnifiedMetrics();
                // Adjuntar métricas de riesgo si existen
                const risk = this.quantumSystem.tradingEngine?.riskState || {};
                const engineMetrics = this.quantumSystem.tradingEngine?.metrics || {};
                res.json({
                    success: true,
                    data: { ...metrics, risk, engineMetrics },
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Régimen de mercado actual (si está disponible)
        this.app.get('/api/market-regime', (req, res) => {
            try {
                const detector = this.quantumSystem?.systemIntegrator?.components?.marketRegimeDetector
                    || this.quantumSystem?.marketRegimeDetector
                    || null;
                if (!detector || typeof detector.getStatus !== 'function') {
                    return res.json({ success: false, error: 'MarketRegimeDetector not available' });
                }
                const status = detector.getStatus();
                res.json({ success: true, data: status, timestamp: Date.now() });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Exposición actual
        this.app.get('/api/risk/exposure', (req, res) => {
            try {
                const engine = this.quantumSystem.tradingEngine;
                const exposure = engine ? {
                    bySymbol: Object.fromEntries(engine.exposureBySymbol.entries()),
                    byCategory: Object.fromEntries(engine.exposureByCategory.entries()),
                    limits: {
                        MAX_SYMBOL_EXPOSURE_PCT: engine.config.MAX_SYMBOL_EXPOSURE_PCT,
                        MAX_CATEGORY_EXPOSURE_PCT: engine.config.MAX_CATEGORY_EXPOSURE_PCT,
                        MAX_DAILY_DRAWDOWN: engine.config.MAX_DAILY_DRAWDOWN
                    }
                } : {
                    bySymbol: {},
                    byCategory: {},
                    limits: this.riskConfig
                };
                res.json({ success: true, data: exposure });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
        
        this.app.get('/api/health', (req, res) => {
            try {
                const health = {
                    status: 'healthy',
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    system: {
                        initialized: this.quantumSystem.systemState.isInitialized,
                        running: this.quantumSystem.systemState.isRunning,
                        components: this.quantumSystem.systemState.components
                    },
                    trading: {
                        mode: this.config.tradingMode,
                        balance: this.quantumSystem.fundsManager?.getBalance() || 0,
                        activeTrades: this.quantumSystem.realtimeData.trades.size
                    }
                };
                
                res.json({
                    success: true,
                    data: health
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    status: 'unhealthy'
                });
            }
        });
        
        // ═══════════════════════════════════════════════════════════════════
        // 🔮 RUTAS DE PREDICCIONES
        // ═══════════════════════════════════════════════════════════════════
        
        this.app.get('/api/predictions', async (req, res) => {
            try {
                const options = {
                    symbol: req.query.symbol,
                    timeframe: req.query.timeframe,
                    minConfidence: parseFloat(req.query.minConfidence) || 0.5,
                    limit: parseInt(req.query.limit) || 20,
                    sortBy: req.query.sortBy || 'compositeScore'
                };
                
                const predictions = await this.quantumSystem.getPredictions(options);
                
                res.json({
                    success: true,
                    data: predictions,
                    count: predictions.length,
                    filters: options
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        this.app.get('/api/opportunities', async (req, res) => {
            try {
                const limit = parseInt(req.query.limit) || 10;
                const opportunities = await this.quantumSystem.getOpportunities(limit);
                
                res.json({
                    success: true,
                    data: opportunities,
                    count: opportunities.length
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // ═══════════════════════════════════════════════════════════════════
        // 💱 RUTAS DE TRADING
        // ═══════════════════════════════════════════════════════════════════
        
        this.app.get('/api/trading/balance', (req, res) => {
            try {
                const fundsManager = this.quantumSystem.fundsManager;
                if (!fundsManager) {
                    return res.status(400).json({
                        success: false,
                        error: 'FundsManager not initialized'
                    });
                }
                
                const balance = fundsManager.getBalance();
                const metrics = fundsManager.getMetrics();
                
                res.json({
                    success: true,
                    data: {
                        currentBalance: balance,
                        metrics: metrics
                    }
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        this.app.get('/api/trading/positions', (req, res) => {
            try {
                const activeTrades = Array.from(this.quantumSystem.realtimeData.trades.values());
                
                res.json({
                    success: true,
                    data: activeTrades,
                    count: activeTrades.length
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        this.app.post('/api/trading/execute', async (req, res) => {
            try {
                const { symbol, side, amount, leverage } = req.body;
                
                if (!symbol || !side || !amount) {
                    return res.status(400).json({
                        success: false,
                        error: 'Missing required parameters: symbol, side, amount'
                    });
                }
                
                const fundsManager = this.quantumSystem.fundsManager;
                if (!fundsManager) {
                    return res.status(400).json({
                        success: false,
                        error: 'FundsManager not initialized'
                    });
                }
                
                // Obtener precio actual del símbolo
                const symbolData = await this.quantumSystem.getSymbolData(symbol);
                if (!symbolData) {
                    return res.status(400).json({
                        success: false,
                        error: `Symbol ${symbol} not found`
                    });
                }
                
                const result = await fundsManager.executeTrade({
                    symbol,
                    side: side.toUpperCase(),
                    amount: parseFloat(amount),
                    entryPrice: symbolData.price,
                    leverage: parseInt(leverage) || 1
                });
                
                if (result.success) {
                    this.quantumSystem.realtimeData.trades.set(result.trade.id, result.trade);
                    this.emit('trade:executed', result.trade);
                }
                
                res.json(result);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // ═══════════════════════════════════════════════════════════════════
        // 📈 RUTAS DE DATOS DE MERCADO
        // ═══════════════════════════════════════════════════════════════════
        
        this.app.get('/api/symbols', async (req, res) => {
            try {
                const limit = parseInt(req.query.limit) || 50;
                const symbols = await this.quantumSystem.getActiveSymbols(limit);
                
                res.json({
                    success: true,
                    data: symbols,
                    count: symbols.length
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        this.app.get('/api/symbols/:symbol', async (req, res) => {
            try {
                const symbol = req.params.symbol.toUpperCase();
                const data = await this.quantumSystem.getSymbolData(symbol);
                
                if (!data) {
                    return res.status(404).json({
                        success: false,
                        error: `Symbol ${symbol} not found`
                    });
                }
                
                res.json({
                    success: true,
                    data: data
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // ═══════════════════════════════════════════════════════════════════
        // 🌊 SERVER-SENT EVENTS (STREAMING)
        // ═══════════════════════════════════════════════════════════════════
        
        this.app.get('/api/stream', (req, res) => {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Cache-Control'
            });
            
            const clientId = Date.now() + Math.random();
            this.clients.add({ id: clientId, res });
            
            // Enviar datos iniciales
            this.sendToClient(res, 'connected', { clientId });
            const baseMetrics = this.quantumSystem.getUnifiedMetrics();
            const risk = this.quantumSystem.tradingEngine?.riskState || {};
            const engineMetrics = this.quantumSystem.tradingEngine?.metrics || {};
            this.sendToClient(res, 'metrics', { ...baseMetrics, risk, engineMetrics });
            
            // Cleanup al desconectar
            req.on('close', () => {
                this.clients = new Set([...this.clients].filter(client => client.id !== clientId));
            });
        });
        
        // ═══════════════════════════════════════════════════════════════════
        // 🛠️ RUTAS DE CONTROL DEL SISTEMA
        // ═══════════════════════════════════════════════════════════════════
        
        this.app.post('/api/system/start', async (req, res) => {
            try {
                await this.quantumSystem.start();
                res.json({
                    success: true,
                    message: 'System started successfully'
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        this.app.post('/api/system/stop', async (req, res) => {
            try {
                await this.quantumSystem.stop();
                res.json({
                    success: true,
                    message: 'System stopped successfully'
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        this.app.post('/api/system/restart', async (req, res) => {
            try {
                await this.quantumSystem.restart();
                res.json({
                    success: true,
                    message: 'System restarted successfully'
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // ═══════════════════════════════════════════════════════════════════
        // 🛡️ RIESGO: Reset de hard stop diario
        // ═══════════════════════════════════════════════════════════════════
        this.app.post('/api/risk/reset', async (req, res) => {
            try {
                const engine = this.quantumSystem.tradingEngine;
                if (!engine) {
                    return res.status(400).json({ success: false, error: 'TradingEngine not initialized' });
                }
                // Reset diario: fecha y flags
                const today = new Date().toISOString().slice(0,10);
                engine.riskState.lastResetDate = today;
                engine.riskState.startEquity = engine.fundsManager.totalBalance;
                engine.riskState.peakEquity = engine.riskState.startEquity;
                engine.riskState.troughEquity = engine.riskState.startEquity;
                engine.riskState.dailyPnL = 0;
                engine.emergencyStop = false;
                res.json({ success: true, message: 'Risk state reset successfully', risk: engine.riskState });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // ═══════════════════════════════════════════════════════════════════
        // 🛡️ RIESGO: Actualización de configuración en caliente
        // ═══════════════════════════════════════════════════════════════════
        this.app.post('/api/risk/config', async (req, res) => {
            try {
                const engine = this.quantumSystem.tradingEngine;
                const allowed = [
                    'MAX_DAILY_DRAWDOWN',
                    'MAX_SYMBOL_EXPOSURE_PCT',
                    'MAX_CATEGORY_EXPOSURE_PCT',
                    'MAX_CONCURRENT_TRADES',
                    'RISK_HARD_STOP',
                    'TRAILING_STOP_MULTIPLIER'
                ];
                const updates = {};
                for (const key of allowed) {
                    if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) {
                        updates[key] = req.body[key];
                    }
                }
                if (engine && typeof engine.updateConfig === 'function') {
                    engine.updateConfig(updates);
                } else {
                    // Guardar en fallback para exponer por /api/risk/exposure
                    this.riskConfig = { ...this.riskConfig, ...updates };
                }
                res.json({ success: true, message: 'Risk config updated', config: updates, appliedTo: engine ? 'engine' : 'server-fallback' });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
        
        // Error handler
        this.app.use((error, req, res, next) => {
            console.error('❌ Unhandled error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        });
        
        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                error: 'Endpoint not found',
                path: req.path
            });
        });

        // 🛰️ Señales: estadísticas del SignalBus
        this.app.get('/api/signals/stats', (req, res) => {
            try {
                const SignalBus = require('./SignalBus');
                const stats = SignalBus.stats();
                res.json({ success: true, data: stats });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // 🛰️ Señales: peek de señales en cola
        this.app.get('/api/signals/peek', (req, res) => {
            try {
                const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
                const SignalBus = require('./SignalBus');
                const { symbol, category, source, offset } = req.query || {};
                const items = (symbol || category || source)
                  ? SignalBus.peekFiltered({ symbol, category, source, offset, limit })
                  : SignalBus.peek(limit);
                res.json({ success: true, data: items, count: items.length, filters: { symbol, category, source, offset, limit } });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // 🛰️ Señales: descartar
        this.app.post('/api/signals/discard', (req, res) => {
            try {
                const { symbol, timeframe } = req.body || {};
                if (!symbol) return res.status(400).json({ success: false, error: 'symbol required' });
                const SignalBus = require('./SignalBus');
                const ok = SignalBus.discard(symbol, timeframe);
                try {
                    console.log(`[AUDIT] signals.discard ip=${req.ip} symbol=${symbol} timeframe=${timeframe || ''} success=${ok}`);
                } catch (_) {}
                res.json({ success: ok });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // 🛰️ Señales: requeue con boost
        this.app.post('/api/signals/requeue', (req, res) => {
            try {
                const { symbol, timeframe, boost } = req.body || {};
                if (!symbol) return res.status(400).json({ success: false, error: 'symbol required' });
                const SignalBus = require('./SignalBus');
                const ok = SignalBus.requeue(symbol, timeframe, boost);
                try {
                    console.log(`[AUDIT] signals.requeue ip=${req.ip} symbol=${symbol} timeframe=${timeframe || ''} boost=${boost ?? ''} success=${ok}`);
                } catch (_) {}
                res.json({ success: ok });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // 🛰️ Señales: limpiar cola
        this.app.post('/api/signals/clear', (req, res) => {
            try {
                const SignalBus = require('./SignalBus');
                const removed = SignalBus.clear();
                try {
                    console.log(`[AUDIT] signals.clear ip=${req.ip} removed=${removed}`);
                } catch (_) {}
                res.json({ success: true, removed });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
    }
    
    setupEventListeners() {
        // Escuchar eventos del sistema cuántico
        this.quantumSystem.on('metrics:update', (metrics) => {
            this.broadcastToClients('metrics', metrics);
        });
        
        this.quantumSystem.on('predictions:generated', (predictions) => {
            this.broadcastToClients('predictions', predictions);
        });
        
        this.quantumSystem.on('opportunities:detected', (opportunities) => {
            this.broadcastToClients('opportunities', opportunities);
        });
        
        this.quantumSystem.on('trade:executed', (trade) => {
            this.broadcastToClients('trade', trade);
        });
        
        this.quantumSystem.on('bigBang:triggered', (data) => {
            this.broadcastToClients('bigBang', data);
        });
        
        this.quantumSystem.on('realtime:updated', (data) => {
            this.broadcastToClients('realtime', data);
        });

        // Reenviar señales publicadas desde el SignalBus hacia SSE
        try {
            const SignalBus = require('./SignalBus');
            SignalBus.on('signal:published', (op) => this.broadcastToClients('signal', op));
        } catch (_) { /* optional */ }

        // Emitir cambios de riesgo si el engine los expone
        try {
            const engine = this.quantumSystem.tradingEngine;
            if (engine && typeof engine.on === 'function') {
                engine.on('risk:update', (risk) => this.broadcastToClients('risk', risk));
                engine.on('risk:emergency_stop', (risk) => this.broadcastToClients('riskEmergency', risk));
            }
        } catch (_) { /* optional */ }
    }
    
    sendToClient(res, event, data) {
        try {
            res.write(`event: ${event}\n`);
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch (error) {
            console.error('❌ Error sending to client:', error.message);
        }
    }
    
    broadcastToClients(event, data) {
        const deadClients = [];
        
        for (const client of this.clients) {
            try {
                this.sendToClient(client.res, event, data);
            } catch (error) {
                deadClients.push(client);
            }
        }
        
        // Limpiar clientes desconectados
        for (const deadClient of deadClients) {
            this.clients.delete(deadClient);
        }
    }
    
    async start() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        return new Promise((resolve, reject) => {
            try {
                this.server = this.app.listen(this.config.port, this.config.host, () => {
                    console.log('🎨 ═══════════════════════════════════════════════════');
                    console.log('🎨 LEONARDO CONSCIOUSNESS QUANTUM SERVER STARTED');
                    console.log('🎨 ═══════════════════════════════════════════════════');
                    console.log(`🌐 Server: http://${this.config.host}:${this.config.port}`);
                    console.log(`📊 Metrics: http://${this.config.host}:${this.config.port}/api/metrics`);
                    console.log(`🔮 Predictions: http://${this.config.host}:${this.config.port}/api/predictions`);
                    console.log(`💱 Trading: http://${this.config.host}:${this.config.port}/api/trading/balance`);
                    console.log(`🌊 Stream: http://${this.config.host}:${this.config.port}/api/stream`);
                    console.log('🎨 ═══════════════════════════════════════════════════');
                    console.log('💡 "Obstacles cannot crush me; every obstacle yields to stern resolve"');
                    console.log('✨ - Leonardo da Vinci');
                    console.log('');
                    
                    this.emit('server:started');
                    resolve();
                });
                
                // Iniciar sistema cuántico si está configurado para auto-start
                if (this.config.autoStart && this.quantumSystem && typeof this.quantumSystem.start === 'function') {
                    setTimeout(() => {
                        this.quantumSystem.start().catch(console.error);
                    }, 1000);
                }
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    async stop() {
        if (this.server) {
            if (this.quantumSystem && typeof this.quantumSystem.stop === 'function') {
                await this.quantumSystem.stop();
            }
            
            return new Promise((resolve) => {
                // Timeout para forzar cierre si no responde en 10s
                const timeout = setTimeout(() => {
                    console.warn('⚠️ Forzando cierre del servidor tras timeout');
                    resolve();
                }, 10000);
                
                this.server.close(() => {
                    clearTimeout(timeout);
                    console.log('🛑 Leonardo Quantum Server stopped');
                    this.emit('server:stopped');
                    resolve();
                });
            });
        }
    }
    
    async restart() {
        await this.stop();
        await new Promise(resolve => setTimeout(resolve, 2000));
        await this.start();
    }
}

// Ejecutar servidor si es llamado directamente
if (require.main === module) {
    const server = new LeonardoQuantumServer();
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n🛑 Shutting down Leonardo Quantum Server...');
        await server.stop();
        process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
        console.log('\n🛑 Shutting down Leonardo Quantum Server...');
        await server.stop();
        process.exit(0);
    });
    
    // Error handling
    process.on('unhandledRejection', (reason, promise) => {
        console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    });
    
    process.on('uncaughtException', (error) => {
        console.error('❌ Uncaught Exception:', error);
        process.exit(1);
    });
    
    // Start server
    server.start().catch(error => {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    });
}

module.exports = { LeonardoQuantumServer };
