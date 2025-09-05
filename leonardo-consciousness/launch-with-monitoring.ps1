# Leonardo Consciousness System Launcher con Monitoreo Completo
# Script PowerShell para lanzar el sistema con monitoreo en segundo plano

param(
    [string]$Mode = "development",
    [string]$TradingMode = "simulation",
    [switch]$EnableMonitoring = $true,
    [switch]$AutoStartTrading = $false,
    [int]$MonitoringInterval = 3
)

# Configurar colores y ASCII art
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                 LEONARDO CONSCIOUSNESS SYSTEM                  ║" -ForegroundColor Yellow
Write-Host "║                     🎨 Master Launcher 🎨                      ║" -ForegroundColor Yellow  
Write-Host "║                                                                ║" -ForegroundColor Cyan
Write-Host "║        'La simplicidad es la maxima sofisticacion'            ║" -ForegroundColor White
Write-Host "║                      - Leonardo da Vinci                      ║" -ForegroundColor Gray
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Función para escribir logs con timestamp
function Write-SystemLog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$Color = "White"
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry -ForegroundColor $Color
    
    # Escribir al archivo de log del sistema
    $logFile = "logs/launcher-$(Get-Date -Format 'yyyyMMdd').log"
    if (!(Test-Path -Path "logs")) {
        New-Item -ItemType Directory -Path "logs" -Force | Out-Null
    }
    Add-Content -Path $logFile -Value $logEntry
}

# Función para verificar dependencias
function Test-SystemDependencies {
    Write-SystemLog "Verificando dependencias del sistema..." "INFO" "Cyan"
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-SystemLog "Node.js encontrado: $nodeVersion" "INFO" "Green"
        } else {
            Write-SystemLog "Node.js no encontrado. Por favor instalar Node.js" "ERROR" "Red"
            return $false
        }
    } catch {
        Write-SystemLog "Error verificando Node.js: $($_.Exception.Message)" "ERROR" "Red"
        return $false
    }
    
    # Verificar npm
    try {
        $npmVersion = npm --version 2>$null
        if ($npmVersion) {
            Write-SystemLog "npm encontrado: $npmVersion" "INFO" "Green"
        }
    } catch {
        Write-SystemLog "npm no encontrado" "WARNING" "Yellow"
    }
    
    # Verificar archivos principales
    $requiredFiles = @("MasterLauncher.js", "UnifiedLeonardoCore.js", "package.json")
    foreach ($file in $requiredFiles) {
        if (Test-Path -Path $file) {
            Write-SystemLog "Archivo encontrado: $file" "INFO" "Green"
        } else {
            Write-SystemLog "Archivo requerido no encontrado: $file" "ERROR" "Red"
            return $false
        }
    }
    
    Write-SystemLog "Todas las dependencias verificadas correctamente" "INFO" "Green"
    return $true
}

# Función para verificar puertos disponibles
function Test-PortAvailability {
    param([int[]]$Ports = @(3003, 8080, 3000))
    
    Write-SystemLog "Verificando disponibilidad de puertos..." "INFO" "Cyan"
    
    foreach ($port in $Ports) {
        try {
            $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
            if ($connection) {
                Write-SystemLog "Puerto $port esta en uso por PID: $($connection.OwningProcess)" "WARNING" "Yellow"
            } else {
                Write-SystemLog "Puerto $port disponible" "INFO" "Green"
            }
        } catch {
            Write-SystemLog "Puerto $port disponible" "INFO" "Green"
        }
    }
}

# Función para lanzar Leonardo en segundo plano
function Start-LeonardoSystem {
    Write-SystemLog "Iniciando Leonardo Consciousness System..." "INFO" "Cyan"
    
    # Configurar variables de entorno
    $env:NODE_ENV = $Mode
    $env:TRADING_MODE = $TradingMode
    $env:LEONARDO_PORT = "3003"
    $env:ENABLE_LOGS = "true"
    if ($AutoStartTrading) {
        $env:AUTO_START_TRADING = "true"
    }
    
    Write-SystemLog "Configuracion establecida:" "INFO" "White"
    Write-SystemLog "  - NODE_ENV: $Mode" "INFO" "Gray"
    Write-SystemLog "  - TRADING_MODE: $TradingMode" "INFO" "Gray"
    Write-SystemLog "  - PORT: 3003" "INFO" "Gray"
    Write-SystemLog "  - AUTO_START_TRADING: $AutoStartTrading" "INFO" "Gray"
    
    # Lanzar el proceso Node.js en segundo plano
    try {
        $processArgs = @{
            FilePath = "node"
            ArgumentList = "MasterLauncher.js"
            WorkingDirectory = Get-Location
            WindowStyle = "Hidden"
            PassThru = $true
            RedirectStandardOutput = "logs/leonardo-output.log"
            RedirectStandardError = "logs/leonardo-error.log"
        }
        
        $leonardoProcess = Start-Process @processArgs
        Start-Sleep -Seconds 2
        
        if ($leonardoProcess -and !$leonardoProcess.HasExited) {
            Write-SystemLog "Leonardo System iniciado exitosamente - PID: $($leonardoProcess.Id)" "INFO" "Green"
            Write-SystemLog "Logs de salida: logs/leonardo-output.log" "INFO" "Cyan"
            Write-SystemLog "Logs de errores: logs/leonardo-error.log" "INFO" "Cyan"
            return $leonardoProcess
        } else {
            Write-SystemLog "Error: Leonardo System no se pudo iniciar" "ERROR" "Red"
            return $null
        }
    } catch {
        Write-SystemLog "Error iniciando Leonardo: $($_.Exception.Message)" "ERROR" "Red"
        return $null
    }
}

# Función para verificar el estado del sistema
function Test-LeonardoHealth {
    Write-SystemLog "Verificando estado del sistema Leonardo..." "INFO" "Cyan"
    
    # Esperar a que el sistema se inicialice
    $maxAttempts = 10
    $attempt = 0
    
    do {
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:3003/api/status" -Method GET -TimeoutSec 5
            Write-SystemLog "Sistema Leonardo respondiendo correctamente" "INFO" "Green"
            Write-SystemLog "  - Estado del launcher: $($response.launcher.running)" "INFO" "White"
            Write-SystemLog "  - Estado del core: $($response.launcher.components.core)" "INFO" "White"
            Write-SystemLog "  - Estado HTTP: $($response.launcher.components.http)" "INFO" "White"
            return $true
        } catch {
            $attempt++
            Write-SystemLog "Intento $attempt/$maxAttempts - Sistema aun inicializando..." "INFO" "Yellow"
            Start-Sleep -Seconds 3
        }
    } while ($attempt -lt $maxAttempts)
    
    Write-SystemLog "Sistema Leonardo no responde despues de $maxAttempts intentos" "WARNING" "Yellow"
    return $false
}

# Función para iniciar monitoreo en segundo plano
function Start-SystemMonitoring {
    Write-SystemLog "Iniciando monitor del sistema en segundo plano..." "INFO" "Cyan"
    
    try {
        $monitorArgs = @{
            FilePath = "powershell"
            ArgumentList = "-ExecutionPolicy", "Bypass", "-File", "monitor-system.ps1", "-UpdateInterval", $MonitoringInterval
            WorkingDirectory = Get-Location
            WindowStyle = "Normal"
            PassThru = $true
        }
        
        $monitorProcess = Start-Process @monitorArgs
        
        if ($monitorProcess) {
            Write-SystemLog "Monitor iniciado - PID: $($monitorProcess.Id)" "INFO" "Green"
            return $monitorProcess
        }
    } catch {
        Write-SystemLog "Error iniciando monitor: $($_.Exception.Message)" "ERROR" "Red"
        return $null
    }
}

# Función para mostrar comando de monitoreo manual
function Show-ManualMonitoringCommand {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "                    COMANDOS DE MONITOREO MANUAL" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Para monitoreo detallado en tiempo real, ejecuta:" -ForegroundColor White
    Write-Host "  .\monitor-system.ps1" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para monitoreo basico de procesos:" -ForegroundColor White
    Write-Host "  Get-Process -Name node | Format-Table -AutoSize" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para verificar conexiones de red:" -ForegroundColor White
    Write-Host "  Get-NetTCPConnection -LocalPort 3003" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para medir rendimiento en tiempo real:" -ForegroundColor White
    Write-Host "  Measure-Command { Invoke-RestMethod http://localhost:3003/api/status }" -ForegroundColor Green
    Write-Host ""
    Write-Host "Interface web del sistema:" -ForegroundColor White
    Write-Host "  http://localhost:3003" -ForegroundColor Cyan
    Write-Host ""
}

# Función para mostrar métricas en tiempo real simples
function Show-QuickMetrics {
    param($LeonardoProcess)
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "                      METRICAS RAPIDAS" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    if ($LeonardoProcess -and !$LeonardoProcess.HasExited) {
        $process = Get-Process -Id $LeonardoProcess.Id -ErrorAction SilentlyContinue
        if ($process) {
            $uptime = (Get-Date) - $process.StartTime
            $memoryMB = [Math]::Round($process.WorkingSet64 / 1MB, 2)
            
            Write-Host "Sistema Leonardo - PID: $($process.Id)" -ForegroundColor Green
            Write-Host "├─ Estado: EJECUTANDO" -ForegroundColor Green
            Write-Host "├─ Uptime: $($uptime.Hours)h $($uptime.Minutes)m $($uptime.Seconds)s" -ForegroundColor Cyan
            Write-Host "├─ Memoria: $memoryMB MB" -ForegroundColor White
            Write-Host "├─ Threads: $($process.Threads.Count)" -ForegroundColor White
            Write-Host "└─ Handles: $($process.HandleCount)" -ForegroundColor White
        }
    } else {
        Write-Host "Sistema Leonardo: NO EJECUTANDO" -ForegroundColor Red
    }
    
    # Verificar estado de la API
    try {
        $startTime = Get-Date
        $response = Invoke-RestMethod -Uri "http://localhost:3003/api/status" -Method GET -TimeoutSec 5
        $responseTime = ((Get-Date) - $startTime).TotalMilliseconds
        
        Write-Host ""
        Write-Host "API Leonardo - Estado: ACTIVA" -ForegroundColor Green
        Write-Host "├─ Tiempo de respuesta: $([Math]::Round($responseTime, 2)) ms" -ForegroundColor Cyan
        Write-Host "├─ Requests totales: $($response.metrics.requests)" -ForegroundColor White
        Write-Host "├─ Errores: $($response.metrics.errors)" -ForegroundColor $(if ($response.metrics.errors -gt 0) { "Red" } else { "Green" })
        Write-Host "└─ Uptime: $([Math]::Round($response.metrics.uptime / 1000 / 60, 2)) minutos" -ForegroundColor White
    } catch {
        Write-Host "API Leonardo: NO RESPONDE" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Función principal
function Start-LeonardoWithMonitoring {
    Write-SystemLog "Iniciando launcher maestro de Leonardo Consciousness" "INFO" "Yellow"
    
    # Verificar dependencias
    if (!(Test-SystemDependencies)) {
        Write-SystemLog "Dependencias no satisfechas. Abortando..." "ERROR" "Red"
        return
    }
    
    # Verificar puertos
    Test-PortAvailability
    
    # Lanzar el sistema Leonardo
    $leonardoProcess = Start-LeonardoSystem
    if (!$leonardoProcess) {
        Write-SystemLog "Error critico: No se pudo iniciar Leonardo System" "ERROR" "Red"
        return
    }
    
    # Esperar y verificar salud del sistema
    Start-Sleep -Seconds 5
    $systemHealthy = Test-LeonardoHealth
    
    if ($systemHealthy) {
        Write-SystemLog "Sistema Leonardo completamente operacional!" "INFO" "Green"
        
        # Mostrar métricas rápidas
        Show-QuickMetrics -LeonardoProcess $leonardoProcess
        
        # Iniciar monitoreo si está habilitado
        $monitorProcess = $null
        if ($EnableMonitoring) {
            $monitorProcess = Start-SystemMonitoring
        }
        
        # Mostrar comandos de monitoreo manual
        Show-ManualMonitoringCommand
        
        # Mantener la sesión activa y mostrar estado
        Write-Host "Sistema iniciado exitosamente. Presiona Ctrl+C para detener..." -ForegroundColor Yellow
        Write-Host ""
        
        try {
            while ($true) {
                Start-Sleep -Seconds 30
                
                # Verificar que el proceso siga corriendo
                if ($leonardoProcess.HasExited) {
                    Write-SystemLog "ALERTA: Leonardo System se detuvo inesperadamente!" "ERROR" "Red"
                    break
                }
                
                # Mostrar métricas cada 30 segundos
                Write-SystemLog "Sistema operando normalmente - PID: $($leonardoProcess.Id)" "INFO" "Green"
            }
        } catch {
            Write-SystemLog "Deteniendo sistema..." "INFO" "Yellow"
        } finally {
            # Cleanup
            Write-SystemLog "Deteniendo Leonardo System..." "INFO" "Yellow"
            if ($leonardoProcess -and !$leonardoProcess.HasExited) {
                $leonardoProcess.Kill()
                Write-SystemLog "Proceso Leonardo detenido" "INFO" "Green"
            }
            
            if ($monitorProcess -and !$monitorProcess.HasExited) {
                $monitorProcess.Kill()
                Write-SystemLog "Monitor detenido" "INFO" "Green"
            }
        }
        
    } else {
        Write-SystemLog "Sistema Leonardo no paso la verificacion de salud" "ERROR" "Red"
        if ($leonardoProcess -and !$leonardoProcess.HasExited) {
            $leonardoProcess.Kill()
        }
    }
}

# Ejecutar función principal
Start-LeonardoWithMonitoring
