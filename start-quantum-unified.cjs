/**
 * Copyright © 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES.
 * Start Quantum Unified - Iniciador del Sistema Cuántico Unificado
 */

const path = require('path');
const { spawn } = require('child_process');
const config = require('./quantum-core/config/quantum-unified.json');
const { logger } = require('./quantum-core/config/monitoring');

class QuantumUnifiedStarter {
    constructor() {
        this.services = new Map();
        this.readyChecks = new Map();
        this.startupOrder = [
            {
                name: 'unified',
                script: './quantum-core/UnifiedHttpServer.js',
                readyCheck: async () => this.checkServiceHealth('unified')
            },
            {
                name: 'quantum_core',
                script: './quantum-core/QuantumUnifiedCore.js',
                readyCheck: async () => this.checkServiceHealth('quantum_core')
            },
            {
                name: 'trading_engine',
                script: './quantum-core/QuantumMarketMaker.js',
                dependencies: ['quantum_core'],
                readyCheck: async () => this.checkServiceHealth('trading_engine')
            },
            {
                name: 'market_data',
                script: './quantum-core/UniversalSymbolMonitor.js',
                dependencies: ['trading_engine'],
                readyCheck: async () => this.checkServiceHealth('market_data')
            },
            {
                name: 'monitoring',
                script: './quantum-core/QuantumMonitoring.js',
                readyCheck: async () => this.checkServiceHealth('monitoring')
            },
            {
                name: 'frontend',
                script: './frontend-unified/start.js',
                dependencies: ['unified', 'quantum_core', 'trading_engine'],
                readyCheck: async () => this.checkServiceHealth('frontend')
            }
        ];
    }

    /**
     * Iniciar todos los servicios en orden
     */
    async startAll() {
        logger.info('[QUANTUM STARTER] 🚀 Iniciando Sistema Cuántico Unificado...');

        try {
            for (const service of this.startupOrder) {
                // Verificar dependencias
                if (service.dependencies) {
                    await this.waitForDependencies(service.dependencies);
                }

                // Iniciar servicio
                await this.startService(service);

                // Esperar a que esté listo
                await this.waitForService(service);
            }

            logger.info('[QUANTUM STARTER] ✅ Sistema Cuántico Unificado iniciado completamente');
            this.startMonitoring();

        } catch (error) {
            logger.error('[QUANTUM STARTER] ❌ Error iniciando sistema:', error);
            await this.shutdown();
            process.exit(1);
        }
    }

    /**
     * Iniciar un servicio individual
     */
    async startService(service) {
        logger.info(`[QUANTUM STARTER] 🔄 Iniciando servicio: ${service.name}...`);

        return new Promise((resolve, reject) => {
            const childProcess = spawn('node', [service.script], {
                stdio: 'pipe',
                env: {
                    ...process.env,
                    NODE_ENV: 'production',
                    SERVICE_NAME: service.name,
                    ...this.getServiceEnv(service.name)
                }
            });

            // Capturar salida
            childProcess.stdout.on('data', (data) => {
                logger.info(`[${service.name}] ${data.toString().trim()}`);
            });

            childProcess.stderr.on('data', (data) => {
                logger.error(`[${service.name}] ${data.toString().trim()}`);
            });

            // Manejar errores y cierre
            childProcess.on('error', (error) => {
                logger.error(`[${service.name}] ❌ Error:`, error);
                reject(error);
            });

            childProcess.on('close', (code) => {
                if (code !== 0) {
                    logger.error(`[${service.name}] ❌ Cerrado con código: ${code}`);
                    reject(new Error(`Service ${service.name} closed with code ${code}`));
                } else {
                    resolve();
                }
            });

            // Guardar referencia del proceso
            this.services.set(service.name, {
                process: childProcess,
                config: service,
                startTime: Date.now()
            });
        });
    }

    /**
     * Esperar a que un servicio esté listo
     */
    async waitForService(service) {
        logger.info(`[QUANTUM STARTER] ⏳ Esperando a que ${service.name} esté listo...`);

        const maxAttempts = 30;
        const delay = 1000;
        let attempts = 0;

        while (attempts < maxAttempts) {
            try {
                const ready = await service.readyCheck();
                if (ready) {
                    logger.info(`[QUANTUM STARTER] ✅ Servicio ${service.name} listo`);
                    return true;
                }
            } catch (error) {
                logger.debug(`[QUANTUM STARTER] Servicio ${service.name} aún no está listo:`, error.message);
            }

            await new Promise(resolve => setTimeout(resolve, delay));
            attempts++;
        }

        throw new Error(`Timeout esperando a que ${service.name} esté listo`);
    }

    /**
     * Esperar por dependencias
     */
    async waitForDependencies(dependencies) {
        logger.info(`[QUANTUM STARTER] ⏳ Verificando dependencias: ${dependencies.join(', ')}...`);

        for (const dep of dependencies) {
            if (!this.services.has(dep)) {
                throw new Error(`Dependencia ${dep} no encontrada`);
            }

            const service = this.startupOrder.find(s => s.name === dep);
            await this.waitForService(service);
        }
    }

    /**
     * Verificar salud de un servicio
     */
    async checkServiceHealth(serviceName) {
        const serviceConfig = config.servers[serviceName];
        if (!serviceConfig) return false;

        try {
            const axios = require('axios');
            const response = await axios.get(
                `http://${serviceConfig.host}:${serviceConfig.port}/unified/health`,
                { timeout: 5000 }
            );

            return response.status === 200;

        } catch (error) {
            return false;
        }
    }

    /**
     * Obtener variables de entorno para un servicio
     */
    getServiceEnv(serviceName) {
        const serviceConfig = config.servers[serviceName];
        
        return {
            PORT: serviceConfig.port.toString(),
            HOST: serviceConfig.host,
            UNIFIED_SERVER: `http://${config.servers.unified.host}:${config.servers.unified.port}`,
            QUANTUM_CORE: `http://${config.servers.quantum_core.host}:${config.servers.quantum_core.port}`,
            TRADING_ENGINE: `http://${config.servers.trading_engine.host}:${config.servers.trading_engine.port}`,
            MARKET_DATA: `http://${config.servers.market_data.host}:${config.servers.market_data.port}`,
            MONITORING: `http://${config.servers.monitoring.host}:${config.servers.monitoring.port}`,
            LOG_LEVEL: config.monitoring.log_level,
            QUANTUM_TTL: config.cache.quantum_ttl.toString(),
            METRICS_INTERVAL: config.monitoring.metrics_interval.toString()
        };
    }

    /**
     * Iniciar monitoreo de servicios
     */
    startMonitoring() {
        setInterval(async () => {
            for (const [name, service] of this.services.entries()) {
                const health = await this.checkServiceHealth(name);
                
                if (!health) {
                    logger.warn(`[QUANTUM STARTER] ⚠️ Servicio ${name} no responde, reiniciando...`);
                    await this.restartService(name);
                }
            }
        }, config.monitoring.metrics_interval);
    }

    /**
     * Reiniciar un servicio
     */
    async restartService(serviceName) {
        const service = this.services.get(serviceName);
        if (!service) return;

        try {
            // Detener servicio actual
            service.process.kill();
            this.services.delete(serviceName);

            // Encontrar configuración
            const serviceConfig = this.startupOrder.find(s => s.name === serviceName);
            if (!serviceConfig) return;

            // Reiniciar
            await this.startService(serviceConfig);
            await this.waitForService(serviceConfig);

            logger.info(`[QUANTUM STARTER] ✅ Servicio ${serviceName} reiniciado`);

        } catch (error) {
            logger.error(`[QUANTUM STARTER] ❌ Error reiniciando ${serviceName}:`, error);
        }
    }

    /**
     * Detener todos los servicios
     */
    async shutdown() {
        logger.info('[QUANTUM STARTER] 🛑 Deteniendo Sistema Cuántico Unificado...');

        // Detener en orden inverso
        for (const service of [...this.startupOrder].reverse()) {
            const running = this.services.get(service.name);
            if (running) {
                logger.info(`[QUANTUM STARTER] Deteniendo ${service.name}...`);
                running.process.kill();
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        this.services.clear();
        logger.info('[QUANTUM STARTER] ✅ Sistema detenido completamente');
    }
}

// Manejar señales de terminación
process.on('SIGTERM', async () => {
    logger.info('[QUANTUM STARTER] Señal SIGTERM recibida');
    const starter = new QuantumUnifiedStarter();
    await starter.shutdown();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('[QUANTUM STARTER] Señal SIGINT recibida');
    const starter = new QuantumUnifiedStarter();
    await starter.shutdown();
    process.exit(0);
});

// Iniciar sistema
if (require.main === module) {
    const starter = new QuantumUnifiedStarter();
    starter.startAll().catch(error => {
        logger.error('[QUANTUM STARTER] Error fatal:', error);
        process.exit(1);
    });
}

module.exports = QuantumUnifiedStarter;
