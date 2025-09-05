#!/usr/bin/env node

// ========================================================================
// 🎭 CONFIGURACIÓN ELEGANTE LEONARDO CONSCIOUSNESS
// Setup completo, seguro y automatizado para trading en Binance Futures
// Maneja credenciales, inicialización y monitoreo de forma profesional
// ========================================================================

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const readline = require('readline');
const { CredentialsManager } = require('../quantum-core/CredentialsManager');

class ElegantLeonardoSetup {
    constructor() {
        this.config = {
            ip: '181.43.212.196',
            mode: 'production',
            platform: 'futures',
            initialBalance: 10000,
            enableMonitoring: true,
            autoStart: true
        };
        
        this.credentials = {
            apiKey: null,
            secretKey: null,
            validated: false
        };
        
        this.processes = new Map();
        this.logFile = path.join(__dirname, 'elegant-setup.log');
        this.configFile = path.join(__dirname, 'leonardo-config.json');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🚀 CONFIGURACIÓN PRINCIPAL ELEGANTE
    // ═══════════════════════════════════════════════════════════════════════

    async setupElegantly() {
        try {
            this.displayBanner();
            await this.logAction('SETUP_START', 'Iniciando configuración elegante');
            
            // 1. Validar entorno y prerequisitos
            await this.validateEnvironment();
            
            // 2. Configurar credenciales de forma segura
            await this.setupCredentialsSecurely();
            
            // 3. Validar acceso a Binance
            await this.validateBinanceAccess();
            
            // 4. Configurar FundsManager con balance real
            await this.setupFundsManagerWithRealBalance();
            
            // 5. Configurar monitoreo continuo
            if (this.config.enableMonitoring) {
                await this.setupContinuousMonitoring();
            }
            
            // 6. Generar configuración final
            await this.generateFinalConfiguration();
            
            // 7. Iniciar servicios automatizados
            if (this.config.autoStart) {
                await this.startAutomatedServices();
            }
            
            this.displaySuccessMessage();
            await this.logAction('SETUP_COMPLETE', 'Configuración completada exitosamente');
            
        } catch (error) {
            this.displayError('Error durante configuración elegante', error);
            await this.logAction('SETUP_ERROR', error.message);
            process.exit(1);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🔐 GESTIÓN SEGURA DE CREDENCIALES
    // ═══════════════════════════════════════════════════════════════════════

    async setupCredentialsSecurely() {
        this.log('🔐 Configurando credenciales de forma segura...');
        
        // Verificar si ya existen credenciales
        if (this.detectExistingCredentials()) {
            this.log('✅ Credenciales existentes detectadas');
            return;
        }
        
        // Configuración interactiva segura
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        try {
            this.log('🔑 Configuración interactiva de credenciales Binance Futures');
            console.log('💡 Las credenciales se almacenarán de forma segura y no se mostrarán');
            
            // Solicitar API Key
            const apiKey = await this.securePrompt(rl, 
                '🔹 Ingresa tu Binance API Key (comienza con LUF): ', 
                (input) => input && input.startsWith('LUF') && input.length > 10
            );
            
            // Solicitar Secret Key
            const secretKey = await this.securePrompt(rl, 
                '🔹 Ingresa tu Binance Secret Key: ', 
                (input) => input && input.length > 20
            );
            
            // Validar formato básico
            if (!this.validateCredentialFormat(apiKey, secretKey)) {
                throw new Error('Formato de credenciales inválido');
            }
            
            // Almacenar credenciales
            this.credentials.apiKey = apiKey;
            this.credentials.secretKey = secretKey;
            
            // Configurar variables de entorno
            this.setEnvironmentCredentials(apiKey, secretKey);
            
            this.log('✅ Credenciales configuradas exitosamente');
            
        } finally {
            rl.close();
        }
    }

    async securePrompt(rl, question, validator) {
        return new Promise((resolve, reject) => {
            rl.question(question, (input) => {
                const trimmed = input.trim();
                if (validator && !validator(trimmed)) {
                    reject(new Error('Input inválido'));
                    return;
                }
                resolve(trimmed);
            });
        });
    }

    detectExistingCredentials() {
        this.log('🔍 Detectando credenciales existentes vía CredentialsManager...');
        
        try {
            // Usar CredentialsManager para detectar credenciales
            const credentialsManager = CredentialsManager.getInstance();
            const credentials = credentialsManager.getCredentials();
            const credStatus = credentialsManager.getCredentialStatus();
            
            if (credentials.apiKey && credentials.secretKey) {
                this.credentials.apiKey = credentials.apiKey;
                this.credentials.secretKey = credentials.secretKey;
                
                // Log detallado de fuentes
                this.log(`✅ Credenciales detectadas desde CredentialsManager:`);
                this.log(`   API_KEY: SET (fuente: ${credStatus.apiKeySource || 'N/A'})`);
                this.log(`   SECRET: SET (fuente: ${credStatus.secretKeySource || 'N/A'})`);
                this.log(`   TESTNET: ${credStatus.isTestnet ? 'ENABLED' : 'DISABLED'} (fuente: ${credStatus.isTestnetSource || 'N/A'})`);
                this.log(`   Fuentes consultadas: ${credStatus.sourcesChecked || 'N/A'}`);
                
                return true;
            }
            
            this.log('⚠️ No se encontraron credenciales en CredentialsManager');
            return false;
            
        } catch (error) {
            this.log(`❌ Error usando CredentialsManager: ${error.message}`);
            this.log('🔄 Fallback a detección manual de process.env...');
            
            // Fallback a lógica manual
            const apiKey = process.env.BINANCE_API_KEY || 
                          process.env.BINANCE_KEY || 
                          process.env.BINANCE_FUTURES_API_KEY;
            
            const secretKey = process.env.BINANCE_SECRET_KEY || 
                             process.env.BINANCE_API_SECRET || 
                             process.env.BINANCE_SECRET || 
                             process.env.BINANCE_FUTURES_API_SECRET;
            
            if (apiKey && secretKey) {
                this.credentials.apiKey = apiKey;
                this.credentials.secretKey = secretKey;
                this.log('✅ Credenciales detectadas manualmente desde process.env');
                return true;
            }
            
            return false;
        }
    }

    validateCredentialFormat(apiKey, secretKey) {
        return apiKey && apiKey.startsWith('LUF') && 
               secretKey && secretKey.length > 20;
    }

    setEnvironmentCredentials(apiKey, secretKey) {
        // Configurar múltiples nombres para compatibilidad
        process.env.BINANCE_API_KEY = apiKey;
        process.env.BINANCE_SECRET_KEY = secretKey;
        process.env.BINANCE_API_SECRET = secretKey;
        process.env.BINANCE_FUTURES_API_KEY = apiKey;
        process.env.BINANCE_FUTURES_API_SECRET = secretKey;
        process.env.BINANCE_TESTNET = 'false';
        process.env.LEONARDO_PRODUCTION_MODE = 'true';
        process.env.SKIP_API_VALIDATION = 'false';
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🌐 VALIDACIÓN DE ACCESO BINANCE
    // ═══════════════════════════════════════════════════════════════════════

    async validateBinanceAccess() {
        this.log('🌐 Validando acceso a Binance Futures...');
        
        try {
            const BinanceConnectorAdapter = require('./BinanceConnectorAdapter');
            const connector = new BinanceConnectorAdapter();
            
            // Test de conectividad
            const pingResult = await connector.ping();
            if (!pingResult.success) {
                throw new Error(`Ping fallido: ${pingResult.error}`);
            }
            
            this.log(`✅ Conectividad OK (${pingResult.latencyMs}ms)`);
            
            // Test de acceso a cuenta
            const accountInfo = await connector.getAccountInfo();
            if (accountInfo) {
                const balance = parseFloat(accountInfo.totalWalletBalance || 0);
                this.config.detectedBalance = balance;
                
                this.log(`✅ Acceso a cuenta verificado`);
                this.log(`💰 Balance detectado: $${balance.toFixed(2)} USDT`);
                
                // Actualizar balance inicial si es mayor
                if (balance > this.config.initialBalance) {
                    this.config.initialBalance = balance;
                }
                
                this.credentials.validated = true;
                return accountInfo;
            } else {
                throw new Error('No se pudo obtener información de cuenta');
            }
            
        } catch (error) {
            this.displayError('Error validando acceso Binance', error);
            throw error;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🧠 CONFIGURACIÓN FUNDSMANAGER CON BALANCE REAL
    // ═══════════════════════════════════════════════════════════════════════

    async setupFundsManagerWithRealBalance() {
        this.log('🧠 Configurando FundsManager con balance real...');
        
        try {
            const { FundsManager } = require('./FundsManager');
            
            const fundsManager = new FundsManager({
                initialBalance: this.config.initialBalance,
                maxLeverage: 25,
                maxRiskPerTrade: 0.08,  // 8% máximo
                maxDrawdown: 0.35,      // 35% drawdown
                stopLoss: 0.025,        // 2.5% stop loss
                takeProfit: 0.05,       // 5% take profit
                kellyFactor: 0.35,      // Kelly agresivo
                testnet: false,         // Modo producción
                compoundingEnabled: true,
                emergencyThreshold: 0.15 // 15% emergency stop
            });
            
            // Inicializar FundsManager
            await fundsManager.initialize();
            
            // Verificar estado
            const fundsStatus = fundsManager.getFundsStatus();
            
            this.log('✅ FundsManager configurado exitosamente');
            this.log(`💰 Balance inicial: $${fundsStatus.totalBalance.toFixed(2)}`);
            this.log(`🤖 Puede operar: ${fundsStatus.canTrade ? 'SÍ' : 'NO'}`);
            this.log(`🧠 Consciencia: ${(fundsStatus.leonardoFundsState.consciousness_level * 100).toFixed(1)}%`);
            
            this.config.fundsManagerReady = true;
            return fundsManager;
            
        } catch (error) {
            this.displayError('Error configurando FundsManager', error);
            throw error;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 📊 MONITOREO CONTINUO ELEGANTE
    // ═══════════════════════════════════════════════════════════════════════

    async setupContinuousMonitoring() {
        this.log('📊 Configurando monitoreo continuo...');
        
        try {
            // Iniciar servicio de monitoreo en segundo plano
            const monitorProcess = spawn('node', [
                path.join(__dirname, 'funds-monitor-service.js')
            ], {
                detached: true,
                stdio: ['ignore', 'pipe', 'pipe'],
                env: { ...process.env }  // Heredar variables de entorno
            });
            
            // Configurar logging del monitor
            const monitorLogFile = path.join(__dirname, 'monitor.log');
            const logStream = require('fs').createWriteStream(monitorLogFile, { flags: 'a' });
            
            monitorProcess.stdout.pipe(logStream);
            monitorProcess.stderr.pipe(logStream);
            
            // Almacenar referencia del proceso
            this.processes.set('monitor', {
                process: monitorProcess,
                pid: monitorProcess.pid,
                startTime: Date.now(),
                logFile: monitorLogFile
            });
            
            // Hacer que el proceso sea independiente
            monitorProcess.unref();
            
            this.log(`✅ Monitor iniciado en segundo plano (PID: ${monitorProcess.pid})`);
            this.log(`📄 Logs del monitor: ${monitorLogFile}`);
            
            // Esperar confirmación de inicio
            await this.waitForMonitorReady(monitorLogFile);
            
            this.config.monitoringActive = true;
            
        } catch (error) {
            this.displayError('Error configurando monitoreo', error);
            throw error;
        }
    }

    async waitForMonitorReady(logFile, timeout = 30000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkReady = async () => {
                try {
                    if (Date.now() - startTime > timeout) {
                        reject(new Error('Timeout esperando monitor'));
                        return;
                    }
                    
                    const content = await fs.readFile(logFile, 'utf8').catch(() => '');
                    if (content.includes('Servicio de monitoreo iniciado exitosamente')) {
                        resolve();
                        return;
                    }
                    
                    setTimeout(checkReady, 1000);
                } catch (error) {
                    reject(error);
                }
            };
            
            checkReady();
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ⚙️ SERVICIOS AUTOMATIZADOS
    // ═══════════════════════════════════════════════════════════════════════

    async startAutomatedServices() {
        this.log('⚙️ Iniciando servicios automatizados...');
        
        try {
            // Verificación periódica cada 10 minutos
            const verificationProcess = spawn('node', ['-e', `
                setInterval(async () => {
                    try {
                        const { execSync } = require('child_process');
                        execSync('node leonardo-consciousness/verify-binance-fundsmanager.js', { 
                            cwd: '${process.cwd()}',
                            stdio: 'inherit',
                            env: ${JSON.stringify(process.env)}
                        });
                    } catch (error) {
                        console.error('Error en verificación periódica:', error.message);
                    }
                }, 600000); // 10 minutos
                
                console.log('Servicio de verificación periódica iniciado');
            `], {
                detached: true,
                stdio: ['ignore', 'pipe', 'pipe'],
                env: { ...process.env }
            });
            
            const verificationLogFile = path.join(__dirname, 'verification.log');
            const verificationLogStream = require('fs').createWriteStream(verificationLogFile, { flags: 'a' });
            
            verificationProcess.stdout.pipe(verificationLogStream);
            verificationProcess.stderr.pipe(verificationLogStream);
            verificationProcess.unref();
            
            this.processes.set('verification', {
                process: verificationProcess,
                pid: verificationProcess.pid,
                startTime: Date.now(),
                logFile: verificationLogFile
            });
            
            this.log(`✅ Verificación periódica iniciada (PID: ${verificationProcess.pid})`);
            this.log(`📄 Logs de verificación: ${verificationLogFile}`);
            
        } catch (error) {
            this.displayError('Error iniciando servicios automatizados', error);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 📋 CONFIGURACIÓN FINAL
    // ═══════════════════════════════════════════════════════════════════════

    async generateFinalConfiguration() {
        this.log('📋 Generando configuración final...');
        
        const finalConfig = {
            timestamp: new Date().toISOString(),
            version: '4.0',
            mode: 'PRODUCTION',
            platform: 'BINANCE_FUTURES',
            
            credentials: {
                configured: this.credentials.validated,
                apiKeyPrefix: this.credentials.apiKey ? this.credentials.apiKey.substring(0, 6) + '***' : null,
                testnet: false
            },
            
            network: {
                detectedIP: this.config.ip,
                binanceConnectivity: 'OK'
            },
            
            balance: {
                initial: this.config.initialBalance,
                detected: this.config.detectedBalance || 0,
                source: 'BINANCE_FUTURES_REAL'
            },
            
            services: {
                fundsManager: this.config.fundsManagerReady || false,
                monitoring: this.config.monitoringActive || false,
                periodicVerification: this.processes.has('verification')
            },
            
            processes: Array.from(this.processes.entries()).map(([name, info]) => ({
                name,
                pid: info.pid,
                startTime: new Date(info.startTime).toISOString(),
                logFile: info.logFile
            })),
            
            recommendations: [
                'Mantener procesos de monitoreo activos',
                'Revisar logs periódicamente',
                'Validar balance antes de trading intensivo',
                'Respetar límites de risk management configurados'
            ]
        };
        
        await fs.writeFile(this.configFile, JSON.stringify(finalConfig, null, 2));
        this.log(`✅ Configuración guardada en: ${this.configFile}`);
        
        return finalConfig;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🔧 UTILIDADES Y HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    async validateEnvironment() {
        this.log('🔧 Validando entorno...');
        
        // Verificar Node.js
        const nodeVersion = process.version;
        this.log(`Node.js version: ${nodeVersion}`);
        
        // Verificar IP
        const actualIP = await this.getCurrentIP();
        if (actualIP !== this.config.ip) {
            this.log(`⚠️ IP detectada (${actualIP}) difiere de configurada (${this.config.ip})`);
        } else {
            this.log(`✅ IP confirmada: ${actualIP}`);
        }
        
        // Verificar archivos necesarios
        const requiredFiles = [
            'FundsManager.js',
            'BinanceConnectorAdapter.js',
            'funds-monitor-service.js'
        ];
        
        for (const file of requiredFiles) {
            const filePath = path.join(__dirname, file);
            try {
                await fs.access(filePath);
                this.log(`✅ ${file} encontrado`);
            } catch (error) {
                throw new Error(`Archivo requerido no encontrado: ${file}`);
            }
        }
    }

    async getCurrentIP() {
        try {
            const axios = require('axios');
            const response = await axios.get('https://api.ipify.org', { timeout: 5000 });
            return response.data;
        } catch (error) {
            this.log(`⚠️ No se pudo obtener IP pública: ${error.message}`);
            return 'unknown';
        }
    }

    async logAction(action, message, data = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            action,
            message,
            data
        };
        
        const logLine = JSON.stringify(logEntry) + '\n';
        
        try {
            await fs.appendFile(this.logFile, logLine);
        } catch (error) {
            console.error('Error escribiendo log:', error.message);
        }
    }

    log(message) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${message}`);
    }

    displayBanner() {
        console.clear();
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║          🎭 CONFIGURACIÓN ELEGANTE LEONARDO 4.0             ║');
        console.log('║        Sistema Automatizado de Trading Profesional         ║');
        console.log('║              Binance Futures • Monitoreo • AI              ║');
        console.log('╚══════════════════════════════════════════════════════════════╝');
        console.log('');
    }

    displaySuccessMessage() {
        console.log('\n╔══════════════════════════════════════════════════════════════╗');
        console.log('║                    🎉 CONFIGURACIÓN COMPLETADA              ║');
        console.log('╚══════════════════════════════════════════════════════════════╝');
        console.log('');
        console.log('✅ Sistema Leonardo Consciousness configurado elegantemente');
        console.log(`💰 Balance inicial: $${this.config.initialBalance.toFixed(2)}`);
        console.log(`🔐 Credenciales: ${this.credentials.validated ? 'Validadas' : 'Pendientes'}`);
        console.log(`📊 Monitoreo: ${this.config.monitoringActive ? 'Activo' : 'Inactivo'}`);
        console.log('');
        console.log('🔄 Procesos en segundo plano:');
        for (const [name, info] of this.processes) {
            console.log(`   • ${name}: PID ${info.pid} (logs: ${path.basename(info.logFile)})`);
        }
        console.log('');
        console.log('📋 Archivos generados:');
        console.log(`   • Configuración: ${path.basename(this.configFile)}`);
        console.log(`   • Logs setup: ${path.basename(this.logFile)}`);
        console.log('');
        console.log('🚀 Sistema listo para generar máximo profit con coherencia total');
        console.log('');
    }

    displayError(title, error) {
        console.log('\n❌ ERROR:', title);
        console.log('Mensaje:', error.message);
        if (error.stack) {
            console.log('Stack:', error.stack);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🛑 GESTIÓN DE PROCESOS
    // ═══════════════════════════════════════════════════════════════════════

    async stopAllProcesses() {
        console.log('\n🛑 Deteniendo procesos en segundo plano...');
        
        for (const [name, info] of this.processes) {
            try {
                process.kill(info.pid, 'SIGTERM');
                console.log(`✅ Proceso ${name} (PID: ${info.pid}) detenido`);
            } catch (error) {
                console.log(`⚠️ No se pudo detener proceso ${name}: ${error.message}`);
            }
        }
        
        this.processes.clear();
    }

    async getStatus() {
        const status = {
            timestamp: new Date().toISOString(),
            configured: this.credentials.validated,
            processes: this.processes.size,
            activeServices: []
        };
        
        for (const [name, info] of this.processes) {
            try {
                process.kill(info.pid, 0); // Test if process exists
                status.activeServices.push({
                    name,
                    pid: info.pid,
                    uptime: Date.now() - info.startTime
                });
            } catch (error) {
                // Process not running
            }
        }
        
        return status;
    }
}

// ═══════════════════════════════════════════════════════════════════════
// 🚀 EJECUCIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════

async function main() {
    const setup = new ElegantLeonardoSetup();
    
    // Manejo elegante de señales
    process.on('SIGINT', async () => {
        console.log('\n🛑 Recibida señal de interrupción...');
        await setup.stopAllProcesses();
        process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
        console.log('\n🛑 Recibida señal de terminación...');
        await setup.stopAllProcesses();
        process.exit(0);
    });
    
    try {
        await setup.setupElegantly();
        
        // Mantener proceso principal vivo para gestión
        console.log('💫 Configuración completada. Presiona Ctrl+C para gestionar procesos.');
        
        // Verificar estado cada 30 segundos
        setInterval(async () => {
            const status = await setup.getStatus();
            if (status.activeServices.length !== setup.processes.size) {
                console.log('⚠️ Algunos servicios pueden haber terminado');
            }
        }, 30000);
        
    } catch (error) {
        console.error('💥 Error fatal en configuración elegante:', error.message);
        await setup.stopAllProcesses();
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main();
}

module.exports = ElegantLeonardoSetup;
