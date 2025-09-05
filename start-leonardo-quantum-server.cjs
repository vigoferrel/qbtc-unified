#!/usr/bin/env node

// ================================================================
// 🚀 LEONARDO QUANTUM SERVER LAUNCHER
// Inicia el servidor cuántico Leonardo con streaming SSE
// ================================================================

const { LeonardoQuantumServer } = require('./leonardo-consciousness/LeonardoQuantumServer');

// Configuración del servidor
const config = {
    host: '0.0.0.0',  // Escuchar en todas las interfaces
    port: 3003,       // Puerto para Leonardo Consciousness
    autoStart: true,  // Iniciar automáticamente el sistema cuántico
    debug: true       // Modo debug activado
};

async function startLeonardoQuantumServer() {
    try {
        console.log('🌟 Iniciando Leonardo Quantum Server...');
        console.log(`🔗 Host: ${config.host}`);
        console.log(`🔗 Puerto: ${config.port}`);
        
        // Crear y inicializar el servidor
        const server = new LeonardoQuantumServer(config);
        
        // Inicializar el servidor
        await server.initialize();
        
        // Iniciar el servidor
        await server.start();
        
        console.log('\n✅ Leonardo Quantum Server iniciado exitosamente!');
        console.log(`📡 Frontend URL: http://localhost:8080`);
        console.log(`🌊 Stream endpoint: http://localhost:${config.port}/api/stream`);
        console.log(`📊 Health check: http://localhost:${config.port}/health`);
        
        // Manejar cierre graceful
        process.on('SIGINT', async () => {
            console.log('\n🛑 Cerrando Leonardo Quantum Server...');
            await server.stop();
            process.exit(0);
        });
        
        process.on('SIGTERM', async () => {
            console.log('\n🛑 Cerrando Leonardo Quantum Server...');
            await server.stop();
            process.exit(0);
        });
        
    } catch (error) {
        console.error('❌ Error al iniciar Leonardo Quantum Server:', error);
        process.exit(1);
    }
}

// Iniciar el servidor
startLeonardoQuantumServer();
