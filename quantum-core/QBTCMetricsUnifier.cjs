// ========================================================================
// 📊 QBTC METRICS UNIFIER - LEONARDO-FEYNMAN QUANTUM DESIGN
// Sistema Unificado de Métricas para Coherencia Total
// "Las métricas cuánticas se unifican en una sinfonía perfecta"
// ========================================================================

const { EventEmitter } = require('events');

// Estados de salud estandarizados
const HEALTH_STATES = {
    EXCELLENT: 'EXCELLENT',    // 90-100%
    HEALTHY: 'HEALTHY',        // 75-89%
    WARNING: 'WARNING',        // 60-74%
    DEGRADED: 'DEGRADED',      // 40-59%
    CRITICAL: 'CRITICAL'       // 0-39%
};

// Tipos de latencia estandarizados
const LATENCY_TYPES = {
    CONNECTION: 'CONNECTION',
    CACHE_ACCESS: 'CACHE_ACCESS',
    SERVER_RESPONSE: 'SERVER_RESPONSE',
    QUANTUM_PROCESSING: 'QUANTUM_PROCESSING',
    SYSTEM_OVERHEAD: 'SYSTEM_OVERHEAD'
};

class QBTCMetricsUnifier extends EventEmitter {
    constructor() {
        super();
        
        // Métricas globales del sistema
        this.globalMetrics = {
            system: {
                overallHealth: 0,
                uptime: 0,
                totalRequests: 0,
                totalErrors: 0,
                lastUpdate: Date.now()
            },
            performance: {
                avgLatency: 0,
                totalLatency: 0,
                throughput: 0,
                resourceUtilization: 0,
                latencyBreakdown: {}
            },
            quantum: {
                coherence: 0,
                efficiency: 0,
                resonance: 0,
                entanglement: 0,
                symbolsLoaded: 0
            },
            advanced: {
                connectionPool: {},
                distributedCache: {},
                loadBalancer: {},
                autoScaling: {}
            }
        };
        
        // Historial de métricas
        this.metricsHistory = [];
        this.maxHistorySize = 1000;
        
        // Configuración
        this.config = {
            updateInterval: 5000, // 5 segundos
            healthThresholds: {
                excellent: 90,
                healthy: 75,
                warning: 60,
                degraded: 40
            },
            latencyWeights: {
                [LATENCY_TYPES.CONNECTION]: 0.2,
                [LATENCY_TYPES.CACHE_ACCESS]: 0.3,
                [LATENCY_TYPES.SERVER_RESPONSE]: 0.3,
                [LATENCY_TYPES.QUANTUM_PROCESSING]: 0.15,
                [LATENCY_TYPES.SYSTEM_OVERHEAD]: 0.05
            }
        };
        
        // Inicializar
        this.initialize();
        
        console.log('[QBTC METRICS UNIFIER] 📊 Sistema de métricas unificado inicializado');
    }
    
    /**
     * Inicializar el sistema
     */
    initialize() {
        // Configurar actualizaciones periódicas
        this.setupPeriodicUpdates();
        
        // Inicializar breakdown de latencia
        Object.keys(LATENCY_TYPES).forEach(type => {
            this.globalMetrics.performance.latencyBreakdown[LATENCY_TYPES[type]] = {
                avg: 0,
                total: 0,
                count: 0
            };
        });
    }
    
    /**
     * Configurar actualizaciones periódicas
     */
    setupPeriodicUpdates() {
        setInterval(() => {
            this.updateGlobalMetrics();
        }, this.config.updateInterval);
    }
    
    /**
     * Actualizar métricas de un módulo específico
     */
    updateModuleMetrics(moduleName, metrics) {
        try {
            // Validar métricas del módulo
            const validatedMetrics = this.validateModuleMetrics(moduleName, metrics);
            
            // Actualizar métricas del módulo
            this.globalMetrics.advanced[moduleName] = validatedMetrics;
            
            // Recalcular métricas globales
            this.recalculateGlobalMetrics();
            
            // Emitir evento de actualización
            this.emit('metricsUpdated', {
                module: moduleName,
                metrics: validatedMetrics,
                global: this.globalMetrics
            });
            
            console.log(`[QBTC METRICS UNIFIER] ✅ Métricas de ${moduleName} actualizadas`);
            
        } catch (error) {
            console.error(`[QBTC METRICS UNIFIER] ❌ Error actualizando métricas de ${moduleName}:`, error.message);
        }
    }
    
    /**
     * Validar métricas del módulo
     */
    validateModuleMetrics(moduleName, metrics) {
        const validated = { ...metrics };
        
        // Asegurar que todas las métricas numéricas sean válidas
        Object.keys(validated).forEach(key => {
            if (typeof validated[key] === 'number') {
                validated[key] = isNaN(validated[key]) ? 0 : Math.max(0, validated[key]);
            }
        });
        
        // Normalizar estado de salud
        if (validated.health) {
            validated.health = this.normalizeHealthState(validated.health);
        }
        
        // Normalizar latencia
        if (validated.avgLatency !== undefined) {
            validated.normalizedLatency = this.normalizeLatency(validated.avgLatency, moduleName);
        }
        
        return validated;
    }
    
    /**
     * Normalizar estado de salud
     */
    normalizeHealthState(state) {
        const stateMap = {
            // Estados de sistemas avanzados
            'HEALTHY': HEALTH_STATES.HEALTHY,
            'WARNING': HEALTH_STATES.WARNING,
            'CRITICAL': HEALTH_STATES.CRITICAL,
            'HIGH_LOAD': HEALTH_STATES.WARNING,
            'PERFORMANCE_ISSUE': HEALTH_STATES.DEGRADED,
            'ERROR': HEALTH_STATES.CRITICAL,
            
            // Estados cuánticos
            'QUANTUM_RESONANCE': HEALTH_STATES.EXCELLENT,
            'QUANTUM_STABLE': HEALTH_STATES.HEALTHY,
            'QUANTUM_READY': HEALTH_STATES.WARNING,
            'QUANTUM_INITIALIZING': HEALTH_STATES.DEGRADED
        };
        
        return stateMap[state] || HEALTH_STATES.WARNING;
    }
    
    /**
     * Normalizar latencia
     */
    normalizeLatency(latency, moduleName) {
        const latencyType = this.getLatencyType(moduleName);
        const weight = this.config.latencyWeights[latencyType] || 0.1;
        
        return {
            value: latency,
            type: latencyType,
            weight: weight,
            normalized: latency * weight
        };
    }
    
    /**
     * Obtener tipo de latencia basado en el módulo
     */
    getLatencyType(moduleName) {
        const typeMap = {
            'connectionPool': LATENCY_TYPES.CONNECTION,
            'distributedCache': LATENCY_TYPES.CACHE_ACCESS,
            'loadBalancer': LATENCY_TYPES.SERVER_RESPONSE,
            'autoScaling': LATENCY_TYPES.SYSTEM_OVERHEAD,
            'quantumInfiniteCache': LATENCY_TYPES.QUANTUM_PROCESSING
        };
        
        return typeMap[moduleName] || LATENCY_TYPES.SYSTEM_OVERHEAD;
    }
    
    /**
     * Recalcular métricas globales
     */
    recalculateGlobalMetrics() {
        try {
            // Calcular salud general del sistema
            this.calculateSystemHealth();
            
            // Calcular métricas de performance
            this.calculatePerformanceMetrics();
            
            // Calcular métricas cuánticas
            this.calculateQuantumMetrics();
            
            // Actualizar timestamp
            this.globalMetrics.system.lastUpdate = Date.now();
            
            // Agregar al historial
            this.addToHistory();
            
        } catch (error) {
            console.error('[QBTC METRICS UNIFIER] ❌ Error recalculando métricas globales:', error.message);
        }
    }
    
    /**
     * Calcular salud general del sistema
     */
    calculateSystemHealth() {
        const healthScores = [];
        
        // Calcular scores de salud de cada módulo
        Object.entries(this.globalMetrics.advanced).forEach(([moduleName, metrics]) => {
            if (metrics.health) {
                const score = this.healthStateToScore(metrics.health);
                healthScores.push(score);
            }
        });
        
        // Calcular promedio
        if (healthScores.length > 0) {
            this.globalMetrics.system.overallHealth = 
                healthScores.reduce((a, b) => a + b, 0) / healthScores.length;
        }
    }
    
    /**
     * Convertir estado de salud a score numérico
     */
    healthStateToScore(state) {
        const scoreMap = {
            [HEALTH_STATES.EXCELLENT]: 95,
            [HEALTH_STATES.HEALTHY]: 82,
            [HEALTH_STATES.WARNING]: 67,
            [HEALTH_STATES.DEGRADED]: 50,
            [HEALTH_STATES.CRITICAL]: 25
        };
        
        return scoreMap[state] || 50;
    }
    
    /**
     * Calcular métricas de performance
     */
    calculatePerformanceMetrics() {
        let totalLatency = 0;
        let totalRequests = 0;
        let totalErrors = 0;
        
        // Agregar métricas de cada módulo
        Object.values(this.globalMetrics.advanced).forEach(metrics => {
            if (metrics.avgLatency) {
                totalLatency += metrics.avgLatency;
            }
            if (metrics.totalRequests) {
                totalRequests += metrics.totalRequests;
            }
            if (metrics.failedRequests) {
                totalErrors += metrics.failedRequests;
            }
        });
        
        // Actualizar métricas globales
        this.globalMetrics.performance.avgLatency = totalLatency;
        this.globalMetrics.performance.totalLatency = totalLatency;
        this.globalMetrics.system.totalRequests = totalRequests;
        this.globalMetrics.system.totalErrors = totalErrors;
        
        // Calcular throughput
        this.globalMetrics.performance.throughput = totalRequests / (this.globalMetrics.system.uptime / 1000);
    }
    
    /**
     * Calcular métricas cuánticas
     */
    calculateQuantumMetrics() {
        const quantumCache = this.globalMetrics.advanced.quantumInfiniteCache;
        
        if (quantumCache && quantumCache.quantumState) {
            this.globalMetrics.quantum = {
                coherence: quantumCache.quantumState.coherenceLevel || 0,
                efficiency: quantumCache.quantumState.quantumEfficiency || 0,
                resonance: this.quantumResonanceToScore(quantumCache.quantumState.resonanceState),
                entanglement: quantumCache.quantumState.entanglementStrength || 0,
                symbolsLoaded: quantumCache.quantumState.symbolsLoaded || 0
            };
        }
    }
    
    /**
     * Convertir estado de resonancia cuántica a score
     */
    quantumResonanceToScore(resonanceState) {
        const scoreMap = {
            'QUANTUM_RESONANCE': 95,
            'QUANTUM_STABLE': 80,
            'QUANTUM_READY': 60,
            'QUANTUM_INITIALIZING': 30
        };
        
        return scoreMap[resonanceState] || 0;
    }
    
    /**
     * Agregar métricas al historial
     */
    addToHistory() {
        this.metricsHistory.push({
            timestamp: Date.now(),
            metrics: JSON.parse(JSON.stringify(this.globalMetrics))
        });
        
        // Limitar tamaño del historial
        if (this.metricsHistory.length > this.maxHistorySize) {
            this.metricsHistory.shift();
        }
    }
    
    /**
     * Actualizar métricas globales
     */
    updateGlobalMetrics() {
        // Actualizar uptime
        this.globalMetrics.system.uptime = Date.now() - this.globalMetrics.system.lastUpdate;
        
        // Emitir evento de actualización global
        this.emit('globalMetricsUpdated', this.globalMetrics);
    }
    
    /**
     * Obtener métricas actuales
     */
    getCurrentMetrics() {
        return {
            ...this.globalMetrics,
            healthState: this.getOverallHealthState(),
            recommendations: this.generateRecommendations()
        };
    }
    
    /**
     * Obtener estado de salud general
     */
    getOverallHealthState() {
        const health = this.globalMetrics.system.overallHealth;
        
        if (health >= this.config.healthThresholds.excellent) return HEALTH_STATES.EXCELLENT;
        if (health >= this.config.healthThresholds.healthy) return HEALTH_STATES.HEALTHY;
        if (health >= this.config.healthThresholds.warning) return HEALTH_STATES.WARNING;
        if (health >= this.config.healthThresholds.degraded) return HEALTH_STATES.DEGRADED;
        return HEALTH_STATES.CRITICAL;
    }
    
    /**
     * Generar recomendaciones basadas en métricas
     */
    generateRecommendations() {
        const recommendations = [];
        
        // Verificar salud general
        const health = this.globalMetrics.system.overallHealth;
        if (health < this.config.healthThresholds.healthy) {
            recommendations.push({
                type: 'SYSTEM_HEALTH',
                priority: 'HIGH',
                message: `Salud del sistema baja: ${health.toFixed(1)}%`
            });
        }
        
        // Verificar latencia
        const avgLatency = this.globalMetrics.performance.avgLatency;
        if (avgLatency > 500) {
            recommendations.push({
                type: 'PERFORMANCE',
                priority: 'MEDIUM',
                message: `Latencia alta: ${avgLatency.toFixed(0)}ms`
            });
        }
        
        // Verificar errores
        const errorRate = this.globalMetrics.system.totalRequests > 0 ? 
            (this.globalMetrics.system.totalErrors / this.globalMetrics.system.totalRequests) * 100 : 0;
        
        if (errorRate > 5) {
            recommendations.push({
                type: 'ERROR_RATE',
                priority: 'HIGH',
                message: `Tasa de errores alta: ${errorRate.toFixed(1)}%`
            });
        }
        
        return recommendations;
    }
    
    /**
     * Obtener métricas históricas
     */
    getHistoricalMetrics(timeframe = 3600000) { // 1 hora por defecto
        const cutoffTime = Date.now() - timeframe;
        return this.metricsHistory.filter(entry => entry.timestamp > cutoffTime);
    }
    
    /**
     * Obtener estadísticas de tendencias
     */
    getTrendStatistics() {
        if (this.metricsHistory.length < 2) return null;
        
        const recent = this.metricsHistory.slice(-10);
        const older = this.metricsHistory.slice(-20, -10);
        
        const recentAvg = recent.reduce((sum, entry) => sum + entry.metrics.system.overallHealth, 0) / recent.length;
        const olderAvg = older.reduce((sum, entry) => sum + entry.metrics.system.overallHealth, 0) / older.length;
        
        return {
            trend: recentAvg > olderAvg ? 'IMPROVING' : 'DEGRADING',
            change: recentAvg - olderAvg,
            recentAverage: recentAvg,
            olderAverage: olderAvg
        };
    }
    
    /**
     * Limpiar métricas
     */
    clearMetrics() {
        this.metricsHistory = [];
        this.globalMetrics.system.totalRequests = 0;
        this.globalMetrics.system.totalErrors = 0;
        console.log('[QBTC METRICS UNIFIER] 🧹 Métricas limpiadas');
    }
    
    /**
     * Cerrar sistema de métricas
     */
    close() {
        this.removeAllListeners();
        console.log('[QBTC METRICS UNIFIER] 🔒 Sistema de métricas cerrado');
    }
}

module.exports = { QBTCMetricsUnifier, HEALTH_STATES, LATENCY_TYPES };
