#!/usr/bin/env node

/**
 * QBTC-UNIFIED - System Integrator (Simplified)
 * Integrador simple que funciona con la infraestructura disponible
 */

const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: path.join(__dirname, '.env') });

class SimpleSystemIntegrator {
    constructor() {
        console.log('🔧 QBTC-UNIFIED System Integrator (Simplified) - Inicializando...');

        this.systemState = {
            isInitialized: false,
            health: 'INITIALIZING',
            lastUpdate: Date.now(),
            version: '1.0.0'
        };

        this.config = {
            binanceApiKey: process.env.BINANCE_API_KEY,
            binanceSecretKey: process.env.BINANCE_SECRET_KEY,
            testnet: process.env.BINANCE_TESTNET === 'true'
        };

        // Debug: mostrar variables de entorno
        console.log('🔍 DEBUG - Variables de entorno:');
        console.log('   BINANCE_API_KEY:', process.env.BINANCE_API_KEY ? 'CONFIGURADO' : 'NO CONFIGURADO');
        console.log('   BINANCE_SECRET_KEY:', process.env.BINANCE_SECRET_KEY ? 'CONFIGURADO' : 'NO CONFIGURADO');
        console.log('   BINANCE_TESTNET:', process.env.BINANCE_TESTNET);
        console.log('   Archivo .env cargado desde:', path.join(__dirname, '.env'));
    }

    /**
     * Crear firma HMAC-SHA256 para Binance
     */
    createSignature(queryString) {
        return crypto.createHmac('sha256', this.config.binanceSecretKey)
            .update(queryString)
            .digest('hex');
    }

    /**
     * Hacer request autenticado a Binance
     */
    async makeAuthenticatedRequest(endpoint, baseUrl = 'https://fapi.binance.com') {
        return new Promise((resolve, reject) => {
            const timestamp = Date.now();
            const queryString = `timestamp=${timestamp}&recvWindow=5000`;
            const signature = this.createSignature(queryString);
            const fullPath = `${endpoint}?${queryString}&signature=${signature}`;

            const req = https.request({
                hostname: baseUrl.replace('https://', ''),
                path: fullPath,
                method: 'GET',
                headers: {
                    'X-MBX-APIKEY': this.config.binanceApiKey,
                    'User-Agent': 'QBTC-Unified-System/1.0'
                },
                timeout: 10000
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (res.statusCode === 200) {
                            resolve(parsed);
                        } else {
                            reject({
                                status: res.statusCode,
                                error: parsed,
                                data
                            });
                        }
                    } catch (parseError) {
                        reject({
                            status: res.statusCode,
                            error: 'Parse error',
                            data
                        });
                    }
                });
            });

            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            req.end();
        });
    }

    /**
     * Obtener balance de cuenta de Futures
     */
    async getFuturesBalance() {
        console.log('💰 OBTENIENDO BALANCE DE FUTURES...');

        try {
            const account = await this.makeAuthenticatedRequest('/fapi/v2/account');

            const balance = {
                totalWalletBalance: parseFloat(account.totalWalletBalance || '0'),
                totalUnrealizedProfit: parseFloat(account.totalUnrealizedProfit || '0'),
                availableBalance: parseFloat(account.availableBalance || '0'),
                canTrade: account.canTrade,
                updateTime: account.updateTime
            };

            console.log(`   ✅ Total Wallet Balance: $${balance.totalWalletBalance.toFixed(2)} USDT`);
            console.log(`   📊 Available Balance: $${balance.availableBalance.toFixed(2)} USDT`);
            console.log(`   📈 Unrealized PnL: $${balance.totalUnrealizedProfit.toFixed(2)} USDT`);

            return balance;

        } catch (error) {
            console.error('❌ Error obteniendo balance de Futures:', error);
            throw error;
        }
    }

    /**
     * Obtener precio de un símbolo
     */
    async getSymbolPrice(symbol) {
        return new Promise((resolve, reject) => {
            const url = `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`;

            https.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        resolve(parsed);
                    } catch (error) {
                        reject(error);
                    }
                });
            }).on('error', reject);
        });
    }

    /**
     * Inicializar sistema básico
     */
    async initializeSystem() {
        try {
            console.log('🚀 INICIANDO SISTEMA QBTC-UNIFIED SIMPLIFICADO');

            // Verificar credenciales
            if (!this.config.binanceApiKey || !this.config.binanceSecretKey) {
                throw new Error('Credenciales de Binance no configuradas');
            }

            console.log('✅ Credenciales configuradas');

            // Probar conexión con Binance
            console.log('🔗 Probando conexión con Binance...');
            const balance = await this.getFuturesBalance();

            // Probar obtener precio de BTC
            console.log('📊 Probando obtención de precios...');
            const btcPrice = await this.getSymbolPrice('BTCUSDT');
            console.log(`   ✅ BTC Price: $${btcPrice.price}`);

            this.systemState.isInitialized = true;
            this.systemState.health = 'HEALTHY';

            console.log('✅ SISTEMA QBTC-UNIFIED OPERATIVO');
            console.log('🎯 Balance disponible:', balance.availableBalance);
            console.log('📊 Estado del sistema:', this.systemState.health);

            return true;

        } catch (error) {
            console.error('❌ Error inicializando sistema:', error);
            this.systemState.health = 'ERROR';
            throw error;
        }
    }

    /**
     * Obtener estado del sistema
     */
    getSystemState() {
        return {
            ...this.systemState,
            timestamp: Date.now()
        };
    }

    /**
     * Obtener métricas básicas
     */
    getSystemMetrics() {
        return {
            systemHealth: this.systemState.health,
            uptime: Date.now() - this.systemState.lastUpdate,
            version: this.systemState.version,
            binanceConnection: this.config.binanceApiKey ? 'CONFIGURED' : 'NOT_CONFIGURED'
        };
    }
}

// Exportar la clase
module.exports = { SimpleSystemIntegrator };

// Si se ejecuta directamente, inicializar el sistema
if (require.main === module) {
    const integrator = new SimpleSystemIntegrator();

    integrator.initializeSystem()
        .then(() => {
            console.log('🎉 Sistema QBTC-UNIFIED operativo');
            console.log('📊 Estado:', integrator.getSystemState());
            console.log('📈 Métricas:', integrator.getSystemMetrics());
        })
        .catch(error => {
            console.error('❌ Error inicializando sistema:', error);
            process.exit(1);
        });

    // Manejar señales de terminación
    process.on('SIGINT', () => {
        console.log('\n🔄 Sistema detenido por SIGINT');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n🔄 Sistema detenido por SIGTERM');
        process.exit(0);
    });
}
