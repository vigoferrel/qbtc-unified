#!/usr/bin/env node

// ========================================================================
// 🔍 QUANTUM SYSTEM BACKGROUND CHECKER
// Verificación exhaustiva del sistema QBTC en segundo plano
// ========================================================================

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const http = require('http');

class BackgroundSystemChecker {
    constructor() {
        this.baseDir = path.join(__dirname, '..');
        this.criticalServices = [
            {
                name: 'UnifiedHttpServer',
                port: 18020,
                file: path.join(this.baseDir, 'quantum-core', 'UnifiedHttpServer.js'),
                healthEndpoint: '/unified/health'
            },
            {
                name: 'QuantumUnifiedCore',
                port: 18021,
                file: path.join(this.baseDir, 'quantum-core', 'QuantumUnifiedCore.js'),
                dependencies: ['UnifiedHttpServer']
            },
            {
                name: 'UniversalSymbolMonitor',
                port: 18022,
                file: path.join(this.baseDir, 'quantum-core', 'UniversalSymbolMonitor.js'),
                dependencies: ['QuantumUnifiedCore']
            },
            {
                name: 'QuantumMonitoring',
                port: 18023,
                file: path.join(this.baseDir, 'quantum-core', 'QuantumMonitoring.js'),
                dependencies: ['UniversalSymbolMonitor']
            }
        ];

        this.quantumConfig = path.join(this.baseDir, 'quantum-core', 'config', 'quantum-unified.json');
        this.services = new Map();
        this.healthChecks = new Map();
    }

    async verifyFiles() {
        console.log('\n🔍 Verificando archivos del sistema...');
        
        for (const service of this.criticalServices) {
            try {
                await fs.access(service.file);
                console.log(`✅ ${service.name}: Archivo encontrado`);
            } catch (error) {
                console.error(`❌ ${service.name}: Archivo no encontrado - ${service.file}`);
                return false;
            }
        }

        // Verificar configuración
        try {
            await fs.access(this.quantumConfig);
            const config = require(this.quantumConfig);
            console.log('✅ Configuración cuántica verificada');
        } catch (error) {
            console.error('❌ Error en configuración cuántica:', error.message);
            return false;
        }

        return true;
    }

    async verifyPorts() {
        console.log('\n🔍 Verificando puertos...');
        
        for (const service of this.criticalServices) {
            const available = await this.checkPort(service.port);
            if (!available) {
                console.error(`❌ Puerto ${service.port} para ${service.name} no está disponible`);
                return false;
            }
            console.log(`✅ Puerto ${service.port} disponible para ${service.name}`);
        }

        return true;
    }

    async checkPort(port) {
        return new Promise((resolve) => {
            const server = http.createServer();
            server.on('error', () => resolve(false));
            server.on('listening', () => {
                server.close(() => resolve(true));
            });
            server.listen(port);
        });
    }

    async verifyDependencies() {
        console.log('\n🔍 Verificando dependencias...');
        
        try {
            require('express');
            console.log('✅ Express: Instalado');
        } catch (error) {
            console.log('⚠️ Express: No encontrado (opcional)');
        }

        try {
            require('ws');
            console.log('✅ WebSocket: Instalado');
        } catch (error) {
            console.log('⚠️ WebSocket: No encontrado (opcional)');
        }

        return true;
    }

    async startServiceInBackground(service) {
        console.log(`\n🚀 Iniciando ${service.name} en segundo plano...`);
        
        return new Promise((resolve, reject) => {
            const process = spawn('node', [service.file], {
                detached: true,
                stdio: 'ignore'
            });

            process.unref();
            this.services.set(service.name, process);

            // Verificar si el servicio inicia correctamente
            setTimeout(async () => {
                if (service.healthEndpoint) {
                    const health = await this.checkServiceHealth(service);
                    if (health) {
                        console.log(`✅ ${service.name}: Iniciado y saludable`);
                        resolve(true);
                    } else {
                        console.error(`❌ ${service.name}: Error de inicio`);
                        resolve(false);
                    }
                } else {
                    console.log(`✅ ${service.name}: Proceso iniciado`);
                    resolve(true);
                }
            }, 2000);
        });
    }

    async checkServiceHealth(service) {
        return new Promise((resolve) => {
            const req = http.get(`http://localhost:${service.port}${service.healthEndpoint}`, {
                timeout: 5000
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const health = JSON.parse(data);
                        resolve(health.status === 'ok' || health.status === 'running');
                    } catch {
                        resolve(false);
                    }
                });
            });

            req.on('error', () => resolve(false));
            req.on('timeout', () => {
                req.destroy();
                resolve(false);
            });
        });
    }

    async startAllInBackground() {
        console.log('🌟 Iniciando verificación exhaustiva del sistema en segundo plano...');

        // 1. Verificar archivos
        const filesOk = await this.verifyFiles();
        if (!filesOk) {
            throw new Error('Verificación de archivos falló');
        }

        // 2. Verificar puertos
        const portsOk = await this.verifyPorts();
        if (!portsOk) {
            throw new Error('Verificación de puertos falló');
        }

        // 3. Verificar dependencias
        const depsOk = await this.verifyDependencies();
        if (!depsOk) {
            throw new Error('Verificación de dependencias falló');
        }

        // 4. Iniciar servicios en orden
        console.log('\n🚀 Iniciando servicios en segundo plano...');
        
        for (const service of this.criticalServices) {
            // Esperar dependencias
            if (service.dependencies) {
                for (const dep of service.dependencies) {
                    if (!this.services.has(dep)) {
                        console.error(`❌ Dependencia ${dep} no disponible para ${service.name}`);
                        throw new Error(`Dependencia faltante: ${dep}`);
                    }
                }
            }

            const started = await this.startServiceInBackground(service);
            if (!started) {
                throw new Error(`Error iniciando ${service.name}`);
            }
        }

        // 5. Iniciar monitoreo de salud
        this.startHealthMonitoring();

        console.log('\n✨ Sistema iniciado en segundo plano');
        console.log('📊 Monitoreo de salud activo');
        console.log('🎯 Endpoints disponibles:');
        console.log(`   - Dashboard: http://localhost:18020`);
        console.log(`   - Monitor: http://localhost:18020/quantum-monitor`);
        console.log(`   - Health: http://localhost:18020/health`);
    }

    startHealthMonitoring() {
        setInterval(async () => {
            for (const service of this.criticalServices) {
                if (service.healthEndpoint) {
                    const health = await this.checkServiceHealth(service);
                    this.healthChecks.set(service.name, {
                        status: health ? 'healthy' : 'unhealthy',
                        lastCheck: new Date()
                    });
                }
            }
        }, 5000);
    }

    async stopAll() {
        console.log('\n🛑 Deteniendo servicios...');
        
        for (const [name, process] of this.services) {
            try {
                process.kill();
                console.log(`✅ ${name}: Detenido`);
            } catch (error) {
                console.error(`❌ Error deteniendo ${name}:`, error.message);
            }
        }

        this.services.clear();
        this.healthChecks.clear();
    }

    getSystemStatus() {
        return {
            services: Array.from(this.services.keys()),
            health: Object.fromEntries(this.healthChecks),
            startTime: this.startTime,
            uptime: process.uptime()
        };
    }
}

// Si se ejecuta directamente
if (require.main === module) {
    const checker = new BackgroundSystemChecker();
    
    // Manejar señales de cierre
    process.on('SIGINT', async () => {
        console.log('\n🛑 Recibida señal de cierre...');
        await checker.stopAll();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('\n🛑 Recibida señal de terminación...');
        await checker.stopAll();
        process.exit(0);
    });

    // Iniciar verificación
    checker.startAllInBackground()
        .then(() => {
            console.log('\n✅ Sistema verificado y ejecutándose en segundo plano');
            console.log('📝 Presiona Ctrl+C para detener');
        })
        .catch(error => {
            console.error('\n❌ Error durante la verificación:', error.message);
            checker.stopAll().then(() => process.exit(1));
        });
}

module.exports = { BackgroundSystemChecker };
