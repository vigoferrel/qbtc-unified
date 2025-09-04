# Remove-Bot.ps1 - Script para remover bots del sistema QBTC
# Reorganiza automaticamente IPs y puertos manteniendo secuencia
# Sistema Windows PowerShell con codificacion ASCII

param(
    [Parameter(Mandatory=$false)]
    [string]$BotId = "",
    
    [Parameter(Mandatory=$false)]
    [string]$BotType = "",
    
    [Parameter(Mandatory=$false)]
    [string]$BotIP = "",
    
    [Parameter(Mandatory=$false)]
    [int]$Count = 0,
    
    [Parameter(Mandatory=$false)]
    [string]$ConfigPath = "C:\Users\DELL\Desktop\QBTC-UNIFIED\bots\configs",
    
    [Parameter(Mandatory=$false)]
    [string]$RegistryPath = "C:\Users\DELL\Desktop\QBTC-UNIFIED\bots\registry",
    
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

# Configuracion global (misma que Add-Bot.ps1)
$Global:BotConfig = @{
    BaseIP = "192.168.100"
    StartIP = 10
    MaxIP = 250
    BasePort = 10000
    PortOffset = @{
        "TRADER_BOT" = 0
        "SCALPER_BOT" = 100
        "ARBITRAGE_BOT" = 200
        "QUANTUM_ANALYZER" = 300
        "RISK_MANAGER" = 400
        "MONITOR_BOT" = 500
        "DATA_COLLECTOR" = 600
        "SIGNAL_PROCESSOR" = 700
    }
    ServicePortOffsets = @{
        main = 0
        websocket = 10
        metrics = 20
        logs = 30
        health = 40
        debug = 50
        monitoring = 60
        alerts = 70
        performance = 80
        backup = 90
    }
    BotTypes = @(
        "TRADER_BOT",
        "SCALPER_BOT", 
        "ARBITRAGE_BOT",
        "QUANTUM_ANALYZER",
        "RISK_MANAGER",
        "MONITOR_BOT",
        "DATA_COLLECTOR",
        "SIGNAL_PROCESSOR"
    )
}

# Funcion para logging con timestamps
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage
    
    $logFile = Join-Path $RegistryPath "bot-management.log"
    if (Test-Path (Split-Path $logFile)) {
        Add-Content -Path $logFile -Value $logMessage -Encoding ASCII
    }
}

# Funcion para crear backup del registro
function Backup-BotRegistry {
    param([array]$Registry)
    
    if (!$Backup) {
        return
    }
    
    $backupDir = Join-Path $RegistryPath "backup"
    if (!(Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    }
    
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupFile = Join-Path $backupDir "bot-registry-backup-$timestamp.json"
    
    try {
        $Registry | ConvertTo-Json -Depth 10 | Set-Content $backupFile -Encoding UTF8
        Write-Log "Backup del registro creado: $backupFile"
    } catch {
        Write-Log "Error creando backup: $($_.Exception.Message)" "WARN"
    }
}

# Funcion para cargar registro de bots
function Get-BotRegistry {
    $registryFile = Join-Path $RegistryPath "bot-registry.json"
    
    if (Test-Path $registryFile) {
        try {
            $content = Get-Content $registryFile -Raw -Encoding UTF8
            return $content | ConvertFrom-Json
        } catch {
            Write-Log "Error cargando registro de bots: $($_.Exception.Message)" "ERROR"
            return @()
        }
    }
    
    return @()
}

# Funcion para guardar registro de bots
function Save-BotRegistry {
    param([array]$Registry)
    
    $registryFile = Join-Path $RegistryPath "bot-registry.json"
    
    try {
        $Registry | ConvertTo-Json -Depth 10 | Set-Content $registryFile -Encoding UTF8
        Write-Log "Registro de bots guardado: $registryFile"
    } catch {
        Write-Log "Error guardando registro de bots: $($_.Exception.Message)" "ERROR"
        throw
    }
}

# Funcion para detener proceso del bot si esta corriendo
function Stop-BotProcess {
    param([object]$Bot)
    
    if (!$Bot.network -or !$Bot.network.port) {
        return
    }
    
    try {
        $connection = Get-NetTCPConnection -LocalPort $Bot.network.port -ErrorAction SilentlyContinue
        if ($connection) {
            $processId = $connection.OwningProcess
            if ($processId) {
                Write-Log "Deteniendo proceso $processId para bot $($Bot.bot.id)"
                if (!$DryRun) {
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                }
                Write-Log "Bot $($Bot.bot.id) detenido"
            }
        }
    } catch {
        Write-Log "Bot $($Bot.bot.id) no estaba corriendo" "INFO"
    }
}

# Funcion para remover archivos de configuracion del bot
function Remove-BotConfigFiles {
    param([object]$Bot)
    
    $botId = $Bot.bot.id
    $botDir = Join-Path $ConfigPath $botId
    
    if (Test-Path $botDir) {
        Write-Log "Removiendo directorio de configuracion: $botDir"
        if (!$DryRun) {
            Remove-Item -Path $botDir -Recurse -Force
        }
    }
    
    # Remover archivo de red si existe
    $networkPath = Join-Path $RegistryPath "network"
    $networkFile = Join-Path $networkPath "$botId-network.json"
    if (Test-Path $networkFile) {
        Write-Log "Removiendo configuracion de red: $networkFile"
        if (!$DryRun) {
            Remove-Item -Path $networkFile -Force
        }
    }
}

# Funcion para encontrar bots a remover
function Find-BotsToRemove {
    param([array]$AllBots)
    
    $botsToRemove = @()
    
    if ($All) {
        $botsToRemove = $AllBots
        Write-Log "Removiendo TODOS los bots ($($AllBots.Count))"
    }
    elseif ($BotId) {
        $bot = $AllBots | Where-Object { $_.bot.id -eq $BotId }
        if ($bot) {
            $botsToRemove = @($bot)
        } else {
            throw "Bot con ID '$BotId' no encontrado"
        }
    }
    elseif ($BotType) {
        $botsOfType = @($AllBots | Where-Object { $_.bot.type -eq $BotType })
        if ($botsOfType.Count -eq 0) {
            throw "No se encontraron bots del tipo '$BotType'"
        }
        
        if ($Count -gt 0) {
            $botsToRemove = $botsOfType | Select-Object -Last $Count
            Write-Log "Removiendo los ultimos $Count bots del tipo $BotType"
        } else {
            $botsToRemove = $botsOfType
            Write-Log "Removiendo TODOS los bots del tipo $BotType ($($botsOfType.Count))"
        }
    }
    elseif ($BotIP) {
        $bot = $AllBots | Where-Object { $_.network.ip -eq $BotIP }
        if ($bot) {
            $botsToRemove = @($bot)
        } else {
            throw "Bot con IP '$BotIP' no encontrado"
        }
    }
    else {
        throw "Debe especificar -BotId, -BotType, -BotIP o -All"
    }
    
    return $botsToRemove
}

# Funcion para reorganizar IPs secuencialmente
function Reorganize-BotIPs {
    param([array]$RemainingBots)
    
    if (!$Reorganize -or $RemainingBots.Count -eq 0) {
        return $RemainingBots
    }
    
    Write-Log "Iniciando reorganizacion de IPs para $($RemainingBots.Count) bots"
    
    # Ordenar bots por tipo y luego por ID
    $sortedBots = $RemainingBots | Sort-Object { $_.bot.type }, { $_.bot.created }
    
    # Reorganizar IPs secuencialmente
    $ipCounter = $Global:BotConfig.StartIP
    $reservedIPs = @("192.168.100.1", "192.168.100.2", "192.168.100.3")
    
    foreach ($bot in $sortedBots) {
        # Saltar IPs reservadas
        while ("$($Global:BotConfig.BaseIP).$ipCounter" -in $reservedIPs) {
            $ipCounter++
        }
        
        $newIP = "$($Global:BotConfig.BaseIP).$ipCounter"
        $oldIP = $bot.network.ip
        
        if ($oldIP -ne $newIP) {
            Write-Log "Reorganizando bot $($bot.bot.id): $oldIP -> $newIP"
            if (!$DryRun) {
                $bot.network.ip = $newIP
                
                # Actualizar archivo de configuracion del bot
                $botConfigFile = Join-Path $ConfigPath "$($bot.bot.id)" "config.json"
                if (Test-Path $botConfigFile) {
                    $bot | ConvertTo-Json -Depth 10 | Set-Content $botConfigFile -Encoding UTF8
                }
            }
        }
        
        $ipCounter++
    }
    
    return $sortedBots
}

# Funcion para reorganizar puertos por tipo de bot
function Reorganize-BotPorts {
    param([array]$RemainingBots)
    
    if (!$Reorganize -or $RemainingBots.Count -eq 0) {
        return $RemainingBots
    }
    
    Write-Log "Iniciando reorganizacion de puertos"
    
    # Agrupar bots por tipo
    $botsByType = $RemainingBots | Group-Object { $_.bot.type }
    
    foreach ($typeGroup in $botsByType) {
        $botType = $typeGroup.Name
        $botsOfType = $typeGroup.Group | Sort-Object { $_.bot.created }
        
        $typeOffset = $Global:BotConfig.PortOffset[$botType]
        if ($null -eq $typeOffset) {
            $typeOffset = 0
        }
        
        $basePort = $Global:BotConfig.BasePort + $typeOffset
        $portIndex = 0
        
        foreach ($bot in $botsOfType) {
            $newBasePort = $basePort + $portIndex
            $oldBasePort = $bot.network.port
            
            if ($oldBasePort -ne $newBasePort) {
                Write-Log "Reorganizando puertos bot $($bot.bot.id): $oldBasePort -> $newBasePort"
                
                if (!$DryRun) {
                    # Actualizar puertos en la configuracion
                    $bot.network.port = $newBasePort
                    
                    # Actualizar puertos de servicios
                    foreach ($serviceName in $Global:BotConfig.ServicePortOffsets.Keys) {
                        $offset = $Global:BotConfig.ServicePortOffsets[$serviceName]
                        $newPort = $newBasePort + $offset
                        
                        if ($bot.services.$serviceName) {
                            $bot.services.$serviceName.port = $newPort
                        }
                        
                        # Actualizar puertos especiales en network
                        switch ($serviceName) {
                            "websocket" { $bot.network.wsPort = $newPort }
                            "metrics" { $bot.network.metricsPort = $newPort }
                        }
                        
                        # Actualizar puertos en monitoring
                        if ($bot.monitoring) {
                            if ($serviceName -eq "health" -and $bot.monitoring.healthCheck) {
                                $bot.monitoring.healthCheck.port = $newPort
                            }
                            if ($serviceName -eq "logs" -and $bot.monitoring.logging) {
                                $bot.monitoring.logging.port = $newPort
                            }
                            if ($serviceName -eq "metrics" -and $bot.monitoring.metrics) {
                                $bot.monitoring.metrics.port = $newPort
                            }
                        }
                    }
                    
                    # Actualizar archivo de configuracion del bot
                    $botConfigFile = Join-Path $ConfigPath "$($bot.bot.id)" "config.json"
                    if (Test-Path $botConfigFile) {
                        $bot | ConvertTo-Json -Depth 10 | Set-Content $botConfigFile -Encoding UTF8
                    }
                }
            }
            
            $portIndex++
        }
    }
    
    return $RemainingBots
}

# Funcion principal para remover bots
function Remove-Bots {
    param([array]$BotsToRemove, [array]$AllBots)
    
    $results = @()
    $removedBots = @()
    
    foreach ($bot in $BotsToRemove) {
        try {
            Write-Log "Removiendo bot: $($bot.bot.id) ($($bot.bot.type)) - IP: $($bot.network.ip)"
            
            # Detener proceso si esta corriendo
            Stop-BotProcess -Bot $bot
            
            # Remover archivos de configuracion
            Remove-BotConfigFiles -Bot $bot
            
            $removedBots += $bot
            $results += @{
                botId = $bot.bot.id
                type = $bot.bot.type
                ip = $bot.network.ip
                success = $true
                action = "removed"
            }
            
            Write-Log "Bot $($bot.bot.id) removido exitosamente"
            
        } catch {
            Write-Log "Error removiendo bot $($bot.bot.id): $($_.Exception.Message)" "ERROR"
            $results += @{
                botId = $bot.bot.id
                type = $bot.bot.type
                success = $false
                error = $_.Exception.Message
                action = "error"
            }
            
            if (!$Force) {
                throw
            }
        }
    }
    
    # Obtener bots restantes
    $remainingBots = @($AllBots | Where-Object { $_.bot.id -notin $removedBots.bot.id })
    
    Write-Log "Bots removidos: $($removedBots.Count), Bots restantes: $($remainingBots.Count)"
    
    return @{
        results = $results
        remainingBots = $remainingBots
    }
}

# Funcion para generar reporte de cambios
function New-RemovalReport {
    param([array]$Results, [array]$RemainingBots, [array]$OriginalBots)
    
    $reportData = @{
        operation = "bot_removal"
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        summary = @{
            originalBotCount = $OriginalBots.Count
            removedBotCount = ($Results | Where-Object { $_.success -and $_.action -eq "removed" }).Count
            remainingBotCount = $RemainingBots.Count
            reorganized = $Reorganize
            dryRun = $DryRun
        }
        removedBots = $Results | Where-Object { $_.success -and $_.action -eq "removed" } | ForEach-Object {
            @{
                botId = $_.botId
                type = $_.type
                ip = $_.ip
            }
        }
        errors = $Results | Where-Object { !$_.success } | ForEach-Object {
            @{
                botId = $_.botId
                error = $_.error
            }
        }
        remainingBots = $RemainingBots | ForEach-Object {
            @{
                botId = $_.bot.id
                type = $_.bot.type
                ip = $_.network.ip
                port = $_.network.port
            }
        }
    }
    
    $reportFile = Join-Path $RegistryPath "removal-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    $reportData | ConvertTo-Json -Depth 10 | Set-Content $reportFile -Encoding UTF8
    Write-Log "Reporte de remocion generado: $reportFile"
    
    return $reportData
}

# Validar que al menos un parametro de seleccion este presente
if (!$BotId -and !$BotType -and !$BotIP -and !$All) {
    Write-Error "Debe especificar al menos uno: -BotId, -BotType, -BotIP o -All"
    Write-Host "Ejemplos:"
    Write-Host "  Remove-Bot.ps1 -BotId 'BOT_123456_001'"
    Write-Host "  Remove-Bot.ps1 -BotType 'TRADER_BOT' -Count 2"
    Write-Host "  Remove-Bot.ps1 -BotIP '192.168.100.15'"
    Write-Host "  Remove-Bot.ps1 -All -Force"
    exit 1
}

try {
    Write-Log "Iniciando proceso de remocion de bots" "INFO"
    Write-Log "Parametros: BotId=$BotId, BotType=$BotType, BotIP=$BotIP, All=$All, Reorganize=$Reorganize, DryRun=$DryRun"
    
    # Cargar registro existente
    $allBots = @(Get-BotRegistry)
    if ($allBots.Count -eq 0) {
        Write-Host "No hay bots registrados" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Log "Bots registrados encontrados: $($allBots.Count)"
    
    # Crear backup antes de realizar cambios
    if (!$DryRun) {
        Backup-BotRegistry -Registry $allBots
    }
    
    # Encontrar bots a remover
    $botsToRemove = Find-BotsToRemove -AllBots $allBots
    Write-Log "Bots seleccionados para remocion: $($botsToRemove.Count)"
    
    if ($botsToRemove.Count -eq 0) {
        Write-Host "No se encontraron bots que coincidan con los criterios" -ForegroundColor Yellow
        exit 0
    }
    
    # Confirmar operacion si no es DryRun y no se uso -Force
    if (!$DryRun -and !$Force) {
        Write-Host "`nBots a remover:" -ForegroundColor Yellow
        foreach ($bot in $botsToRemove) {
            Write-Host "  - $($bot.bot.id) ($($bot.bot.type)) - IP: $($bot.network.ip)" -ForegroundColor White
        }
        
        $confirm = Read-Host "`nEsta seguro de que desea remover estos $($botsToRemove.Count) bots? (s/N)"
        if ($confirm -ne "s" -and $confirm -ne "S") {
            Write-Host "Operacion cancelada" -ForegroundColor Yellow
            exit 0
        }
    }
    
    # Remover bots
    $removalResult = Remove-Bots -BotsToRemove $botsToRemove -AllBots $allBots
    $remainingBots = $removalResult.remainingBots
    
    # Reorganizar si se solicito
    if ($Reorganize -and $remainingBots.Count -gt 0) {
        Write-Log "Reorganizando bots restantes"
        $remainingBots = Reorganize-BotIPs -RemainingBots $remainingBots
        $remainingBots = Reorganize-BotPorts -RemainingBots $remainingBots
    }
    
    # Guardar registro actualizado
    if (!$DryRun) {
        Save-BotRegistry -Registry $remainingBots
    }
    
    # Generar reporte
    $report = New-RemovalReport -Results $removalResult.results -RemainingBots $remainingBots -OriginalBots $allBots
    
    # Mostrar resumen
    Write-Host "`n=== RESUMEN DE REMOCION ===" -ForegroundColor Cyan
    Write-Host "Bots originales: $($allBots.Count)" -ForegroundColor White
    Write-Host "Bots removidos: $($report.summary.removedBotCount)" -ForegroundColor Red
    Write-Host "Bots restantes: $($report.summary.remainingBotCount)" -ForegroundColor Green
    Write-Host "Reorganizado: $($report.summary.reorganized)" -ForegroundColor White
    
    if ($DryRun) {
        Write-Host "MODO DRY RUN - No se realizaron cambios reales" -ForegroundColor Yellow
    } else {
        Write-Host "Registro actualizado en: $RegistryPath" -ForegroundColor White
    }
    
    # Mostrar errores si los hay
    if ($report.errors.Count -gt 0) {
        Write-Host "`nErrores encontrados:" -ForegroundColor Red
        foreach ($error in $report.errors) {
            Write-Host "  - $($error.botId): $($error.error)" -ForegroundColor Yellow
        }
    }
    
    Write-Log "Proceso de remocion completado exitosamente"
    
} catch {
    Write-Log "Error en el proceso de remocion: $($_.Exception.Message)" "ERROR"
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
