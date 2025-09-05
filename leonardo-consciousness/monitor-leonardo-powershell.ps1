# ========================================================================
# 🌊 LEONARDO CONSCIOUSNESS MONITORING SCRIPT - POWERSHELL
# Script para ejecutar y monitorizar el sistema Leonardo en Windows
# Monitoreo de CPU, memoria, locks, latencia y logs
# ========================================================================

Write-Host "🌊 LEONARDO CONSCIOUSNESS MONITORING SCRIPT INICIADO" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Yellow

# Configuración
$LEONARDO_PATH = $PSScriptRoot
$LOG_FILE = "$LEONARDO_PATH\leonardo-monitor-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
$MONITOR_INTERVAL = 2  # segundos
$MAX_CPU_PERCENT = 80  # Umbral de alerta CPU
$MAX_MEMORY_MB = 1000  # Umbral de alerta memoria
$PROCESS_NAME = "node"
$NODE_SCRIPT = "UnifiedLeonardoServer.js"

Write-Host "📁 Directorio de trabajo: $LEONARDO_PATH" -ForegroundColor Green
Write-Host "📝 Log de monitoreo: $LOG_FILE" -ForegroundColor Green
Write-Host "⏱️  Intervalo de monitoreo: $MONITOR_INTERVAL segundos" -ForegroundColor Green

# Función para escribir logs
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Output $logEntry | Out-File -FilePath $LOG_FILE -Append -Encoding utf8
    
    switch($Level) {
        "ERROR" { Write-Host $logEntry -ForegroundColor Red }
        "WARN"  { Write-Host $logEntry -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $logEntry -ForegroundColor Green }
        default { Write-Host $logEntry -ForegroundColor White }
    }
}

# Función para obtener información del sistema
function Get-SystemInfo {
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

# Función para obtener procesos Node.js relacionados con Leonardo
function Get-LeonardoProcesses {
    $allNodeProcesses = Get-Process -Name $PROCESS_NAME -ErrorAction SilentlyContinue
    $leonardoProcesses = @()
    
    foreach ($proc in $allNodeProcesses) {
        try {
            # Intentar obtener información del proceso usando WMI
            $wmiProcess = Get-WmiObject -Class Win32_Process -Filter "ProcessId = $($proc.Id)" -ErrorAction SilentlyContinue
            if ($wmiProcess -and ($wmiProcess.CommandLine -like "*leonardo*" -or $wmiProcess.CommandLine -like "*UnifiedLeonardoServer*")) {
                $leonardoProcesses += $proc
            } elseif ($proc.ProcessName -eq "node" -and $proc.WorkingSet64 -gt 50MB) {
                # Si no podemos obtener CommandLine, usar heurística: procesos Node.js con más de 50MB de memoria
                $leonardoProcesses += $proc
            }
        } catch {
            # En caso de error, incluir el proceso si es un Node.js con memoria significativa
            if ($proc.ProcessName -eq "node" -and $proc.WorkingSet64 -gt 50MB) {
                $leonardoProcesses += $proc
            }
        }
    }
    
    return $leonardoProcesses
}

# Función para monitorizar un proceso específico
function Monitor-Process {
    param([System.Diagnostics.Process]$Process)
    
    try {
        $cpuBefore = $Process.TotalProcessorTime
        Start-Sleep -Milliseconds 1000
        $Process.Refresh()
        $cpuAfter = $Process.TotalProcessorTime
        $cpuUsed = ($cpuAfter - $cpuBefore).TotalMilliseconds
        $cpuPercent = [Math]::Round(($cpuUsed / 1000) * 100, 2)
        
        $workingSetMB = [Math]::Round($Process.WorkingSet64 / 1MB, 2)
        $privateMB = [Math]::Round($Process.PrivateMemorySize64 / 1MB, 2)
        $threadCount = $Process.Threads.Count
        $handleCount = $Process.HandleCount
        
        return @{
            PID = $Process.Id
            Name = $Process.ProcessName
            CPUPercent = $cpuPercent
            WorkingSetMB = $workingSetMB
            PrivateMemoryMB = $privateMB
            ThreadCount = $threadCount
            HandleCount = $handleCount
            StartTime = $Process.StartTime
        }
    }
    catch {
        Write-Log "Error monitoreando proceso $($Process.Id): $($_.Exception.Message)" "ERROR"
        return $null
    }
}

# Función para detectar locks y bloqueos
function Detect-Locks {
    $netstatOutput = netstat -an | Where-Object { $_ -match "LISTENING|ESTABLISHED" -and $_ -match ":3000|:8080|:9090" }
    $openFiles = Get-Process -Name $PROCESS_NAME -ErrorAction SilentlyContinue | ForEach-Object { $_.Handles }
    
    return @{
        NetworkConnections = $netstatOutput.Count
        OpenHandles = ($openFiles | Measure-Object -Sum).Sum
    }
}

# Función para verificar latencia de red local
function Test-LocalLatency {
    try {
        $ping = Test-NetConnection -ComputerName "localhost" -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue
        return $ping
    }
    catch {
        return $false
    }
}

# Función para mostrar métricas en tiempo real
function Show-RealTimeMetrics {
    param($SystemInfo, $ProcessMetrics, $LockInfo)
    
    Clear-Host
    Write-Host "🌊 LEONARDO CONSCIOUSNESS - MONITOR EN TIEMPO REAL" -ForegroundColor Cyan
    Write-Host "========================================================================" -ForegroundColor Yellow
    Write-Host "⏰ $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
    Write-Host ""
    
    # Sistema General
    Write-Host "🖥️  SISTEMA GENERAL:" -ForegroundColor Green
    Write-Host "   CPU: $($SystemInfo.CPUPercent)%" -ForegroundColor $(if($SystemInfo.CPUPercent -gt $MAX_CPU_PERCENT){"Red"}else{"White"})
    Write-Host "   Memoria: $($SystemInfo.UsedMemoryMB) MB / $($SystemInfo.TotalMemoryMB) MB ($($SystemInfo.MemoryPercent)%)" -ForegroundColor $(if($SystemInfo.UsedMemoryMB -gt $MAX_MEMORY_MB){"Red"}else{"White"})
    Write-Host "   Memoria libre: $($SystemInfo.FreeMemoryMB) MB" -ForegroundColor White
    Write-Host ""
    
    # Procesos Leonardo
    if ($ProcessMetrics.Count -gt 0) {
        Write-Host "🚀 PROCESOS LEONARDO:" -ForegroundColor Green
        foreach ($proc in $ProcessMetrics) {
            $status = if($proc.CPUPercent -gt 50 -or $proc.WorkingSetMB -gt 500){"⚠️ "}else{"✅ "}
            Write-Host "   $status PID: $($proc.PID) | CPU: $($proc.CPUPercent)% | RAM: $($proc.WorkingSetMB) MB | Threads: $($proc.ThreadCount) | Handles: $($proc.HandleCount)" -ForegroundColor White
            
            $runtime = (Get-Date) - $proc.StartTime
            Write-Host "      Tiempo ejecución: $($runtime.ToString('hh\:mm\:ss'))" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ No se encontraron procesos Leonardo activos" -ForegroundColor Red
    }
    Write-Host ""
    
    # Locks y Conexiones
    Write-Host "🔒 LOCKS Y CONEXIONES:" -ForegroundColor Green
    Write-Host "   Conexiones de red: $($LockInfo.NetworkConnections)" -ForegroundColor White
    Write-Host "   Handles abiertos: $($LockInfo.OpenHandles)" -ForegroundColor White
    
    $latencyOK = Test-LocalLatency
    Write-Host "   Latencia localhost:3000: $(if($latencyOK){"✅ OK"}else{"❌ FAIL"})" -ForegroundColor $(if($latencyOK){"Green"}else{"Red"})
    Write-Host ""
    
    # Alertas
    $alerts = @()
    if ($SystemInfo.CPUPercent -gt $MAX_CPU_PERCENT) { $alerts += "🔥 CPU ALTA: $($SystemInfo.CPUPercent)%" }
    if ($SystemInfo.UsedMemoryMB -gt $MAX_MEMORY_MB) { $alerts += "💾 MEMORIA ALTA: $($SystemInfo.UsedMemoryMB) MB" }
    if ($ProcessMetrics.Count -eq 0) { $alerts += "⚠️  NO HAY PROCESOS LEONARDO EJECUTÁNDOSE" }
    if (-not $latencyOK) { $alerts += "🌐 PROBLEMA DE CONECTIVIDAD LOCAL" }
    
    if ($alerts.Count -gt 0) {
        Write-Host "🚨 ALERTAS:" -ForegroundColor Red
        foreach ($alert in $alerts) {
            Write-Host "   $alert" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    Write-Host "📝 Log: $LOG_FILE" -ForegroundColor Gray
    Write-Host "Press Ctrl+C para salir" -ForegroundColor Gray
}

# Función principal de monitoreo
function Start-Monitoring {
    Write-Log "Iniciando monitoreo del sistema Leonardo" "SUCCESS"
    
    $iteration = 0
    while ($true) {
        try {
            $iteration++
            
            # Obtener métricas
            $systemInfo = Get-SystemInfo
            $leonardoProcesses = Get-LeonardoProcesses
            $processMetrics = @()
            
            foreach ($proc in $leonardoProcesses) {
                $metrics = Monitor-Process -Process $proc
                if ($metrics) {
                    $processMetrics += $metrics
                }
            }
            
            $lockInfo = Detect-Locks
            
            # Mostrar métricas en tiempo real
            Show-RealTimeMetrics -SystemInfo $systemInfo -ProcessMetrics $processMetrics -LockInfo $lockInfo
            
            # Log detallado cada 10 iteraciones
            if ($iteration % 10 -eq 0) {
                Write-Log "=== ITERACIÓN $iteration ===" "INFO"
                Write-Log "Sistema - CPU: $($systemInfo.CPUPercent)% | Memoria: $($systemInfo.UsedMemoryMB)MB/$($systemInfo.TotalMemoryMB)MB" "INFO"
                Write-Log "Leonardo - Procesos activos: $($processMetrics.Count) | Conexiones: $($lockInfo.NetworkConnections)" "INFO"
                
                foreach ($proc in $processMetrics) {
                    Write-Log "Proceso $($proc.PID): CPU=$($proc.CPUPercent)% RAM=$($proc.WorkingSetMB)MB Threads=$($proc.ThreadCount)" "INFO"
                }
            }
            
            # Detectar anomalías
            if ($systemInfo.CPUPercent -gt $MAX_CPU_PERCENT) {
                Write-Log "⚠️  ALERTA: CPU alta detectada: $($systemInfo.CPUPercent)%" "WARN"
            }
            
            if ($systemInfo.UsedMemoryMB -gt $MAX_MEMORY_MB) {
                Write-Log "⚠️  ALERTA: Uso de memoria alto: $($systemInfo.UsedMemoryMB) MB" "WARN"
            }
            
            if ($processMetrics.Count -eq 0) {
                Write-Log "❌ CRÍTICO: No hay procesos Leonardo ejecutándose" "ERROR"
            }
            
            # Verificar procesos zombies o con problemas
            foreach ($proc in $processMetrics) {
                if ($proc.CPUPercent -gt 90) {
                    Write-Log "🔥 ALERTA: Proceso $($proc.PID) con CPU crítica: $($proc.CPUPercent)%" "WARN"
                }
                if ($proc.WorkingSetMB -gt 500) {
                    Write-Log "💾 ALERTA: Proceso $($proc.PID) con memoria alta: $($proc.WorkingSetMB) MB" "WARN"
                }
                if ($proc.ThreadCount -gt 100) {
                    Write-Log "🧵 ALERTA: Proceso $($proc.PID) con muchos threads: $($proc.ThreadCount)" "WARN"
                }
            }
            
            Start-Sleep -Seconds $MONITOR_INTERVAL
            
        }
        catch {
            Write-Log "Error en ciclo de monitoreo: $($_.Exception.Message)" "ERROR"
            Start-Sleep -Seconds 5
        }
    }
}

# Función para iniciar Leonardo si no está ejecutándose
function Start-Leonardo {
    $leonardoProcesses = Get-LeonardoProcesses
    
    if ($leonardoProcesses.Count -eq 0) {
        Write-Log "No se encontraron procesos Leonardo. Iniciando servidor..." "INFO"
        
        # Verificar que el archivo existe
        $serverPath = Join-Path $LEONARDO_PATH $NODE_SCRIPT
        if (-not (Test-Path $serverPath)) {
            Write-Log "❌ ERROR: No se encuentra $NODE_SCRIPT en $LEONARDO_PATH" "ERROR"
            return $false
        }
        
        try {
            # Cambiar al directorio del proyecto
            Push-Location $LEONARDO_PATH
            
            # Iniciar el servidor Leonardo en segundo plano
            $process = Start-Process -FilePath "node" -ArgumentList $NODE_SCRIPT -PassThru -WindowStyle Hidden
            Write-Log "✅ Leonardo iniciado con PID: $($process.Id)" "SUCCESS"
            
            # Esperar un poco para que se inicialice
            Start-Sleep -Seconds 5
            
            Pop-Location
            return $true
        }
        catch {
            Write-Log "❌ ERROR iniciando Leonardo: $($_.Exception.Message)" "ERROR"
            Pop-Location
            return $false
        }
    } else {
        Write-Log "Leonardo ya está ejecutándose (PIDs: $($leonardoProcesses.Id -join ', '))" "INFO"
        return $true
    }
}

# Función para limpiar procesos zombies
function Clean-ZombieProcesses {
    Write-Log "Limpiando procesos zombie..." "INFO"
    
    $allNodeProcesses = Get-Process -Name $PROCESS_NAME -ErrorAction SilentlyContinue
    foreach ($proc in $allNodeProcesses) {
        try {
            # Verificar si el proceso está respondiendo
            $responding = $proc.Responding
            if (-not $responding) {
                Write-Log "⚠️  Proceso zombie detectado (PID: $($proc.Id)). Terminando..." "WARN"
                Stop-Process -Id $proc.Id -Force
                Write-Log "✅ Proceso zombie terminado" "SUCCESS"
            }
        }
        catch {
            Write-Log "Error verificando proceso $($proc.Id): $($_.Exception.Message)" "ERROR"
        }
    }
}

# Función para mostrar ayuda
function Show-Help {
    Write-Host ""
    Write-Host "🌊 LEONARDO CONSCIOUSNESS MONITORING - AYUDA" -ForegroundColor Cyan
    Write-Host "========================================================================" -ForegroundColor Yellow
    Write-Host "Parámetros disponibles:" -ForegroundColor Green
    Write-Host "  -Start          : Inicia Leonardo y después comienza el monitoreo" -ForegroundColor White
    Write-Host "  -Monitor        : Solo monitorea (sin iniciar Leonardo)" -ForegroundColor White
    Write-Host "  -Clean          : Limpia procesos zombie y sale" -ForegroundColor White
    Write-Host "  -Help           : Muestra esta ayuda" -ForegroundColor White
    Write-Host ""
    Write-Host "Ejemplos de uso:" -ForegroundColor Green
    Write-Host "  .\monitor-leonardo-powershell.ps1 -Start" -ForegroundColor White
    Write-Host "  .\monitor-leonardo-powershell.ps1 -Monitor" -ForegroundColor White
    Write-Host "  .\monitor-leonardo-powershell.ps1 -Clean" -ForegroundColor White
    Write-Host ""
}

# Función principal
function Main {
    param([string]$Action = "")
    
    Write-Log "Script de monitoreo Leonardo iniciado" "SUCCESS"
    Write-Log "Directorio de trabajo: $LEONARDO_PATH" "INFO"
    Write-Log "Archivo de script Node.js: $NODE_SCRIPT" "INFO"
    
    switch ($Action.ToLower()) {
        "start" {
            Write-Log "Modo: INICIAR Y MONITOREAR" "SUCCESS"
            $started = Start-Leonardo
            if ($started) {
                Start-Monitoring
            } else {
                Write-Log "❌ No se pudo iniciar Leonardo. Abortando." "ERROR"
                exit 1
            }
        }
        "monitor" {
            Write-Log "Modo: SOLO MONITOREAR" "SUCCESS"
            Start-Monitoring
        }
        "clean" {
            Write-Log "Modo: LIMPIAR PROCESOS" "SUCCESS"
            Clean-ZombieProcesses
            Write-Log "Limpieza completada. Saliendo." "SUCCESS"
        }
        "help" {
            Show-Help
        }
        default {
            Write-Host "⚠️  Parámetro no especificado. Iniciando modo automático..." -ForegroundColor Yellow
            Write-Host "   (Leonardo se iniciará automáticamente si no está corriendo)" -ForegroundColor Yellow
            Write-Host ""
            
            $started = Start-Leonardo
            if ($started -or (Get-LeonardoProcesses).Count -gt 0) {
                Start-Monitoring
            } else {
                Write-Log "❌ No se encontraron procesos Leonardo y no se pudo iniciar. Use -Help para ver opciones." "ERROR"
                Show-Help
                exit 1
            }
        }
    }
}

# Manejo de Ctrl+C
$null = Register-EngineEvent PowerShell.Exiting -Action {
    Write-Log "Monitoreo terminado por el usuario" "INFO"
}

# Ejecutar función principal
if ($args.Count -gt 0) {
    Main -Action $args[0]
} else {
    Main
}
