#!/usr/bin/env node
/*
  QBTC RUNTIME API KEYS VALIDATOR
  Valida exactamente qué claves API está usando el sistema en tiempo de ejecución
*/

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class RuntimeKeysValidator {
    constructor() {
        this.envPath = path.join(__dirname, '..', '.env');
        this.duplicateEnvPaths = [
            path.join(__dirname, '..', '.env'),
            path.join(__dirname, '..', 'VigoFutures', 'bot-futuros', '.env'),
            path.join(__dirname, '..', 'VigoFutures', '.env'),
            path.join(__dirname, '..', 'core', '.env'),
            path.join(__dirname, '..', 'core', 'quantum-engine', '.env')
        ];
    }

    async validateRuntimeKeys() {
        console.log('🔍 VALIDACIÓN DE CLAVES API EN TIEMPO DE EJECUCIÓN');
        console.log('==================================================\n');

        // 1. Verificar variables de entorno del proceso actual
        console.log('1️⃣ VARIABLES DE ENTORNO DEL PROCESO:');
        console.log('------------------------------------');
        this.showProcessEnvKeys();

        // 2. Verificar todos los archivos .env del proyecto
        console.log('\n2️⃣ ARCHIVOS .ENV ENCONTRADOS:');
        console.log('-----------------------------');
        this.scanAllEnvFiles();

        // 3. Verificar qué está cargando el sistema
        console.log('\n3️⃣ SIMULACIÓN DE CARGA DEL SISTEMA:');
        console.log('----------------------------------');
        await this.simulateSystemLoad();

        // 4. Verificar archivos de configuración
        console.log('\n4️⃣ ARCHIVOS DE CONFIGURACIÓN:');
        console.log('-----------------------------');
        this.checkConfigFiles();

        // 5. Mostrar resumen final
        console.log('\n5️⃣ RESUMEN FINAL:');
        console.log('----------------');
        this.showFinalSummary();
    }

    showProcessEnvKeys() {
        const envKeys = [
            'BINANCE_API_KEY',
            'BINANCE_SECRET_KEY',
            'BINANCE_TESTNET',
            'BINANCE_FUTURES_ONLY',
            'CURRENT_PUBLIC_IP'
        ];

        envKeys.forEach(key => {
            const value = process.env[key];
            if (value) {
                console.log(`   ✅ ${key}=${this.maskKey(value, key)}`);
            } else {
                console.log(`   ❌ ${key}=<NO CONFIGURADA>`);
            }
        });
    }

    scanAllEnvFiles() {
        this.duplicateEnvPaths.forEach(envPath => {
            if (fs.existsSync(envPath)) {
                console.log(`\n   📁 Archivo: ${envPath}`);
                try {
                    const content = fs.readFileSync(envPath, 'utf8');
                    const keys = this.extractKeysFromContent(content);
                    
                    if (keys.BINANCE_API_KEY || keys.BINANCE_SECRET_KEY) {
                        console.log(`      🔑 API_KEY: ${this.maskKey(keys.BINANCE_API_KEY || 'NO ENCONTRADA', 'API')}`);
                        console.log(`      🔐 SECRET_KEY: ${this.maskKey(keys.BINANCE_SECRET_KEY || 'NO ENCONTRADA', 'SECRET')}`);
                        console.log(`      🧪 TESTNET: ${keys.BINANCE_TESTNET || 'NO CONFIGURADO'}`);
                        console.log(`      🚀 FUTURES_ONLY: ${keys.BINANCE_FUTURES_ONLY || 'NO CONFIGURADO'}`);
                    } else {
                        console.log('      ⚠️ No contiene claves API de Binance');
                    }
                } catch (error) {
                    console.log(`      ❌ Error leyendo archivo: ${error.message}`);
                }
            } else {
                console.log(`   ❌ No existe: ${envPath}`);
            }
        });
    }

    extractKeysFromContent(content) {
        const keys = {};
        content.split('\n').forEach(line => {
            if (line.includes('=') && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                keys[key.trim()] = valueParts.join('=').trim();
            }
        });
        return keys;
    }

    async simulateSystemLoad() {
        // Simular cómo el sistema carga las variables
        console.log('   🔄 Simulando carga de dotenv...');
        
        try {
            // Limpiar variables de entorno actuales de Binance
            delete process.env.BINANCE_API_KEY;
            delete process.env.BINANCE_SECRET_KEY;
            delete process.env.BINANCE_TESTNET;
            delete process.env.BINANCE_FUTURES_ONLY;

            // Cargar desde el archivo .env principal
            const envContent = fs.readFileSync(this.envPath, 'utf8');
            const envVars = this.extractKeysFromContent(envContent);
            
            // Establecer las variables en process.env
            Object.keys(envVars).forEach(key => {
                process.env[key] = envVars[key];
            });

            console.log('   ✅ Variables cargadas desde .env principal:');
            console.log(`      API_KEY: ${this.maskKey(process.env.BINANCE_API_KEY, 'API')}`);
            console.log(`      SECRET_KEY: ${this.maskKey(process.env.BINANCE_SECRET_KEY, 'SECRET')}`);
            console.log(`      TESTNET: ${process.env.BINANCE_TESTNET}`);
            console.log(`      FUTURES_ONLY: ${process.env.BINANCE_FUTURES_ONLY}`);

            // Verificar si coinciden con las originales
            const originalApiKey = 'LUFHLzW721iW8fj1RslpKllR1IBSRUAxeVef7wgdrv59HJjmKkmOCIM8zjQ59B0Q';
            const originalSecretKey = 'maNaQIFdSvfwkUP36Xqt9Gd0YATu1qk13HyIZJuOit6SQldLr8oTQPmVjLZLkcEu';

            console.log('\n   🔍 VERIFICACIÓN DE COINCIDENCIA:');
            const apiMatch = process.env.BINANCE_API_KEY === originalApiKey;
            const secretMatch = process.env.BINANCE_SECRET_KEY === originalSecretKey;
            
            console.log(`      API Key coincide: ${apiMatch ? '✅ SÍ' : '❌ NO'}`);
            console.log(`      Secret Key coincide: ${secretMatch ? '✅ SÍ' : '❌ NO'}`);

            if (!apiMatch || !secretMatch) {
                console.log('   ⚠️ ¡ATENCIÓN! Las claves cargadas NO coinciden con las esperadas');
                this.compareKeys(originalApiKey, originalSecretKey);
            }

        } catch (error) {
            console.log(`   ❌ Error simulando carga: ${error.message}`);
        }
    }

    compareKeys(expectedApi, expectedSecret) {
        console.log('\n   🔍 COMPARACIÓN DETALLADA:');
        console.log(`      Esperada API: ${this.maskKey(expectedApi, 'API')}`);
        console.log(`      Cargada API:  ${this.maskKey(process.env.BINANCE_API_KEY || 'NO CARGADA', 'API')}`);
        console.log(`      Esperada SECRET: ${this.maskKey(expectedSecret, 'SECRET')}`);
        console.log(`      Cargada SECRET:  ${this.maskKey(process.env.BINANCE_SECRET_KEY || 'NO CARGADA', 'SECRET')}`);

        // Verificar si hay diferencias sutiles
        if (process.env.BINANCE_API_KEY) {
            const loadedApi = process.env.BINANCE_API_KEY.trim();
            const expectedApiTrimmed = expectedApi.trim();
            
            if (loadedApi.length !== expectedApiTrimmed.length) {
                console.log(`      ⚠️ Longitudes diferentes: ${loadedApi.length} vs ${expectedApiTrimmed.length}`);
            }
            
            if (loadedApi.includes('\r') || loadedApi.includes('\n')) {
                console.log('      ⚠️ Clave API contiene caracteres de nueva línea');
            }
        }
    }

    checkConfigFiles() {
        const configFiles = [
            path.join(__dirname, '..', 'config', 'config.json'),
            path.join(__dirname, '..', 'package.json'),
            path.join(__dirname, '..', 'core', 'quantum-engine', 'BinanceRealConnector.js')
        ];

        configFiles.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                console.log(`   📁 ${path.basename(filePath)}: ✅ Existe`);
                
                if (filePath.endsWith('.js')) {
                    try {
                        const content = fs.readFileSync(filePath, 'utf8');
                        const hasApiKeyRef = content.includes('BINANCE_API_KEY');
                        const hasSecretKeyRef = content.includes('BINANCE_SECRET_KEY');
                        
                        console.log(`      API_KEY referenciada: ${hasApiKeyRef ? '✅ SÍ' : '❌ NO'}`);
                        console.log(`      SECRET_KEY referenciada: ${hasSecretKeyRef ? '✅ SÍ' : '❌ NO'}`);
                    } catch (error) {
                        console.log(`      ❌ Error leyendo: ${error.message}`);
                    }
                }
            } else {
                console.log(`   📁 ${path.basename(filePath)}: ❌ No existe`);
            }
        });
    }

    showFinalSummary() {
        const currentApiKey = process.env.BINANCE_API_KEY;
        const currentSecretKey = process.env.BINANCE_SECRET_KEY;
        
        console.log('🎯 CLAVES ACTUALMENTE ACTIVAS EN EL PROCESO:');
        console.log(`   API Key: ${this.maskKey(currentApiKey, 'API')}`);
        console.log(`   Secret Key: ${this.maskKey(currentSecretKey, 'SECRET')}`);
        console.log(`   Testnet: ${process.env.BINANCE_TESTNET || 'NO CONFIGURADO'}`);
        console.log(`   Futures Only: ${process.env.BINANCE_FUTURES_ONLY || 'NO CONFIGURADO'}`);
        console.log(`   IP: ${process.env.CURRENT_PUBLIC_IP || 'NO CONFIGURADA'}`);

        // Generar hash para identificación
        if (currentApiKey && currentSecretKey) {
            const combinedHash = crypto.createHash('md5')
                .update(currentApiKey + currentSecretKey)
                .digest('hex')
                .substring(0, 8);
            
            console.log(`\n🔍 Hash de identificación: ${combinedHash}`);
            console.log('   (Úsalo para verificar que las claves son las correctas)');
        }

        console.log('\n🚨 IMPORTANTE:');
        console.log('   Las claves mostradas arriba son las que el sistema usará');
        console.log('   Si hay alguna discrepancia, revisar los archivos .env');
        console.log('   El archivo principal está en: C:\\Users\\DELL\\Desktop\\QBTC-UNIFIED\\.env');
    }

    maskKey(key, type) {
        if (!key || key === 'NO CONFIGURADA' || key === 'NO ENCONTRADA' || key === 'NO CARGADA') {
            return key;
        }
        
        if (key.length < 10) {
            return key; // Mostrar completo si es muy corto (probablemente no es una clave real)
        }
        
        return `${key.substring(0, 8)}...${key.substring(key.length - 8)}`;
    }
}

// Ejecutar validación
if (require.main === module) {
    const validator = new RuntimeKeysValidator();
    validator.validateRuntimeKeys().catch(console.error);
}

module.exports = RuntimeKeysValidator;
