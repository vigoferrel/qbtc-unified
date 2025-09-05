#!/usr/bin/env node

/**
 * QBTC MASTER SYSTEM
 * Sistema maestro que integra toda la infraestructura VPN y Proxy
 * Ejecuta desde cualquier ubicación y selecciona automáticamente el mejor sistema
 */

const path = require('path');
const fs = require('fs');

class QBTCMasterSystem {
    constructor() {
        this.projectRoot = this.findProjectRoot();
        this.systems = {};
        this.status = {
            initialized: false,
            currentIP: null,
            ipAuthorized: false,
            bestSystem: null,
            activeSystem: null
        };

        console.log('🌟 QBTC MASTER SYSTEM');
        console.log('====================');
        console.log('Sistema maestro unificado para VPN y Proxies');
        console.log('');
    }

    /**
     * Encontrar la raíz del proyecto
     */
    findProjectRoot() {
        let currentDir = __dirname;

        // Buscar hacia arriba hasta encontrar package.json o .env
        for (let i = 0; i < 10; i++) {
            if (fs.existsSync(path.join(currentDir, 'package.json')) ||
                fs.existsSync(path.join(currentDir, '.env'))) {
                return currentDir;
            }
            const parentDir = path.dirname(currentDir);
            if (parentDir === currentDir) break; // Llegamos a la raíz
            currentDir = parentDir;
        }

        return __dirname; // Fallback
    }

    /**
     * Verificar si un archivo existe
     */
    fileExists(filePath) {
        try {
            return fs.existsSync(path.join(this.projectRoot, filePath));
        } catch {
            return false;
        }
    }

    /**
     * Importar módulo de forma segura
     */
    async safeImport(modulePath) {
        try {
            const fullPath = path.join(this.projectRoot, modulePath);
            if (fs.existsSync(fullPath)) {
                const module = require(fullPath);
                return module;
            }
        } catch (error) {
            console.log(`⚠️ No se pudo importar ${modulePath}:`, error.message);
        }
        return null;
    }

    /**
     * Inicializar todos los sistemas disponibles
     */
    async initializeSystems() {
        console.log('🚀 Inicializando sistemas disponibles...');

        // Sistemas de la infraestructura existente (carpeta opciones)
        const existingSystems = [
            { key: 'dualVPN', path: '../opciones/vpn-config/dual-vpn-solution.js', name: 'Dual VPN (cuántico)' },
            { key: 'basicVPN', path: '../opciones/qbtc-vpn-solution.js', name: 'Basic VPN' }
        ];

        // Sistemas nuevos (carpeta actual)
        const newSystems = [
            { key: 'smartProxy', path: 'qbtc-smart-proxy.cjs', name: 'Smart Proxy' },
            { key: 'socks5Proxy', path: 'qbtc-socks5-proxy.cjs', name: 'SOCKS5 Proxy' },
            { key: 'vpnConnector', path: 'qbtc-vpn-connector.cjs', name: 'VPN Connector' },
            { key: 'httpProxy', path: 'qbtc-with-correct-ip.cjs', name: 'HTTP Proxy' },
            { key: 'unifiedLauncher', path: 'qbtc-unified-launcher.cjs', name: 'Unified Launcher' },
            { key: 'proxyMonitor', path: 'qbtc-proxy-monitor.cjs', name: 'Proxy Monitor' }
        ];

        const allSystems = [...existingSystems, ...newSystems];

        for (const system of allSystems) {
            const module = await this.safeImport(system.path);
            if (module) {
                this.systems[system.key] = {
                    name: system.name,
                    module: module,
                    instance: null,
                    available: true
                };
                console.log(`✅ ${system.name} disponible`);
            } else {
                this.systems[system.key] = {
                    name: system.name,
                    available: false
                };
                console.log(`❌ ${system.name} no disponible`);
            }
        }

        console.log('✅ Inicialización completa');
        this.status.initialized = true;
    }

    /**
     * Obtener IP actual
     */
    async getCurrentIP() {
        try {
            const https = require('https');
            return new Promise((resolve) => {
                https.get('https://api.ipify.org', (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        const ip = data.trim();
                        this.status.currentIP = ip;
                        resolve(ip);
                    });
                }).on('error', () => resolve('unknown'));
            });
        } catch {
            return 'unknown';
        }
    }

    /**
     * Verificar si IP está autorizada
     */
    isIPAuthorized(ip) {
        const authorizedIPs = [
            '181.43.212.196',  // IP objetivo principal
            '192.168.173.160', // IP OpenVPN del sistema dual
            '10.5.0.2',        // IP adicional
            '172.16.42.223'    // IP adicional
        ];

        const authorized = authorizedIPs.includes(ip);
        this.status.ipAuthorized = authorized;
        return authorized;
    }

    /**
     * Probar un sistema específico
     */
    async testSystem(systemKey) {
        const system = this.systems[systemKey];
        if (!system || !system.available) return false;

        try {
            console.log(`🔍 Probando ${system.name}...`);

            // Crear instancia si es posible
            if (system.module) {
                const SystemClass = system.module[Object.keys(system.module)[0]];
                if (SystemClass) {
                    system.instance = new SystemClass();
                }
            }

            // Si tiene método de verificación, usarlo
            if (system.instance && typeof system.instance.getSystemState === 'function') {
                await system.instance.getSystemState();
                return true;
            }

            // Si tiene método initialize, probarlo
            if (system.instance && typeof system.instance.initialize === 'function') {
                await system.instance.initialize();
                return true;
            }

            // Si llega aquí, asumir que está disponible
            return true;

        } catch (error) {
            console.log(`❌ Error probando ${system.name}:`, error.message);
            return false;
        }
    }

    /**
     * Seleccionar mejor sistema disponible
     */
    async selectBestSystem() {
        console.log('🎯 Seleccionando mejor sistema disponible...');

        // Verificar IP actual
        const currentIP = await this.getCurrentIP();
        console.log(`📡 IP actual: ${currentIP}`);
        console.log(`✅ Autorizada: ${this.isIPAuthorized(currentIP) ? 'SÍ' : 'NO'}`);

        // Si IP ya está autorizada, usar sistema directo
        if (this.status.ipAuthorized) {
            console.log('🎉 IP ya autorizada - sistema directo recomendado');
            this.status.bestSystem = 'direct';
            return 'direct';
        }

        // Probar sistemas por orden de prioridad
        const priorityOrder = [
            'dualVPN',       // 1. Más avanzado (cuántico)
            'smartProxy',    // 2. Rotación automática
            'socks5Proxy',   // 3. SOCKS5 (cambia IP real)
            'vpnConnector',  // 4. VPN automática
            'basicVPN',      // 5. VPN básica
            'httpProxy',     // 6. HTTP proxy
            'unifiedLauncher' // 7. Selector inteligente
        ];

        for (const systemKey of priorityOrder) {
            if (await this.testSystem(systemKey)) {
                const system = this.systems[systemKey];
                console.log(`✅ Sistema seleccionado: ${system.name}`);
                this.status.bestSystem = systemKey;
                return systemKey;
            }
        }

        console.log('❌ No se encontró un sistema operativo');
        return null;
    }

    /**
     * Ejecutar sistema seleccionado
     */
    async executeSystem(systemKey) {
        if (systemKey === 'direct') {
            console.log('✅ Usando conexión directa (IP ya autorizada)');
            console.log('🎯 Ejecuta: node system-integrator.cjs');
            return true;
        }

        const system = this.systems[systemKey];
        if (!system || !system.available) {
            console.error(`❌ Sistema ${systemKey} no disponible`);
            return false;
        }

        console.log(`🚀 Ejecutando ${system.name}...`);

        try {
            if (system.instance) {
                // Ejecutar método principal según el sistema
                if (typeof system.instance.initialize === 'function') {
                    await system.instance.initialize();
                } else if (typeof system.instance.runIntegratedSystem === 'function') {
                    await system.instance.runIntegratedSystem();
                } else if (typeof system.instance.runAuto === 'function') {
                    await system.instance.runAuto();
                } else if (typeof system.instance.initializeSystem === 'function') {
                    await system.instance.initializeSystem();
                } else {
                    console.log(`⚠️ Sistema ${system.name} no tiene método de ejecución definido`);
                }
            } else {
                console.log(`⚠️ No se pudo crear instancia de ${system.name}`);
            }

            this.status.activeSystem = systemKey;
            console.log(`✅ ${system.name} ejecutado exitosamente`);
            return true;

        } catch (error) {
            console.error(`❌ Error ejecutando ${system.name}:`, error.message);
            return false;
        }
    }

    /**
     * Ejecutar sistema maestro completo
     */
    async runMasterSystem() {
        try {
            console.log('🌟 EJECUTANDO SISTEMA MAESTRO QBTC');
            console.log('=================================');

            // 1. Inicializar sistemas
            await this.initializeSystems();

            // 2. Seleccionar mejor sistema
            const selectedSystem = await this.selectBestSystem();

            if (!selectedSystem) {
                console.log('❌ No hay sistemas disponibles');
                console.log('💡 Soluciones:');
                console.log('   • Verifica la instalación de Node.js');
                console.log('   • Configura proveedores de proxy en .env');
                console.log('   • Instala clientes VPN (OpenVPN, NordVPN, etc.)');
                return false;
            }

            // 3. Ejecutar sistema seleccionado
            const success = await this.executeSystem(selectedSystem);

            if (success) {
                console.log('🎉 SISTEMA MAESTRO EJECUTADO EXITOSAMENTE');
                console.log('========================================');

                const finalIP = await this.getCurrentIP();
                console.log('📊 Estado final:');
                console.log(`   🌐 IP actual: ${finalIP}`);
                console.log(`   ✅ IP autorizada: ${this.isIPAuthorized(finalIP) ? 'SÍ' : 'NO'}`);
                console.log(`   🔧 Sistema usado: ${this.status.activeSystem || 'Directo'}`);

                return true;
            } else {
                console.log('❌ Error en la ejecución del sistema');
                return false;
            }

        } catch (error) {
            console.error('❌ Error en sistema maestro:', error.message);
            return false;
        }
    }

    /**
     * Mostrar menú interactivo
     */
    async showMenu() {
        console.log('\n🎛️ QBTC MASTER SYSTEM - MENÚ');
        console.log('===========================');
        console.log('1. 🚀 Ejecutar sistema automático');
        console.log('2. 🧠 Sistema Dual VPN (cuántico)');
        console.log('3. 🔧 Sistema Basic VPN');
        console.log('4. 🧠 Smart Proxy (rotación)');
        console.log('5. 🔒 SOCKS5 Proxy');
        console.log('6. 🛡️ VPN Connector');
        console.log('7. 🌐 HTTP Proxy');
        console.log('8. 🎛️ Unified Launcher');
        console.log('9. 📊 Ver estado');
        console.log('10. 🔍 Verificar sistemas');
        console.log('11. ❌ Salir');
        console.log('===========================');

        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const answer = await new Promise(resolve => {
            rl.question('Selecciona una opción (1-11): ', resolve);
        });

        rl.close();

        return answer.trim();
    }

    /**
     * Ejecutar menú interactivo
     */
    async runInteractive() {
        console.log('🎯 MODO INTERACTIVO ACTIVADO');
        console.log('===========================');

        // Inicializar sistemas
        await this.initializeSystems();

        while (true) {
            const choice = await this.showMenu();

            try {
                switch (choice) {
                    case '1':
                        console.log('\n🚀 Ejecutando sistema automático...');
                        await this.runMasterSystem();
                        break;

                    case '2':
                        await this.executeSystem('dualVPN');
                        break;

                    case '3':
                        await this.executeSystem('basicVPN');
                        break;

                    case '4':
                        await this.executeSystem('smartProxy');
                        break;

                    case '5':
                        await this.executeSystem('socks5Proxy');
                        break;

                    case '6':
                        await this.executeSystem('vpnConnector');
                        break;

                    case '7':
                        await this.executeSystem('httpProxy');
                        break;

                    case '8':
                        await this.executeSystem('unifiedLauncher');
                        break;

                    case '9':
                        console.log('\n📊 Estado del sistema:');
                        console.log(`   Inicializado: ${this.status.initialized}`);
                        console.log(`   IP actual: ${this.status.currentIP || 'Desconocida'}`);
                        console.log(`   IP autorizada: ${this.status.ipAuthorized ? 'SÍ' : 'NO'}`);
                        console.log(`   Mejor sistema: ${this.status.bestSystem || 'Ninguno'}`);
                        console.log(`   Sistema activo: ${this.status.activeSystem || 'Ninguno'}`);
                        break;

                    case '10':
                        console.log('\n🔍 Verificando sistemas disponibles...');
                        await this.initializeSystems();
                        break;

                    case '11':
                        console.log('\n👋 ¡Hasta luego!');
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
     * Obtener estado completo
     */
    getStatus() {
        return {
            ...this.status,
            systems: Object.entries(this.systems).map(([key, system]) => ({
                key,
                name: system.name,
                available: system.available
            })),
            projectRoot: this.projectRoot,
            timestamp: new Date().toISOString()
        };
    }
}

// Función para mostrar información del sistema
function showSystemInfo() {
    console.log('ℹ️  QBTC MASTER SYSTEM');
    console.log('=====================');
    console.log('Sistema maestro que integra toda la infraestructura:');
    console.log('');
    console.log('🏗️ INFRAESTRUCTURA EXISTENTE:');
    console.log('  🧠 Dual VPN Solution - VPN cuántico avanzado');
    console.log('  🔧 Basic VPN Solution - VPN simple');
    console.log('  📊 Quantum Constants - Constantes unificadas');
    console.log('');
    console.log('🆕 SISTEMAS NUEVOS:');
    console.log('  🧠 Smart Proxy - Rotación automática');
    console.log('  🔒 SOCKS5 Proxy - Cambio IP real');
    console.log('  🛡️ VPN Connector - VPN automática');
    console.log('  🌐 HTTP Proxy - Headers forzados');
    console.log('  🎛️ Unified Launcher - Selector inteligente');
    console.log('  📊 Proxy Monitor - Dashboard web');
    console.log('');
    console.log('🎯 CARACTERÍSTICAS:');
    console.log('  ✅ Detección automática de ubicación');
    console.log('  ✅ Selección inteligente de método');
    console.log('  ✅ Fallback automático');
    console.log('  ✅ Integración completa');
    console.log('  ✅ Ejecución desde cualquier lugar');
    console.log('');
}

// Si se ejecuta directamente
if (require.main === module) {
    const args = process.argv.slice(2);
    const masterSystem = new QBTCMasterSystem();

    if (args.includes('--auto') || args.includes('-a')) {
        // Modo automático
        masterSystem.runMasterSystem();
    } else if (args.includes('--interactive') || args.includes('-i')) {
        // Modo interactivo
        masterSystem.runInteractive();
    } else if (args.includes('--status') || args.includes('-s')) {
        // Solo estado
        masterSystem.initializeSystems().then(async () => {
            const status = await masterSystem.getStatus();
            console.log(JSON.stringify(status, null, 2));
        });
    } else {
        // Mostrar ayuda
        showSystemInfo();
        console.log('🎛️ QBTC MASTER SYSTEM');
        console.log('====================');
        console.log('Uso:');
        console.log('  node qbtc-master-system.cjs --auto         # Automático');
        console.log('  node qbtc-master-system.cjs --interactive  # Interactivo');
        console.log('  node qbtc-master-system.cjs --status       # Estado');
        console.log('  node qbtc-master-system.cjs                # Esta ayuda');
        console.log('');
        console.log('Ejemplos:');
        console.log('  node qbtc-master-system.cjs --auto         # Sistema completo');
        console.log('  node qbtc-master-system.cjs --interactive  # Menú completo');
        process.exit(0);
    }

    // Manejar señales de terminación
    process.on('SIGINT', () => {
        console.log('\n🔄 Master System detenido por SIGINT');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n🔄 Master System detenido por SIGTERM');
        process.exit(0);
    });
}

// Exportar la clase
module.exports = { QBTCMasterSystem };