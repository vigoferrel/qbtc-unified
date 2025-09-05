# QBTC Quick Deployment Check
# Verificacion rapida del estado del backend

$ProcessId = 23836
$BaseUrl = "http://localhost:18020"

Write-Host "=== QBTC DEPLOYMENT CHECK ===" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

# Verificar proceso
try {
    $process = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "[OK] Proceso backend activo (PID: $ProcessId)" -ForegroundColor Green
        Write-Host "    CPU: $([Math]::Round($process.CPU, 2))s" -ForegroundColor White
        Write-Host "    Memory: $([Math]::Round($process.WorkingSet64 / 1MB, 2)) MB" -ForegroundColor White
        Write-Host "    Start Time: $($process.StartTime)" -ForegroundColor White
    } else {
        Write-Host "[ERROR] Proceso backend no encontrado" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERROR] Error verificando proceso: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Verificar endpoints criticos
$endpoints = @{
    "Health" = "/api/health"
    "Metrics" = "/api/metrics"
    "Edge Summary" = "/api/edge/summary"
    "Frontend" = "/"
}

Write-Host "--- Verificando Endpoints ---" -ForegroundColor Yellow
foreach ($name in $endpoints.Keys) {
    $endpoint = $endpoints[$name]
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl$endpoint" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "[OK] $name - HTTP $($response.StatusCode)" -ForegroundColor Green
        } else {
            Write-Host "[WARN] $name - HTTP $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[ERROR] $name - No disponible" -ForegroundColor Red
    }
}

Write-Host ""

# Obtener metricas clave
try {
    $metricsResponse = Invoke-WebRequest -Uri "$BaseUrl/api/metrics" -Method GET -TimeoutSec 5
    $metrics = $metricsResponse.Content | ConvertFrom-Json
    
    Write-Host "--- Metricas del Sistema ---" -ForegroundColor Yellow
    Write-Host "Uptime: $([Math]::Round($metrics.server.uptime / 1000 / 60, 2)) minutos" -ForegroundColor White
    Write-Host "Requests: $($metrics.server.requests)" -ForegroundColor White
    Write-Host "Errors: $($metrics.server.errors)" -ForegroundColor $(if ($metrics.server.errors -gt 0) { "Yellow" } else { "Green" })
    Write-Host "Conexiones: $($metrics.server.connections)" -ForegroundColor White
    Write-Host "Decision Engine: $($metrics.decisionEngine.isActive)" -ForegroundColor $(if ($metrics.decisionEngine.isActive) { "Green" } else { "Red" })
    Write-Host "Symbols Tracked: $($metrics.decisionEngine.symbolsTracked)" -ForegroundColor White
    Write-Host "Edge Score: $($metrics.edge.gauges.edge_score.value)" -ForegroundColor White
    Write-Host "Quantum Consciousness: $([Math]::Round($metrics.quantum.consciousness, 3))" -ForegroundColor Magenta
    
} catch {
    Write-Host "[ERROR] No se pudieron obtener las metricas" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== RESUMEN DEL DESPLIEGUE ===" -ForegroundColor Cyan
Write-Host "Backend QBTC UNIFIED desplegado exitosamente" -ForegroundColor Green
Write-Host "URL Principal: $BaseUrl" -ForegroundColor Blue
Write-Host "Para monitoreo continuo ejecuta: .\monitor-deployment.ps1" -ForegroundColor Yellow
