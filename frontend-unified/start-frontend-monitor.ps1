# ========================================================================
# MONITOR DE FRONTEND QBTC-UNIFIED - PUERTO 8080
# Script optimizado para reportar status en segundo plano
# ========================================================================

param([string]$Action = "Monitor", [int]$IntervalSeconds = 10)

$Host.UI.RawUI.OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "🌊 QBTC Frontend Monitor - Puerto 8080" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Yellow

# Configuracion
$FRONTEND_PATH = $PSScriptRoot
$FRONTEND_PORT = 8080
$BACKEND_PORT = 3003
$MONITOR_LOG = "$FRONTEND_PATH\frontend-monitor-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
$STATUS_FILE = "$FRONTEND_PATH\frontend-status-live.json"

function Write-MonitorLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "HH:mm:ss.fff"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    Write-Output $logEntry | Out-File -FilePath $MONITOR_LOG -Append -Encoding utf8
    
    switch($Level) {
        "ERROR" { Write-Host $logEntry -ForegroundColor Red }
        "WARN"  { Write-Host $logEntry -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $logEntry -ForegroundColor Green }
        "METRICS" { Write-Host $logEntry -ForegroundColor Magenta }
        "INFO" { Write-Host $logEntry -ForegroundColor White }
    }
}

function Get-FrontendStatus {
    $status = @{
        Timestamp = Get-Date
        Port = $FRONTEND_PORT
        ProcessInfo = @()
        Connectivity = @{
            Frontend = $false
            Backend = $false
        }
        SystemMetrics = @{
            CPU = 0
            Memory = 0
            Uptime = "0:00:00"
        }
        URLs = @{
            Frontend = "http://localhost:$FRONTEND_PORT"
            Backend = "http://localhost:$BACKEND_PORT"
        }
    }
    
    # Verificar procesos de Node.js relacionados
    try {
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        foreach ($proc in $nodeProcesses) {
            try {
                $wmiProcess = Get-WmiObject -Class Win32_Process -Filter "ProcessId = $($proc.Id)" -ErrorAction SilentlyContinue
                if ($wmiProcess -and ($wmiProcess.CommandLine -like "*frontend*" -or $wmiProcess.CommandLine -like "*8080*")) {
                    $proc.Refresh()
                    $workingSetMB = [Math]::Round($proc.WorkingSet64 / 1MB, 2)
                    $runtime = (Get-Date) - $proc.StartTime
                    
                    $processInfo = @{
                        PID = $proc.Id
                        Name = $proc.ProcessName
                        WorkingSetMB = $workingSetMB
                        Runtime = $runtime.ToString('hh\:mm\:ss')
                        ThreadCount = $proc.Threads.Count
                        CommandLine = $wmiProcess.CommandLine
                    }
                    
                    $status.ProcessInfo += $processInfo
                    
                    # Actualizar metricas del sistema
                    $status.SystemMetrics.Memory += $workingSetMB
                    if ($status.SystemMetrics.Uptime -eq "0:00:00") {
                        $status.SystemMetrics.Uptime = $runtime.ToString('hh\:mm\:ss')
                    }
                }
            }
            catch {
                Write-MonitorLog "Error procesando PID $($proc.Id): $($_.Exception.Message)" "WARN"
            }
        }
    }
    catch {
        Write-MonitorLog "Error obteniendo procesos Node.js: $($_.Exception.Message)" "WARN"
    }
    
    # Test conectividad frontend
    try {
        $frontendResponse = Invoke-WebRequest -Uri $status.URLs.Frontend -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
        $status.Connectivity.Frontend = ($frontendResponse.StatusCode -eq 200)
    }
    catch {
        $status.Connectivity.Frontend = $false
    }
    
    # Test conectividad backend
    try {
        $backendResponse = Invoke-WebRequest -Uri "$($status.URLs.Backend)/health" -TimeoutSec 3 -UseBasicParsing -ErrorAction SilentlyContinue
        $status.Connectivity.Backend = ($backendResponse.StatusCode -eq 200)
    }
    catch {
        $status.Connectivity.Backend = $false
    }
    
    # CPU del sistema
    try {
        $cpu = Get-WmiObject -Class Win32_Processor | Measure-Object -Property LoadPercentage -Average
        $status.SystemMetrics.CPU = [Math]::Round($cpu.Average, 2)
    }
    catch {
        $status.SystemMetrics.CPU = 0
    }
    
    return $status
}

function Show-StatusDashboard {
    param([hashtable]$Status)
    
    Clear-Host
    Write-Host "🌊 QBTC FRONTEND STATUS DASHBOARD" -ForegroundColor Cyan
    Write-Host "=================================" -ForegroundColor Yellow
    Write-Host "Timestamp: $($Status.Timestamp.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor White
    Write-Host ""
    
    # Status de conectividad
    $frontendStatus = if($Status.Connectivity.Frontend) { "[OK] ONLINE" } else { "[FAIL] OFFLINE" }
    $backendStatus = if($Status.Connectivity.Backend) { "[OK] ONLINE" } else { "[FAIL] OFFLINE" }
    
    Write-Host "CONECTIVIDAD:" -ForegroundColor Green
    Write-Host "   Frontend (8080): $frontendStatus" -ForegroundColor $(if($Status.Connectivity.Frontend){"Green"}else{"Red"})
    Write-Host "   Backend (3003):  $backendStatus" -ForegroundColor $(if($Status.Connectivity.Backend){"Green"}else{"Red"})
    Write-Host ""
    
    # Procesos
    if ($Status.ProcessInfo.Count -gt 0) {
        Write-Host "PROCESOS FRONTEND:" -ForegroundColor Green
        foreach ($proc in $Status.ProcessInfo) {
            Write-Host "   PID: $($proc.PID) | RAM: $($proc.WorkingSetMB) MB | Runtime: $($proc.Runtime) | Threads: $($proc.ThreadCount)" -ForegroundColor White
        }
    } else {
        Write-Host "PROCESOS FRONTEND: NO DETECTADOS" -ForegroundColor Red
    }
    Write-Host ""
    
    # Sistema
    Write-Host "SISTEMA:" -ForegroundColor Green
    Write-Host "   CPU: $($Status.SystemMetrics.CPU)%" -ForegroundColor White
    Write-Host "   Memoria Frontend: $($Status.SystemMetrics.Memory) MB" -ForegroundColor White
    Write-Host "   Uptime: $($Status.SystemMetrics.Uptime)" -ForegroundColor White
    Write-Host ""
    
    # URLs
    Write-Host "URLS PRINCIPALES:" -ForegroundColor Green
    Write-Host "   🌐 Frontend: $($Status.URLs.Frontend)" -ForegroundColor Cyan
    Write-Host "   ⚡ Backend:  $($Status.URLs.Backend)" -ForegroundColor Cyan
    Write-Host ""
    
    # Alertas
    $alerts = @()
    if (-not $Status.Connectivity.Frontend) { $alerts += "Frontend no responde en puerto 8080" }
    if (-not $Status.Connectivity.Backend) { $alerts += "Backend no disponible (normal si Leonardo no está activo)" }
    if ($Status.ProcessInfo.Count -eq 0) { $alerts += "No se detectaron procesos de frontend" }
    if ($Status.SystemMetrics.CPU -gt 80) { $alerts += "CPU alta: $($Status.SystemMetrics.CPU)%" }
    
    if ($alerts.Count -gt 0) {
        Write-Host "⚠️  ALERTAS:" -ForegroundColor Yellow
        foreach ($alert in $alerts) {
            $alertColor = if($alert -match "Backend") { "Yellow" } else { "Red" }
            Write-Host "   • $alert" -ForegroundColor $alertColor
        }
        Write-Host ""
    }
    
    Write-Host "📁 Log: $MONITOR_LOG" -ForegroundColor Gray
    Write-Host "📊 Status: $STATUS_FILE" -ForegroundColor Gray
    Write-Host "🔄 Presione Ctrl+C para salir" -ForegroundColor Gray
}

function Save-StatusToFile {
    param([hashtable]$Status)
    
    try {
        $Status | ConvertTo-Json -Depth 10 | Out-File $STATUS_FILE -Encoding utf8
    }
    catch {
        Write-MonitorLog "Error guardando status: $($_.Exception.Message)" "ERROR"
    }
}

function Start-StatusMonitoring {
    Write-MonitorLog "Iniciando monitoreo de frontend en puerto $FRONTEND_PORT" "SUCCESS"
    Write-MonitorLog "Intervalo de reporte: $IntervalSeconds segundos" "INFO"
    Write-MonitorLog "Log: $MONITOR_LOG" "INFO"
    Write-MonitorLog "Status file: $STATUS_FILE" "INFO"
    
    $iteration = 0
    while ($true) {
        try {
            $iteration++
            
            # Obtener status actual
            $currentStatus = Get-FrontendStatus
            
            # Mostrar dashboard
            Show-StatusDashboard -Status $currentStatus
            
            # Guardar a archivo
            Save-StatusToFile -Status $currentStatus
            
            # Log cada 5 iteraciones
            if ($iteration % 5 -eq 0) {
                Write-MonitorLog "=== REPORTE #$iteration ===" "METRICS"
                Write-MonitorLog "Frontend: $(if($currentStatus.Connectivity.Frontend){'ONLINE'}else{'OFFLINE'})" "METRICS"
                Write-MonitorLog "Backend: $(if($currentStatus.Connectivity.Backend){'ONLINE'}else{'OFFLINE'})" "METRICS"
                Write-MonitorLog "Procesos: $($currentStatus.ProcessInfo.Count)" "METRICS"
                Write-MonitorLog "CPU Sistema: $($currentStatus.SystemMetrics.CPU)%" "METRICS"
                Write-MonitorLog "RAM Frontend: $($currentStatus.SystemMetrics.Memory) MB" "METRICS"
            }
            
            Start-Sleep -Seconds $IntervalSeconds
            
        }
        catch {
            Write-MonitorLog "Error en ciclo de monitoreo: $($_.Exception.Message)" "ERROR"
            Start-Sleep -Seconds 5
        }
    }
}

function Show-Help {
    Write-Host ""
    Write-Host "🌊 QBTC FRONTEND MONITOR - AYUDA" -ForegroundColor Cyan
    Write-Host "===============================" -ForegroundColor Yellow
    Write-Host "Parametros disponibles:" -ForegroundColor Green
    Write-Host "  Monitor         : Iniciar monitoreo continuo (default)" -ForegroundColor White
    Write-Host "  Status          : Mostrar status actual y salir" -ForegroundColor White
    Write-Host "  Help            : Mostrar esta ayuda" -ForegroundColor White
    Write-Host ""
    Write-Host "Parametros adicionales:" -ForegroundColor Green
    Write-Host "  -IntervalSeconds : Intervalo entre reportes (default: 10s)" -ForegroundColor White
    Write-Host ""
    Write-Host "Ejemplos de uso:" -ForegroundColor Green
    Write-Host "  .\start-frontend-monitor.ps1" -ForegroundColor White
    Write-Host "  .\start-frontend-monitor.ps1 Status" -ForegroundColor White
    Write-Host "  .\start-frontend-monitor.ps1 Monitor -IntervalSeconds 5" -ForegroundColor White
    Write-Host ""
}

# ===== FUNCIÓN PRINCIPAL =====
Write-MonitorLog "QBTC Frontend Monitor iniciado" "SUCCESS"
Write-MonitorLog "Accion: $Action" "INFO"
Write-MonitorLog "Puerto objetivo: $FRONTEND_PORT" "INFO"

switch ($Action.ToLower()) {
    "monitor" {
        Write-MonitorLog "Modo: MONITOREO CONTINUO" "SUCCESS"
        Start-StatusMonitoring
    }
    "status" {
        Write-MonitorLog "Modo: STATUS PUNTUAL" "SUCCESS"
        $currentStatus = Get-FrontendStatus
        Show-StatusDashboard -Status $currentStatus
        Save-StatusToFile -Status $currentStatus
        Write-Host ""
        pause
    }
    "help" {
        Show-Help
    }
    default {
        Write-Host "Parametro no valido. Use Help para ver opciones." -ForegroundColor Yellow
        Show-Help
    }
}

Write-MonitorLog "Monitor finalizado" "INFO"
