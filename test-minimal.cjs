#!/usr/bin/env node

console.log('🚀 Iniciando test mínimo del servidor cuántico...');

try {
    console.log('1. Importando UnifiedHttpServer...');
    const { UnifiedHttpServer } = require('./core/quantum-engine/UnifiedHttpServer');
    console.log('✅ UnifiedHttpServer importado exitosamente');
    
    console.log('2. Creando instancia del servidor...');
    const server = new UnifiedHttpServer();
    console.log('✅ Instancia creada exitosamente');
    
    console.log('3. Inicializando servidor...');
    server.initialize(18022).then(async () => {
        console.log('✅ Servidor inicializado exitosamente');
        
        console.log('4. Iniciando servidor...');
        await server.start();
        console.log('✅ Servidor iniciado exitosamente en puerto 18022');
        
        console.log('🌐 Servidor disponible en: http://localhost:18022');
        console.log('🎯 Para detener el servidor presiona Ctrl+C');
        
        // Mostrar información del servidor cada 5 segundos
        setInterval(() => {
            const info = server.getInfo();
            console.log('📊 Estado:', {
                running: info.isRunning,
                routes: info.routesCount,
                middleware: info.middlewareCount
            });
        }, 5000);
        
    }).catch(error => {
        console.error('❌ Error inicializando servidor:', error.message);
        process.exit(1);
    });
    
} catch (error) {
    console.error('❌ Error en el test mínimo:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
}

// Manejo de señales para cierre limpio
process.on('SIGINT', async () => {
    console.log('\n🛑 Señal de interrupción recibida, deteniendo servidor...');
    process.exit(0);
});
