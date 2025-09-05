#!/usr/bin/env node

/**
 * QBTC SOCKS5 Proxy System
 * Sistema que usa SOCKS5 proxy para cambiar la IP real de conexión
 * Compatible con VPN y servicios proxy SOCKS5
 */

const https = require('https');
const { SocksProxyAgent } = require('socks-proxy-agent');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: path.join(__dirname, '.env') });

class Socks5ProxySystem {
    constructor() {
        console.log('🔧 QBTC SOCKS5 Proxy System - Inicializando...');

        this.systemState = {
            isInitialized: false,
            health: 'INITIALIZING',
            lastUpdate: Date.now(),
            version: '1.0.0'
        };

        // Configuración del proxy SOCKS5
        this.proxyConfig = {
            host: '181.43.212.196', // IP autorizada en Binance
            port: 1080, // Puerto SOCKS5 estándar
            type: 5, // SOCKS5
            userId: process.env.PROXY_USER || null,
            password: process.env.PROXY_PASS || null
        };

        this.config = {
            binanceApiKey: process.env.BINANCE_API_KEY,
            binanceSecretKey: process.env.BINANCE_SECRET_KEY,
            testnet: process.env.BINANCE_TESTNET === 'true'
        };

        console.log('🔍 Configuración del proxy SOCKS5:');
        console.log(`   Host: ${this.proxyConfig.host}`);
        console.log(`   Port: ${this.proxyConfig.port}`);
        console.log(`   Auth: ${this.proxyConfig.userId ? 'YES' : 'NO'}`);
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
     * Crear agente SOCKS5
     */
    createSocks5Agent() {
        let proxyUrl = `socks5://${this.proxyConfig.host}:${this.proxyConfig.port}`;

        if (this.proxyConfig.userId && this.proxyConfig.password) {
            proxyUrl = `socks5://${this.proxyConfig.userId}:${this.proxyConfig.password}@${this.proxyConfig.host}:${this.proxyConfig.port}`;
        }

        console.log(`🔗 Creando agente SOCKS5: ${proxyUrl.replace(/:[^:]*@/, ':***@')}`);
        return new SocksProxyAgent(proxyUrl);
    }

    /**
     * Hacer request autenticado a Binance usando SOCKS5
     */
    async makeAuthenticatedRequest(endpoint, baseUrl = 'https://fapi.binance.com') {
        return new Promise((resolve, reject) => {
            const timestamp = Date.now();
            const queryString = `timestamp=${timestamp}&recvWindow=5000`;
            const signature = this.createSignature(queryString);
            const fullPath = `${endpoint}?${queryString}&signature=${signature}`;

            const options = {
                hostname: baseUrl.replace('https://', ''),
                path: fullPath,
                method: 'GET',
                headers: {
                    'X-MBX-APIKEY': this.config.binanceApiKey,
                    'User-Agent': 'QBTC-SOCKS5-System/1.0'
                },
                agent: this.createSocks5Agent(),
                timeout: 15000
            };

            console.log(`🌐 Conectando vía SOCKS5 a: ${baseUrl}${endpoint}`);
            console.log(`📡 IP proxy: ${this.proxyConfig.host}:${this.proxyConfig.port}`);

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (res.statusCode === 200) {
                            console.log('✅ Request exitoso vía SOCKS5');
                            resolve(parsed);
                        } else {
                            console.log(`❌ Error HTTP ${res.statusCode}:`, parsed);
                            reject({
                                status: res.statusCode,
                                error: parsed,
                                data
                            });
                        }
                    } catch (parseError) {
                        console.error('❌ Error parseando respuesta:', parseError.message);
                        reject({
                            status: res.statusCode,
                            error: 'Parse error',
                            data
                        });
                    }
                });
            });

            req.on('error', (e) => {
                console.error('❌ Error de conexión SOCKS5:', e.message);
                reject(e);
            });

            req.on('timeout', () => {
                console.error('⏰ Timeout en conexión SOCKS5');
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
        console.log('💰 OBTENIENDO BALANCE DE FUTURES VIA SOCKS5...');

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
            console.log(`   🔗 Conexión: SOCKS5 proxy (${this.proxyConfig.host})`);

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

            const options = {
                agent: this.createSocks5Agent(),
                timeout: 10000
            };

            console.log(`📊 Obteniendo precio ${symbol} vía SOCKS5...`);

            https.get(url, options, (res) => {
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
     * Probar conexión SOCKS5
     */
    async testSocks5Connection() {
        console.log('🔍 PROBANDO CONEXIÓN SOCKS5...');

        try {
            // Probar con un request simple primero
            const testResponse = await this.getSymbolPrice('BTCUSDT');
            console.log(`✅ SOCKS5 funcionando - BTC: $${testResponse.price}`);
            return true;
        } catch (error) {
            console.error('❌ Error en conexión SOCKS5:', error.message);
            console.log('💡 Verifica que:');
            console.log('   1. El proxy SOCKS5 esté activo en', this.proxyConfig.host);
            console.log('   2. El puerto', this.proxyConfig.port, 'esté abierto');
            console.log('   3. Las credenciales sean correctas (si aplica)');
            return false;
        }
    }

    /**
     * Inicializar sistema con SOCKS5
     */
    async initializeSystem() {
        try {
            console.log('🚀 INICIANDO SISTEMA QBTC CON SOCKS5 PROXY');
            console.log('==========================================');

            // Verificar credenciales
            if (!this.config.binanceApiKey || !this.config.binanceSecretKey) {
                throw new Error('Credenciales de Binance no configuradas');
            }

            console.log('✅ Credenciales configuradas');

            // Probar conexión SOCKS5
            console.log('🔗 Probando conexión SOCKS5...');
            const socks5Working = await this.testSocks5Connection();

            if (!socks5Working) {
                console.log('⚠️ SOCKS5 no está funcionando, pero continuando...');
                console.log('💡 El sistema funcionará con la IP actual');
            }

            // Probar conexión con Binance
            console.log('🔗 Probando conexión con Binance vía SOCKS5...');
            const balance = await this.getFuturesBalance();

            // Probar obtener precio de BTC
            console.log('📊 Probando obtención de precios...');
            const btcPrice = await this.getSymbolPrice('BTCUSDT');
            console.log(`   ✅ BTC Price: $${btcPrice.price}`);

            this.systemState.isInitialized = true;
            this.systemState.health = 'HEALTHY';

            console.log('✅ SISTEMA QBTC SOCKS5 OPERATIVO');
            console.log('🎯 Balance disponible:', balance.availableBalance);
            console.log('📊 Estado del sistema:', this.systemState.health);
            console.log('🔗 Proxy SOCKS5:', socks5Working ? 'ACTIVO' : 'INACTIVO');

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
            timestamp: Date.now(),
            proxyConfig: {
                host: this.proxyConfig.host,
                port: this.proxyConfig.port,
                authenticated: !!(this.proxyConfig.userId && this.proxyConfig.password)
            }
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
            binanceConnection: this.config.binanceApiKey ? 'CONFIGURED' : 'NOT_CONFIGURED',
            socks5Proxy: {
                host: this.proxyConfig.host,
                port: this.proxyConfig.port,
                authenticated: !!(this.proxyConfig.userId && this.proxyConfig.password)
            }
        };
    }
}

// Exportar la clase
module.exports = { Socks5ProxySystem };

// Si se ejecuta directamente, inicializar el sistema
if (require.main === module) {
    const socks5System = new Socks5ProxySystem();

    socks5System.initializeSystem()
        .then(() => {
            console.log('🎉 Sistema QBTC SOCKS5 operativo');
            console.log('📊 Estado:', socks5System.getSystemState());
            console.log('📈 Métricas:', socks5System.getSystemMetrics());
        })
        .catch(error => {
            console.error('❌ Error inicializando sistema SOCKS5:', error);
            process.exit(1);
        });

    // Manejar señales de terminación
    process.on('SIGINT', () => {
        console.log('\n🔄 Sistema SOCKS5 detenido por SIGINT');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n🔄 Sistema SOCKS5 detenido por SIGTERM');
        process.exit(0);
    });
}