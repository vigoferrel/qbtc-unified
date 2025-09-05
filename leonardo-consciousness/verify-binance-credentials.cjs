#!/usr/bin/env node

// ========================================================================
// 🔑 VERIFICACIÓN DE CREDENCIALES BINANCE
// Script simple para validar que BINANCE_API_KEY y BINANCE_SECRET_KEY funcionan
// Usa this.binanceConnector.ping() y consultas básicas sin errores
// ========================================================================

require('dotenv').config();
const BinanceConnectorAdapter = require('./BinanceConnectorAdapter');

// Configuración de colores para Windows PowerShell/ASCII
const colors = {
    INFO: '',
    SUCCESS: '',
    WARNING: '',
    ERROR: '',
    RESET: ''
};

function logWithTimestamp(level, message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${level}: ${message}`);
    if (data) {
        console.log('Data:', JSON.stringify(data, null, 2));
    }
}

class BinanceCredentialsVerifier {
    constructor() {
        this.binanceConnector = null;
        this.testResults = {
            environmentCheck: false,
            connectivity: false,
            accountAccess: false,
            exchangeInfo: false,
            priceQuery: false,
            overall: false
        };
    }

    // ================================================================
    // 1. VERIFICACION DE VARIABLES DE ENTORNO
    // ================================================================
    verifyEnvironment() {
        logWithTimestamp('INFO', 'Verificando variables de entorno...');
        
        const apiKey = process.env.BINANCE_API_KEY;
        const secretKey = process.env.BINANCE_SECRET_KEY;
        const testnet = process.env.BINANCE_TESTNET;
        
        console.log('BINANCE_API_KEY:', apiKey ? '***CONFIGURADA***' : 'NO CONFIGURADA');
        console.log('BINANCE_SECRET_KEY:', secretKey ? '***CONFIGURADA***' : 'NO CONFIGURADA');
        console.log('BINANCE_TESTNET:', testnet || 'false');
        console.log('BINANCE_ENVIRONMENT:', process.env.BINANCE_ENVIRONMENT || 'no especificado');
        
        if (!apiKey || !secretKey) {
            logWithTimestamp('ERROR', 'Credenciales Binance no configuradas en variables de entorno');
            return false;
        }
        
        this.testResults.environmentCheck = true;
        logWithTimestamp('SUCCESS', 'Variables de entorno configuradas correctamente');
        return true;
    }

    // ================================================================
    // 2. TEST DE CONECTIVIDAD CON PING()
    // ================================================================
    async testConnectivity() {
        logWithTimestamp('INFO', 'Ejecutando this.binanceConnector.ping()...');
        
        try {
            this.binanceConnector = new BinanceConnectorAdapter();
            
            const pingResult = await this.binanceConnector.ping();
            
            if (pingResult.success) {
                this.testResults.connectivity = true;
                logWithTimestamp('SUCCESS', 'Ping a Binance exitoso', {
                    latencia: pingResult.latencyMs + 'ms',
                    endpoint: process.env.BINANCE_TESTNET === 'true' ? 'testnet' : 'mainnet'
                });
                return true;
            } else {
                throw new Error(pingResult.error);
            }
        } catch (error) {
            this.testResults.connectivity = false;
            logWithTimestamp('ERROR', 'Fallo en conectividad Binance', { error: error.message });
            return false;
        }
    }

    // ================================================================
    // 3. TEST DE ACCESO A CUENTA (CREDENCIALES)
    // ================================================================
    async testAccountAccess() {
        logWithTimestamp('INFO', 'Verificando acceso a información de cuenta...');
        
        try {
            const accountInfo = await this.binanceConnector.getAccountInfo();
            
            if (accountInfo) {
                this.testResults.accountAccess = true;
                logWithTimestamp('SUCCESS', 'Acceso a cuenta Binance OK', {
                    totalWalletBalance: accountInfo.totalWalletBalance || 'N/A',
                    canTrade: accountInfo.canTrade || false,
                    canDeposit: accountInfo.canDeposit || false,
                    canWithdraw: accountInfo.canWithdraw || false,
                    assets: accountInfo.assets ? accountInfo.assets.length : 0
                });
                
                // Mostrar activos con balance positivo
                if (accountInfo.assets && Array.isArray(accountInfo.assets)) {
                    const positiveBalances = accountInfo.assets.filter(asset => 
                        parseFloat(asset.walletBalance || 0) > 0
                    );
                    
                    if (positiveBalances.length > 0) {
                        logWithTimestamp('INFO', `Activos con balance: ${positiveBalances.length}`, {
                            principales: positiveBalances.slice(0, 3).map(asset => ({
                                asset: asset.asset,
                                balance: asset.walletBalance
                            }))
                        });
                    }
                }
                
                return true;
            } else {
                throw new Error('No se obtuvo informacion de cuenta');
            }
        } catch (error) {
            this.testResults.accountAccess = false;
            logWithTimestamp('ERROR', 'Fallo acceso a cuenta', { error: error.message });
            
            if (error.message.includes('API') || error.message.includes('signature')) {
                console.log('');
                console.log('POSIBLES CAUSAS:');
                console.log('- API Key invalida o expirada');
                console.log('- Secret Key incorrecta');
                console.log('- Keys no tienen permisos de Futures');
                console.log('- IP no esta en whitelist de Binance');
                console.log('- Configuracion de testnet incorrecta');
            }
            return false;
        }
    }

    // ================================================================
    // 4. TEST DE INFORMACIÓN DE EXCHANGE
    // ================================================================
    async testExchangeInfo() {
        logWithTimestamp('INFO', 'Consultando información del exchange...');
        
        try {
            const exchangeInfo = await this.binanceConnector.getExchangeInfo();
            
            if (exchangeInfo && exchangeInfo.symbols) {
                this.testResults.exchangeInfo = true;
                logWithTimestamp('SUCCESS', 'Información de exchange obtenida', {
                    timezone: exchangeInfo.timezone,
                    serverTime: new Date(exchangeInfo.serverTime).toISOString(),
                    totalSymbols: exchangeInfo.symbols.length,
                    ejemploSymbols: exchangeInfo.symbols.slice(0, 3).map(s => s.symbol)
                });
                return true;
            } else {
                throw new Error('Respuesta de exchange info invalida');
            }
        } catch (error) {
            this.testResults.exchangeInfo = false;
            logWithTimestamp('ERROR', 'Fallo consulta exchange info', { error: error.message });
            return false;
        }
    }

    // ================================================================
    // 5. TEST DE CONSULTA DE PRECIO
    // ================================================================
    async testPriceQuery() {
        logWithTimestamp('INFO', 'Consultando precio de BTCUSDT...');
        
        try {
            const priceResult = await this.binanceConnector.getPrice('BTCUSDT');
            
            if (priceResult) {
                this.testResults.priceQuery = true;
                logWithTimestamp('SUCCESS', 'Consulta de precio exitosa', {
                    symbol: 'BTCUSDT',
                    price: priceResult.price || priceResult,
                    timestamp: new Date().toISOString()
                });
                return true;
            } else {
                throw new Error('No se obtuvo precio');
            }
        } catch (error) {
            this.testResults.priceQuery = false;
            logWithTimestamp('ERROR', 'Fallo consulta precio', { error: error.message });
            return false;
        }
    }

    // ================================================================
    // 6. EJECUCIÓN COMPLETA DE VERIFICACIÓN
    // ================================================================
    async runFullVerification() {
        console.log('========================================================================');
        console.log('🔑 VERIFICACION DE CREDENCIALES BINANCE');
        console.log('========================================================================');
        console.log('');
        
        let allPassed = true;
        
        // Test 1: Variables de entorno
        if (!this.verifyEnvironment()) {
            allPassed = false;
        }
        console.log('');
        
        // Test 2: Conectividad
        if (!(await this.testConnectivity())) {
            allPassed = false;
        }
        console.log('');
        
        // Test 3: Acceso a cuenta (credenciales)
        if (!(await this.testAccountAccess())) {
            allPassed = false;
        }
        console.log('');
        
        // Test 4: Exchange info
        if (!(await this.testExchangeInfo())) {
            allPassed = false;
        }
        console.log('');
        
        // Test 5: Consulta precio
        if (!(await this.testPriceQuery())) {
            allPassed = false;
        }
        console.log('');
        
        // Reporte final
        this.generateFinalReport(allPassed);
        
        return allPassed;
    }

    // ================================================================
    // 7. REPORTE FINAL
    // ================================================================
    generateFinalReport(success) {
        console.log('========================================================================');
        console.log('📊 REPORTE FINAL - VERIFICACION CREDENCIALES BINANCE');
        console.log('========================================================================');
        
        const tests = [
            { name: 'Variables de entorno', result: this.testResults.environmentCheck },
            { name: 'Conectividad (ping)', result: this.testResults.connectivity },
            { name: 'Acceso cuenta (credenciales)', result: this.testResults.accountAccess },
            { name: 'Informacion exchange', result: this.testResults.exchangeInfo },
            { name: 'Consulta precios', result: this.testResults.priceQuery }
        ];
        
        tests.forEach(test => {
            const status = test.result ? 'PASS' : 'FAIL';
            const symbol = test.result ? '✓' : '✗';
            console.log(`${symbol} ${status}: ${test.name}`);
        });
        
        console.log('');
        console.log('========================================================================');
        
        if (success) {
            logWithTimestamp('SUCCESS', 'CREDENCIALES BINANCE VERIFICADAS EXITOSAMENTE');
            console.log('✓ BINANCE_API_KEY funciona correctamente');
            console.log('✓ BINANCE_SECRET_KEY funciona correctamente');
            console.log('✓ Conexion a Binance establecida');
            console.log('✓ Acceso a datos de mercado disponible');
            console.log('');
            console.log('🚀 El sistema esta listo para operar con Binance');
        } else {
            logWithTimestamp('ERROR', 'VERIFICACION DE CREDENCIALES FALLIDA');
            console.log('✗ Hay problemas con la configuracion de Binance');
            console.log('✗ Revisa los errores anteriores para mas detalles');
            console.log('');
            console.log('📋 PASOS PARA RESOLVER:');
            console.log('1. Verifica las variables de entorno en .env');
            console.log('2. Confirma que las API keys son validas');
            console.log('3. Asegurate de que la IP esta en whitelist');
            console.log('4. Verifica permisos de Futures en Binance');
        }
        
        console.log('========================================================================');
        
        this.testResults.overall = success;
        return success;
    }
}

// ================================================================
// EJECUCIÓN PRINCIPAL
// ================================================================
async function main() {
    const verifier = new BinanceCredentialsVerifier();
    
    try {
        const success = await verifier.runFullVerification();
        process.exit(success ? 0 : 1);
    } catch (error) {
        console.error('');
        console.error('ERROR FATAL durante verificacion:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

// Manejo de señales para Windows PowerShell
process.on('SIGINT', () => {
    console.log('');
    console.log('Verificacion interrumpida por usuario');
    process.exit(130);
});

// Ejecutar si se llama directamente
if (require.main === module) {
    main();
}

module.exports = BinanceCredentialsVerifier;
