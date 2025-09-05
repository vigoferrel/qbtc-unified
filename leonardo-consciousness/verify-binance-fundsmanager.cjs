#!/usr/bin/env node

// ========================================================================
// 🔍 VERIFICACIÓN DE ACCESO BINANCE - FUNDSMANAGER
// Script para validar conectividad Binance y funcionalidad FundsManager
// Verifica: Conectividad, Balance, Inicialización correcta
// ========================================================================

require('dotenv').config();
const path = require('path');
const { FundsManager } = require('./FundsManager');
const BinanceConnectorAdapter = require('./BinanceConnectorAdapter');

// Configuración de logging con timestamps
function logWithTimestamp(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const colors = {
        INFO: '\x1b[36m',    // Cyan
        SUCCESS: '\x1b[32m', // Green  
        WARNING: '\x1b[33m', // Yellow
        ERROR: '\x1b[31m',   // Red
        RESET: '\x1b[0m'     // Reset
    };
    
    console.log(`${colors[level]}[${timestamp}] ${level}: ${message}${colors.RESET}`);
    if (data) {
        console.log('Data:', JSON.stringify(data, null, 2));
    }
}

// Configuración del test
const TEST_CONFIG = {
    timeout: 30000,              // 30 segundos timeout
    initialBalance: 1000,        // Balance inicial para testing
    testConnectivity: true,      // Verificar conectividad
    testBalance: true,          // Verificar balance
    testInitialization: true,   // Verificar inicialización
    enableLogs: true,           // Logs detallados
    retryAttempts: 3            // Reintentos en case de fallo
};

class BinanceFundsManagerVerifier {
    constructor(config = TEST_CONFIG) {
        this.config = { ...TEST_CONFIG, ...config };
        this.testResults = {
            connectivity: null,
            balance: null,
            initialization: null,
            overall: false
        };
        this.fundsManager = null;
        this.binanceConnector = null;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🔄 EJECUCIÓN PRINCIPAL DE VERIFICACIÓN
    // ═══════════════════════════════════════════════════════════════════════

    async runVerification() {
        logWithTimestamp('INFO', '🚀 Iniciando verificación Binance-FundsManager');
        
        try {
            // Mostrar configuración del entorno
            await this.displayEnvironmentConfig();
            
            // Test 1: Conectividad básica a Binance
            if (this.config.testConnectivity) {
                await this.verifyBinanceConnectivity();
            }
            
            // Test 2: Inicialización del FundsManager
            if (this.config.testInitialization) {
                await this.verifyFundsManagerInitialization();
            }
            
            // Test 3: Verificación de balance
            if (this.config.testBalance) {
                await this.verifyBalanceAccess();
            }
            
            // Test 4: Operaciones FundsManager
            await this.verifyFundsManagerOperations();
            
            // Generar reporte final
            await this.generateFinalReport();
            
        } catch (error) {
            logWithTimestamp('ERROR', 'Error fatal durante verificación', { error: error.message });
            this.testResults.overall = false;
            process.exit(1);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🌐 VERIFICACIÓN DE CONECTIVIDAD BINANCE
    // ═══════════════════════════════════════════════════════════════════════

    async verifyBinanceConnectivity() {
        logWithTimestamp('INFO', '🌐 Verificando conectividad con Binance...');
        
        try {
            this.binanceConnector = new BinanceConnectorAdapter();
            
            // Test de ping básico
            const pingResult = await this.withTimeout(
                this.binanceConnector.ping(),
                this.config.timeout
            );
            
            if (pingResult.success) {
                this.testResults.connectivity = true;
                logWithTimestamp('SUCCESS', '✅ Conectividad Binance OK', {
                    latency: pingResult.latencyMs + 'ms',
                    testnet: process.env.BINANCE_TESTNET === 'true'
                });
            } else {
                throw new Error(`Ping fallo: ${pingResult.error}`);
            }
            
            // Test de información de exchange
            try {
                const exchangeInfo = await this.withTimeout(
                    this.binanceConnector.getExchangeInfo(),
                    this.config.timeout
                );
                
                logWithTimestamp('SUCCESS', '📊 Información de exchange obtenida', {
                    symbols: exchangeInfo?.symbols?.length || 'unknown',
                    timezone: exchangeInfo?.timezone || 'unknown'
                });
            } catch (infoError) {
                logWithTimestamp('WARNING', '⚠️ No se pudo obtener info de exchange', {
                    error: infoError.message
                });
            }
            
        } catch (error) {
            this.testResults.connectivity = false;
            logWithTimestamp('ERROR', '❌ Conectividad Binance FALLIDA', { error: error.message });
            throw error;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 💰 VERIFICACIÓN DE ACCESO A BALANCE
    // ═══════════════════════════════════════════════════════════════════════

    async verifyBalanceAccess() {
        logWithTimestamp('INFO', '💰 Verificando acceso a balance Binance...');
        
        try {
            // Intentar obtener información de cuenta
            const accountInfo = await this.withTimeout(
                this.binanceConnector.getAccountInfo(),
                this.config.timeout
            );
            
            if (accountInfo) {
                this.testResults.balance = true;
                logWithTimestamp('SUCCESS', '✅ Acceso a balance OK', {
                    totalWalletBalance: accountInfo.totalWalletBalance || 'N/A',
                    totalMarginBalance: accountInfo.totalMarginBalance || 'N/A',
                    availableBalance: accountInfo.availableBalance || 'N/A'
                });
                
                // Verificar si hay balances positivos
                if (accountInfo.assets && Array.isArray(accountInfo.assets)) {
                    const positiveBalances = accountInfo.assets.filter(asset => 
                        parseFloat(asset.walletBalance || 0) > 0
                    );
                    
                    logWithTimestamp('INFO', `💵 Activos con balance positivo: ${positiveBalances.length}`, {
                        assets: positiveBalances.slice(0, 5).map(asset => ({
                            asset: asset.asset,
                            balance: asset.walletBalance
                        }))
                    });
                }
                
            } else {
                throw new Error('No se pudo obtener información de cuenta');
            }
            
        } catch (error) {
            this.testResults.balance = false;
            logWithTimestamp('ERROR', '❌ Acceso a balance FALLIDO', { error: error.message });
            
            // Si es un error de API key/secret, proporcionar ayuda
            if (error.message.includes('API') || error.message.includes('signature') || error.message.includes('key')) {
                logWithTimestamp('WARNING', '🔑 Posible problema de configuración API:');
                console.log('   - Verifica BINANCE_API_KEY en variables de entorno');
                console.log('   - Verifica BINANCE_API_SECRET en variables de entorno'); 
                console.log('   - Asegúrate de que las keys tienen permisos de Futures');
                console.log('   - Si usas testnet, verifica BINANCE_TESTNET=true');
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🧠 VERIFICACIÓN DE INICIALIZACIÓN FUNDSMANAGER
    // ═══════════════════════════════════════════════════════════════════════

    async verifyFundsManagerInitialization() {
        logWithTimestamp('INFO', '🧠 Verificando inicialización FundsManager...');
        
        try {
            // Crear instancia FundsManager
            this.fundsManager = new FundsManager({
                initialBalance: this.config.initialBalance,
                maxLeverage: 10,
                maxRiskPerTrade: 0.05,
                testnet: process.env.BINANCE_TESTNET === 'true'
            });
            
            // Ejecutar inicialización
            logWithTimestamp('INFO', '⏳ Ejecutando this.fundsManager.initialize()...');
            const initResult = await this.withTimeout(
                this.fundsManager.initialize(),
                this.config.timeout
            );
            
            if (initResult === true || initResult === undefined) {
                this.testResults.initialization = true;
                logWithTimestamp('SUCCESS', '✅ FundsManager.initialize() exitoso');
                
                // Verificar estado post-inicialización
                const fundsStatus = this.fundsManager.getFundsStatus();
                logWithTimestamp('INFO', '📊 Estado FundsManager post-inicialización', {
                    totalBalance: fundsStatus.totalBalance,
                    availableBalance: fundsStatus.availableBalance,
                    canTrade: fundsStatus.canTrade,
                    leonardoState: fundsStatus.leonardoFundsState.consciousness_level,
                    emergencyStop: fundsStatus.emergencyStop
                });
                
            } else {
                throw new Error(`Inicialización retornó: ${initResult}`);
            }
            
        } catch (error) {
            this.testResults.initialization = false;
            logWithTimestamp('ERROR', '❌ Inicialización FundsManager FALLIDA', { error: error.message });
            throw error;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🔧 VERIFICACIÓN DE OPERACIONES FUNDSMANAGER
    // ═══════════════════════════════════════════════════════════════════════

    async verifyFundsManagerOperations() {
        if (!this.fundsManager) {
            logWithTimestamp('WARNING', '⚠️ FundsManager no inicializado, saltando tests operacionales');
            return;
        }
        
        logWithTimestamp('INFO', '🔧 Verificando operaciones FundsManager...');
        
        try {
            // Test 1: Cálculo de posición
            const mockOpportunity = {
                symbol: 'BTCUSDT',
                confidence: 0.75,
                edge: 0.025,
                leverage: 5
            };
            
            const mockConsciousness = {
                consciousness_level: 0.618,
                confidence: 0.75,
                edge: 0.025,
                leverage: 5,
                bigBangReady: false,
                pillarDetails: {
                    lambda888: { strength: 0.7 },
                    prime7919: { strength: 0.6 },
                    hookWheel: { strength: 0.8 },
                    symbiosis: { strength: 0.75 }
                }
            };
            
            const positionResult = this.fundsManager.calculatePositionSize(mockOpportunity, mockConsciousness);
            
            if (positionResult.success) {
                logWithTimestamp('SUCCESS', '✅ Cálculo de posición OK', {
                    size: positionResult.size,
                    leverage: positionResult.leverage,
                    risk: positionResult.risk,
                    kellyFraction: positionResult.kellyFraction
                });
            } else {
                logWithTimestamp('WARNING', '⚠️ Cálculo de posición con advertencias', {
                    reason: positionResult.reason
                });
            }
            
            // Test 2: Estado de fondos actuales
            const currentFunds = this.fundsManager.getCurrentFunds();
            logWithTimestamp('INFO', '💰 Estado actual de fondos', currentFunds);
            
            // Test 3: Métricas de performance
            const metrics = this.fundsManager.getMetrics();
            logWithTimestamp('INFO', '📊 Métricas de performance', metrics);
            
            // Test 4: Verificar capacidad de trading
            const canTrade = this.fundsManager.canTrade();
            logWithTimestamp('INFO', `🤖 Capacidad de trading: ${canTrade ? 'ACTIVA' : 'INACTIVA'}`);
            
        } catch (error) {
            logWithTimestamp('ERROR', '❌ Error en operaciones FundsManager', { error: error.message });
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 📊 UTILIDADES Y HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    async displayEnvironmentConfig() {
        logWithTimestamp('INFO', '🔧 Configuración del entorno:');
        console.log('   NODE_ENV:', process.env.NODE_ENV || 'undefined');
        console.log('   BINANCE_TESTNET:', process.env.BINANCE_TESTNET || 'undefined');
        console.log('   BINANCE_API_KEY:', process.env.BINANCE_API_KEY ? '***configurada***' : 'no configurada');
        console.log('   BINANCE_SECRET_KEY:', process.env.BINANCE_SECRET_KEY ? '***configurada***' : 'no configurada');
        console.log('   Timeout configurado:', this.config.timeout + 'ms');
        console.log('   Balance inicial test:', '$' + this.config.initialBalance);
        console.log('');
    }

    async withTimeout(promise, timeoutMs) {
        return Promise.race([
            promise,
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`Timeout después de ${timeoutMs}ms`)), timeoutMs)
            )
        ]);
    }

    async generateFinalReport() {
        console.log('\n' + '═'.repeat(80));
        logWithTimestamp('INFO', '📋 REPORTE FINAL DE VERIFICACIÓN');
        console.log('═'.repeat(80));
        
        const tests = [
            { name: 'Conectividad Binance', result: this.testResults.connectivity },
            { name: 'Inicialización FundsManager', result: this.testResults.initialization },
            { name: 'Acceso a Balance', result: this.testResults.balance }
        ];
        
        let allPassed = true;
        tests.forEach(test => {
            const status = test.result === true ? '✅ PASS' : 
                          test.result === false ? '❌ FAIL' : 
                          '⏸️ SKIP';
            const color = test.result === true ? '\x1b[32m' : 
                         test.result === false ? '\x1b[31m' : 
                         '\x1b[33m';
            
            console.log(`${color}${status}\x1b[0m ${test.name}`);
            
            if (test.result !== true) allPassed = false;
        });
        
        console.log('\n' + '═'.repeat(80));
        this.testResults.overall = allPassed;
        
        if (allPassed) {
            logWithTimestamp('SUCCESS', '🎉 TODAS LAS VERIFICACIONES COMPLETADAS EXITOSAMENTE');
            console.log('✅ El FundsManager puede acceder correctamente a Binance');
            console.log('✅ La inicialización funciona correctamente');  
            console.log('✅ El balance está disponible y actualizado');
        } else {
            logWithTimestamp('ERROR', '❌ ALGUNAS VERIFICACIONES FALLARON');
            console.log('❌ El sistema requiere configuración adicional');
            console.log('💡 Revisa los logs anteriores para detalles específicos');
        }
        
        console.log('\n📚 Para más información, consulta:');
        console.log('   - Documentación Binance API: https://binance-docs.github.io/apidocs/');
        console.log('   - Configuración de variables de entorno');
        console.log('   - Logs del sistema en leonardo-consciousness/');
        console.log('');
        
        return this.testResults.overall;
    }
}

// ═══════════════════════════════════════════════════════════════════════
// 🚀 EJECUCIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════

async function main() {
    const verifier = new BinanceFundsManagerVerifier();
    
    try {
        const success = await verifier.runVerification();
        process.exit(success ? 0 : 1);
    } catch (error) {
        console.error('\n💥 Error fatal durante verificación:', error.message);
        process.exit(1);
    }
}

// Manejar señales de interrupción elegantemente
process.on('SIGINT', () => {
    console.log('\n🛑 Verificación interrumpida por usuario');
    process.exit(130);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Verificación terminada por sistema');
    process.exit(143);
});

// Ejecutar si se llama directamente
if (require.main === module) {
    main();
}

module.exports = BinanceFundsManagerVerifier;
