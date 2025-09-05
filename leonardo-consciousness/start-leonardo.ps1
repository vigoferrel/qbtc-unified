# ========================================================================
# LEONARDO CONSCIOUSNESS MONITORING SCRIPT - BASIC
# Script basico para ejecutar y monitorizar el sistema Leonardo
# ========================================================================

param([string]$Action = "Help")

Write-Host "LEONARDO CONSCIOUSNESS MONITORING" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Yellow

# Configuracion
$LEONARDO_PATH = $PSScriptRoot
$NODE_SCRIPT = "UnifiedLeonardoServer.js"

function Write-LogMessage {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    switch($Level) {
        "ERROR" { Write-Host $logEntry -ForegroundColor Red }
        "WARN"  { Write-Host $logEntry -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $logEntry -ForegroundColor Green }
        default { Write-Host $logEntry -ForegroundColor White }
    }
}

function Start-Leonardo {
    Write-LogMessage "Verificando si Leonardo esta ejecutandose..." "INFO"
    
    # Verificar procesos Node.js existentes
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-LogMessage "Se encontraron $($nodeProcesses.Count) procesos Node.js ejecutandose" "INFO"
        return $true
    }
    
    # Verificar que el archivo del servidor existe
    $serverPath = Join-Path $LEONARDO_PATH $NODE_SCRIPT
    if (-not (Test-Path $serverPath)) {
        Write-LogMessage "ERROR: No se encuentra $NODE_SCRIPT en $LEONARDO_PATH" "ERROR"
        return $false
    }
    
    Write-LogMessage "Iniciando servidor Leonardo..." "INFO"
    
    try {
        # Cambiar al directorio del proyecto
        Push-Location $LEONARDO_PATH
        
        # Iniciar el servidor en segundo plano
        $process = Start-Process -FilePath "node" -ArgumentList $NODE_SCRIPT -PassThru -WindowStyle Minimized
        Write-LogMessage "Leonardo iniciado con PID: $($process.Id)" "SUCCESS"
        
        # Esperar un poco para que inicie
        Start-Sleep -Seconds 5
        
        Pop-Location
        return $true
        
    } catch {
        Write-LogMessage "ERROR iniciando Leonardo: $($_.Exception.Message)" "ERROR"
        Pop-Location
        return $false
    }
}

function Show-Status {
    Write-Host ""
    Write-Host "=== LEONARDO STATUS ===" -ForegroundColor Cyan
    Write-Host "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
    Write-Host ""
    
    # Mostrar procesos Node.js
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Host "PROCESOS NODE.JS ACTIVOS:" -ForegroundColor Green
        foreach ($proc in $nodeProcesses) {
            $memoryMB = [Math]::Round($proc.WorkingSet64 / 1MB, 2)
            $runtime = (Get-Date) - $proc.StartTime
            Write-Host "   PID: $($proc.Id) | Memoria: $memoryMB MB | Tiempo: $($runtime.ToString('hh\:mm\:ss'))" -ForegroundColor White
        }
    } else {
        Write-Host "No se encontraron procesos Node.js ejecutandose" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # Mostrar informacion del sistema
    $memory = Get-WmiObject -Class Win32_OperatingSystem
    $totalMemoryMB = [Math]::Round($memory.TotalVisibleMemorySize / 1024)
    $freeMemoryMB = [Math]::Round($memory.FreePhysicalMemory / 1024)
    $usedMemoryMB = $totalMemoryMB - $freeMemoryMB
    $memoryPercent = [Math]::Round(($usedMemoryMB / $totalMemoryMB) * 100, 2)
    
    Write-Host "SISTEMA:" -ForegroundColor Green
    Write-Host "   Memoria: $usedMemoryMB MB / $totalMemoryMB MB ($memoryPercent%)" -ForegroundColor White
    Write-Host "   Memoria libre: $freeMemoryMB MB" -ForegroundColor White
    Write-Host ""
}

function Start-Monitoring {
    Write-LogMessage "Iniciando monitoreo de Leonardo" "SUCCESS"
    
    $iteration = 0
    while ($true) {
        try {
            $iteration++
            
            Clear-Host
            Write-Host "LEONARDO CONSCIOUSNESS - MONITOR EN TIEMPO REAL" -ForegroundColor Cyan
            Write-Host "================================================" -ForegroundColor Yellow
            Show-Status
            
            Write-Host "Iteracion: $iteration | Presione Ctrl+C para salir" -ForegroundColor Gray
            
            Start-Sleep -Seconds 3
            
        } catch {
            Write-LogMessage "Error en monitoreo: $($_.Exception.Message)" "ERROR"
            Start-Sleep -Seconds 5
        }
    }
}

function Show-Help {
    Write-Host ""
    Write-Host "LEONARDO CONSCIOUSNESS MONITORING - AYUDA" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Yellow
    Write-Host "Parametros disponibles:" -ForegroundColor Green
    Write-Host "  Start    : Inicia Leonardo y comienza monitoreo" -ForegroundColor White
    Write-Host "  Monitor  : Solo monitorea (Leonardo debe estar ejecutandose)" -ForegroundColor White
    Write-Host "  Status   : Muestra status actual y sale" -ForegroundColor White
    Write-Host "  Test     : Ejecuta tests del sistema" -ForegroundColor White
    Write-Host "  Help     : Muestra esta ayuda" -ForegroundColor White
    Write-Host ""
    Write-Host "Ejemplos de uso:" -ForegroundColor Green
    Write-Host "  .\start-leonardo.ps1 Start" -ForegroundColor White
    Write-Host "  .\start-leonardo.ps1 Monitor" -ForegroundColor White
    Write-Host "  .\start-leonardo.ps1 Status" -ForegroundColor White
    Write-Host "  .\start-leonardo.ps1 Test" -ForegroundColor White
    Write-Host ""
}

# Funcion principal
Write-LogMessage "Monitor Leonardo iniciado" "SUCCESS"
Write-LogMessage "Directorio: $LEONARDO_PATH" "INFO"
Write-LogMessage "Script Node.js: $NODE_SCRIPT" "INFO"

switch ($Action.ToLower()) {
    "start" {
        Write-LogMessage "Modo: INICIAR Y MONITOREAR" "SUCCESS"
        $started = Start-Leonardo
        if ($started) {
            Start-Monitoring
        } else {
            Write-LogMessage "No se pudo iniciar Leonardo" "ERROR"
            exit 1
        }
    }
    "monitor" {
        Write-LogMessage "Modo: SOLO MONITOREAR" "SUCCESS"
        Start-Monitoring
    }
    "status" {
        Write-LogMessage "Modo: MOSTRAR STATUS" "SUCCESS"
        Show-Status
        pause
    }
    "test" {
        Write-LogMessage "Modo: EJECUTAR TESTS" "SUCCESS"
        & node test-leonardo-system.js
    }
    "help" {
        Show-Help
    }
    default {
        Write-Host "Parametro no valido. Use Help para ver opciones." -ForegroundColor Yellow
        Show-Help
    }
}
