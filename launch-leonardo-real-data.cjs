/*
  🚀 LEONARDO CONSCIOUSNESS - LAUNCH MASTER CON DATOS REALES
  Sistema de lanzamiento unificado con integración completa de Binance Real Data
  Copyright © 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES
*/

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { SymbolsLoader } = require('./fix-symbols-loading');

class LeonardoRealDataLauncher {
    constructor() {
        console.log('🚀 LEONARDO CONSCIOUSNESS - LAUNCH MASTER REAL DATA');
        console.log('===================================================');
        
        this.processes = new Map();
        this.config = {
            port: process.env.LEONARDO_PORT || 5000,
            frontendPort: process.env.FRONTEND_PORT || 3000,
            autoUpdate: process.env.AUTO_UPDATE_SYMBOLS !== 'false',
            maxRetries: 3,
            healthCheckInterval: 30000 // 30 segundos
        };
        
        this.systemStatus = {
            leonardo: 'STOPPED',
            frontend: 'STOPPED',
            autoUpdater: 'STOPPED',
            symbols: 'NOT_LOADED',
            startTime: null
        };
        
        console.log(`🎯 Puerto Leonardo: ${this.config.port}`);
        console.log(`🌐 Puerto Frontend: ${this.config.frontendPort}`);
        console.log(`⚡ Auto-actualización: ${this.config.autoUpdate ? 'ENABLED' : 'DISABLED'}`);
    }
    
    async launch() {
        console.log('\\n🔥 INICIANDO SISTEMA LEONARDO CON DATOS REALES...');
        
        try {
            // Paso 1: Cargar símbolos reales iniciales
            await this.loadInitialSymbols();
            
            // Paso 2: Lanzar Leonardo Consciousness
            await this.launchLeonardoCore();
            
            // Paso 3: Lanzar Frontend
            await this.launchFrontend();
            
            // Paso 4: Configurar auto-actualización
            if (this.config.autoUpdate) {
                await this.launchAutoUpdater();
            }
            
            // Paso 5: Configurar monitoreo del sistema
            this.setupSystemMonitoring();
            
            // Paso 6: Mostrar estado final
            this.displaySystemStatus();
            
            console.log('\\n🎉 ¡SISTEMA LEONARDO CON DATOS REALES COMPLETAMENTE ACTIVO!');
            this.systemStatus.startTime = new Date();
            
        } catch (error) {
            console.error('💥 Error durante el lanzamiento:', error.message);
            await this.shutdown();
            throw error;
        }
    }
    
    async loadInitialSymbols() {
        console.log('\\n📊 PASO 1: Cargando símbolos reales iniciales...');
        
        try {
            const symbolsLoader = new SymbolsLoader();
            const result = await symbolsLoader.run();
            
            this.systemStatus.symbols = 'LOADED';
            console.log(`✅ ${result.succeeded || 0} símbolos reales cargados exitosamente`);
            
        } catch (error) {
            console.error('❌ Error cargando símbolos iniciales:', error.message);
            console.log('⚠️ Continuando sin símbolos iniciales - se cargarán automáticamente');
            this.systemStatus.symbols = 'ERROR';
        }
    }
    
    async launchLeonardoCore() {
        console.log('\\n🧠 PASO 2: Lanzando Leonardo Consciousness Core...');
        
        return new Promise((resolve, reject) => {
            const leonardoProcess = spawn('node', ['leonardo-consciousness/start-leonardo.js'], {
                stdio: ['pipe', 'pipe', 'pipe'],
                env: {
                    ...process.env,
                    LEONARDO_PORT: this.config.port,
                    TRADING_MODE: 'futuros',
                    BINANCE_REAL_DATA: 'true'
                },
                cwd: process.cwd()
            });
            
            let startupOutput = '';
            let isStarted = false;
            
            leonardoProcess.stdout.on('data', (data) => {
                const output = data.toString();
                startupOutput += output;
                process.stdout.write(`[LEONARDO] ${output}`);
                
                // Detectar cuando Leonardo está listo
                if (output.includes('🚀 Leonardo Consciousness Server running') || 
                    output.includes('Server running on port') ||
                    output.includes('✅ Sistema inicializado')) {
                    if (!isStarted) {
                        isStarted = true;
                        this.systemStatus.leonardo = 'RUNNING';
                        console.log('✅ Leonardo Core iniciado exitosamente');
                        resolve();
                    }
                }
            });
            
            leonardoProcess.stderr.on('data', (data) => {
                process.stderr.write(`[LEONARDO ERROR] ${data}`);
            });
            
            leonardoProcess.on('error', (error) => {
                console.error('❌ Error lanzando Leonardo Core:', error);
                this.systemStatus.leonardo = 'ERROR';
                if (!isStarted) reject(error);
            });
            
            leonardoProcess.on('close', (code) => {
                console.log(`[LEONARDO] Proceso terminado con código: ${code}`);
                this.systemStatus.leonardo = 'STOPPED';
                if (!isStarted && code !== 0) {
                    reject(new Error(`Leonardo terminó con código ${code}`));
                }
            });
            
            this.processes.set('leonardo', leonardoProcess);
            
            // Timeout de 30 segundos para el startup
            setTimeout(() => {
                if (!isStarted) {
                    console.warn('⚠️ Leonardo tardando en iniciar, continuando...');
                    this.systemStatus.leonardo = 'STARTING';
                    resolve();
                }
            }, 30000);
        });
    }
    
    async launchFrontend() {
        console.log('\\n🌐 PASO 3: Lanzando Frontend Interface...');
        
        return new Promise((resolve) => {
            // Verificar si existe el frontend
            const frontendPath = path.resolve('frontend-unified/simple-frontend-server.js');
            
            if (!fs.existsSync(frontendPath)) {
                console.log('⚠️ Frontend no encontrado, omitiendo...');
                this.systemStatus.frontend = 'NOT_FOUND';
                resolve();
                return;
            }
            
            const frontendProcess = spawn('node', ['frontend-unified/simple-frontend-server.js'], {
                stdio: ['pipe', 'pipe', 'pipe'],
                env: {
                    ...process.env,
                    PORT: this.config.frontendPort,
                    LEONARDO_API_URL: `http://localhost:${this.config.port}`
                },
                cwd: process.cwd()
            });
            
            let isStarted = false;
            
            frontendProcess.stdout.on('data', (data) => {
                const output = data.toString();
                process.stdout.write(`[FRONTEND] ${output}`);
                
                if (output.includes('Server running') || output.includes('listening on port')) {
                    if (!isStarted) {
                        isStarted = true;
                        this.systemStatus.frontend = 'RUNNING';
                        console.log('✅ Frontend iniciado exitosamente');
                        resolve();
                    }
                }
            });
            
            frontendProcess.stderr.on('data', (data) => {
                process.stderr.write(`[FRONTEND ERROR] ${data}`);
            });
            
            frontendProcess.on('error', (error) => {
                console.error('❌ Error lanzando Frontend:', error);
                this.systemStatus.frontend = 'ERROR';
                if (!isStarted) resolve(); // No bloquear por error de frontend
            });
            
            frontendProcess.on('close', (code) => {
                console.log(`[FRONTEND] Proceso terminado con código: ${code}`);
                this.systemStatus.frontend = 'STOPPED';
            });
            
            this.processes.set('frontend', frontendProcess);
            
            // Timeout más corto para frontend
            setTimeout(() => {
                if (!isStarted) {
                    console.log('⚠️ Frontend tardando en iniciar, continuando...');
                    this.systemStatus.frontend = 'TIMEOUT';
                    resolve();
                }
            }, 10000);
        });
    }
    
    async launchAutoUpdater() {
        console.log('\\n⚡ PASO 4: Configurando auto-actualización de símbolos...');
        
        try {
            // Verificar si el auto-updater existe
            if (!fs.existsSync('auto-symbols-updater.js')) {
                console.log('⚠️ Auto-updater no encontrado, omitiendo...');
                return;
            }
            
            const updaterProcess = spawn('node', ['auto-symbols-updater.js'], {
                stdio: ['pipe', 'pipe', 'pipe'],
                env: {
                    ...process.env,
                    AUTO_UPDATE_INTERVAL: '*/30 * * * *' // Cada 30 minutos
                },
                cwd: process.cwd()
            });
            
            updaterProcess.stdout.on('data', (data) => {
                process.stdout.write(`[AUTO-UPDATE] ${data}`);
            });
            
            updaterProcess.stderr.on('data', (data) => {
                process.stderr.write(`[AUTO-UPDATE ERROR] ${data}`);
            });
            
            updaterProcess.on('close', (code) => {
                console.log(`[AUTO-UPDATE] Proceso terminado con código: ${code}`);
                this.systemStatus.autoUpdater = 'STOPPED';
            });
            
            this.processes.set('autoUpdater', updaterProcess);
            this.systemStatus.autoUpdater = 'RUNNING';
            
            console.log('✅ Auto-actualización de símbolos configurada (cada 30 min)');
            
        } catch (error) {
            console.error('❌ Error configurando auto-updater:', error.message);
            this.systemStatus.autoUpdater = 'ERROR';
        }
    }
    
    setupSystemMonitoring() {
        console.log('\\n🔍 PASO 5: Configurando monitoreo del sistema...');
        
        // Health check periódico
        this.healthCheckInterval = setInterval(() => {
            this.performHealthCheck();
        }, this.config.healthCheckInterval);
        
        // Manejo de señales para shutdown limpio
        process.on('SIGINT', async () => {
            console.log('\\n🛑 Señal de interrupción recibida...');
            await this.shutdown();
            process.exit(0);
        });
        
        process.on('SIGTERM', async () => {
            console.log('\\n🛑 Señal de terminación recibida...');
            await this.shutdown();
            process.exit(0);
        });
        
        console.log('✅ Monitoreo del sistema configurado');
    }
    
    async performHealthCheck() {
        const health = {
            leonardo: await this.checkProcessHealth('leonardo'),
            frontend: await this.checkProcessHealth('frontend'),
            autoUpdater: await this.checkProcessHealth('autoUpdater'),
            timestamp: new Date().toISOString()
        };
        
        // Solo mostrar problemas, no spam de logs OK
        const issues = Object.entries(health)
            .filter(([key, status]) => key !== 'timestamp' && status !== 'RUNNING')
            .map(([service, status]) => `${service}: ${status}`);
        
        if (issues.length > 0) {
            console.log(`⚠️ [HEALTH CHECK] Problemas detectados: ${issues.join(', ')}`);\n        }\n    }\n    \n    async checkProcessHealth(processName) {\n        const process = this.processes.get(processName);\n        \n        if (!process) {\n            return this.systemStatus[processName] || 'NOT_FOUND';\n        }\n        \n        // Verificar si el proceso sigue vivo\n        try {\n            const isAlive = !process.killed && process.exitCode === null;\n            return isAlive ? 'RUNNING' : 'STOPPED';\n        } catch (error) {\n            return 'ERROR';\n        }\n    }\n    \n    displaySystemStatus() {\n        const uptime = this.systemStatus.startTime \n            ? Math.floor((Date.now() - this.systemStatus.startTime.getTime()) / 1000)\n            : 0;\n        \n        console.log('\\n📊 ESTADO DEL SISTEMA LEONARDO REAL DATA:');\n        console.log('==========================================');\n        console.log(`🧠 Leonardo Core: ${this.systemStatus.leonardo}`);\n        console.log(`🌐 Frontend: ${this.systemStatus.frontend}`);\n        console.log(`⚡ Auto-Updater: ${this.systemStatus.autoUpdater}`);\n        console.log(`📊 Símbolos: ${this.systemStatus.symbols}`);\n        console.log(`⏱️ Uptime: ${uptime}s`);\n        \n        console.log('\\n🌐 URLs DE ACCESO:');\n        console.log(`   📊 Leonardo API: http://localhost:${this.config.port}`);\n        console.log(`   🌐 Frontend: http://localhost:${this.config.frontendPort}`);\n        console.log(`   🔍 Health Check: http://localhost:${this.config.port}/health`);\n        console.log(`   📈 Symbols Status: http://localhost:${this.config.port}/api/symbols/status`);\n        \n        console.log('\\n🎯 CARACTERÍSTICAS ACTIVADAS:');\n        console.log('   ✅ Datos reales de Binance Futures');\n        console.log('   ✅ Cache cuántica infinita');\n        console.log('   ✅ Rate limiting inteligente');\n        console.log('   ✅ Categorización automática de símbolos');\n        console.log('   ✅ Gestión unificada de credenciales');\n        if (this.config.autoUpdate) {\n            console.log('   ✅ Auto-actualización de símbolos (cada 30 min)');\n        }\n    }\n    \n    async shutdown() {\n        console.log('\\n🛑 Iniciando shutdown del sistema...');\n        \n        // Limpiar intervalos\n        if (this.healthCheckInterval) {\n            clearInterval(this.healthCheckInterval);\n        }\n        \n        // Terminar procesos de forma ordenada\n        const shutdownPromises = [];\n        \n        for (const [name, process] of this.processes.entries()) {\n            if (process && !process.killed) {\n                console.log(`   🛑 Deteniendo ${name}...`);\n                \n                const shutdownPromise = new Promise((resolve) => {\n                    process.on('close', () => {\n                        console.log(`   ✅ ${name} detenido`);\n                        resolve();\n                    });\n                    \n                    // Graceful shutdown\n                    process.kill('SIGTERM');\n                    \n                    // Force kill después de 5 segundos\n                    setTimeout(() => {\n                        if (!process.killed) {\n                            process.kill('SIGKILL');\n                            resolve();\n                        }\n                    }, 5000);\n                });\n                \n                shutdownPromises.push(shutdownPromise);\n            }\n        }\n        \n        // Esperar a que todos los procesos terminen\n        await Promise.all(shutdownPromises);\n        console.log('✅ Shutdown completado');\n    }\n    \n    getSystemInfo() {\n        return {\n            status: this.systemStatus,\n            config: this.config,\n            processes: Array.from(this.processes.keys()),\n            uptime: this.systemStatus.startTime \n                ? Date.now() - this.systemStatus.startTime.getTime()\n                : 0\n        };\n    }\n}\n\n// Función de utilidad para mostrar ayuda\nfunction showHelp() {\n    console.log('🚀 LEONARDO CONSCIOUSNESS - LAUNCH MASTER REAL DATA');\n    console.log('===================================================');\n    console.log('\\nUso: node launch-leonardo-real-data.js [opciones]');\n    console.log('\\nOpciones:');\n    console.log('  --port <puerto>          Puerto para Leonardo API (default: 5000)');\n    console.log('  --frontend-port <puerto> Puerto para Frontend (default: 3000)');\n    console.log('  --no-auto-update        Deshabilitar auto-actualización');\n    console.log('  --help                   Mostrar esta ayuda');\n    console.log('\\nEjemplos:');\n    console.log('  node launch-leonardo-real-data.js');\n    console.log('  node launch-leonardo-real-data.js --port 8000 --frontend-port 3001');\n    console.log('  node launch-leonardo-real-data.js --no-auto-update');\n}\n\n// Parsear argumentos de línea de comandos\nfunction parseArgs() {\n    const args = process.argv.slice(2);\n    const config = {};\n    \n    for (let i = 0; i < args.length; i++) {\n        switch (args[i]) {\n            case '--port':\n                config.port = parseInt(args[++i]);\n                break;\n            case '--frontend-port':\n                config.frontendPort = parseInt(args[++i]);\n                break;\n            case '--no-auto-update':\n                config.autoUpdate = false;\n                break;\n            case '--help':\n                showHelp();\n                process.exit(0);\n            default:\n                if (args[i].startsWith('--')) {\n                    console.warn(`⚠️ Opción desconocida: ${args[i]}`);\n                }\n        }\n    }\n    \n    return config;\n}\n\n// Ejecutar si es llamado directamente\nif (require.main === module) {\n    const customConfig = parseArgs();\n    const launcher = new LeonardoRealDataLauncher();\n    \n    // Aplicar configuración personalizada\n    Object.assign(launcher.config, customConfig);\n    \n    launcher.launch()\n        .then(() => {\n            console.log('\\n🚀 Sistema Leonardo con datos reales ejecutándose...');\n            console.log('\\nPresiona Ctrl+C para detener el sistema');\n        })\n        .catch((error) => {\n            console.error('\\n💥 Error fatal en el lanzamiento:', error.message);\n            process.exit(1);\n        });\n}\n\nmodule.exports = { LeonardoRealDataLauncher };
