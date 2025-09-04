# QBTC NGROK BYPASS SETUP
# Script para configurar ngrok y bypasear el problema de IP del router

Write-Host "🚀 CONFIGURANDO NGROK BYPASS PARA BINANCE" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Verificar si ngrok está instalado
Write-Host "`n📦 1. VERIFICANDO NGROK..." -ForegroundColor Yellow
$ngrokPath = Get-Command ngrok -ErrorAction SilentlyContinue

if (-not $ngrokPath) {
    Write-Host "❌ ngrok no está instalado" -ForegroundColor Red
    Write-Host "📥 Descargando ngrok..." -ForegroundColor Yellow
    
    # Crear directorio para ngrok
    $ngrokDir = "$env:USERPROFILE\ngrok"
    if (-not (Test-Path $ngrokDir)) {
        New-Item -ItemType Directory -Path $ngrokDir -Force | Out-Null
    }
    
    # Descargar ngrok
    $ngrokUrl = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
    $zipPath = "$ngrokDir\ngrok.zip"
    
    try {
        Invoke-WebRequest -Uri $ngrokUrl -OutFile $zipPath -UseBasicParsing
        
        # Extraer
        Expand-Archive -Path $zipPath -DestinationPath $ngrokDir -Force
        Remove-Item $zipPath
        
        # Agregar al PATH temporalmente
        $env:PATH += ";$ngrokDir"
        
        Write-Host "✅ ngrok descargado e instalado" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error descargando ngrok: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 Descargar manualmente desde: https://ngrok.com/download" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✅ ngrok ya está instalado: $($ngrokPath.Source)" -ForegroundColor Green
}

# 2. Configurar authtoken (si no está configurado)
Write-Host "`n🔑 2. CONFIGURANDO AUTHTOKEN..." -ForegroundColor Yellow
Write-Host "💡 Para obtener tu authtoken:" -ForegroundColor Cyan
Write-Host "   1. Crear cuenta gratis en: https://dashboard.ngrok.com/signup" -ForegroundColor White
Write-Host "   2. Ir a: https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor White
Write-Host "   3. Copiar tu authtoken" -ForegroundColor White

$authtoken = Read-Host "🔐 Ingresa tu authtoken de ngrok (o ENTER para continuar sin autenticación)"

if ($authtoken -and $authtoken.Trim() -ne "") {
    try {
        & ngrok config add-authtoken $authtoken.Trim()
        Write-Host "✅ Authtoken configurado" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Error configurando authtoken, continuando..." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️ Continuando sin authtoken (túneles temporales de 2 horas)" -ForegroundColor Yellow
}

# 3. Configurar el sistema QBTC para usar ngrok
Write-Host "`n🔧 3. CONFIGURANDO SISTEMA QBTC..." -ForegroundColor Yellow

# Crear script de inicio con ngrok
$startScript = @"
@echo off
echo 🚀 Iniciando QBTC con NGROK BYPASS
echo ====================================

REM Iniciar ngrok en segundo plano
echo 📡 Iniciando túnel ngrok...
start /min cmd /c "ngrok http 9090 --host-header=localhost --log stdout > ngrok.log 2>&1"

REM Esperar a que ngrok se inicie
timeout /t 5 /nobreak > nul

REM Obtener la URL del túnel
echo 🔍 Obteniendo URL del túnel...
curl -s http://localhost:4040/api/tunnels > tunnels.json 2>nul

REM Iniciar el sistema QBTC
echo 🎯 Iniciando sistema QBTC...
node index.js

pause
"@

$startScript | Out-File -FilePath "start-qbtc-with-ngrok.bat" -Encoding ASCII
Write-Host "✅ Script de inicio creado: start-qbtc-with-ngrok.bat" -ForegroundColor Green

# 4. Crear configuración de proxy para el sistema
$proxyConfig = @"
{
  "bypass_enabled": true,
  "proxy_type": "ngrok",
  "ngrok_config": {
    "local_port": 9090,
    "host_header": "localhost",
    "inspect_port": 4040
  },
  "binance_config": {
    "use_proxy": true,
    "proxy_detect_url": "http://localhost:4040/api/tunnels"
  }
}
"@

$proxyConfig | Out-File -FilePath "proxy-config.json" -Encoding UTF8
Write-Host "✅ Configuración de proxy creada: proxy-config.json" -ForegroundColor Green

# 5. Mostrar instrucciones
Write-Host "`n📋 INSTRUCCIONES DE USO:" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host "1. Ejecutar el script de inicio:" -ForegroundColor White
Write-Host "   .\start-qbtc-with-ngrok.bat" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Obtener la URL pública del túnel:" -ForegroundColor White
Write-Host "   - Ir a: http://localhost:4040" -ForegroundColor Yellow
Write-Host "   - Copiar la URL HTTPS (ej: https://abc123.ngrok.io)" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. En Binance API Management:" -ForegroundColor White
Write-Host "   - Deshabilitar restricción de IP temporalmente, O" -ForegroundColor Yellow
Write-Host "   - Agregar la IP del túnel ngrok a la whitelist" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Configurar el sistema QBTC para usar el túnel:" -ForegroundColor White
Write-Host "   - El sistema detectará automáticamente el túnel" -ForegroundColor Yellow
Write-Host "   - Las requests a Binance pasarán por ngrok" -ForegroundColor Yellow

Write-Host "`n🎯 ALTERNATIVA INMEDIATA:" -ForegroundColor Magenta
Write-Host "========================" -ForegroundColor Magenta
Write-Host "Si tienes prisa, puedes:" -ForegroundColor White
Write-Host "1. Ir a Binance API Management" -ForegroundColor Yellow
Write-Host "2. DESHABILITAR 'Restrict access to trusted IPs only'" -ForegroundColor Red
Write-Host "3. Guardar cambios y probar el sistema" -ForegroundColor Yellow
Write-Host "⚠️ NOTA: Esto reduce la seguridad pero permite trading de " -ForegroundColor Yellow
Write-Host "❌ FUTURES seguirá requiriendo IP específica" -ForegroundColor Red

Write-Host "`n🚨 IPs DETECTADAS PARA WHITELIST:" -ForegroundColor Red
Write-Host "=================================" -ForegroundColor Red
Write-Host "Configurar TODAS estas IPs en Binance:" -ForegroundColor White
Write-Host "- 181.43.212.196" -ForegroundColor Yellow
Write-Host "- 2800:300:6a72:48a0:9cab:5945:4be4:14c5 (IPv6)" -ForegroundColor Yellow
Write-Host "- 1.1.1.1 (IP del router)" -ForegroundColor Yellow

Write-Host "`n✅ CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "Ejecutar: .\start-qbtc-with-ngrok.bat para iniciar" -ForegroundColor Cyan
