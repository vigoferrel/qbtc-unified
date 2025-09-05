#!/usr/bin/env node

// ========================================================================
// 🚀 LEONARDO CONSCIOUSNESS DIRECT LAUNCHER
// Script de Inicio Directo en Modo BIG_BANG para Segundo Plano
// Sin Interfaz Interactiva - Configuración Automática
// ========================================================================

const { UnifiedLeonardoServer } = require('./UnifiedLeonardoServer');

// Configuración BIG_BANG directa
const BIG_BANG_CONFIG = {
    name: 'BIG_BANG',
    description: 'BIG BANG MODE - Rentabilidad infinita extrema',
    initialBalance: 25000,
    tradingMode: 'AGGRESSIVE',
    autoTrade: true,
    maxCacheSize: 10000,
    minConfidence: 0.5,
    minEdge: 0.0005,
    port: 3003
};

// Función para logging con colores ASCII
function logInfo(message) {
    console.log(`[${new Date().toISOString()}] [INFO] ${message}`);
}

function logSuccess(message) {
    console.log(`[${new Date().toISOString()}] [SUCCESS] ${message}`);
}

function logError(message) {
    console.log(`[${new Date().toISOString()}] [ERROR] ${message}`);
}

// Función principal de lanzamiento
async function launchLeonardoDirectly() {
    try {
        logInfo('========================================');
        logInfo('LEONARDO CONSCIOUSNESS DIRECT LAUNCHER');
        logInfo('========================================');
        
        logInfo(`Configuración seleccionada: ${BIG_BANG_CONFIG.name}`);
        logInfo(`Descripción: ${BIG_BANG_CONFIG.description}`);
        logInfo(`Balance inicial: $${BIG_BANG_CONFIG.initialBalance.toLocaleString()}`);
        logInfo(`Puerto: ${BIG_BANG_CONFIG.port}`);
        logInfo(`Auto-trade: ${BIG_BANG_CONFIG.autoTrade ? 'ENABLED' : 'DISABLED'}`);
        
        logInfo('Inicializando Leonardo Consciousness System...');
        logInfo('- Leonardo Decision Engine 4.0');
        logInfo('- FundsManager con Kelly Criterion');  
        logInfo('- Quantum Oracle Hypersphere');
        logInfo('- Unified Server API');
        
        // Crear servidor Leonardo
        const server = new UnifiedLeonardoServer(BIG_BANG_CONFIG);
        
        // Configurar manejo de señales para shutdown limpio
        process.on('SIGINT', async () => {
            logInfo('Recibida señal SIGINT. Cerrando Leonardo Consciousness...');
            await server.stop();
            process.exit(0);
        });
        
        process.on('SIGTERM', async () => {
            logInfo('Recibida señal SIGTERM. Cerrando Leonardo Consciousness...');
            await server.stop();
            process.exit(0);
        });
        
        // Iniciar servidor
        await server.start();
        
        logSuccess('========================================');
        logSuccess('LEONARDO CONSCIOUSNESS SISTEMA ACTIVO');
        logSuccess('========================================');
        logSuccess(`Servidor activo en puerto: ${BIG_BANG_CONFIG.port}`);
        logSuccess(`API Health: http://localhost:${BIG_BANG_CONFIG.port}/health`);
        logSuccess(`Balance inicial: $${BIG_BANG_CONFIG.initialBalance.toFixed(2)}`);
        logSuccess(`Auto-trading: ${BIG_BANG_CONFIG.autoTrade ? 'ACTIVO' : 'INACTIVO'}`);
        logSuccess('Sistema listo para máximo profit');
        
        // Mostrar estadísticas cada 30 segundos si está en auto-trade
        if (BIG_BANG_CONFIG.autoTrade) {
            setInterval(async () => {
                try {
                    const stats = await server.getSystemStats();
                    logInfo(`Stats: Análisis ${stats.totalAnalyses} | Trades ${stats.totalTrades} | Profit $${stats.totalProfit.toFixed(2)}`);
                } catch (error) {
                    // Ignorar errores de stats para no interrumpir el flujo
                }
            }, 30000);
        }
        
    } catch (error) {
        logError('ERROR FATAL iniciando Leonardo Consciousness:');
        logError(error.message);
        logError(error.stack);
        process.exit(1);
    }
}

// Lanzar directamente
launchLeonardoDirectly();
