# ========================================================================
# QBTC-UNIFIED - TradingEngineLayer Monitor
# Script de monitoreo en tiempo real del TradingEngineLayer
# Compatible con Windows PowerShell - Solo ASCII
# ========================================================================

param(
    [int]$Interval = 30,
    [switch]$Continuous = $false,
    [switch]$ShowMetrics = $false,
    [switch]$ShowLogs = $false
)

# Configuracion
$ENDPOINT = "http://localhost:18020"
$LOG_FILE = ".\logs\trading-engine.log"

# Funcion para mostrar estado actual
function Show-SystemStatus {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  TRADING ENGINE MONITOR" -ForegroundColor Yellow
    Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    
    try {
        # Obtener estado de salud
        $health = Invoke-RestMethod -Uri "$ENDPOINT/api/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
        
        if ($health.success) {
            Write-Host "Sistema: ACTIVO" -ForegroundColor Green
            Write-Host "Tiempo activo: $([math]::Round($health.data.uptime / 60, 2)) minutos" -ForegroundColor Green
            
            # Mostrar componentes del sistema
            if ($health.data.system) {
                $system = $health.data.system
                Write-Host "Inicializado: $($system.initialized)" -ForegroundColor Green
                Write-Host "Ejecutandose: $($system.running)" -ForegroundColor Green
                if ($system.components) {
                    foreach ($comp in $system.components.PSObject.Properties) {
                        $status = if ($comp.Value -eq "ACTIVE") { "Green" } else { "Yellow" }
                        Write-Host "  $($comp.Name): $($comp.Value)" -ForegroundColor $status
                    }
                }
            }
        }
        
    } catch {
        Write-Host "Sistema: INACTIVO o ERROR" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Funcion para mostrar metricas detalladas
function Show-DetailedMetrics {
    try {
        $metrics = Invoke-RestMethod -Uri "$ENDPOINT/api/metrics" -Method GET -TimeoutSec 5 -ErrorAction Stop
        
        if ($metrics.success -and $metrics.data) {
            $data = $metrics.data
            
            Write-Host "`nMETRICA CUANTICA:" -ForegroundColor Magenta
            if ($data.system) {
                Write-Host "  Consciencia Global: $([math]::Round($data.system.globalConsciousness * 100, 2))%" -ForegroundColor Cyan
                Write-Host "  Coherencia: $([math]::Round($data.system.globalCoherence * 100, 2))%" -ForegroundColor Cyan
                Write-Host "  Resonancia Cuantica: $([math]::Round($data.system.quantumResonance, 2))" -ForegroundColor Cyan
                Write-Host "  Simbolos Activos: $($data.system.activeSymbols)/$($data.system.totalSymbols)" -ForegroundColor Cyan
                Write-Host "  Predicciones Totales: $($data.system.totalPredictions)" -ForegroundColor Cyan
            }
            
            Write-Host "`nFONDOS Y TRADING:" -ForegroundColor Yellow
            if ($data.funds) {
                Write-Host "  Balance: $($data.funds.balance)" -ForegroundColor Green
                Write-Host "  Ganancia Total: $($data.funds.totalProfit)" -ForegroundColor Green
                Write-Host "  Trades Activos: $($data.funds.activeTrades)" -ForegroundColor Green
                Write-Host "  Total Trades: $($data.funds.totalTrades)" -ForegroundColor Green
                if ($data.funds.totalTrades -gt 0) {
                    Write-Host "  Tasa de Victoria: $([math]::Round($data.funds.winRate * 100, 2))%" -ForegroundColor Green
                }
            }
            
            Write-Host "`nCACHE CUANTICO:" -ForegroundColor Blue
            if ($data.cache -and $data.cache.metrics) {
                $cacheData = $data.cache.metrics
                Write-Host "  Estado del Cache: $($data.cache.health.status)" -ForegroundColor Green
            }
            
        } else {
            Write-Host "No se pudieron obtener metricas detalladas" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "Error obteniendo metricas: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Funcion para mostrar logs recientes
function Show-RecentLogs {
    if (Test-Path $LOG_FILE) {
        Write-Host "`nLOGS RECIENTES:" -ForegroundColor Yellow
        $logs = Get-Content $LOG_FILE -Tail 8 -ErrorAction SilentlyContinue
        if ($logs) {
            foreach ($log in $logs) {
                if ($log -like "*ERROR*" -or $log -like "*ERR*") {
                    Write-Host "  $log" -ForegroundColor Red
                } elseif ($log -like "*WARN*") {
                    Write-Host "  $log" -ForegroundColor Yellow
                } elseif ($log -like "*INFO*") {
                    Write-Host "  $log" -ForegroundColor Gray
                } else {
                    Write-Host "  $log" -ForegroundColor White
                }
            }
        } else {
            Write-Host "  No hay logs disponibles" -ForegroundColor Gray
        }
    } else {
        Write-Host "`nArchivo de log no encontrado: $LOG_FILE" -ForegroundColor Yellow
    }
}

# MAIN - Procesamiento principal
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TRADING ENGINE LAYER MONITOR" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

if ($Continuous) {
    Write-Host "Iniciando monitoreo continuo (cada $Interval segundos)" -ForegroundColor Green
    Write-Host "Presione Ctrl+C para detener" -ForegroundColor Yellow
    
    while ($true) {
        Clear-Host
        Show-SystemStatus
        
        if ($ShowMetrics) {
            Show-DetailedMetrics
        }
        
        if ($ShowLogs) {
            Show-RecentLogs
        }
        
        Write-Host "`nSiguiente actualizacion en $Interval segundos..." -ForegroundColor Gray
        Start-Sleep -Seconds $Interval
    }
} else {
    # Mostrar una sola vez
    Show-SystemStatus
    
    if ($ShowMetrics) {
        Show-DetailedMetrics
    }
    
    if ($ShowLogs) {
        Show-RecentLogs
    }
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Monitor completado. Para monitoreo continuo:" -ForegroundColor Gray
    Write-Host "  .\monitor-trading-engine.ps1 -Continuous" -ForegroundColor Cyan
    Write-Host "  .\monitor-trading-engine.ps1 -Continuous -ShowMetrics -ShowLogs" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}
