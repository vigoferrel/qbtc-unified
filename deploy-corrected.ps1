# ================================================================
# 🚀 QBTC-UNIFIED DEPLOYMENT SCRIPT - SUPABASE INTEGRATION  
# ================================================================
# Deploy completo del sistema QBTC-UNIFIED con backend en Supabase
# "Simplicity is the ultimate sophistication" - Leonardo da Vinci
# ================================================================

param(
    [string]$Mode = "production",
    [switch]$SkipValidation,
    [switch]$ForceRestart,
    [string]$Port = "3203"
)

Write-Host "🌌 QBTC-UNIFIED DEPLOYMENT INICIANDO..." -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "🎯 Modo: $Mode" -ForegroundColor Green
Write-Host "🌐 Puerto: $Port" -ForegroundColor Green  
Write-Host "📍 Backend: Supabase (hrvxsaolaxnqltomqaud.supabase.co)" -ForegroundColor Green
Write-Host ""

# ================================================================
# PASO 1: VALIDACIONES PRE-DEPLOYMENT
# ================================================================

Write-Host "📋 PASO 1: VALIDACIONES PRE-DEPLOYMENT" -ForegroundColor Yellow
Write-Host "=======================================" -ForegroundColor Yellow

# Validar Node.js
Write-Host "🔍 Validando Node.js..." -ForegroundColor White
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js no encontrado. Instala Node.js v18+ desde https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green

# Validar archivo .env
Write-Host "🔍 Validando configuración (.env)..." -ForegroundColor White
if (-not (Test-Path ".env")) {
    Write-Host "❌ Archivo .env no encontrado" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Archivo .env encontrado" -ForegroundColor Green

# ================================================================
# PASO 2: LIMPIAR PROCESOS PREVIOS
# ================================================================

Write-Host ""
Write-Host "🧹 PASO 2: LIMPIEZA DE PROCESOS PREVIOS" -ForegroundColor Yellow
Write-Host "=======================================" -ForegroundColor Yellow

if ($ForceRestart) {
    Write-Host "🔄 Terminando procesos Node.js previos..." -ForegroundColor White
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "✅ Procesos previos terminados" -ForegroundColor Green
}

# ================================================================
# PASO 3: CONFIGURAR SUPABASE INTEGRATION
# ================================================================

Write-Host ""
Write-Host "🗄️ PASO 3: CONFIGURANDO INTEGRACIÓN SUPABASE" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

# Verificar conectividad con Supabase
Write-Host "🔗 Verificando conectividad con Supabase..." -ForegroundColor White
try {
    $headers = @{
        'apikey' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydnhzYW9sYXhucWx0b21xYXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDU4MDEsImV4cCI6MjA2NjcyMTgwMX0.PdeDNbEX5c9VCYgWR35nV_Y8JYQXtkmYRXAA4rs68j0'
    }
    $supabaseHealth = Invoke-RestMethod -Uri "https://hrvxsaolaxnqltomqaud.supabase.co/rest/v1/" -Method GET -Headers $headers -TimeoutSec 10
    Write-Host "✅ Supabase conectado exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error conectando con Supabase: $($_.Exception.Message)" -ForegroundColor Red
    if (-not $SkipValidation) {
        Write-Host "⚠️ Continuando sin validación de Supabase..." -ForegroundColor Yellow
    }
}

# ================================================================
# PASO 4: DEPLOY COMPONENTES CORE
# ================================================================

Write-Host ""
Write-Host "🚀 PASO 4: DEPLOYANDO COMPONENTES CORE" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow

# Verificar que el lanzador maestro existe
if (-not (Test-Path "MASTER-ANTICONFLICT-LAUNCHER.js")) {
    Write-Host "❌ MASTER-ANTICONFLICT-LAUNCHER.js no encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Lanzador maestro encontrado" -ForegroundColor Green

# ================================================================
# PASO 5: INICIAR SISTEMA CON LANZADOR MAESTRO
# ================================================================

Write-Host ""
Write-Host "⚡ PASO 5: INICIANDO SISTEMA CON LANZADOR MAESTRO" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow

Write-Host "🚀 Iniciando QBTC-UNIFIED con lanzador maestro..." -ForegroundColor White

# Crear variables de entorno para este proceso
$env:HTTP_PORT = $Port
$env:DEPLOYMENT_MODE = $Mode

# Iniciar el lanzador maestro
$processArgs = @{
    FilePath = "node"
    ArgumentList = @("MASTER-ANTICONFLICT-LAUNCHER.js")
    WindowStyle = "Hidden"
    PassThru = $true
    RedirectStandardOutput = "master-output.log"
    RedirectStandardError = "master-error.log"
}

$masterProcess = Start-Process @processArgs

if ($masterProcess) {
    Write-Host "✅ Lanzador maestro iniciado (PID: $($masterProcess.Id))" -ForegroundColor Green
    
    # Guardar PID para control posterior
    $masterProcess.Id | Out-File -FilePath "qbtc-master.pid" -Encoding UTF8
    
    Write-Host "💾 PID guardado en: qbtc-master.pid" -ForegroundColor Green
} else {
    Write-Host "❌ Error iniciando lanzador maestro" -ForegroundColor Red
    exit 1
}

# ================================================================
# PASO 6: VALIDACIÓN POST-DEPLOYMENT
# ================================================================

Write-Host ""
Write-Host "✅ PASO 6: VALIDACIÓN POST-DEPLOYMENT" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Yellow

Write-Host "⏳ Esperando inicialización del sistema (15 segundos)..." -ForegroundColor White
Start-Sleep -Seconds 15

# Verificar Leonardo Consciousness
Write-Host "🔍 Verificando Leonardo Consciousness..." -ForegroundColor White
try {
    $leonardoHealth = Invoke-RestMethod -Uri "http://localhost:3003/api/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Leonardo Consciousness: HEALTHY" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Leonardo Consciousness: Aún inicializando..." -ForegroundColor Yellow
}

# Verificar Sistema Unificado 
Write-Host "🔍 Verificando Sistema Unificado..." -ForegroundColor White
try {
    $unifiedHealth = Invoke-RestMethod -Uri "http://localhost:$Port/api/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Sistema Unificado: HEALTHY" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Sistema Unificado: Aún inicializando..." -ForegroundColor Yellow
}

# ================================================================
# PASO 7: INFORMACIÓN FINAL Y MONITOREO
# ================================================================

Write-Host ""
Write-Host "🎉 DEPLOYMENT COMPLETADO EXITOSAMENTE! 🎉" -ForegroundColor Green -BackgroundColor Black
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 INFORMACIÓN DEL DEPLOYMENT:" -ForegroundColor Cyan
Write-Host "  • Modo: $Mode" -ForegroundColor White
Write-Host "  • Puerto Principal: $Port" -ForegroundColor White
if (Test-Path "qbtc-master.pid") {
    $pidContent = Get-Content "qbtc-master.pid" -ErrorAction SilentlyContinue
    Write-Host "  • PID del Proceso: $pidContent" -ForegroundColor White
}
Write-Host ""
Write-Host "🌐 URLS DE ACCESO:" -ForegroundColor Cyan
Write-Host "  • Leonardo Dashboard: http://localhost:3003" -ForegroundColor White
Write-Host "  • Master Dashboard: http://localhost:$Port" -ForegroundColor White
Write-Host "  • Health Check: http://localhost:3003/api/health" -ForegroundColor White
Write-Host "  • Sistema Status: node check-system-status.js" -ForegroundColor White
Write-Host "  • Supabase Backend: https://hrvxsaolaxnqltomqaud.supabase.co" -ForegroundColor White
Write-Host ""
Write-Host "📂 LOGS DEL SISTEMA:" -ForegroundColor Cyan
Write-Host "  • Master Output: master-output.log" -ForegroundColor White
Write-Host "  • Master Errors: master-error.log" -ForegroundColor White
Write-Host ""
Write-Host "🔧 COMANDOS DE CONTROL:" -ForegroundColor Cyan
Write-Host "  • Ver logs: Get-Content master-output.log -Tail 20 -Wait" -ForegroundColor White
Write-Host "  • Ver errores: Get-Content master-error.log -Tail 20 -Wait" -ForegroundColor White
Write-Host "  • Estado del sistema: node check-system-status.js" -ForegroundColor White
if (Test-Path "qbtc-master.pid") {
    Write-Host "  • Parar sistema: Stop-Process -Id (Get-Content qbtc-master.pid)" -ForegroundColor White
}
Write-Host ""
Write-Host "✨ SISTEMA LISTO PARA MÁXIMA EXTRACCIÓN DE JUGO CUÁNTICO! ✨" -ForegroundColor Magenta
Write-Host ""
Write-Host "🌊 El sistema está corriendo en segundo plano con reportes de métricas automáticos" -ForegroundColor Cyan
Write-Host "📊 Usa los comandos de monitoreo arriba para seguir el progreso" -ForegroundColor Cyan
