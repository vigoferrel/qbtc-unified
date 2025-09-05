const fs = require('fs');
const path = require('path');

console.log('🔧 ARREGLANDO MÉTRICAS CERO - QBTC-UNIFIED');
console.log('============================================');

// 1. Verificar y arreglar el método get24hrTicker
console.log('\n🔧 1. ARREGLANDO MÉTODO get24hrTicker...');
try {
    const connectorPath = path.join(__dirname, 'quantum-core', 'BinanceRealConnector.js');
    let connectorContent = fs.readFileSync(connectorPath, 'utf8');
    
    // Verificar si el método get24hrTicker existe
    if (!connectorContent.includes('async get24hrTicker(')) {
        console.log('   ❌ Método get24hrTicker no encontrado, agregando...');
        
        // Buscar el lugar para insertar el método
        const insertPoint = connectorContent.lastIndexOf('    }');
        if (insertPoint !== -1) {
            const newMethod = `
    // Método para obtener ticker de 24 horas
    async get24hrTicker(symbol) {
        try {
            const endpoint = '/fapi/v1/ticker/24hr';
            const params = symbol ? { symbol: symbol } : {};
            
            const response = await axios.get(\`\${this.baseURL}\${endpoint}\`, {
                params: params,
                timeout: 10000
            });

            if (response.data) {
                return response.data;
            } else {
                throw new Error('No data received from Binance');
            }
        } catch (error) {
            console.error(\`[BINANCE REAL] ❌ Error obteniendo 24hr ticker para \${symbol}:\`, error.message);
            throw error;
        }
    }
`;

            const newContent = connectorContent.substring(0, insertPoint) + newMethod + connectorContent.substring(insertPoint);
            fs.writeFileSync(connectorPath, newContent, 'utf8');
            console.log('   ✅ Método get24hrTicker agregado correctamente');
        } else {
            console.log('   ❌ No se pudo encontrar punto de inserción');
        }
    } else {
        console.log('   ✅ Método get24hrTicker ya existe');
    }
} catch (error) {
    console.log(`   ❌ Error arreglando get24hrTicker: ${error.message}`);
}

// 2. Verificar y arreglar la inicialización de quantumCache en system-integrator
console.log('\n🔧 2. ARREGLANDO INICIALIZACIÓN DE QUANTUM CACHE...');
try {
    const integratorPath = path.join(__dirname, 'system-integrator.js');
    let integratorContent = fs.readFileSync(integratorPath, 'utf8');
    
    // Verificar si quantumCache se inicializa
    if (!integratorContent.includes('this.components.quantumCache')) {
        console.log('   ❌ Inicialización de quantumCache no encontrada, agregando...');
        
        // Buscar la sección de inicialización de componentes
        const initPattern = /initializeQuantumCore\(\)\s*\{[\s\S]*?this\.components\s*=\s*\{/;
        const match = integratorContent.match(initPattern);
        
        if (match) {
            const quantumCacheInit = `
        // Inicializar Quantum Infinite Cache
        this.components.quantumCache = new (require('./quantum-core/QuantumInfiniteCache'))();
        console.log('✅ Quantum Infinite Cache inicializado');
`;
            
            const newContent = integratorContent.replace(
                /this\.components\s*=\s*\{/,
                `this.components = {${quantumCacheInit}`
            );
            
            fs.writeFileSync(integratorPath, newContent, 'utf8');
            console.log('   ✅ Inicialización de quantumCache agregada');
        } else {
            console.log('   ❌ No se pudo encontrar sección de inicialización');
        }
    } else {
        console.log('   ✅ Inicialización de quantumCache ya existe');
    }
} catch (error) {
    console.log(`   ❌ Error arreglando quantumCache: ${error.message}`);
}

// 3. Verificar y arreglar la inicialización de binanceRealConnector
console.log('\n🔧 3. ARREGLANDO INICIALIZACIÓN DE BINANCE REAL CONNECTOR...');
try {
    const integratorPath = path.join(__dirname, 'system-integrator.js');
    let integratorContent = fs.readFileSync(integratorPath, 'utf8');
    
    // Verificar si binanceRealConnector se inicializa
    if (!integratorContent.includes('this.components.binanceRealConnector')) {
        console.log('   ❌ Inicialización de binanceRealConnector no encontrada, agregando...');
        
        // Buscar después de marketMaker
        const marketMakerPattern = /this\.components\.marketMaker\s*=\s*new[\s\S]*?console\.log\('✅ Market Maker inicializado'\);/;
        const match = integratorContent.match(marketMakerPattern);
        
        if (match) {
            const binanceInit = `
        // Inicializar Binance Real Connector
        this.components.binanceRealConnector = new (require('./quantum-core/BinanceRealConnector'))();
        await this.components.binanceRealConnector.initialize();
        console.log('✅ Binance Real Connector inicializado');
`;
            
            const newContent = integratorContent.replace(
                /console\.log\('✅ Market Maker inicializado'\);/,
                `console.log('✅ Market Maker inicializado');${binanceInit}`
            );
            
            fs.writeFileSync(integratorPath, newContent, 'utf8');
            console.log('   ✅ Inicialización de binanceRealConnector agregada');
        } else {
            console.log('   ❌ No se pudo encontrar sección de marketMaker');
        }
    } else {
        console.log('   ✅ Inicialización de binanceRealConnector ya existe');
    }
} catch (error) {
    console.log(`   ❌ Error arreglando binanceRealConnector: ${error.message}`);
}

// 4. Verificar y arreglar el método updateQuantumState
console.log('\n🔧 4. ARREGLANDO MÉTODO updateQuantumState...');
try {
    const cachePath = path.join(__dirname, 'quantum-core', 'QuantumInfiniteCache.js');
    let cacheContent = fs.readFileSync(cachePath, 'utf8');
    
    // Verificar si el método updateQuantumState actualiza correctamente las métricas
    if (!cacheContent.includes('this.quantumState.coherenceLevel')) {
        console.log('   ❌ Método updateQuantumState no actualiza coherenceLevel, arreglando...');
        
        // Buscar el método updateQuantumState
        const updatePattern = /updateQuantumState\(processed\s*=\s*0,\s*succeeded\s*=\s*0\)\s*\{[\s\S]*?\}/;
        const match = cacheContent.match(updatePattern);
        
        if (match) {
            const improvedMethod = `
    updateQuantumState(processed = 0, succeeded = 0) {
        this.quantumState.symbolsLoaded += succeeded;
        this.quantumState.matrixSize = Math.ceil(Math.sqrt(this.quantumState.symbolsLoaded));
        
        // Actualizar métricas cuánticas
        if (succeeded > 0) {
            this.quantumState.coherenceLevel = Math.min(1.0, this.quantumState.symbolsLoaded / 100);
            this.quantumState.entanglementStrength = Math.min(1.0, succeeded / processed);
            this.quantumState.quantumEfficiency = this.quantumState.coherenceLevel * this.quantumState.entanglementStrength;
        }
        
        // Actualizar estado de resonancia
        const successRate = processed > 0 ? succeeded / processed : 1;
        this.quantumState.resonanceState = successRate > 0.9 
            ? 'QUANTUM_RESONANCE'
            : successRate > 0.7 
                ? 'QUANTUM_STABLE' 
                : 'QUANTUM_READY';
    }
`;
            
            const newContent = cacheContent.replace(updatePattern, improvedMethod);
            fs.writeFileSync(cachePath, newContent, 'utf8');
            console.log('   ✅ Método updateQuantumState mejorado');
        } else {
            console.log('   ❌ No se pudo encontrar método updateQuantumState');
        }
    } else {
        console.log('   ✅ Método updateQuantumState ya está correcto');
    }
} catch (error) {
    console.log(`   ❌ Error arreglando updateQuantumState: ${error.message}`);
}

// 5. Verificar y arreglar el método startMonitoring
console.log('\n🔧 5. ARREGLANDO MÉTODO startMonitoring...');
try {
    const cachePath = path.join(__dirname, 'quantum-core', 'QuantumInfiniteCache.js');
    let cacheContent = fs.readFileSync(cachePath, 'utf8');
    
    // Verificar si startMonitoring se llama en la inicialización
    if (!cacheContent.includes('this.startMonitoring()')) {
        console.log('   ❌ startMonitoring no se llama en inicialización, arreglando...');
        
        // Buscar el método initialize
        const initPattern = /async initialize\(\)\s*\{[\s\S]*?\}/;
        const match = cacheContent.match(initPattern);
        
        if (match) {
            const improvedInit = `
    // Inicialización del sistema
    async initialize() {
        console.log('[QUANTUM CACHE] 🌌 Iniciando caché cuántica infinita...');
        
        // Configurar actualizaciones periódicas
        this.setupPeriodicUpdates();
        
        // Iniciar monitoreo del sistema
        this.startMonitoring();
        
        console.log('[QUANTUM CACHE] ✨ Sistema inicializado y listo');
    }
`;
            
            const newContent = cacheContent.replace(initPattern, improvedInit);
            fs.writeFileSync(cachePath, newContent, 'utf8');
            console.log('   ✅ Inicialización mejorada con startMonitoring');
        } else {
            console.log('   ❌ No se pudo encontrar método initialize');
        }
    } else {
        console.log('   ✅ startMonitoring ya se llama en inicialización');
    }
} catch (error) {
    console.log(`   ❌ Error arreglando startMonitoring: ${error.message}`);
}

// 6. Crear script de prueba para verificar métricas
console.log('\n🔧 6. CREANDO SCRIPT DE PRUEBA DE MÉTRICAS...');
const testScript = `
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
    
    console.log(\`\\n✅ RESULTADOS:\\n   Símbolos cargados: \${hasData ? 'SÍ' : 'NO'}\\n   Coherencia: \${hasCoherence ? 'SÍ' : 'NO'}\\n   Eficiencia: \${hasEfficiency ? 'SÍ' : 'NO'}\`);
    
    if (hasData && hasCoherence && hasEfficiency) {
        console.log('🎉 ¡MÉTRICAS FUNCIONANDO CORRECTAMENTE!');
    } else {
        console.log('❌ MÉTRICAS AÚN EN CERO - REQUIERE MÁS AJUSTES');
    }
}

testMetrics().catch(console.error);
`;

fs.writeFileSync('test-metrics.js', testScript, 'utf8');
console.log('   ✅ Script de prueba creado: test-metrics.js');

console.log('\n✅ ARREGLOS COMPLETADOS');
console.log('============================================');
console.log('🚀 PRÓXIMOS PASOS:');
console.log('   1. Ejecutar: node test-metrics.js');
console.log('   2. Si las métricas funcionan, ejecutar: node system-integrator.js');
console.log('   3. Monitorear logs para verificar que las métricas se actualicen');
