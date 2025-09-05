// ========================================================================
// QUANTUM PRIME LOGGER - SISTEMA DE LOGS ASCII COMPATIBLE POWERSHELL
// Copyright (c) 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES
// Sistema de logging estructurado para metricas primas con total 
// compatibilidad PowerShell y caracteres ASCII exclusivamente
// ========================================================================

const fs = require('fs');
const path = require('path');

class QuantumPrimeLogger {
    constructor(config = {}) {
        // CONFIGURACION LOGGING COMPATIBLE POWERSHELL
        this.config = {
            logDir: config.logDir || path.join(process.cwd(), 'quantum-logs'),
            maxFileSize: config.maxFileSize || 50 * 1024 * 1024, // 50MB
            maxFiles: config.maxFiles || 10,
            enableConsole: config.enableConsole !== false,
            enableFile: config.enableFile !== false,
            timestampFormat: config.timestampFormat || 'ISO',
            asciiOnly: true, // FORZAR SOLO ASCII
            powerShellCompatible: true
        };
        
        // NIVELES DE LOG
        this.logLevels = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            PRIME: 4, // Nivel especial para transformaciones primas
            RESONANCE: 5, // Nivel especial para resonancias
            BOOST: 6 // Nivel especial para boosts
        };
        
        this.currentLevel = this.logLevels.INFO;
        
        // ESTRUCTURAS ESPECIALIZADAS PARA METRICAS PRIMAS
        this.primeMetricsBuffer = [];
        this.resonanceBuffer = [];
        this.boostBuffer = [];
        this.chronologicalBuffer = [];
        
        // ARCHIVOS DE LOG ESPECIALIZADOS
        this.logFiles = {
            general: 'quantum-system.log',
            primes: 'prime-transformations.log',
            resonances: 'quantum-resonances.log',
            boosts: 'prime-boosts.log',
            chronological: 'chronological-history.log',
            errors: 'system-errors.log'
        };
        
        this.initializeLogger();
    }
    
    // ===================================================================
    // INICIALIZACION DEL SISTEMA DE LOGGING
    // ===================================================================
    
    initializeLogger() {
        try {
            // CREAR DIRECTORIO DE LOGS SI NO EXISTE
            if (!fs.existsSync(this.config.logDir)) {
                fs.mkdirSync(this.config.logDir, { recursive: true });
            }
            
            // INICIALIZAR ARCHIVOS DE LOG
            this.initializeLogFiles();
            
            // CONFIGURAR ROTACION AUTOMATICA
            this.setupLogRotation();
            
            this.log('INFO', 'LOGGER', 'Quantum Prime Logger inicializado correctamente', {
                logDir: this.config.logDir,
                asciiOnly: this.config.asciiOnly,
                powerShellCompatible: this.config.powerShellCompatible
            });
            
        } catch (error) {
            console.error('[QUANTUM LOGGER] Error inicializando logger:', this.sanitizeForPowerShell(error.message));
        }
    }
    
    initializeLogFiles() {
        Object.values(this.logFiles).forEach(fileName => {
            const filePath = path.join(this.config.logDir, fileName);
            if (!fs.existsSync(filePath)) {
                const header = this.createLogFileHeader(fileName);
                fs.writeFileSync(filePath, header, 'utf8');
            }
        });
    }
    
    createLogFileHeader(fileName) {
        const timestamp = this.formatTimestamp();
        return [
            '========================================================================',
            `QUANTUM PRIME METRICS LOG - ${fileName.toUpperCase()}`,
            'Copyright (c) 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES',
            'Sistema de trazabilidad de transformaciones primas cuanticas',
            '========================================================================',
            `INICIO DE SESION: ${timestamp}`,
            'FORMATO: [TIMESTAMP] [NIVEL] [COMPONENTE] MENSAJE | METADATOS',
            'COMPATIBILIDAD: PowerShell, ASCII exclusivamente',
            '========================================================================',
            ''
        ].join('\n');
    }
    
    // ===================================================================
    // METODOS PRINCIPALES DE LOGGING
    // ===================================================================
    
    log(level, component, message, metadata = null) {
        const levelNum = this.logLevels[level.toUpperCase()] || this.logLevels.INFO;
        
        if (levelNum < this.currentLevel) {
            return;
        }
        
        const logEntry = this.formatLogEntry(level, component, message, metadata);
        
        // OUTPUT A CONSOLA
        if (this.config.enableConsole) {
            console.log(logEntry.console);
        }
        
        // OUTPUT A ARCHIVO
        if (this.config.enableFile) {
            this.writeToFile('general', logEntry.file);
        }
    }
    
    // METODOS ESPECIALIZADOS PARA METRICAS PRIMAS
    logPrimeTransformation(component, transformationData) {
        const message = `PRIME TRANSFORMATION: ${transformationData.type}`;
        const metadata = {
            primeSignature: transformationData.signature,
            originalValue: transformationData.original,
            transformedValue: transformationData.transformed,
            primeFactors: transformationData.primeFactors,
            resonanceLevel: transformationData.resonance,
            timestamp: Date.now(),
            component: component
        };
        
        this.log('PRIME', component, message, metadata);
        this.writeToFile('primes', this.formatPrimeEntry(transformationData));
        this.addToChronological('PRIME_TRANSFORM', component, transformationData);
    }
    
    logQuantumResonance(component, resonanceData) {
        const message = `QUANTUM RESONANCE: ${resonanceData.type}`;
        const metadata = {
            resonanceFrequency: resonanceData.frequency,
            amplitude: resonanceData.amplitude,
            harmonics: resonanceData.harmonics,
            coherenceLevel: resonanceData.coherence,
            entanglementStrength: resonanceData.entanglement,
            timestamp: Date.now(),
            component: component
        };
        
        this.log('RESONANCE', component, message, metadata);
        this.writeToFile('resonances', this.formatResonanceEntry(resonanceData));
        this.addToChronological('QUANTUM_RESONANCE', component, resonanceData);
    }
    
    logPrimeBoost(component, boostData) {
        const message = `PRIME BOOST: ${boostData.type}`;
        const metadata = {
            boostFactor: boostData.factor,
            primeSource: boostData.primeSource,
            targetMetric: boostData.target,
            amplification: boostData.amplification,
            sustainabilityIndex: boostData.sustainability,
            timestamp: Date.now(),
            component: component
        };
        
        this.log('BOOST', component, message, metadata);
        this.writeToFile('boosts', this.formatBoostEntry(boostData));
        this.addToChronological('PRIME_BOOST', component, boostData);
    }
    
    // ===================================================================
    // FORMATEO DE ENTRADAS DE LOG
    // ===================================================================
    
    formatLogEntry(level, component, message, metadata) {
        const timestamp = this.formatTimestamp();
        const sanitizedMessage = this.sanitizeForPowerShell(message);
        const sanitizedComponent = this.sanitizeForPowerShell(component);
        
        let metadataStr = '';
        if (metadata) {
            metadataStr = ' | ' + this.formatMetadata(metadata);
        }
        
        const consoleEntry = `[${timestamp}] [${level.padEnd(9)}] [${sanitizedComponent.padEnd(20)}] ${sanitizedMessage}${metadataStr}`;
        const fileEntry = `[${timestamp}] [${level}] [${sanitizedComponent}] ${sanitizedMessage}${metadataStr}`;
        
        return {
            console: consoleEntry,
            file: fileEntry
        };
    }
    
    formatPrimeEntry(data) {
        const timestamp = this.formatTimestamp();
        return [
            `[${timestamp}] PRIME_TRANSFORMATION`,
            `  Type: ${data.type}`,
            `  Signature: ${data.signature}`,
            `  Original: ${data.original}`,
            `  Transformed: ${data.transformed}`,
            `  Prime_Factors: [${data.primeFactors.join(', ')}]`,
            `  Resonance_Level: ${data.resonance}`,
            `  Component: ${data.component || 'UNKNOWN'}`,
            ''
        ].join('\n');
    }
    
    formatResonanceEntry(data) {
        const timestamp = this.formatTimestamp();
        return [
            `[${timestamp}] QUANTUM_RESONANCE`,
            `  Type: ${data.type}`,
            `  Frequency: ${data.frequency} Hz`,
            `  Amplitude: ${data.amplitude}`,
            `  Harmonics: [${data.harmonics.join(', ')}]`,
            `  Coherence_Level: ${data.coherence}`,
            `  Entanglement_Strength: ${data.entanglement}`,
            `  Component: ${data.component || 'UNKNOWN'}`,
            ''
        ].join('\n');
    }
    
    formatBoostEntry(data) {
        const timestamp = this.formatTimestamp();
        return [
            `[${timestamp}] PRIME_BOOST`,
            `  Type: ${data.type}`,
            `  Boost_Factor: ${data.factor}`,
            `  Prime_Source: ${data.primeSource}`,
            `  Target_Metric: ${data.target}`,
            `  Amplification: ${data.amplification}`,
            `  Sustainability_Index: ${data.sustainability}`,
            `  Component: ${data.component || 'UNKNOWN'}`,
            ''
        ].join('\n');
    }
    
    formatMetadata(metadata) {
        try {
            const sanitized = this.sanitizeObjectForPowerShell(metadata);
            return JSON.stringify(sanitized).replace(/"/g, "'");
        } catch (error) {
            return `METADATA_ERROR: ${this.sanitizeForPowerShell(error.message)}`;
        }
    }
    
    // ===================================================================
    // SANITIZACION PARA COMPATIBILIDAD POWERSHELL
    // ===================================================================
    
    sanitizeForPowerShell(text) {
        if (typeof text !== 'string') {
            text = String(text);
        }
        
        return text
            // REMOVER CARACTERES NO-ASCII
            .replace(/[^\x20-\x7E]/g, '?')
            // ESCAPAR CARACTERES PROBLEMATICOS EN POWERSHELL
            .replace(/[\$`"']/g, '_')
            // REMOVER CARACTERES DE CONTROL
            .replace(/[\x00-\x1F\x7F]/g, '')
            // LIMITAR LONGITUD
            .substring(0, 1000);
    }
    
    sanitizeObjectForPowerShell(obj) {
        if (obj === null || obj === undefined) {
            return null;
        }
        
        if (typeof obj === 'string') {
            return this.sanitizeForPowerShell(obj);
        }
        
        if (typeof obj === 'number' || typeof obj === 'boolean') {
            return obj;
        }
        
        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObjectForPowerShell(item));
        }
        
        if (typeof obj === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(obj)) {
                const sanitizedKey = this.sanitizeForPowerShell(key);
                sanitized[sanitizedKey] = this.sanitizeObjectForPowerShell(value);
            }
            return sanitized;
        }
        
        return this.sanitizeForPowerShell(String(obj));
    }
    
    // ===================================================================
    // REGISTRO CRONOLOGICO
    // ===================================================================
    
    addToChronological(eventType, component, data) {
        const chronEntry = {
            timestamp: Date.now(),
            isoTimestamp: this.formatTimestamp(),
            eventType: eventType,
            component: component,
            data: this.sanitizeObjectForPowerShell(data)
        };
        
        this.chronologicalBuffer.push(chronEntry);
        
        // ESCRIBIR A ARCHIVO CRONOLOGICO
        const chronLine = [
            `[${chronEntry.isoTimestamp}]`,
            `[${eventType}]`,
            `[${component}]`,
            JSON.stringify(chronEntry.data).replace(/"/g, "'")
        ].join(' ');
        
        this.writeToFile('chronological', chronLine);
        
        // MANTENER BUFFER LIMITADO
        if (this.chronologicalBuffer.length > 1000) {
            this.chronologicalBuffer = this.chronologicalBuffer.slice(-500);
        }
    }
    
    // ===================================================================
    // GESTION DE ARCHIVOS
    // ===================================================================
    
    writeToFile(fileType, content) {
        try {
            const fileName = this.logFiles[fileType];
            if (!fileName) {
                return;
            }
            
            const filePath = path.join(this.config.logDir, fileName);
            const logLine = content + '\n';
            
            // VERIFICAR TAMAÑO DE ARCHIVO
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                if (stats.size > this.config.maxFileSize) {
                    this.rotateLogFile(filePath);
                }
            }
            
            fs.appendFileSync(filePath, logLine, 'utf8');
            
        } catch (error) {
            console.error('[QUANTUM LOGGER] Error escribiendo archivo:', this.sanitizeForPowerShell(error.message));
        }
    }
    
    rotateLogFile(filePath) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
            const rotatedPath = filePath.replace('.log', `_${timestamp}.log`);
            
            fs.renameSync(filePath, rotatedPath);
            
            // CREAR NUEVO ARCHIVO CON HEADER
            const fileName = path.basename(filePath);
            const header = this.createLogFileHeader(fileName);
            fs.writeFileSync(filePath, header, 'utf8');
            
        } catch (error) {
            console.error('[QUANTUM LOGGER] Error rotando archivo:', this.sanitizeForPowerShell(error.message));
        }
    }
    
    setupLogRotation() {
        // ROTACION AUTOMATICA CADA HORA
        setInterval(() => {
            this.cleanupOldLogs();
        }, 60 * 60 * 1000); // 1 hora
    }
    
    cleanupOldLogs() {
        try {
            const files = fs.readdirSync(this.config.logDir);
            const logFiles = files
                .filter(f => f.endsWith('.log'))
                .map(f => ({
                    name: f,
                    path: path.join(this.config.logDir, f),
                    stats: fs.statSync(path.join(this.config.logDir, f))
                }))
                .sort((a, b) => b.stats.mtime - a.stats.mtime);
            
            // MANTENER SOLO LOS ARCHIVOS MAS RECIENTES
            if (logFiles.length > this.config.maxFiles) {
                const filesToDelete = logFiles.slice(this.config.maxFiles);
                filesToDelete.forEach(file => {
                    fs.unlinkSync(file.path);
                });
            }
            
        } catch (error) {
            console.error('[QUANTUM LOGGER] Error limpiando logs:', this.sanitizeForPowerShell(error.message));
        }
    }
    
    // ===================================================================
    // UTILIDADES
    // ===================================================================
    
    formatTimestamp() {
        return new Date().toISOString();
    }
    
    setLogLevel(level) {
        if (this.logLevels[level.toUpperCase()] !== undefined) {
            this.currentLevel = this.logLevels[level.toUpperCase()];
        }
    }
    
    // METODOS DE CONVENIENCIA
    debug(component, message, metadata) {
        this.log('DEBUG', component, message, metadata);
    }
    
    info(component, message, metadata) {
        this.log('INFO', component, message, metadata);
    }
    
    warn(component, message, metadata) {
        this.log('WARN', component, message, metadata);
    }
    
    error(component, message, metadata) {
        this.log('ERROR', component, message, metadata);
        this.writeToFile('errors', this.formatLogEntry('ERROR', component, message, metadata).file);
    }
    
    // OBTENER HISTORICOS
    getChronologicalHistory(limit = 100) {
        return this.chronologicalBuffer.slice(-limit);
    }
    
    getPrimeMetrics(limit = 50) {
        return this.primeMetricsBuffer.slice(-limit);
    }
    
    getResonanceMetrics(limit = 50) {
        return this.resonanceBuffer.slice(-limit);
    }
    
    getBoostMetrics(limit = 50) {
        return this.boostBuffer.slice(-limit);
    }
}

// SINGLETON PARA USO GLOBAL
let globalLogger = null;

function getQuantumLogger(config) {
    if (!globalLogger) {
        globalLogger = new QuantumPrimeLogger(config);
    }
    return globalLogger;
}

module.exports = {
    QuantumPrimeLogger,
    getQuantumLogger
};
