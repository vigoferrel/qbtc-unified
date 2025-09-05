#!/usr/bin/env node

const axios = require('axios');

async function testQuantumRoutes() {
    const baseUrl = 'http://localhost:18022';
    
    console.log('🧪 Probando rutas cuánticas del servidor Leonardo...\n');
    
    // Test 1: Health Check
    try {
        console.log('1. 🏥 Probando health check...');
        const healthResponse = await axios.get(`${baseUrl}/unified/health`, { timeout: 5000 });
        console.log('✅ Health Check OK');
        console.log('📊 Status:', healthResponse.data.status);
        console.log('🌊 Consciencia:', healthResponse.data.metrics?.consciousness);
        console.log('🔮 Coherencia:', healthResponse.data.metrics?.coherence);
        console.log('🚀 Uptime:', Math.round(healthResponse.data.uptime), 'segundos\n');
    } catch (error) {
        console.log('❌ Health Check falló:', error.message, '\n');
    }
    
    // Test 2: Quantum Metrics
    try {
        console.log('2. 📈 Probando métricas cuánticas...');
        const metricsResponse = await axios.get(`${baseUrl}/quantum/metrics`, { timeout: 5000 });
        console.log('✅ Métricas cuánticas OK');
        console.log('🧠 Estado de consciencia:', metricsResponse.data.consciousness.status);
        console.log('⚡ Estado de coherencia:', metricsResponse.data.coherence.status);
        console.log('📱 Clientes streaming:', metricsResponse.data.streaming?.active_clients);
        console.log('💿 Cache entries:', metricsResponse.data.cache?.entries, '\n');
    } catch (error) {
        console.log('❌ Métricas cuánticas fallaron:', error.message, '\n');
    }
    
    // Test 3: System Status
    try {
        console.log('3. ⚙️ Probando estado del sistema...');
        const statusResponse = await axios.get(`${baseUrl}/system/status`, { timeout: 5000 });
        console.log('✅ Estado del sistema OK');
        console.log('🎯 Status:', statusResponse.data.status);
        console.log('🌀 Nivel consciencia:', statusResponse.data.consciousness_level);
        console.log('🌊 Nivel coherencia:', statusResponse.data.coherence_level);
        console.log('🔧 Componentes registrados:', statusResponse.data.components, '\n');
    } catch (error) {
        console.log('❌ Estado del sistema falló:', error.message, '\n');
    }
    
    // Test 4: Quantum Stream (SSE)
    try {
        console.log('4. 📡 Probando quantum stream (verificando headers)...');
        const streamResponse = await axios.get(`${baseUrl}/quantum/stream`, { 
            timeout: 2000,
            responseType: 'stream',
            validateStatus: () => true  // Accept any status
        });
        
        if (streamResponse.status === 200) {
            console.log('✅ Quantum stream endpoint disponible');
            console.log('📺 Content-Type:', streamResponse.headers['content-type']);
            console.log('🔄 Connection:', streamResponse.headers['connection']);
        } else {
            console.log('⚠️ Quantum stream devuelve status:', streamResponse.status);
        }
        console.log('');
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.log('✅ Quantum stream timeout (normal para SSE)\n');
        } else {
            console.log('❌ Quantum stream falló:', error.message, '\n');
        }
    }
    
    // Test 5: Error handling
    try {
        console.log('5. ❌ Probando manejo de errores (ruta inexistente)...');
        await axios.get(`${baseUrl}/ruta/inexistente`, { timeout: 5000 });
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.log('✅ Manejo de errores OK (404 para ruta inexistente)\n');
        } else {
            console.log('⚠️ Error inesperado:', error.message, '\n');
        }
    }
    
    console.log('🎉 Pruebas de rutas cuánticas completadas!');
}

// Verificar si el módulo axios está disponible
if (require.resolve('axios')) {
    testQuantumRoutes().catch(error => {
        console.error('❌ Error general en las pruebas:', error.message);
    });
} else {
    console.log('❌ El módulo axios no está instalado. Ejecuta: npm install axios');
}
