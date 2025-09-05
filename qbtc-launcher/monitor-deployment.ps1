# QBTC Deployment Monitor
# Monitoreo de metricas y logs del despliegue en segundo plano

$ProcessId = 23836  # Backend QBTC en puerto 18020
$LogPath = "C:\Users\DELL\Desktop\QBTC-UNIFIED\qbtc-launcher"
$OutputLog = "$LogPath\deploy-output.log"
$ErrorLog = "$LogPath\deploy-error.log"
$MetricsLog = "$LogPath\deployment-metrics.log"

Write-Host "=== QBTC DEPLOYMENT MONITOR ===" -ForegroundColor Cyan
Write-Host "Proceso ID: $ProcessId" -ForegroundColor Green
Write-Host "Directorio: $LogPath" -ForegroundColor Green
Write-Host ""

function Get-ProcessMetrics {
    param($PID)
    
    try {
        $process = Get-Process -Id $PID -ErrorAction SilentlyContinue
        if ($process) {
            $cpuPercent = [Math]::Round((Get-WmiObject Win32_Process -Filter "ProcessId = $PID").PageFileUsage / 1024, 2)
            
            return @{
                Status = "Running"
                CPU = $process.CPU
                Memory = [Math]::Round($process.WorkingSet64 / 1MB, 2)
                Handles = $process.Handles
                Threads = $process.Threads.Count
                StartTime = $process.StartTime
            }
        }
        else {
            return @{ Status = "Not Running" }
        }
    }
    catch {
        return @{ Status = "Error: $($_.Exception.Message)" }
    }
}

function Test-ServiceEndpoints {
    $baseUrl = "http://localhost:18020"
    $endpoints = @(
        "/api/health",
        "/api/metrics", 
        "/api/edge/summary"
    )
    
    Write-Host "--- Verificando endpoints del servicio ---" -ForegroundColor Yellow
    
    foreach ($endpoint in $endpoints) {
        try {
            $response = Invoke-WebRequest -Uri "$baseUrl$endpoint" -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host "[OK] $endpoint - Status: $($response.StatusCode)" -ForegroundColor Green
            }
            else {
                Write-Host "[WARN] $endpoint - Status: $($response.StatusCode)" -ForegroundColor Yellow
            }
        }
        catch {
            Write-Host "[ERROR] $endpoint - No disponible" -ForegroundColor Red
        }
    }
    Write-Host ""
}

function Show-RecentLogs {
    Write-Host "--- Ultimos logs (Output) ---" -ForegroundColor Yellow
    if (Test-Path $OutputLog) {
        $content = Get-Content $OutputLog -Tail 10 -ErrorAction SilentlyContinue
        if ($content) {
            $content | ForEach-Object { Write-Host $_ -ForegroundColor White }
        } else {
            Write-Host "Sin logs de output disponibles" -ForegroundColor Gray
        }
    } else {
        Write-Host "Archivo de log output no encontrado" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "--- Ultimos logs (Error) ---" -ForegroundColor Yellow
    if (Test-Path $ErrorLog) {
        $content = Get-Content $ErrorLog -Tail 10 -ErrorAction SilentlyContinue
        if ($content) {
            $content | ForEach-Object { Write-Host $_ -ForegroundColor Red }
        } else {
            Write-Host "Sin logs de error disponibles" -ForegroundColor Gray
        }
    } else {
        Write-Host "Archivo de log error no encontrado" -ForegroundColor Gray
    }
    Write-Host ""
}

# Ejecucion principal
while ($true) {
    Clear-Host
    Write-Host "=== QBTC DEPLOYMENT MONITOR ===" -ForegroundColor Cyan
    Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
    Write-Host ""
    
    # Metricas del proceso
    $metrics = Get-ProcessMetrics -PID $ProcessId
    Write-Host "--- Metricas del Proceso ---" -ForegroundColor Yellow
    Write-Host "Estado: $($metrics.Status)" -ForegroundColor $(if ($metrics.Status -eq "Running") { "Green" } else { "Red" })
    
    if ($metrics.Status -eq "Running") {
        Write-Host "CPU Time: $([Math]::Round($metrics.CPU, 2))s" -ForegroundColor White
        Write-Host "Memory: $($metrics.Memory) MB" -ForegroundColor White
        Write-Host "Handles: $($metrics.Handles)" -ForegroundColor White
        Write-Host "Threads: $($metrics.Threads)" -ForegroundColor White
        Write-Host "Start Time: $($metrics.StartTime)" -ForegroundColor White
        
        # Guardar metricas
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        "$timestamp - CPU: $([Math]::Round($metrics.CPU, 2))s, Memory: $($metrics.Memory)MB, Status: Running" | Out-File -FilePath $MetricsLog -Append -Encoding ASCII
    }
    Write-Host ""
    
    # Verificar endpoints
    Test-ServiceEndpoints
    
    # Mostrar logs recientes
    Show-RecentLogs
    
    Write-Host "--- Controles ---" -ForegroundColor Cyan
    Write-Host "Presiona 'q' para salir, cualquier otra tecla para actualizar..." -ForegroundColor Gray
    
    $key = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    if ($key.Character -eq 'q') {
        break
    }
    
    Start-Sleep -Seconds 2
}

Write-Host "Monitor terminado." -ForegroundColor Green
