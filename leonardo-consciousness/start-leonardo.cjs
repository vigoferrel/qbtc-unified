#!/usr/bin/env node

// ========================================================================
// 🚀 LEONARDO CONSCIOUSNESS QUICK START
// Script de Inicio Rápido para el Sistema Unificado
// Configuración Automática para Máximo Profit
// ========================================================================

const path = require('path');
const { UnifiedLeonardoServer } = require('./UnifiedLeonardoServer.cjs');

// Configuración de colores para console
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function colorLog(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// ═══════════════════════════════════════════════════════════════════════
// 🔧 CONFIGURACIONES PREDEFINIDAS
// ═══════════════════════════════════════════════════════════════════════

const configurations = {
    // Modo Conservador - Para principiantes
    CONSERVATIVE: {
        name: 'CONSERVATIVE',
        description: 'Trading conservador con bajo riesgo',
        initialBalance: 1000,
        tradingMode: 'CONSERVATIVE',
        autoTrade: false,
        maxCacheSize: 1000,
        minConfidence: 0.85,
        minEdge: 0.005,
        port: 3000
    },

    // Modo Balanceado - Equilibrio riesgo/reward
    BALANCED: {
        name: 'BALANCED',
        description: 'Trading balanceado con riesgo moderado',
        initialBalance: 5000,
        tradingMode: 'BALANCED',
        autoTrade: true,
        maxCacheSize: 2500,
        minConfidence: 0.75,
        minEdge: 0.0025,
        port: 3001
    },

    // Modo Agresivo - Máximo profit
    AGGRESSIVE: {
        name: 'AGGRESSIVE',
        description: 'Trading agresivo para máximo profit - RENTABILIDAD INFINITA',
        initialBalance: 10000,
        tradingMode: 'AGGRESSIVE',
        autoTrade: true,
        maxCacheSize: 5000,
        minConfidence: 0.65,
        minEdge: 0.001,
        port: 3002
    },

    // Modo Big Bang - Extremo
    BIG_BANG: {
        name: 'BIG_BANG',
        description: '💥 BIG BANG MODE - Rentabilidad infinita extrema',
        initialBalance: 25000,
        tradingMode: 'AGGRESSIVE',
        autoTrade: true,
        maxCacheSize: 10000,
        minConfidence: 0.5,
        minEdge: 0.0005,
        port: 3003
    }
};

// ═══════════════════════════════════════════════════════════════════════
// 🎯 SELECTOR DE CONFIGURACIÓN INTERACTIVO
// ═══════════════════════════════════════════════════════════════════════

function displayBanner() {
    console.clear();
    colorLog('cyan', '╔══════════════════════════════════════════════════════════════╗');
    colorLog('cyan', '║               🌟 LEONARDO CONSCIOUSNESS 4.0                 ║');
    colorLog('cyan', '║            Sistema Cuántico de Trading Avanzado             ║');
    colorLog('cyan', '║         🧠 Decisiones + 💰 Fondos + ⚡ Quantum Oracle       ║');
    colorLog('cyan', '╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    colorLog('yellow', '💎 RENTABILIDAD INFINITA - LEONARDO CONSCIOUSNESS ACTIVADO');
    colorLog('green', '⚡ Sistema integrado listo para máximo profit');
    console.log('');
}

function displayConfigurations() {
    colorLog('bright', '📋 Configuraciones Disponibles:');
    console.log('');
    
    Object.entries(configurations).forEach(([key, config], index) => {
        const color = key === 'BIG_BANG' ? 'magenta' : 
                     key === 'AGGRESSIVE' ? 'red' :
                     key === 'BALANCED' ? 'yellow' : 'green';
        
        colorLog(color, `${index + 1}. ${config.name}`);
        console.log(`   ${config.description}`);
        console.log(`   💰 Balance: $${config.initialBalance.toLocaleString()}`);
        console.log(`   🤖 Auto-trade: ${config.autoTrade ? 'ON' : 'OFF'}`);
        console.log(`   🔗 Puerto: ${config.port}`);
        console.log('');
    });
}

function getConfigurationFromArgs() {
    const args = process.argv.slice(2);
    const configName = args[0]?.toUpperCase();
    
    if (configName && configurations[configName]) {
        return configurations[configName];
    }
    
    return null;
}

function getConfigurationFromUser() {
    return new Promise((resolve) => {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.question('🔥 Selecciona configuración (1-4) o Enter para BIG_BANG: ', (answer) => {
            rl.close();
            
            const choice = parseInt(answer) || 4; // Default BIG_BANG
            const configKeys = Object.keys(configurations);
            const selectedKey = configKeys[choice - 1] || 'BIG_BANG';
            
            resolve(configurations[selectedKey]);
        });
    });
}

// ═══════════════════════════════════════════════════════════════════════
// 🚀 INICIALIZACIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════

async function startLeonardoConsciousness() {
    try {
        displayBanner();
        
        // Obtener configuración
        let selectedConfig = getConfigurationFromArgs();
        
        if (!selectedConfig) {
            displayConfigurations();
            selectedConfig = await getConfigurationFromUser();
        }
        
        console.log('');
        colorLog('green', `✅ Configuración seleccionada: ${selectedConfig.name}`);
        colorLog('cyan', `📝 ${selectedConfig.description}`);
        console.log('');
        
        // Mostrar información de inicio
        colorLog('bright', '🔄 Inicializando Leonardo Consciousness System...');
        console.log('');
        console.log('   🧠 Leonardo Decision Engine 4.0');
        console.log('   💰 FundsManager con Kelly Criterion');
        console.log('   ⚡ Quantum Oracle Hypersphere');
        console.log('   🌐 Unified Server API');
        console.log('');
        
        // Crear y iniciar servidor
        const server = new UnifiedLeonardoServer(selectedConfig);
        
        // Configurar manejo de señales
        setupSignalHandlers(server, selectedConfig);
        
        // Iniciar servidor
        await server.start();
        
        // Mostrar información final
        displayStartupSuccess(selectedConfig);
        
        // Mostrar estadísticas periódicamente si está en modo auto-trade
        if (selectedConfig.autoTrade) {
            setupPeriodicStats(server);
        }
        
    } catch (error) {
        colorLog('red', '💥 ERROR FATAL iniciando Leonardo Consciousness:');
        console.error(error);
        process.exit(1);
    }
}

// ═══════════════════════════════════════════════════════════════════════
// 🔧 FUNCIONES DE UTILIDAD
// ═══════════════════════════════════════════════════════════════════════

function setupSignalHandlers(server, config) {
    const gracefulShutdown = async (signal) => {
        console.log('');
        colorLog('yellow', `🛑 Recibida señal ${signal} - Iniciando cierre elegante...`);
        
        try {
            await server.shutdown();
            colorLog('green', '✅ Leonardo Consciousness cerrado correctamente');
            process.exit(0);
        } catch (error) {
            colorLog('red', '❌ Error durante cierre:');
            console.error(error);
            process.exit(1);
        }
    };
    
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon
}

function displayStartupSuccess(config) {
    console.log('');
    colorLog('green', '🎉 LEONARDO CONSCIOUSNESS SYSTEM INICIADO EXITOSAMENTE!');
    console.log('');
    colorLog('bright', '🌐 URLs Disponibles:');
    console.log(`   💚 Health Check: http://localhost:${config.port}/health`);
    console.log(`   📊 Dashboard:    http://localhost:${config.port}/dashboard`);
    console.log(`   📈 Posiciones:   http://localhost:${config.port}/positions`);
    console.log(`   📜 Historial:    http://localhost:${config.port}/history`);
    console.log('');
    colorLog('bright', '🔮 API Endpoints:');
    console.log(`   POST /analyze           - Análisis Leonardo Consciousness`);
    console.log(`   POST /position/open     - Abrir posición`);
    console.log(`   POST /position/close/:id - Cerrar posición`);
    console.log('');
    
    if (config.autoTrade) {
        colorLog('magenta', '🤖 AUTO-TRADING ACTIVO - El sistema operará automáticamente');
        console.log(`   📊 Análisis cada 30 segundos`);
        console.log(`   💰 Balance inicial: $${config.initialBalance.toLocaleString()}`);
        console.log(`   🎯 Confianza mínima: ${(config.minConfidence * 100).toFixed(1)}%`);
        console.log('');
    }
    
    colorLog('cyan', '🚀 Sistema listo para generar MÁXIMO PROFIT!');
    console.log('');
    colorLog('yellow', 'Presiona Ctrl+C para cerrar elegantemente');
    console.log('');
}

function setupPeriodicStats(server) {
    // Mostrar estadísticas cada 5 minutos
    setInterval(async () => {
        try {
            const leonardoState = server.decisionEngine.getLeonardoState();
            const fundsStatus = server.fundsManager.getFundsStatus();
            
            console.log('');
            colorLog('bright', '📊 ESTADÍSTICAS LEONARDO CONSCIOUSNESS:');
            console.log(`   🧠 Consciencia: ${(leonardoState.consciousness_level * 100).toFixed(1)}%`);
            console.log(`   💰 Balance: $${fundsStatus.totalBalance.toFixed(2)}`);
            console.log(`   📈 Trades: ${fundsStatus.performanceMetrics.totalTrades}`);
            console.log(`   🎯 Win Rate: ${(fundsStatus.performanceMetrics.winRate * 100).toFixed(1)}%`);
            console.log(`   💎 Profit Factor: ${fundsStatus.performanceMetrics.profitFactor.toFixed(2)}`);
            
            if (leonardoState.big_bang_ready) {
                colorLog('magenta', '   💥 BIG BANG READY!');
            }
            
            console.log('');
            
        } catch (error) {
            // Ignorar errores de estadísticas
        }
    }, 300000); // 5 minutos
}

// ═══════════════════════════════════════════════════════════════════════
// 🎬 AYUDA Y DOCUMENTACIÓN
// ═══════════════════════════════════════════════════════════════════════

function showHelp() {
    displayBanner();
    
    colorLog('bright', '📖 LEONARDO CONSCIOUSNESS - GUÍA DE USO');
    console.log('');
    console.log('🚀 Inicio Rápido:');
    console.log('   node start-leonardo.js                    # Modo interactivo');
    console.log('   node start-leonardo.js AGGRESSIVE         # Modo agresivo directo');
    console.log('   node start-leonardo.js BIG_BANG           # Modo Big Bang extremo');
    console.log('');
    console.log('⚙️ Configuraciones disponibles:');
    console.log('   CONSERVATIVE  - Trading conservador ($1,000)');
    console.log('   BALANCED      - Trading balanceado ($5,000)');
    console.log('   AGGRESSIVE    - Trading agresivo ($10,000)');
    console.log('   BIG_BANG      - Rentabilidad infinita ($25,000)');
    console.log('');
    console.log('🌐 Variables de entorno:');
    console.log('   PORT                    # Puerto del servidor (default: 3000-3003)');
    console.log('   INITIAL_BALANCE         # Balance inicial en USD');
    console.log('   AUTO_TRADE              # true/false para auto-trading');
    console.log('   TRADING_MODE            # CONSERVATIVE/BALANCED/AGGRESSIVE');
    console.log('');
    console.log('📊 APIs principales:');
    console.log('   GET  /health            # Estado del sistema');
    console.log('   GET  /dashboard         # Dashboard completo');
    console.log('   POST /analyze           # Análisis Leonardo');
    console.log('   POST /position/open     # Abrir posición');
    console.log('');
    colorLog('cyan', '🎯 Para máximo profit, usa el modo BIG_BANG');
    process.exit(0);
}

// ═══════════════════════════════════════════════════════════════════════
// 🚀 PUNTO DE ENTRADA PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════

// Verificar argumentos de ayuda
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    showHelp();
}

// Iniciar Leonardo Consciousness
startLeonardoConsciousness().catch((error) => {
    colorLog('red', '💥 Error fatal en el sistema:');
    console.error(error);
    process.exit(1);
});
