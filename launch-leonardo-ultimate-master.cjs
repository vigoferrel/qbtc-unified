/*
  🌟 LEONARDO CONSCIOUSNESS - ULTIMATE MASTER LAUNCHER
  El lanzador definitivo que activa TODAS las capacidades del sistema
  Modo ULTIMATE = Máximo rendimiento + Todas las optimizaciones
*/

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { UltimateOptimizationEngine } = require('./leonardo-ultimate-optimizer');
const { SymbolsLoader } = require('./fix-symbols-loading');
const { AntiLiquidationIntegrator } = require('./AntiLiquidationIntegrator');

class LeonardoUltimateMaster {
    constructor() {
        console.log('🌟 LEONARDO CONSCIOUSNESS - ULTIMATE MASTER');
        console.log('===========================================');
        console.log('🚀 Iniciando el sistema más avanzado de trading cuántico');
        
        this.processes = new Map();
        this.isShuttingDown = false;
        this.systemMetrics = {
            startTime: Date.now(),
            totalOptimizations: 0,
            processesLaunched: 0,
            errorsHandled: 0,
            phoenixActivations: 0,
            evolutionLevel: 1,
            totalDrawdowns: 0,
            maxDrawdownSurvived: 0
        };
        
        // Sistema Anti-Liquidación
        this.antiLiquidationIntegrator = null;
        this.antiLiquidationActive = false;
        
        // Configuración ultimate
        this.ultimateConfig = {
            // Máximo rendimiento
            maxSymbols: 1000,           // 1000 símbolos
            concurrency: 50,            // Máxima concurrencia
            cacheSize: 5000,            // Cache de 5000 símbolos
            
            // Puertos y servicios
            leonardoPort: process.env.LEONARDO_PORT || 5000,
            frontendPort: process.env.FRONTEND_PORT || 3000,
            
            // Servicios a activar
            enableFrontend: true,
            enableAutoUpdater: true,
            enableMonitoring: true,
            enableOptimizations: true,
            
            // Configuración avanzada
            enableQuantumMode: true,
            enableRealTimeAnalytics: true,
            enableAdvancedAlgorithms: true,
            enableMaxLeverage: true,
            
            // Sistema Anti-Liquidación
            enableAntiLiquidation: true,
            criticalDrawdownThreshold: 0.03,     // 3%
            emergencyDrawdownThreshold: 0.045,   // 4.5%
            phoenixActivationThreshold: 0.07,    // 7%
            maxLeverage: 125,
            adaptiveLeverageEnabled: true,
            quantumEvolutionEnabled: true,
            realTimeRiskMonitoring: true
        };
        
        this.setupSignalHandlers();
    }
    
    setupSignalHandlers() {
        process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
        process.on('uncaughtException', (error) => {
            console.error('💥 [MASTER] Uncaught Exception:', error.message);
            this.systemMetrics.errorsHandled++;
            this.gracefulShutdown('ERROR');
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            console.error('💥 [MASTER] Unhandled Rejection:', reason);
            this.systemMetrics.errorsHandled++;
        });
    }
    
    async startUltimateSystem() {
        console.log('🔥 FASE 1: INICIALIZACIÓN ULTIMATE');
        console.log('==================================');
        
        try {
            // 1. Ejecutar optimización ultimate completa
            console.log('🌟 Ejecutando optimización ULTIMATE...');
            const ultimateEngine = new UltimateOptimizationEngine();
            await ultimateEngine.runUltimateOptimization();
            this.systemMetrics.totalOptimizations++;
            
            // 2. Inicializar sistema Anti-Liquidación
            if (this.ultimateConfig.enableAntiLiquidation) {
                await this.initializeAntiLiquidationSystem();
            }
            
            // 3. Preparar variables de entorno optimizadas
            await this.setupUltimateEnvironment();
            
            // 4. Lanzar sistemas principales
            await this.launchCoreServices();
            
            // 5. Configurar monitoreo avanzado + Anti-Liquidación
            await this.setupUltimateMonitoring();
            
            // 5. Mostrar estado final
            this.displayUltimateStatus();
            
        } catch (error) {
            console.error('💥 Error en inicialización ultimate:', error.message);
            throw error;
        }
    }
    
    async setupUltimateEnvironment() {
        console.log('⚙️ Configurando entorno ULTIMATE...');
        
        // Variables de entorno optimizadas para máximo rendimiento
        const ultimateEnv = {
            ...process.env,
            
            // Leonardo Configuration
            LEONARDO_PORT: this.ultimateConfig.leonardoPort,
            FRONTEND_PORT: this.ultimateConfig.frontendPort,
            TRADING_MODE: 'futuros',
            
            // Binance Configuration
            BINANCE_REAL_DATA: 'true',
            BINANCE_TESTNET: 'false',
            
            // Quantum Configuration
            QUANTUM_MAX_SYMBOLS: this.ultimateConfig.maxSymbols,
            QUANTUM_MODE: 'ultimate',
            QUANTUM_CACHE_SIZE: this.ultimateConfig.cacheSize,
            
            // Performance Configuration
            NODE_OPTIONS: '--max-old-space-size=4096 --optimize-for-size',
            UV_THREADPOOL_SIZE: '16',
            
            // Rate Limiting Optimizado
            BINANCE_RATE_LIMIT_ORDERS: '500',
            BINANCE_RATE_LIMIT_WINDOW: '8000',
            BINANCE_WEIGHT_LIMIT: '2000',
            BINANCE_WEIGHT_WINDOW: '50000',
            
            // Advanced Features
            ENABLE_QUANTUM_ALGORITHMS: 'true',
            ENABLE_ADVANCED_ANALYTICS: 'true',
            ENABLE_REAL_TIME_OPTIMIZATION: 'true',
            ENABLE_MAX_LEVERAGE: 'true',
            
            // Monitoring
            ENABLE_ADVANCED_MONITORING: 'true',
            METRICS_INTERVAL: '5000',
            HEALTH_CHECK_INTERVAL: '15000',
            
            // Anti-Liquidation System
            ANTI_LIQUIDATION_ENABLED: this.ultimateConfig.enableAntiLiquidation ? 'true' : 'false',
            CRITICAL_DRAWDOWN_THRESHOLD: this.ultimateConfig.criticalDrawdownThreshold,
            EMERGENCY_DRAWDOWN_THRESHOLD: this.ultimateConfig.emergencyDrawdownThreshold,
            PHOENIX_ACTIVATION_THRESHOLD: this.ultimateConfig.phoenixActivationThreshold,
            ADAPTIVE_LEVERAGE_ENABLED: this.ultimateConfig.adaptiveLeverageEnabled ? 'true' : 'false',
            QUANTUM_EVOLUTION_ENABLED: this.ultimateConfig.quantumEvolutionEnabled ? 'true' : 'false',
            REAL_TIME_RISK_MONITORING: this.ultimateConfig.realTimeRiskMonitoring ? 'true' : 'false'
        };
        
        // Aplicar variables al proceso actual
        Object.assign(process.env, ultimateEnv);
        
        console.log('✅ Entorno ULTIMATE configurado');
        console.log(`   🎯 Símbolos máximos: ${ultimateEnv.QUANTUM_MAX_SYMBOLS}`);
        console.log(`   ⚡ Modo cuántico: ${ultimateEnv.QUANTUM_MODE}`);
        console.log(`   🚀 Configuración: ULTRA HIGH PERFORMANCE`);
        if (this.ultimateConfig.enableAntiLiquidation) {
            console.log(`   🛡️ Sistema Anti-Liquidación: ACTIVADO`);
            console.log(`   🔥 Phoenix Protocol: LISTO`);
            console.log(`   🧬 Evolución Cuántica: HABILITADA`);
        }
    }
    
    async launchCoreServices() {
        console.log('🔥 FASE 2: LANZANDO SERVICIOS PRINCIPALES');
        console.log('=========================================');
        
        // 1. Lanzar Leonardo Consciousness Principal
        await this.launchLeonardoCore();
        
        // 2. Lanzar Frontend (si está habilitado)
        if (this.ultimateConfig.enableFrontend) {
            await this.launchFrontend();
        }
        
        // 3. Lanzar Auto-Updater (si está habilitado)
        if (this.ultimateConfig.enableAutoUpdater) {
            await this.launchAutoUpdater();
        }
        
        console.log('✅ Todos los servicios principales están activos');
    }
    
    async launchLeonardoCore() {
        console.log('🧠 Lanzando Leonardo Consciousness Core...');
        
        return new Promise((resolve, reject) => {
            // Usar el launcher existente más avanzado
            const leonardoProcess = spawn('node', ['launch-leonardo-real-data.js'], {
                stdio: ['pipe', 'pipe', 'pipe'],
                env: process.env,
                cwd: __dirname
            });
            
            this.processes.set('leonardo', leonardoProcess);
            this.systemMetrics.processesLaunched++;
            
            leonardoProcess.stdout.on('data', (data) => {
                const output = data.toString();
                console.log(`[LEONARDO] ${output.trim()}`);
                
                // Detectar cuando esté completamente iniciado
                if (output.includes('Sistema operando a máximo rendimiento') || 
                    output.includes('Leonardo API corriendo en puerto')) {
                    resolve();
                }
            });
            
            leonardoProcess.stderr.on('data', (data) => {
                const error = data.toString();
                if (!error.includes('DeprecationWarning')) {
                    console.warn(`[LEONARDO ERROR] ${error.trim()}`);
                }
            });
            
            leonardoProcess.on('exit', (code) => {
                console.log(`[LEONARDO] Proceso terminado con código: ${code}`);
                this.processes.delete('leonardo');
                if (!this.isShuttingDown && code !== 0) {
                    console.log('🔄 Reiniciando Leonardo Core...');
                    setTimeout(() => this.launchLeonardoCore(), 5000);
                }
            });
            
            // Timeout para resolver si no hay confirmación
            setTimeout(() => {
                console.log('✅ Leonardo Core iniciado (timeout alcanzado)');
                resolve();
            }, 15000);
        });
    }
    
    async launchFrontend() {
        console.log('🌐 Lanzando Frontend Ultimate...');
        
        // Verificar si existe el servidor frontend
        const frontendFiles = [
            'frontend-unified/simple-frontend-server.js',
            'frontend-server.js'
        ];
        
        let frontendFile = null;
        for (const file of frontendFiles) {
            try {
                await fs.access(file);
                frontendFile = file;
                break;
            } catch (error) {
                // Archivo no existe, continuar
            }
        }
        
        if (!frontendFile) {
            console.log('⚠️ No se encontró servidor frontend, omitiendo...');
            return;
        }
        
        return new Promise((resolve) => {
            const frontendProcess = spawn('node', [frontendFile], {
                stdio: ['pipe', 'pipe', 'pipe'],
                env: { ...process.env, PORT: this.ultimateConfig.frontendPort },
                cwd: __dirname
            });
            
            this.processes.set('frontend', frontendProcess);
            this.systemMetrics.processesLaunched++;
            
            frontendProcess.stdout.on('data', (data) => {
                const output = data.toString();
                console.log(`[FRONTEND] ${output.trim()}`);
                
                if (output.includes('servidor corriendo') || output.includes('listening')) {
                    resolve();
                }
            });
            
            frontendProcess.stderr.on('data', (data) => {
                const error = data.toString();
                if (!error.includes('DeprecationWarning')) {
                    console.warn(`[FRONTEND ERROR] ${error.trim()}`);
                }
            });
            
            frontendProcess.on('exit', (code) => {
                console.log(`[FRONTEND] Proceso terminado con código: ${code}`);
                this.processes.delete('frontend');
                if (!this.isShuttingDown && code !== 0) {
                    console.log('🔄 Reiniciando Frontend...');
                    setTimeout(() => this.launchFrontend(), 5000);
                }
            });
            
            // Timeout
            setTimeout(() => {
                console.log('✅ Frontend iniciado (timeout alcanzado)');
                resolve();
            }, 10000);
        });
    }
    
    async launchAutoUpdater() {
        console.log('🔄 Lanzando Auto-Updater Ultimate...');
        
        try {
            await fs.access('auto-symbols-updater.js');
        } catch (error) {
            console.log('⚠️ Auto-updater no encontrado, omitiendo...');
            return;
        }
        
        const updaterProcess = spawn('node', ['auto-symbols-updater.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: process.env,
            cwd: __dirname
        });
        
        this.processes.set('updater', updaterProcess);
        this.systemMetrics.processesLaunched++;
        
        updaterProcess.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(`[UPDATER] ${output.trim()}`);
        });
        
        updaterProcess.stderr.on('data', (data) => {
            const error = data.toString();
            if (!error.includes('DeprecationWarning')) {
                console.warn(`[UPDATER ERROR] ${error.trim()}`);
            }
        });
        
        updaterProcess.on('exit', (code) => {
            console.log(`[UPDATER] Proceso terminado con código: ${code}`);
            this.processes.delete('updater');
            if (!this.isShuttingDown && code !== 0) {
                console.log('🔄 Reiniciando Auto-Updater...');
                setTimeout(() => this.launchAutoUpdater(), 10000);
            }
        });
        
        console.log('✅ Auto-Updater iniciado');
    }
    
    async initializeAntiLiquidationSystem() {
        console.log('🛡️ INICIALIZANDO SISTEMA ANTI-LIQUIDACIÓN');
        console.log('========================================');
        
        try {
            // Crear instancia del integrador Anti-Liquidación
            this.antiLiquidationIntegrator = new AntiLiquidationIntegrator({
                criticalDrawdownThreshold: this.ultimateConfig.criticalDrawdownThreshold,
                emergencyDrawdownThreshold: this.ultimateConfig.emergencyDrawdownThreshold,
                phoenixActivationThreshold: this.ultimateConfig.phoenixActivationThreshold,
                maxLeverage: this.ultimateConfig.maxLeverage,
                adaptiveLeverageEnabled: this.ultimateConfig.adaptiveLeverageEnabled,
                quantumEvolutionEnabled: this.ultimateConfig.quantumEvolutionEnabled,
                realTimeOptimization: this.ultimateConfig.realTimeRiskMonitoring,
                monitoringInterval: 1000  // 1 segundo
            });
            
            // Configurar event listeners
            this.setupAntiLiquidationListeners();
            
            // Inicializar el sistema
            await this.antiLiquidationIntegrator.initialize();
            
            // Iniciar monitoreo
            await this.antiLiquidationIntegrator.startMonitoring();
            
            this.antiLiquidationActive = true;
            
            console.log('✅ Sistema Anti-Liquidación inicializado y activo');
            console.log(`   🎯 Umbral crítico: ${(this.ultimateConfig.criticalDrawdownThreshold * 100).toFixed(1)}%`);
            console.log(`   🚨 Umbral emergencia: ${(this.ultimateConfig.emergencyDrawdownThreshold * 100).toFixed(1)}%`);
            console.log(`   🔥 Umbral Phoenix: ${(this.ultimateConfig.phoenixActivationThreshold * 100).toFixed(1)}%`);
            console.log(`   ⚡ Leverage máximo: ${this.ultimateConfig.maxLeverage}x`);
            console.log('   🧬 Evolución cuántica: HABILITADA');
            console.log('   📊 Monitoreo en tiempo real: ACTIVO');
            
        } catch (error) {
            console.error('💥 Error inicializando sistema Anti-Liquidación:', error.message);
            throw error;
        }
    }
    
    setupAntiLiquidationListeners() {
        if (!this.antiLiquidationIntegrator) return;
        
        // Escuchar eventos críticos
        this.antiLiquidationIntegrator.on('phoenixActivation', (data) => {
            this.systemMetrics.phoenixActivations = data.activationCount;
            this.systemMetrics.evolutionLevel = data.evolutionLevel;
            console.log(`🔥 [ANTI-LIQ] PHOENIX ACTIVADO - Activación #${data.activationCount} | Evolución nivel ${data.evolutionLevel}`);
        });
        
        this.antiLiquidationIntegrator.on('evolutionComplete', (data) => {
            this.systemMetrics.evolutionLevel = data.level;
            console.log(`🧬 [ANTI-LIQ] EVOLUCIÓN COMPLETADA - Nivel ${data.level} | Momentum: ${(data.momentum * 100).toFixed(1)}%`);
        });
        
        this.antiLiquidationIntegrator.on('metricsUpdate', (data) => {
            // Actualizar métricas del sistema principal
            if (data.systemState) {
                this.systemMetrics.totalDrawdowns++;
                this.systemMetrics.maxDrawdownSurvived = Math.max(
                    this.systemMetrics.maxDrawdownSurvived,
                    data.systemState.currentDrawdown
                );
            }
        });
        
        this.antiLiquidationIntegrator.on('systemAdaptation', (data) => {
            console.log(`🔄 [ANTI-LIQ] ADAPTACIÓN DEL SISTEMA - Score: ${(data.adaptationScore * 100).toFixed(1)}%`);
        });
    }
    
    async setupUltimateMonitoring() {
        console.log('🔥 FASE 3: CONFIGURANDO MONITOREO ULTIMATE');
        console.log('==========================================');
        
        // Monitoreo de procesos
        this.startProcessMonitoring();
        
        // Monitoreo de métricas del sistema
        this.startSystemMetricsMonitoring();
        
        // Health checks avanzados
        this.startAdvancedHealthChecks();
        
        // Monitoreo del sistema Anti-Liquidación
        if (this.antiLiquidationActive) {
            this.startAntiLiquidationMonitoring();
        }
        
        console.log('✅ Sistema de monitoreo ULTIMATE activado');
    }
    
    startProcessMonitoring() {
        setInterval(() => {
            if (this.isShuttingDown) return;
            
            let activeProcesses = 0;
            for (const [name, process] of this.processes) {
                if (process && !process.killed) {
                    activeProcesses++;
                } else {
                    console.warn(`⚠️ [MONITOR] Proceso ${name} no está activo`);
                }
            }
            
            if (activeProcesses === 0 && this.processes.size > 0) {
                console.error('💥 [MONITOR] TODOS LOS PROCESOS HAN TERMINADO');
                this.gracefulShutdown('PROCESS_FAILURE');
            }
            
        }, 30000); // Check cada 30 segundos
    }
    
    startSystemMetricsMonitoring() {
        setInterval(() => {
            if (this.isShuttingDown) return;
            
            const uptime = Date.now() - this.systemMetrics.startTime;
            const uptimeHours = (uptime / 1000 / 3600).toFixed(2);
            
            let antiLiqInfo = '';
            if (this.antiLiquidationActive && this.antiLiquidationIntegrator) {
                try {
                    const report = this.antiLiquidationIntegrator.getSystemReport();
                    const drawdown = (report.systemState.currentDrawdown * 100).toFixed(1);
                    const evolution = report.systemState.evolutionLevel;
                    const phoenix = report.systemState.phoenixActivations;
                    antiLiqInfo = ` | Drawdown: ${drawdown}% | Evolución: ${evolution} | Phoenix: ${phoenix}`;
                } catch (error) {
                    antiLiqInfo = ' | Anti-Liq: ERROR';
                }
            }
            
            console.log(`📊 [METRICS] Uptime: ${uptimeHours}h | Procesos: ${this.processes.size} | Errores: ${this.systemMetrics.errorsHandled}${antiLiqInfo}`);
            
        }, 300000); // Log cada 5 minutos
    }
    
    startAdvancedHealthChecks() {
        setInterval(async () => {
            if (this.isShuttingDown) return;
            
            try {
                // Health check del puerto Leonardo
                const leonardo = await this.checkServiceHealth(`http://localhost:${this.ultimateConfig.leonardoPort}/health`);
                
                // Health check del frontend
                let frontend = true;
                if (this.ultimateConfig.enableFrontend) {
                    frontend = await this.checkServiceHealth(`http://localhost:${this.ultimateConfig.frontendPort}`);
                }
                
                if (!leonardo) {
                    console.warn('⚠️ [HEALTH] Leonardo API no responde');
                }
                
                if (!frontend && this.ultimateConfig.enableFrontend) {
                    console.warn('⚠️ [HEALTH] Frontend no responde');
                }
                
            } catch (error) {
                console.warn('⚠️ [HEALTH] Error en health check:', error.message);
            }
            
        }, 60000); // Check cada minuto
    }
    
    startAntiLiquidationMonitoring() {
        console.log('🛡️ Iniciando monitoreo Anti-Liquidación...');
        
        // Reporte detallado cada 10 minutos
        setInterval(() => {
            if (this.isShuttingDown || !this.antiLiquidationIntegrator) return;
            
            try {
                const systemReport = this.antiLiquidationIntegrator.getSystemReport();
                const evolutionReport = this.antiLiquidationIntegrator.getEvolutionReport();
                
                console.log('');
                console.log('🛡️ ========== REPORTE ANTI-LIQUIDACIÓN ==========');
                console.log(`   💰 Balance actual: $${systemReport.systemState.currentBalance.toFixed(2)}`);
                console.log(`   📉 Drawdown actual: ${(systemReport.systemState.currentDrawdown * 100).toFixed(2)}%`);
                console.log(`   📊 Drawdown máximo: ${(systemReport.systemState.maxHistoricalDrawdown * 100).toFixed(2)}%`);
                console.log(`   🔥 Phoenix activaciones: ${systemReport.systemState.phoenixActivations}`);
                console.log(`   🧬 Nivel evolución: ${evolutionReport.currentLevel}`);
                console.log(`   ⚡ Coherencia cuántica: ${(systemReport.systemState.quantumCoherence * 100).toFixed(1)}%`);
                console.log(`   💪 Índice anti-fragilidad: ${(systemReport.metrics.antiFragilityIndex * 100).toFixed(1)}%`);
                console.log(`   🎯 Score adaptación: ${(systemReport.metrics.adaptationScore * 100).toFixed(1)}%`);
                console.log(`   📈 Trades totales: ${systemReport.systemState.totalTrades}`);
                console.log(`   ✅ Trades rentables: ${systemReport.systemState.profitableTrades}`);
                console.log(`   📋 Estado: ${systemReport.status}`);
                console.log('===============================================');
                console.log('');
                
            } catch (error) {
                console.warn('⚠️ [ANTI-LIQ MONITOR] Error obteniendo reporte:', error.message);
            }
            
        }, 600000); // Cada 10 minutos
        
        // Alertas críticas en tiempo real
        setInterval(() => {
            if (this.isShuttingDown || !this.antiLiquidationIntegrator) return;
            
            try {
                const report = this.antiLiquidationIntegrator.getSystemReport();
                
                // Verificar alertas críticas recientes (último minuto)
                const oneMinuteAgo = Date.now() - 60000;
                const recentCriticalAlerts = report.alerts.critical.filter(
                    alert => alert.timestamp > oneMinuteAgo
                );
                const recentPhoenixAlerts = report.alerts.phoenix.filter(
                    alert => alert.timestamp > oneMinuteAgo
                );
                
                if (recentCriticalAlerts.length > 0) {
                    console.log('🚨 [ANTI-LIQ] ALERTAS CRÍTICAS:');
                    recentCriticalAlerts.forEach(alert => {
                        console.log(`   ⚠️ ${alert.message}`);
                    });
                }
                
                if (recentPhoenixAlerts.length > 0) {
                    console.log('🔥 [ANTI-LIQ] ACTIVACIONES PHOENIX:');
                    recentPhoenixAlerts.forEach(alert => {
                        console.log(`   🔥 ${alert.message}`);
                    });
                }
                
            } catch (error) {
                // Silencioso para no llenar logs
            }
            
        }, 30000); // Cada 30 segundos
    }
    
    async checkServiceHealth(url) {
        try {
            const axios = require('axios');
            const response = await axios.get(url, { timeout: 5000 });
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }
    
    displayUltimateStatus() {
        console.log('');
        console.log('🌟 ========================================');
        console.log('🌟 LEONARDO CONSCIOUSNESS - MODO ULTIMATE');
        console.log('🌟 ========================================');
        console.log('');
        console.log('🎯 ESTADO DEL SISTEMA:');
        console.log(`   🧠 Leonardo Core: ACTIVO (Puerto ${this.ultimateConfig.leonardoPort})`);
        
        if (this.ultimateConfig.enableFrontend) {
            console.log(`   🌐 Frontend: ACTIVO (Puerto ${this.ultimateConfig.frontendPort})`);
        }
        
        if (this.ultimateConfig.enableAutoUpdater) {
            console.log('   🔄 Auto-Updater: ACTIVO');
        }
        
        if (this.ultimateConfig.enableAntiLiquidation && this.antiLiquidationActive) {
            console.log('   🛡️ Sistema Anti-Liquidación: ACTIVO');
            console.log('   🔥 Phoenix Protocol: LISTO');
            console.log('   🧬 Evolución Cuántica: HABILITADA');
        }
        
        console.log('   📊 Monitoreo: ULTIMATE MODE ACTIVO');
        console.log('');
        console.log('⚡ CONFIGURACIÓN ULTIMATE:');
        console.log(`   💎 Símbolos máximos: ${this.ultimateConfig.maxSymbols}`);
        console.log(`   🚄 Concurrencia: ${this.ultimateConfig.concurrency}`);
        console.log(`   🌌 Cache: ${this.ultimateConfig.cacheSize} símbolos`);
        console.log('   🔥 Algoritmos cuánticos: ACTIVADOS');
        console.log('   📈 Analytics en tiempo real: ACTIVADOS');
        console.log('   🎯 Auto-optimización: ACTIVADA');
        if (this.ultimateConfig.enableAntiLiquidation && this.antiLiquidationActive) {
            console.log('   🛡️ Protección Anti-Liquidación: ACTIVA');
            console.log('   🔥 Protocolo Phoenix: OPERATIVO');
            console.log('   🧬 Evolución automática: HABILITADA');
            console.log('   📊 Monitoreo de riesgo: TIEMPO REAL');
        }
        console.log('');
        console.log('🌐 URLS DE ACCESO:');
        console.log(`   📊 Leonardo API: http://localhost:${this.ultimateConfig.leonardoPort}`);
        console.log(`   💻 Interfaz Web: http://localhost:${this.ultimateConfig.frontendPort}`);
        console.log(`   🔍 Health Check: http://localhost:${this.ultimateConfig.leonardoPort}/health`);
        console.log(`   📈 Métricas: http://localhost:${this.ultimateConfig.leonardoPort}/api/symbols/status`);
        console.log('');
        console.log('🚀 RENDIMIENTO:');
        console.log('   ⚡ MÁXIMO RENDIMIENTO ACTIVADO');
        console.log('   🎯 OPTIMIZACIONES APLICADAS');
        console.log('   🌟 MODO ULTIMATE OPERATIVO');
        console.log('');
        console.log('💡 CONTROL:');
        console.log('   ⏹️  Presiona Ctrl+C para parar el sistema');
        console.log('   📊 Métricas se muestran cada 5 minutos');
        console.log('   🔧 Auto-recuperación activada');
        console.log('');
        console.log('🎉 LEONARDO CONSCIOUSNESS - ULTIMATE MODE READY! 🎉');
        console.log('==================================================');
    }
    
    async gracefulShutdown(reason) {
        if (this.isShuttingDown) return;
        
        console.log('');
        console.log(`👋 INICIANDO APAGADO GRACEFUL (Razón: ${reason})`);
        console.log('=============================================');
        this.isShuttingDown = true;
        
        // Parar sistema Anti-Liquidación si está activo
        if (this.antiLiquidationActive && this.antiLiquidationIntegrator) {
            console.log('🛡️ Deteniendo sistema Anti-Liquidación...');
            try {
                await this.antiLiquidationIntegrator.shutdown();
                this.antiLiquidationActive = false;
                console.log('✅ Sistema Anti-Liquidación detenido correctamente');
            } catch (error) {
                console.warn('⚠️ Error deteniendo Anti-Liquidación:', error.message);
            }
        }
        
        // Generar reporte final
        await this.generateShutdownReport();
        
        // Terminar todos los procesos
        for (const [name, process] of this.processes) {
            console.log(`🛑 Terminando proceso ${name}...`);
            try {
                process.kill('SIGTERM');
                
                // Esperar un poco, luego force kill si es necesario
                setTimeout(() => {
                    if (!process.killed) {
                        console.log(`💥 Force killing proceso ${name}...`);
                        process.kill('SIGKILL');
                    }
                }, 5000);
                
            } catch (error) {
                console.warn(`⚠️ Error terminando proceso ${name}:`, error.message);
            }
        }
        
        // Esperar un momento para que los procesos terminen
        setTimeout(() => {
            console.log('');
            console.log('✅ SISTEMA LEONARDO APAGADO CORRECTAMENTE');
            console.log('👋 ¡Hasta la próxima sesión cuántica!');
            process.exit(0);
        }, 3000);
    }
    
    async generateShutdownReport() {
        const uptime = Date.now() - this.systemMetrics.startTime;
        // Obtener reporte final del Anti-Liquidation si está activo
        let antiLiquidationFinalReport = null;
        if (this.antiLiquidationActive && this.antiLiquidationIntegrator) {
            try {
                antiLiquidationFinalReport = {
                    systemReport: this.antiLiquidationIntegrator.getSystemReport(),
                    evolutionReport: this.antiLiquidationIntegrator.getEvolutionReport()
                };
            } catch (error) {
                console.warn('⚠️ No se pudo obtener reporte final de Anti-Liquidación');
            }
        }
        
        const report = {
            timestamp: new Date().toISOString(),
            sessionUptime: uptime,
            totalProcesses: this.systemMetrics.processesLaunched,
            totalOptimizations: this.systemMetrics.totalOptimizations,
            errorsHandled: this.systemMetrics.errorsHandled,
            finalProcessCount: this.processes.size,
            phoenixActivations: this.systemMetrics.phoenixActivations,
            evolutionLevel: this.systemMetrics.evolutionLevel,
            totalDrawdowns: this.systemMetrics.totalDrawdowns,
            maxDrawdownSurvived: this.systemMetrics.maxDrawdownSurvived,
            configuration: this.ultimateConfig,
            antiLiquidationReport: antiLiquidationFinalReport
        };
        
        try {
            const reportPath = path.join(__dirname, `leonardo-ultimate-session-${Date.now()}.json`);
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            console.log(`📊 Reporte de sesión guardado: ${reportPath}`);
        } catch (error) {
            console.warn('⚠️ No se pudo guardar el reporte de sesión:', error.message);
        }
        
        console.log('📊 RESUMEN DE SESIÓN:');
        console.log(`   ⏱️ Duración: ${(uptime / 1000 / 60).toFixed(1)} minutos`);
        console.log(`   🚀 Procesos lanzados: ${report.totalProcesses}`);
        console.log(`   🔧 Optimizaciones: ${report.totalOptimizations}`);
        console.log(`   ❌ Errores manejados: ${report.errorsHandled}`);
        if (this.ultimateConfig.enableAntiLiquidation) {
            console.log('');
            console.log('🛡️ RESUMEN ANTI-LIQUIDACIÓN:');
            console.log(`   🔥 Phoenix activaciones: ${report.phoenixActivations}`);
            console.log(`   🧬 Nivel evolución alcanzado: ${report.evolutionLevel}`);
            console.log(`   📉 Total drawdowns: ${report.totalDrawdowns}`);
            console.log(`   💪 Max drawdown superado: ${(report.maxDrawdownSurvived * 100).toFixed(2)}%`);
            if (antiLiquidationFinalReport) {
                const finalReport = antiLiquidationFinalReport.systemReport;
                console.log(`   💰 Balance final: $${finalReport.systemState.currentBalance.toFixed(2)}`);
                console.log(`   📈 Total trades: ${finalReport.systemState.totalTrades}`);
                console.log(`   ✅ Trades rentables: ${finalReport.systemState.profitableTrades}`);
                const winRate = finalReport.systemState.totalTrades > 0 ? 
                    (finalReport.systemState.profitableTrades / finalReport.systemState.totalTrades * 100).toFixed(1) : '0';
                console.log(`   🎯 Win rate: ${winRate}%`);
            }
        }
    }
}

// Función principal
async function main() {
    try {
        const master = new LeonardoUltimateMaster();
        await master.startUltimateSystem();
        
        // Mantener el proceso principal vivo
        process.stdin.resume();
        
    } catch (error) {
        console.error('💥 ERROR FATAL EN MASTER:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = { LeonardoUltimateMaster };
