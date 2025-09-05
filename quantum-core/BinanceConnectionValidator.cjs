/*
  Copyright © 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES.
  Binance Connection Validator - Validador de conexión y allocation Binance
  Verifica conectividad, balance, y calcula allocation automático
*/

const axios = require('axios');
const crypto = require('crypto');
const { CredentialsManager } = require('./CredentialsManager');

class BinanceConnectionValidator {
    constructor() {
        this.baseURL = 'https://fapi.binance.com';
        this.testnetURL = 'https://testnet.binancefuture.com';
        
        // **INICIALIZAR CREDENTIALS MANAGER**: Carga inteligente de credenciales
        console.log('[BINANCE CONNECTION VALIDATOR] 🔐 Inicializando gestor de credenciales...');
        this.credentialsManager = CredentialsManager.getInstance();
        
        // Obtener credenciales del gestor
        const credentials = this.credentialsManager.getCredentials();
        this.apiKey = credentials.apiKey;
        this.secretKey = credentials.secretKey;
        this.isTestnet = credentials.isTestnet;
        this.skipValidation = process.env.SKIP_API_VALIDATION === 'true';
        
        // Log de diagnóstico usando CredentialsManager
        const credStatus = this.credentialsManager.getCredentialStatus();
        console.log('[BINANCE CONNECTION VALIDATOR] 🔗 Validador de conexión inicializado');
        console.log(`[BINANCE CONNECTION VALIDATOR] 🔐 Estado de credenciales (vía CredentialsManager):`);
        console.log(`  API_KEY: ${credStatus.apiKey ? 'SET' : 'MISSING'} ${credStatus.apiKeySource ? `(${credStatus.apiKeySource})` : ''}`);
        console.log(`  SECRET: ${credStatus.secretKey ? 'SET' : 'MISSING'} ${credStatus.secretKeySource ? `(${credStatus.secretKeySource})` : ''}`);
        console.log(`  TESTNET: ${credStatus.isTestnet ? 'ENABLED' : 'DISABLED'} ${credStatus.isTestnetSource ? `(${credStatus.isTestnetSource})` : ''}`);
        console.log(`  Fuentes consultadas: ${credStatus.sourcesChecked || 'N/A'}`);
    }

    // **CREAR FIRMA PARA PETICIONES AUTENTICADAS**
    createSignature(queryString) {
        return crypto
            .createHmac('sha256', this.secretKey)
            .update(queryString)
            .digest('hex');
    }

    // **HACER PETICIÓN A BINANCE**
    async makeRequest(method, endpoint, params = {}) {
        const url = this.isTestnet ? this.testnetURL : this.baseURL;
        
        try {
            const config = {
                method: method,
                url: url + endpoint,
                headers: {
                    'X-MBX-APIKEY': this.apiKey
                }
            };

            if (method === 'GET') {
                const queryString = new URLSearchParams(params).toString();
                if (queryString) {
                    config.url += '?' + queryString;
                }
            } else {
                config.data = params;
            }

            const response = await axios(config);
            return response.data;
        } catch (error) {
            throw new Error(`Binance API Error: ${error.response?.data?.msg || error.message}`);
        }
    }

    // **HACER PETICIÓN AUTENTICADA**
    async makeAuthenticatedRequest(method, endpoint, params = {}) {
        if (!this.apiKey || !this.secretKey) {
            throw new Error('API Key y Secret Key requeridos para peticiones autenticadas');
        }

        const timestamp = Date.now();
        const paramsWithTimestamp = { ...params, timestamp };
        
        const queryString = new URLSearchParams(paramsWithTimestamp).toString();
        const signature = this.createSignature(queryString);
        
        const finalParams = { ...paramsWithTimestamp, signature };
        
        return this.makeRequest(method, endpoint, finalParams);
    }

    // **VALIDAR CONEXIÓN COMPLETA**
    async validateBinanceConnection() {
        console.log('[CONNECTION VALIDATOR] 🔍 Iniciando validación de conexión Binance...');
        
        const validation = {
            success: false,
            errors: [],
            warnings: [],
            serverTime: null,
            accountInfo: null,
            balances: null,
            allocation: null,
            exchangeInfo: null,
            testnet: this.isTestnet
        };

        try {
            // **PASO 1**: Validar tiempo del servidor
            await this.validateServerTime(validation);
            
            // **PASO 2**: Validar información del exchange  
            await this.validateExchangeInfo(validation);
            
            // Si skip validation está habilitado, solo hacer validaciones básicas
            if (this.skipValidation) {
                console.log('[CONNECTION VALIDATOR] ⚠️ Validación completa omitida - Modo desarrollo');
                validation.warnings.push('Validación API omitida - Modo desarrollo');
                validation.allocation = this.calculateMockAllocation();
                validation.success = true;
                return validation;
            }

            // **PASO 3**: Validar credenciales y cuenta
            if (!this.apiKey || !this.secretKey) {
                validation.errors.push('Credenciales API no configuradas');
                validation.warnings.push('Funcionando en modo solo lectura');
                validation.allocation = this.calculateMockAllocation();
                validation.success = validation.errors.length === 0;
                return validation;
            }

            await this.validateAccountInfo(validation);
            
            // **PASO 4**: Calcular allocation
            this.calculateAllocation(validation);
            
            validation.success = validation.errors.length === 0;
            
            if (validation.success) {
                console.log('[CONNECTION VALIDATOR] ✅ Validación de conexión completada exitosamente');
            } else {
                console.log(`[CONNECTION VALIDATOR] ❌ Validación falló: ${validation.errors.join(', ')}`);
            }
            
            return validation;
            
        } catch (error) {
            console.error('[CONNECTION VALIDATOR] 💥 Error durante validación:', error.message);
            validation.errors.push(`Error de validación: ${error.message}`);
            validation.success = false;
            return validation;
        }
    }

    // **VALIDAR TIEMPO DEL SERVIDOR**
    async validateServerTime(validation) {
        try {
            console.log('[CONNECTION VALIDATOR] ⏰ Validando tiempo del servidor...');
            
            const serverTime = await this.makeRequest('GET', '/fapi/v1/time');
            validation.serverTime = serverTime.serverTime;
            
            const localTime = Date.now();
            const timeDiff = Math.abs(localTime - serverTime.serverTime);
            
            if (timeDiff > 5000) { // 5 segundos
                validation.warnings.push(`Diferencia de tiempo alta: ${timeDiff}ms`);
            }
            
            console.log('[CONNECTION VALIDATOR] ✅ Tiempo del servidor validado');
        } catch (error) {
            validation.errors.push(`Error validando tiempo del servidor: ${error.message}`);
        }
    }

    // **VALIDAR INFORMACIÓN DEL EXCHANGE**
    async validateExchangeInfo(validation) {
        try {
            console.log('[CONNECTION VALIDATOR] 📊 Validando información del exchange...');
            
            const exchangeInfo = await this.makeRequest('GET', '/fapi/v1/exchangeInfo');
            validation.exchangeInfo = {
                timezone: exchangeInfo.timezone,
                serverTime: exchangeInfo.serverTime,
                symbolsCount: exchangeInfo.symbols.length,
                rateLimits: exchangeInfo.rateLimits
            };
            
            console.log(`[CONNECTION VALIDATOR] ✅ Exchange Info validado - ${exchangeInfo.symbols.length} símbolos disponibles`);
        } catch (error) {
            validation.errors.push(`Error validando exchange info: ${error.message}`);
        }
    }

    // **VALIDAR INFORMACIÓN DE LA CUENTA**
    async validateAccountInfo(validation) {
        try {
            console.log('[CONNECTION VALIDATOR] 👤 Validando información de la cuenta...');
            
            const accountInfo = await this.makeAuthenticatedRequest('GET', '/fapi/v2/account');
            
            validation.accountInfo = {
                canTrade: accountInfo.canTrade,
                canDeposit: accountInfo.canDeposit,
                canWithdraw: accountInfo.canWithdraw,
                feeTier: accountInfo.feeTier,
                maxWithdrawAmount: accountInfo.maxWithdrawAmount,
                totalWalletBalance: parseFloat(accountInfo.totalWalletBalance),
                totalUnrealizedProfit: parseFloat(accountInfo.totalUnrealizedProfit),
                totalMarginBalance: parseFloat(accountInfo.totalMarginBalance),
                totalPositionInitialMargin: parseFloat(accountInfo.totalPositionInitialMargin),
                totalOpenOrderInitialMargin: parseFloat(accountInfo.totalOpenOrderInitialMargin),
                availableBalance: parseFloat(accountInfo.availableBalance)
            };

            // Extraer balances relevantes
            validation.balances = accountInfo.assets
                .filter(asset => parseFloat(asset.walletBalance) > 0 || asset.asset === 'USDT')
                .map(asset => ({
                    asset: asset.asset,
                    walletBalance: parseFloat(asset.walletBalance),
                    unrealizedProfit: parseFloat(asset.unrealizedProfit),
                    marginBalance: parseFloat(asset.marginBalance),
                    availableBalance: parseFloat(asset.availableBalance)
                }));

            if (!accountInfo.canTrade) {
                validation.errors.push('Cuenta no habilitada para trading');
            }

            console.log('[CONNECTION VALIDATOR] ✅ Información de cuenta validada');
            console.log(`[CONNECTION VALIDATOR] 💰 Balance disponible: ${validation.accountInfo.availableBalance.toFixed(2)} USDT`);
            
        } catch (error) {
            validation.errors.push(`Error validando cuenta: ${error.message}`);
        }
    }

    // **CALCULAR ALLOCATION**
    calculateAllocation(validation) {
        console.log('[CONNECTION VALIDATOR] 🧮 Calculando allocation automático...');
        
        const availableBalance = validation.accountInfo?.availableBalance || 0;
        
        if (availableBalance <= 0) {
            validation.errors.push('Balance insuficiente para trading');
            return;
        }

        // **ALLOCATION CUÁNTICO**: Algoritmo basado en balance y riesgo
        const riskLevels = {
            conservative: { allocationPercent: 10, maxPosition: 5, riskMultiplier: 1.0 },
            moderate: { allocationPercent: 25, maxPosition: 10, riskMultiplier: 2.0 },
            aggressive: { allocationPercent: 50, maxPosition: 25, riskMultiplier: 4.0 },
            extreme: { allocationPercent: 80, maxPosition: 50, riskMultiplier: 8.0 }
        };

        // Determinar nivel de riesgo basado en balance
        let riskLevel = 'conservative';
        if (availableBalance > 100) riskLevel = 'moderate';
        if (availableBalance > 1000) riskLevel = 'aggressive';  
        if (availableBalance > 10000) riskLevel = 'extreme';

        const risk = riskLevels[riskLevel];
        
        validation.allocation = {
            availableBalance: availableBalance,
            riskLevel: riskLevel,
            allocationPercent: risk.allocationPercent,
            totalAllocation: (availableBalance * risk.allocationPercent) / 100,
            maxPositionPercent: risk.maxPosition,
            maxPositionSize: (availableBalance * risk.maxPosition) / 100,
            recommendedLeverage: Math.min(10, Math.floor(risk.riskMultiplier * 2.5)),
            maxConcurrentPositions: Math.floor(risk.allocationPercent / 5),
            emergencyReserve: availableBalance * 0.1, // 10% reserva
            riskMultiplier: risk.riskMultiplier
        };

        console.log(`[CONNECTION VALIDATOR] 🎯 Allocation calculado para nivel ${riskLevel}:`);
        console.log(`[CONNECTION VALIDATOR]    • Total allocation: ${validation.allocation.totalAllocation.toFixed(2)} USDT (${risk.allocationPercent}%)`);
        console.log(`[CONNECTION VALIDATOR]    • Max posición: ${validation.allocation.maxPositionSize.toFixed(2)} USDT (${risk.maxPosition}%)`);
        console.log(`[CONNECTION VALIDATOR]    • Leverage recomendado: ${validation.allocation.recommendedLeverage}x`);
        console.log(`[CONNECTION VALIDATOR]    • Posiciones concurrentes: ${validation.allocation.maxConcurrentPositions}`);
    }

    // **CALCULAR MOCK ALLOCATION** (para modo desarrollo)
    calculateMockAllocation() {
        return {
            availableBalance: 1000,
            riskLevel: 'moderate',
            allocationPercent: 25,
            totalAllocation: 250,
            maxPositionPercent: 10,
            maxPositionSize: 100,
            recommendedLeverage: 5,
            maxConcurrentPositions: 5,
            emergencyReserve: 100,
            riskMultiplier: 2.0,
            mockMode: true
        };
    }

    // **TEST DE CONECTIVIDAD BÁSICA**
    async testBasicConnectivity() {
        try {
            const response = await this.makeRequest('GET', '/fapi/v1/ping');
            return { success: true, message: 'Conectividad básica OK' };
        } catch (error) {
            return { success: false, message: `Error de conectividad: ${error.message}` };
        }
    }

    // **OBTENER ESTADO DEL SISTEMA**
    async getSystemStatus() {
        try {
            const status = await this.makeRequest('GET', '/fapi/v1/systemStatus');
            return {
                success: true,
                status: status.status,
                message: status.msg || 'Sistema operativo'
            };
        } catch (error) {
            return {
                success: false,
                message: `Error obteniendo estado del sistema: ${error.message}`
            };
        }
    }
}

module.exports = { BinanceConnectionValidator };
