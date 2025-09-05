#!/usr/bin/env node

/**
 * QBTC INTEGRATED VPN SYSTEM
 * Sistema integrado que combina la infraestructura existente avanzada
 * con las nuevas implementaciones de proxy y monitoreo
 */

const path = require('path');
const fs = require('fs');

// Importar sistemas existentes
let DualVPNSolution;
let QBTCVPNSolution;
let QBTCSmartProxy;
let QBTCProxyMonitor;
let QBTCUnifiedLauncher;

try {
    // Importar desde la infraestructura existente
    DualVPNSolution = require(path.join(__dirname, '../opciones/vpn-config/dual-vpn-solution.js'));
    QBTCVPNSolution = require(path.join(__dirname, '../opciones/qbtc-vpn-solution.js'));
} catch (error) {
    console.log('⚠️ Infraestructura existente no encontrada, usando solo sistemas nuevos');
}

try {
    // Importar sistemas nuevos
    QBTCSmartProxy = require('./qbtc-smart-proxy.cjs');
    QBTCProxyMonitor = require('./qbtc-proxy-monitor.cjs');
    QBTCUnifiedLauncher = require('./qbtc-unified-launcher.cjs');
} catch (error) {
    console.log('⚠️ Algunos sistemas nuevos no encontrados');
}

class QBTCIntegratedVPNSystem {
    constructor() {
        this.systems = {
            dualVPN: null,
            basicVPN: null,
            smartProxy: null,
            proxyMonitor: null,
            unifiedLauncher: null
        };

        this.status = {
            initialized: false,
            activeSystem: null,
            ipAuthorized: false,
            lastCheck: Date.now()
        };

        console.log('🔧 QBTC INTEGRATED VPN SYSTEM');
        console.log('=============================');
        console.log('Sistema unificado que combina:');
        console.log('  🧠 Dual VPN Solution (existente)');
        console.log('  🔧 Basic VPN Solution (existente)');
        console.log('  🧠 Smart Proxy System (nuevo)');
        console.log('  📊 Proxy Monitor (nuevo)');
        console.log('  🎛️ Unified Launcher (nuevo)');
        console.log('');
    }

    /**
     * Inicializar sistemas disponibles
     */
    async initializeSystems() {
        console.log('🚀 INICIALIZANDO SISTEMAS DISPONIBLES...');

        // Inicializar Dual VPN (sistema más avanzado existente)
        if (DualVPNSolution) {
            try {
                this.systems.dualVPN = new DualVPNSolution();
                console.log('✅ Dual VPN System inicializado');
            } catch (error) {
                console.log('❌ Error inicializando Dual VPN:', error.message);
            }
        }

        // Inicializar Basic VPN
        if (QBTCVPNSolution) {
            try {
                this.systems.basicVPN = new QBTCVPNSolution();
                console.log('✅ Basic VPN System inicializado');
            } catch (error) {
                console.log('❌ Error inicializando Basic VPN:', error.message);
            }
        }

        // Inicializar Smart Proxy (nuevo)
        if (QBTCSmartProxy) {
            try {
                this.systems.smartProxy = new QBTCSmartProxy.QBTCSmartProxy();
                console.log('✅ Smart Proxy System inicializado');
            } catch (error) {
                console.log('❌ Error inicializando Smart Proxy:', error.message);
            }
        }

        // Inicializar Proxy Monitor
        if (QBTCProxyMonitor) {
            try {
                this.systems.proxyMonitor = new QBTCProxyMonitor.QBTCProxyMonitor();
                console.log('✅ Proxy Monitor inicializado');
            } catch (error) {
                console.log('❌ Error inicializando Proxy Monitor:', error.message);
            }
        }

        // Inicializar Unified Launcher
        if (QBTCUnifiedLauncher) {
            try {
                this.systems.unifiedLauncher = new QBTCUnifiedLauncher.QBTCUnifiedLauncher();
                console.log('✅ Unified Launcher inicializado');
            } catch (error) {
                console.log('❌ Error inicializando Unified Launcher:', error.message);
            }
        }

        this.status.initialized = true;
        console.log('✅ Inicialización completa');
    }

    /**
     * Verificar IP actual
     */
    async checkCurrentIP() {
        try {
            const https = require('https');
            return new Promise((resolve, reject) => {
                https.get('https://api.ipify.org', (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => resolve(data.trim()));
                }).on('error', reject);
            });
        } catch (error) {
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
        return authorizedIPs.includes(ip);
    }

    /**
     * Seleccionar mejor sistema disponible
     */
    async selectBestSystem() {
        console.log('🎯 SELECCIONANDO MEJOR SISTEMA...');

        const currentIP = await this.checkCurrentIP();
        this.status.ipAuthorized = this.isIPAuthorized(currentIP);

        console.log(`📡 IP actual: ${currentIP}`);
        console.log(`✅ Autorizada: ${this.status.ipAuthorized ? 'SÍ' : 'NO'}`);

        // Si IP ya está autorizada, usar sistema directo
        if (this.status.ipAuthorized) {
            console.log('🎉 IP ya autorizada - usando sistema directo');
            return 'direct';
        }

        // Estrategia de selección por prioridad
        const priorityOrder = [
            { key: 'dualVPN', name: 'Dual VPN (cuántico)', system: this.systems.dualVPN },
            { key: 'smartProxy', name: 'Smart Proxy', system: this.systems.smartProxy },
            { key: 'basicVPN', name: 'Basic VPN', system: this.systems.basicVPN },
            { key: 'unifiedLauncher', name: 'Unified Launcher', system: this.systems.unifiedLauncher }
        ];

        for (const option of priorityOrder) {
            if (option.system) {
                console.log(`✅ Sistema seleccionado: ${option.name}`);
                this.status.activeSystem = option.key;
                return option.key;
            }
        }

        console.log('❌ No hay sistemas disponibles');
        return null;
    }

    /**
     * Ejecutar sistema seleccionado
     */
    async executeSelectedSystem(systemKey) {
        const system = this.systems[systemKey];

        if (!system) {
            console.error(`❌ Sistema ${systemKey} no disponible`);
            return false;
        }

        console.log(`🚀 EJECUTANDO SISTEMA: ${systemKey.toUpperCase()}`);

        try {
            switch (systemKey) {
                case 'dualVPN':
                    await system.initialize();
                    break;

                case 'basicVPN':
                    await system.runVPNSolution();
                    break;

                case 'smartProxy':
                    await system.initializeSystem();
                    break;

                case 'unifiedLauncher':
                    await system.runAuto();
                    break;

                case 'direct':
                    console.log('✅ Usando conexión directa (IP ya autorizada)');
                    return true;

                default:
                    console.log('❌ Sistema no reconocido');
                    return false;
            }

            console.log(`✅ Sistema ${systemKey} ejecutado exitosamente`);
            return true;

        } catch (error) {
            console.error(`❌ Error ejecutando ${systemKey}:`, error.message);
            return false;
        }
    }

    /**
     * Iniciar monitor si está disponible
     */
    async startMonitor() {
        if (this.systems.proxyMonitor) {
            try {
                this.systems.proxyMonitor.startServer();
                console.log('📊 Monitor iniciado en background');
            } catch (error) {
                console.log('⚠️ Error iniciando monitor:', error.message);
            }
        }
    }

    /**
     * Obtener estado completo del sistema
     */
    async getSystemStatus() {
        const currentIP = await this.checkCurrentIP();

        return {
            initialized: this.status.initialized,
            currentIP: currentIP,
            ipAuthorized: this.isIPAuthorized(currentIP),
            activeSystem: this.status.activeSystem,
            availableSystems: Object.keys(this.systems).filter(key => this.systems[key] !== null),
            lastCheck: new Date().toISOString(),
            systems: {
                dualVPN: !!this.systems.dualVPN,
                basicVPN: !!this.systems.basicVPN,
                smartProxy: !!this.systems.smartProxy,
                proxyMonitor: !!this.systems.proxyMonitor,
                unifiedLauncher: !!this.systems.unifiedLauncher
            }
        };
    }

    /**
     * Ejecutar sistema integrado completo
     */
    async runIntegratedSystem() {
        try {
            console.log('🌟 EJECUTANDO SISTEMA INTEGRADO QBTC');
            console.log('====================================');

            // 1. Inicializar sistemas
            await this.initializeSystems();

            // 2. Iniciar monitor en background
            await this.startMonitor();

            // 3. Seleccionar mejor sistema
            const selectedSystem = await this.selectBestSystem();

            if (!selectedSystem) {
                console.log('❌ No se pudo seleccionar un sistema operativo');
                console.log('💡 Verifica la configuración de VPN y proxies');
                return false;
            }

            // 4. Ejecutar sistema seleccionado
            const success = await this.executeSelectedSystem(selectedSystem);

            if (success) {
                console.log('🎉 SISTEMA INTEGRADO EJECUTADO EXITOSAMENTE');
                console.log('==========================================');

                const finalStatus = await this.getSystemStatus();
                console.log('📊 Estado final:');
                console.log(`   🌐 IP: ${finalStatus.currentIP}`);
                console.log(`   ✅ Autorizada: ${finalStatus.ipAuthorized ? 'SÍ' : 'NO'}`);
                console.log(`   🔧 Sistema activo: ${finalStatus.activeSystem || 'Ninguno'}`);
                console.log(`   📦 Sistemas disponibles: ${finalStatus.availableSystems.length}`);

                return true;
            } else {
                console.log('❌ Error en la ejecución del sistema');
                return false;
            }

        } catch (error) {
            console.error('❌ Error en sistema integrado:', error.message);
            return false;
        }
    }

    /**
     * Mostrar menú interactivo
     */
    async showInteractiveMenu() {
        console.log('\n🎛️ QBTC INTEGRATED VPN SYSTEM - MENÚ');
        console.log('====================================');
        console.log('1. 🚀 Ejecutar sistema automático');
        console.log('2. 🧠 Usar Dual VPN (cuántico)');
        console.log('3. 🔧 Usar Basic VPN');
        console.log('4. 🧠 Usar Smart Proxy');
        console.log('5. 🎛️ Usar Unified Launcher');
        console.log('6. 📊 Ver estado del sistema');
        console.log('7. 🔍 Verificar sistemas disponibles');
        console.log('8. ⚙️ Configurar proxies');
        console.log('9. ❌ Salir');
        console.log('====================================');

        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const answer = await new Promise(resolve => {
            rl.question('Selecciona una opción (1-9): ', resolve);
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

        // Inicializar sistemas al inicio
        await this.initializeSystems();

        while (true) {
            const choice = await this.showInteractiveMenu();

            try {
                switch (choice) {
                    case '1':
                        console.log('\n🚀 Ejecutando sistema automático...');
                        await this.runIntegratedSystem();
                        break;

                    case '2':
                        if (this.systems.dualVPN) {
                            console.log('\n🧠 Ejecutando Dual VPN...');
                            await this.executeSelectedSystem('dualVPN');
                        } else {
                            console.log('\n❌ Dual VPN no disponible');
                        }
                        break;

                    case '3':
                        if (this.systems.basicVPN) {
                            console.log('\n🔧 Ejecutando Basic VPN...');
                            await this.executeSelectedSystem('basicVPN');
                        } else {
                            console.log('\n❌ Basic VPN no disponible');
                        }
                        break;

                    case '4':
                        if (this.systems.smartProxy) {
                            console.log('\n🧠 Ejecutando Smart Proxy...');
                            await this.executeSelectedSystem('smartProxy');
                        } else {
                            console.log('\n❌ Smart Proxy no disponible');
                        }
                        break;

                    case '5':
                        if (this.systems.unifiedLauncher) {
                            console.log('\n🎛️ Ejecutando Unified Launcher...');
                            await this.executeSelectedSystem('unifiedLauncher');
                        } else {
                            console.log('\n❌ Unified Launcher no disponible');
                        }
                        break;

                    case '6':
                        console.log('\n📊 Estado del sistema:');
                        const status = await this.getSystemStatus();
                        console.log(JSON.stringify(status, null, 2));
                        break;

                    case '7':
                        console.log('\n🔍 Verificando sistemas disponibles...');
                        await this.initializeSystems();
                        break;

                    case '8':
                        console.log('\n⚙️ Ejecutando configuración...');
                        // Aquí podríamos integrar el configurador
                        console.log('💡 Función de configuración próximamente');
                        break;

                    case '9':
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
}

// Función para mostrar información del sistema
function showSystemInfo() {
    console.log('ℹ️  QBTC INTEGRATED VPN SYSTEM');
    console.log('==============================');
    console.log('Sistema unificado que combina:');
    console.log('');
    console.log('🏗️ INFRAESTRUCTURA EXISTENTE:');
    console.log('  🧠 Dual VPN Solution - VPN cuántico avanzado');
    console.log('  🔧 Basic VPN Solution - VPN simple y funcional');
    console.log('  📊 Quantum Constants - Constantes unificadas');
    console.log('');
    console.log('🆕 SISTEMAS NUEVOS:');
    console.log('  🧠 Smart Proxy - Rotación automática de proveedores');
    console.log('  📊 Proxy Monitor - Dashboard de monitoreo web');
    console.log('  🎛️ Unified Launcher - Selector inteligente');
    console.log('  ⚙️ Proxy Config - Configuración interactiva');
    console.log('');
    console.log('🎯 CARACTERÍSTICAS:');
    console.log('  ✅ Detección automática de IP');
    console.log('  ✅ Selección inteligente de método');
    console.log('  ✅ Fallback automático');
    console.log('  ✅ Monitoreo en tiempo real');
    console.log('  ✅ Configuración cuántica avanzada');
    console.log('');
}

// Si se ejecuta directamente
if (require.main === module) {
    const args = process.argv.slice(2);
    const integratedSystem = new QBTCIntegratedVPNSystem();

    if (args.includes('--auto') || args.includes('-a')) {
        // Modo automático
        integratedSystem.runIntegratedSystem();
    } else if (args.includes('--interactive') || args.includes('-i')) {
        // Modo interactivo
        integratedSystem.runInteractive();
    } else if (args.includes('--status') || args.includes('-s')) {
        // Solo mostrar estado
        integratedSystem.initializeSystems().then(async () => {
            const status = await integratedSystem.getSystemStatus();
            console.log(JSON.stringify(status, null, 2));
        });
    } else {
        // Mostrar ayuda
        showSystemInfo();
        console.log('🎛️ QBTC INTEGRATED VPN SYSTEM');
        console.log('=============================');
        console.log('Uso:');
        console.log('  node qbtc-integrated-vpn-system.cjs --auto         # Automático');
        console.log('  node qbtc-integrated-vpn-system.cjs --interactive  # Interactivo');
        console.log('  node qbtc-integrated-vpn-system.cjs --status       # Estado');
        console.log('  node qbtc-integrated-vpn-system.cjs                # Esta ayuda');
        console.log('');
        console.log('Ejemplos:');
        console.log('  node qbtc-integrated-vpn-system.cjs --auto         # Sistema completo');
        console.log('  node qbtc-integrated-vpn-system.cjs --interactive  # Menú completo');
        process.exit(0);
    }

    // Manejar señales de terminación
    process.on('SIGINT', () => {
        console.log('\n🔄 Integrated VPN System detenido por SIGINT');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n🔄 Integrated VPN System detenido por SIGTERM');
        process.exit(0);
    });
}

// Exportar la clase
module.exports = { QBTCIntegratedVPNSystem };