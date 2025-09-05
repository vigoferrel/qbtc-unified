#!/usr/bin/env node

// ========================================================================
// 🚀 QBTC-UNIFIED QUANTUM SYSTEM START SCRIPT 
// Script de inicio unificado para todo el sistema cuántico
// Ejecuta: node start.js
// ========================================================================

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { getUnifiedServer } = require('./quantum-core/UnifiedServerWrapper');

class UnifiedSystemStarter {
    constructor() {
        this.services = [];
        this.serviceStatus = new Map();
        this.retryAttempts = new Map();
        this.maxRetries = 3;
        this.restartDelay = 5000;
        this.healthCheckInterval = 2000; // 2 segundos entre health checks
        
        // Cargar configuración unificada
        this.config = require('./quantum-core/config/quantum-unified.json');
        
        // Configuración por defecto optimizada
        this.config.port = process.env.QUANTUM_PORT || process.env.PORT || 18020;
        this.config.initialBalance = parseFloat(process.env.INITIAL_BALANCE) || 10000;
        this.config.autoTrading = process.env.AUTO_TRADING !== 'false';
        
        // Configurar señales de salida
        process.on('SIGINT', () => this.stopAll('SIGINT'));
        process.on('SIGTERM', () => this.stopAll('SIGTERM'));
    }

async startService(serviceName, command, args, dependencies = []) {
        // Verificar que las dependencias estén listas
        for (const dep of dependencies) {
            if (!this.serviceStatus.get(dep)) {
                console.log(`🔄 Esperando dependencia ${dep} para iniciar ${serviceName}...`);
                await this.waitForDependency(dep);
            }
        }

        return new Promise(async (resolve, reject) => {
            console.log(`🚀 Iniciando ${serviceName}...`);
            
            // Verificar puerto antes de iniciar servicio
            const servicePort = this.getServicePort(serviceName);
            if (servicePort) {
                const portChecker = new (require('./scripts/health-checker').HealthChecker)();
                const portAvailable = await portChecker.checkPort(servicePort);
                if (!portAvailable) {
                    const error = new Error(`Puerto ${servicePort} no está disponible para ${serviceName}`);
                    console.error('❌', error.message);
                    return reject(error);
                }
            }
            
            const process = spawn('node', [command, ...args], {
                stdio: 'inherit',
                cwd: path.dirname(command)
            });

            const serviceInfo = { 
                name: serviceName, 
                process,
                port: servicePort,
                startTime: Date.now()
            };
            this.services.push(serviceInfo);
            
            process.on('error', (error) => {
                console.error(`❌ Error iniciando ${serviceName}:`, error);
                this.serviceStatus.set(serviceName, false);
                this.handleServiceFailure(serviceName, command, args, dependencies);
                reject(error);
            });

            process.on('exit', (code) => {
                if (code !== 0) {
                    console.error(`❌ ${serviceName} se detuvo con código ${code}`);
                    this.serviceStatus.set(serviceName, false);
                    this.handleServiceFailure(serviceName, command, args, dependencies);
                }
            });

            // Verificar salud del servicio antes de marcarlo como iniciado
            try {
                if (servicePort) {
                    await this.verifyServiceHealth(serviceName, servicePort);
                }
                this.serviceStatus.set(serviceName, true);
                console.log(`✅ ${serviceName} iniciado y verificado correctamente`);
                resolve(serviceInfo);
            } catch (error) {
                console.error(`❌ Error verificando salud de ${serviceName}:`, error.message);
                this.handleServiceFailure(serviceName, command, args, dependencies);
                reject(error);
            }
        });
    }

    async waitForDependency(dependencyName, timeout = 30000) {
        const startTime = Date.now();
        while (!this.serviceStatus.get(dependencyName)) {
            if (Date.now() - startTime > timeout) {
                throw new Error(`⏰ Timeout esperando dependencia ${dependencyName}`);
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    async handleServiceFailure(serviceName, command, args, dependencies) {
        const attempts = this.retryAttempts.get(serviceName) || 0;
        if (attempts < this.maxRetries) {
            console.log(`🔄 Reintentando ${serviceName} (Intento ${attempts + 1}/${this.maxRetries})`);
            this.retryAttempts.set(serviceName, attempts + 1);
            await new Promise(resolve => setTimeout(resolve, this.restartDelay));
            await this.startService(serviceName, command, args, dependencies);
        } else {
            console.error(`❌ ${serviceName} falló después de ${this.maxRetries} intentos. Deteniendo sistema.`);
            this.stopAll();
        }
    }

    stopAll() {
        console.log('⛔ Deteniendo todos los servicios...');
        for (const service of this.services) {
            if (service.process) {
                service.process.kill();
            }
        }
        process.exit(1);
    }

    // Mapeo de servicios a puertos
    getServicePort(serviceName) {
        const portMap = {
            'UnifiedHttpServer': 18020,
            'QuantumUnifiedCore': 18021,
            'UniversalSymbolMonitor': 18022,
            'QuantumMonitoring': 18023
        };
        return portMap[serviceName];
    }

    // Verificar salud del servicio vía HTTP
    async verifyServiceHealth(serviceName, port, maxRetries = 15) {
        const healthChecker = new (require('./scripts/health-checker').HealthChecker)();
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                const health = await healthChecker.verifyHttpEndpoint(port);
                if (health) {
                    return true;
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        throw new Error(`Servicio ${serviceName} no respondió a health check después de ${maxRetries} intentos`);
    }

    async startAll() {
        try {
            // Verificar sistema antes de iniciar
const healthChecker = new (require('./scripts/system-health').SystemHealthChecker)(this.config);
            const systemReady = await healthChecker.checkSystem();
            
            if (!systemReady) {
                throw new Error('Sistema no cumple requisitos mínimos para iniciar');
            }
            console.log('🌊 Iniciando QBTC-UNIFIED QUANTUM SYSTEM...');
            console.log('💰 Configuración de profit maximizado:');
            console.log(`   💵 Balance inicial: $${this.config.initialBalance.toLocaleString()}`);
            console.log(`   🤖 Auto-trading: ${this.config.autoTrading ? 'ACTIVADO' : 'DESACTIVADO'}`);
            console.log(`   🌐 Puerto unificado: ${this.config.port}`);
            console.log('');

            // === FLUJO LEONARDO CORREGIDO - ARQUITECTURA CUÁNTICA ===
            
            // 1. Iniciar UnifiedHttpServer SIN workflow (base)
            console.log('🚀 Iniciando UnifiedHttpServer (base)...');
            try {
                const unifiedServer = getUnifiedServer();
                await unifiedServer.initialize(this.config);
                await unifiedServer.start();
                console.log('⚡ UnifiedHttpServer base iniciado correctamente');
                
                // Verificar salud del servidor
                await this.verifyServiceHealth('UnifiedHttpServer', this.config.port);
                this.serviceStatus.set('UnifiedHttpServer', true);
                console.log('✅ UnifiedHttpServer base iniciado y verificado');
            } catch (error) {
                console.error('❌ Error iniciando UnifiedHttpServer:', error);
                throw error;
            }

            // 2. Iniciar QuantumUnifiedCore DESPUÉS del servidor
            await this.startService(
                'QuantumUnifiedCore',
                path.join(__dirname, 'quantum-core', 'QuantumUnifiedCore.js'),
                [JSON.stringify(this.config)],
                ['UnifiedHttpServer']
            );

            // 2. Iniciar Servicios de Datos y Monitoreo
            await this.startService(
                'UniversalSymbolMonitor',
                path.join(__dirname, 'quantum-core', 'UniversalSymbolMonitor.js'),
                // Pass empty array since binanceConnector will be initialized later in service
                ['null'],
                ['QuantumUnifiedCore']
            );

            await this.startService(
                'QuantumMonitoring',
                path.join(__dirname, 'quantum-core', 'QuantumMonitoring.js'),
                [JSON.stringify(this.config)],
                ['UniversalSymbolMonitor']
            );

            // 3. Iniciar Trading y Market Making
            await this.startService(
                'QuantumMarketMaker',
                path.join(__dirname, 'quantum-core', 'QuantumMarketMaker.js'),
                [JSON.stringify(this.config)],
                ['QuantumUnifiedCore', 'UniversalSymbolMonitor']
            );

            // 4. Iniciar Leonardo Consciousness en sus configuraciones
            const leonardoConfigs = ['Conservative', 'Balanced', 'Aggressive', 'BigBang'];
            for (const configName of leonardoConfigs) {
                await this.startService(
                    `LeonardoConsciousness-${configName}`,
                    path.join(__dirname, 'leonardo-consciousness', 'start-leonardo.js'),
                    [configName],
                    ['QuantumMarketMaker', 'QuantumMonitoring']
                );
            }

            console.log('');
            console.log('🎯 ========================================');
            console.log('🎯 QBTC-UNIFIED QUANTUM SYSTEM ACTIVADO');
            console.log('🎯 ========================================');
            console.log(`🌐 Dashboard Principal: http://localhost:${this.config.port}`);
            console.log(`📊 Quantum Monitor: http://localhost:${this.config.port}/quantum-monitor`);
            console.log(`🧠 Leonardo Dashboard: http://localhost:${this.config.port}/leonardo-consciousness`);
            console.log('🔥 Sistema cuántico unificado optimizado');
            console.log('🎯 ========================================');
            console.log('');

            if (this.config.autoTrading) {
                console.log('⚡ AUTO-TRADING QUANTUM ACTIVADO');
                console.log('💎 Motor cuántico analizando mercado');
                console.log('🎣 Sistema de trading optimizado');
                console.log('');
            }

            // Setup graceful shutdown
            process.on('SIGINT', () => this.stopAll());
            process.on('SIGTERM', () => this.stopAll());

        } catch (error) {
            console.error('❌ ERROR CRÍTICO:', error.message);
            this.stopAll();
        }
    }
}

// Iniciar el sistema unificado
const starter = new UnifiedSystemStarter();
starter.startAll().catch(error => {
    console.error('❌ Error iniciando el sistema:', error);
    process.exit(1);
});
