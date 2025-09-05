# QBTC Backend Production Launcher - PowerShell Script
# Copyright © 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES
# Lanza el backend QBTC en segundo plano con logs detallados

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("start", "stop", "restart", "status", "logs")]
    [string]$Action = "start",
    
    [Parameter(Mandatory=$false)]
    [string]$LogLevel = "INFO",
    
    [Parameter(Mandatory=$false)]
    [switch]$Foreground,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

# Configuración global
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Definition
$LAUNCHER_SCRIPT = Join-Path $SCRIPT_DIR "launch-backend-production.js"
$PID_FILE = Join-Path $SCRIPT_DIR "logs\backend.pid"
$LOG_DIR = Join-Path $SCRIPT_DIR "logs"
$BACKEND_LOG = Join-Path $LOG_DIR "backend.log"

# Colores para output
$Colors = @{
    "Success" = "Green"
    "Warning" = "Yellow"
    "Error" = "Red"
    "Info" = "Cyan"
    "Debug" = "Magenta"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White",
        [switch]$NoNewline
    )
    
    if ($Colors.ContainsKey($Color)) {
        $ForegroundColor = $Colors[$Color]
    } else {
        $ForegroundColor = $Color
    }
    
    if ($NoNewline) {
        Write-Host $Message -ForegroundColor $ForegroundColor -NoNewline
    } else {
        Write-Host $Message -ForegroundColor $ForegroundColor
    }
}

function Test-NodeInstalled {
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
        Write-ColorOutput "[OK] Node.js detectado: $nodeVersion" "Success"
            return $true
        }
    }
    catch {
        Write-ColorOutput "[ERROR] Node.js no encontrado. Por favor instala Node.js." "Error"
        return $false
    }
    return $false
}

function Test-RequiredFiles {
    $requiredFiles = @(
        $LAUNCHER_SCRIPT,
        (Join-Path $SCRIPT_DIR "config\monitoring.js"),
        (Join-Path $SCRIPT_DIR "UnifiedHttpServer.js")
    )
    
    $allFilesExist = $true
    
    foreach ($file in $requiredFiles) {
        if (Test-Path $file) {
            Write-ColorOutput "[OK] Archivo encontrado: $(Split-Path -Leaf $file)" "Success"
        } else {
            Write-ColorOutput "[ERROR] Archivo faltante: $file" "Error"
            $allFilesExist = $false
        }
    }
    
    return $allFilesExist
}

function Ensure-LogDirectory {
    if (-not (Test-Path $LOG_DIR)) {
        New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null
        Write-ColorOutput "✓ Directorio de logs creado: $LOG_DIR" "Success"
    }
}

function Get-BackendPID {
    if (Test-Path $PID_FILE) {
        try {
            $pid = Get-Content $PID_FILE -ErrorAction Stop
            
            # Verificar si el proceso aún existe
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($process) {
                return [int]$pid
            } else {
                # Limpiar PID file obsoleto
                Remove-Item $PID_FILE -Force -ErrorAction SilentlyContinue
            }
        }
        catch {
            # PID file corrupto, eliminarlo
            Remove-Item $PID_FILE -Force -ErrorAction SilentlyContinue
        }
    }
    return $null
}

function Start-Backend {
    Write-ColorOutput "`n🚀 Iniciando Backend QBTC en Producción..." "Info"
    Write-ColorOutput "===============================================" "Info"
    
    # Verificar si ya está ejecutándose
    $existingPid = Get-BackendPID
    if ($existingPid) {
        Write-ColorOutput "⚠️  Backend ya está ejecutándose (PID: $existingPid)" "Warning"
        return
    }
    
    # Verificaciones previas
    Write-ColorOutput "`n📋 Ejecutando verificaciones previas..." "Info"
    
    if (-not (Test-NodeInstalled)) {
        return
    }
    
    if (-not (Test-RequiredFiles)) {
        Write-ColorOutput "✗ Faltan archivos requeridos. Abortando." "Error"
        return
    }
    
    Ensure-LogDirectory
    
    # Verificar variables de entorno críticas
    $requiredEnvVars = @("BINANCE_API_KEY", "BINANCE_SECRET_KEY")
    $missingVars = @()
    
    foreach ($envVar in $requiredEnvVars) {
        if (-not $env:($envVar)) {
            $missingVars += $envVar
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-ColorOutput "✗ Variables de entorno faltantes: $($missingVars -join ', ')" "Error"
        Write-ColorOutput "Por favor configura las variables antes de continuar." "Warning"
        return
    }
    
    Write-ColorOutput "✓ Todas las verificaciones exitosas" "Success"
    
    # Configurar variables de entorno
    $env:LOG_LEVEL = $LogLevel
    $env:ENABLE_FILE_LOGGING = "true"
    $env:ENABLE_CONSOLE_LOGGING = "true"
    $env:PRODUCTION_MODE = "true"
    
    if ($Foreground) {
        $env:DETACHED_MODE = "false"
        $env:ENABLE_CONSOLE_OUTPUT = "true"
    } else {
        $env:DETACHED_MODE = "true"
        $env:ENABLE_CONSOLE_OUTPUT = "false"
    }
    
    # Iniciar el proceso
    Write-ColorOutput "`n🔄 Lanzando proceso backend..." "Info"
    
    try {
        if ($Foreground) {
            # Modo foreground - mostrar salida en tiempo real
            Write-ColorOutput "Ejecutando en modo foreground. Presiona Ctrl+C para detener." "Info"
            & node $LAUNCHER_SCRIPT
        } else {
            # Modo background - proceso independiente
            $processArgs = @{
                FilePath = "node"
                ArgumentList = @($LAUNCHER_SCRIPT)
                WindowStyle = "Hidden"
                PassThru = $true
                RedirectStandardOutput = $BACKEND_LOG
                RedirectStandardError = Join-Path $LOG_DIR "backend-error.log"
            }
            
            $process = Start-Process @processArgs
            
            # Esperar un momento para verificar que se inició correctamente
            Start-Sleep -Seconds 2
            
            if (-not $process.HasExited) {
                Write-ColorOutput "✅ Backend iniciado exitosamente" "Success"
                Write-ColorOutput "📊 PID: $($process.Id)" "Info"
                Write-ColorOutput "📁 Logs: $BACKEND_LOG" "Info"
                Write-ColorOutput "🔗 Health Check: http://localhost:18021/unified/health" "Info"
                
                # Guardar PID
                $process.Id | Out-File $PID_FILE -Encoding ascii
                
                # Mostrar información de monitoreo
                Write-ColorOutput "`n📈 Comandos de monitoreo:" "Info"
                Write-ColorOutput "  .\start-backend.ps1 status    - Ver estado" "Debug"
                Write-ColorOutput "  .\start-backend.ps1 logs      - Ver logs" "Debug"
                Write-ColorOutput "  .\start-backend.ps1 stop      - Detener" "Debug"
                
            } else {
                Write-ColorOutput "✗ El proceso terminó inesperadamente" "Error"
                if (Test-Path $BACKEND_LOG) {
                    Write-ColorOutput "Últimas líneas del log:" "Warning"
                    Get-Content $BACKEND_LOG -Tail 10 | ForEach-Object {
                        Write-ColorOutput "  $_" "Debug"
                    }
                }
            }
        }
        
    } catch {
        Write-ColorOutput "✗ Error iniciando el backend: $($_.Exception.Message)" "Error"
    }
}

function Stop-Backend {
    Write-ColorOutput "`n🛑 Deteniendo Backend QBTC..." "Info"
    
    $pid = Get-BackendPID
    if (-not $pid) {
        Write-ColorOutput "⚠️  Backend no está ejecutándose" "Warning"
        return
    }
    
    try {
        $process = Get-Process -Id $pid -ErrorAction Stop
        
        Write-ColorOutput "🔄 Enviando señal de terminación al proceso $pid..." "Info"
        
        # Intentar terminar gracefully
        $process.CloseMainWindow() | Out-Null
        
        # Esperar hasta 30 segundos para que termine
        $timeout = 30
        $waited = 0
        
        while (-not $process.HasExited -and $waited -lt $timeout) {
            Start-Sleep -Seconds 1
            $waited++
            Write-ColorOutput "." "Info" -NoNewline
        }
        
        Write-Host ""  # Nueva línea
        
        if ($process.HasExited) {
            Write-ColorOutput "✅ Backend detenido exitosamente" "Success"
        } else {
            Write-ColorOutput "⏱️  Terminación graceful agotada, forzando..." "Warning"
            $process.Kill()
            Start-Sleep -Seconds 2
            
            if ($process.HasExited) {
                Write-ColorOutput "✅ Backend terminado forzosamente" "Success"
            } else {
                Write-ColorOutput "✗ No se pudo terminar el proceso" "Error"
                return
            }
        }
        
    } catch [Microsoft.PowerShell.Commands.ProcessCommandException] {
        Write-ColorOutput "⚠️  Proceso ya no existe" "Warning"
    } catch {
        Write-ColorOutput "✗ Error deteniendo el proceso: $($_.Exception.Message)" "Error"
        return
    }
    
    # Limpiar archivo PID
    if (Test-Path $PID_FILE) {
        Remove-Item $PID_FILE -Force -ErrorAction SilentlyContinue
    }
    
    Write-ColorOutput "🧹 Limpieza completada" "Success"
}

function Get-BackendStatus {
    Write-ColorOutput "`n📊 Estado del Backend QBTC" "Info"
    Write-ColorOutput "============================" "Info"
    
    $pid = Get-BackendPID
    
    if ($pid) {
        try {
            $process = Get-Process -Id $pid -ErrorAction Stop
            
            Write-ColorOutput "🟢 Estado: EJECUTÁNDOSE" "Success"
            Write-ColorOutput "📊 PID: $pid" "Info"
            Write-ColorOutput "⏱️  Tiempo de inicio: $($process.StartTime)" "Info"
            Write-ColorOutput "💾 Uso de memoria: $([math]::Round($process.WorkingSet64/1MB, 2)) MB" "Info"
            Write-ColorOutput "🧮 Tiempo de CPU: $($process.TotalProcessorTime)" "Info"
            
            # Intentar obtener métricas del servidor
            try {
                $response = Invoke-RestMethod -Uri "http://localhost:18021/unified/health" -Method GET -TimeoutSec 5
                
                Write-ColorOutput "`n📈 Métricas del Servidor:" "Info"
                Write-ColorOutput "  Estado: $($response.status)" "Success"
                Write-ColorOutput "  Uptime: $([math]::Round($response.uptime/60, 2)) minutos" "Info"
                Write-ColorOutput "  Requests: $($response.metrics.requests)" "Info"
                Write-ColorOutput "  Conexiones activas: $($response.metrics.activeConnections)" "Info"
                Write-ColorOutput "  Consciencia: $($response.metrics.consciousness)" "Info"
                Write-ColorOutput "  Coherencia: $($response.metrics.coherence)" "Info"
                
            } catch {
                Write-ColorOutput "⚠️  No se pudieron obtener métricas del servidor" "Warning"
            }
            
        } catch {
            Write-ColorOutput "🔴 Estado: PROCESO NO RESPONDE" "Error"
        }
        
    } else {
        Write-ColorOutput "🔴 Estado: NO EJECUTÁNDOSE" "Error"
    }
    
    # Mostrar información de logs
    Write-ColorOutput "`n📁 Información de Logs:" "Info"
    
    $logFiles = @(
        @{ Path = $BACKEND_LOG; Name = "Backend Log" },
        @{ Path = (Join-Path $LOG_DIR "trading.log"); Name = "Trading Log" },
        @{ Path = (Join-Path $LOG_DIR "binance.log"); Name = "Binance Log" },
        @{ Path = (Join-Path $LOG_DIR "health.log"); Name = "Health Log" }
    )
    
    foreach ($logFile in $logFiles) {
        if (Test-Path $logFile.Path) {
            $fileInfo = Get-Item $logFile.Path
            $size = [math]::Round($fileInfo.Length/1KB, 2)
            Write-ColorOutput "  $($logFile.Name): ${size} KB (modificado: $($fileInfo.LastWriteTime))" "Debug"
        }
    }
}

function Show-BackendLogs {
    param(
        [int]$Lines = 50
    )
    
    Write-ColorOutput "`n📜 Logs del Backend (últimas $Lines líneas)" "Info"
    Write-ColorOutput "=============================================" "Info"
    
    if (Test-Path $BACKEND_LOG) {
        try {
            $logContent = Get-Content $BACKEND_LOG -Tail $Lines -ErrorAction Stop
            
            foreach ($line in $logContent) {
                # Colorear según el nivel de log
                if ($line -match "\[ERROR\]") {
                    Write-ColorOutput $line "Error"
                } elseif ($line -match "\[WARN\]") {
                    Write-ColorOutput $line "Warning"
                } elseif ($line -match "\[INFO\]") {
                    Write-ColorOutput $line "Info"
                } elseif ($line -match "\[DEBUG\]") {
                    Write-ColorOutput $line "Debug"
                } else {
                    Write-Host $line
                }
            }
            
        } catch {
            Write-ColorOutput "✗ Error leyendo el archivo de log: $($_.Exception.Message)" "Error"
        }
    } else {
        Write-ColorOutput "⚠️  Archivo de log no encontrado: $BACKEND_LOG" "Warning"
    }
    
    Write-ColorOutput "`n💡 Para seguir los logs en tiempo real:" "Info"
    Write-ColorOutput "Get-Content '$BACKEND_LOG' -Wait -Tail 10" "Debug"
}

function Restart-Backend {
    Write-ColorOutput "`n🔄 Reiniciando Backend QBTC..." "Info"
    Stop-Backend
    Start-Sleep -Seconds 3
    Start-Backend
}

# Función principal
function Main {
    Write-ColorOutput "`n🎯 QBTC Backend Manager v1.0" "Info"
    Write-ColorOutput "Acción: $Action" "Debug"
    
    if ($Verbose) {
        $VerbosePreference = "Continue"
    }
    
    switch ($Action.ToLower()) {
        "start" {
            Start-Backend
        }
        "stop" {
            Stop-Backend
        }
        "restart" {
            Restart-Backend
        }
        "status" {
            Get-BackendStatus
        }
        "logs" {
            Show-BackendLogs
        }
        default {
            Write-ColorOutput "✗ Acción no reconocida: $Action" "Error"
            Write-ColorOutput "Acciones disponibles: start, stop, restart, status, logs" "Info"
        }
    }
}

# Ejecutar función principal
Main
