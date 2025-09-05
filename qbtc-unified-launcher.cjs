#!/usr/bin/env node

/**
 * QBTC UNIFIED LAUNCHER
 * Launcher completo que integra todos los sistemas de proxy y VPN
 * Sistema inteligente que selecciona y ejecuta la mejor opción disponible
 */

const { spawn } = require('child_process');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: path.join(__dirname, '.env') });

class QBTCUnifiedLauncher {
    constructor() {
        this.systems = {
            smartProxy: { name: 'Smart Proxy', script: 'qbtc-smart-proxy.cjs', status: 'unknown' },
            socks5Proxy: { name: 'SOCKS5 Proxy', script: 'qbtc-socks5-proxy.cjs', status: 'unknown' },
            vpnConnector: { name: 'VPN Connector', script: 'qbtc-vpn-connector.cjs', status: 'unknown' },
            httpProxy: { name: 'HTTP Proxy', script: 'qbtc-with-correct-ip.cjs', status: 'unknown' },
            directConnection: { name: 'Direct Connection', script: 'system-integrator.cjs', status: 'unknown' }
        };

        this.currentProcess = null;
        this.monitorProcess = null;

        console.log('🚀 QBTC UNIFIED LAUNCHER');
        console.log('========================');
        console.log('Sistema completo de proxy y VPN para QBTC');
        console.log('');
    }

    /**
     * Verificar si un script existe
     */
    scriptExists(scriptName) {
        const scriptPath = path.join(__dirname, scriptName);
        const fs = require('fs');
        return fs.existsSync(scriptPath);
    }

    /**
     * Probar un sistema específico
     */
    async testSystem(systemKey) {
        const system = this.systems[systemKey];
        if (!system) return false;

        console.log(`🔍 Probando ${system.name}...`);

        return new Promise((resolve) => {
            if (!this.scriptExists(system.script)) {
                console.log(`❌ Script ${system.script} no encontrado`);
                resolve(false);
                return;
            }

            const child = spawn('node', [system.script, '--status'], {
                cwd: __dirname,
                stdio: ['pipe', 'pipe', 'pipe'],
                timeout: 5000
            });

            let output = '';
            child.stdout.on('data', (data) => {
                output += data.toString();
            });

            child.on('close', (code) => {
                const success = code === 0;
                system.status = success ? 'available' : 'unavailable';
                console.log(`   ${system.name}: ${success ? '✅' : '❌'}`);
                resolve(success);
            });

            child.on('error', () => {
                system.status = 'error';
                console.log(`   ${system.name}: ❌ (error)`);
                resolve(false);
            });

            // Timeout
            setTimeout(() => {
                child.kill();
                system.status = 'timeout';
                console.log(`   ${system.name}: ❌ (timeout)`);
                resolve(false);
            }, 5000);
        });
    }

    /**
     * Probar todos los sistemas
     */
    async testAllSystems() {
        console.log('🔍 VERIFICANDO SISTEMAS DISPONIBLES');
        console.log('===================================');

        const results = {};
        for (const [key] of Object.entries(this.systems)) {
            results[key] = await this.testSystem(key);
        }

        console.log('\n📊 RESULTADOS:');
        Object.entries(results).forEach(([key, available]) => {
            const system = this.systems[key];
            console.log(`   ${available ? '✅' : '❌'} ${system.name}`);
        });

        return results;
    }

    /**
     * Seleccionar mejor sistema disponible
     */
    async selectBestSystem() {
        console.log('\n🎯 SELECCIONANDO MEJOR SISTEMA');
        console.log('==============================');

        const results = await this.testAllSystems();

        // Estrategia de selección por prioridad
        const priorityOrder = [
            'smartProxy',      // 1. Smart Proxy (más avanzado)
            'socks5Proxy',     // 2. SOCKS5 (cambia IP real)
            'vpnConnector',    // 3. VPN (conexión dedicada)
            'httpProxy',       // 4. HTTP Proxy (headers)
            'directConnection' // 5. Direct (fallback)
        ];

        for (const systemKey of priorityOrder) {
            if (results[systemKey]) {
                const system = this.systems[systemKey];
                console.log(`✅ Sistema seleccionado: ${system.name}`);
                return systemKey;
            }
        }

        console.log('❌ No hay sistemas disponibles');
        return null;
    }

    /**
     * Ejecutar sistema seleccionado
     */
    async executeSystem(systemKey) {
        const system = this.systems[systemKey];
        if (!system) {
            console.error('❌ Sistema no válido');
            return false;
        }

        console.log(`\n🚀 EJECUTANDO ${system.name.toUpperCase()}`);
        console.log('=====================================');

        return new Promise((resolve) => {
            this.currentProcess = spawn('node', [system.script], {
                cwd: __dirname,
                stdio: 'inherit',
                env: {
                    ...process.env,
                    LAUNCHED_BY_UNIFIED: 'true'
                }
            });

            this.currentProcess.on('close', (code) => {
                console.log(`\n🔄 ${system.name} terminado con código: ${code}`);
                this.currentProcess = null;
                resolve(code === 0);
            });

            this.currentProcess.on('error', (error) => {
                console.error(`❌ Error ejecutando ${system.name}:`, error);
                this.currentProcess = null;
                resolve(false);
            });
        });
    }

    /**
     * Iniciar monitor en background
     */
    startMonitor() {
        console.log('📊 Iniciando monitor en background...');

        if (this.scriptExists('qbtc-proxy-monitor.cjs')) {
            this.monitorProcess = spawn('node', ['qbtc-proxy-monitor.cjs', '--dashboard'], {
                cwd: __dirname,
                stdio: 'ignore',
                detached: true
            });

            this.monitorProcess.unref();

            console.log('✅ Monitor iniciado: http://localhost:9099');
        } else {
            console.log('⚠️ Monitor no disponible');
        }
    }

    /**
     * Detener procesos
     */
    stopProcesses() {
        if (this.currentProcess) {
            console.log('🛑 Deteniendo proceso actual...');
            this.currentProcess.kill();
        }

        if (this.monitorProcess) {
            console.log('🛑 Deteniendo monitor...');
            this.monitorProcess.kill();
        }
    }

    /**
     * Mostrar menú interactivo
     */
    async showMenu() {
        console.log('\n🎛️ QBTC UNIFIED LAUNCHER - MENÚ');
        console.log('===============================');
        console.log('1. 🚀 Auto (mejor sistema disponible)');
        console.log('2. 🧠 Smart Proxy (inteligente)');
        console.log('3. 🔒 SOCKS5 Proxy (IP real)');
        console.log('4. 🛡️ VPN Connector (VPN)');
        console.log('5. 🌐 HTTP Proxy (headers)');
        console.log('6. 🔗 Direct Connection (sin proxy)');
        console.log('7. 📊 Iniciar Monitor');
        console.log('8. 🔍 Verificar Sistemas');
        console.log('9. ⚙️ Configurar Proxies');
        console.log('10. ❌ Salir');
        console.log('===============================');

        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const answer = await new Promise(resolve => {
            rl.question('Selecciona una opción (1-10): ', resolve);
        });

        rl.close();

        return answer.trim();
    }

    /**
     * Ejecutar configuración
     */
    async runConfiguration() {
        console.log('\n⚙️ EJECUTANDO CONFIGURACIÓN');
        console.log('==========================');

        if (this.scriptExists('qbtc-proxy-config.cjs')) {
            const { spawn } = require('child_process');
            const configProcess = spawn('node', ['qbtc-proxy-config.cjs', '--interactive'], {
                stdio: 'inherit',
                cwd: __dirname
            });

            return new Promise((resolve) => {
                configProcess.on('close', (code) => {
                    console.log(`\n🔄 Configuración terminada con código: ${code}`);
                    resolve(code === 0);
                });
            });
        } else {
            console.log('❌ Herramienta de configuración no encontrada');
            return false;
        }
    }

    /**
     * Ejecutar menú interactivo
     */
    async runInteractive() {
        console.log('🎯 Modo Interactivo Activado');
        console.log('===========================');

        while (true) {
            const choice = await this.showMenu();

            try {
                switch (choice) {
                    case '1':
                        console.log('\n🚀 Ejecutando modo AUTO...');
                        const bestSystem = await this.selectBestSystem();
                        if (bestSystem) {
                            await this.executeSystem(bestSystem);
                        }
                        break;

                    case '2':
                        console.log('\n🧠 Ejecutando Smart Proxy...');
                        await this.executeSystem('smartProxy');
                        break;

                    case '3':
                        console.log('\n🔒 Ejecutando SOCKS5 Proxy...');
                        await this.executeSystem('socks5Proxy');
                        break;

                    case '4':
                        console.log('\n🛡️ Ejecutando VPN Connector...');
                        await this.executeSystem('vpnConnector');
                        break;

                    case '5':
                        console.log('\n🌐 Ejecutando HTTP Proxy...');
                        await this.executeSystem('httpProxy');
                        break;

                    case '6':
                        console.log('\n🔗 Ejecutando Direct Connection...');
                        await this.executeSystem('directConnection');
                        break;

                    case '7':
                        console.log('\n📊 Iniciando Monitor...');
                        this.startMonitor();
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        break;

                    case '8':
                        console.log('\n🔍 Verificando sistemas...');
                        await this.testAllSystems();
                        break;

                    case '9':
                        console.log('\n⚙️ Iniciando configuración...');
                        await this.runConfiguration();
                        break;

                    case '10':
                        console.log('\n👋 ¡Hasta luego!');
                        this.stopProcesses();
                        return;

                    default:
                        console.log('\n❌ Opción no válida');
                }
            } catch (error) {
                console.error('\n❌ Error:', error.message);
            }

            // Pausa antes de mostrar menú nuevamente
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    /**
     * Ejecutar modo automático
     */
    async runAuto() {
        console.log('🚀 MODO AUTOMÁTICO');
        console.log('==================');

        // Iniciar monitor en background
        this.startMonitor();

        // Esperar un poco para que el monitor inicie
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Seleccionar y ejecutar mejor sistema
        const bestSystem = await this.selectBestSystem();

        if (bestSystem) {
            console.log(`\n🎯 Sistema óptimo encontrado: ${this.systems[bestSystem].name}`);
            await this.executeSystem(bestSystem);
        } else {
            console.log('\n❌ No se pudo encontrar un sistema operativo');
            console.log('💡 Sugerencias:');
            console.log('   • Ejecuta: node qbtc-proxy-config.cjs --interactive');
            console.log('   • Configura un proveedor de proxy');
            console.log('   • Verifica las credenciales de Binance');
        }
    }

    /**
     * Ejecutar modo específico
     */
    async runSpecific(systemKey) {
        console.log(`🎯 MODO ESPECÍFICO: ${systemKey.toUpperCase()}`);
        console.log('==================');

        if (!this.systems[systemKey]) {
            console.error(`❌ Sistema '${systemKey}' no encontrado`);
            console.log('Sistemas disponibles:', Object.keys(this.systems).join(', '));
            return;
        }

        // Verificar si el sistema está disponible
        const available = await this.testSystem(systemKey);
        if (!available) {
            console.error(`❌ Sistema '${systemKey}' no está disponible`);
            return;
        }

        await this.executeSystem(systemKey);
    }
}

// Función para mostrar información del sistema
function showSystemInfo() {
    console.log('ℹ️  INFORMACIÓN DEL SISTEMA QBTC UNIFIED');
    console.log('======================================');
    console.log('Sistemas disponibles:');
    console.log('  🧠 Smart Proxy - Proxy inteligente con rotación');
    console.log('  🔒 SOCKS5 Proxy - Cambia IP real de conexión');
    console.log('  🛡️ VPN Connector - Conexión VPN automática');
    console.log('  🌐 HTTP Proxy - Modifica headers HTTP');
    console.log('  🔗 Direct Connection - Conexión sin proxy');
    console.log('');
    console.log('Herramientas adicionales:');
    console.log('  📊 Proxy Monitor - Dashboard de monitoreo');
    console.log('  ⚙️ Proxy Config - Configuración interactiva');
    console.log('  🎛️ Master Launcher - Selector inteligente');
    console.log('');
}

// Si se ejecuta directamente
if (require.main === module) {
    const args = process.argv.slice(2);
    const launcher = new QBTCUnifiedLauncher();

    if (args.includes('--auto') || args.includes('-a')) {
        // Modo automático
        launcher.runAuto();
    } else if (args.includes('--interactive') || args.includes('-i')) {
        // Modo interactivo
        launcher.runInteractive();
    } else if (args.includes('--monitor') || args.includes('-m')) {
        // Solo iniciar monitor
        launcher.startMonitor();
        console.log('📊 Monitor iniciado. Presiona Ctrl+C para detener.');
    } else if (args.includes('--test') || args.includes('-t')) {
        // Solo probar sistemas
        launcher.testAllSystems();
    } else if (args.length > 0 && !args[0].startsWith('-')) {
        // Sistema específico
        const systemKey = args[0];
        launcher.runSpecific(systemKey);
    } else {
        // Mostrar ayuda
        showSystemInfo();
        console.log('🎛️ QBTC UNIFIED LAUNCHER');
        console.log('========================');
        console.log('Uso:');
        console.log('  node qbtc-unified-launcher.cjs --auto         # Modo automático');
        console.log('  node qbtc-unified-launcher.cjs --interactive  # Modo interactivo');
        console.log('  node qbtc-unified-launcher.cjs --monitor      # Solo monitor');
        console.log('  node qbtc-unified-launcher.cjs --test         # Probar sistemas');
        console.log('  node qbtc-unified-launcher.cjs [sistema]      # Sistema específico');
        console.log('  node qbtc-unified-launcher.cjs                # Esta ayuda');
        console.log('');
        console.log('Sistemas disponibles:');
        console.log('  smartProxy, socks5Proxy, vpnConnector, httpProxy, directConnection');
        console.log('');
        console.log('Ejemplos:');
        console.log('  node qbtc-unified-launcher.cjs smartProxy     # Ejecutar Smart Proxy');
        console.log('  node qbtc-unified-launcher.cjs --auto         # Mejor opción automática');
        console.log('  node qbtc-unified-launcher.cjs --interactive  # Menú interactivo');
        process.exit(0);
    }

    // Manejar señales de terminación
    process.on('SIGINT', () => {
        console.log('\n🔄 Unified Launcher detenido por SIGINT');
        launcher.stopProcesses();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n🔄 Unified Launcher detenido por SIGTERM');
        launcher.stopProcesses();
        process.exit(0);
    });
}

// Exportar la clase
module.exports = { QBTCUnifiedLauncher };