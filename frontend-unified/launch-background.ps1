# ========================================================================
# QBTC FRONTEND - LANZAMIENTO EN SEGUNDO PLANO
# Script simplificado para lanzar frontend unificado sin interfaz
# ========================================================================

$Host.UI.RawUI.OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$FRONTEND_PATH = $PSScriptRoot
$FRONTEND_SCRIPT = "frontend-proxy-server.js"
$FRONTEND_PORT = 3004
$LOG_FILE = "$FRONTEND_PATH\background-launch-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "HH:mm:ss"
    $logEntry = "[$timestamp] $Message"
    Write-Output $logEntry | Out-File -FilePath $LOG_FILE -Append -Encoding utf8
    Write-Host $logEntry -ForegroundColor Green
}

Write-Log "INICIANDO FRONTEND EN SEGUNDO PLANO"
Write-Log "Puerto: $FRONTEND_PORT"
Write-Log "Directorio: $FRONTEND_PATH"
Write-Log "Log: $LOG_FILE"

# Verificar si ya esta ejecutandose
$existingProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    try {
        $wmi = Get-WmiObject -Class Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction SilentlyContinue
        return $wmi -and $wmi.CommandLine -like "*frontend-proxy-server*"
    }
    catch { return $false }
}

if ($existingProcess) {
    Write-Log "FRONTEND YA EJECUTANDOSE (PID: $($existingProcess.Id))"
    Write-Log "URL: http://localhost:$FRONTEND_PORT"
    exit 0
}

# Verificar archivo del servidor
$serverPath = Join-Path $FRONTEND_PATH $FRONTEND_SCRIPT
if (-not (Test-Path $serverPath)) {
    Write-Log "ERROR: $FRONTEND_SCRIPT no encontrado"
    exit 1
}

try {
    Push-Location $FRONTEND_PATH
    
    # Instalar dependencias si es necesario
    if ((Test-Path "package.json") -and (-not (Test-Path "node_modules"))) {
        Write-Log "Instalando dependencias npm..."
        npm install --silent
    }
    
    # Crear proceso en segundo plano
    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = "node"
    $processInfo.Arguments = $FRONTEND_SCRIPT
    $processInfo.WorkingDirectory = $FRONTEND_PATH
    $processInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
    $processInfo.CreateNoWindow = $true
    $processInfo.UseShellExecute = $false
    
    $process = [System.Diagnostics.Process]::Start($processInfo)
    
    Write-Log "FRONTEND INICIADO EN SEGUNDO PLANO"
    Write-Log "PID: $($process.Id)"
    Write-Log "URL: http://localhost:$FRONTEND_PORT"
    
    # Verificar inicializacion
    Start-Sleep -Seconds 5
    
    try {
        $testConnection = Test-NetConnection -ComputerName "localhost" -Port $FRONTEND_PORT -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($testConnection) {
            Write-Log "FRONTEND FUNCIONANDO CORRECTAMENTE"
        } else {
            Write-Log "ADVERTENCIA: No se pudo verificar el estado del frontend"
        }
    }
    catch {
        Write-Log "ADVERTENCIA: Error verificando conectividad"
    }
    
    Pop-Location
    
    # Crear archivo de status
    $statusInfo = @{
        PID = $process.Id
        Port = $FRONTEND_PORT
        StartTime = Get-Date
        URL = "http://localhost:$FRONTEND_PORT"
        LogFile = $LOG_FILE
    }
    
    $statusInfo | ConvertTo-Json | Out-File "$FRONTEND_PATH\frontend-status.json" -Encoding utf8
    
    Write-Log "STATUS GUARDADO EN frontend-status.json"
    Write-Log "LANZAMIENTO COMPLETO"
    
}
catch {
    Write-Log "ERROR: $($_.Exception.Message)"
    Pop-Location
    exit 1
}
