#!/usr/bin/env node

/**
 * QBTC Master Launcher
 * Selector inteligente de método de conexión para QBTC
 * Elige automáticamente el mejor método disponible
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Cargar variables de entorno
require('dotenv').config({ path: path.join(__dirname, '.env') });

class QBTCMasterLauncher {
    constructor() {
        console.log('🚀 QBTC Master Launcher - Sistema de Conexión Inteligente');
        console.log('=======================================================');

        this.methods = {
            DIRECT: 'direct',
            HTTP_PROXY: 'http_proxy',
            SOCKS5: 'socks5',
            VPN: 'vpn'
        };

        this.config = {
            binanceApiKey: process.env.BINANCE_API_KEY,
            binanceSecretKey: process.env.BINANCE_SECRET_KEY,
            authorizedIP: '181.43.212.196',
            currentIP: null,
            preferredMethod: process.env.CONNECTION_METHOD || 'auto'
        };

        this.status = {
            methodSelected: null,
            connectionActive: false,
            binanceAccessible: false
        };
    }

    /**
     * Obtener IP actual
     */
    async getCurrentIP() {
        return new Promise((resolve) => {
            const https = require('https');

            https.get('https://api.ipify.org', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    this.config.currentIP = data.trim();
                    console.log(`📡 IP actual detectada: ${this.config.currentIP}`);
                    resolve(this.config.currentIP);
                });
            }).on('error', () => {
                // Fallback
                this.config.currentIP = 'unknown';
                resolve('unknown');
            });
        });
    }

    /**
     * Verificar si la IP actual está autorizada
     */
    isCurrentIPAuthorized() {
        return this.config.currentIP === this.config.authorizedIP;
    }

    /**
     * Probar conexión directa con Binance
     */
    async testDirectConnection() {
        console.log('🔍 Probando conexión directa...');

        try {
            const https = require('https');
            const crypto = require('crypto');

            const timestamp = Date.now();
            const queryString = `timestamp=${timestamp}&recvWindow=5000`;
            const signature = crypto.createHmac('sha256', this.config.binanceSecretKey)
                .update(queryString)
                .digest('hex');

            const options = {
                hostname: 'fapi.binance.com',
                path: `/fapi/v2/account?${queryString}&signature=${signature}`,
                method: 'GET',
                headers: {
                    'X-MBX-APIKEY': this.config.binanceApiKey,
                    'User-Agent': 'QBTC-Master-Launcher/1.0'
                },
                timeout: 10000
            };

            return new Promise((resolve) => {
                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        try {
                            const response = JSON.parse(data);
                            if (res.statusCode === 200) {
                                console.log('✅ Conexión directa exitosa');
                                resolve({ success: true, method: 'DIRECT', response });
                            } else if (response.code === -2015) {
                                console.log('❌ IP no autorizada para conexión directa');
                                resolve({ success: false, method: 'DIRECT', error: 'IP_NOT_AUTHORIZED' });
                            } else {
                                console.log(`❌ Error en conexión directa: ${response.msg}`);
                                resolve({ success: false, method: 'DIRECT', error: response.msg });
                            }
                        } catch (e) {
                            resolve({ success: false, method: 'DIRECT', error: 'PARSE_ERROR' });
                        }
                    });
                });

                req.on('error', () => {
                    resolve({ success: false, method: 'DIRECT', error: 'CONNECTION_ERROR' });
                });

                req.on('timeout', () => {
                    req.destroy();
                    resolve({ success: false, method: 'DIRECT', error: 'TIMEOUT' });
                });

                req.end();
            });

        } catch (error) {
            console.log('❌ Error probando conexión directa:', error.message);
            return { success: false, method: 'DIRECT', error: error.message };
        }
    }

    /**
     * Verificar disponibilidad de métodos
     */
    async checkMethodAvailability() {
        console.log('🔍 Verificando disponibilidad de métodos...');

        const availability = {
            direct: false,
            http_proxy: false,
            socks5: false,
            vpn: false
        };

        // Verificar conexión directa
        const directTest = await this.testDirectConnection();
        availability.direct = directTest.success;

        // Verificar proxy HTTP (puerto 8888)
        try {
            const net = require('net');
            availability.http_proxy = await new Promise((resolve) => {
                const client = net.createConnection({ port: 8888, host: '127.0.0.1' });
                client.on('connect', () => {
                    client.end();
                    resolve(true);
                });
                client.on('error', () => resolve(false));
                setTimeout(() => {
                    client.end();
                    resolve(false);
                }, 2000);
            });
        } catch (e) {
            availability.http_proxy = false;
        }

        // Verificar SOCKS5 (simular conexión)
        try {
            const { SocksProxyAgent } = require('socks-proxy-agent');
            const agent = new SocksProxyAgent(`socks5://${this.config.authorizedIP}:1080`);
            availability.socks5 = true; // Asumir disponible si la librería carga
        } catch (e) {
            availability.socks5 = false;
        }

        // Verificar VPN (interfaces de red)
        const os = require('os');
        const networkInterfaces = os.networkInterfaces();
        availability.vpn = Object.keys(networkInterfaces).some(iface =>
            iface.toLowerCase().includes('vpn') ||
            iface.toLowerCase().includes('tun') ||
            iface.toLowerCase().includes('tap')
        );

        console.log('📊 Disponibilidad de métodos:');
        Object.entries(availability).forEach(([method, available]) => {
            console.log(`   ${method}: ${available ? '✅' : '❌'}`);
        });

        return availability;
    }

    /**
     * Seleccionar mejor método automáticamente
     */
    async selectBestMethod() {
        console.log('🎯 Seleccionando mejor método de conexión...');

        const availability = await this.checkMethodAvailability();

        // Estrategia de selección
        if (availability.direct) {
            console.log('✅ Método seleccionado: DIRECT (IP ya autorizada)');
            return this.methods.DIRECT;
        }

        if (availability.socks5) {
            console.log('✅ Método seleccionado: SOCKS5 (cambia IP real)');
            return this.methods.SOCKS5;
        }

        if (availability.vpn) {
            console.log('✅ Método seleccionado: VPN (conexión VPN activa)');
            return this.methods.VPN;
        }

        if (availability.http_proxy) {
            console.log('⚠️ Método seleccionado: HTTP_PROXY (solo headers)');
            return this.methods.HTTP_PROXY;
        }

        console.log('❌ No hay métodos disponibles, usando DIRECT como fallback');
        return this.methods.DIRECT;
    }

    /**
     * Ejecutar método seleccionado
     */
    async executeSelectedMethod(method) {
        console.log(`🚀 Ejecutando método: ${method}`);

        let scriptName;

        switch (method) {
            case this.methods.DIRECT:
                scriptName = 'system-integrator.cjs';
                break;
            case this.methods.HTTP_PROXY:
                scriptName = 'qbtc-with-correct-ip.cjs';
                break;
            case this.methods.SOCKS5:
                scriptName = 'qbtc-socks5-proxy.cjs';
                break;
            case this.methods.VPN:
                scriptName = 'qbtc-vpn-connector.cjs';
                break;
            default:
                scriptName = 'system-integrator.cjs';
        }

        console.log(`📁 Ejecutando script: ${scriptName}`);

        return new Promise((resolve, reject) => {
            const child = spawn('node', [scriptName], {
                stdio: 'inherit',
                cwd: __dirname,
                env: {
                    ...process.env,
                    SELECTED_METHOD: method,
                    MASTER_LAUNCHER: 'true'
                }
            });

            child.on('close', (code) => {
                console.log(`\n🔄 Script ${scriptName} terminado con código: ${code}`);
                resolve(code);
            });

            child.on('error', (error) => {
                console.error(`❌ Error ejecutando ${scriptName}:`, error);
                reject(error);
            });
        });
    }

    /**
     * Método principal
     */
    async launch() {
        try {
            console.log('🌟 INICIANDO QBTC MASTER LAUNCHER');
            console.log('==================================');

            // Obtener IP actual
            await this.getCurrentIP();

            // Verificar si IP está autorizada
            if (this.isCurrentIPAuthorized()) {
                console.log('🎉 IP actual está autorizada en Binance');
                this.status.methodSelected = this.methods.DIRECT;
            } else {
                console.log('⚠️ IP actual NO está autorizada, buscando alternativas...');

                // Seleccionar mejor método
                if (this.config.preferredMethod === 'auto') {
                    this.status.methodSelected = await this.selectBestMethod();
                } else {
                    this.status.methodSelected = this.config.preferredMethod;
                    console.log(`🎯 Método forzado por configuración: ${this.status.methodSelected}`);
                }
            }

            // Mostrar resumen
            console.log('\n📋 RESUMEN DE CONEXIÓN:');
            console.log('=======================');
            console.log(`IP Actual: ${this.config.currentIP}`);
            console.log(`IP Autorizada: ${this.config.authorizedIP}`);
            console.log(`Método Seleccionado: ${this.status.methodSelected}`);
            console.log(`Credenciales: ${this.config.binanceApiKey ? '✅' : '❌'}`);

            // Ejecutar método seleccionado
            console.log('\n🚀 EJECUTANDO SISTEMA QBTC...');
            const exitCode = await this.executeSelectedMethod(this.status.methodSelected);

            return exitCode;

        } catch (error) {
            console.error('❌ Error en Master Launcher:', error);
            throw error;
        }
    }

    /**
     * Obtener estado del sistema
     */
    getStatus() {
        return {
            ...this.status,
            config: this.config,
            timestamp: Date.now()
        };
    }
}

// Función para mostrar menú interactivo
function showMenu() {
    console.log('\n🎛️ QBTC MASTER LAUNCHER - MENÚ');
    console.log('==============================');
    console.log('1. 🚀 Auto (detectar mejor método)');
    console.log('2. 🔗 Direct (IP actual)');
    console.log('3. 🌐 HTTP Proxy (headers)');
    console.log('4. 🔒 SOCKS5 Proxy (IP real)');
    console.log('5. 🛡️ VPN (conexión VPN)');
    console.log('6. 📊 Estado del sistema');
    console.log('7. ❌ Salir');
    console.log('==============================');
}

// Función principal interactiva
async function interactiveMode() {
    const launcher = new QBTCMasterLauncher();

    while (true) {
        showMenu();

        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const answer = await new Promise(resolve => {
            rl.question('Selecciona una opción (1-7): ', resolve);
        });

        rl.close();

        try {
            switch (answer.trim()) {
                case '1':
                    console.log('\n🚀 Modo AUTO seleccionado');
                    await launcher.launch();
                    break;
                case '2':
                    console.log('\n🔗 Modo DIRECT seleccionado');
                    launcher.config.preferredMethod = launcher.methods.DIRECT;
                    await launcher.executeSelectedMethod(launcher.methods.DIRECT);
                    break;
                case '3':
                    console.log('\n🌐 Modo HTTP_PROXY seleccionado');
                    launcher.config.preferredMethod = launcher.methods.HTTP_PROXY;
                    await launcher.executeSelectedMethod(launcher.methods.HTTP_PROXY);
                    break;
                case '4':
                    console.log('\n🔒 Modo SOCKS5 seleccionado');
                    launcher.config.preferredMethod = launcher.methods.SOCKS5;
                    await launcher.executeSelectedMethod(launcher.methods.SOCKS5);
                    break;
                case '5':
                    console.log('\n🛡️ Modo VPN seleccionado');
                    launcher.config.preferredMethod = launcher.methods.VPN;
                    await launcher.executeSelectedMethod(launcher.methods.VPN);
                    break;
                case '6':
                    console.log('\n📊 Estado del sistema:');
                    console.log(JSON.stringify(launcher.getStatus(), null, 2));
                    break;
                case '7':
                    console.log('\n👋 ¡Hasta luego!');
                    process.exit(0);
                    break;
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

// Exportar la clase
module.exports = { QBTCMasterLauncher };

// Si se ejecuta directamente
if (require.main === module) {
    // Verificar si hay argumentos de línea de comandos
    const args = process.argv.slice(2);

    if (args.includes('--auto') || args.includes('-a')) {
        // Modo automático
        const launcher = new QBTCMasterLauncher();
        launcher.launch()
            .then(() => {
                console.log('🎉 QBTC Master Launcher completado');
            })
            .catch(error => {
                console.error('❌ Error en Master Launcher:', error);
                process.exit(1);
            });
    } else if (args.includes('--interactive') || args.includes('-i')) {
        // Modo interactivo
        interactiveMode();
    } else {
        // Mostrar ayuda
        console.log('🎛️ QBTC Master Launcher');
        console.log('======================');
        console.log('Uso:');
        console.log('  node qbtc-master-launcher.cjs --auto        # Modo automático');
        console.log('  node qbtc-master-launcher.cjs --interactive # Modo interactivo');
        console.log('  node qbtc-master-launcher.cjs               # Esta ayuda');
        console.log('');
        console.log('Métodos disponibles:');
        console.log('  🔗 DIRECT: Conexión directa (requiere IP autorizada)');
        console.log('  🌐 HTTP_PROXY: Proxy HTTP (modifica headers)');
        console.log('  🔒 SOCKS5: Proxy SOCKS5 (cambia IP real)');
        console.log('  🛡️ VPN: Conexión VPN automática');
        process.exit(0);
    }

    // Manejar señales de terminación
    process.on('SIGINT', () => {
        console.log('\n🔄 Master Launcher detenido por SIGINT');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n🔄 Master Launcher detenido por SIGTERM');
        process.exit(0);
    });
}