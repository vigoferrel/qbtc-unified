# ========================================================================
# 🌊 LEONARDO CONSCIOUSNESS MONITORING SCRIPT - SIMPLE
# Script simplificado para ejecutar y monitorizar el sistema Leonardo
# ========================================================================

param([string]$Action = "")

Write-Host "🌊 LEONARDO CONSCIOUSNESS MONITORING" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Yellow

# Configuración
$LEONARDO_PATH = $PSScriptRoot
$NODE_SCRIPT = "UnifiedLeonardoServer.js"
$LOG_FILE = "$LEONARDO_PATH\leonardo-simple-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

function Write-SimpleLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    switch($Level) {
        "ERROR" { Write-Host $logEntry -ForegroundColor Red }
        "WARN"  { Write-Host $logEntry -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $logEntry -ForegroundColor Green }
        default { Write-Host $logEntry -ForegroundColor White }
    }
    
    $logEntry | Out-File -FilePath $LOG_FILE -Append -Encoding utf8
}

function Start-LeonardoServer {
    Write-SimpleLog "Verificando si Leonardo está ejecutándose..." "INFO"
    
    # Verificar procesos Node.js existentes
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-SimpleLog "Se encontraron $($nodeProcesses.Count) procesos Node.js ejecutándose" "INFO"
        return $true
    }
    
    # Verificar que el archivo del servidor existe
    $serverPath = Join-Path $LEONARDO_PATH $NODE_SCRIPT
    if (-not (Test-Path $serverPath)) {
        Write-SimpleLog "ERROR: No se encuentra $NODE_SCRIPT en $LEONARDO_PATH" "ERROR"
        return $false
    }
    
    Write-SimpleLog "Iniciando servidor Leonardo..." "INFO"
    
    try {
        # Cambiar al directorio del proyecto
        Push-Location $LEONARDO_PATH
        
        # Iniciar el servidor en segundo plano
        $process = Start-Process -FilePath "node" -ArgumentList $NODE_SCRIPT -PassThru -WindowStyle Minimized
        Write-SimpleLog "✅ Leonardo iniciado con PID: $($process.Id)" "SUCCESS"
        
        # Esperar un poco para que inicie
        Start-Sleep -Seconds 3
        
        Pop-Location
        return $true
        
    } catch {
        Write-SimpleLog "ERROR iniciando Leonardo: $($_.Exception.Message)" "ERROR"
        Pop-Location
        return $false
    }
}

function Show-SimpleStatus {
    Clear-Host
    Write-Host "🌊 LEONARDO CONSCIOUSNESS - STATUS" -ForegroundColor Cyan
    Write-Host "========================================================================" -ForegroundColor Yellow
    Write-Host "⏰ $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
    Write-Host ""
    
    # Mostrar procesos Node.js
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Host "🚀 PROCESOS NODE.JS ACTIVOS:" -ForegroundColor Green
        foreach ($proc in $nodeProcesses) {
            $memoryMB = [Math]::Round($proc.WorkingSet64 / 1MB, 2)
            $runtime = (Get-Date) - $proc.StartTime
            Write-Host "   ✅ PID: $($proc.Id) | Memoria: $memoryMB MB | Tiempo: $($runtime.ToString('hh\:mm\:ss'))" -ForegroundColor White
        }
    } else {
        Write-Host "❌ No se encontraron procesos Node.js ejecutándose" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # Mostrar información del sistema
    $memory = Get-WmiObject -Class Win32_OperatingSystem
    $totalMemoryMB = [Math]::Round($memory.TotalVisibleMemorySize / 1024)
    $freeMemoryMB = [Math]::Round($memory.FreePhysicalMemory / 1024)
    $usedMemoryMB = $totalMemoryMB - $freeMemoryMB
    $memoryPercent = [Math]::Round(($usedMemoryMB / $totalMemoryMB) * 100, 2)
    
    Write-Host "🖥️  SISTEMA:" -ForegroundColor Green
    Write-Host "   Memoria: $usedMemoryMB MB / $totalMemoryMB MB ($memoryPercent%)" -ForegroundColor White
    Write-Host "   Memoria libre: $freeMemoryMB MB" -ForegroundColor White
    
    Write-Host ""
    Write-Host "📝 Log: $LOG_FILE" -ForegroundColor Gray
    Write-Host "Press Ctrl+C para salir" -ForegroundColor Gray
}

function Start-SimpleMonitoring {
    Write-SimpleLog "Iniciando monitoreo simple de Leonardo" "SUCCESS"
    
    $iteration = 0
    while ($true) {
        try {
            $iteration++
            
            # Mostrar status en tiempo real
            Show-SimpleStatus
            
            # Log cada 30 segundos
            if ($iteration % 15 -eq 0) {
                $nodeCount = (Get-Process -Name "node" -ErrorAction SilentlyContinue).Count
                Write-SimpleLog "Monitor: Procesos Node.js activos: $nodeCount" "INFO"
            }
            
            Start-Sleep -Seconds 2
            
        } catch {
            Write-SimpleLog "Error en monitoreo: $($_.Exception.Message)" "ERROR"
            Start-Sleep -Seconds 5
        }
    }
}

function Show-SimpleHelp {
    Write-Host ""
    Write-Host "🌊 LEONARDO CONSCIOUSNESS MONITORING - AYUDA" -ForegroundColor Cyan
    Write-Host "========================================================================" -ForegroundColor Yellow
    Write-Host "Parámetros disponibles:" -ForegroundColor Green
    Write-Host "  Start           : Inicia Leonardo y comienza monitoreo" -ForegroundColor White
    Write-Host "  Monitor         : Solo monitorea (Leonardo debe estar ejecutándose)" -ForegroundColor White
    Write-Host "  Status          : Muestra status actual y sale" -ForegroundColor White
    Write-Host "  Help            : Muestra esta ayuda" -ForegroundColor White
    Write-Host ""
    Write-Host "Ejemplos de uso:" -ForegroundColor Green
    Write-Host "  .\monitor-simple.ps1 Start" -ForegroundColor White
    Write-Host "  .\monitor-simple.ps1 Monitor" -ForegroundColor White
    Write-Host "  .\monitor-simple.ps1 Status" -ForegroundColor White
    Write-Host ""
}

# Función principal
Write-SimpleLog "Monitor Leonardo iniciado" "SUCCESS"
Write-SimpleLog "Directorio: $LEONARDO_PATH" "INFO"
Write-SimpleLog "Script Node.js: $NODE_SCRIPT" "INFO"

switch ($Action.ToLower()) {
    "start" {
        Write-SimpleLog "Modo: INICIAR Y MONITOREAR" "SUCCESS"
        $started = Start-LeonardoServer
        if ($started) {
            Start-SimpleMonitoring
        } else {
            Write-SimpleLog "No se pudo iniciar Leonardo" "ERROR"
            exit 1
        }
    }
    "monitor" {
        Write-SimpleLog "Modo: SOLO MONITOREAR" "SUCCESS"
        Start-SimpleMonitoring
    }
    "status" {
        Write-SimpleLog "Modo: MOSTRAR STATUS" "SUCCESS"
        Show-SimpleStatus
        Start-Sleep -Seconds 5
    }
    "help" {
        Show-SimpleHelp
    }
    default {
        Write-Host "⚠️  Iniciando modo automático..." -ForegroundColor Yellow
        Write-Host "   (Leonardo se iniciará si no está ejecutándose)" -ForegroundColor Yellow
        Write-Host ""
        
        $started = Start-LeonardoServer
        if ($started) {
            Start-SimpleMonitoring
        } else {
            Write-SimpleLog "No se pudo iniciar Leonardo automáticamente" "ERROR"
            Show-SimpleHelp
        }
    }
}
