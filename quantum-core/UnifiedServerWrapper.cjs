const { UnifiedHttpServer } = require('./UnifiedHttpServer');
const { logger } = require('./config/monitoring');

class UnifiedServerWrapper {
    constructor() {
        this.server = UnifiedHttpServer.getInstance();
        this.isInitialized = false;
        this.healthChecks = new Map();
        this.startTime = null;
    }

    async initialize(config) {
        if (this.isInitialized) {
            logger.warn('[WRAPPER] Servidor ya inicializado');
            return;
        }

        try {
            // 1. Inicializar servidor base
            await this.server.initialize(config.port || 18020);
            
            // 2. Añadir ruta de health check
            this.server.app.get('/health', (req, res) => {
                res.json({
                    status: 'ok',
                    server: 'unified_quantum',
                    uptime: process.uptime(),
                    startTime: this.startTime,
                    health: {
                        server: true,
                        quantum: this.server.serverMetrics.consciousness >= 0.618,
                        coherence: this.server.serverMetrics.coherence >= 0.888
                    },
                    metrics: {
                        consciousness: this.server.serverMetrics.consciousness,
                        coherence: this.server.serverMetrics.coherence,
                        requests: this.server.serverMetrics.requests
                    },
                    timestamp: new Date().toISOString()
                });
            });

            // 3. Iniciar monitoreo de salud
            this.startHealthMonitoring();

            // 4. Marcar como inicializado
            this.isInitialized = true;
            this.startTime = new Date().toISOString();

            logger.info('[WRAPPER] Servidor unificado inicializado con health checks');
            return true;

        } catch (error) {
            logger.error('[WRAPPER] Error inicializando servidor:', error);
            throw error;
        }
    }

    async start() {
        if (!this.isInitialized) {
            throw new Error('Servidor no inicializado. Llamar initialize() primero');
        }

        try {
            await this.server.start();
            logger.info('[WRAPPER] Servidor unificado iniciado completamente');
            return true;
        } catch (error) {
            logger.error('[WRAPPER] Error iniciando servidor:', error);
            throw error;
        }
    }

    async stop() {
        try {
            await this.server.stop();
            this.isInitialized = false;
            this.startTime = null;
            this.healthChecks.clear();
            logger.info('[WRAPPER] Servidor unificado detenido completamente');
        } catch (error) {
            logger.error('[WRAPPER] Error deteniendo servidor:', error);
            throw error;
        }
    }

    startHealthMonitoring() {
        setInterval(() => {
            const health = {
                server: this.server.isRunning,
                quantum: this.server.serverMetrics.consciousness >= 0.618,
                coherence: this.server.serverMetrics.coherence >= 0.888,
                timestamp: new Date().toISOString()
            };

            this.healthChecks.set('latest', health);
            
            // Mantener solo las últimas 10 verificaciones
            if (this.healthChecks.size > 10) {
                const oldestKey = Array.from(this.healthChecks.keys())[0];
                this.healthChecks.delete(oldestKey);
            }

        }, 5000); // Verificar cada 5 segundos
    }

    getHealth() {
        return {
            status: this.isInitialized && this.server.isRunning ? 'ok' : 'error',
            initialized: this.isInitialized,
            running: this.server.isRunning,
            startTime: this.startTime,
            uptime: process.uptime(),
            checks: Array.from(this.healthChecks.values()),
            metrics: {
                consciousness: this.server.serverMetrics.consciousness,
                coherence: this.server.serverMetrics.coherence,
                requests: this.server.serverMetrics.requests
            }
        };
    }
}

// Singleton pattern
let instance = null;

function getUnifiedServer() {
    if (!instance) {
        instance = new UnifiedServerWrapper();
    }
    return instance;
}

module.exports = { getUnifiedServer };
