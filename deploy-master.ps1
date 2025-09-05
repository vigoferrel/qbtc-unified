# ========================================================================
# DEPLOY MASTER - SISTEMA DE DESPLIEGUE ELEGANTE Y SEGURO
# Script PowerShell para despliegue automatizado con monitoreo
# Separacion clara de entornos: /futuros, dev/prod
# ========================================================================

param(
    [ValidateSet("development", "production", "staging")]
    [string]$Environment = "development",
    
    [ValidateSet("futuros")]
    [string]$TradingMode = "futuros",
    
    [switch]$BackgroundMode = $true,
    [switch]$EnableMonitoring = $true,
    [switch]$AutoRestart = $false,
    [switch]$CleanStart = $false,
    
    [string]$ConfigFile = "",
    [int]$HealthCheckInterval = 30,
    [string]$LogLevel = "INFO"
)

# Configurar encoding para Windows PowerShell
try {
    $Host.UI.RawUI.OutputEncoding = [System.Text.Encoding]::UTF8
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
} catch {
    Write-Warning "No se pudo configurar encoding UTF8"
}

# Variables globales del sistema
$SCRIPT_VERSION = "2.0.0"
$BASE_PATH = $PSScriptRoot
$LOGS_PATH = Join-Path $BASE_PATH "logs"
$CONFIGS_PATH = Join-Path $BASE_PATH "configs"
$PIDS_PATH = Join-Path $BASE_PATH "pids"

# Configuracion de entornos
$ENVIRONMENT_CONFIGS = @{
    development = @{
        Ports = @{
            leonardo = 3003
            frontend = 8080
            unified = 3200
            monitoring = 3301
        }
        LogLevel = "DEBUG"
        AutoStart = $false
        HealthCheckTimeout = 10
    }
    staging = @{
        Ports = @{
            leonardo = 3004
            frontend = 8081
            unified = 3201
            monitoring = 3302
        }
        LogLevel = "INFO"
        AutoStart = $true
        HealthCheckTimeout = 15
    }
    production = @{
        Ports = @{
            leonardo = 3005
            frontend = 8082
            unified = 3202
            monitoring = 3303
        }
        LogLevel = "WARN"
        AutoStart = $true
        HealthCheckTimeout = 30
    }
}

# Configuracion de modos de trading - FUTUROS ONLY
$TRADING_CONFIGS = @{
    futuros = @{
        ProcessName = "qbtc-futuros" 
        ConfigSuffix = "futures"
        RequiredServices = @("leonardo", "frontend", "unified")
    }
}

# ========================================================================
# FUNCIONES DE UTILIDAD Y LOGGING
# ========================================================================

function Write-DeployLog {
    param(
        [string]$Message,
        [ValidateSet("DEBUG", "INFO", "WARN", "ERROR", "SUCCESS")]
        [string]$Level = "INFO",
        [string]$Component = "DEPLOY"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
    $logEntry = "[$timestamp] [$Level] [$Component] $Message"
    
    # Definir colores por nivel
    $colors = @{
        DEBUG = "Gray"
        INFO = "White" 
        WARN = "Yellow"
        ERROR = "Red"
        SUCCESS = "Green"
    }
    
    Write-Host $logEntry -ForegroundColor $colors[$Level]
    
    # Escribir a archivo de log
    if (!(Test-Path $LOGS_PATH)) {
        New-Item -ItemType Directory -Path $LOGS_PATH -Force | Out-Null
    }
    
    $logFile = Join-Path $LOGS_PATH "deploy-$(Get-Date -Format 'yyyyMMdd').log"
    Add-Content -Path $logFile -Value $logEntry -Encoding UTF8
}

function Show-DeployHeader {
    Clear-Host
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "            QBTC UNIFIED - DEPLOY MASTER v$SCRIPT_VERSION" -ForegroundColor Yellow
    Write-Host "           Sistema de Despliegue Elegante y Seguro" -ForegroundColor Yellow
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Configuracion del Despliegue:" -ForegroundColor White
    Write-Host "  - Entorno: $Environment" -ForegroundColor Green
    Write-Host "  - Modo Trading: $TradingMode" -ForegroundColor Green
    Write-Host "  - Background Mode: $BackgroundMode" -ForegroundColor Green
    Write-Host "  - Monitoreo: $EnableMonitoring" -ForegroundColor Green
    Write-Host "  - Auto Restart: $AutoRestart" -ForegroundColor Green
    Write-Host ""
}

function Test-SystemRequirements {
    Write-DeployLog "Verificando requisitos del sistema..." "INFO"
    
    $requirements = @()
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-DeployLog "Node.js encontrado: $nodeVersion" "SUCCESS"
        } else {
            $requirements += "Node.js no encontrado"
        }
    } catch {
        $requirements += "Error verificando Node.js: $($_.Exception.Message)"
    }
    
    # Verificar npm
    try {
        $npmVersion = npm --version 2>$null
        if ($npmVersion) {
            Write-DeployLog "npm encontrado: $npmVersion" "SUCCESS"
        }
    } catch {
        Write-DeployLog "npm no encontrado" "WARN"
    }
    
    # Verificar PowerShell version
    $psVersion = $PSVersionTable.PSVersion
    Write-DeployLog "PowerShell version: $($psVersion.Major).$($psVersion.Minor)" "INFO"
    
    # Verificar archivos esenciales
    $essentialFiles = @(
        "package.json",
        "leonardo-consciousness\MasterLauncher.js",
        "frontend-unified\frontend-proxy-server.js"
    )
    
    foreach ($file in $essentialFiles) {
        $filePath = Join-Path $BASE_PATH $file
        if (Test-Path $filePath) {
            Write-DeployLog "Archivo esencial encontrado: $file" "SUCCESS"
        } else {
            $requirements += "Archivo esencial no encontrado: $file"
        }
    }
    
    if ($requirements.Count -gt 0) {
        Write-DeployLog "Requisitos no cumplidos:" "ERROR"
        foreach ($req in $requirements) {
            Write-DeployLog "  - $req" "ERROR"
        }
        return $false
    }
    
    Write-DeployLog "Todos los requisitos del sistema verificados" "SUCCESS"
    return $true
}

# ========================================================================
# FUNCIONES DE GESTION DE PROCESOS
# ========================================================================

function Stop-ExistingProcesses {
    param([bool]$ForceClean = $false)
    
    Write-DeployLog "Verificando y deteniendo procesos existentes..." "INFO"
    
    if ($ForceClean) {
        # Detener todos los procesos Node.js
        Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
            try {
                Write-DeployLog "Deteniendo proceso Node.js (PID: $($_.Id))" "INFO"
                $_.Kill()
                Start-Sleep -Milliseconds 500
            } catch {
                Write-DeployLog "Error deteniendo proceso $($_.Id): $($_.Exception.Message)" "WARN"
            }
        }
    }
    
    # Verificar puertos del entorno actual
    $envConfig = $ENVIRONMENT_CONFIGS[$Environment]
    foreach ($service in $envConfig.Ports.Keys) {
        $port = $envConfig.Ports[$service]
        $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        
        if ($connection) {
            Write-DeployLog "Puerto $port ocupado por PID: $($connection.OwningProcess)" "WARN"
            if ($ForceClean) {
                try {
                    Stop-Process -Id $connection.OwningProcess -Force -ErrorAction SilentlyContinue
                    Write-DeployLog "Proceso liberado del puerto $port" "SUCCESS"
                } catch {
                    Write-DeployLog "Error liberando puerto $port" "ERROR"
                }
            }
        } else {
            Write-DeployLog "Puerto $port disponible" "SUCCESS"
        }
    }
}

function Start-ProcessInBackground {
    param(
        [string]$ProcessName,
        [string]$ScriptPath,
        [string]$Arguments = "",
        [hashtable]$Environment = @{},
        [string]$WorkingDirectory = $BASE_PATH
    )
    
    Write-DeployLog "Iniciando proceso en segundo plano: $ProcessName" "INFO"
    
    # Crear directorio de PIDs si no existe
    if (!(Test-Path $PIDS_PATH)) {
        New-Item -ItemType Directory -Path $PIDS_PATH -Force | Out-Null
    }
    
    # Configurar variables de entorno
    $processEnv = $Environment.Clone()
    $processEnv["NODE_ENV"] = $Environment
    $processEnv["TRADING_MODE"] = $TradingMode
    $processEnv["BACKGROUND_MODE"] = "true"
    
    try {
        # Preparar argumentos
        $argList = @($ScriptPath)
        if ($Arguments -and $Arguments.Trim() -ne "") {
            $argList += $Arguments.Split(' ')
        }
        
        $processInfo = @{
            FilePath = "node"
            ArgumentList = $argList
            WorkingDirectory = $WorkingDirectory
            WindowStyle = "Hidden"
            PassThru = $true
            RedirectStandardOutput = Join-Path $LOGS_PATH "$ProcessName-output.log"
            RedirectStandardError = Join-Path $LOGS_PATH "$ProcessName-error.log"
        }
        
        # Configurar variables de entorno del proceso
        foreach ($key in $processEnv.Keys) {
            [Environment]::SetEnvironmentVariable($key, $processEnv[$key], "Process")
        }
        
        $process = Start-Process @processInfo
        
        if ($process) {
            # Guardar PID
            $pidFile = Join-Path $PIDS_PATH "$ProcessName.pid"
            $process.Id | Out-File -FilePath $pidFile -Encoding UTF8
            
            # Crear archivo de status
            $statusInfo = @{
                ProcessName = $ProcessName
                PID = $process.Id
                StartTime = Get-Date
                ScriptPath = $ScriptPath
                Arguments = $Arguments
                Environment = $Environment
                TradingMode = $TradingMode
                WorkingDirectory = $WorkingDirectory
                LogOutput = Join-Path $LOGS_PATH "$ProcessName-output.log"
                LogError = Join-Path $LOGS_PATH "$ProcessName-error.log"
            }
            
            $statusFile = Join-Path $PIDS_PATH "$ProcessName-status.json"
            $statusInfo | ConvertTo-Json -Depth 3 | Out-File -FilePath $statusFile -Encoding UTF8
            
            Write-DeployLog "Proceso $ProcessName iniciado - PID: $($process.Id)" "SUCCESS"
            return $process
        } else {
            Write-DeployLog "Error: No se pudo iniciar el proceso $ProcessName" "ERROR"
            return $null
        }
    } catch {
        Write-DeployLog "Error iniciando proceso $ProcessName : $($_.Exception.Message)" "ERROR"
        return $null
    }
}

# ========================================================================
# FUNCIONES DE DESPLIEGUE POR COMPONENTE
# ========================================================================

function Deploy-LeonardoConsciousness {
    Write-DeployLog "Desplegando Leonardo Consciousness..." "INFO" "LEONARDO"
    
    $leonardoPath = Join-Path $BASE_PATH "leonardo-consciousness"
    $envConfig = $ENVIRONMENT_CONFIGS[$Environment]
    
    # Configurar variables específicas
    $leonardoEnv = @{
        LEONARDO_PORT = $envConfig.Ports.leonardo
        LOG_LEVEL = $envConfig.LogLevel
        AUTO_START = $envConfig.AutoStart
    }
    
    $process = Start-ProcessInBackground -ProcessName "leonardo-consciousness" -ScriptPath "MasterLauncher.js" -Environment $leonardoEnv -WorkingDirectory $leonardoPath
    
    if ($process) {
        # Esperar inicializacion
        Start-Sleep -Seconds 5
        
        # Verificar salud del servicio
        try {
            $healthUrl = "http://localhost:$($envConfig.Ports.leonardo)/api/status"
            $response = Invoke-RestMethod -Uri $healthUrl -Method GET -TimeoutSec $envConfig.HealthCheckTimeout
            Write-DeployLog "Leonardo Consciousness desplegado exitosamente" "SUCCESS" "LEONARDO"
            return $true
        } catch {
            Write-DeployLog "Error en health check de Leonardo: $($_.Exception.Message)" "ERROR" "LEONARDO"
            return $false
        }
    }
    
    return $false
}

function Deploy-FrontendUnified {
    Write-DeployLog "Desplegando Frontend Unified..." "INFO" "FRONTEND"
    
    $frontendPath = Join-Path $BASE_PATH "frontend-unified"
    $envConfig = $ENVIRONMENT_CONFIGS[$Environment]
    
    # Verificar dependencias npm
    if (!(Test-Path (Join-Path $frontendPath "node_modules"))) {
        Write-DeployLog "Instalando dependencias npm para frontend..." "INFO" "FRONTEND"
        Push-Location $frontendPath
        npm install --silent
        Pop-Location
    }
    
    # Configurar variables específicas
    $frontendEnv = @{
        FRONTEND_PORT = $envConfig.Ports.frontend
        API_ENDPOINT = "http://localhost:$($envConfig.Ports.leonardo)"
        LOG_LEVEL = $envConfig.LogLevel
    }
    
    $process = Start-ProcessInBackground -ProcessName "frontend-unified" -ScriptPath "frontend-proxy-server.js" -Environment $frontendEnv -WorkingDirectory $frontendPath
    
    if ($process) {
        Start-Sleep -Seconds 3
        
        # Verificar conectividad
        try {
            $testConnection = Test-NetConnection -ComputerName "localhost" -Port $envConfig.Ports.frontend -InformationLevel Quiet -WarningAction SilentlyContinue
            if ($testConnection) {
                Write-DeployLog "Frontend Unified desplegado exitosamente" "SUCCESS" "FRONTEND"
                return $true
            }
        } catch {
            Write-DeployLog "Error verificando frontend: $($_.Exception.Message)" "ERROR" "FRONTEND"
        }
    }
    
    return $false
}

function Deploy-UnifiedMaster {
    if ($TradingMode -ne "futuros") {
        Write-DeployLog "Modo $TradingMode - Unified Master no requerido" "INFO" "UNIFIED"
        return $true
    }
    
    Write-DeployLog "Desplegando Unified Master..." "INFO" "UNIFIED"
    
    $envConfig = $ENVIRONMENT_CONFIGS[$Environment]
    
    # Configurar variables específicas
    $unifiedEnv = @{
        UNIFIED_PORT = $envConfig.Ports.unified
        LEONARDO_ENDPOINT = "http://localhost:$($envConfig.Ports.leonardo)"
        FRONTEND_ENDPOINT = "http://localhost:$($envConfig.Ports.frontend)"
        LOG_LEVEL = $envConfig.LogLevel
        TRADING_MODE = $TradingMode
    }
    
    $process = Start-ProcessInBackground -ProcessName "unified-master" -ScriptPath "launch-quantum-unified-master.js" -Environment $unifiedEnv
    
    if ($process) {
        Start-Sleep -Seconds 5
        
        # Verificar salud del servicio
        try {
            $healthUrl = "http://localhost:$($envConfig.Ports.unified)/api/health"
            $response = Invoke-RestMethod -Uri $healthUrl -Method GET -TimeoutSec $envConfig.HealthCheckTimeout
            Write-DeployLog "Unified Master desplegado exitosamente" "SUCCESS" "UNIFIED"
            return $true
        } catch {
            Write-DeployLog "Error en health check de Unified Master: $($_.Exception.Message)" "ERROR" "UNIFIED"
            return $false
        }
    }
    
    return $false
}

# ========================================================================
# SISTEMA DE MONITOREO Y METRICAS
# ========================================================================

function Start-SystemMonitoring {
    if (!$EnableMonitoring) {
        Write-DeployLog "Monitoreo deshabilitado" "INFO" "MONITOR"
        return $null
    }
    
    Write-DeployLog "Iniciando sistema de monitoreo..." "INFO" "MONITOR"
    
    $monitorScript = Join-Path $BASE_PATH "system-monitor.ps1"
    $envConfig = $ENVIRONMENT_CONFIGS[$Environment]
    
    # Crear script de monitoreo dinamico
    $monitorContent = @"
# Sistema de Monitoreo Automatico - Generado dinamicamente
param([int]`$Interval = $HealthCheckInterval)

`$Environment = '$Environment'
`$TradingMode = '$TradingMode'
`$LogsPath = '$LOGS_PATH'

function Write-MonitorLog {
    param([string]`$Message, [string]`$Level = 'INFO')
    `$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    `$logEntry = "[`$timestamp] [MONITOR] [`$Level] `$Message"
    Write-Host `$logEntry -ForegroundColor Green
    Add-Content -Path (Join-Path `$LogsPath "monitor-$(Get-Date -Format 'yyyyMMdd').log") -Value `$logEntry
}

function Get-SystemMetrics {
    `$metrics = @{}
    
    # Obtener procesos QBTC
    `$qbtcProcesses = Get-Process -Name 'node' -ErrorAction SilentlyContinue | Where-Object {
        try {
            `$wmi = Get-WmiObject -Class Win32_Process -Filter "ProcessId = `$(`$_.Id)" -ErrorAction SilentlyContinue
            return `$wmi -and (`$wmi.CommandLine -like '*leonardo*' -or `$wmi.CommandLine -like '*frontend*' -or `$wmi.CommandLine -like '*unified*')
        } catch { return `$false }
    }
    
    foreach (`$process in `$qbtcProcesses) {
        `$uptime = (Get-Date) - `$process.StartTime
        `$memoryMB = [Math]::Round(`$process.WorkingSet64 / 1MB, 2)
        `$cpuPercent = [Math]::Round(`$process.CPU, 2)
        
        `$processName = 'unknown'
        try {
            `$wmi = Get-WmiObject -Class Win32_Process -Filter "ProcessId = `$(`$process.Id)" -ErrorAction SilentlyContinue
            if (`$wmi.CommandLine -like '*leonardo*') { `$processName = 'leonardo' }
            elseif (`$wmi.CommandLine -like '*frontend*') { `$processName = 'frontend' }
            elseif (`$wmi.CommandLine -like '*unified*') { `$processName = 'unified' }
        } catch {}
        
        `$metrics[`$processName] = @{
            PID = `$process.Id
            Memory = `$memoryMB
            CPU = `$cpuPercent
            Uptime = `$uptime
            Threads = `$process.Threads.Count
            Handles = `$process.HandleCount
        }
    }
    
    return `$metrics
}

function Test-ServiceHealth {
    `$services = @{
        leonardo = '$($envConfig.Ports.leonardo)'
        frontend = '$($envConfig.Ports.frontend)'
        unified = '$($envConfig.Ports.unified)'
    }
    
    `$health = @{}
    
    foreach (`$service in `$services.Keys) {
        `$port = `$services[`$service]
        try {
            if (`$service -eq 'leonardo' -or `$service -eq 'unified') {
                `$response = Invoke-RestMethod -Uri "http://localhost:`$port/api/status" -Method GET -TimeoutSec 5
                `$health[`$service] = @{ Status = 'HEALTHY'; ResponseTime = `$response.ResponseTime }
            } else {
                `$testConnection = Test-NetConnection -ComputerName 'localhost' -Port `$port -InformationLevel Quiet -WarningAction SilentlyContinue
                `$health[`$service] = @{ Status = if (`$testConnection) { 'HEALTHY' } else { 'UNHEALTHY' } }
            }
        } catch {
            `$health[`$service] = @{ Status = 'UNHEALTHY'; Error = `$_.Exception.Message }
        }
    }
    
    return `$health
}

Write-MonitorLog "Sistema de monitoreo iniciado - Intervalo: `$Interval segundos"
Write-MonitorLog "Entorno: `$Environment | Trading Mode: `$TradingMode"

while (`$true) {
    try {
        `$metrics = Get-SystemMetrics
        `$health = Test-ServiceHealth
        
        # Generar reporte de metricas
        `$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        `$report = @{
            Timestamp = `$timestamp
            Environment = `$Environment
            TradingMode = `$TradingMode
            Metrics = `$metrics
            Health = `$health
        }
        
        # Guardar metricas en JSON
        `$reportFile = Join-Path `$LogsPath "metrics-`$(Get-Date -Format 'yyyyMMdd-HH').json"
        `$report | ConvertTo-Json -Depth 4 | Out-File -FilePath `$reportFile -Encoding UTF8
        
        # Log resumido
        `$activeServices = (`$health.Keys | Where-Object { `$health[`$_].Status -eq 'HEALTHY' }).Count
        `$totalMemory = (`$metrics.Values | Measure-Object -Property Memory -Sum).Sum
        
        Write-MonitorLog "Servicios activos: `$activeServices | Memoria total: `$totalMemory MB"
        
        # Alertas automaticas
        foreach (`$service in `$health.Keys) {
            if (`$health[`$service].Status -ne 'HEALTHY') {
                Write-MonitorLog "ALERTA: Servicio `$service no saludable - `$(`$health[`$service].Error)" "WARN"
            }
        }
        
    } catch {
        Write-MonitorLog "Error en ciclo de monitoreo: `$(`$_.Exception.Message)" "ERROR"
    }
    
    Start-Sleep -Seconds `$Interval
}
"@
    
    # Guardar script de monitoreo
    $monitorContent | Out-File -FilePath $monitorScript -Encoding UTF8
    
    # Iniciar proceso de monitoreo
    $monitorProcess = Start-Process -FilePath "powershell" -ArgumentList @("-ExecutionPolicy", "Bypass", "-File", $monitorScript) -WindowStyle "Minimized" -PassThru
    
    if ($monitorProcess) {
        Write-DeployLog "Sistema de monitoreo iniciado - PID: $($monitorProcess.Id)" "SUCCESS" "MONITOR"
        $monitorProcess.Id | Out-File -FilePath (Join-Path $PIDS_PATH "monitor.pid") -Encoding UTF8
        return $monitorProcess
    }
    
    return $null
}

function Generate-DeployReport {
    param([hashtable]$DeployResults, [datetime]$StartTime)
    
    $endTime = Get-Date
    $duration = $endTime - $StartTime
    
    $report = @{
        DeploymentInfo = @{
            Version = $SCRIPT_VERSION
            Environment = $Environment
            TradingMode = $TradingMode
            StartTime = $StartTime
            EndTime = $endTime
            Duration = "$($duration.Minutes)m $($duration.Seconds)s"
        }
        Configuration = @{
            BackgroundMode = $BackgroundMode
            EnableMonitoring = $EnableMonitoring
            AutoRestart = $AutoRestart
            HealthCheckInterval = $HealthCheckInterval
        }
        Results = $DeployResults
        Ports = $ENVIRONMENT_CONFIGS[$Environment].Ports
        LogFiles = @{
            Deploy = Join-Path $LOGS_PATH "deploy-$(Get-Date -Format 'yyyyMMdd').log"
            Monitor = Join-Path $LOGS_PATH "monitor-$(Get-Date -Format 'yyyyMMdd').log"
            Metrics = Join-Path $LOGS_PATH "metrics-$(Get-Date -Format 'yyyyMMdd-HH').json"
        }
    }
    
    # Guardar reporte
    $reportFile = Join-Path $LOGS_PATH "deploy-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    $report | ConvertTo-Json -Depth 5 | Out-File -FilePath $reportFile -Encoding UTF8
    
    Write-DeployLog "Reporte de despliegue generado: $reportFile" "SUCCESS"
    return $report
}

# ========================================================================
# FUNCION PRINCIPAL DE DESPLIEGUE
# ========================================================================

function Start-MasterDeploy {
    $startTime = Get-Date
    Show-DeployHeader
    
    Write-DeployLog "Iniciando proceso de despliegue maestro..." "INFO"
    Write-DeployLog "Timestamp: $startTime" "INFO"
    
    # Verificar requisitos del sistema
    if (!(Test-SystemRequirements)) {
        Write-DeployLog "Despliegue abortado - Requisitos no cumplidos" "ERROR"
        return
    }
    
    # Limpiar procesos existentes si es necesario
    if ($CleanStart) {
        Stop-ExistingProcesses -ForceClean $true
        Start-Sleep -Seconds 2
    } else {
        Stop-ExistingProcesses -ForceClean $false
    }
    
    # Resultados del despliegue
    $deployResults = @{}
    
    # Desplegar componentes según configuración
    $tradingConfig = $TRADING_CONFIGS[$TradingMode]
    $deploySuccess = $true
    
    foreach ($service in $tradingConfig.RequiredServices) {
        Write-DeployLog "Desplegando servicio: $service" "INFO"
        
        $result = switch ($service) {
            "leonardo" { Deploy-LeonardoConsciousness }
            "frontend" { Deploy-FrontendUnified }
            "unified" { Deploy-UnifiedMaster }
            default { 
                Write-DeployLog "Servicio desconocido: $service" "ERROR"
                $false 
            }
        }
        
        $deployResults[$service] = @{
            Success = $result
            Timestamp = Get-Date
        }
        
        if (!$result) {
            Write-DeployLog "Error desplegando $service" "ERROR"
            $deploySuccess = $false
        }
    }
    
    # Iniciar monitoreo si el despliegue fue exitoso
    $monitorProcess = $null
    if ($deploySuccess -and $EnableMonitoring) {
        $monitorProcess = Start-SystemMonitoring
        $deployResults["monitoring"] = @{
            Success = ($monitorProcess -ne $null)
            PID = if ($monitorProcess) { $monitorProcess.Id } else { $null }
            Timestamp = Get-Date
        }
    }
    
    # Generar reporte final
    $finalReport = Generate-DeployReport -DeployResults $deployResults -StartTime $startTime
    
    # Mostrar resumen final
    Show-DeploymentSummary -Report $finalReport -Success $deploySuccess
    
    Write-DeployLog "Proceso de despliegue maestro completado" "INFO"
    
    return $deploySuccess
}

function Show-DeploymentSummary {
    param([hashtable]$Report, [bool]$Success)
    
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor $(if ($Success) { "Green" } else { "Red" })
    Write-Host "                 RESUMEN DE DESPLIEGUE" -ForegroundColor Yellow
    Write-Host "================================================================" -ForegroundColor $(if ($Success) { "Green" } else { "Red" })
    Write-Host ""
    
    Write-Host "Estado General: " -NoNewline
    Write-Host $(if ($Success) { "EXITOSO" } else { "CON ERRORES" }) -ForegroundColor $(if ($Success) { "Green" } else { "Red" })
    
    Write-Host "Duracion: $($Report.DeploymentInfo.Duration)" -ForegroundColor Cyan
    Write-Host "Entorno: $($Report.DeploymentInfo.Environment)" -ForegroundColor Cyan
    Write-Host "Modo Trading: $($Report.DeploymentInfo.TradingMode)" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Servicios Desplegados:" -ForegroundColor White
    foreach ($service in $Report.Results.Keys) {
        $status = if ($Report.Results[$service].Success) { "OK" } else { "ERROR" }
        $color = if ($Report.Results[$service].Success) { "Green" } else { "Red" }
        Write-Host "  - $service : $status" -ForegroundColor $color
    }
    Write-Host ""
    
    Write-Host "Puertos de Acceso:" -ForegroundColor White
    foreach ($service in $Report.Ports.Keys) {
        $port = $Report.Ports[$service]
        Write-Host "  - $service : http://localhost:$port" -ForegroundColor Cyan
    }
    Write-Host ""
    
    Write-Host "Archivos de Log:" -ForegroundColor White
    foreach ($logType in $Report.LogFiles.Keys) {
        Write-Host "  - $logType : $($Report.LogFiles[$logType])" -ForegroundColor Gray
    }
    Write-Host ""
    
    if ($Success) {
        Write-Host "Sistema desplegado exitosamente y funcionando en segundo plano" -ForegroundColor Green
        Write-Host "Use los comandos de control para gestionar el sistema" -ForegroundColor Yellow
    } else {
        Write-Host "Despliegue completado con errores. Revisar logs para detalles" -ForegroundColor Red
    }
    
    Write-Host ""
}

# ========================================================================
# EJECUCION PRINCIPAL
# ========================================================================

# Verificar parametros
if ($Environment -notin $ENVIRONMENT_CONFIGS.Keys) {
    Write-Host "Error: Entorno '$Environment' no valido" -ForegroundColor Red
    Write-Host "Entornos disponibles: $($ENVIRONMENT_CONFIGS.Keys -join ', ')" -ForegroundColor Yellow
    exit 1
}

if ($TradingMode -notin $TRADING_CONFIGS.Keys) {
    Write-Host "Error: Modo de trading '$TradingMode' no valido" -ForegroundColor Red  
    Write-Host "Modos disponibles: $($TRADING_CONFIGS.Keys -join ', ')" -ForegroundColor Yellow
    exit 1
}

# Ejecutar despliegue maestro
$deploymentSuccess = Start-MasterDeploy

# Codigo de salida
if ($deploymentSuccess) {
    exit 0
} else {
    exit 1
}
