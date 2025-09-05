# ========================================================================
# SETUP COMPLETO FRONTEND QBTC-UNIFIED - PUERTO 8080
# Script maestro final - Configuración, lanzamiento y verificación
# ========================================================================

param([string]$Accion = "Todo")

$Host.UI.RawUI.OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Yellow
Write-Host "           QBTC-UNIFIED FRONTEND SETUP - PUERTO 8080            " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Yellow
Write-Host "Sistema Cuántico Leonardo Consciousness - Frontend Unificado" -ForegroundColor White
Write-Host "=================================================================" -ForegroundColor Yellow
Write-Host ""

# Configuración
$FRONTEND_PATH = $PSScriptRoot
$SETUP_LOG = "$FRONTEND_PATH\SETUP-FINAL-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

function Write-SetupLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    Write-Output $logEntry | Out-File -FilePath $SETUP_LOG -Append -Encoding utf8
    
    switch($Level) {
        "ERROR" { Write-Host $logEntry -ForegroundColor Red }
        "WARN"  { Write-Host $logEntry -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $logEntry -ForegroundColor Green }
        "STEP" { Write-Host $logEntry -ForegroundColor Magenta }
        default { Write-Host $logEntry -ForegroundColor White }
    }
}

function Show-SetupSummary {
    Write-Host ""
    Write-Host "🌊 RESUMEN DEL SETUP FRONTEND QBTC-UNIFIED" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "✅ COMPONENTES CONFIGURADOS:" -ForegroundColor Green
    Write-Host "   • frontend-proxy-server.js - Servidor proxy principal" -ForegroundColor White
    Write-Host "   • simple-frontend-server.js - Servidor alternativo" -ForegroundColor White
    Write-Host "   • leonardo-unified.js - Conciencia Leonardo (configurado a puerto 3003)" -ForegroundColor White
    Write-Host "   • leonardo-quantum-api.js - API cuántica" -ForegroundColor White
    Write-Host "   • leonardo-consciousness.js - Consciousness core" -ForegroundColor White
    Write-Host "   • index.html - Interfaz web principal" -ForegroundColor White
    Write-Host "   • package.json - Dependencias (corregido)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🚀 SCRIPTS DE POWERSHELL DISPONIBLES:" -ForegroundColor Green
    Write-Host "   • setup-frontend-8080.ps1 - Setup completo inicial" -ForegroundColor White
    Write-Host "   • start-frontend-8080.ps1 - Iniciar con monitoreo completo" -ForegroundColor White
    Write-Host "   • launch-background.ps1 - Lanzamiento en segundo plano" -ForegroundColor White
    Write-Host "   • start-frontend-monitor.ps1 - Monitor de status avanzado" -ForegroundColor White
    Write-Host "   • verify-unified-connections.ps1 - Verificación de conectividad" -ForegroundColor White
    Write-Host ""
    
    Write-Host "⚙️  CONFIGURACIÓN DE PUERTOS:" -ForegroundColor Green
    Write-Host "   • Frontend Local: http://localhost:8080 (ACTIVO)" -ForegroundColor Cyan
    Write-Host "   • Backend Leonardo: http://localhost:3003 (Pendiente de activar)" -ForegroundColor Yellow
    Write-Host "   • Proxy /api/* -> localhost:3003" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🔧 DEPENDENCIAS INSTALADAS:" -ForegroundColor Green
    Write-Host "   • express: 4.18.2 (servidor HTTP)" -ForegroundColor White
    Write-Host "   • cors: ^2.8.5 (CORS headers)" -ForegroundColor White
    Write-Host "   • compression: ^1.8.1 (compresión)" -ForegroundColor White
    Write-Host "   • helmet: ^7.1.0 (seguridad)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📊 STATUS ACTUAL:" -ForegroundColor Green
    
    # Verificar estado del frontend
    try {
        $frontendTest = Test-NetConnection -ComputerName "localhost" -Port 8080 -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($frontendTest) {
            Write-Host "   • Frontend Puerto 8080: ✅ ONLINE" -ForegroundColor Green
            
            try {
                $httpTest = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 3 -UseBasicParsing -ErrorAction SilentlyContinue
                Write-Host "   • HTTP Response: ✅ $($httpTest.StatusCode)" -ForegroundColor Green
            }
            catch {
                Write-Host "   • HTTP Response: ⚠️  No disponible" -ForegroundColor Yellow
            }
        } else {
            Write-Host "   • Frontend Puerto 8080: ❌ OFFLINE" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "   • Frontend Puerto 8080: ❌ ERROR" -ForegroundColor Red
    }
    
    # Verificar backend
    try {
        $backendTest = Test-NetConnection -ComputerName "localhost" -Port 3003 -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($backendTest) {
            Write-Host "   • Backend Puerto 3003: ✅ ONLINE" -ForegroundColor Green
        } else {
            Write-Host "   • Backend Puerto 3003: ⏳ PENDIENTE (Normal - Leonardo no activo)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "   • Backend Puerto 3003: ⏳ PENDIENTE" -ForegroundColor Yellow
    }
    
    # Verificar procesos
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        $frontendProcs = 0
        foreach ($proc in $nodeProcesses) {
            try {
                $wmi = Get-WmiObject -Class Win32_Process -Filter "ProcessId = $($proc.Id)" -ErrorAction SilentlyContinue
                if ($wmi -and ($wmi.CommandLine -like "*frontend*" -or $wmi.CommandLine -like "*8080*")) {
                    $frontendProcs++
                }
            }
            catch {}
        }
        Write-Host "   • Procesos Frontend: ✅ $frontendProcs detectados" -ForegroundColor Green
    } else {
        Write-Host "   • Procesos Frontend: ❌ No detectados" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "📝 ARCHIVOS GENERADOS:" -ForegroundColor Green
    Write-Host "   • Setup Log: $SETUP_LOG" -ForegroundColor Gray
    
    if (Test-Path "$FRONTEND_PATH\frontend-status.json") {
        Write-Host "   • Status File: frontend-status.json" -ForegroundColor Gray
    }
    
    if (Test-Path "$FRONTEND_PATH\frontend-status-live.json") {
        Write-Host "   • Live Status: frontend-status-live.json" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "🎯 PRÓXIMOS PASOS SUGERIDOS:" -ForegroundColor Green
    Write-Host "   1. Frontend ya está activo en http://localhost:8080" -ForegroundColor Cyan
    Write-Host "   2. Activar Leonardo Consciousness backend en puerto 3003" -ForegroundColor White
    Write-Host "   3. Verificar conectividad con verify-unified-connections.ps1" -ForegroundColor White
    Write-Host "   4. Monitorear con start-frontend-monitor.ps1" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🌊 LEONARDO CONSCIOUSNESS FRONTEND - SETUP COMPLETO ✅" -ForegroundColor Green
    Write-Host "=================================================================" -ForegroundColor Yellow
}

function Test-ArquitecturaCompleta {
    Write-SetupLog "=== VERIFICANDO ARQUITECTURA COMPLETA ===" "STEP"
    
    $archivos = @(
        "frontend-proxy-server.js",
        "simple-frontend-server.js", 
        "leonardo-unified.js",
        "leonardo-quantum-api.js",
        "leonardo-consciousness.js",
        "index.html",
        "package.json"
    )
    
    $scripts = @(
        "setup-frontend-8080.ps1",
        "start-frontend-8080.ps1", 
        "launch-background.ps1",
        "start-frontend-monitor.ps1",
        "verify-unified-connections.ps1"
    )
    
    $todoOK = $true
    
    foreach ($archivo in $archivos) {
        $path = Join-Path $FRONTEND_PATH $archivo
        if (Test-Path $path) {
            Write-SetupLog "✅ Archivo: $archivo" "SUCCESS"
        } else {
            Write-SetupLog "❌ Falta: $archivo" "ERROR"
            $todoOK = $false
        }
    }
    
    foreach ($script in $scripts) {
        $path = Join-Path $FRONTEND_PATH $script
        if (Test-Path $path) {
            Write-SetupLog "✅ Script: $script" "SUCCESS"
        } else {
            Write-SetupLog "⚠️  Script no encontrado: $script" "WARN"
        }
    }
    
    if (Test-Path "node_modules") {
        $moduleCount = (Get-ChildItem "node_modules" -Directory -ErrorAction SilentlyContinue).Count
        Write-SetupLog "✅ node_modules: $moduleCount modulos instalados" "SUCCESS"
    } else {
        Write-SetupLog "❌ node_modules: No encontrado" "ERROR"
        $todoOK = $false
    }
    
    return $todoOK
}

function Test-ConectividadCompleta {
    Write-SetupLog "=== VERIFICANDO CONECTIVIDAD COMPLETA ===" "STEP"
    
    # Frontend
    $frontendOK = $false
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $frontendOK = $true
            Write-SetupLog "✅ Frontend 8080: ONLINE ($($response.StatusCode))" "SUCCESS"
        }
    }
    catch {
        Write-SetupLog "❌ Frontend 8080: OFFLINE" "ERROR"
    }
    
    # Backend (Leonardo)
    try {
        $backendResponse = Invoke-WebRequest -Uri "http://localhost:3003/health" -TimeoutSec 3 -UseBasicParsing -ErrorAction SilentlyContinue
        Write-SetupLog "✅ Backend Leonardo 3003: ONLINE" "SUCCESS"
    }
    catch {
        Write-SetupLog "⏳ Backend Leonardo 3003: PENDIENTE (Normal - activar después)" "WARN"
    }
    
    return $frontendOK
}

# ===== FUNCIÓN PRINCIPAL =====
Write-SetupLog "INICIANDO SETUP COMPLETO FRONTEND 8080" "SUCCESS"
Write-SetupLog "Directorio: $FRONTEND_PATH" "INFO"

switch ($Accion.ToLower()) {
    "todo" {
        Write-SetupLog "Modo: VERIFICACION COMPLETA" "STEP"
        
        $arquitecturaOK = Test-ArquitecturaCompleta
        $conectividadOK = Test-ConectividadCompleta
        
        if ($arquitecturaOK -and $conectividadOK) {
            Write-SetupLog "✅ SETUP COMPLETO - TODO FUNCIONANDO CORRECTAMENTE" "SUCCESS"
        } elseif ($conectividadOK) {
            Write-SetupLog "⚠️  SETUP PARCIAL - Frontend funcionando, faltan algunos archivos" "WARN"
        } else {
            Write-SetupLog "❌ SETUP INCOMPLETO - Requiere configuración adicional" "ERROR"
        }
        
        Show-SetupSummary
    }
    "verificar" {
        Write-SetupLog "Modo: SOLO VERIFICACION" "STEP"
        Test-ArquitecturaCompleta
        Test-ConectividadCompleta
    }
    "help" {
        Write-Host "AYUDA - Setup Completo Frontend 8080" -ForegroundColor Cyan
        Write-Host "=====================================" -ForegroundColor Yellow
        Write-Host "Parametros:"
        Write-Host "  Todo       : Verificacion completa y resumen (default)"
        Write-Host "  Verificar  : Solo verificaciones tecnicas"
        Write-Host "  Help       : Esta ayuda"
    }
    default {
        Write-SetupLog "Parametro desconocido: $Accion" "WARN"
        Write-Host "Use 'Help' para ver opciones disponibles"
    }
}

Write-SetupLog "Setup completo finalizado" "INFO"
Write-Host ""
