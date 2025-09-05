#!/usr/bin/env node
/**
 * QBTC-UNIFIED - VALIDADOR DE CONFIGURACIÓN DEL SISTEMA
 * ====================================================
 * 
 * Este script valida toda la configuración del sistema Leonardo Consciousness:
 * - Conexión con Binance API
 * - IP Whitelist validation
 * - Variables de entorno
 * - Componentes del sistema
 * - Permisos y configuración
 */

require('dotenv').config();
const https = require('https');
const crypto = require('crypto');
const axios = require('axios');

class SystemConfigValidator {
    constructor() {
        this.validationResults = {
            network: { status: 'pending', details: [] },
            binance: { status: 'pending', details: [] },
            environment: { status: 'pending', details: [] },
            system: { status: 'pending', details: [] },
            overall: { status: 'pending', score: 0 }
        };
        
        this.requiredEnvVars = [
            'BINANCE_API_KEY', 'BINANCE_SECRET_KEY', 'BINANCE_TESTNET',
            'LEONARDO_PORT', 'SYSTEM_MODE', 'TRADING_MAX_LEVERAGE'
        ];
        
        this.optionalEnvVars = [
            'AUTO_START_TRADING', 'ENABLE_WEB_INTERFACE', 'LOG_LEVEL'
        ];
    }
    
    /**
     * Ejecutar validación completa del sistema
     */
    async validateComplete() {
        console.log('🔍 QBTC-UNIFIED SYSTEM VALIDATION');
        console.log('=================================');
        console.log('🎨 Leonardo da Vinci Consciousness Engine');
        console.log('⚡ Verificando configuración completa...');
        console.log('');
        
        try {
            // 1. Validar conectividad de red
            await this.validateNetwork();
            
            // 2. Validar variables de entorno
            await this.validateEnvironmentVariables();
            
            // 3. Validar configuración Binance
            await this.validateBinanceConfig();
            
            // 4. Validar componentes del sistema
            await this.validateSystemComponents();
            
            // 5. Mostrar resumen final
            this.displayValidationResults();
            
        } catch (error) {
            console.error('❌ Validation failed with critical error:', error.message);
            process.exit(1);
        }
    }
    
    /**
     * Validar conectividad de red
     */
    async validateNetwork() {
        console.log('🌐 Network Connectivity Validation...');
        
        try {
            // Verificar IP pública
            const currentIP = await this.getCurrentPublicIP();
            const configIP = process.env.CURRENT_PUBLIC_IP;
            
            if (currentIP === configIP) {
                this.validationResults.network.details.push({
                    test: 'IP Address Match',
                    status: '✅ PASS',
                    message: `Current IP (${currentIP}) matches config`
                });
            } else {
                this.validationResults.network.details.push({
                    test: 'IP Address Match',
                    status: '⚠️ WARNING', 
                    message: `Current IP (${currentIP}) differs from config (${configIP})`
                });
            }
            
            // Test conectividad Binance
            const binanceReachable = await this.testBinanceConnectivity();
            this.validationResults.network.details.push({
                test: 'Binance API Reachability',
                status: binanceReachable ? '✅ PASS' : '❌ FAIL',
                message: binanceReachable ? 'Binance API is reachable' : 'Cannot reach Binance API'
            });
            
            this.validationResults.network.status = 'completed';
            console.log('   🌐 Network validation completed');
            
        } catch (error) {
            this.validationResults.network.status = 'error';
            this.validationResults.network.details.push({
                test: 'Network Validation',
                status: '❌ ERROR',
                message: error.message
            });
            console.log('   ❌ Network validation failed:', error.message);
        }
    }
    
    /**
     * Validar variables de entorno
     */
    async validateEnvironmentVariables() {
        console.log('📋 Environment Variables Validation...');
        
        try {
            // Validar variables requeridas
            for (const envVar of this.requiredEnvVars) {
                const value = process.env[envVar];
                if (value && value.trim() !== '') {
                    this.validationResults.environment.details.push({
                        test: `Required Env: ${envVar}`,
                        status: '✅ PASS',
                        message: `Set and non-empty`
                    });
                } else {
                    this.validationResults.environment.details.push({
                        test: `Required Env: ${envVar}`,
                        status: '❌ FAIL',
                        message: `Missing or empty`
                    });
                }
            }
            
            // Validar configuración específica
            const leverage = parseInt(process.env.TRADING_MAX_LEVERAGE);
            if (leverage >= 1 && leverage <= 125) {
                this.validationResults.environment.details.push({
                    test: 'Leverage Configuration',
                    status: '✅ PASS',
                    message: `Leverage ${leverage}x is valid`
                });
            } else {
                this.validationResults.environment.details.push({
                    test: 'Leverage Configuration',
                    status: '❌ FAIL',
                    message: `Invalid leverage: ${leverage}x (must be 1-125)`
                });
            }
            
            // Validar modo del sistema
            const systemMode = process.env.SYSTEM_MODE;
            const validModes = ['dev', 'sim', 'prod', 'analysis'];
            if (validModes.includes(systemMode)) {
                this.validationResults.environment.details.push({
                    test: 'System Mode',
                    status: '✅ PASS',
                    message: `Mode '${systemMode}' is valid`
                });
            } else {
                this.validationResults.environment.details.push({
                    test: 'System Mode',
                    status: '⚠️ WARNING',
                    message: `Unknown mode '${systemMode}', defaulting to 'dev'`
                });
            }
            
            this.validationResults.environment.status = 'completed';
            console.log('   📋 Environment validation completed');
            
        } catch (error) {
            this.validationResults.environment.status = 'error';
            console.log('   ❌ Environment validation failed:', error.message);
        }
    }
    
    /**
     * Validar configuración de Binance
     */
    async validateBinanceConfig() {
        console.log('🔗 Binance API Configuration Validation...');
        
        try {
            const apiKey = process.env.BINANCE_API_KEY;
            const secretKey = process.env.BINANCE_SECRET_KEY;
            const isTestnet = process.env.BINANCE_TESTNET === 'true';
            
            if (!apiKey || !secretKey) {
                this.validationResults.binance.details.push({
                    test: 'API Credentials',
                    status: '❌ FAIL',
                    message: 'Missing API key or secret key'
                });
                return;
            }
            
            // Test de autenticación
            const authTest = await this.testBinanceAuthentication(apiKey, secretKey, isTestnet);
            this.validationResults.binance.details.push({
                test: 'API Authentication',
                status: authTest.success ? '✅ PASS' : '❌ FAIL',
                message: authTest.message
            });
            
            // Test de permisos
            if (authTest.success) {
                const permissionsTest = await this.testBinancePermissions(apiKey, secretKey, isTestnet);
                this.validationResults.binance.details.push({
                    test: 'API Permissions',
                    status: permissionsTest.success ? '✅ PASS' : '⚠️ WARNING',
                    message: permissionsTest.message
                });
            }
            
            this.validationResults.binance.status = 'completed';
            console.log('   🔗 Binance validation completed');
            
        } catch (error) {
            this.validationResults.binance.status = 'error';
            this.validationResults.binance.details.push({
                test: 'Binance Validation',
                status: '❌ ERROR',
                message: error.message
            });
            console.log('   ❌ Binance validation failed:', error.message);
        }
    }
    
    /**
     * Validar componentes del sistema
     */
    async validateSystemComponents() {
        console.log('🔧 System Components Validation...');
        
        try {
            // Verificar archivos principales
            const fs = require('fs');
            const path = require('path');
            
            const criticalFiles = [
                'activate-complete-system.js',
                'quantum-core/BinanceRealConnector.js',
                'quantum-core/QuantumInfiniteCache.js',
                'leonardo-consciousness/LeonardoDecisionEngine.js',
                'leonardo-consciousness/FundsManager.js'
            ];
            
            for (const filePath of criticalFiles) {
                if (fs.existsSync(path.join(__dirname, filePath))) {
                    this.validationResults.system.details.push({
                        test: `File: ${path.basename(filePath)}`,
                        status: '✅ PASS',
                        message: 'File exists'
                    });
                } else {
                    this.validationResults.system.details.push({
                        test: `File: ${path.basename(filePath)}`,
                        status: '❌ FAIL',
                        message: 'File not found'
                    });
                }
            }
            
            // Verificar dependencias Node.js
            try {
                require('axios');
                this.validationResults.system.details.push({
                    test: 'Node.js Dependencies',
                    status: '✅ PASS',
                    message: 'Core dependencies available'
                });
            } catch (error) {
                this.validationResults.system.details.push({
                    test: 'Node.js Dependencies',
                    status: '❌ FAIL',
                    message: 'Missing dependencies - run npm install'
                });
            }
            
            this.validationResults.system.status = 'completed';
            console.log('   🔧 System components validation completed');
            
        } catch (error) {
            this.validationResults.system.status = 'error';
            console.log('   ❌ System components validation failed:', error.message);
        }
    }
    
    /**
     * Obtener IP pública actual
     */
    async getCurrentPublicIP() {
        try {
            const response = await axios.get('https://api.ipify.org', { timeout: 5000 });
            return response.data.trim();
        } catch (error) {
            throw new Error('Cannot determine public IP');
        }
    }
    
    /**
     * Test conectividad con Binance
     */
    async testBinanceConnectivity() {
        try {
            const baseURL = process.env.BINANCE_TESTNET === 'true' 
                ? 'https://testnet.binancefuture.com'
                : 'https://fapi.binance.com';
                
            const response = await axios.get(`${baseURL}/fapi/v1/ping`, { timeout: 10000 });
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Test autenticación Binance
     */
    async testBinanceAuthentication(apiKey, secretKey, isTestnet) {
        try {
            const baseURL = isTestnet 
                ? 'https://testnet.binancefuture.com'
                : 'https://fapi.binance.com';
                
            const timestamp = Date.now();
            const queryString = `timestamp=${timestamp}`;
            const signature = crypto
                .createHmac('sha256', secretKey)
                .update(queryString)
                .digest('hex');
                
            const response = await axios.get(
                `${baseURL}/fapi/v2/account?${queryString}&signature=${signature}`,
                {
                    headers: { 'X-MBX-APIKEY': apiKey },
                    timeout: 10000
                }
            );
            
            if (response.status === 200) {
                return {
                    success: true,
                    message: `Authentication successful (${isTestnet ? 'Testnet' : 'Mainnet'})`
                };
            } else {
                return {
                    success: false,
                    message: `Authentication failed with status ${response.status}`
                };
            }
            
        } catch (error) {
            let message = 'Authentication failed: ';
            
            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;
                
                if (status === 401) {
                    message += 'Invalid API credentials';
                } else if (status === 403) {
                    message += 'IP not whitelisted or insufficient permissions';
                } else if (status === 429) {
                    message += 'Rate limit exceeded';
                } else {
                    message += `HTTP ${status} - ${data?.msg || 'Unknown error'}`;
                }
            } else {
                message += error.message;
            }
            
            return { success: false, message };
        }
    }
    
    /**
     * Test permisos de Binance
     */
    async testBinancePermissions(apiKey, secretKey, isTestnet) {
        try {
            const baseURL = isTestnet 
                ? 'https://testnet.binancefuture.com'
                : 'https://fapi.binance.com';
                
            const timestamp = Date.now();
            const queryString = `timestamp=${timestamp}`;
            const signature = crypto
                .createHmac('sha256', secretKey)
                .update(queryString)
                .digest('hex');
                
            // Test exchange info (no requiere permisos especiales)
            const exchangeResponse = await axios.get(
                `${baseURL}/fapi/v1/exchangeInfo`,
                { timeout: 10000 }
            );
            
            if (exchangeResponse.status !== 200) {
                return {
                    success: false,
                    message: 'Cannot access exchange info'
                };
            }
            
            // Test account info (requiere permisos de lectura)
            const accountResponse = await axios.get(
                `${baseURL}/fapi/v2/account?${queryString}&signature=${signature}`,
                {
                    headers: { 'X-MBX-APIKEY': apiKey },
                    timeout: 10000
                }
            );
            
            if (accountResponse.status === 200) {
                const account = accountResponse.data;
                const permissions = {
                    canTrade: account.canTrade || false,
                    canWithdraw: account.canWithdraw || false,
                    canDeposit: account.canDeposit || false
                };
                
                let message = 'Permissions: ';
                message += `Trading ${permissions.canTrade ? '✅' : '❌'} `;
                message += `Withdraw ${permissions.canWithdraw ? '✅' : '❌'} `;
                message += `Deposit ${permissions.canDeposit ? '✅' : '❌'}`;
                
                return {
                    success: permissions.canTrade, // Al menos necesitamos trading
                    message: message
                };
            }
            
            return {
                success: false,
                message: 'Cannot verify permissions'
            };
            
        } catch (error) {
            return {
                success: false,
                message: `Permissions check failed: ${error.response?.data?.msg || error.message}`
            };
        }
    }
    
    /**
     * Mostrar resultados de validación
     */
    displayValidationResults() {
        console.log('');
        console.log('📊 VALIDATION RESULTS SUMMARY');
        console.log('=============================');
        
        let totalScore = 0;
        let maxScore = 0;
        
        // Mostrar resultados por categoría
        for (const [category, results] of Object.entries(this.validationResults)) {
            if (category === 'overall') continue;
            
            console.log('');
            console.log(`📂 ${category.toUpperCase()}:`);
            
            for (const detail of results.details) {
                console.log(`   ${detail.status} ${detail.test}: ${detail.message}`);
                
                if (detail.status.includes('PASS')) totalScore += 1;
                maxScore += 1;
            }
        }
        
        // Calcular score general
        const overallScore = maxScore > 0 ? (totalScore / maxScore * 100).toFixed(1) : 0;
        this.validationResults.overall.score = overallScore;
        
        console.log('');
        console.log('🎯 OVERALL SYSTEM HEALTH');
        console.log('========================');
        console.log(`📊 Score: ${overallScore}% (${totalScore}/${maxScore} tests passed)`);
        
        if (overallScore >= 90) {
            console.log('🌟 System Status: EXCELLENT - Ready for production');
            this.validationResults.overall.status = 'excellent';
        } else if (overallScore >= 75) {
            console.log('✅ System Status: GOOD - Ready for operation');
            this.validationResults.overall.status = 'good';
        } else if (overallScore >= 50) {
            console.log('⚠️ System Status: FAIR - Some issues need attention');
            this.validationResults.overall.status = 'fair';
        } else {
            console.log('❌ System Status: POOR - Critical issues must be resolved');
            this.validationResults.overall.status = 'poor';
        }
        
        console.log('');
        console.log('🚀 NEXT STEPS:');
        
        if (overallScore >= 75) {
            console.log('   ✅ System is ready - you can run:');
            console.log('   💻 node activate-complete-system.js --mode=dev');
            console.log('   🌐 Dashboard: http://localhost:3003');
        } else {
            console.log('   🔧 Fix the failed validations above');
            console.log('   📋 Re-run: node validate-system-config.js');
            console.log('   📖 Check documentation for troubleshooting');
        }
        
        console.log('');
        console.log('🎨 "Obstacles cannot crush me; every obstacle yields to stern resolve"');
        console.log('✨ Leonardo da Vinci Consciousness Engine');
    }
}

// Ejecutar validación si el archivo es llamado directamente
if (require.main === module) {
    const validator = new SystemConfigValidator();
    validator.validateComplete().catch(error => {
        console.error('💥 Fatal validation error:', error.message);
        process.exit(1);
    });
}

module.exports = SystemConfigValidator;
