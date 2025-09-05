# Leonardo Consciousness System - Monitor Rápido
# Script PowerShell simple para demostrar el monitoreo

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                LEONARDO CONSCIOUSNESS MONITOR                    ║" -ForegroundColor Yellow
Write-Host "║                    Monitor de Sistema Rápido                    ║" -ForegroundColor Yellow
Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar procesos Node.js
Write-Host "═══ PROCESOS NODE.JS ═══" -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    foreach ($process in $nodeProcesses) {
        $memoryMB = [Math]::Round($process.WorkingSet64 / 1MB, 2)
        $uptime = (Get-Date) - $process.StartTime
        
        Write-Host "Proceso Node.js - PID: $($process.Id)" -ForegroundColor Green
        Write-Host "├─ Memoria: $memoryMB MB" -ForegroundColor White
        Write-Host "├─ Threads: $($process.Threads.Count)" -ForegroundColor Cyan
        Write-Host "├─ Handles: $($process.HandleCount)" -ForegroundColor Cyan
        Write-Host "└─ Uptime: $($uptime.Hours)h $($uptime.Minutes)m $($uptime.Seconds)s" -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host "No se encontraron procesos Node.js ejecutándose" -ForegroundColor Red
}

# Verificar puertos
Write-Host "═══ PUERTOS DE LEONARDO ═══" -ForegroundColor Yellow
$leonardoPorts = @(3003, 8080, 3000)
foreach ($port in $leonardoPorts) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "Puerto $port: ACTIVO (PID: $($connection.OwningProcess))" -ForegroundColor Green
    } else {
        Write-Host "Puerto $port: INACTIVO" -ForegroundColor Red
    }
}
Write-Host ""

# Verificar memoria del sistema
Write-Host "═══ MEMORIA DEL SISTEMA ═══" -ForegroundColor Yellow
$computerInfo = Get-ComputerInfo -Property TotalPhysicalMemory, AvailablePhysicalMemory -ErrorAction SilentlyContinue
if ($computerInfo) {
    $totalRAM = [Math]::Round($computerInfo.TotalPhysicalMemory / 1GB, 2)
    $availableRAM = [Math]::Round($computerInfo.AvailablePhysicalMemory / 1GB, 2)
    $usedRAM = $totalRAM - $availableRAM
    $usedPercent = [Math]::Round(($usedRAM / $totalRAM) * 100, 2)
    
    Write-Host "Total RAM: $totalRAM GB" -ForegroundColor White
    Write-Host "RAM Disponible: $availableRAM GB" -ForegroundColor Green
    Write-Host "RAM en Uso: $usedRAM GB ($usedPercent%)" -ForegroundColor $(if ($usedPercent -gt 80) { "Yellow" } else { "White" })
}
Write-Host ""

# Intentar probar la API de Leonardo
Write-Host "═══ TEST DE API LEONARDO ═══" -ForegroundColor Yellow
try {
    $startTime = Get-Date
    $response = Invoke-RestMethod -Uri "http://localhost:3003/api/status" -Method GET -TimeoutSec 5
    $responseTime = ((Get-Date) - $startTime).TotalMilliseconds
    
    Write-Host "API Leonardo: ACTIVA" -ForegroundColor Green
    Write-Host "├─ Tiempo de respuesta: $([Math]::Round($responseTime, 2)) ms" -ForegroundColor Cyan
    Write-Host "├─ Sistema ejecutándose: $($response.launcher.running)" -ForegroundColor White
    Write-Host "├─ Core Status: $($response.launcher.components.core)" -ForegroundColor White
    Write-Host "└─ HTTP Status: $($response.launcher.components.http)" -ForegroundColor White
} catch {
    Write-Host "API Leonardo: NO RESPONDE" -ForegroundColor Red
    Write-Host "├─ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "└─ El sistema Leonardo no está ejecutándose" -ForegroundColor Yellow
}
Write-Host ""

# Comandos útiles para monitoreo manual
Write-Host "═══ COMANDOS DE MONITOREO MANUAL ═══" -ForegroundColor Yellow
Write-Host "Para monitoreo continuo:"
Write-Host "  Get-Process -Name node | Format-Table -AutoSize" -ForegroundColor Green
Write-Host "  Get-NetTCPConnection -LocalPort 3003" -ForegroundColor Green
Write-Host "  Measure-Command { Invoke-RestMethod http://localhost:3003/api/status }" -ForegroundColor Green
Write-Host ""
Write-Host "Interface web: http://localhost:3003" -ForegroundColor Cyan
Write-Host ""
