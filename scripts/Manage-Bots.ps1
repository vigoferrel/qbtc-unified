# Manage-Bots.ps1 - Script de gestion y consulta de bots del sistema QBTC
# Lista, consulta estado, estadisticas y operaciones de mantenimiento
# Sistema Windows PowerShell con codificacion ASCII

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("List", "Status", "Stats", "Health", "Ports", "IPs", "Types", "Network", "Cleanup", "Validate")]
    [string]$Action = "List",
    
    [Parameter(Mandatory=$false)]
    [string]$BotId = "",
    
    [Parameter(Mandatory=$false)]
    [string]$BotType = "",
    
    [Parameter(Mandatory=$false)]
    [string]$Format = "Table",
    
    [Parameter(Mandatory=$false)]
    [string]$ConfigPath = "C:\Users\DELL\Desktop\QBTC-UNIFIED\bots\configs",
    
    [Parameter(Mandatory=$false)]
    [string]$RegistryPath = "C:\Users\DELL\Desktop\QBTC-UNIFIED\bots\registry",
    
    [Parameter(Mandatory=$false)]
    [switch]$Export,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputFile = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$ShowDetails,
    
    [Parameter(Mandatory=$false)]
    [switch]$IncludeOffline
)

# Configuracion global
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

# Funcion para logging
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Verbose $logMessage
}

# Funcion para cargar registro de bots
function Get-BotRegistry {
    $registryFile = Join-Path $RegistryPath "bot-registry.json"
    
    if (Test-Path $registryFile) {
        try {
            $content = Get-Content $registryFile -Raw -Encoding UTF8
            return $content | ConvertFrom-Json
        } catch {
            Write-Warning "Error cargando registro de bots: $($_.Exception.Message)"
            return @()
        }
    }
    
    return @()
}

# Funcion para verificar si un bot esta corriendo
function Test-BotRunning {
    param([object]$Bot)
    
    if (!$Bot.network -or !$Bot.network.port) {
        return $false
    }
    
    try {
        $connection = Get-NetTCPConnection -LocalPort $Bot.network.port -ErrorAction SilentlyContinue
        return $connection -ne $null
    } catch {
        return $false
    }
}

# Funcion para obtener estadisticas de uso de puertos
function Get-PortStatistics {
    param([array]$Bots)
    
    $portUsage = @{}
    $portRanges = @{}
    
    foreach ($bot in $Bots) {
        $botType = $bot.bot.type
        
        if (!$portRanges.ContainsKey($botType)) {
            $portRanges[$botType] = @{
                min = $null
                max = $null
                count = 0
                ports = @()
            }
        }
        
        # Recopilar todos los puertos del bot
        $botPorts = @()
        if ($bot.services) {
            foreach ($service in $bot.services.PSObject.Properties) {
                if ($service.Value.port) {
                    $botPorts += $service.Value.port
                }
            }
        }
        
        foreach ($port in $botPorts) {
            if (!$portUsage.ContainsKey($port)) {
                $portUsage[$port] = @()
            }
            $portUsage[$port] += @{
                botId = $bot.bot.id
                botType = $bot.bot.type
                service = "unknown"
            }
            
            $portRanges[$botType].ports += $port
            $portRanges[$botType].count++
            
            if ($portRanges[$botType].min -eq $null -or $port -lt $portRanges[$botType].min) {
                $portRanges[$botType].min = $port
            }
            if ($portRanges[$botType].max -eq $null -or $port -gt $portRanges[$botType].max) {
                $portRanges[$botType].max = $port
            }
        }
    }
    
    return @{
        usage = $portUsage
        ranges = $portRanges
        conflicts = $portUsage.Keys | Where-Object { $portUsage[$_].Count -gt 1 }
    }
}

# Funcion para obtener estadisticas de IPs
function Get-IPStatistics {
    param([array]$Bots)
    
    $ipUsage = @{}
    $usedIPs = @()
    $reservedIPs = @("192.168.100.1", "192.168.100.2", "192.168.100.3")
    
    foreach ($bot in $Bots) {
        if ($bot.network -and $bot.network.ip) {
            $ip = $bot.network.ip
            $usedIPs += $ip
            
            if (!$ipUsage.ContainsKey($ip)) {
                $ipUsage[$ip] = @()
            }
            $ipUsage[$ip] += @{
                botId = $bot.bot.id
                botType = $bot.bot.type
            }
        }
    }
    
    $totalRange = $Global:BotConfig.MaxIP - $Global:BotConfig.StartIP + 1
    $availableIPs = @()
    
    for ($i = $Global:BotConfig.StartIP; $i -le $Global:BotConfig.MaxIP; $i++) {
        $testIP = "$($Global:BotConfig.BaseIP).$i"
        if ($testIP -notin $usedIPs -and $testIP -notin $reservedIPs) {
            $availableIPs += $testIP
        }
    }
    
    return @{
        usage = $ipUsage
        usedIPs = $usedIPs
        availableIPs = $availableIPs
        reservedIPs = $reservedIPs
        totalRange = $totalRange
        usedCount = $usedIPs.Count
        availableCount = $availableIPs.Count
        utilization = [math]::Round(($usedIPs.Count / $totalRange) * 100, 2)
        conflicts = $ipUsage.Keys | Where-Object { $ipUsage[$_].Count -gt 1 }
    }
}

# Funcion para listar bots
function Show-BotList {
    param([array]$Bots, [string]$FilterType = "", [string]$FilterId = "")
    
    $filteredBots = $Bots
    
    if ($FilterType) {
        $filteredBots = $filteredBots | Where-Object { $_.bot.type -eq $FilterType }
    }
    
    if ($FilterId) {
        $filteredBots = $filteredBots | Where-Object { $_.bot.id -like "*$FilterId*" }
    }
    
    if ($filteredBots.Count -eq 0) {
        Write-Host "No se encontraron bots con los criterios especificados" -ForegroundColor Yellow
        return
    }
    
    Write-Host "`n=== LISTADO DE BOTS ($($filteredBots.Count)) ===" -ForegroundColor Cyan
    
    $botData = @()
    foreach ($bot in $filteredBots) {
        $isRunning = Test-BotRunning -Bot $bot
        $status = if ($isRunning) { "RUNNING" } else { "OFFLINE" }
        $statusColor = if ($isRunning) { "Green" } else { "Red" }
        
        if (!$IncludeOffline -and !$isRunning) {
            continue
        }
        
        $botInfo = [PSCustomObject]@{
            "Bot ID" = $bot.bot.id
            "Tipo" = $bot.bot.type
            "IP" = $bot.network.ip
            "Puerto" = $bot.network.port
            "Estado" = $status
            "Creado" = $bot.bot.created
        }
        
        $botData += $botInfo
    }
    
    if ($Format -eq "Table" -or $Format -eq "List") {
        $botData | Format-Table -AutoSize
    } elseif ($Format -eq "Json") {
        $botData | ConvertTo-Json -Depth 3
    } elseif ($Format -eq "Csv") {
        $botData | ConvertTo-Csv -NoTypeInformation
    }
}

# Funcion para mostrar estado detallado de bots
function Show-BotStatus {
    param([array]$Bots, [string]$FilterId = "")
    
    $targetBots = $Bots
    if ($FilterId) {
        $targetBots = $Bots | Where-Object { $_.bot.id -eq $FilterId }
    }
    
    Write-Host "`n=== ESTADO DETALLADO DE BOTS ===" -ForegroundColor Cyan
    
    foreach ($bot in $targetBots) {
        $isRunning = Test-BotRunning -Bot $bot
        $statusColor = if ($isRunning) { "Green" } else { "Red" }
        $statusText = if ($isRunning) { "RUNNING" } else { "OFFLINE" }
        
        Write-Host "`nBot: $($bot.bot.id)" -ForegroundColor White
        Write-Host "  Tipo: $($bot.bot.type)"
        Write-Host "  Estado: $statusText" -ForegroundColor $statusColor
        Write-Host "  IP: $($bot.network.ip)"
        Write-Host "  Puerto Principal: $($bot.network.port)"
        Write-Host "  Creado: $($bot.bot.created)"
        
        if ($ShowDetails -and $bot.services) {
            Write-Host "  Servicios:"
            foreach ($service in $bot.services.PSObject.Properties) {
                $serviceName = $service.Name
                $serviceInfo = $service.Value
                Write-Host "    - $($serviceInfo.name): Puerto $($serviceInfo.port)" -ForegroundColor Gray
            }
        }
        
        if ($ShowDetails -and $bot.trading) {
            Write-Host "  Trading:"
            Write-Host "    - Habilitado: $($bot.trading.enabled)"
            if ($bot.trading.strategy) {
                Write-Host "    - Estrategia: $($bot.trading.strategy)"
            }
            if ($bot.trading.riskLevel) {
                Write-Host "    - Nivel de Riesgo: $($bot.trading.riskLevel)"
            }
        }
    }
}

# Funcion para mostrar estadisticas generales
function Show-BotStatistics {
    param([array]$Bots)
    
    Write-Host "`n=== ESTADISTICAS GENERALES ===" -ForegroundColor Cyan
    
    # Estadisticas basicas
    $runningBots = $Bots | Where-Object { Test-BotRunning -Bot $_ }
    $botsByType = $Bots | Group-Object { $_.bot.type }
    
    Write-Host "`nResumen General:"
    Write-Host "  Total de Bots: $($Bots.Count)" -ForegroundColor White
    Write-Host "  Bots Activos: $($runningBots.Count)" -ForegroundColor Green
    Write-Host "  Bots Inactivos: $($Bots.Count - $runningBots.Count)" -ForegroundColor Red
    
    Write-Host "`nPor Tipo de Bot:"
    foreach ($typeGroup in $botsByType) {
        $typeRunning = $typeGroup.Group | Where-Object { Test-BotRunning -Bot $_ }
        Write-Host "  $($typeGroup.Name): $($typeGroup.Count) total, $($typeRunning.Count) activos" -ForegroundColor Gray
    }
    
    # Estadisticas de IPs
    $ipStats = Get-IPStatistics -Bots $Bots
    Write-Host "`nUso de IPs:"
    Write-Host "  Rango Total: $($Global:BotConfig.BaseIP).$($Global:BotConfig.StartIP)-$($Global:BotConfig.MaxIP)"
    Write-Host "  IPs Utilizadas: $($ipStats.usedCount)" -ForegroundColor Yellow
    Write-Host "  IPs Disponibles: $($ipStats.availableCount)" -ForegroundColor Green
    Write-Host "  Utilizacion: $($ipStats.utilization)%" -ForegroundColor White
    
    if ($ipStats.conflicts.Count -gt 0) {
        Write-Host "  CONFLICTOS DE IP: $($ipStats.conflicts.Count)" -ForegroundColor Red
    }
    
    # Estadisticas de puertos
    $portStats = Get-PortStatistics -Bots $Bots
    Write-Host "`nUso de Puertos:"
    Write-Host "  Total de Puertos Asignados: $($portStats.usage.Keys.Count)" -ForegroundColor White
    
    foreach ($typeRange in $portStats.ranges.Keys) {
        $range = $portStats.ranges[$typeRange]
        if ($range.count -gt 0) {
            Write-Host "  $typeRange : $($range.min)-$($range.max) ($($range.count) puertos)" -ForegroundColor Gray
        }
    }
    
    if ($portStats.conflicts.Count -gt 0) {
        Write-Host "  CONFLICTOS DE PUERTO: $($portStats.conflicts.Count)" -ForegroundColor Red
    }
}

# Funcion para verificar salud de los bots
function Test-BotHealth {
    param([array]$Bots)
    
    Write-Host "`n=== VERIFICACION DE SALUD ===" -ForegroundColor Cyan
    
    $healthResults = @()
    
    foreach ($bot in $Bots) {
        $healthStatus = @{
            botId = $bot.bot.id
            botType = $bot.bot.type
            ip = $bot.network.ip
            port = $bot.network.port
            running = Test-BotRunning -Bot $bot
            issues = @()
        }
        
        # Verificar si el bot esta corriendo
        if (!$healthStatus.running) {
            $healthStatus.issues += "Bot no esta corriendo"
        }
        
        # Verificar archivos de configuracion
        $botConfigDir = Join-Path $ConfigPath $bot.bot.id
        if (!(Test-Path $botConfigDir)) {
            $healthStatus.issues += "Directorio de configuracion no encontrado"
        } else {
            $configFile = Join-Path $botConfigDir "config.json"
            if (!(Test-Path $configFile)) {
                $healthStatus.issues += "Archivo config.json no encontrado"
            }
        }
        
        # Verificar conflictos de IP
        $ipConflicts = $Bots | Where-Object { $_.network.ip -eq $bot.network.ip -and $_.bot.id -ne $bot.bot.id }
        if ($ipConflicts.Count -gt 0) {
            $healthStatus.issues += "Conflicto de IP con otros bots"
        }
        
        # Verificar conflictos de puerto
        $portConflicts = $Bots | Where-Object { 
            $_.network.port -eq $bot.network.port -and $_.bot.id -ne $bot.bot.id 
        }
        if ($portConflicts.Count -gt 0) {
            $healthStatus.issues += "Conflicto de puerto con otros bots"
        }
        
        $healthResults += $healthStatus
    }
    
    # Mostrar resultados
    $healthyBots = $healthResults | Where-Object { $_.issues.Count -eq 0 }
    $problematicBots = $healthResults | Where-Object { $_.issues.Count -gt 0 }
    
    Write-Host "`nResumen de Salud:"
    Write-Host "  Bots Saludables: $($healthyBots.Count)" -ForegroundColor Green
    Write-Host "  Bots con Problemas: $($problematicBots.Count)" -ForegroundColor Red
    
    if ($problematicBots.Count -gt 0) {
        Write-Host "`nBots con Problemas:"
        foreach ($problematicBot in $problematicBots) {
            Write-Host "  $($problematicBot.botId):" -ForegroundColor Yellow
            foreach ($issue in $problematicBot.issues) {
                Write-Host "    - $issue" -ForegroundColor Red
            }
        }
    }
    
    return $healthResults
}

# Funcion para mostrar informacion de red
function Show-NetworkInfo {
    param([array]$Bots)
    
    Write-Host "`n=== INFORMACION DE RED ===" -ForegroundColor Cyan
    
    $ipStats = Get-IPStatistics -Bots $Bots
    $portStats = Get-PortStatistics -Bots $Bots
    
    Write-Host "`nConfiguracion de Red:"
    Write-Host "  Red Base: $($Global:BotConfig.BaseIP).0/24"
    Write-Host "  Rango de IPs: $($Global:BotConfig.BaseIP).$($Global:BotConfig.StartIP) - $($Global:BotConfig.BaseIP).$($Global:BotConfig.MaxIP)"
    Write-Host "  Gateway: 192.168.100.1"
    Write-Host "  DNS: 8.8.8.8, 8.8.4.4"
    
    Write-Host "`nUso de IPs:"
    Write-Host "  Total Disponibles: $($ipStats.totalRange)"
    Write-Host "  En Uso: $($ipStats.usedCount) ($($ipStats.utilization)%)"
    Write-Host "  Disponibles: $($ipStats.availableCount)"
    Write-Host "  Reservadas: $($ipStats.reservedIPs.Count)"
    
    if ($ShowDetails) {
        Write-Host "`nPrimeras IPs Disponibles:"
        $ipStats.availableIPs | Select-Object -First 10 | ForEach-Object {
            Write-Host "    $_" -ForegroundColor Green
        }
    }
    
    Write-Host "`nUso de Puertos:"
    Write-Host "  Puerto Base: $($Global:BotConfig.BasePort)"
    Write-Host "  Puertos Asignados: $($portStats.usage.Keys.Count)"
    
    Write-Host "`nRangos por Tipo de Bot:"
    foreach ($botType in $Global:BotConfig.BotTypes) {
        $offset = $Global:BotConfig.PortOffset[$botType]
        $basePort = $Global:BotConfig.BasePort + $offset
        $maxPort = $basePort + 99  # 100 puertos por tipo
        
        $botsOfType = $Bots | Where-Object { $_.bot.type -eq $botType }
        Write-Host "  $botType : $basePort-$maxPort ($($botsOfType.Count) bots)" -ForegroundColor Gray
    }
}

# Funcion para limpiar registros huerfanos
function Invoke-BotCleanup {
    param([array]$Bots)
    
    Write-Host "`n=== LIMPIEZA DE REGISTROS ===" -ForegroundColor Cyan
    
    $cleanupResults = @{
        orphanedConfigs = @()
        missingConfigs = @()
        duplicateIPs = @()
        duplicatePorts = @()
    }
    
    # Buscar configuraciones huerfanas
    if (Test-Path $ConfigPath) {
        $configDirs = Get-ChildItem $ConfigPath -Directory
        foreach ($configDir in $configDirs) {
            $botId = $configDir.Name
            $botFound = $Bots | Where-Object { $_.bot.id -eq $botId }
            
            if (!$botFound) {
                $cleanupResults.orphanedConfigs += $botId
            }
        }
    }
    
    # Buscar bots sin configuracion
    foreach ($bot in $Bots) {
        $botConfigDir = Join-Path $ConfigPath $bot.bot.id
        if (!(Test-Path $botConfigDir)) {
            $cleanupResults.missingConfigs += $bot.bot.id
        }
    }
    
    # Buscar IPs duplicadas
    $ipGroups = $Bots | Group-Object { $_.network.ip }
    foreach ($ipGroup in $ipGroups) {
        if ($ipGroup.Count -gt 1) {
            $cleanupResults.duplicateIPs += @{
                ip = $ipGroup.Name
                bots = $ipGroup.Group.bot.id
            }
        }
    }
    
    # Buscar puertos duplicados
    $portGroups = $Bots | Group-Object { $_.network.port }
    foreach ($portGroup in $portGroups) {
        if ($portGroup.Count -gt 1) {
            $cleanupResults.duplicatePorts += @{
                port = $portGroup.Name
                bots = $portGroup.Group.bot.id
            }
        }
    }
    
    # Mostrar resultados
    Write-Host "`nResultados de Limpieza:"
    Write-Host "  Configuraciones Huerfanas: $($cleanupResults.orphanedConfigs.Count)" -ForegroundColor Yellow
    Write-Host "  Bots sin Configuracion: $($cleanupResults.missingConfigs.Count)" -ForegroundColor Red
    Write-Host "  IPs Duplicadas: $($cleanupResults.duplicateIPs.Count)" -ForegroundColor Red
    Write-Host "  Puertos Duplicados: $($cleanupResults.duplicatePorts.Count)" -ForegroundColor Red
    
    if ($ShowDetails) {
        if ($cleanupResults.orphanedConfigs.Count -gt 0) {
            Write-Host "`nConfiguraciones Huerfanas:"
            $cleanupResults.orphanedConfigs | ForEach-Object {
                Write-Host "  - $_" -ForegroundColor Yellow
            }
        }
        
        if ($cleanupResults.duplicateIPs.Count -gt 0) {
            Write-Host "`nIPs Duplicadas:"
            $cleanupResults.duplicateIPs | ForEach-Object {
                Write-Host "  - IP $($_.ip): Bots $($_.bots -join ', ')" -ForegroundColor Red
            }
        }
        
        if ($cleanupResults.duplicatePorts.Count -gt 0) {
            Write-Host "`nPuertos Duplicados:"
            $cleanupResults.duplicatePorts | ForEach-Object {
                Write-Host "  - Puerto $($_.port): Bots $($_.bots -join ', ')" -ForegroundColor Red
            }
        }
    }
    
    return $cleanupResults
}

# Funcion para validar consistencia
function Test-BotConsistency {
    param([array]$Bots)
    
    Write-Host "`n=== VALIDACION DE CONSISTENCIA ===" -ForegroundColor Cyan
    
    $validationResults = @{
        valid = 0
        invalid = 0
        issues = @()
    }
    
    foreach ($bot in $Bots) {
        $botIssues = @()
        
        # Validar estructura basica
        if (!$bot.bot -or !$bot.bot.id) {
            $botIssues += "Falta ID del bot"
        }
        
        if (!$bot.network -or !$bot.network.ip -or !$bot.network.port) {
            $botIssues += "Configuracion de red incompleta"
        }
        
        # Validar IP en rango correcto
        if ($bot.network.ip -and $bot.network.ip -match "^192\.168\.100\.(\d+)$") {
            $lastOctet = [int]$matches[1]
            if ($lastOctet -lt $Global:BotConfig.StartIP -or $lastOctet -gt $Global:BotConfig.MaxIP) {
                $botIssues += "IP fuera del rango permitido"
            }
        } else {
            $botIssues += "Formato de IP invalido"
        }
        
        # Validar puertos
        if ($bot.services) {
            foreach ($service in $bot.services.PSObject.Properties) {
                $port = $service.Value.port
                if ($port -lt 1024 -or $port -gt 65535) {
                    $botIssues += "Puerto $port fuera de rango valido"
                }
            }
        }
        
        # Validar tipo de bot
        if ($bot.bot.type -and $bot.bot.type -notin $Global:BotConfig.BotTypes) {
            $botIssues += "Tipo de bot invalido: $($bot.bot.type)"
        }
        
        if ($botIssues.Count -eq 0) {
            $validationResults.valid++
        } else {
            $validationResults.invalid++
            $validationResults.issues += @{
                botId = $bot.bot.id
                issues = $botIssues
            }
        }
    }
    
    Write-Host "`nResultados de Validacion:"
    Write-Host "  Bots Validos: $($validationResults.valid)" -ForegroundColor Green
    Write-Host "  Bots Invalidos: $($validationResults.invalid)" -ForegroundColor Red
    
    if ($validationResults.invalid -gt 0 -and $ShowDetails) {
        Write-Host "`nBots con Problemas de Validacion:"
        foreach ($issue in $validationResults.issues) {
            Write-Host "  $($issue.botId):" -ForegroundColor Yellow
            foreach ($problem in $issue.issues) {
                Write-Host "    - $problem" -ForegroundColor Red
            }
        }
    }
    
    return $validationResults
}

# Funcion para exportar datos
function Export-BotData {
    param([object]$Data, [string]$OutputPath)
    
    if (!$OutputPath) {
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $OutputPath = Join-Path $RegistryPath "bot-export-$timestamp.json"
    }
    
    try {
        $Data | ConvertTo-Json -Depth 10 | Set-Content $OutputPath -Encoding UTF8
        Write-Host "Datos exportados a: $OutputPath" -ForegroundColor Green
    } catch {
        Write-Error "Error exportando datos: $($_.Exception.Message)"
    }
}

# Logica principal
try {
    Write-Log "Iniciando gestion de bots - Accion: $Action"
    
    # Cargar registro de bots
    $allBots = @(Get-BotRegistry)
    if ($allBots.Count -eq 0) {
        Write-Host "No hay bots registrados" -ForegroundColor Yellow
        exit 0
    }
    
    # Ejecutar accion solicitada
    switch ($Action) {
        "List" {
            Show-BotList -Bots $allBots -FilterType $BotType -FilterId $BotId
        }
        "Status" {
            Show-BotStatus -Bots $allBots -FilterId $BotId
        }
        "Stats" {
            Show-BotStatistics -Bots $allBots
        }
        "Health" {
            $healthData = Test-BotHealth -Bots $allBots
            if ($Export) {
                Export-BotData -Data $healthData -OutputPath $OutputFile
            }
        }
        "Network" {
            Show-NetworkInfo -Bots $allBots
        }
        "Cleanup" {
            $cleanupData = Invoke-BotCleanup -Bots $allBots
            if ($Export) {
                Export-BotData -Data $cleanupData -OutputPath $OutputFile
            }
        }
        "Validate" {
            $validationData = Test-BotConsistency -Bots $allBots
            if ($Export) {
                Export-BotData -Data $validationData -OutputPath $OutputFile
            }
        }
        "Ports" {
            $portStats = Get-PortStatistics -Bots $allBots
            Write-Host "`n=== INFORMACION DE PUERTOS ===" -ForegroundColor Cyan
            Write-Host "Puertos Totales Asignados: $($portStats.usage.Keys.Count)" -ForegroundColor White
            
            if ($portStats.conflicts.Count -gt 0) {
                Write-Host "CONFLICTOS ENCONTRADOS: $($portStats.conflicts.Count)" -ForegroundColor Red
                foreach ($conflictPort in $portStats.conflicts) {
                    Write-Host "  Puerto $conflictPort usado por:"
                    foreach ($usage in $portStats.usage[$conflictPort]) {
                        Write-Host "    - Bot: $($usage.botId) ($($usage.botType))"
                    }
                }
            }
            
            if ($Export) {
                Export-BotData -Data $portStats -OutputPath $OutputFile
            }
        }
        "IPs" {
            $ipStats = Get-IPStatistics -Bots $allBots
            Write-Host "`n=== INFORMACION DE IPs ===" -ForegroundColor Cyan
            Write-Host "IPs Utilizadas: $($ipStats.usedCount) / $($ipStats.totalRange) ($($ipStats.utilization)%)" -ForegroundColor White
            Write-Host "IPs Disponibles: $($ipStats.availableCount)" -ForegroundColor Green
            
            if ($ipStats.conflicts.Count -gt 0) {
                Write-Host "CONFLICTOS ENCONTRADOS: $($ipStats.conflicts.Count)" -ForegroundColor Red
                foreach ($conflictIP in $ipStats.conflicts) {
                    Write-Host "  IP $conflictIP usada por:"
                    foreach ($usage in $ipStats.usage[$conflictIP]) {
                        Write-Host "    - Bot: $($usage.botId) ($($usage.botType))"
                    }
                }
            }
            
            if ($ShowDetails) {
                Write-Host "`nPrimeras 10 IPs Disponibles:"
                $ipStats.availableIPs | Select-Object -First 10 | ForEach-Object {
                    Write-Host "  $_" -ForegroundColor Green
                }
            }
            
            if ($Export) {
                Export-BotData -Data $ipStats -OutputPath $OutputFile
            }
        }
        "Types" {
            $typeStats = $allBots | Group-Object { $_.bot.type }
            Write-Host "`n=== BOTS POR TIPO ===" -ForegroundColor Cyan
            
            foreach ($typeGroup in $typeStats) {
                $runningCount = $typeGroup.Group | Where-Object { Test-BotRunning -Bot $_ } | Measure-Object | Select-Object -ExpandProperty Count
                Write-Host "$($typeGroup.Name): $($typeGroup.Count) total, $runningCount activos" -ForegroundColor White
                
                if ($ShowDetails) {
                    foreach ($bot in $typeGroup.Group) {
                        $status = if (Test-BotRunning -Bot $bot) { "RUNNING" } else { "OFFLINE" }
                        $statusColor = if ($status -eq "RUNNING") { "Green" } else { "Red" }
                        Write-Host "  - $($bot.bot.id) ($($bot.network.ip):$($bot.network.port)) - $status" -ForegroundColor $statusColor
                    }
                }
            }
        }
    }
    
    Write-Log "Gestion de bots completada exitosamente"
    
} catch {
    Write-Error "Error en la gestion de bots: $($_.Exception.Message)"
    exit 1
}
