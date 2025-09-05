// ========================================================================
// 🌐 QUANTUM ENGINES COMMUNICATION BRIDGE
// Sistema de Comunicación Inter-Engines Leonardo-Feynman
// "Conectando mentes cuánticas para máxima sinergia estratégica"
// ========================================================================

const EventEmitter = require('events');
const crypto = require('crypto');

// Constantes de Comunicación Cuántica
const COMMUNICATION_CONSTANTS = {
    // Tipos de engines registrables
    ENGINE_TYPES: {
        ADVERSITY_PREDICTOR: 'adversity_predictor',
        LEVERAGE_ENGINE: 'leverage_engine', 
        PROFIT_MAXIMIZER: 'profit_maximizer',
        CONSCIOUSNESS_ENGINE: 'consciousness_engine',
        COHERENCE_INTEGRATOR: 'coherence_integrator',
        MONITORING_SYSTEM: 'monitoring_system',
        UNIFIED_CORE: 'unified_core'
    },
    
    // Prioridades de mensajes
    MESSAGE_PRIORITIES: {
        CRITICAL: 5,        // Emergencias críticas del sistema
        HIGH: 4,           // Predicciones de adversidad alta
        MEDIUM: 3,         // Operaciones normales
        LOW: 2,            // Información general
        BACKGROUND: 1      // Actualizaciones de estado
    },
    
    // Constantes matemáticas
    GOLDEN_RATIO: 1.618033988749,
    PRIME_SYNC: 7919,
    FIBONACCI_SEQ: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233],
    
    // Timeouts de comunicación
    MESSAGE_TIMEOUT_MS: 5000,
    HEARTBEAT_INTERVAL_MS: 2000,
    SYNC_INTERVAL_MS: 1000
};

class QuantumEnginesCommunicationBridge extends EventEmitter {
    constructor(config = {}) {
        super();
        
        // 🎯 Configuración del Bridge
        this.config = {
            max_engines: 10,
            message_queue_size: 1000,
            enable_heartbeat: true,
            enable_message_history: true,
            enable_performance_tracking: true,
            ...config
        };
        
        // 🔗 Engines registrados
        this.registeredEngines = new Map();
        this.engineStates = new Map();
        this.engineCapabilities = new Map();
        
        // 📨 Sistema de mensajería
        this.messageQueue = [];
        this.messageHistory = [];
        this.pendingMessages = new Map();
        this.messageCounter = 0;
        
        // 📊 Métricas de rendimiento
        this.communicationMetrics = {
            messages_sent: 0,
            messages_received: 0,
            messages_failed: 0,
            engines_connected: 0,
            sync_cycles_completed: 0,
            average_response_time: 0,
            last_global_sync: null,
            total_data_transferred: 0
        };
        
        // 🔄 Estados de sincronización
        this.synchronizationState = {
            is_syncing: false,
            last_sync_success: true,
            sync_in_progress: new Set(),
            failed_syncs: new Map(),
            global_coherence_level: 0.0
        };
        
        // 🎛️ Canales de comunicación especializados
        this.communicationChannels = {
            adversity_alerts: new Set(),      // Canal de alertas de adversidad
            trading_signals: new Set(),      // Señales de trading
            consciousness_updates: new Set(), // Actualizaciones de consciencia
            system_coordination: new Set(),  // Coordinación del sistema
            performance_data: new Set(),     // Datos de rendimiento
            emergency_broadcast: new Set()   // Canal de emergencia
        };
        
        this.initializeBridge();
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 🚀 INICIALIZACIÓN DEL BRIDGE
    // ═══════════════════════════════════════════════════════════════════════
    
    initializeBridge() {
        console.log('🌐 [COMMUNICATION BRIDGE] Inicializando sistema de comunicación inter-engines...');
        
        // Configurar listeners internos
        this.setupInternalListeners();
        
        // Iniciar sistemas automáticos
        if (this.config.enable_heartbeat) {
            this.startHeartbeatSystem();
        }
        
        // Iniciar sincronización automática
        this.startSynchronizationCycles();
        
        // Configurar limpieza automática
        this.setupAutomaticCleanup();
        
        console.log('✨ [COMMUNICATION BRIDGE] Sistema de comunicación ACTIVO');
        console.log(`🔗 [COMMUNICATION BRIDGE] Capacidad: ${this.config.max_engines} engines`);
        console.log(`📨 [COMMUNICATION BRIDGE] Queue: ${this.config.message_queue_size} mensajes`);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 🔗 REGISTRO Y GESTIÓN DE ENGINES
    // ═══════════════════════════════════════════════════════════════════════
    
    registerEngine(engineId, engine, engineType, capabilities = []) {
        try {
            if (this.registeredEngines.size >= this.config.max_engines) {
                throw new Error(`Máximo de engines alcanzado (${this.config.max_engines})`);
            }
            
            if (this.registeredEngines.has(engineId)) {
                console.warn(`[COMMUNICATION BRIDGE] Engine ${engineId} ya registrado, actualizando...`);
            }
            
            // Crear perfil del engine
            const engineProfile = {
                id: engineId,
                engine: engine,
                type: engineType,
                capabilities: new Set(capabilities),
                registered_at: Date.now(),
                last_heartbeat: Date.now(),
                is_active: true,
                message_count: 0,
                error_count: 0,
                performance_score: 1.0
            };
            
            // Registrar engine
            this.registeredEngines.set(engineId, engineProfile);
            this.engineStates.set(engineId, { status: 'active', last_update: Date.now() });
            this.engineCapabilities.set(engineId, capabilities);
            
            // Configurar listeners del engine
            this.setupEngineListeners(engineId, engine);
            
            // Actualizar métricas
            this.communicationMetrics.engines_connected = this.registeredEngines.size;
            
            console.log(`🔗 [COMMUNICATION BRIDGE] Engine registrado: ${engineId} (${engineType})`);
            console.log(`🎯 [COMMUNICATION BRIDGE] Capacidades: [${capabilities.join(', ')}]`);
            
            // Notificar registro a otros engines
            this.broadcastEngineEvent('engine_registered', {
                engineId,
                engineType,
                capabilities,
                timestamp: Date.now()
            });
            
            return true;
        } catch (error) {
            console.error(`❌ [COMMUNICATION BRIDGE] Error registrando engine ${engineId}:`, error.message);
            return false;
        }
    }
    
    setupEngineListeners(engineId, engine) {
        if (engine && typeof engine.on === 'function') {
            // Listener universal para todos los eventos del engine
            const originalEmit = engine.emit;
            engine.emit = (...args) => {
                // Capturar y reenviar eventos a otros engines
                this.handleEngineEvent(engineId, args[0], args[1]);
                return originalEmit.apply(engine, args);
            };
        }
    }
    
    handleEngineEvent(sourceEngineId, eventType, eventData) {
        // Crear mensaje de evento
        const eventMessage = {
            id: this.generateMessageId(),
            source: sourceEngineId,
            type: 'engine_event',
            event_type: eventType,
            data: eventData,
            timestamp: Date.now(),
            priority: this.calculateEventPriority(eventType, eventData)
        };
        
        // Determinar destinatarios basado en el tipo de evento
        const recipients = this.determineEventRecipients(eventType, eventData);
        
        // Enviar a engines relevantes
        for (const recipientId of recipients) {
            if (recipientId !== sourceEngineId) {
                this.sendMessage(recipientId, eventMessage);
            }
        }
        
        // Guardar en historial
        if (this.config.enable_message_history) {
            this.messageHistory.push(eventMessage);
            this.limitHistorySize();
        }
    }
    
    determineEventRecipients(eventType, eventData) {
        const recipients = new Set();
        
        // Mapeo de eventos a tipos de engines relevantes
        const eventRouting = {
            'adversity:predicted': [
                COMMUNICATION_CONSTANTS.ENGINE_TYPES.LEVERAGE_ENGINE,
                COMMUNICATION_CONSTANTS.ENGINE_TYPES.PROFIT_MAXIMIZER,
                COMMUNICATION_CONSTANTS.ENGINE_TYPES.CONSCIOUSNESS_ENGINE
            ],
            'firmness:updated': [
                COMMUNICATION_CONSTANTS.ENGINE_TYPES.LEVERAGE_ENGINE,
                COMMUNICATION_CONSTANTS.ENGINE_TYPES.UNIFIED_CORE
            ],
            'prime:resonance_detected': [
                COMMUNICATION_CONSTANTS.ENGINE_TYPES.CONSCIOUSNESS_ENGINE,
                COMMUNICATION_CONSTANTS.ENGINE_TYPES.COHERENCE_INTEGRATOR
            ],
            'evolution:triggered': [
                COMMUNICATION_CONSTANTS.ENGINE_TYPES.PROFIT_MAXIMIZER,
                COMMUNICATION_CONSTANTS.ENGINE_TYPES.CONSCIOUSNESS_ENGINE,
                COMMUNICATION_CONSTANTS.ENGINE_TYPES.UNIFIED_CORE
            ],
            'leverage:adjusted': [
                COMMUNICATION_CONSTANTS.ENGINE_TYPES.ADVERSITY_PREDICTOR,
                COMMUNICATION_CONSTANTS.ENGINE_TYPES.PROFIT_MAXIMIZER
            ],
            'profit:optimized': [
                COMMUNICATION_CONSTANTS.ENGINE_TYPES.LEVERAGE_ENGINE,
                COMMUNICATION_CONSTANTS.ENGINE_TYPES.CONSCIOUSNESS_ENGINE
            ],
            'consciousness:expanded': [
                COMMUNICATION_CONSTANTS.ENGINE_TYPES.ADVERSITY_PREDICTOR,
                COMMUNICATION_CONSTANTS.ENGINE_TYPES.COHERENCE_INTEGRATOR,
                COMMUNICATION_CONSTANTS.ENGINE_TYPES.UNIFIED_CORE
            ]
        };
        
        // Obtener recipients específicos para el tipo de evento
        const targetTypes = eventRouting[eventType] || [];
        
        // Encontrar engines del tipo correcto
        for (const [engineId, profile] of this.registeredEngines) {
            if (targetTypes.includes(profile.type)) {
                recipients.add(engineId);
            }
        }
        
        // Si no hay routing específico, enviar a todos los engines activos
        if (recipients.size === 0) {
            for (const [engineId, profile] of this.registeredEngines) {
                if (profile.is_active) {
                    recipients.add(engineId);
                }
            }
        }
        
        return recipients;
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 📨 SISTEMA DE MENSAJERÍA
    // ═══════════════════════════════════════════════════════════════════════
    
    sendMessage(targetEngineId, message, priority = COMMUNICATION_CONSTANTS.MESSAGE_PRIORITIES.MEDIUM) {
        try {
            const targetEngine = this.registeredEngines.get(targetEngineId);
            if (!targetEngine || !targetEngine.is_active) {
                throw new Error(`Engine ${targetEngineId} no disponible`);
            }
            
            // Preparar mensaje
            const formattedMessage = {
                ...message,
                id: message.id || this.generateMessageId(),
                target: targetEngineId,
                priority: priority,
                sent_at: Date.now(),
                retry_count: 0
            };
            
            // Añadir a cola si es necesario
            if (priority >= COMMUNICATION_CONSTANTS.MESSAGE_PRIORITIES.HIGH) {
                this.messageQueue.unshift(formattedMessage);
            } else {
                this.messageQueue.push(formattedMessage);
            }
            
            // Procesar cola inmediatamente para mensajes de alta prioridad
            if (priority >= COMMUNICATION_CONSTANTS.MESSAGE_PRIORITIES.HIGH) {
                this.processMessageQueue();
            }
            
            return formattedMessage.id;
        } catch (error) {
            console.error(`❌ [COMMUNICATION BRIDGE] Error enviando mensaje a ${targetEngineId}:`, error.message);
            this.communicationMetrics.messages_failed++;
            return null;
        }
    }
    
    async processMessageQueue() {
        if (this.messageQueue.length === 0) return;
        
        // Ordenar por prioridad
        this.messageQueue.sort((a, b) => b.priority - a.priority);
        
        // Procesar mensajes
        const messagesToProcess = Math.min(10, this.messageQueue.length); // Procesar máximo 10 por ciclo
        
        for (let i = 0; i < messagesToProcess; i++) {
            const message = this.messageQueue.shift();
            await this.deliverMessage(message);
        }
    }
    
    async deliverMessage(message) {
        try {
            const targetEngine = this.registeredEngines.get(message.target);
            if (!targetEngine) {
                throw new Error(`Engine ${message.target} no encontrado`);
            }
            
            // Intentar entregar mensaje
            if (targetEngine.engine && typeof targetEngine.engine.receiveMessage === 'function') {
                await targetEngine.engine.receiveMessage(message);
            } else if (targetEngine.engine && typeof targetEngine.engine.emit === 'function') {
                targetEngine.engine.emit('bridge:message', message);
            } else {
                // Método fallback: llamar método específico si existe
                const methodName = `handle_${message.type}`.replace(/:/g, '_');
                if (targetEngine.engine && typeof targetEngine.engine[methodName] === 'function') {
                    await targetEngine.engine[methodName](message.data);
                }
            }
            
            // Actualizar métricas
            this.communicationMetrics.messages_sent++;
            targetEngine.message_count++;
            
            // Marcar mensaje como pendiente de confirmación
            this.pendingMessages.set(message.id, {
                message,
                sent_at: Date.now(),
                timeout: setTimeout(() => {
                    this.handleMessageTimeout(message.id);
                }, COMMUNICATION_CONSTANTS.MESSAGE_TIMEOUT_MS)
            });
            
        } catch (error) {
            console.error(`❌ [COMMUNICATION BRIDGE] Error entregando mensaje ${message.id}:`, error.message);
            this.communicationMetrics.messages_failed++;
            
            // Reintentar si es posible
            if (message.retry_count < 3) {
                message.retry_count++;
                this.messageQueue.push(message);
            }
        }
    }
    
    confirmMessageDelivery(messageId, response = null) {
        const pendingMessage = this.pendingMessages.get(messageId);
        if (pendingMessage) {
            clearTimeout(pendingMessage.timeout);
            this.pendingMessages.delete(messageId);
            
            // Calcular tiempo de respuesta
            const responseTime = Date.now() - pendingMessage.sent_at;
            this.updateAverageResponseTime(responseTime);
            
            this.communicationMetrics.messages_received++;
        }
    }
    
    handleMessageTimeout(messageId) {
        const pendingMessage = this.pendingMessages.get(messageId);
        if (pendingMessage) {
            console.warn(`⏰ [COMMUNICATION BRIDGE] Timeout de mensaje ${messageId} a ${pendingMessage.message.target}`);
            this.pendingMessages.delete(messageId);
            this.communicationMetrics.messages_failed++;
            
            // Marcar engine como problemático
            const targetEngine = this.registeredEngines.get(pendingMessage.message.target);
            if (targetEngine) {
                targetEngine.error_count++;
                targetEngine.performance_score = Math.max(0.1, targetEngine.performance_score * 0.9);
            }
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 🔄 SINCRONIZACIÓN GLOBAL
    // ═══════════════════════════════════════════════════════════════════════
    
    async performGlobalSync() {
        if (this.synchronizationState.is_syncing) {
            console.log('⏳ [COMMUNICATION BRIDGE] Sincronización ya en progreso...');
            return false;
        }
        
        this.synchronizationState.is_syncing = true;
        const syncStartTime = Date.now();
        
        try {
            console.log('🔄 [COMMUNICATION BRIDGE] Iniciando sincronización global...');
            
            // Recopilar estados de todos los engines
            const engineStates = await this.collectAllEngineStates();
            
            // Calcular coherencia global
            const globalCoherence = this.calculateGlobalCoherence(engineStates);
            this.synchronizationState.global_coherence_level = globalCoherence;
            
            // Distribuir estado global a todos los engines
            const globalState = {
                sync_id: this.generateMessageId(),
                timestamp: Date.now(),
                engine_states: engineStates,
                global_coherence: globalCoherence,
                active_engines: this.registeredEngines.size,
                communication_metrics: { ...this.communicationMetrics }
            };
            
            // Enviar estado global a cada engine
            const syncPromises = [];
            for (const [engineId, profile] of this.registeredEngines) {
                if (profile.is_active) {
                    syncPromises.push(this.sendGlobalStateToEngine(engineId, globalState));
                }
            }
            
            await Promise.allSettled(syncPromises);
            
            const syncDuration = Date.now() - syncStartTime;
            console.log(`✅ [COMMUNICATION BRIDGE] Sincronización global completada (${syncDuration}ms)`);
            console.log(`🌐 [COMMUNICATION BRIDGE] Coherencia global: ${(globalCoherence * 100).toFixed(1)}%`);
            
            // Actualizar métricas
            this.communicationMetrics.sync_cycles_completed++;
            this.communicationMetrics.last_global_sync = Date.now();
            this.synchronizationState.last_sync_success = true;
            
            // Emitir evento de sincronización completada
            this.emit('global_sync:completed', {
                duration: syncDuration,
                coherence: globalCoherence,
                engines_synced: this.registeredEngines.size,
                timestamp: Date.now()
            });
            
            return true;
            
        } catch (error) {
            console.error('❌ [COMMUNICATION BRIDGE] Error en sincronización global:', error.message);
            this.synchronizationState.last_sync_success = false;
            return false;
        } finally {
            this.synchronizationState.is_syncing = false;
        }
    }
    
    async collectAllEngineStates() {
        const states = {};
        
        for (const [engineId, profile] of this.registeredEngines) {
            try {
                let engineState = null;
                
                if (profile.engine && typeof profile.engine.getState === 'function') {
                    engineState = await profile.engine.getState();
                } else if (profile.engine && profile.engine.state) {
                    engineState = profile.engine.state;
                } else if (profile.engine && profile.engine.quantumState) {
                    engineState = profile.engine.quantumState;
                }
                
                states[engineId] = {
                    type: profile.type,
                    state: engineState,
                    performance_score: profile.performance_score,
                    last_heartbeat: profile.last_heartbeat,
                    message_count: profile.message_count,
                    is_active: profile.is_active
                };
            } catch (error) {
                console.warn(`⚠️ [COMMUNICATION BRIDGE] Error obteniendo estado de ${engineId}:`, error.message);
                states[engineId] = { error: error.message, is_active: false };
            }
        }
        
        return states;
    }
    
    calculateGlobalCoherence(engineStates) {
        let totalCoherence = 0;
        let coherenceCount = 0;
        
        for (const [engineId, stateData] of Object.entries(engineStates)) {
            if (stateData.state && typeof stateData.state === 'object') {
                // Buscar métricas de coherencia en el estado
                const coherenceFields = ['coherence', 'coherence_level', 'quantum_coherence', 'sync_health'];
                
                for (const field of coherenceFields) {
                    if (stateData.state[field] && typeof stateData.state[field] === 'number') {
                        totalCoherence += stateData.state[field];
                        coherenceCount++;
                        break;
                    }
                }
                
                // Factor de rendimiento del engine
                if (stateData.performance_score) {
                    totalCoherence += stateData.performance_score;
                    coherenceCount++;
                }
            }
        }
        
        return coherenceCount > 0 ? totalCoherence / coherenceCount : 0.5;
    }
    
    async sendGlobalStateToEngine(engineId, globalState) {
        return this.sendMessage(engineId, {
            type: 'global_sync_update',
            data: globalState
        }, COMMUNICATION_CONSTANTS.MESSAGE_PRIORITIES.HIGH);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 💓 SISTEMA DE HEARTBEAT
    // ═══════════════════════════════════════════════════════════════════════
    
    startHeartbeatSystem() {
        setInterval(() => {
            this.checkEngineHeartbeats();
        }, COMMUNICATION_CONSTANTS.HEARTBEAT_INTERVAL_MS);
        
        console.log(`💓 [COMMUNICATION BRIDGE] Sistema de heartbeat iniciado (${COMMUNICATION_CONSTANTS.HEARTBEAT_INTERVAL_MS}ms)`);
    }
    
    checkEngineHeartbeats() {
        const now = Date.now();
        const maxHeartbeatAge = COMMUNICATION_CONSTANTS.HEARTBEAT_INTERVAL_MS * 3; // 6 segundos
        
        for (const [engineId, profile] of this.registeredEngines) {
            const heartbeatAge = now - profile.last_heartbeat;
            
            if (heartbeatAge > maxHeartbeatAge && profile.is_active) {
                console.warn(`💔 [COMMUNICATION BRIDGE] Engine ${engineId} sin heartbeat (${heartbeatAge}ms)`);
                profile.is_active = false;
                profile.performance_score *= 0.8;
                
                this.emit('engine:heartbeat_lost', { engineId, heartbeatAge });
            }
        }
    }
    
    updateEngineHeartbeat(engineId) {
        const profile = this.registeredEngines.get(engineId);
        if (profile) {
            profile.last_heartbeat = Date.now();
            if (!profile.is_active) {
                profile.is_active = true;
                console.log(`💓 [COMMUNICATION BRIDGE] Engine ${engineId} reconectado`);
                this.emit('engine:heartbeat_restored', { engineId });
            }
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 🛠️ UTILIDADES Y HELPERS
    // ═══════════════════════════════════════════════════════════════════════
    
    generateMessageId() {
        const timestamp = Date.now();
        const counter = (this.messageCounter++).toString().padStart(4, '0');
        const random = crypto.randomBytes(2).toString('hex');
        return `msg_${timestamp}_${counter}_${random}`;
    }
    
    calculateEventPriority(eventType, eventData) {
        // Mapeo de tipos de eventos a prioridades
        const priorityMap = {
            'adversity:predicted': COMMUNICATION_CONSTANTS.MESSAGE_PRIORITIES.HIGH,
            'defensive:activated': COMMUNICATION_CONSTANTS.MESSAGE_PRIORITIES.CRITICAL,
            'phoenix:resurrection': COMMUNICATION_CONSTANTS.MESSAGE_PRIORITIES.CRITICAL,
            'evolution:triggered': COMMUNICATION_CONSTANTS.MESSAGE_PRIORITIES.HIGH,
            'firmness:updated': COMMUNICATION_CONSTANTS.MESSAGE_PRIORITIES.MEDIUM,
            'prime:resonance_detected': COMMUNICATION_CONSTANTS.MESSAGE_PRIORITIES.MEDIUM,
            'consciousness:expanded': COMMUNICATION_CONSTANTS.MESSAGE_PRIORITIES.MEDIUM,
            'leverage:adjusted': COMMUNICATION_CONSTANTS.MESSAGE_PRIORITIES.MEDIUM,
            'profit:optimized': COMMUNICATION_CONSTANTS.MESSAGE_PRIORITIES.LOW
        };
        
        let basePriority = priorityMap[eventType] || COMMUNICATION_CONSTANTS.MESSAGE_PRIORITIES.LOW;
        
        // Ajustar prioridad basado en los datos del evento
        if (eventData) {
            if (eventData.intensity && eventData.intensity > 0.8) {
                basePriority = Math.min(5, basePriority + 1);
            }
            if (eventData.critical === true) {
                basePriority = COMMUNICATION_CONSTANTS.MESSAGE_PRIORITIES.CRITICAL;
            }
        }
        
        return basePriority;
    }
    
    updateAverageResponseTime(responseTime) {
        const alpha = 0.1; // Factor de suavizado
        this.communicationMetrics.average_response_time = 
            (1 - alpha) * this.communicationMetrics.average_response_time + alpha * responseTime;
    }
    
    limitHistorySize() {
        const maxSize = 1000;
        if (this.messageHistory.length > maxSize) {
            this.messageHistory = this.messageHistory.slice(-maxSize);
        }
    }
    
    setupInternalListeners() {
        this.on('engine_registered', (data) => {
            console.log(`🎯 [COMMUNICATION BRIDGE] Engine ${data.engineId} agregado a la red`);
        });
        
        this.on('global_sync:completed', (data) => {
            console.log(`🌍 [COMMUNICATION BRIDGE] Sincronización global: ${data.engines_synced} engines, coherencia ${(data.coherence * 100).toFixed(1)}%`);
        });
    }
    
    startSynchronizationCycles() {
        setInterval(() => {
            this.performGlobalSync();
            this.processMessageQueue();
        }, COMMUNICATION_CONSTANTS.SYNC_INTERVAL_MS);
    }
    
    setupAutomaticCleanup() {
        setInterval(() => {
            this.cleanupStaleData();
        }, 60000); // Cada minuto
    }
    
    cleanupStaleData() {
        // Limpiar mensajes pendientes antiguos
        const now = Date.now();
        const staleTimeout = COMMUNICATION_CONSTANTS.MESSAGE_TIMEOUT_MS * 2;
        
        for (const [messageId, pendingMessage] of this.pendingMessages) {
            if (now - pendingMessage.sent_at > staleTimeout) {
                clearTimeout(pendingMessage.timeout);
                this.pendingMessages.delete(messageId);
            }
        }
        
        // Limpiar engines inactivos por mucho tiempo
        for (const [engineId, profile] of this.registeredEngines) {
            const inactiveTime = now - profile.last_heartbeat;
            if (inactiveTime > 300000) { // 5 minutos
                console.log(`🗑️ [COMMUNICATION BRIDGE] Removiendo engine inactivo: ${engineId}`);
                this.registeredEngines.delete(engineId);
                this.engineStates.delete(engineId);
                this.engineCapabilities.delete(engineId);
            }
        }
        
        this.communicationMetrics.engines_connected = this.registeredEngines.size;
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 📊 MÉTODOS DE CONSULTA Y ESTADO
    // ═══════════════════════════════════════════════════════════════════════
    
    getConnectedEngines() {
        return Array.from(this.registeredEngines.entries()).map(([id, profile]) => ({
            id,
            type: profile.type,
            is_active: profile.is_active,
            performance_score: profile.performance_score,
            message_count: profile.message_count,
            last_heartbeat: profile.last_heartbeat,
            capabilities: Array.from(profile.capabilities)
        }));
    }
    
    getCommunicationMetrics() {
        return {
            ...this.communicationMetrics,
            queue_size: this.messageQueue.length,
            pending_messages: this.pendingMessages.size,
            history_size: this.messageHistory.length,
            sync_state: { ...this.synchronizationState }
        };
    }
    
    getEngineState(engineId) {
        const profile = this.registeredEngines.get(engineId);
        if (!profile) return null;
        
        return {
            ...profile,
            current_state: this.engineStates.get(engineId),
            capabilities: Array.from(profile.capabilities)
        };
    }
    
    broadcastEngineEvent(eventType, eventData) {
        const broadcastMessage = {
            type: 'broadcast',
            event_type: eventType,
            data: eventData,
            timestamp: Date.now()
        };
        
        for (const [engineId, profile] of this.registeredEngines) {
            if (profile.is_active) {
                this.sendMessage(engineId, broadcastMessage, COMMUNICATION_CONSTANTS.MESSAGE_PRIORITIES.MEDIUM);
            }
        }
    }
    
    // MÉTODO DE PARADA LIMPIA
    async shutdown() {
        console.log('🛑 [COMMUNICATION BRIDGE] Iniciando parada del sistema...');
        
        // Notificar a todos los engines
        this.broadcastEngineEvent('bridge:shutdown', { timestamp: Date.now() });
        
        // Esperar un momento para que se procesen los mensajes
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Limpiar recursos
        this.registeredEngines.clear();
        this.engineStates.clear();
        this.messageQueue.length = 0;
        this.pendingMessages.clear();
        
        console.log('✅ [COMMUNICATION BRIDGE] Sistema detenido correctamente');
    }
}

// Singleton para uso global
let globalCommunicationBridge = null;

function getQuantumEnginesCommunicationBridge() {
    if (!globalCommunicationBridge) {
        globalCommunicationBridge = new QuantumEnginesCommunicationBridge();
    }
    return globalCommunicationBridge;
}

module.exports = { 
    QuantumEnginesCommunicationBridge,
    getQuantumEnginesCommunicationBridge,
    COMMUNICATION_CONSTANTS
};

// Ejecutar si es llamado directamente
if (require.main === module) {
    console.log('🚀 [COMMUNICATION BRIDGE] Iniciando sistema de comunicación autónomo...');
    const bridge = new QuantumEnginesCommunicationBridge();
    
    // Test básico después de 5 segundos
    setTimeout(() => {
        console.log('\n📊 Estado del Bridge:');
        console.log('Engines conectados:', bridge.getConnectedEngines().length);
        console.log('Métricas:', bridge.getCommunicationMetrics());
    }, 5000);
}
