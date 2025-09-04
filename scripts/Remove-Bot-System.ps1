# Remove-Bot-System.ps1 - Script para remover bots del sistema QBTC existente
# Trabaja con el generador Node.js y mantiene reorganización automática
# Sistema Windows PowerShell con codificacion ASCII

param(
    [Parameter(Mandatory=$false)]
    [string]$BotId = "",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("TRADER_BOT", "SCALPER_BOT", "ARBITRAGE_BOT", "QUANTUM_ANALYZER", "RISK_MANAGER", "MONITOR_BOT", "DATA_COLLECTOR", "SIGNAL_PROCESSOR")]
    [string]$BotType = "",
    
    [Parameter(Mandatory=$false)]
    [string]$BotIP = "",
    
    [Parameter(Mandatory=$false)]
    [int]$Count = 0,
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectPath = "C:\Users\DELL\Desktop\QBTC-UNIFIED",
    
    [Parameter(Mandatory=$false)]
    [switch]$All,
    
    [Parameter(Mandatory=$false)]
    [switch]$Reorganize,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force,
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun,
    
    [Parameter(Mandatory=$false)]
    [switch]$Backup = $true
)

# Configuración del sistema existente
$Global:SystemPaths = @{
    Project = $ProjectPath
    Bots = Join-Path $ProjectPath "bots"
    Configs = Join-Path $ProjectPath "bots\configs"
    Registry = Join-Path $ProjectPath "bots\registry"
    Network = Join-Path $ProjectPath "bots\network"
    Logs = Join-Path $ProjectPath "logs"
}

function Write-SystemLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] [BOT-REMOVER] $Message"
    Write-Host $logMessage
    
    $logFile = Join-Path $Global:SystemPaths.Logs "bot-management.log"
    $logDir = Split-Path $logFile -Parent
    if (!(Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    Add-Content -Path $logFile -Value $logMessage -Encoding UTF8
}

function Get-SystemBotRegistry {
    $registryFile = Join-Path $Global:SystemPaths.Registry "bot-registry.json"
    
    if (Test-Path $registryFile) {
        try {
            $content = Get-Content $registryFile -Raw -Encoding UTF8
            return ($content | ConvertFrom-Json)
        } catch {
            Write-SystemLog "Error leyendo registro de bots: $($_.Exception.Message)" "ERROR"
            return @()
        }
    }
    
    Write-SystemLog "Registro de bots no encontrado, devolviendo array vacío"
    return @()
}

function Save-SystemBotRegistry {
    param([array]$Registry)
    
    $registryFile = Join-Path $Global:SystemPaths.Registry "bot-registry.json"
    $registryDir = Split-Path $registryFile -Parent
    
    if (!(Test-Path $registryDir)) {
        New-Item -ItemType Directory -Path $registryDir -Force | Out-Null
    }
    
    try {
        $Registry | ConvertTo-Json -Depth 10 | Set-Content $registryFile -Encoding UTF8
        Write-SystemLog "Registro actualizado: $($Registry.Count) bots"
    } catch {
        Write-SystemLog "Error guardando registro: $($_.Exception.Message)" "ERROR"
        throw
    }
}

function Backup-SystemRegistry {
    if (!$Backup) {
        return
    }
    
    $registryFile = Join-Path $Global:SystemPaths.Registry "bot-registry.json"
    if (!(Test-Path $registryFile)) {
        return
    }
    
    $backupDir = Join-Path $Global:SystemPaths.Registry "backup"
    if (!(Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    }
    
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupFile = Join-Path $backupDir "bot-registry-backup-$timestamp.json"
    
    try {
        Copy-Item $registryFile $backupFile
        Write-SystemLog "Backup creado: $backupFile"
    } catch {
        Write-SystemLog "Error creando backup: $($_.Exception.Message)" "WARN"
    }
}

function Find-BotsToRemove {
    param([array]$AllBots)
    
    $botsToRemove = @()
    
    if ($All) {
        $botsToRemove = $AllBots
        Write-SystemLog "Seleccionados TODOS los bots para remoción: $($AllBots.Count)"
    }
    elseif ($BotId) {
        $bot = $AllBots | Where-Object { $_.id -eq $BotId }
        if ($bot) {
            $botsToRemove = @($bot)
            Write-SystemLog "Bot encontrado por ID: $BotId"
        } else {
            throw "Bot con ID '$BotId' no encontrado"
        }
    }
    elseif ($BotType) {
        $botsOfType = @($AllBots | Where-Object { $_.type -eq $BotType })
        if ($botsOfType.Count -eq 0) {
            throw "No se encontraron bots del tipo '$BotType'"
        }
        
        if ($Count -gt 0) {
            $botsToRemove = $botsOfType | Sort-Object created -Descending | Select-Object -First $Count
            Write-SystemLog "Seleccionados los últimos $Count bots del tipo $BotType"
        } else {
            $botsToRemove = $botsOfType
            Write-SystemLog "Seleccionados TODOS los bots del tipo $BotType: $($botsOfType.Count)"
        }
    }
    elseif ($BotIP) {
        $bot = $AllBots | Where-Object { $_.ip -eq $BotIP }
        if ($bot) {
            $botsToRemove = @($bot)
            Write-SystemLog "Bot encontrado por IP: $BotIP"
        } else {
            throw "Bot con IP '$BotIP' no encontrado"
        }
    }
    else {
        throw "Debe especificar -BotId, -BotType, -BotIP o -All"
    }
    
    return $botsToRemove
}

function Stop-BotProcesses {
    param([array]$BotsToRemove)
    
    Write-SystemLog "Deteniendo procesos de bots..."
    $stoppedCount = 0
    
    foreach ($bot in $BotsToRemove) {
        try {
            # Intentar detener por puerto si está disponible
            if ($bot.network -and $bot.network.port) {
                $port = $bot.network.port
                $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
                
                foreach ($connection in $connections) {
                    if ($connection.OwningProcess) {
                        Write-SystemLog "Deteniendo proceso $($connection.OwningProcess) para bot $($bot.id) en puerto $port"
                        if (!$DryRun) {
                            Stop-Process -Id $connection.OwningProcess -Force -ErrorAction SilentlyContinue
                            $stoppedCount++
                        }
                    }
                }
            }
            
            # Buscar y detener scripts de lanzamiento específicos del bot
            $botDir = Join-Path $Global:SystemPaths.Configs $bot.id
            if (Test-Path $botDir) {
                $stopScript = Join-Path $botDir "Stop-Bot.ps1"
                if (Test-Path $stopScript) {
                    Write-SystemLog "Ejecutando script de parada para bot $($bot.id)"
                    if (!$DryRun) {
                        & $stopScript -ErrorAction SilentlyContinue
                    }
                }
            }
            
        } catch {
            Write-SystemLog "Error deteniendo bot $($bot.id): $($_.Exception.Message)" "WARN"
        }
    }
    
    Write-SystemLog "Procesos detenidos: $stoppedCount"
}

function Remove-BotConfigurations {
    param([array]$BotsToRemove)
    
    Write-SystemLog "Removiendo archivos de configuración..."
    $removedCount = 0
    
    foreach ($bot in $BotsToRemove) {
        try {
            # Remover directorio de configuración del bot
            $botConfigDir = Join-Path $Global:SystemPaths.Configs $bot.id
            if (Test-Path $botConfigDir) {
                Write-SystemLog "Removiendo configuración: $botConfigDir"
                if (!$DryRun) {
                    Remove-Item -Path $botConfigDir -Recurse -Force
                    $removedCount++
                }
            }
            
            # Remover archivos de red si existen
            $networkFile = Join-Path $Global:SystemPaths.Network "$($bot.id)-network.json"
            if (Test-Path $networkFile) {
                Write-SystemLog "Removiendo configuración de red: $networkFile"
                if (!$DryRun) {
                    Remove-Item -Path $networkFile -Force
                }
            }
            
        } catch {
            Write-SystemLog "Error removiendo configuración del bot $($bot.id): $($_.Exception.Message)" "ERROR"
        }
    }
    
    Write-SystemLog "Configuraciones removidas: $removedCount"
}

function Reorganize-RemainingBots {
    param([array]$RemainingBots)
    
    if (!$Reorganize -or $RemainingBots.Count -eq 0) {
        return $RemainingBots
    }
    
    Write-SystemLog "Iniciando reorganización de bots restantes: $($RemainingBots.Count)"
    
    # Reorganizar IPs secuencialmente
    $ipCounter = 10  # Empezar desde 192.168.100.10
    $reservedIPs = @("192.168.100.1", "192.168.100.2", "192.168.100.3")
    
    # Ordenar bots por tipo y fecha de creación
    $sortedBots = $RemainingBots | Sort-Object type, created
    
    foreach ($bot in $sortedBots) {
        # Saltar IPs reservadas
        while ("192.168.100.$ipCounter" -in $reservedIPs) {
            $ipCounter++
        }
        
        $newIP = "192.168.100.$ipCounter"
        $oldIP = $bot.ip
        
        if ($oldIP -ne $newIP) {
            Write-SystemLog "Reorganizando IP bot $($bot.id): $oldIP -> $newIP"
            
            if (!$DryRun) {
                $bot.ip = $newIP
                
                # Actualizar archivo de configuración si existe
                $botConfigFile = Join-Path $Global:SystemPaths.Configs "$($bot.id)" "config.json"
                if (Test-Path $botConfigFile) {
                    try {
                        $config = Get-Content $botConfigFile -Raw -Encoding UTF8 | ConvertFrom-Json
                        $config.network.ip = $newIP
                        $config | ConvertTo-Json -Depth 10 | Set-Content $botConfigFile -Encoding UTF8
                    } catch {
                        Write-SystemLog "Error actualizando configuración del bot $($bot.id): $($_.Exception.Message)" "WARN"
                    }
                }
            }
        }
        
        $ipCounter++
    }
    
    Write-SystemLog "Reorganización completada"
    return $sortedBots
}

function Show-RemovalSummary {
    param([object]$PreStatus, [object]$PostStatus, [array]$RemovedBots, [array]$Errors)
    
    Write-Host "`n=== RESUMEN DE REMOCIÓN ===" -ForegroundColor Cyan
    
    Write-Host "`nEstado antes:" -ForegroundColor Yellow
    Write-Host "  - Total de bots: $($PreStatus.totalBots)" -ForegroundColor Gray
    Write-Host "  - Configuraciones: $($PreStatus.configurations)" -ForegroundColor Gray
    
    Write-Host "`nOperación realizada:" -ForegroundColor Yellow
    Write-Host "  - Bots removidos: $($RemovedBots.Count)" -ForegroundColor Red
    Write-Host "  - Errores: $($Errors.Count)" -ForegroundColor $(if ($Errors.Count -gt 0) { "Red" } else { "Green" })
    Write-Host "  - Reorganizado: $(if ($Reorganize) { "SÍ" } else { "NO" })" -ForegroundColor White
    Write-Host "  - Modo DryRun: $(if ($DryRun) { "SÍ" } else { "NO" })" -ForegroundColor White
    
    if (!$DryRun) {
        Write-Host "`nEstado después:" -ForegroundColor Yellow
        Write-Host "  - Total de bots: $($PostStatus.totalBots) ($(if ($PostStatus.totalBots -lt $PreStatus.totalBots) { "-" + ($PreStatus.totalBots - $PostStatus.totalBots) } else { "sin cambios" }))" -ForegroundColor Gray
        Write-Host "  - Configuraciones: $($PostStatus.configurations)" -ForegroundColor Gray
    }
    
    if ($RemovedBots.Count -gt 0) {
        Write-Host "`nBots removidos:" -ForegroundColor Yellow
        foreach ($bot in $RemovedBots) {
            Write-Host "  - $($bot.id) ($($bot.type)) - IP: $($bot.ip)" -ForegroundColor Red
        }
    }
    
    if ($Errors.Count -gt 0) {
        Write-Host "`nErrores encontrados:" -ForegroundColor Red
        foreach ($error in $Errors) {
            Write-Host "  - $($error.botId): $($error.message)" -ForegroundColor Yellow
        }
    }
    
    if ($DryRun) {
        Write-Host "`nMODO DRY RUN ACTIVO - No se realizaron cambios reales" -ForegroundColor Yellow
    }
}

function Get-SystemStatus {
    $status = @{
        totalBots = 0
        configurations = 0
        runningProcesses = 0
    }
    
    # Contar bots en registro
    $registry = Get-SystemBotRegistry
    $status.totalBots = $registry.Count
    
    # Contar configuraciones
    if (Test-Path $Global:SystemPaths.Configs) {
        $configDirs = Get-ChildItem $Global:SystemPaths.Configs -Directory -ErrorAction SilentlyContinue
        $status.configurations = $configDirs.Count
    }
    
    # Contar procesos Node.js corriendo
    try {
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        $status.runningProcesses = $nodeProcesses.Count
    } catch {
        $status.runningProcesses = 0
    }
    
    return $status
}

# === VALIDACIONES DE ENTRADA ===
if (!$BotId -and !$BotType -and !$BotIP -and !$All) {
    Write-Error "Debe especificar al menos uno: -BotId, -BotType, -BotIP o -All"
    Write-Host "Ejemplos:"
    Write-Host "  Remove-Bot-System.ps1 -BotId 'BOT_123456_001'"
    Write-Host "  Remove-Bot-System.ps1 -BotType 'TRADER_BOT' -Count 2"
    Write-Host "  Remove-Bot-System.ps1 -BotIP '192.168.100.15'"
    Write-Host "  Remove-Bot-System.ps1 -All -Force"
    exit 1
}

try {
    Write-SystemLog "=== INICIANDO REMOCIÓN DE BOTS QBTC UNIFIED ==="
    Write-SystemLog "Parámetros: BotId=$BotId, BotType=$BotType, BotIP=$BotIP, All=$All, Count=$Count"
    Write-SystemLog "Opciones: Reorganize=$Reorganize, DryRun=$DryRun, Force=$Force"
    
    # Estado inicial del sistema
    $preOperationStatus = Get-SystemStatus
    Write-SystemLog "Estado inicial - Total bots: $($preOperationStatus.totalBots), Configuraciones: $($preOperationStatus.configurations)"
    
    # Cargar registro de bots
    $allBots = @(Get-SystemBotRegistry)
    if ($allBots.Count -eq 0) {
        Write-Host "No hay bots registrados en el sistema" -ForegroundColor Yellow
        exit 0
    }
    
    # Crear backup si está habilitado
    if (!$DryRun) {
        Backup-SystemRegistry
    }
    
    # Encontrar bots a remover
    $botsToRemove = Find-BotsToRemove -AllBots $allBots
    Write-SystemLog "Bots seleccionados para remoción: $($botsToRemove.Count)"
    
    if ($botsToRemove.Count -eq 0) {
        Write-Host "No se encontraron bots que coincidan con los criterios" -ForegroundColor Yellow
        exit 0
    }
    
    # Mostrar bots a remover y pedir confirmación
    if (!$DryRun -and !$Force) {
        Write-Host "`nBots seleccionados para remoción:" -ForegroundColor Yellow
        foreach ($bot in $botsToRemove) {
            $botInfo = "$($bot.id) ($($bot.type))"
            if ($bot.ip) { $botInfo += " - IP: $($bot.ip)" }
            Write-Host "  - $botInfo" -ForegroundColor White
        }
        
        $confirm = Read-Host "`n¿Está seguro de que desea remover estos $($botsToRemove.Count) bots? (s/N)"
        if ($confirm -ne "s" -and $confirm -ne "S") {
            Write-Host "Operación cancelada" -ForegroundColor Yellow
            exit 0
        }
    }
    
    # Procesar remoción
    $errors = @()
    $successfullyRemoved = @()
    
    try {
        # Detener procesos de bots
        Stop-BotProcesses -BotsToRemove $botsToRemove
        
        # Remover configuraciones
        Remove-BotConfigurations -BotsToRemove $botsToRemove
        
        # Calcular bots restantes
        $remainingBots = $allBots | Where-Object { $_.id -notin $botsToRemove.id }
        Write-SystemLog "Bots restantes después de remoción: $($remainingBots.Count)"
        
        # Reorganizar si se solicita
        if ($Reorganize) {
            $remainingBots = Reorganize-RemainingBots -RemainingBots $remainingBots
        }
        
        # Guardar registro actualizado
        if (!$DryRun) {
            Save-SystemBotRegistry -Registry $remainingBots
        }
        
        $successfullyRemoved = $botsToRemove
        
    } catch {
        $errors += @{
            botId = "SYSTEM"
            message = $_.Exception.Message
        }
        Write-SystemLog "Error durante la remoción: $($_.Exception.Message)" "ERROR"
    }
    
    # Estado final del sistema
    $postOperationStatus = if (!$DryRun) { Get-SystemStatus } else { $preOperationStatus }
    
    # Mostrar resumen
    Show-RemovalSummary -PreStatus $preOperationStatus -PostStatus $postOperationStatus -RemovedBots $successfullyRemoved -Errors $errors
    
    if ($successfullyRemoved.Count -gt 0) {
        Write-Host "`nOperación completada exitosamente!" -ForegroundColor Green
        Write-SystemLog "Remoción completada - $($successfullyRemoved.Count) bots removidos"
        
        if ($Reorganize) {
            Write-Host "Los bots restantes han sido reorganizados automáticamente" -ForegroundColor Yellow
        }
        
        # Sugerir próximos pasos
        Write-Host "`nPróximos pasos recomendados:" -ForegroundColor Cyan
        Write-Host "  - Verificar estado: .\\scripts\\Manage-Bots.ps1 -Action Stats" -ForegroundColor Gray
        Write-Host "  - Agregar nuevos bots: .\\scripts\\Add-Bot-Wrapper.ps1 -BotType TRADER_BOT" -ForegroundColor Gray
        
    } else {
        Write-Host "`nNo se removieron bots (posibles errores)" -ForegroundColor Yellow
    }
    
} catch {
    Write-SystemLog "Error fatal en proceso de remoción: $($_.Exception.Message)" "ERROR"
    Write-Host "Error fatal: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Gray
    exit 1
}
