// Test completo de inicialización del BinanceRealConnector
const { BinanceRealConnector } = require('./quantum-core/BinanceRealConnector');

async function testFullInitialization() {
    try {
        console.log('🔬 EJECUTANDO PRUEBA COMPLETA DE INICIALIZACIÓN');
        console.log('=' .repeat(70));
        
        console.log('🚀 Iniciando prueba completa de initialize()...');
        const connector = new BinanceRealConnector();
        
        console.log('\n📈 Estado PRE-INICIALIZACIÓN:');
        console.log('  - isConnected:', connector.isConnected);
        console.log('  - allSymbols.length:', connector.allSymbols.length);
        console.log('  - isReadyForTrading():', connector.isReadyForTrading());
        
        console.log('\n⚡ Ejecutando initialize() completo...');
        await connector.initialize();
        
        console.log('\n✅ Estado POST-INICIALIZACIÓN:');
        console.log('  - isConnected:', connector.isConnected);
        console.log('  - allSymbols.length:', connector.allSymbols.length);
        console.log('  - isReadyForTrading():', connector.isReadyForTrading());
        console.log('  - currentPrices.size:', connector.currentPrices.size);
        console.log('  - volatilityMetrics.size:', connector.volatilityMetrics.size);
        console.log('  - lunarInfluence.size:', connector.lunarInfluence.size);
        
        console.log('\n🎯 VALIDACIÓN DE DATOS COMPLETOS:');
        const dataStatus = connector.getRealDataStatus();
        console.log('  - Completitud precios:', dataStatus.data_completeness.prices.toFixed(2) + '%');
        console.log('  - Completitud volatilidad:', dataStatus.data_completeness.volatility.toFixed(2) + '%');
        console.log('  - Completitud lunar:', dataStatus.data_completeness.lunar.toFixed(2) + '%');
        
        console.log('\n🌟 ESTADÍSTICAS DEL UNIVERSO:');
        const universeStats = connector.getUniverseStats();
        console.log('  - Total símbolos:', universeStats.total);
        console.log('  - Ready for trading:', universeStats.readyForTrading ? '✅ SÍ' : '❌ NO');
        console.log('  - Distribución:', JSON.stringify(universeStats.categories, null, 4));
        
        console.log('\n🏁 DIAGNÓSTICO FINAL:');
        const success = connector.allSymbols.length > 0 && connector.isConnected;
        console.log('  🎯 ESTADO: ', success ? '✅ SISTEMA COMPLETAMENTE OPERATIVO' : '❌ FALLOS DETECTADOS');
        
        // Prueba adicional: verificar algunos símbolos específicos
        console.log('\n🔍 VERIFICACIÓN DE SÍMBOLOS ESPECÍFICOS:');
        const testSymbols = ['BTCUSDT', 'ETHUSDT', 'DOGEUSDT'];
        for (const symbol of testSymbols) {
            const included = connector.allSymbols.includes(symbol);
            console.log(`  - ${symbol}: ${included ? '✅ Incluido' : '❌ No encontrado'}`);
        }
        
        return success;
        
    } catch (error) {
        console.error('❌ ERROR EN INICIALIZACIÓN:', error.message);
        console.error('Stack completo:', error.stack);
        return false;
    }
}

// Ejecutar la prueba
testFullInitialization().then(success => {
    console.log('\n' + '='.repeat(70));
    console.log('🏁 RESULTADO FINAL:', success ? '✅ ÉXITO TOTAL' : '❌ FALLOS DETECTADOS');
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('❌ ERROR FATAL:', error.message);
    process.exit(1);
});
