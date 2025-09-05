# ========================================================================
# SYSTEM CONTROL - GESTION DE PROCESOS EN SEGUNDO PLANO
# Script PowerShell para controlar el sistema QBTC desplegado
# ========================================================================

param(
    [ValidateSet("start", "stop", "restart", "status", "logs", "metrics", "health")]
    [string]$Action = "status",
    
    [ValidateSet("development", "production", "staging")]
    [string]$Environment = "development",
    
    [ValidateSet("", "futuros", "both")]
    [string]$TradingMode = "",
    
    [ValidateSet("leonardo", "frontend", "unified", "monitor", "all")]
    [string]$Service = "all",
    
    [switch]$Follow = $false,
    [int]$Lines = 50
)

# Configurar encoding para Windows PowerShell
try {
    $Host.UI.RawUI.OutputEncoding = [System.Text.Encoding]::UTF8
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
} catch {
    Write-Warning "No se pudo configurar encoding UTF8"
}

# Variables globales
$BASE_PATH = $PSScriptRoot
$LOGS_PATH = Join-Path $BASE_PATH "logs"
$PIDS_PATH = Join-Path $BASE_PATH "pids"

# Configuracion de puertos por entorno
$ENVIRONMENT_PORTS = @{
    development = @{
        leonardo = 3003; frontend = 8080; unified = 3200; monitoring = 3301
    }
    staging = @{
        leonardo = 3004; frontend = 8081; unified = 3201; monitoring = 3302
    }
    production = @{
        leonardo = 3005; frontend = 8082; unified = 3202; monitoring = 3303
    }
}

function Write-ControlLog {
    param([string]$Message, [string]$Level = "INFO")
    
    $colors = @{
        DEBUG = "Gray"; INFO = "White"; WARN = "Yellow"; ERROR = "Red"; SUCCESS = "Green"
    }
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $colors[$Level]
}

function Get-ServicePID {
    param([string]$ServiceName)
    
    $pidFile = Join-Path $PIDS_PATH "$ServiceName.pid"
    if (Test-Path $pidFile) {
        $pid = Get-Content $pidFile -ErrorAction SilentlyContinue
        if ($pid -and (Get-Process -Id $pid -ErrorAction SilentlyContinue)) {
            return [int]$pid
        }
    }
    return $null
}

function Get-ServiceStatus {
    param([string]$ServiceName)
    
    $statusFile = Join-Path $PIDS_PATH "$ServiceName-status.json"
    if (Test-Path $statusFile) {
        try {
            return Get-Content $statusFile | ConvertFrom-Json
        } catch {
            Write-ControlLog "Error leyendo status de $ServiceName" "ERROR"
        }
    }
    return $null
}

function Test-ServiceHealth {
    param([string]$ServiceName, [int]$Port)
    
    try {
        if ($ServiceName -eq "leonardo" -or $ServiceName -eq "unified") {
            $response = Invoke-RestMethod -Uri "http://localhost:$Port/api/status" -Method GET -TimeoutSec 5
            return @{ Status = "HEALTHY"; ResponseTime = [Math]::Round((Measure-Command { 
                Invoke-RestMethod -Uri "http://localhost:$Port/api/status" -Method GET -TimeoutSec 5 
            }).TotalMilliseconds, 2) }
        } else {
            $testConnection = Test-NetConnection -ComputerName "localhost" -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
            return @{ Status = if ($testConnection) { "HEALTHY" } else { "UNHEALTHY" } }
        }
    } catch {
        return @{ Status = "UNHEALTHY"; Error = $_.Exception.Message }
    }
}

function Start-SingleService {
    param([string]$ServiceName)
    
    Write-ControlLog "Iniciando servicio $ServiceName..." "INFO"
    
    # Verificar si ya esta corriendo
    $pid = Get-ServicePID -ServiceName $ServiceName
    if ($pid) {
        Write-ControlLog "Servicio $ServiceName ya esta ejecutandose (PID: $pid)" "WARN"
        return $true
    }
    
    # Usar deploy-master.ps1 para iniciar servicio especifico
    $deployArgs = @(
        "-Environment", $Environment,
        "-TradingMode", $TradingMode,
        "-BackgroundMode:$true",
        "-EnableMonitoring:$true"
    )
    
    try {
        $deployScript = Join-Path $BASE_PATH "deploy-master.ps1"
        & $deployScript @deployArgs
        
        Start-Sleep -Seconds 3
        
        $newPid = Get-ServicePID -ServiceName $ServiceName
        if ($newPid) {
            Write-ControlLog "Servicio $ServiceName iniciado exitosamente (PID: $newPid)" "SUCCESS"
            return $true
        } else {
            Write-ControlLog "Error iniciando servicio $ServiceName" "ERROR"
            return $false
        }
    } catch {
        Write-ControlLog "Error ejecutando deploy: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Stop-SingleService {
    param([string]$ServiceName, [bool]$Force = $false)
    
    Write-ControlLog "Deteniendo servicio $ServiceName..." "INFO"
    
    $pid = Get-ServicePID -ServiceName $ServiceName
    if (!$pid) {
        Write-ControlLog "Servicio $ServiceName no esta ejecutandose" "WARN"
        return $true
    }
    
    try {
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            if ($Force) {
                $process.Kill()
                Write-ControlLog "Proceso $ServiceName terminado forzosamente (PID: $pid)" "SUCCESS"
            } else {
                $process.CloseMainWindow()
                Start-Sleep -Seconds 2
                if (!$process.HasExited) {
                    $process.Kill()
                }
                Write-ControlLog "Proceso $ServiceName terminado graciosamente (PID: $pid)" "SUCCESS"
            }
            
            # Limpiar archivos PID
            $pidFile = Join-Path $PIDS_PATH "$ServiceName.pid"
            Remove-Item $pidFile -ErrorAction SilentlyContinue
            
            return $true
        }
    } catch {
        Write-ControlLog "Error deteniendo $ServiceName : $($_.Exception.Message)" "ERROR"
        return $false
    }
    
    return $false
}

function Show-SystemStatus {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "              ESTADO DEL SISTEMA QBTC UNIFIED" -ForegroundColor Yellow
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Entorno: $Environment | Trading Mode: $TradingMode" -ForegroundColor White
    Write-Host ""
    
    $ports = $ENVIRONMENT_PORTS[$Environment]
    $services = @("leonardo", "frontend", "unified", "monitor")
    
    foreach ($service in $services) {
        $pid = Get-ServicePID -ServiceName $service
        $status = Get-ServiceStatus -ServiceName $service
        $port = $ports[$service]
        
        Write-Host "Servicio: $service" -ForegroundColor White -NoNewline
        Write-Host " (Puerto: $port)" -ForegroundColor Gray
        
        if ($pid) {
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($process) {
                $uptime = (Get-Date) - $process.StartTime
                $memoryMB = [Math]::Round($process.WorkingSet64 / 1MB, 2)
                
                Write-Host "├─ Estado: " -NoNewline
                Write-Host "ACTIVO" -ForegroundColor Green
                Write-Host "├─ PID: $pid" -ForegroundColor White
                Write-Host "├─ Uptime: $($uptime.Hours)h $($uptime.Minutes)m $($uptime.Seconds)s" -ForegroundColor Cyan
                Write-Host "├─ Memoria: $memoryMB MB" -ForegroundColor White
                Write-Host "├─ Threads: $($process.Threads.Count)" -ForegroundColor White
                
                # Health check
                if ($service -ne "monitor") {
                    $health = Test-ServiceHealth -ServiceName $service -Port $port
                    $healthColor = if ($health.Status -eq "HEALTHY") { "Green" } else { "Red" }
                    Write-Host "├─ Health: " -NoNewline
                    Write-Host $health.Status -ForegroundColor $healthColor
                    
                    if ($health.ResponseTime) {
                        Write-Host "└─ Response Time: $($health.ResponseTime) ms" -ForegroundColor Cyan
                    } elseif ($health.Error) {
                        Write-Host "└─ Error: $($health.Error)" -ForegroundColor Red
                    }
                } else {
                    Write-Host "└─ Tipo: Monitor en segundo plano" -ForegroundColor Gray
                }
            } else {
                Write-Host "├─ Estado: " -NoNewline
                Write-Host "PID INACTIVO" -ForegroundColor Red
                Write-Host "└─ El proceso PID $pid no esta en ejecucion" -ForegroundColor Red
            }
        } else {
            Write-Host "├─ Estado: " -NoNewline
            Write-Host "DETENIDO" -ForegroundColor Red
            Write-Host "└─ No se encontro archivo PID" -ForegroundColor Red
        }
        
        Write-Host ""
    }
    
    # Mostrar URLs de acceso
    Write-Host "URLs de Acceso:" -ForegroundColor Yellow
    foreach ($service in $ports.Keys) {
        if ($service -ne "monitoring") {
            $port = $ports[$service]
            Write-Host "  - $service : http://localhost:$port" -ForegroundColor Cyan
        }
    }
    
    Write-Host ""
}

function Show-ServiceLogs {
    param([string]$ServiceName, [bool]$Follow, [int]$Lines)
    
    if ($ServiceName -eq "all") {
        $logFiles = Get-ChildItem -Path $LOGS_PATH -Filter "*-output.log" | Sort-Object LastWriteTime -Descending
        Write-ControlLog "Logs disponibles:" "INFO"
        foreach ($logFile in $logFiles) {
            Write-Host "  - $($logFile.Name)" -ForegroundColor Cyan
        }
        return
    }
    
    $logFile = Join-Path $LOGS_PATH "$ServiceName-output.log"
    $errorFile = Join-Path $LOGS_PATH "$ServiceName-error.log"
    
    if (Test-Path $logFile) {
        Write-ControlLog "Mostrando logs de $ServiceName (ultimas $Lines lineas):" "INFO"
        Write-Host "================================================================" -ForegroundColor Gray
        
        if ($Follow) {
            Get-Content $logFile -Tail $Lines -Wait
        } else {
            Get-Content $logFile -Tail $Lines
        }
    } else {
        Write-ControlLog "Archivo de log no encontrado: $logFile" "ERROR"
    }
    
    # Mostrar errores si existen
    if (Test-Path $errorFile) {
        $errorContent = Get-Content $errorFile -Tail 10
        if ($errorContent) {
            Write-Host ""
            Write-Host "Errores recientes:" -ForegroundColor Red
            Write-Host "================================================================" -ForegroundColor Red
            $errorContent | ForEach-Object { Write-Host $_ -ForegroundColor Red }
        }
    }
}

function Show-SystemMetrics {
    $metricsPattern = Join-Path $LOGS_PATH "metrics-*.json"
    $latestMetrics = Get-ChildItem -Path $metricsPattern | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    
    if ($latestMetrics) {
        try {
            $metrics = Get-Content $latestMetrics.FullName | ConvertFrom-Json
            
            Write-Host ""
            Write-Host "================================================================" -ForegroundColor Cyan
            Write-Host "                 METRICAS DEL SISTEMA" -ForegroundColor Yellow
            Write-Host "================================================================" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Timestamp: $($metrics.Timestamp)" -ForegroundColor White
            Write-Host "Entorno: $($metrics.Environment) | Trading Mode: $($metrics.TradingMode)" -ForegroundColor White
            Write-Host ""
            
            # Metricas de procesos
            Write-Host "Metricas de Procesos:" -ForegroundColor Yellow
            foreach ($process in $metrics.Metrics.PSObject.Properties) {
                $processName = $process.Name
                $processData = $process.Value
                
                Write-Host "  $processName :" -ForegroundColor White
                Write-Host "    - PID: $($processData.PID)" -ForegroundColor Gray
                Write-Host "    - Memoria: $($processData.Memory) MB" -ForegroundColor Gray
                Write-Host "    - CPU: $($processData.CPU)%" -ForegroundColor Gray
                Write-Host "    - Threads: $($processData.Threads)" -ForegroundColor Gray
                Write-Host "    - Handles: $($processData.Handles)" -ForegroundColor Gray
            }
            
            Write-Host ""
            
            # Health status
            Write-Host "Estado de Salud:" -ForegroundColor Yellow
            foreach ($service in $metrics.Health.PSObject.Properties) {
                $serviceName = $service.Name
                $serviceHealth = $service.Value
                $healthColor = if ($serviceHealth.Status -eq "HEALTHY") { "Green" } else { "Red" }
                
                Write-Host "  $serviceName : " -NoNewline
                Write-Host $serviceHealth.Status -ForegroundColor $healthColor
                
                if ($serviceHealth.ResponseTime) {
                    Write-Host "    - Response Time: $($serviceHealth.ResponseTime) ms" -ForegroundColor Cyan
                }
                if ($serviceHealth.Error) {
                    Write-Host "    - Error: $($serviceHealth.Error)" -ForegroundColor Red
                }
            }
            
            Write-Host ""
        } catch {
            Write-ControlLog "Error leyendo metricas: $($_.Exception.Message)" "ERROR"
        }
    } else {
        Write-ControlLog "No se encontraron archivos de metricas" "WARN"
        Write-ControlLog "Ubicacion esperada: $metricsPattern" "INFO"
    }
}

function Restart-SingleService {
    param([string]$ServiceName)
    
    Write-ControlLog "Reiniciando servicio $ServiceName..." "INFO"
    
    $stopResult = Stop-SingleService -ServiceName $ServiceName
    if ($stopResult) {
        Start-Sleep -Seconds 2
        $startResult = Start-SingleService -ServiceName $ServiceName
        return $startResult
    }
    
    return $false
}

# ========================================================================
# LOGICA PRINCIPAL DE CONTROL
# ========================================================================

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "              QBTC UNIFIED - SYSTEM CONTROL" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

switch ($Action) {
    "start" {
        if ($Service -eq "all") {
            Write-ControlLog "Iniciando sistema completo..." "INFO"
            $deployArgs = @(
                "-Environment", $Environment,
                "-TradingMode", $TradingMode,
                "-BackgroundMode:$true",
                "-EnableMonitoring:$true"
            )
            
            $deployScript = Join-Path $BASE_PATH "deploy-master.ps1"
            & $deployScript @deployArgs
        } else {
            Start-SingleService -ServiceName $Service
        }
    }
    
    "stop" {
        if ($Service -eq "all") {
            Write-ControlLog "Deteniendo sistema completo..." "INFO"
            $services = @("monitor", "unified", "frontend", "leonardo")
            foreach ($svc in $services) {
                Stop-SingleService -ServiceName $svc
            }
        } else {
            Stop-SingleService -ServiceName $Service
        }
    }
    
    "restart" {
        if ($Service -eq "all") {
            Write-ControlLog "Reiniciando sistema completo..." "INFO"
            # Detener todos
            $services = @("monitor", "unified", "frontend", "leonardo")
            foreach ($svc in $services) {
                Stop-SingleService -ServiceName $svc
            }
            Start-Sleep -Seconds 3
            
            # Reiniciar con deploy-master
            $deployArgs = @(
                "-Environment", $Environment,
                "-TradingMode", $TradingMode,
                "-BackgroundMode:$true",
                "-EnableMonitoring:$true"
            )
            
            $deployScript = Join-Path $BASE_PATH "deploy-master.ps1"
            & $deployScript @deployArgs
        } else {
            Restart-SingleService -ServiceName $Service
        }
    }
    
    "status" {
        Show-SystemStatus
    }
    
    "logs" {
        Show-ServiceLogs -ServiceName $Service -Follow $Follow -Lines $Lines
    }
    
    "metrics" {
        Show-SystemMetrics
    }
    
    "health" {
        Write-ControlLog "Verificando salud del sistema..." "INFO"
        $ports = $ENVIRONMENT_PORTS[$Environment]
        
        foreach ($serviceName in @("leonardo", "frontend", "unified")) {
            $port = $ports[$serviceName]
            $health = Test-ServiceHealth -ServiceName $serviceName -Port $port
            
            $healthColor = if ($health.Status -eq "HEALTHY") { "Green" } else { "Red" }
            Write-Host "$serviceName (puerto $port): " -NoNewline
            Write-Host $health.Status -ForegroundColor $healthColor
            
            if ($health.ResponseTime) {
                Write-Host "  Response Time: $($health.ResponseTime) ms" -ForegroundColor Cyan
            }
            if ($health.Error) {
                Write-Host "  Error: $($health.Error)" -ForegroundColor Red
            }
        }
    }
    
    default {
        Write-ControlLog "Accion no reconocida: $Action" "ERROR"
        Write-Host "Acciones disponibles: start, stop, restart, status, logs, metrics, health" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-ControlLog "Comando completado" "SUCCESS"
