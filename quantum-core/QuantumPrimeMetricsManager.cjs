// ========================================================================
// QUANTUM PRIME METRICS MANAGER - GESTION CENTRALIZADA DE METRICAS PRIMAS
// Copyright (c) 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES
// Sistema centralizado para almacenamiento, trazabilidad y analisis
// de todas las transformaciones primas cuanticas del sistema
// ========================================================================

const { getQuantumLogger } = require('./QuantumPrimeLogger');
const crypto = require('crypto');
const EventEmitter = require('events');

class QuantumPrimeMetricsManager extends EventEmitter {
    constructor(config = {}) {
        super();
        
        // CONFIGURACION PRINCIPAL
        this.config = {
            maxHistorySize: config.maxHistorySize || 10000,
            persistenceEnabled: config.persistenceEnabled !== false,
            analyticsEnabled: config.analyticsEnabled !== false,
            realTimeUpdates: config.realTimeUpdates !== false,
            compressionEnabled: config.compressionEnabled || false,
            encryptionEnabled: config.encryptionEnabled || false
        };
        
        // LOGGER ESPECIALIZADO
        this.logger = getQuantumLogger({
            logDir: config.logDir,
            enableConsole: true,
            enableFile: true
        });
        
        // ESTRUCTURAS DE ALMACENAMIENTO ESPECIALIZADAS
        this.primeMetrics = {
            // FIRMAS CUANTICAS
            signatures: new Map(), // signature_hash -> metadata
            signatureHistory: [], // array cronologico de firmas
            
            // BOOSTS APLICADOS
            boosts: new Map(), // boost_id -> boost_data
            boostHistory: [], // array cronologico de boosts
            activeBoosts: new Map(), // component -> active_boosts
            
            // RESONANCIAS DETECTADAS
            resonances: new Map(), // resonance_id -> resonance_data
            resonanceHistory: [], // array cronologico de resonancias
            harmonicPatterns: new Map(), // pattern_hash -> harmonic_data
            
            // TRANSFORMACIONES PRIMAS
            transformations: new Map(), // transformation_id -> transformation_data
            transformationChain: [], // cadena cronologica de transformaciones
            compositeTransformations: new Map(), // multiple transformations
            
            // METRICAS GLOBALES
            globalMetrics: {
                totalTransformations: 0,
                totalBoosts: 0,
                totalResonances: 0,
                totalSignatures: 0,
                totalGlobalMetrics: 0,
                avgBoostFactor: 0,
                avgResonanceAmplitude: 0,
                systemCoherenceLevel: 0,
                primeEvolutionLevel: 0,
                quantumStateStability: 1.0,
                history: [],
                lastUpdate: Date.now()
            }
        };
        
        // ANALYTICS Y ESTADISTICAS AVANZADAS
        this.analytics = {
            componentPerformance: new Map(), // component -> performance_metrics
            primeEfficiency: new Map(), // prime_type -> efficiency_data
            resonancePatterns: new Map(), // frequency_range -> pattern_data
            evolutionTrends: [], // tendencias de evolucion temporal
            correlationMatrix: new Map(), // correlaciones entre metricas
            predictionModels: new Map() // modelos predictivos
        };
        
        // CACHE DE RENDIMIENTO
        this.cache = {
            recentQueries: new Map(),
            aggregatedData: new Map(),
            computedMetrics: new Map(),
            lastCacheUpdate: Date.now(),
            cacheValidityMs: 30000 // 30 segundos
        };
        
        // INICIALIZAR SISTEMA
        this.initialize();
    }
    
    // ===================================================================
    // INICIALIZACION DEL SISTEMA
    // ===================================================================
    
    initialize() {
        this.logger.info('PRIME_METRICS_MANAGER', 'Inicializando sistema de metricas primas cuanticas', {
            maxHistorySize: this.config.maxHistorySize,
            persistenceEnabled: this.config.persistenceEnabled,
            analyticsEnabled: this.config.analyticsEnabled
        });
        
        // CONFIGURAR ACTUALIZACIONES EN TIEMPO REAL
        if (this.config.realTimeUpdates) {
            this.setupRealTimeUpdates();
        }
        
        // CONFIGURAR ANALYTICS AUTOMATICOS
        if (this.config.analyticsEnabled) {
            this.setupAnalytics();
        }
        
        // CONFIGURAR PERSISTENCIA
        if (this.config.persistenceEnabled) {
            this.setupPersistence();
        }
        
        this.logger.info('PRIME_METRICS_MANAGER', 'Sistema de metricas primas inicializado correctamente');
    }
    
    // ===================================================================
    // GESTION DE FIRMAS CUANTICAS
    // ===================================================================
    
    recordQuantumSignature(component, signatureData) {
        const signatureId = this.generateSignatureId(signatureData);
        const timestamp = Date.now();
        
        const signature = {
            id: signatureId,
            component: component,
            timestamp: timestamp,
            signature: signatureData.signature,
            hash: signatureData.hash || this.calculateSignatureHash(signatureData),
            attributes: signatureData.attributes || {},
            resonanceFactors: signatureData.resonanceFactors || {},
            transformationPath: signatureData.transformationPath || [],
            coherenceLevel: signatureData.coherenceLevel || 0,
            stability: signatureData.stability || 1.0,
            evolutionStage: signatureData.evolutionStage || 'INITIAL'
        };
        
        // ALMACENAR FIRMA
        this.primeMetrics.signatures.set(signatureId, signature);
        this.primeMetrics.signatureHistory.push({
            signatureId,
            timestamp,
            component,
            event: 'SIGNATURE_RECORDED'
        });
        
        // ACTUALIZAR METRICAS GLOBALES
        this.primeMetrics.globalMetrics.totalSignatures++;
        this.updateGlobalMetrics();
        
        // LOG ESPECIALIZADO
        this.logger.logPrimeTransformation(component, {
            type: 'QUANTUM_SIGNATURE',
            signature: signatureData.signature,
            original: 'N/A',
            transformed: signatureId,
            primeFactors: signatureData.primeFactors || [],
            resonance: signatureData.coherenceLevel || 0,
            component: component
        });
        
        // EMITIR EVENTO
        this.emit('signature:recorded', signature);
        
        // ANALYTICS
        if (this.config.analyticsEnabled) {
            this.updateSignatureAnalytics(signature);
        }
        
        return signature;
    }
    
    // ===================================================================
    // GESTION DE BOOSTS PRIMAS
    // ===================================================================
    
    recordPrimeBoost(component, boostData) {
        const boostId = this.generateBoostId(boostData);
        const timestamp = Date.now();
        
        const boost = {
            id: boostId,
            component: component,
            timestamp: timestamp,
            type: boostData.type,
            factor: boostData.factor || 1.0,
            primeSource: boostData.primeSource,
            targetMetric: boostData.targetMetric,
            amplification: boostData.amplification || 1.0,
            sustainability: boostData.sustainability || 0.5,
            duration: boostData.duration || null,
            expirationTime: boostData.duration ? timestamp + boostData.duration : null,
            isActive: true,
            effectivenessFactor: boostData.effectivenessFactor || 1.0,
            compoundingEffect: boostData.compoundingEffect || false,
            resonanceAlignment: boostData.resonanceAlignment || 0
        };
        
        // ALMACENAR BOOST
        this.primeMetrics.boosts.set(boostId, boost);
        this.primeMetrics.boostHistory.push({
            boostId,
            timestamp,
            component,
            event: 'BOOST_APPLIED'
        });
        
        // AGREGAR A BOOSTS ACTIVOS
        if (!this.primeMetrics.activeBoosts.has(component)) {
            this.primeMetrics.activeBoosts.set(component, []);
        }
        this.primeMetrics.activeBoosts.get(component).push(boostId);
        
        // ACTUALIZAR METRICAS GLOBALES
        this.primeMetrics.globalMetrics.totalBoosts++;
        this.updateBoostAverages();
        this.updateGlobalMetrics();
        
        // LOG ESPECIALIZADO
        this.logger.logPrimeBoost(component, {
            type: boost.type,
            factor: boost.factor,
            primeSource: boost.primeSource,
            target: boost.targetMetric,
            amplification: boost.amplification,
            sustainability: boost.sustainability,
            component: component
        });
        
        // EMITIR EVENTO
        this.emit('boost:applied', boost);
        
        // CONFIGURAR EXPIRACION SI ES NECESARIO
        if (boost.expirationTime) {
            this.scheduleBoostExpiration(boostId);
        }
        
        // ANALYTICS
        if (this.config.analyticsEnabled) {
            this.updateBoostAnalytics(boost);
        }
        
        return boost;
    }
    
    // ===================================================================
    // GESTION DE RESONANCIAS CUANTICAS
    // ===================================================================
    
    recordQuantumResonance(component, resonanceData) {
        const resonanceId = this.generateResonanceId(resonanceData);
        const timestamp = Date.now();
        
        const resonance = {
            id: resonanceId,
            component: component,
            timestamp: timestamp,
            type: resonanceData.type,
            frequency: resonanceData.frequency,
            amplitude: resonanceData.amplitude || 1.0,
            harmonics: resonanceData.harmonics || [],
            coherence: resonanceData.coherence || 0,
            entanglement: resonanceData.entanglement || 0,
            phase: resonanceData.phase || 0,
            sustainedDuration: resonanceData.sustainedDuration || 0,
            energyLevel: resonanceData.energyLevel || 1.0,
            quantumFieldStrength: resonanceData.quantumFieldStrength || 0,
            interferencePattern: resonanceData.interferencePattern || null,
            dimensionalAlignment: resonanceData.dimensionalAlignment || 0
        };
        
        // ALMACENAR RESONANCIA
        this.primeMetrics.resonances.set(resonanceId, resonance);
        this.primeMetrics.resonanceHistory.push({
            resonanceId,
            timestamp,
            component,
            event: 'RESONANCE_DETECTED'
        });
        
        // DETECTAR PATRONES HARMONICOS
        const harmonicPattern = this.detectHarmonicPattern(resonance);
        if (harmonicPattern) {
            this.primeMetrics.harmonicPatterns.set(harmonicPattern.hash, harmonicPattern);
        }
        
        // ACTUALIZAR METRICAS GLOBALES
        this.primeMetrics.globalMetrics.totalResonances++;
        this.updateResonanceAverages();
        this.updateGlobalMetrics();
        
        // LOG ESPECIALIZADO
        this.logger.logQuantumResonance(component, {
            type: resonance.type,
            frequency: resonance.frequency,
            amplitude: resonance.amplitude,
            harmonics: resonance.harmonics,
            coherence: resonance.coherence,
            entanglement: resonance.entanglement,
            component: component
        });
        
        // EMITIR EVENTO
        this.emit('resonance:detected', resonance);
        
        // ANALYTICS
        if (this.config.analyticsEnabled) {
            this.updateResonanceAnalytics(resonance);
        }
        
        return resonance;
    }
    
    // ===================================================================
    // GESTION DE TRANSFORMACIONES COMPUESTAS
    // ===================================================================
    
    recordCompositeTransformation(component, transformationData) {
        const transformationId = this.generateTransformationId(transformationData);
        const timestamp = Date.now();
        
        const transformation = {
            id: transformationId,
            component: component,
            timestamp: timestamp,
            type: transformationData.type,
            inputState: transformationData.inputState,
            outputState: transformationData.outputState,
            primeFactors: transformationData.primeFactors || [],
            transformationMatrix: transformationData.transformationMatrix || null,
            energyDelta: transformationData.energyDelta || 0,
            efficiency: transformationData.efficiency || 1.0,
            reversibility: transformationData.reversibility || false,
            quantumTunneling: transformationData.quantumTunneling || false,
            superpositionState: transformationData.superpositionState || false,
            entanglementLevel: transformationData.entanglementLevel || 0
        };
        
        // ALMACENAR TRANSFORMACION
        this.primeMetrics.transformations.set(transformationId, transformation);
        this.primeMetrics.transformationChain.push({
            transformationId,
            timestamp,
            component,
            event: 'TRANSFORMATION_COMPLETED'
        });
        
        // ACTUALIZAR METRICAS GLOBALES
        this.primeMetrics.globalMetrics.totalTransformations++;
        this.updateGlobalMetrics();
        
        // EMITIR EVENTO
        this.emit('transformation:completed', transformation);
        
        // ANALYTICS
        if (this.config.analyticsEnabled) {
            this.updateTransformationAnalytics(transformation);
        }
        
        return transformation;
    }

    // ===================================================================
    // GESTION DE METRICAS GLOBALES
    // ===================================================================
    
    recordGlobalMetrics(metricsData) {
        const timestamp = Date.now();
        
        const globalMetric = {
            id: `global_metric_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: timestamp,
            metric_type: metricsData.metric_type || 'general',
            metrics: metricsData.metrics || {},
            component: metricsData.component || 'system',
            health_score: metricsData.metrics?.overall_profit_health || metricsData.metrics?.health_score || 0,
            performance_level: metricsData.metrics?.performance_level || 0,
            efficiency_rating: metricsData.metrics?.efficiency_rating || 0
        };
        
        // ALMACENAR METRICA GLOBAL
        this.primeMetrics.globalMetrics.history.push(globalMetric);
        
        // ACTUALIZAR METRICAS GLOBALES
        this.primeMetrics.globalMetrics.totalGlobalMetrics++;
        this.updateGlobalMetrics();
        
        // EMITIR EVENTO
        this.emit('global_metrics:recorded', globalMetric);
        
        // ANALYTICS
        if (this.config.analyticsEnabled) {
            this.updateGlobalMetricsAnalytics(globalMetric);
        }
        
        return globalMetric;
    }
    
    // ===================================================================
    // CONSULTAS Y ANALYTICS
    // ===================================================================
    
    getComponentMetrics(component, timeRange = null) {
        const cacheKey = `component_${component}_${timeRange}`;
        
        // VERIFICAR CACHE
        if (this.isCacheValid(cacheKey)) {
            return this.cache.computedMetrics.get(cacheKey);
        }
        
        const metrics = {
            component: component,
            signatures: this.getComponentSignatures(component, timeRange),
            boosts: this.getComponentBoosts(component, timeRange),
            resonances: this.getComponentResonances(component, timeRange),
            transformations: this.getComponentTransformations(component, timeRange),
            performance: this.analytics.componentPerformance.get(component) || {},
            summary: {
                totalSignatures: 0,
                totalBoosts: 0,
                totalResonances: 0,
                totalTransformations: 0,
                avgBoostFactor: 0,
                avgResonanceAmplitude: 0,
                coherenceLevel: 0,
                evolutionLevel: 0
            }
        };
        
        // CALCULAR SUMARIOS
        metrics.summary.totalSignatures = metrics.signatures.length;
        metrics.summary.totalBoosts = metrics.boosts.length;
        metrics.summary.totalResonances = metrics.resonances.length;
        metrics.summary.totalTransformations = metrics.transformations.length;
        
        if (metrics.boosts.length > 0) {
            metrics.summary.avgBoostFactor = metrics.boosts.reduce((sum, b) => sum + b.factor, 0) / metrics.boosts.length;
        }
        
        if (metrics.resonances.length > 0) {
            metrics.summary.avgResonanceAmplitude = metrics.resonances.reduce((sum, r) => sum + r.amplitude, 0) / metrics.resonances.length;
        }
        
        // CACHEAR RESULTADO
        this.cache.computedMetrics.set(cacheKey, metrics);
        
        return metrics;
    }
    
    getGlobalMetrics() {
        return {
            ...this.primeMetrics.globalMetrics,
            timestamp: Date.now(),
            analytics: {
                componentCount: this.analytics.componentPerformance.size,
                primeTypeCount: this.analytics.primeEfficiency.size,
                resonancePatternCount: this.analytics.resonancePatterns.size,
                evolutionTrendCount: this.analytics.evolutionTrends.length
            }
        };
    }
    
    getEvolutionHistory(limit = 100) {
        const recentTransformations = this.primeMetrics.transformationChain.slice(-limit);
        const recentBoosts = this.primeMetrics.boostHistory.slice(-limit);
        const recentResonances = this.primeMetrics.resonanceHistory.slice(-limit);
        const recentSignatures = this.primeMetrics.signatureHistory.slice(-limit);
        
        // COMBINAR Y ORDENAR POR TIMESTAMP
        const combinedHistory = [
            ...recentTransformations.map(t => ({...t, category: 'TRANSFORMATION'})),
            ...recentBoosts.map(b => ({...b, category: 'BOOST'})),
            ...recentResonances.map(r => ({...r, category: 'RESONANCE'})),
            ...recentSignatures.map(s => ({...s, category: 'SIGNATURE'}))
        ].sort((a, b) => b.timestamp - a.timestamp);
        
        return combinedHistory.slice(0, limit);
    }
    
    // ===================================================================
    // UTILIDADES INTERNAS
    // ===================================================================
    
    generateSignatureId(data) {
        const hash = crypto.createHash('sha256');
        hash.update(JSON.stringify(data) + Date.now());
        return `SIG_${hash.digest('hex').substring(0, 16)}`;
    }
    
    generateBoostId(data) {
        const hash = crypto.createHash('sha256');
        hash.update(JSON.stringify(data) + Date.now());
        return `BST_${hash.digest('hex').substring(0, 16)}`;
    }
    
    generateResonanceId(data) {
        const hash = crypto.createHash('sha256');
        hash.update(JSON.stringify(data) + Date.now());
        return `RES_${hash.digest('hex').substring(0, 16)}`;
    }
    
    generateTransformationId(data) {
        const hash = crypto.createHash('sha256');
        hash.update(JSON.stringify(data) + Date.now());
        return `TRX_${hash.digest('hex').substring(0, 16)}`;
    }
    
    calculateSignatureHash(data) {
        const hash = crypto.createHash('sha256');
        hash.update(JSON.stringify(data.signature || data));
        return hash.digest('hex').substring(0, 16);
    }
    
    updateGlobalMetrics() {
        const now = Date.now();
        
        // CALCULAR NIVEL DE COHERENCIA DEL SISTEMA
        const totalMetrics = this.primeMetrics.globalMetrics.totalSignatures + 
                           this.primeMetrics.globalMetrics.totalBoosts + 
                           this.primeMetrics.globalMetrics.totalResonances + 
                           this.primeMetrics.globalMetrics.totalTransformations;
        
        this.primeMetrics.globalMetrics.systemCoherenceLevel = Math.min(1.0, totalMetrics / 1000);
        this.primeMetrics.globalMetrics.primeEvolutionLevel = Math.floor(totalMetrics / 100);
        this.primeMetrics.globalMetrics.lastUpdate = now;
    }
    
    updateBoostAverages() {
        const allBoosts = Array.from(this.primeMetrics.boosts.values());
        if (allBoosts.length > 0) {
            this.primeMetrics.globalMetrics.avgBoostFactor = 
                allBoosts.reduce((sum, b) => sum + b.factor, 0) / allBoosts.length;
        }
    }
    
    updateResonanceAverages() {
        const allResonances = Array.from(this.primeMetrics.resonances.values());
        if (allResonances.length > 0) {
            this.primeMetrics.globalMetrics.avgResonanceAmplitude = 
                allResonances.reduce((sum, r) => sum + r.amplitude, 0) / allResonances.length;
        }
    }
    
    isCacheValid(key) {
        if (!this.cache.computedMetrics.has(key)) {
            return false;
        }
        return (Date.now() - this.cache.lastCacheUpdate) < this.cache.cacheValidityMs;
    }
    
    // METODOS DE FILTRADO POR COMPONENTE Y TIEMPO
    getComponentSignatures(component, timeRange) {
        return Array.from(this.primeMetrics.signatures.values())
            .filter(s => s.component === component)
            .filter(s => !timeRange || (s.timestamp >= timeRange.start && s.timestamp <= timeRange.end));
    }
    
    getComponentBoosts(component, timeRange) {
        return Array.from(this.primeMetrics.boosts.values())
            .filter(b => b.component === component)
            .filter(b => !timeRange || (b.timestamp >= timeRange.start && b.timestamp <= timeRange.end));
    }
    
    getComponentResonances(component, timeRange) {
        return Array.from(this.primeMetrics.resonances.values())
            .filter(r => r.component === component)
            .filter(r => !timeRange || (r.timestamp >= timeRange.start && r.timestamp <= timeRange.end));
    }
    
    getComponentTransformations(component, timeRange) {
        return Array.from(this.primeMetrics.transformations.values())
            .filter(t => t.component === component)
            .filter(t => !timeRange || (t.timestamp >= timeRange.start && t.timestamp <= timeRange.end));
    }
    
    // METODOS DE CONFIGURACION AVANZADA
    setupRealTimeUpdates() {
        // Configurar actualizaciones en tiempo real cada 5 segundos
        setInterval(() => {
            this.updateGlobalMetrics();
            this.emit('metrics:updated', this.getGlobalMetrics());
        }, 5000);
    }
    
    setupAnalytics() {
        // Configurar analytics avanzados cada minuto
        setInterval(() => {
            this.performAdvancedAnalytics();
        }, 60000);
    }
    
    setupPersistence() {
        // Configurar persistencia cada 5 minutos
        setInterval(() => {
            this.persistMetrics();
        }, 300000);
    }
    
    performAdvancedAnalytics() {
        // Implementar analytics avanzados en el futuro
        this.logger.debug('PRIME_METRICS_MANAGER', 'Ejecutando analytics avanzados');
    }
    
    persistMetrics() {
        // Implementar persistencia en el futuro
        this.logger.debug('PRIME_METRICS_MANAGER', 'Persistiendo metricas');
    }
    
    detectHarmonicPattern(resonance) {
        // Implementar deteccion de patrones armonicos
        return null;
    }
    
    updateSignatureAnalytics(signature) {
        // Implementar analytics de firmas
    }
    
    updateBoostAnalytics(boost) {
        // Implementar analytics de boosts
    }
    
    updateResonanceAnalytics(resonance) {
        // Implementar analytics de resonancias
    }
    
    updateTransformationAnalytics(transformation) {
        // Implementar analytics de transformaciones
    }

    updateGlobalMetricsAnalytics(globalMetric) {
        // Implementar analytics de métricas globales
        this.logger.debug('PRIME_METRICS_MANAGER', `Analytics de métrica global: ${globalMetric.metric_type}`);
    }
    
    scheduleBoostExpiration(boostId) {
        const boost = this.primeMetrics.boosts.get(boostId);
        if (boost && boost.expirationTime) {
            const delay = boost.expirationTime - Date.now();
            if (delay > 0) {
                setTimeout(() => {
                    this.expireBoost(boostId);
                }, delay);
            }
        }
    }
    
    expireBoost(boostId) {
        const boost = this.primeMetrics.boosts.get(boostId);
        if (boost) {
            boost.isActive = false;
            
            // REMOVER DE BOOSTS ACTIVOS
            const activeBoosts = this.primeMetrics.activeBoosts.get(boost.component);
            if (activeBoosts) {
                const index = activeBoosts.indexOf(boostId);
                if (index > -1) {
                    activeBoosts.splice(index, 1);
                }
            }
            
            this.logger.info('PRIME_METRICS_MANAGER', `Boost ${boostId} expirado para componente ${boost.component}`);
            this.emit('boost:expired', boost);
        }
    }
}

// SINGLETON PARA USO GLOBAL
let globalMetricsManager = null;

function getQuantumPrimeMetricsManager(config) {
    if (!globalMetricsManager) {
        globalMetricsManager = new QuantumPrimeMetricsManager(config);
    }
    return globalMetricsManager;
}

module.exports = {
    QuantumPrimeMetricsManager,
    getQuantumPrimeMetricsManager
};
