/*
  🛡️ AUTO-RECOVERY SYSTEM
  Sistema de auto-recuperación para Leonardo Consciousness
*/

class AutoRecoverySystem {
    constructor() {
        this.recoveryAttempts = 0;
        this.maxRecoveryAttempts = 5;
        this.isRecovering = false;
        this.lastRecoveryTime = null;
        
        this.startMonitoring();
    }
    
    startMonitoring() {
        // Monitorear cada minuto
        setInterval(async () => {
            await this.checkSystemHealth();
        }, 60000);
        
        console.log('🛡️ Sistema de auto-recuperación activado');
    }
    
    async checkSystemHealth() {
        if (this.isRecovering) return;
        
        try {
            const issues = await this.detectIssues();
            
            if (issues.length > 0) {
                console.warn(`⚠️ [AUTO-RECOVERY] Problemas detectados: ${issues.join(', ')}`);
                await this.attemptRecovery(issues);
            }
            
        } catch (error) {
            console.error('❌ [AUTO-RECOVERY] Error en verificación:', error.message);
        }
    }
    
    async detectIssues() {
        const issues = [];
        
        // Verificar conectores principales
        if (global.binanceConnector) {
            try {
                const metrics = global.binanceConnector.getPerformanceMetrics?.();
                if (metrics && metrics.systemStatus === 'CRITICAL') {
                    issues.push('binance_critical');
                }
            } catch (error) {
                issues.push('binance_error');
            }
        } else {
            issues.push('binance_missing');
        }
        
        // Verificar cache
        if (!global.quantumCache) {
            issues.push('cache_missing');
        } else {
            try {
                const metrics = global.quantumCache.getMetrics();
                const hitRate = parseFloat(metrics.performance?.hitRate?.replace('%', '') || 0);
                if (hitRate < 30) {
                    issues.push('cache_low_hit_rate');
                }
            } catch (error) {
                issues.push('cache_error');
            }
        }
        
        // Verificar memoria
        const memUsage = process.memoryUsage();
        if (memUsage.heapUsed > (memUsage.heapTotal * 0.95)) {
            issues.push('memory_critical');
        }
        
        return issues;
    }
    
    async attemptRecovery(issues) {
        if (this.recoveryAttempts >= this.maxRecoveryAttempts) {
            console.error('💥 [AUTO-RECOVERY] Máximo de intentos de recuperación alcanzado');
            return;
        }
        
        this.isRecovering = true;
        this.recoveryAttempts++;
        this.lastRecoveryTime = Date.now();
        
        console.log(`🔧 [AUTO-RECOVERY] Intento ${this.recoveryAttempts}: ${issues.join(', ')}`);
        
        try {
            for (const issue of issues) {
                await this.recoverFromIssue(issue);
            }
            
            console.log('✅ [AUTO-RECOVERY] Recuperación completada');
            
            // Reset contador si la recuperación fue exitosa
            setTimeout(() => {
                this.recoveryAttempts = Math.max(0, this.recoveryAttempts - 1);
            }, 300000); // 5 minutos
            
        } catch (error) {
            console.error('❌ [AUTO-RECOVERY] Error durante recuperación:', error.message);
        } finally {
            this.isRecovering = false;
        }
    }
    
    async recoverFromIssue(issue) {
        switch (issue) {
            case 'binance_critical':
            case 'binance_error':
                await this.recoverBinanceConnection();
                break;
                
            case 'binance_missing':
                await this.reinitializeBinanceConnector();
                break;
                
            case 'cache_missing':
                await this.reinitializeCache();
                break;
                
            case 'cache_low_hit_rate':
                await this.refreshCache();
                break;
                
            case 'memory_critical':
                await this.performGarbageCollection();
                break;
                
            default:
                console.log(`⚠️ [AUTO-RECOVERY] Issue desconocido: ${issue}`);
        }
    }
    
    async recoverBinanceConnection() {
        console.log('🔄 [AUTO-RECOVERY] Recuperando conexión Binance...');
        
        if (global.binanceConnector?.initialize) {
            await global.binanceConnector.initialize();
        }
    }
    
    async reinitializeBinanceConnector() {
        console.log('🔄 [AUTO-RECOVERY] Reinicializando conector Binance...');
        
        try {
            const { BinanceRealConnector } = require('./BinanceRealConnector.cjs');
            global.binanceConnector = new BinanceRealConnector();
            await global.binanceConnector.initialize();
        } catch (error) {
            console.error('❌ Error reinicializando Binance:', error.message);
        }
    }
    
    async reinitializeCache() {
        console.log('🔄 [AUTO-RECOVERY] Reinicializando cache...');
        
        try {
            const QuantumInfiniteCache = require('./QuantumInfiniteCache.cjs');
            global.quantumCache = new QuantumInfiniteCache();
        } catch (error) {
            console.error('❌ Error reinicializando cache:', error.message);
        }
    }
    
    async refreshCache() {
        console.log('🔄 [AUTO-RECOVERY] Refrescando cache...');
        
        if (global.quantumCache?.refreshAllSymbols) {
            await global.quantumCache.refreshAllSymbols();
        }
    }
    
    async performGarbageCollection() {
        console.log('🧹 [AUTO-RECOVERY] Ejecutando garbage collection...');
        
        if (global.gc) {
            global.gc();
        } else {
            console.warn('⚠️ Garbage collection manual no disponible');
        }
    }
    
    getRecoveryStats() {
        return {
            recoveryAttempts: this.recoveryAttempts,
            maxRecoveryAttempts: this.maxRecoveryAttempts,
            isRecovering: this.isRecovering,
            lastRecoveryTime: this.lastRecoveryTime,
            uptime: Date.now() - (this.startTime || Date.now())
        };
    }
}

// Crear instancia global
global.autoRecovery = new AutoRecoverySystem();

module.exports = { AutoRecoverySystem };