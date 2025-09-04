#!/usr/bin/env node
/*
  QBTC OPENVPN IP CHANGER
  Cambia la IP de OpenVPN a 181.43.212.196
*/

const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

class OpenVPNIPChanger {
    constructor() {
        this.targetIP = '181.43.212.196';
        this.currentIP = null;
        this.execAsync = promisify(exec);
        this.openvpnPath = 'C:\\Program Files\\OpenVPN\\bin\\openvpn.exe';
        this.configPath = 'C:\\Program Files\\OpenVPN\\config';
    }

    async changeOpenVPNIP() {
        console.log('🔧 CAMBIANDO IP DE OPENVPN A 181.43.212.196');
        console.log('============================================\n');

        // 1. Verificar IP actual
        await this.checkCurrentIP();

        // 2. Detectar OpenVPN
        await this.detectOpenVPN();

        // 3. Mostrar configuraciones disponibles
        await this.showAvailableConfigs();

        // 4. Cambiar configuración
        await this.changeOpenVPNConfig();

        // 5. Verificar cambio
        await this.verifyIPChange();

        // 6. Configurar Binance
        await this.configureBinance();
    }

    async checkCurrentIP() {
        console.log('🔍 1. VERIFICANDO IP ACTUAL...');
        
        try {
            const response = await this.getIPFromService('https://ipv4.icanhazip.com');
            this.currentIP = response.trim();
            console.log(`   📍 IP actual: ${this.currentIP}`);
            
            if (this.currentIP === this.targetIP) {
                console.log('   ✅ Ya tienes la IP correcta!');
                return true;
            } else {
                console.log(`   🔄 Necesitas cambiar de ${this.currentIP} a ${this.targetIP}`);
                return false;
            }
        } catch (error) {
            console.log(`   ❌ Error verificando IP: ${error.message}`);
            return false;
        }
    }

    async detectOpenVPN() {
        console.log('\n🔍 2. DETECTANDO OPENVPN...');
        
        // Verificar si OpenVPN está instalado
        try {
            const { stdout } = await this.execAsync(`"${this.openvpnPath}" --version`);
            console.log('   ✅ OpenVPN detectado');
            console.log(`   📍 Ruta: ${this.openvpnPath}`);
            return true;
        } catch (error) {
            console.log('   ❌ OpenVPN no encontrado en la ruta estándar');
            
            // Buscar en otras rutas comunes
            const commonPaths = [
                'C:\\Program Files (x86)\\OpenVPN\\bin\\openvpn.exe',
                'C:\\OpenVPN\\bin\\openvpn.exe',
                'C:\\Users\\DELL\\AppData\\Local\\OpenVPN\\bin\\openvpn.exe'
            ];
            
            for (const path of commonPaths) {
                try {
                    const { stdout } = await this.execAsync(`"${path}" --version`);
                    console.log(`   ✅ OpenVPN encontrado en: ${path}`);
                    this.openvpnPath = path;
                    return true;
                } catch (err) {
                    // Continuar buscando
                }
            }
            
            console.log('   ❌ OpenVPN no encontrado en ninguna ruta común');
            return false;
        }
    }

    async showAvailableConfigs() {
        console.log('\n📋 3. CONFIGURACIONES DISPONIBLES...');
        
        // Verificar directorio de configuraciones
        if (!fs.existsSync(this.configPath)) {
            console.log('   ❌ Directorio de configuraciones no encontrado');
            console.log('   📍 Buscando en otras ubicaciones...');
            
            const commonConfigPaths = [
                'C:\\Program Files (x86)\\OpenVPN\\config',
                'C:\\OpenVPN\\config',
                'C:\\Users\\DELL\\AppData\\Local\\OpenVPN\\config',
                'C:\\Users\\DELL\\Documents\\OpenVPN\\config'
            ];
            
            for (const configPath of commonConfigPaths) {
                if (fs.existsSync(configPath)) {
                    this.configPath = configPath;
                    console.log(`   ✅ Configuraciones encontradas en: ${configPath}`);
                    break;
                }
            }
        } else {
            console.log(`   ✅ Directorio de configuraciones: ${this.configPath}`);
        }

        // Listar archivos .ovpn
        try {
            const files = fs.readdirSync(this.configPath);
            const ovpnFiles = files.filter(file => file.endsWith('.ovpn'));
            
            if (ovpnFiles.length > 0) {
                console.log('   📁 Archivos de configuración disponibles:');
                ovpnFiles.forEach((file, index) => {
                    console.log(`      ${index + 1}. ${file}`);
                });
            } else {
                console.log('   ❌ No se encontraron archivos .ovpn');
            }
        } catch (error) {
            console.log(`   ❌ Error leyendo configuraciones: ${error.message}`);
        }
    }

    async changeOpenVPNConfig() {
        console.log('\n🔄 4. CAMBIANDO CONFIGURACIÓN OPENVPN...');
        
        console.log('   📋 INSTRUCCIONES PARA CAMBIAR IP:');
        console.log('   1. Abre el cliente OpenVPN GUI');
        console.log('   2. Haz clic derecho en el ícono de OpenVPN en la bandeja del sistema');
        console.log('   3. Selecciona "Disconnect" si está conectado');
        console.log('   4. Selecciona "Connect" y elige una configuración que use la IP: 181.43.212.196');
        console.log('   5. O modifica un archivo .ovpn para usar un servidor específico');
        
        console.log('\n   🎯 IP OBJETIVO: 181.43.212.196');
        console.log('   📍 Busca servidores en: Chile, Argentina, Brasil, México');
        
        // Mostrar opciones de servidores
        console.log('\n   🌐 SERVIDORES RECOMENDADOS:');
        console.log('   - Chile (CL): 181.43.212.196');
        console.log('   - Argentina (AR): Buscar servidor con IP similar');
        console.log('   - Brasil (BR): Buscar servidor con IP similar');
        console.log('   - México (MX): Buscar servidor con IP similar');
        
        console.log('\n   ⏳ Presiona Enter cuando hayas cambiado la configuración...');
        await this.waitForUserInput();
    }

    async verifyIPChange() {
        console.log('\n✅ 5. VERIFICANDO CAMBIO DE IP...');
        
        let attempts = 0;
        const maxAttempts = 15;
        
        while (attempts < maxAttempts) {
            try {
                const response = await this.getIPFromService('https://ipv4.icanhazip.com');
                const newIP = response.trim();
                
                console.log(`   📍 Intento ${attempts + 1}: ${newIP}`);
                
                if (newIP === this.targetIP) {
                    console.log('   🎉 ¡IP cambiada exitosamente!');
                    this.currentIP = newIP;
                    return true;
                }
                
                attempts++;
                if (attempts < maxAttempts) {
                    console.log('   ⏳ Esperando 2 segundos...');
                    await this.sleep(2000);
                }
            } catch (error) {
                console.log(`   ❌ Error verificando IP: ${error.message}`);
                attempts++;
            }
        }
        
        console.log('   ⚠️ No se pudo verificar el cambio de IP');
        console.log('   💡 Asegúrate de que OpenVPN esté conectado y usando el servidor correcto');
        return false;
    }

    async configureBinance() {
        console.log('\n🔧 6. CONFIGURANDO BINANCE...');
        
        if (this.currentIP === this.targetIP) {
            console.log('   ✅ IP correcta detectada');
            console.log('   📋 PASOS PARA BINANCE:');
            console.log('   1. Ve a tu cuenta de Binance');
            console.log('   2. API Management');
            console.log('   3. Añade esta IP a la whitelist: 181.43.212.196');
            console.log('   4. O habilita "Unrestricted" temporalmente');
            console.log('   5. Guarda los cambios');
            
            console.log('\n   🚀 Ahora puedes ejecutar: node system-integrator.js');
        } else {
            console.log('   ❌ IP no coincide con el objetivo');
            console.log('   🔄 Asegúrate de que OpenVPN use la IP: 181.43.212.196');
            console.log('   💡 Prueba diferentes servidores de OpenVPN');
        }
    }

    async getIPFromService(url) {
        return new Promise((resolve, reject) => {
            const req = https.request(url, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(data));
            });
            
            req.on('error', reject);
            req.setTimeout(5000, () => {
                req.destroy();
                reject(new Error('Timeout'));
            });
            
            req.end();
        });
    }

    async waitForUserInput() {
        return new Promise((resolve) => {
            process.stdin.once('data', () => {
                resolve();
            });
        });
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Ejecutar el script
async function main() {
    const changer = new OpenVPNIPChanger();
    await changer.changeOpenVPNIP();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = OpenVPNIPChanger;
