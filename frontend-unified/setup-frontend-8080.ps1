# ========================================================================
# SETUP COMPLETO FRONTEND QBTC-UNIFIED PUERTO 8080
# Script maestro para configurar, lanzar y monitorear frontend unificado
# ========================================================================

param([string]$Action = "Setup")

$Host.UI.RawUI.OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "SETUP FRONTEND QBTC-UNIFIED - PUERTO 8080" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Yellow

$FRONTEND_PATH = $PSScriptRoot
$SETUP_LOG = "$FRONTEND_PATH\setup-frontend-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

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

function Test-Prerequisites {
    Write-SetupLog "=== VERIFICANDO PREREQUISITOS ===" "STEP"
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-SetupLog "Node.js encontrado: $nodeVersion" "SUCCESS"
        } else {
            Write-SetupLog "Node.js no encontrado o no disponible" "ERROR"
            return $false
        }
    }
    catch {
        Write-SetupLog "Error verificando Node.js: $($_.Exception.Message)" "ERROR"
        return $false
    }
    
    # Verificar npm
    try {
        $npmVersion = npm --version 2>$null
        if ($npmVersion) {
            Write-SetupLog "npm encontrado: $npmVersion" "SUCCESS"
        } else {
            Write-SetupLog "npm no encontrado" "WARN"
        }
    }
    catch {
        Write-SetupLog "npm no disponible: $($_.Exception.Message)" "WARN"
    }
    
    # Verificar archivos necesarios
    $requiredFiles = @("frontend-proxy-server.js", "config.js", "index.html")
    $missingFiles = @()
    
    foreach ($file in $requiredFiles) {
        $filePath = Join-Path $FRONTEND_PATH $file
        if (Test-Path $filePath) {
            Write-SetupLog "Archivo encontrado: $file" "SUCCESS"
        } else {
            Write-SetupLog "Archivo faltante: $file" "ERROR"
            $missingFiles += $file
        }
    }
    
    if ($missingFiles.Count -gt 0) {
        Write-SetupLog "Archivos criticos faltantes: $($missingFiles -join ', ')" "ERROR"
        return $false
    }
    
    Write-SetupLog "Todos los prerequisitos cumplidos" "SUCCESS"
    return $true
}

function Install-Dependencies {
    Write-SetupLog "=== INSTALANDO DEPENDENCIAS ===" "STEP"
    
    Push-Location $FRONTEND_PATH
    
    try {
        if (Test-Path "package.json") {
            Write-SetupLog "package.json encontrado, instalando dependencias..." "INFO"
            
            # Instalar dependencias
            $npmOutput = npm install --no-audit --no-fund 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-SetupLog "Dependencias instaladas correctamente" "SUCCESS"
            } else {
                Write-SetupLog "Error instalando dependencias: $npmOutput" "ERROR"
                Pop-Location
                return $false
            }
        } else {
            Write-SetupLog "package.json no encontrado, creando..." "WARN"
            # El package.json ya debe estar creado por el script anterior
        }
        
        # Verificar node_modules
        if (Test-Path "node_modules") {
            $moduleCount = (Get-ChildItem "node_modules" -Directory).Count
            Write-SetupLog "node_modules creado con $moduleCount modulos" "SUCCESS"
        }
        
        Pop-Location
        return $true
    }
    catch {
        Write-SetupLog "Error en instalacion: $($_.Exception.Message)" "ERROR"
        Pop-Location
        return $false
    }
}

function Test-Port8080 {
    Write-SetupLog "=== VERIFICANDO PUERTO 8080 ===" "STEP"
    
    try {
        $portTest = Test-NetConnection -ComputerName "localhost" -Port 8080 -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($portTest) {
            Write-SetupLog "Puerto 8080 esta en uso" "WARN"
            
            # Verificar que procesos usan el puerto
            $netstatOutput = netstat -ano | Select-String ":8080.*LISTENING"
            if ($netstatOutput) {
                Write-SetupLog "Procesos usando puerto 8080: $netstatOutput" "INFO"
            }
            return $false
        } else {
            Write-SetupLog "Puerto 8080 disponible" "SUCCESS"
            return $true
        }
    }
    catch {
        Write-SetupLog "Error verificando puerto: $($_.Exception.Message)" "WARN"
        return $true  # Asumir disponible si hay error
    }
}

function Start-FrontendBackground {
    Write-SetupLog "=== INICIANDO FRONTEND EN SEGUNDO PLANO ===" "STEP"
    
    try {
        Push-Location $FRONTEND_PATH
        
        # Crear proceso en segundo plano
        $processInfo = New-Object System.Diagnostics.ProcessStartInfo
        $processInfo.FileName = "node"
        $processInfo.Arguments = "frontend-proxy-server.js"
        $processInfo.WorkingDirectory = $FRONTEND_PATH
        $processInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
        $processInfo.CreateNoWindow = $true
        $processInfo.UseShellExecute = $false
        $processInfo.RedirectStandardOutput = $true
        $processInfo.RedirectStandardError = $true
        
        $process = [System.Diagnostics.Process]::Start($processInfo)
        
        Write-SetupLog "Frontend iniciado con PID: $($process.Id)" "SUCCESS"
        
        # Esperar inicializacion
        Start-Sleep -Seconds 5
        
        # Verificar que este funcionando
        $isRunning = Test-NetConnection -ComputerName "localhost" -Port 8080 -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($isRunning) {
            Write-SetupLog "Frontend funcionando en http://localhost:8080" "SUCCESS"
        } else {
            Write-SetupLog "ADVERTENCIA: Frontend podria no estar respondiendo" "WARN"
        }
        
        # Guardar informacion del proceso
        $processInfo = @{
            PID = $process.Id
            StartTime = Get-Date
            Port = 8080
            URL = "http://localhost:8080"
            Status = "RUNNING"
        }
        
        $processInfo | ConvertTo-Json | Out-File "$FRONTEND_PATH\frontend-process-info.json" -Encoding utf8
        
        Pop-Location
        return $process.Id
    }
    catch {
        Write-SetupLog "Error iniciando frontend: $($_.Exception.Message)" "ERROR"
        Pop-Location
        return $null
    }
}

function Test-BackendConnectivity {
    Write-SetupLog "=== VERIFICANDO CONECTIVIDAD BACKEND ===" "STEP"
    
    $backendUrl = "http://localhost:3003"
    
    try {
        # Test basico de puerto
        $portTest = Test-NetConnection -ComputerName "localhost" -Port 3003 -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($portTest) {
            Write-SetupLog "Backend puerto 3003: CONECTADO" "SUCCESS"
        } else {
            Write-SetupLog "Backend puerto 3003: DESCONECTADO" "WARN"
        }
        
        # Test HTTP si el puerto esta abierto
        if ($portTest) {
            try {
                $response = Invoke-WebRequest -Uri "$backendUrl/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
                Write-SetupLog "Backend HTTP health: $($response.StatusCode)" "SUCCESS"
            }
            catch {
                Write-SetupLog "Backend HTTP health: No disponible" "WARN"
            }
        }
        
        return $portTest
    }
    catch {
        Write-SetupLog "Error verificando backend: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Show-SetupSummary {
    param([int]$FrontendPID, [bool]$BackendConnected)
    
    Write-Host ""
    Write-Host "RESUMEN SETUP FRONTEND 8080" -ForegroundColor Cyan
    Write-Host "===========================" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "FRONTEND:" -ForegroundColor Green
    if ($FrontendPID) {
        Write-Host "   Status: EJECUTANDOSE (PID: $FrontendPID)" -ForegroundColor Green
        Write-Host "   URL: http://localhost:8080" -ForegroundColor Cyan
        Write-Host "   Proxy: /api/* -> http://localhost:3003" -ForegroundColor White
    } else {
        Write-Host "   Status: ERROR - No se pudo iniciar" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "BACKEND:" -ForegroundColor Green
    if ($BackendConnected) {
        Write-Host "   Status: CONECTADO" -ForegroundColor Green
        Write-Host "   URL: http://localhost:3003" -ForegroundColor Cyan
    } else {
        Write-Host "   Status: DESCONECTADO" -ForegroundColor Red
        Write-Host "   Nota: Inicie Leonardo Consciousness para funcionalidad completa" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "ARCHIVOS GENERADOS:" -ForegroundColor Green
    Write-Host "   Setup log: $SETUP_LOG" -ForegroundColor Gray
    Write-Host "   Process info: frontend-process-info.json" -ForegroundColor Gray
    Write-Host "   Package.json: package.json" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "SCRIPTS DISPONIBLES:" -ForegroundColor Green
    Write-Host "   start-frontend-8080.ps1 Start    # Monitoreo completo" -ForegroundColor White
    Write-Host "   launch-background.ps1             # Solo lanzamiento" -ForegroundColor White
    Write-Host "   verify-unified-connections.ps1    # Verificar conectividad" -ForegroundColor White
    
    Write-Host ""
}

function Setup-Complete {
    Write-SetupLog "=== SETUP COMPLETO ===" "STEP"
    
    # Verificar prerequisites
    if (-not (Test-Prerequisites)) {
        Write-SetupLog "SETUP FALLIDO: Prerequisites no cumplidos" "ERROR"
        return $false
    }
    
    # Instalar dependencias
    if (-not (Install-Dependencies)) {
        Write-SetupLog "SETUP FALLIDO: Error instalando dependencias" "ERROR"
        return $false
    }
    
    # Verificar puerto
    $portAvailable = Test-Port8080
    if (-not $portAvailable) {
        Write-SetupLog "Puerto 8080 en uso, intentando continuar..." "WARN"
    }
    
    # Iniciar frontend
    $frontendPID = Start-FrontendBackground
    if (-not $frontendPID) {
        Write-SetupLog "SETUP FALLIDO: Error iniciando frontend" "ERROR"
        return $false
    }
    
    # Verificar backend
    $backendConnected = Test-BackendConnectivity
    
    # Mostrar resumen
    Show-SetupSummary -FrontendPID $frontendPID -BackendConnected $backendConnected
    
    Write-SetupLog "SETUP COMPLETO EXITOSAMENTE" "SUCCESS"
    return $true
}

function Show-Help {
    Write-Host ""
    Write-Host "SETUP FRONTEND 8080 - AYUDA" -ForegroundColor Cyan
    Write-Host "============================" -ForegroundColor Yellow
    Write-Host "Parametros disponibles:" -ForegroundColor Green
    Write-Host "  Setup      : Setup completo (default)" -ForegroundColor White
    Write-Host "  Check      : Solo verificar prerequisites" -ForegroundColor White
    Write-Host "  Install    : Solo instalar dependencias" -ForegroundColor White
    Write-Host "  Start      : Solo iniciar frontend" -ForegroundColor White
    Write-Host "  Status     : Mostrar status actual" -ForegroundColor White
    Write-Host "  Help       : Mostrar esta ayuda" -ForegroundColor White
    Write-Host ""
    Write-Host "Ejemplos de uso:" -ForegroundColor Green
    Write-Host "  .\setup-frontend-8080.ps1         # Setup completo" -ForegroundColor White
    Write-Host "  .\setup-frontend-8080.ps1 Check   # Solo verificar" -ForegroundColor White
    Write-Host ""
}

# Funcion principal
Write-SetupLog "INICIANDO SETUP FRONTEND 8080" "SUCCESS"
Write-SetupLog "Directorio: $FRONTEND_PATH" "INFO"
Write-SetupLog "Log: $SETUP_LOG" "INFO"

switch ($Action.ToLower()) {
    "setup" {
        Write-SetupLog "Modo: SETUP COMPLETO" "INFO"
        $success = Setup-Complete
        if (-not $success) {
            exit 1
        }
    }
    "check" {
        Write-SetupLog "Modo: VERIFICAR PREREQUISITES" "INFO"
        Test-Prerequisites
    }
    "install" {
        Write-SetupLog "Modo: INSTALAR DEPENDENCIAS" "INFO"
        Install-Dependencies
    }
    "start" {
        Write-SetupLog "Modo: INICIAR FRONTEND" "INFO"
        Start-FrontendBackground
    }
    "status" {
        Write-SetupLog "Modo: MOSTRAR STATUS" "INFO"
        if (Test-Path "frontend-process-info.json") {
            $processInfo = Get-Content "frontend-process-info.json" | ConvertFrom-Json
            Write-Host "Status del ultimo proceso:" -ForegroundColor Green
            Write-Host "   PID: $($processInfo.PID)" -ForegroundColor White
            Write-Host "   Inicio: $($processInfo.StartTime)" -ForegroundColor White
            Write-Host "   URL: $($processInfo.URL)" -ForegroundColor Cyan
        } else {
            Write-Host "No se encuentra informacion de proceso" -ForegroundColor Red
        }
    }
    "help" {
        Show-Help
    }
    default {
        Write-Host "Parametro no valido. Use Help para ver opciones." -ForegroundColor Yellow
        Show-Help
    }
}

Write-SetupLog "Script terminado" "INFO"
