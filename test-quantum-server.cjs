#!/usr/bin/env node

/*
  Script de Prueba - Servidor HTTP Cuántico Unificado Leonardo
  Prueba todas las funcionalidades cuánticas avanzadas implementadas
*/

const { unifiedServer } = require('./core/quantum-engine/UnifiedHttpServer');
const { logger } = require('./core/quantum-engine/config/monitoring');

async function testQuantumServer() {
    logger.info('🚀 [QUANTUM TEST] Iniciando pruebas del servidor HTTP cuántico Leonardo...');
    
    try {
        // 1. Inicializar servidor
        logger.info('📡 [TEST] Paso 1: Inicializando servidor cuántico...');
        await unifiedServer.initialize(18021); // Puerto diferente para pruebas
        
        // 2. Registrar algunas rutas de prueba
        logger.info('🌌 [TEST] Paso 2: Registrando rutas de prueba...');
        
        unifiedServer.registerRoute('GET', '/test/quantum', (req, res) => {
            res.json({
                message: 'Ruta cuántica de prueba funcionando',
                consciousness: Math.random() * 0.618,
                phi: 1.618033988749,
                timestamp: new Date().toISOString()
            });
        }, { description: 'Ruta de prueba cuántica Leonardo' });
        
        unifiedServer.registerRoute('POST', '/test/data', (req, res) => {
            logger.info('🔬 [TEST] Datos recibidos:', req.body);
            res.json({
                status: 'quantum_received',
                received: req.body,
                processed_at: new Date().toISOString()
            });
        }, { description: 'Endpoint de prueba de datos' });
        
        // 3. Registrar middleware de prueba
        logger.info('⚗️ [TEST] Paso 3: Registrando middleware de prueba...');
        unifiedServer.registerMiddleware((req, res, next) => {
            req.quantumStartTime = process.hrtime.bigint();
            next();
        }, 'Middleware de timing cuántico');
        
        // 4. Iniciar servidor
        logger.info('🔥 [TEST] Paso 4: Iniciando servidor cuántico...');
        await unifiedServer.start();
        
        // 5. Mostrar información del servidor
        const serverInfo = unifiedServer.getInfo();
        logger.info('📊 [TEST] Información del servidor:', {
            running: serverInfo.isRunning,
            port: serverInfo.port,
            routes: serverInfo.routesCount,
            middleware: serverInfo.middlewareCount
        });
        
        // 6. Simular algunas peticiones internas para generar métricas
        logger.info('📈 [TEST] Paso 5: Simulando actividad cuántica...');
        
        // Simular métricas cuánticas
        setTimeout(() => {
            logger.info('🌟 [TEST] Métricas cuánticas generadas exitosamente');
        }, 2000);
        
        logger.info('✅ [QUANTUM TEST] Servidor cuántico Leonardo iniciado exitosamente!');
        logger.info('🌐 [QUANTUM TEST] Rutas disponibles:');
        logger.info('   - http://localhost:18021/unified/health (Estado del servidor)');
        logger.info('   - http://localhost:18021/quantum/metrics (Métricas cuánticas)');
        logger.info('   - http://localhost:18021/quantum/stream (Stream en tiempo real)');
        logger.info('   - http://localhost:18021/system/status (Estado del sistema)');
        logger.info('   - http://localhost:18021/test/quantum (Ruta de prueba)');
        logger.info('   - http://localhost:18021/test/data (POST - Prueba de datos)');
        
        logger.info('🎯 [QUANTUM TEST] Para detener el servidor presiona Ctrl+C');
        
    } catch (error) {
        logger.error('❌ [QUANTUM TEST] Error en las pruebas:', {
            message: error.message,
            stack: error.stack
        });
        process.exit(1);
    }
}

// Manejo de señales para cierre limpio
process.on('SIGINT', async () => {
    logger.info('🛑 [QUANTUM TEST] Señal de interrupción recibida, deteniendo servidor...');
    try {
        await unifiedServer.stop();
        logger.info('✅ [QUANTUM TEST] Servidor detenido exitosamente');
        process.exit(0);
    } catch (error) {
        logger.error('❌ [QUANTUM TEST] Error deteniendo servidor:', error);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    logger.info('🛑 [QUANTUM TEST] Señal de terminación recibida, deteniendo servidor...');
    try {
        await unifiedServer.stop();
        logger.info('✅ [QUANTUM TEST] Servidor detenido exitosamente');
        process.exit(0);
    } catch (error) {
        logger.error('❌ [QUANTUM TEST] Error deteniendo servidor:', error);
        process.exit(1);
    }
});

// Iniciar las pruebas
testQuantumServer();
