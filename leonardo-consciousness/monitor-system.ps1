# Leonardo Consciousness System Monitor
# PowerShell Script para monitoreo avanzado del sistema

param(
    [string]$ProcessName = "node",
    [int]$UpdateInterval = 5,
    [string]$LogFile = "logs/system-monitor.log"
)

# Crear directorio de logs si no existe
if (!(Test-Path -Path "logs")) {
    New-Item -ItemType Directory -Path "logs" -Force | Out-Null
}

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  LEONARDO CONSCIOUSNESS MONITOR" -ForegroundColor Yellow
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Función para escribir logs con timestamp
function Write-LogEntry {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry
    Add-Content -Path $LogFile -Value $logEntry
}

# Función para obtener información del proceso Node.js
function Get-NodeProcessInfo {
    $processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    if ($processes) {
        return $processes | Where-Object { $_.ProcessName -eq $ProcessName -and $_.MainWindowTitle -eq "" }
    }
    return $null
}

# Función para obtener métricas de CPU y memoria
function Get-SystemMetrics {
    param($Process)
    
    if ($Process) {
        $cpuPercent = [Math]::Round((Get-Counter "\Process($($Process.ProcessName))\% Processor Time" -ErrorAction SilentlyContinue).CounterSamples[0].CookedValue, 2)
        $memoryMB = [Math]::Round($Process.WorkingSet64 / 1MB, 2)
        $threads = $Process.Threads.Count
        $handles = $Process.HandleCount
        
        return @{
            CPU = $cpuPercent
            Memory = $memoryMB
            Threads = $threads
            Handles = $handles
            Uptime = (Get-Date) - $Process.StartTime
        }
    }
    return $null
}

# Función para obtener uso de puertos
function Get-NetworkConnections {
    try {
        $connections = Get-NetTCPConnection | Where-Object { $_.State -eq "Listen" -and ($_.LocalPort -eq 3003 -or $_.LocalPort -eq 8080 -or $_.LocalPort -eq 3000) }
        return $connections
    }
    catch {
        return @()
    }
}

# Función para obtener locks de archivos
function Get-FileLocks {
    try {
        $handles = Get-Handle -ProcessName $ProcessName -ErrorAction SilentlyContinue 2>$null
        if ($handles) {
            return $handles | Where-Object { $_.Type -eq "File" } | Measure-Object | Select-Object -ExpandProperty Count
        }
    }
    catch {
        return 0
    }
    return 0
}

# Función para mostrar métricas en tiempo real
function Show-RealTimeMetrics {
    Clear-Host
    Write-Host "=======================================" -ForegroundColor Cyan
    Write-Host "  LEONARDO CONSCIOUSNESS MONITOR" -ForegroundColor Yellow
    Write-Host "=======================================" -ForegroundColor Cyan
    Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
    Write-Host ""
    
    # Buscar procesos Node.js
    $nodeProcesses = Get-NodeProcessInfo
    
    if ($nodeProcesses) {
        foreach ($process in $nodeProcesses) {
            $metrics = Get-SystemMetrics -Process $process
            
            if ($metrics) {
                Write-Host "PROCESS METRICS - PID: $($process.Id)" -ForegroundColor Green
                Write-Host "├─ Process Name: $($process.ProcessName)" -ForegroundColor White
                Write-Host "├─ CPU Usage: $($metrics.CPU)%" -ForegroundColor $(if ($metrics.CPU -gt 80) { "Red" } elseif ($metrics.CPU -gt 50) { "Yellow" } else { "Green" })
                Write-Host "├─ Memory Usage: $($metrics.Memory) MB" -ForegroundColor $(if ($metrics.Memory -gt 500) { "Red" } elseif ($metrics.Memory -gt 200) { "Yellow" } else { "Green" })
                Write-Host "├─ Threads: $($metrics.Threads)" -ForegroundColor White
                Write-Host "├─ Handles: $($metrics.Handles)" -ForegroundColor White
                Write-Host "└─ Uptime: $($metrics.Uptime.Days)d $($metrics.Uptime.Hours)h $($metrics.Uptime.Minutes)m" -ForegroundColor Cyan
                Write-Host ""
                
                # Log métricas si hay picos
                if ($metrics.CPU -gt 70) {
                    Write-LogEntry "HIGH CPU USAGE: $($metrics.CPU)% - PID: $($process.Id)" "WARNING"
                }
                if ($metrics.Memory -gt 300) {
                    Write-LogEntry "HIGH MEMORY USAGE: $($metrics.Memory) MB - PID: $($process.Id)" "WARNING"
                }
            }
        }
    } else {
        Write-Host "NO NODE.JS PROCESSES FOUND" -ForegroundColor Red
        Write-LogEntry "No Node.js processes detected" "WARNING"
    }
    
    # Mostrar conexiones de red
    $connections = Get-NetworkConnections
    if ($connections) {
        Write-Host "NETWORK CONNECTIONS" -ForegroundColor Green
        foreach ($conn in $connections) {
            Write-Host "├─ Port $($conn.LocalPort): $($conn.State)" -ForegroundColor Cyan
        }
        Write-Host ""
    }
    
    # Mostrar información del sistema
    $systemInfo = Get-ComputerInfo
    $diskInfo = Get-WmiObject -Class Win32_LogicalDisk | Where-Object { $_.DriveType -eq 3 }
    
    Write-Host "SYSTEM METRICS" -ForegroundColor Green
    Write-Host "├─ Total RAM: $([Math]::Round($systemInfo.TotalPhysicalMemory / 1GB, 2)) GB" -ForegroundColor White
    Write-Host "├─ Available RAM: $([Math]::Round($systemInfo.AvailablePhysicalMemory / 1GB, 2)) GB" -ForegroundColor White
    Write-Host "├─ CPU Cores: $($systemInfo.CsProcessors.NumberOfCores)" -ForegroundColor White
    
    foreach ($disk in $diskInfo) {
        $freeSpaceGB = [Math]::Round($disk.FreeSpace / 1GB, 2)
        $totalSpaceGB = [Math]::Round($disk.Size / 1GB, 2)
        $usedPercent = [Math]::Round(((($disk.Size - $disk.FreeSpace) / $disk.Size) * 100), 2)
        Write-Host "├─ Disk $($disk.DeviceID) Free: $freeSpaceGB GB / $totalSpaceGB GB ($usedPercent% used)" -ForegroundColor $(if ($usedPercent -gt 90) { "Red" } elseif ($usedPercent -gt 80) { "Yellow" } else { "White" })
    }
    Write-Host ""
    
    # Contar archivos lock
    $lockCount = Get-FileLocks
    Write-Host "FILE HANDLES" -ForegroundColor Green
    Write-Host "└─ Open File Handles: $lockCount" -ForegroundColor $(if ($lockCount -gt 100) { "Yellow" } else { "White" })
    Write-Host ""
    
    Write-Host "Press Ctrl+C to stop monitoring..." -ForegroundColor Gray
}

# Función principal de monitoreo
function Start-Monitoring {
    Write-LogEntry "Leonardo Consciousness Monitor Started" "INFO"
    
    try {
        while ($true) {
            Show-RealTimeMetrics
            Start-Sleep -Seconds $UpdateInterval
        }
    }
    catch {
        Write-LogEntry "Monitoring interrupted: $($_.Exception.Message)" "INFO"
    }
    finally {
        Write-LogEntry "Leonardo Consciousness Monitor Stopped" "INFO"
    }
}

# Función para obtener métricas específicas de Leonardo
function Get-LeonardoMetrics {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3003/api/status" -Method GET -TimeoutSec 5
        return $response
    }
    catch {
        return $null
    }
}

# Función para mostrar métricas de Leonardo
function Show-LeonardoStatus {
    $leonardoMetrics = Get-LeonardoMetrics
    
    if ($leonardoMetrics) {
        Write-Host "LEONARDO SYSTEM STATUS" -ForegroundColor Green
        Write-Host "├─ System Running: $($leonardoMetrics.launcher.running)" -ForegroundColor Green
        Write-Host "├─ Core Status: $($leonardoMetrics.launcher.components.core)" -ForegroundColor Cyan
        Write-Host "├─ HTTP Status: $($leonardoMetrics.launcher.components.http)" -ForegroundColor Cyan
        Write-Host "├─ Trading Mode: $($leonardoMetrics.config.TRADING_MODE)" -ForegroundColor Yellow
        Write-Host "├─ Bait Amount: `$$($leonardoMetrics.config.BAIT_AMOUNT)" -ForegroundColor White
        Write-Host "├─ Total Requests: $($leonardoMetrics.metrics.requests)" -ForegroundColor White
        Write-Host "├─ Total Errors: $($leonardoMetrics.metrics.errors)" -ForegroundColor $(if ($leonardoMetrics.metrics.errors -gt 0) { "Red" } else { "Green" })
        Write-Host "└─ Uptime: $([Math]::Round($leonardoMetrics.metrics.uptime / 1000 / 60, 2)) minutes" -ForegroundColor Cyan
        Write-Host ""
        
        # Log errores críticos
        if ($leonardoMetrics.metrics.errors -gt 0) {
            Write-LogEntry "Leonardo System has $($leonardoMetrics.metrics.errors) errors" "WARNING"
        }
    } else {
        Write-Host "LEONARDO SYSTEM: NOT RESPONDING" -ForegroundColor Red
        Write-LogEntry "Leonardo API not responding on port 3003" "ERROR"
    }
}

# Función para mostrar logs ASCII en tiempo real
function Show-ASCIILogs {
    if (Test-Path -Path $LogFile) {
        $lastLines = Get-Content -Path $LogFile -Tail 10
        if ($lastLines) {
            Write-Host "RECENT LOG ENTRIES" -ForegroundColor Green
            foreach ($line in $lastLines) {
                $color = "White"
                if ($line -match "\[ERROR\]") { $color = "Red" }
                elseif ($line -match "\[WARNING\]") { $color = "Yellow" }
                elseif ($line -match "\[INFO\]") { $color = "Cyan" }
                
                Write-Host "  $line" -ForegroundColor $color
            }
            Write-Host ""
        }
    }
}

# Función mejorada para mostrar métricas en tiempo real
function Show-EnhancedRealTimeMetrics {
    Clear-Host
    Write-Host "=======================================" -ForegroundColor Cyan
    Write-Host "  LEONARDO CONSCIOUSNESS MONITOR" -ForegroundColor Yellow
    Write-Host "=======================================" -ForegroundColor Cyan
    Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
    Write-Host ""
    
    # Mostrar métricas del proceso
    Show-RealTimeMetrics
    
    # Mostrar estado específico de Leonardo
    Show-LeonardoStatus
    
    # Mostrar logs recientes
    Show-ASCIILogs
    
    Write-Host "Monitoring every $UpdateInterval seconds... Press Ctrl+C to stop" -ForegroundColor Gray
}

# Función principal mejorada
function Start-EnhancedMonitoring {
    Write-LogEntry "Enhanced Leonardo Consciousness Monitor Started" "INFO"
    Write-Host "Starting enhanced monitoring of Leonardo Consciousness System..." -ForegroundColor Green
    Write-Host "Log file: $LogFile" -ForegroundColor Cyan
    Write-Host ""
    
    try {
        while ($true) {
            Show-EnhancedRealTimeMetrics
            Start-Sleep -Seconds $UpdateInterval
        }
    }
    catch {
        Write-LogEntry "Enhanced monitoring interrupted: $($_.Exception.Message)" "INFO"
    }
    finally {
        Write-LogEntry "Enhanced Leonardo Consciousness Monitor Stopped" "INFO"
        Write-Host ""
        Write-Host "Monitoring stopped. Final log saved to: $LogFile" -ForegroundColor Yellow
    }
}

# Iniciar monitoreo mejorado
Start-EnhancedMonitoring
