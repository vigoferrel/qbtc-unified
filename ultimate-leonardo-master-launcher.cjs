/*
  🚀 ULTIMATE LEONARDO MASTER LAUNCHER
  Lanzador maestro final para Leonardo Consciousness con máximo rendimiento
*/

const { spawn, exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class UltimateLeonardoMasterLauncher {
    constructor() {
        console.log('🚀 ULTIMATE LEONARDO MASTER LAUNCHER');
        console.log('====================================');
        
        this.processes = new Map();
        this.systemMetrics = {
            startTime: Date.now(),
            uptime: 0,
            totalProcesses: 0,
            activeProcesses: 0,
            errors: 0,
            optimizations: 0
        };
        
        this.requiredServices = [
            'leonardo-consciousness',
            'quantum-cache-optimizer',
            'advanced-metrics-collector',
            'auto-recovery-system',
            'symbols-auto-updater',
            'leonardo-frontend'
        ];
        
        this.setupGracefulShutdown();
        this.startSystemMonitoring();
    }
    
    async launchUltimateSystem() {
        console.log('🚀 INICIANDO SISTEMA LEONARDO ULTIMATE');
        console.log('======================================');
        
        try {
            // Paso 1: Optimizar todos los componentes
            await this.optimizeAllComponents();
            
            // Paso 2: Configurar variables de entorno optimales
            await this.setupOptimalEnvironment();
            
            // Paso 3: Lanzar servicios principales
            await this.launchCoreServices();
            
            // Paso 4: Inicializar sistemas avanzados
            await this.initializeAdvancedSystems();
            
            // Paso 5: Realizar validaciones finales
            await this.performFinalValidation();
            
            // Paso 6: Activar monitoreo continuo
            this.startContinuousMonitoring();
            
            console.log('');
            console.log('✅ SISTEMA LEONARDO ULTIMATE LANZADO EXITOSAMENTE');
            console.log('================================================');
            
            this.generateLaunchReport();
            
        } catch (error) {
            console.error('💥 ERROR CRÍTICO EN LANZAMIENTO:', error.message);
            await this.emergencyShutdown();
            process.exit(1);
        }
    }
    
    async optimizeAllComponents() {
        console.log('🔧 OPTIMIZANDO COMPONENTES DEL SISTEMA...');
        
        try {
            // Ejecutar el optimizador de componentes
            const optimizer = new Promise((resolve, reject) => {
                const process = spawn('node', ['advanced-components-optimizer.js'], {
                    stdio: 'inherit',
                    cwd: __dirname
                });
                
                process.on('exit', (code) => {
                    if (code === 0) {
                        console.log('✅ Componentes optimizados exitosamente');
                        resolve();
                    } else {
                        reject(new Error(`Optimización falló con código ${code}`));
                    }
                });
                
                process.on('error', reject);
            });
            
            await optimizer;
            this.systemMetrics.optimizations++;
            
        } catch (error) {
            console.warn('⚠️ Error en optimización de componentes:', error.message);
            // Continuar sin optimización si falla
        }
    }
    
    async setupOptimalEnvironment() {
        console.log('🌐 CONFIGURANDO ENTORNO ÓPTIMO...');
        
        const optimalEnv = {
            // Configuración principal
            TRADING_MODE: 'FUTURES',
            BINANCE_FUTURES_ONLY: 'true',
            BINANCE_TESTNET: 'false',
            REAL_TRADING_ENABLED: 'true',
            SIMULATION_MODE: 'false',
            
            // Configuración de rendimiento
            NODE_ENV: 'production',
            UV_THREADPOOL_SIZE: '128',
            NODE_MAX_OLD_SPACE_SIZE: '8192',
            VERBOSE_LOGGING: 'true',
            
            // Configuración de servicios
            LEONARDO_PORT: '3001',
            FRONTEND_PORT: '3000',
            QUANTUM_CACHE_SIZE: '2000',
            MAX_SYMBOLS: '1000',
            UPDATE_INTERVAL: '900000', // 15 minutos
            
            // Configuración de trading
            MAX_CONCURRENT_OPERATIONS: '50',
            RISK_MANAGEMENT_STRICT: 'true',
            QUANTUM_OPTIMIZATION: 'true',
            FEYNMAN_INTEGRATION: 'true'
        };
        
        // Escribir archivo .env optimizado
        const envContent = Object.entries(optimalEnv)
            .map(([key, value]) => `${key}=${value}`)
            .join('\\n');
        
        await fs.writeFile('.env.ultimate', envContent);
        
        // Cargar variables en process.env
        for (const [key, value] of Object.entries(optimalEnv)) {
            process.env[key] = value;
        }
        
        console.log('✅ Entorno optimizado configurado');
    }
    
    async launchCoreServices() {
        console.log('🏗️ LANZANDO SERVICIOS PRINCIPALES...');
        
        const services = [
            {
                name: 'leonardo-consciousness',
                command: 'node',
                args: ['launch-leonardo-ultimate-master.js'],
                description: 'Leonardo Consciousness Core',
                port: process.env.LEONARDO_PORT,
                critical: true
            },
            {
                name: 'symbols-auto-updater',
                command: 'node',
                args: ['auto-symbols-updater.js'],
                description: 'Actualizador automático de símbolos',
                critical: true
            },
            {
                name: 'leonardo-frontend',
                command: 'node',
                args: ['frontend-unified/leonardo-quantum-api.js'],
                description: 'Dashboard web de Leonardo',
                port: process.env.FRONTEND_PORT,
                critical: false
            }
        ];
        
        for (const service of services) {
            try {
                await this.launchService(service);
                await new Promise(resolve => setTimeout(resolve, 3000)); // Espera entre servicios
            } catch (error) {
                if (service.critical) {
                    throw error;
                } else {
                    console.warn(`⚠️ Servicio no crítico falló: ${service.name}`);
                }
            }
        }
        
        console.log('✅ Servicios principales lanzados');
    }
    
    async launchService(service) {
        console.log(`🚀 Lanzando: ${service.description}...`);
        
        const childProcess = spawn(service.command, service.args, {
            detached: false,
            stdio: ['ignore', 'pipe', 'pipe'],
            cwd: __dirname,
            env: { ...process.env }
        });
        
        this.processes.set(service.name, {
            process: childProcess,
            service,
            startTime: Date.now(),
            status: 'starting'
        });
        
        // Configurar logging
        childProcess.stdout.on('data', (data) => {
            console.log(`[${service.name}] ${data.toString().trim()}`);
        });
        
        childProcess.stderr.on('data', (data) => {
            console.error(`[${service.name}] ERROR: ${data.toString().trim()}`);
        });
        
        childProcess.on('exit', (code, signal) => {
            console.log(`[${service.name}] Proceso terminado - Código: ${code}, Señal: ${signal}`);
            this.handleProcessExit(service.name, code, signal);
        });
        
        childProcess.on('error', (error) => {
            console.error(`[${service.name}] Error en proceso:`, error.message);
            this.systemMetrics.errors++;
        });
        
        // Verificar que el servicio inició correctamente
        await this.waitForServiceReady(service);
        
        this.systemMetrics.totalProcesses++;
        this.systemMetrics.activeProcesses++;
        
        console.log(`✅ ${service.name} iniciado correctamente`);
    }
    
    async waitForServiceReady(service, timeout = 30000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            if (service.port) {
                // Verificar que el puerto esté activo
                try {
                    const response = await this.checkServiceHealth(service.port);
                    if (response) {
                        const processInfo = this.processes.get(service.name);
                        if (processInfo) {
                            processInfo.status = 'running';
                        }
                        return true;
                    }
                } catch (error) {
                    // Servicio aún no listo
                }
            } else {
                // Para servicios sin puerto, asumir que están listos después de 5 segundos
                if (Date.now() - startTime > 5000) {
                    return true;
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        throw new Error(`Timeout esperando que ${service.name} esté listo`);
    }
    
    async checkServiceHealth(port) {
        return new Promise((resolve) => {
            const http = require('http');
            
            const req = http.request({
                hostname: 'localhost',
                port: port,
                path: '/api/health',
                method: 'GET',
                timeout: 2000
            }, (res) => {
                resolve(res.statusCode === 200);
            });
            
            req.on('error', () => resolve(false));
            req.on('timeout', () => {
                req.destroy();
                resolve(false);
            });
            
            req.end();
        });
    }
    
    async initializeAdvancedSystems() {
        console.log('🧠 INICIALIZANDO SISTEMAS AVANZADOS...');
        
        try {
            // Cargar sistema de métricas avanzadas
            require('./advanced-metrics-system.js');
            console.log('✅ Sistema de métricas avanzadas cargado');
            
            // Cargar sistema de auto-recuperación
            require('./auto-recovery-system.js');
            console.log('✅ Sistema de auto-recuperación cargado');
            
            // Esperar a que los sistemas se inicialicen
            await new Promise(resolve => setTimeout(resolve, 2000));
            
        } catch (error) {
            console.warn('⚠️ Error inicializando sistemas avanzados:', error.message);
        }
    }
    
    async performFinalValidation() {
        console.log('🔍 REALIZANDO VALIDACIÓN FINAL...');
        
        const validationResults = {
            services: 0,
            connections: 0,
            configurations: 0
        };
        
        // Validar servicios activos
        for (const [name, processInfo] of this.processes.entries()) {
            if (processInfo.status === 'running') {
                validationResults.services++;
            }
        }
        
        // Validar conexiones críticas
        try {
            const leonardoHealth = await this.checkServiceHealth(process.env.LEONARDO_PORT);
            if (leonardoHealth) validationResults.connections++;
        } catch (error) {
            console.warn('⚠️ Error validando conexión Leonardo');
        }
        
        // Validar configuraciones
        if (process.env.TRADING_MODE === 'FUTURES') validationResults.configurations++;
        if (process.env.BINANCE_FUTURES_ONLY === 'true') validationResults.configurations++;
        if (process.env.REAL_TRADING_ENABLED === 'true') validationResults.configurations++;
        
        console.log(`✅ Validación completa:`);
        console.log(`   🔄 Servicios activos: ${validationResults.services}`);
        console.log(`   🌐 Conexiones válidas: ${validationResults.connections}`);
        console.log(`   ⚙️ Configuraciones correctas: ${validationResults.configurations}`);
        
        if (validationResults.services === 0) {
            throw new Error('No hay servicios activos');
        }
    }
    
    startContinuousMonitoring() {
        console.log('📊 ACTIVANDO MONITOREO CONTINUO...');
        
        // Monitoreo cada 30 segundos
        this.monitoringInterval = setInterval(() => {
            this.performHealthCheck();
        }, 30000);
        
        // Reporte de métricas cada 5 minutos
        this.metricsInterval = setInterval(() => {
            this.generateMetricsReport();
        }, 300000);
        
        console.log('✅ Monitoreo continuo activado');
    }
    
    performHealthCheck() {
        this.systemMetrics.uptime = Date.now() - this.systemMetrics.startTime;
        
        let activeProcesses = 0;
        
        for (const [name, processInfo] of this.processes.entries()) {
            if (processInfo.process && !processInfo.process.killed) {
                activeProcesses++;
            } else if (processInfo.service.critical) {
                console.warn(`🚨 Servicio crítico caído: ${name}`);
                this.restartService(name);
            }
        }
        
        this.systemMetrics.activeProcesses = activeProcesses;
        
        if (activeProcesses === 0) {
            console.error('💥 TODOS LOS SERVICIOS HAN FALLADO');
            this.emergencyShutdown();
        }
    }
    
    async restartService(serviceName) {
        console.log(`🔄 Reiniciando servicio: ${serviceName}`);
        
        const processInfo = this.processes.get(serviceName);
        if (!processInfo) return;
        
        try {
            // Terminar proceso existente
            if (processInfo.process && !processInfo.process.killed) {
                processInfo.process.kill('SIGTERM');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            // Relanzar servicio
            await this.launchService(processInfo.service);
            console.log(`✅ Servicio ${serviceName} reiniciado`);
            
        } catch (error) {
            console.error(`❌ Error reiniciando ${serviceName}:`, error.message);
            this.systemMetrics.errors++;
        }
    }
    
    generateMetricsReport() {
        const uptime = Date.now() - this.systemMetrics.startTime;
        const uptimeHours = (uptime / 1000 / 60 / 60).toFixed(2);
        
        console.log('');
        console.log('📊 REPORTE DE MÉTRICAS DEL SISTEMA');
        console.log('=================================');
        console.log(`⏱️  Uptime: ${uptimeHours} horas`);
        console.log(`🔄 Procesos activos: ${this.systemMetrics.activeProcesses}/${this.systemMetrics.totalProcesses}`);
        console.log(`❌ Errores totales: ${this.systemMetrics.errors}`);
        console.log(`🔧 Optimizaciones: ${this.systemMetrics.optimizations}`);
        console.log(`💾 Memoria utilizada: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`);
        console.log('=================================');
        console.log('');
    }
    
    generateLaunchReport() {
        console.log('');
        console.log('📋 REPORTE DE LANZAMIENTO COMPLETO');
        console.log('=================================');
        console.log(`🚀 Servicios lanzados: ${this.processes.size}`);
        console.log(`⏱️  Tiempo total de inicialización: ${((Date.now() - this.systemMetrics.startTime) / 1000).toFixed(2)}s`);
        console.log('');
        console.log('🌐 SERVICIOS ACTIVOS:');
        
        for (const [name, processInfo] of this.processes.entries()) {
            const status = processInfo.status === 'running' ? '✅' : '⚠️';
            const uptime = ((Date.now() - processInfo.startTime) / 1000).toFixed(0);
            console.log(`   ${status} ${name} (${uptime}s)`);
            
            if (processInfo.service.port) {
                console.log(`      🌐 http://localhost:${processInfo.service.port}`);
            }
        }
        
        console.log('');
        console.log('🔗 ACCESOS PRINCIPALES:');
        console.log(`   🧠 Leonardo Dashboard: http://localhost:${process.env.FRONTEND_PORT}`);
        console.log(`   🔧 Leonardo API: http://localhost:${process.env.LEONARDO_PORT}/api/health`);
        console.log(`   📊 Métricas avanzadas: http://localhost:${process.env.LEONARDO_PORT}/api/advanced/metrics`);
        console.log('');
        console.log('✅ SISTEMA LEONARDO ULTIMATE COMPLETAMENTE OPERATIVO');
        console.log('====================================================');
    }
    
    handleProcessExit(serviceName, code, signal) {
        const processInfo = this.processes.get(serviceName);
        if (!processInfo) return;
        
        processInfo.status = 'stopped';
        this.systemMetrics.activeProcesses--;
        
        if (code !== 0 && processInfo.service.critical) {
            console.error(`💥 Servicio crítico falló: ${serviceName}`);
            this.systemMetrics.errors++;
            
            // Intentar reinicio automático después de 5 segundos
            setTimeout(() => {
                this.restartService(serviceName);
            }, 5000);
        }
    }
    
    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            console.log(`\\n🛑 Recibida señal ${signal}. Iniciando apagado graceful...`);
            
            clearInterval(this.monitoringInterval);
            clearInterval(this.metricsInterval);
            
            await this.shutdownAllServices();
            
            console.log('✅ Sistema apagado correctamente');
            process.exit(0);
        };
        
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGQUIT', () => shutdown('SIGQUIT'));
    }
    
    async shutdownAllServices() {
        console.log('🛑 Apagando todos los servicios...');
        
        const shutdownPromises = [];
        
        for (const [name, processInfo] of this.processes.entries()) {
            if (processInfo.process && !processInfo.process.killed) {
                console.log(`🛑 Apagando ${name}...`);
                
                const shutdownPromise = new Promise((resolve) => {
                    processInfo.process.on('exit', resolve);
                    processInfo.process.kill('SIGTERM');
                    
                    // Force kill después de 10 segundos
                    setTimeout(() => {
                        if (!processInfo.process.killed) {
                            processInfo.process.kill('SIGKILL');
                        }
                        resolve();
                    }, 10000);
                });
                
                shutdownPromises.push(shutdownPromise);
            }
        }
        
        await Promise.all(shutdownPromises);
        console.log('✅ Todos los servicios apagados');
    }
    
    async emergencyShutdown() {
        console.error('🚨 APAGADO DE EMERGENCIA ACTIVADO');
        
        for (const [name, processInfo] of this.processes.entries()) {
            if (processInfo.process && !processInfo.process.killed) {
                try {
                    processInfo.process.kill('SIGKILL');
                    console.log(`💥 ${name} terminado forzosamente`);
                } catch (error) {
                    console.error(`❌ Error terminando ${name}:`, error.message);
                }
            }
        }
    }
    
    startSystemMonitoring() {
        // Monitoreo básico de recursos del sistema
        setInterval(() => {
            const memUsage = process.memoryUsage();
            const heapPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;
            
            if (heapPercentage > 90) {
                console.warn('⚠️ Uso de memoria crítico:', heapPercentage.toFixed(2) + '%');
            }
        }, 60000); // Cada minuto
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    const launcher = new UltimateLeonardoMasterLauncher();
    
    launcher.launchUltimateSystem()
        .catch((error) => {
            console.error('💥 ERROR FATAL:', error.message);
            console.error(error.stack);
            process.exit(1);
        });
}

module.exports = { UltimateLeonardoMasterLauncher };
