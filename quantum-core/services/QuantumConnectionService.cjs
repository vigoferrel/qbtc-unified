/**
 * Copyright © 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES.
 * Quantum Connection Service - Servicio de Conexión Cuántica Unificada
 * Maneja todas las conexiones entre servicios del sistema
 */

const axios = require('axios');
const WebSocket = require('ws');
const { logger } = require('../config/monitoring.cjs');
const config = require('../config/quantum-unified.json');
const FormData = require('form-data');

class QuantumConnectionService {
    constructor() {
        if (QuantumConnectionService.instance) {
            return QuantumConnectionService.instance;
        }

        // Inicializar conexiones
        this.connections = new Map();
        this.wsConnections = new Map();
        this.healthChecks = new Map();
        this.retryTimers = new Map();
        
        // Estado del servicio
        this.isInitialized = false;
        this.healthCheckInterval = null;
        
        QuantumConnectionService.instance = this;
    }

    /**
     * Inicializar conexiones con todos los servicios
     */
    async initializeConnections() {
        try {
            logger.info('[QUANTUM CONNECTION] 🌐 Iniciando conexiones con servicios...');

            // Conectar con cada servicio
            for (const [serviceName, serviceConfig] of Object.entries(config.servers)) {
                await this.connectToService(serviceName, serviceConfig);
            }

            // Iniciar health checks
            this.startHealthChecks();

            this.isInitialized = true;
            logger.info('[QUANTUM CONNECTION] ✅ Todas las conexiones establecidas');

            return true;

        } catch (error) {
            logger.error('[QUANTUM CONNECTION] ❌ Error inicializando conexiones:', error);
            throw error;
        }
    }

    /**
     * Conectar a un servicio específico
     */
    async connectToService(serviceName, serviceConfig) {
        const baseUrl = `http://${serviceConfig.host}:${serviceConfig.port}`;
        
        try {
            // Probar conexión HTTP
            const health = await axios.get(`${baseUrl}/unified/health`, { timeout: 5000 });
            
            if (health.status === 200) {
                this.connections.set(serviceName, {
                    baseUrl,
                    config: serviceConfig,
                    status: 'connected',
                    lastCheck: Date.now()
                });

                logger.info(`[QUANTUM CONNECTION] ✅ Conectado a ${serviceName} en ${baseUrl}`);

                // Configurar WebSocket si es necesario
                if (['quantum_core', 'trading_engine', 'market_data'].includes(serviceName)) {
                    await this.setupWebSocket(serviceName, serviceConfig);
                }

                return true;
            }

        } catch (error) {
            logger.error(`[QUANTUM CONNECTION] ❌ Error conectando a ${serviceName}:`, error.message);
            
            // Programar reconexión
            this.scheduleReconnection(serviceName, serviceConfig);
            
            return false;
        }
    }

    /**
     * Configurar conexión WebSocket
     */
    async setupWebSocket(serviceName, serviceConfig) {
        const wsUrl = `ws://${serviceConfig.host}:${serviceConfig.port}/ws`;
        
        try {
            const ws = new WebSocket(wsUrl);
            
            ws.on('open', () => {
                logger.info(`[QUANTUM CONNECTION] 🌊 WebSocket conectado a ${serviceName}`);
                this.wsConnections.set(serviceName, ws);
            });

            ws.on('message', (data) => {
                this.handleWebSocketMessage(serviceName, data);
            });

            ws.on('close', () => {
                logger.warn(`[QUANTUM CONNECTION] WebSocket desconectado de ${serviceName}`);
                this.wsConnections.delete(serviceName);
                this.scheduleWebSocketReconnection(serviceName, serviceConfig);
            });

            ws.on('error', (error) => {
                logger.error(`[QUANTUM CONNECTION] Error en WebSocket de ${serviceName}:`, error.message);
            });

        } catch (error) {
            logger.error(`[QUANTUM CONNECTION] ❌ Error configurando WebSocket para ${serviceName}:`, error.message);
        }
    }

    /**
     * Manejar mensajes WebSocket
     */
    handleWebSocketMessage(serviceName, data) {
        try {
            const message = JSON.parse(data);
            
            switch (serviceName) {
                case 'quantum_core':
                    this.handleQuantumMessage(message);
                    break;
                case 'trading_engine':
                    this.handleTradingMessage(message);
                    break;
                case 'market_data':
                    this.handleMarketMessage(message);
                    break;
            }

        } catch (error) {
            logger.error(`[QUANTUM CONNECTION] Error procesando mensaje de ${serviceName}:`, error.message);
        }
    }

    /**
     * Handlers específicos para cada tipo de mensaje
     */
    handleQuantumMessage(message) {
        // Procesar mensajes del core cuántico
        if (message.type === 'quantum_state') {
            this.emit('quantum_state_update', message.data);
        }
    }

    handleTradingMessage(message) {
        // Procesar mensajes de trading
        if (message.type === 'trade_executed') {
            this.emit('trade_update', message.data);
        }
    }

    handleMarketMessage(message) {
        // Procesar datos de mercado
        if (message.type === 'market_data') {
            this.emit('market_update', message.data);
        }
    }

    /**
     * Programar reconexión de servicio
     */
    scheduleReconnection(serviceName, serviceConfig) {
        if (this.retryTimers.has(serviceName)) {
            clearTimeout(this.retryTimers.get(serviceName));
        }

        const timer = setTimeout(async () => {
            logger.info(`[QUANTUM CONNECTION] 🔄 Reintentando conexión con ${serviceName}...`);
            await this.connectToService(serviceName, serviceConfig);
        }, config.websocket.reconnect_interval);

        this.retryTimers.set(serviceName, timer);
    }

    /**
     * Programar reconexión de WebSocket
     */
    scheduleWebSocketReconnection(serviceName, serviceConfig) {
        setTimeout(async () => {
            logger.info(`[QUANTUM CONNECTION] 🔄 Reintentando conexión WebSocket con ${serviceName}...`);
            await this.setupWebSocket(serviceName, serviceConfig);
        }, config.websocket.reconnect_interval);
    }

    /**
     * Iniciar verificaciones de salud
     */
    startHealthChecks() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }

        this.healthCheckInterval = setInterval(async () => {
            for (const [serviceName, connection] of this.connections.entries()) {
                try {
                    const health = await axios.get(`${connection.baseUrl}/unified/health`, { timeout: 2000 });
                    
                    this.healthChecks.set(serviceName, {
                        status: health.status === 200 ? 'healthy' : 'unhealthy',
                        lastCheck: Date.now(),
                        data: health.data
                    });

                } catch (error) {
                    logger.warn(`[QUANTUM CONNECTION] ⚠️ Health check fallido para ${serviceName}`);
                    
                    this.healthChecks.set(serviceName, {
                        status: 'unhealthy',
                        lastCheck: Date.now(),
                        error: error.message
                    });

                    // Reconectar si está caído
                    if (this.connections.has(serviceName)) {
                        const serviceConfig = this.connections.get(serviceName).config;
                        this.scheduleReconnection(serviceName, serviceConfig);
                    }
                }
            }
        }, config.monitoring.metrics_interval);
    }

    /**
     * Obtener estado de conexiones
     */
    getConnectionsStatus() {
        const status = {};
        
        for (const [serviceName, connection] of this.connections.entries()) {
            status[serviceName] = {
                connected: connection.status === 'connected',
                baseUrl: connection.baseUrl,
                wsConnected: this.wsConnections.has(serviceName),
                health: this.healthChecks.get(serviceName) || { status: 'unknown' },
                lastCheck: connection.lastCheck
            };
        }

        return status;
    }

    /**
     * Detener servicio
     */
    async shutdown() {
        logger.info('[QUANTUM CONNECTION] 🛑 Deteniendo servicio de conexiones...');
        
        // Limpiar temporizadores
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }

        for (const timer of this.retryTimers.values()) {
            clearTimeout(timer);
        }

        // Cerrar WebSockets
        for (const [serviceName, ws] of this.wsConnections.entries()) {
            logger.info(`[QUANTUM CONNECTION] Cerrando WebSocket de ${serviceName}...`);
            ws.close();
        }

        this.wsConnections.clear();
        this.connections.clear();
        this.healthChecks.clear();
        this.retryTimers.clear();
        
        this.isInitialized = false;
        
        logger.info('[QUANTUM CONNECTION] ✅ Servicio de conexiones detenido');
    }
}

// Exportar singleton
module.exports = new QuantumConnectionService();
