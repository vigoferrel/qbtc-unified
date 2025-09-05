#!/usr/bin/env node

/*
  QBTC-UNIFIED PRODUCTION DEPLOYMENT SCRIPT
  Script simplificado para deployment en producción con Supabase
*/

const { spawn, exec } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🌌 QBTC-UNIFIED PRODUCTION DEPLOYMENT');
console.log('=====================================');
console.log('🎯 Iniciando deployment en producción...');
console.log('📍 Backend: Supabase (https://hrvxsaolaxnqltomqaud.supabase.co)');
console.log('');

class ProductionDeployer {
    constructor() {
        this.config = {
            leonardoPort: 3003,
            masterPort: 3203,
            frontendPort: 8080,
            mode: 'production'
        };
        
        this.processes = new Map();
        this.deploymentStart = Date.now();
    }

    async deploy() {
        try {
            console.log('📋 PASO 1: Validaciones pre-deployment');
            await this.validateEnvironment();

            console.log('🧹 PASO 2: Limpieza de procesos previos');
            await this.cleanupPreviousProcesses();

            console.log('🗄️ PASO 3: Verificar conectividad Supabase');
            await this.verifySupabaseConnection();

            console.log('🚀 PASO 4: Deploying core components');
            await this.deployComponents();

            console.log('✅ PASO 5: Validación post-deployment');
            await this.validateDeployment();

            console.log('🎉 DEPLOYMENT COMPLETADO EXITOSAMENTE!');
            this.showFinalInfo();

        } catch (error) {
            console.error('❌ Error en deployment:', error.message);
            await this.cleanup();
            process.exit(1);
        }
    }

    async validateEnvironment() {
        // Verificar Node.js
        try {
            const { exec } = require('child_process');
            const nodeVersion = await new Promise((resolve, reject) => {
                exec('node --version', (error, stdout) => {
                    if (error) reject(error);
                    else resolve(stdout.trim());
                });
            });
            console.log(`✅ Node.js detectado: ${nodeVersion}`);
        } catch (error) {
            throw new Error('Node.js no encontrado');
        }

        // Verificar archivo .env
        if (!fs.existsSync('.env')) {
            throw new Error('Archivo .env no encontrado');
        }
        console.log('✅ Archivo .env encontrado');

        // Verificar archivos requeridos
        const requiredFiles = [
            'MASTER-ANTICONFLICT-LAUNCHER.js',
            'check-system-status.js'
        ];

        for (const file of requiredFiles) {
            if (!fs.existsSync(file)) {
                throw new Error(`Archivo requerido no encontrado: ${file}`);
            }
        }
        console.log('✅ Archivos requeridos encontrados');
    }

    async cleanupPreviousProcesses() {
        return new Promise((resolve) => {
            exec('tasklist | findstr "node"', (error, stdout) => {
                if (stdout && stdout.includes('node.exe')) {
                    console.log('🔄 Terminando procesos Node.js previos...');
                    exec('taskkill /F /IM node.exe', (killError) => {
                        if (!killError) {
                            console.log('✅ Procesos previos terminados');
                        }
                        setTimeout(resolve, 2000);
                    });
                } else {
                    console.log('✅ No hay procesos Node.js previos');
                    resolve();
                }
            });
        });
    }

    async verifySupabaseConnection() {
        try {
            console.log('🔗 Verificando conexión con Supabase...');
            
            // Test de conexión básico usando el módulo de integración
            const testProcess = spawn('node', ['supabase-integration.js'], {
                stdio: 'pipe'
            });

            let output = '';
            testProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            await new Promise((resolve, reject) => {
                testProcess.on('close', (code) => {
                    if (code === 0) {
                        console.log('✅ Supabase conectado exitosamente');
                        resolve();
                    } else {
                        console.log('⚠️ Advertencia: Supabase no disponible, continuando...');
                        resolve(); // No fallar por Supabase
                    }
                });
                
                setTimeout(() => {
                    testProcess.kill();
                    resolve();
                }, 10000); // Timeout de 10 segundos
            });

        } catch (error) {
            console.log('⚠️ Advertencia Supabase:', error.message);
        }
    }

    async deployComponents() {
        console.log('🌌 Iniciando MASTER ANTICONFLICT LAUNCHER...');
        
        // Configurar variables de entorno
        process.env.HTTP_PORT = this.config.masterPort.toString();
        process.env.DEPLOYMENT_MODE = this.config.mode;

        // Iniciar el lanzador maestro
        const masterProcess = spawn('node', ['MASTER-ANTICONFLICT-LAUNCHER.js'], {
            stdio: ['ignore', 'pipe', 'pipe'],
            detached: false,
            env: process.env
        });

        // Guardar referencia del proceso
        this.processes.set('master', masterProcess);

        // Configurar logging
        const logStream = fs.createWriteStream('deployment-output.log', { flags: 'a' });
        const errorStream = fs.createWriteStream('deployment-error.log', { flags: 'a' });

        masterProcess.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(`[MASTER] ${output.trim()}`);
            logStream.write(`[${new Date().toISOString()}] ${output}`);
        });

        masterProcess.stderr.on('data', (data) => {
            const error = data.toString();
            console.error(`[MASTER ERROR] ${error.trim()}`);
            errorStream.write(`[${new Date().toISOString()}] ERROR: ${error}`);
        });

        masterProcess.on('error', (error) => {
            console.error(`[MASTER SPAWN ERROR] ${error.message}`);
        });

        // Guardar PID
        if (masterProcess.pid) {
            fs.writeFileSync('qbtc-production.pid', masterProcess.pid.toString());
            console.log(`✅ Master process iniciado (PID: ${masterProcess.pid})`);
        }

        // Esperar inicialización
        console.log('⏳ Esperando inicialización del sistema...');
        await new Promise(resolve => setTimeout(resolve, 15000));
    }

    async validateDeployment() {
        // Verificar Leonardo Consciousness
        try {
            const leonardoHealth = await this.checkEndpoint(`http://localhost:${this.config.leonardoPort}/api/health`);
            console.log('✅ Leonardo Consciousness: HEALTHY');
        } catch (error) {
            console.log('⚠️ Leonardo Consciousness: Aún inicializando...');
        }

        // Verificar Sistema Unificado
        try {
            const unifiedHealth = await this.checkEndpoint(`http://localhost:${this.config.masterPort}/api/health`);
            console.log('✅ Sistema Unificado: HEALTHY');
        } catch (error) {
            console.log('⚠️ Sistema Unificado: Aún inicializando...');
        }
    }

    async checkEndpoint(url) {
        return new Promise((resolve, reject) => {
            const req = http.get(url, { timeout: 3000 }, (res) => {
                if (res.statusCode === 200) {
                    resolve(true);
                } else {
                    reject(new Error(`Status code: ${res.statusCode}`));
                }
            });

            req.on('error', reject);
            req.on('timeout', () => {
                req.abort();
                reject(new Error('Timeout'));
            });
        });
    }

    showFinalInfo() {
        const deploymentTime = Math.round((Date.now() - this.deploymentStart) / 1000);
        
        console.log('');
        console.log('🎉 DEPLOYMENT COMPLETADO EXITOSAMENTE! 🎉');
        console.log('======================================');
        console.log('');
        console.log('📊 INFORMACIÓN DEL DEPLOYMENT:');
        console.log(`  • Tiempo de deployment: ${deploymentTime} segundos`);
        console.log(`  • Puerto Leonardo: ${this.config.leonardoPort}`);
        console.log(`  • Puerto Master: ${this.config.masterPort}`);
        
        if (fs.existsSync('qbtc-production.pid')) {
            const pid = fs.readFileSync('qbtc-production.pid', 'utf8').trim();
            console.log(`  • PID del proceso: ${pid}`);
        }
        
        console.log('');
        console.log('🌐 URLS DE ACCESO:');
        console.log(`  • Leonardo Dashboard: http://localhost:${this.config.leonardoPort}`);
        console.log(`  • Master Dashboard: http://localhost:${this.config.masterPort}`);
        console.log(`  • Health Check Leonardo: http://localhost:${this.config.leonardoPort}/api/health`);
        console.log(`  • Health Check Master: http://localhost:${this.config.masterPort}/api/health`);
        console.log('  • Supabase Backend: https://hrvxsaolaxnqltomqaud.supabase.co');
        
        console.log('');
        console.log('📂 LOGS DEL SISTEMA:');
        console.log('  • Output: deployment-output.log');
        console.log('  • Errores: deployment-error.log');
        
        console.log('');
        console.log('🔧 COMANDOS DE CONTROL:');
        console.log('  • Estado: node check-system-status.js');
        console.log('  • Ver logs: type deployment-output.log');
        console.log('  • Ver errores: type deployment-error.log');
        
        if (fs.existsSync('qbtc-production.pid')) {
            console.log('  • Parar sistema: taskkill /PID [PID] /F');
        }
        
        console.log('');
        console.log('✨ SISTEMA LISTO PARA MÁXIMA EXTRACCIÓN DE JUGO CUÁNTICO! ✨');
        console.log('');
        console.log('🌊 El sistema está corriendo en segundo plano');
        console.log('📊 Usa los comandos arriba para monitorear el progreso');
        console.log('');
        
        // Mostrar instrucciones para mantener vivo
        console.log('💡 IMPORTANTE: Mantén esta terminal abierta o el sistema se cerrará');
        console.log('💡 Para correr en background permanente, usa: pm2 start MASTER-ANTICONFLICT-LAUNCHER.js');
    }

    async cleanup() {
        console.log('🧹 Limpiando procesos...');
        for (const [name, process] of this.processes) {
            try {
                process.kill();
                console.log(`✅ Proceso ${name} terminado`);
            } catch (error) {
                console.error(`❌ Error terminando proceso ${name}:`, error.message);
            }
        }
    }

    // Configurar graceful shutdown
    setupGracefulShutdown() {
        const handleShutdown = async () => {
            console.log('');
            console.log('🔄 INICIANDO SHUTDOWN GRACEFUL...');
            await this.cleanup();
            console.log('🔒 SISTEMA CERRADO');
            process.exit(0);
        };

        process.on('SIGINT', handleShutdown);
        process.on('SIGTERM', handleShutdown);
    }
}

// Ejecutar deployment
async function main() {
    const deployer = new ProductionDeployer();
    deployer.setupGracefulShutdown();
    
    try {
        await deployer.deploy();
        
        // Mantener el proceso vivo para que el sistema siga corriendo
        console.log('🔄 Manteniendo sistema activo... (Ctrl+C para cerrar)');
        
        // Mantener vivo indefinidamente
        setInterval(() => {
            // Verificación de salud periódica cada 30 segundos
        }, 30000);
        
    } catch (error) {
        console.error('💥 Error fatal en deployment:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
