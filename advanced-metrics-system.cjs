/*
  📊 ADVANCED METRICS SYSTEM
  Sistema avanzado de métricas para Leonardo Consciousness
*/

class AdvancedMetricsCollector {
    constructor() {
        this.metrics = {
            system: {
                startTime: Date.now(),
                requests: 0,
                errors: 0,
                performance: {}
            },
            binance: {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                averageLatency: 0
            },
            cache: {
                hits: 0,
                misses: 0,
                totalQueries: 0
            }
        };
        
        this.startMetricsCollection();
    }
    
    startMetricsCollection() {
        setInterval(() => {
            this.collectSystemMetrics();
        }, 30000); // Cada 30 segundos
    }
    
    collectSystemMetrics() {
        this.metrics.system.performance = {
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            uptime: process.uptime()
        };
    }
    
    recordRequest(service, success = true, latency = 0) {
        if (service === 'binance') {
            this.metrics.binance.totalRequests++;
            if (success) {
                this.metrics.binance.successfulRequests++;
            } else {
                this.metrics.binance.failedRequests++;
            }
            this.metrics.binance.averageLatency = 
                (this.metrics.binance.averageLatency + latency) / 2;
        }
        
        this.metrics.system.requests++;
        if (!success) {
            this.metrics.system.errors++;
        }
    }
    
    recordCacheOperation(hit = true) {
        this.metrics.cache.totalQueries++;
        if (hit) {
            this.metrics.cache.hits++;
        } else {
            this.metrics.cache.misses++;
        }
    }
    
    getMetrics() {
        return {
            ...this.metrics,
            calculated: {
                binanceSuccessRate: this.metrics.binance.totalRequests > 0 ?
                    (this.metrics.binance.successfulRequests / this.metrics.binance.totalRequests) * 100 : 0,
                cacheHitRate: this.metrics.cache.totalQueries > 0 ?
                    (this.metrics.cache.hits / this.metrics.cache.totalQueries) * 100 : 0,
                systemErrorRate: this.metrics.system.requests > 0 ?
                    (this.metrics.system.errors / this.metrics.system.requests) * 100 : 0
            }
        };
    }
    
    generateReport() {
        const metrics = this.getMetrics();
        const uptime = Date.now() - metrics.system.startTime;
        
        console.log('📊 REPORTE DE MÉTRICAS AVANZADAS');
        console.log('=================================');
        console.log(`⏱️  Uptime: ${(uptime / 1000 / 60 / 60).toFixed(2)} horas`);
        console.log(`🔄 Requests totales: ${metrics.system.requests}`);
        console.log(`❌ Errores: ${metrics.system.errors} (${metrics.calculated.systemErrorRate.toFixed(2)}%)`);
        console.log(`📡 Binance Success Rate: ${metrics.calculated.binanceSuccessRate.toFixed(2)}%`);
        console.log(`💾 Cache Hit Rate: ${metrics.calculated.cacheHitRate.toFixed(2)}%`);
        console.log(`⚡ Latencia promedio Binance: ${metrics.binance.averageLatency.toFixed(2)}ms`);
        console.log('=================================');
    }
}

// Crear instancia global
global.advancedMetrics = new AdvancedMetricsCollector();

// Generar reporte cada 10 minutos
setInterval(() => {
    global.advancedMetrics.generateReport();
}, 600000);

module.exports = { AdvancedMetricsCollector };