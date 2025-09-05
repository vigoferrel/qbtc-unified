
const QuantumInfiniteCache = require('./quantum-core/QuantumInfiniteCache');

async function testMetrics() {
    console.log('🧪 PROBANDO MÉTRICAS QUANTUM CACHE...');
    
    const cache = new QuantumInfiniteCache();
    await cache.initialize();
    
    // Simular carga de datos
    cache.updateQuantumState(10, 8);
    cache.updateQuantumState(15, 12);
    cache.updateQuantumState(20, 18);
    
    // Obtener métricas
    const metrics = cache.getMetrics();
    const health = cache.validateSystemHealth();
    
    console.log('📊 MÉTRICAS OBTENIDAS:');
    console.log(JSON.stringify(metrics, null, 2));
    console.log('🏥 ESTADO DE SALUD:');
    console.log(JSON.stringify(health, null, 2));
    
    // Verificar que las métricas no estén en cero
    const hasData = metrics.quantumState.symbolsLoaded > 0;
    const hasCoherence = metrics.quantumState.coherenceLevel > 0;
    const hasEfficiency = metrics.quantumState.quantumEfficiency > 0;
    
    console.log(`\n✅ RESULTADOS:\n   Símbolos cargados: ${hasData ? 'SÍ' : 'NO'}\n   Coherencia: ${hasCoherence ? 'SÍ' : 'NO'}\n   Eficiencia: ${hasEfficiency ? 'SÍ' : 'NO'}`);
    
    if (hasData && hasCoherence && hasEfficiency) {
        console.log('🎉 ¡MÉTRICAS FUNCIONANDO CORRECTAMENTE!');
    } else {
        console.log('❌ MÉTRICAS AÚN EN CERO - REQUIERE MÁS AJUSTES');
    }
}

testMetrics().catch(console.error);
