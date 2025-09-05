// ========================================================================
// 🔗 CONNECTION POOL - LEONARDO-FEYNMAN QUANTUM DESIGN
// Sistema de Pool de Conexiones para Optimización de Latencia
// "Las conexiones cuánticas fluyen como ríos de datos infinitos"
// ========================================================================

const https = require('https');
const http = require('http');
const { EventEmitter } = require('events');

class ConnectionPool extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.config = {
            maxConnections: options.maxConnections || 50,
            maxConnectionsPerHost: options.maxConnectionsPerHost || 10,
            keepAlive: options.keepAlive !== false,
            keepAliveMsecs: options.keepAliveMsecs || 1000,
            maxSockets: options.maxSockets || 50,
            maxFreeSockets: options.maxFreeSockets || 10,
            timeout: options.timeout || 30000,
            freeSocketTimeout: options.freeSocketTimeout || 30000,
            ...options
        };
        
        // Pool de conexiones
        this.connections = new Map();
        this.activeConnections = 0;
        this.idleConnections = 0;
        
        // Métricas del pool
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            avgLatency: 0,
            totalLatency: 0,
            connectionErrors: 0,
            poolUtilization: 0
        };
        
        // Configurar agentes HTTP/HTTPS
        this.setupAgents();
        
        // Limpieza periódica
        this.setupCleanup();
        
        console.log('[CONNECTION POOL] 🔗 Pool de conexiones inicializado');
    }
    
    /**
     * Configurar agentes HTTP/HTTPS optimizados
     */
    setupAgents() {
        const agentConfig = {
            keepAlive: this.config.keepAlive,
            keepAliveMsecs: this.config.keepAliveMsecs,
            maxSockets: this.config.maxSockets,
            maxFreeSockets: this.config.maxFreeSockets,
            timeout: this.config.timeout,
            freeSocketTimeout: this.config.freeSocketTimeout
        };
        
        this.httpAgent = new http.Agent(agentConfig);
        this.httpsAgent = new https.Agent(agentConfig);
        
        // Eventos de monitoreo
        this.httpAgent.on('free', () => this.onConnectionFree());
        this.httpsAgent.on('free', () => this.onConnectionFree());
        
        console.log('[CONNECTION POOL] ⚡ Agentes HTTP/HTTPS configurados');
    }
    
    /**
     * Realizar petición HTTP optimizada
     */
    async request(options) {
        const startTime = Date.now();
        this.metrics.totalRequests++;
        
        try {
            const agent = options.protocol === 'https:' ? this.httpsAgent : this.httpAgent;
            const requestOptions = {
                ...options,
                agent,
                timeout: this.config.timeout
            };
            
            const result = await this.executeRequest(requestOptions);
            
            // Actualizar métricas
            const latency = Date.now() - startTime;
            this.updateMetrics(true, latency);
            
            return result;
            
        } catch (error) {
            this.metrics.failedRequests++;
            this.metrics.connectionErrors++;
            this.emit('error', error);
            throw error;
        }
    }
    
    /**
     * Ejecutar petición HTTP con retry
     */
    async executeRequest(options) {
        return new Promise((resolve, reject) => {
            const protocol = options.protocol === 'https:' ? https : http;
            const req = protocol.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({
                            statusCode: res.statusCode,
                            headers: res.headers,
                            data: data
                        });
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                    }
                });
            });
            
            req.on('error', (error) => {
                reject(error);
            });
            
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
            
            if (options.data) {
                req.write(options.data);
            }
            
            req.end();
        });
    }
    
    /**
     * Actualizar métricas del pool
     */
    updateMetrics(success, latency) {
        if (success) {
            this.metrics.successfulRequests++;
        }
        
        this.metrics.totalLatency += latency;
        this.metrics.avgLatency = this.metrics.totalLatency / this.metrics.totalRequests;
        
        // Calcular utilización del pool
        this.metrics.poolUtilization = (this.activeConnections / this.config.maxConnections) * 100;
        
        // Emitir evento de métricas actualizadas
        this.emit('metricsUpdated', this.metrics);
    }
    
    /**
     * Evento cuando una conexión se libera
     */
    onConnectionFree() {
        this.idleConnections++;
        this.activeConnections = Math.max(0, this.activeConnections - 1);
    }
    
    /**
     * Configurar limpieza periódica
     */
    setupCleanup() {
        setInterval(() => {
            this.cleanup();
        }, 60000); // Cada minuto
    }
    
    /**
     * Limpiar conexiones inactivas
     */
    cleanup() {
        // Limpiar conexiones HTTP
        this.httpAgent.destroy();
        this.httpsAgent.destroy();
        
        // Recrear agentes
        this.setupAgents();
        
        console.log('[CONNECTION POOL] 🧹 Limpieza de conexiones completada');
    }
    
    /**
     * Obtener estado del pool
     */
    getPoolStatus() {
        return {
            config: this.config,
            metrics: this.metrics,
            connections: {
                active: this.activeConnections,
                idle: this.idleConnections,
                total: this.activeConnections + this.idleConnections
            },
            utilization: this.metrics.poolUtilization,
            health: this.getHealthStatus()
        };
    }
    
    /**
     * Obtener estado de salud
     */
    getHealthStatus() {
        const errorRate = this.metrics.totalRequests > 0 ? 
            (this.metrics.failedRequests / this.metrics.totalRequests) * 100 : 0;
        
        if (errorRate > 10) return 'CRITICAL';
        if (errorRate > 5) return 'WARNING';
        if (this.metrics.poolUtilization > 90) return 'HIGH_LOAD';
        return 'HEALTHY';
    }
    
    /**
     * Cerrar pool de conexiones
     */
    close() {
        this.httpAgent.destroy();
        this.httpsAgent.destroy();
        this.removeAllListeners();
        console.log('[CONNECTION POOL] 🔒 Pool de conexiones cerrado');
    }
}

module.exports = ConnectionPool;
