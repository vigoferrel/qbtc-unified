const { unifiedServer } = require('./UnifiedHttpServer');
const { logger } = require('./config/monitoring');

async function startServer() {
    try {
        // Inicializar el servidor
        await unifiedServer.initialize();
        
        // Iniciar el servidor
        await unifiedServer.start();
        
        logger.info('✅ Servidor unificado iniciado exitosamente');
    } catch (error) {
        logger.error('❌ Error iniciando servidor:', error.message);
        process.exit(1);
    }
}

// Iniciar el servidor
startServer();
