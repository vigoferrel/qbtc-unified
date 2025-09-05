// ========================================================================
// 🧪 TEST SCRIPT - VERIFICACIÓN DE UMBRALES LEONARDO CONSCIOUSNESS
// Prueba los umbrales ajustados para verificar que no son demasiado restrictivos
// ========================================================================

const { LeonardoDecisionEngine } = require('./LeonardoDecisionEngine');

// Crear instancia del motor Leonardo
const leonardo = new LeonardoDecisionEngine();

console.log('🧪 INICIANDO PRUEBA DE UMBRALES LEONARDO CONSCIOUSNESS...\n');

// Datos de mercado de prueba (simulando BTC-USDT)
const testMarketData = {
    symbol: 'BTCUSDT',
    timeframe: '1h',
    prices: [
        50000, 50100, 50200, 50150, 50250,
        50300, 50280, 50350, 50320, 50400,
        50380, 50450, 50430, 50500, 50520
    ],
    volumes: [
        1000000, 1100000, 1050000, 1200000, 1150000,
        1080000, 1250000, 1180000, 1300000, 1220000,
        1160000, 1350000, 1280000, 1400000, 1320000
    ]
};

// Función para probar diferentes escenarios
async function testThresholds() {
    console.log('📊 CONSTANTES LEONARDO ACTUALES:');
    console.log(`   🧠 CONSCIOUSNESS_THRESHOLD: ${leonardo.constants.CONSCIOUSNESS_THRESHOLD}`);
    console.log(`   ⚖️ ALIGNMENT_THRESHOLD: ${leonardo.constants.ALIGNMENT_THRESHOLD}`);
    console.log(`   🎯 CONFIDENCE_THRESHOLD: ${leonardo.constants.CONFIDENCE_THRESHOLD}`);
    console.log('');

    try {
        // Realizar análisis completo
        console.log('🔮 Ejecutando análisis Leonardo completo...\n');
        const analysis = await leonardo.analyze(testMarketData);
        
        console.log('📈 RESULTADOS DEL ANÁLISIS:');
        console.log(`   🧠 Consciencia: ${(analysis.consciousnessLevel * 100).toFixed(1)}%`);
        console.log(`   ⚖️ Alineación: ${(analysis.alignment * 100).toFixed(1)}%`);
        console.log(`   🎯 Confianza: ${(analysis.confidence * 100).toFixed(1)}%`);
        console.log(`   🚀 Acción recomendada: ${analysis.direction || analysis.masterType || 'N/A'}`);
        console.log(`   📊 Leverage sugerido: ${analysis.leverage?.toFixed(1) || 'N/A'}x`);
        console.log('');

        // Verificar si supera los umbrales
        const passesConsciousness = analysis.consciousnessLevel >= leonardo.constants.CONSCIOUSNESS_THRESHOLD;
        const passesAlignment = analysis.alignment >= leonardo.constants.ALIGNMENT_THRESHOLD;
        const passesConfidence = analysis.confidence >= leonardo.constants.CONFIDENCE_THRESHOLD;

        console.log('✅ VERIFICACIÓN DE UMBRALES:');
        console.log(`   🧠 Consciousness ${passesConsciousness ? '✅ SUPERADO' : '❌ NO SUPERADO'} (${(analysis.consciousnessLevel * 100).toFixed(1)}% vs ${(leonardo.constants.CONSCIOUSNESS_THRESHOLD * 100).toFixed(1)}%)`);
        console.log(`   ⚖️ Alignment ${passesAlignment ? '✅ SUPERADO' : '❌ NO SUPERADO'} (${(analysis.alignment * 100).toFixed(1)}% vs ${(leonardo.constants.ALIGNMENT_THRESHOLD * 100).toFixed(1)}%)`);
        console.log(`   🎯 Confidence ${passesConfidence ? '✅ SUPERADO' : '❌ NO SUPERADO'} (${(analysis.confidence * 100).toFixed(1)}% vs ${(leonardo.constants.CONFIDENCE_THRESHOLD * 100).toFixed(1)}%)`);
        console.log('');

        const allThresholdsPassed = passesConsciousness && passesAlignment && passesConfidence;
        
        if (allThresholdsPassed) {
            console.log('🎯 ¡TODOS LOS UMBRALES SUPERADOS! El trading puede ejecutarse.');
            console.log(`   💰 Tamaño de posición sugerido: $${analysis.positionSize?.toFixed(2) || 'N/A'}`);
            console.log(`   🎣 Carnada utilizada: $${analysis.baitAmount || leonardo.constants.BAIT_AMOUNT}`);
            console.log(`   📈 Multiplicador de profit: ${analysis.profitMultiplier?.toFixed(2) || 'N/A'}x`);
        } else {
            console.log('❌ ALGUNOS UMBRALES NO FUERON SUPERADOS. Trading bloqueado.');
            console.log('   💡 Considera ajustar más los umbrales si es necesario para testing.');
        }

        console.log('');
        console.log('🔬 DETALLES DE LOS 4 PILARES:');
        if (analysis.fourPillarsAnalysis) {
            const pillars = analysis.fourPillarsAnalysis;
            console.log(`   📡 Lambda 888: ${pillars.lambda888?.strength?.toFixed(3) || 'N/A'} | Status: ${pillars.lambda888?.status || 'N/A'}`);
            console.log(`   🔱 Prime 7919: ${pillars.prime7919?.strength?.toFixed(3) || 'N/A'} | Status: ${pillars.prime7919?.status || 'N/A'}`);
            console.log(`   🎯 Hook Wheel: ${pillars.hookWheel?.strength?.toFixed(3) || 'N/A'} | Type: ${pillars.hookWheel?.type || 'N/A'}`);
            console.log(`   🐦 Simbiosis: ${pillars.symbiosis?.strength?.toFixed(3) || 'N/A'} | State: ${pillars.symbiosis?.state || 'N/A'}`);
        } else {
            console.log('   ⚠️ No se encontraron detalles de los 4 pilares');
        }

        return allThresholdsPassed;

    } catch (error) {
        console.error('❌ Error durante el análisis:', error.message);
        return false;
    }
}

// Función para mostrar recomendaciones si los umbrales son demasiado altos
function showThresholdRecommendations(passed) {
    console.log('\n📝 RECOMENDACIONES:');
    
    if (passed) {
        console.log('✅ Los umbrales actuales (0.60) permiten la ejecución de trading.');
        console.log('   Esto es ideal para testing y desarrollo.');
        console.log('   Para producción, considera valores entre 0.65-0.75.');
    } else {
        console.log('⚠️ Los umbrales actuales aún pueden ser demasiado restrictivos.');
        console.log('   Para testing temporal, considera reducir a 0.55 o 0.50.');
        console.log('   Los valores actuales son:');
        console.log(`     CONSCIOUSNESS_THRESHOLD: 0.60 → prueba 0.55`);
        console.log(`     ALIGNMENT_THRESHOLD: 0.60 → prueba 0.55`);
        console.log(`     CONFIDENCE_THRESHOLD: 0.60 → prueba 0.55`);
    }
}

// Ejecutar la prueba
async function main() {
    const success = await testThresholds();
    showThresholdRecommendations(success);
    
    console.log('\n🎯 PRUEBA COMPLETADA');
    console.log('=' .repeat(60));
}

// Inicializar y ejecutar
main().catch(console.error);
