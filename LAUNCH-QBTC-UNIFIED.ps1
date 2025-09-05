# ========================================================================
# QBTC-UNIFIED MASTER LAUNCHER
# Comando unico para lanzar todo el sistema unificado de trading cuantico
# Frontend (8080) + Backend Leonardo (3003) + Monitoreo completo
# ========================================================================

param(
    [string]$Mode = "Full",
    [switch]$Background = $false,
    [switch]$Monitor = $false,
    [switch]$Quick = $false,
    [switch]$StartQuantumCore = $false,
    [switch]$StartNxN = $false,
    [switch]$RunValidation = $false,
    [int]$UnifiedServerPort = 18022,
    [switch]$UseMockServer = $false,
    [switch]$UseEnhancedMock = $false
)

$Host.UI.RawUI.OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Configuracion global
$QBTC_ROOT = "C:\Users\DELL\Desktop\QBTC-UNIFIED"
$LEONARDO_PATH = "$QBTC_ROOT\qbtc-core\server"
$FRONTEND_PATH = "$QBTC_ROOT\frontend-unified"
$QUANTUM_CORE_PATH = "$QBTC_ROOT\quantum-core"
$LOG_FILE = "$QBTC_ROOT\qbtc-unified-launch-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

Write-Host "QBTC-UNIFIED MASTER LAUNCHER" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Yellow
Write-Host "Modo: $Mode | Background: $Background | Monitor: $Monitor" -ForegroundColor White
Write-Host ""

function Write-MasterLog {
    param([string]$Message, [string]$Level = "INFO", [string]$Component = "MASTER")
    $timestamp = Get-Date -Format "HH:mm:ss.fff"
    $logEntry = "[$timestamp] [$Component] [$Level] $Message"
    
    Write-Output $logEntry | Out-File -FilePath $LOG_FILE -Append -Encoding utf8
    
    $color = switch($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        "STEP" { "Magenta" }
        "COMPONENT" { "Cyan" }
        default { "White" }
    }
    
    Write-Host $logEntry -ForegroundColor $color
}

function Test-Prerequisites {
    Write-MasterLog "Verificando prerequisites del sistema..." "STEP"
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-MasterLog "Node.js: $nodeVersion" "SUCCESS"
        } else {
            Write-MasterLog "Node.js no encontrado" "ERROR"
            return $false
        }
    } catch {
        Write-MasterLog "Error verificando Node.js" "ERROR"
        return $false
    }
    
    # Verificar directorios criticos
    if (-not (Test-Path $LEONARDO_PATH)) {
        Write-MasterLog "Directorio Leonardo no encontrado: $LEONARDO_PATH" "ERROR"
        return $false
    }
    
    if (-not (Test-Path $FRONTEND_PATH)) {
        Write-MasterLog "Directorio Frontend no encontrado: $FRONTEND_PATH" "ERROR"
        return $false
    }

    if ($StartQuantumCore -or $StartNxN -or $RunValidation) {
        if (-not (Test-Path $QUANTUM_CORE_PATH)) {
            Write-MasterLog "Directorio Quantum Core no encontrado: $QUANTUM_CORE_PATH" "ERROR"
            return $false
        }
    }
    
    # Verificar scripts criticos
$criticalScripts = @(
    "$LEONARDO_PATH\QBTCServer.js",
    "$FRONTEND_PATH\simple-frontend-server.js",
    "$QBTC_ROOT\mock-backend-server.js",
    "$QBTC_ROOT\enhanced-mock-server.js",
    "$QBTC_ROOT\quantum-core\CredentialsManager.js"
)
    
    foreach ($script in $criticalScripts) {
        if (-not (Test-Path $script)) {
            Write-MasterLog "Script critico faltante: $script" "ERROR"
            return $false
        }
    }
    
    Write-MasterLog "Todos los prerequisites verificados" "SUCCESS"
    return $true
}

function Test-ComponentSet {
    Write-MasterLog "Verificando componentes clave (NxN, Binance, AntiLiquidation, Unified, Funds, Adversity, Cache, Validation)..." "STEP" "COMPONENTS"

    $components = @(
        @{ Name = "QuantumNxNMatrix"; Path = "$QUANTUM_CORE_PATH\QuantumNxNMatrix.js" },
        @{ Name = "BinanceRealConnector"; Path = "$QUANTUM_CORE_PATH\BinanceRealConnector.js" },
        @{ Name = "AntiLiquidationEngine"; Path = "$QUANTUM_CORE_PATH\AntiLiquidationEngine.js" },
        @{ Name = "QuantumUnifiedSystem"; Path = "$QBTC_ROOT\leonardo-consciousness\QuantumUnifiedSystem.js" },
        @{ Name = "FundsManager"; Path = "$QBTC_ROOT\leonardo-consciousness\FundsManager.js" },
        @{ Name = "AdversityPrimePredictor"; Path = "$QUANTUM_CORE_PATH\AdversityPrimePredictor.js" },
        @{ Name = "QuantumInfiniteCache"; Path = "$QUANTUM_CORE_PATH\QuantumInfiniteCache.js" },
        @{ Name = "ValidationFramework"; Path = "$QUANTUM_CORE_PATH\ValidationRunner.js" }
    )

    $allOk = $true
    foreach ($c in $components) {
        if (Test-Path $c.Path) {
            Write-MasterLog ("{0} OK: {1}" -f $c.Name, $c.Path) "SUCCESS" "COMPONENTS"
        } else {
            Write-MasterLog ("{0} FALTANTE: {1}" -f $c.Name, $c.Path) "ERROR" "COMPONENTS"
            $allOk = $false
        }
    }

    return $allOk
}

function Start-QuantumCore {
    Write-MasterLog "Iniciando Quantum Core (9090) + Unified Server ($UnifiedServerPort)..." "STEP" "QCORE"

    Push-Location $QUANTUM_CORE_PATH
    try {
        # Detectar proceso existente
        $existingProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
            try {
                $wmi = Get-WmiObject -Class Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction SilentlyContinue
                return $wmi -and $wmi.CommandLine -like "*quantum-core*index.js*"
            } catch { return $false }
        }
        if ($existingProcess) {
            Write-MasterLog "Quantum Core ya ejecutandose (PID: $($existingProcess.Id))" "SUCCESS" "QCORE"
            Pop-Location
            return $existingProcess.Id
        }

        # Configurar entorno evitando colisiones en 18020
        $env:QUANTUM_PORT = 9090
        $env:METRICS_PORT = 9100
        $env:COORDINATOR_PORT = 3000
        $env:UNIFIED_SERVER_PORT = $UnifiedServerPort
        $env:SINGLE_SERVER_MODE = 'true'

        # Iniciar proceso
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = "node"
        $psi.Arguments = "index.js"
        $psi.WorkingDirectory = $QUANTUM_CORE_PATH
        $psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
        $psi.CreateNoWindow = $true
        $psi.UseShellExecute = $false

        $proc = [System.Diagnostics.Process]::Start($psi)
        Write-MasterLog "Quantum Core iniciado (PID: $($proc.Id))" "SUCCESS" "QCORE"

        Start-Sleep -Seconds 6

        # Verificar puertos
        $okCore = Test-NetConnection -ComputerName "localhost" -Port 9090 -InformationLevel Quiet -WarningAction SilentlyContinue
        $okUnified = Test-NetConnection -ComputerName "localhost" -Port $UnifiedServerPort -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($okCore) { Write-MasterLog "Core respondiendo en 9090" "SUCCESS" "QCORE" } else { Write-MasterLog "Core no responde en 9090" "WARN" "QCORE" }
        if ($okUnified) { Write-MasterLog "Unified Server respondiendo en $UnifiedServerPort" "SUCCESS" "QCORE" } else { Write-MasterLog "Unified Server no responde en $UnifiedServerPort" "WARN" "QCORE" }

        Pop-Location
        return $proc.Id
    } catch {
        Write-MasterLog "Error iniciando Quantum Core: $($_.Exception.Message)" "ERROR" "QCORE"
        Pop-Location
        return $null
    }
}

function Start-NxNSystem {
    Write-MasterLog "Activando Sistema NxN Infinito..." "STEP" "NXN"

    Push-Location $QUANTUM_CORE_PATH
    try {
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = "node"
        $psi.Arguments = "ACTIVATE_NxN_SYSTEM.js"
        $psi.WorkingDirectory = $QUANTUM_CORE_PATH
        $psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
        $psi.CreateNoWindow = $true
        $psi.UseShellExecute = $false

        $proc = [System.Diagnostics.Process]::Start($psi)
        Write-MasterLog "NxN activación lanzada (PID: $($proc.Id))" "SUCCESS" "NXN"
        Pop-Location
        return $proc.Id
    } catch {
        Write-MasterLog "Error activando NxN: $($_.Exception.Message)" "ERROR" "NXN"
        Pop-Location
        return $null
    }
}

function Invoke-QuantumValidation {
    Write-MasterLog "Iniciando Validación Paso 7..." "STEP" "VALIDATION"

    Push-Location $QUANTUM_CORE_PATH
    try {
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = "powershell.exe"
        $psi.Arguments = "-ExecutionPolicy Bypass -File RunStep7Validation.ps1"
        $psi.WorkingDirectory = $QUANTUM_CORE_PATH
        $psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
        $psi.CreateNoWindow = $true
        $psi.UseShellExecute = $false

        $proc = [System.Diagnostics.Process]::Start($psi)
        Write-MasterLog "Validación lanzada (PID: $($proc.Id))" "SUCCESS" "VALIDATION"
        Pop-Location
        return $proc.Id
    } catch {
        Write-MasterLog "Error iniciando validación: $($_.Exception.Message)" "ERROR" "VALIDATION"
        Pop-Location
        return $null
    }
}

function Start-LeonardoBackend {
    Write-MasterLog "Iniciando Leonardo Consciousness Backend..." "STEP" "LEONARDO"
    
    Push-Location $LEONARDO_PATH
    
    try {
        # Verificar si ya esta ejecutandose
        $existingProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
            try {
                $wmi = Get-WmiObject -Class Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction SilentlyContinue
                return $wmi -and $wmi.CommandLine -like "*QBTCServer*"
            }
            catch { return $false }
        }
        
        if ($existingProcess) {
            Write-MasterLog "Leonardo ya ejecutandose (PID: $($existingProcess.Id))" "SUCCESS" "LEONARDO"
            Pop-Location
            return $existingProcess.Id
        }

        # Verificar dependencias del backend (express, ws, cors)
        if (-not (Test-Path "node_modules\express")) {
            Write-MasterLog "Instalando dependencias del backend (express, ws, cors)..." "INFO" "LEONARDO"
            try {
                npm install express ws cors --silent
                Write-MasterLog "Dependencias backend instaladas" "SUCCESS" "LEONARDO"
            } catch {
                Write-MasterLog "Error instalando dependencias backend: $($_.Exception.Message)" "ERROR" "LEONARDO"
            }
        }

        # Iniciar proceso en segundo plano
        $processInfo = New-Object System.Diagnostics.ProcessStartInfo
        $processInfo.FileName = "node"
        $processInfo.Arguments = "QBTCServer.js"
        $processInfo.WorkingDirectory = $LEONARDO_PATH
        $processInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
        $processInfo.CreateNoWindow = $true
        $processInfo.UseShellExecute = $false
        
        $process = [System.Diagnostics.Process]::Start($processInfo)
        Write-MasterLog "Leonardo iniciado (PID: $($process.Id))" "SUCCESS" "LEONARDO"
        
        # Esperar inicializacion
        Start-Sleep -Seconds 8
        
        # Verificar puerto 18020 (QBTC UNIFIED Backend)
        $portTest = Test-NetConnection -ComputerName "localhost" -Port 18020 -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($portTest) {
            Write-MasterLog "Backend respondiendo en puerto 18020" "SUCCESS" "LEONARDO"
        } else {
            Write-MasterLog "ADVERTENCIA: Backend podria no estar respondiendo" "WARN" "LEONARDO"
        }
        
        Pop-Location
        return $process.Id
        
    } catch {
        Write-MasterLog "Error iniciando Leonardo: $($_.Exception.Message)" "ERROR" "LEONARDO"
        Pop-Location
        return $null
    }
}

function Start-FrontendUnified {
    Write-MasterLog "Iniciando Frontend Unificado..." "STEP" "FRONTEND"
    
    Push-Location $FRONTEND_PATH
    
    try {
        # Verificar si ya esta ejecutandose
        $existingProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
            try {
                $wmi = Get-WmiObject -Class Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction SilentlyContinue
                return $wmi -and $wmi.CommandLine -like "*simple-frontend-server*"
            }
            catch { return $false }
        }
        
        if ($existingProcess) {
            Write-MasterLog "Frontend ya ejecutandose (PID: $($existingProcess.Id))" "SUCCESS" "FRONTEND"
            Pop-Location
            return $existingProcess.Id
        }
        
        # Verificar dependencias
        if (-not (Test-Path "node_modules")) {
            Write-MasterLog "Instalando dependencias del frontend..." "INFO" "FRONTEND"
            npm install --silent
        }
        
        # Iniciar proceso en segundo plano
        $processInfo = New-Object System.Diagnostics.ProcessStartInfo
        $processInfo.FileName = "node"
        $processInfo.Arguments = "simple-frontend-server.js"
        $processInfo.WorkingDirectory = $FRONTEND_PATH
        $processInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
        $processInfo.CreateNoWindow = $true
        $processInfo.UseShellExecute = $false
        
        $process = [System.Diagnostics.Process]::Start($processInfo)
        Write-MasterLog "Frontend iniciado (PID: $($process.Id))" "SUCCESS" "FRONTEND"
        
        # Esperar inicializacion
        Start-Sleep -Seconds 5
        
        # Verificar puerto 18021 (Frontend Unificado)
        $portTest = Test-NetConnection -ComputerName "localhost" -Port 18021 -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($portTest) {
            Write-MasterLog "Frontend respondiendo en puerto 18021" "SUCCESS" "FRONTEND"
        } else {
            Write-MasterLog "ADVERTENCIA: Frontend podria no estar respondiendo" "WARN" "FRONTEND"
        }
        
        Pop-Location
        return $process.Id
        
    } catch {
        Write-MasterLog "Error iniciando Frontend: $($_.Exception.Message)" "ERROR" "FRONTEND"
        Pop-Location
        return $null
    }
}

function Test-SystemConnectivity {
    Write-MasterLog "Verificando conectividad del sistema..." "STEP" "CONNECTIVITY"
    
    $systems = @(
        @{ Name = "Leonardo Backend"; URL = "http://localhost:18020/api/health"; Critical = $true },
        @{ Name = "Frontend Unified"; URL = "http://localhost:18021"; Critical = $true },
        @{ Name = "API Proxy"; URL = "http://localhost:18021/api/health"; Critical = $false }
    )

    if ($StartQuantumCore) {
        $systems += @(
            @{ Name = "Quantum Core"; URL = "http://localhost:9090/quantum/status"; Critical = $false },
            @{ Name = "Unified Server"; URL = ("http://localhost:{0}/unified/health" -f $UnifiedServerPort); Critical = $false }
        )
    }
    
    $results = @{}
    
    foreach ($system in $systems) {
        try {
            $response = Invoke-WebRequest -Uri $system.URL -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
            $status = "OK ($($response.StatusCode))"
            $connected = $true
            Write-MasterLog "$($system.Name): $status" "SUCCESS" "CONNECTIVITY"
        }
        catch {
            $status = "FAIL"
            $connected = $false
            $level = if($system.Critical) { "ERROR" } else { "WARN" }
            Write-MasterLog "$($system.Name): $status" $level "CONNECTIVITY"
        }
        
        $results[$system.Name] = @{
            Connected = $connected
            Status = $status
            Critical = $system.Critical
        }
    }
    
    return $results
}

function Show-SystemStatus {
    param([hashtable]$ProcessInfo, [hashtable]$ConnectivityResults)
    
    Clear-Host
    Write-Host "QBTC-UNIFIED SYSTEM STATUS" -ForegroundColor Cyan
    Write-Host "==========================" -ForegroundColor Yellow
    Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
    Write-Host ""
    
    # Procesos
    Write-Host "PROCESOS ACTIVOS:" -ForegroundColor Green
    if ($ProcessInfo.LeonardoPID) {
        Write-Host "   Leonardo Backend: EJECUTANDOSE (PID: $($ProcessInfo.LeonardoPID))" -ForegroundColor Green
    } else {
        Write-Host "   Leonardo Backend: NO EJECUTANDOSE" -ForegroundColor Red
    }
    
    if ($ProcessInfo.FrontendPID) {
        Write-Host "   Frontend Unified: EJECUTANDOSE (PID: $($ProcessInfo.FrontendPID))" -ForegroundColor Green
    } else {
        Write-Host "   Frontend Unified: NO EJECUTANDOSE" -ForegroundColor Red
    }

    if ($ProcessInfo.QuantumCorePID) {
        Write-Host "   Quantum Core: EJECUTANDOSE (PID: $($ProcessInfo.QuantumCorePID))" -ForegroundColor Green
    } elseif ($StartQuantumCore) {
        Write-Host "   Quantum Core: NO EJECUTANDOSE" -ForegroundColor Red
    }

    if ($ProcessInfo.NxNPID) {
        Write-Host "   NxN Activation: EJECUTANDOSE (PID: $($ProcessInfo.NxNPID))" -ForegroundColor Green
    } elseif ($StartNxN) {
        Write-Host "   NxN Activation: NO EJECUTANDOSE" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # Conectividad
    Write-Host "CONECTIVIDAD:" -ForegroundColor Green
    foreach ($systemName in $ConnectivityResults.Keys) {
        $result = $ConnectivityResults[$systemName]
        $color = if($result.Connected) { "Green" } else { "Red" }
        $criticality = if($result.Critical) { " [CRITICO]" } else { "" }
        Write-Host "   $systemName : $($result.Status)$criticality" -ForegroundColor $color
    }
    
    Write-Host ""
    
    # URLs importantes
    Write-Host "URLS DE ACCESO:" -ForegroundColor Green
    Write-Host "   Frontend Principal: http://localhost:18021" -ForegroundColor Cyan
    Write-Host "   Backend API: http://localhost:18020" -ForegroundColor Cyan
    Write-Host "   Proxy API: http://localhost:18021/api/*" -ForegroundColor Cyan
    if ($StartQuantumCore) {
        Write-Host ("   Quantum Core: http://localhost:9090/quantum/status") -ForegroundColor Cyan
        Write-Host ("   Unified Server: http://localhost:{0}/unified/health" -f $UnifiedServerPort) -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "Log del sistema: $LOG_FILE" -ForegroundColor Gray
}

function Start-UnifiedMonitoring {
    Write-MasterLog "Iniciando monitoreo unificado..." "STEP" "MONITOR"
    
    $iteration = 0
    while ($true) {
        try {
            $iteration++
            
            # Obtener informacion de procesos
            $processInfo = @{}
            
            # Leonardo
            $leonardoProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
                try {
                    $wmi = Get-WmiObject -Class Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction SilentlyContinue
                    return $wmi -and $wmi.CommandLine -like "*QBTCServer*"
                } catch { return $false }
            }
            if ($leonardoProcess) { $processInfo.LeonardoPID = $leonardoProcess.Id }
            
            # Frontend
            $frontendProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
                try {
                    $wmi = Get-WmiObject -Class Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction SilentlyContinue
                    return $wmi -and $wmi.CommandLine -like "*simple-frontend-server*"
                } catch { return $false }
            }
            if ($frontendProcess) { $processInfo.FrontendPID = $frontendProcess.Id }
            
            # Auto-restart si no hay procesos (cada 10 iteraciones para no saturar)
            if ($iteration % 10 -eq 0) {
                if (-not $processInfo.LeonardoPID) {
                    Write-MasterLog "Leonardo no está ejecutándose, intentando iniciar..." "WARN" "MONITOR"
                    $pidLeonardo = Start-LeonardoBackend
                    if ($pidLeonardo) {
                        $processInfo.LeonardoPID = $pidLeonardo
                        Write-MasterLog "Leonardo reiniciado (PID: $pidLeonardo)" "SUCCESS" "MONITOR"
                    }
                }
                if (-not $processInfo.FrontendPID) {
                    Write-MasterLog "Frontend no está ejecutándose, intentando iniciar..." "WARN" "MONITOR"
                    $pidFrontend = Start-FrontendUnified
                    if ($pidFrontend) {
                        $processInfo.FrontendPID = $pidFrontend
                        Write-MasterLog "Frontend reiniciado (PID: $pidFrontend)" "SUCCESS" "MONITOR"
                    }
                }
                if ($StartQuantumCore -and -not $processInfo.QuantumCorePID) {
                    Write-MasterLog "Quantum Core no está ejecutándose, intentando iniciar..." "WARN" "MONITOR"
                    $pidQCore = Start-QuantumCore
                    if ($pidQCore) {
                        $processInfo.QuantumCorePID = $pidQCore
                        Write-MasterLog "Quantum Core reiniciado (PID: $pidQCore)" "SUCCESS" "MONITOR"
                    }
                }
            }

            # Verificar conectividad cada 5 iteraciones
            if ($iteration % 5 -eq 0) {
                $connectivityResults = Test-SystemConnectivity
            } else {
                # Usar resultados anteriores o crear basicos
                $connectivityResults = @{
                    "Leonardo Backend" = @{ Connected = ($null -ne $processInfo.LeonardoPID); Status = "Cached"; Critical = $true }
                    "Frontend Unified" = @{ Connected = ($null -ne $processInfo.FrontendPID); Status = "Cached"; Critical = $true }
                }
                if ($StartQuantumCore) {
                    $connectivityResults["Quantum Core"] = @{ Connected = ($null -ne $processInfo.QuantumCorePID); Status = "Cached"; Critical = $false }
                    $connectivityResults["Unified Server"] = @{ Connected = $false; Status = "Unknown"; Critical = $false }
                }
            }
            
            # Mostrar status
            Show-SystemStatus -ProcessInfo $processInfo -ConnectivityResults $connectivityResults
            
            # Log cada 10 iteraciones
            if ($iteration % 10 -eq 0) {
                Write-MasterLog "=== STATUS CHECK [$iteration] ===" "INFO" "MONITOR"
                Write-MasterLog "Leonardo PID: $($processInfo.LeonardoPID)" "INFO" "MONITOR"
                Write-MasterLog "Frontend PID: $($processInfo.FrontendPID)" "INFO" "MONITOR"
            }
            
            Start-Sleep -Seconds 3
            
        }
        catch {
            Write-MasterLog "Error en monitoreo: $($_.Exception.Message)" "ERROR" "MONITOR"
            Start-Sleep -Seconds 5
        }
    }
}

function Save-LaunchStatus {
    param([hashtable]$ProcessInfo, [hashtable]$ConnectivityResults)
    
    $statusData = @{
        LaunchTime = Get-Date
        ProcessInfo = $processInfo
        ConnectivityResults = $ConnectivityResults
        SystemURLs = @{
            Frontend = "http://localhost:18021"
            Backend = "http://localhost:18020"
            ProxyAPI = "http://localhost:18021/api/*"
            QuantumCore = (if ($StartQuantumCore) { "http://localhost:9090/quantum/status" } else { $null })
            UnifiedServer = (if ($StartQuantumCore) { ("http://localhost:{0}/unified/health" -f $UnifiedServerPort) } else { $null })
        }
        LogFile = $LOG_FILE
        Status = "LAUNCHED"
    }
    
    $statusPath = "$QBTC_ROOT\qbtc-unified-status.json"
    $statusData | ConvertTo-Json -Depth 10 | Out-File $statusPath -Encoding utf8
    
    Write-MasterLog "Status guardado en: $statusPath" "SUCCESS"
}

function Show-QuickStart {
    Write-Host ""
    Write-Host "QBTC-UNIFIED QUICK START COMPLETO" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Frontend accesible en: http://localhost:18021" -ForegroundColor Cyan
    Write-Host "Backend API en: http://localhost:18020" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Sistema lanzado exitosamente!" -ForegroundColor Green
    Write-Host "Presione Ctrl+C para salir del monitoreo" -ForegroundColor Gray
}

function Show-Help {
    Write-Host ""
    Write-Host "QBTC-UNIFIED MASTER LAUNCHER - AYUDA" -ForegroundColor Cyan
    Write-Host "====================================" -ForegroundColor Yellow
    Write-Host "Parametros:" -ForegroundColor Green
    Write-Host "  -Mode [Full|Frontend|Backend|Monitor]" -ForegroundColor White
    Write-Host "  -Background    # Ejecutar en segundo plano" -ForegroundColor White
    Write-Host "  -Monitor       # Iniciar con monitoreo" -ForegroundColor White
    Write-Host "  -Quick         # Modo rapido sin verificaciones" -ForegroundColor White
    Write-Host ""
    Write-Host "Ejemplos:" -ForegroundColor Green
    Write-Host "  .\LAUNCH-QBTC-UNIFIED.ps1                    # Lanzamiento completo" -ForegroundColor White
    Write-Host "  .\LAUNCH-QBTC-UNIFIED.ps1 -Monitor           # Con monitoreo" -ForegroundColor White
    Write-Host "  .\LAUNCH-QBTC-UNIFIED.ps1 -Background        # Segundo plano" -ForegroundColor White
    Write-Host "  .\LAUNCH-QBTC-UNIFIED.ps1 -Mode Frontend     # Solo frontend" -ForegroundColor White
    Write-Host ""
}

# ========================================================================
# LOGICA PRINCIPAL
# ========================================================================

Write-MasterLog "QBTC-UNIFIED MASTER LAUNCHER INICIADO" "SUCCESS"
Write-MasterLog "Modo: $Mode | Background: $Background | Monitor: $Monitor" "INFO"
Write-MasterLog "Log principal: $LOG_FILE" "INFO"

# Verificar parametros especiales
if ($Quick) {
    Write-MasterLog "MODO RAPIDO ACTIVADO - Saltando verificaciones" "WARN"
} else {
    if (-not (Test-Prerequisites)) {
        Write-MasterLog "PREREQUISITES FALLIDOS - Abortando lanzamiento" "ERROR"
        exit 1
    }
}

# Logica segun modo
switch ($Mode.ToLower()) {
    "full" {
        Write-MasterLog "=== LANZAMIENTO COMPLETO ===" "STEP"
        
        # Iniciar Leonardo
        $leonardoPID = Start-LeonardoBackend
        if (-not $leonardoPID) {
            Write-MasterLog "Error iniciando Leonardo - Continuando..." "WARN"
        }
        
        # Esperar un poco
        Start-Sleep -Seconds 3
        
        # Iniciar Frontend
        $frontendPID = Start-FrontendUnified
        if (-not $frontendPID) {
            Write-MasterLog "Error iniciando Frontend - Continuando..." "WARN"
        }

        # Verificar componentes clave
        $componentsOk = Test-ComponentSet
        if (-not $componentsOk) {
            Write-MasterLog "Uno o más componentes clave faltan. Revise el log." "WARN" "COMPONENTS"
        }

        # Iniciar Quantum Core opcionalmente
        $qcorePID = $null
        if ($StartQuantumCore) {
            $qcorePID = Start-QuantumCore
        }

        # Activar NxN opcionalmente
        $nxnPID = $null
        if ($StartNxN) {
            $nxnPID = Start-NxNSystem
        }

        # Lanzar Validación opcionalmente
        $validationPID = $null
        if ($RunValidation) {
            $validationPID = Invoke-QuantumValidation
        }
        
        # Verificar conectividad
        Start-Sleep -Seconds 5
        $connectivityResults = Test-SystemConnectivity
        
        # Guardar status
        $processInfo = @{
            LeonardoPID = $leonardoPID
            FrontendPID = $frontendPID
            QuantumCorePID = $qcorePID
            NxNPID = $nxnPID
            ValidationPID = $validationPID
        }
        Save-LaunchStatus -ProcessInfo $processInfo -ConnectivityResults $connectivityResults
        
        if ($Monitor -or -not $Background) {
            Show-QuickStart
            if ($Monitor) {
                Start-UnifiedMonitoring
            } else {
                pause
            }
        } else {
            Show-QuickStart
            Write-MasterLog "Sistema ejecutandose en segundo plano" "SUCCESS"
        }
    }
    
    "frontend" {
        Write-MasterLog "=== SOLO FRONTEND ===" "STEP"
        $frontendPID = Start-FrontendUnified
        if ($frontendPID -and $Monitor) {
            Start-UnifiedMonitoring
        }
    }
    
    "backend" {
        Write-MasterLog "=== SOLO BACKEND ===" "STEP"
        $leonardoPID = Start-LeonardoBackend
        if ($leonardoPID -and $Monitor) {
            Start-UnifiedMonitoring
        }
    }
    
    "monitor" {
        Write-MasterLog "=== SOLO MONITOREO ===" "STEP"
        Start-UnifiedMonitoring
    }
    
    "help" {
        Show-Help
        exit 0
    }
    
    default {
        Write-MasterLog "Modo no valido: $Mode" "ERROR"
        Show-Help
        exit 1
    }
}

Write-MasterLog "LANZAMIENTO COMPLETADO" "SUCCESS"
