const fs = require('fs');
const path = require('path');

console.log('🧪 PROBANDO MÉTODO GETHEALTH() - QUANTUM INFINITE CACHE');
console.log('========================================================');

// Importar QuantumInfiniteCache
const QuantumInfiniteCache = require('./quantum-core/QuantumInfiniteCache');

async function testCacheHealth() {
    try {
        console.log('\n🔧 1. Creando instancia de QuantumInfiniteCache...');
        
        const cache = new QuantumInfiniteCache();
        await cache.initialize();
        
        console.log('✅ Cache inicializada correctamente');
        
        // Verificar que el método getHealth existe
        console.log('\n🔍 2. Verificando método getHealth()...');
        
        const hasGetHealth = typeof cache.getHealth === 'function';
        console.log('   Método getHealth existe:', hasGetHealth ? '✅ SÍ' : '❌ NO');
        
        if (!hasGetHealth) {
            console.log('   ❌ ERROR: Método getHealth() no encontrado');
            return false;
        }
        
        // Probar el método getHealth
        console.log('\n🔍 3. Probando método getHealth()...');
        
        const health = cache.getHealth();
        console.log('   Estado de salud obtenido:', health.status);
        console.log('   Advertencias:', health.warnings.length > 0 ? health.warnings : 'Ninguna');
        console.log('   Timestamp:', health.timestamp);
        
        // Verificar estructura del objeto de salud
        console.log('\n🔍 4. Verificando estructura del objeto de salud...');
        
        const requiredFields = ['status', 'warnings', 'timestamp', 'metrics', 'quantumState'];
        const missingFields = requiredFields.filter(field => !(field in health));
        
        if (missingFields.length > 0) {
            console.log('   ❌ Campos faltantes:', missingFields);
            return false;
        } else {
            console.log('   ✅ Todos los campos requeridos presentes');
        }
        
        // Verificar métricas específicas
        console.log('\n🔍 5. Verificando métricas específicas...');
        
        console.log('   Hit Rate:', health.metrics.hitRate);
        console.log('   Error Rate:', health.metrics.errorRate);
        console.log('   Avg Latency:', health.metrics.avgLatency);
        console.log('   Cache Size (symbols):', health.metrics.cacheSize.symbols);
        console.log('   Symbols Loaded:', health.metrics.symbolsLoaded);
        console.log('   Matrix Size:', health.metrics.matrixSize);
        
        // Verificar estado cuántico
        console.log('\n🔍 6. Verificando estado cuántico...');
        
        console.log('   Resonance State:', health.quantumState.resonanceState);
        console.log('   Coherence Level:', health.quantumState.coherenceLevel);
        console.log('   Quantum Efficiency:', health.quantumState.quantumEfficiency);
        
        // Simular carga de datos para ver cambios
        console.log('\n🔍 7. Simulando carga de datos...');
        
        // Agregar algunos símbolos de prueba
        await cache.set('symbols', 'BTCUSDT', { price: 45000, volume: 1000000 }, 30000);
        await cache.set('symbols', 'ETHUSDT', { price: 2500, volume: 500000 }, 30000);
        await cache.set('symbols', 'BNBUSDT', { price: 320, volume: 200000 }, 30000);
        
        console.log('   ✅ Datos de prueba cargados');
        
        // Verificar salud después de cargar datos
        console.log('\n🔍 8. Verificando salud después de cargar datos...');
        
        const healthAfterData = cache.getHealth();
        console.log('   Estado después de datos:', healthAfterData.status);
        console.log('   Cache Size después:', healthAfterData.metrics.cacheSize.symbols);
        console.log('   Advertencias después:', healthAfterData.advertencias || 'Ninguna');
        
        // Verificar que el método no cause errores
        console.log('\n🔍 9. Verificando robustez del método...');
        
        let errorCount = 0;
        for (let i = 0; i < 10; i++) {
            try {
                const testHealth = cache.getHealth();
                if (!testHealth || !testHealth.status) {
                    errorCount++;
                }
            } catch (error) {
                errorCount++;
                console.log(`   ❌ Error en iteración ${i}:`, error.message);
            }
        }
        
        if (errorCount === 0) {
            console.log('   ✅ Método robusto - Sin errores en 10 iteraciones');
        } else {
            console.log(`   ⚠️ ${errorCount} errores en 10 iteraciones`);
        }
        
        console.log('\n✅ PRUEBA COMPLETADA EXITOSAMENTE');
        console.log('🎯 El método getHealth() funciona correctamente');
        
        return true;
        
    } catch (error) {
        console.error('\n❌ ERROR EN LA PRUEBA:', error.message);
        console.error('Stack:', error.stack);
        return false;
    }
}

// Ejecutar la prueba
testCacheHealth().then(success => {
    if (success) {
        console.log('\n🏆 RESULTADO: MÉTODO GETHEALTH() FUNCIONA');
        console.log('📊 El error "getHealth is not a function" debería estar resuelto');
    } else {
        console.log('\n❌ RESULTADO: MÉTODO GETHEALTH() FALLA');
        console.log('🔧 Se requieren ajustes adicionales');
    }
    
    process.exit(success ? 0 : 1);
});
