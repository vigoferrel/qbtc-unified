#!/usr/bin/env node
/*
  QBTC FUTURES AUTHENTICATION TEST
  Prueba específicamente la autenticación para Binance Futures API
*/

const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class FuturesAuthTester {
    constructor() {
        this.envPath = path.join(__dirname, '..', '.env');
        this.loadEnvConfig();
    }

    loadEnvConfig() {
        try {
            const envContent = fs.readFileSync(this.envPath, 'utf8');
            this.envVars = {};
            
            envContent.split('\n').forEach(line => {
                if (line.includes('=') && !line.startsWith('#')) {
                    const [key, ...valueParts] = line.split('=');
                    this.envVars[key.trim()] = valueParts.join('=').trim();
                }
            });
        } catch (error) {
            console.error('❌ Error leyendo .env:', error.message);
            this.envVars = {};
        }
    }

    async testFuturesAuth() {
        console.log('🚀 QBTC FUTURES AUTHENTICATION TEST');
        console.log('====================================\n');

        const apiKey = this.envVars.BINANCE_API_KEY || '';
        const secretKey = this.envVars.BINANCE_SECRET_KEY || '';
        const isTestnet = this.envVars.BINANCE_TESTNET === 'true';
        const futuresOnly = this.envVars.BINANCE_FUTURES_ONLY === 'true';

        console.log('📋 CONFIGURACIÓN FUTURES:');
        console.log(`   Modo: ${isTestnet ? 'TESTNET' : 'PRODUCCIÓN'}`);
        console.log(`   Futures Only: ${futuresOnly ? '✅ SÍ' : '❌ NO'}`);
        console.log(`   IP: ${this.envVars.CURRENT_PUBLIC_IP}`);
        console.log(`   API Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 8)}\n`);

        if (!apiKey || !secretKey) {
            console.log('❌ API Keys no configuradas');
            return;
        }

        // Test de autenticación específico para Futures
        await this.testFuturesAccountInfo(apiKey, secretKey, isTestnet);
        await this.testFuturesBalance(apiKey, secretKey, isTestnet);
        await this.testFuturesExchangeInfo(apiKey, secretKey, isTestnet);
        await this.testFuturesPositions(apiKey, secretKey, isTestnet);
    }

    async testFuturesAccountInfo(apiKey, secretKey, isTestnet) {
        console.log('🔐 PROBANDO AUTENTICACIÓN FUTURES...');
        
        const hostname = isTestnet ? 'testnet.binancefuture.com' : 'fapi.binance.com';
        const path = '/fapi/v2/account';
        
        return new Promise((resolve) => {
            const timestamp = Date.now();
            const queryString = `timestamp=${timestamp}`;
            const signature = crypto
                .createHmac('sha256', secretKey)
                .update(queryString)
                .digest('hex');

            const fullPath = `${path}?${queryString}&signature=${signature}`;

            const req = https.request({
                hostname,
                path: fullPath,
                method: 'GET',
                headers: {
                    'X-MBX-APIKEY': apiKey,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        if (res.statusCode === 200) {
                            const accountInfo = JSON.parse(data);
                            console.log('   ✅ Autenticación Futures exitosa');
                            console.log(`   💰 Balance Total: ${accountInfo.totalWalletBalance} USDT`);
                            console.log(`   📊 Balance Disponible: ${accountInfo.availableBalance} USDT`);
                            console.log(`   ⚖️ Margen Total: ${accountInfo.totalMarginBalance} USDT`);
                            console.log(`   📈 PnL No Realizado: ${accountInfo.totalUnrealizedProfit} USDT`);
                            console.log(`   🎯 Account Type: ${accountInfo.canTrade ? 'TRADING HABILITADO' : 'SOLO LECTURA'}`);
                        } else {
                            const error = JSON.parse(data);
                            console.log('   ❌ Error de autenticación Futures');
                            console.log(`   📊 Status: ${res.statusCode}`);
                            console.log(`   🔍 Code: ${error.code}`);
                            console.log(`   💬 Message: ${error.msg}`);
                            
                            this.diagnoseFuturesError(error, res.statusCode);
                        }
                    } catch (parseError) {
                        console.log('   ❌ Error parseando respuesta:', parseError.message);
                        console.log(`   📊 Status: ${res.statusCode}`);
                        console.log(`   📋 Raw Data: ${data.substring(0, 200)}...`);
                    }
                    resolve();
                });
            });

            req.on('error', (error) => {
                console.log(`   ❌ Error de conexión: ${error.message}`);
                resolve();
            });

            req.on('timeout', () => {
                console.log('   ⏰ Timeout en autenticación Futures');
                req.destroy();
                resolve();
            });

            req.end();
        });
    }

    async testFuturesBalance(apiKey, secretKey, isTestnet) {
        console.log('\n💰 PROBANDO BALANCE FUTURES...');
        
        const hostname = isTestnet ? 'testnet.binancefuture.com' : 'fapi.binance.com';
        const path = '/fapi/v2/balance';
        
        return new Promise((resolve) => {
            const timestamp = Date.now();
            const queryString = `timestamp=${timestamp}`;
            const signature = crypto
                .createHmac('sha256', secretKey)
                .update(queryString)
                .digest('hex');

            const fullPath = `${path}?${queryString}&signature=${signature}`;

            const req = https.request({
                hostname,
                path: fullPath,
                method: 'GET',
                headers: {
                    'X-MBX-APIKEY': apiKey
                },
                timeout: 5000
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        if (res.statusCode === 200) {
                            const balances = JSON.parse(data);
                            console.log('   ✅ Balance Futures obtenido');
                            
                            // Filtrar balances con valor > 0
                            const nonZeroBalances = balances.filter(b => 
                                parseFloat(b.balance) > 0 || parseFloat(b.withdrawAvailable) > 0
                            );

                            if (nonZeroBalances.length > 0) {
                                console.log('   📊 Balances disponibles:');
                                nonZeroBalances.forEach(balance => {
                                    console.log(`      ${balance.asset}: ${balance.balance} (Disponible: ${balance.withdrawAvailable})`);
                                });
                            } else {
                                console.log('   ⚠️ No hay balances disponibles en Futures');
                                console.log('   💡 Para testnet, obtener USDT en: https://testnet.binance.com/en/futures-testnet');
                            }
                        } else {
                            console.log(`   ❌ Error obteniendo balance: ${res.statusCode}`);
                        }
                    } catch (error) {
                        console.log('   ❌ Error parseando balance:', error.message);
                    }
                    resolve();
                });
            });

            req.on('error', () => resolve());
            req.on('timeout', () => { req.destroy(); resolve(); });
            req.end();
        });
    }

    async testFuturesExchangeInfo(apiKey, secretKey, isTestnet) {
        console.log('\n📊 PROBANDO EXCHANGE INFO FUTURES...');
        
        const hostname = isTestnet ? 'testnet.binancefuture.com' : 'fapi.binance.com';
        const path = '/fapi/v1/exchangeInfo';
        
        return new Promise((resolve) => {
            const req = https.request({
                hostname,
                path,
                method: 'GET',
                timeout: 5000
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        if (res.statusCode === 200) {
                            const exchangeInfo = JSON.parse(data);
                            console.log('   ✅ Exchange Info obtenido');
                            console.log(`   🎯 Símbolos disponibles: ${exchangeInfo.symbols.length}`);
                            console.log(`   ⏰ Server Time: ${new Date(exchangeInfo.serverTime).toISOString()}`);
                            
                            // Mostrar algunos símbolos principales
                            const majorSymbols = exchangeInfo.symbols
                                .filter(s => ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'].includes(s.symbol))
                                .map(s => s.symbol);
                            
                            if (majorSymbols.length > 0) {
                                console.log(`   📈 Símbolos principales: ${majorSymbols.join(', ')}`);
                            }
                        } else {
                            console.log(`   ❌ Error obteniendo exchange info: ${res.statusCode}`);
                        }
                    } catch (error) {
                        console.log('   ❌ Error parseando exchange info:', error.message);
                    }
                    resolve();
                });
            });

            req.on('error', () => resolve());
            req.on('timeout', () => { req.destroy(); resolve(); });
            req.end();
        });
    }

    async testFuturesPositions(apiKey, secretKey, isTestnet) {
        console.log('\n⚖️ PROBANDO POSICIONES FUTURES...');
        
        const hostname = isTestnet ? 'testnet.binancefuture.com' : 'fapi.binance.com';
        const path = '/fapi/v2/positionRisk';
        
        return new Promise((resolve) => {
            const timestamp = Date.now();
            const queryString = `timestamp=${timestamp}`;
            const signature = crypto
                .createHmac('sha256', secretKey)
                .update(queryString)
                .digest('hex');

            const fullPath = `${path}?${queryString}&signature=${signature}`;

            const req = https.request({
                hostname,
                path: fullPath,
                method: 'GET',
                headers: {
                    'X-MBX-APIKEY': apiKey
                },
                timeout: 5000
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        if (res.statusCode === 200) {
                            const positions = JSON.parse(data);
                            console.log('   ✅ Posiciones Futures obtenidas');
                            
                            // Filtrar posiciones activas
                            const activePositions = positions.filter(p => 
                                parseFloat(p.positionAmt) !== 0
                            );

                            if (activePositions.length > 0) {
                                console.log(`   📊 Posiciones activas: ${activePositions.length}`);
                                activePositions.forEach(pos => {
                                    console.log(`      ${pos.symbol}: ${pos.positionAmt} (PnL: ${pos.unRealizedProfit} USDT)`);
                                });
                            } else {
                                console.log('   📊 No hay posiciones activas');
                                console.log(`   🎯 Total símbolos disponibles: ${positions.length}`);
                            }
                        } else {
                            console.log(`   ❌ Error obteniendo posiciones: ${res.statusCode}`);
                        }
                    } catch (error) {
                        console.log('   ❌ Error parseando posiciones:', error.message);
                    }
                    resolve();
                });
            });

            req.on('error', () => resolve());
            req.on('timeout', () => { req.destroy(); resolve(); });
            req.end();
        });
    }

    diagnoseFuturesError(error, statusCode) {
        console.log('\n🔍 DIAGNÓSTICO DE ERROR FUTURES:');
        
        switch (error.code) {
            case -2014:
            case -2015:
                console.log('   🚨 API-key format invalid');
                console.log('   🔧 SOLUCIÓN: Verificar IP en whitelist de Binance');
                console.log(`   🌐 Tu IP: ${this.envVars.CURRENT_PUBLIC_IP}`);
                console.log('   📋 Pasos: API Management → Restrict IPs → Agregar IP');
                break;

            case -1021:
                console.log('   🚨 Timestamp outside recv window');
                console.log('   🔧 SOLUCIÓN: Sincronizar reloj del sistema');
                console.log('   ⏰ Usar: w32tm /resync (Windows) o ntpdate (Linux)');
                break;

            case -2010:
                console.log('   🚨 NEW_ORDER_REJECTED');
                console.log('   🔧 SOLUCIÓN: Verificar balance y permisos');
                break;

            case -1022:
                console.log('   🚨 Signature for this request is not valid');
                console.log('   🔧 SOLUCIÓN: Verificar SECRET_KEY');
                break;

            default:
                console.log(`   🚨 Error código ${error.code}: ${error.msg}`);
                console.log('   📖 Ver: https://binance-docs.github.io/apidocs/futures/en/#error-codes');
        }
    }
}

// Ejecutar test
if (require.main === module) {
    const tester = new FuturesAuthTester();
    tester.testFuturesAuth().catch(console.error);
}

module.exports = FuturesAuthTester;
