#!/usr/bin/env node
/*
  CREADOR DE VPN PRIVADA CON IP FIJA
  Automatiza la creación de un servidor VPN WireGuard en DigitalOcean
*/

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

class VPNCreator {
    constructor() {
        this.execAsync = promisify(exec);
        this.scriptDir = __dirname;
        this.outputDir = path.join(this.scriptDir, '..');
        this.ps1ScriptPath = path.join(this.outputDir, 'setup-vpn.ps1');
    }

    async createVPNScript() {
        console.log('🤖 GENERANDO SCRIPT DE CONFIGURACIÓN AUTOMÁTICA...');
        console.log('=================================================\n');

        const ps1Script = this.generatePowerShellScript();
        fs.writeFileSync(this.ps1ScriptPath, ps1Script);

        this.displayInstructions();
    }

    generatePowerShellScript() {
        return `
# ====================================================================
# SCRIPT AUTOMATIZADO PARA CREAR VPN PRIVADA CON IP FIJA (WIREGUARD)
# Proveedor: DigitalOcean
# Creado por: QBTC Unified System
# ====================================================================

# --- CONFIGURACIÓN REQUERIDA ---
$ErrorActionPreference = 'Stop'

# Tu token de API de DigitalOcean. Generar en: https://cloud.digitalocean.com/account/api/tokens
$do_token = Read-Host -Prompt "🔑 Por favor, introduce tu token de API de DigitalOcean"

# Nombre para tu nuevo servidor (droplet)
$dropletName = "qbtc-vpn-server"

# Región del servidor (New York es buena opción para baja latencia)
$region = "nyc3"

# Tamaño del servidor (el más barato es suficiente)
$size = "s-1vcpu-1gb"

# Imagen del sistema operativo
$image = "ubuntu-22-04-x64"

# --- INICIO DEL PROCESO AUTOMATIZADO ---

Write-Host "\n🚀 INICIANDO CREACIÓN DE VPN PRIVADA..." -ForegroundColor Green

# 1. VERIFICAR DOCTL (CLI de DigitalOcean)
Write-Host "\n[1/5] Verificando doctl (CLI de DigitalOcean)..."
if (-not (Get-Command doctl -ErrorAction SilentlyContinue)) {
    Write-Host "   doctl no encontrado. Instalando..." -ForegroundColor Yellow
    iex "& {$(irm https://github.com/digitalocean/doctl/releases/latest/download/doctl-windows-amd64.exe)} install"
    Write-Host "   doctl instalado correctamente." -ForegroundColor Green
} else {
    Write-Host "   doctl ya está instalado." -ForegroundColor Cyan
}

# 2. AUTENTICAR CON DIGITALOCEAN
Write-Host "\n[2/5] Autenticando con DigitalOcean..."
doctl auth init --access-token $do_token
Write-Host "   Autenticación exitosa." -ForegroundColor Green

# 3. CREAR SERVIDOR (DROPLET)
Write-Host "\n[3/5] Creando servidor VPN en DigitalOcean (esto puede tardar 2-3 minutos)..."
$droplet = doctl compute droplet create $dropletName --size $size --image $image --region $region --wait --format "ID,Name,PublicIPv4" --no-header
$dropletId = ($droplet -split '\s+')[0]
$dropletIp = ($droplet -split '\s+')[2]

Write-Host "   ✅ Servidor creado con éxito!" -ForegroundColor Green
Write-Host "   🌐 IP PÚBLICA FIJA: $dropletIp"

# 4. INSTALAR Y CONFIGURAR WIREGUARD EN EL SERVIDOR
Write-Host "\n[4/5] Instalando y configurando WireGuard en el servidor..."
$sshCommand = "ssh -o 'StrictHostKeyChecking no' -o 'UserKnownHostsFile /dev/null' root@$dropletIp"
$wireguardInstallScript = "\
    curl -O https://raw.githubusercontent.com/angristan/wireguard-install/master/wireguard-install.sh && \
    chmod +x wireguard-install.sh && \
    ./wireguard-install.sh --auto \
"

Invoke-Expression "$sshCommand '$wireguardInstallScript'"

Write-Host "   WireGuard instalado y configurado." -ForegroundColor Green

# 5. DESCARGAR ARCHIVO DE CONFIGURACIÓN DEL CLIENTE
Write-Host "\n[5/5] Descargando archivo de configuración del cliente..."
$localConfFile = \"$PSScriptRoot/qbtc-vpn-client.conf\"
doctl compute ssh $dropletName --ssh-command "cat /root/wg0-client.conf" > $localConfFile

# --- FINALIZACIÓN ---
Write-Host "\n🎉 ¡PROCESO COMPLETADO! 🎉" -ForegroundColor Green
Write-Host "\nTu VPN privada con IP fija está lista."
Write-Host "=================================================="
Write-Host "   IP FIJA ASIGNADA: $dropletIp" -ForegroundColor Yellow
Write-Host "   Archivo de configuración: $localConfFile" -ForegroundColor Yellow
Write-Host "=================================================="

Write-Host "\nPASOS FINALES:" 
Write-Host "1. Instala el cliente de WireGuard para Windows: https://www.wireguard.com/install/"
Write-Host "2. Abre WireGuard y haz clic en 'Import tunnel(s) from file'"
Write-Host "3. Selecciona el archivo: qbtc-vpn-client.conf"
Write-Host "4. Haz clic en 'Activate' para conectarte."
Write-Host "5. ¡Listo! Tu IP pública ahora es $dropletIp."
Write-Host "6. Añade esta IP a la whitelist de Binance."

`;
    }

    displayInstructions() {
        console.log('✅ SCRIPT GENERADO: setup-vpn.ps1');
        console.log('-------------------------------------------------\n');
        console.log('Este script automatizará todo el proceso por ti.');
        console.log('Solo necesitas tu token de API de DigitalOcean.\n');

        console.log('PASOS PARA EJECUTAR:');
        console.log('---------------------\n');
        console.log('1. 🌐 OBTENER TOKEN DE DIGITALOCEAN:');
        console.log('   • Crea una cuenta en: https://cloud.digitalocean.com/registrations/new');
        console.log('   • Ve a la sección "API" -> "Tokens" en tu cuenta.');
        console.log('   • Genera un nuevo token con permisos de ESCRITURA (write).\n');

        console.log('2.  PowerShell (como Administrador):');
        console.log('   • Abre una nueva ventana de PowerShell COMO ADMINISTRADOR.');
        console.log('   • Navega a este directorio:');
        console.log(`     cd ${this.outputDir}\n`);

        console.log('3. 🔓 PERMITIR SCRIPTS:');
        console.log('   • Ejecuta el siguiente comando para permitir scripts:');
        console.log('     Set-ExecutionPolicy Unrestricted -Scope Process\n');

        console.log('4. 🚀 EJECUTAR SCRIPT:');
        console.log('   • Ahora, ejecuta el script generado:');
        console.log('     .\\setup-vpn.ps1\n');

        console.log('5. ⚙️ SIGUE LAS INSTRUCCIONES:');
        console.log('   • El script te pedirá el token de API y hará el resto.\n');

        console.log('Una vez finalizado, tendrás tu IP fija lista para usar en Binance.\n');
    }
}

// Ejecutar
if (require.main === module) {
    const creator = new VPNCreator();
    creator.createVPNScript().catch(console.error);
}

module.exports = VPNCreator;
