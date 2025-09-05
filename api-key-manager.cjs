/**
 * QBTC-UNIFIED - API Key Manager
 * Gestor avanzado de claves API con soporte para encriptación, rotación y validación
 * 
 * Este módulo extiende el CredentialsManager existente con funcionalidades adicionales
 * para la gestión segura y eficiente de claves API
 */

const { CredentialsManager } = require('./quantum-core/CredentialsManager');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class ApiKeyManager {
    constructor() {
        try {
            // Usar el CredentialsManager existente como base
            this.credentialsManager = CredentialsManager.getInstance();
            
            // Configuración adicional
            this.encryptionKey = process.env.ENCRYPTION_KEY || 'qbtc-unified-encryption-key-2025';
            this.keyRotationInterval = parseInt(process.env.KEY_ROTATION_INTERVAL || '30', 10); // días
            this.lastValidation = null;
            this.validationStatus = null;
            this.keyMetadata = this._loadKeyMetadata();
            
            console.log('🔑 ApiKeyManager inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando ApiKeyManager:', error);
            throw error;
        }
    }
    
    /**
     * Carga los metadatos de las claves
     */
    _loadKeyMetadata() {
        try {
            const metadataPath = path.join(__dirname, 'key-metadata.json');
            if (fs.existsSync(metadataPath)) {
                const data = fs.readFileSync(metadataPath, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.warn('[API-KEY-MANAGER] No se pudieron cargar los metadatos de claves:', error.message);
        }
        
        // Metadatos por defecto
        return {
            createdAt: new Date().toISOString(),
            lastRotation: null,
            validationHistory: [],
            permissions: {
                futures: {
                    enabled: false,
                    readOnly: true,
                    trading: false,
                    leverageChange: false
                },
                spot: {
                    enabled: false,
                    readOnly: true,
                    trading: false
                }
            }
        };
    }
    
    /**
     * Guarda los metadatos de las claves
     */
    _saveKeyMetadata() {
        try {
            const metadataPath = path.join(__dirname, 'key-metadata.json');
            const data = JSON.stringify(this.keyMetadata, null, 2);
            fs.writeFileSync(metadataPath, data, 'utf8');
        } catch (error) {
            console.error('[API-KEY-MANAGER] Error guardando metadatos:', error.message);
        }
    }
    
    /**
     * Encripta una clave API
     */
    encryptKey(key) {
        if (!key || typeof key !== 'string') return null;
        
        try {
            const iv = crypto.randomBytes(16);
            const keyBuffer = crypto.createHash('sha256').update(this.encryptionKey).digest();
            const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
            
            let encrypted = cipher.update(key, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            return `${iv.toString('hex')}:${encrypted}`;
        } catch (error) {
            console.error('[API-KEY-MANAGER] Error encriptando clave:', error.message);
            return null;
        }
    }
    
    /**
     * Desencripta una clave API
     */
    decryptKey(encryptedKey) {
        if (!encryptedKey || typeof encryptedKey !== 'string') return null;
        
        try {
            const [ivHex, encryptedData] = encryptedKey.split(':');
            if (!ivHex || !encryptedData) {
                throw new Error('Formato de clave encriptada inválido');
            }
            
            const iv = Buffer.from(ivHex, 'hex');
            const keyBuffer = crypto.createHash('sha256').update(this.encryptionKey).digest();
            const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);
            
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            console.error('[API-KEY-MANAGER] Error desencriptando clave:', error.message);
            return null;
        }
    }
    
    /**
     * Valida las claves API con Binance
     * Nota: Esta función simula la validación para el entorno mock
     */
    async validateKeys() {
        try {
            // Obtener credenciales del gestor existente
            const credentials = this.credentialsManager.getCredentials();
            
            // Simular validación para entorno mock
            const validationResult = {
                timestamp: new Date().toISOString(),
                valid: credentials.isLoaded,
                permissions: {
                    futures: {
                        enabled: credentials.isLoaded,
                        readOnly: !credentials.isTestnet,
                        trading: credentials.isLoaded && credentials.isTestnet,
                        leverageChange: credentials.isLoaded && credentials.isTestnet
                    },
                    spot: {
                        enabled: credentials.isLoaded,
                        readOnly: true,
                        trading: false
                    }
                },
                details: credentials.isLoaded 
                    ? 'Claves validadas correctamente' 
                    : 'No se pudieron validar las claves',
                source: credentials.source
            };
            
            // Actualizar estado
            this.lastValidation = validationResult.timestamp;
            this.validationStatus = validationResult;
            
            // Guardar en historial (máximo 100 entradas)
            this.keyMetadata.validationHistory.push({
                timestamp: validationResult.timestamp,
                valid: validationResult.valid,
                details: validationResult.details
            });
            
            // Mantener solo las últimas 100 validaciones
            if (this.keyMetadata.validationHistory.length > 100) {
                this.keyMetadata.validationHistory = this.keyMetadata.validationHistory.slice(-100);
            }
            
            // Actualizar permisos
            this.keyMetadata.permissions = validationResult.permissions;
            
            // Guardar metadatos
            this._saveKeyMetadata();
            
            return validationResult;
        } catch (error) {
            console.error('[API-KEY-MANAGER] Error en validación de claves:', error);
            
            // Retornar resultado de error
            return {
                timestamp: new Date().toISOString(),
                valid: false,
                permissions: {
                    futures: { enabled: false, readOnly: true, trading: false, leverageChange: false },
                    spot: { enabled: false, readOnly: true, trading: false }
                },
                details: `Error en validación: ${error.message}`,
                source: 'error'
            };
        }
    }
    
    /**
     * Verifica si las claves necesitan rotación
     */
    needsRotation() {
        try {
            if (!this.keyMetadata.lastRotation) return true;
            
            const lastRotation = new Date(this.keyMetadata.lastRotation);
            const now = new Date();
            const diffDays = (now - lastRotation) / (1000 * 60 * 60 * 24);
            
            return diffDays >= this.keyRotationInterval;
        } catch (error) {
            console.error('[API-KEY-MANAGER] Error verificando rotación:', error);
            return true; // Por seguridad, asumir que necesita rotación
        }
    }
    
    /**
     * Obtiene el estado de las claves API
     */
    getKeyStatus() {
        try {
            const credentials = this.credentialsManager.getCredentials();
            
            return {
                loaded: credentials.isLoaded,
                source: credentials.source,
                testnet: credentials.isTestnet,
                apiKeyAvailable: !!credentials.apiKey,
                secretKeyAvailable: !!credentials.secretKey,
                lastValidation: this.lastValidation,
                validationStatus: this.validationStatus,
                needsRotation: this.needsRotation(),
                metadata: this.keyMetadata,
                permissions: this.keyMetadata.permissions,
                encryptionEnabled: true,
                keyRotationInterval: this.keyRotationInterval
            };
        } catch (error) {
            console.error('[API-KEY-MANAGER] Error obteniendo estado de claves:', error);
            return {
                loaded: false,
                source: 'error',
                testnet: false,
                apiKeyAvailable: false,
                secretKeyAvailable: false,
                lastValidation: null,
                validationStatus: null,
                needsRotation: true,
                metadata: this.keyMetadata,
                permissions: {
                    futures: { enabled: false, readOnly: true, trading: false, leverageChange: false },
                    spot: { enabled: false, readOnly: true, trading: false }
                },
                encryptionEnabled: false,
                keyRotationInterval: this.keyRotationInterval,
                error: error.message
            };
        }
    }
    
    /**
     * Obtiene información detallada sobre los permisos de las claves
     */
    getPermissions() {
        try {
            return {
                futures: {
                    enabled: this.keyMetadata.permissions.futures.enabled,
                    readOnly: this.keyMetadata.permissions.futures.readOnly,
                    trading: this.keyMetadata.permissions.futures.trading,
                    leverageChange: this.keyMetadata.permissions.futures.leverageChange
                },
                spot: {
                    enabled: this.keyMetadata.permissions.spot.enabled,
                    readOnly: this.keyMetadata.permissions.spot.readOnly,
                    trading: this.keyMetadata.permissions.spot.trading
                },
                isTestnet: this.credentialsManager.isTestnet(),
                isValid: this.validationStatus ? this.validationStatus.valid : false,
                lastValidation: this.lastValidation
            };
        } catch (error) {
            console.error('[API-KEY-MANAGER] Error obteniendo permisos:', error);
            return {
                futures: { enabled: false, readOnly: true, trading: false, leverageChange: false },
                spot: { enabled: false, readOnly: true, trading: false },
                isTestnet: false,
                isValid: false,
                lastValidation: null,
                error: error.message
            };
        }
    }
    
    /**
     * Método estático para crear instancia singleton
     */
    static getInstance() {
        if (!ApiKeyManager._instance) {
            ApiKeyManager._instance = new ApiKeyManager();
        }
        return ApiKeyManager._instance;
    }
}

// Exportar clase
module.exports = { ApiKeyManager };

// Si este script se ejecuta directamente, mostrar diagnóstico
if (require.main === module) {
    console.log('🔑 Inicializando API Key Manager...');
    try {
        const apiKeyManager = ApiKeyManager.getInstance();
        
        // Validar claves
        apiKeyManager.validateKeys().then(result => {
            console.log('✅ Validación completada');
            console.log('📊 Estado de las claves API:');
            console.log(JSON.stringify(apiKeyManager.getKeyStatus(), null, 2));
            console.log('🔐 Permisos:');
            console.log(JSON.stringify(apiKeyManager.getPermissions(), null, 2));
        }).catch(error => {
            console.error('❌ Error en validación:', error);
        });
    } catch (error) {
        console.error('❌ Error inicializando ApiKeyManager:', error);
        process.exit(1);
    }
}
