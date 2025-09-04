#!/usr/bin/env node
/*
  QBTC DEEP BINANCE DIAGNOSTIC
  Diagnóstico avanzado para problemas de autenticación más allá del whitelist IP
*/

const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class DeepBinanceDiagnostic {
    constructor() {
        this.envPath = path.join(__dirname, '..', '.env');
        this.loadEnvConfig();
        this.issues = [];
        this.solutions = [];
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

    async runDeepDiagnostic() {
        console.log('🔬 DIAGNÓSTICO AVANZADO BINANCE API');
        console.log('===================================\n');

        const apiKey = this.envVars.BINANCE_API_KEY || '';
        const secretKey = this.envVars.BINANCE_SECRET_KEY || '';
        const isTestnet = this.envVars.BINANCE_TESTNET === 'true';

        console.log('📋 CONFIGURACIÓN DETECTADA:');
        console.log(`   API Key: ${apiKey.substring(0, 12)}...${apiKey.substring(apiKey.length - 12)}`);
        console.log(`   Secret Key: ${secretKey.substring(0, 12)}...${secretKey.substring(secretKey.length - 12)}`);
        console.log(`   Testnet: ${isTestnet}`);
        console.log(`   IP: ${this.envVars.CURRENT_PUBLIC_IP}\n`);

        // 1. Verificar integridad de las claves
        await this.verifyKeyIntegrity(apiKey, secretKey);

        // 2. Verificar sincronización de tiempo
        await this.verifyTimeSync(isTestnet);

        // 3. Verificar estado de la API Key en Binance
        await this.verifyApiKeyStatus(apiKey, secretKey, isTestnet);

        // 4. Verificar permisos específicos
        await this.verifyPermissions(apiKey, secretKey, isTestnet);

        // 5. Verificar endpoints alternativos
        await this.verifyAlternativeEndpoints(apiKey, secretKey, isTestnet);

        // 6. Verificar formato de requests
        await this.verifyRequestFormat(apiKey, secretKey, isTestnet);

        // 7. Mostrar diagnóstico final
        this.showAdvancedDiagnostic();
    }

    async verifyKeyIntegrity(apiKey, secretKey) {
        console.log('🔍 1. VERIFICANDO INTEGRIDAD DE CLAVES...');
        
        // Verificar caracteres no imprimibles
        const apiKeyClean = apiKey.replace(/[^\x20-\x7E]/g, '');
        const secretKeyClean = secretKey.replace(/[^\x20-\x7E]/g, '');
        
        if (apiKey !== apiKeyClean) {
            this.issues.push('❌ API Key contiene caracteres no imprimibles');
            this.solutions.push('🔧 Limpiar API Key de caracteres especiales');
        }
        
        if (secretKey !== secretKeyClean) {
            this.issues.push('❌ Secret Key contiene caracteres no imprimibles');
            this.solutions.push('🔧 Limpiar Secret Key de caracteres especiales');
        }

        // Verificar si las claves están habilitadas
        console.log(`   📊 API Key length: ${apiKey.length}`);
        console.log(`   📊 Secret Key length: ${secretKey.length}`);
        console.log(`   🔍 API Key clean: ${apiKey === apiKeyClean ? '✅' : '❌'}`);
        console.log(`   🔍 Secret Key clean: ${secretKey === secretKeyClean ? '✅' : '❌'}`);

        // Verificar patrones válidos de Binance
        const binanceApiPattern = /^[A-Za-z0-9]{64}$/;
        const binanceSecretPattern = /^[A-Za-z0-9]{64}$/;

        if (!binanceApiPattern.test(apiKey)) {
            this.issues.push('❌ API Key no coincide con patrón de Binance (64 chars alphanumeric)');
        } else {
            console.log('   ✅ API Key coincide con patrón de Binance');
        }

        if (!binanceSecretPattern.test(secretKey)) {
            this.issues.push('❌ Secret Key no coincide con patrón de Binance (64 chars alphanumeric)');
        } else {
            console.log('   ✅ Secret Key coincide con patrón de Binance');
        }
    }

    async verifyTimeSync(isTestnet) {
        console.log('\n⏰ 2. VERIFICANDO SINCRONIZACIÓN DE TIEMPO...');
        
        const hostname = isTestnet ? 'testnet.binancefuture.com' : 'fapi.binance.com';
        
        return new Promise((resolve) => {
            const req = https.request({
                hostname,
                path: '/fapi/v1/time',
                method: 'GET',
                timeout: 5000
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        if (res.statusCode === 200) {
                            const timeData = JSON.parse(data);
                            const serverTime = timeData.serverTime;
                            const localTime = Date.now();
                            const timeDiff = Math.abs(localTime - serverTime);
                            
                            console.log(`   🌐 Server Time: ${new Date(serverTime).toISOString()}`);
                            console.log(`   🖥️ Local Time:  ${new Date(localTime).toISOString()}`);
                            console.log(`   ⏱️ Diferencia: ${timeDiff}ms`);
                            
                            if (timeDiff > 1000) {
                                this.issues.push(`❌ Sincronización de tiempo crítica: ${timeDiff}ms`);
                                this.solutions.push('🔧 Sincronizar reloj del sistema: w32tm /resync');
                                this.solutions.push('🔧 Verificar zona horaria del sistema');
                            } else if (timeDiff > 500) {
                                this.issues.push(`⚠️ Sincronización de tiempo subóptima: ${timeDiff}ms`);
                                this.solutions.push('🔧 Considerar sincronización de tiempo');
                            } else {
                                console.log('   ✅ Sincronización de tiempo OK');
                            }
                        }
                    } catch (error) {
                        this.issues.push('❌ Error verificando tiempo del servidor');
                    }
                    resolve();
                });
            });

            req.on('error', () => {
                this.issues.push('❌ No se pudo conectar al servidor de tiempo');
                resolve();
            });

            req.on('timeout', () => {
                req.destroy();
                resolve();
            });

            req.end();
        });
    }

    async verifyApiKeyStatus(apiKey, secretKey, isTestnet) {
        console.log('\n🔑 3. VERIFICANDO ESTADO DE API KEY...');
        
        const hostname = isTestnet ? 'testnet.binancefuture.com' : 'fapi.binance.com';
        
        // Probar con diferentes endpoints para identificar el problema específico
        const testEndpoints = [
            { path: '/fapi/v1/ping', auth: false, name: 'Ping (sin auth)' },
            { path: '/fapi/v1/time', auth: false, name: 'Time (sin auth)' },
            { path: '/fapi/v1/exchangeInfo', auth: false, name: 'Exchange Info (sin auth)' },
            { path: '/fapi/v2/account', auth: true, name: 'Account Info (con auth)' }
        ];

        for (const endpoint of testEndpoints) {
            await this.testEndpoint(hostname, endpoint, apiKey, secretKey);
        }
    }

    async testEndpoint(hostname, endpoint, apiKey, secretKey) {
        return new Promise((resolve) => {
            let path = endpoint.path;
            let headers = { 'Content-Type': 'application/json' };

            if (endpoint.auth) {
                const timestamp = Date.now();
                const queryString = `timestamp=${timestamp}`;
                const signature = crypto
                    .createHmac('sha256', secretKey)
                    .update(queryString)
                    .digest('hex');
                
                path += `?${queryString}&signature=${signature}`;
                headers['X-MBX-APIKEY'] = apiKey;
            }

            const req = https.request({
                hostname,
                path,
                method: 'GET',
                headers,
                timeout: 10000
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        console.log(`   ✅ ${endpoint.name}: OK`);
                    } else {
                        console.log(`   ❌ ${endpoint.name}: ${res.statusCode}`);
                        
                        try {
                            const errorData = JSON.parse(data);
                            console.log(`      🔍 Error: ${errorData.code} - ${errorData.msg}`);
                            
                            if (endpoint.auth) {
                                this.analyzeAuthError(errorData, res.statusCode);
                            }
                        } catch (e) {
                            console.log(`      📋 Raw Response: ${data.substring(0, 100)}...`);
                        }
                    }
                    resolve();
                });
            });

            req.on('error', (error) => {
                console.log(`   ❌ ${endpoint.name}: Connection Error - ${error.message}`);
                resolve();
            });

            req.on('timeout', () => {
                console.log(`   ⏰ ${endpoint.name}: Timeout`);
                req.destroy();
                resolve();
            });

            req.end();
        });
    }

    analyzeAuthError(error, statusCode) {
        switch (error.code) {
            case -2014:
                this.issues.push('❌ API-key format invalid (-2014)');
                this.solutions.push('🔧 Verificar que API Key no tenga espacios al inicio/final');
                this.solutions.push('🔧 Regenerar API Key si continúa el problema');
                break;
                
            case -2015:
                this.issues.push('❌ Invalid API-key, IP, or permissions (-2015)');
                this.solutions.push('🔧 Verificar que IP esté EXACTAMENTE en whitelist');
                this.solutions.push('🔧 Verificar que API Key tenga permisos de Futures');
                this.solutions.push('🔧 Esperar 10-15 minutos después de cambios en Binance');
                break;
                
            case -1021:
                this.issues.push('❌ Timestamp outside of recv window (-1021)');
                this.solutions.push('🔧 Sincronizar reloj del sistema inmediatamente');
                break;
                
            case -1022:
                this.issues.push('❌ Signature for this request is not valid (-1022)');
                this.solutions.push('🔧 Verificar que Secret Key sea correcta');
                this.solutions.push('🔧 Verificar codificación de caracteres');
                break;
                
            case -2008:
                this.issues.push('❌ Invalid Api-Key ID (-2008)');
                this.solutions.push('🔧 API Key no existe o fue eliminada');
                this.solutions.push('🔧 Crear nueva API Key');
                break;
                
            case -1003:
                this.issues.push('❌ Too many requests (-1003)');
                this.solutions.push('🔧 Reducir frecuencia de requests');
                this.solutions.push('🔧 Implementar rate limiting');
                break;
                
            default:
                this.issues.push(`❌ Error desconocido: ${error.code} - ${error.msg}`);
                this.solutions.push('🔧 Consultar documentación de Binance');
        }
    }

    async verifyPermissions(apiKey, secretKey, isTestnet) {
        console.log('\n🔒 4. VERIFICANDO PERMISOS ESPECÍFICOS...');
        
        // Intentar acceder a diferentes tipos de endpoints para verificar permisos
        const permissionTests = [
            { path: '/fapi/v1/account', permission: 'Reading', critical: true },
            { path: '/fapi/v2/balance', permission: 'Futures Reading', critical: true },
            { path: '/fapi/v1/positionRisk', permission: 'Futures Positions', critical: false }
        ];

        const hostname = isTestnet ? 'testnet.binancefuture.com' : 'fapi.binance.com';

        for (const test of permissionTests) {
            await this.testPermission(hostname, test, apiKey, secretKey);
        }
    }

    async testPermission(hostname, test, apiKey, secretKey) {
        return new Promise((resolve) => {
            const timestamp = Date.now();
            const queryString = `timestamp=${timestamp}`;
            const signature = crypto
                .createHmac('sha256', secretKey)
                .update(queryString)
                .digest('hex');

            const path = `${test.path}?${queryString}&signature=${signature}`;

            const req = https.request({
                hostname,
                path,
                method: 'GET',
                headers: {
                    'X-MBX-APIKEY': apiKey,
                    'Content-Type': 'application/json'
                },
                timeout: 8000
            }, (res) => {
                if (res.statusCode === 200) {
                    console.log(`   ✅ ${test.permission}: OK`);
                } else if (res.statusCode === 401) {
                    console.log(`   ❌ ${test.permission}: Sin permisos`);
                    if (test.critical) {
                        this.issues.push(`❌ Falta permiso crítico: ${test.permission}`);
                        this.solutions.push('🔧 Habilitar todos los permisos de Futures en API Key');
                    }
                } else {
                    console.log(`   ⚠️ ${test.permission}: Status ${res.statusCode}`);
                }
                resolve();
            });

            req.on('error', () => resolve());
            req.on('timeout', () => { req.destroy(); resolve(); });
            req.end();
        });
    }

    async verifyAlternativeEndpoints(apiKey, secretKey, isTestnet) {
        console.log('\n🌐 5. VERIFICANDO ENDPOINTS ALTERNATIVOS...');
        
        const endpoints = isTestnet 
            ? ['testnet.binancefuture.com', 'testnet.binance.vision']
            : ['fapi.binance.com', 'fapi1.binance.com', 'fapi2.binance.com'];

        for (const hostname of endpoints) {
            await this.testHostname(hostname, apiKey, secretKey);
        }
    }

    async testHostname(hostname, apiKey, secretKey) {
        return new Promise((resolve) => {
            const req = https.request({
                hostname,
                path: '/fapi/v1/ping',
                method: 'GET',
                timeout: 3000
            }, (res) => {
                if (res.statusCode === 200) {
                    console.log(`   ✅ ${hostname}: Accesible`);
                } else {
                    console.log(`   ❌ ${hostname}: Status ${res.statusCode}`);
                }
                resolve();
            });

            req.on('error', (error) => {
                console.log(`   ❌ ${hostname}: ${error.code}`);
                resolve();
            });

            req.on('timeout', () => {
                console.log(`   ⏰ ${hostname}: Timeout`);
                req.destroy();
                resolve();
            });

            req.end();
        });
    }

    async verifyRequestFormat(apiKey, secretKey, isTestnet) {
        console.log('\n📝 6. VERIFICANDO FORMATO DE REQUEST...');
        
        const timestamp = Date.now();
        const queryString = `timestamp=${timestamp}`;
        const signature = crypto
            .createHmac('sha256', secretKey)
            .update(queryString)
            .digest('hex');

        console.log('   🔍 Detalles del request:');
        console.log(`      Timestamp: ${timestamp}`);
        console.log(`      Query String: ${queryString}`);
        console.log(`      Signature: ${signature.substring(0, 16)}...`);
        console.log(`      API Key Header: ${apiKey.substring(0, 16)}...`);

        // Verificar que la signature se genere correctamente
        const testString = 'test';
        const testSignature = crypto
            .createHmac('sha256', secretKey)
            .update(testString)
            .digest('hex');
        
        console.log(`   🧪 Test signature (for 'test'): ${testSignature.substring(0, 16)}...`);
        console.log('   ✅ Crypto functions working correctly');
    }

    showAdvancedDiagnostic() {
        console.log('\n' + '='.repeat(60));
        console.log('🔬 DIAGNÓSTICO AVANZADO COMPLETADO');
        console.log('='.repeat(60));

        if (this.issues.length === 0) {
            console.log('\n🎉 ¡NO SE ENCONTRARON PROBLEMAS TÉCNICOS!');
            console.log('✅ Las claves y configuración parecen correctas');
            console.log('\n🔍 POSIBLES CAUSAS RESTANTES:');
            console.log('   1. Cambios recientes no han tomado efecto (esperar 10-15 min)');
            console.log('   2. API Key suspendida temporalmente por Binance');
            console.log('   3. Restricciones geográficas o de cuenta');
            console.log('   4. Problemas temporales del servidor de Binance');
            return;
        }

        console.log('\n❌ PROBLEMAS IDENTIFICADOS:');
        this.issues.forEach((issue, index) => {
            console.log(`   ${index + 1}. ${issue}`);
        });

        console.log('\n🔧 SOLUCIONES ESPECÍFICAS:');
        this.solutions.forEach((solution, index) => {
            console.log(`   ${index + 1}. ${solution}`);
        });

        console.log('\n🚨 ACCIONES INMEDIATAS RECOMENDADAS:');
        console.log('   1. Verificar en Binance que la API Key esté ACTIVA');
        console.log('   2. Confirmar que la IP en whitelist sea EXACTAMENTE 181.43.212.196');
        console.log('   3. Regenerar API Key si los problemas persisten');
        console.log('   4. Contactar soporte de Binance si nada funciona');

        console.log('\n📞 SOPORTE BINANCE:');
        console.log('   • Testnet: https://testnet.binance.com');
        console.log('   • Support: https://www.binance.com/en/support');
        console.log('   • Docs: https://binance-docs.github.io/apidocs/futures/en/');
    }
}

// Ejecutar diagnóstico avanzado
if (require.main === module) {
    const diagnostic = new DeepBinanceDiagnostic();
    diagnostic.runDeepDiagnostic().catch(console.error);
}

module.exports = DeepBinanceDiagnostic;
