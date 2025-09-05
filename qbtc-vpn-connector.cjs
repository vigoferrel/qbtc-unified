#!/usr/bin/env node

/**
 * QBTC VPN Connector
 * Sistema que se conecta automáticamente a VPN y ejecuta QBTC
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Cargar variables de entorno
require('dotenv').config({ path: path.join(__dirname, '.env') });

class QBTCVPNConnector {
    constructor() {
        console.log('🔧 QBTC VPN Connector - Inicializando...');

        this.vpnConfig = {
            type: process.env.VPN_TYPE || 'openvpn', // openvpn, wireguard, ikev2
            configFile: process.env.VPN_CONFIG_FILE || null,
            host: process.env.VPN_HOST || null,
            port: process.env.VPN_PORT || null,
            username: process.env.VPN_USERNAME || null,
            password: process.env.VPN_PASSWORD || null,
            targetIP: '181.43.212.196' // IP autorizada en Binance
        };

        this.systemState = {
            vpnConnected: false,
            qbtcRunning: false,
            lastUpdate: Date.now()
        };
    }

    /**
     * Verificar si VPN está conectado
     */
    async checkVPNConnection() {
        return new Promise((resolve) => {
            // Ejecutar comando para verificar IP externa
            const curl = spawn('curl', ['-s', 'http://ipinfo.io/ip'], {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let output = '';
            curl.stdout.on('data', (data) => {
                output += data.toString();
            });

            curl.on('close', (code) => {
                if (code === 0) {
                    const currentIP = output.trim();
                    const isTargetIP = currentIP === this.vpnConfig.targetIP;

                    console.log(`📡 IP actual: ${currentIP}`);
                    console.log(`🎯 IP objetivo: ${this.vpnConfig.targetIP}`);
                    console.log(`✅ VPN conectado: ${isTargetIP ? 'SÍ' : 'NO'}`);

                    resolve({
                        connected: isTargetIP,
                        currentIP: currentIP,
                        targetIP: this.vpnConfig.targetIP
                    });
                } else {
                    console.log('❌ Error verificando IP');
                    resolve({ connected: false, error: 'Check failed' });
                }
            });

            curl.on('error', () => {
                // Fallback: usar ipconfig/ifconfig
                this.checkVPNConnectionFallback().then(resolve);
            });
        });
    }

    /**
     * Método alternativo para verificar conexión VPN
     */
    async checkVPNConnectionFallback() {
        return new Promise((resolve) => {
            const platform = os.platform();
            let command, args;

            if (platform === 'win32') {
                command = 'ipconfig';
                args = [];
            } else {
                command = 'ifconfig';
                args = [];
            }

            const proc = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });

            let output = '';
            proc.stdout.on('data', (data) => {
                output += data.toString();
            });

            proc.on('close', () => {
                // Buscar interfaces VPN
                const hasVPN = output.includes('VPN') ||
                              output.includes('tun') ||
                              output.includes('tap') ||
                              output.includes('ppp');

                console.log(`🔍 VPN interfaces detectadas: ${hasVPN ? 'SÍ' : 'NO'}`);
                resolve({
                    connected: hasVPN,
                    method: 'interface_check',
                    platform: platform
                });
            });

            proc.on('error', () => {
                resolve({ connected: false, error: 'Fallback check failed' });
            });
        });
    }

    /**
     * Conectar a VPN usando OpenVPN
     */
    async connectOpenVPN() {
        console.log('🔗 Conectando a OpenVPN...');

        if (!this.vpnConfig.configFile) {
            throw new Error('Archivo de configuración VPN no especificado');
        }

        return new Promise((resolve, reject) => {
            const configPath = path.resolve(this.vpnConfig.configFile);

            if (!fs.existsSync(configPath)) {
                reject(new Error(`Archivo de configuración no encontrado: ${configPath}`));
                return;
            }

            console.log(`📁 Usando configuración: ${configPath}`);

            const openvpn = spawn('openvpn', ['--config', configPath], {
                stdio: ['pipe', 'pipe', 'pipe'],
                detached: true
            });

            let connected = false;
            let timeout = setTimeout(() => {
                if (!connected) {
                    openvpn.kill();
                    reject(new Error('Timeout conectando a VPN'));
                }
            }, 30000); // 30 segundos timeout

            openvpn.stdout.on('data', (data) => {
                const output = data.toString();
                console.log('🔗 OpenVPN:', output.trim());

                if (output.includes('Initialization Sequence Completed')) {
                    connected = true;
                    clearTimeout(timeout);
                    console.log('✅ VPN conectado exitosamente');
                    resolve(openvpn);
                }
            });

            openvpn.stderr.on('data', (data) => {
                console.log('⚠️ OpenVPN stderr:', data.toString().trim());
            });

            openvpn.on('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });

            openvpn.on('close', (code) => {
                clearTimeout(timeout);
                if (!connected) {
                    reject(new Error(`OpenVPN cerró con código ${code}`));
                }
            });
        });
    }

    /**
     * Conectar usando comando del sistema
     */
    async connectSystemVPN() {
        console.log('🔗 Conectando VPN del sistema...');

        const platform = os.platform();
        let command, args;

        if (platform === 'win32') {
            // Windows - usar rasdial o similar
            command = 'rasdial';
            args = [this.vpnConfig.host || 'QBTC-VPN'];
        } else if (platform === 'linux') {
            // Linux - usar nmcli
            command = 'nmcli';
            args = ['connection', 'up', this.vpnConfig.host || 'QBTC-VPN'];
        } else if (platform === 'darwin') {
            // macOS - usar scutil
            command = 'networksetup';
            args = ['-connectpppoeservice', this.vpnConfig.host || 'QBTC-VPN'];
        } else {
            throw new Error(`Plataforma no soportada: ${platform}`);
        }

        return new Promise((resolve, reject) => {
            const vpn = spawn(command, args, {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let connected = false;
            let timeout = setTimeout(() => {
                if (!connected) {
                    vpn.kill();
                    reject(new Error('Timeout conectando VPN del sistema'));
                }
            }, 20000);

            vpn.stdout.on('data', (data) => {
                const output = data.toString();
                console.log('🔗 System VPN:', output.trim());

                if (output.includes('connected') || output.includes('Connected') ||
                    output.includes('success') || output.includes('Success')) {
                    connected = true;
                    clearTimeout(timeout);
                    console.log('✅ VPN del sistema conectado');
                    resolve(vpn);
                }
            });

            vpn.stderr.on('data', (data) => {
                console.log('⚠️ System VPN stderr:', data.toString().trim());
            });

            vpn.on('close', (code) => {
                clearTimeout(timeout);
                if (code === 0 && connected) {
                    resolve(vpn);
                } else if (!connected) {
                    reject(new Error(`VPN del sistema cerró con código ${code}`));
                }
            });

            vpn.on('error', reject);
        });
    }

    /**
     * Ejecutar QBTC después de conectar VPN
     */
    async runQBTCAfterVPN(vpnProcess = null) {
        console.log('🚀 Ejecutando QBTC después de VPN...');

        // Verificar conexión VPN
        const vpnStatus = await this.checkVPNConnection();

        if (!vpnStatus.connected) {
            console.log('⚠️ VPN no detectado, ejecutando QBTC de todos modos...');
        } else {
            console.log('✅ VPN confirmado, ejecutando QBTC...');
        }

        // Ejecutar QBTC
        const qbtcProcess = spawn('node', ['system-integrator.cjs'], {
            stdio: 'inherit',
            env: {
                ...process.env,
                VPN_CONNECTED: vpnStatus.connected ? 'true' : 'false',
                CURRENT_IP: vpnStatus.currentIP || 'unknown'
            }
        });

        this.systemState.qbtcRunning = true;

        qbtcProcess.on('close', (code) => {
            console.log(`\n🔄 QBTC terminado con código: ${code}`);
            this.systemState.qbtcRunning = false;

            // Si VPN estaba corriendo, mantenerla
            if (vpnProcess && !vpnProcess.killed) {
                console.log('🔗 Manteniendo conexión VPN activa...');
            }
        });

        qbtcProcess.on('error', (err) => {
            console.error(`❌ Error ejecutando QBTC: ${err.message}`);
            this.systemState.qbtcRunning = false;
        });

        return qbtcProcess;
    }

    /**
     * Método principal para conectar VPN y ejecutar QBTC
     */
    async connectAndRun() {
        try {
            console.log('🚀 INICIANDO CONEXIÓN VPN + QBTC');
            console.log('================================');

            // Verificar estado inicial
            console.log('🔍 Verificando estado inicial...');
            const initialStatus = await this.checkVPNConnection();

            if (initialStatus.connected) {
                console.log('✅ VPN ya está conectado');
                this.systemState.vpnConnected = true;
                return await this.runQBTCAfterVPN();
            }

            // Intentar conectar VPN
            console.log('🔗 Conectando VPN...');

            let vpnProcess;

            try {
                if (this.vpnConfig.type === 'openvpn') {
                    vpnProcess = await this.connectOpenVPN();
                } else {
                    vpnProcess = await this.connectSystemVPN();
                }

                this.systemState.vpnConnected = true;

                // Pequeña pausa para estabilizar conexión
                await new Promise(resolve => setTimeout(resolve, 3000));

                // Verificar conexión
                const finalStatus = await this.checkVPNConnection();

                if (finalStatus.connected) {
                    console.log('🎉 VPN conectado exitosamente');
                    return await this.runQBTCAfterVPN(vpnProcess);
                } else {
                    console.log('⚠️ VPN reporta conectado pero IP no coincide');
                    console.log('💡 Continuando con QBTC de todos modos...');
                    return await this.runQBTCAfterVPN(vpnProcess);
                }

            } catch (vpnError) {
                console.error('❌ Error conectando VPN:', vpnError.message);
                console.log('💡 Intentando ejecutar QBTC sin VPN...');
                return await this.runQBTCAfterVPN();
            }

        } catch (error) {
            console.error('❌ Error en sistema VPN:', error);
            throw error;
        }
    }

    /**
     * Obtener estado del sistema
     */
    getSystemState() {
        return {
            ...this.systemState,
            vpnConfig: {
                type: this.vpnConfig.type,
                host: this.vpnConfig.host,
                targetIP: this.vpnConfig.targetIP
            },
            timestamp: Date.now()
        };
    }
}

// Exportar la clase
module.exports = { QBTCVPNConnector };

// Si se ejecuta directamente
if (require.main === module) {
    const vpnConnector = new QBTCVPNConnector();

    vpnConnector.connectAndRun()
        .then(() => {
            console.log('🎉 Sistema VPN + QBTC iniciado');
        })
        .catch(error => {
            console.error('❌ Error en sistema VPN:', error);
            process.exit(1);
        });

    // Manejar señales de terminación
    process.on('SIGINT', () => {
        console.log('\n🔄 Sistema VPN detenido por SIGINT');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n🔄 Sistema VPN detenido por SIGTERM');
        process.exit(0);
    });
}