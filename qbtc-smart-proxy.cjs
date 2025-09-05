#!/usr/bin/env node

/**
 * QBTC Smart Proxy System
 * Sistema inteligente de proxy que rota entre múltiples proveedores
 * Soporta Bright Data, Oxylabs, Smart Proxy, y otros servicios
 */

const https = require('https');
const { SocksProxyAgent } = require('socks-proxy-agent');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: path.join(__dirname, '.env') });

class QBTCSmartProxy {
    constructor() {
        console.log('🧠 QBTC Smart Proxy System - Inicializando...');

        this.systemState = {
            isInitialized: false,
            currentProvider: null,
            connectionActive: false,
            ipRotationEnabled: true,
            lastRotation: Date.now(),
            rotationInterval: 5 * 60 * 1000, // 5 minutos
            successCount: 0,
            failureCount: 0
        };

        // Configuración de proveedores de proxy
        this.providers = {
            brightdata: {
                name: 'Bright Data',
                type: 'socks5',
                host: process.env.BRIGHTDATA_HOST || 'your-zone-country-city.lum-superproxy.io',
                port: process.env.BRIGHTDATA_PORT || 22225,
                username: process.env.BRIGHTDATA_USERNAME || 'your-username',
                password: process.env.BRIGHTDATA_PASSWORD || 'your-password',
                enabled: true,
                priority: 1
            },
            oxylabs: {
                name: 'Oxylabs',
                type: 'socks5',
                host: process.env.OXYLABS_HOST || 'pr.oxylabs.io',
                port: process.env.OXYLABS_PORT || 7777,
                username: process.env.OXYLABS_USERNAME || 'your-username',
                password: process.env.OXYLABS_PASSWORD || 'your-password',
                enabled: true,
                priority: 2
            },
            smartproxy: {
                name: 'Smart Proxy',
                type: 'socks5',
                host: process.env.SMARTPROXY_HOST || 'gate.smartproxy.com',
                port: process.env.SMARTPROXY_PORT || 7000,
                username: process.env.SMARTPROXY_USERNAME || 'your-username',
                password: process.env.SMARTPROXY_PASSWORD || 'your-password',
                enabled: true,
                priority: 3
            },
            custom: {
                name: 'Custom Proxy',
                type: 'socks5',
                host: process.env.CUSTOM_PROXY_HOST || '181.43.212.196',
                port: process.env.CUSTOM_PROXY_PORT || 1080,
                username: process.env.CUSTOM_PROXY_USER || null,
                password: process.env.CUSTOM_PROXY_PASS || null,
                enabled: true,
                priority: 4
            }
        };

        this.config = {
            binanceApiKey: process.env.BINANCE_API_KEY,
            binanceSecretKey: process.env.BINANCE_SECRET_KEY,
            testnet: process.env.BINANCE_TESTNET === 'true',
            rotationEnabled: process.env.PROXY_ROTATION === 'true',
            maxRetries: 3,
            timeout: 30000
        };

        console.log('🔧 Configuración de proveedores:');
        Object.entries(this.providers).forEach(([key, provider]) => {
            if (provider.enabled) {
                console.log(`   ✅ ${provider.name}: ${provider.host}:${provider.port}`);
            } else {
                console.log(`   ❌ ${provider.name}: Deshabilitado`);
            }
        });
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
     * Crear agente SOCKS5 para un proveedor específico
     */
    createProxyAgent(providerKey) {
        const provider = this.providers[providerKey];
        if (!provider || !provider.enabled) {
            throw new Error(`Proveedor ${providerKey} no disponible`);
        }

        let proxyUrl;
        if (provider.username && provider.password) {
            proxyUrl = `socks5://${provider.username}:${provider.password}@${provider.host}:${provider.port}`;
        } else {
            proxyUrl = `socks5://${provider.host}:${provider.port}`;
        }

        console.log(`🔗 Creando agente para ${provider.name}: ${proxyUrl.replace(/:[^:]*@/, ':***@')}`);
        return new SocksProxyAgent(proxyUrl);
    }

    /**
     * Probar conexión con un proveedor específico
     */
    async testProvider(providerKey) {
        console.log(`🧪 Probando proveedor: ${this.providers[providerKey].name}`);

        try {
            const agent = this.createProxyAgent(providerKey);

            // Probar con una petición simple a Binance
            const symbol = 'BTCUSDT';
            const url = `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`;

            const response = await this.makeRequest(url, agent);
            const data = JSON.parse(response);

            if (data.symbol === symbol && data.price) {
                console.log(`✅ ${this.providers[providerKey].name} funciona - BTC: $${data.price}`);
                this.systemState.successCount++;
                return { success: true, price: data.price };
            } else {
                throw new Error('Respuesta inválida');
            }

        } catch (error) {
            console.log(`❌ ${this.providers[providerKey].name} falló: ${error.message}`);
            this.systemState.failureCount++;
            return { success: false, error: error.message };
        }
    }

    /**
     * Hacer petición HTTP con agente proxy
     */
    makeRequest(url, agent) {
        return new Promise((resolve, reject) => {
            const options = {
                agent: agent,
                timeout: this.config.timeout,
                headers: {
                    'User-Agent': 'QBTC-Smart-Proxy/1.0'
                }
            };

            const req = https.get(url, options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(data);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                    }
                });
            });

            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
        });
    }

    /**
     * Seleccionar mejor proveedor disponible
     */
    async selectBestProvider() {
        console.log('🎯 Seleccionando mejor proveedor...');

        const enabledProviders = Object.entries(this.providers)
            .filter(([_, provider]) => provider.enabled)
            .sort((a, b) => a[1].priority - b[1].priority);

        for (const [key, provider] of enabledProviders) {
            console.log(`🔍 Probando ${provider.name} (prioridad ${provider.priority})...`);

            const testResult = await this.testProvider(key);
            if (testResult.success) {
                console.log(`✅ Proveedor seleccionado: ${provider.name}`);
                this.systemState.currentProvider = key;
                return key;
            }
        }

        console.log('❌ No hay proveedores funcionando');
        return null;
    }

    /**
     * Rotar a siguiente proveedor
     */
    async rotateProvider() {
        console.log('🔄 Rotando proveedor...');

        const currentIndex = Object.keys(this.providers).indexOf(this.systemState.currentProvider);
        const providerKeys = Object.keys(this.providers);
        const nextIndex = (currentIndex + 1) % providerKeys.length;

        const nextProvider = providerKeys[nextIndex];
        console.log(`🔄 Cambiando de ${this.providers[this.systemState.currentProvider]?.name || 'ninguno'} a ${this.providers[nextProvider].name}`);

        const testResult = await this.testProvider(nextProvider);
        if (testResult.success) {
            this.systemState.currentProvider = nextProvider;
            this.systemState.lastRotation = Date.now();
            console.log(`✅ Rotación exitosa a ${this.providers[nextProvider].name}`);
            return true;
        } else {
            console.log(`❌ Rotación fallida a ${this.providers[nextProvider].name}`);
            return false;
        }
    }

    /**
     * Verificar si es tiempo de rotar
     */
    shouldRotate() {
        if (!this.config.rotationEnabled) return false;

        const timeSinceLastRotation = Date.now() - this.systemState.lastRotation;
        return timeSinceLastRotation > this.systemState.rotationInterval;
    }

    /**
     * Hacer request autenticado a Binance con proxy inteligente
     */
    async makeAuthenticatedRequest(endpoint, baseUrl = 'https://fapi.binance.com') {
        // Verificar si necesitamos rotar proveedor
        if (this.shouldRotate()) {
            await this.rotateProvider();
        }

        // Si no hay proveedor seleccionado, seleccionar uno
        if (!this.systemState.currentProvider) {
            const selected = await this.selectBestProvider();
            if (!selected) {
                throw new Error('No hay proveedores disponibles');
            }
        }

        const timestamp = Date.now();
        const queryString = `timestamp=${timestamp}&recvWindow=5000`;
        const signature = this.createSignature(queryString);
        const fullPath = `${endpoint}?${queryString}&signature=${signature}`;

        const agent = this.createProxyAgent(this.systemState.currentProvider);

        const options = {
            hostname: baseUrl.replace('https://', ''),
            path: fullPath,
            method: 'GET',
            headers: {
                'X-MBX-APIKEY': this.config.binanceApiKey,
                'User-Agent': 'QBTC-Smart-Proxy/1.0'
            },
            agent: agent,
            timeout: this.config.timeout
        };

        console.log(`🌐 Conectando vía ${this.providers[this.systemState.currentProvider].name} a: ${baseUrl}${endpoint}`);

        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (res.statusCode === 200) {
                            console.log(`✅ Request exitoso vía ${this.providers[this.systemState.currentProvider].name}`);
                            resolve(parsed);
                        } else {
                            console.log(`❌ Error HTTP ${res.statusCode}: ${parsed.msg || 'Unknown error'}`);

                            // Si hay error de IP, intentar rotar
                            if (parsed.code === -2015) {
                                console.log('🔄 Error de IP detectado, intentando rotar proveedor...');
                                this.rotateProvider().then(() => {
                                    // Reintentar con nuevo proveedor
                                    this.makeAuthenticatedRequest(endpoint, baseUrl)
                                        .then(resolve)
                                        .catch(reject);
                                }).catch(() => {
                                    reject({
                                        status: res.statusCode,
                                        error: parsed,
                                        data
                                    });
                                });
                            } else {
                                reject({
                                    status: res.statusCode,
                                    error: parsed,
                                    data
                                });
                            }
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

            req.on('error', (e) => {
                console.error(`❌ Error de conexión: ${e.message}`);

                // Intentar rotar proveedor en caso de error de conexión
                this.rotateProvider().then(() => {
                    console.log('🔄 Reintentando con nuevo proveedor...');
                    this.makeAuthenticatedRequest(endpoint, baseUrl)
                        .then(resolve)
                        .catch(reject);
                }).catch(() => {
                    reject(e);
                });
            });

            req.on('timeout', () => {
                console.error('⏰ Timeout en conexión');
                req.destroy();

                // Intentar rotar proveedor en timeout
                this.rotateProvider().then(() => {
                    console.log('🔄 Reintentando después de timeout...');
                    this.makeAuthenticatedRequest(endpoint, baseUrl)
                        .then(resolve)
                        .catch(reject);
                }).catch(() => {
                    reject(new Error('Request timeout'));
                });
            });

            req.end();
        });
    }

    /**
     * Obtener balance de cuenta de Futures
     */
    async getFuturesBalance() {
        console.log('💰 OBTENIENDO BALANCE DE FUTURES VIA SMART PROXY...');

        try {
            const account = await this.makeAuthenticatedRequest('/fapi/v2/account');

            const balance = {
                totalWalletBalance: parseFloat(account.totalWalletBalance || '0'),
                totalUnrealizedProfit: parseFloat(account.totalUnrealizedProfit || '0'),
                availableBalance: parseFloat(account.availableBalance || '0'),
                canTrade: account.canTrade,
                updateTime: account.updateTime,
                proxyProvider: this.providers[this.systemState.currentProvider]?.name || 'Unknown'
            };

            console.log(`   ✅ Total Wallet Balance: $${balance.totalWalletBalance.toFixed(2)} USDT`);
            console.log(`   📊 Available Balance: $${balance.availableBalance.toFixed(2)} USDT`);
            console.log(`   📈 Unrealized PnL: $${balance.totalUnrealizedProfit.toFixed(2)} USDT`);
            console.log(`   🔗 Proxy: ${balance.proxyProvider}`);

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
        try {
            if (!this.systemState.currentProvider) {
                await this.selectBestProvider();
            }

            const agent = this.createProxyAgent(this.systemState.currentProvider);
            const url = `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`;

            console.log(`📊 Obteniendo precio ${symbol} vía ${this.providers[this.systemState.currentProvider].name}...`);

            const response = await this.makeRequest(url, agent);
            const data = JSON.parse(response);

            return data;

        } catch (error) {
            console.error(`❌ Error obteniendo precio ${symbol}:`, error.message);
            throw error;
        }
    }

    /**
     * Inicializar sistema Smart Proxy
     */
    async initializeSystem() {
        try {
            console.log('🚀 INICIANDO SISTEMA QBTC SMART PROXY');
            console.log('=====================================');

            // Verificar credenciales
            if (!this.config.binanceApiKey || !this.config.binanceSecretKey) {
                throw new Error('Credenciales de Binance no configuradas');
            }

            console.log('✅ Credenciales configuradas');

            // Seleccionar mejor proveedor inicial
            console.log('🎯 Seleccionando proveedor inicial...');
            const selectedProvider = await this.selectBestProvider();

            if (!selectedProvider) {
                throw new Error('No se pudo seleccionar un proveedor de proxy');
            }

            // Probar conexión con Binance
            console.log('🔗 Probando conexión con Binance vía Smart Proxy...');
            const balance = await this.getFuturesBalance();

            // Probar obtener precio de BTC
            console.log('📊 Probando obtención de precios...');
            const btcPrice = await this.getSymbolPrice('BTCUSDT');
            console.log(`   ✅ BTC Price: $${btcPrice.price}`);

            this.systemState.isInitialized = true;
            this.systemState.connectionActive = true;

            console.log('✅ SISTEMA QBTC SMART PROXY OPERATIVO');
            console.log('🎯 Balance disponible:', balance.availableBalance);
            console.log('📊 Estado del sistema:', 'HEALTHY');
            console.log('🔗 Proveedor activo:', balance.proxyProvider);
            console.log('🔄 Rotación automática:', this.config.rotationEnabled ? 'ACTIVADA' : 'DESACTIVADA');

            return true;

        } catch (error) {
            console.error('❌ Error inicializando sistema Smart Proxy:', error);
            this.systemState.connectionActive = false;
            throw error;
        }
    }

    /**
     * Obtener estado del sistema
     */
    getSystemState() {
        return {
            ...this.systemState,
            config: this.config,
            providers: Object.entries(this.providers).map(([key, provider]) => ({
                key,
                name: provider.name,
                enabled: provider.enabled,
                priority: provider.priority,
                active: key === this.systemState.currentProvider
            })),
            timestamp: Date.now()
        };
    }

    /**
     * Obtener métricas del sistema
     */
    getSystemMetrics() {
        return {
            systemHealth: this.systemState.connectionActive ? 'HEALTHY' : 'ERROR',
            uptime: Date.now() - this.systemState.lastRotation,
            version: '1.0.0',
            binanceConnection: this.config.binanceApiKey ? 'CONFIGURED' : 'NOT_CONFIGURED',
            currentProvider: this.providers[this.systemState.currentProvider]?.name || 'None',
            rotationEnabled: this.config.rotationEnabled,
            successRate: this.systemState.successCount + this.systemState.failureCount > 0 ?
                (this.systemState.successCount / (this.systemState.successCount + this.systemState.failureCount) * 100).toFixed(1) + '%' :
                'N/A'
        };
    }

    /**
     * Hacer petición HTTP genérica con proxy inteligente
     */
    async makeRequest(url, options = {}) {
        // Verificar si necesitamos rotar proveedor
        if (this.shouldRotate()) {
            await this.rotateProvider();
        }

        // Si no hay proveedor seleccionado, seleccionar uno
        if (!this.systemState.currentProvider) {
            const selected = await this.selectBestProvider();
            if (!selected) {
                throw new Error('No hay proveedores disponibles');
            }
        }

        const agent = this.createProxyAgent(this.systemState.currentProvider);

        const requestOptions = {
            agent: agent,
            timeout: this.config.timeout,
            headers: {
                'User-Agent': 'QBTC-Smart-Proxy/1.0',
                ...options.headers
            },
            ...options
        };

        console.log(`🌐 Petición vía ${this.providers[this.systemState.currentProvider].name}: ${options.method || 'GET'} ${url}`);

        return new Promise((resolve, reject) => {
            const req = https.request(url, requestOptions, (res) => {
                let data = '';

                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        console.log(`✅ Petición exitosa vía ${this.providers[this.systemState.currentProvider].name}`);
                        resolve({
                            status: res.statusCode,
                            data: data,
                            headers: res.headers
                        });
                    } else {
                        console.log(`❌ Error HTTP ${res.statusCode} vía ${this.providers[this.systemState.currentProvider].name}`);

                        // Intentar rotar si hay error de IP
                        if (data.includes('-2015') || data.includes('Invalid API-key, IP')) {
                            console.log('🔄 Error de IP detectado, intentando rotar proveedor...');
                            this.rotateProvider().then(() => {
                                // Reintentar con nuevo proveedor
                                this.makeRequest(url, options)
                                    .then(resolve)
                                    .catch(reject);
                            }).catch(() => {
                                reject({
                                    status: res.statusCode,
                                    data: data,
                                    headers: res.headers
                                });
                            });
                        } else {
                            reject({
                                status: res.statusCode,
                                data: data,
                                headers: res.headers
                            });
                        }
                    }
                });
            });

            req.on('error', (error) => {
                console.error(`❌ Error de conexión: ${error.message}`);

                // Intentar rotar proveedor en caso de error de conexión
                this.rotateProvider().then(() => {
                    console.log('🔄 Reintentando con nuevo proveedor...');
                    this.makeRequest(url, options)
                        .then(resolve)
                        .catch(reject);
                }).catch(() => {
                    reject(error);
                });
            });

            req.on('timeout', () => {
                console.error('⏰ Timeout en conexión');
                req.destroy();

                // Intentar rotar proveedor en timeout
                this.rotateProvider().then(() => {
                    console.log('🔄 Reintentando después de timeout...');
                    this.makeRequest(url, options)
                        .then(resolve)
                        .catch(reject);
                }).catch(() => {
                    reject(new Error('Request timeout'));
                });
            });

            // Si hay body, escribirlo
            if (options.body) {
                req.write(options.body);
            }

            req.end();
        });
    }

    /**
     * Forzar rotación de proveedor
     */
    async forceRotate() {
        console.log('🔄 Forzando rotación de proveedor...');
        const success = await this.rotateProvider();

        if (success) {
            console.log(`✅ Rotación exitosa a ${this.providers[this.systemState.currentProvider].name}`);
        } else {
            console.log('❌ No se pudo rotar proveedor');
        }

        return success;
    }
}

// Exportar la clase
module.exports = { QBTCSmartProxy };

// Si se ejecuta directamente, inicializar el sistema
if (require.main === module) {
    const smartProxy = new QBTCSmartProxy();

    smartProxy.initializeSystem()
        .then(() => {
            console.log('🎉 Sistema QBTC Smart Proxy operativo');
            console.log('📊 Estado:', smartProxy.getSystemState());
            console.log('📈 Métricas:', smartProxy.getSystemMetrics());

            // Mantener sistema corriendo
            console.log('\n🔄 Sistema ejecutándose... Presiona Ctrl+C para salir');

            // Configurar rotación automática cada 5 minutos
            setInterval(async () => {
                if (smartProxy.config.rotationEnabled && smartProxy.shouldRotate()) {
                    console.log('\n⏰ Rotación automática programada...');
                    await smartProxy.forceRotate();
                }
            }, 60000); // Verificar cada minuto

        })
        .catch(error => {
            console.error('❌ Error inicializando sistema Smart Proxy:', error);
            process.exit(1);
        });

    // Manejar señales de terminación
    process.on('SIGINT', () => {
        console.log('\n🔄 Sistema Smart Proxy detenido por SIGINT');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n🔄 Sistema Smart Proxy detenido por SIGTERM');
        process.exit(0);
    });
}