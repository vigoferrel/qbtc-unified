# =======================================================================
# 🌊 QBTC UNIFIED FRONTEND LAUNCHER - PRODUCTION MODE
# =======================================================================
# Sistema Frontend Unificado con conexión a Leonardo Consciousness
# Puerto: 3205 (Dashboard Principal)
# Leonardo Backend: Puerto 3003
# Sistema Unificado: Puerto 3203
# =======================================================================

param(
    [string]$Mode = "production",
    [string]$Port = "3205",
    [switch]$Background = $true
)

# Configuración ASCII compatible
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "  QBTC UNIFIED FRONTEND - PRODUCTION LAUNCHER" -ForegroundColor Yellow
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "  Sistema:      Frontend Unificado Leonardo Consciousness" -ForegroundColor White
Write-Host "  Puerto:       $Port (Dashboard Principal)" -ForegroundColor Green
Write-Host "  Backend:      http://localhost:3003 (Leonardo Consciousness)" -ForegroundColor Green
Write-Host "  Unificado:    http://localhost:3203 (Sistema Unificado)" -ForegroundColor Green
Write-Host "  Modo:         $Mode" -ForegroundColor Magenta
Write-Host "  Background:   $Background" -ForegroundColor Cyan
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Node.js está disponible
try {
    $nodeVersion = node --version
    Write-Host "Node.js Version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js no encontrado. Por favor instalar Node.js" -ForegroundColor Red
    exit 1
}

# Verificar directorio frontend-unified
$frontendPath = "C:\Users\DELL\Desktop\QBTC-UNIFIED\frontend-unified"
if (-not (Test-Path $frontendPath)) {
    Write-Host "ERROR: Directorio frontend-unified no encontrado: $frontendPath" -ForegroundColor Red
    exit 1
}

# Cambiar al directorio del frontend
Set-Location $frontendPath
Write-Host "Directorio actual: $(Get-Location)" -ForegroundColor Yellow

# Verificar archivos principales
$requiredFiles = @("index.html", "leonardo-consciousness.js", "leonardo-unified.js", "leonardo-unified.css")
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "WARNING: Archivo faltante: $file" -ForegroundColor Yellow
    } else {
        Write-Host "  OK: $file" -ForegroundColor Green
    }
}

# Crear servidor frontend optimizado
$serverScript = @"
const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = $Port;
const LEONARDO_BACKEND = 'http://localhost:3003';
const UNIFIED_BACKEND = 'http://localhost:3203';

// Middleware CORS
app.use(cors({
    origin: ['http://localhost:3003', 'http://localhost:3203', 'http://localhost:$Port'],
    credentials: true
}));

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Proxy para Leonardo Consciousness API
app.use('/api/leonardo', createProxyMiddleware({
    target: LEONARDO_BACKEND,
    changeOrigin: true,
    ws: true,
    pathRewrite: {
        '^/api/leonardo': '/api'
    },
    logLevel: 'warn',
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[LEONARDO PROXY] `+req.method+` `+req.url+` -> `+LEONARDO_BACKEND+req.url);
    },
    onError: (err, req, res) => {
        console.error(`[LEONARDO PROXY ERROR] `+err.message);
        res.status(503).json({ error: 'Leonardo backend unavailable' });
    }
}));

// Proxy para Sistema Unificado API
app.use('/api/unified', createProxyMiddleware({
    target: UNIFIED_BACKEND,
    changeOrigin: true,
    ws: true,
    pathRewrite: {
        '^/api/unified': '/api'
    },
    logLevel: 'warn',
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[UNIFIED PROXY] `+req.method+` `+req.url+` -> `+UNIFIED_BACKEND+req.url);
    },
    onError: (err, req, res) => {
        console.error(`[UNIFIED PROXY ERROR] `+err.message);
        res.status(503).json({ error: 'Unified backend unavailable' });
    }
}));

// Proxy directo para SSE streams
app.use('/stream', createProxyMiddleware({
    target: LEONARDO_BACKEND,
    changeOrigin: true,
    ws: true,
    logLevel: 'warn'
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        service: 'QBTC Unified Frontend',
        port: PORT,
        timestamp: new Date().toISOString(),
        backends: {
            leonardo: LEONARDO_BACKEND,
            unified: UNIFIED_BACKEND
        }
    });
});

// Fallback para SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Manejar errores de WebSocket
app.on('upgrade', (request, socket, head) => {
    console.log(`[WEBSOCKET] Upgrade request for: `+request.url);
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('='.repeat(70));
    console.log('  QBTC UNIFIED FRONTEND - ONLINE');
    console.log('='.repeat(70));
    console.log(`  Frontend URL:      http://localhost:`+PORT);
    console.log(`  Leonardo Backend:  `+LEONARDO_BACKEND);
    console.log(`  Unified Backend:   `+UNIFIED_BACKEND);
    console.log(`  Static Files:      `+__dirname);
    console.log('='.repeat(70));
    console.log('');
    console.log('  Sistema listo para trading cuantico Leonardo');
    console.log('  Conecta tu navegador a http://localhost:$Port');
    console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\\nShutting down QBTC Unified Frontend...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\\nTerminating QBTC Unified Frontend...');
    process.exit(0);
});
"@

# Escribir el script del servidor
$serverScript | Out-File -FilePath "frontend-server-production.js" -Encoding UTF8

# Instalar dependencias si es necesario
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias del frontend..." -ForegroundColor Yellow
    
    # Crear package.json optimizado
    $packageJson = @"
{
  "name": "qbtc-unified-frontend",
  "version": "1.0.0",
  "description": "QBTC Leonardo Consciousness Unified Frontend",
  "main": "frontend-server-production.js",
  "scripts": {
    "start": "node frontend-server-production.js",
    "dev": "node frontend-server-production.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "http-proxy-middleware": "^2.0.6",
    "cors": "^2.8.5"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
"@
    
    $packageJson | Out-File -FilePath "package.json" -Encoding UTF8
    
    Write-Host "Ejecutando npm install..." -ForegroundColor Yellow
    npm install --production
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: npm install falló" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "INICIANDO FRONTEND UNIFICADO..." -ForegroundColor Green
Write-Host ""

# Función para verificar si el puerto está en uso
function Test-Port {
    param([int]$Port)
    try {
        $listener = [System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties()
        $tcpListeners = $listener.GetActiveTcpListeners()
        return $tcpListeners | Where-Object { $_.Port -eq $Port }
    } catch {
        return $null
    }
}

# Verificar si el puerto está disponible
if (Test-Port $Port) {
    Write-Host "WARNING: Puerto $Port ya está en uso. Intentando terminar proceso..." -ForegroundColor Yellow
    Get-Process | Where-Object { $_.ProcessName -eq "node" } | Where-Object { $_.MainWindowTitle -like "*$Port*" } | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# Lanzar el servidor
if ($Background) {
    Write-Host "Lanzando frontend en segundo plano..." -ForegroundColor Cyan
    
    # Crear script de monitoreo
    $monitorScript = @"
`$process = Start-Process -FilePath "node" -ArgumentList "frontend-server-production.js" -PassThru -WindowStyle Hidden
`$processId = `$process.Id
Write-Host "Frontend Process ID: `$processId" -ForegroundColor Green

# Crear archivo de PID para seguimiento
`$processId | Out-File -FilePath "frontend.pid" -Encoding ASCII

# Monitorear el proceso
while (-not `$process.HasExited) {
    Start-Sleep -Seconds 30
    if (-not (Get-Process -Id `$processId -ErrorAction SilentlyContinue)) {
        Write-Host "Frontend process died, restarting..." -ForegroundColor Yellow
        `$process = Start-Process -FilePath "node" -ArgumentList "frontend-server-production.js" -PassThru -WindowStyle Hidden
        `$processId = `$process.Id
        `$processId | Out-File -FilePath "frontend.pid" -Encoding ASCII
    }
}
"@
    
    $monitorScript | Out-File -FilePath "monitor-frontend.ps1" -Encoding UTF8
    
    # Ejecutar el monitor en background
    Start-Process -FilePath "powershell.exe" -ArgumentList "-File monitor-frontend.ps1" -WindowStyle Hidden
    
    Write-Host ""
    Write-Host "=======================================================================" -ForegroundColor Green
    Write-Host "  FRONTEND UNIFICADO LANZADO EN SEGUNDO PLANO" -ForegroundColor Yellow
    Write-Host "=======================================================================" -ForegroundColor Green
    Write-Host "  URL Dashboard:    http://localhost:$Port" -ForegroundColor White
    Write-Host "  Health Check:     http://localhost:$Port/health" -ForegroundColor White
    Write-Host "  Leonardo API:     http://localhost:$Port/api/leonardo/" -ForegroundColor White
    Write-Host "  Sistema Unificado: http://localhost:$Port/api/unified/" -ForegroundColor White
    Write-Host "  PID File:         frontend.pid" -ForegroundColor Cyan
    Write-Host "  Monitor Script:   monitor-frontend.ps1" -ForegroundColor Cyan
    Write-Host "=======================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Para detener: Get-Content frontend.pid | Stop-Process" -ForegroundColor Yellow
    Write-Host ""
    
} else {
    Write-Host "Lanzando frontend en modo interactivo..." -ForegroundColor Cyan
    Write-Host ""
    
    # Ejecutar directamente
    node frontend-server-production.js
}
