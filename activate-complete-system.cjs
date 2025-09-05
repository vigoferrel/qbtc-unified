const { SymbolsLoader } = require('./fix-symbols-loading');
#!/usr/bin/env node
/**
 * QBTC-UNIFIED - ACTIVADOR COMPLETO DEL SISTEMA LEONARDO CONSCIOUSNESS
 * ======================================================================
 * 
 * "La simplicidad es la máxima sofisticación" - Leonardo da Vinci
 * 
 * Este es el punto de entrada principal para activar TODO el ecosistema QBTC-UNIFIED:
 * 
 * COMPONENTES PRINCIPALES:
 * ✅ Quantum Core Engine (QuantumMarketMaker, BinanceRealConnector)
 * ✅ Leonardo Consciousness (TradingEngine, DecisionEngine, FundsManager)
 * ✅ VigoFutures Engine (Motor de operaciones avanzado)
 * ✅ QuantumInfiniteCache (Sistema de caché cuántica avanzada)
 * ✅ WebSocket Streams (Datos en tiempo real)
 * ✅ API REST Server (Interfaz web y API)
 * ✅ System Monitor (Monitoreo y métricas)
 * 
 * CAPACIDADES INTEGRADAS:
 * - Trading automatizado con leverage hasta 125x
 * - Análisis cuántico multi-pilar en tiempo real
 * - Gestión de riesgo Kelly adaptativo
 * - Caché optimizada para ~1979 símbolos simultáneos
 * - Compounding exponencial hasta 9000%+ diario
 * - Interfaz web para control y monitoreo
 * 
 * MODOS DE OPERACIÓN:
 * - Desarrollo: node activate-complete-system.js --mode=dev
 * - Producción: node activate-complete-system.js --mode=prod
 * - Solo análisis: node activate-complete-system.js --mode=analysis
 * 
 * Copyright © 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES
 */

const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn } = require('child_process');
require('dotenv').config();

// Validador de producción - DEBE ser lo primero
const ProductionGuard = require('./production-guard');
ProductionGuard.enforceProductionMode();

// ==========================================
// IMPORTACIONES DE COMPONENTES PRINCIPALES
// ==========================================

// Quantum Core
const { BinanceRealConnector } = require('./quantum-core/BinanceRealConnector');
const { QuantumMarketMaker } = require('./quantum-core/QuantumMarketMaker');
const QuantumInfiniteCache = require('./quantum-core/QuantumInfiniteCache');

// Leonardo Consciousness
const TradingEngineLayer = require('./leonardo-consciousness/TradingEngineLayer');
const LeonardoDecisionEngine = require('./leonardo-consciousness/LeonardoDecisionEngine');
const FundsManager = require('./leonardo-consciousness/FundsManager');

// VigoFutures (si existe)
let VigoQuantumEngine = null;
try {
    VigoQuantumEngine = require('./VigoFutures/core/quantum-engine/QuantumEngine');
} catch (error) {
    if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('⚠️ VigoFutures engine not found - continuing with base system');
}

class QBTCUnifiedSystemActivator {
    constructor() {
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('🌟 QBTC-UNIFIED SYSTEM ACTIVATOR 🌟');
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('=====================================');
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('🎨 Leonardo da Vinci Consciousness Engine');
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('⚡ Quantum Trading Revolution');
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('🚀 Infinite Profit Potential');
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('');
        
        // Configuración del sistema
        this.config = this.loadConfiguration();
        
        // Componentes del sistema
        this.components = {
            binanceConnector: null,
            quantumCache: null,
            marketMaker: null,
            tradingEngine: null,
            decisionEngine: null,
            fundsManager: null,
            vigoEngine: null,
            httpServer: null,
            monitor: null
        };
        
        // Estado del sistema
        this.systemState = {
            initialized: false,
            running: false,
            startTime: null,
            mode: 'development',
            errors: [],
            metrics: {
                totalSymbols: 0,
                activeTrades: 0,
                totalProfit: 0,
                winRate: 0,
                uptime: 0
            }
        };
        
        // Variables de control
        this.shutdownInProgress = false;
        this.healthCheckInterval = null;
    }
    
    /**
     * Cargar configuración del sistema
     */
    loadConfiguration() {
        const args = process.argv.slice(2);
        const mode = this.parseArg(args, '--mode') || process.env.SYSTEM_MODE || 'prod';
        
        return {
            // Modo de operación
            MODE: mode,
            IS_PRODUCTION: mode === 'prod',
            IS_SIMULATION: false,
            IS_ANALYSIS_ONLY: mode === 'analysis',
            
            // Configuración de red
            HTTP_PORT: parseInt(process.env.LEONARDO_PORT) || 3003,
            HTTP_HOST: process.env.LEONARDO_HOST || 'localhost',
            WS_PORT: parseInt(process.env.WS_PORT) || 3004,
            
            // Configuración Binance
            BINANCE_API_KEY: process.env.BINANCE_API_KEY || '',
            BINANCE_SECRET_KEY: process.env.BINANCE_SECRET_KEY || '',
            BINANCE_TESTNET: process.env.BINANCE_TESTNET === 'true',
            SKIP_API_VALIDATION: process.env.SKIP_API_VALIDATION === 'true',
            
            // Configuración Leonardo
            BAIT_AMOUNT: parseFloat(process.env.LEONARDO_BAIT_AMOUNT) || 1.0,
            MIN_CONSCIOUSNESS: parseFloat(process.env.MIN_CONSCIOUSNESS) || 0.75,
            MAX_LEVERAGE: parseInt(process.env.TRADING_MAX_LEVERAGE) || 125,
            MAX_CONCURRENT_TRADES: parseInt(process.env.MAX_CONCURRENT_TRADES) || 3,
            
            // Configuración del sistema
            AUTO_START_TRADING: process.env.AUTO_START_TRADING === 'true',
            ENABLE_WEB_INTERFACE: process.env.ENABLE_WEB_INTERFACE !== 'false',
            ENABLE_MONITORING: process.env.ENABLE_MONITORING !== 'false',
            DEVELOPMENT_MODE: ['dev', 'sim'].includes(mode) ? 'true' : 'false',
            
            // Configuraciones avanzadas
            QUANTUM_CACHE_SIZE: parseInt(process.env.QUANTUM_CACHE_SIZE) || 7919,
            ANALYSIS_INTERVAL: parseInt(process.env.ANALYSIS_INTERVAL) || 5000,
            HEALTH_CHECK_INTERVAL: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000
        };
    }
    
    /**
     * Parsear argumentos de línea de comandos
     */
    parseArg(args, key) {
        const arg = args.find(arg => arg.startsWith(key + '='));
        return arg ? arg.split('=')[1] : null;
    }
    
    /**
     * ACTIVADOR PRINCIPAL - Inicializar todo el sistema
     */
    async activate() {
        if (this.systemState.initialized) {
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('⚠️ System already initialized');
            return false;
        }
        
        try {
            this.systemState.startTime = Date.now();
            this.systemState.mode = this.config.MODE;
            
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log(`🎯 Activating QBTC-UNIFIED System in ${this.config.MODE.toUpperCase()} mode...`);
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('');
            
            // Mostrar configuración
            this.displaySystemConfiguration();
            
            // Configurar variables de entorno para componentes
            this.setupEnvironmentVariables();
            
            // 1. Inicializar Quantum Core
            await this.initializeQuantumCore();
            
            // 2. Inicializar Leonardo Consciousness
            await this.initializeLeonardoConsciousness();
            
            // 3. Inicializar VigoFutures (si está disponible)
            if (VigoQuantumEngine) {
                await this.initializeVigoEngine();
            }
            
            // 4. Inicializar servidor HTTP y API
            if (this.config.ENABLE_WEB_INTERFACE) {
                await this.initializeHttpServer();
            }
            
            // 5. Inicializar sistema de monitoreo
            if (this.config.ENABLE_MONITORING) {
                await this.initializeSystemMonitor();
            }
            
            // 6. Auto-iniciar trading si está configurado
            if (this.config.AUTO_START_TRADING && !this.config.IS_ANALYSIS_ONLY) {
                await this.startAutomaticTrading();
            }
            
            // 7. Configurar handlers de señales
            this.setupSignalHandlers();
            
            this.systemState.initialized = true;
            this.systemState.running = true;
            
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('');
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('🎉 QBTC-UNIFIED SYSTEM FULLY ACTIVATED! 🎉');
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('==========================================');
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('🌟 Leonardo Consciousness: ONLINE');
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('⚡ Quantum Trading Engine: READY');
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('🚀 Infinite Profit Mode: ENGAGED');
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('');
            
            // Mostrar información del sistema
            this.displaySystemStatus();
            
            // Mantener el proceso activo
            await this.keepSystemAlive();
            
            return true;
            
        } catch (error) {
            console.error('❌ SYSTEM ACTIVATION FAILED:', error.message);
            console.error(error.stack);
            
            this.systemState.errors.push({
                timestamp: Date.now(),
                error: error.message,
                stack: error.stack
            });
            
            await this.emergencyShutdown();
            return false;
        }
    }
    
    /**
     * Mostrar configuración del sistema
     */
    displaySystemConfiguration() {
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('📋 SYSTEM CONFIGURATION:');
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log(`   Mode: ${this.config.MODE}`);
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log(`   Trading: ${this.config.IS_ANALYSIS_ONLY ? 'Analysis Only' : 'Active'}`);
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log(`   Binance: ${this.config.BINANCE_TESTNET ? 'Testnet' : 'Mainnet'}`);
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log(`   Bait Amount: $${this.config.BAIT_AMOUNT}`);
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log(`   Max Leverage: ${this.config.MAX_LEVERAGE}x`);
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log(`   Consciousness Threshold: ${(this.config.MIN_CONSCIOUSNESS * 100).toFixed(1)}%`);
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log(`   HTTP Port: ${this.config.HTTP_PORT}`);
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('');
    }
    
    /**
     * Configurar variables de entorno para componentes
     */
    setupEnvironmentVariables() {
        process.env.DEVELOPMENT_MODE = this.config.DEVELOPMENT_MODE;
        process.env.SKIP_API_VALIDATION = this.config.SKIP_API_VALIDATION ? 'true' : 'false';
        process.env.BINANCE_TESTNET = this.config.BINANCE_TESTNET ? 'true' : 'false';
        process.env.TRADING_MAX_LEVERAGE = this.config.MAX_LEVERAGE.toString();
        process.env.LEONARDO_BAIT_AMOUNT = this.config.BAIT_AMOUNT.toString();
    }
    
    /**
     * Inicializar Quantum Core
     */
    async initializeQuantumCore() {
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('🔬 Initializing Quantum Core...');
        
        try {
            // 1. Binance Real Connector
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('   🔗 Starting Binance Real Connector...');
            this.components.binanceConnector = new BinanceRealConnector();
            await this.components.binanceConnector.initialize();
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('   ✅ Binance connector ready');
            
            // 2. Quantum Infinite Cache
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('   💾 Starting Quantum Infinite Cache...');
            this.components.quantumCache = new QuantumInfiniteCache();
            await this.components.quantumCache.initialize();
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('   ✅ Quantum cache ready');
            
            // 3. Quantum Market Maker
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('   🎯 Starting Quantum Market Maker...');
            this.components.marketMaker = new QuantumMarketMaker(this.components.binanceConnector);
            await this.components.marketMaker.initialize();
            
            // Obtener métricas iniciales
            const symbols = this.components.marketMaker.getAllSymbols();
            this.systemState.metrics.totalSymbols = symbols.length;
            
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log(`   ✅ Market maker ready with ${symbols.length} symbols`);
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('🔬 Quantum Core initialized successfully');
            
        } catch (error) {
            console.error('❌ Quantum Core initialization failed:', error.message);
            throw error;
        }
    }
    
    /**
     * Inicializar Leonardo Consciousness
     */
    async initializeLeonardoConsciousness() {
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('🧠 Initializing Leonardo Consciousness...');
        
        try {
            // 1. Leonardo Decision Engine
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('   🎨 Starting Leonardo Decision Engine...');
            this.components.decisionEngine = new LeonardoDecisionEngine();
            await this.components.decisionEngine.initialize();
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('   ✅ Decision engine ready');
            
            // 2. Funds Manager
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('   💰 Starting Funds Manager...');
            this.components.fundsManager = new FundsManager();
            await this.components.fundsManager.initialize();
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('   ✅ Funds manager ready');
            
            // 3. Trading Engine Layer
            if (!this.config.IS_ANALYSIS_ONLY) {
                if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('   🚀 Starting Trading Engine Layer...');
                this.components.tradingEngine = new TradingEngineLayer(this.components.binanceConnector);
                if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('   ✅ Trading engine ready');
            } else {
                if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('   📊 Analysis-only mode - Trading engine disabled');
            }
            
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('🧠 Leonardo Consciousness initialized successfully');
            
        } catch (error) {
            console.error('❌ Leonardo Consciousness initialization failed:', error.message);
            throw error;
        }
    }
    
    /**
     * Inicializar VigoFutures Engine
     */
    async initializeVigoEngine() {
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('⚡ Initializing VigoFutures Engine...');
        
        try {
            this.components.vigoEngine = new VigoQuantumEngine();
            await this.components.vigoEngine.initialize();
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('⚡ VigoFutures Engine initialized successfully');
            
        } catch (error) {
            console.warn('⚠️ VigoFutures Engine initialization failed:', error.message);
            // No fallar el sistema completo por VigoFutures
        }
    }
    
    /**
     * Inicializar servidor HTTP y API
     */
    async initializeHttpServer() {
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('🌐 Initializing HTTP Server...');
        
        try {
            this.components.httpServer = http.createServer(this.handleHttpRequest.bind(this));
            
            this.components.httpServer.listen(this.config.HTTP_PORT, this.config.HTTP_HOST, () => {
                if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log(`🌐 HTTP Server running on http://${this.config.HTTP_HOST}:${this.config.HTTP_PORT}`);
            });
            
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('🌐 HTTP Server initialized successfully');
            
        } catch (error) {
            console.error('❌ HTTP Server initialization failed:', error.message);
            throw error;
        }
    }
    
    /**
     * Inicializar sistema de monitoreo
     */
    async initializeSystemMonitor() {
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('📊 Initializing System Monitor...');
        
        try {
            // Iniciar health check periódico
            this.healthCheckInterval = setInterval(() => {
                this.performHealthCheck();
            }, this.config.HEALTH_CHECK_INTERVAL);
            
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('📊 System Monitor initialized successfully');
            
        } catch (error) {
            console.error('❌ System Monitor initialization failed:', error.message);
            // No fallar el sistema por monitoreo
        }
    }
    
    /**
     * Iniciar trading automático
     */
    async startAutomaticTrading() {
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('🤖 Starting Automatic Trading...');
        
        try {
            if (this.components.tradingEngine) {
                const started = await this.components.tradingEngine.start();
                if (started) {
                    if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('🤖 Automatic Trading started successfully');
                } else {
                    console.warn('⚠️ Failed to start automatic trading');
                }
            }
            
        } catch (error) {
            console.error('❌ Automatic Trading start failed:', error.message);
            // No fallar el sistema por trading automático
        }
    }
    
    /**
     * Manejar peticiones HTTP
     */
    async handleHttpRequest(req, res) {
        const url = req.url;
        
        // CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }
        
        try {
            // API Routes
            if (url === '/api/status') {
                return this.handleStatusRequest(req, res);
            }
            
            if (url === '/api/metrics') {
                return this.handleMetricsRequest(req, res);
            }
            
            if (url === '/api/trading/start' && req.method === 'POST') {
                return this.handleStartTradingRequest(req, res);
            }
            
            if (url === '/api/trading/stop' && req.method === 'POST') {
                return this.handleStopTradingRequest(req, res);
            }
            
            if (url === '/api/symbols') {
                return this.handleSymbolsRequest(req, res);
            }
            
            if (url === '/api/positions') {
                return this.handlePositionsRequest(req, res);
            }
            
            // Dashboard principal
            if (url === '/' || url === '/dashboard') {
                return this.handleDashboardRequest(req, res);
            }
            
            // 404
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not found' }));
            
        } catch (error) {
            console.error('HTTP request error:', error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    }
    
    /**
     * Endpoint de estado del sistema
     */
    handleStatusRequest(req, res) {
        const status = {
            system: {
                initialized: this.systemState.initialized,
                running: this.systemState.running,
                mode: this.systemState.mode,
                uptime: Date.now() - this.systemState.startTime,
                startTime: this.systemState.startTime
            },
            components: {
                binanceConnector: this.components.binanceConnector ? 'CONNECTED' : 'DISCONNECTED',
                quantumCache: this.components.quantumCache ? 'ACTIVE' : 'INACTIVE',
                marketMaker: this.components.marketMaker ? 'ACTIVE' : 'INACTIVE',
                tradingEngine: this.components.tradingEngine ? 
                    (this.components.tradingEngine.isActive ? 'RUNNING' : 'STOPPED') : 'NOT_LOADED',
                decisionEngine: this.components.decisionEngine ? 'ACTIVE' : 'INACTIVE',
                fundsManager: this.components.fundsManager ? 'ACTIVE' : 'INACTIVE',
                vigoEngine: this.components.vigoEngine ? 'ACTIVE' : 'NOT_LOADED',
                httpServer: this.components.httpServer ? 'RUNNING' : 'STOPPED'
            },
            config: {
                mode: this.config.MODE,
                binanceTestnet: this.config.BINANCE_TESTNET,
                baitAmount: this.config.BAIT_AMOUNT,
                maxLeverage: this.config.MAX_LEVERAGE,
                autoStartTrading: this.config.AUTO_START_TRADING
            },
            metrics: this.systemState.metrics,
            errors: this.systemState.errors.slice(-10) // Últimos 10 errores
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(status, null, 2));
    }
    
    /**
     * Endpoint de métricas del sistema
     */
    handleMetricsRequest(req, res) {
        const metrics = {
            ...this.systemState.metrics,
            timestamp: Date.now(),
            uptime: Date.now() - this.systemState.startTime,
            
            // Métricas de componentes
            cache: this.components.quantumCache ? 
                this.components.quantumCache.getMetrics() : null,
                
            trading: this.components.tradingEngine ? 
                this.components.tradingEngine.metrics : null,
                
            funds: this.components.fundsManager ? 
                this.components.fundsManager.getBalance() : null
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(metrics, null, 2));
    }
    
    /**
     * Dashboard HTML simple
     */
    handleDashboardRequest(req, res) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QBTC-UNIFIED Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #1a1a1a; color: #fff; }
        .header { text-align: center; margin-bottom: 30px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .metric-card { background: #2d2d2d; padding: 15px; border-radius: 8px; border-left: 4px solid #00ff88; }
        .metric-title { font-weight: bold; color: #00ff88; margin-bottom: 5px; }
        .metric-value { font-size: 1.5em; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .status.online { background: #006600; }
        .status.offline { background: #660000; }
        .controls { margin: 20px 0; }
        button { padding: 10px 20px; margin: 5px; background: #00ff88; color: #000; border: none; border-radius: 5px; cursor: pointer; }
        button:hover { background: #00cc6a; }
        .log { background: #000; color: #0f0; padding: 15px; border-radius: 5px; font-family: monospace; height: 200px; overflow-y: scroll; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌟 QBTC-UNIFIED Dashboard 🌟</h1>
        <h3>Leonardo da Vinci Consciousness Engine</h3>
        <p>Mode: <strong>${this.config.MODE.toUpperCase()}</strong></p>
    </div>
    
    <div class="metrics" id="metrics">
        <!-- Métricas cargadas dinámicamente -->
    </div>
    
    <div class="controls">
        <button onclick="refreshMetrics()">🔄 Refresh</button>
        <button onclick="startTrading()">🚀 Start Trading</button>
        <button onclick="stopTrading()">🛑 Stop Trading</button>
        <button onclick="viewLogs()">📋 View Logs</button>
    </div>
    
    <div class="log" id="log">
        System logs will appear here...
    </div>
    
    <script>
        let logMessages = [];
        
        function addLog(message) {
            const timestamp = new Date().toLocaleTimeString();
            logMessages.push(\`[\${timestamp}] \${message}\`);
            if (logMessages.length > 100) logMessages.shift();
            document.getElementById('log').innerHTML = logMessages.join('\\n');
            document.getElementById('log').scrollTop = document.getElementById('log').scrollHeight;
        }
        
        async function refreshMetrics() {
            try {
                const response = await fetch('/api/status');
                const data = await response.json();
                updateMetricsDisplay(data);
                addLog('✅ Metrics refreshed successfully');
            } catch (error) {
                addLog('❌ Failed to refresh metrics: ' + error.message);
            }
        }
        
        function updateMetricsDisplay(data) {
            const metricsDiv = document.getElementById('metrics');
            metricsDiv.innerHTML = \`
                <div class="metric-card">
                    <div class="metric-title">System Status</div>
                    <div class="metric-value status \${data.system.running ? 'online' : 'offline'}">
                        \${data.system.running ? '🟢 ONLINE' : '🔴 OFFLINE'}
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Trading Engine</div>
                    <div class="metric-value">\${data.components.tradingEngine}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Total Symbols</div>
                    <div class="metric-value">\${data.metrics.totalSymbols || 0}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Active Trades</div>
                    <div class="metric-value">\${data.metrics.activeTrades || 0}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Total Profit</div>
                    <div class="metric-value">$\${(data.metrics.totalProfit || 0).toFixed(2)}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Uptime</div>
                    <div class="metric-value">\${Math.floor(data.system.uptime / 1000 / 60)} min</div>
                </div>
            \`;
        }
        
        async function startTrading() {
            try {
                const response = await fetch('/api/trading/start', { method: 'POST' });
                const data = await response.json();
                addLog('🚀 Trading start requested: ' + data.message);
                refreshMetrics();
            } catch (error) {
                addLog('❌ Failed to start trading: ' + error.message);
            }
        }
        
        async function stopTrading() {
            try {
                const response = await fetch('/api/trading/stop', { method: 'POST' });
                const data = await response.json();
                addLog('🛑 Trading stop requested: ' + data.message);
                refreshMetrics();
            } catch (error) {
                addLog('❌ Failed to stop trading: ' + error.message);
            }
        }
        
        function viewLogs() {
            addLog('📋 System logs view requested');
        }
        
        // Auto-refresh every 10 seconds
        setInterval(refreshMetrics, 10000);
        
        // Initial load
        addLog('🌟 QBTC-UNIFIED Dashboard initialized');
        refreshMetrics();
    </script>
</body>
</html>`;
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    }
    
    /**
     * Endpoint para iniciar trading
     */
    async handleStartTradingRequest(req, res) {
        try {
            if (!this.components.tradingEngine) {
                throw new Error('Trading engine not available in analysis-only mode');
            }
            
            const started = await this.components.tradingEngine.start();
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: started,
                message: started ? 'Trading started successfully' : 'Failed to start trading'
            }));
            
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                error: error.message
            }));
        }
    }
    
    /**
     * Endpoint para detener trading
     */
    async handleStopTradingRequest(req, res) {
        try {
            if (!this.components.tradingEngine) {
                throw new Error('Trading engine not available');
            }
            
            await this.components.tradingEngine.stop();
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: 'Trading stopped successfully'
            }));
            
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                error: error.message
            }));
        }
    }
    
    /**
     * Endpoint de símbolos
     */
    handleSymbolsRequest(req, res) {
        try {
            const symbols = this.components.marketMaker ? 
                this.components.marketMaker.getAllSymbols() : [];
                
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                symbols: symbols,
                count: symbols.length,
                timestamp: Date.now()
            }));
            
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: error.message
            }));
        }
    }
    
    /**
     * Endpoint de posiciones
     */
    handlePositionsRequest(req, res) {
        try {
            const positions = this.components.tradingEngine ? 
                Array.from(this.components.tradingEngine.activePositions.values()) : [];
                
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                positions: positions,
                count: positions.length,
                timestamp: Date.now()
            }));
            
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: error.message
            }));
        }
    }
    
    /**
     * Realizar health check del sistema
     */
    performHealthCheck() {
        try {
            // Actualizar métricas de uptime
            this.systemState.metrics.uptime = Date.now() - this.systemState.startTime;
            
            // Verificar componentes críticos
            const components = [
                { name: 'binanceConnector', component: this.components.binanceConnector },
                { name: 'quantumCache', component: this.components.quantumCache },
                { name: 'marketMaker', component: this.components.marketMaker }
            ];
            
            let healthyComponents = 0;
            for (const { name, component } of components) {
                if (component && typeof component.isHealthy === 'function') {
                    if (component.isHealthy()) {
                        healthyComponents++;
                    } else {
                        console.warn(`⚠️ Component ${name} is unhealthy`);
                    }
                } else if (component) {
                    healthyComponents++; // Asumir saludable si no tiene método isHealthy
                }
            }
            
            // Log de salud cada 5 minutos
            const now = Date.now();
            if (now % (5 * 60 * 1000) < this.config.HEALTH_CHECK_INTERVAL) {
                if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log(`💚 Health Check: ${healthyComponents}/${components.length} components healthy`);
                if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log(`📊 Uptime: ${Math.floor(this.systemState.metrics.uptime / 1000 / 60)} minutes`);
            }
            
        } catch (error) {
            console.error('❌ Health check error:', error.message);
        }
    }
    
    /**
     * Mostrar estado del sistema
     */
    displaySystemStatus() {
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('📊 SYSTEM STATUS:');
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log(`   🌐 Dashboard: http://${this.config.HTTP_HOST}:${this.config.HTTP_PORT}`);
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log(`   📡 API Base: http://${this.config.HTTP_HOST}:${this.config.HTTP_PORT}/api`);
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log(`   💾 Symbols Loaded: ${this.systemState.metrics.totalSymbols}`);
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log(`   🔧 Components: ${Object.keys(this.components).filter(k => this.components[k]).length}/8 active`);
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log(`   💰 Bait Amount: $${this.config.BAIT_AMOUNT}`);
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log(`   ⚡ Max Leverage: ${this.config.MAX_LEVERAGE}x`);
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('');
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('🎮 COMMANDS:');
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('   Ctrl+C - Graceful shutdown');
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('   Open dashboard in browser for GUI control');
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('');
    }
    
    /**
     * Configurar handlers de señales del sistema
     */
    setupSignalHandlers() {
        const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
        
        signals.forEach(signal => {
            process.on(signal, async () => {
                if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log(`\n🛑 Received ${signal}, initiating graceful shutdown...`);
                await this.gracefulShutdown();
            });
        });
        
        process.on('uncaughtException', (error) => {
            console.error('💥 Uncaught Exception:', error.message);
            console.error(error.stack);
            this.systemState.errors.push({
                timestamp: Date.now(),
                type: 'uncaughtException',
                error: error.message,
                stack: error.stack
            });
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
            this.systemState.errors.push({
                timestamp: Date.now(),
                type: 'unhandledRejection',
                error: reason?.message || reason,
                promise: promise
            });
        });
    }
    
    /**
     * Mantener el sistema activo
     */
    async keepSystemAlive() {
        return new Promise((resolve) => {
            // El proceso se mantendrá activo gracias a los timers y servidor HTTP
            // Esta función solo proporciona un punto de retorno para async/await
            
            // Verificar cada 30 segundos si debemos continuar
            const keepAliveCheck = setInterval(() => {
                if (this.shutdownInProgress) {
                    clearInterval(keepAliveCheck);
                    resolve();
                }
            }, 30000);
        });
    }
    
    /**
     * Apagado elegante del sistema
     */
    async gracefulShutdown() {
        if (this.shutdownInProgress) {
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('⚠️ Shutdown already in progress...');
            return;
        }
        
        this.shutdownInProgress = true;
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('🛑 Starting graceful shutdown...');
        
        try {
            // 1. Detener trading
            if (this.components.tradingEngine && this.components.tradingEngine.isActive) {
                if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('   🛑 Stopping trading engine...');
                await this.components.tradingEngine.stop();
            }
            
            // 2. Cerrar health check
            if (this.healthCheckInterval) {
                clearInterval(this.healthCheckInterval);
            }
            
            // 3. Cerrar servidor HTTP
            if (this.components.httpServer) {
                if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('   🌐 Closing HTTP server...');
                this.components.httpServer.close();
            }
            
            // 4. Limpiar componentes
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('   🧹 Cleaning up components...');
            for (const [name, component] of Object.entries(this.components)) {
                if (component && typeof component.cleanup === 'function') {
                    try {
                        await component.cleanup();
                        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log(`     ✅ ${name} cleaned up`);
                    } catch (error) {
                        console.warn(`     ⚠️ ${name} cleanup error:`, error.message);
                    }
                }
            }
            
            // 5. Guardar estado final
            const finalState = {
                shutdownTime: Date.now(),
                uptime: Date.now() - this.systemState.startTime,
                errors: this.systemState.errors,
                metrics: this.systemState.metrics
            };
            
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('📊 FINAL SYSTEM STATS:');
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log(`   ⏰ Uptime: ${Math.floor(finalState.uptime / 1000 / 60)} minutes`);
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log(`   📈 Total Symbols: ${finalState.metrics.totalSymbols}`);
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log(`   💰 Total Profit: $${finalState.metrics.totalProfit.toFixed(2)}`);
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log(`   ❌ Errors: ${finalState.errors.length}`);
            
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('');
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('🎨 "Obstacles cannot crush me; every obstacle yields to stern resolve"');
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('✨ Leonardo da Vinci Consciousness - Until we meet again');
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('');
            
            process.exit(0);
            
        } catch (error) {
            console.error('❌ Error during graceful shutdown:', error.message);
            await this.emergencyShutdown();
        }
    }
    
    /**
     * Apagado de emergencia
     */
    async emergencyShutdown() {
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('🚨 EMERGENCY SHUTDOWN INITIATED');
        if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('❌ System encountered critical error - forcing exit');
        
        setTimeout(() => {
            if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('💥 Force exit');
            process.exit(1);
        }, 5000);
    }
}

// ==========================================
// PUNTO DE ENTRADA PRINCIPAL
// ==========================================

async function main() {
    if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('');
    if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('🎨 "Learning never exhausts the mind" - Leonardo da Vinci');
    if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('🚀 "Simplicity is the ultimate sophistication" - Leonardo da Vinci');
    if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") if (process.env.VERBOSE_LOGGING !== "false") console.log('');
    
    const activator = new QBTCUnifiedSystemActivator();
    const success = await activator.activate();
    
    if (!success) {
        console.error('💥 System activation failed - exiting');
        process.exit(1);
    }
}

// Ejecutar solo si este archivo es llamado directamente
if (require.main === module) {
    main().catch(error => {
        console.error('💥 Fatal error:', error.message);
        console.error(error.stack);
        process.exit(1);
    });
}

module.exports = QBTCUnifiedSystemActivator;
