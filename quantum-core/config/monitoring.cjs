/*
  Copyright © 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES.
  Sistema de Logging y Monitoreo Avanzado para QBTC
  Logs detallados para depuración y monitoreo en producción
*/

const fs = require('fs');
const path = require('path');

// Crear directorios de logs si no existen
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Configuración de logs por nivel
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
    VERBOSE: 4
};

const LOG_COLORS = {
    ERROR: '\x1b[31m',   // Rojo
    WARN: '\x1b[33m',    // Amarillo
    INFO: '\x1b[36m',    // Cian
    DEBUG: '\x1b[35m',   // Magenta
    VERBOSE: '\x1b[37m', // Blanco
    RESET: '\x1b[0m'
};

class AdvancedLogger {
    constructor() {
        this.logLevel = process.env.LOG_LEVEL || 'INFO';
        this.enableFileLogging = process.env.ENABLE_FILE_LOGGING !== 'false';
        this.enableConsoleLogging = process.env.ENABLE_CONSOLE_LOGGING !== 'false';
        
        // Archivos de log específicos
        this.logFiles = {
            error: path.join(logDir, 'error.log'),
            trading: path.join(logDir, 'trading.log'),
            binance: path.join(logDir, 'binance.log'),
            server: path.join(logDir, 'server.log'),
            general: path.join(logDir, 'general.log')
        };
        
        // Buffer para logs en memoria (últimos 1000 por categoría)
        this.logBuffer = {
            error: [],
            trading: [],
            binance: [],
            server: [],
            general: []
        };
        
        this.maxBufferSize = 1000;
        this.rotateLogSize = 10 * 1024 * 1024; // 10MB
    }
    
    shouldLog(level) {
        return LOG_LEVELS[level] <= LOG_LEVELS[this.logLevel];
    }
    
    formatLogMessage(level, category, message, extra = {}) {
        const timestamp = new Date().toISOString();
        const pid = process.pid;
        const formattedExtra = Object.keys(extra).length > 0 ? 
            '\n' + JSON.stringify(extra, null, 2) : '';
            
        return {
            timestamp,
            level,
            category,
            message,
            pid,
            extra,
            formatted: `[${timestamp}] [${level}] [${category}] [PID:${pid}] ${message}${formattedExtra}`
        };
    }
    
    writeToFile(logObj, category) {
        if (!this.enableFileLogging) return;
        
        const logFile = this.logFiles[category] || this.logFiles.general;
        
        try {
            // Rotar log si es muy grande
            if (fs.existsSync(logFile)) {
                const stats = fs.statSync(logFile);
                if (stats.size > this.rotateLogSize) {
                    const backupFile = logFile.replace('.log', `.${Date.now()}.log`);
                    fs.renameSync(logFile, backupFile);
                }
            }
            
            fs.appendFileSync(logFile, logObj.formatted + '\n', 'utf8');
        } catch (error) {
            console.error('Error escribiendo log a archivo:', error.message);
        }
    }
    
    writeToBuffer(logObj, category) {
        const buffer = this.logBuffer[category] || this.logBuffer.general;
        buffer.push(logObj);
        
        // Mantener tamaño del buffer
        if (buffer.length > this.maxBufferSize) {
            buffer.splice(0, buffer.length - this.maxBufferSize);
        }
    }
    
    log(level, category, message, extra = {}) {
        if (!this.shouldLog(level)) return;
        
        const logObj = this.formatLogMessage(level, category, message, extra);
        
        // Escribir a archivo
        this.writeToFile(logObj, category);
        
        // Escribir a buffer
        this.writeToBuffer(logObj, category);
        
        // Escribir a consola con colores
        if (this.enableConsoleLogging) {
            const color = LOG_COLORS[level] || LOG_COLORS.RESET;
            console.log(`${color}${logObj.formatted}${LOG_COLORS.RESET}`);
        }
        
        return logObj;
    }
    
    error(category, message, extra = {}) {
        return this.log('ERROR', category, message, extra);
    }
    
    warn(category, message, extra = {}) {
        return this.log('WARN', category, message, extra);
    }
    
    info(category, message, extra = {}) {
        return this.log('INFO', category, message, extra);
    }
    
    debug(category, message, extra = {}) {
        return this.log('DEBUG', category, message, extra);
    }
    
    verbose(category, message, extra = {}) {
        return this.log('VERBOSE', category, message, extra);
    }
    
    // Métodos específicos para trading
    logBinanceRequest(method, url, headers = {}, body = null) {
        // Ocultar secret key por seguridad
        const safeHeaders = { ...headers };
        if (safeHeaders['X-MBX-APIKEY']) {
            safeHeaders['X-MBX-APIKEY'] = safeHeaders['X-MBX-APIKEY'].substring(0, 8) + '***';
        }
        
        this.info('BINANCE', `Request enviada: ${method} ${url}`, {
            method,
            url,
            headers: safeHeaders,
            bodyLength: body ? JSON.stringify(body).length : 0,
            timestamp: new Date().toISOString()
        });
    }
    
    logBinanceResponse(method, url, statusCode, responseBody, responseTime) {
        const isError = statusCode >= 400;
        const level = isError ? 'ERROR' : 'INFO';
        
        this[level.toLowerCase()]('BINANCE', `Response recibida: ${method} ${url} - ${statusCode} (${responseTime}ms)`, {
            method,
            url,
            statusCode,
            responseTime,
            bodyLength: responseBody ? JSON.stringify(responseBody).length : 0,
            success: !isError,
            timestamp: new Date().toISOString(),
            ...(responseBody && (isError || this.logLevel === 'VERBOSE') ? { response: responseBody } : {})
        });
    }
    
    logTradingAction(action, symbol, params, result) {
        const success = result && !result.error;
        const level = success ? 'INFO' : 'ERROR';
        
        this[level.toLowerCase()]('TRADING', `${action} ejecutado para ${symbol}`, {
            action,
            symbol,
            params: {
                ...params,
                // Ocultar información sensible
                ...(params.apiKey ? { apiKey: '***' } : {}),
                ...(params.secret ? { secret: '***' } : {})
            },
            result: success ? result : { error: result?.error || 'Unknown error' },
            success,
            timestamp: new Date().toISOString()
        });
    }
    
    logSystemError(component, error, context = {}) {
        this.error('SYSTEM', `Error en ${component}: ${error.message}`, {
            component,
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name
            },
            context,
            timestamp: new Date().toISOString()
        });
    }
    
    // Obtener logs recientes para monitoreo
    getRecentLogs(category = 'general', limit = 100) {
        const buffer = this.logBuffer[category] || [];
        return buffer.slice(-limit);
    }
    
    // Obtener estadísticas de logs
    getLogStats() {
        const stats = {};
        
        Object.keys(this.logBuffer).forEach(category => {
            const buffer = this.logBuffer[category];
            stats[category] = {
                total: buffer.length,
                lastHour: buffer.filter(log => {
                    const logTime = new Date(log.timestamp);
                    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
                    return logTime > hourAgo;
                }).length,
                errors: buffer.filter(log => log.level === 'ERROR').length,
                warnings: buffer.filter(log => log.level === 'WARN').length
            };
        });
        
        return {
            categories: stats,
            files: this.logFiles,
            config: {
                logLevel: this.logLevel,
                fileLogging: this.enableFileLogging,
                consoleLogging: this.enableConsoleLogging
            }
        };
    }
    
    // Limpiar logs antiguos
    cleanOldLogs(daysOld = 7) {
        const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
        
        Object.values(this.logFiles).forEach(logFile => {
            const dir = path.dirname(logFile);
            if (!fs.existsSync(dir)) return;
            
            fs.readdirSync(dir).forEach(file => {
                if (file.includes('.log')) {
                    const fullPath = path.join(dir, file);
                    const stats = fs.statSync(fullPath);
                    
                    if (stats.mtime.getTime() < cutoffTime) {
                        fs.unlinkSync(fullPath);
                        this.info('SYSTEM', `Log file eliminado: ${file}`);
                    }
                }
            });
        });
    }
}

// Instancia singleton del logger
const logger = new AdvancedLogger();

// Limpiar logs antiguos al iniciar
logger.cleanOldLogs(7);

module.exports = {
    logger,
    AdvancedLogger,
    LOG_LEVELS,
    logDir
};
