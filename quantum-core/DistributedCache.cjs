// ========================================================================
// 🌐 DISTRIBUTED CACHE - LEONARDO-FEYNMAN QUANTUM DESIGN
// Sistema de Cache Distribuido para Escalabilidad Máxima
// "El cache cuántico se extiende como una red neuronal infinita"
// ========================================================================

const { EventEmitter } = require('events');
const crypto = require('crypto');

class DistributedCache extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.config = {
            nodes: options.nodes || [],
            replicationFactor: options.replicationFactor || 2,
            consistencyLevel: options.consistencyLevel || 'QUORUM',
            partitionCount: options.partitionCount || 256,
            heartbeatInterval: options.heartbeatInterval || 5000,
            ...options
        };
        
        // Nodos del cluster
        this.nodes = new Map();
        this.partitions = new Map();
        this.ring = new Map(); // Consistent hashing ring
        
        // Estado del cluster
        this.clusterState = {
            healthy: true,
            nodeCount: 0,
            partitionCount: this.config.partitionCount,
            replicationFactor: this.config.replicationFactor
        };
        
        // Métricas del cache distribuido
        this.metrics = {
            totalRequests: 0,
            cacheHits: 0,
            cacheMisses: 0,
            replicationOps: 0,
            partitionOps: 0,
            avgLatency: 0,
            totalLatency: 0
        };
        
        // Inicializar particiones
        this.initializePartitions();
        
        // Configurar heartbeat
        this.setupHeartbeat();
        
        console.log('[DISTRIBUTED CACHE] 🌐 Cache distribuido inicializado');
    }
    
    /**
     * Inicializar particiones del cluster
     */
    initializePartitions() {
        for (let i = 0; i < this.config.partitionCount; i++) {
            this.partitions.set(i, {
                id: i,
                nodes: [],
                data: new Map(),
                lastUpdate: Date.now()
            });
        }
        
        console.log(`[DISTRIBUTED CACHE] 📦 ${this.config.partitionCount} particiones inicializadas`);
    }
    
    /**
     * Añadir nodo al cluster
     */
    addNode(nodeId, nodeInfo) {
        const node = {
            id: nodeId,
            info: nodeInfo,
            status: 'HEALTHY',
            lastHeartbeat: Date.now(),
            partitions: new Set(),
            metrics: {
                requests: 0,
                hits: 0,
                misses: 0
            }
        };
        
        this.nodes.set(nodeId, node);
        this.clusterState.nodeCount = this.nodes.size;
        
        // Redistribuir particiones
        this.redistributePartitions();
        
        console.log(`[DISTRIBUTED CACHE] ➕ Nodo ${nodeId} añadido al cluster`);
        this.emit('nodeAdded', nodeId);
    }
    
    /**
     * Redistribuir particiones entre nodos
     */
    redistributePartitions() {
        const nodeIds = Array.from(this.nodes.keys());
        if (nodeIds.length === 0) return;
        
        // Limpiar asignaciones previas
        for (const partition of this.partitions.values()) {
            partition.nodes = [];
        }
        
        // Asignar particiones usando consistent hashing
        for (let i = 0; i < this.config.partitionCount; i++) {
            const partition = this.partitions.get(i);
            const assignedNodes = this.getNodesForPartition(i);
            
            partition.nodes = assignedNodes;
            
            // Actualizar nodos con sus particiones asignadas
            for (const nodeId of assignedNodes) {
                const node = this.nodes.get(nodeId);
                if (node) {
                    node.partitions.add(i);
                }
            }
        }
        
        console.log(`[DISTRIBUTED CACHE] 🔄 Particiones redistribuidas entre ${nodeIds.length} nodos`);
    }
    
    /**
     * Obtener nodos responsables de una partición
     */
    getNodesForPartition(partitionId) {
        const nodeIds = Array.from(this.nodes.keys());
        if (nodeIds.length === 0) return [];
        
        // Consistent hashing simple
        const hash = crypto.createHash('md5').update(partitionId.toString()).digest('hex');
        const hashValue = parseInt(hash.substring(0, 8), 16);
        const startIndex = hashValue % nodeIds.length;
        
        const assignedNodes = [];
        for (let i = 0; i < this.config.replicationFactor; i++) {
            const nodeIndex = (startIndex + i) % nodeIds.length;
            assignedNodes.push(nodeIds[nodeIndex]);
        }
        
        return assignedNodes;
    }
    
    /**
     * Obtener valor del cache distribuido
     */
    async get(key) {
        const startTime = Date.now();
        this.metrics.totalRequests++;
        
        try {
            const partitionId = this.getPartitionForKey(key);
            const partition = this.partitions.get(partitionId);
            
            if (!partition) {
                this.metrics.cacheMisses++;
                return null;
            }
            
            const value = partition.data.get(key);
            
            if (value) {
                this.metrics.cacheHits++;
                this.updateMetrics(Date.now() - startTime);
                return value;
            } else {
                this.metrics.cacheMisses++;
                this.updateMetrics(Date.now() - startTime);
                return null;
            }
            
        } catch (error) {
            console.error('[DISTRIBUTED CACHE] ❌ Error obteniendo valor:', error.message);
            this.metrics.cacheMisses++;
            return null;
        }
    }
    
    /**
     * Establecer valor en el cache distribuido
     */
    async set(key, value, ttl = 30000) {
        const startTime = Date.now();
        
        try {
            const partitionId = this.getPartitionForKey(key);
            const partition = this.partitions.get(partitionId);
            
            if (!partition) {
                throw new Error(`Partición ${partitionId} no encontrada`);
            }
            
            // Almacenar en partición principal
            partition.data.set(key, {
                value,
                timestamp: Date.now(),
                ttl,
                expiresAt: Date.now() + ttl
            });
            
            // Replicar a nodos secundarios
            await this.replicateToNodes(partitionId, key, value, ttl);
            
            this.metrics.partitionOps++;
            this.updateMetrics(Date.now() - startTime);
            
            return true;
            
        } catch (error) {
            console.error('[DISTRIBUTED CACHE] ❌ Error estableciendo valor:', error.message);
            return false;
        }
    }
    
    /**
     * Replicar datos a nodos secundarios
     */
    async replicateToNodes(partitionId, key, value, ttl) {
        const partition = this.partitions.get(partitionId);
        if (!partition || partition.nodes.length <= 1) return;
        
        const replicationPromises = partition.nodes.slice(1).map(async (nodeId) => {
            try {
                // Simular replicación a nodo secundario
                await this.replicateToNode(nodeId, partitionId, key, value, ttl);
                this.metrics.replicationOps++;
            } catch (error) {
                console.warn(`[DISTRIBUTED CACHE] ⚠️ Error replicando a nodo ${nodeId}:`, error.message);
            }
        });
        
        await Promise.allSettled(replicationPromises);
    }
    
    /**
     * Replicar a nodo específico
     */
    async replicateToNode(nodeId, partitionId, key, value, ttl) {
        // Simulación de replicación
        return new Promise((resolve) => {
            setTimeout(() => {
                const node = this.nodes.get(nodeId);
                if (node) {
                    node.metrics.requests++;
                }
                resolve();
            }, Math.random() * 10); // Latencia simulada
        });
    }
    
    /**
     * Obtener partición para una clave
     */
    getPartitionForKey(key) {
        const hash = crypto.createHash('md5').update(key).digest('hex');
        const hashValue = parseInt(hash.substring(0, 8), 16);
        return hashValue % this.config.partitionCount;
    }
    
    /**
     * Configurar heartbeat para monitoreo de nodos
     */
    setupHeartbeat() {
        setInterval(() => {
            this.checkNodeHealth();
        }, this.config.heartbeatInterval);
    }
    
    /**
     * Verificar salud de los nodos
     */
    checkNodeHealth() {
        const now = Date.now();
        const unhealthyNodes = [];
        
        for (const [nodeId, node] of this.nodes) {
            const timeSinceHeartbeat = now - node.lastHeartbeat;
            
            if (timeSinceHeartbeat > this.config.heartbeatInterval * 3) {
                node.status = 'UNHEALTHY';
                unhealthyNodes.push(nodeId);
            }
        }
        
        if (unhealthyNodes.length > 0) {
            console.warn(`[DISTRIBUTED CACHE] ⚠️ Nodos no saludables: ${unhealthyNodes.join(', ')}`);
            this.redistributePartitions();
        }
    }
    
    /**
     * Actualizar métricas
     */
    updateMetrics(latency) {
        this.metrics.totalLatency += latency;
        this.metrics.avgLatency = this.metrics.totalLatency / this.metrics.totalRequests;
    }
    
    /**
     * Obtener estado del cluster
     */
    getClusterStatus() {
        const healthyNodes = Array.from(this.nodes.values()).filter(n => n.status === 'HEALTHY');
        
        return {
            clusterState: this.clusterState,
            metrics: this.metrics,
            nodes: {
                total: this.nodes.size,
                healthy: healthyNodes.length,
                unhealthy: this.nodes.size - healthyNodes.length
            },
            partitions: {
                total: this.partitions.size,
                assigned: Array.from(this.partitions.values()).filter(p => p.nodes.length > 0).length
            },
            health: this.getHealthStatus()
        };
    }
    
    /**
     * Obtener estado de salud del cluster
     */
    getHealthStatus() {
        const hitRate = this.metrics.totalRequests > 0 ? 
            (this.metrics.cacheHits / this.metrics.totalRequests) * 100 : 0;
        
        const healthyNodes = Array.from(this.nodes.values()).filter(n => n.status === 'HEALTHY');
        const nodeHealthRate = this.nodes.size > 0 ? (healthyNodes.length / this.nodes.size) * 100 : 0;
        
        if (nodeHealthRate < 50) return 'CRITICAL';
        if (nodeHealthRate < 80) return 'WARNING';
        if (hitRate < 50) return 'PERFORMANCE_ISSUE';
        return 'HEALTHY';
    }
    
    /**
     * Limpiar datos expirados
     */
    cleanup() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const partition of this.partitions.values()) {
            for (const [key, entry] of partition.data.entries()) {
                if (entry.expiresAt && entry.expiresAt < now) {
                    partition.data.delete(key);
                    cleaned++;
                }
            }
        }
        
        if (cleaned > 0) {
            console.log(`[DISTRIBUTED CACHE] 🧹 Limpieza completada: ${cleaned} entradas eliminadas`);
        }
    }
    
    /**
     * Cerrar cache distribuido
     */
    close() {
        this.nodes.clear();
        this.partitions.clear();
        this.removeAllListeners();
        console.log('[DISTRIBUTED CACHE] 🔒 Cache distribuido cerrado');
    }
}

module.exports = DistributedCache;
