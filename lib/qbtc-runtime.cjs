/**
 * QBTC-RUNTIME - Librería Central de Estándares Obligatorios (CommonJS)
 * =====================================================================
 * 
 * Esta librería establece y garantiza el cumplimiento de políticas críticas:
 * 1. PROHIBIDO Math.random - Solo entropía criptográfica del kernel
 * 2. OBLIGATORIO ejecutar en segundo plano con PM2 + métricas
 * 3. ESTANDARIZACIÓN de logging, configuración y observabilidad
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * POLÍTICA CRÍTICA: Generación de números aleatorios seguros
 * Reemplaza Math.random con entropía criptográfica del kernel
 */
class SecureRandom {
    /**
     * Genera número aleatorio flotante [0, 1) usando entropía criptográfica
     * REEMPLAZA: Math.random()
     */
    static random() {
        const buffer = crypto.randomBytes(4);
        const value = buffer.readUInt32BE(0);
        return value / 0x100000000; // Convierte a [0, 1)
    }

    /**
     * Genera entero aleatorio en rango [min, max]
     */
    static randomInt(min = 0, max = 2147483647) {
        const range = max - min + 1;
        const bytes = Math.ceil(Math.log2(range) / 8);
        let randomValue;
        
        do {
            const buffer = crypto.randomBytes(bytes);
            randomValue = buffer.readUIntBE(0, bytes);
        } while (randomValue >= Math.floor(0x100 ** bytes / range) * range);
        
        return min + (randomValue % range);
    }

    /**
     * Genera UUID seguro usando entropía criptográfica
     */
    static uuid() {
        return crypto.randomUUID();
    }

    /**
     * Genera bytes aleatorios seguros
     */
    static bytes(size) {
        return crypto.randomBytes(size);
    }

    /**
     * Genera string aleatorio hexadecimal
     */
    static hex(length = 16) {
        return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
    }
}

/**
 * SISTEMA DE MÉTRICAS ESTANDARIZADO
 * Recolecta métricas de rendimiento y estado para todos los servicios
 */
class QBTCMetrics {
    constructor(serviceName) {
        this.serviceName = serviceName;
        this.metrics = {
            startTime: Date.now(),
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            systemLoad: 0,
            memoryUsage: 0,
            cpuUsage: 0,
            customMetrics: {}
        };
        this.responseTimes = [];
        this.startMetricsCollection();
    }

    /**
     * Inicia recolección automática de métricas del sistema
     */
    startMetricsCollection() {
        setInterval(() => {
            this.updateSystemMetrics();
        }, 10000); // Actualiza cada 10 segundos
    }

    /**
     * Actualiza métricas del sistema usando kernel metrics
     */
    updateSystemMetrics() {
        const loadAvg = os.loadavg();
        const memUsage = process.memoryUsage();
        const totalMem = os.totalmem();
        
        this.metrics.systemLoad = loadAvg[0];
        this.metrics.memoryUsage = (memUsage.heapUsed / totalMem) * 100;
        
        // CPU usage aproximado basado en load average
        this.metrics.cpuUsage = Math.min(loadAvg[0] * 10, 100);
    }

    /**
     * Registra inicio de request
     */
    startRequest() {
        return Date.now();
    }

    /**
     * Registra finalización exitosa de request
     */
    endRequestSuccess(startTime) {
        const responseTime = Date.now() - startTime;
        this.metrics.totalRequests++;
        this.metrics.successfulRequests++;
        this.responseTimes.push(responseTime);
        
        // Mantiene solo últimos 1000 response times
        if (this.responseTimes.length > 1000) {
            this.responseTimes.shift();
        }
        
        this.updateAverageResponseTime();
    }

    /**
     * Registra request fallido
     */
    endRequestFailure(startTime) {
        const responseTime = Date.now() - startTime;
        this.metrics.totalRequests++;
        this.metrics.failedRequests++;
        this.responseTimes.push(responseTime);
        
        if (this.responseTimes.length > 1000) {
            this.responseTimes.shift();
        }
        
        this.updateAverageResponseTime();
    }

    /**
     * Actualiza promedio de tiempo de respuesta
     */
    updateAverageResponseTime() {
        if (this.responseTimes.length === 0) return;
        
        const sum = this.responseTimes.reduce((a, b) => a + b, 0);
        this.metrics.averageResponseTime = sum / this.responseTimes.length;
    }

    /**
     * Establece métrica personalizada
     */
    setCustomMetric(key, value) {
        this.metrics.customMetrics[key] = value;
    }

    /**
     * Incrementa métrica personalizada
     */
    incrementCustomMetric(key, increment = 1) {
        if (!this.metrics.customMetrics[key]) {
            this.metrics.customMetrics[key] = 0;
        }
        this.metrics.customMetrics[key] += increment;
    }

    /**
     * Obtiene todas las métricas actuales
     */
    getMetrics() {
        return {
            serviceName: this.serviceName,
            timestamp: new Date().toISOString(),
            uptime: Date.now() - this.metrics.startTime,
            ...this.metrics
        };
    }

    /**
     * Obtiene métricas en formato Prometheus
     */
    getPrometheusMetrics() {
        const metrics = this.getMetrics();
        let prometheusOutput = '';
        
        prometheusOutput += `# HELP qbtc_total_requests Total number of requests\n`;
        prometheusOutput += `# TYPE qbtc_total_requests counter\n`;
        prometheusOutput += `qbtc_total_requests{service="${this.serviceName}"} ${metrics.totalRequests}\n\n`;
        
        prometheusOutput += `# HELP qbtc_successful_requests Number of successful requests\n`;
        prometheusOutput += `# TYPE qbtc_successful_requests counter\n`;
        prometheusOutput += `qbtc_successful_requests{service="${this.serviceName}"} ${metrics.successfulRequests}\n\n`;
        
        prometheusOutput += `# HELP qbtc_failed_requests Number of failed requests\n`;
        prometheusOutput += `# TYPE qbtc_failed_requests counter\n`;
        prometheusOutput += `qbtc_failed_requests{service="${this.serviceName}"} ${metrics.failedRequests}\n\n`;
        
        prometheusOutput += `# HELP qbtc_average_response_time Average response time in ms\n`;
        prometheusOutput += `# TYPE qbtc_average_response_time gauge\n`;
        prometheusOutput += `qbtc_average_response_time{service="${this.serviceName}"} ${metrics.averageResponseTime}\n\n`;
        
        prometheusOutput += `# HELP qbtc_memory_usage Memory usage percentage\n`;
        prometheusOutput += `# TYPE qbtc_memory_usage gauge\n`;
        prometheusOutput += `qbtc_memory_usage{service="${this.serviceName}"} ${metrics.memoryUsage}\n\n`;
        
        prometheusOutput += `# HELP qbtc_cpu_usage CPU usage percentage\n`;
        prometheusOutput += `# TYPE qbtc_cpu_usage gauge\n`;
        prometheusOutput += `qbtc_cpu_usage{service="${this.serviceName}"} ${metrics.cpuUsage}\n\n`;
        
        // Métricas personalizadas
        for (const [key, value] of Object.entries(metrics.customMetrics)) {
            prometheusOutput += `# HELP qbtc_custom_${key} Custom metric: ${key}\n`;
            prometheusOutput += `# TYPE qbtc_custom_${key} gauge\n`;
            prometheusOutput += `qbtc_custom_${key}{service="${this.serviceName}"} ${value}\n\n`;
        }
        
        return prometheusOutput;
    }
}

/**
 * LOGGER ESTANDARIZADO
 * Sistema de logging unificado con niveles y formato estructurado
 */
class QBTCLogger {
    constructor(serviceName, logLevel = 'info') {
        this.serviceName = serviceName;
        this.logLevel = logLevel;
        this.logLevels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3,
            trace: 4
        };
    }

    /**
     * Formatea mensaje de log con estructura estándar
     */
    formatMessage(level, message, meta = {}) {
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            level: level.toUpperCase(),
            service: this.serviceName,
            message,
            meta,
            pid: process.pid,
            hostname: os.hostname()
        });
    }

    /**
     * Determina si debe loggear según nivel
     */
    shouldLog(level) {
        return this.logLevels[level] <= this.logLevels[this.logLevel];
    }

    error(message, meta = {}) {
        if (this.shouldLog('error')) {
            console.error(this.formatMessage('error', message, meta));
        }
    }

    warn(message, meta = {}) {
        if (this.shouldLog('warn')) {
            console.warn(this.formatMessage('warn', message, meta));
        }
    }

    info(message, meta = {}) {
        if (this.shouldLog('info')) {
            console.log(this.formatMessage('info', message, meta));
        }
    }

    debug(message, meta = {}) {
        if (this.shouldLog('debug')) {
            console.debug(this.formatMessage('debug', message, meta));
        }
    }

    trace(message, meta = {}) {
        if (this.shouldLog('trace')) {
            console.trace(this.formatMessage('trace', message, meta));
        }
    }
}

/**
 * CONFIGURADOR PM2 ESTANDARIZADO
 * Genera configuraciones PM2 con estándares obligatorios
 */
class PM2Config {
    static generateConfig(serviceName, script, options = {}) {
        return {
            name: serviceName,
            script: script,
            cwd: process.cwd(),
            instances: options.instances || 1,
            exec_mode: options.exec_mode || 'fork',
            watch: options.watch || false,
            max_memory_restart: options.max_memory_restart || '500M',
            env: {
                NODE_ENV: 'development',
                QBTC_SERVICE_NAME: serviceName,
                QBTC_LOG_LEVEL: options.logLevel || 'info',
                ...options.env
            },
            env_production: {
                NODE_ENV: 'production',
                QBTC_SERVICE_NAME: serviceName,
                QBTC_LOG_LEVEL: options.logLevelProd || 'warn',
                ...options.envProd
            },
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            out_file: `./logs/${serviceName}-out.log`,
            error_file: `./logs/${serviceName}-error.log`,
            log_file: `./logs/${serviceName}-combined.log`,
            time: true,
            autorestart: true,
            max_restarts: 10,
            min_uptime: '10s',
            restart_delay: 4000
        };
    }

    static saveConfig(config, filename) {
        const configPath = path.join(process.cwd(), filename);
        fs.writeFileSync(configPath, `module.exports = ${JSON.stringify(config, null, 2)};`);
        return configPath;
    }
}

/**
 * VALIDADOR DE POLÍTICAS
 * Valida que los servicios cumplan con políticas obligatorias
 */
class PolicyValidator {
    static validateMathRandomUsage(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`Archivo no encontrado: ${filePath}`);
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        const mathRandomMatches = content.match(/Math\.random\(\)/g);
        
        if (mathRandomMatches) {
            throw new Error(
                `POLÍTICA VIOLADA: Uso de Math.random() encontrado en ${filePath}. ` +
                `Ubicaciones: ${mathRandomMatches.length}. ` +
                `Use SecureRandom.random() en su lugar.`
            );
        }
        
        return true;
    }

    static validateServiceStructure(servicePath) {
        const requiredFiles = [
            'package.json',
            'ecosystem.config.cjs'
        ];
        
        const missingFiles = requiredFiles.filter(file => 
            !fs.existsSync(path.join(servicePath, file))
        );
        
        if (missingFiles.length > 0) {
            throw new Error(
                `ESTRUCTURA INVÁLIDA: Archivos obligatorios faltantes en ${servicePath}: ${missingFiles.join(', ')}`
            );
        }
        
        return true;
    }

    static validatePM2Config(configPath) {
        if (!fs.existsSync(configPath)) {
            throw new Error(`Configuración PM2 no encontrada: ${configPath}`);
        }
        
        const config = require(configPath);
        const requiredFields = ['name', 'script', 'env'];
        
        const missingFields = requiredFields.filter(field => !config[field]);
        
        if (missingFields.length > 0) {
            throw new Error(
                `CONFIGURACIÓN PM2 INVÁLIDA: Campos obligatorios faltantes: ${missingFields.join(', ')}`
            );
        }
        
        return true;
    }
}

/**
 * HEALTH CHECK ESTANDARIZADO
 * Sistema estándar de health checks para todos los servicios
 */
class HealthCheck {
    constructor(serviceName, checks = {}) {
        this.serviceName = serviceName;
        this.checks = checks;
        this.status = 'starting';
        this.lastCheck = null;
    }

    /**
     * Ejecuta todos los health checks
     */
    async runHealthChecks() {
        const results = {
            service: this.serviceName,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            checks: {}
        };

        for (const [name, checkFn] of Object.entries(this.checks)) {
            try {
                const startTime = Date.now();
                const result = await checkFn();
                const duration = Date.now() - startTime;
                
                results.checks[name] = {
                    status: 'pass',
                    duration: `${duration}ms`,
                    output: result
                };
            } catch (error) {
                results.checks[name] = {
                    status: 'fail',
                    error: error.message
                };
                results.status = 'unhealthy';
            }
        }

        this.lastCheck = results;
        this.status = results.status;
        return results;
    }

    /**
     * Obtiene último resultado de health check
     */
    getLastCheck() {
        return this.lastCheck || {
            service: this.serviceName,
            status: this.status,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Agrega nuevo health check
     */
    addCheck(name, checkFn) {
        this.checks[name] = checkFn;
    }
}

// INTERCEPTOR GLOBAL PARA Math.random
// Reemplaza automáticamente cualquier uso de Math.random
const originalMathRandom = Math.random;
Math.random = function() {
    console.warn('WARNING: Math.random() interceptado y reemplazado por SecureRandom.random()');
    return SecureRandom.random();
};

// EXPORT DE LA LIBRERÍA
module.exports = {
    SecureRandom,
    QBTCMetrics,
    QBTCLogger,
    PM2Config,
    PolicyValidator,
    HealthCheck,
    
    // Utilidades
    version: '1.0.0',
    buildInfo: {
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
    }
};
