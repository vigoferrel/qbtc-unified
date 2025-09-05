# ========================================================================
# QBTC-UNIFIED - TradingEngineLayer Background Launcher
# Script para lanzar el TradingEngineLayer en segundo plano con logging
# Compatible con Windows PowerShell - Solo ASCII
# ========================================================================

param(
    [switch]$Force = $false,
    [switch]$Status = $false,
    [switch]$Stop = $false
)

# Configuracion
$PROCESS_NAME = "TradingEngineLayer"
$LOG_DIR = ".\logs"
$PID_DIR = ".\pids"
$MAIN_SCRIPT = "leonardo-consciousness\LeonardoQuantumServer.js"

# Crear directorios si no existen
if (!(Test-Path $LOG_DIR)) {
    New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null
}

if (!(Test-Path $PID_DIR)) {
    New-Item -ItemType Directory -Path $PID_DIR -Force | Out-Null
}

# Archivos de log y PID
$LOG_FILE = "$LOG_DIR\trading-engine.log"
$ERROR_LOG = "$LOG_DIR\trading-engine-error.log"
$PID_FILE = "$PID_DIR\trading-engine.pid"

# Funcion para logging con ASCII solamente
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry
    Add-Content -Path $LOG_FILE -Value $logEntry -Encoding ASCII
}

# Verificar si el proceso ya esta ejecutandose
function Test-ProcessRunning {
    if (Test-Path $PID_FILE) {
        $processId = Get-Content $PID_FILE -ErrorAction SilentlyContinue
        if ($processId) {
            try {
                $process = Get-Process -Id $processId -ErrorAction Stop
                if ($process.ProcessName -like "*node*") {
                    return $true
                }
            } catch {
                # Proceso no existe, limpiar PID file
                Remove-Item $PID_FILE -Force -ErrorAction SilentlyContinue
            }
        }
    }
    return $false
}

# Detener proceso
function Stop-TradingEngine {
    Write-Log "Deteniendo TradingEngineLayer..." "INFO"
    
    if (Test-Path $PID_FILE) {
        $processId = Get-Content $PID_FILE -ErrorAction SilentlyContinue
        if ($processId) {
            try {
                Stop-Process -Id $processId -Force -ErrorAction Stop
                Write-Log "Proceso detenido: PID $processId" "INFO"
            } catch {
                Write-Log "No se pudo detener el proceso PID $processId" "WARN"
            }
        }
        Remove-Item $PID_FILE -Force -ErrorAction SilentlyContinue
    }
    
    # Buscar procesos node relacionados
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*LeonardoQuantumServer*" -or 
        $_.MainModule.FileName -like "*node.exe*"
    }
    
    foreach ($proc in $nodeProcesses) {
        try {
            Write-Log "Deteniendo proceso Node.js: PID $($proc.Id)" "INFO"
            Stop-Process -Id $proc.Id -Force
        } catch {
            Write-Log "No se pudo detener proceso: $($proc.Id)" "WARN"
        }
    }
    
    Write-Log "TradingEngineLayer detenido completamente" "INFO"
}

# Obtener estado del sistema
function Get-TradingEngineStatus {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  ESTADO DEL TRADING ENGINE LAYER" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    
    $isRunning = Test-ProcessRunning
    
    if ($isRunning) {
        $processId = Get-Content $PID_FILE
        Write-Host "Estado: EJECUTANDOSE" -ForegroundColor Green
        Write-Host "PID: $processId" -ForegroundColor Green
        
        # Verificar puertos
        $ports = @(18020, 18021, 18022)
        foreach ($port in $ports) {
            try {
                $connection = Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet
                if ($connection) {
                    Write-Host "Puerto $port : ACTIVO" -ForegroundColor Green
                } else {
                    Write-Host "Puerto $port : INACTIVO" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "Puerto $port : ERROR" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "Estado: NO EJECUTANDOSE" -ForegroundColor Red
    }
    
    # Mostrar logs recientes si existen
    if (Test-Path $LOG_FILE) {
        $recentLogs = Get-Content $LOG_FILE -Tail 5 -ErrorAction SilentlyContinue
        if ($recentLogs) {
            Write-Host "`nLOGS RECIENTES:" -ForegroundColor Yellow
            foreach ($log in $recentLogs) {
                Write-Host "  $log" -ForegroundColor Gray
            }
        }
    }
    
    Write-Host "========================================" -ForegroundColor Cyan
}

# Iniciar TradingEngineLayer
function Start-TradingEngine {
    Write-Log "Iniciando TradingEngineLayer en segundo plano..." "INFO"
    
    # Verificar que Node.js este disponible
    try {
        $nodeVersion = node --version 2>$null
        Write-Log "Node.js version: $nodeVersion" "INFO"
    } catch {
        Write-Log "ERROR: Node.js no esta disponible" "ERROR"
        return $false
    }
    
    # Verificar que el script principal existe
    if (!(Test-Path $MAIN_SCRIPT)) {
        Write-Log "ERROR: No se encuentra el archivo $MAIN_SCRIPT" "ERROR"
        return $false
    }
    
    # Configurar variables de entorno para segundo plano
    $env:NODE_ENV = "production"
    $env:LEONARDO_PORT = "18020"
    $env:LEONARDO_HOST = "0.0.0.0"
    $env:AUTO_START_TRADING = "true"
    $env:ENABLE_MONITORING = "true"
    $env:TRADING_MODE = "PRODUCTION"
    
    Write-Log "Configuracion de entorno establecida" "INFO"
    Write-Log "Puerto: $env:LEONARDO_PORT" "INFO"
    Write-Log "Modo: $env:TRADING_MODE" "INFO"
    
    try {
        # Crear proceso en segundo plano
        $processStartInfo = New-Object System.Diagnostics.ProcessStartInfo
        $processStartInfo.FileName = "node"
        $processStartInfo.Arguments = $MAIN_SCRIPT
        $processStartInfo.WorkingDirectory = (Get-Location).Path
        $processStartInfo.UseShellExecute = $false
        $processStartInfo.CreateNoWindow = $true
        $processStartInfo.RedirectStandardOutput = $true
        $processStartInfo.RedirectStandardError = $true
        
        $process = New-Object System.Diagnostics.Process
        $process.StartInfo = $processStartInfo
        
        # Configurar manejo de output
        $outputAction = {
            if ($Event.SourceEventArgs.Data) {
                Add-Content -Path $LOG_FILE -Value "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [OUT] $($Event.SourceEventArgs.Data)" -Encoding ASCII
            }
        }
        
        $errorAction = {
            if ($Event.SourceEventArgs.Data) {
                Add-Content -Path $ERROR_LOG -Value "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [ERR] $($Event.SourceEventArgs.Data)" -Encoding ASCII
            }
        }
        
        Register-ObjectEvent -InputObject $process -EventName OutputDataReceived -Action $outputAction | Out-Null
        Register-ObjectEvent -InputObject $process -EventName ErrorDataReceived -Action $errorAction | Out-Null
        
        # Iniciar proceso
        $started = $process.Start()
        if ($started) {
            $process.BeginOutputReadLine()
            $process.BeginErrorReadLine()
            
            # Guardar PID
            $process.Id | Out-File -FilePath $PID_FILE -Encoding ASCII
            
            Write-Log "TradingEngineLayer iniciado exitosamente" "INFO"
            Write-Log "PID: $($process.Id)" "INFO"
            Write-Log "Logs: $LOG_FILE" "INFO"
            Write-Log "Errores: $ERROR_LOG" "INFO"
            
            # Esperar un momento para verificar que se inicio correctamente
            Start-Sleep -Seconds 5
            
            if (!$process.HasExited) {
                Write-Log "Verificacion exitosa: el proceso sigue ejecutandose" "INFO"
                Write-Host "========================================" -ForegroundColor Green
                Write-Host "  TRADING ENGINE LAYER INICIADO" -ForegroundColor Green
                Write-Host "========================================" -ForegroundColor Green
                Write-Host "PID: $($process.Id)" -ForegroundColor Yellow
                Write-Host "Puerto: $env:LEONARDO_PORT" -ForegroundColor Yellow
                Write-Host "Logs: $LOG_FILE" -ForegroundColor Yellow
                Write-Host "Para verificar estado: .\launch-trading-engine-background.ps1 -Status" -ForegroundColor Cyan
                Write-Host "Para detener: .\launch-trading-engine-background.ps1 -Stop" -ForegroundColor Cyan
                return $true
            } else {
                Write-Log "ERROR: El proceso se detuvo inmediatamente" "ERROR"
                return $false
            }
        } else {
            Write-Log "ERROR: No se pudo iniciar el proceso" "ERROR"
            return $false
        }
        
    } catch {
        Write-Log "ERROR al iniciar proceso: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# MAIN - Procesamiento de parametros
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  QBTC-UNIFIED - TradingEngineLayer" -ForegroundColor Yellow
Write-Host "  Background Process Manager" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

if ($Status) {
    Get-TradingEngineStatus
    exit 0
}

if ($Stop) {
    Stop-TradingEngine
    exit 0
}

# Verificar si ya esta ejecutandose
$isRunning = Test-ProcessRunning

if ($isRunning -and !$Force) {
    Write-Log "TradingEngineLayer ya esta ejecutandose" "WARN"
    Write-Host "Use -Force para reiniciar o -Status para ver el estado" -ForegroundColor Yellow
    exit 1
}

if ($isRunning -and $Force) {
    Write-Log "Reiniciando TradingEngineLayer (Force mode)" "INFO"
    Stop-TradingEngine
    Start-Sleep -Seconds 3
}

# Iniciar el sistema
$started = Start-TradingEngine

if ($started) {
    Write-Log "Sistema iniciado correctamente en segundo plano" "INFO"
    exit 0
} else {
    Write-Log "ERROR: No se pudo iniciar el sistema" "ERROR"
    exit 1
}
