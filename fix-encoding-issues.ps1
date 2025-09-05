# QBTC-UNIFIED - Script para Resolver Problemas de Codificación y Gestión
# Este script resuelve los problemas de codificación y gestión de procesos

Write-Host "=== RESOLVIENDO PROBLEMAS DE CODIFICACION ===" -ForegroundColor Cyan

# Solución 1: Configurar codificación de manera segura
try {
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    Write-Host "✅ Codificación UTF-8 configurada correctamente" -ForegroundColor Green
} catch {
    Write-Host "⚠️ No se pudo configurar OutputEncoding, continuando..." -ForegroundColor Yellow
}

# Solución 2: Terminar procesos Node.js conflictivos
Write-Host "`n=== LIMPIANDO PROCESOS NODE.JS ===" -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Encontrados $($nodeProcesses.Count) procesos Node.js:" -ForegroundColor Yellow
    foreach ($process in $nodeProcesses) {
        Write-Host "  PID: $($process.Id) - Iniciado: $($process.StartTime)" -ForegroundColor White
    }
    
    $response = Read-Host "¿Desea terminar todos los procesos Node.js? (s/n)"
    if ($response -eq "s" -or $response -eq "S") {
        try {
            Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
            Write-Host "✅ Procesos Node.js terminados" -ForegroundColor Green
        } catch {
            Write-Host "❌ Error terminando procesos Node.js: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "✅ No hay procesos Node.js ejecutándose" -ForegroundColor Green
}

# Solución 3: Verificar puerto 18020
Write-Host "`n=== VERIFICANDO PUERTO 18020 ===" -ForegroundColor Yellow
try {
    $portCheck = netstat -ano 2>$null | Select-String ":18020"
    if ($portCheck) {
        Write-Host "⚠️ Puerto 18020 en uso:" -ForegroundColor Yellow
        Write-Host $portCheck
        $response = Read-Host "¿Desea liberar el puerto 18020? (s/n)"
        if ($response -eq "s" -or $response -eq "S") {
            # Extraer PID del puerto
            $pidMatch = $portCheck -match "(\d+)$"
            if ($pidMatch) {
                $processId = $matches[1]
                try {
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    Write-Host "✅ Puerto 18020 liberado" -ForegroundColor Green
                } catch {
                    Write-Host "❌ Error liberando puerto: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
        }
    } else {
        Write-Host "✅ Puerto 18020 disponible" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error verificando puerto: $($_.Exception.Message)" -ForegroundColor Red
}

# Solución 4: Verificar archivos críticos
Write-Host "`n=== VERIFICANDO ARCHIVOS CRITICOS ===" -ForegroundColor Yellow
$criticalFiles = @(
    "enhanced-key-dashboard-server.js",
    "api-key-manager.js",
    "credentials-integration.js",
    "quantum-core/CredentialsManager.js",
    "quantum-core\.env"
)

$allFilesExist = $true
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

# Solución 5: Verificar dependencias Node.js
Write-Host "`n=== VERIFICANDO DEPENDENCIAS ===" -ForegroundColor Yellow
try {
    $packageJson = Get-Content "package.json" -ErrorAction SilentlyContinue | ConvertFrom-Json
    if ($packageJson) {
        Write-Host "✅ package.json encontrado" -ForegroundColor Green
        Write-Host "📦 Dependencias principales:" -ForegroundColor White
        if ($packageJson.dependencies) {
            foreach ($dep in $packageJson.dependencies.PSObject.Properties) {
                Write-Host "   $($dep.Name): $($dep.Value)" -ForegroundColor White
            }
        }
    } else {
        Write-Host "⚠️ package.json no encontrado" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error verificando dependencias: $($_.Exception.Message)" -ForegroundColor Red
}

# Solución 6: Verificar variables de entorno
Write-Host "`n=== VERIFICANDO VARIABLES DE ENTORNO ===" -ForegroundColor Yellow
$envVars = @(
    "BINANCE_API_KEY",
    "BINANCE_SECRET_KEY", 
    "BINANCE_TESTNET",
    "LEONARDO_PORT",
    "LEONARDO_HOST"
)

foreach ($var in $envVars) {
    $value = [Environment]::GetEnvironmentVariable($var)
    if ($value) {
        if ($var -like "*SECRET*" -or $var -like "*KEY*") {
            Write-Host "✅ ${var}: DEFINIDA (oculta)" -ForegroundColor Green
        } else {
            Write-Host "✅ ${var}: $value" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ ${var}: NO DEFINIDA" -ForegroundColor Red
    }
}

if ($allFilesExist) {
    Write-Host "`n=== INICIANDO SERVIDOR MEJORADO ===" -ForegroundColor Cyan
    Write-Host "Iniciando servidor con gestión avanzada de claves..." -ForegroundColor White
    
    # Iniciar servidor con manejo de errores mejorado
    try {
        Write-Host "🚀 Ejecutando: node enhanced-key-dashboard-server.js" -ForegroundColor Green
        node enhanced-key-dashboard-server.js
    } catch {
        Write-Host "❌ Error iniciando servidor: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Intentando con servidor alternativo..." -ForegroundColor Yellow
        try {
            Write-Host "🚀 Ejecutando: node dashboard-mock-server.js" -ForegroundColor Green
            node dashboard-mock-server.js
        } catch {
            Write-Host "❌ Error con servidor alternativo: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Intentando con servidor básico..." -ForegroundColor Yellow
            try {
                Write-Host "🚀 Ejecutando: node mock-backend-server.js" -ForegroundColor Green
                node mock-backend-server.js
            } catch {
                Write-Host "❌ Error con servidor básico: $($_.Exception.Message)" -ForegroundColor Red
                Write-Host "`n🔧 Todos los servidores fallaron. Verifique:" -ForegroundColor Red
                Write-Host "   1. Node.js está instalado correctamente" -ForegroundColor White
                Write-Host "   2. Las dependencias están instaladas (npm install)" -ForegroundColor White
                Write-Host "   3. Los archivos críticos existen" -ForegroundColor White
                Write-Host "   4. El puerto 18020 está disponible" -ForegroundColor White
            }
        }
    }
} else {
    Write-Host "`n❌ Faltan archivos críticos. No se puede iniciar el servidor." -ForegroundColor Red
    Write-Host "🔧 Archivos faltantes:" -ForegroundColor Yellow
    foreach ($file in $criticalFiles) {
        if (-not (Test-Path $file)) {
            Write-Host "   - $file" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== DIAGNOSTICO COMPLETADO ===" -ForegroundColor Cyan
Write-Host "📊 Resumen:" -ForegroundColor White
if ($nodeProcesses) {
    Write-Host "   - Procesos Node.js: Limpiados" -ForegroundColor White
} else {
    Write-Host "   - Procesos Node.js: Sin conflictos" -ForegroundColor White
}

if ($portCheck) {
    Write-Host "   - Puerto 18020: En uso" -ForegroundColor White
} else {
    Write-Host "   - Puerto 18020: Disponible" -ForegroundColor White
}

if ($allFilesExist) {
    Write-Host "   - Archivos críticos: Completos" -ForegroundColor White
    Write-Host "   - Servidor: Iniciado" -ForegroundColor White
} else {
    Write-Host "   - Archivos críticos: Faltantes" -ForegroundColor White
    Write-Host "   - Servidor: No iniciado" -ForegroundColor White
}
