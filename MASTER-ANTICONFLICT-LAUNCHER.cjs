#!/usr/bin/env node

/*
  Copyright © 2025 QBTC-UNIFIED QUANTUM TECHNOLOGIES
  MASTER-ANTICONFLICT-LAUNCHER.js - LANZADOR MAESTRO ANTICONFLICTO
  
  🎯 OBJETIVO: Establecer secuencia de arranque correcta sin conflictos
  🔧 SOLUCIONES: Gestión de puertos, dependencias, orden, cleanup automático
  
  "Order is the foundation of all things" - Leonardo da Vinci
*/

require('dotenv').config();

const { spawn, exec } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

class MasterAnticonflictLauncher {
    constructor() {
        console.log('🌌 QBTC-UNIFIED MASTER ANTICONFLICT LAUNCHER');
        console.log('=============================================');
        console.log('🎯 Estableciendo secuencia ordenada y libre de conflictos');
        console.log('⚡ "Order is the foundation of all things" - Leonardo da Vinci');
        console.log('');

        // CONFIGURACIÓN DE PUERTOS (BANDAS SEPARADAS)
        this.portConfig = {
            // CORE QUANTUM PORTS (3000-3099)
            quantumCore: 3001,
            leonardoConsciousness: 3003,
            quantumCache: 3005,
            
            // TRADING ENGINES PORTS (3100-3199)
            marketMaker: 3101,
            riskManager: 3103,
            fundsManager: 3105,
            
            // UNIFIED SYSTEM PORTS (3200-3299)
            unifiedSystem: 3201,
            masterDashboard: 3203,
            unifiedAPI: 3205,
            
            // MONITORING PORTS (3300-3399)
            healthMonitor: 3301,
            metricsCollector: 3303,
            systemMonitor: 3305,
            
            // FRONTEND PORTS (8000-8099)
            mainFrontend: 8080,
            simplifiedFrontend: 8081,
            dashboardFrontend: 8082,
            
            // LEGACY PORTS (reservados pero no usados)
            legacyPorts: [9090, 18020, 4000, 5000]
        };

        // SECUENCIA ORDENADA DE ARRANQUE
        this.launchSequence = [
            {
                name: 'cleanup',
                description: 'Limpieza de procesos previos',
                action: this.performSystemCleanup.bind(this),
                critical: true
            },
            {
                name: 'portValidation',
                description: 'Validación y liberación de puertos',
                action: this.validateAndFreePorts.bind(this),
                critical: true
            },
            {
                name: 'baseCore',
                description: 'Quantum Core Base + Leonardo Consciousness',
                action: this.launchBaseCore.bind(this),
                critical: true,
                waitTime: 5000
            },
            {
                name: 'tradingEngines',
                description: 'Market Maker + Risk Manager + Funds Manager',
                action: this.launchTradingEngines.bind(this),
                critical: true,
                waitTime: 3000
            },
            {
                name: 'unifiedSystem',
                description: 'Sistema Unificado Maestro',
                action: this.launchUnifiedSystem.bind(this),
                critical: true,
                waitTime: 5000
            },
            {
                name: 'monitoring',
                description: 'Sistemas de Monitoreo',
                action: this.launchMonitoringSystems.bind(this),
                critical: false,
                waitTime: 2000
            },
            {
                name: 'frontend',
                description: 'Interfaces de Usuario',
                action: this.launchFrontendSystems.bind(this),
                critical: false,
                waitTime: 2000
            },
            {
                name: 'validation',
                description: 'Validación Final del Sistema',
                action: this.performFinalValidation.bind(this),
                critical: true
            }
        ];

        // ESTADO DEL LAUNCHER
        this.state = {
            isRunning: false,
            currentPhase: null,
            launchedProcesses: new Map(),
            errors: [],
            startTime: Date.now(),
            systemStatus: 'INITIALIZING'
        };

        // MÉTRICAS DE LANZAMIENTO
        this.metrics = {
            totalPhases: this.launchSequence.length,
            completedPhases: 0,
            failedPhases: 0,
            totalProcesses: 0,
            activeProcesses: 0,
            systemHealth: 0
        };
    }

    /**
     * EJECUTAR SECUENCIA MAESTRA ANTICONFLICTO
     */
    async executeMasterLaunch() {
        try {
            console.log('🚀 INICIANDO SECUENCIA MAESTRA ANTICONFLICTO');
            console.log('============================================');
            console.log(`📋 Total de fases: ${this.launchSequence.length}`);
            console.log('');

            this.state.isRunning = true;
            this.state.systemStatus = 'LAUNCHING';

            // Ejecutar cada fase en secuencia
            for (const [index, phase] of this.launchSequence.entries()) {
                console.log(`📍 FASE ${index + 1}/${this.launchSequence.length}: ${phase.name.toUpperCase()}`);
                console.log(`   🎯 ${phase.description}`);

                this.state.currentPhase = phase.name;

                try {
                    // Ejecutar acción de la fase
                    const result = await phase.action();
                    
                    if (result === false && phase.critical) {
                        throw new Error(`Fase crítica falló: ${phase.name}`);
                    }

                    console.log(`   ✅ FASE ${phase.name} COMPLETADA`);
                    this.metrics.completedPhases++;

                    // Tiempo de espera si se especifica
                    if (phase.waitTime) {
                        console.log(`   ⏳ Esperando ${phase.waitTime}ms para estabilización...`);
                        await this.wait(phase.waitTime);
                    }

                } catch (error) {
                    console.error(`   ❌ FASE ${phase.name} FALLÓ:`, error.message);
                    this.state.errors.push({ phase: phase.name, error: error.message });
                    this.metrics.failedPhases++;

                    if (phase.critical) {
                        console.error('💥 FASE CRÍTICA FALLÓ - ABORTANDO LANZAMIENTO');
                        throw error;
                    } else {
                        console.warn('⚠️  FASE NO CRÍTICA FALLÓ - CONTINUANDO');
                    }
                }

                console.log('');
            }

            this.state.systemStatus = 'RUNNING';
            console.log('🎉 SECUENCIA MAESTRA COMPLETADA EXITOSAMENTE! 🎉');
            console.log('===============================================');
            
            await this.displayLaunchSummary();
            this.setupGracefulShutdown();
            
            return true;

        } catch (error) {
            this.state.systemStatus = 'FAILED';
            console.error('💥 ERROR CRÍTICO EN SECUENCIA MAESTRA:', error.message);
            await this.performEmergencyCleanup();
            return false;
        }
    }

    /**
     * FASE 1: LIMPIEZA DE PROCESOS PREVIOS
     */
    async performSystemCleanup() {
        console.log('   🧹 Eliminando procesos Node.js previos...');
        
        return new Promise((resolve) => {
            exec('tasklist /FI "IMAGENAME eq node.exe"', (error, stdout) => {
                if (!error && stdout.includes('node.exe')) {
                    console.log('   🔄 Procesos Node detectados, eliminando...');
                    exec('taskkill /F /IM node.exe', (killError) => {
                        if (killError) {
                            console.warn('   ⚠️  No se pudieron eliminar todos los procesos Node');
                        } else {
                            console.log('   ✅ Procesos Node eliminados');
                        }
                        resolve(true);
                    });
                } else {
                    console.log('   ✅ No hay procesos Node previos');
                    resolve(true);
                }
            });
        });
    }

    /**
     * FASE 2: VALIDACIÓN Y LIBERACIÓN DE PUERTOS
     */
    async validateAndFreePorts() {
        console.log('   🔍 Verificando y liberando puertos requeridos...');
        
        const allPorts = Object.values(this.portConfig).flat().filter(p => typeof p === 'number');
        
        for (const port of allPorts) {
            const isInUse = await this.checkPortInUse(port);
            if (isInUse) {
                console.log(`   🔓 Liberando puerto ${port}...`);
                await this.freePort(port);
            }
        }
        
        console.log(`   ✅ Validados ${allPorts.length} puertos`);
        return true;
    }

    /**
     * FASE 3: LANZAR CORE BASE
     */
    async launchBaseCore() {
        console.log('   🌌 Lanzando Quantum Core Base...');
        
        // Lanzar Leonardo Consciousness primero (base fundamental)
        const leonardoProcess = await this.launchProcess('leonardo-consciousness', {
            script: './leonardo-consciousness/start-leonardo.js',
            port: this.portConfig.leonardoConsciousness,
            env: { 
                ...process.env, 
                PORT: this.portConfig.leonardoConsciousness,
                NODE_ENV: 'production'
            }
        });

        if (!leonardoProcess) {
            throw new Error('No se pudo iniciar Leonardo Consciousness');
        }

        // Esperar que Leonardo esté listo
        await this.waitForService('leonardo-consciousness', this.portConfig.leonardoConsciousness);
        
        console.log('   ✅ Leonardo Consciousness activo y listo');
        return true;
    }

    /**
     * FASE 4: LANZAR MOTORES DE TRADING
     */
    async launchTradingEngines() {
        console.log('   ⚡ Lanzando motores de trading...');
        
        // Por ahora, los motores están integrados en el sistema unificado
        // Esta fase prepara el entorno para ellos
        console.log('   ✅ Entorno de trading preparado');
        return true;
    }

    /**
     * FASE 5: LANZAR SISTEMA UNIFICADO MAESTRO
     */
    async launchUnifiedSystem() {
        console.log('   🌟 Lanzando Sistema Unificado Maestro...');
        
        // Lanzar el sistema unificado con el puerto específico
        const unifiedProcess = await this.launchProcess('unified-master', {
            script: './launch-quantum-unified-master.js',
            port: this.portConfig.masterDashboard,
            env: {
                ...process.env,
                HTTP_PORT: this.portConfig.masterDashboard,
                NODE_ENV: 'production'
            }
        });

        if (!unifiedProcess) {
            throw new Error('No se pudo iniciar Sistema Unificado Maestro');
        }

        // Esperar que el sistema unificado esté listo
        await this.waitForService('unified-master', this.portConfig.masterDashboard);
        
        console.log(`   ✅ Sistema Unificado Maestro activo en puerto ${this.portConfig.masterDashboard}`);
        return true;
    }

    /**
     * FASE 6: LANZAR SISTEMAS DE MONITOREO
     */
    async launchMonitoringSystems() {
        console.log('   📊 Lanzando sistemas de monitoreo...');
        
        // Los sistemas de monitoreo están integrados en el sistema unificado
        console.log('   ✅ Monitoreo integrado activado');
        return true;
    }

    /**
     * FASE 7: LANZAR SISTEMAS FRONTEND
     */
    async launchFrontendSystems() {
        console.log('   🌐 Lanzando interfaces frontend...');
        
        // Lanzar servidor frontend simplificado
        const frontendProcess = await this.launchProcess('frontend-main', {
            script: './frontend/simplified/start-qbtc-real.ps1',
            port: this.portConfig.mainFrontend,
            env: {
                ...process.env,
                PORT: this.portConfig.mainFrontend
            }
        });

        // El frontend puede ser opcional si falla
        if (frontendProcess) {
            console.log(`   ✅ Frontend activo en puerto ${this.portConfig.mainFrontend}`);
        } else {
            console.warn('   ⚠️  Frontend no pudo iniciarse, continuando sin él');
        }
        
        return true;
    }

    /**
     * FASE 8: VALIDACIÓN FINAL
     */
    async performFinalValidation() {
        console.log('   🔍 Realizando validación final del sistema...');
        
        const validationResults = {
            leonardoConsciousness: await this.validateService(this.portConfig.leonardoConsciousness),
            unifiedMaster: await this.validateService(this.portConfig.masterDashboard),
            totalProcesses: this.state.launchedProcesses.size
        };

        console.log('   📊 Resultados de validación:');
        console.log(`      • Leonardo Consciousness: ${validationResults.leonardoConsciousness ? '✅' : '❌'}`);
        console.log(`      • Sistema Unificado: ${validationResults.unifiedMaster ? '✅' : '❌'}`);
        console.log(`      • Procesos activos: ${validationResults.totalProcesses}`);

        const isSystemHealthy = validationResults.leonardoConsciousness && validationResults.unifiedMaster;
        
        if (!isSystemHealthy) {
            throw new Error('Sistema no pasó validación final');
        }

        this.metrics.systemHealth = 100;
        console.log('   ✅ Sistema completamente validado y operativo');
        return true;
    }

    /**
     * UTILIDADES DE SOPORTE
     */
    
    async checkPortInUse(port) {
        return new Promise((resolve) => {
            const server = require('net').createServer();
            server.listen(port, () => {
                server.once('close', () => resolve(false));
                server.close();
            });
            server.on('error', () => resolve(true));
        });
    }

    async freePort(port) {
        return new Promise((resolve) => {
            exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
                if (!error && stdout) {
                    console.log(`   🔍 Proceso detectado en puerto ${port}, liberando...`);
                    const lines = stdout.trim().split('\n');
                    for (const line of lines) {
                        const parts = line.trim().split(/\s+/);
                        if (parts.length >= 5) {
                            const pid = parts[4];
                            console.log(`   🔄 Terminando PID ${pid} en puerto ${port}`);
                            exec(`taskkill /PID ${pid} /F`, (killError) => {
                                if (killError) {
                                    console.warn(`   ⚠️  No se pudo terminar PID ${pid}`);
                                } else {
                                    console.log(`   ✅ PID ${pid} terminado`);
                                }
                            });
                        }
                    }
                    // Esperar 2 segundos para que se libere el puerto
                    setTimeout(resolve, 2000);
                } else {
                    resolve();
                }
            });
        });
    }

    async launchProcess(name, options) {
        return new Promise((resolve) => {
            try {
                let process;
                
                if (options.script.endsWith('.ps1')) {
                    // Ejecutar PowerShell script
                    process = spawn('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-File', options.script], {
                        env: options.env,
                        detached: false,
                        stdio: ['ignore', 'pipe', 'pipe']
                    });
                } else {
                    // Ejecutar Node.js script
                    process = spawn('node', [options.script], {
                        env: options.env,
                        detached: false,
                        stdio: ['ignore', 'pipe', 'pipe']
                    });
                }

                process.stdout.on('data', (data) => {
                    console.log(`      [${name}] ${data.toString().trim()}`);
                });

                process.stderr.on('data', (data) => {
                    console.error(`      [${name}] ERROR: ${data.toString().trim()}`);
                });

                process.on('error', (error) => {
                    console.error(`      [${name}] SPAWN ERROR:`, error.message);
                    resolve(null);
                });

                process.on('close', (code) => {
                    console.log(`      [${name}] Proceso terminado con código ${code}`);
                    this.state.launchedProcesses.delete(name);
                });

                this.state.launchedProcesses.set(name, process);
                this.metrics.totalProcesses++;
                this.metrics.activeProcesses++;

                console.log(`      [${name}] Proceso lanzado con PID ${process.pid}`);
                resolve(process);

            } catch (error) {
                console.error(`      [${name}] Error lanzando proceso:`, error.message);
                resolve(null);
            }
        });
    }

    async waitForService(name, port, maxWait = 30000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWait) {
            if (await this.validateService(port)) {
                return true;
            }
            await this.wait(1000);
        }
        
        throw new Error(`Servicio ${name} no respondió en puerto ${port} después de ${maxWait}ms`);
    }

    async validateService(port) {
        return new Promise((resolve) => {
            const req = http.get(`http://localhost:${port}/api/health`, { timeout: 2000 }, (res) => {
                resolve(res.statusCode === 200);
            });
            
            req.on('error', () => resolve(false));
            req.on('timeout', () => {
                req.abort();
                resolve(false);
            });
        });
    }

    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async displayLaunchSummary() {
        const uptime = Math.floor((Date.now() - this.state.startTime) / 1000);
        
        console.log('📋 RESUMEN DE LANZAMIENTO MAESTRO');
        console.log('================================');
        console.log(`🕐 Tiempo total: ${uptime} segundos`);
        console.log(`✅ Fases completadas: ${this.metrics.completedPhases}/${this.metrics.totalPhases}`);
        console.log(`❌ Fases fallidas: ${this.metrics.failedPhases}`);
        console.log(`🔄 Procesos activos: ${this.metrics.activeProcesses}`);
        console.log(`💚 Salud del sistema: ${this.metrics.systemHealth}%`);
        console.log('');
        console.log('🌐 SERVICIOS ACTIVOS:');
        console.log(`   • Leonardo Consciousness: http://localhost:${this.portConfig.leonardoConsciousness}`);
        console.log(`   • Master Dashboard: http://localhost:${this.portConfig.masterDashboard}`);
        console.log(`   • Main Frontend: http://localhost:${this.portConfig.mainFrontend}`);
        console.log('');
        console.log('🎯 SISTEMA LISTO PARA EXTRACCIÓN MÁXIMA DE JUGO CUÁNTICO! 🚀');
    }

    setupGracefulShutdown() {
        const handleShutdown = async () => {
            console.log('');
            console.log('🔄 INICIANDO SHUTDOWN ELEGANTE...');
            
            for (const [name, process] of this.state.launchedProcesses) {
                console.log(`   🔒 Cerrando ${name}...`);
                process.kill('SIGTERM');
            }
            
            await this.wait(3000);
            
            console.log('🔒 SISTEMA COMPLETAMENTE CERRADO');
            process.exit(0);
        };

        process.on('SIGINT', handleShutdown);
        process.on('SIGTERM', handleShutdown);
    }

    async performEmergencyCleanup() {
        console.log('🚨 REALIZANDO LIMPIEZA DE EMERGENCIA...');
        
        for (const [name, process] of this.state.launchedProcesses) {
            try {
                process.kill('SIGKILL');
                console.log(`   ⚡ Proceso ${name} terminado forzadamente`);
            } catch (error) {
                console.error(`   ❌ Error terminando ${name}:`, error.message);
            }
        }
    }
}

/**
 * FUNCIÓN PRINCIPAL
 */
async function main() {
    try {
        const launcher = new MasterAnticonflictLauncher();
        const success = await launcher.executeMasterLaunch();
        
        if (!success) {
            console.error('💥 LANZAMIENTO MAESTRO FALLÓ');
            process.exit(1);
        }
        
        // Mantener el proceso vivo
        process.on('exit', () => {
            console.log('👋 Master Anticonflict Launcher - Goodbye!');
        });
        
    } catch (error) {
        console.error('💥 ERROR FATAL EN MAIN:', error.message);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = { MasterAnticonflictLauncher };
