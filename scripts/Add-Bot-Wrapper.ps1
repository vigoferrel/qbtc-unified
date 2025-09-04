# Add-Bot-Wrapper.ps1 - Wrapper PowerShell para el sistema QBTC existente
# Utiliza el generador Node.js ya implementado manteniendo la integración completa
# Lanza bots en segundo plano para métricas de desempeño y depuración

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("TRADER_BOT", "SCALPER_BOT", "ARBITRAGE_BOT", "QUANTUM_ANALYZER", "RISK_MANAGER", "MONITOR_BOT", "DATA_COLLECTOR", "SIGNAL_PROCESSOR")]
    [string]$BotType,
    
    [Parameter(Mandatory=$false)]
    [int]$Count = 1,
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectPath = "C:\Users\DELL\Desktop\QBTC-UNIFIED",
    
    [Parameter(Mandatory=$false)]
    [switch]$LaunchInBackground,
    
    [Parameter(Mandatory=$false)]
    [switch]$ShowOutput,
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun,
    
    [Parameter(Mandatory=$false)]
    [switch]$StartUnifiedSystem
)

# Configuración basada en el sistema existente
$Global:SystemPaths = @{
    Project = $ProjectPath
    Bots = Join-Path $ProjectPath "bots"
    Generator = Join-Path $ProjectPath "bots\generate-bots.js"
    UnifiedLauncher = Join-Path $ProjectPath "core\quantum-engine\unified-system-launcher.js"
    Coordinator = Join-Path $ProjectPath "coordinator\index.js"
    Configs = Join-Path $ProjectPath "bots\configs"
    Registry = Join-Path $ProjectPath "bots\registry"
    Logs = Join-Path $ProjectPath "logs"
}

function Write-SystemLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] [BOT-MANAGER] $Message"
    Write-Host $logMessage
    
    # Log en el directorio del sistema
    $logFile = Join-Path $Global:SystemPaths.Logs "bot-management.log"
    $logDir = Split-Path $logFile -Parent
    if (!(Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    Add-Content -Path $logFile -Value $logMessage -Encoding UTF8
}

function Test-SystemPrerequisites {
    Write-SystemLog "Verificando prerrequisitos del sistema..."
    
    # Verificar Node.js
    try {
        $nodeVersion = & node --version 2>$null
        if (!$nodeVersion) {
            throw "Node.js no encontrado"
        }
        Write-SystemLog "Node.js disponible: $nodeVersion"
    } catch {
        Write-Error "Node.js no está instalado o no está en el PATH"
        Write-Host "Instale Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
        return $false
    }
    
    # Verificar archivos críticos del sistema
    $criticalFiles = @(
        $Global:SystemPaths.Generator,
        $Global:SystemPaths.UnifiedLauncher,
        $Global:SystemPaths.Coordinator
    )
    
    foreach ($file in $criticalFiles) {
        if (!(Test-Path $file)) {
            Write-Error "Archivo crítico del sistema no encontrado: $file"
            return $false
        }
    }
    
    Write-SystemLog "Todos los prerrequisitos verificados correctamente"
    return $true
}

function Invoke-NodeJSGenerator {
    param([string]$Type, [int]$BotCount)
    
    $originalLocation = Get-Location
    $success = $false
    
    try {
        Set-Location $Global:SystemPaths.Bots
        Write-SystemLog "Ejecutando generador desde: $($Global:SystemPaths.Bots)"
        
        # Preparar argumentos para el generador Node.js existente
        $nodeArgs = @("generate-bots.js", $BotCount.ToString(), $Type)
        
        if ($DryRun) {
            Write-SystemLog "DRY RUN: node $($nodeArgs -join ' ')"
            return @{
                success = $true
                dryRun = $true
                command = "node $($nodeArgs -join ' ')"
                botsGenerated = $BotCount
                message = "Simulación de generación completada"
            }
        }
        
        Write-SystemLog "Generando $BotCount bot(s) de tipo $Type usando el sistema Node.js..."
        
        if ($ShowOutput) {
            # Ejecutar con salida visible
            Write-Host "=== SALIDA DEL GENERADOR NODE.JS ===" -ForegroundColor Cyan
            $process = Start-Process -FilePath "node" -ArgumentList $nodeArgs -NoNewWindow -PassThru -Wait
            $exitCode = $process.ExitCode
        } else {
            # Ejecutar y capturar salida
            $output = & node @nodeArgs 2>&1
            $exitCode = $LASTEXITCODE
            
            if ($output) {
                Write-SystemLog "Salida del generador: $($output -join '; ')"
            }
        }
        
        if ($exitCode -eq 0) {
            Write-SystemLog "Generación completada exitosamente (Exit Code: 0)"
            $success = $true
            
            return @{
                success = $true
                exitCode = $exitCode
                botsGenerated = $BotCount
                message = "Bots generados correctamente usando el sistema Node.js"
            }
        } else {
            Write-SystemLog "Error en la generación (Exit Code: $exitCode)" "ERROR"
            return @{
                success = $false
                exitCode = $exitCode
                error = "Generador Node.js falló con código $exitCode"
            }
        }
        
    } catch {
        Write-SystemLog "Excepción durante la generación: $($_.Exception.Message)" "ERROR"
        return @{
            success = $false
            error = $_.Exception.Message
        }
    } finally {
        Set-Location $originalLocation
    }
}

function Get-SystemBotStatus {
    Write-SystemLog "Obteniendo estado actual del sistema de bots..."
    
    $status = @{
        registeredBots = 0
        configuredBots = 0
        runningBots = 0
        botsByType = @{}
        recentBots = @()
    }
    
    # Leer registro de bots
    $registryFile = Join-Path $Global:SystemPaths.Registry "bot-registry.json"
    if (Test-Path $registryFile) {
        try {
            $registry = Get-Content $registryFile -Raw -Encoding UTF8 | ConvertFrom-Json
            $status.registeredBots = $registry.Count
            
            # Agrupar por tipo
            $registry | Group-Object type | ForEach-Object {
                $status.botsByType[$_.Name] = $_.Count
            }
            
            # Últimos bots (ordenar por fecha de creación)
            $status.recentBots = $registry | Sort-Object created -Descending | Select-Object -First 5
            
        } catch {
            Write-SystemLog "Error leyendo registro de bots: $($_.Exception.Message)" "WARN"
        }
    }
    
    # Contar configuraciones
    if (Test-Path $Global:SystemPaths.Configs) {
        $configDirs = Get-ChildItem $Global:SystemPaths.Configs -Directory -ErrorAction SilentlyContinue
        $status.configuredBots = $configDirs.Count
    }
    
    # Verificar bots corriendo (simplificado)
    try {
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        $status.runningBots = $nodeProcesses.Count
    } catch {
        $status.runningBots = 0
    }
    
    return $status
}

function Show-SystemSummary {
    param([object]$PreStatus, [object]$PostStatus, [object]$Result)
    
    Write-Host "`n=== RESUMEN DEL SISTEMA QBTC UNIFIED ===" -ForegroundColor Cyan
    
    Write-Host "`nEstado antes de la operación:" -ForegroundColor Yellow
    Write-Host "  - Bots registrados: $($PreStatus.registeredBots)" -ForegroundColor Gray
    Write-Host "  - Configuraciones: $($PreStatus.configuredBots)" -ForegroundColor Gray
    Write-Host "  - Procesos Node.js: $($PreStatus.runningBots)" -ForegroundColor Gray
    
    if ($Result.success -and !$Result.dryRun) {
        Write-Host "`nResultado de la operación:" -ForegroundColor Green
        Write-Host "  - Bots generados: $($Result.botsGenerated)" -ForegroundColor White
        Write-Host "  - Estado: EXITOSO" -ForegroundColor Green
        
        Write-Host "`nEstado después de la operación:" -ForegroundColor Yellow
        Write-Host "  - Bots registrados: $($PostStatus.registeredBots) (+$($PostStatus.registeredBots - $PreStatus.registeredBots))" -ForegroundColor Gray
        Write-Host "  - Configuraciones: $($PostStatus.configuredBots) (+$($PostStatus.configuredBots - $PreStatus.configuredBots))" -ForegroundColor Gray
        
        if ($PostStatus.recentBots.Count -gt 0) {
            Write-Host "`nÚltimos bots generados:" -ForegroundColor Yellow
            $PostStatus.recentBots | Select-Object -First $Result.botsGenerated | ForEach-Object {
                Write-Host "  - $($_.id) ($($_.type)) -> $($_.ip)" -ForegroundColor Green
            }
        }
        
    } elseif ($Result.dryRun) {
        Write-Host "`nMODO DRY RUN:" -ForegroundColor Yellow
        Write-Host "  - Comando simulado: $($Result.command)" -ForegroundColor White
        Write-Host "  - Bots que se generarían: $($Result.botsGenerated)" -ForegroundColor White
        Write-Host "  - No se realizaron cambios reales" -ForegroundColor Yellow
    } else {
        Write-Host "`nERROR EN LA OPERACIÓN:" -ForegroundColor Red
        Write-Host "  - Estado: FALLIDO" -ForegroundColor Red
        Write-Host "  - Error: $($Result.error)" -ForegroundColor Yellow
    }
    
    # Mostrar distribución por tipos
    if ($PostStatus.botsByType.Count -gt 0) {
        Write-Host "`nDistribución por tipo de bot:" -ForegroundColor Yellow
        $PostStatus.botsByType.GetEnumerator() | Sort-Object Value -Descending | ForEach-Object {
            Write-Host "  - $($_.Key): $($_.Value) bots" -ForegroundColor Gray
        }
    }
}

function Start-BotsInBackgroundMode {
    if (!$LaunchInBackground) {
        return
    }
    
    Write-Host "`n=== LANZANDO BOTS EN SEGUNDO PLANO ===" -ForegroundColor Cyan
    Write-SystemLog "Iniciando lanzamiento de bots en segundo plano para métricas y depuración"
    
    # Buscar configuraciones de bots recién creados
    if (!(Test-Path $Global:SystemPaths.Configs)) {
        Write-SystemLog "No hay configuraciones disponibles para lanzar" "WARN"
        return
    }
    
    $botDirs = Get-ChildItem $Global:SystemPaths.Configs -Directory | Sort-Object CreationTime -Descending | Select-Object -First $Count
    $launchedCount = 0
    
    foreach ($botDir in $botDirs) {
        $launchScript = Join-Path $botDir.FullName "launch.bat"
        
        if (Test-Path $launchScript) {
            try {
                Write-SystemLog "Lanzando bot en segundo plano: $($botDir.Name)"
                
                # Lanzar en background para métricas y depuración
                Start-Process -FilePath $launchScript -WindowStyle Hidden -WorkingDirectory $botDir.FullName
                $launchedCount++
                
                # Pausa entre lanzamientos para evitar conflictos
                Start-Sleep -Seconds 2
                
            } catch {
                Write-SystemLog "Error lanzando bot $($botDir.Name): $($_.Exception.Message)" "ERROR"
            }
        } else {
            Write-SystemLog "Script de lanzamiento no encontrado para $($botDir.Name)" "WARN"
        }
    }
    
    Write-Host "Bots lanzados en segundo plano: $launchedCount" -ForegroundColor Green
    Write-Host "NOTA: Los bots están corriendo en background para reportar métricas de desempeño" -ForegroundColor Yellow
    Write-Host "      y facilitar la depuración según las reglas del sistema." -ForegroundColor Yellow
    
    Write-SystemLog "Lanzamiento en segundo plano completado: $launchedCount bots"
}

function Start-UnifiedSystemIfRequested {
    if (!$StartUnifiedSystem) {
        return
    }
    
    Write-Host "`n=== INICIANDO SISTEMA UNIFICADO ===" -ForegroundColor Cyan
    Write-SystemLog "Iniciando sistema unificado QBTC"
    
    try {
        $originalLocation = Get-Location
        Set-Location $Global:SystemPaths.Project
        
        Write-Host "Lanzando sistema cuántico unificado..." -ForegroundColor Yellow
        Write-Host "Puerto principal: 18020" -ForegroundColor Gray
        Write-Host "Métricas: 18022" -ForegroundColor Gray
        
        if ($ShowOutput) {
            # Lanzar con salida visible
            & node $Global:SystemPaths.UnifiedLauncher
        } else {
            # Lanzar en segundo plano
            Start-Process -FilePath "node" -ArgumentList $Global:SystemPaths.UnifiedLauncher -WindowStyle Minimized
            Write-Host "Sistema unificado lanzado en segundo plano" -ForegroundColor Green
        }
        
    } catch {
        Write-SystemLog "Error iniciando sistema unificado: $($_.Exception.Message)" "ERROR"
    } finally {
        Set-Location $originalLocation
    }
}

function Show-NextStepsInformation {
    Write-Host "`n=== PRÓXIMOS PASOS RECOMENDADOS ===" -ForegroundColor Cyan
    
    Write-Host "1. Sistema Unificado:" -ForegroundColor Yellow
    Write-Host "   node core\\quantum-engine\\unified-system-launcher.js" -ForegroundColor Gray
    Write-Host "   Acceso: http://localhost:18020/" -ForegroundColor Gray
    
    Write-Host "2. Frontend Simplificado:" -ForegroundColor Yellow
    Write-Host "   http://localhost:18020/frontend/simplified/" -ForegroundColor Gray
    
    Write-Host "3. Coordinador Multi-Bot:" -ForegroundColor Yellow
    Write-Host "   node coordinator\\index.js" -ForegroundColor Gray
    
    Write-Host "4. Métricas del Sistema:" -ForegroundColor Yellow
    Write-Host "   http://localhost:18022/metrics" -ForegroundColor Gray
    
    Write-Host "5. Gestión de Bots:" -ForegroundColor Yellow
    Write-Host "   .\\scripts\\Remove-Bot.ps1 -BotType $BotType" -ForegroundColor Gray
    Write-Host "   .\\scripts\\Manage-Bots.ps1 -Action Stats" -ForegroundColor Gray
    
    if (!$StartUnifiedSystem) {
        Write-Host "6. Iniciar Sistema Completo:" -ForegroundColor Yellow
        Write-Host "   .\\scripts\\Add-Bot-Wrapper.ps1 -BotType $BotType -StartUnifiedSystem" -ForegroundColor Gray
    }
}

# === EJECUCIÓN PRINCIPAL ===

# Validaciones de entrada
if ($Count -lt 1 -or $Count -gt 50) {
    Write-Error "El número de bots debe estar entre 1 y 50"
    exit 1
}

try {
    Write-SystemLog "=== INICIANDO WRAPPER DE GESTIÓN QBTC UNIFIED ==="
    Write-SystemLog "Tipo de Bot: $BotType | Cantidad: $Count | DryRun: $DryRun"
    Write-SystemLog "Lanzamiento en Background: $LaunchInBackground | Sistema Unificado: $StartUnifiedSystem"
    
    # Verificar prerrequisitos
    if (!(Test-SystemPrerequisites)) {
        exit 1
    }
    
    # Estado inicial del sistema
    $preOperationStatus = Get-SystemBotStatus
    Write-SystemLog "Estado inicial - Bots registrados: $($preOperationStatus.registeredBots)"
    
    # Ejecutar generación usando el sistema Node.js existente
    $generationResult = Invoke-NodeJSGenerator -Type $BotType -BotCount $Count
    
    # Estado post-operación
    $postOperationStatus = if ($generationResult.success -and !$generationResult.dryRun) {
        Start-Sleep -Seconds 2  # Esperar a que se actualicen los archivos
        Get-SystemBotStatus
    } else {
        $preOperationStatus
    }
    
    # Mostrar resumen
    Show-SystemSummary -PreStatus $preOperationStatus -PostStatus $postOperationStatus -Result $generationResult
    
    if ($generationResult.success -and !$generationResult.dryRun) {
        # Lanzar bots en segundo plano si se solicita
        Start-BotsInBackgroundMode
        
        # Iniciar sistema unificado si se solicita
        Start-UnifiedSystemIfRequested
        
        # Mostrar información de próximos pasos
        Show-NextStepsInformation
        
        Write-SystemLog "Operación completada exitosamente - $($generationResult.botsGenerated) bots procesados"
        Write-Host "`nOperación completada exitosamente!" -ForegroundColor Green
        
    } elseif ($generationResult.dryRun) {
        Write-Host "`nSimulación completada - usar sin -DryRun para ejecutar realmente" -ForegroundColor Yellow
        
    } else {
        Write-Error "Error en la operación: $($generationResult.error)"
        exit 1
    }
    
} catch {
    Write-SystemLog "Error fatal en wrapper: $($_.Exception.Message)" "ERROR"
    Write-Host "Error fatal: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Gray
    exit 1
}
