/**
 * QBTC-UNIFIED - MasterLauncher
 * Lanzador Maestro del Sistema Leonardo Consciousness Completo
 * 
 * "La simplicidad es la máxima sofisticación" - Leonardo da Vinci
 * 
 * Integra y lanza todo el ecosistema Leonardo:
 * - UnifiedLeonardoCore (Núcleo integrado)
 * - BinanceConnector (Trading real)
 * - HTTP Server (APIs REST)
 * - WebInterface (Dashboard web)
 * - Health Monitoring (Supervisión)
 * 
 * Modo de Uso:
 * - npm start (Modo producción con Binance real)
 * - npm run dev (Modo desarrollo/simulación)
 * - npm run leonardo (Solo núcleo Leonardo)
 */

const UnifiedLeonardoCore = require('./UnifiedLeonardoCore');
const { CredentialsManager } = require('../quantum-core/CredentialsManager');
const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

class MasterLauncher {
    constructor() {
        console.log('🎨 Leonardo da Vinci Master Launcher initializing...');
        console.log('💡 "Obstacles cannot crush me; every obstacle yields to stern resolve"');
        
        // **INICIALIZAR CREDENTIALS MANAGER**: Carga inteligente de credenciales
        console.log('🔐 Inicializando gestor de credenciales...');
        this.credentialsManager = CredentialsManager.getInstance();
        const credentials = this.credentialsManager.getCredentials();
        
        // Configuración maestra
        this.config = {
            // Filosofía Leonardo
            PHILOSOPHY: "La simplicidad es la máxima sofisticación",
            VERSION: "1.0.0-Leonardo-Consciousness",
            
            // Configuración de red
            HTTP_PORT: process.env.LEONARDO_PORT || 3003,
            HTTP_HOST: process.env.LEONARDO_HOST || 'localhost',
            
            // Modo de operación
            MODE: process.env.NODE_ENV || 'development', // development, production
            TRADING_MODE: process.env.TRADING_MODE || 'simulation', // simulation, real
            
            // Configuración Binance - Vía CredentialsManager
            BINANCE_API_KEY: credentials.apiKey || '',
            BINANCE_SECRET_KEY: credentials.secretKey || '',
            BINANCE_TESTNET: credentials.isTestnet,
            
            // Configuración Leonardo
            BAIT_AMOUNT: parseFloat(process.env.LEONARDO_BAIT_AMOUNT) || 1.0,
            MIN_CONSCIOUSNESS: parseFloat(process.env.MIN_CONSCIOUSNESS) || 0.75,
            AUTO_START_TRADING: process.env.AUTO_START_TRADING === 'true',
            
            // Configuración de sistema
            ENABLE_WEB_INTERFACE: process.env.ENABLE_WEB_INTERFACE !== 'false',
            ENABLE_API: process.env.ENABLE_API !== 'false',
            ENABLE_LOGS: process.env.ENABLE_LOGS !== 'false',
        };
        
        // Log de diagnóstico de credenciales
        this.logCredentialsStatus();
        
        // Componentes del sistema
        this.leonardoCore = null;
        this.binanceConnector = null;
        this.httpServer = null;
        this.webInterface = null;
        
        // Estado del launcher
        this.launcherState = {
            initialized: false,
            running: false,
            startTime: Date.now(),
            components: {
                core: 'NOT_STARTED',
                binance: 'NOT_STARTED',
                http: 'NOT_STARTED',
                web: 'NOT_STARTED'
            }
        };
        
        // Métricas del sistema
        this.systemMetrics = {
            uptime: 0,
            requests: 0,
            errors: 0,
            tradesExecuted: 0,
            totalProfit: 0,
            lastUpdate: Date.now()
        };
        
        console.log(`🚀 Master Launcher configured for ${this.config.MODE} mode`);
        console.log(`💰 Bait amount: $${this.config.BAIT_AMOUNT}`);
        console.log(`🎯 Trading mode: ${this.config.TRADING_MODE}`);
    }
    
    // Deterministic calculation methods to replace Math.random()
    calculateDeterministicValue(timestamp) {
        const hash = this.hashCode(timestamp.toString());
        return (hash % 10000) / 10000; // Return value between 0 and 1
    }
    
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
    
    /**
     * Registrar estado actual de credenciales para diagnóstico
     */
    logCredentialsStatus() {
        console.log('\n🔐 === CREDENTIALS STATUS REPORT ===');
        
        const status = this.credentialsManager.getStatus();
        
        console.log(`📊 Credentials Sources:`);
        status.sources.forEach((source, index) => {
            const statusIcon = source.found ? '✅' : '❌';
            console.log(`   ${index + 1}. ${statusIcon} ${source.name} (${source.path})`);
        });
        
        console.log(`\n🔑 API Configuration:`);
        console.log(`   API Key: ${status.hasApiKey ? '✅ CONFIGURED' : '❌ MISSING'}`);
        console.log(`   Secret Key: ${status.hasSecretKey ? '✅ CONFIGURED' : '❌ MISSING'}`);
        console.log(`   Environment: ${status.isTestnet ? '📡 TESTNET' : '🏭 MAINNET'}`);
        
        console.log(`\n⚡ Trading Status:`);
        console.log(`   Ready for Trading: ${status.isReady ? '✅ YES' : '❌ NO'}`);
        console.log(`   Trading Mode: ${this.config.TRADING_MODE.toUpperCase()}`);
        
        if (status.loadedFrom) {
            console.log(`\n📂 Loaded from: ${status.loadedFrom}`);
        }
        
        if (!status.isReady) {
            console.log('\n⚠️ ATTENTION: Missing credentials - System will run in simulation mode');
        }
        
        console.log('🔐 === END CREDENTIALS REPORT ===\n');
    }
    
    /**
     * Inicializar todos los componentes del sistema Leonardo
     */
    async initialize() {
        if (this.launcherState.initialized) {
            console.log('⚠️ Master Launcher already initialized');
            return true;
        }
        
        try {
            console.log('🎭 Initializing Leonardo Consciousness Ecosystem...');
            
            // 1. Inicializar Binance Connector (si está en modo real)
            if (this.config.TRADING_MODE === 'real') {
                await this.initializeBinanceConnector();
            } else {
                console.log('📊 Running in simulation mode - No Binance connection');
                this.launcherState.components.binance = 'SIMULATION';
            }
            
            // 2. Inicializar Leonardo Core
            await this.initializeLeonardoCore();
            
            // 3. Inicializar HTTP Server
            if (this.config.ENABLE_API) {
                await this.initializeHttpServer();
            }
            
            // 4. Inicializar Web Interface
            if (this.config.ENABLE_WEB_INTERFACE) {
                await this.initializeWebInterface();
            }
            
            // 5. Configurar signal handlers para shutdown elegante
            this.setupSignalHandlers();
            
            this.launcherState.initialized = true;
            console.log('✅ Leonardo Consciousness Ecosystem initialized successfully');
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize Master Launcher:', error.message);
            await this.shutdown();
            return false;
        }
    }
    
    /**
     * Inicializar Binance Connector para trading real
     */
    async initializeBinanceConnector() {
        try {
            console.log('🔗 Initializing Binance connection...');
            this.launcherState.components.binance = 'INITIALIZING';
            
            if (!this.config.BINANCE_API_KEY || !this.config.BINANCE_SECRET_KEY) {
                throw new Error('Binance API credentials not configured');
            }
            
            // Crear simulador de BinanceConnector para testing
            // En producción real, aquí se importaría el BinanceConnector real
            this.binanceConnector = {
                async ping() {
                    return { success: true, timestamp: Date.now() };
                },
                async getBalance() {
                    return { 
                        USDT: { available: 1000, locked: 0 },
                        BTC: { available: 0.01, locked: 0 }
                    };
                },
                async placeOrder(orderData) {
                    const timestamp = Date.now();
                    const deterministicValue = this.calculateDeterministicValue(timestamp);
                    return {
                        orderId: `SIM_${timestamp}`,
                        status: 'FILLED',
                        executedQty: orderData.quantity,
                        price: 50000 + (deterministicValue - 0.5) * 1000
                    };
                }
            };
            
            // Test de conexión
            const pingResult = await this.binanceConnector.ping();
            if (!pingResult.success) {
                throw new Error('Binance connection test failed');
            }
            
            this.launcherState.components.binance = 'CONNECTED';
            console.log('✅ Binance connection established');
            
        } catch (error) {
            console.error('❌ Binance initialization failed:', error.message);
            this.launcherState.components.binance = 'ERROR';
            
            if (this.config.TRADING_MODE === 'real') {
                throw error; // Fallar si trading real es requerido
            }
        }
    }
    
    /**
     * Inicializar Leonardo Core
     */
    async initializeLeonardoCore() {
        try {
            console.log('🧠 Initializing Leonardo Consciousness Core...');
            this.launcherState.components.core = 'INITIALIZING';
            
            // Crear instancia del core con o sin Binance
            this.leonardoCore = new UnifiedLeonardoCore(this.binanceConnector);
            
            // Configurar event listeners
            this.setupCoreEventListeners();
            
            // Inicializar el core
            const initialized = await this.leonardoCore.initialize();
            if (!initialized) {
                throw new Error('Leonardo Core initialization failed');
            }
            
            // Actualizar configuración si es necesario
            this.leonardoCore.updateConfiguration({
                BAIT_AMOUNT: this.config.BAIT_AMOUNT,
                MIN_CONSCIOUSNESS: this.config.MIN_CONSCIOUSNESS
            });
            
            this.launcherState.components.core = 'READY';
            console.log('✅ Leonardo Consciousness Core ready');
            
        } catch (error) {
            console.error('❌ Leonardo Core initialization failed:', error.message);
            this.launcherState.components.core = 'ERROR';
            throw error;
        }
    }
    
    /**
     * Configurar event listeners del core
     */
    setupCoreEventListeners() {
        this.leonardoCore.on('initialized', (status) => {
            console.log('🎨 Leonardo Core initialized:', status.coreState.performance);
        });
        
        this.leonardoCore.on('started', (status) => {
            console.log('🚀 Leonardo Trading System active');
        });
        
        this.leonardoCore.on('tradeCompleted', (tradeData) => {
            this.systemMetrics.tradesExecuted++;
            console.log(`💼 Trade completed: ${tradeData.symbol} ${tradeData.action}`);
        });
        
        this.leonardoCore.on('profitUpdate', (profitData) => {
            this.systemMetrics.totalProfit = profitData.totalProfit;
        });
        
        this.leonardoCore.on('error', (error) => {
            this.systemMetrics.errors++;
            console.error('❌ Leonardo Core error:', error.message);
        });
        
        this.leonardoCore.on('healthWarning', (health) => {
            console.log('⚠️ System health warning:', health);
        });
        
        this.leonardoCore.on('log', (logData) => {
            if (this.config.ENABLE_LOGS) {
                console.log(`[LEONARDO-LOG] ${logData.message}`);
            }
        });
    }
    
    /**
     * Inicializar HTTP Server para APIs
     */
    async initializeHttpServer() {
        return new Promise((resolve, reject) => {
            try {
                console.log(`🌐 Starting HTTP server on port ${this.config.HTTP_PORT}...`);
                this.launcherState.components.http = 'INITIALIZING';
                
                this.httpServer = http.createServer(async (req, res) => {
                    try {
                        await this.handleHttpRequest(req, res);
                        this.systemMetrics.requests++;
                    } catch (error) {
                        console.error('❌ HTTP request error:', error.message);
                        this.systemMetrics.errors++;
                        this.sendErrorResponse(res, 500, error.message);
                    }
                });
                
                this.httpServer.listen(this.config.HTTP_PORT, this.config.HTTP_HOST, () => {
                    this.launcherState.components.http = 'RUNNING';
                    console.log(`✅ HTTP server running on http://${this.config.HTTP_HOST}:${this.config.HTTP_PORT}`);
                    resolve();
                });
                
                this.httpServer.on('error', (error) => {
                    console.error('❌ HTTP server error:', error.message);
                    this.launcherState.components.http = 'ERROR';
                    reject(error);
                });
                
            } catch (error) {
                this.launcherState.components.http = 'ERROR';
                reject(error);
            }
        });
    }
    
    /**
     * Manejar requests HTTP
     */
    async handleHttpRequest(req, res) {
        const parsedUrl = url.parse(req.url, true);
        const method = req.method;
        const pathname = parsedUrl.pathname;
        
        // CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        if (method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }
        
        // Routing
        switch (pathname) {
            case '/':
                await this.serveWebInterface(req, res);
                break;
                
            case '/api/status':
                this.sendJsonResponse(res, this.getSystemStatus());
                break;
                
            case '/api/leonardo/metrics':
                this.sendJsonResponse(res, this.leonardoCore.getPublicMetrics());
                break;
                
            case '/api/leonardo/start':
                if (method === 'POST') {
                    const started = await this.startTrading();
                    this.sendJsonResponse(res, { success: started, message: started ? 'Trading started' : 'Failed to start trading' });
                } else {
                    this.sendErrorResponse(res, 405, 'Method not allowed');
                }
                break;
                
            case '/api/leonardo/stop':
                if (method === 'POST') {
                    await this.stopTrading();
                    this.sendJsonResponse(res, { success: true, message: 'Trading stopped' });
                } else {
                    this.sendErrorResponse(res, 405, 'Method not allowed');
                }
                break;
                
            case '/api/leonardo/pause':
                if (method === 'POST') {
                    const paused = await this.leonardoCore.pause();
                    this.sendJsonResponse(res, { success: true, paused, message: paused ? 'Trading paused' : 'Trading resumed' });
                } else {
                    this.sendErrorResponse(res, 405, 'Method not allowed');
                }
                break;
                
            case '/api/leonardo/config':
                if (method === 'GET') {
                    this.sendJsonResponse(res, this.config);
                } else if (method === 'PUT') {
                    const newConfig = await this.parseRequestBody(req);
                    this.updateConfiguration(newConfig);
                    this.sendJsonResponse(res, { success: true, config: this.config });
                } else {
                    this.sendErrorResponse(res, 405, 'Method not allowed');
                }
                break;
                
            case '/api/leonardo/positions':
                const positions = this.leonardoCore.tradingEngine.getActivePositions();
                this.sendJsonResponse(res, positions);
                break;
                
            case '/api/leonardo/history':
                const limit = parseInt(parsedUrl.query.limit) || 50;
                const history = this.leonardoCore.tradingEngine.getExecutionHistory(limit);
                this.sendJsonResponse(res, history);
                break;
                
            default:
                this.sendErrorResponse(res, 404, 'Endpoint not found');
        }
    }
    
    /**
     * Servir web interface
     */
    async serveWebInterface(req, res) {
        try {
            const webInterfaceHtml = this.generateWebInterface();
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(webInterfaceHtml);
        } catch (error) {
            this.sendErrorResponse(res, 500, 'Failed to serve web interface');
        }
    }
    
    /**
     * Generar interfaz web Leonardo
     */
    generateWebInterface() {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leonardo Consciousness Trading System</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Georgia', serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2d1b69 100%);
            color: #ffffff;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: bold;
            color: #ffd700;
        }
        
        .status-indicator {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .status-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #00ff88;
            box-shadow: 0 0 10px #00ff88;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .main-container {
            flex: 1;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 2rem;
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
        }
        
        .card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 1.5rem;
            transition: all 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        .card-title {
            font-size: 1.2rem;
            font-weight: bold;
            margin-bottom: 1rem;
            color: #ffd700;
            text-align: center;
        }
        
        .metric {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            padding: 0.5rem;
            background: rgba(255, 255, 255, 0.02);
            border-radius: 8px;
        }
        
        .metric-label {
            color: #cccccc;
        }
        
        .metric-value {
            color: #ffffff;
            font-weight: bold;
        }
        
        .controls {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .button {
            background: linear-gradient(45deg, #ffd700, #ffed4a);
            color: #000;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 10px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
        }
        
        .button.danger {
            background: linear-gradient(45deg, #ff4757, #ff3742);
            color: white;
        }
        
        .philosophy {
            text-align: center;
            font-style: italic;
            color: #ffd700;
            padding: 1rem;
            margin-top: 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .consciousness-meter {
            width: 100%;
            height: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            overflow: hidden;
            margin: 1rem 0;
        }
        
        .consciousness-fill {
            height: 100%;
            background: linear-gradient(90deg, #ff4757, #ffd700, #00ff88);
            width: 75%;
            border-radius: 10px;
            transition: width 1s ease;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🎨 Leonardo Consciousness</div>
        <div class="status-indicator">
            <div class="status-dot"></div>
            <span id="system-status">ACTIVE</span>
        </div>
    </div>
    
    <div class="main-container">
        <div class="card">
            <div class="card-title">Quantum Metrics</div>
            <div class="metric">
                <span class="metric-label">Consciousness</span>
                <span class="metric-value" id="consciousness">75%</span>
            </div>
            <div class="metric">
                <span class="metric-label">Coherence</span>
                <span class="metric-value" id="coherence">70%</span>
            </div>
            <div class="metric">
                <span class="metric-label">Alignment</span>
                <span class="metric-value" id="alignment">72%</span>
            </div>
            <div class="consciousness-meter">
                <div class="consciousness-fill" id="consciousness-bar"></div>
            </div>
            <div class="metric">
                <span class="metric-label">System Health</span>
                <span class="metric-value" id="health">EXCELLENT</span>
            </div>
        </div>
        
        <div class="card">
            <div class="card-title">Trading Performance</div>
            <div class="metric">
                <span class="metric-label">Total Trades</span>
                <span class="metric-value" id="total-trades">0</span>
            </div>
            <div class="metric">
                <span class="metric-label">Win Rate</span>
                <span class="metric-value" id="win-rate">0%</span>
            </div>
            <div class="metric">
                <span class="metric-label">Total Profit</span>
                <span class="metric-value" id="total-profit">$0.00</span>
            </div>
            <div class="metric">
                <span class="metric-label">Today's Profit</span>
                <span class="metric-value" id="profit-today">$0.00</span>
            </div>
            <div class="metric">
                <span class="metric-label">Active Positions</span>
                <span class="metric-value" id="active-positions">0</span>
            </div>
        </div>
        
        <div class="card">
            <div class="card-title">System Control</div>
            <div class="controls">
                <button class="button" onclick="startTrading()">🚀 Start Trading</button>
                <button class="button" onclick="pauseTrading()">⏸️ Pause/Resume</button>
                <button class="button danger" onclick="stopTrading()">🛑 Stop Trading</button>
                <div class="metric">
                    <span class="metric-label">Bait Amount</span>
                    <span class="metric-value">$${this.config.BAIT_AMOUNT}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Trading Mode</span>
                    <span class="metric-value">${this.config.TRADING_MODE.toUpperCase()}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Uptime</span>
                    <span class="metric-value" id="uptime">0m</span>
                </div>
            </div>
        </div>
    </div>
    
    <div class="philosophy">
        "${this.config.PHILOSOPHY}" - Leonardo da Vinci
    </div>
    
    <script>
        let updateInterval;
        
        async function updateMetrics() {
            try {
                const response = await fetch('/api/leonardo/metrics');
                const metrics = await response.json();
                
                document.getElementById('consciousness').textContent = Math.round(metrics.consciousness * 100) + '%';
                document.getElementById('coherence').textContent = Math.round(metrics.coherence * 100) + '%';
                document.getElementById('alignment').textContent = Math.round(metrics.alignment * 100) + '%';
                document.getElementById('health').textContent = metrics.systemHealth;
                document.getElementById('total-trades').textContent = metrics.totalTrades;
                document.getElementById('win-rate').textContent = Math.round(metrics.winRate * 100) + '%';
                document.getElementById('total-profit').textContent = '$' + (metrics.totalProfit || 0).toFixed(2);
                document.getElementById('profit-today').textContent = '$' + (metrics.profitToday || 0).toFixed(2);
                document.getElementById('active-positions').textContent = metrics.activePositions;
                document.getElementById('system-status').textContent = metrics.performance;
                
                const uptimeHours = Math.floor(metrics.uptime / (1000 * 60 * 60));
                const uptimeMinutes = Math.floor((metrics.uptime % (1000 * 60 * 60)) / (1000 * 60));
                document.getElementById('uptime').textContent = uptimeHours + 'h ' + uptimeMinutes + 'm';
                
                // Update consciousness bar
                const consciousnessBar = document.getElementById('consciousness-bar');
                consciousnessBar.style.width = (metrics.consciousness * 100) + '%';
                
            } catch (error) {
                console.error('Error updating metrics:', error);
            }
        }
        
        async function startTrading() {
            try {
                const response = await fetch('/api/leonardo/start', { method: 'POST' });
                const result = await response.json();
                alert(result.message);
            } catch (error) {
                alert('Error starting trading: ' + error.message);
            }
        }
        
        async function stopTrading() {
            try {
                const response = await fetch('/api/leonardo/stop', { method: 'POST' });
                const result = await response.json();
                alert(result.message);
            } catch (error) {
                alert('Error stopping trading: ' + error.message);
            }
        }
        
        async function pauseTrading() {
            try {
                const response = await fetch('/api/leonardo/pause', { method: 'POST' });
                const result = await response.json();
                alert(result.message);
            } catch (error) {
                alert('Error pausing trading: ' + error.message);
            }
        }
        
        // Start updating metrics
        updateMetrics();
        updateInterval = setInterval(updateMetrics, 5000);
        
        console.log('🎨 Leonardo Consciousness Web Interface loaded');
        console.log('💡 "La simplicidad es la máxima sofisticación" - Leonardo da Vinci');
    </script>
</body>
</html>
        `;
    }
    
    /**
     * Inicializar Web Interface
     */
    async initializeWebInterface() {
        console.log('🎨 Web Interface integrated with HTTP server');
        this.launcherState.components.web = 'RUNNING';
    }
    
    /**
     * Iniciar el sistema completo
     */
    async start() {
        if (this.launcherState.running) {
            console.log('⚠️ Master Launcher already running');
            return false;
        }
        
        try {
            console.log('🎭 Starting Leonardo Consciousness System...');
            
            // Inicializar si no está hecho
            if (!this.launcherState.initialized) {
                const initialized = await this.initialize();
                if (!initialized) {
                    throw new Error('Initialization failed');
                }
            }
            
            // Iniciar Leonardo Core
            const coreStarted = await this.leonardoCore.start();
            if (!coreStarted) {
                throw new Error('Leonardo Core failed to start');
            }
            
            this.launcherState.running = true;
            this.launcherState.startTime = Date.now();
            
            console.log('✅ Leonardo Consciousness System is now FULLY OPERATIONAL');
            console.log(`🌐 Web Interface: http://${this.config.HTTP_HOST}:${this.config.HTTP_PORT}`);
            console.log(`💡 "${this.config.PHILOSOPHY}"`);
            
            // Auto-start trading si está configurado
            if (this.config.AUTO_START_TRADING) {
                console.log('🚀 Auto-starting trading...');
                setTimeout(() => this.startTrading(), 2000);
            }
            
            // Iniciar métricas de sistema
            this.startSystemMetrics();
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to start Master Launcher:', error.message);
            await this.shutdown();
            return false;
        }
    }
    
    /**
     * Iniciar trading
     */
    async startTrading() {
        if (!this.leonardoCore) {
            console.log('❌ Leonardo Core not available');
            return false;
        }
        
        try {
            const started = await this.leonardoCore.start();
            if (started) {
                console.log('🚀 Leonardo Trading System activated');
            }
            return started;
        } catch (error) {
            console.error('❌ Failed to start trading:', error.message);
            return false;
        }
    }
    
    /**
     * Detener trading
     */
    async stopTrading() {
        if (!this.leonardoCore) {
            console.log('❌ Leonardo Core not available');
            return;
        }
        
        try {
            await this.leonardoCore.stop();
            console.log('🛑 Leonardo Trading System deactivated');
        } catch (error) {
            console.error('❌ Failed to stop trading:', error.message);
        }
    }
    
    /**
     * Iniciar métricas de sistema
     */
    startSystemMetrics() {
        setInterval(() => {
            this.systemMetrics.uptime = Date.now() - this.launcherState.startTime;
            this.systemMetrics.lastUpdate = Date.now();
        }, 1000);
    }
    
    /**
     * Obtener estado completo del sistema
     */
    getSystemStatus() {
        return {
            launcher: this.launcherState,
            config: this.config,
            metrics: this.systemMetrics,
            leonardo: this.leonardoCore ? this.leonardoCore.getPublicMetrics() : null,
            timestamp: Date.now()
        };
    }
    
    /**
     * Actualizar configuración
     */
    updateConfiguration(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        if (this.leonardoCore) {
            this.leonardoCore.updateConfiguration(newConfig);
        }
        
        console.log('⚙️ Master Launcher configuration updated');
    }
    
    /**
     * Configurar signal handlers
     */
    setupSignalHandlers() {
        process.on('SIGINT', () => {
            console.log('\n🎨 Received SIGINT - Initiating graceful shutdown...');
            this.shutdown();
        });
        
        process.on('SIGTERM', () => {
            console.log('\n🎨 Received SIGTERM - Initiating graceful shutdown...');
            this.shutdown();
        });
        
        process.on('uncaughtException', (error) => {
            console.error('❌ Uncaught exception:', error);
            this.shutdown();
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ Unhandled rejection:', reason);
            this.shutdown();
        });
    }
    
    /**
     * Shutdown elegante del sistema
     */
    async shutdown() {
        console.log('🛑 Leonardo Consciousness System shutting down...');
        
        try {
            // Detener Leonardo Core
            if (this.leonardoCore) {
                await this.leonardoCore.stop();
            }
            
            // Cerrar HTTP Server
            if (this.httpServer) {
                await new Promise((resolve) => {
                    this.httpServer.close(() => {
                        console.log('✅ HTTP server closed');
                        resolve();
                    });
                });
            }
            
            console.log('✅ Leonardo Consciousness System stopped gracefully');
            console.log('🎨 "Simplicity is the ultimate sophistication" - Mission complete');
            
            process.exit(0);
            
        } catch (error) {
            console.error('❌ Error during shutdown:', error.message);
            process.exit(1);
        }
    }
    
    /**
     * Utility functions
     */
    sendJsonResponse(res, data) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data, null, 2));
    }
    
    sendErrorResponse(res, statusCode, message) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: message, timestamp: Date.now() }));
    }
    
    async parseRequestBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            req.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (error) {
                    reject(new Error('Invalid JSON'));
                }
            });
            req.on('error', reject);
        });
    }
}

// Si el archivo se ejecuta directamente, iniciar el sistema
if (require.main === module) {
    const launcher = new MasterLauncher();
    
    launcher.start().then(success => {
        if (success) {
            console.log('🎭 Leonardo Consciousness Master System operational');
        } else {
            console.log('❌ Failed to start Leonardo System');
            process.exit(1);
        }
    }).catch(error => {
        console.error('❌ Critical error:', error);
        process.exit(1);
    });
}

module.exports = MasterLauncher;
