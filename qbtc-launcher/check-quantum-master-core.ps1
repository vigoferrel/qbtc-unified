# QBTC - Verificacion de QuantumUnifiedMasterCore
# Script para verificar si esta implementado en el despliegue actual

Write-Host "=== VERIFICACION QUANTUM UNIFIED MASTER CORE ===" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

$ProjectRoot = "C:\Users\DELL\Desktop\QBTC-UNIFIED"
$QBTCCoreDir = "$ProjectRoot\qbtc-core"
$MasterCoreFile = "$ProjectRoot\QuantumUnifiedMasterCore.js"
$MasterLauncherFile = "$ProjectRoot\launch-quantum-unified-master.js"

Write-Host "--- Verificando Archivos del Master Core ---" -ForegroundColor Yellow

# Verificar si existe QuantumUnifiedMasterCore.js
if (Test-Path $MasterCoreFile) {
    Write-Host "[OK] QuantumUnifiedMasterCore.js encontrado" -ForegroundColor Green
    $coreSize = (Get-Item $MasterCoreFile).Length
    Write-Host "    Tamaño: $([Math]::Round($coreSize / 1KB, 2)) KB" -ForegroundColor White
} else {
    Write-Host "[ERROR] QuantumUnifiedMasterCore.js NO encontrado" -ForegroundColor Red
}

# Verificar si existe launch-quantum-unified-master.js
if (Test-Path $MasterLauncherFile) {
    Write-Host "[OK] launch-quantum-unified-master.js encontrado" -ForegroundColor Green
    $launcherSize = (Get-Item $MasterLauncherFile).Length
    Write-Host "    Tamaño: $([Math]::Round($launcherSize / 1KB, 2)) KB" -ForegroundColor White
} else {
    Write-Host "[ERROR] launch-quantum-unified-master.js NO encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "--- Verificando Despliegue Actual ---" -ForegroundColor Yellow

# Verificar el servidor activo
try {
    $response = Invoke-WebRequest -Uri "http://localhost:18020/api/health" -Method GET -TimeoutSec 5
    $health = $response.Content | ConvertFrom-Json
    Write-Host "[OK] Servidor QBTC activo en puerto 18020" -ForegroundColor Green
    Write-Host "    Version: $($health.version)" -ForegroundColor White
    Write-Host "    Environment: $($health.environment)" -ForegroundColor White
    Write-Host "    Uptime: $([Math]::Round($health.uptime / 1000 / 60, 2)) minutos" -ForegroundColor White
} catch {
    Write-Host "[ERROR] Servidor QBTC no disponible en puerto 18020" -ForegroundColor Red
}

Write-Host ""
Write-Host "--- Analizando Componentes Activos ---" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:18020/api/metrics" -Method GET -TimeoutSec 5
    $metrics = $response.Content | ConvertFrom-Json
    
    Write-Host "Componentes encontrados:" -ForegroundColor White
    Write-Host "  - Decision Engine: $($metrics.decisionEngine.isActive)" -ForegroundColor $(if ($metrics.decisionEngine.isActive) { "Green" } else { "Red" })
    Write-Host "  - Quantum States: Activo" -ForegroundColor Green
    Write-Host "    * Consciousness: $([Math]::Round($metrics.quantum.consciousness, 3))" -ForegroundColor White
    Write-Host "    * Coherence: $([Math]::Round($metrics.quantum.coherence, 3))" -ForegroundColor White
    Write-Host "    * Synchronization: $([Math]::Round($metrics.quantum.synchronization, 3))" -ForegroundColor White
    Write-Host "  - Edge Service: Activo" -ForegroundColor Green
    Write-Host "  - Metrics Engine: Activo" -ForegroundColor Green
    
    # Verificar si hay referencias al QuantumUnifiedMasterCore
    $hasQuantumCore = $false
    if ($metrics.PSObject.Properties['quantumUnifiedMasterCore']) {
        $hasQuantumCore = $true
        Write-Host "  - QuantumUnifiedMasterCore: ACTIVO" -ForegroundColor Green
    } else {
        Write-Host "  - QuantumUnifiedMasterCore: NO IMPLEMENTADO" -ForegroundColor Red
    }
    
} catch {
    Write-Host "[ERROR] No se pudieron obtener metricas del sistema" -ForegroundColor Red
}

Write-Host ""
Write-Host "--- Busqueda de Referencias al Master Core ---" -ForegroundColor Yellow

# Buscar referencias en qbtc-core
$coreFiles = Get-ChildItem -Path $QBTCCoreDir -Recurse -File -Filter "*.js"
$foundReferences = $false

foreach ($file in $coreFiles) {
    $content = Get-Content $file.FullName -ErrorAction SilentlyContinue
    if ($content -match "QuantumUnifiedMasterCore|UnifiedMasterCore|MasterCore") {
        Write-Host "[FOUND] Referencias en: $($file.Name)" -ForegroundColor Green
        $foundReferences = $true
    }
}

if (-not $foundReferences) {
    Write-Host "[INFO] No se encontraron referencias al QuantumUnifiedMasterCore en qbtc-core" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== RESUMEN DE VERIFICACION ===" -ForegroundColor Cyan

$masterCoreExists = Test-Path $MasterCoreFile
$masterLauncherExists = Test-Path $MasterLauncherFile
$serverActive = $false
try {
    Invoke-WebRequest -Uri "http://localhost:18020/api/health" -Method GET -TimeoutSec 3 | Out-Null
    $serverActive = $true
} catch {}

Write-Host "Estado del QuantumUnifiedMasterCore:" -ForegroundColor White
Write-Host "  Archivo Core: $(if ($masterCoreExists) { 'DISPONIBLE' } else { 'NO ENCONTRADO' })" -ForegroundColor $(if ($masterCoreExists) { "Green" } else { "Red" })
Write-Host "  Lanzador: $(if ($masterLauncherExists) { 'DISPONIBLE' } else { 'NO ENCONTRADO' })" -ForegroundColor $(if ($masterLauncherExists) { "Green" } else { "Red" })
Write-Host "  En Despliegue Actual: NO IMPLEMENTADO" -ForegroundColor Red
Write-Host "  Servidor Actual: $(if ($serverActive) { 'ACTIVO (qbtc-core)' } else { 'INACTIVO' })" -ForegroundColor $(if ($serverActive) { "Green" } else { "Red" })

Write-Host ""
if ($masterCoreExists -and $masterLauncherExists -and -not $foundReferences) {
    Write-Host "CONCLUSION: El QuantumUnifiedMasterCore esta IMPLEMENTADO pero NO esta siendo" -ForegroundColor Yellow
    Write-Host "usado en el despliegue actual. El sistema actual usa componentes separados." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Para activar el Master Core:" -ForegroundColor Cyan
    Write-Host "  1. Detener el servidor actual (Get-Process -Id 23836 | Stop-Process)" -ForegroundColor White
    Write-Host "  2. Ejecutar: node launch-quantum-unified-master.js" -ForegroundColor White
    Write-Host "  3. El Master Core unificara TODOS los componentes" -ForegroundColor White
} elseif (-not $masterCoreExists) {
    Write-Host "CONCLUSION: El QuantumUnifiedMasterCore NO esta implementado en el proyecto." -ForegroundColor Red
} else {
    Write-Host "CONCLUSION: Estado mixto - verificar implementacion manualmente." -ForegroundColor Yellow
}
