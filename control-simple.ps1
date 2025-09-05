# ================================================================
# CONTROL SIMPLE - GESTION BASICA DEL SISTEMA QBTC
# ================================================================

param(
    [ValidateSet("status", "logs", "metrics", "health", "stop")]
    [string]$Action = "status"
)

# Variables
$BASE_PATH = $PSScriptRoot
$LOGS_PATH = Join-Path $BASE_PATH "logs"
$PIDS_PATH = Join-Path $BASE_PATH "pids"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "              QBTC UNIFIED - CONTROL SIMPLE" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

switch ($Action) {
    "status" {
        Write-Host "Estado del Sistema:" -ForegroundColor Yellow
        Write-Host ""
        
        # Verificar procesos Node.js activos
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        if ($nodeProcesses) {
            Write-Host "Procesos Node.js activos:" -ForegroundColor Green
            foreach ($proc in $nodeProcesses) {
                $uptime = (Get-Date) - $proc.StartTime
                $memoryMB = [Math]::Round($proc.WorkingSet64 / 1MB, 2)
                Write-Host "  PID: $($proc.Id) | Memoria: $memoryMB MB | Uptime: $($uptime.Hours)h $($uptime.Minutes)m" -ForegroundColor White
            }
        } else {
            Write-Host "No hay procesos Node.js ejecutandose" -ForegroundColor Red
        }
        
        Write-Host ""
        Write-Host "Puertos de acceso:" -ForegroundColor Cyan
        Write-Host "  - Leonardo: http://localhost:3003" -ForegroundColor White
        Write-Host "  - Frontend: http://localhost:8080" -ForegroundColor White
        Write-Host "  - Unified: http://localhost:3200" -ForegroundColor White
    }
    
    "logs" {
        Write-Host "Archivos de log disponibles:" -ForegroundColor Yellow
        if (Test-Path $LOGS_PATH) {
            $logFiles = Get-ChildItem -Path $LOGS_PATH -Filter "*.log" | Sort-Object LastWriteTime -Descending
            foreach ($log in $logFiles) {
                Write-Host "  - $($log.Name) (Modificado: $($log.LastWriteTime))" -ForegroundColor Cyan
            }
            
            if ($logFiles.Count -gt 0) {
                $latestLog = $logFiles[0]
                Write-Host ""
                Write-Host "Ultimas lineas del log mas reciente ($($latestLog.Name)):" -ForegroundColor Yellow
                Write-Host "================================================================" -ForegroundColor Gray
                Get-Content $latestLog.FullName -Tail 10
            }
        } else {
            Write-Host "No se encuentra el directorio de logs" -ForegroundColor Red
        }
    }
    
    "metrics" {
        Write-Host "Metricas del sistema:" -ForegroundColor Yellow
        if (Test-Path $LOGS_PATH) {
            $metricsFiles = Get-ChildItem -Path $LOGS_PATH -Filter "metrics-*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
            if ($metricsFiles) {
                try {
                    $metrics = Get-Content $metricsFiles.FullName | ConvertFrom-Json
                    Write-Host "Timestamp: $($metrics.Timestamp)" -ForegroundColor White
                    Write-Host "Entorno: $($metrics.Environment)" -ForegroundColor White
                    Write-Host "Trading Mode: $($metrics.TradingMode)" -ForegroundColor White
                } catch {
                    Write-Host "Error leyendo metricas: $($_.Exception.Message)" -ForegroundColor Red
                }
            } else {
                Write-Host "No se encontraron archivos de metricas" -ForegroundColor Red
            }
        }
    }
    
    "health" {
        Write-Host "Verificacion de salud de servicios:" -ForegroundColor Yellow
        
        $services = @{
            leonardo = 3003
            frontend = 8080
        }
        
        foreach ($service in $services.Keys) {
            $port = $services[$service]
            try {
                if ($service -eq "leonardo") {
                    $response = Invoke-RestMethod -Uri "http://localhost:$port/api/status" -Method GET -TimeoutSec 5
                    Write-Host "  $service (puerto $port): HEALTHY" -ForegroundColor Green
                } else {
                    $testConnection = Test-NetConnection -ComputerName "localhost" -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
                    if ($testConnection) {
                        Write-Host "  $service (puerto $port): HEALTHY" -ForegroundColor Green
                    } else {
                        Write-Host "  $service (puerto $port): UNHEALTHY" -ForegroundColor Red
                    }
                }
            } catch {
                Write-Host "  $service (puerto $port): UNHEALTHY - $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
    
    "stop" {
        Write-Host "Deteniendo todos los procesos Node.js..." -ForegroundColor Yellow
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        if ($nodeProcesses) {
            foreach ($proc in $nodeProcesses) {
                try {
                    Write-Host "Deteniendo PID: $($proc.Id)" -ForegroundColor White
                    $proc.Kill()
                } catch {
                    Write-Host "Error deteniendo PID $($proc.Id): $($_.Exception.Message)" -ForegroundColor Red
                }
            }
            Write-Host "Procesos detenidos" -ForegroundColor Green
        } else {
            Write-Host "No hay procesos Node.js para detener" -ForegroundColor Yellow
        }
    }
    
    default {
        Write-Host "Accion no reconocida: $Action" -ForegroundColor Red
        Write-Host "Acciones disponibles: status, logs, metrics, health, stop" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Comando completado" -ForegroundColor Green
Write-Host ""
