#!/usr/bin/env node

/**
 * QBTC UNIFIED - Lanzador Local
 * Sistema unificado con filosofía "futuros-only" y edge cuántico aislado
 */

const path = require('path');
const { spawn } = require('child_process');

// Configuración del sistema
const CONFIG = {
    server: {
        script: path.join(__dirname, '..', 'qbtc-core', 'server', 'QBTCServer.js'),
        port: 18020,
        name: 'QBTC-Server'
    },
    colors: {
        reset: '\x1b[0m',
        bright: '\x1b[1m',
        dim: '\x1b[2m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m'
    }
};

class QBTCLauncher {
    constructor() {
        this.processes = new Map();
        this.isShuttingDown = false;
        
        // Manejo de señales de terminación
        process.on('SIGINT', () => this.shutdown('SIGINT'));
        process.on('SIGTERM', () => this.shutdown('SIGTERM'));
        process.on('exit', () => this.cleanup());
    }

    log(message, color = 'reset') {
        const timestamp = new Date().toISOString().substring(11, 23);
        const colorCode = CONFIG.colors[color] || CONFIG.colors.reset;
        console.log(`${colorCode}[${timestamp}] ${message}${CONFIG.colors.reset}`);
    }

    async launch() {
        this.log('🚀 QBTC UNIFIED - Iniciando sistema...', 'cyan');
        this.log('📊 Filosofía: Futuros-only con edge cuántico aislado', 'blue');
        
        try {
            // Verificar que el archivo del servidor existe
            const fs = require('fs');
            if (!fs.existsSync(CONFIG.server.script)) {
                throw new Error(`Servidor no encontrado: ${CONFIG.server.script}`);
            }

            // Lanzar servidor unificado
            await this.startServer();
            
            // Mostrar información de acceso
            this.showAccessInfo();
            
            // Mantener el proceso vivo
            this.keepAlive();
            
        } catch (error) {
            this.log(`❌ Error al iniciar: ${error.message}`, 'red');
            process.exit(1);
        }
    }

    async startServer() {
        return new Promise((resolve, reject) => {
            this.log('🔧 Iniciando servidor unificado...', 'yellow');
            
            const serverProcess = spawn('node', [CONFIG.server.script], {
                stdio: ['inherit', 'pipe', 'pipe'],
                env: {
                    ...process.env,
                    NODE_ENV: 'development',
                    QBTC_MODE: 'local',
                    QBTC_PORT: CONFIG.server.port.toString()
                }
            });

            // Capturar salida del servidor
            serverProcess.stdout.on('data', (data) => {
                const output = data.toString().trim();
                if (output) {
                    this.log(`[${CONFIG.server.name}] ${output}`, 'green');
                    
                    // Detectar cuando el servidor está listo
                    if (output.includes('Server running') || output.includes('listening')) {
                        resolve();
                    }
                }
            });

            serverProcess.stderr.on('data', (data) => {
                const error = data.toString().trim();
                if (error) {
                    this.log(`[${CONFIG.server.name}] ERROR: ${error}`, 'red');
                }
            });

            serverProcess.on('close', (code) => {
                if (!this.isShuttingDown) {
                    this.log(`[${CONFIG.server.name}] Proceso terminado con código: ${code}`, 'red');
                    if (code !== 0) {
                        reject(new Error(`Servidor falló con código: ${code}`));
                    }
                }
            });

            serverProcess.on('error', (error) => {
                this.log(`[${CONFIG.server.name}] Error de proceso: ${error.message}`, 'red');
                reject(error);
            });

            // Guardar referencia del proceso
            this.processes.set('server', serverProcess);
            
            // Timeout para resolver si no hay confirmación explícita
            setTimeout(() => {
                if (serverProcess.pid) {
                    this.log('✅ Servidor iniciado (timeout alcanzado)', 'green');
                    resolve();
                }
            }, 3000);
        });
    }

    showAccessInfo() {
        this.log('', 'reset');
        this.log('🎯 SISTEMA LANZADO EXITOSAMENTE', 'bright');
        this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'dim');
        this.log('', 'reset');
        
        // URLs de acceso
        this.log('🌐 ACCESOS:', 'cyan');
        this.log(`   Frontend: http://localhost:${CONFIG.server.port}/`, 'blue');
        this.log(`   API Health: http://localhost:${CONFIG.server.port}/api/health`, 'blue');
        this.log(`   Métricas: http://localhost:${CONFIG.server.port}/api/metrics`, 'blue');
        this.log(`   Edge Summary: http://localhost:${CONFIG.server.port}/api/edge/summary`, 'blue');
        this.log('', 'reset');
        
        // Comandos de verificación
        this.log('🔍 VERIFICACIÓN RÁPIDA:', 'cyan');
        this.log(`   curl http://localhost:${CONFIG.server.port}/api/health`, 'yellow');
        this.log(`   curl http://localhost:${CONFIG.server.port}/api/edge/summary`, 'yellow');
        this.log('', 'reset');
        
        // Arquitectura
        this.log('🏗️ ARQUITECTURA AISLADA:', 'cyan');
        this.log('   ✓ FuturesEdgeService (SSOT)', 'green');
        this.log('   ✓ FuturesQuantumEdgeEngine (microestructura + path-integrals)', 'green');
        this.log('   ✓ QBTCMetricsEngine (métricas centralizadas)', 'green');
        this.log('   ✓ Trading/Decision engines (consumiendo servicio)', 'green');
        this.log('   ✓ API + Frontend integrados', 'green');
        this.log('', 'reset');
        
        // Filosofía
        this.log('🔮 FILOSOFÍA FUTUROS-ONLY:', 'magenta');
        this.log('   • Edge cuántico de microestructura', 'blue');
        this.log('   • OFI, CVD, funding rates, open interest', 'blue');
        this.log('   • Kyle\'s lambda, liquidation density', 'blue');
        this.log('   • Path-integrals de Feynman', 'blue');
        this.log('   • Sin duplicaciones, servicio aislado', 'blue');
        this.log('', 'reset');
        
        this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'dim');
        this.log('💡 Presiona Ctrl+C para detener el sistema', 'yellow');
        this.log('', 'reset');
    }

    keepAlive() {
        // Mantener el proceso principal vivo
        setInterval(() => {
            if (!this.isShuttingDown) {
                // Verificar que los procesos siguen vivos
                for (const [name, process] of this.processes) {
                    if (process.killed) {
                        this.log(`⚠️ Proceso ${name} terminado inesperadamente`, 'yellow');
                    }
                }
            }
        }, 30000); // Verificar cada 30 segundos
    }

    async shutdown(signal) {
        if (this.isShuttingDown) return;
        
        this.isShuttingDown = true;
        this.log(`\n🛑 Recibida señal ${signal}, cerrando sistema...`, 'yellow');
        
        // Terminar todos los procesos
        for (const [name, process] of this.processes) {
            if (!process.killed) {
                this.log(`🔄 Terminando ${name}...`, 'yellow');
                process.kill('SIGTERM');
                
                // Forzar terminación después de 5 segundos
                setTimeout(() => {
                    if (!process.killed) {
                        this.log(`⚡ Forzando terminación de ${name}...`, 'red');
                        process.kill('SIGKILL');
                    }
                }, 5000);
            }
        }
        
        // Esperar un momento para que los procesos terminen
        setTimeout(() => {
            this.log('✅ Sistema cerrado correctamente', 'green');
            process.exit(0);
        }, 2000);
    }

    cleanup() {
        // Limpieza final
        for (const [name, process] of this.processes) {
            if (!process.killed) {
                process.kill('SIGKILL');
            }
        }
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    const launcher = new QBTCLauncher();
    launcher.launch().catch(error => {
        console.error('❌ Error fatal:', error.message);
        process.exit(1);
    });
}

module.exports = QBTCLauncher;