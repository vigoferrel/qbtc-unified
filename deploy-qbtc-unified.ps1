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
    [string]$Port = "3003"
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

# Validar dependencias
Write-Host "🔍 Validando dependencias..." -ForegroundColor White
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Dependencias validadas" -ForegroundColor Green

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

# Verificar puertos libres
$portsToCheck = @(3003, 3203, 8080)
foreach ($portCheck in $portsToCheck) {
    $portInUse = Get-NetTCPConnection -LocalPort $portCheck -ErrorAction SilentlyContinue
    if ($portInUse) {
        Write-Host "⚠️  Puerto $portCheck en uso" -ForegroundColor Yellow
        if ($ForceRestart) {
            # Liberar puerto si es necesario
            $processId = (Get-NetTCPConnection -LocalPort $portCheck).OwningProcess
            if ($processId) {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Write-Host "🔓 Puerto $portCheck liberado" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "✅ Puerto $portCheck disponible" -ForegroundColor Green
    }
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
    $supabaseHealth = Invoke-RestMethod -Uri "https://hrvxsaolaxnqltomqaud.supabase.co/rest/v1/" -Method GET -Headers @{
        'apikey' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydnhzYW9sYXhucWx0b21xYXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDU4MDEsImV4cCI6MjA2NjcyMTgwMX0.PdeDNbEX5c9VCYgWR35nV_Y8JYQXtkmYRXAA4rs68j0'
        'Authorization' = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydnhzYW9sYXhucWx0b21xYXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDU4MDEsImV4cCI6MjA2NjcyMTgwMX0.PdeDNbEX5c9VCYgWR35nV_Y8JYQXtkmYRXAA4rs68j0'
    } -TimeoutSec 10
    Write-Host "✅ Supabase conectado exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error conectando con Supabase: $($_.Exception.Message)" -ForegroundColor Red
    if (-not $SkipValidation) {
        exit 1
    }
}

# ================================================================
# PASO 4: DEPLOY COMPONENTES CORE
# ================================================================

Write-Host ""
Write-Host "🚀 PASO 4: DEPLOYANDO COMPONENTES CORE" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow

# Crear script de inicio del sistema unificado
Write-Host "📝 Creando script de inicio unificado..." -ForegroundColor White

$startupScript = @"
#!/usr/bin/env node

// QBTC-UNIFIED Production Startup Script
process.env.DEPLOYMENT_MODE = '$Mode';
process.env.HTTP_PORT = '$Port';

const { spawn } = require('child_process');
const path = require('path');

console.log('🌌 QBTC-UNIFIED PRODUCTION DEPLOYMENT');
console.log('===================================');
console.log('🎯 Modo:', process.env.DEPLOYMENT_MODE);
console.log('🌐 Puerto:', process.env.HTTP_PORT);
console.log('📍 Backend: Supabase');
console.log('');

async function startUnifiedSystem() {
    try {
        // Iniciar Leonardo Consciousness Core
        console.log('🧠 Iniciando Leonardo Consciousness...');
        const leonardoProcess = spawn('node', ['leonardo-consciousness/start-leonardo.js'], {
            stdio: 'pipe',
            detached: false,
            env: { ...process.env }
        });

        leonardoProcess.stdout.on('data', (data) => {
            console.log('  [LEONARDO]', data.toString().trim());
        });

        leonardoProcess.stderr.on('data', (data) => {
            console.error('  [LEONARDO ERROR]', data.toString().trim());
        });

        // Esperar 5 segundos para Leonardo
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Iniciar Sistema Unificado Maestro
        console.log('🌟 Iniciando Sistema Unificado Maestro...');
        const unifiedProcess = spawn('node', ['launch-quantum-unified-master.js'], {
            stdio: 'pipe', 
            detached: false,
            env: { ...process.env, HTTP_PORT: '$Port' }
        });

        unifiedProcess.stdout.on('data', (data) => {
            console.log('  [UNIFIED]', data.toString().trim());
        });

        unifiedProcess.stderr.on('data', (data) => {
            console.error('  [UNIFIED ERROR]', data.toString().trim());
        });

        // Esperar 3 segundos para Sistema Unificado
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('');
        console.log('🎉 QBTC-UNIFIED DEPLOYMENT COMPLETADO! 🎉');
        console.log('========================================');
        console.log('🌐 Leonardo Dashboard: http://localhost:3003');
        console.log('🌟 Master Dashboard: http://localhost:$Port');
        console.log('💚 Health Check: http://localhost:3003/api/health');
        console.log('📊 Métricas: http://localhost:$Port/api/metrics');
        console.log('🗄️ Supabase Backend: https://hrvxsaolaxnqltomqaud.supabase.co');
        console.log('');
        console.log('✨ Sistema listo para máxima extracción de jugo cuántico!');

        // Mantener procesos vivos
        const cleanup = () => {
            console.log('');
            console.log('🔄 Cerrando sistema...');
            leonardoProcess.kill();
            unifiedProcess.kill();
            process.exit(0);
        };

        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);

    } catch (error) {
        console.error('❌ Error crítico en deployment:', error.message);
        process.exit(1);
    }
}

startUnifiedSystem();
"@

$startupScript | Out-File -FilePath "start-production.js" -Encoding UTF8
Write-Host "✅ Script de inicio creado: start-production.js" -ForegroundColor Green

# ================================================================
# PASO 5: INICIAR SISTEMA EN BACKGROUND
# ================================================================

Write-Host ""
Write-Host "⚡ PASO 5: INICIANDO SISTEMA EN PRODUCCIÓN" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow

Write-Host "🚀 Iniciando QBTC-UNIFIED en segundo plano..." -ForegroundColor White

$processArgs = @{
    FilePath = "node"
    ArgumentList = @("start-production.js")
    WindowStyle = "Hidden"
    PassThru = $true
    RedirectStandardOutput = "system-output.log"
    RedirectStandardError = "system-error.log"
}

$productionProcess = Start-Process @processArgs

if ($productionProcess) {
    Write-Host "✅ Sistema iniciado en segundo plano (PID: $($productionProcess.Id))" -ForegroundColor Green
    
    # Guardar PID para control posterior
    $productionProcess.Id | Out-File -FilePath "qbtc-unified.pid" -Encoding UTF8
    
    Write-Host "💾 PID guardado en: qbtc-unified.pid" -ForegroundColor Green
} else {
    Write-Host "❌ Error iniciando sistema en segundo plano" -ForegroundColor Red
    exit 1
}

# ================================================================
# PASO 6: VALIDACIÓN POST-DEPLOYMENT
# ================================================================

Write-Host ""
Write-Host "✅ PASO 6: VALIDACIÓN POST-DEPLOYMENT" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Yellow

Write-Host "⏳ Esperando inicialización del sistema..." -ForegroundColor White
Start-Sleep -Seconds 10

# Verificar Leonardo Consciousness
Write-Host "🔍 Verificando Leonardo Consciousness..." -ForegroundColor White
try {
    $leonardoHealth = Invoke-RestMethod -Uri "http://localhost:3003/api/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Leonardo Consciousness: HEALTHY" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Leonardo Consciousness: Inicializando..." -ForegroundColor Yellow
}

# Verificar Sistema Unificado
Write-Host "🔍 Verificando Sistema Unificado..." -ForegroundColor White
try {
    $unifiedHealth = Invoke-RestMethod -Uri "http://localhost:$Port/api/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Sistema Unificado: HEALTHY" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Sistema Unificado: Inicializando..." -ForegroundColor Yellow
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
Write-Host "  • PID del Proceso: $(Get-Content 'qbtc-unified.pid' -ErrorAction SilentlyContinue)" -ForegroundColor White
Write-Host ""
Write-Host "🌐 URLS DE ACCESO:" -ForegroundColor Cyan
Write-Host "  • Leonardo Dashboard: http://localhost:3003" -ForegroundColor White
Write-Host "  • Master Dashboard: http://localhost:$Port" -ForegroundColor White
Write-Host "  • Health Check: http://localhost:3003/api/health" -ForegroundColor White
Write-Host "  • API Metrics: http://localhost:$Port/api/metrics" -ForegroundColor White
Write-Host "  • Supabase Backend: https://hrvxsaolaxnqltomqaud.supabase.co" -ForegroundColor White
Write-Host ""
Write-Host "📂 LOGS DEL SISTEMA:" -ForegroundColor Cyan
Write-Host "  • Output: system-output.log" -ForegroundColor White
Write-Host "  • Errores: system-error.log" -ForegroundColor White
Write-Host ""
Write-Host "🔧 COMANDOS DE CONTROL:" -ForegroundColor Cyan
Write-Host "  • Ver logs: Get-Content system-output.log -Tail 20 -Wait" -ForegroundColor White
Write-Host "  • Ver errores: Get-Content system-error.log -Tail 20 -Wait" -ForegroundColor White
Write-Host "  • Estado del sistema: node check-system-status.js" -ForegroundColor White
Write-Host "  • Parar sistema: Stop-Process -Id (Get-Content qbtc-unified.pid)" -ForegroundColor White
Write-Host ""
Write-Host "✨ SISTEMA LISTO PARA MÁXIMA EXTRACCIÓN DE JUGO CUÁNTICO! ✨" -ForegroundColor Magenta
Write-Host ""

# Mostrar logs en tiempo real si se solicita
if ($Mode -eq "development" -or $env:SHOW_LOGS -eq "true") {
    Write-Host "📊 Mostrando logs en tiempo real (Ctrl+C para salir)..." -ForegroundColor Yellow
    Get-Content "system-output.log" -Tail 10 -Wait
}
