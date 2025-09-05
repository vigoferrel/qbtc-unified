/*
  Copyright © 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES.
  Quantum Unified Core - Núcleo Cuántico Unificado Leonardo
  Implementación de la propuesta de unificación con pensamiento secuencial
*/

const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const { 
    QuantumConsciousness,
    QuantumCoherence,
    QuantumTrading,
    QuantumPoetry,
    QuantumAnalysis,
    QuantumMonitoring
} = require('./quantum-base');

class QuantumUnifiedCore {
    constructor(config) {
        // Estado inicial
        this.wsInitialized = false;
        this.wsDataReady = false;
        this.config = config || this.loadDefaultConfig();

        // Inicializar módulos base
        this.initializeBaseStructures();

        // Estado del mercado
        this.marketState = { 
            totalSymbols: 0,
            activeArbitrage: 0,
            quantumCorrelations: 0
        };

        // Crear módulos principales
        this.consciousness = new QuantumConsciousness();
        this.coherence = new QuantumCoherence();
        this.trading = new QuantumTrading();
        this.poetry = new QuantumPoetry();
        this.analysis = new QuantumAnalysis();
        this.monitoring = new QuantumMonitoring();
        
        // Módulo de predicción de adversidad
        this.adversityPredictor = null;

        // Notificar inicialización
        console.log('[QUANTUM CORE] Sistema cuántico inicializado correctamente');
    }

    loadDefaultConfig() {
        try {
            return require('./config/quantum-unified.json');
        } catch (error) {
            console.warn('[CONFIG] Usando configuración por defecto');
            return {
                leonardo: {
                    lambda_888: 888,
                    primo_7919: 7919
                },
                system_ports: {
                    quantum_core: 9090
                }
            };
        }
    }

    initializeBaseStructures() {
        // Constantes cuánticas
        this.PHI = 1.618033988749;
        this.LAMBDA_888 = (this.config.leonardo && this.config.leonardo.lambda_888) || 888;
        this.PRIMO_7919 = (this.config.leonardo && this.config.leonardo.primo_7919) || 7919;

        // Ratios cuánticos
        this.quantum_ratios = {
            consciousness_target: 0.941,
            coherence_target: 0.964,
            poetic_resonance: 0.888,
            trading_aggression: process.env.TRADING_MODE === 'FUTURES' ? 0.941 : 0.618,
            big_bang_threshold: 0.95,
            leonardo: {
                lambda_888: 888,
                primo_7919: 7919,
                resonance_threshold: 0.618,
                transformation_power: 0.941,
                hook_wheel_factor: 0.382,
                simbiosis_target: 0.888
            }
        };

        // Estado cuántico
        this.leonardoState = {
            resonancia_lambda: 0.618,
            transformaciones_primal: 0.941,
            hook_states: 0.382,
            simbiosis_level: 0.888,
            consciousness_score: 0.618,
            quantum_opportunities: [],
            big_bang_readiness: false,
            leonardo_activation: 0.37
        };

        // Estado del sistema
        this.systemState = {
            consciousness: 0.618,
            coherence: 0.888,
            trading_performance: 0.0,
            poetic_resonance: 0.618,
            system_health: 1.0,
            big_bang_activated: false,
            zurita_multiplier: 1.0,
            leonardo_activation: 0.37,
            quantum_readiness: false
        };
    }

    /**
     * Inicializa el sistema cuántico unificado
     */
    async initialize() {
        try {
            console.log('[UNIFIED QUANTUM] 🌟 Iniciando sistema cuántico unificado...');
            
            // Paso 1: Inicializar módulos base
            await this.initializeBaseModules();
            
            // Paso 2: Configurar estado cuántico
            this.setupQuantumState();
            
            // Paso 3: Entrelazar módulos
            this.entangleModules();
            
            // Paso 4: Inicializar servidor y WebSocket
            this.initializeServer();
            await this.waitForWebSocket();
            
            console.log('[UNIFIED QUANTUM] ✅ Sistema cuántico unificado iniciado exitosamente');
            return true;
        } catch (error) {
            console.error('[UNIFIED QUANTUM] ❌ Error inicializando sistema:', error);
            throw error;
        }
    }

    /**
     * Inicializa los módulos base del sistema
     */
    async initializeBaseModules() {
        // Inicializar consciencia
        if (this.consciousness) {
            this.consciousness.level = 0.618; // Base dorada
        }
        
        // Inicializar coherencia
        if (this.coherence) {
            this.coherence.level = 0.888; // Simbiosis inicial
        }
        
        // Inicializar trading
        if (this.trading) {
            this.trading.confidence = 0.0;
        }
        
        console.log('[UNIFIED QUANTUM] 📦 Módulos base inicializados');
    }

    /**
     * Configura el estado cuántico inicial
     */
    setupQuantumState() {
        this.systemState = {
            consciousness: 0.618,  // Base dorada Leonardo
            coherence: 0.888,      // Simbiosis inicial
            trading_performance: 0.0,
            poetic_resonance: 0.618,  // Resonancia poética inicial
            system_health: 1.0,
            big_bang_activated: false,
            zurita_multiplier: 1.0,
            leonardo_activation: 0.37,
            quantum_readiness: false,
            adversity_resistance: 1.0,
            prime_resonance: 0.0,
            firmness_level: 'CHAOS_MASTERED'
        };
        
        console.log('[UNIFIED QUANTUM] 🌌 Estado cuántico configurado');
    }
    
    /**
     * Conectar AdversityPrimePredictor al núcleo unificado
     */
    connectAdversityPredictor(predictor) {
        try {
            this.adversityPredictor = predictor;
            
            // Configurar listeners bidireccionales
            this.setupAdversityPredictorIntegration(predictor);
            
            // Conectar con otros módulos
            if (this.monitoring && typeof this.monitoring.connectAdversityPredictor === 'function') {
                this.monitoring.connectAdversityPredictor(predictor);
            }
            
            console.log('[UNIFIED QUANTUM] 🔮 AdversityPrimePredictor integrado exitosamente');
            
            this.emit?.('adversity_predictor:connected', {
                timestamp: Date.now(),
                predictor_state: predictor.quantumPredictorState
            });
            
            return true;
        } catch (error) {
            console.error('[UNIFIED QUANTUM] ❌ Error integrando AdversityPrimePredictor:', error.message);
            return false;
        }
    }
    
    setupAdversityPredictorIntegration(predictor) {
        if (predictor && typeof predictor.on === 'function') {
            // Escuchar eventos del predictor
            predictor.on('firmness:updated', (firmnessData) => {
                this.handleFirmnessUpdate(firmnessData);
            });
            
            predictor.on('adversity:predicted', (predictionData) => {
                this.handleAdversityPrediction(predictionData);
            });
            
            predictor.on('prime:resonance_detected', (resonanceData) => {
                this.handlePrimeResonance(resonanceData);
            });
            
            predictor.on('evolution:triggered', (evolutionData) => {
                this.handleEvolutionTrigger(evolutionData);
            });
            
            predictor.on('defensive:activated', (defensiveData) => {
                this.handleDefensiveActivation(defensiveData);
            });
        }
        
        // Enviar actualizaciones del core al predictor
        if (typeof this.on === 'function') {
            this.on('system_state:updated', (stateData) => {
                if (predictor && typeof predictor.updateFromUnifiedCore === 'function') {
                    predictor.updateFromUnifiedCore(stateData);
                }
            });
        }
    }
    
    // MANEJAR ACTUALIZACIONES DE FIRMEZA
    handleFirmnessUpdate(firmnessData) {
        const { currentState, score } = firmnessData;
        
        // Actualizar estado del sistema
        this.systemState.firmness_level = currentState;
        this.systemState.adversity_resistance = score;
        
        // Ajustar conciencia basada en firmeza
        const firmnessMultiplier = this.calculateFirmnessMultiplier(currentState, score);
        this.systemState.consciousness = Math.min(1.0, 
            this.systemState.consciousness * firmnessMultiplier
        );
        
        // Propagar a otros módulos
        this.propagateStateUpdate('firmness_updated', firmnessData);
        
        console.log(`[UNIFIED QUANTUM] 💎 Firmeza actualizada: ${currentState} (${(score * 100).toFixed(1)}%)`);
    }
    
    calculateFirmnessMultiplier(firmness, score) {
        const multipliers = {
            'CHAOS_MASTERED': 1.0 + (score * 0.1),      // Base + 10%
            'EVOLUTION_PRIMED': 1.0 + (score * 0.2),    // Base + 20%
            'PHOENIX_READY': 1.0 + (score * 0.3)        // Base + 30%
        };
        
        return multipliers[firmness] || 1.0;
    }
    
    // MANEJAR PREDICCIONES DE ADVERSIDAD
    handleAdversityPrediction(predictionData) {
        const { intensity, probability } = predictionData;
        
        // Ajustar estado del sistema preventivamente
        if (probability > 0.7 && intensity > 0.6) {
            // Modo defensivo
            this.systemState.big_bang_activated = false;
            this.systemState.zurita_multiplier = Math.max(0.5, this.systemState.zurita_multiplier * 0.8);
            this.systemState.leonardo_activation = Math.min(0.9, this.systemState.leonardo_activation * 1.2);
        }
        
        console.log(`[UNIFIED QUANTUM] ⚠️ Adversidad predicha: ${(intensity * 100).toFixed(1)}%/${(probability * 100).toFixed(1)}%`);
    }
    
    // MANEJAR RESONANCIA PRIMA
    handlePrimeResonance(resonanceData) {
        const { prime, resonance } = resonanceData;
        
        // Actualizar resonancia prima en el sistema
        this.systemState.prime_resonance = Math.max(this.systemState.prime_resonance, resonance);
        
        // Boost de consciousness si hay alta resonancia
        if (resonance > 0.8) {
            const resonanceBoost = resonance * 0.05;
            this.systemState.consciousness = Math.min(1.0, 
                this.systemState.consciousness + resonanceBoost
            );
        }
        
        console.log(`[UNIFIED QUANTUM] 🔢 Resonancia prima ${prime}: ${(resonance * 100).toFixed(1)}%`);
    }
    
    // MANEJAR TRIGGER DE EVOLUCIÓN
    handleEvolutionTrigger(evolutionData) {
        const { type, strength, momentum } = evolutionData;
        
        // Acelerar evolución del sistema
        this.systemState.leonardo_activation = Math.min(1.0, 
            this.systemState.leonardo_activation + (momentum * 0.1)
        );
        
        // Boost temporal de consciousness
        if (strength > 0.7) {
            this.systemState.consciousness = Math.min(1.0, 
                this.systemState.consciousness + (strength * 0.1)
            );
        }
        
        console.log(`[UNIFIED QUANTUM] 🚀 Evolución ${type}: fuerza ${(strength * 100).toFixed(1)}%`);
    }
    
    // MANEJAR ACTIVACIÓN DEFENSIVA
    handleDefensiveActivation(defensiveData) {
        // Activar modo defensivo en el sistema
        this.systemState.big_bang_activated = false;
        this.systemState.quantum_readiness = true;
        
        // Estabilizar métricas
        this.systemState.system_health = Math.max(0.8, this.systemState.system_health);
        this.systemState.coherence = Math.max(0.7, this.systemState.coherence);
        
        console.log('[UNIFIED QUANTUM] 🛡️ Modo defensivo activado por predictor de adversidad');
    }
    
    // PROPAGAR ACTUALIZACIONES DE ESTADO
    propagateStateUpdate(eventType, data) {
        const modules = [this.consciousness, this.coherence, this.trading, this.poetry, this.analysis];
        
        modules.forEach(module => {
            if (module && typeof module.updateFromCore === 'function') {
                module.updateFromCore({
                    eventType,
                    data,
                    systemState: { ...this.systemState },
                    timestamp: Date.now()
                });
            }
        });
        
        // Emitir evento si es posible
        if (typeof this.emit === 'function') {
            this.emit('system_state:updated', {
                eventType,
                data,
                systemState: { ...this.systemState }
            });
        }
    }

    entangleModules() {
        try {
            // Crear superposición entre todos los módulos si tienen método entangle
            const modules = [this.consciousness, this.trading, this.poetry, this.analysis, this.coherence, this.monitoring];
            
            modules.forEach((module, i) => {
                if (typeof module?.entangle === 'function') {
                    // Entrelazar con el siguiente módulo (circular)
                    const nextModule = modules[(i + 1) % modules.length];
                    if (nextModule && typeof nextModule?.entangle === 'function') {
                        module.entangle(nextModule);
                    }
                }
            });
            
            console.log('[ENTRELAZAMIENTO] ✅ Módulos cuánticos base entrelazados exitosamente');
        } catch (error) {
            console.warn('[ENTRELAZAMIENTO] ⚠️ Error entrelazando módulos:', error.message);
            // No bloquear la inicialización por error de entrelazamiento
        }
    }

    async waitForWebSocket() {
        console.log('[QUANTUM CORE] 🔄 Esperando inicialización WebSocket...');

        // Si no hay conector, continuar sin bloquear el Core
        if (!this.binanceConnector) {
            console.warn('[QUANTUM CORE] ⚠️ Sin conector Binance. Continuando en modo degradado.');
            this.wsInitialized = false;
            this.wsDataReady = false;
            return true;
        }

        const hasInitWs = typeof this.binanceConnector?.initializeWebSocket === 'function';
        const hasWaitData = typeof this.binanceConnector?.waitForInitialData === 'function';
        if (!hasInitWs || !hasWaitData) {
            console.warn('[QUANTUM CORE] ⚠️ Conector Binance sin soporte WS completo. Continuando en modo degradado.');
            this.wsInitialized = false;
            this.wsDataReady = false;
            return true;
        }

        try {
            await this.binanceConnector.initializeWebSocket();
            this.wsInitialized = true;
            console.log('[QUANTUM CORE] ✅ WebSocket Binance inicializado');

            await this.binanceConnector.waitForInitialData();
            this.wsDataReady = true;
            console.log('[QUANTUM CORE] 📊 Datos iniciales WebSocket recibidos');

            return true;
        } catch (error) {
            console.error('[QUANTUM CORE] ❌ Error inicializando WebSocket:', error.message);
            // No bloquear el arranque del Core
            return false;
        }
    }

    initializeServer() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.wss = new WebSocket.Server({ server: this.server });

        // Middleware básico
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            if (req.method === 'OPTIONS') {
                res.sendStatus(200);
            } else {
                next();
            }
        });

        // Configurar rutas REST
        this.setupRoutes();
        
        // Configurar WebSocket
        this.setupWebSocket();
        
        // Iniciar monitoreo
        this.startMonitoring();
    }

    setupRoutes() {
        // Ruta de salud estándar
        this.app.get('/quantum/state', (req, res) => {
            const healthStatus = {
                status: 'ok',
                service: 'quantum-unified-core',
                port: this.server.address()?.port || null,
                modules: {
                    consciousness: this.consciousness?.level || 0,
                    coherence: this.coherence?.level || 0,
                    trading: this.trading?.confidence || 0,
                    poetry: this.poetry?.resonance || 0,
                    monitoring: this.monitoring ? true : false
                },
                systemHealth: this.systemState.system_health,
                leonardoState: this.leonardoState,
                timestamp: new Date().toISOString()
            };

            if (Object.values(healthStatus.modules).some(val => val > 0)) {
                healthStatus.status = 'ok';
            } else {
                healthStatus.status = 'degraded';
            }

            res.json(healthStatus);
        });

        // Ruta de salud simple
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'ok',
                service: 'quantum-unified-core',
                timestamp: new Date().toISOString()
            });
        });

        // Ruta para obtener estado del sistema
        this.app.get('/quantum/status', (req, res) => {
            res.json({
                system_state: this.systemState,
                leonardo_state: this.leonardoState,
                quantum_ratios: this.quantum_ratios,
                timestamp: new Date().toISOString()
            });
        });

        // Ruta para procesamiento cuántico
        this.app.post('/quantum/process', async (req, res) => {
            try {
                const input = req.body;
                const result = await this.processQuantumInput(input);
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Ruta para activar Big Bang Leonardo manualmente
        this.app.post('/quantum/big-bang', (req, res) => {
            this.triggerLeonardoBigBang();
            res.json({ 
                message: 'Leonardo Big Bang activado manualmente',
                zurita_multiplier: this.systemState.zurita_multiplier,
                leonardo_state: this.leonardoState,
                quantum_readiness: this.systemState.quantum_readiness,
                timestamp: new Date().toISOString()
            });
        });
    }

    async processQuantumInput(input) {
        const startTime = Date.now();
        
        try {
            // Procesamiento secuencial como Leonardo
            console.log('[PROCESAMIENTO] Iniciando análisis secuencial Leonardo');
            
            // Paso 1: Análisis de consciencia
            const consciousnessResult = await this.consciousness.analyze(input);
            console.log(`[CONSCIENCIA] Resultado: ${consciousnessResult.level}`);
            
            // Paso 2: Validación de coherencia
            const coherenceResult = await this.coherence.validate(consciousnessResult);
            console.log(`[COHERENCIA] Resultado: ${coherenceResult.level}`);
            
            // Paso 3: Ejecución de trading
            const tradingResult = await this.trading.execute(coherenceResult);
            console.log(`[TRADING] Resultado: ${tradingResult.confidence}`);
            
            // Paso 4: Mejora poética
            const poetryResult = await this.poetry.enhance(tradingResult);
            console.log(`[POESÍA] Resonancia: ${poetryResult.resonance}`);
            
            // Paso 5: Optimización de análisis
            const analysisResult = await this.analysis.optimize(poetryResult);
            console.log(`[ANÁLISIS] Optimización: ${analysisResult.optimization_level}`);
            
            // Colapsar a resultado óptimo
            const finalResult = this.collapseToOptimalResult(analysisResult);
            
            // Actualizar estado del sistema
            this.updateSystemState(finalResult);
            
            const processingTime = Date.now() - startTime;
            console.log(`[PROCESAMIENTO] Completado en ${processingTime}ms`);
            
            return finalResult;
            
        } catch (error) {
            console.error('[ERROR] Error en procesamiento cuántico:', error);
            return this.generateEmergencyResponse(input, error);
        }
    }

    collapseToOptimalResult(analysisResult) {
        // Colapsar superposición cuántica a resultado óptimo
        const optimalResult = {
            success: true,
            consciousness_level: this.systemState.consciousness,
            coherence_level: this.systemState.coherence,
            trading_signal: analysisResult.trading_signal || 'HOLD',
            poetic_multiplier: this.systemState.zurita_multiplier,
            confidence: analysisResult.confidence || 0.5,
            timestamp: new Date().toISOString(),
            processing_steps: 5
        };

        // Aplicar multiplicador Zurita si está activo
        if (this.systemState.big_bang_activated) {
            optimalResult.poetic_multiplier = 488.25;
            optimalResult.quantum_prediction = true;
        }

        return optimalResult;
    }

    updateSystemState(result) {
        // Actualizar métricas del sistema
        this.systemState.consciousness = result.consciousness_level;
        this.systemState.coherence = result.coherence_level;
        this.systemState.trading_performance = result.confidence;
        this.systemState.poetic_resonance = result.poetic_multiplier;
        
        // Actualizar estado cuántico Leonardo
        this.updateLeonardoQuantumState(result);
        
        // Verificar activación del Big Bang Leonardo
        if (this.leonardoState.leonardo_activation >= this.quantum_ratios.big_bang_threshold && !this.systemState.big_bang_activated) {
            this.triggerLeonardoBigBang();
        }
        
        // Actualizar salud del sistema
        this.systemState.system_health = this.calculateSystemHealth();
    }

    updateLeonardoQuantumState(result) {
        // Calcular resonancia Lambda 888
        this.leonardoState.resonancia_lambda = this.calculateResonanciaLambda();
        
        // Calcular transformaciones primo 7919
        this.leonardoState.transformaciones_primal = this.calculateTransformacionesPrimal();
        
        // Calcular estados Hook Wheel
        this.leonardoState.hook_states = this.calculateHookStates();
        
        // Calcular nivel de simbiosis
        this.leonardoState.simbiosis_level = this.calculateSimbiosisLevel();
        
        // Puntuación de consciencia integrada
        this.leonardoState.consciousness_score = this.calculateConsciousnessScore();
        
        // Activación Leonardo
        this.leonardoState.leonardo_activation = this.calculateLeonardoActivation();
        
        // Big Bang readiness
        this.leonardoState.big_bang_readiness = 
            this.leonardoState.leonardo_activation >= this.quantum_ratios.big_bang_threshold;
        
        // Actualizar sistema con estado Leonardo
        this.systemState.leonardo_activation = this.leonardoState.leonardo_activation;
        this.systemState.quantum_readiness = this.leonardoState.big_bang_readiness;
    }

    calculateResonanciaLambda() {
        const base = this.systemState.consciousness * this.PHI;
        const lambda_factor = Math.sin((Date.now() / this.LAMBDA_888) * Math.PI) * 0.1;
        return Math.min(1, Math.max(0, base + lambda_factor));
    }
    
    calculateTransformacionesPrimal() {
        const coherence_factor = this.systemState.coherence;
        const prime_resonance = Math.cos((Date.now() / this.PRIMO_7919) * Math.PI * 2) * 0.1;
        const base = coherence_factor + (this.systemState.trading_performance * 0.2);
        return Math.min(1, Math.max(0, base + prime_resonance));
    }
    
    calculateHookStates() {
        const connection_ratio = Math.min(1, this.systemState.consciousness / this.quantum_ratios.consciousness_target);
        const wheel_factor = (this.systemState.coherence / this.quantum_ratios.coherence_target) * this.quantum_ratios.leonardo.hook_wheel_factor;
        return Math.min(1, Math.max(0, connection_ratio + wheel_factor));
    }
    
    calculateSimbiosisLevel() {
        const consciousness_weight = this.systemState.consciousness * 0.4;
        const coherence_weight = this.systemState.coherence * 0.4;
        const performance_weight = this.systemState.trading_performance * 0.2;
        return consciousness_weight + coherence_weight + performance_weight;
    }
    
    calculateConsciousnessScore() {
        const leonardo_factors = [
            this.leonardoState.resonancia_lambda,
            this.leonardoState.transformaciones_primal,
            this.leonardoState.hook_states,
            this.leonardoState.simbiosis_level
        ];
        
        const average = leonardo_factors.reduce((sum, factor) => sum + factor, 0) / leonardo_factors.length;
        return Math.min(1, average * this.PHI / 1.618);
    }
    
    calculateLeonardoActivation() {
        const base_activation = this.leonardoState.consciousness_score;
        const quantum_boost = this.leonardoState.simbiosis_level * this.quantum_ratios.leonardo.resonance_threshold;
        return Math.min(1, base_activation + quantum_boost);
    }

    triggerLeonardoBigBang() {
        console.log('[LEONARDO BIG BANG] 🎨💥 ¡Activación del Big Bang Leonardo Cuántico!');
        this.systemState.big_bang_activated = true;
        this.systemState.zurita_multiplier = 888.25;  // Multiplicador Leonardo enhanced
        this.leonardoState.big_bang_readiness = true;
        this.leonardoState.leonardo_activation = 1.0;   // Activación máxima
        
        // Activar todos los poetas con power Leonardo
        if (this.poetry && typeof this.poetry.activateLeonardoPoets === 'function') {
            this.poetry.activateLeonardoPoets();
        }
        
        // Activar predicción temporal cuántica
        if (this.analysis && typeof this.analysis.enableLeonardoTemporalPrediction === 'function') {
            this.analysis.enableLeonardoTemporalPrediction();
        }
        
        console.log('[LEONARDO BIG BANG] 🎨 Multiplicador Zurita Leonardo: 888.25x activado');
        console.log('[LEONARDO BIG BANG] ⚡ Resonancia Lambda 888 activada');
        console.log('[LEONARDO BIG BANG] 🔄 Transformaciones Primo 7919 activadas');
        console.log('[LEONARDO BIG BANG] 🧠 Predicción temporal Leonardo activada');
        console.log('[LEONARDO BIG BANG] 🚀 Sistema en modo rentabilidad MÁXIMA');
    }

    calculateSystemHealth() {
        // Calcular salud del sistema basada en todas las métricas
        const metrics = [
            this.systemState.consciousness,
            this.systemState.coherence,
            this.systemState.trading_performance,
            this.systemState.poetic_resonance
        ];
        
        return metrics.reduce((sum, metric) => sum + metric, 0) / metrics.length;
    }

    generateEmergencyResponse(input, error) {
        return {
            success: false,
            error: error.message,
            consciousness_level: this.systemState.consciousness,
            coherence_level: this.systemState.coherence,
            emergency_mode: true,
            timestamp: new Date().toISOString()
        };
    }

    setupWebSocket() {
        this.wss.on('connection', (ws) => {
            console.log('[WEBSOCKET] Nueva conexión cuántica establecida');
            
            // Enviar estado inicial
            ws.send(JSON.stringify({
                type: 'system_state',
                data: this.systemState
            }));

            ws.on('message', async (message) => {
                try {
                    const input = JSON.parse(message);
                    const result = await this.processQuantumInput(input);
                    
                    // Enviar resultado por WebSocket
                    ws.send(JSON.stringify({
                        type: 'quantum_result',
                        data: result
                    }));
                    
                } catch (error) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        data: { error: error.message }
                    }));
                }
            });
        });
    }

    startMonitoring() {
        // Monitoreo continuo del sistema
        this.monitoringInterval = setInterval(() => {
            if (this.monitoring && typeof this.monitoring.updateMetrics === 'function') {
                this.monitoring.updateMetrics(this.systemState);
            }
            
            // Verificar umbrales críticos
            if (this.systemState.consciousness < 0.3) {
                console.warn('[ALERTA] Consciencia crítica:', this.systemState.consciousness);
            }
            
            if (this.systemState.coherence < 0.5) {
                console.warn('[ALERTA] Coherencia crítica:', this.systemState.coherence);
            }
            
            if (this.systemState.system_health < 0.8) {
                console.warn('[ALERTA] Salud del sistema crítica:', this.systemState.system_health);
            }
            
        }, 5000); // Monitoreo cada 5 segundos
    }

    async start(port = null) {
        port = port || (this.config.system_ports && this.config.system_ports.quantum_core) || 9090;
        try {
            // Inicializar sistema completo
            await this.initialize();

            // Iniciar servidor
            this.server.listen(port, () => {
                console.log(`[QUANTUM CORE] ✅ Servidor iniciado en puerto ${port}`);
                console.log(`[QUANTUM CORE] 🌐 WebSocket disponible en ws://localhost:${port}`);
                console.log(`[QUANTUM CORE] 📡 REST API disponible en http://localhost:${port}`);
                console.log('[QUANTUM CORE] 🚀 Sistema Cuántico Leonardo completamente operativo');
            });
        } catch (error) {
            console.error('[QUANTUM CORE] ❌ Error fatal iniciando sistema:', error.message);
            process.exit(1);
        }
    }

    // Método de parada limpia
    async stop() {
        console.log('[QUANTUM CORE] 🛑 Iniciando parada del sistema...');
        
        // Limpiar intervalos
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        // Cerrar WebSocket
        if (this.wss) {
            this.wss.close();
        }
        
        // Cerrar servidor
        if (this.server) {
            this.server.close();
        }
        
        console.log('[QUANTUM CORE] ✅ Sistema detenido correctamente');
    }
}

// Iniciar si es llamado directamente
if (require.main === module) {
    let config;
    try {
        // Intentar cargar config desde argumentos
        config = process.argv[2] ? JSON.parse(process.argv[2]) : null;
    } catch (error) {
        console.warn('[CONFIG] Error parseando configuración desde argumentos:', error.message);
        config = null;
    }

    const core = new QuantumUnifiedCore(config);
    core.start().catch(error => {
        console.error('[QUANTUM CORE] Error iniciando:', error);
        process.exit(1);
    });
}

module.exports = { QuantumUnifiedCore };
