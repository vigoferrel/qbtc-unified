# Add-Bot.ps1 - Script PowerShell para gestión de bots QBTC
# Interfaz PowerShell que utiliza el sistema Node.js existente
# Mantiene secuencia y orden en puertos/IPs con reorganización automática

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("TRADER_BOT", "SCALPER_BOT", "ARBITRAGE_BOT", "QUANTUM_ANALYZER", "RISK_MANAGER", "MONITOR_BOT", "DATA_COLLECTOR", "SIGNAL_PROCESSOR")]
    [string]$BotType,
    
    [Parameter(Mandatory=$false)]
    [string]$BotName = "",
    
    [Parameter(Mandatory=$false)]
    [string]$RequestedIP = "",
    
    [Parameter(Mandatory=$false)]
    [int]$Count = 1,
    
    [Parameter(Mandatory=$false)]
    [string]$ConfigPath = "C:\Users\DELL\Desktop\QBTC-UNIFIED\bots\configs",
    
    [Parameter(Mandatory=$false)]
    [string]$RegistryPath = "C:\Users\DELL\Desktop\QBTC-UNIFIED\bots\registry",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force,
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun
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

# Funcion para logging con timestamps
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage
    
    $logFile = Join-Path $RegistryPath "bot-management.log"
    Add-Content -Path $logFile -Value $logMessage -Encoding ASCII
}

# Funcion para crear directorios necesarios
function Initialize-Directories {
    $directories = @($ConfigPath, $RegistryPath, 
                    (Join-Path $RegistryPath "network"),
                    (Join-Path $RegistryPath "backup"))
    
    foreach ($dir in $directories) {
        if (!(Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Log "Directorio creado: $dir"
        }
    }
}

# Funcion para cargar registro existente de bots
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

# Funcion para obtener siguiente IP disponible
function Get-NextAvailableIP {
    param([array]$ExistingBots)
    
    $usedIPs = @()
    foreach ($bot in $ExistingBots) {
        if ($bot.network -and $bot.network.ip) {
            $usedIPs += $bot.network.ip
        }
    }
    
    $reservedIPs = @("192.168.100.1", "192.168.100.2", "192.168.100.3")
    
    for ($i = $Global:BotConfig.StartIP; $i -le $Global:BotConfig.MaxIP; $i++) {
        $testIP = "$($Global:BotConfig.BaseIP).$i"
        
        if ($testIP -notin $usedIPs -and $testIP -notin $reservedIPs) {
            return $testIP
        }
    }
    
    throw "No hay IPs disponibles en el rango $($Global:BotConfig.BaseIP).$($Global:BotConfig.StartIP)-$($Global:BotConfig.MaxIP)"
}

# Funcion para obtener siguiente puerto base para un tipo de bot
function Get-NextAvailablePortBase {
    param([string]$BotType, [array]$ExistingBots)
    
    $typeOffset = $Global:BotConfig.PortOffset[$BotType]
    if ($null -eq $typeOffset) {
        $typeOffset = 0
    }
    
    $usedPorts = @()
    foreach ($bot in $ExistingBots) {
        if ($bot.network -and $bot.network.port) {
            $usedPorts += $bot.network.port
        }
        if ($bot.services) {
            foreach ($service in $bot.services.PSObject.Properties) {
                if ($service.Value.port) {
                    $usedPorts += $service.Value.port
                }
            }
        }
    }
    
    # Buscar siguiente puerto base disponible para el tipo
    $basePort = $Global:BotConfig.BasePort + $typeOffset
    
    for ($i = 0; $i -lt 100; $i++) {
        $testPort = $basePort + $i
        $portRangeUsed = $false
        
        # Verificar que todo el rango de puertos este libre (0-90 para servicios)
        for ($serviceOffset = 0; $serviceOffset -le 90; $serviceOffset += 10) {
            if (($testPort + $serviceOffset) -in $usedPorts) {
                $portRangeUsed = $true
                break
            }
        }
        
        if (-not $portRangeUsed) {
            return $testPort
        }
    }
    
    throw "No hay puertos disponibles para el tipo de bot $BotType"
}

# Funcion para generar configuracion completa del bot
function New-BotConfiguration {
    param(
        [string]$BotId,
        [string]$BotType,
        [string]$BotName,
        [string]$AssignedIP,
        [int]$BasePort
    )
    
    # Calcular puertos de servicios
    $servicePorts = @{}
    foreach ($service in $Global:BotConfig.ServicePortOffsets.Keys) {
        $servicePorts[$service] = $BasePort + $Global:BotConfig.ServicePortOffsets[$service]
    }
    
    # Generar configuracion completa
    $botConfig = @{
        bot = @{
            id = $BotId
            name = if ($BotName) { $BotName } else { "$BotType" + "_$BotId" }
            type = $BotType
            version = "1.0.0"
            created = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            status = "CONFIGURED"
        }
        network = @{
            ip = $AssignedIP
            port = $servicePorts.main
            wsPort = $servicePorts.websocket
            metricsPort = $servicePorts.metrics
            subnet = "255.255.255.0"
            gateway = "192.168.100.1"
            dns = @("8.8.8.8", "8.8.4.4")
        }
        services = @{
            main = @{
                name = "Bot Principal"
                enabled = $true
                port = $servicePorts.main
                protocol = "HTTP"
                endpoint = "/"
                description = "Servicio principal del bot"
            }
            websocket = @{
                name = "WebSocket"
                enabled = $true
                port = $servicePorts.websocket
                protocol = "WS"
                endpoint = "/ws"
                description = "Comunicacion en tiempo real"
            }
            metrics = @{
                name = "Metricas Prometheus"
                enabled = $true
                port = $servicePorts.metrics
                protocol = "HTTP"
                endpoint = "/metrics"
                description = "Metricas para Prometheus/Grafana"
                format = "prometheus"
            }
            logs = @{
                name = "Logs Estructurados"
                enabled = $true
                port = $servicePorts.logs
                protocol = "HTTP"
                endpoint = "/logs"
                description = "Endpoint de logs JSON estructurados"
                format = "json"
                levels = @("DEBUG", "INFO", "WARN", "ERROR")
            }
            health = @{
                name = "Health Check"
                enabled = $true
                port = $servicePorts.health
                protocol = "HTTP"
                endpoint = "/health"
                description = "Verificacion de estado del bot"
            }
            debug = @{
                name = "Debug & Admin"
                enabled = $true
                port = $servicePorts.debug
                protocol = "HTTP"
                endpoint = "/debug"
                description = "Panel de debugging y administracion"
                auth = $true
            }
            monitoring = @{
                name = "Dashboard Monitoreo"
                enabled = $true
                port = $servicePorts.monitoring
                protocol = "HTTP"
                endpoint = "/monitor"
                description = "Dashboard de monitoreo del bot"
            }
            alerts = @{
                name = "Sistema Alertas"
                enabled = $true
                port = $servicePorts.alerts
                protocol = "HTTP"
                endpoint = "/alerts"
                description = "Configuracion y estado de alertas"
            }
            performance = @{
                name = "Metricas Rendimiento"
                enabled = $true
                port = $servicePorts.performance
                protocol = "HTTP"
                endpoint = "/performance"
                description = "Metricas detalladas de rendimiento"
                retention = "24h"
            }
            backup = @{
                name = "Backup Estado"
                enabled = $true
                port = $servicePorts.backup
                protocol = "HTTP"
                endpoint = "/backup"
                description = "Backup y restauracion de estado"
            }
        }
        trading = Get-TradingConfig -BotType $BotType
        monitoring = @{
            healthCheck = @{
                enabled = $true
                port = $servicePorts.health
                endpoint = "/health"
                interval = 5000
                timeout = 3000
                retries = 3
            }
            logging = @{
                enabled = $true
                port = $servicePorts.logs
                endpoint = "/logs"
                level = "INFO"
                path = "./logs/$BotId"
                maxSize = "100MB"
                maxFiles = 10
                format = "json"
                rotation = "daily"
            }
            metrics = @{
                enabled = $true
                port = $servicePorts.metrics
                endpoint = "/metrics"
                interval = 1000
                retention = "7d"
                format = "prometheus"
            }
        }
        communication = @{
            coordinator = @{
                host = "192.168.100.1"
                port = 8080
                protocol = "HTTP"
            }
            registry = @{
                host = "192.168.100.1"
                port = 8081
                protocol = "HTTP"
            }
            discovery = @{
                enabled = $true
                interval = 30000
            }
        }
    }
    
    return $botConfig
}

# Funcion para obtener configuracion de trading por tipo de bot
function Get-TradingConfig {
    param([string]$BotType)
    
    $baseConfig = @{
        enabled = $true
        maxPositions = 5
        riskLevel = "MEDIUM"
        stopLoss = 0.02
        takeProfit = 0.04
    }
    
    switch ($BotType) {
        "TRADER_BOT" {
            return $baseConfig + @{
                strategy = "TREND_FOLLOWING"
                timeframe = "1m"
                maxLeverage = 5
            }
        }
        "SCALPER_BOT" {
            return $baseConfig + @{
                strategy = "SCALPING"
                timeframe = "1s"
                maxLeverage = 10
                stopLoss = 0.005
                takeProfit = 0.01
            }
        }
        "ARBITRAGE_BOT" {
            return $baseConfig + @{
                strategy = "ARBITRAGE"
                exchanges = @("binance", "kucoin")
                minProfitMargin = 0.001
            }
        }
        "QUANTUM_ANALYZER" {
            return @{
                enabled = $false
                analysisMode = "QUANTUM_CONSCIOUSNESS"
                coherenceThreshold = 0.85
            }
        }
        "RISK_MANAGER" {
            return @{
                enabled = $false
                monitoringOnly = $true
                maxDrawdown = 0.05
                emergencyStop = $true
            }
        }
        default {
            return $baseConfig
        }
    }
}

# Funcion para crear archivos de configuracion del bot
function New-BotConfigFiles {
    param(
        [hashtable]$BotConfig,
        [string]$OutputPath
    )
    
    $botId = $BotConfig.bot.id
    $botDir = Join-Path $OutputPath $botId
    
    # Crear directorio del bot
    if (!(Test-Path $botDir)) {
        New-Item -ItemType Directory -Path $botDir -Force | Out-Null
    }
    
    # Archivo de configuracion principal
    $configFile = Join-Path $botDir "config.json"
    $BotConfig | ConvertTo-Json -Depth 10 | Set-Content $configFile -Encoding UTF8
    
    # Script de lanzamiento en PowerShell (para segundo plano y metricas)
    $launchScript = Join-Path $botDir "Start-Bot.ps1"
    $launchContent = @"
# Script de lanzamiento para $($BotConfig.bot.name)
# Lanzamiento en segundo plano para reportar metricas de desempeno

param([switch]`$Background = `$true)

`$BotId = "$($BotConfig.bot.id)"
`$BotType = "$($BotConfig.bot.type)"
`$BotIP = "$($BotConfig.network.ip)"
`$BotPort = $($BotConfig.network.port)

Write-Host "Iniciando bot `$BotId..."
Write-Host "IP: `$BotIP"
Write-Host "Puerto: `$BotPort"
Write-Host "Tipo: `$BotType"

# Crear directorio de logs
`$LogsDir = "logs\`$BotId"
if (!(Test-Path `$LogsDir)) {
    New-Item -ItemType Directory -Path `$LogsDir -Force | Out-Null
}

# Variables de entorno para el bot
`$env:BOT_ID = `$BotId
`$env:BOT_TYPE = `$BotType
`$env:BOT_IP = `$BotIP
`$env:BOT_PORT = `$BotPort
`$env:NODE_ENV = "production"

if (`$Background) {
    # Lanzar en segundo plano para metricas de desempeno y depuracion
    Write-Host "Lanzando `$BotId en segundo plano..."
    Start-Process -FilePath "node" -ArgumentList "bot-main.js", "--config=config.json" -WindowStyle Hidden -RedirectStandardOutput "`$LogsDir\output.log" -RedirectStandardError "`$LogsDir\error.log"
    
    # Verificar que el bot este corriendo
    Start-Sleep -Seconds 3
    `$process = Get-NetTCPConnection -LocalPort `$BotPort -ErrorAction SilentlyContinue
    if (`$process) {
        Write-Host "Bot `$BotId iniciado correctamente en puerto `$BotPort" -ForegroundColor Green
    } else {
        Write-Host "Error: Bot `$BotId no pudo iniciarse" -ForegroundColor Red
    }
} else {
    # Lanzar en primer plano
    node bot-main.js --config=config.json
}
"@
    Set-Content $launchScript $launchContent -Encoding ASCII
    
    # Script de parada
    $stopScript = Join-Path $botDir "Stop-Bot.ps1"
    $stopContent = @"
# Script para detener el bot $($BotConfig.bot.name)

`$BotId = "$($BotConfig.bot.id)"
`$BotPort = $($BotConfig.network.port)

Write-Host "Deteniendo bot `$BotId..."

# Buscar proceso por puerto
try {
    `$connection = Get-NetTCPConnection -LocalPort `$BotPort -ErrorAction Stop
    `$processId = `$connection.OwningProcess
    
    if (`$processId) {
        Stop-Process -Id `$processId -Force
        Write-Host "Bot `$BotId detenido correctamente" -ForegroundColor Green
    }
} catch {
    Write-Host "Bot `$BotId no estaba corriendo o ya fue detenido" -ForegroundColor Yellow
}
"@
    Set-Content $stopScript $stopContent -Encoding ASCII
    
    Write-Log "Archivos de configuracion creados en: $botDir"
    
    return @{
        configFile = $configFile
        launchScript = $launchScript
        stopScript = $stopScript
        botDir = $botDir
    }
}

# Funcion principal para agregar bot
function Add-NewBot {
    param(
        [string]$Type,
        [string]$Name,
        [string]$RequestedIP,
        [int]$BotIndex
    )
    
    Write-Log "Agregando nuevo bot tipo: $Type"
    
    # Validar tipo de bot
    if ($Type -notin $Global:BotConfig.BotTypes) {
        throw "Tipo de bot invalido: $Type. Tipos validos: $($Global:BotConfig.BotTypes -join ', ')"
    }
    
    # Cargar registro existente
    $existingBots = @(Get-BotRegistry)
    Write-Log "Bots existentes encontrados: $($existingBots.Count)"
    
    # Generar ID unico para el bot
    $timestamp = [int64](Get-Date -UFormat %s)
    $botId = "BOT_$timestamp" + "_" + $BotIndex.ToString("000")
    
    # Asignar IP
    if ($RequestedIP) {
        # Validar IP solicitada
        if ($RequestedIP -match "^192\.168\.100\.(\d+)$") {
            $lastOctet = [int]$matches[1]
            if ($lastOctet -ge $Global:BotConfig.StartIP -and $lastOctet -le $Global:BotConfig.MaxIP) {
                $usedIPs = $existingBots | Where-Object { $_.network } | ForEach-Object { $_.network.ip }
                if ($RequestedIP -in $usedIPs) {
                    throw "IP solicitada $RequestedIP ya esta en uso"
                }
                $assignedIP = $RequestedIP
            } else {
                throw "IP solicitada $RequestedIP fuera del rango permitido"
            }
        } else {
            throw "Formato de IP invalido: $RequestedIP"
        }
    } else {
        $assignedIP = Get-NextAvailableIP -ExistingBots $existingBots
    }
    
    # Asignar puerto base
    $basePort = Get-NextAvailablePortBase -BotType $Type -ExistingBots $existingBots
    
    Write-Log "Bot $botId: IP=$assignedIP, Puerto Base=$basePort"
    
    if ($DryRun) {
        Write-Log "DRY RUN: Bot $botId seria creado con IP $assignedIP y puerto base $basePort"
        return @{
            botId = $botId
            ip = $assignedIP
            basePort = $basePort
            type = $Type
            dryRun = $true
        }
    }
    
    # Generar configuracion completa
    $botConfig = New-BotConfiguration -BotId $botId -BotType $Type -BotName $Name -AssignedIP $assignedIP -BasePort $basePort
    
    # Crear archivos de configuracion
    $configFiles = New-BotConfigFiles -BotConfig $botConfig -OutputPath $ConfigPath
    
    # Actualizar registro
    $existingBots += $botConfig
    Save-BotRegistry -Registry $existingBots
    
    Write-Log "Bot $botId agregado exitosamente"
    
    return @{
        botId = $botId
        ip = $assignedIP
        basePort = $basePort
        type = $Type
        configFiles = $configFiles
        success = $true
    }
}

# Validar parametros
if ($BotType -notin $Global:BotConfig.BotTypes) {
    Write-Error "Tipo de bot invalido: $BotType"
    Write-Host "Tipos validos: $($Global:BotConfig.BotTypes -join ', ')"
    exit 1
}

if ($Count -lt 1 -or $Count -gt 50) {
    Write-Error "El numero de bots debe estar entre 1 y 50"
    exit 1
}

try {
    Write-Log "Iniciando proceso de agregacion de bots" "INFO"
    Write-Log "Tipo: $BotType, Cantidad: $Count, DryRun: $DryRun"
    
    # Inicializar directorios
    Initialize-Directories
    
    # Crear bots
    $results = @()
    for ($i = 1; $i -le $Count; $i++) {
        try {
            $currentName = if ($BotName) { "$BotName" + "_$i" } else { "" }
            $result = Add-NewBot -Type $BotType -Name $currentName -RequestedIP $RequestedIP -BotIndex $i
            $results += $result
            
            if (!$DryRun) {
                Write-Host "Bot $($result.botId) creado: IP $($result.ip):$($result.basePort)" -ForegroundColor Green
            } else {
                Write-Host "DRY RUN - Bot $($result.botId) seria creado: IP $($result.ip):$($result.basePort)" -ForegroundColor Yellow
            }
        } catch {
            Write-Log "Error creando bot #$i : $($_.Exception.Message)" "ERROR"
            Write-Host "Error creando bot #$i : $($_.Exception.Message)" -ForegroundColor Red
            
            if (!$Force) {
                throw
            }
        }
    }
    
    # Resumen final
    Write-Host "`n=== RESUMEN DE OPERACION ===" -ForegroundColor Cyan
    Write-Host "Bots procesados: $($results.Count)" -ForegroundColor White
    Write-Host "Bots exitosos: $(($results | Where-Object { $_.success }).Count)" -ForegroundColor Green
    
    if ($DryRun) {
        Write-Host "MODO DRY RUN - No se realizaron cambios reales" -ForegroundColor Yellow
    } else {
        Write-Host "Archivos de configuracion creados en: $ConfigPath" -ForegroundColor White
        Write-Host "Registro actualizado en: $RegistryPath" -ForegroundColor White
    }
    
    Write-Log "Proceso de agregacion completado exitosamente"
    
} catch {
    Write-Log "Error en el proceso de agregacion: $($_.Exception.Message)" "ERROR"
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
