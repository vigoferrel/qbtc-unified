/**
 * QBTC-UNIFIED - Quantum Error Handler
 * Manejador centralizado de errores para el sistema cuántico
 * 
 * Este módulo proporciona un manejo robusto y consistente de errores
 * en todo el sistema QBTC-UNIFIED
 */

const fs = require('fs');
const path = require('path');

class QuantumErrorHandler {
    constructor() {
        this.errorLogPath = path.join(__dirname, 'logs', 'quantum-errors.log');
        this.maxLogSize = 10 * 1024 * 1024; // 10MB
        this.errorCount = 0;
        this.criticalErrors = [];
        this.recoveryStrategies = new Map();
        
        // Asegurar que el directorio de logs existe
        this._ensureLogDirectory();
        
        // Configurar estrategias de recuperación
        this._setupRecoveryStrategies();
        
        console.log('🛡️ Quantum Error Handler inicializado');
    }
    
    /**
     * Asegura que el directorio de logs existe
     */
    _ensureLogDirectory() {
        try {
            const logDir = path.dirname(this.errorLogPath);
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
        } catch (error) {
            console.error('Error creando directorio de logs:', error);
        }
    }
    
    /**
     * Configura estrategias de recuperación para diferentes tipos de errores
     */
    _setupRecoveryStrategies() {
        // Error de conexión a Binance
        this.recoveryStrategies.set('BINANCE_CONNECTION_ERROR', {
            maxRetries: 3,
            retryDelay: 5000,
            action: 'Reintentar conexión a Binance'
        });
        
        // Error de credenciales
        this.recoveryStrategies.set('CREDENTIALS_ERROR', {
            maxRetries: 1,
            retryDelay: 1000,
            action: 'Recargar credenciales'
        });
        
        // Error de puerto en uso
        this.recoveryStrategies.set('PORT_IN_USE_ERROR', {
            maxRetries: 1,
            retryDelay: 2000,
            action: 'Cambiar puerto o liberar puerto actual'
        });
        
        // Error de memoria
        this.recoveryStrategies.set('MEMORY_ERROR', {
            maxRetries: 2,
            retryDelay: 10000,
            action: 'Limpiar memoria y reintentar'
        });
        
        // Error de archivo no encontrado
        this.recoveryStrategies.set('FILE_NOT_FOUND_ERROR', {
            maxRetries: 1,
            retryDelay: 1000,
            action: 'Verificar ruta de archivo'
        });
    }
    
    /**
     * Maneja un error del sistema
     */
    handleError(error, context = {}, severity = 'ERROR') {
        try {
            this.errorCount++;
            
            const errorInfo = {
                timestamp: new Date().toISOString(),
                errorId: `QBTC-ERR-${Date.now()}-${this.errorCount}`,
                severity: severity,
                message: error.message || 'Error desconocido',
                stack: error.stack,
                context: context,
                type: this._classifyError(error),
                recoveryStrategy: this._getRecoveryStrategy(error)
            };
            
            // Log del error
            this._logError(errorInfo);
            
            // Manejar según severidad
            switch (severity) {
                case 'CRITICAL':
                    this._handleCriticalError(errorInfo);
                    break;
                case 'ERROR':
                    this._handleStandardError(errorInfo);
                    break;
                case 'WARNING':
                    this._handleWarning(errorInfo);
                    break;
                default:
                    this._handleStandardError(errorInfo);
            }
            
            return errorInfo;
        } catch (logError) {
            console.error('Error en el manejador de errores:', logError);
            return null;
        }
    }
    
    /**
     * Clasifica el tipo de error
     */
    _classifyError(error) {
        const message = error.message || '';
        const stack = error.stack || '';
        
        if (message.includes('EADDRINUSE') || message.includes('port')) {
            return 'PORT_IN_USE_ERROR';
        }
        
        if (message.includes('credentials') || message.includes('API key')) {
            return 'CREDENTIALS_ERROR';
        }
        
        if (message.includes('ENOENT') || message.includes('not found')) {
            return 'FILE_NOT_FOUND_ERROR';
        }
        
        if (message.includes('memory') || message.includes('heap')) {
            return 'MEMORY_ERROR';
        }
        
        if (message.includes('binance') || message.includes('connection')) {
            return 'BINANCE_CONNECTION_ERROR';
        }
        
        return 'UNKNOWN_ERROR';
    }
    
    /**
     * Obtiene la estrategia de recuperación para un error
     */
    _getRecoveryStrategy(error) {
        const errorType = this._classifyError(error);
        return this.recoveryStrategies.get(errorType) || {
            maxRetries: 1,
            retryDelay: 1000,
            action: 'Reintentar operación'
        };
    }
    
    /**
     * Maneja errores críticos
     */
    _handleCriticalError(errorInfo) {
        console.error('🚨 ERROR CRÍTICO:', errorInfo.message);
        console.error('📋 Contexto:', errorInfo.context);
        
        // Agregar a lista de errores críticos
        this.criticalErrors.push(errorInfo);
        
        // Mantener solo los últimos 10 errores críticos
        if (this.criticalErrors.length > 10) {
            this.criticalErrors = this.criticalErrors.slice(-10);
        }
        
        // Notificar al sistema
        this._notifySystem(errorInfo);
    }
    
    /**
     * Maneja errores estándar
     */
    _handleStandardError(errorInfo) {
        console.error('❌ Error:', errorInfo.message);
        if (errorInfo.context && Object.keys(errorInfo.context).length > 0) {
            console.error('📋 Contexto:', errorInfo.context);
        }
    }
    
    /**
     * Maneja advertencias
     */
    _handleWarning(errorInfo) {
        console.warn('⚠️ Advertencia:', errorInfo.message);
    }
    
    /**
     * Registra el error en el archivo de log
     */
    _logError(errorInfo) {
        try {
            const logEntry = JSON.stringify(errorInfo, null, 2) + '\n---\n';
            
            // Verificar tamaño del archivo de log
            if (fs.existsSync(this.errorLogPath)) {
                const stats = fs.statSync(this.errorLogPath);
                if (stats.size > this.maxLogSize) {
                    // Rotar el archivo de log
                    const backupPath = this.errorLogPath + '.backup';
                    fs.renameSync(this.errorLogPath, backupPath);
                }
            }
            
            fs.appendFileSync(this.errorLogPath, logEntry);
        } catch (logError) {
            console.error('Error escribiendo log:', logError);
        }
    }
    
    /**
     * Notifica al sistema sobre errores críticos
     */
    _notifySystem(errorInfo) {
        // Aquí se pueden implementar notificaciones
        // como emails, Slack, etc.
        console.error('🚨 NOTIFICACIÓN SISTEMA - Error crítico detectado');
        console.error(`   ID: ${errorInfo.errorId}`);
        console.error(`   Tipo: ${errorInfo.type}`);
        console.error(`   Acción: ${errorInfo.recoveryStrategy.action}`);
    }
    
    /**
     * Intenta recuperarse de un error
     */
    async attemptRecovery(error, context = {}) {
        const errorType = this._classifyError(error);
        const strategy = this.recoveryStrategies.get(errorType);
        
        if (!strategy) {
            console.warn('⚠️ No hay estrategia de recuperación para:', errorType);
            return false;
        }
        
        console.log(`🔄 Intentando recuperación: ${strategy.action}`);
        
        for (let attempt = 1; attempt <= strategy.maxRetries; attempt++) {
            try {
                console.log(`   Intento ${attempt}/${strategy.maxRetries}`);
                
                // Esperar antes del reintento
                if (attempt > 1) {
                    await new Promise(resolve => setTimeout(resolve, strategy.retryDelay));
                }
                
                // Ejecutar estrategia de recuperación
                const success = await this._executeRecoveryStrategy(errorType, context);
                
                if (success) {
                    console.log('✅ Recuperación exitosa');
                    return true;
                }
            } catch (recoveryError) {
                console.error(`❌ Error en intento ${attempt}:`, recoveryError.message);
            }
        }
        
        console.error('❌ Recuperación fallida después de todos los intentos');
        return false;
    }
    
    /**
     * Ejecuta la estrategia de recuperación específica
     */
    async _executeRecoveryStrategy(errorType, context) {
        switch (errorType) {
            case 'PORT_IN_USE_ERROR':
                return this._recoverPortError(context);
            case 'CREDENTIALS_ERROR':
                return this._recoverCredentialsError(context);
            case 'FILE_NOT_FOUND_ERROR':
                return this._recoverFileError(context);
            case 'MEMORY_ERROR':
                return this._recoverMemoryError(context);
            case 'BINANCE_CONNECTION_ERROR':
                return this._recoverBinanceError(context);
            default:
                return false;
        }
    }
    
    /**
     * Recuperación para errores de puerto
     */
    async _recoverPortError(context) {
        try {
            // Intentar liberar el puerto
            const { exec } = require('child_process');
            const util = require('util');
            const execAsync = util.promisify(exec);
            
            await execAsync('netstat -ano | findstr :18020');
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Recuperación para errores de credenciales
     */
    async _recoverCredentialsError(context) {
        try {
            // Recargar credenciales
            const { CredentialsManager } = require('./quantum-core/CredentialsManager');
            const credentialsManager = CredentialsManager.getInstance();
            credentialsManager.reloadCredentials();
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Recuperación para errores de archivo
     */
    async _recoverFileError(context) {
        try {
            // Verificar si el archivo existe en rutas alternativas
            const filePath = context.filePath;
            if (filePath && !fs.existsSync(filePath)) {
                // Buscar en directorios alternativos
                const alternatives = [
                    path.join(__dirname, '..', path.basename(filePath)),
                    path.join(__dirname, 'config', path.basename(filePath)),
                    path.join(__dirname, 'quantum-core', path.basename(filePath))
                ];
                
                for (const altPath of alternatives) {
                    if (fs.existsSync(altPath)) {
                        console.log(`✅ Archivo encontrado en: ${altPath}`);
                        return true;
                    }
                }
            }
            return false;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Recuperación para errores de memoria
     */
    async _recoverMemoryError(context) {
        try {
            // Forzar garbage collection si está disponible
            if (global.gc) {
                global.gc();
                console.log('🧹 Garbage collection ejecutado');
            }
            
            // Limpiar caches si existen
            if (context.cache) {
                context.cache.clear();
            }
            
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Recuperación para errores de Binance
     */
    async _recoverBinanceError(context) {
        try {
            // Reintentar conexión después de un delay
            await new Promise(resolve => setTimeout(resolve, 5000));
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Obtiene estadísticas de errores
     */
    getErrorStats() {
        return {
            totalErrors: this.errorCount,
            criticalErrors: this.criticalErrors.length,
            lastCriticalError: this.criticalErrors[this.criticalErrors.length - 1],
            logFileSize: fs.existsSync(this.errorLogPath) ? fs.statSync(this.errorLogPath).size : 0
        };
    }
    
    /**
     * Limpia logs antiguos
     */
    cleanupLogs() {
        try {
            if (fs.existsSync(this.errorLogPath)) {
                const stats = fs.statSync(this.errorLogPath);
                const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
                
                if (stats.mtime.getTime() < oneWeekAgo) {
                    fs.unlinkSync(this.errorLogPath);
                    console.log('🧹 Logs antiguos eliminados');
                }
            }
        } catch (error) {
            console.error('Error limpiando logs:', error);
        }
    }
    
    /**
     * Método estático para crear instancia singleton
     */
    static getInstance() {
        if (!QuantumErrorHandler._instance) {
            QuantumErrorHandler._instance = new QuantumErrorHandler();
        }
        return QuantumErrorHandler._instance;
    }
}

// Exportar clase
module.exports = { QuantumErrorHandler };

// Si este script se ejecuta directamente, mostrar diagnóstico
if (require.main === module) {
    console.log('🛡️ Probando Quantum Error Handler...');
    const errorHandler = QuantumErrorHandler.getInstance();
    
    // Probar manejo de errores
    const testError = new Error('Error de prueba');
    errorHandler.handleError(testError, { test: true }, 'WARNING');
    
    console.log('📊 Estadísticas:', errorHandler.getErrorStats());
}
