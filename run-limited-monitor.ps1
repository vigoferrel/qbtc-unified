# Script para ejecutar el monitor de métricas por tiempo limitado
param(
    [int]$DurationSeconds = 60
)

Write-Host "🚀 Ejecutando monitor de métricas por $DurationSeconds segundos..." -ForegroundColor Green

# Iniciar el proceso del monitor
$process = Start-Process -FilePath "node" -ArgumentList "monitor-metrics-optimization.js" -PassThru -WindowStyle Hidden

# Esperar el tiempo especificado
Start-Sleep -Seconds $DurationSeconds

# Terminar el proceso
if (!$process.HasExited) {
    $process.Kill()
    Write-Host "✅ Monitor detenido después de $DurationSeconds segundos" -ForegroundColor Yellow
} else {
    Write-Host "ℹ️  Monitor terminó antes del tiempo límite" -ForegroundColor Cyan
}

Write-Host "📊 Revisando métricas finales..." -ForegroundColor Green

# Hacer una consulta final a las métricas
try {
    $response = Invoke-WebRequest -Uri "http://localhost:18020/api/coherence-state" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "`n🎯 ESTADO FINAL DE MÉTRICAS:" -ForegroundColor Magenta
    Write-Host "   Consciousness: $($data.data.globalQuantumState.consciousness.ToString('F4'))" -ForegroundColor White
    Write-Host "   Coherence:     $($data.data.globalQuantumState.coherence.ToString('F4'))" -ForegroundColor White
    Write-Host "   Entropy:       $($data.data.globalQuantumState.entropy.ToString('F4'))" -ForegroundColor White
    Write-Host "   Energy:        $($data.data.globalQuantumState.energy.ToString('F4'))" -ForegroundColor White
    Write-Host "   Resonance:     $($data.data.globalQuantumState.resonance.ToString('F4'))" -ForegroundColor White
    Write-Host "   Alignment:     $($data.data.globalQuantumState.alignment.ToString('F4'))" -ForegroundColor White
    Write-Host "   Version:       $($data.data.globalQuantumState.version)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error obteniendo métricas finales: $($_.Exception.Message)" -ForegroundColor Red
}
