# QBTC-UNIFIED - Script de Diagnóstico Simplificado
# Este script verifica el estado del sistema sin problemas de codificación

Write-Host "=== DIAGNOSTICO QBTC-UNIFIED ===" -ForegroundColor Cyan

# Verificar Node.js
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js no encontrado" -ForegroundColor Red
    exit 1
}

# Verificar archivos principales
$files = @(
    "enhanced-key-dashboard-server.js",
    "api-key-manager.js", 
    "credentials-integration.js",
    "quantum-core/CredentialsManager.js"
)

Write-Host "`n=== VERIFICANDO ARCHIVOS ===" -ForegroundColor Yellow
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
    }
}

# Verificar puerto 18020
Write-Host "`n=== VERIFICANDO PUERTO 18020 ===" -ForegroundColor Yellow
$portCheck = netstat -ano 2>$null | Select-String ":18020"
if ($portCheck) {
    Write-Host "⚠️ Puerto 18020 en uso:" -ForegroundColor Yellow
    Write-Host $portCheck
} else {
    Write-Host "✅ Puerto 18020 disponible" -ForegroundColor Green
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
        Write-Host "❌ $envFile no existe" -ForegroundColor Red
    }
}

Write-Host "`n=== OPCIONES DE INICIO ===" -ForegroundColor Cyan
Write-Host "1. node enhanced-key-dashboard-server.js" -ForegroundColor White
Write-Host "2. node dashboard-mock-server.js" -ForegroundColor White
Write-Host "3. node enhanced-mock-server.js" -ForegroundColor White
Write-Host "4. node mock-backend-server.js" -ForegroundColor White

Write-Host "`n=== COMANDOS DE PRUEBA ===" -ForegroundColor Cyan
Write-Host "curl http://localhost:18020/api/keys/status" -ForegroundColor White
Write-Host "curl http://localhost:18020/api/health" -ForegroundColor White
Write-Host "curl http://localhost:18020/api/dashboard/system" -ForegroundColor White

Write-Host "`nDiagnostico completado." -ForegroundColor Green
