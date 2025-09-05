#!/usr/bin/env node

/**
 * QBTC Proxy Configuration Tool
 * Herramienta para configurar proveedores de proxy y VPN
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Cargar variables de entorno existentes
require('dotenv').config({ path: path.join(__dirname, '.env') });

class QBTCProxyConfigurator {
    constructor() {
        this.envPath = path.join(__dirname, '.env');
        this.providers = {
            brightdata: {
                name: 'Bright Data (Lumiproxy)',
                description: 'Servicio premium de proxy residencial',
                website: 'https://brightdata.com',
                envVars: ['BRIGHTDATA_HOST', 'BRIGHTDATA_PORT', 'BRIGHTDATA_USERNAME', 'BRIGHTDATA_PASSWORD']
            },
            oxylabs: {
                name: 'Oxylabs',
                description: 'Proxy residencial de alta calidad',
                website: 'https://oxylabs.io',
                envVars: ['OXYLABS_HOST', 'OXYLABS_PORT', 'OXYLABS_USERNAME', 'OXYLABS_PASSWORD']
            },
            smartproxy: {
                name: 'Smart Proxy',
                description: 'Proxy residencial con rotación automática',
                website: 'https://smartproxy.com',
                envVars: ['SMARTPROXY_HOST', 'SMARTPROXY_PORT', 'SMARTPROXY_USERNAME', 'SMARTPROXY_PASSWORD']
            },
            custom: {
                name: 'Proxy Personalizado',
                description: 'Configura tu propio servidor proxy',
                website: null,
                envVars: ['CUSTOM_PROXY_HOST', 'CUSTOM_PROXY_PORT', 'CUSTOM_PROXY_USER', 'CUSTOM_PROXY_PASS']
            },
            vpn: {
                name: 'VPN Configuration',
                description: 'Configuración para VPN',
                website: null,
                envVars: ['VPN_TYPE', 'VPN_HOST', 'VPN_PORT', 'VPN_USERNAME', 'VPN_PASSWORD', 'VPN_CONFIG_FILE']
            }
        };

        console.log('🔧 QBTC Proxy Configurator');
        console.log('==========================');
    }

    /**
     * Leer archivo .env
     */
    readEnvFile() {
        try {
            if (fs.existsSync(this.envPath)) {
                return fs.readFileSync(this.envPath, 'utf8');
            }
        } catch (error) {
            console.error('❌ Error leyendo archivo .env:', error.message);
        }
        return '';
    }

    /**
     * Escribir archivo .env
     */
    writeEnvFile(content) {
        try {
            fs.writeFileSync(this.envPath, content, 'utf8');
            console.log('✅ Archivo .env actualizado');
        } catch (error) {
            console.error('❌ Error escribiendo archivo .env:', error.message);
        }
    }

    /**
     * Actualizar variable de entorno
     */
    updateEnvVar(key, value) {
        let envContent = this.readEnvFile();

        // Si la variable ya existe, actualizarla
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (regex.test(envContent)) {
            envContent = envContent.replace(regex, `${key}=${value}`);
        } else {
            // Si no existe, añadirla al final
            envContent += `\n${key}=${value}`;
        }

        this.writeEnvFile(envContent);
        console.log(`✅ ${key} configurado`);
    }

    /**
     * Configurar Bright Data
     */
    async configureBrightData() {
        console.log('\n🌟 CONFIGURACIÓN BRIGHT DATA');
        console.log('============================');

        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const ask = (question) => new Promise(resolve => rl.question(question, resolve));

        try {
            console.log('📋 Información necesaria:');
            console.log('   • Host: Tu zona (ej: your-zone-country-city.lum-superproxy.io)');
            console.log('   • Puerto: 22225 (predeterminado)');
            console.log('   • Username: Tu username de Bright Data');
            console.log('   • Password: Tu password de Bright Data');
            console.log('');

            const host = await ask('Host (zona de Bright Data): ');
            const port = await ask('Puerto (22225): ') || '22225';
            const username = await ask('Username: ');
            const password = await ask('Password: ');

            rl.close();

            if (!host || !username || !password) {
                console.log('❌ Todos los campos son obligatorios');
                return false;
            }

            this.updateEnvVar('BRIGHTDATA_HOST', host);
            this.updateEnvVar('BRIGHTDATA_PORT', port);
            this.updateEnvVar('BRIGHTDATA_USERNAME', username);
            this.updateEnvVar('BRIGHTDATA_PASSWORD', password);

            console.log('\n✅ Bright Data configurado exitosamente');
            console.log('💡 Para activar: node qbtc-smart-proxy.cjs');

            return true;

        } catch (error) {
            console.error('❌ Error configurando Bright Data:', error.message);
            rl.close();
            return false;
        }
    }

    /**
     * Configurar Oxylabs
     */
    async configureOxylabs() {
        console.log('\n🧪 CONFIGURACIÓN OXYLABS');
        console.log('========================');

        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const ask = (question) => new Promise(resolve => rl.question(question, resolve));

        try {
            console.log('📋 Información necesaria:');
            console.log('   • Host: pr.oxylabs.io');
            console.log('   • Puerto: 7777 (predeterminado)');
            console.log('   • Username: Tu username de Oxylabs');
            console.log('   • Password: Tu password de Oxylabs');
            console.log('');

            const host = await ask('Host (pr.oxylabs.io): ') || 'pr.oxylabs.io';
            const port = await ask('Puerto (7777): ') || '7777';
            const username = await ask('Username: ');
            const password = await ask('Password: ');

            rl.close();

            if (!username || !password) {
                console.log('❌ Username y password son obligatorios');
                return false;
            }

            this.updateEnvVar('OXYLABS_HOST', host);
            this.updateEnvVar('OXYLABS_PORT', port);
            this.updateEnvVar('OXYLABS_USERNAME', username);
            this.updateEnvVar('OXYLABS_PASSWORD', password);

            console.log('\n✅ Oxylabs configurado exitosamente');
            console.log('💡 Para activar: node qbtc-smart-proxy.cjs');

            return true;

        } catch (error) {
            console.error('❌ Error configurando Oxylabs:', error.message);
            rl.close();
            return false;
        }
    }

    /**
     * Configurar Smart Proxy
     */
    async configureSmartProxy() {
        console.log('\n🎯 CONFIGURACIÓN SMART PROXY');
        console.log('============================');

        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const ask = (question) => new Promise(resolve => rl.question(question, resolve));

        try {
            console.log('📋 Información necesaria:');
            console.log('   • Host: gate.smartproxy.com');
            console.log('   • Puerto: 7000 (predeterminado)');
            console.log('   • Username: Tu username de Smart Proxy');
            console.log('   • Password: Tu password de Smart Proxy');
            console.log('');

            const host = await ask('Host (gate.smartproxy.com): ') || 'gate.smartproxy.com';
            const port = await ask('Puerto (7000): ') || '7000';
            const username = await ask('Username: ');
            const password = await ask('Password: ');

            rl.close();

            if (!username || !password) {
                console.log('❌ Username y password son obligatorios');
                return false;
            }

            this.updateEnvVar('SMARTPROXY_HOST', host);
            this.updateEnvVar('SMARTPROXY_PORT', port);
            this.updateEnvVar('SMARTPROXY_USERNAME', username);
            this.updateEnvVar('SMARTPROXY_PASSWORD', password);

            console.log('\n✅ Smart Proxy configurado exitosamente');
            console.log('💡 Para activar: node qbtc-smart-proxy.cjs');

            return true;

        } catch (error) {
            console.error('❌ Error configurando Smart Proxy:', error.message);
            rl.close();
            return false;
        }
    }

    /**
     * Configurar proxy personalizado
     */
    async configureCustomProxy() {
        console.log('\n🔧 CONFIGURACIÓN PROXY PERSONALIZADO');
        console.log('====================================');

        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const ask = (question) => new Promise(resolve => rl.question(question, resolve));

        try {
            console.log('📋 Información necesaria:');
            console.log('   • Host: IP o dominio de tu servidor proxy');
            console.log('   • Puerto: Puerto del proxy (ej: 1080, 3128)');
            console.log('   • Username: Usuario (opcional)');
            console.log('   • Password: Contraseña (opcional)');
            console.log('');

            const host = await ask('Host/IP del proxy: ');
            const port = await ask('Puerto del proxy: ');
            const username = await ask('Username (opcional): ');
            const password = await ask('Password (opcional): ');

            rl.close();

            if (!host || !port) {
                console.log('❌ Host y puerto son obligatorios');
                return false;
            }

            this.updateEnvVar('CUSTOM_PROXY_HOST', host);
            this.updateEnvVar('CUSTOM_PROXY_PORT', port);

            if (username) this.updateEnvVar('CUSTOM_PROXY_USER', username);
            if (password) this.updateEnvVar('CUSTOM_PROXY_PASS', password);

            console.log('\n✅ Proxy personalizado configurado exitosamente');
            console.log('💡 Para activar: node qbtc-smart-proxy.cjs');

            return true;

        } catch (error) {
            console.error('❌ Error configurando proxy personalizado:', error.message);
            rl.close();
            return false;
        }
    }

    /**
     * Configurar VPN
     */
    async configureVPN() {
        console.log('\n🛡️ CONFIGURACIÓN VPN');
        console.log('====================');

        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const ask = (question) => new Promise(resolve => rl.question(question, resolve));

        try {
            console.log('📋 Tipos de VPN soportados:');
            console.log('   1. OpenVPN (.ovpn file)');
            console.log('   2. Sistema VPN (Windows/Linux)');
            console.log('   3. IKEv2/Cisco AnyConnect');
            console.log('');

            const vpnType = await ask('Tipo de VPN (openvpn/system/ikev2): ') || 'system';
            const host = await ask('Host/IP del VPN (opcional): ');
            const port = await ask('Puerto del VPN (opcional): ');
            const username = await ask('Username (opcional): ');
            const password = await ask('Password (opcional): ');

            if (vpnType === 'openvpn') {
                const configFile = await ask('Ruta al archivo .ovpn: ');
                if (configFile) {
                    this.updateEnvVar('VPN_CONFIG_FILE', configFile);
                }
            }

            rl.close();

            this.updateEnvVar('VPN_TYPE', vpnType);
            if (host) this.updateEnvVar('VPN_HOST', host);
            if (port) this.updateEnvVar('VPN_PORT', port);
            if (username) this.updateEnvVar('VPN_USERNAME', username);
            if (password) this.updateEnvVar('VPN_PASSWORD', password);

            console.log('\n✅ VPN configurado exitosamente');
            console.log('💡 Para activar: node qbtc-vpn-connector.cjs');

            return true;

        } catch (error) {
            console.error('❌ Error configurando VPN:', error.message);
            rl.close();
            return false;
        }
    }

    /**
     * Configurar opciones generales
     */
    async configureGeneral() {
        console.log('\n⚙️ CONFIGURACIÓN GENERAL');
        console.log('=======================');

        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const ask = (question) => new Promise(resolve => rl.question(question, resolve));

        try {
            console.log('📋 Opciones disponibles:');
            console.log('   • Rotación automática de proxies: true/false');
            console.log('   • Puerto del monitor: 9099 (predeterminado)');
            console.log('   • Método de conexión preferido: auto/direct/socks5/vpn');
            console.log('');

            const rotation = await ask('¿Activar rotación automática? (true/false): ') || 'true';
            const monitorPort = await ask('Puerto del monitor (9099): ') || '9099';
            const preferredMethod = await ask('Método preferido (auto): ') || 'auto';

            rl.close();

            this.updateEnvVar('PROXY_ROTATION', rotation);
            this.updateEnvVar('MONITOR_PORT', monitorPort);
            this.updateEnvVar('CONNECTION_METHOD', preferredMethod);

            console.log('\n✅ Configuración general actualizada');

            return true;

        } catch (error) {
            console.error('❌ Error en configuración general:', error.message);
            rl.close();
            return false;
        }
    }

    /**
     * Mostrar configuración actual
     */
    showCurrentConfig() {
        console.log('\n📋 CONFIGURACIÓN ACTUAL');
        console.log('=======================');

        const envContent = this.readEnvFile();
        const lines = envContent.split('\n');

        const proxyVars = [
            'BRIGHTDATA_HOST', 'BRIGHTDATA_PORT', 'BRIGHTDATA_USERNAME', 'BRIGHTDATA_PASSWORD',
            'OXYLABS_HOST', 'OXYLABS_PORT', 'OXYLABS_USERNAME', 'OXYLABS_PASSWORD',
            'SMARTPROXY_HOST', 'SMARTPROXY_PORT', 'SMARTPROXY_USERNAME', 'SMARTPROXY_PASSWORD',
            'CUSTOM_PROXY_HOST', 'CUSTOM_PROXY_PORT', 'CUSTOM_PROXY_USER', 'CUSTOM_PROXY_PASS',
            'VPN_TYPE', 'VPN_HOST', 'VPN_PORT', 'VPN_USERNAME', 'VPN_PASSWORD', 'VPN_CONFIG_FILE',
            'PROXY_ROTATION', 'MONITOR_PORT', 'CONNECTION_METHOD'
        ];

        proxyVars.forEach(varName => {
            const line = lines.find(l => l.startsWith(`${varName}=`));
            if (line) {
                const value = line.split('=')[1];
                const maskedValue = varName.includes('PASSWORD') || varName.includes('PASS') ?
                    '***' : value;
                console.log(`   ${varName}: ${maskedValue}`);
            }
        });
    }

    /**
     * Menú interactivo
     */
    async showMenu() {
        console.log('\n🎛️ QBTC PROXY CONFIGURATOR - MENÚ');
        console.log('=================================');
        console.log('1. 🌟 Configurar Bright Data');
        console.log('2. 🧪 Configurar Oxylabs');
        console.log('3. 🎯 Configurar Smart Proxy');
        console.log('4. 🔧 Configurar Proxy Personalizado');
        console.log('5. 🛡️ Configurar VPN');
        console.log('6. ⚙️ Configuración General');
        console.log('7. 📋 Ver Configuración Actual');
        console.log('8. 🧪 Probar Configuración');
        console.log('9. ❌ Salir');
        console.log('=================================');

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
     * Probar configuración
     */
    async testConfiguration() {
        console.log('\n🧪 PROBANDO CONFIGURACIÓN');
        console.log('=========================');

        try {
            // Probar Smart Proxy si está configurado
            const { QBTCSmartProxy } = require('./qbtc-smart-proxy.cjs');
            const smartProxy = new QBTCSmartProxy();

            console.log('🔍 Probando Smart Proxy...');
            const initialized = await smartProxy.initializeSystem();

            if (initialized) {
                console.log('✅ Configuración funcionando correctamente');
                console.log('📊 Estado:', smartProxy.getSystemState());
                console.log('📈 Métricas:', smartProxy.getSystemMetrics());
            } else {
                console.log('❌ Error en la configuración');
            }

        } catch (error) {
            console.error('❌ Error probando configuración:', error.message);
        }
    }

    /**
     * Ejecutar menú interactivo
     */
    async runInteractive() {
        while (true) {
            const choice = await this.showMenu();

            try {
                switch (choice) {
                    case '1':
                        await this.configureBrightData();
                        break;
                    case '2':
                        await this.configureOxylabs();
                        break;
                    case '3':
                        await this.configureSmartProxy();
                        break;
                    case '4':
                        await this.configureCustomProxy();
                        break;
                    case '5':
                        await this.configureVPN();
                        break;
                    case '6':
                        await this.configureGeneral();
                        break;
                    case '7':
                        this.showCurrentConfig();
                        break;
                    case '8':
                        await this.testConfiguration();
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

// Función para configuración rápida
async function quickSetup() {
    const configurator = new QBTCProxyConfigurator();

    console.log('🚀 CONFIGURACIÓN RÁPIDA QBTC PROXY');
    console.log('==================================');

    // Configurar valores por defecto útiles
    configurator.updateEnvVar('PROXY_ROTATION', 'true');
    configurator.updateEnvVar('MONITOR_PORT', '9099');
    configurator.updateEnvVar('CONNECTION_METHOD', 'auto');

    // Configurar proxy personalizado con IP autorizada
    configurator.updateEnvVar('CUSTOM_PROXY_HOST', '181.43.212.196');
    configurator.updateEnvVar('CUSTOM_PROXY_PORT', '1080');

    console.log('✅ Configuración rápida completada');
    console.log('💡 Valores configurados:');
    console.log('   • Rotación automática: ACTIVADA');
    console.log('   • Puerto monitor: 9099');
    console.log('   • Método preferido: auto');
    console.log('   • Proxy personalizado: 181.43.212.196:1080');
}

// Si se ejecuta directamente
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.includes('--quick') || args.includes('-q')) {
        // Configuración rápida
        quickSetup();
    } else if (args.includes('--interactive') || args.includes('-i')) {
        // Modo interactivo
        const configurator = new QBTCProxyConfigurator();
        configurator.runInteractive();
    } else if (args.includes('--show') || args.includes('-s')) {
        // Mostrar configuración actual
        const configurator = new QBTCProxyConfigurator();
        configurator.showCurrentConfig();
    } else {
        // Mostrar ayuda
        console.log('🔧 QBTC Proxy Configurator');
        console.log('==========================');
        console.log('Uso:');
        console.log('  node qbtc-proxy-config.cjs --quick         # Configuración rápida');
        console.log('  node qbtc-proxy-config.cjs --interactive   # Configuración interactiva');
        console.log('  node qbtc-proxy-config.cjs --show          # Ver configuración actual');
        console.log('  node qbtc-proxy-config.cjs                 # Esta ayuda');
        console.log('');
        console.log('Proveedores soportados:');
        console.log('  🌟 Bright Data - Proxy residencial premium');
        console.log('  🧪 Oxylabs - Proxy de alta calidad');
        console.log('  🎯 Smart Proxy - Rotación automática');
        console.log('  🔧 Proxy Personalizado - Tu propio servidor');
        console.log('  🛡️ VPN - Conexión VPN automática');
        process.exit(0);
    }

    // Manejar señales de terminación
    process.on('SIGINT', () => {
        console.log('\n🔄 Configurator detenido por SIGINT');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n🔄 Configurator detenido por SIGTERM');
        process.exit(0);
    });
}

// Exportar la clase
module.exports = { QBTCProxyConfigurator };