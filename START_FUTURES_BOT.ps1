# START FUTURES BOT - QBTC UNIFIED SYSTEM
# Comando único optimizado para iniciar bot de futuros rentable
# Uso: .\START_FUTURES_BOT.ps1

Write-Host "===============================================" -ForegroundColor Magenta
Write-Host "🚀 QBTC FUTURES BOT - SISTEMA OPTIMIZADO" -ForegroundColor Magenta  
Write-Host "===============================================" -ForegroundColor Magenta
Write-Host "Principio: 'Menos es más' - Solo componentes rentables" -ForegroundColor Cyan
Write-Host "IP Configurada: 181.43.212.196" -ForegroundColor Green
Write-Host "Banda de Puertos: 18000-18900 (anticonflictos)" -ForegroundColor Green
Write-Host ""

# Configurar variables de entorno críticas para futuros
$env:BINANCE_FUTURES_ONLY = "true"
$env:BINANCE_TESTNET = "true"  
$env:QBTC_OPTIMIZED_MODE = "true"
$env:TRADING_MODE = "FUTURES"
$env:CURRENT_PUBLIC_IP = "181.43.212.196"

# Verificar que las keys están configuradas
if (-not $env:BINANCE_API_KEY -or -not $env:BINANCE_SECRET_KEY) {
    Write-Host "⚠️  ERROR: Variables de entorno Binance no configuradas" -ForegroundColor Red
    Write-Host "Configura: BINANCE_API_KEY y BINANCE_SECRET_KEY" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Variables de entorno configuradas" -ForegroundColor Green

# Ejecutar el launcher optimizado
$scriptPath = Join-Path $PSScriptRoot "scripts\master_futures_launcher.ps1"

if (Test-Path $scriptPath) {
    Write-Host "🔥 Iniciando sistema optimizado..." -ForegroundColor Cyan
    Write-Host ""
    
    # Ejecutar con parámetros optimizados para futuros
    & $scriptPath -TestMode:$false -SkipPrecheck:$false -ForceRestart:$true
} else {
    Write-Host "❌ ERROR: No se encontró master_futures_launcher.ps1" -ForegroundColor Red
    Write-Host "Ruta esperada: $scriptPath" -ForegroundColor Yellow
    exit 1
}

<citations>
<document>
    <document_type>RULE</document_type>
    <document_id>EM09uZSA1vjweTGZhKNYoi</document_id>
</document>
<document>
    <document_type>RULE</document_type>
    <document_id>OOXRPDT0m0MVsz2xUFKDTQ</document_id>
</document>
<document>
    <document_type>RULE</document_type>
    <document_id>yXmiaegmFwRqqEkWCu3hwB</document_id>
</document>
</citations>
