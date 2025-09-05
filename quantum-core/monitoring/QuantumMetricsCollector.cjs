// ====================================================================
// 📊 QUANTUM METRICS COLLECTOR - SISTEMA DE METRICAS EN SEGUNDO PLANO
// Reporte de desempeño y logging optimizado para Windows/PowerShell
// Procesamiento asincrono con Jobs de PowerShell para no bloquear sistema
// ====================================================================

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');
const { performance } = require('perf_hooks');

class QuantumMetricsCollector extends EventEmitter {
    constructor(config = {}) {
        super();
        
        // Configuracion optimizada para Windows
        this.config = {
            logDirectory: config.logDirectory || 'C:\\QBTC-LOGS',
            metricsInterval: config.metricsInterval || 1000, // 1 segundo
            backgroundMode: true,
            enableConsoleOutput: config.enableConsoleOutput || true,
            maxLogFiles: config.maxLogFiles || 100,
            maxLogSizeBytes: config.maxLogSizeBytes || 10 * 1024 * 1024, // 10MB
            compressionEnabled: config.compressionEnabled || true,
            powerShellJobsEnabled: config.powerShellJobsEnabled || true,
            ...config
        };
        
        // Estado del sistema de metricas
        this.metricsState = {
            isRunning: false,
            startTime: null,
            totalMetricsCollected: 0,
            backgroundJobsActive: 0,
            lastMetricsSnapshot: null,
            performanceHistory: [],
            errorCount: 0,
            successCount: 0
        };
        
        // Cache de metricas en memoria
        this.metricsCache = {
            transformationPrimes: new Map(),
            systemPerformance: new Map(),
            processMetrics: new Map(),
            businessLogic: new Map(),
            errors: new Map(),
            backgroundJobs: new Map()
        };
        
        // Colectores especificos por categoria
        this.collectors = {
            primeTransformations: this.initializePrimeTransformationCollector(),
            systemPerformance: this.initializeSystemPerformanceCollector(),
            businessLogic: this.initializeBusinessLogicCollector(),
            backgroundProcesses: this.initializeBackgroundProcessCollector(),
            errorTracking: this.initializeErrorTrackingCollector()
        };
        
        // Timers y intervalos
        this.intervals = new Map();
        this.backgroundJobs = new Map();
        
        console.log('[METRICS] 📊 QuantumMetricsCollector inicializado');
        console.log(`[METRICS] 📁 Directorio de logs: ${this.config.logDirectory}`);
        console.log(`[METRICS] ⏱️ Intervalo de metricas: ${this.config.metricsInterval}ms`);
    }
    
    // ================================================================
    // 🚀 INICIALIZACION Y ARRANQUE EN SEGUNDO PLANO
    // ================================================================
    
    async initialize() {
        try {
            console.log('[METRICS] 🔄 Inicializando sistema de metricas...');
            
            // Crear directorios de logs si no existen
            await this.ensureLogDirectories();
            
            // Inicializar colectores
            await this.initializeCollectors();
            
            // Configurar limpieza automatica de logs antiguos
            await this.setupLogCleanup();
            
            // Iniciar recoleccion de metricas en segundo plano
            if (this.config.backgroundMode) {
                await this.startBackgroundCollection();
            }
            
            console.log('[METRICS] ✅ Sistema de metricas inicializado correctamente');
            return true;
            
        } catch (error) {
            console.error('[METRICS] ❌ Error inicializando metricas:', error.message);
            this.metricsState.errorCount++;
            return false;
        }
    }
    
    async ensureLogDirectories() {
        const directories = [
            this.config.logDirectory,
            path.join(this.config.logDirectory, 'transformations'),
            path.join(this.config.logDirectory, 'performance'),
            path.join(this.config.logDirectory, 'business'),
            path.join(this.config.logDirectory, 'background'),
            path.join(this.config.logDirectory, 'errors'),
            path.join(this.config.logDirectory, 'archive')
        ];
        
        for (const dir of directories) {
            try {
                await fs.mkdir(dir, { recursive: true });
                console.log(`[METRICS] 📁 Directorio creado/verificado: ${dir}`);
            } catch (error) {
                if (error.code !== 'EEXIST') {
                    throw error;
                }
            }
        }
    }
    
    async startBackgroundCollection() {
        console.log('[METRICS] 🚀 Iniciando recoleccion en segundo plano...');
        
        this.metricsState.isRunning = true;
        this.metricsState.startTime = Date.now();
        
        // Intervalo principal de metricas
        const mainInterval = setInterval(async () => {
            await this.collectAllMetrics();
        }, this.config.metricsInterval);
        
        this.intervals.set('main', mainInterval);
        
        // Intervalo de limpieza (cada 5 minutos)
        const cleanupInterval = setInterval(async () => {
            await this.performMaintenance();
        }, 5 * 60 * 1000);
        
        this.intervals.set('cleanup', cleanupInterval);
        
        // Intervalo de snapshot de estado (cada 10 segundos)
        const snapshotInterval = setInterval(async () => {
            await this.takeMetricsSnapshot();
        }, 10 * 1000);
        
        this.intervals.set('snapshot', snapshotInterval);
        
        console.log('[METRICS] ✅ Recoleccion en segundo plano iniciada');
        
        // Emitir evento de inicio
        this.emit('metrics:started', {
            timestamp: Date.now(),
            config: this.config,
            backgroundJobsEnabled: this.config.powerShellJobsEnabled
        });
    }
    
    // ================================================================
    // 📈 COLECTORES ESPECIALIZADOS
    // ================================================================
    
    initializePrimeTransformationCollector() {
        return {
            collectMetrics: async (transformationData) => {
                const metrics = {
                    timestamp: Date.now(),
                    transformationType: transformationData.type,
                    inputValue: transformationData.input,
                    outputValue: transformationData.output,
                    executionTime: transformationData.executionTime,
                    memoryUsage: process.memoryUsage(),
                    cpuUsage: process.cpuUsage(),
                    transformationRatio: transformationData.output / transformationData.input,
                    mathematicalProperties: {
                        isFinite: isFinite(transformationData.output),
                        isPositive: transformationData.output > 0,
                        withinExpectedRange: this.validateTransformationRange(transformationData)
                    }
                };
                
                // Almacenar en cache
                if (!this.metricsCache.transformationPrimes.has(transformationData.type)) {
                    this.metricsCache.transformationPrimes.set(transformationData.type, []);
                }
                
                const typeMetrics = this.metricsCache.transformationPrimes.get(transformationData.type);
                typeMetrics.push(metrics);
                
                // Mantener solo ultimos 1000 registros por tipo
                if (typeMetrics.length > 1000) {
                    typeMetrics.splice(0, typeMetrics.length - 1000);
                }
                
                // Log asincrono
                this.logMetricsAsync('transformations', metrics);
                
                return metrics;
            }
        };
    }
    
    initializeSystemPerformanceCollector() {
        return {
            collectMetrics: async () => {
                const startTime = performance.now();
                
                const metrics = {
                    timestamp: Date.now(),
                    memory: process.memoryUsage(),
                    cpu: process.cpuUsage(),
                    uptime: process.uptime(),
                    nodeVersion: process.version,
                    platform: process.platform,
                    arch: process.arch,
                    pid: process.pid,
                    ppid: process.ppid,
                    resourceUsage: process.resourceUsage?.() || null,
                    eventLoopLag: await this.measureEventLoopLag(),
                    gcStats: this.getGCStats(),
                    performanceNow: performance.now(),
                    collectionDuration: performance.now() - startTime
                };
                
                // Calcular tendencias
                const previousMetrics = this.metricsCache.systemPerformance.get('latest');
                if (previousMetrics) {
                    metrics.trends = {
                        memoryDelta: metrics.memory.heapUsed - previousMetrics.memory.heapUsed,
                        cpuDelta: this.calculateCpuDelta(metrics.cpu, previousMetrics.cpu),
                        uptimeDelta: metrics.uptime - previousMetrics.uptime
                    };
                }
                
                this.metricsCache.systemPerformance.set('latest', metrics);
                this.metricsCache.systemPerformance.set(Date.now(), metrics);
                
                // Log asincrono
                this.logMetricsAsync('performance', metrics);
                
                return metrics;
            }
        };
    }
    
    initializeBusinessLogicCollector() {
        return {
            collectMetrics: async (businessData) => {
                const metrics = {
                    timestamp: Date.now(),
                    operation: businessData.operation,
                    symbol: businessData.symbol,
                    leverage: businessData.leverage,
                    profit: businessData.profit,
                    loss: businessData.loss,
                    executionTime: businessData.executionTime,
                    success: businessData.success,
                    errorMessage: businessData.error,
                    quantumState: businessData.quantumState,
                    transformationResults: businessData.transformations,
                    marketConditions: businessData.marketConditions
                };
                
                // Calcular metricas derivadas
                metrics.derived = {
                    profitabilityRatio: businessData.profit / (businessData.profit + Math.abs(businessData.loss || 0)),
                    leverageEfficiency: businessData.leverage * (businessData.success ? 1 : -1),
                    executionEfficiency: 1000 / (businessData.executionTime || 1) // ops/sec
                };
                
                if (!this.metricsCache.businessLogic.has(businessData.operation)) {
                    this.metricsCache.businessLogic.set(businessData.operation, []);
                }
                
                this.metricsCache.businessLogic.get(businessData.operation).push(metrics);
                
                // Log asincrono
                this.logMetricsAsync('business', metrics);
                
                return metrics;
            }
        };
    }
    
    initializeBackgroundProcessCollector() {
        return {
            collectMetrics: async (processData) => {
                const metrics = {
                    timestamp: Date.now(),
                    processId: processData.id,
                    processName: processData.name,
                    status: processData.status,
                    startTime: processData.startTime,
                    duration: Date.now() - processData.startTime,
                    memoryUsage: processData.memoryUsage,
                    cpuUsage: processData.cpuUsage,
                    outputLines: processData.outputLines,
                    errorLines: processData.errorLines,
                    exitCode: processData.exitCode,
                    powerShellJob: processData.isPowerShellJob || false
                };
                
                this.metricsCache.backgroundJobs.set(processData.id, metrics);
                
                // Log asincrono
                this.logMetricsAsync('background', metrics);
                
                return metrics;
            }
        };
    }
    
    initializeErrorTrackingCollector() {
        return {
            collectMetrics: async (errorData) => {
                const metrics = {
                    timestamp: Date.now(),
                    error: errorData.message,
                    stack: errorData.stack,
                    code: errorData.code,
                    type: errorData.constructor.name,
                    operation: errorData.operation,
                    context: errorData.context,
                    severity: errorData.severity || 'medium',
                    recovery: errorData.recovery || 'none',
                    systemState: {
                        memory: process.memoryUsage(),
                        uptime: process.uptime(),
                        timestamp: Date.now()
                    }
                };
                
                const errorKey = `${errorData.operation}_${Date.now()}`;
                this.metricsCache.errors.set(errorKey, metrics);
                
                this.metricsState.errorCount++;
                
                // Log critico asincrono
                this.logMetricsAsync('errors', metrics, 'error');
                
                return metrics;
            }
        };
    }
    
    // ================================================================
    // 🔄 RECOLECCION DE METRICAS PRINCIPAL
    // ================================================================
    
    async collectAllMetrics() {
        const startTime = performance.now();
        
        try {
            // Recolectar metricas del sistema
            const systemMetrics = await this.collectors.systemPerformance.collectMetrics();
            
            // Metricas de procesos en segundo plano
            await this.collectBackgroundProcessMetrics();
            
            // Actualizar contadores
            this.metricsState.totalMetricsCollected++;
            this.metricsState.successCount++;
            
            const executionTime = performance.now() - startTime;
            
            // Log de rendimiento de recoleccion
            if (executionTime > 100) { // Si toma mas de 100ms
                console.warn(`[METRICS] ⚠️ Recoleccion lenta: ${executionTime.toFixed(2)}ms`);
            }
            
            // Emitir evento de metricas recolectadas
            this.emit('metrics:collected', {
                timestamp: Date.now(),
                executionTime,
                systemMetrics,
                totalCollected: this.metricsState.totalMetricsCollected
            });
            
        } catch (error) {
            console.error('[METRICS] ❌ Error recolectando metricas:', error.message);
            this.metricsState.errorCount++;
            
            await this.collectors.errorTracking.collectMetrics({
                message: error.message,
                stack: error.stack,
                operation: 'collectAllMetrics',
                context: 'metric_collection'
            });
        }
    }
    
    async collectBackgroundProcessMetrics() {
        // Obtener lista de jobs de PowerShell activos
        const activeJobs = await this.getActivePowerShellJobs();
        
        for (const job of activeJobs) {
            await this.collectors.backgroundProcesses.collectMetrics(job);
        }
    }
    
    // ================================================================
    // 💾 SISTEMA DE LOGGING ASINCRONO
    // ================================================================
    
    async logMetricsAsync(category, metrics, level = 'info') {
        // No bloquear el hilo principal - usar setImmediate
        setImmediate(async () => {
            try {
                const logFile = path.join(
                    this.config.logDirectory,
                    category,
                    `${category}_${this.getDateString()}.log`
                );
                
                const logEntry = {
                    timestamp: new Date().toISOString(),
                    level,
                    category,
                    data: metrics
                };
                
                const logLine = JSON.stringify(logEntry) + '\n';
                
                // Escritura asincrona sin bloquear
                await fs.appendFile(logFile, logLine, { encoding: 'utf8' });
                
                // Output a consola si esta habilitado
                if (this.config.enableConsoleOutput && level === 'error') {
                    console.error(`[METRICS] 🔴 ${category}: ${JSON.stringify(metrics, null, 2)}`);
                }
                
            } catch (error) {
                // Log de fallback a consola
                console.error('[METRICS] 💥 Error escribiendo log:', error.message);
            }
        });
    }
    
    // ================================================================
    // 🧹 MANTENIMIENTO Y LIMPIEZA AUTOMATICA
    // ================================================================
    
    async performMaintenance() {
        console.log('[METRICS] 🧹 Ejecutando mantenimiento automatico...');
        
        try {
            // Limpiar cache viejo
            await this.cleanupOldCacheEntries();
            
            // Rotar logs grandes
            await this.rotateLogFiles();
            
            // Comprimir logs antiguos
            if (this.config.compressionEnabled) {
                await this.compressOldLogs();
            }
            
            // Reporte de estado
            await this.generateStatusReport();
            
            console.log('[METRICS] ✅ Mantenimiento completado');
            
        } catch (error) {
            console.error('[METRICS] ❌ Error en mantenimiento:', error.message);
        }
    }
    
    async takeMetricsSnapshot() {
        const snapshot = {
            timestamp: Date.now(),
            uptime: Date.now() - this.metricsState.startTime,
            totalMetricsCollected: this.metricsState.totalMetricsCollected,
            errorCount: this.metricsState.errorCount,
            successCount: this.metricsState.successCount,
            backgroundJobsActive: this.metricsState.backgroundJobsActive,
            cacheStats: {
                transformationPrimes: this.metricsCache.transformationPrimes.size,
                systemPerformance: this.metricsCache.systemPerformance.size,
                businessLogic: this.metricsCache.businessLogic.size,
                errors: this.metricsCache.errors.size,
                backgroundJobs: this.metricsCache.backgroundJobs.size
            },
            memoryUsage: process.memoryUsage(),
            performance: {
                eventLoopLag: await this.measureEventLoopLag(),
                metricsCollectionRate: this.metricsState.totalMetricsCollected / (Date.now() - this.metricsState.startTime) * 1000
            }
        };
        
        this.metricsState.lastMetricsSnapshot = snapshot;
        
        // Mantener historial de snapshots (ultimos 100)
        this.metricsState.performanceHistory.push(snapshot);
        if (this.metricsState.performanceHistory.length > 100) {
            this.metricsState.performanceHistory.shift();
        }
        
        return snapshot;
    }
    
    // ================================================================
    // 🛠️ UTILIDADES Y HELPERS
    // ================================================================
    
    async measureEventLoopLag() {
        return new Promise((resolve) => {
            const start = performance.now();
            setImmediate(() => {
                resolve(performance.now() - start);
            });
        });
    }
    
    calculateCpuDelta(current, previous) {
        return {
            user: current.user - previous.user,
            system: current.system - previous.system
        };
    }
    
    getGCStats() {
        try {
            if (global.gc && typeof global.gc.getHeapStatistics === 'function') {
                return global.gc.getHeapStatistics();
            }
            return null;
        } catch (error) {
            return null;
        }
    }
    
    validateTransformationRange(transformationData) {
        // Validar que la transformacion esta dentro de rangos esperados
        const ratio = transformationData.output / transformationData.input;
        return ratio > 0.001 && ratio < 1000; // Rango razonable
    }
    
    async getActivePowerShellJobs() {
        // Simulacion de jobs activos - en implementacion real consultaria PowerShell
        return [
            {
                id: 'job_1',
                name: 'QuantumAnalysis',
                status: 'running',
                startTime: Date.now() - 60000,
                memoryUsage: process.memoryUsage(),
                cpuUsage: process.cpuUsage(),
                outputLines: 150,
                errorLines: 0,
                isPowerShellJob: true
            }
        ];
    }
    
    getDateString() {
        return new Date().toISOString().split('T')[0];
    }
    
    // ================================================================
    // 🔧 INTERFAZ PUBLICA
    // ================================================================
    
    async recordTransformationMetrics(transformationData) {
        return await this.collectors.primeTransformations.collectMetrics(transformationData);
    }
    
    async recordBusinessMetrics(businessData) {
        return await this.collectors.businessLogic.collectMetrics(businessData);
    }
    
    async recordError(errorData) {
        return await this.collectors.errorTracking.collectMetrics(errorData);
    }
    
    getMetricsSnapshot() {
        return this.metricsState.lastMetricsSnapshot;
    }
    
    getMetricsSummary() {
        return {
            state: this.metricsState,
            cacheStats: Object.fromEntries(
                Object.entries(this.metricsCache).map(([key, value]) => [key, value.size])
            ),
            config: this.config
        };
    }
    
    async stop() {
        console.log('[METRICS] 🛑 Deteniendo sistema de metricas...');
        
        this.metricsState.isRunning = false;
        
        // Limpiar intervalos
        for (const [name, interval] of this.intervals) {
            clearInterval(interval);
            console.log(`[METRICS] ⏹️ Intervalo ${name} detenido`);
        }
        
        // Tomar snapshot final
        await this.takeMetricsSnapshot();
        
        // Flush final de logs
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('[METRICS] ✅ Sistema de metricas detenido');
        
        this.emit('metrics:stopped', {
            timestamp: Date.now(),
            finalSnapshot: this.metricsState.lastMetricsSnapshot
        });
    }
}

module.exports = { QuantumMetricsCollector };
