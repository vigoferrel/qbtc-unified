# Sistema de Monitoreo Automatico - Generado dinamicamente
param([int]$Interval = 30)

$Environment = 'development'
$TradingMode = ''
$LogsPath = 'C:\Users\DELL\Desktop\QBTC-UNIFIED\logs'

function Write-MonitorLog {
    param([string]$Message, [string]$Level = 'INFO')
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $logEntry = "[$timestamp] [MONITOR] [$Level] $Message"
    Write-Host $logEntry -ForegroundColor Green
    Add-Content -Path (Join-Path $LogsPath "monitor-20250813.log") -Value $logEntry
}

function Get-SystemMetrics {
    $metrics = @{}
    
    # Obtener procesos QBTC
    $qbtcProcesses = Get-Process -Name 'node' -ErrorAction SilentlyContinue | Where-Object {
        try {
            $wmi = Get-WmiObject -Class Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction SilentlyContinue
            return $wmi -and ($wmi.CommandLine -like '*leonardo*' -or $wmi.CommandLine -like '*frontend*' -or $wmi.CommandLine -like '*unified*')
        } catch { return $false }
    }
    
    foreach ($process in $qbtcProcesses) {
        $uptime = (Get-Date) - $process.StartTime
        $memoryMB = [Math]::Round($process.WorkingSet64 / 1MB, 2)
        $cpuPercent = [Math]::Round($process.CPU, 2)
        
        $processName = 'unknown'
        try {
            $wmi = Get-WmiObject -Class Win32_Process -Filter "ProcessId = $($process.Id)" -ErrorAction SilentlyContinue
            if ($wmi.CommandLine -like '*leonardo*') { $processName = 'leonardo' }
            elseif ($wmi.CommandLine -like '*frontend*') { $processName = 'frontend' }
            elseif ($wmi.CommandLine -like '*unified*') { $processName = 'unified' }
        } catch {}
        
        $metrics[$processName] = @{
            PID = $process.Id
            Memory = $memoryMB
            CPU = $cpuPercent
            Uptime = $uptime
            Threads = $process.Threads.Count
            Handles = $process.HandleCount
        }
    }
    
    return $metrics
}

function Test-ServiceHealth {
    $services = @{
        leonardo = '3003'
        frontend = '8080'
        unified = '3200'
    }
    
    $health = @{}
    
    foreach ($service in $services.Keys) {
        $port = $services[$service]
        try {
            if ($service -eq 'leonardo' -or $service -eq 'unified') {
                $response = Invoke-RestMethod -Uri "http://localhost:$port/api/status" -Method GET -TimeoutSec 5
                $health[$service] = @{ Status = 'HEALTHY'; ResponseTime = $response.ResponseTime }
            } else {
                $testConnection = Test-NetConnection -ComputerName 'localhost' -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
                $health[$service] = @{ Status = if ($testConnection) { 'HEALTHY' } else { 'UNHEALTHY' } }
            }
        } catch {
            $health[$service] = @{ Status = 'UNHEALTHY'; Error = $_.Exception.Message }
        }
    }
    
    return $health
}

Write-MonitorLog "Sistema de monitoreo iniciado - Intervalo: $Interval segundos"
Write-MonitorLog "Entorno: $Environment | Trading Mode: $TradingMode"

while ($true) {
    try {
        $metrics = Get-SystemMetrics
        $health = Test-ServiceHealth
        
        # Generar reporte de metricas
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $report = @{
            Timestamp = $timestamp
            Environment = $Environment
            TradingMode = $TradingMode
            Metrics = $metrics
            Health = $health
        }
        
        # Guardar metricas en JSON
        $reportFile = Join-Path $LogsPath "metrics-$(Get-Date -Format 'yyyyMMdd-HH').json"
        $report | ConvertTo-Json -Depth 4 | Out-File -FilePath $reportFile -Encoding UTF8
        
        # Log resumido
        $activeServices = ($health.Keys | Where-Object { $health[$_].Status -eq 'HEALTHY' }).Count
        $totalMemory = ($metrics.Values | Measure-Object -Property Memory -Sum).Sum
        
        Write-MonitorLog "Servicios activos: $activeServices | Memoria total: $totalMemory MB"
        
        # Alertas automaticas
        foreach ($service in $health.Keys) {
            if ($health[$service].Status -ne 'HEALTHY') {
                Write-MonitorLog "ALERTA: Servicio $service no saludable - $($health[$service].Error)" "WARN"
            }
        }
        
    } catch {
        Write-MonitorLog "Error en ciclo de monitoreo: $($_.Exception.Message)" "ERROR"
    }
    
    Start-Sleep -Seconds $Interval
}
