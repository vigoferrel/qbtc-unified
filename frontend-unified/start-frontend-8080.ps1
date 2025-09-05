# ========================================================================
# QBTC FRONTEND UNIFICADO - PUERTO 8080
# Script PowerShell para lanzar y monitorear el servidor frontend 
# con reportes de status y metricas en segundo plano
# ========================================================================

param([string]$Action = "Start")

# Configuracion basada en las reglas del usuario
$Host.UI.RawUI.OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "QBTC Frontend Unified - Puerto 8080" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Yellow

# Configuracion
$FRONTEND_PATH = $PSScriptRoot
$FRONTEND_SCRIPT = "frontend-proxy-server.js"
$FRONTEND_PORT = 8080
$BACKEND_PORT = 3003
$LOG_FILE = "$FRONTEND_PATH\frontend-8080-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
$MONITOR_INTERVAL = 3  # segundos para reportes de status

Write-Host "Directorio: $FRONTEND_PATH" -ForegroundColor Green
Write-Host "Script: $FRONTEND_SCRIPT" -ForegroundColor Green
Write-Host "Puerto Frontend: $FRONTEND_PORT" -ForegroundColor Green
Write-Host "Puerto Backend: $BACKEND_PORT" -ForegroundColor Green
Write-Host "Log: $LOG_FILE" -ForegroundColor Green

function Write-LogMessage {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "HH:mm:ss.fff"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # Guardar en archivo de log
    Write-Output $logEntry | Out-File -FilePath $LOG_FILE -Append -Encoding utf8
    
    switch($Level) {
        "ERROR" { Write-Host $logEntry -ForegroundColor Red }
        "WARN"  { Write-Host $logEntry -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $logEntry -ForegroundColor Green }
        "METRICS" { Write-Host $logEntry -ForegroundColor Magenta }
        default { Write-Host $logEntry -ForegroundColor White }
    }
}

function Test-Port {
    param([int]$Port)
    try {
        $connection = Test-NetConnection -ComputerName "localhost" -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
        return $connection
    }
    catch {
        return $false
    }
}

function Get-FrontendProcesses {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    $frontendProcesses = @()
    
    foreach ($proc in $nodeProcesses) {
        try {
            $wmiProcess = Get-WmiObject -Class Win32_Process -Filter "ProcessId = $($proc.Id)" -ErrorAction SilentlyContinue
            if ($wmiProcess -and ($wmiProcess.CommandLine -like "*frontend-proxy-server*" -or $wmiProcess.CommandLine -like "*8080*")) {
                $frontendProcesses += $proc
            }
        }
        catch {
            # Heuristica: proceso Node.js que use puerto 8080
            $netstat = netstat -ano | Select-String ":8080.*LISTENING"
            if ($netstat -and $netstat -match $proc.Id) {
                $frontendProcesses += $proc
            }
        }
    }
    
    return $frontendProcesses
}

function Start-Frontend {
    Write-LogMessage "Verificando si frontend esta ejecutandose en puerto $FRONTEND_PORT..." "INFO"
    
    # Verificar puerto
    $portInUse = Test-Port -Port $FRONTEND_PORT
    if ($portInUse) {
        Write-LogMessage "Puerto $FRONTEND_PORT ya esta en uso" "WARN"
        $frontendProcesses = Get-FrontendProcesses
        if ($frontendProcesses.Count -gt 0) {
            Write-LogMessage "Frontend ya ejecutandose (PIDs: $($frontendProcesses.Id -join ', '))" "INFO"
            return $true
        }
    }
    
    # Verificar archivo del servidor
    $serverPath = Join-Path $FRONTEND_PATH $FRONTEND_SCRIPT
    if (-not (Test-Path $serverPath)) {
        Write-LogMessage "ERROR: No se encuentra $FRONTEND_SCRIPT en $FRONTEND_PATH" "ERROR"
        return $false
    }
    
    Write-LogMessage "Iniciando servidor frontend..." "INFO"
    
    try {
        # Cambiar al directorio del frontend
        Push-Location $FRONTEND_PATH
        
        # Verificar dependencias npm
        if (Test-Path "package.json") {
            if (-not (Test-Path "node_modules")) {
                Write-LogMessage "Instalando dependencias npm..." "INFO"
                npm install
            }
        }
        
        # Iniciar servidor en segundo plano
        $processInfo = New-Object System.Diagnostics.ProcessStartInfo
        $processInfo.FileName = "node"
        $processInfo.Arguments = $FRONTEND_SCRIPT
        $processInfo.WorkingDirectory = $FRONTEND_PATH
        $processInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
        $processInfo.CreateNoWindow = $true
        $processInfo.UseShellExecute = $false
        $processInfo.RedirectStandardOutput = $true
        $processInfo.RedirectStandardError = $true
        
        $process = [System.Diagnostics.Process]::Start($processInfo)
        
        Write-LogMessage "Frontend iniciado con PID: $($process.Id)" "SUCCESS"
        
        # Esperar inicializacion
        Start-Sleep -Seconds 3
        
        # Verificar que este funcionando
        $isRunning = Test-Port -Port $FRONTEND_PORT
        if ($isRunning) {
            Write-LogMessage "Frontend confirmado ejecutandose en puerto $FRONTEND_PORT" "SUCCESS"
        } else {
            Write-LogMessage "ADVERTENCIA: No se pudo confirmar que el frontend este funcionando" "WARN"
        }
        
        Pop-Location
        return $true
        
    } catch {
        Write-LogMessage "ERROR iniciando frontend: $($_.Exception.Message)" "ERROR"
        Pop-Location
        return $false
    }
}

function Get-SystemMetrics {
    $cpu = Get-WmiObject -Class Win32_Processor | Measure-Object -Property LoadPercentage -Average
    $memory = Get-WmiObject -Class Win32_OperatingSystem
    $totalMemoryMB = [Math]::Round($memory.TotalVisibleMemorySize / 1024)
    $freeMemoryMB = [Math]::Round($memory.FreePhysicalMemory / 1024)
    $usedMemoryMB = $totalMemoryMB - $freeMemoryMB
    
    return @{
        CPUPercent = [Math]::Round($cpu.Average, 2)
        TotalMemoryMB = $totalMemoryMB
        UsedMemoryMB = $usedMemoryMB
        FreeMemoryMB = $freeMemoryMB
        MemoryPercent = [Math]::Round(($usedMemoryMB / $totalMemoryMB) * 100, 2)
    }
}

function Get-FrontendMetrics {
    $frontendProcesses = Get-FrontendProcesses
    $metrics = @()
    
    foreach ($proc in $frontendProcesses) {
        try {
            $proc.Refresh()
            $workingSetMB = [Math]::Round($proc.WorkingSet64 / 1MB, 2)
            $runtime = (Get-Date) - $proc.StartTime
            
            $metrics += @{
                PID = $proc.Id
                WorkingSetMB = $workingSetMB
                Runtime = $runtime.ToString('hh\:mm\:ss')
                ThreadCount = $proc.Threads.Count
                HandleCount = $proc.HandleCount
            }
        }
        catch {
            Write-LogMessage "Error obteniendo metricas del proceso $($proc.Id)" "WARN"
        }
    }
    
    return $metrics
}

function Test-BackendConnectivity {
    $backendUrl = "http://localhost:$BACKEND_PORT"
    try {
        $response = Invoke-WebRequest -Uri "$backendUrl/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
        return $response.StatusCode -eq 200
    }
    catch {
        try {
            # Intento alternativo: solo verificar puerto
            return Test-Port -Port $BACKEND_PORT
        }
        catch {
            return $false
        }
    }
}

function Test-FrontendConnectivity {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$FRONTEND_PORT" -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

function Show-Status {
    Clear-Host
    Write-Host "QBTC Frontend Unified - Status Monitor" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Yellow
    Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
    Write-Host ""
    
    # Sistema general
    $systemMetrics = Get-SystemMetrics
    Write-Host "SISTEMA:" -ForegroundColor Green
    Write-Host "   CPU: $($systemMetrics.CPUPercent)%" -ForegroundColor White
    Write-Host "   Memoria: $($systemMetrics.UsedMemoryMB) MB / $($systemMetrics.TotalMemoryMB) MB ($($systemMetrics.MemoryPercent)%)" -ForegroundColor White
    Write-Host ""
    
    # Frontend
    $frontendMetrics = Get-FrontendMetrics
    if ($frontendMetrics.Count -gt 0) {
        Write-Host "FRONTEND (Puerto $FRONTEND_PORT):" -ForegroundColor Green
        foreach ($metrics in $frontendMetrics) {
            Write-Host "   PID: $($metrics.PID) | RAM: $($metrics.WorkingSetMB) MB | Runtime: $($metrics.Runtime) | Threads: $($metrics.ThreadCount)" -ForegroundColor White
        }
    } else {
        Write-Host "FRONTEND: NO EJECUTANDOSE" -ForegroundColor Red
    }
    Write-Host ""
    
    # Conectividad
    $frontendOK = Test-FrontendConnectivity
    $backendOK = Test-BackendConnectivity
    
    Write-Host "CONECTIVIDAD:" -ForegroundColor Green
    Write-Host "   Frontend (8080): $(if($frontendOK){"OK"}else{"FAIL"})" -ForegroundColor $(if($frontendOK){"Green"}else{"Red"})
    Write-Host "   Backend (3003):  $(if($backendOK){"OK"}else{"FAIL"})" -ForegroundColor $(if($backendOK){"Green"}else{"Red"})
    
    # URLs importantes
    Write-Host ""
    Write-Host "URLS:" -ForegroundColor Green
    Write-Host "   Frontend: http://localhost:8080" -ForegroundColor Cyan
    Write-Host "   Backend:  http://localhost:3003" -ForegroundColor Cyan
    Write-Host ""
    
    # Alertas
    $alerts = @()
    if (-not $frontendOK) { $alerts += "Frontend no responde en puerto 8080" }
    if (-not $backendOK) { $alerts += "Backend no disponible en puerto 3003" }
    if ($systemMetrics.CPUPercent -gt 80) { $alerts += "CPU alta: $($systemMetrics.CPUPercent)%" }
    
    if ($alerts.Count -gt 0) {
        Write-Host "ALERTAS:" -ForegroundColor Red
        foreach ($alert in $alerts) {
            Write-Host "   ! $alert" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    Write-Host "Log: $LOG_FILE" -ForegroundColor Gray
    Write-Host "Presione Ctrl+C para salir" -ForegroundColor Gray
}

function Start-Monitoring {
    Write-LogMessage "Iniciando monitoreo del frontend en puerto $FRONTEND_PORT" "SUCCESS"
    
    $iteration = 0
    while ($true) {
        try {
            $iteration++
            
            Show-Status
            
            # Log metricas cada 5 iteraciones
            if ($iteration % 5 -eq 0) {
                $systemMetrics = Get-SystemMetrics
                $frontendMetrics = Get-FrontendMetrics
                $frontendOK = Test-FrontendConnectivity
                $backendOK = Test-BackendConnectivity
                
                Write-LogMessage "=== METRICAS [$iteration] ===" "METRICS"
                Write-LogMessage "Sistema: CPU=$($systemMetrics.CPUPercent)% RAM=$($systemMetrics.UsedMemoryMB)MB" "METRICS"
                Write-LogMessage "Frontend: Procesos=$($frontendMetrics.Count) Status=$(if($frontendOK){"OK"}else{"FAIL"})" "METRICS"
                Write-LogMessage "Backend: Status=$(if($backendOK){"OK"}else{"FAIL"})" "METRICS"
                
                foreach ($metrics in $frontendMetrics) {
                    Write-LogMessage "Proceso PID=$($metrics.PID): RAM=$($metrics.WorkingSetMB)MB Runtime=$($metrics.Runtime)" "METRICS"
                }
            }
            
            Start-Sleep -Seconds $MONITOR_INTERVAL
            
        }
        catch {
            Write-LogMessage "Error en ciclo de monitoreo: $($_.Exception.Message)" "ERROR"
            Start-Sleep -Seconds 5
        }
    }
}

function Stop-Frontend {
    Write-LogMessage "Deteniendo procesos del frontend..." "INFO"
    
    $frontendProcesses = Get-FrontendProcesses
    if ($frontendProcesses.Count -eq 0) {
        Write-LogMessage "No se encontraron procesos del frontend ejecutandose" "INFO"
        return $true
    }
    
    foreach ($proc in $frontendProcesses) {
        try {
            Write-LogMessage "Deteniendo proceso PID: $($proc.Id)" "INFO"
            Stop-Process -Id $proc.Id -Force
            Write-LogMessage "Proceso $($proc.Id) detenido" "SUCCESS"
        }
        catch {
            Write-LogMessage "Error deteniendo proceso $($proc.Id): $($_.Exception.Message)" "ERROR"
        }
    }
    
    return $true
}

function Show-Help {
    Write-Host ""
    Write-Host "QBTC FRONTEND UNIFICADO - PUERTO 8080 - AYUDA" -ForegroundColor Cyan
    Write-Host "==============================================" -ForegroundColor Yellow
    Write-Host "Parametros disponibles:" -ForegroundColor Green
    Write-Host "  Start    : Inicia frontend y comienza monitoreo" -ForegroundColor White
    Write-Host "  Monitor  : Solo monitorea (frontend debe estar ejecutandose)" -ForegroundColor White
    Write-Host "  Status   : Muestra status actual y sale" -ForegroundColor White
    Write-Host "  Stop     : Detiene todos los procesos del frontend" -ForegroundColor White
    Write-Host "  Restart  : Reinicia el frontend" -ForegroundColor White
    Write-Host "  Help     : Muestra esta ayuda" -ForegroundColor White
    Write-Host ""
    Write-Host "Ejemplos de uso:" -ForegroundColor Green
    Write-Host "  .\start-frontend-8080.ps1 Start" -ForegroundColor White
    Write-Host "  .\start-frontend-8080.ps1 Monitor" -ForegroundColor White
    Write-Host "  .\start-frontend-8080.ps1 Status" -ForegroundColor White
    Write-Host ""
}

# Funcion principal
Write-LogMessage "Script de frontend iniciado" "SUCCESS"
Write-LogMessage "Directorio: $FRONTEND_PATH" "INFO"
Write-LogMessage "Puerto objetivo: $FRONTEND_PORT" "INFO"

switch ($Action.ToLower()) {
    "start" {
        Write-LogMessage "Modo: INICIAR Y MONITOREAR" "SUCCESS"
        $started = Start-Frontend
        if ($started) {
            Start-Monitoring
        } else {
            Write-LogMessage "No se pudo iniciar frontend" "ERROR"
            exit 1
        }
    }
    "monitor" {
        Write-LogMessage "Modo: SOLO MONITOREAR" "SUCCESS"
        Start-Monitoring
    }
    "status" {
        Write-LogMessage "Modo: MOSTRAR STATUS" "SUCCESS"
        Show-Status
        pause
    }
    "stop" {
        Write-LogMessage "Modo: DETENER FRONTEND" "SUCCESS"
        Stop-Frontend
        Write-LogMessage "Frontend detenido" "SUCCESS"
    }
    "restart" {
        Write-LogMessage "Modo: REINICIAR FRONTEND" "SUCCESS"
        Stop-Frontend
        Start-Sleep -Seconds 2
        $started = Start-Frontend
        if ($started) {
            Start-Monitoring
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
