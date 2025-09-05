# QBTC-UNIFIED - Script para iniciar el servidor con gestión avanzada de claves y dashboard
# Este script inicia el servidor mejorado con soporte para API Key Manager y dashboard

# Verificar si Node.js está instalado
$nodeInstalled = $null -ne (Get-Command node -ErrorAction SilentlyContinue)
if (-not $nodeInstalled) {
    Write-Host "❌ ERROR: Node.js no está instalado o no se encuentra en el PATH" -ForegroundColor Red
    Write-Host "Por favor, instala Node.js desde https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar si el archivo del servidor existe
$serverFile = Join-Path $PSScriptRoot "enhanced-key-dashboard-server.js"
if (-not (Test-Path $serverFile)) {
    Write-Host "❌ ERROR: No se encontró el archivo $serverFile" -ForegroundColor Red
    exit 1
}

# Iniciar el servidor
Write-Host "🚀 Iniciando servidor con gestión avanzada de claves y dashboard..." -ForegroundColor Cyan
node $serverFile

# El script termina cuando el servidor se detiene
