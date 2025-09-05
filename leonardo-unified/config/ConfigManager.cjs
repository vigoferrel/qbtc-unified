// ========================================================================
// 🎛️ LEONARDO QUANTUM UNIFIED - CONFIG MANAGER
// Gestor centralizado de configuración con soporte para presets
// Consolida todas las configuraciones dispersas del sistema anterior
// ========================================================================

const fs = require('fs');
const path = require('path');

class ConfigManager {
    constructor() {
        this.config = null;
        this.presets = new Map();
        this.watchers = new Map();
        this.subscribers = new Set();
        
        // Rutas absolutas para evitar conflictos
        this.configPath = 'C:\\Users\\DELL\\Desktop\\QBTC-UNIFIED\\leonardo-unified\\config\\leonardo-unified-config.json';
        this.presetsDir = 'C:\\Users\\DELL\\Desktop\\QBTC-UNIFIED\\leonardo-unified\\config\\presets';
        
        this.leonardo = {
            phi: 1.618033988749,
            lambda_888: 888,
            primo_7919: 7919
        };
        
        // Validadores de configuración
        this.validators = {
            server: this.validateServerConfig.bind(this),
            trading: this.validateTradingConfig.bind(this),
            leonardo_consciousness: this.validateLeonardoConfig.bind(this),
            quantum_engine: this.validateQuantumConfig.bind(this),
            security: this.validateSecurityConfig.bind(this)
        };
        
        this.log('🎛️ ConfigManager inicializado');
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 📥 CARGA DE CONFIGURACIÓN
    // ═══════════════════════════════════════════════════════════════════════
    
    async loadConfig(presetName = null, customConfig = {}) {
        try {
            this.log('📥 Cargando configuración...', presetName ? { preset: presetName } : {});
            
            // 1. Cargar configuración base
            const baseConfig = await this.loadBaseConfig();
            
            // 2. Cargar preset si se especifica
            let presetConfig = {};
            if (presetName && presetName !== 'base') {
                presetConfig = await this.loadPreset(presetName);
            }
            
            // 3. Fusionar configuraciones (base -> preset -> custom)
            this.config = this.mergeConfigs(baseConfig, presetConfig, customConfig);
            
            // 4. Validar configuración final
            const validation = this.validateConfig(this.config);
            if (!validation.valid) {
                throw new Error(`Configuración inválida: ${validation.errors.join(', ')}`);
            }
            
            // 5. Aplicar configuraciones derivadas
            this.applyDerivedSettings();
            
            // 6. Notificar a suscriptores
            this.notifySubscribers('config_loaded', this.config);
            
            this.log('✅ Configuración cargada exitosamente', {
                preset: presetName || 'base',
                environment: this.config.system.environment,
                trading_mode: this.config.funds_management.risk_management_mode
            });
            
            return this.config;
            
        } catch (error) {
            this.log('❌ Error cargando configuración:', error);
            throw error;
        }
    }
    
    async loadBaseConfig() {
        try {
            if (!fs.existsSync(this.configPath)) {
                throw new Error(`Archivo de configuración no encontrado: ${this.configPath}`);
            }
            
            const configData = fs.readFileSync(this.configPath, 'utf8');
            return JSON.parse(configData);
            
        } catch (error) {
            this.log('❌ Error cargando configuración base:', error);
            throw error;
        }
    }
    
    async loadPreset(presetName) {
        try {
            const presetPath = path.join(this.presetsDir, `${presetName}.json`);
            
            if (!fs.existsSync(presetPath)) {
                this.log('⚠️ Preset no encontrado, usando configuración base:', presetName);
                return {};
            }
            
            const presetData = fs.readFileSync(presetPath, 'utf8');
            const preset = JSON.parse(presetData);
            
            this.log('📋 Preset cargado:', { preset: presetName, path: presetPath });
            return preset;
            
        } catch (error) {
            this.log('❌ Error cargando preset:', { preset: presetName, error: error.message });
            return {};
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 🔄 FUSIÓN Y VALIDACIÓN
    // ═══════════════════════════════════════════════════════════════════════
    
    mergeConfigs(...configs) {
        return configs.reduce((merged, config) => {
            if (!config || typeof config !== 'object') return merged;
            return this.deepMerge(merged, config);
        }, {});
    }
    
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }
    
    validateConfig(config) {
        const errors = [];
        
        try {
            // Validar secciones principales
            for (const [section, validator] of Object.entries(this.validators)) {
                if (config[section]) {
                    const sectionErrors = validator(config[section]);
                    if (sectionErrors.length > 0) {
                        errors.push(...sectionErrors.map(err => `${section}: ${err}`));
                    }
                }
            }
            
            // Validaciones globales
            if (!config.system?.name) errors.push('system.name es requerido');
            if (!config.system?.version) errors.push('system.version es requerido');
            
            return {
                valid: errors.length === 0,
                errors
            };
            
        } catch (error) {
            return {
                valid: false,
                errors: [`Error de validación: ${error.message}`]
            };
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // ✅ VALIDADORES ESPECÍFICOS
    // ═══════════════════════════════════════════════════════════════════════
    
    validateServerConfig(serverConfig) {
        const errors = [];
        
        if (!serverConfig.primary_port || serverConfig.primary_port < 1000 || serverConfig.primary_port > 65535) {
            errors.push('primary_port debe estar entre 1000 y 65535');
        }
        
        if (!serverConfig.host) {
            errors.push('host es requerido');
        }
        
        return errors;
    }
    
    validateTradingConfig(tradingConfig) {
        const errors = [];
        
        if (!tradingConfig.initial_balance || tradingConfig.initial_balance <= 0) {
            errors.push('initial_balance debe ser mayor a 0');
        }
        
        if (tradingConfig.risk_per_trade_percent < 0.1 || tradingConfig.risk_per_trade_percent > 10) {
            errors.push('risk_per_trade_percent debe estar entre 0.1 y 10');
        }
        
        return errors;
    }
    
    validateLeonardoConfig(leonardoConfig) {
        const errors = [];
        
        if (!leonardoConfig.phi || Math.abs(leonardoConfig.phi - 1.618033988749) > 0.000001) {
            errors.push('phi debe ser el número áureo correcto (1.618033988749)');
        }
        
        if (leonardoConfig.lambda_888 !== 888) {
            errors.push('lambda_888 debe ser exactamente 888');
        }
        
        if (leonardoConfig.primo_7919 !== 7919) {
            errors.push('primo_7919 debe ser exactamente 7919');
        }
        
        return errors;
    }
    
    validateQuantumConfig(quantumConfig) {
        const errors = [];
        
        if (!quantumConfig.max_concurrent_operations || quantumConfig.max_concurrent_operations <= 0) {
            errors.push('max_concurrent_operations debe ser mayor a 0');
        }
        
        return errors;
    }
    
    validateSecurityConfig(securityConfig) {
        const errors = [];
        
        if (securityConfig.authentication?.enabled && !securityConfig.authentication?.jwt_secret) {
            errors.push('jwt_secret es requerido cuando authentication está habilitado');
        }
        
        return errors;
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // ⚙️ CONFIGURACIONES DERIVADAS
    // ═══════════════════════════════════════════════════════════════════════
    
    applyDerivedSettings() {
        if (!this.config) return;
        
        // Aplicar constantes Leonardo
        this.config._leonardo_constants = {
            PHI: this.leonardo.phi,
            LAMBDA_888: this.leonardo.lambda_888,
            PRIMO_7919: this.leonardo.primo_7919,
            CONSCIOUSNESS_TARGET: this.config.leonardo_consciousness.consciousness_threshold,
            COHERENCE_TARGET: this.config.leonardo_consciousness.coherence_target,
            BIG_BANG_READY: this.config.leonardo_consciousness.big_bang_threshold
        };
        
        // Configurar logging dinámico
        if (this.config.development?.debug_mode) {
            this.config.logging.level = 'DEBUG';
        }
        
        // Configurar puertos de frontend
        const basePort = this.config.server.primary_port;
        this.config.frontend_ports = {
            main_dashboard: basePort,
            quantum_dashboard: basePort + 1,
            trading_console: basePort + 2,
            system_monitor: basePort + 3
        };
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 📤 ACCESO A CONFIGURACIÓN
    // ═══════════════════════════════════════════════════════════════════════
    
    get(keyPath, defaultValue = null) {
        if (!this.config) {
            this.log('⚠️ Configuración no cargada');
            return defaultValue;
        }
        
        const keys = keyPath.split('.');
        let current = this.config;
        
        for (const key of keys) {
            if (current && current.hasOwnProperty(key)) {
                current = current[key];
            } else {
                return defaultValue;
            }
        }
        
        return current;
    }
    
    set(keyPath, value) {
        if (!this.config) {
            throw new Error('Configuración no cargada');
        }
        
        const keys = keyPath.split('.');
        let current = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[keys[keys.length - 1]] = value;
        this.notifySubscribers('config_changed', { keyPath, value });
    }
    
    getAll() {
        return this.config ? { ...this.config } : null;
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 👂 SUSCRIPCIONES Y NOTIFICACIONES
    // ═══════════════════════════════════════════════════════════════════════
    
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }
    
    notifySubscribers(event, data) {
        for (const callback of this.subscribers) {
            try {
                callback(event, data);
            } catch (error) {
                this.log('❌ Error notificando suscriptor:', error);
            }
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 📋 GESTIÓN DE PRESETS
    // ═══════════════════════════════════════════════════════════════════════
    
    getAvailablePresets() {
        try {
            if (!fs.existsSync(this.presetsDir)) {
                return ['base'];
            }
            
            const files = fs.readdirSync(this.presetsDir);
            const presets = files
                .filter(file => file.endsWith('.json'))
                .map(file => file.replace('.json', ''));
            
            return ['base', ...presets];
            
        } catch (error) {
            this.log('❌ Error obteniendo presets disponibles:', error);
            return ['base'];
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 🔧 UTILIDADES
    // ═══════════════════════════════════════════════════════════════════════
    
    log(message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [CONFIG] ${message}`;
        
        if (data) {
            console.log(logEntry, data);
        } else {
            console.log(logEntry);
        }
    }
    
    // Método estático para instancia singleton
    static getInstance() {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
}

module.exports = ConfigManager;
