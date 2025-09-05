const fs = require('fs');
const path = require('path');

console.log('🧪 PROBANDO UNIFICACIÓN DE CACHE - QBTC-UNIFIED');
console.log('================================================');

// Importar el sistema
const { QBTCSystemIntegrator } = require('./system-integrator');

async function testUnifiedCache() {
    try {
        console.log('\n🔧 1. Inicializando sistema con cache unificado...');
        
        const system = new QBTCSystemIntegrator();
        await system.initializeSystem();
        
        console.log('\n✅ Sistema inicializado correctamente');
        
        // Verificar que el cache esté unificado
        console.log('\n🔍 2. Verificando unificación de cache...');
        
        const binanceCache = system.components.binanceConnector.quantumCache;
        const systemCache = system.components.infiniteCache;
        
        console.log('   Cache del Binance Connector:', binanceCache ? '✅ EXISTE' : '❌ NO EXISTE');
        console.log('   Cache del System Integrator:', systemCache ? '✅ EXISTE' : '❌ NO EXISTE');
        console.log('   ¿Son el mismo objeto?', binanceCache === systemCache ? '✅ SÍ - UNIFICADO' : '❌ NO - DUPLICADO');
        
        if (binanceCache === systemCache) {
            console.log('   🎉 ¡CACHE UNIFICADO EXITOSAMENTE!');
        } else {
            console.log('   ❌ CACHE NO UNIFICADO - PROBLEMA PERSISTE');
            return false;
        }
        
        // Verificar método getAllSymbols
        console.log('\n🔍 3. Verificando método getAllSymbols...');
        
        const getAllSymbolsMethod = typeof system.components.binanceConnector.getAllSymbols;
        console.log('   Método getAllSymbols:', getAllSymbolsMethod === 'function' ? '✅ EXISTE' : '❌ NO EXISTE');
        
        if (getAllSymbolsMethod === 'function') {
            const symbols = system.components.binanceConnector.getAllSymbols();
            console.log('   Símbolos obtenidos:', symbols.length);
            console.log('   Primeros 5 símbolos:', symbols.slice(0, 5));
        }
        
        // Verificar métricas
        console.log('\n🔍 4. Verificando métricas del cache...');
        
        if (system.components.infiniteCache && typeof system.components.infiniteCache.getMetrics === 'function') {
            const metrics = system.components.infiniteCache.getMetrics();
            console.log('   Métricas del cache:');
            console.log('   - Cache Size:', metrics.cacheSize || 'N/A');
            console.log('   - Hit Rate:', metrics.hitRate || 'N/A');
            console.log('   - Avg Latency:', metrics.avgLatency || 'N/A');
            console.log('   - Error Rate:', metrics.errorRate || 'N/A');
        }
        
        // Verificar estado del sistema
        console.log('\n🔍 5. Verificando estado del sistema...');
        
        const systemStatus = system.getSystemStatus();
        console.log('   Estado del sistema:');
        console.log('   - Binance Connector:', systemStatus.components.binanceConnector ? '✅ INICIALIZADO' : '❌ NO INICIALIZADO');
        console.log('   - Infinite Cache:', systemStatus.components.infiniteCache ? '✅ INICIALIZADO' : '❌ NO INICIALIZADO');
        console.log('   - Market Maker:', systemStatus.components.marketMaker ? '✅ INICIALIZADO' : '❌ NO INICIALIZADO');
        
        // Probar funcionalidad completa
        console.log('\n🔍 6. Probando funcionalidad completa...');
        
        // Simular carga de datos
        console.log('   Simulando carga de datos en el cache...');
        
        // Verificar que los datos se reflejen en ambos caches
        const testKey = 'test_unified_cache';
        const testData = { timestamp: Date.now(), data: 'test_data' };
        
        if (system.components.infiniteCache && typeof system.components.infiniteCache.set === 'function') {
            await system.components.infiniteCache.set('test', testKey, testData);
            console.log('   ✅ Datos cargados en cache unificado');
            
            // Verificar que se pueda leer desde ambos puntos
            const dataFromSystem = await system.components.infiniteCache.get('test', testKey);
            const dataFromBinance = await system.components.binanceConnector.quantumCache.get('test', testKey);
            
            console.log('   Datos desde System Cache:', dataFromSystem ? '✅ OK' : '❌ FALLA');
            console.log('   Datos desde Binance Cache:', dataFromBinance ? '✅ OK' : '❌ FALLA');
            
            if (dataFromSystem && dataFromBinance) {
                console.log('   🎉 ¡DATOS SINCRONIZADOS CORRECTAMENTE!');
            }
        }
        
        console.log('\n✅ PRUEBA COMPLETADA EXITOSAMENTE');
        console.log('🎯 El sistema está funcionando con cache unificado');
        
        return true;
        
    } catch (error) {
        console.error('\n❌ ERROR EN LA PRUEBA:', error.message);
        console.error('Stack:', error.stack);
        return false;
    }
}

// Ejecutar la prueba
testUnifiedCache().then(success => {
    if (success) {
        console.log('\n🏆 RESULTADO: UNIFICACIÓN DE CACHE EXITOSA');
        console.log('📊 Las métricas ahora deberían actualizarse correctamente');
    } else {
        console.log('\n❌ RESULTADO: UNIFICACIÓN DE CACHE FALLIDA');
        console.log('🔧 Se requieren ajustes adicionales');
    }
    
    process.exit(success ? 0 : 1);
});
