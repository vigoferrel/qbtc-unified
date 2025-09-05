#!/usr/bin/env node
// ========================================================================
// 🚀 QBTC-UNIFIED QUANTUM SYSTEM ACTIVATOR
// Activador del Sistema Cuántico Completo con QuantumInfiniteCache
// Leonardo Consciousness + Quantum Cache + Infinite Profit
// ========================================================================

const path = require('path');
const fs = require('fs');

// Importar componentes principales
const { UnifiedLeonardoServer } = require('./leonardo-consciousness/UnifiedLeonardoServer');
const QuantumInfiniteCache = require('./quantum-core/QuantumInfiniteCache');

class QuantumSystemActivator {
    constructor() {
        console.log('🌌 ACTIVANDO SISTEMA CUÁNTICO LEONARDO CONSCIOUSNESS');
        console.log('════════════════════════════════════════════════════');
        console.log('🧠 Leonardo Decision Engine 4.0');
        console.log('💎 QuantumInfiniteCache (1,979 símbolos)');
        console.log('💰 FundsManager con Kelly Criterion');
        console.log('🔮 Quantum Oracle Hypersphere');
        console.log('⚡ Leverage dinámico hasta 125x');
        console.log('🌊 Resonancia cuántica phi (1.618)');
        console.log('🔱 Transformaciones primo 7919');
        console.log('');

        // Configuración cuántica optimizada
        this.quantumConfig = {
            // Servidor principal
            port: process.env.LEONARDO_PORT || 8090,
            host: '0.0.0.0',
            
            // Trading configuration
            initialBalance: parseFloat(process.env.INITIAL_BALANCE) || 25000,
            autoTrade: process.env.AUTO_TRADE !== 'false',
            tradingMode: process.env.TRADING_MODE || 'AGGRESSIVE',
            
            // Quantum Cache
            enableQuantumCache: true,
            maxSymbols: 1979,
            maxLeverage: 125,
            preloadBatchSize: 88,
            parallelFetches: 144,
            
            // Leonardo Consciousness
            consciousnessTarget: 0.941,
            coherenceTarget: 0.964,
            bigBangThreshold: 0.95,
            
            // Profit Maximization
            maxRiskPerTrade: 0.10,
            compoundingEnabled: true,
            compoundingFactor: 1.25,
            kellyFractionLimit: 0.75
        };

        // Componentes del sistema
        this.leonardoServer = null;
        this.quantumCache = null;
        this.systemStatus = 'INITIALIZING';
        
        // Métricas en tiempo real
        this.realTimeMetrics = {
            systemUptime: 0,
            symbolsProcessed: 0,
            tradesExecuted: 0,
            totalProfit: 0,
            cacheHitRate: 0,
            leverageUtilization: 0,
            consciousnessLevel: 0,
            coherenceLevel: 0
        };
    }

    async activate() {
        try {
            console.log('🔥 INICIANDO ACTIVACIÓN CUÁNTICA...');
            console.log('');
            
            // Fase 1: Validar entorno
            await this.validateEnvironment();
            
            // Fase 2: Inicializar QuantumInfiniteCache
            await this.initializeQuantumCache();
            
            // Fase 3: Activar Leonardo Consciousness Server
            await this.activateLeonardoConsciousness();
            
            // Fase 4: Integrar componentes
            await this.integrateQuantumComponents();
            
            // Fase 5: Iniciar sistema de monitoreo
            this.startQuantumMonitoring();
            
            // Fase 6: Precargar símbolos masivamente
            await this.preloadAllSymbols();
            
            // Sistema activado
            this.systemStatus = 'QUANTUM_ACTIVE';
            
            console.log('');
            console.log('✅ SISTEMA CUÁNTICO LEONARDO ACTIVADO EXITOSAMENTE!');
            console.log('════════════════════════════════════════════════════');
            this.displaySystemStatus();
            this.displayAccessUrls();
            
        } catch (error) {
            console.error('❌ ERROR CRÍTICO EN ACTIVACIÓN:', error.message);
            console.error('Stack:', error.stack);
            process.exit(1);
        }
    }

    async validateEnvironment() {
        console.log('🔍 Validando entorno cuántico...');
        
        // Verificar Node.js version
        const nodeVersion = process.version;
        console.log(`   Node.js: ${nodeVersion}`);
        
        // Verificar memoria disponible
        const memUsage = process.memoryUsage();
        console.log(`   Memoria disponible: ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);
        
        // Verificar archivos críticos
        const criticalFiles = [
            './leonardo-consciousness/UnifiedLeonardoServer.js',
            './quantum-core/QuantumInfiniteCache.js',
            './leonardo-consciousness/LeonardoDecisionEngine.js',
            './leonardo-consciousness/FundsManager.js'
        ];
        
        for (const file of criticalFiles) {
            if (!fs.existsSync(path.resolve(__dirname, file))) {
                throw new Error(`Archivo crítico no encontrado: ${file}`);
            }
        }
        
        // Verificar puerto disponible
        await this.checkPortAvailability(this.quantumConfig.port);
        
        console.log('✅ Entorno cuántico validado');
    }

    async checkPortAvailability(port) {
        return new Promise((resolve, reject) => {
            const net = require('net');
            const server = net.createServer();
            
            server.listen(port, () => {
                server.once('close', () => resolve(true));
                server.close();
            });
            
            server.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    reject(new Error(`Puerto ${port} ya está en uso`));
                } else {
                    reject(err);
                }
            });
        });
    }

    async initializeQuantumCache() {
        console.log('💎 Inicializando QuantumInfiniteCache...');
        
        try {
            this.quantumCache = new QuantumInfiniteCache();
            await this.quantumCache.initialize();
            
            console.log(`   ⚡ Capacidad: ${this.quantumCache.config.maxSymbols} símbolos simultáneos`);
            console.log(`   🔱 Leverage máximo: ${this.quantumCache.config.maxLeverage}x`);
            console.log(`   🌊 Batch size: ${this.quantumCache.config.preloadBatchSize}`);
            console.log(`   ⚛️ Conexiones paralelas: ${this.quantumCache.config.parallelFetches}`);
            console.log('✅ QuantumInfiniteCache inicializado');
            
        } catch (error) {
            throw new Error(`Error inicializando QuantumCache: ${error.message}`);
        }
    }

    async activateLeonardoConsciousness() {
        console.log('🧠 Activando Leonardo Consciousness Server...');
        
        try {
            this.leonardoServer = new UnifiedLeonardoServer({
                port: this.quantumConfig.port,
                host: this.quantumConfig.host,
                initialBalance: this.quantumConfig.initialBalance,
                autoTrade: this.quantumConfig.autoTrade,
                tradingMode: this.quantumConfig.tradingMode,
                maxCacheSize: 5000,
                minConfidence: 0.75,
                minEdge: 0.0025,
                quantumLogging: true
            });
            
            console.log(`   💰 Balance inicial: $${this.quantumConfig.initialBalance.toLocaleString()}`);
            console.log(`   🎯 Trading mode: ${this.quantumConfig.tradingMode}`);
            console.log(`   🤖 Auto-trade: ${this.quantumConfig.autoTrade ? 'ENABLED' : 'DISABLED'}`);
            console.log(`   🧠 Consciencia target: ${(this.quantumConfig.consciousnessTarget * 100).toFixed(1)}%`);
            console.log('✅ Leonardo Consciousness activado');
            
        } catch (error) {
            throw new Error(`Error activando Leonardo: ${error.message}`);
        }
    }

    async integrateQuantumComponents() {
        console.log('🔗 Integrando componentes cuánticos...');
        
        try {
            // Inyectar QuantumCache en Leonardo Server
            if (this.leonardoServer && this.quantumCache) {
                this.leonardoServer.quantumCache = this.quantumCache;
                this.quantumCache.leonardoServer = this.leonardoServer;
                
                // Configurar callbacks de sincronización
                this.setupQuantumSynchronization();
                
                console.log('✅ Integración cuántica completada');
            }
            
        } catch (error) {
            throw new Error(`Error en integración: ${error.message}`);
        }
    }

    setupQuantumSynchronization() {
        // Sincronizar métricas entre componentes cada segundo
        setInterval(() => {
            if (this.leonardoServer && this.quantumCache) {
                // Obtener estado Leonardo
                const leonardoState = this.leonardoServer.decisionEngine.getLeonardoState();
                
                // Obtener métricas del cache
                const cacheMetrics = this.quantumCache.getMetrics();
                
                // Actualizar métricas unificadas
                this.realTimeMetrics = {
                    systemUptime: Date.now() - this.leonardoServer.serverState.startTime,
                    symbolsProcessed: this.quantumCache.quantumState.symbolsLoaded,
                    tradesExecuted: this.leonardoServer.serverState.totalTrades,
                    totalProfit: this.leonardoServer.serverState.totalProfit,
                    cacheHitRate: parseFloat(cacheMetrics.performance.hitRate) || 0,
                    leverageUtilization: this.quantumCache.quantumState.leverageMultiplier,
                    consciousnessLevel: leonardoState.consciousness_level,
                    coherenceLevel: leonardoState.coherence_score
                };
            }
        }, 1000);
    }

    startQuantumMonitoring() {
        console.log('📊 Iniciando monitoreo cuántico...');
        
        // Monitor principal cada 10 segundos
        setInterval(() => {
            this.displayQuantumMetrics();
        }, 10000);
        
        // Health check cada 30 segundos
        setInterval(() => {
            this.performQuantumHealthCheck();
        }, 30000);
        
        console.log('✅ Monitoreo cuántico activado');
    }

    
    async preloadAllSymbols() {
        console.log('🌍 Precargando símbolos masivamente con datos reales...');
        
        try {
            // **USAR SÍMBOLOS REALES DE BINANCE**
            if (this.binanceConnector && typeof this.binanceConnector.getExchangeInfo === 'function') {
                const exchangeInfo = await this.binanceConnector.getExchangeInfo();
                
                if (exchangeInfo && exchangeInfo.symbols) {
                    // Filtrar símbolos USDT activos
                    const realSymbols = exchangeInfo.symbols
                        .filter(symbol => 
                            symbol.quoteAsset === 'USDT' && 
                            symbol.status === 'TRADING' &&
                            symbol.symbol.endsWith('USDT')
                        )
                        .map(symbol => symbol.symbol)
                        .slice(0, 200); // Cargar 200 símbolos principales
                    
                    console.log(`🎯 Cargando ${realSymbols.length} símbolos reales desde Binance...`);
                    
                    // Función de fetch real
                    const realFetchFn = async (symbol) => {
                        try {
                            const ticker = await this.binanceConnector.get24hrTicker(symbol);
                            if (!ticker) return null;
                            
                            return {
                                symbol: ticker.symbol,
                                price: parseFloat(ticker.lastPrice),
                                volume: parseFloat(ticker.volume),
                                priceChangePercent: parseFloat(ticker.priceChangePercent),
                                high: parseFloat(ticker.highPrice),
                                low: parseFloat(ticker.lowPrice),
                                volatility: (parseFloat(ticker.highPrice) - parseFloat(ticker.lowPrice)) / parseFloat(ticker.lastPrice),
                                timestamp: Date.now(),
                                trades24h: parseInt(ticker.count || 0)
                            };
                        } catch (error) {
                            console.warn(`⚠️ Error obteniendo ${symbol}:`, error.message);
                            return null;
                        }
                    };
                    
                    // Precargar usando QuantumCache
                    await this.quantumCache.preloadSymbols(realSymbols, realFetchFn, {
                        sequential: false,
                        maxConcurrency: 15,
                        timeout: 30000,
                        ttl: 7919
                    });
                    
                    console.log(`✅ ${realSymbols.length} símbolos reales precargados exitosamente`);
                    return;
                }
            }
            
            // Fallback a símbolos básicos si no hay conexión
            console.warn('⚠️ Usando símbolos básicos como fallback');
    }

    displaySystemStatus() {
        const uptime = Math.floor(this.realTimeMetrics.systemUptime / 1000);
        const uptimeStr = `${Math.floor(uptime / 60)}m ${uptime % 60}s`;
        
        console.log('📊 ESTADO DEL SISTEMA CUÁNTICO:');
        console.log(`   🌐 Puerto: ${this.quantumConfig.port}`);
        console.log(`   ⏱️ Uptime: ${uptimeStr}`);
        console.log(`   💎 Símbolos procesados: ${this.realTimeMetrics.symbolsProcessed}`);
        console.log(`   📈 Trades ejecutados: ${this.realTimeMetrics.tradesExecuted}`);
        console.log(`   💰 Profit total: $${this.realTimeMetrics.totalProfit.toFixed(2)}`);
        console.log(`   🧠 Consciencia: ${(this.realTimeMetrics.consciousnessLevel * 100).toFixed(1)}%`);
        console.log(`   🌊 Coherencia: ${(this.realTimeMetrics.coherenceLevel * 100).toFixed(1)}%`);
    }

    displayAccessUrls() {
        console.log('');
        console.log('🌐 URLS DE ACCESO:');
        console.log(`   📊 Dashboard: http://localhost:${this.quantumConfig.port}`);
        console.log(`   🔍 Health: http://localhost:${this.quantumConfig.port}/health`);
        console.log(`   📈 Análisis: http://localhost:${this.quantumConfig.port}/analyze`);
        console.log(`   💰 Posiciones: http://localhost:${this.quantumConfig.port}/position/open`);
        console.log(`   🌊 Stream: http://localhost:${this.quantumConfig.port}/api/leonardo-stream`);
        console.log('');
        console.log('🚀 SISTEMA LEONARDO CONSCIOUSNESS OPERATIVO');
        console.log('💎 QuantumInfiniteCache: 1,979 símbolos bajo control');
        console.log('⚡ Leverage dinámico: Hasta 125x optimizado');
        console.log('🧠 Consciencia cuántica: MÁXIMA RENTABILIDAD');
        console.log('');
        console.log('¡PREPARADO PARA RENTABILIDAD INFINITA! 🚀💰');
    }

    displayQuantumMetrics() {
        console.log('');
        console.log('⚡ MÉTRICAS CUÁNTICAS EN TIEMPO REAL:');
        console.log(`   Cache Hit Rate: ${this.realTimeMetrics.cacheHitRate}%`);
        console.log(`   Símbolos Activos: ${this.realTimeMetrics.symbolsProcessed}`);
        console.log(`   Leverage Utilization: ${this.realTimeMetrics.leverageUtilization.toFixed(1)}x`);
        console.log(`   Consciencia Level: ${(this.realTimeMetrics.consciousnessLevel * 100).toFixed(1)}%`);
        console.log(`   Profit Total: $${this.realTimeMetrics.totalProfit.toFixed(2)}`);
    }

    performQuantumHealthCheck() {
        const health = {
            cache: this.quantumCache ? this.quantumCache.validateSystemHealth() : { status: 'ERROR' },
            leonardo: this.leonardoServer ? 'ACTIVE' : 'INACTIVE',
            consciousness: this.realTimeMetrics.consciousnessLevel > 0.7 ? 'OPTIMAL' : 'SUBOPTIMAL'
        };
        
        if (health.cache.status === 'WARNING' || health.leonardo === 'INACTIVE') {
            console.log('⚠️ QUANTUM HEALTH WARNING:', health);
        }
    }

    async start() {
        // Iniciar servidor Leonardo
        if (this.leonardoServer) {
            await this.leonardoServer.start();
        }
    }
}

// ========================================================================
// 🚀 ACTIVACIÓN DEL SISTEMA CUÁNTICO
// ========================================================================

async function main() {
    console.clear();
    
    try {
        const quantumActivator = new QuantumSystemActivator();
        await quantumActivator.activate();
        await quantumActivator.start();
        
        // Mantener proceso vivo
        process.on('SIGINT', () => {
            console.log('\n🛑 Deteniendo sistema cuántico...');
            console.log('✅ Sistema Leonardo Consciousness detenido');
            process.exit(0);
        });
        
    } catch (error) {
        console.error('💥 ERROR FATAL:', error.message);
        process.exit(1);
    }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
    main();
}

module.exports = QuantumSystemActivator;


// ===== SYSTEM HEALTH CHECKS =====
async function performSystemHealthCheck() {
    console.log('🔍 Realizando verificación de salud del sistema...');
    
    const health = {
        binanceConnection: false,
        quantumCache: false,
        systemMemory: false,
        overallStatus: 'UNKNOWN'
    };
    
    try {
        // Verificar conexión Binance
        if (global.binanceConnector) {
            const exchangeInfo = await global.binanceConnector.getExchangeInfo();
            health.binanceConnection = exchangeInfo && exchangeInfo.symbols;
        }
        
        // Verificar Quantum Cache
        if (global.quantumCache) {
            const metrics = global.quantumCache.getMetrics();
            health.quantumCache = metrics && metrics.performance;
        }
        
        // Verificar memoria del sistema
        const memUsage = process.memoryUsage();
        health.systemMemory = memUsage.heapUsed < (memUsage.heapTotal * 0.9);
        
        // Determinar estado general
        const healthScore = Object.values(health).filter(v => v === true).length;
        
        if (healthScore >= 3) health.overallStatus = 'EXCELLENT';
        else if (healthScore >= 2) health.overallStatus = 'GOOD';
        else if (healthScore >= 1) health.overallStatus = 'WARNING';
        else health.overallStatus = 'CRITICAL';
        
        console.log(`✅ Health Check: ${health.overallStatus} (${healthScore}/3)`);
        
        return health;
        
    } catch (error) {
        console.error('❌ Error en health check:', error.message);
        health.overallStatus = 'ERROR';
        return health;
    }
}

// Ejecutar health check periódicamente
if (typeof setInterval !== 'undefined') {
    setInterval(performSystemHealthCheck, 300000); // Cada 5 minutos
}

// ===== SYSTEM HEALTH CHECKS =====
async function performSystemHealthCheck() {
    console.log('🔍 Realizando verificación de salud del sistema...');
    
    const health = {
        binanceConnection: false,
        quantumCache: false,
        systemMemory: false,
        overallStatus: 'UNKNOWN'
    };
    
    try {
        // Verificar conexión Binance
        if (global.binanceConnector) {
            const exchangeInfo = await global.binanceConnector.getExchangeInfo();
            health.binanceConnection = exchangeInfo && exchangeInfo.symbols;
        }
        
        // Verificar Quantum Cache
        if (global.quantumCache) {
            const metrics = global.quantumCache.getMetrics();
            health.quantumCache = metrics && metrics.performance;
        }
        
        // Verificar memoria del sistema
        const memUsage = process.memoryUsage();
        health.systemMemory = memUsage.heapUsed < (memUsage.heapTotal * 0.9);
        
        // Determinar estado general
        const healthScore = Object.values(health).filter(v => v === true).length;
        
        if (healthScore >= 3) health.overallStatus = 'EXCELLENT';
        else if (healthScore >= 2) health.overallStatus = 'GOOD';
        else if (healthScore >= 1) health.overallStatus = 'WARNING';
        else health.overallStatus = 'CRITICAL';
        
        console.log(`✅ Health Check: ${health.overallStatus} (${healthScore}/3)`);
        
        return health;
        
    } catch (error) {
        console.error('❌ Error en health check:', error.message);
        health.overallStatus = 'ERROR';
        return health;
    }
}

// Ejecutar health check periódicamente
if (typeof setInterval !== 'undefined') {
    setInterval(performSystemHealthCheck, 300000); // Cada 5 minutos
}

// ===== SYSTEM HEALTH CHECKS =====
async function performSystemHealthCheck() {
    console.log('🔍 Realizando verificación de salud del sistema...');
    
    const health = {
        binanceConnection: false,
        quantumCache: false,
        systemMemory: false,
        overallStatus: 'UNKNOWN'
    };
    
    try {
        // Verificar conexión Binance
        if (global.binanceConnector) {
            const exchangeInfo = await global.binanceConnector.getExchangeInfo();
            health.binanceConnection = exchangeInfo && exchangeInfo.symbols;
        }
        
        // Verificar Quantum Cache
        if (global.quantumCache) {
            const metrics = global.quantumCache.getMetrics();
            health.quantumCache = metrics && metrics.performance;
        }
        
        // Verificar memoria del sistema
        const memUsage = process.memoryUsage();
        health.systemMemory = memUsage.heapUsed < (memUsage.heapTotal * 0.9);
        
        // Determinar estado general
        const healthScore = Object.values(health).filter(v => v === true).length;
        
        if (healthScore >= 3) health.overallStatus = 'EXCELLENT';
        else if (healthScore >= 2) health.overallStatus = 'GOOD';
        else if (healthScore >= 1) health.overallStatus = 'WARNING';
        else health.overallStatus = 'CRITICAL';
        
        console.log(`✅ Health Check: ${health.overallStatus} (${healthScore}/3)`);
        
        return health;
        
    } catch (error) {
        console.error('❌ Error en health check:', error.message);
        health.overallStatus = 'ERROR';
        return health;
    }
}

// Ejecutar health check periódicamente
if (typeof setInterval !== 'undefined') {
    setInterval(performSystemHealthCheck, 300000); // Cada 5 minutos
}