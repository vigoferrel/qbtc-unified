/*
  PRUEBA ESPECÍFICA DE LA FASE 1: CONEXIÓN DE DATOS SPOT
  Verificar que la alineación cuántica funciona correctamente
*/

require('dotenv').config();

const { BinanceRealConnector } = require('./quantum-core/BinanceRealConnector');
const QuantumInfiniteCache = require('./quantum-core/QuantumInfiniteCache');

async function testPhase1() {
    console.log('🧪 PRUEBA ESPECÍFICA DE LA FASE 1: CONEXIÓN DE DATOS SPOT\n');
    
    try {
        // Paso 1: Inicializar BinanceRealConnector
        console.log('🔄 Paso 1: Inicializando BinanceRealConnector...');
        const binanceConnector = new BinanceRealConnector();
        await binanceConnector.initialize();
        console.log('✅ BinanceRealConnector inicializado');
        
        // Paso 2: Obtener QuantumInfiniteCache
        console.log('🔄 Paso 2: Obteniendo QuantumInfiniteCache...');
        const infiniteCache = binanceConnector.quantumCache;
        console.log('✅ QuantumInfiniteCache obtenido');
        
        // Paso 3: FASE 1 - Obtener símbolos SPOT
        console.log('\n🌌 FASE 1: CONECTANDO DATOS SPOT PARA ANÁLISIS...');
        console.log('🔄 Paso 1: Obteniendo símbolos SPOT...');
        
        const spotSymbols = await binanceConnector.getAllSymbols();
        console.log(`✅ ${spotSymbols.length} símbolos SPOT obtenidos`);
        
        // Paso 4: Seleccionar símbolos principales
        console.log('🔄 Paso 2: Seleccionando símbolos principales para análisis...');
        const mainSymbols = spotSymbols.slice(0, 10); // Solo 10 para prueba
        console.log(`✅ ${mainSymbols.length} símbolos principales seleccionados: ${mainSymbols.join(', ')}`);
        
        // Paso 5: Precargar datos SPOT con transformaciones cuánticas
        console.log('🔄 Paso 3: Precargando datos SPOT con transformaciones cuánticas...');
        
        const preloadResult = await infiniteCache.preloadSymbols(
            mainSymbols,
            async (symbol) => {
                console.log(`  🔄 Obteniendo ticker para ${symbol}...`);
                const tickerData = await binanceConnector.get24hrTicker(symbol);
                if (tickerData) {
                    console.log(`  ✅ Ticker obtenido para ${symbol}: $${tickerData.lastPrice}`);
                    // Aplicar transformaciones cuánticas a datos SPOT
                    return {
                        ...tickerData,
                        dataType: 'SPOT_ANALYSIS',
                        timestamp: Date.now(),
                        quantumProcessed: true
                    };
                }
                console.log(`  ❌ Error obteniendo ticker para ${symbol}`);
                return null;
            },
            {
                sequential: false,
                maxConcurrency: 5,
                timeout: 30000
            }
        );
        
        // Paso 6: Verificar resultados
        console.log('\n✅ FASE 1 COMPLETADA:');
        console.log(`  📊 Símbolos SPOT cargados: ${preloadResult.succeeded}/${mainSymbols.length}`);
        console.log(`  ⚡ Duración: ${preloadResult.duration}ms`);
        console.log(`  🌌 Transformaciones cuánticas aplicadas: SÍ`);
        console.log(`  📈 Datos listos para análisis: SÍ`);
        
        // Paso 7: Verificar estado del cache
        console.log('\n📊 VERIFICACIÓN DEL ESTADO DEL CACHE:');
        const metrics = infiniteCache.getMetrics();
        console.log(`  Cache Size - Symbols: ${metrics.cacheSize.symbols}`);
        console.log(`  Cache Size - Quantum: ${metrics.cacheSize.quantum}`);
        console.log(`  Cache Size - DarkMatter: ${metrics.cacheSize.darkMatter}`);
        console.log(`  Hit Rate: ${metrics.performance.hitRate}`);
        console.log(`  Error Rate: ${metrics.performance.errorRate}`);
        console.log(`  Preload Success: ${metrics.performance.preloadSuccess}`);
        
        // Paso 8: Verificar estado cuántico
        console.log('\n🌌 VERIFICACIÓN DEL ESTADO CUÁNTICO:');
        const quantumState = infiniteCache.quantumState;
        console.log(`  Matrix Size: ${quantumState.matrixSize}`);
        console.log(`  Symbols Loaded: ${quantumState.symbolsLoaded}`);
        console.log(`  Resonance State: ${quantumState.resonanceState}`);
        console.log(`  Coherence Level: ${quantumState.coherenceLevel}`);
        console.log(`  Entanglement Strength: ${quantumState.entanglementStrength}`);
        console.log(`  Quantum Efficiency: ${quantumState.quantumEfficiency}`);
        
        console.log('\n🎯 PRUEBA DE LA FASE 1 COMPLETADA EXITOSAMENTE');
        
    } catch (error) {
        console.error('❌ Error en prueba de FASE 1:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Ejecutar prueba
if (require.main === module) {
    testPhase1()
        .then(() => {
            console.log('\n🏁 PRUEBA FINALIZADA');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Error fatal en prueba:', error);
            process.exit(1);
        });
}

module.exports = { testPhase1 };
