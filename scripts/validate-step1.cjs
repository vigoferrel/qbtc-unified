/*
  SCRIPT DE VALIDACIÓN - STEP 1
  Copyright © 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES
  
  Valida que todas las implementaciones del Step 1 funcionen correctamente
  Ejecutar: node scripts/validate-step1.js
*/

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                   VALIDACIÓN STEP 1                         ║
║           ANÁLISIS Y PRECISIÓN DE SÍMBOLOS                  ║
╚══════════════════════════════════════════════════════════════╝
`);

async function validateStep1() {
    let validationResults = {
        symbolsFetcher: false,
        quantumCache: false,
        marketMaker: false,
        developmentSymbols: false,
        capacityLimits: false
    };

    try {
        console.log('\n[VALIDACIÓN] 🔍 Iniciando validaciones...\n');

        // 1. VALIDAR BINANCE SYMBOLS FETCHER
        try {
            console.log('[1/5] Validando BinanceSymbolsFetcher...');
            const BinanceSymbolsFetcher = require('./binance-symbols-fetcher.js');
            const fetcher = new BinanceSymbolsFetcher();
            
            // Verificar que tiene métodos requeridos
            if (typeof fetcher.generateDevelopmentSymbols === 'function' &&
                typeof fetcher.analyzeQuantumPotential === 'function') {
                validationResults.symbolsFetcher = true;
                console.log('   ✅ BinanceSymbolsFetcher: OK');
            } else {
                console.log('   ❌ BinanceSymbolsFetcher: Faltan métodos');
            }
        } catch (error) {
            console.log('   ❌ BinanceSymbolsFetcher:', error.message);
        }

        // 2. VALIDAR QUANTUM INFINITE CACHE
        try {
            console.log('[2/5] Validando QuantumInfiniteCache...');
            const QuantumInfiniteCache = require('../quantum-core/QuantumInfiniteCache.js');
            const cache = new QuantumInfiniteCache();
            
            // Verificar configuración expandida
            if (cache.config.maxSymbols === 1979 &&
                cache.config.maxSymbolsProduction === 1979 &&
                cache.config.maxSymbolsDevelopment === 40 &&
                typeof cache.checkCapacityLimits === 'function' &&
                typeof cache.preloadMassiveSymbolList === 'function') {
                validationResults.quantumCache = true;
                console.log('   ✅ QuantumInfiniteCache: OK - Capacidad 1,979 símbolos');
            } else {
                console.log('   ❌ QuantumInfiniteCache: Configuración incorrecta');
            }
        } catch (error) {
            console.log('   ❌ QuantumInfiniteCache:', error.message);
        }

        // 3. VALIDAR QUANTUM MARKET MAKER
        try {
            console.log('[3/5] Validando QuantumMarketMaker...');
            
            // Configurar entorno de desarrollo para evitar llamadas API
            process.env.DEVELOPMENT_MODE = 'true';
            process.env.SKIP_API_VALIDATION = 'true';
            
            const { QuantumMarketMaker } = require('../quantum-core/QuantumMarketMaker.js');
            
            // Crear instancia sin inicialización automática
            const marketMaker = Object.create(QuantumMarketMaker.prototype);
            marketMaker.allBinanceSymbols = new Set();
            marketMaker.symbolsMetrics = new Map();
            
            // Verificar métodos de filtrado
            if (typeof marketMaker.filterSymbolsByQuantumPotential === 'function' &&
                typeof marketMaker.filterSymbolsByCategories === 'function' &&
                typeof marketMaker.getOptimizedSymbolsForEnvironment === 'function') {
                validationResults.marketMaker = true;
                console.log('   ✅ QuantumMarketMaker: OK - Filtros avanzados disponibles');
            } else {
                console.log('   ❌ QuantumMarketMaker: Faltan métodos de filtrado');
            }
        } catch (error) {
            console.log('   ❌ QuantumMarketMaker:', error.message);
        }

        // 4. VALIDAR LISTA DE 40 SÍMBOLOS DE DESARROLLO
        try {
            console.log('[4/5] Validando lista de desarrollo...');
            const BinanceSymbolsFetcher = require('./binance-symbols-fetcher.js');
            const fetcher = new BinanceSymbolsFetcher();
            
            const devSymbols = fetcher.generateDevelopmentSymbols();
            
            if (Array.isArray(devSymbols) && devSymbols.length === 40) {
                // Verificar categorías requeridas
                const hasAllCategories = ['BTCUSDT', 'DOGEUSDT', 'ORDIUSDT', 'APTUSDT']
                    .every(symbol => devSymbols.includes(symbol));
                    
                if (hasAllCategories) {
                    validationResults.developmentSymbols = true;
                    console.log('   ✅ Símbolos de desarrollo: OK - 40 símbolos, todas las categorías');
                } else {
                    console.log('   ❌ Símbolos de desarrollo: Faltan categorías requeridas');
                }
            } else {
                console.log('   ❌ Símbolos de desarrollo: Cantidad incorrecta');
            }
        } catch (error) {
            console.log('   ❌ Símbolos de desarrollo:', error.message);
        }

        // 5. VALIDAR LÍMITES DE CAPACIDAD
        try {
            console.log('[5/5] Validando límites de capacidad...');
            const QuantumInfiniteCache = require('../quantum-core/QuantumInfiniteCache.js');
            const cache = new QuantumInfiniteCache();
            
            const capacityLimits = cache.checkCapacityLimits();
            const maxForEnv = cache.getMaxSymbolsForEnvironment();
            
            if (capacityLimits && 
                typeof capacityLimits.maximum === 'number' &&
                (maxForEnv === 40 || maxForEnv === 1979)) {
                validationResults.capacityLimits = true;
                console.log(`   ✅ Límites de capacidad: OK - Máximo ${maxForEnv} para entorno actual`);
            } else {
                console.log('   ❌ Límites de capacidad: Configuración incorrecta');
            }
        } catch (error) {
            console.log('   ❌ Límites de capacidad:', error.message);
        }

        // GENERAR REPORTE FINAL
        console.log('\n' + '='.repeat(60));
        console.log('                    REPORTE FINAL                    ');
        console.log('='.repeat(60));
        
        const validationCount = Object.values(validationResults).filter(v => v).length;
        const totalValidations = Object.keys(validationResults).length;
        
        for (const [test, result] of Object.entries(validationResults)) {
            const status = result ? '✅ PASS' : '❌ FAIL';
            const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            console.log(`${testName.padEnd(25)} ${status}`);
        }
        
        console.log('\n' + '-'.repeat(60));
        console.log(`RESULTADO: ${validationCount}/${totalValidations} validaciones exitosas`);
        
        if (validationCount === totalValidations) {
            console.log(`
╔══════════════════════════════════════════════════════════════╗
║                     STEP 1 VALIDADO                         ║
║                                                              ║
║  🎉 TODAS LAS VALIDACIONES EXITOSAS                         ║
║                                                              ║
║  ✅ BinanceSymbolsFetcher configurado                       ║
║  ✅ QuantumInfiniteCache expandido (1,979 símbolos)         ║
║  ✅ QuantumMarketMaker optimizado                           ║
║  ✅ Lista de 40 símbolos de desarrollo                      ║
║  ✅ Límites de capacidad configurados                       ║
║                                                              ║
║             LISTO PARA SIGUIENTE STEP                       ║
╚══════════════════════════════════════════════════════════════╝
            `);
            
            process.exit(0);
        } else {
            console.log(`
╔══════════════════════════════════════════════════════════════╗
║                  VALIDACIONES FALLIDAS                      ║
║                                                              ║
║  ⚠️  ${totalValidations - validationCount} validacion(es) fallaron                           ║
║                                                              ║
║  Por favor revisa los errores anteriores                    ║
║  y corrige las implementaciones faltantes                   ║
╚══════════════════════════════════════════════════════════════╝
            `);
            
            process.exit(1);
        }
        
    } catch (error) {
        console.error('\n❌ Error durante la validación:', error.message);
        process.exit(1);
    }
}

// Ejecutar validaciones
validateStep1().catch(error => {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
});
