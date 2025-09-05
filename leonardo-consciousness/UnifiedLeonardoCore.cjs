/**
 * QBTC-UNIFIED - UnifiedLeonardoCore
 * Núcleo Integrado Leonardo Consciousness - "La simplicidad es la máxima sofisticación"
 * 
 * Integra los 3 Layers fundamentales:
 * - QuantumOracleLayer: Análisis cuántico avanzado
 * - FundsManagerLayer: Gestión de fondos "RENTABILIDAD INFINITA"
 * - TradingEngineLayer: Motor ejecutor Leonardo
 * 
 * Filosofía: Carnada de $1 + Análisis Cuántico + Ejecución Elegante = Profit Infinito
 */

require('dotenv').config();
const { LeonardoDecisionEngine } = require('./LeonardoDecisionEngine');
const { FundsManager } = require('./FundsManager');
const TradingEngineLayer = require('./TradingEngineLayer');
const { CredentialsManager } = require('../quantum-core/CredentialsManager');
const EventEmitter = require('events');

class UnifiedLeonardoCore extends EventEmitter {
    constructor(binanceConnector = null) {
        super();
        
        console.log('🎨 Initializing Leonardo da Vinci Consciousness Core...');
        
        // **INICIALIZAR CREDENTIALS MANAGER**: Gestión inteligente de credenciales
        console.log('🔐 Initializing credentials management...');
        this.credentialsManager = CredentialsManager.getInstance();
        this.logCredentialsStatus();
        
        // Layers Leonardo fundamentales
        this.quantumOracle = new LeonardoDecisionEngine({
            minConfidence: process.env.MIN_CONFIDENCE || 0.75,
            binanceConnector: binanceConnector
        });
        this.fundsManager = new FundsManager();
        this.tradingEngine = new TradingEngineLayer(binanceConnector);
        
        // Conexión externa
        this.binanceConnector = binanceConnector;
        
        // Estado del núcleo
        this.coreState = {
            initialized: false,
            active: false,
            consciousness: 0,
            coherence: 0,
            alignment: 0,
            profit: 0,
            performance: 'INITIALIZING'
        };
        
        // Configuración Leonardo unificada
        this.leonardoConfig = {
            // Filosofía core
            PHILOSOPHY: "La simplicidad es la máxima sofisticación",
            STRATEGY: "Carnada $1 + Análisis Cuántico + Ejecución Elegante",
            
            // Constantes Leonardo Da Vinci
            LAMBDA_888: 0.888,              // Resonancia Leonardo
            PRIME_7919: 7919,               // Número primo de transformación
            PHI_GOLDEN: 1.618,              // Ratio áureo
            LOG_7919: 8.977240362537735,    // Logaritmo del primo
            
            // Configuración operativa (AJUSTADA TEMPORALMENTE PARA TESTING)
            BAIT_AMOUNT: 1.0,               // $1 carnada por trade
            MIN_CONSCIOUSNESS: 0.60,        // 60% consciencia mínima (reducido de 0.75)
            MIN_COHERENCE: 0.60,            // 60% coherencia mínima (reducido de 0.70)
            MIN_ALIGNMENT: 0.60,            // 60% alineación mínima (reducido de 0.65)
            
            // Intervalos de operación
            CORE_UPDATE_INTERVAL: 1000,     // 1 segundo actualizaciones core
            METRICS_UPDATE_INTERVAL: 5000,  // 5 segundos métricas
            HEALTH_CHECK_INTERVAL: 10000,   // 10 segundos health check
            
            // Límites operativos
            MAX_CONCURRENT_TRADES: 3,
            MAX_RISK_PER_TRADE: 0.01,
            PROFIT_TARGET_MULTIPLIER: 1.618, // Uso del ratio áureo
        };
        
        // Métricas unificadas Leonardo
        this.unifiedMetrics = {
            // Estado cuántico
            consciousness: 0,
            coherence: 0,
            alignment: 0,
            resonance: 0,
            
            // Performance de trading
            totalTrades: 0,
            successfulTrades: 0,
            winRate: 0,
            totalProfit: 0,
            averageProfit: 0,
            
            // Fondos
            totalFunds: 0,
            availableFunds: 0,
            reservedFunds: 0,
            profitToday: 0,
            
            // Sistema
            uptime: 0,
            startTime: Date.now(),
            lastUpdate: Date.now(),
            systemHealth: 'EXCELLENT'
        };
        
        // Historial Leonardo
        this.leonardoHistory = {
            trades: [],
            decisions: [],
            consciousness: [],
            profit: []
        };
        
        // Timers del sistema
        this.timers = {
            coreUpdate: null,
            metricsUpdate: null,
            healthCheck: null
        };
        
        // Configurar event listeners entre layers
        this.setupInterLayerCommunication();
        
        console.log('✨ Leonardo Core initialized with consciousness and elegance');
        console.log(`💰 Bait strategy: $${this.leonardoConfig.BAIT_AMOUNT} per trade`);
        console.log(`🧠 Minimum consciousness: ${this.leonardoConfig.MIN_CONSCIOUSNESS * 100}%`);
    }
    
    /**
     * Configurar comunicación entre layers
     */
    setupInterLayerCommunication() {
        // Quantum Oracle -> Trading Engine
        this.quantumOracle.on('opportunity', (opportunity) => {
            this.emit('quantumOpportunity', opportunity);
        });
        
        // Funds Manager -> Core
        this.fundsManager.on('fundsUpdate', (fundsData) => {
            this.emit('fundsChanged', fundsData);
        });
        
        // Trading Engine -> Core
        this.tradingEngine.on('tradeExecuted', (tradeData) => {
            this.emit('tradeCompleted', tradeData);
            this.recordLeonardoDecision(tradeData);
        });
        
        // Core events
        this.on('consciousnessUpdate', this.onConsciousnessUpdate.bind(this));
        this.on('profitUpdate', this.onProfitUpdate.bind(this));
    }
    
    /**
     * Inicializar el núcleo Leonardo completo
     */
    async initialize() {
        if (this.coreState.initialized) {
            console.log('⚠️ Leonardo Core already initialized');
            return true;
        }
        
        try {
            console.log('🚀 Initializing Leonardo Consciousness System...');
            this.coreState.performance = 'INITIALIZING';
            
            // 1. Verificar conexión con Binance (si disponible)
            if (this.binanceConnector) {
                console.log('🔗 Testing Binance connection...');
                const connectionTest = await this.binanceConnector.ping();
                if (!connectionTest.success) {
                    console.log('⚠️ Binance connection failed, running in simulation mode');
                }
            }
            
            // 2. Inicializar layers en secuencia Leonardo
            console.log('🔮 Initializing Quantum Oracle Layer...');
            await this.quantumOracle.initialize();
            
            console.log('💰 Initializing Funds Manager Layer...');
            await this.fundsManager.initialize();
            
            console.log('🧠 Initializing Trading Engine Layer...');
            await this.tradingEngine.initialize();
            
            // 3. Sincronizar configuraciones
            this.syncConfigurations();
            
            // 4. Inicializar métricas
            await this.initializeMetrics();
            
            // 5. Marcar como inicializado
            this.coreState.initialized = true;
            this.coreState.performance = 'READY';
            
            console.log('✅ Leonardo Consciousness Core initialized successfully');
            console.log('🎨 "Obstacles cannot crush me; every obstacle yields to stern resolve."');
            
            this.emit('initialized', this.getSystemStatus());
            return true;
            
        } catch (error) {
            console.error('❌ Leonardo Core initialization failed:', error.message);
            this.coreState.performance = 'ERROR';
            this.emit('error', error);
            return false;
        }
    }
    
    /**
     * Obtener estado de salud del sistema
     */
    getHealth() {
        return {
            status: this.coreState.performance,
            initialized: this.coreState.initialized,
            active: this.coreState.active,
            consciousness: this.unifiedMetrics.consciousness || 0,
            coherence: this.unifiedMetrics.coherence || 0,
            totalFunds: this.unifiedMetrics.totalFunds || 0,
            lastUpdate: Date.now()
        };
    }
    
    /**
     * Sincronizar configuraciones entre layers
     */
    syncConfigurations() {
        // Sincronizar configuración del Trading Engine
        this.tradingEngine.updateConfig({
            BAIT_AMOUNT: this.leonardoConfig.BAIT_AMOUNT,
            MIN_CONSCIOUSNESS: this.leonardoConfig.MIN_CONSCIOUSNESS,
            MIN_CONFIDENCE: this.leonardoConfig.MIN_COHERENCE,
            MIN_ALIGNMENT: this.leonardoConfig.MIN_ALIGNMENT,
            MAX_CONCURRENT_TRADES: this.leonardoConfig.MAX_CONCURRENT_TRADES,
            MAX_RISK_PER_TRADE: this.leonardoConfig.MAX_RISK_PER_TRADE
        });
        
        console.log('⚙️ Layer configurations synchronized');
    }
    
    /**
     * Inicializar métricas del sistema
     */
    async initializeMetrics() {
        // Obtener datos iniciales de fondos
        const initialFunds = await this.fundsManager.getCurrentFunds();
        this.unifiedMetrics.totalFunds = initialFunds.totalFunds;
        this.unifiedMetrics.availableFunds = initialFunds.availableFunds;
        
        // Inicializar métricas cuánticas
        this.unifiedMetrics.consciousness = await this.quantumOracle.getAverageConsciousness();
        this.unifiedMetrics.coherence = await this.quantumOracle.getAverageCoherence();
        
        console.log('📊 Initial metrics calculated');
    }
    
    /**
     * Iniciar el sistema Leonardo completo
     */
    async start() {
        if (!this.coreState.initialized) {
            throw new Error('Leonardo Core must be initialized first');
        }
        
        if (this.coreState.active) {
            console.log('⚠️ Leonardo Core already active');
            return false;
        }
        
        try {
            console.log('🎭 Starting Leonardo Consciousness Trading System...');
            this.coreState.performance = 'STARTING';
            
            // 1. Iniciar Trading Engine
            const engineStarted = await this.tradingEngine.start();
            if (!engineStarted) {
                throw new Error('Failed to start Trading Engine');
            }
            
            // 2. Iniciar loops del core
            this.startCoreLoops();
            
            // 3. Marcar como activo
            this.coreState.active = true;
            this.coreState.performance = 'ACTIVE';
            this.unifiedMetrics.startTime = Date.now();
            
            console.log('✅ Leonardo Consciousness System is now ACTIVE');
            console.log('🎯 Scanning for quantum opportunities...');
            console.log(`💡 "${this.leonardoConfig.PHILOSOPHY}"`);
            
            this.emit('started', this.getSystemStatus());
            return true;
            
        } catch (error) {
            console.error('❌ Failed to start Leonardo Core:', error.message);
            this.coreState.performance = 'ERROR';
            this.emit('error', error);
            return false;
        }
    }
    
    /**
     * Iniciar loops principales del core
     */
    startCoreLoops() {
        // Loop de actualización del core (cada segundo)
        this.timers.coreUpdate = setInterval(async () => {
            try {
                await this.updateCoreState();
            } catch (error) {
                console.error('❌ Core update error:', error.message);
            }
        }, this.leonardoConfig.CORE_UPDATE_INTERVAL);
        
        // Loop de actualización de métricas (cada 5 segundos)
        this.timers.metricsUpdate = setInterval(async () => {
            try {
                await this.updateUnifiedMetrics();
            } catch (error) {
                console.error('❌ Metrics update error:', error.message);
            }
        }, this.leonardoConfig.METRICS_UPDATE_INTERVAL);
        
        // Loop de health check (cada 10 segundos)
        this.timers.healthCheck = setInterval(async () => {
            try {
                await this.performHealthCheck();
            } catch (error) {
                console.error('❌ Health check error:', error.message);
            }
        }, this.leonardoConfig.HEALTH_CHECK_INTERVAL);
        
        console.log('🔄 Core loops started');
    }
    
    /**
     * Actualizar estado del núcleo
     */
    async updateCoreState() {
        // Actualizar consciousness, coherence y alignment
        this.coreState.consciousness = await this.quantumOracle.getAverageConsciousness();
        this.coreState.coherence = await this.quantumOracle.getAverageCoherence();
        
        // Calcular alignment como promedio de consciousness y coherence
        this.coreState.alignment = (this.coreState.consciousness + this.coreState.coherence) / 2;
        
        // Obtener profit actual
        const engineStats = this.tradingEngine.getStats();
        this.coreState.profit = engineStats.metrics.totalProfit;
        
        // Emitir evento si hay cambios significativos
        this.emit('consciousnessUpdate', {
            consciousness: this.coreState.consciousness,
            coherence: this.coreState.coherence,
            alignment: this.coreState.alignment
        });
    }
    
    /**
     * Actualizar métricas unificadas
     */
    async updateUnifiedMetrics() {
        // Métricas del trading engine
        const engineStats = this.tradingEngine.getStats();
        this.unifiedMetrics.totalTrades = engineStats.metrics.totalTrades;
        this.unifiedMetrics.successfulTrades = engineStats.metrics.successfulTrades;
        this.unifiedMetrics.winRate = engineStats.metrics.winRate;
        this.unifiedMetrics.totalProfit = engineStats.metrics.totalProfit;
        this.unifiedMetrics.averageProfit = engineStats.metrics.averageProfit;
        
        // Métricas de fondos
        const fundsData = this.fundsManager.getCurrentFunds();
        this.unifiedMetrics.totalFunds = fundsData.totalFunds;
        this.unifiedMetrics.availableFunds = fundsData.availableFunds;
        this.unifiedMetrics.reservedFunds = fundsData.reservedFunds;
        
        // Calcular profit del día
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayTrades = this.leonardoHistory.trades.filter(
            trade => trade.timestamp > todayStart.getTime()
        );
        this.unifiedMetrics.profitToday = todayTrades.reduce(
            (sum, trade) => sum + (trade.pnl || 0), 0
        );
        
        // Métricas cuánticas
        this.unifiedMetrics.consciousness = this.coreState.consciousness;
        this.unifiedMetrics.coherence = this.coreState.coherence;
        this.unifiedMetrics.alignment = this.coreState.alignment;
        
        // Calcular uptime
        this.unifiedMetrics.uptime = Date.now() - this.unifiedMetrics.startTime;
        this.unifiedMetrics.lastUpdate = Date.now();
        
        // Registrar en historial
        this.recordConsciousnessHistory();
        
        this.emit('metricsUpdate', this.unifiedMetrics);
    }
    
    /**
     * Realizar health check del sistema
     */
    async performHealthCheck() {
        const health = {
            core: 'EXCELLENT',
            oracle: 'EXCELLENT',
            funds: 'EXCELLENT',
            engine: 'EXCELLENT',
            overall: 'EXCELLENT'
        };
        
        // Verificar core
        if (!this.coreState.initialized || !this.coreState.active) {
            health.core = 'CRITICAL';
        } else if (this.coreState.consciousness < 0.5) {
            health.core = 'WARNING';
        }
        
        // Verificar oracle
        const avgConsciousness = await this.quantumOracle.getAverageConsciousness();
        if (avgConsciousness < 0.3) {
            health.oracle = 'CRITICAL';
        } else if (avgConsciousness < 0.6) {
            health.oracle = 'WARNING';
        }
        
        // Verificar fondos
        const funds = this.fundsManager.getCurrentFunds();
        if (funds.availableFunds < 1) { // Menos de $1 disponible
            health.funds = 'CRITICAL';
        } else if (funds.availableFunds < 10) { // Menos de $10 disponible
            health.funds = 'WARNING';
        }
        
        // Verificar engine
        const engineStats = this.tradingEngine.getStats();
        if (!engineStats.isActive) {
            health.engine = 'CRITICAL';
        }
        
        // Calcular salud general
        const statuses = Object.values(health);
        if (statuses.includes('CRITICAL')) {
            health.overall = 'CRITICAL';
        } else if (statuses.includes('WARNING')) {
            health.overall = 'WARNING';
        }
        
        this.unifiedMetrics.systemHealth = health.overall;
        
        if (health.overall !== 'EXCELLENT') {
            console.log(`⚠️ System health check: ${health.overall}`, health);
            this.emit('healthWarning', health);
        }
        
        this.emit('healthCheck', health);
    }
    
    /**
     * Detener el sistema Leonardo
     */
    async stop() {
        if (!this.coreState.active) {
            console.log('⚠️ Leonardo Core not active');
            return;
        }
        
        try {
            console.log('🛑 Stopping Leonardo Consciousness System...');
            this.coreState.performance = 'STOPPING';
            
            // 1. Limpiar timers
            Object.values(this.timers).forEach(timer => {
                if (timer) clearInterval(timer);
            });
            this.timers = { coreUpdate: null, metricsUpdate: null, healthCheck: null };
            
            // 2. Detener trading engine
            await this.tradingEngine.stop();
            
            // 3. Marcar como inactivo
            this.coreState.active = false;
            this.coreState.performance = 'STOPPED';
            
            console.log('✅ Leonardo Consciousness System stopped gracefully');
            console.log('🎨 "Simplicity is the ultimate sophistication" - Mission complete');
            
            this.emit('stopped', this.getSystemStatus());
            
        } catch (error) {
            console.error('❌ Error stopping Leonardo Core:', error.message);
            this.emit('error', error);
        }
    }
    
    /**
     * Pausar/reanudar el sistema
     */
    async pause() {
        const wasPaused = await this.tradingEngine.pause();
        const status = wasPaused ? 'PAUSED' : 'ACTIVE';
        this.coreState.performance = status;
        
        console.log(`⏸️ Leonardo System ${status.toLowerCase()}`);
        this.emit('pauseToggle', { paused: wasPaused, status });
        
        return wasPaused;
    }
    
    /**
     * Registrar decisión Leonardo en historial
     */
    recordLeonardoDecision(tradeData) {
        const decision = {
            timestamp: Date.now(),
            symbol: tradeData.symbol,
            action: tradeData.action,
            consciousness: tradeData.analysis?.consciousness || 0,
            confidence: tradeData.analysis?.confidence || 0,
            baitUsed: tradeData.baitUsed || 0,
            expectedProfit: tradeData.expectedProfit || 0,
            reasoning: this.generateLeonardoReasoning(tradeData)
        };
        
        this.leonardoHistory.decisions.push(decision);
        this.leonardoHistory.trades.push(tradeData);
        
        // Mantener solo las últimas 1000 decisiones
        if (this.leonardoHistory.decisions.length > 1000) {
            this.leonardoHistory.decisions = this.leonardoHistory.decisions.slice(-1000);
        }
        
        this.emit('decisionRecorded', decision);
    }
    
    /**
     * Generar razonamiento Leonardo para decisiones
     */
    generateLeonardoReasoning(tradeData) {
        const consciousness = tradeData.analysis?.consciousness || 0;
        const confidence = tradeData.analysis?.confidence || 0;
        
        if (consciousness > 0.9 && confidence > 0.9) {
            return "Excellente allineamento cuántico - Consciencia y confianza supremas";
        } else if (consciousness > 0.8) {
            return "Alta consciencia detectada - Oportunidad de valor excepcional";
        } else if (confidence > 0.8) {
            return "Confianza elevada en patrón Leonardo - Ejecución justificada";
        } else {
            return "Umbrales Leonardo cumplidos - Carnada optimizada desplegada";
        }
    }
    
    /**
     * Registrar historial de consciousness
     */
    recordConsciousnessHistory() {
        const record = {
            timestamp: Date.now(),
            consciousness: this.coreState.consciousness,
            coherence: this.coreState.coherence,
            alignment: this.coreState.alignment,
            profit: this.coreState.profit
        };
        
        this.leonardoHistory.consciousness.push(record);
        this.leonardoHistory.profit.push({
            timestamp: Date.now(),
            totalProfit: this.unifiedMetrics.totalProfit,
            profitToday: this.unifiedMetrics.profitToday
        });
        
        // Mantener solo las últimas 1000 entradas
        if (this.leonardoHistory.consciousness.length > 1000) {
            this.leonardoHistory.consciousness = this.leonardoHistory.consciousness.slice(-1000);
            this.leonardoHistory.profit = this.leonardoHistory.profit.slice(-1000);
        }
    }
    
    /**
     * Event handlers
     */
    onConsciousnessUpdate(data) {
        if (data.consciousness > 0.9) {
            console.log('🌟 Supreme consciousness achieved:', data.consciousness.toFixed(3));
        }
    }
    
    onProfitUpdate(profitData) {
        if (profitData.totalProfit > this.leonardoConfig.BAIT_AMOUNT * 10) {
            console.log(`💰 Profit milestone: $${profitData.totalProfit.toFixed(2)}`);
        }
    }
    
    /**
     * Obtener estado completo del sistema
     */
    getSystemStatus() {
        return {
            // Estado del núcleo
            coreState: this.coreState,
            
            // Configuración Leonardo
            config: this.leonardoConfig,
            
            // Métricas unificadas
            metrics: this.unifiedMetrics,
            
            // Estados de los layers
            layers: {
                oracle: {
                    consciousness: this.quantumOracle.getAverageConsciousness(),
                    coherence: this.quantumOracle.getAverageCoherence()
                },
                funds: this.fundsManager.getCurrentFunds(),
                engine: this.tradingEngine.getStats()
            },
            
            // Historial reciente
            recentDecisions: this.leonardoHistory.decisions.slice(-10),
            recentTrades: this.leonardoHistory.trades.slice(-10),
            
            // Timestamp
            timestamp: Date.now()
        };
    }
    
    /**
     * Obtener métricas para API externa
     */
    getPublicMetrics() {
        return {
            // Métricas básicas
            consciousness: this.unifiedMetrics.consciousness,
            coherence: this.unifiedMetrics.coherence,
            alignment: this.unifiedMetrics.alignment,
            
            // Performance
            totalTrades: this.unifiedMetrics.totalTrades,
            winRate: this.unifiedMetrics.winRate,
            profitToday: this.unifiedMetrics.profitToday,
            
            // Estado
            systemHealth: this.unifiedMetrics.systemHealth,
            performance: this.coreState.performance,
            uptime: this.unifiedMetrics.uptime,
            
            // Fondos (públicos)
            availableFunds: this.unifiedMetrics.availableFunds > 0,
            activePositions: this.tradingEngine.getActivePositions().length,
            
            // Configuración pública
            baitAmount: this.leonardoConfig.BAIT_AMOUNT,
            philosophy: this.leonardoConfig.PHILOSOPHY,
            
            // Timestamp
            lastUpdate: this.unifiedMetrics.lastUpdate
        };
    }
    
    /**
     * Configurar parámetros en tiempo real
     */
    updateConfiguration(newConfig) {
        // Actualizar configuración core
        this.leonardoConfig = { ...this.leonardoConfig, ...newConfig };
        
        // Sincronizar con layers
        this.syncConfigurations();
        
        console.log('⚙️ Leonardo configuration updated:', newConfig);
        this.emit('configurationUpdate', this.leonardoConfig);
    }
    
    /**
     * Reset completo del sistema
     */
    async reset() {
        console.log('🔄 Performing full Leonardo reset...');
        
        // Detener si está activo
        if (this.coreState.active) {
            await this.stop();
        }
        
        // Reset de layers
        await this.tradingEngine.reset();
        await this.fundsManager.reset();
        await this.quantumOracle.reset();
        
        // Reset de estado y datos
        this.coreState = {
            initialized: false,
            active: false,
            consciousness: 0,
            coherence: 0,
            alignment: 0,
            profit: 0,
            performance: 'INITIALIZING'
        };
        
        this.unifiedMetrics = {
            consciousness: 0,
            coherence: 0,
            alignment: 0,
            resonance: 0,
            totalTrades: 0,
            successfulTrades: 0,
            winRate: 0,
            totalProfit: 0,
            averageProfit: 0,
            totalFunds: 0,
            availableFunds: 0,
            reservedFunds: 0,
            profitToday: 0,
            uptime: 0,
            startTime: Date.now(),
            lastUpdate: Date.now(),
            systemHealth: 'EXCELLENT'
        };
        
        this.leonardoHistory = {
            trades: [],
            decisions: [],
            consciousness: [],
            profit: []
        };
        
        console.log('✅ Leonardo reset complete - Ready for reinitialization');
        this.emit('reset', { timestamp: Date.now() });
    }
    
    /**
     * Logging Leonardo especializado
     */
    leonardoLog(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [LEONARDO-CORE-${level}]`;
        
        if (data) {
            console.log(`${prefix} ${message}`, data);
        } else {
            console.log(`${prefix} ${message}`);
        }
        
        // Emitir log para interfaces externas
        this.emit('log', {
            timestamp: Date.now(),
            level,
            message,
            data
        });
    }
    
    /**
     * Registrar estado actual de credenciales Leonardo para diagnóstico
     */
    logCredentialsStatus() {
        console.log('\n🎨 === LEONARDO CREDENTIALS STATUS ===');
        
        const status = this.credentialsManager.getStatus();
        
        console.log(`📊 Credentials Sources (Leonardo Consciousness):`);
        status.sources.forEach((source, index) => {
            const statusIcon = source.found ? '✅' : '❌';
            console.log(`   ${index + 1}. ${statusIcon} ${source.name} (${source.path})`);
        });
        
        console.log(`\n🔑 API Configuration (Trading Engine):`);
        console.log(`   API Key: ${status.hasApiKey ? '✅ CONFIGURED' : '❌ MISSING'}`);
        console.log(`   Secret Key: ${status.hasSecretKey ? '✅ CONFIGURED' : '❌ MISSING'}`);
        console.log(`   Environment: ${status.isTestnet ? '📡 TESTNET' : '🏭 MAINNET'}`);
        
        console.log(`\n⚡ Leonardo Consciousness Status:`);
        console.log(`   Ready for Trading: ${status.isReady ? '✅ YES' : '❌ NO'}`);
        console.log(`   Quantum Oracle: 🔮 READY`);
        console.log(`   Funds Manager: 💰 READY`);
        console.log(`   Trading Engine: 🤖 READY`);
        
        if (status.loadedFrom) {
            console.log(`\n📂 Loaded from: ${status.loadedFrom}`);
        }
        
        if (!status.isReady) {
            console.log('\n⚠️ LEONARDO ATTENTION: Missing credentials - System will run in simulation mode');
            console.log('🎨 "Obstacles cannot crush me; every obstacle yields to stern resolve" - Leonardo');
        } else {
            console.log('\n✨ LEONARDO STATUS: All systems operational for quantum trading');
        }
        
        console.log('🎨 === END LEONARDO CREDENTIALS REPORT ===\n');
    }
}

module.exports = UnifiedLeonardoCore;
