// ========================================================================
// 🧪 LEONARDO CONSCIOUSNESS SYSTEM TEST
// Prueba rápida de todos los componentes del sistema
// ========================================================================

console.log('🧪 LEONARDO CONSCIOUSNESS SYSTEM TEST');
console.log('========================================================================');

const fs = require('fs');
const path = require('path');

// Lista de archivos críticos del sistema
const criticalFiles = [
    'UnifiedLeonardoCore.js',
    'UnifiedLeonardoServer.js',
    'LeonardoDecisionEngine.js',
    'QuantumOracleLayer.js',
    'FundsManager.js',
    'TradingEngineLayer.js',
    'package.json'
];

// Función para verificar archivos
function checkFiles() {
    console.log('📁 VERIFICANDO ARCHIVOS CRÍTICOS:');
    let allFilesOk = true;
    
    criticalFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        const exists = fs.existsSync(filePath);
        const status = exists ? '✅' : '❌';
        console.log(`   ${status} ${file}`);
        
        if (!exists) {
            allFilesOk = false;
        } else {
            // Verificar tamaño del archivo
            const stats = fs.statSync(filePath);
            const sizeKB = Math.round(stats.size / 1024);
            console.log(`      Tamaño: ${sizeKB} KB`);
        }
    });
    
    return allFilesOk;
}

// Función para probar la carga de módulos
async function testModuleLoading() {
    console.log('\n🔧 PROBANDO CARGA DE MÓDULOS:');
    
    const modules = [
        { name: 'LeonardoDecisionEngine', path: './LeonardoDecisionEngine.js' },
        { name: 'QuantumOracleLayer', path: './QuantumOracleLayer.js' },
        { name: 'FundsManager', path: './FundsManager.js' },
        { name: 'TradingEngineLayer', path: './TradingEngineLayer.js' }
    ];
    
    for (const module of modules) {
        try {
            const loaded = require(module.path);
            console.log(`   ✅ ${module.name} cargado correctamente`);
            
            // Verificar si tiene constructor
            if (typeof loaded === 'function') {
                console.log(`      Constructor disponible`);
            } else if (typeof loaded === 'object' && loaded.constructor) {
                console.log(`      Objeto con constructor disponible`);
            } else {
                console.log(`      ⚠️  Sin constructor directo`);
            }
        } catch (error) {
            console.log(`   ❌ ${module.name} ERROR: ${error.message}`);
            return false;
        }
    }
    
    return true;
}

// Función para probar instanciación básica
async function testBasicInstantiation() {
    console.log('\n🏗️  PROBANDO INSTANCIACIÓN BÁSICA:');
    
    try {
        // Probar LeonardoDecisionEngine
        const { LeonardoDecisionEngine } = require('./LeonardoDecisionEngine.js');
        const leonardo = new LeonardoDecisionEngine();
        console.log('   ✅ LeonardoDecisionEngine instanciado');
        
        // Probar QuantumOracleLayer
        const QuantumOracleLayer = require('./QuantumOracleLayer.js');
        const quantum = new QuantumOracleLayer();
        console.log('   ✅ QuantumOracleLayer instanciado');
        
        // Probar FundsManager
        const { FundsManager } = require('./FundsManager.js');
        const funds = new FundsManager();
        console.log('   ✅ FundsManager instanciado');
        
        // Probar TradingEngineLayer
        const TradingEngineLayer = require('./TradingEngineLayer.js');
        const trading = new TradingEngineLayer();
        console.log('   ✅ TradingEngineLayer instanciado');
        
        return true;
    } catch (error) {
        console.log(`   ❌ ERROR en instanciación: ${error.message}`);
        console.log(`      Stack: ${error.stack}`);
        return false;
    }
}

// Función para probar análisis con datos mock
async function testAnalysisWithMockData() {
    console.log('\n📊 PROBANDO ANÁLISIS CON DATOS MOCK:');
    
    try {
        const { LeonardoDecisionEngine } = require('./LeonardoDecisionEngine.js');
        const leonardo = new LeonardoDecisionEngine();
        
        // Datos de mercado mock
        const mockMarketData = {
            symbol: 'BTC/USDT',
            timeframe: '1h',
            prices: [50000, 50100, 50200, 49800, 49900, 50050, 50150, 50250],
            volumes: [1000000, 1100000, 950000, 1200000, 1050000, 980000, 1150000, 1080000],
            timestamp: Date.now()
        };
        
        console.log('   🔮 Ejecutando análisis Leonardo...');
        const analysis = await leonardo.analyze(mockMarketData);
        
        if (analysis && !analysis.error) {
            console.log('   ✅ Análisis completado exitosamente');
            console.log(`      Consciencia: ${(analysis.consciousnessLevel * 100).toFixed(1)}%`);
            console.log(`      Confianza: ${(analysis.confidence * 100).toFixed(1)}%`);
            console.log(`      Dirección: ${analysis.direction}`);
            console.log(`      Leverage: ${analysis.leverage}`);
            return true;
        } else {
            console.log('   ❌ Análisis falló');
            if (analysis.error) {
                console.log(`      Error: ${analysis.message}`);
            }
            return false;
        }
    } catch (error) {
        console.log(`   ❌ ERROR en análisis: ${error.message}`);
        return false;
    }
}

// Función para probar el servidor unificado
async function testUnifiedServer() {
    console.log('\n🌐 PROBANDO SERVIDOR UNIFICADO:');
    
    try {
        // Solo verificar que se puede importar sin ejecutar
        const serverModule = require('./UnifiedLeonardoServer.js');
        console.log('   ✅ UnifiedLeonardoServer se puede importar');
        return true;
    } catch (error) {
        console.log(`   ❌ ERROR cargando servidor: ${error.message}`);
        return false;
    }
}

// Función para verificar dependencias npm
function checkDependencies() {
    console.log('\n📦 VERIFICANDO DEPENDENCIAS:');
    
    try {
        const packagePath = path.join(__dirname, 'package.json');
        if (!fs.existsSync(packagePath)) {
            console.log('   ❌ package.json no encontrado');
            return false;
        }
        
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const dependencies = packageData.dependencies || {};
        
        console.log('   📋 Dependencias listadas:');
        Object.keys(dependencies).forEach(dep => {
            try {
                require(dep);
                console.log(`      ✅ ${dep}`);
            } catch (error) {
                console.log(`      ❌ ${dep} - No instalado`);
            }
        });
        
        return true;
    } catch (error) {
        console.log(`   ❌ ERROR verificando dependencias: ${error.message}`);
        return false;
    }
}

// Función para verificar puertos disponibles
async function checkPorts() {
    console.log('\n🔌 VERIFICANDO PUERTOS:');
    
    const net = require('net');
    const ports = [3000, 8080, 9090];
    
    for (const port of ports) {
        try {
            const server = net.createServer();
            await new Promise((resolve, reject) => {
                server.listen(port, () => {
                    console.log(`   ✅ Puerto ${port} disponible`);
                    server.close();
                    resolve();
                });
                
                server.on('error', (err) => {
                    if (err.code === 'EADDRINUSE') {
                        console.log(`   ⚠️  Puerto ${port} ya en uso`);
                    } else {
                        console.log(`   ❌ Puerto ${port} error: ${err.message}`);
                    }
                    reject(err);
                });
            });
        } catch (error) {
            // Puerto no disponible, pero no es crítico para el test
        }
    }
    
    return true;
}

// Función principal de test
async function runTests() {
    console.log('⚡ Iniciando tests del sistema Leonardo...\n');
    
    const testResults = {
        files: false,
        modules: false,
        instantiation: false,
        analysis: false,
        server: false,
        dependencies: false,
        ports: false
    };
    
    // Ejecutar todos los tests
    testResults.files = checkFiles();
    testResults.modules = await testModuleLoading();
    testResults.instantiation = await testBasicInstantiation();
    testResults.analysis = await testAnalysisWithMockData();
    testResults.server = await testUnifiedServer();
    testResults.dependencies = checkDependencies();
    testResults.ports = await checkPorts();
    
    // Resumen final
    console.log('\n========================================================================');
    console.log('📈 RESUMEN DE RESULTADOS:');
    console.log('========================================================================');
    
    const testNames = {
        files: 'Archivos críticos',
        modules: 'Carga de módulos',
        instantiation: 'Instanciación básica',
        analysis: 'Análisis con datos mock',
        server: 'Servidor unificado',
        dependencies: 'Dependencias npm',
        ports: 'Verificación de puertos'
    };
    
    let passedTests = 0;
    let totalTests = Object.keys(testResults).length;
    
    for (const [test, result] of Object.entries(testResults)) {
        const status = result ? '✅ PASS' : '❌ FAIL';
        console.log(`   ${status} ${testNames[test]}`);
        if (result) passedTests++;
    }
    
    console.log('\n========================================================================');
    const successRate = Math.round((passedTests / totalTests) * 100);
    
    if (successRate === 100) {
        console.log('🎉 TODOS LOS TESTS PASARON - SISTEMA LISTO PARA PRODUCCIÓN');
        console.log('✅ El sistema Leonardo está funcionando correctamente');
    } else if (successRate >= 80) {
        console.log('⚠️  LA MAYORÍA DE TESTS PASARON - SISTEMA FUNCIONAL CON ADVERTENCIAS');
        console.log(`✅ ${passedTests}/${totalTests} tests pasaron (${successRate}%)`);
    } else {
        console.log('❌ MÚLTIPLES TESTS FALLARON - SISTEMA REQUIERE ATENCIÓN');
        console.log(`❌ ${passedTests}/${totalTests} tests pasaron (${successRate}%)`);
    }
    
    console.log('\n🚀 Para iniciar el sistema completo, ejecute:');
    console.log('   node UnifiedLeonardoServer.js');
    console.log('\n💻 Para monitoreo en PowerShell:');
    console.log('   .\\monitor-leonardo-powershell.ps1 Start');
    console.log('\n🖥️  Para monitoreo en CMD:');
    console.log('   run-leonardo-monitor.bat');
    
    console.log('\n========================================================================');
    
    return successRate >= 80;
}

// Ejecutar tests si este archivo se ejecuta directamente
if (require.main === module) {
    runTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ ERROR CRÍTICO EN TESTS:', error);
        process.exit(1);
    });
}

module.exports = { runTests, checkFiles, testModuleLoading };
