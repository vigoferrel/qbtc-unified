/*
  CREDENTIALS MANAGER - QBTC UNIFIED SYSTEM
  Copyright © 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES
  
  Gestor inteligente de credenciales que busca y carga automáticamente
  las claves de Binance desde múltiples fuentes de configuración
*/

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

class CredentialsManager {
    constructor() {
        this.credentials = {
            apiKey: null,
            secretKey: null,
            isTestnet: false,
            isLoaded: false,
            source: null
        };
        
        this.searchPaths = [
            path.join(__dirname, '.env'),
            path.join(__dirname, '..', '.env'),
            path.join(__dirname, '..', 'leonardo-consciousness', '.env'),
            path.join(__dirname, '..', 'quantum-core', '.env'),
            path.join(process.cwd(), '.env'),
            '.env'
        ];
        
        this.environmentVariableNames = {
            apiKey: [
                'BINANCE_API_KEY',
                'BINANCE_KEY',
                'BINANCE_FUTURES_API_KEY',
                'API_KEY'
            ],
            secretKey: [
                'BINANCE_SECRET_KEY', 
                'BINANCE_API_SECRET',
                'BINANCE_SECRET',
                'BINANCE_FUTURES_API_SECRET',
                'SECRET_KEY'
            ],
            testnet: [
                'BINANCE_TESTNET',
                'BINANCE_FUTURES_TESTNET',
                'TESTNET'
            ]
        };
        
        console.log('[CREDENTIALS] 🔐 Inicializando gestor de credenciales...');
        this.loadCredentials();
    }
    
    loadCredentials() {
        try {
            // 1. Intentar cargar desde variables de entorno existentes
            if (this.loadFromProcessEnv()) {
                console.log('[CREDENTIALS] ✅ Credenciales cargadas desde variables de proceso');
                return true;
            }
            
            // 2. Buscar y cargar archivos .env
            for (const envPath of this.searchPaths) {
                if (this.loadFromEnvFile(envPath)) {
                    console.log(`[CREDENTIALS] ✅ Credenciales cargadas desde: ${envPath}`);
                    return true;
                }
            }
            
            // 3. Intentar buscar en directorios padre
            if (this.loadFromParentDirectories()) {
                console.log('[CREDENTIALS] ✅ Credenciales cargadas desde directorio padre');
                return true;
            }
            
            console.warn('[CREDENTIALS] ⚠️ No se encontraron credenciales válidas');
            return false;
            
        } catch (error) {
            console.error('[CREDENTIALS] ❌ Error cargando credenciales:', error.message);
            return false;
        }
    }
    
    loadFromProcessEnv() {
        const apiKey = this.findEnvironmentVariable(this.environmentVariableNames.apiKey);
        const secretKey = this.findEnvironmentVariable(this.environmentVariableNames.secretKey);
        
        if (apiKey && secretKey && this.validateCredentials(apiKey, secretKey)) {
            this.credentials = {
                apiKey: apiKey,
                secretKey: secretKey,
                isTestnet: this.parseTestnetValue(this.findEnvironmentVariable(this.environmentVariableNames.testnet)),
                isLoaded: true,
                source: 'process.env'
            };
            return true;
        }
        
        return false;
    }
    
    loadFromEnvFile(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                return false;
            }
            
            const envContent = fs.readFileSync(filePath, 'utf8');
            const envVars = this.parseEnvContent(envContent);
            
            const apiKey = this.findFromObject(envVars, this.environmentVariableNames.apiKey);
            const secretKey = this.findFromObject(envVars, this.environmentVariableNames.secretKey);
            
            if (apiKey && secretKey && this.validateCredentials(apiKey, secretKey)) {
                this.credentials = {
                    apiKey: apiKey,
                    secretKey: secretKey,
                    isTestnet: this.parseTestnetValue(this.findFromObject(envVars, this.environmentVariableNames.testnet)),
                    isLoaded: true,
                    source: filePath
                };
                
                // Cargar las variables al process.env para que otros módulos las puedan usar
                Object.keys(envVars).forEach(key => {
                    if (!process.env[key]) {
                        process.env[key] = envVars[key];
                    }
                });
                
                return true;
            }
            
        } catch (error) {
            console.warn(`[CREDENTIALS] ⚠️ Error leyendo archivo ${filePath}:`, error.message);
        }
        
        return false;
    }
    
    loadFromParentDirectories() {
        let currentDir = process.cwd();
        let attempts = 0;
        const maxAttempts = 5;
        
        while (attempts < maxAttempts) {
            const envPath = path.join(currentDir, '.env');
            if (this.loadFromEnvFile(envPath)) {
                return true;
            }
            
            const parentDir = path.dirname(currentDir);
            if (parentDir === currentDir) break; // Reached root
            
            currentDir = parentDir;
            attempts++;
        }
        
        return false;
    }
    
    parseEnvContent(content) {
        const envVars = {};
        const lines = content.split('\n');
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
                const [key, ...valueParts] = trimmedLine.split('=');
                const value = valueParts.join('=').trim();
                envVars[key.trim()] = value.replace(/^["']|["']$/g, ''); // Remove quotes
            }
        }
        
        return envVars;
    }
    
    findEnvironmentVariable(names) {
        for (const name of names) {
            if (process.env[name]) {
                return process.env[name];
            }
        }
        return null;
    }
    
    findFromObject(obj, names) {
        for (const name of names) {
            if (obj[name]) {
                return obj[name];
            }
        }
        return null;
    }
    
    validateCredentials(apiKey, secretKey) {
        // Validar que las credenciales tengan un formato válido
        if (!apiKey || !secretKey) return false;
        if (apiKey.length < 10 || secretKey.length < 10) return false;
        if (apiKey === 'your_api_key_here' || secretKey === 'your_secret_key_here') return false;
        
        return true;
    }
    
    parseTestnetValue(value) {
        if (!value) return false;
        const strValue = String(value).toLowerCase();
        return strValue === 'true' || strValue === '1' || strValue === 'yes';
    }
    
    // Métodos públicos para obtener credenciales
    getCredentials() {
        return {
            apiKey: this.credentials.apiKey,
            secretKey: this.credentials.secretKey,
            isTestnet: this.credentials.isTestnet,
            isLoaded: this.credentials.isLoaded,
            source: this.credentials.source
        };
    }
    
    getApiKey() {
        return this.credentials.apiKey;
    }
    
    getSecretKey() {
        return this.credentials.secretKey;
    }
    
    isTestnet() {
        return this.credentials.isTestnet;
    }
    
    areCredentialsLoaded() {
        return this.credentials.isLoaded;
    }
    
    getSource() {
        return this.credentials.source;
    }
    
    // Método para refrescar credenciales
    refreshCredentials() {
        console.log('[CREDENTIALS] 🔄 Refrescando credenciales...');
        return this.loadCredentials();
    }
    
    // Método para diagnóstico
    diagnose() {
        console.log('\n=== DIAGNÓSTICO DE CREDENCIALES ===');
        console.log('Estado actual:', this.credentials.isLoaded ? '✅ CARGADAS' : '❌ NO CARGADAS');
        
        if (this.credentials.isLoaded) {
            console.log('Fuente:', this.credentials.source);
            console.log('API Key:', this.credentials.apiKey ? `${this.credentials.apiKey.substring(0, 8)}...` : 'NO ENCONTRADA');
            console.log('Secret Key:', this.credentials.secretKey ? 'CARGADA (oculta)' : 'NO ENCONTRADA');
            console.log('Testnet:', this.credentials.isTestnet ? 'SÍ' : 'NO');
        }
        
        console.log('\n=== ARCHIVOS .env ENCONTRADOS ===');
        for (const searchPath of this.searchPaths) {
            const exists = fs.existsSync(searchPath);
            const status = exists ? '✅ EXISTE' : '❌ NO EXISTE';
            console.log(`${status} ${searchPath}`);
        }
        
        console.log('\n=== VARIABLES DE ENTORNO ===');
        for (const nameGroup of Object.values(this.environmentVariableNames)) {
            for (const name of nameGroup) {
                const value = process.env[name];
                const status = value ? '✅ DEFINIDA' : '❌ NO DEFINIDA';
                console.log(`${status} ${name}`);
            }
        }
        console.log('===============================\n');
    }
    
    // Método compatible con integraciones
    getStatus() {
        return {
            hasApiKey: !!this.credentials.apiKey,
            hasSecretKey: !!this.credentials.secretKey,
            isTestnet: this.credentials.isTestnet,
            isReady: this.credentials.isLoaded,
            loadedFrom: this.credentials.source,
            sources: this.searchPaths.map(path => ({
                name: path.split('\\').pop() || path.split('/').pop(),
                path: path,
                found: fs.existsSync(path)
            }))
        };
    }
    
    // Método estático para crear instancia singleton
    static getInstance() {
        if (!CredentialsManager._instance) {
            CredentialsManager._instance = new CredentialsManager();
        }
        return CredentialsManager._instance;
    }
}

module.exports = { CredentialsManager };
