# ========================================================================
# QBTC-UNIFIED MOCK SERVER LAUNCHER
# Script para iniciar el servidor mock con integración de CredentialsManager
# ========================================================================

param(
    [switch]$Enhanced = $false,
    [switch]$Background = $false
)

$Host.UI.RawUI.OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Configuración
$QBTC_ROOT = $PSScriptRoot
$LOG_FILE = "$QBTC_ROOT\mock-server-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "HH:mm:ss.fff"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    Write-Output $logEntry | Out-File -FilePath $LOG_FILE -Append -Encoding utf8
    
    $color = switch($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        "INFO" { "White" }
        default { "White" }
    }
    
    Write-Host $logEntry -ForegroundColor $color
}

function Test-Prerequisites {
    Write-Log "Verificando prerequisitos..." "INFO"
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-Log "Node.js: $nodeVersion" "SUCCESS"
        } else {
            Write-Log "Node.js no encontrado" "ERROR"
            return $false
        }
    } catch {
        Write-Log "Error verificando Node.js" "ERROR"
        return $false
    }
    
    # Verificar scripts
    $scripts = @(
        "$QBTC_ROOT\mock-backend-server.js",
        "$QBTC_ROOT\enhanced-mock-server.js",
        "$QBTC_ROOT\credentials-integration.js"
    )
    
    foreach ($script in $scripts) {
        if (-not (Test-Path $script)) {
            Write-Log "Script faltante: $script" "ERROR"
            return $false
        }
    }
    
    # Verificar CredentialsManager
    if (-not (Test-Path "$QBTC_ROOT\quantum-core\CredentialsManager.js")) {
        Write-Log "CredentialsManager no encontrado" "ERROR"
        return $false
    }
    
    Write-Log "Prerequisitos verificados correctamente" "SUCCESS"
    return $true
}

function Start-MockServer {
    param([bool]$UseEnhanced)
    
    Write-Log "Iniciando servidor mock $(if($UseEnhanced){'mejorado con CredentialsManager' }else{'básico'})..." "INFO"
    
    # Determinar script a ejecutar
    $scriptPath = if ($UseEnhanced) {
        "$QBTC_ROOT\enhanced-mock-server.js"
    } else {
        "$QBTC_ROOT\mock-backend-server.js"
    }
    
    # Verificar si ya está ejecutándose
    $existingProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        try {
            $wmi = Get-WmiObject -Class Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction SilentlyContinue
            return $wmi -and $wmi.CommandLine -like "*$scriptPath*"
        } catch {
            return $false
        }
    }
    
    if ($existingProcess) {
        Write-Log "Servidor mock ya está ejecutándose (PID: $($existingProcess.Id))" "WARN"
        return $existingProcess.Id
    }
    
    try {
        # Iniciar proceso
        $processInfo = New-Object System.Diagnostics.ProcessStartInfo
        $processInfo.FileName = "node"
        $processInfo.Arguments = $scriptPath
        $processInfo.WorkingDirectory = $QBTC_ROOT
        
        if ($Background) {
            $processInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
            $processInfo.CreateNoWindow = $true
            $processInfo.UseShellExecute = $false
        }
        
        $process = [System.Diagnostics.Process]::Start($processInfo)
        Write-Log "Servidor mock iniciado (PID: $($process.Id))" "SUCCESS"
        
        # Esperar inicialización
        Start-Sleep -Seconds 3
        
        # Verificar puerto 18020
        $portTest = Test-NetConnection -ComputerName "localhost" -Port 18020 -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($portTest) {
            Write-Log "Servidor mock respondiendo en puerto 18020" "SUCCESS"
        } else {
            Write-Log "ADVERTENCIA: Servidor mock podría no estar respondiendo" "WARN"
        }
        
        return $process.Id
    } catch {
        Write-Log "Error iniciando servidor mock: $($_.Exception.Message)" "ERROR"
        return $null
    }
}

# LÓGICA PRINCIPAL
Write-Log "QBTC-UNIFIED MOCK SERVER LAUNCHER" "INFO"
Write-Log "Modo: $(if($Enhanced){'Mejorado'}else{'Básico'}) | Background: $Background" "INFO"

if (-not (Test-Prerequisites)) {
    Write-Log "Prerequisitos fallidos - Abortando lanzamiento" "ERROR"
    exit 1
}

$serverPID = Start-MockServer -UseEnhanced $Enhanced

if ($serverPID) {
    Write-Log "Servidor mock iniciado exitosamente (PID: $serverPID)" "SUCCESS"
    Write-Log "URL: http://localhost:18020" "INFO"
    
    if (-not $Background) {
        Write-Host ""
        Write-Host "Servidor mock ejecutándose. Presione Ctrl+C para detener." -ForegroundColor Cyan
        try {
            while ($true) {
                Start-Sleep -Seconds 1
            }
        } catch {
            Write-Log "Deteniendo servidor mock..." "INFO"
            Stop-Process -Id $serverPID -Force -ErrorAction SilentlyContinue
            Write-Log "Servidor mock detenido" "SUCCESS"
        }
    } else {
        Write-Log "Servidor mock ejecutándose en segundo plano" "INFO"
    }
} else {
    Write-Log "Error iniciando servidor mock" "ERROR"
    exit 1
}
