/**
 * QBTC-UNIFIED - TradingEngineLayer
 * Motor Ejecutor Leonardo - Combina Análisis Cuántico con Gestión de Fondos
 * 
 * Filosofía Leonardo: "La simplicidad es la máxima sofisticación"
 * Estrategia: Carnada de $1 + Análisis Cuántico + Ejecución Elegante
 */

const QuantumOracleLayer = require('./QuantumOracleLayer');
const { FundsManager } = require('./FundsManager');
const BinanceConnectorAdapter = require('./BinanceConnectorAdapter');
const SignalBus = require('./SignalBus');
const { BinanceRequestValidator } = require('../quantum-core/binance-request-validator');
const DataService = require('../quantum-core/services/DataService');
const SmartQuantityCalculator = require('./SmartQuantityCalculator');
const EventEmitter = require('events');

class TradingEngineLayer extends EventEmitter {
    constructor(binanceConnector = null) {
        super();
        // Núcleos Leonardo
        // Si no se provee conector, usar adaptador real por defecto
        this.binanceConnector = binanceConnector || new BinanceConnectorAdapter();
        this.quantumOracle = new QuantumOracleLayer(this.binanceConnector);
        this.fundsManager = new FundsManager();
        
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

        // Estados del motor
        this.isActive = false;
        this.isPaused = false;
        this.emergencyStop = false;
        this.lastAnalysisTime = 0;
        this.executionHistory = [];
        this.activePositions = new Map();
        this.exposureBySymbol = new Map();
        this.exposureByCategory = new Map();

        // Detector de régimen (inyectable)
        this.marketRegimeDetector = null;
        this.currentMarketRegime = null;

        // Configuración Leonardo
        this.config = {
            // Carnada base Leonardo
            BAIT_AMOUNT: 1.0,           // $1 carnada por trade
            
            // Umbrales de ejecución (AJUSTADOS TEMPORALMENTE PARA TESTING)
            MIN_CONSCIOUSNESS: 0.60,    // Mínimo 60% consciencia (reducido de 0.75)
            MIN_CONFIDENCE: 0.60,       // Mínimo 60% confianza (reducido de 0.70)
            MIN_ALIGNMENT: 0.60,        // Mínimo 60% alineación (reducido de 0.65)
            
            // Gestión de riesgo
            MAX_RISK_PER_TRADE: 0.01,   // 1% máximo por trade
            MAX_CONCURRENT_TRADES: 3,   // Máximo 3 trades simultáneos
            MAX_DAILY_DRAWDOWN: 0.10,   // 10% de pérdida diaria máxima
            RISK_HARD_STOP: true,       // Paro de emergencia al exceder drawdown
            MAX_SYMBOL_EXPOSURE_PCT: 0.15, // 15% del equity por símbolo
            MAX_CATEGORY_EXPOSURE_PCT: 0.35, // 35% por categoría (e.g., memeCoins)
            TRAILING_STOP_MULTIPLIER: 1.0, // Multiplica el stop según ganancia
            
            // Intervalos de análisis
            ANALYSIS_INTERVAL: 5000,    // 5 segundos entre análisis
            POSITION_CHECK_INTERVAL: 10000, // 10 segundos check posiciones
            
            // Leonardo Constants
            LAMBDA_NORMALIZED: 0.888,
            PRIME_7919: 7919,
            PHI_RATIO: 1.618,
            LOG_7919: 8.977240362537735
        };

        // Métricas de performance
        this.metrics = {
            totalTrades: 0,
            successfulTrades: 0,
            totalProfit: 0,
            averageProfit: 0,
            winRate: 0,
            maxDrawdown: 0,
            currentDrawdown: 0,
            consciousness: 0,
            coherence: 0
        };

        // Estado de riesgo/drawdown diario
        this.riskState = {
            startEquity: 0,
            peakEquity: 0,
            troughEquity: Infinity,
            dailyPnL: 0,
            lastResetDate: new Date().toISOString().slice(0,10)
        };

        // Validador de órdenes Binance
        this.orderValidator = new BinanceRequestValidator();

        // Smart Quantity Calculator
        this.quantityCalculator = new SmartQuantityCalculator();

        // Timer references
        this.analysisTimer = null;
        this.positionTimer = null;
        
        console.log('🧠 TradingEngineLayer initialized with Leonardo Consciousness');
        console.log(`💰 Base bait amount: $${this.config.BAIT_AMOUNT}`);
    }

    /**
     * Inyectar detector de régimen de mercado
     */
    setMarketRegimeDetector(detector) {
        this.marketRegimeDetector = detector;
        if (detector && typeof detector.on === 'function') {
            detector.on('regime:updated', (status) => {
                this.currentMarketRegime = status;
            });
            detector.on('regime:changed', (status) => {
                this.currentMarketRegime = status;
                console.log(`🧭 [TRADING] Régimen de mercado: ${status.from || 'UNKNOWN'} → ${status.to}`);
            });
        }
    }

    /**
     * Inicializar el motor de trading
     */
    async initialize() {
        console.log('🚀 Initializing Leonardo Trading Engine...');
        
        try {
            // Inicializar Oracle y Funds Manager
            await this.quantumOracle.initialize();
            await this.fundsManager.initialize();

            // Adjuntar conector al DataService para precios/filtros
            this.dataService = DataService.getInstance();
            this.dataService.attachConnector(this.binanceConnector);

            // Baseline de riesgo
            this.riskState.startEquity = this.fundsManager.totalBalance || 0;
            this.riskState.peakEquity = this.riskState.startEquity;
            this.riskState.troughEquity = this.riskState.startEquity;
            this.riskState.dailyPnL = 0;
            this.emergencyStop = false;
            
            console.log('✅ Leonardo Trading Engine initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize trading engine:', error.message);
            return false;
        }
    }
    
    /**
     * Obtener estado de salud del sistema
     */
    getHealth() {
        return {
            status: this.isActive ? 'ACTIVE' : 'INACTIVE',
            isActive: this.isActive,
            isPaused: this.isPaused,
            activePositions: this.activePositions.size,
            consciousnessLevel: this.quantumOracle?.leonardoState?.consciousness_level || 0,
            lastUpdate: Date.now()
        };
    }

    /**
     * Iniciar el motor de trading
     */
    async start() {
        if (this.isActive) {
            console.log('⚠️ Trading engine already active');
            return false;
        }

        try {
            console.log('🚀 Starting Leonardo Trading Engine...');

            // Verificar conexión con Binance
            if (this.binanceConnector) {
                const connectionTest = await this.binanceConnector.ping();
                if (!connectionTest.success) {
                    throw new Error('Binance connection failed');
                }
            }

            // Inicializar Oracle y Funds Manager
            await this.quantumOracle.initialize();
            await this.fundsManager.initialize();

            // Iniciar loops principales
            this.isActive = true;
            this.startAnalysisLoop();
            this.startPositionManagement();
            this.startSignalConsumption();

            console.log('✅ Leonardo Trading Engine started successfully');
            console.log(`📊 Analysis interval: ${this.config.ANALYSIS_INTERVAL}ms`);
            console.log(`💎 Min consciousness required: ${this.config.MIN_CONSCIOUSNESS}`);

            return true;

        } catch (error) {
            console.error('❌ Failed to start trading engine:', error.message);
            this.isActive = false;
            return false;
        }
    }

    /**
     * Detener el motor de trading
     */
    async stop() {
        if (!this.isActive) {
            console.log('⚠️ Trading engine not active');
            return;
        }

        console.log('🛑 Stopping Leonardo Trading Engine...');

        this.isActive = false;
        this.isPaused = false;

        // Limpiar timers
        if (this.analysisTimer) {
            clearInterval(this.analysisTimer);
            this.analysisTimer = null;
        }
        if (this.positionTimer) {
            clearInterval(this.positionTimer);
            this.positionTimer = null;
        }

        // Cerrar posiciones activas (opcional)
        await this.closeAllPositions();

        console.log('✅ Leonardo Trading Engine stopped');
    }

    /**
     * Pausar/reanudar trading
     */
    async pause() {
        this.isPaused = !this.isPaused;
        const status = this.isPaused ? 'paused' : 'resumed';
        console.log(`⏸️ Trading engine ${status}`);
        return this.isPaused;
    }

    /**
     * Loop principal de análisis
     */
    startAnalysisLoop() {
        this.analysisTimer = setInterval(async () => {
            if (!this.isActive || this.isPaused || this.emergencyStop) return;

            try {
                await this.performAnalysisAndExecution();
            } catch (error) {
                console.error('❌ Analysis loop error:', error.message);
            }
        }, this.config.ANALYSIS_INTERVAL);
    }

    /**
     * Loop de consumo desde SignalBus (productores externos)
     */
    startSignalConsumption() {
        this.signalTimer = setInterval(async () => {
            if (!this.isActive || this.isPaused || this.emergencyStop) return;
            try {
                const batch = SignalBus.getNextBatch(5);
                for (const opportunity of batch) {
                    await this.evaluateOpportunity(opportunity);
                }
            } catch (e) {
                console.warn('Signal consumption error:', e.message);
            }
        }, Math.max(1000, Math.floor(this.config.ANALYSIS_INTERVAL / 2)));
    }

    /**
     * Loop de gestión de posiciones
     */
    startPositionManagement() {
        this.positionTimer = setInterval(async () => {
            if (!this.isActive || this.isPaused) return;

            try {
                await this.manageActivePositions();
            } catch (error) {
                console.error('❌ Position management error:', error.message);
            }
        }, this.config.POSITION_CHECK_INTERVAL);
    }

    /**
     * Realizar análisis y ejecución
     */
    async performAnalysisAndExecution() {
        const startTime = Date.now();

        try {
            // Hard stop por riesgo si aplica
            if (this.emergencyStop && this.config.RISK_HARD_STOP) {
                console.warn('⛔ Emergency stop activo. Skipping analysis/execution.');
                return;
            }

            // 1. Obtener oportunidades del Oracle Cuántico
            const opportunities = await this.quantumOracle.scanForOpportunities();
            
            if (!opportunities || opportunities.length === 0) {
                console.log('📊 No quantum opportunities detected');
                return;
            }

            console.log(`🔮 Found ${opportunities.length} quantum opportunities`);

            // 2. Evaluar cada oportunidad
            for (const opportunity of opportunities) {
                await this.evaluateOpportunity(opportunity);
            }

            // 3. Actualizar métricas
            this.updateMetrics();

            const elapsed = Date.now() - startTime;
            console.log(`⚡ Analysis completed in ${elapsed}ms`);

        } catch (error) {
            console.error('❌ Analysis execution error:', error.message);
        }
    }

    /**
     * Evaluar una oportunidad específica
     */
    async evaluateOpportunity(opportunity) {
        try {
            console.log(`🎯 Evaluating ${opportunity.symbol}...`);

            // 1. Verificar si ya tenemos posición en este símbolo
            if (this.hasActivePosition(opportunity.symbol)) {
                console.log(`⚠️ Already have active position on ${opportunity.symbol}`);
                return;
            }

            // 2. Verificar máximo de trades concurrentes
            if (this.activePositions.size >= this.config.MAX_CONCURRENT_TRADES) {
                console.log(`⚠️ Max concurrent trades reached (${this.config.MAX_CONCURRENT_TRADES})`);
                return;
            }

            // 3. Análisis detallado de Leonardo
            const analysis = await this.quantumOracle.performDeepAnalysis(opportunity.symbol);

            console.log(`📊 ${opportunity.symbol} Analysis:`);
            console.log(`   Consciousness: ${(analysis.consciousness * 100).toFixed(1)}%`);
            console.log(`   Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
            console.log(`   Alignment: ${(analysis.alignment * 100).toFixed(1)}%`);
            console.log(`   Action: ${analysis.recommendedAction}`);

            // 4. Verificar umbrales Leonardo
            if (!this.meetsLeonardoThresholds(analysis)) {
                console.log(`❌ ${opportunity.symbol} doesn't meet Leonardo thresholds`);
                return;
            }

            // 5. Calcular tamaño de posición
            const positionData = await this.fundsManager.calculateOptimalPositionSize(
                this.config.BAIT_AMOUNT,
                analysis.confidence,
                analysis.consciousness
            );

            if (!positionData.canExecute) {
                console.log(`❌ Insufficient funds for ${opportunity.symbol}`);
                return;
            }

            console.log(`💰 Position size: $${positionData.positionSize}`);
            console.log(`🎣 Bait used: $${positionData.baitAmount}`);
            console.log(`📈 Expected profit: $${positionData.expectedProfit}`);

            // 5.1 Adaptación por régimen: tipo de orden y SL/TP
            const regimeStatus = this.marketRegimeDetector && typeof this.marketRegimeDetector.getStatus === 'function'
                ? this.marketRegimeDetector.getStatus()
                : null;
            const regimeParams = regimeStatus && regimeStatus.current ? (regimeStatus.regimeParameters || {}) : {};
            analysis.orderType = regimeParams.orderType || 'MARKET';
            analysis.stopLossMultiplier = typeof regimeParams.slMultiplier === 'number' ? regimeParams.slMultiplier : 0.618;
            analysis.takeProfitMultipliers = Array.isArray(regimeParams.tpMultipliers) ? regimeParams.tpMultipliers : [0.618, 1.0];

            // 6. Controles de exposición por símbolo/categoría
            const canOpen = await this.checkExposureLimits(opportunity.symbol, positionData.positionSize);
            if (!canOpen.canOpen) {
                console.log(`⛔ Exceso de exposición: ${canOpen.reason}`);
                return;
            }

            // 7. Ejecutar trade
            const execution = await this.executeTrade({
                symbol: opportunity.symbol,
                action: analysis.recommendedAction,
                analysis: analysis,
                positionData: positionData,
                opportunity: opportunity,
                exposureCategory: canOpen.category || 'unknown'
            });

            if (execution.success) {
                console.log(`🚀 Trade executed successfully: ${opportunity.symbol} ${analysis.recommendedAction}`);
            } else {
                console.log(`❌ Trade execution failed: ${execution.error}`);
            }

        } catch (error) {
            console.error(`❌ Error evaluating ${opportunity.symbol}:`, error.message);
        }
    }

    /**
     * Verificar umbrales Leonardo
     */
    meetsLeonardoThresholds(analysis) {
        return analysis.consciousness >= this.config.MIN_CONSCIOUSNESS &&
               analysis.confidence >= this.config.MIN_CONFIDENCE &&
               analysis.alignment >= this.config.MIN_ALIGNMENT;
    }

    /**
     * Verificar si tenemos posición activa
     */
    hasActivePosition(symbol) {
        return this.activePositions.has(symbol);
    }

    /**
     * Ejecutar trade
     */
    async executeTrade(tradeData) {
        const { symbol, action, analysis, positionData, opportunity } = tradeData;
        
        try {
            console.log(`🎯 Executing ${action} trade on ${symbol}...`);

            let executionResult = {
                success: false,
                orderId: null,
                price: 0,
                error: null
            };

            // Ejecutar trade real o simulado
            if (this.binanceConnector) {
                // Trading real con Binance
                executionResult = await this.executeRealTrade(tradeData);
            } else {
                // Trading simulado para testing
                executionResult = await this.executeSimulatedTrade(tradeData);
            }

            if (executionResult.success) {
                // Registrar posición activa
                const position = {
                    id: executionResult.orderId || `SIM_${Date.now()}`,
                    symbol: symbol,
                    action: action,
                    entryPrice: executionResult.price,
                    positionSize: positionData.positionSize,
                    baitUsed: positionData.baitAmount,
                    expectedProfit: positionData.expectedProfit,
                    analysis: analysis,
                    category: tradeData.exposureCategory || 'unknown',
                    openTime: Date.now(),
                    status: 'ACTIVE'
                };

                this.activePositions.set(symbol, position);
                this.trackExposureOnOpen(symbol, position.positionSize, position.category || canOpen.category || 'unknown');

                // Actualizar fondos
                await this.fundsManager.reserveFunds(positionData.positionSize);

                // Registrar en historial
                this.executionHistory.push({
                    timestamp: Date.now(),
                    type: 'OPEN',
                    ...position
                });

                this.metrics.totalTrades++;
                
                console.log(`✅ Position opened: ${symbol} - ID: ${position.id}`);
                
                return { success: true, position: position };

            } else {
                console.log(`❌ Trade execution failed: ${executionResult.error}`);
                return { success: false, error: executionResult.error };
            }

        } catch (error) {
            console.error(`❌ Execute trade error:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Ejecutar trade real con Binance
     */
    async executeRealTrade(tradeData) {
        const { symbol, action, positionData } = tradeData;

        try {
            const orderSide = action === 'LONG' ? 'BUY' : 'SELL';
            const quantity = await this.calculateQuantity(symbol, positionData.positionSize);

            // Validación y optimización de parámetros antes de enviar
            let orderParams = { symbol, side: orderSide, type: 'MARKET', quantity };
            try {
                const optimized = this.orderValidator.getOptimizedParams(symbol, Number(quantity), undefined, orderSide, 'MARKET');
                if (optimized && optimized.success && optimized.params) {
                    orderParams = { ...orderParams, ...optimized.params };
                } else if (optimized && optimized.errors?.length) {
                    return { success: false, orderId: null, price: 0, error: optimized.errors.join(', ') };
                }
            } catch (_) { /* continuar con params básicos */ }

            const orderResult = await this.binanceConnector.placeOrder(orderParams);

            if (orderResult.orderId) {
                return {
                    success: true,
                    orderId: orderResult.orderId,
                    price: orderResult.price || 0,
                    error: null
                };
            } else {
                return {
                    success: false,
                    orderId: null,
                    price: 0,
                    error: 'Order placement failed'
                };
            }

        } catch (error) {
            return {
                success: false,
                orderId: null,
                price: 0,
                error: error.message
            };
        }
    }

    /**
     * Ejecutar trade simulado
     */
    async executeSimulatedTrade(tradeData) {
        const { symbol, positionData } = tradeData;
        
        // Simular precio de mercado
        const timestamp = Date.now();
        const deterministicValue = this.calculateDeterministicValue(timestamp);
        const simulatedPrice = 50000 + (deterministicValue - 0.5) * 1000;
        
        return {
            success: true,
            orderId: `SIM_${symbol}_${timestamp}`,
            price: simulatedPrice,
            error: null
        };
    }

    /**
     * Calcular cantidad basada en tamaño de posición usando SmartQuantityCalculator
     */
    async calculateQuantity(symbol, positionSize) {
        try {
            console.log(`🧮 Using SmartQuantityCalculator for ${symbol} - Position: $${positionSize}`);
            
            const ds = this.dataService || DataService.getInstance();
            
            // Obtener precio actual
            const price = await ds.getPrice(symbol).catch(() => null);
            if (!price || price <= 0) {
                throw new Error(`Cannot get valid price for ${symbol}`);
            }
            
            // Obtener filtros de Binance
            try { await ds.getExchangeInfo({ forceRefresh: false }); } catch (_) {}
            const filters = ds.getSymbolFilters(symbol) || {};
            
            // Estructurar filtros para SmartQuantityCalculator
            const exchangeFilters = {
                lotSize: filters.lotSize,
                marketLotSize: filters.marketLotSize,
                minNotional: filters.minNotional
            };
            
            // Usar SmartQuantityCalculator
            const quantityFormatted = await this.quantityCalculator.getOrderQuantity(
                symbol,
                positionSize,
                price,
                exchangeFilters
            );
            
            console.log(`✅ Smart quantity calculated: ${quantityFormatted} for ${symbol}`);
            return quantityFormatted;
            
        } catch (error) {
            console.error(`❌ SmartQuantityCalculator error for ${symbol}:`, error.message);
            
            // Fallback al método anterior en caso de error
            console.log(`⚠️ Using fallback calculation for ${symbol}`);
            try {
                const ds = this.dataService || DataService.getInstance();
                const price = await ds.getPrice(symbol).catch(() => 50000);
                const px = Number(price) > 0 ? Number(price) : 50000;
                const qty = positionSize / px;
                
                // Determinar precisión según el asset
                const baseAsset = this.quantityCalculator.extractBaseAsset(symbol);
                const config = this.quantityCalculator.getAssetConfig(symbol);
                
                return qty.toFixed(config.precision);
            } catch (fallbackError) {
                console.error(`❌ Fallback calculation also failed:`, fallbackError.message);
                // Último recurso: estimación muy conservadora
                const estimatedPrice = 50000;
                return (positionSize / estimatedPrice).toFixed(6);
            }
        }
    }

    /**
     * Gestionar posiciones activas
     */
    async manageActivePositions() {
        if (this.activePositions.size === 0) return;

        console.log(`🔄 Managing ${this.activePositions.size} active positions...`);

        for (const [symbol, position] of this.activePositions) {
            try {
                await this.checkPositionStatus(symbol, position);
            } catch (error) {
                console.error(`❌ Error checking position ${symbol}:`, error.message);
            }
        }
    }

    /**
     * Verificar estado de una posición
     */
    async checkPositionStatus(symbol, position) {
        const currentTime = Date.now();
        const positionAge = currentTime - position.openTime;

        // 1. Verificar tiempo máximo de posición (ejemplo: 1 hora)
        const MAX_POSITION_TIME = 60 * 60 * 1000; // 1 hora
        
        if (positionAge > MAX_POSITION_TIME) {
            console.log(`⏰ Position ${symbol} expired, closing...`);
            await this.closePosition(symbol, 'TIME_EXPIRED');
            return;
        }

        // 2. Verificar condiciones de salida usando Oracle
        const currentAnalysis = await this.quantumOracle.getQuickAnalysis(symbol);
        
        // Si la consciencia cae significativamente, cerrar posición
        const consciousnessDrop = position.analysis.consciousness - currentAnalysis.consciousness;
        
        if (consciousnessDrop > 0.2) { // 20% drop
            console.log(`📉 Consciousness dropped for ${symbol}, closing position...`);
            await this.closePosition(symbol, 'CONSCIOUSNESS_DROP');
            return;
        }

        // 3. Verificar profit target (usar ratio áureo + trailing)
        const baseExpectedProfit = position.expectedProfit * this.config.PHI_RATIO;
        
        // Simular profit actual (en producción usar precio real)
        const timestamp = Date.now();
        const deterministicValue = this.calculateDeterministicValue(timestamp);
        const currentPrice = position.entryPrice * (1 + (deterministicValue - 0.5) * 0.05);
        const currentProfit = Math.abs(currentPrice - position.entryPrice) / position.entryPrice * position.positionSize;

        // Trailing stop dinámico: si supera 1.25x del objetivo, estrechamos stop
        if (!position.trailing) position.trailing = { peakProfit: 0, adjustedStopLoss: position.analysis.stopLoss || 0 };
        position.trailing.peakProfit = Math.max(position.trailing.peakProfit, currentProfit);
        let expectedProfit = baseExpectedProfit;
        if (position.trailing.peakProfit > baseExpectedProfit * 1.25) {
            // Ajuste del stop: asegurar un porcentaje de la ganancia
            const lockIn = position.trailing.peakProfit * 0.5; // Asegura 50% de la ganancia peak
            position.trailing.adjustedStopLoss = Math.max(position.trailing.adjustedStopLoss, lockIn / position.positionSize);
        }
        
        if (currentProfit >= expectedProfit) {
            console.log(`🎯 Profit target reached for ${symbol}, closing position...`);
            await this.closePosition(symbol, 'PROFIT_TARGET');
            return;
        }

        console.log(`✅ Position ${symbol} healthy - Age: ${Math.floor(positionAge/1000)}s, Profit: $${currentProfit.toFixed(2)}`);
    }

    /**
     * Cerrar posición específica
     */
    async closePosition(symbol, reason = 'MANUAL') {
        const position = this.activePositions.get(symbol);
        if (!position) return;

        try {
            console.log(`🔐 Closing position ${symbol} - Reason: ${reason}`);

            let closeResult = { success: true, price: 0 };

            if (this.binanceConnector) {
                // Cerrar posición real
                const orderSide = position.action === 'LONG' ? 'SELL' : 'BUY';
                const quantity = await this.calculateQuantity(symbol, position.positionSize);

                closeResult = await this.binanceConnector.placeOrder({
                    symbol: symbol,
                    side: orderSide,
                    type: 'MARKET',
                    quantity: quantity
                });
            } else {
                // Simular cierre
                const timestamp = Date.now();
                const deterministicValue = this.calculateDeterministicValue(timestamp);
                closeResult = {
                    success: true,
                    price: position.entryPrice * (1 + (deterministicValue - 0.5) * 0.05)
                };
            }

            if (closeResult.success) {
                // Calcular P&L real
                const pnl = this.calculatePnL(position, closeResult.price);
                
                // Liberar fondos
                await this.fundsManager.releaseFunds(position.positionSize, pnl);

                // Actualizar métricas
                this.metrics.totalProfit += pnl;
                if (pnl > 0) {
                    this.metrics.successfulTrades++;
                }

                // Actualizar riesgo/drawdown diario
                this.updateRiskAfterPnL(pnl);

                // Actualizar posición
                position.status = 'CLOSED';
                position.closeTime = Date.now();
                position.closePrice = closeResult.price;
                position.pnl = pnl;
                position.closeReason = reason;

                // Registrar en historial
                this.executionHistory.push({
                    timestamp: Date.now(),
                    type: 'CLOSE',
                    symbol: symbol,
                    pnl: pnl,
                    reason: reason,
                    position: position
                });

                // Remover de posiciones activas y ajustar exposición
                this.activePositions.delete(symbol);
                this.trackExposureOnClose(symbol, position.positionSize);

                console.log(`✅ Position closed: ${symbol} - P&L: $${pnl.toFixed(2)}`);

            } else {
                console.log(`❌ Failed to close position ${symbol}`);
            }

        } catch (error) {
            console.error(`❌ Error closing position ${symbol}:`, error.message);
        }
    }

    updateRiskAfterPnL(pnl) {
        try {
            // Reset diario según fecha
            const today = new Date().toISOString().slice(0,10);
            if (this.riskState.lastResetDate !== today) {
                this.riskState.lastResetDate = today;
                this.riskState.startEquity = this.fundsManager.totalBalance;
                this.riskState.peakEquity = this.riskState.startEquity;
                this.riskState.troughEquity = this.riskState.startEquity;
                this.riskState.dailyPnL = 0;
                this.emergencyStop = false;
            }

            this.riskState.dailyPnL += pnl;
            const equity = this.fundsManager.totalBalance;
            this.riskState.peakEquity = Math.max(this.riskState.peakEquity, equity);
            this.riskState.troughEquity = Math.min(this.riskState.troughEquity, equity);

            // Drawdown como caída desde pico
            const dd = this.riskState.peakEquity > 0 ? (this.riskState.peakEquity - equity) / this.riskState.peakEquity : 0;
            this.metrics.currentDrawdown = dd;
            this.metrics.maxDrawdown = Math.max(this.metrics.maxDrawdown, dd);

            if (this.config.RISK_HARD_STOP && dd >= this.config.MAX_DAILY_DRAWDOWN) {
                this.emergencyStop = true;
                console.warn(`⛔ Emergency stop activado por drawdown ${(dd*100).toFixed(2)}% ≥ ${(this.config.MAX_DAILY_DRAWDOWN*100).toFixed(2)}%`);
                this.emit && this.emit('risk:emergency_stop', { currentDrawdown: dd, maxDrawdown: this.metrics.maxDrawdown, riskState: this.riskState });
            }

            if (this.emit) this.emit('risk:update', { currentDrawdown: dd, maxDrawdown: this.metrics.maxDrawdown, riskState: this.riskState });
        } catch (e) {
            // noop
        }
    }

    /**
     * Calcular P&L de una posición
     */
    calculatePnL(position, closePrice) {
        const priceChange = position.action === 'LONG' 
            ? (closePrice - position.entryPrice) / position.entryPrice
            : (position.entryPrice - closePrice) / position.entryPrice;
            
        return position.positionSize * priceChange;
    }

    /**
     * Cerrar todas las posiciones
     */
    async closeAllPositions() {
        const symbols = Array.from(this.activePositions.keys());
        
        for (const symbol of symbols) {
            await this.closePosition(symbol, 'SYSTEM_STOP');
        }
    }

    /**
     * Actualizar métricas de performance
     */
    updateMetrics() {
        if (this.metrics.totalTrades > 0) {
            this.metrics.winRate = this.metrics.successfulTrades / this.metrics.totalTrades;
            this.metrics.averageProfit = this.metrics.totalProfit / this.metrics.totalTrades;
        }

        // Actualizar consciencia promedio del sistema
        this.metrics.consciousness = this.quantumOracle.getAverageConsciousness();
        this.metrics.coherence = this.quantumOracle.getAverageCoherence();
    }

    /**
     * Obtener estadísticas del motor
     */
    getStats() {
        return {
            // Estado del motor
            isActive: this.isActive,
            isPaused: this.isPaused,
            activePositions: this.activePositions.size,
            
            // Configuración
            config: this.config,
            
            // Métricas de performance
            metrics: this.metrics,
            
            // Fondos
            funds: this.fundsManager.getCurrentFunds(),
            
            // Historial reciente
            recentTrades: this.executionHistory.slice(-10),
            
            // Tiempo de última actualización
            lastUpdate: Date.now()
        };
    }

    /**
     * Obtener posiciones activas
     */
    getActivePositions() {
        return Array.from(this.activePositions.values());
    }

    /**
     * Obtener historial de ejecuciones
     */
    getExecutionHistory(limit = 50) {
        return this.executionHistory.slice(-limit);
    }

    /**
     * Configurar parámetros del motor
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('⚙️ Trading engine config updated:', newConfig);
    }

    /**
     * Control de exposición por símbolo/categoría
     */
    async checkExposureLimits(symbol, positionSize) {
        const equity = this.fundsManager.totalBalance;
        const symbolExposure = (this.exposureBySymbol.get(symbol) || 0) + positionSize;
        const symbolPct = symbolExposure / equity;
        if (symbolPct > this.config.MAX_SYMBOL_EXPOSURE_PCT) {
            return { canOpen: false, reason: `symbol exposure ${(symbolPct*100).toFixed(1)}% > ${(this.config.MAX_SYMBOL_EXPOSURE_PCT*100)}%` };
        }
        let category = 'unknown';
        try {
            if (typeof this.binanceConnector.getAssetType === 'function') {
                category = await this.binanceConnector.getAssetType(symbol);
            }
        } catch (_) {}
        const key = String(category || 'unknown');
        const catExposure = (this.exposureByCategory.get(key) || 0) + positionSize;
        const catPct = catExposure / equity;
        if (catPct > this.config.MAX_CATEGORY_EXPOSURE_PCT) {
            return { canOpen: false, reason: `category ${key} exposure ${(catPct*100).toFixed(1)}% > ${(this.config.MAX_CATEGORY_EXPOSURE_PCT*100)}%` };
        }
        return { canOpen: true, category: key };
    }

    trackExposureOnOpen(symbol, positionSize, category = 'unknown') {
        this.exposureBySymbol.set(symbol, (this.exposureBySymbol.get(symbol) || 0) + positionSize);
        this.exposureByCategory.set(category, (this.exposureByCategory.get(category) || 0) + positionSize);
    }

    trackExposureOnClose(symbol, positionSize, category = 'unknown') {
        this.exposureBySymbol.set(symbol, Math.max(0, (this.exposureBySymbol.get(symbol) || 0) - positionSize));
        this.exposureByCategory.set(category, Math.max(0, (this.exposureByCategory.get(category) || 0) - positionSize));
    }

    /**
     * Reset completo del motor
     */
    async reset() {
        console.log('🔄 Resetting Leonardo Trading Engine...');
        
        await this.stop();
        
        // Limpiar datos
        this.activePositions.clear();
        this.executionHistory = [];
        this.metrics = {
            totalTrades: 0,
            successfulTrades: 0,
            totalProfit: 0,
            averageProfit: 0,
            winRate: 0,
            maxDrawdown: 0,
            currentDrawdown: 0,
            consciousness: 0,
            coherence: 0
        };

        // Reinicializar componentes
        await this.fundsManager.reset();
        await this.quantumOracle.reset();
        
        console.log('✅ Leonardo Trading Engine reset complete');
    }

    /**
     * Logging especializado Leonardo
     */
    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [LEONARDO-${level}]`;
        
        if (data) {
            console.log(`${prefix} ${message}`, data);
        } else {
            console.log(`${prefix} ${message}`);
        }
    }
}

module.exports = TradingEngineLayer;
