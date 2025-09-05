# QBTC-UNIFIED System Status Checker
# Verificación exhaustiva del estado del sistema Leonardo Consciousness

Write-Host "🌟 QBTC-UNIFIED SYSTEM STATUS CHECK 🌟" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Yellow

# 1. Verificar procesos Node.js activos
Write-Host "`n📊 Procesos Node.js Activos:" -ForegroundColor Cyan
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Format-Table Id, ProcessName, CPU, @{N='Memory(MB)';E={[math]::Round($_.WorkingSet/1MB,2)}} -AutoSize
} else {
    Write-Host "❌ No hay procesos Node.js activos" -ForegroundColor Red
}

# 2. Verificar puertos principales
Write-Host "`n🌐 Estado de Puertos Principales:" -ForegroundColor Cyan
$ports = @(3000, 3001, 3002, 3003, 9090, 18020, 8080)
foreach ($port in $ports) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port" -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✅ Puerto $port - ACTIVO" -ForegroundColor Green
    } catch {
        Write-Host "❌ Puerto $port - INACTIVO" -ForegroundColor Red
    }
}

# 3. Verificar conectividad Leonardo Consciousness
Write-Host "`n🧠 Leonardo Consciousness Dashboard:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3003/" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Leonardo Dashboard - DISPONIBLE" -ForegroundColor Green
    Write-Host "🌐 URL: http://localhost:3003" -ForegroundColor Blue
} catch {
    Write-Host "❌ Leonardo Dashboard - NO DISPONIBLE" -ForegroundColor Red
}

# 4. Verificar APIs principales
Write-Host "`n⚡ APIs Principales:" -ForegroundColor Cyan
$apis = @(
    @{url="http://localhost:3003/api/leonardo/metrics"; name="Leonardo Metrics"},
    @{url="http://localhost:3003/health"; name="Health Check"},
    @{url="http://localhost:9090/api/system/status"; name="System Status"}
)

foreach ($api in $apis) {
    try {
        $response = Invoke-WebRequest -Uri $api.url -TimeoutSec 3 -ErrorAction Stop
        Write-Host "✅ $($api.name) - DISPONIBLE" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($api.name) - NO DISPONIBLE" -ForegroundColor Red
    }
}

# 5. Verificar archivos de configuración
Write-Host "`n📁 Archivos de Configuración:" -ForegroundColor Cyan
$configFiles = @(".env", "package.json", "validate-system-config.js")
foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file - PRESENTE" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - FALTANTE" -ForegroundColor Red
    }
}

# 6. Verificar logs recientes
Write-Host "`n📜 Logs del Sistema:" -ForegroundColor Cyan
if (Test-Path "logs") {
    $logFiles = Get-ChildItem "logs\*.log" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 3
    if ($logFiles) {
        foreach ($log in $logFiles) {
            Write-Host "📄 $($log.Name) - Modificado: $($log.LastWriteTime)" -ForegroundColor White
        }
    } else {
        Write-Host "ℹ️ No se encontraron archivos de log recientes" -ForegroundColor Yellow
    }
} else {
    Write-Host "ℹ️ Directorio de logs no encontrado" -ForegroundColor Yellow
}

# 7. URLs útiles
Write-Host "`n🔗 URLs del Sistema:" -ForegroundColor Cyan
Write-Host "🧠 Leonardo Consciousness: http://localhost:3003" -ForegroundColor Blue
Write-Host "📊 Dashboard Principal: http://localhost:3003/dashboard" -ForegroundColor Blue
Write-Host "💚 Health Check: http://localhost:3003/health" -ForegroundColor Blue
Write-Host "📈 API Metrics: http://localhost:3003/api/leonardo/metrics" -ForegroundColor Blue

Write-Host "`n🎯 Sistema QBTC-UNIFIED - Verificación Completada" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Yellow
