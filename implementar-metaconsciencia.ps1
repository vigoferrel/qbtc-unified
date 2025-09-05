# IMPLEMENTACION AUTOMATICA DE LA METACONSCIENCIA
# PowerShell - Una sola orden que lo activa todo

Write-Host "=== IMPLEMENTANDO METACONSCIENCIA ESENCIAL ===" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js no encontrado. Instala Node.js primero." -ForegroundColor Red
    exit 1
}

# Verificar/Instalar PM2
Write-Host "Verificando PM2..." -ForegroundColor Yellow
try {
    pm2 --version | Out-Null
    Write-Host "PM2 encontrado" -ForegroundColor Green
} catch {
    Write-Host "Instalando PM2..." -ForegroundColor Blue
    npm install -g pm2
}

# Cambiar al directorio QBTC-UNIFIED
Set-Location "C:\Users\DELL\Desktop\QBTC-UNIFIED"

# Instalar dependencias si no existen
Write-Host "Verificando dependencias..." -ForegroundColor Yellow
if (!(Test-Path "node_modules") -or !(Test-Path "package.json")) {
    Write-Host "Inicializando proyecto Node.js..." -ForegroundColor Blue
    npm init -y
    
    Write-Host "Instalando dependencias esenciales..." -ForegroundColor Blue
    npm install express
    
    Write-Host "Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "Dependencias ya presentes" -ForegroundColor Green
}

# Verificar archivo de la metaconsciencia
Write-Host "Verificando metaconsciencia.cjs..." -ForegroundColor Yellow
if (!(Test-Path "metaconsciencia.cjs")) {
    Write-Host "ERROR: Archivo metaconsciencia.cjs no encontrado." -ForegroundColor Red
    Write-Host "INFO: Asegurate de que el archivo exista en el directorio actual." -ForegroundColor Yellow
    exit 1
}

Write-Host "Archivo metaconsciencia.cjs encontrado" -ForegroundColor Green

# Detener instancia anterior si existe
Write-Host "Deteniendo instancias anteriores..." -ForegroundColor Yellow
try {
    pm2 stop metaconsciencia 2>$null
    pm2 delete metaconsciencia 2>$null
} catch {
    # Ignorar errores si no existe
}

# Configurar PM2
Write-Host "Configurando PM2..." -ForegroundColor Yellow

# Crear archivo de configuración ecosystem
$ecosystemConfig = @"
module.exports = {
  apps: [{
    name: 'metaconsciencia',
    script: './metaconsciencia.cjs',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 15000
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/metaconsciencia-error.log',
    out_file: './logs/metaconsciencia-out.log',
    log_file: './logs/metaconsciencia-combined.log'
  }]
};
"@

$ecosystemConfig | Out-File -FilePath "ecosystem.config.js" -Encoding UTF8

# Crear directorio de logs
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Name "logs"
}

# Lanzar con PM2
Write-Host "Lanzando MetaConsciencia con PM2..." -ForegroundColor Green
pm2 start ecosystem.config.js

# Guardar configuración PM2
pm2 save

# Configurar arranque automático del sistema (opcional)
Write-Host "⚡ Configurando arranque automático..." -ForegroundColor Yellow
try {
    pm2 startup
} catch {
    Write-Host "ℹ️ Configurar arranque automático manualmente si se desea" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 === METACONSCIENCIA IMPLEMENTADA EXITOSAMENTE ===" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Estado del proceso:" -ForegroundColor Cyan
pm2 list

Write-Host ""
Write-Host "🔗 Endpoints disponibles:" -ForegroundColor Cyan
Write-Host "   🏥 Health Check: http://localhost:15000/health" -ForegroundColor White
Write-Host "   📊 Metrics:     http://localhost:15000/metrics" -ForegroundColor White

Write-Host ""
Write-Host "📋 Comandos útiles:" -ForegroundColor Cyan
Write-Host "   pm2 logs metaconsciencia    # Ver logs en tiempo real" -ForegroundColor White
Write-Host "   pm2 restart metaconsciencia # Reiniciar" -ForegroundColor White
Write-Host "   pm2 stop metaconsciencia    # Detener" -ForegroundColor White
Write-Host "   pm2 delete metaconsciencia  # Eliminar completamente" -ForegroundColor White
Write-Host "   pm2 monit                   # Monitor en tiempo real" -ForegroundColor White

Write-Host ""
Write-Host "✨ La MetaConsciencia está DESPIERTA y gobernando el sistema QBTC-UNIFIED" -ForegroundColor Magenta
Write-Host "💫 Ciclo vital: cada 10 segundos" -ForegroundColor Magenta
Write-Host "🧠 Puerto: 15000" -ForegroundColor Magenta
Write-Host ""

# Test rápido
Write-Host "🧪 Realizando test de salud..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:15000/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Test de salud exitoso:" -ForegroundColor Green
    Write-Host $healthResponse.Content -ForegroundColor White
} catch {
    Write-Host "⚠️ Test de salud no pudo completarse - verificar manualmente" -ForegroundColor Yellow
    Write-Host "💡 Ejecuta: curl http://localhost:15000/health" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🌟 MetaConsciencia ACTIVA. El sistema trasciende." -ForegroundColor Magenta
