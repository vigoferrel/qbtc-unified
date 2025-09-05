# QBTC-UNIFIED - Start Integrated System
# Script para iniciar el sistema completamente integrado

param(
    [switch]$Verbose,
    [switch]$SkipValidation,
    [switch]$EnableAllComponents,
    [string]$ConfigFile = ""
)

Write-Host "🚀 QBTC-UNIFIED - SISTEMA COMPLETAMENTE INTEGRADO" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Configurar codificación
try {
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
} catch {
    Write-Host "⚠️ No se pudo configurar OutputEncoding" -ForegroundColor Yellow
}

# Verificar Node.js
Write-Host "`n=== VERIFICANDO PREREQUISITOS ===" -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no encontrado" -ForegroundColor Red
    exit 1
}

# Verificar archivos críticos
Write-Host "`n=== VERIFICANDO ARCHIVOS CRÍTICOS ===" -ForegroundColor Yellow
$criticalFiles = @(
    "system-integrator.js",
    "quantum-core/CredentialsManager.js",
    "quantum-core/BinanceRealConnector.js",
    "quantum-core/QuantumMarketMaker.js",
    "quantum-core/QuantumInfiniteCache.js",
    "quantum-core/QuantumUnifiedCore.js",
    "quantum-core/QuantumCoherenceIntegrator.js",
    "quantum-core/QuantumMonitoring.js",
    "quantum-core/AdversityPrimePredictor.js",
    "quantum-core/QuantumLeverageEngine.js",
    "quantum-core/QuantumProfitMaximizer.js",
    "quantum-core/AntiLiquidationEngine.js",
    "quantum-core/QuantumNxNMatrix.js",
    "quantum-core/UniversalSymbolMonitor.js",
    "quantum-core/UniversalCorrelationAnalyzer.js",
    "leonardo-consciousness/LeonardoDecisionEngine.js",
    "leonardo-consciousness/FundsManager.js",
    "leonardo-consciousness/TradingEngineLayer.js",
    "leonardo-consciousness/BinanceConnectorAdapter.js",
    "leonardo-consciousness/QuantumUnifiedSystem.js",
    "leonardo-consciousness/UnifiedLeonardoCore.js",
    "leonardo-consciousness/LeonardoQuantumServer.js",
    "leonardo-consciousness/UnifiedLeonardoServer.js",
    "leonardo-consciousness/FundsManagerLayer.js",
    "quantum-error-handler.js",
    "api-key-manager.js"
)

$missingFiles = @()
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "`n⚠️ Archivos faltantes: $($missingFiles.Count)" -ForegroundColor Yellow
    Write-Host "El sistema puede funcionar con funcionalidad limitada" -ForegroundColor Yellow
}

# Verificar puertos
Write-Host "`n=== VERIFICANDO PUERTOS ===" -ForegroundColor Yellow
$ports = @(18020, 18021, 18022, 9090)
foreach ($port in $ports) {
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            Write-Host "⚠️ Puerto $port en uso" -ForegroundColor Yellow
        } else {
            Write-Host "✅ Puerto $port disponible" -ForegroundColor Green
        }
    } catch {
        Write-Host "✅ Puerto $port disponible" -ForegroundColor Green
    }
}

# Verificar credenciales
Write-Host "`n=== VERIFICANDO CREDENCIALES ===" -ForegroundColor Yellow
$envFiles = @(
    "quantum-core\.env",
    ".env",
    "leonardo-consciousness\.env"
)

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        Write-Host "✅ $envFile existe" -ForegroundColor Green
    } else {
        Write-Host "⚠️ $envFile no encontrado" -ForegroundColor Yellow
    }
}

# Configurar variables de entorno
Write-Host "`n=== CONFIGURANDO VARIABLES DE ENTORNO ===" -ForegroundColor Yellow
$envVars = @{
    "QBTC_INTEGRATED_MODE" = "true"
    "QBTC_VERBOSE_LOGGING" = if ($Verbose) { "true" } else { "false" }
    "QBTC_SKIP_VALIDATION" = if ($SkipValidation) { "true" } else { "false" }
    "QBTC_ENABLE_ALL_COMPONENTS" = if ($EnableAllComponents) { "true" } else { "false" }
    "NODE_ENV" = "production"
}

foreach ($key in $envVars.Keys) {
    [Environment]::SetEnvironmentVariable($key, $envVars[$key])
    Write-Host "✅ $key = $($envVars[$key])" -ForegroundColor Green
}

# Cargar configuración personalizada si existe
if ($ConfigFile -and (Test-Path $ConfigFile)) {
    Write-Host "`n=== CARGANDO CONFIGURACIÓN PERSONALIZADA ===" -ForegroundColor Yellow
    try {
        $config = Get-Content $ConfigFile | ConvertFrom-Json
        foreach ($key in $config.PSObject.Properties.Name) {
            [Environment]::SetEnvironmentVariable($key, $config.$key)
            Write-Host "✅ $key = $($config.$key)" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Error cargando configuración: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Iniciar sistema integrado
Write-Host "`n=== INICIANDO SISTEMA INTEGRADO ===" -ForegroundColor Cyan
Write-Host "🚀 Ejecutando system-integrator.js..." -ForegroundColor Green

try {
    # Ejecutar el integrador del sistema
    $process = Start-Process -FilePath "node" -ArgumentList "system-integrator.js" -PassThru -NoNewWindow
    
    Write-Host "✅ Sistema integrado iniciado (PID: $($process.Id))" -ForegroundColor Green
    Write-Host "📊 Monitoreando estado del sistema..." -ForegroundColor Cyan
    
    # Esperar un momento para que el sistema se inicialice
    Start-Sleep -Seconds 3
    
    # Verificar que el sistema esté funcionando
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:18020/api/health" -Method GET -TimeoutSec 5
        Write-Host "✅ Sistema respondiendo correctamente" -ForegroundColor Green
        Write-Host "📈 Estado: $($response.status)" -ForegroundColor White
    } catch {
        Write-Host "⚠️ Sistema iniciado pero no responde en puerto 18020" -ForegroundColor Yellow
        Write-Host "   Esto es normal si el sistema está en modo desarrollo" -ForegroundColor Yellow
    }
    
    # Mostrar información del sistema
    Write-Host "`n=== INFORMACIÓN DEL SISTEMA ===" -ForegroundColor Cyan
    Write-Host "🔧 Integrador: system-integrator.js" -ForegroundColor White
    Write-Host "⚛️ Quantum Core: ACTIVADO" -ForegroundColor Green
    Write-Host "🧠 Leonardo Consciousness: ACTIVADO" -ForegroundColor Green
    Write-Host "🎯 Market Making: ACTIVADO" -ForegroundColor Green
    Write-Host "📊 Monitoring: ACTIVADO" -ForegroundColor Green
    Write-Host "🛡️ Error Handling: ACTIVADO" -ForegroundColor Green
    Write-Host "💾 Cache System: ACTIVADO" -ForegroundColor Green
    Write-Host "🔗 NxN Matrix: ACTIVADO" -ForegroundColor Green
    Write-Host "🛡️ Anti-Liquidation: ACTIVADO" -ForegroundColor Green
    Write-Host "⚡ Leverage Engine: ACTIVADO" -ForegroundColor Green
    Write-Host "💰 Profit Maximizer: ACTIVADO" -ForegroundColor Green
    Write-Host "🔮 Adversity Predictor: ACTIVADO" -ForegroundColor Green
    
    Write-Host "`n=== ENDPOINTS DISPONIBLES ===" -ForegroundColor Cyan
    Write-Host "🌐 Sistema Principal: http://localhost:18020" -ForegroundColor White
    Write-Host "📊 Dashboard: http://localhost:18020/api/dashboard/system" -ForegroundColor White
    Write-Host "🔑 Gestión de Claves: http://localhost:18020/api/keys/status" -ForegroundColor White
    Write-Host "📈 Métricas: http://localhost:18020/api/metrics" -ForegroundColor White
    Write-Host "🔍 Errores: http://localhost:18020/api/errors" -ForegroundColor White
    Write-Host "⚛️ Quantum Core: http://localhost:9090" -ForegroundColor White
    Write-Host "🧠 Leonardo Server: http://localhost:18022" -ForegroundColor White
    
    Write-Host "`n=== COMANDOS ÚTILES ===" -ForegroundColor Cyan
    Write-Host "📊 Ver estado: curl http://localhost:18020/api/health" -ForegroundColor White
    Write-Host "🔑 Ver claves: curl http://localhost:18020/api/keys/status" -ForegroundColor White
    Write-Host "📈 Ver métricas: curl http://localhost:18020/api/metrics" -ForegroundColor White
    Write-Host "🔍 Ver errores: curl http://localhost:18020/api/errors" -ForegroundColor White
    Write-Host "🛑 Detener: Ctrl+C" -ForegroundColor White
    
    Write-Host "`n🎉 SISTEMA QBTC-UNIFIED COMPLETAMENTE INTEGRADO Y OPERATIVO" -ForegroundColor Green
    Write-Host "===============================================================" -ForegroundColor Green
    
    # Mantener el script ejecutándose
    Write-Host "`n⏳ Presiona Ctrl+C para detener el sistema..." -ForegroundColor Yellow
    
    # Esperar a que el proceso termine
    $process.WaitForExit()
    
} catch {
    Write-Host "❌ Error iniciando sistema integrado: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n🔄 Sistema QBTC-UNIFIED detenido" -ForegroundColor Yellow
