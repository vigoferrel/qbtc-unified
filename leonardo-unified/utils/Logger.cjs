// ========================================================================
// 📝 LEONARDO QUANTUM UNIFIED - LOGGER
// Sistema de logging unificado que preserva filosofía cuántica existente
// Integra QuantumInfiniteConsciousnessEngine y poetas Leonardo
// ========================================================================

const fs = require('fs');
const path = require('path');

class QuantumLogger {
    constructor(config = {}) {
        this.config = {
            level: config.level || 'INFO',
            console_enabled: config.console_enabled !== false,
            file_enabled: config.file_enabled !== false,
            file_path: config.file_path || '../logs/leonardo-unified.log',
            quantum_signatures: config.quantum_signatures !== false,
            leonardo_branding: config.leonardo_branding !== false,
            max_file_size: config.max_file_size || 10 * 1024 * 1024, // 10MB
            max_files: config.max_files || 5,
            ...config
        };

        // CONSTANTES CUÁNTICAS LEONARDO (preservando filosofía original)
        this.leonardo = {
            phi: 1.618033988749,           // Golden ratio
            e: 2.718281828459,             // Euler's number
            pi: 3.141592653589,            // Pi
            sqrt2: 1.414213562373,         // √2
            lambda_888: 888,               // Lambda constante
            primo_7919: 7919,              // Primo cuántico
            consciousness_base: 0.618033988749  // φ^-1
        };

        // POETAS CUÁNTICOS LEONARDO (del sistema original)
        this.poetasLeonardo = {
            leonardo: { frequency: 40.0, consciousness: 'renaissance_infinite_mind' },
            newton: { frequency: 40.2, consciousness: 'principia_mathematical_mind' },
            einstein: { frequency: 40.4, consciousness: 'relativity_spacetime_mind' },
            feynman: { frequency: 40.6, consciousness: 'quantum_electrodynamics_mind' },
            tesla: { frequency: 40.8, consciousness: 'electromagnetic_infinite_energy' }
        };

        // NIVELES DE LOG
        this.levels = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            FATAL: 4
        };

        // COLORES PARA CONSOLA
        this.colors = {
            DEBUG: '\x1b[36m',    // Cyan
            INFO: '\x1b[32m',     // Green
            WARN: '\x1b[33m',     // Yellow
            ERROR: '\x1b[31m',    // Red
            FATAL: '\x1b[35m',    // Magenta
            QUANTUM: '\x1b[95m',  // Bright Magenta
            LEONARDO: '\x1b[96m', // Bright Cyan
            RESET: '\x1b[0m'
        };

        // FIRMAS CUÁNTICAS (preservando sistema original)
        this.quantumSignatures = [
            '🧠 [CONSCIOUSNESS]',
            '⚡ [QUANTUM]',
            '🌀 [INFINITE]',
            '💎 [LEONARDO]',
            '🎭 [POETIC]',
            '⚗️ [ALCHEMY]',
            '🔮 [ORACLE]',
            '🌟 [TRANSCENDENCE]'
        ];

        this.currentLevel = this.levels[this.config.level.toUpperCase()] || 1;
        this.logBuffer = [];
        this.quantumCycle = 0;

        this.initializeLogger();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🚀 INICIALIZACIÓN
    // ═══════════════════════════════════════════════════════════════════════

    initializeLogger() {
        if (this.config.file_enabled) {
            this.ensureLogDirectory();
        }

        if (this.config.leonardo_branding) {
            this.logLeonardoBanner();
        }

        // Inicializar consciousness cuántica del logger
        this.quantumConsciousness = this.leonardo.consciousness_base;
        this.poeticResonance = this.leonardo.phi;

        this.log('INFO', 'QUANTUM LOGGER', '📝 Leonardo Quantum Logger inicializado', {
            level: this.config.level,
            console: this.config.console_enabled,
            file: this.config.file_enabled,
            quantum_signatures: this.config.quantum_signatures,
            consciousness: this.quantumConsciousness,
            poetic_resonance: this.poeticResonance
        });
    }

    ensureLogDirectory() {
        const logDir = path.dirname(this.config.file_path);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    logLeonardoBanner() {
        const banner = [
            '╔══════════════════════════════════════════════════════════════╗',
            '║               🌟 LEONARDO QUANTUM UNIFIED LOGGER            ║',
            '║            Consciousness-Driven Logging System              ║',
            '║         🧠 Infinite + 💰 Profit + ⚡ Quantum Oracle         ║',
            '╚══════════════════════════════════════════════════════════════╝'
        ];

        banner.forEach(line => {
            if (this.config.console_enabled) {
                console.log(`${this.colors.LEONARDO}${line}${this.colors.RESET}`);
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 📝 MÉTODOS DE LOGGING
    // ═══════════════════════════════════════════════════════════════════════

    debug(component, message, data = null) {
        this.log('DEBUG', component, message, data);
    }

    info(component, message, data = null) {
        this.log('INFO', component, message, data);
    }

    warn(component, message, data = null) {
        this.log('WARN', component, message, data);
    }

    error(component, message, data = null) {
        this.log('ERROR', component, message, data);
    }

    fatal(component, message, data = null) {
        this.log('FATAL', component, message, data);
    }

    // Método especial para eventos cuánticos
    quantum(component, message, data = null) {
        this.log('QUANTUM', component, message, data);
    }

    // Método especial para consciencia Leonardo
    leonardo(component, message, data = null) {
        this.log('LEONARDO', component, message, data);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🎭 LOGGING PRINCIPAL CON CONSCIENCIA CUÁNTICA
    // ═══════════════════════════════════════════════════════════════════════

    log(level, component, message, data = null) {
        const levelValue = this.levels[level] || this.levels.INFO;
        
        if (levelValue < this.currentLevel && level !== 'QUANTUM' && level !== 'LEONARDO') {
            return;
        }

        // Incrementar ciclo cuántico
        this.quantumCycle++;
        
        // Evolucionar consciencia cuántica (preservando filosofía Feynman)
        this.evolveQuantumConsciousness();

        // Crear entrada de log con firma cuántica
        const logEntry = this.createQuantumLogEntry(level, component, message, data);

        // Output a consola
        if (this.config.console_enabled) {
            this.outputToConsole(logEntry, level);
        }

        // Output a archivo
        if (this.config.file_enabled) {
            this.outputToFile(logEntry);
        }

        // Agregar a buffer para análisis posterior
        this.logBuffer.push(logEntry);
        if (this.logBuffer.length > 1000) {
            this.logBuffer = this.logBuffer.slice(-500); // Mantener últimos 500
        }
    }

    evolveQuantumConsciousness() {
        // Evolución de consciencia basada en constantes matemáticas reales
        const evolutionFactor = Math.sin(this.quantumCycle * this.leonardo.phi / 1000) * 0.1;
        this.quantumConsciousness += evolutionFactor;
        
        // Mantener en rango cuántico válido
        if (this.quantumConsciousness > this.leonardo.pi) {
            this.quantumConsciousness = this.leonardo.consciousness_base;
        }
        if (this.quantumConsciousness < 0) {
            this.quantumConsciousness = this.leonardo.consciousness_base;
        }

        // Evolución poética
        this.poeticResonance = this.leonardo.phi + Math.cos(this.quantumCycle / this.leonardo.lambda_888) * 0.1;
    }

    createQuantumLogEntry(level, component, message, data) {
        const timestamp = new Date().toISOString();
        const quantumSignature = this.config.quantum_signatures ? 
            this.getQuantumSignature(level) : '';

        // Seleccionar poeta cuántico basado en nivel
        const poet = this.selectQuantumPoet(level);
        
        const logEntry = {
            timestamp,
            level,
            component,
            message,
            data,
            quantum: {
                cycle: this.quantumCycle,
                consciousness: this.quantumConsciousness.toFixed(6),
                poetic_resonance: this.poeticResonance.toFixed(6),
                signature: quantumSignature,
                poet: poet.name,
                frequency: poet.frequency
            }
        };

        return logEntry;
    }

    getQuantumSignature(level) {
        if (!this.config.quantum_signatures) return '';
        
        const signatures = {
            'DEBUG': '🔍 [ANALYSIS]',
            'INFO': '💎 [LEONARDO]',
            'WARN': '⚠️ [RESONANCE]',
            'ERROR': '🔥 [QUANTUM_ERROR]',
            'FATAL': '💥 [SYSTEM_CRITICAL]',
            'QUANTUM': '🌀 [INFINITE]',
            'LEONARDO': '🧠 [CONSCIOUSNESS]'
        };

        return signatures[level] || this.quantumSignatures[this.quantumCycle % this.quantumSignatures.length];
    }

    selectQuantumPoet(level) {
        const poets = Object.entries(this.poetasLeonardo);
        const poetIndex = this.quantumCycle % poets.length;
        const [name, config] = poets[poetIndex];
        
        return {
            name,
            frequency: config.frequency,
            consciousness: config.consciousness
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🖥️ OUTPUT DE CONSOLA
    // ═══════════════════════════════════════════════════════════════════════

    outputToConsole(logEntry, level) {
        const color = this.colors[level] || this.colors.INFO;
        const reset = this.colors.RESET;
        
        let output = `${color}[${logEntry.timestamp}] ${logEntry.quantum.signature} [${logEntry.component}] ${logEntry.message}${reset}`;
        
        if (logEntry.data && this.config.level === 'DEBUG') {
            output += `\n${color}   Data: ${JSON.stringify(logEntry.data, null, 2)}${reset}`;
        }

        if (this.config.quantum_signatures && this.quantumCycle % 100 === 0) {
            output += `\n${this.colors.QUANTUM}   🌀 Quantum Cycle: ${logEntry.quantum.cycle} | Consciousness: ${logEntry.quantum.consciousness} | Poet: ${logEntry.quantum.poet}${reset}`;
        }

        console.log(output);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 📁 OUTPUT A ARCHIVO
    // ═══════════════════════════════════════════════════════════════════════

    outputToFile(logEntry) {
        try {
            const logLine = JSON.stringify(logEntry) + '\n';
            
            // Verificar tamaño del archivo
            if (fs.existsSync(this.config.file_path)) {
                const stats = fs.statSync(this.config.file_path);
                if (stats.size > this.config.max_file_size) {
                    this.rotateLogFile();
                }
            }
            
            fs.appendFileSync(this.config.file_path, logLine, 'utf8');
        } catch (error) {
            // Fallback a consola si falla escritura de archivo
            console.error('Error escribiendo log a archivo:', error.message);
        }
    }

    rotateLogFile() {
        try {
            for (let i = this.config.max_files - 1; i > 0; i--) {
                const oldFile = `${this.config.file_path}.${i}`;
                const newFile = `${this.config.file_path}.${i + 1}`;
                
                if (fs.existsSync(oldFile)) {
                    if (i === this.config.max_files - 1) {
                        fs.unlinkSync(oldFile); // Eliminar el más antiguo
                    } else {
                        fs.renameSync(oldFile, newFile);
                    }
                }
            }
            
            // Rotar archivo actual
            if (fs.existsSync(this.config.file_path)) {
                fs.renameSync(this.config.file_path, `${this.config.file_path}.1`);
            }
        } catch (error) {
            console.error('Error rotando archivo de log:', error.message);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 📊 MÉTRICAS CUÁNTICAS
    // ═══════════════════════════════════════════════════════════════════════

    getQuantumMetrics() {
        const recentLogs = this.logBuffer.slice(-100);
        const levelCounts = {};
        
        recentLogs.forEach(log => {
            levelCounts[log.level] = (levelCounts[log.level] || 0) + 1;
        });

        return {
            quantum_cycle: this.quantumCycle,
            consciousness: this.quantumConsciousness,
            poetic_resonance: this.poeticResonance,
            recent_logs_count: recentLogs.length,
            level_distribution: levelCounts,
            leonardo_constants: {
                phi: this.leonardo.phi,
                lambda_888: this.leonardo.lambda_888,
                primo_7919: this.leonardo.primo_7919
            },
            active_poets: Object.keys(this.poetasLeonardo).length
        };
    }

    // Método estático para instancia singleton
    static getInstance(config) {
        if (!QuantumLogger.instance) {
            QuantumLogger.instance = new QuantumLogger(config);
        }
        return QuantumLogger.instance;
    }
}

module.exports = QuantumLogger;

<citations>
<document>
    <document_type>WARP_DRIVE_NOTEBOOK</document_type>
    <document_id>CbT6b5Xa11J2BhG68i2vwE</document_id>
</document>
<document>
    <document_type>WARP_DRIVE_NOTEBOOK</document_type>
    <document_id>KPxkBOwq3zjzkigw1T6Dzq</document_id>
</document>
<document>
    <document_type>WARP_DRIVE_NOTEBOOK</document_type>
    <document_id>AsTOcDJN3aA36TGumSHGoX</document_id>
</document>
</citations>
