// ========================================================================
// ⚖️ LOAD BALANCER - LEONARDO-FEYNMAN QUANTUM DESIGN
// Sistema de Balanceo de Carga Inteligente
// "La carga se distribuye como ondas cuánticas en equilibrio perfecto"
// ========================================================================

const { EventEmitter } = require('events');

class LoadBalancer extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.config = {
            algorithm: options.algorithm || 'ROUND_ROBIN', // ROUND_ROBIN, LEAST_CONNECTIONS, WEIGHTED, HEALTH_CHECK
            healthCheckInterval: options.healthCheckInterval || 10000,
            healthCheckTimeout: options.healthCheckTimeout || 5000,
            maxRetries: options.maxRetries || 3,
            retryDelay: options.retryDelay || 1000,
            ...options
        };
        
        // Servidores disponibles
        this.servers = new Map();
        this.currentIndex = 0;
        
        // Métricas del balanceador
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            avgResponseTime: 0,
            totalResponseTime: 0,
            serverErrors: 0,
            loadDistribution: {}
        };
        
        // Estado del balanceador
        this.state = {
            healthy: true,
            activeServers: 0,
            totalServers: 0,
            lastHealthCheck: Date.now()
        };
        
        // Configurar health checks
        this.setupHealthChecks();
        
        console.log('[LOAD BALANCER] ⚖️ Balanceador de carga inicializado');
    }
    
    /**
     * Añadir servidor al balanceador
     */
    addServer(serverId, serverConfig) {
        const server = {
            id: serverId,
            config: serverConfig,
            status: 'HEALTHY',
            weight: serverConfig.weight || 1,
            connections: 0,
            maxConnections: serverConfig.maxConnections || 100,
            responseTime: 0,
            lastHealthCheck: Date.now(),
            metrics: {
                requests: 0,
                successful: 0,
                failed: 0,
                avgResponseTime: 0,
                totalResponseTime: 0
            }
        };
        
        this.servers.set(serverId, server);
        this.state.totalServers = this.servers.size;
        this.state.activeServers = Array.from(this.servers.values()).filter(s => s.status === 'HEALTHY').length;
        
        console.log(`[LOAD BALANCER] ➕ Servidor ${serverId} añadido`);
        this.emit('serverAdded', serverId);
    }
    
    /**
     * Obtener siguiente servidor según algoritmo
     */
    getNextServer() {
        const healthyServers = Array.from(this.servers.values()).filter(s => s.status === 'HEALTHY');
        
        if (healthyServers.length === 0) {
            throw new Error('No hay servidores saludables disponibles');
        }
        
        switch (this.config.algorithm) {
            case 'ROUND_ROBIN':
                return this.getRoundRobinServer(healthyServers);
            case 'LEAST_CONNECTIONS':
                return this.getLeastConnectionsServer(healthyServers);
            case 'WEIGHTED':
                return this.getWeightedServer(healthyServers);
            case 'HEALTH_CHECK':
                return this.getHealthCheckServer(healthyServers);
            default:
                return this.getRoundRobinServer(healthyServers);
        }
    }
    
    /**
     * Algoritmo Round Robin
     */
    getRoundRobinServer(healthyServers) {
        const server = healthyServers[this.currentIndex % healthyServers.length];
        this.currentIndex = (this.currentIndex + 1) % healthyServers.length;
        return server;
    }
    
    /**
     * Algoritmo Least Connections
     */
    getLeastConnectionsServer(healthyServers) {
        return healthyServers.reduce((min, server) => {
            return server.connections < min.connections ? server : min;
        });
    }
    
    /**
     * Algoritmo Weighted
     */
    getWeightedServer(healthyServers) {
        const totalWeight = healthyServers.reduce((sum, server) => sum + server.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const server of healthyServers) {
            random -= server.weight;
            if (random <= 0) {
                return server;
            }
        }
        
        return healthyServers[0];
    }
    
    /**
     * Algoritmo Health Check
     */
    getHealthCheckServer(healthyServers) {
        // Ordenar por tiempo de respuesta y salud
        return healthyServers.sort((a, b) => {
            const aScore = this.calculateHealthScore(a);
            const bScore = this.calculateHealthScore(b);
            return bScore - aScore;
        })[0];
    }
    
    /**
     * Calcular score de salud del servidor
     */
    calculateHealthScore(server) {
        const responseTimeScore = Math.max(0, 100 - server.responseTime);
        const connectionScore = Math.max(0, 100 - (server.connections / server.maxConnections) * 100);
        const successRate = server.metrics.requests > 0 ? 
            (server.metrics.successful / server.metrics.requests) * 100 : 100;
        
        return (responseTimeScore + connectionScore + successRate) / 3;
    }
    
    /**
     * Distribuir petición
     */
    async distributeRequest(requestData) {
        const startTime = Date.now();
        this.metrics.totalRequests++;
        
        let lastError = null;
        
        for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
            try {
                const server = this.getNextServer();
                
                if (!server) {
                    throw new Error('No hay servidores disponibles');
                }
                
                // Incrementar conexiones
                server.connections++;
                server.metrics.requests++;
                
                // Ejecutar petición
                const result = await this.executeRequest(server, requestData);
                
                // Actualizar métricas exitosas
                const responseTime = Date.now() - startTime;
                this.updateServerMetrics(server, true, responseTime);
                this.updateMetrics(true, responseTime);
                
                return result;
                
            } catch (error) {
                lastError = error;
                
                // Actualizar métricas de error
                this.metrics.failedRequests++;
                this.metrics.serverErrors++;
                
                // Esperar antes del siguiente intento
                if (attempt < this.config.maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
                }
            }
        }
        
        // Todos los intentos fallaron
        this.metrics.failedRequests++;
        throw lastError || new Error('Todos los servidores fallaron');
    }
    
    /**
     * Ejecutar petición en servidor
     */
    async executeRequest(server, requestData) {
        return new Promise((resolve, reject) => {
            // Simular petición HTTP
            const timeout = setTimeout(() => {
                reject(new Error('Request timeout'));
            }, this.config.healthCheckTimeout);
            
            // Simular respuesta exitosa
            setTimeout(() => {
                clearTimeout(timeout);
                resolve({
                    serverId: server.id,
                    data: requestData,
                    timestamp: Date.now()
                });
            }, Math.random() * 100 + 50); // Latencia simulada 50-150ms
        });
    }
    
    /**
     * Actualizar métricas del servidor
     */
    updateServerMetrics(server, success, responseTime) {
        server.connections = Math.max(0, server.connections - 1);
        server.responseTime = responseTime;
        server.metrics.totalResponseTime += responseTime;
        server.metrics.avgResponseTime = server.metrics.totalResponseTime / server.metrics.requests;
        
        if (success) {
            server.metrics.successful++;
        } else {
            server.metrics.failed++;
        }
    }
    
    /**
     * Actualizar métricas del balanceador
     */
    updateMetrics(success, responseTime) {
        if (success) {
            this.metrics.successfulRequests++;
        }
        
        this.metrics.totalResponseTime += responseTime;
        this.metrics.avgResponseTime = this.metrics.totalResponseTime / this.metrics.totalRequests;
    }
    
    /**
     * Configurar health checks
     */
    setupHealthChecks() {
        setInterval(() => {
            this.performHealthChecks();
        }, this.config.healthCheckInterval);
    }
    
    /**
     * Realizar health checks
     */
    async performHealthChecks() {
        const healthCheckPromises = Array.from(this.servers.values()).map(async (server) => {
            try {
                const isHealthy = await this.checkServerHealth(server);
                const previousStatus = server.status;
                
                server.status = isHealthy ? 'HEALTHY' : 'UNHEALTHY';
                server.lastHealthCheck = Date.now();
                
                if (previousStatus !== server.status) {
                    console.log(`[LOAD BALANCER] ${isHealthy ? '✅' : '❌'} Servidor ${server.id}: ${server.status}`);
                    this.emit('serverStatusChanged', server.id, server.status);
                }
                
            } catch (error) {
                console.warn(`[LOAD BALANCER] ⚠️ Error en health check de ${server.id}:`, error.message);
                server.status = 'UNHEALTHY';
            }
        });
        
        await Promise.allSettled(healthCheckPromises);
        
        // Actualizar estado del balanceador
        this.state.activeServers = Array.from(this.servers.values()).filter(s => s.status === 'HEALTHY').length;
        this.state.lastHealthCheck = Date.now();
        this.state.healthy = this.state.activeServers > 0;
    }
    
    /**
     * Verificar salud de servidor específico
     */
    async checkServerHealth(server) {
        try {
            // Simular health check
            const response = await this.executeRequest(server, { type: 'health_check' });
            return response && response.serverId === server.id;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Obtener estado del balanceador
     */
    getLoadBalancerStatus() {
        const healthyServers = Array.from(this.servers.values()).filter(s => s.status === 'HEALTHY');
        
        return {
            config: this.config,
            state: this.state,
            metrics: this.metrics,
            servers: {
                total: this.servers.size,
                healthy: healthyServers.length,
                unhealthy: this.servers.size - healthyServers.length
            },
            distribution: this.getLoadDistribution(),
            health: this.getHealthStatus()
        };
    }
    
    /**
     * Obtener distribución de carga
     */
    getLoadDistribution() {
        const distribution = {};
        
        for (const [serverId, server] of this.servers) {
            distribution[serverId] = {
                status: server.status,
                connections: server.connections,
                maxConnections: server.maxConnections,
                utilization: (server.connections / server.maxConnections) * 100,
                avgResponseTime: server.metrics.avgResponseTime,
                successRate: server.metrics.requests > 0 ? 
                    (server.metrics.successful / server.metrics.requests) * 100 : 100
            };
        }
        
        return distribution;
    }
    
    /**
     * Obtener estado de salud del balanceador
     */
    getHealthStatus() {
        const successRate = this.metrics.totalRequests > 0 ? 
            (this.metrics.successfulRequests / this.metrics.totalRequests) * 100 : 100;
        
        const serverHealthRate = this.servers.size > 0 ? 
            (this.state.activeServers / this.servers.size) * 100 : 0;
        
        if (serverHealthRate < 50) return 'CRITICAL';
        if (serverHealthRate < 80) return 'WARNING';
        if (successRate < 90) return 'PERFORMANCE_ISSUE';
        return 'HEALTHY';
    }
    
    /**
     * Remover servidor
     */
    removeServer(serverId) {
        if (this.servers.has(serverId)) {
            this.servers.delete(serverId);
            this.state.totalServers = this.servers.size;
            this.state.activeServers = Array.from(this.servers.values()).filter(s => s.status === 'HEALTHY').length;
            
            console.log(`[LOAD BALANCER] ➖ Servidor ${serverId} removido`);
            this.emit('serverRemoved', serverId);
        }
    }
    
    /**
     * Cerrar balanceador
     */
    close() {
        this.servers.clear();
        this.removeAllListeners();
        console.log('[LOAD BALANCER] 🔒 Balanceador de carga cerrado');
    }
}

module.exports = LoadBalancer;
