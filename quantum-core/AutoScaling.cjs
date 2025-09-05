// ========================================================================
// 📈 AUTO SCALING - LEONARDO-FEYNMAN QUANTUM DESIGN
// Sistema de Escalado Automático Inteligente
// "El sistema crece y se adapta como un organismo cuántico vivo"
// ========================================================================

const { EventEmitter } = require('events');

class AutoScaling extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.config = {
            minInstances: options.minInstances || 1,
            maxInstances: options.maxInstances || 10,
            scaleUpThreshold: options.scaleUpThreshold || 80, // CPU/Memory usage %
            scaleDownThreshold: options.scaleDownThreshold || 30,
            scaleUpCooldown: options.scaleUpCooldown || 300000, // 5 minutos
            scaleDownCooldown: options.scaleDownCooldown || 600000, // 10 minutos
            checkInterval: options.checkInterval || 30000, // 30 segundos
            metricsWindow: options.metricsWindow || 300000, // 5 minutos
            ...options
        };
        
        // Estado del auto-scaling
        this.state = {
            currentInstances: this.config.minInstances,
            targetInstances: this.config.minInstances,
            scaling: false,
            lastScaleUp: 0,
            lastScaleDown: 0,
            metrics: []
        };
        
        // Métricas del sistema
        this.metrics = {
            totalScalingEvents: 0,
            scaleUpEvents: 0,
            scaleDownEvents: 0,
            avgResponseTime: 0,
            cpuUsage: 0,
            memoryUsage: 0,
            requestRate: 0,
            errorRate: 0
        };
        
        // Configurar monitoreo
        this.setupMonitoring();
        
        console.log('[AUTO SCALING] 📈 Sistema de auto-scaling inicializado');
    }
    
    /**
     * Configurar monitoreo continuo
     */
    setupMonitoring() {
        setInterval(() => {
            this.checkScalingNeeds();
        }, this.config.checkInterval);
        
        console.log('[AUTO SCALING] 🔍 Monitoreo configurado');
    }
    
    /**
     * Verificar necesidades de escalado
     */
    async checkScalingNeeds() {
        try {
            // Obtener métricas actuales
            const currentMetrics = await this.getCurrentMetrics();
            
            // Añadir métricas al historial
            this.state.metrics.push({
                timestamp: Date.now(),
                ...currentMetrics
            });
            
            // Mantener solo métricas del período de ventana
            const cutoffTime = Date.now() - this.config.metricsWindow;
            this.state.metrics = this.state.metrics.filter(m => m.timestamp > cutoffTime);
            
            // Calcular métricas promedio
            const avgMetrics = this.calculateAverageMetrics();
            
            // Evaluar necesidad de escalado
            await this.evaluateScaling(avgMetrics);
            
        } catch (error) {
            console.error('[AUTO SCALING] ❌ Error en check de escalado:', error.message);
        }
    }
    
    /**
     * Obtener métricas actuales del sistema
     */
    async getCurrentMetrics() {
        // Simular obtención de métricas del sistema
        return {
            cpuUsage: Math.random() * 100,
            memoryUsage: Math.random() * 100,
            responseTime: Math.random() * 1000 + 50,
            requestRate: Math.random() * 1000,
            errorRate: Math.random() * 10,
            activeConnections: Math.random() * 100
        };
    }
    
    /**
     * Calcular métricas promedio
     */
    calculateAverageMetrics() {
        if (this.state.metrics.length === 0) {
            return {
                cpuUsage: 0,
                memoryUsage: 0,
                responseTime: 0,
                requestRate: 0,
                errorRate: 0
            };
        }
        
        const sum = this.state.metrics.reduce((acc, metric) => {
            return {
                cpuUsage: acc.cpuUsage + metric.cpuUsage,
                memoryUsage: acc.memoryUsage + metric.memoryUsage,
                responseTime: acc.responseTime + metric.responseTime,
                requestRate: acc.requestRate + metric.requestRate,
                errorRate: acc.errorRate + metric.errorRate
            };
        }, {
            cpuUsage: 0,
            memoryUsage: 0,
            responseTime: 0,
            requestRate: 0,
            errorRate: 0
        });
        
        const count = this.state.metrics.length;
        
        return {
            cpuUsage: sum.cpuUsage / count,
            memoryUsage: sum.memoryUsage / count,
            responseTime: sum.responseTime / count,
            requestRate: sum.requestRate / count,
            errorRate: sum.errorRate / count
        };
    }
    
    /**
     * Evaluar necesidad de escalado
     */
    async evaluateScaling(metrics) {
        const now = Date.now();
        
        // Actualizar métricas globales
        this.updateMetrics(metrics);
        
        // Verificar si está en período de cooldown
        if (this.state.scaling) {
            return;
        }
        
        // Evaluar escalado hacia arriba
        if (this.shouldScaleUp(metrics, now)) {
            await this.scaleUp();
            return;
        }
        
        // Evaluar escalado hacia abajo
        if (this.shouldScaleDown(metrics, now)) {
            await this.scaleDown();
            return;
        }
    }
    
    /**
     * Determinar si debe escalar hacia arriba
     */
    shouldScaleUp(metrics, now) {
        // Verificar cooldown
        if (now - this.state.lastScaleUp < this.config.scaleUpCooldown) {
            return false;
        }
        
        // Verificar límite máximo
        if (this.state.currentInstances >= this.config.maxInstances) {
            return false;
        }
        
        // Condiciones de escalado hacia arriba
        const highCpu = metrics.cpuUsage > this.config.scaleUpThreshold;
        const highMemory = metrics.memoryUsage > this.config.scaleUpThreshold;
        const highResponseTime = metrics.responseTime > 500; // ms
        const highErrorRate = metrics.errorRate > 5; // %
        
        return highCpu || highMemory || highResponseTime || highErrorRate;
    }
    
    /**
     * Determinar si debe escalar hacia abajo
     */
    shouldScaleDown(metrics, now) {
        // Verificar cooldown
        if (now - this.state.lastScaleDown < this.config.scaleDownCooldown) {
            return false;
        }
        
        // Verificar límite mínimo
        if (this.state.currentInstances <= this.config.minInstances) {
            return false;
        }
        
        // Condiciones de escalado hacia abajo
        const lowCpu = metrics.cpuUsage < this.config.scaleDownThreshold;
        const lowMemory = metrics.memoryUsage < this.config.scaleDownThreshold;
        const lowResponseTime = metrics.responseTime < 200; // ms
        const lowRequestRate = metrics.requestRate < 100; // requests/min
        
        return lowCpu && lowMemory && lowResponseTime && lowRequestRate;
    }
    
    /**
     * Escalar hacia arriba
     */
    async scaleUp() {
        try {
            this.state.scaling = true;
            const newInstances = Math.min(
                this.state.currentInstances + 1,
                this.config.maxInstances
            );
            
            console.log(`[AUTO SCALING] 📈 Escalando de ${this.state.currentInstances} a ${newInstances} instancias`);
            
            // Simular creación de nueva instancia
            await this.createInstance();
            
            this.state.currentInstances = newInstances;
            this.state.targetInstances = newInstances;
            this.state.lastScaleUp = Date.now();
            
            this.metrics.scaleUpEvents++;
            this.metrics.totalScalingEvents++;
            
            this.emit('scaledUp', {
                from: this.state.currentInstances - 1,
                to: this.state.currentInstances,
                reason: 'High load detected'
            });
            
            console.log(`[AUTO SCALING] ✅ Escalado hacia arriba completado: ${newInstances} instancias`);
            
        } catch (error) {
            console.error('[AUTO SCALING] ❌ Error en escalado hacia arriba:', error.message);
        } finally {
            this.state.scaling = false;
        }
    }
    
    /**
     * Escalar hacia abajo
     */
    async scaleDown() {
        try {
            this.state.scaling = true;
            const newInstances = Math.max(
                this.state.currentInstances - 1,
                this.config.minInstances
            );
            
            console.log(`[AUTO SCALING] 📉 Escalando de ${this.state.currentInstances} a ${newInstances} instancias`);
            
            // Simular eliminación de instancia
            await this.destroyInstance();
            
            this.state.currentInstances = newInstances;
            this.state.targetInstances = newInstances;
            this.state.lastScaleDown = Date.now();
            
            this.metrics.scaleDownEvents++;
            this.metrics.totalScalingEvents++;
            
            this.emit('scaledDown', {
                from: this.state.currentInstances + 1,
                to: this.state.currentInstances,
                reason: 'Low load detected'
            });
            
            console.log(`[AUTO SCALING] ✅ Escalado hacia abajo completado: ${newInstances} instancias`);
            
        } catch (error) {
            console.error('[AUTO SCALING] ❌ Error en escalado hacia abajo:', error.message);
        } finally {
            this.state.scaling = false;
        }
    }
    
    /**
     * Crear nueva instancia
     */
    async createInstance() {
        return new Promise((resolve) => {
            // Simular tiempo de creación de instancia
            setTimeout(() => {
                console.log('[AUTO SCALING] 🆕 Nueva instancia creada');
                resolve();
            }, Math.random() * 5000 + 2000); // 2-7 segundos
        });
    }
    
    /**
     * Eliminar instancia
     */
    async destroyInstance() {
        return new Promise((resolve) => {
            // Simular tiempo de eliminación de instancia
            setTimeout(() => {
                console.log('[AUTO SCALING] 🗑️ Instancia eliminada');
                resolve();
            }, Math.random() * 3000 + 1000); // 1-4 segundos
        });
    }
    
    /**
     * Actualizar métricas globales
     */
    updateMetrics(metrics) {
        this.metrics.cpuUsage = metrics.cpuUsage;
        this.metrics.memoryUsage = metrics.memoryUsage;
        this.metrics.avgResponseTime = metrics.responseTime;
        this.metrics.requestRate = metrics.requestRate;
        this.metrics.errorRate = metrics.errorRate;
    }
    
    /**
     * Obtener estado del auto-scaling
     */
    getAutoScalingStatus() {
        const avgMetrics = this.calculateAverageMetrics();
        
        return {
            config: this.config,
            state: this.state,
            metrics: this.metrics,
            currentMetrics: avgMetrics,
            scaling: {
                canScaleUp: this.state.currentInstances < this.config.maxInstances,
                canScaleDown: this.state.currentInstances > this.config.minInstances,
                inCooldown: this.state.scaling,
                lastScaleUp: this.state.lastScaleUp,
                lastScaleDown: this.state.lastScaleDown
            },
            health: this.getHealthStatus()
        };
    }
    
    /**
     * Obtener estado de salud del auto-scaling
     */
    getHealthStatus() {
        const cpuHealth = this.metrics.cpuUsage < 80 ? 'GOOD' : 'HIGH';
        const memoryHealth = this.metrics.memoryUsage < 80 ? 'GOOD' : 'HIGH';
        const responseHealth = this.metrics.avgResponseTime < 500 ? 'GOOD' : 'SLOW';
        const errorHealth = this.metrics.errorRate < 5 ? 'GOOD' : 'HIGH';
        
        if (this.metrics.cpuUsage > 95 || this.metrics.memoryUsage > 95) return 'CRITICAL';
        if (this.metrics.cpuUsage > 80 || this.metrics.memoryUsage > 80) return 'WARNING';
        if (this.metrics.errorRate > 10) return 'ERROR';
        return 'HEALTHY';
    }
    
    /**
     * Configurar límites de escalado
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('[AUTO SCALING] ⚙️ Configuración actualizada');
    }
    
    /**
     * Obtener recomendaciones de escalado
     */
    getScalingRecommendations() {
        const recommendations = [];
        const avgMetrics = this.calculateAverageMetrics();
        
        if (avgMetrics.cpuUsage > 90) {
            recommendations.push({
                type: 'SCALE_UP',
                priority: 'HIGH',
                reason: `CPU usage is ${avgMetrics.cpuUsage.toFixed(1)}% (threshold: ${this.config.scaleUpThreshold}%)`
            });
        }
        
        if (avgMetrics.memoryUsage > 90) {
            recommendations.push({
                type: 'SCALE_UP',
                priority: 'HIGH',
                reason: `Memory usage is ${avgMetrics.memoryUsage.toFixed(1)}% (threshold: ${this.config.scaleUpThreshold}%)`
            });
        }
        
        if (avgMetrics.responseTime > 1000) {
            recommendations.push({
                type: 'SCALE_UP',
                priority: 'MEDIUM',
                reason: `Response time is ${avgMetrics.responseTime.toFixed(0)}ms (threshold: 500ms)`
            });
        }
        
        if (avgMetrics.cpuUsage < 20 && avgMetrics.memoryUsage < 20 && this.state.currentInstances > this.config.minInstances) {
            recommendations.push({
                type: 'SCALE_DOWN',
                priority: 'LOW',
                reason: `Low resource usage: CPU ${avgMetrics.cpuUsage.toFixed(1)}%, Memory ${avgMetrics.memoryUsage.toFixed(1)}%`
            });
        }
        
        return recommendations;
    }
    
    /**
     * Cerrar auto-scaling
     */
    close() {
        this.state.scaling = false;
        this.removeAllListeners();
        console.log('[AUTO SCALING] 🔒 Sistema de auto-scaling cerrado');
    }
}

module.exports = AutoScaling;
