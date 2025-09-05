/*
  Sistema de Actualización Automática de Símbolos
  Ejecuta cada 30 minutos para mantener la cache actualizada
*/

const { SymbolsLoader } = require('./fix-symbols-loading');
const cron = require('node-cron');

class AutoSymbolUpdater {
    constructor() {
        this.symbolsLoader = new SymbolsLoader();
        this.isRunning = false;
        this.lastUpdate = null;
        this.updateInterval = '*/30 * * * *'; // Cada 30 minutos
    }
    
    start() {
        console.log('🔄 Iniciando actualizador automático de símbolos...');
        
        // Actualización inicial
        this.updateSymbols();
        
        // Programar actualizaciones periódicas
        cron.schedule(this.updateInterval, () => {
            if (!this.isRunning) {
                this.updateSymbols();
            }
        });
        
        console.log(`✅ Actualizador programado cada 30 minutos`);
    }
    
    async updateSymbols() {
        if (this.isRunning) {
            console.log('⏳ Actualización ya en progreso, omitiendo...');
            return;
        }
        
        this.isRunning = true;
        const startTime = Date.now();
        
        try {
            console.log('🔄 [AUTO-UPDATE] Iniciando actualización automática de símbolos...');
            
            const result = await this.symbolsLoader.run();
            
            this.lastUpdate = new Date();
            const duration = Date.now() - startTime;
            
            console.log(`✅ [AUTO-UPDATE] Actualización completada en ${(duration / 1000).toFixed(2)}s`);
            console.log(`   📈 Símbolos actualizados: ${result.succeeded || 0}`);
            console.log(`   ❌ Errores: ${result.failed || 0}`);
            
        } catch (error) {
            console.error('💥 [AUTO-UPDATE] Error en actualización automática:', error.message);
        } finally {
            this.isRunning = false;
        }
    }
    
    getStatus() {
        return {
            running: this.isRunning,
            lastUpdate: this.lastUpdate,
            nextUpdate: this.getNextUpdateTime(),
            interval: this.updateInterval
        };
    }
    
    getNextUpdateTime() {
        if (!this.lastUpdate) return 'Próximamente';
        
        const next = new Date(this.lastUpdate.getTime() + 30 * 60 * 1000);
        return next.toISOString();
    }
}

// Exportar y auto-iniciar si es ejecutado directamente
const autoUpdater = new AutoSymbolUpdater();

if (require.main === module) {
    autoUpdater.start();
    
    // Mantener proceso vivo
    process.on('SIGINT', () => {
        console.log('\n🛑 Deteniendo actualizador automático...');
        process.exit(0);
    });
}

module.exports = { AutoSymbolUpdater, autoUpdater };
