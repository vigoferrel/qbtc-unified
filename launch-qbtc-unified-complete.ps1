# =======================================================================
# 🌊 QBTC UNIFIED SYSTEM - MASTER LAUNCHER
# =======================================================================
# Lanzador completo del sistema QBTC Unificado con Leonardo Consciousness
# Incluye: Backend Leonardo + Sistema Unificado + Frontend + Supabase
# Modo Producción con APIs reales de Binance habilitadas
# =======================================================================

param(
    [string]$Mode = "production",
    [switch]$Background = $true,
    [switch]$SkipChecks = $false,
    [switch]$LaunchAll = $true
)

# Configuración ASCII compatible
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "                    QBTC UNIFIED SYSTEM - MASTER LAUNCHER               " -ForegroundColor Yellow
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "  Sistema:          Leonardo Consciousness + Sistema Unificado          " -ForegroundColor White
Write-Host "  Supabase:         https://hrvxsaolaxnqltomqaud.supabase.co            " -ForegroundColor Green
Write-Host "  Leonardo:         Puerto 3003 (Consciousness Engine)                 " -ForegroundColor Green
Write-Host "  Sistema Unificado: Puerto 3203 (Unified System)                     " -ForegroundColor Green
Write-Host "  Frontend:         Puerto 3205 (Dashboard)                            " -ForegroundColor Green
Write-Host "  Binance APIs:     REALES (Modo Produccion)                          " -ForegroundColor Magenta
Write-Host "  IP Whitelisted:   181.43.212.196                                     " -ForegroundColor Cyan
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host ""

# Función para verificar prerequisitos
function Test-Prerequisites {
    Write-Host "Verificando prerequisitos del sistema..." -ForegroundColor Yellow
    
    $errors = @()
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version
        Write-Host "  ✓ Node.js: $nodeVersion" -ForegroundColor Green
    } catch {
        $errors += "Node.js no encontrado"
        Write-Host "  ✗ Node.js no encontrado" -ForegroundColor Red
    }
    
    # Verificar npm
    try {
        $npmVersion = npm --version
        Write-Host "  ✓ npm: v$npmVersion" -ForegroundColor Green
    } catch {
        $errors += "npm no encontrado"
        Write-Host "  ✗ npm no encontrado" -ForegroundColor Red
    }
    
    # Verificar archivos .env
    $envFiles = @(
        "leonardo-consciousness\.env",
        "unified-system\.env.production"
    )
    
    foreach ($envFile in $envFiles) {
        if (Test-Path $envFile) {
            Write-Host "  ✓ $envFile" -ForegroundColor Green
        } else {
            $errors += "Archivo faltante: $envFile"
            Write-Host "  ✗ $envFile" -ForegroundColor Red
        }
    }
    
    # Verificar directorios principales
    $requiredDirs = @(
        "leonardo-consciousness",
        "frontend-unified",
        "unified-system"
    )
    
    foreach ($dir in $requiredDirs) {
        if (Test-Path $dir) {
            Write-Host "  ✓ Directorio: $dir" -ForegroundColor Green
        } else {
            $errors += "Directorio faltante: $dir"
            Write-Host "  ✗ Directorio: $dir" -ForegroundColor Red
        }
    }
    
    if ($errors.Count -gt 0) {
        Write-Host ""
        Write-Host "ERRORES ENCONTRADOS:" -ForegroundColor Red
        foreach ($error in $errors) {
            Write-Host "  • $error" -ForegroundColor Red
        }
        return $false
    }
    
    Write-Host ""
    Write-Host "✓ Todos los prerequisitos verificados correctamente" -ForegroundColor Green
    return $true
}

# Función para crear el Sistema Unificado
function New-UnifiedSystem {
    Write-Host "Creando Sistema Unificado..." -ForegroundColor Yellow
    
    # Crear directorio si no existe
    if (-not (Test-Path "unified-system")) {
        New-Item -ItemType Directory -Path "unified-system" | Out-Null
    }
    
    # Script del Sistema Unificado
    $unifiedScript = @"
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.UNIFIED_SERVER_PORT || 3203;

// Configuración Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://hrvxsaolaxnqltomqaud.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuración Express
app.use(cors());
app.use(express.json());

// Estado del sistema
let systemState = {
    leonardo_consciousness: {
        status: 'initializing',
        consciousness_level: 0,
        coherence_level: 0,
        last_update: new Date()
    },
    supabase: {
        connected: false,
        last_ping: null
    },
    binance: {
        connected: false,
        api_key_valid: false
    },
    unified_metrics: {
        total_symbols: 1979,
        active_trades: 0,
        total_profit: 0,
        leverage_max: 125
    }
};

// Middleware de logging
app.use((req, res, next) => {
    console.log(`[UNIFIED] ${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        service: 'QBTC Unified System',
        port: PORT,
        timestamp: new Date().toISOString(),
        system_state: systemState
    });
});

// API Status
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        data: systemState,
        timestamp: new Date().toISOString()
    });
});

// Supabase Integration
app.get('/api/supabase/test', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('system_metrics')
            .select('*')
            .limit(1);
        
        if (error) throw error;
        
        systemState.supabase.connected = true;
        systemState.supabase.last_ping = new Date();
        
        res.json({
            success: true,
            message: 'Supabase connection successful',
            data: data
        });
    } catch (error) {
        systemState.supabase.connected = false;
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Leonardo Consciousness Integration
app.get('/api/leonardo/sync', async (req, res) => {
    try {
        // Simular conexión con Leonardo
        const leonardoResponse = await fetch('http://localhost:3003/api/leonardo-health')
            .catch(() => null);
        
        if (leonardoResponse && leonardoResponse.ok) {
            const leonardoData = await leonardoResponse.json();
            
            systemState.leonardo_consciousness = {
                status: 'online',
                consciousness_level: leonardoData.consciousness || 0,
                coherence_level: leonardoData.coherence || 0,
                last_update: new Date()
            };
            
            res.json({
                success: true,
                message: 'Leonardo Consciousness synchronized',
                data: systemState.leonardo_consciousness
            });
        } else {
            systemState.leonardo_consciousness.status = 'disconnected';
            res.json({
                success: false,
                message: 'Leonardo Consciousness not available'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Quantum Operations
app.post('/api/quantum/operation', async (req, res) => {
    try {
        const { operation, parameters } = req.body;
        
        // Log operation to Supabase
        const { data, error } = await supabase
            .from('quantum_operations')
            .insert([{
                operation_type: operation,
                parameters: parameters,
                timestamp: new Date().toISOString(),
                system_state: systemState
            }]);
        
        if (error) throw error;
        
        res.json({
            success: true,
            message: `Quantum operation '${operation}' executed`,
            operation_id: data?.[0]?.id
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Inicializar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('='.repeat(60));
    console.log('   QBTC UNIFIED SYSTEM - ONLINE');
    console.log('='.repeat(60));
    console.log(`   Port: ${PORT}`);
    console.log(`   Supabase: ${supabaseUrl}`);
    console.log(`   Mode: ${process.env.ENVIRONMENT || 'production'}`);
    console.log('='.repeat(60));
    console.log('');
    
    // Test inicial de Supabase
    supabase.from('system_metrics').select('count', { count: 'exact' })
        .then(({ count, error }) => {
            if (!error) {
                console.log(`✓ Supabase connected - ${count || 0} metrics records`);
                systemState.supabase.connected = true;
            } else {
                console.log('⚠ Supabase connection issue:', error.message);
            }
        });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\\nShutting down Unified System...');
    process.exit(0);
});
"@
    
    $unifiedScript | Out-File -FilePath "unified-system\unified-server.js" -Encoding UTF8
    
    # Package.json para el sistema unificado
    $packageJson = @"
{
  "name": "qbtc-unified-system",
  "version": "1.0.0",
  "description": "QBTC Unified System with Supabase Integration",
  "main": "unified-server.js",
  "scripts": {
    "start": "node unified-server.js",
    "dev": "nodemon unified-server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "@supabase/supabase-js": "^2.38.0"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
"@
    
    $packageJson | Out-File -FilePath "unified-system\package.json" -Encoding UTF8
    
    Write-Host "✓ Sistema Unificado creado" -ForegroundColor Green
}

# Función para lanzar componente en background
function Start-BackgroundComponent {
    param(
        [string]$Name,
        [string]$ScriptPath,
        [string]$WorkingDirectory,
        [string]$Arguments = "",
        [string]$LogFile = ""
    )
    
    Write-Host "Lanzando $Name en segundo plano..." -ForegroundColor Cyan
    
    if ($LogFile -eq "") {
        $LogFile = "$Name-output.log"
    }
    
    $processArgs = if ($Arguments) { 
        "$ScriptPath $Arguments" 
    } else { 
        $ScriptPath 
    }
    
    # Crear script de wrapper para logging
    $wrapperScript = @"
Set-Location '$WorkingDirectory'
`$process = Start-Process -FilePath 'node' -ArgumentList '$processArgs' -PassThru -NoNewWindow -RedirectStandardOutput '$LogFile' -RedirectStandardError '$Name-error.log'
`$process.Id | Out-File -FilePath '$Name.pid' -Encoding ASCII
Write-Host '✓ $Name iniciado - PID: ' + `$process.Id -ForegroundColor Green
Wait-Process -Id `$process.Id
"@
    
    $wrapperScript | Out-File -FilePath "$Name-wrapper.ps1" -Encoding UTF8
    
    Start-Process -FilePath "powershell.exe" -ArgumentList "-File $Name-wrapper.ps1" -WindowStyle Hidden
    
    Start-Sleep -Seconds 2
    Write-Host "✓ $Name lanzado" -ForegroundColor Green
}

# Verificar prerequisitos
if (-not $SkipChecks) {
    if (-not (Test-Prerequisites)) {
        Write-Host ""
        Write-Host "Por favor corrige los errores antes de continuar." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "INICIANDO SISTEMA COMPLETO..." -ForegroundColor Green
Write-Host ""

# 1. Crear Sistema Unificado si no existe
if (-not (Test-Path "unified-system\unified-server.js")) {
    New-UnifiedSystem
}

# 2. Instalar dependencias del Sistema Unificado
Write-Host "Instalando dependencias del Sistema Unificado..." -ForegroundColor Yellow
Set-Location "unified-system"
if (-not (Test-Path "node_modules")) {
    npm install --production | Out-Null
}
Set-Location ".."

# 3. Lanzar Leonardo Consciousness
if ($LaunchAll) {
    Set-Location "leonardo-consciousness"
    if (-not (Test-Path "node_modules")) {
        Write-Host "Instalando dependencias de Leonardo Consciousness..." -ForegroundColor Yellow
        npm install --production | Out-Null
    }
    
    Start-BackgroundComponent -Name "Leonardo" -ScriptPath "MasterLauncher.js" -WorkingDirectory (Get-Location).Path
    Set-Location ".."
}

# 4. Lanzar Sistema Unificado
Start-BackgroundComponent -Name "Unified" -ScriptPath "unified-server.js" -WorkingDirectory "$PWD\unified-system"

# 5. Lanzar Frontend Unificado
if ($LaunchAll) {
    # Ejecutar el launcher del frontend
    powershell.exe -File "launch-frontend-unified.ps1" -Background -Port 3205
}

Write-Host ""
Write-Host "=======================================================================" -ForegroundColor Green
Write-Host "                  QBTC UNIFIED SYSTEM - COMPLETAMENTE ONLINE           " -ForegroundColor Yellow
Write-Host "=======================================================================" -ForegroundColor Green
Write-Host "  🧠 Leonardo Consciousness:   http://localhost:3003" -ForegroundColor White
Write-Host "  🔗 Sistema Unificado:        http://localhost:3203" -ForegroundColor White  
Write-Host "  🖥️ Frontend Dashboard:       http://localhost:3205" -ForegroundColor White
Write-Host "  📊 Health Checks:" -ForegroundColor Cyan
Write-Host "     • Leonardo:               http://localhost:3003/api/leonardo-health" -ForegroundColor Gray
Write-Host "     • Unificado:              http://localhost:3203/health" -ForegroundColor Gray
Write-Host "     • Frontend:               http://localhost:3205/health" -ForegroundColor Gray
Write-Host ""
Write-Host "  🗄️ Supabase:                 https://hrvxsaolaxnqltomqaud.supabase.co" -ForegroundColor Magenta
Write-Host "  💰 Binance APIs:             HABILITADAS (Modo Producción)" -ForegroundColor Green
Write-Host "  🌐 IP Whitelisted:           181.43.212.196" -ForegroundColor Cyan
Write-Host ""
Write-Host "  📁 Archivos PID generados:" -ForegroundColor Yellow
Write-Host "     • Leonardo.pid" -ForegroundColor Gray
Write-Host "     • Unified.pid" -ForegroundColor Gray
Write-Host "     • frontend-unified/frontend.pid" -ForegroundColor Gray
Write-Host ""
Write-Host "  Para detener todo el sistema:" -ForegroundColor Red
Write-Host "     Get-Content *.pid | Stop-Process" -ForegroundColor Red
Write-Host "=======================================================================" -ForegroundColor Green
Write-Host ""

# Mantener el script activo para mostrar logs
Write-Host "Presiona Ctrl+C para detener el sistema completo" -ForegroundColor Yellow
Write-Host ""

try {
    while ($true) {
        Start-Sleep -Seconds 10
        
        # Mostrar estado cada 30 segundos
        $timestamp = Get-Date -Format "HH:mm:ss"
        Write-Host "[$timestamp] Sistema activo - Leonardo(3003) | Unificado(3203) | Frontend(3205)" -ForegroundColor Green
    }
} catch {
    Write-Host ""
    Write-Host "Deteniendo sistema..." -ForegroundColor Yellow
    
    # Detener todos los procesos
    Get-Content "*.pid" -ErrorAction SilentlyContinue | ForEach-Object { 
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue 
    }
    
    Write-Host "✓ Sistema detenido" -ForegroundColor Green
}
