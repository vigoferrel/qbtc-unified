const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO DE MÉTRICAS CERO - QBTC-UNIFIED');
console.log('================================================');

// 1. Verificar archivos clave
console.log('\n📁 1. VERIFICACIÓN DE ARCHIVOS CLAVE:');
const keyFiles = [
    'quantum-core/QuantumInfiniteCache.js',
    'quantum-core/BinanceRealConnector.js',
    'system-integrator.js',
    '.env'
];

keyFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`   ${exists ? '✅' : '❌'} ${file} ${exists ? 'EXISTE' : 'NO EXISTE'}`);
});

// 2. Verificar variables de entorno
console.log('\n🔐 2. VERIFICACIÓN DE VARIABLES DE ENTORNO:');
require('dotenv').config();

const envVars = [
    'BINANCE_API_KEY',
    'BINANCE_SECRET_KEY',
    'NODE_ENV',
    'QUANTUM_MAX_SYMBOLS'
];

envVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? 'SET' : 'MISSING';
    const display = value ? `${value.substring(0, 8)}...` : 'NO VALUE';
    console.log(`   ${value ? '✅' : '❌'} ${varName}: ${status} (${display})`);
});

// 3. Analizar QuantumInfiniteCache
console.log('\n⚛️ 3. ANÁLISIS DE QUANTUM INFINITE CACHE:');
try {
    const cachePath = path.join(__dirname, 'quantum-core', 'QuantumInfiniteCache.js');
    const cacheContent = fs.readFileSync(cachePath, 'utf8');
    
    // Buscar métodos clave
    const methods = [
        'getMetrics',
        'updateQuantumState',
        'updateMetrics',
        'startMonitoring'
    ];
    
    methods.forEach(method => {
        const found = cacheContent.includes(`${method}(`);
        console.log(`   ${found ? '✅' : '❌'} Método ${method}(): ${found ? 'ENCONTRADO' : 'NO ENCONTRADO'}`);
    });
    
    // Verificar inicialización de métricas
    const metricsInit = cacheContent.includes('this.metrics = {');
    const quantumStateInit = cacheContent.includes('this.quantumState = {');
    console.log(`   ${metricsInit ? '✅' : '❌'} Inicialización de métricas: ${metricsInit ? 'OK' : 'FALTA'}`);
    console.log(`   ${quantumStateInit ? '✅' : '❌'} Inicialización de quantumState: ${quantumStateInit ? 'OK' : 'FALTA'}`);
    
} catch (error) {
    console.log(`   ❌ Error analizando QuantumInfiniteCache: ${error.message}`);
}

// 4. Analizar BinanceRealConnector
console.log('\n🔗 4. ANÁLISIS DE BINANCE REAL CONNECTOR:');
try {
    const connectorPath = path.join(__dirname, 'quantum-core', 'BinanceRealConnector.js');
    const connectorContent = fs.readFileSync(connectorPath, 'utf8');
    
    // Verificar métodos clave
    const connectorMethods = [
        'fetchAllAvailableSymbols',
        'initializeRealTimePrices',
        'initializeWebSocketConnections',
        'get24hrTicker'
    ];
    
    connectorMethods.forEach(method => {
        const found = connectorContent.includes(`async ${method}(`);
        console.log(`   ${found ? '✅' : '❌'} Método ${method}(): ${found ? 'ENCONTRADO' : 'NO ENCONTRADO'}`);
    });
    
    // Verificar inicialización de quantumCache
    const quantumCacheInit = connectorContent.includes('this.quantumCache = new QuantumInfiniteCache()');
    console.log(`   ${quantumCacheInit ? '✅' : '❌'} Inicialización de quantumCache: ${quantumCacheInit ? 'OK' : 'FALTA'}`);
    
} catch (error) {
    console.log(`   ❌ Error analizando BinanceRealConnector: ${error.message}`);
}

// 5. Verificar system-integrator
console.log('\n⚙️ 5. ANÁLISIS DE SYSTEM INTEGRATOR:');
try {
    const integratorPath = path.join(__dirname, 'system-integrator.js');
    const integratorContent = fs.readFileSync(integratorPath, 'utf8');
    
    // Verificar inicialización de componentes
    const components = [
        'quantumCache',
        'marketMaker',
        'binanceRealConnector'
    ];
    
    components.forEach(component => {
        const found = integratorContent.includes(`this.components.${component}`);
        console.log(`   ${found ? '✅' : '❌'} Componente ${component}: ${found ? 'ENCONTRADO' : 'NO ENCONTRADO'}`);
    });
    
} catch (error) {
    console.log(`   ❌ Error analizando system-integrator: ${error.message}`);
}

// 6. Análisis de logs recientes
console.log('\n📊 6. ANÁLISIS DE PATRONES EN LOGS:');
console.log('   ℹ️  Buscando patrones de métricas en cero...');

// 7. Recomendaciones
console.log('\n💡 7. RECOMENDACIONES PARA SOLUCIONAR MÉTRICAS CERO:');
console.log('   🔧 1. Verificar que fetchAllAvailableSymbols() se ejecute correctamente');
console.log('   🔧 2. Asegurar que initializeRealTimePrices() cargue datos');
console.log('   🔧 3. Verificar que updateQuantumState() se llame con datos válidos');
console.log('   🔧 4. Comprobar que startMonitoring() esté activo');
console.log('   🔧 5. Verificar que los WebSockets estén conectados');
console.log('   🔧 6. Asegurar que las credenciales de Binance sean válidas');

// 8. Próximos pasos
console.log('\n🚀 8. PRÓXIMOS PASOS:');
console.log('   📋 1. Ejecutar: node system-integrator.js');
console.log('   📋 2. Monitorear logs de inicialización');
console.log('   📋 3. Verificar conexión a Binance');
console.log('   📋 4. Comprobar carga de símbolos');
console.log('   📋 5. Validar actualización de métricas');

console.log('\n✅ DIAGNÓSTICO COMPLETADO');
console.log('================================================');
