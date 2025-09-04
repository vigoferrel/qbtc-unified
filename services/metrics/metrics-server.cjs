/**
 * QBTC METRICS SERVER - Servidor Centralizado de Métricas
 * =======================================================
 * 
 * Recolecta métricas de todos los servicios y las expone para Prometheus
 * Funcionalidades:
 * 1. Agrega métricas de todos los servicios QBTC
 * 2. Expone endpoint /metrics para Prometheus
 * 3. Proporciona dashboards de estado del sistema
 * 4. Alerta basada en métricas críticas
 */

const http = require('http');
const { QBTCMetrics, QBTCLogger, HealthCheck, SecureRandom } = require('../../lib/qbtc-runtime.cjs');

class MetricsServer {
    constructor() {
        this.serviceName = 'MetricsServer';
        this.port = 14701;
        this.logger = new QBTCLogger(this.serviceName);
        this.metrics = new QBTCMetrics(this.serviceName);
        
        // Configuración de servicios para recolección
        this.services = {
            'MetaConsciencia': { port: 3001, path: '/metrics' },
            'Guardian': { port: 14601, path: '/metrics' },
            'Leonardo': { port: 3003, path: '/metrics' },
            'QuantumEngine': { port: 14105, path: '/metrics' },
            'RiskManager': { port: 14501, path: '/metrics' },
            'TradingSystem': { port: 14201, path: '/metrics' },
            'AdminServer': { port: 8888, path: '/metrics' }
        };
        
        // Cache de métricas
        this.metricsCache = new Map();
        this.lastUpdate = new Map();
        
        // Configurar health checks
        this.healthCheck = new HealthCheck(this.serviceName, {
            'metrics_collection': () => this.validateMetricsCollection(),
            'services_availability': () => this.validateServicesAvailability(),
            'cache_health': () => this.validateCacheHealth()
        });
        
        this.logger.info('Metrics Server inicializándose');
        this.startMetricsCollection();
        this.setupServer();
    }

    /**
     * Inicia recolección periódica de métricas
     */
    startMetricsCollection() {
        // Recolección rápida cada 10 segundos
        setInterval(() => {
            this.collectAllMetrics();
        }, 10000);
        
        // Limpieza de cache cada 5 minutos
        setInterval(() => {
            this.cleanupCache();
        }, 300000);
        
        this.logger.info('Recolección de métricas iniciada');
    }

    /**
     * Recolecta métricas de todos los servicios
     */
    async collectAllMetrics() {
        const startTime = this.metrics.startRequest();
        
        try {
            const promises = Object.entries(this.services).map(([name, config]) =>
                this.collectServiceMetrics(name, config)
            );
            
            const results = await Promise.allSettled(promises);
            
            let successCount = 0;
            let failureCount = 0;
            
            results.forEach((result, index) => {
                const serviceName = Object.keys(this.services)[index];
                if (result.status === 'fulfilled') {
                    successCount++;
                    this.logger.debug(`Métricas recolectadas de ${serviceName}`);
                } else {
                    failureCount++;
                    this.logger.warn(`Error recolectando de ${serviceName}`, { 
                        error: result.reason?.message 
                    });
                }
            });
            
            this.metrics.endRequestSuccess(startTime);
            this.metrics.setCustomMetric('services_collected', successCount);
            this.metrics.setCustomMetric('collection_failures', failureCount);
            this.metrics.setCustomMetric('cache_size', this.metricsCache.size);
            
        } catch (error) {
            this.logger.error('Error en recolección general', { error: error.message });
            this.metrics.endRequestFailure(startTime);
        }
    }

    /**
     * Recolecta métricas de un servicio específico
     */
    async collectServiceMetrics(serviceName, config) {
        try {
            const response = await this.httpRequest(
                `http://localhost:${config.port}${config.path}`
            );
            
            // Almacenar en cache
            this.metricsCache.set(serviceName, {
                data: response,
                timestamp: Date.now(),
                status: 'success'
            });
            
            this.lastUpdate.set(serviceName, Date.now());
            
            return response;
            
        } catch (error) {
            // Marcar como error pero mantener último dato válido si existe
            const cached = this.metricsCache.get(serviceName);
            if (cached) {
                cached.status = 'error';
                cached.lastError = error.message;
            } else {
                this.metricsCache.set(serviceName, {
                    data: null,
                    timestamp: Date.now(),
                    status: 'error',
                    lastError: error.message
                });
            }
            
            throw error;
        }
    }

    /**
     * Genera métricas agregadas en formato Prometheus
     */
    generateAggregatedMetrics() {
        let output = '';
        const timestamp = Date.now();
        
        // Header
        output += `# QBTC Unified System Metrics - Generated at ${new Date().toISOString()}\n`;
        output += `# Collected from ${this.metricsCache.size} services\n\n`;
        
        // Métricas del sistema agregado
        output += `# HELP qbtc_system_services_total Total number of services\n`;
        output += `# TYPE qbtc_system_services_total gauge\n`;
        output += `qbtc_system_services_total ${Object.keys(this.services).length}\n\n`;
        
        output += `# HELP qbtc_system_services_healthy Number of healthy services\n`;
        output += `# TYPE qbtc_system_services_healthy gauge\n`;
        const healthyServices = Array.from(this.metricsCache.values())
            .filter(cache => cache.status === 'success').length;
        output += `qbtc_system_services_healthy ${healthyServices}\n\n`;
        
        output += `# HELP qbtc_system_last_collection_timestamp Last metrics collection timestamp\n`;
        output += `# TYPE qbtc_system_last_collection_timestamp gauge\n`;
        output += `qbtc_system_last_collection_timestamp ${timestamp}\n\n`;
        
        // Métricas individuales de cada servicio
        for (const [serviceName, cached] of this.metricsCache) {
            if (cached.status === 'success' && cached.data) {
                output += `# ===== METRICS FROM ${serviceName.toUpperCase()} =====\n`;
                
                if (typeof cached.data === 'string') {
                    // Datos ya en formato Prometheus
                    output += cached.data;
                } else if (typeof cached.data === 'object') {
                    // Convertir objeto JSON a formato Prometheus
                    output += this.convertObjectToPrometheus(cached.data, serviceName);
                }
                
                output += `\n`;
            } else {
                // Métrica de estado del servicio
                output += `# HELP qbtc_service_status Service status (1=up, 0=down)\n`;
                output += `# TYPE qbtc_service_status gauge\n`;
                output += `qbtc_service_status{service="${serviceName}"} 0\n\n`;
            }
        }
        
        // Métricas propias del servidor
        output += `# ===== METRICS SERVER INTERNAL METRICS =====\n`;
        output += this.metrics.getPrometheusMetrics();
        
        return output;
    }

    /**
     * Convierte objeto JSON a formato Prometheus
     */
    convertObjectToPrometheus(data, serviceName) {
        let output = '';
        
        if (data.metrics) {
            const metrics = data.metrics;
            
            output += `# HELP qbtc_service_uptime Service uptime in milliseconds\n`;
            output += `# TYPE qbtc_service_uptime gauge\n`;
            output += `qbtc_service_uptime{service="${serviceName}"} ${metrics.uptime || 0}\n\n`;
            
            output += `# HELP qbtc_service_memory_usage Memory usage percentage\n`;
            output += `# TYPE qbtc_service_memory_usage gauge\n`;
            output += `qbtc_service_memory_usage{service="${serviceName}"} ${metrics.memoryUsage || 0}\n\n`;
            
            output += `# HELP qbtc_service_cpu_usage CPU usage percentage\n`;
            output += `# TYPE qbtc_service_cpu_usage gauge\n`;
            output += `qbtc_service_cpu_usage{service="${serviceName}"} ${metrics.cpuUsage || 0}\n\n`;
            
            // Métricas personalizadas
            if (metrics.customMetrics) {
                for (const [key, value] of Object.entries(metrics.customMetrics)) {
                    output += `# HELP qbtc_service_${key} Custom metric from ${serviceName}\n`;
                    output += `# TYPE qbtc_service_${key} gauge\n`;
                    output += `qbtc_service_${key}{service="${serviceName}"} ${value}\n\n`;
                }
            }
        }
        
        return output;
    }

    /**
     * Genera resumen del estado del sistema
     */
    generateSystemStatus() {
        const status = {
            timestamp: new Date().toISOString(),
            system: 'QBTC-UNIFIED',
            overall_status: 'HEALTHY',
            services: {},
            metrics: {
                total_services: Object.keys(this.services).length,
                healthy_services: 0,
                error_services: 0,
                last_collection: null
            }
        };
        
        // Estado de cada servicio
        for (const [serviceName, cached] of this.metricsCache) {
            const serviceStatus = {
                status: cached.status === 'success' ? 'HEALTHY' : 'ERROR',
                last_update: new Date(cached.timestamp).toISOString(),
                error: cached.lastError || null
            };
            
            if (cached.data && cached.data.metrics) {
                serviceStatus.uptime = cached.data.uptime;
                serviceStatus.memory_usage = cached.data.metrics.memoryUsage;
                serviceStatus.cpu_usage = cached.data.metrics.cpuUsage;
            }
            
            status.services[serviceName] = serviceStatus;
            
            if (serviceStatus.status === 'HEALTHY') {
                status.metrics.healthy_services++;
            } else {
                status.metrics.error_services++;
            }
        }
        
        // Estado general
        if (status.metrics.error_services > status.metrics.healthy_services) {
            status.overall_status = 'DEGRADED';
        }
        
        if (status.metrics.healthy_services === 0) {
            status.overall_status = 'CRITICAL';
        }
        
        return status;
    }

    /**
     * Limpia cache antiguo
     */
    cleanupCache() {
        const maxAge = 10 * 60 * 1000; // 10 minutos
        const now = Date.now();
        
        for (const [serviceName, cached] of this.metricsCache) {
            if (now - cached.timestamp > maxAge) {
                this.logger.debug(`Limpiando cache antiguo de ${serviceName}`);
                this.metricsCache.delete(serviceName);
                this.lastUpdate.delete(serviceName);
            }
        }
    }

    /**
     * Validadores de health check
     */
    validateMetricsCollection() {
        const recentUpdates = Array.from(this.lastUpdate.values())
            .filter(timestamp => Date.now() - timestamp < 60000).length;
        
        if (recentUpdates < Object.keys(this.services).length / 2) {
            throw new Error('Less than 50% of services have recent metrics');
        }
        
        return `${recentUpdates}/${Object.keys(this.services).length} services updated recently`;
    }

    validateServicesAvailability() {
        const healthyCount = Array.from(this.metricsCache.values())
            .filter(cache => cache.status === 'success').length;
        
        return `${healthyCount}/${Object.keys(this.services).length} services available`;
    }

    validateCacheHealth() {
        return `Cache size: ${this.metricsCache.size} entries`;
    }

    /**
     * Utilidad para HTTP requests
     */
    async httpRequest(url, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port,
                path: urlObj.pathname,
                method: 'GET',
                timeout: timeout,
                headers: {
                    'User-Agent': 'QBTC-MetricsServer/1.0'
                }
            };

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        // Intentar parsear como JSON
                        const parsed = JSON.parse(data);
                        resolve(parsed);
                    } catch {
                        // Si no es JSON, devolver como texto (formato Prometheus)
                        resolve(data);
                    }
                });
            });

            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error(`Request timeout for ${url}`));
            });
            
            req.end();
        });
    }

    /**
     * Configura servidor HTTP
     */
    setupServer() {
        this.server = http.createServer(async (req, res) => {
            const startTime = this.metrics.startRequest();
            
            try {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

                if (req.method === 'OPTIONS') {
                    res.statusCode = 204;
                    res.end();
                    return;
                }

                await this.handleRequest(req, res);
                this.metrics.endRequestSuccess(startTime);
                
            } catch (error) {
                this.handleError(res, error);
                this.metrics.endRequestFailure(startTime);
            }
        });

        this.server.listen(this.port, () => {
            this.logger.info(`Metrics Server listening on port ${this.port}`);
        });
    }

    /**
     * Maneja requests HTTP
     */
    async handleRequest(req, res) {
        const { method, url } = req;
        
        this.logger.debug(`${method} ${url}`);
        
        if (method === 'GET' && url === '/health') {
            const healthResult = await this.healthCheck.runHealthChecks();
            res.statusCode = healthResult.status === 'healthy' ? 200 : 503;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(healthResult));
            return;
        }
        
        if (method === 'GET' && url === '/metrics') {
            const metrics = this.generateAggregatedMetrics();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end(metrics);
            return;
        }
        
        if (method === 'GET' && url === '/status') {
            const status = this.generateSystemStatus();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(status));
            return;
        }
        
        if (method === 'GET' && url === '/services') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                services: this.services,
                cache_status: Object.fromEntries(
                    Array.from(this.metricsCache.entries()).map(([name, cache]) => [
                        name,
                        {
                            status: cache.status,
                            last_update: new Date(cache.timestamp).toISOString(),
                            has_data: !!cache.data
                        }
                    ])
                )
            }));
            return;
        }
        
        // Endpoint no encontrado
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Endpoint not found' }));
    }

    /**
     * Maneja errores HTTP
     */
    handleError(res, error) {
        this.logger.error('HTTP request error', { error: error.message });
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString()
        }));
    }
}

// Iniciar servidor
const metricsServer = new MetricsServer();

// Manejar cierre graceful
process.on('SIGINT', () => {
    metricsServer.logger.info('Received SIGINT, shutting down gracefully');
    if (metricsServer.server) {
        metricsServer.server.close(() => {
            metricsServer.logger.info('Metrics Server stopped');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

process.on('uncaughtException', (error) => {
    metricsServer.logger.error('Uncaught exception', { error: error.message, stack: error.stack });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    metricsServer.logger.error('Unhandled rejection', { reason, promise });
});

module.exports = MetricsServer;
