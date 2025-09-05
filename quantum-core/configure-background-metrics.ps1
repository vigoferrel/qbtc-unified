# QBTC Background Process Configuration - ASCII Compatible
# Configura procesos en segundo plano con reporting de metricas
# Compatible con Windows PowerShell y ASCII

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("configure", "status", "logs", "cleanup")]
    [string]$Action = "configure",
    
    [Parameter(Mandatory=$false)]
    [int]$MetricsInterval = 30,
    
    [Parameter(Mandatory=$false)]
    [switch]$EnableReporting
)

# Configuracion global
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Definition
$LOG_DIR = Join-Path $SCRIPT_DIR "logs"
$CONFIG_DIR = Join-Path $SCRIPT_DIR "config"
$METRICS_LOG = Join-Path $LOG_DIR "metrics.log"
$BACKGROUND_CONFIG = Join-Path $CONFIG_DIR "background-processes.json"

# Funciones de utilidad ASCII
function Write-ASCIIHeader {
    param([string]$Title)
    
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host " $Title" -ForegroundColor Yellow
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host ""
}

function Write-ASCIIStatus {
    param(
        [string]$Component,
        [string]$Status,
        [string]$Details = ""
    )
    
    $statusColor = switch ($Status) {
        "RUNNING" { "Green" }
        "STOPPED" { "Red" }
        "WARNING" { "Yellow" }
        default { "White" }
    }
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] " -NoNewline -ForegroundColor Gray
    Write-Host "[" -NoNewline -ForegroundColor White
    Write-Host $Status -NoNewline -ForegroundColor $statusColor
    Write-Host "] " -NoNewline -ForegroundColor White
    Write-Host "$Component" -NoNewline -ForegroundColor Cyan
    
    if ($Details) {
        Write-Host " - $Details" -ForegroundColor Gray
    } else {
        Write-Host ""
    }
}

function Write-MetricsLog {
    param(
        [string]$Component,
        [string]$Metric,
        [string]$Value,
        [string]$Unit = ""
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "$timestamp|$Component|$Metric|$Value|$Unit"
    
    # Escribir a archivo de metricas
    Add-Content -Path $METRICS_LOG -Value $logEntry
    
    # Mostrar en consola si verbose
    if ($VerbosePreference -eq "Continue") {
        Write-Host "[METRICS] $Component.$Metric = $Value $Unit" -ForegroundColor Magenta
    }
}

function Initialize-BackgroundDirectories {
    Write-ASCIIHeader "INICIALIZANDO DIRECTORIOS DE SEGUNDO PLANO"
    
    $directories = @($LOG_DIR, $CONFIG_DIR)
    
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-ASCIIStatus "DIRECTORY" "CREATED" $dir
        } else {
            Write-ASCIIStatus "DIRECTORY" "EXISTS" $dir
        }
    }
    
    # Inicializar archivo de metricas
    if (-not (Test-Path $METRICS_LOG)) {
        $header = "# QBTC Metrics Log - Procesos en Segundo Plano"
        $header | Out-File -FilePath $METRICS_LOG -Encoding ASCII
        Add-Content -Path $METRICS_LOG -Value "# Formato: TIMESTAMP|COMPONENT|METRIC|VALUE|UNIT"
        Write-ASCIIStatus "METRICS_LOG" "CREATED" $METRICS_LOG
    } else {
        Write-ASCIIStatus "METRICS_LOG" "EXISTS" $METRICS_LOG
    }
}

function Create-BackgroundConfig {
    Write-ASCIIHeader "CONFIGURANDO PROCESOS EN SEGUNDO PLANO"
    
    $config = @{
        "version" = "1.0"
        "last_updated" = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        "background_processes" = @{
            "quantum_core" = @{
                "enabled" = $true
                "script" = "UnifiedHttpServer.js"
                "port" = 18020
                "metrics_enabled" = $EnableReporting.IsPresent
                "metrics_interval" = $MetricsInterval
                "log_level" = "INFO"
                "restart_on_failure" = $true
                "max_memory_mb" = 512
            }
            "frontend_server" = @{
                "enabled" = $true
                "script" = "web-server.js"
                "port" = 8080
                "metrics_enabled" = $EnableReporting.IsPresent
                "metrics_interval" = $MetricsInterval
                "log_level" = "INFO"
                "restart_on_failure" = $true
                "max_memory_mb" = 256
            }
            "metrics_collector" = @{
                "enabled" = $EnableReporting.IsPresent
                "script" = "metrics-collector.js"
                "interval_seconds" = $MetricsInterval
                "collect_system_metrics" = $true
                "collect_app_metrics" = $true
                "log_level" = "INFO"
                "max_memory_mb" = 128
            }
        }
        "monitoring" = @{
            "health_check_interval" = 60
            "performance_logging" = $EnableReporting.IsPresent
            "error_alerting" = $true
            "log_retention_days" = 7
            "max_log_size_mb" = 100
        }
        "windows_compatibility" = @{
            "use_ascii_only" = $true
            "use_powershell_native" = $true
            "avoid_unicode_chars" = $true
            "process_isolation" = $true
        }
    }
    
    # Convertir a JSON y guardar
    $configJson = $config | ConvertTo-Json -Depth 5
    $configJson | Out-File -FilePath $BACKGROUND_CONFIG -Encoding UTF8
    
    Write-ASCIIStatus "CONFIG" "CREATED" "Configuracion guardada en $BACKGROUND_CONFIG"
    
    # Mostrar configuracion
    Write-Host "`nConfiguracion de Procesos en Segundo Plano:" -ForegroundColor Yellow
    Write-Host "- Quantum Core: Puerto $($config.background_processes.quantum_core.port)" -ForegroundColor White
    Write-Host "- Frontend Server: Puerto $($config.background_processes.frontend_server.port)" -ForegroundColor White
    Write-Host "- Metricas habilitadas: $($EnableReporting.IsPresent)" -ForegroundColor White
    Write-Host "- Intervalo de metricas: $MetricsInterval segundos" -ForegroundColor White
    Write-Host "- Compatibilidad ASCII: SI" -ForegroundColor Green
    Write-Host "- Procesos aislados: SI" -ForegroundColor Green
}

function Create-MetricsCollector {
    Write-ASCIIHeader "CREANDO COLLECTOR DE METRICAS"
    
    $metricsScript = @"
// QBTC Metrics Collector - Background Process
// Compatible con ASCII y Windows PowerShell

const fs = require('fs');
const path = require('path');
const os = require('os');

class MetricsCollector {
    constructor() {
        this.logFile = path.join(__dirname, 'logs', 'metrics.log');
        this.interval = $MetricsInterval * 1000; // segundos a milisegundos
        this.startTime = Date.now();
        
        console.log('[METRICS] Collector iniciado - Intervalo: ${MetricsInterval}s');
        this.start();
    }
    
    start() {
        this.collect(); // Primera recoleccion inmediata
        this.intervalId = setInterval(() => this.collect(), this.interval);
        
        // Graceful shutdown
        process.on('SIGINT', () => this.stop());
        process.on('SIGTERM', () => this.stop());
    }
    
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            console.log('[METRICS] Collector detenido');
        }
        process.exit(0);
    }
    
    collect() {
        const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
        const metrics = this.getSystemMetrics();
        
        // Escribir metricas a archivo
        const logEntries = [
            `timestamp|SYSTEM|CPU_USAGE|percentage|`,
            `timestamp|SYSTEM|MEMORY_USAGE|percentage|`,
            `timestamp|SYSTEM|FREE_MEMORY|mb|`,
            `timestamp|SYSTEM|UPTIME|seconds|`,
            `timestamp|PROCESS|PID|number|`,
            `timestamp|PROCESS|MEMORY_RSS|mb|`,
            `timestamp|PROCESS|CPU_TIME|seconds|`
        ].map(entry => entry.replace('timestamp', timestamp));
        
        const metricsData = [
            `timestamp|SYSTEM|CPU_USAGE|percentage|`,
            `timestamp|SYSTEM|MEMORY_USAGE|percentage|`,
            `timestamp|SYSTEM|FREE_MEMORY|mb|`,
            `timestamp|SYSTEM|UPTIME|seconds|`,
            `timestamp|PROCESS|PID|number|`,
            `timestamp|PROCESS|MEMORY_RSS|mb|`,
            `timestamp|PROCESS|CPU_TIME|seconds|`
        ].map((template, index) => {
            const values = [
                metrics.cpuUsage.toFixed(2),
                metrics.memoryUsage.toFixed(2),
                metrics.freeMemory.toFixed(2),
                metrics.uptime.toFixed(0),
                process.pid,
                metrics.processMemory.toFixed(2),
                metrics.processCpuTime.toFixed(2)
            ];
            return template.replace('timestamp', timestamp).replace('percentage|', values[index] + '|').replace('mb|', values[index] + '|').replace('seconds|', values[index] + '|').replace('number|', values[index] + '|');
        });
        
        // Escribir al archivo de logs
        metricsData.forEach(entry => {
            fs.appendFileSync(this.logFile, entry + '\n');
        });
        
        console.log(`[METRICS] Recolectadas - CPU: cpu%, MEM: mem%`, metrics.cpuUsage.toFixed(1), metrics.memoryUsage.toFixed(1));
    }
    
    getSystemMetrics() {
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;
        
        return {
            cpuUsage: this.getCpuUsage(),
            memoryUsage: (usedMemory / totalMemory) * 100,
            freeMemory: freeMemory / (1024 * 1024), // MB
            uptime: os.uptime(),
            processMemory: process.memoryUsage().rss / (1024 * 1024), // MB
            processCpuTime: process.cpuUsage().user / 1000000 // segundos
        };
    }
    
    getCpuUsage() {
        // Simulacion simple de CPU usage
        const loadavg = os.loadavg();
        return loadavg[0] * 10; // Aproximacion
    }
}

new MetricsCollector();
"@
    
    $metricsScriptPath = Join-Path $SCRIPT_DIR "metrics-collector.js"
    $metricsScript | Out-File -FilePath $metricsScriptPath -Encoding UTF8
    
    Write-ASCIIStatus "METRICS_COLLECTOR" "CREATED" $metricsScriptPath
}

function Start-BackgroundProcesses {
    Write-ASCIIHeader "INICIANDO PROCESOS EN SEGUNDO PLANO"
    
    if (-not (Test-Path $BACKGROUND_CONFIG)) {
        Write-ASCIIStatus "CONFIG" "ERROR" "Archivo de configuracion no encontrado. Ejecuta con -Action configure primero."
        return
    }
    
    $config = Get-Content $BACKGROUND_CONFIG | ConvertFrom-Json
    
    # Iniciar Quantum Core
    if ($config.background_processes.quantum_core.enabled) {
        $quantumScript = Join-Path $SCRIPT_DIR $config.background_processes.quantum_core.script
        if (Test-Path $quantumScript) {
            Start-Process -FilePath "node" -ArgumentList $quantumScript -WindowStyle Hidden -PassThru
            Write-ASCIIStatus "QUANTUM_CORE" "STARTING" "Puerto $($config.background_processes.quantum_core.port)"
            Write-MetricsLog "QUANTUM_CORE" "STATUS" "STARTING"
        } else {
            Write-ASCIIStatus "QUANTUM_CORE" "ERROR" "Script no encontrado: $quantumScript"
        }
    }
    
    # Iniciar Metrics Collector si esta habilitado
    if ($config.background_processes.metrics_collector.enabled) {
        $metricsScript = Join-Path $SCRIPT_DIR "metrics-collector.js"
        if (Test-Path $metricsScript) {
            Start-Process -FilePath "node" -ArgumentList $metricsScript -WindowStyle Hidden -PassThru
            Write-ASCIIStatus "METRICS_COLLECTOR" "STARTING" "Intervalo: $($config.background_processes.metrics_collector.interval_seconds)s"
            Write-MetricsLog "METRICS_COLLECTOR" "STATUS" "STARTING"
        }
    }
    
    Write-Host "`nProcesos iniciados en segundo plano" -ForegroundColor Green
    Write-Host "Para ver el estado: .\configure-background-metrics.ps1 -Action status" -ForegroundColor Yellow
}

function Get-BackgroundStatus {
    Write-ASCIIHeader "ESTADO DE PROCESOS EN SEGUNDO PLANO"
    
    # Buscar procesos Node.js relacionados con QBTC
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    
    if ($nodeProcesses) {
        Write-Host "Procesos Node.js detectados:" -ForegroundColor Yellow
        foreach ($process in $nodeProcesses) {
            $memoryMB = [math]::Round($process.WorkingSet64 / 1MB, 2)
            $cpuTime = $process.TotalProcessorTime
            
            Write-ASCIIStatus "NODE_PROCESS" "RUNNING" "PID: $($process.Id), Memory: $memoryMB MB, CPU: $cpuTime"
            Write-MetricsLog "NODE_PROCESS" "PID" $process.Id
            Write-MetricsLog "NODE_PROCESS" "MEMORY_MB" $memoryMB "MB"
        }
    } else {
        Write-ASCIIStatus "NODE_PROCESSES" "STOPPED" "No se encontraron procesos Node.js"
    }
    
    # Verificar archivos de log
    if (Test-Path $METRICS_LOG) {
        $logSize = (Get-Item $METRICS_LOG).Length / 1KB
        Write-ASCIIStatus "METRICS_LOG" "EXISTS" "Tamaño: $([math]::Round($logSize, 2)) KB"
        
        # Mostrar ultimas metricas
        $lastLines = Get-Content $METRICS_LOG -Tail 3
        if ($lastLines) {
            Write-Host "`nUltimas metricas registradas:" -ForegroundColor Yellow
            foreach ($line in $lastLines) {
                if ($line -and -not $line.StartsWith("#")) {
                    Write-Host "  $line" -ForegroundColor Gray
                }
            }
        }
    } else {
        Write-ASCIIStatus "METRICS_LOG" "MISSING" "Archivo de metricas no encontrado"
    }
}

function Show-MetricsLogs {
    Write-ASCIIHeader "LOGS DE METRICAS"
    
    if (Test-Path $METRICS_LOG) {
        $logContent = Get-Content $METRICS_LOG -Tail 20
        
        Write-Host "Ultimas 20 entradas de metricas:" -ForegroundColor Yellow
        foreach ($line in $logContent) {
            if ($line -and -not $line.StartsWith("#")) {
                $parts = $line -split '\|'
                if ($parts.Count -ge 5) {
                    $timestamp = $parts[0]
                    $component = $parts[1]
                    $metric = $parts[2]
                    $value = $parts[3]
                    $unit = $parts[4]
                    
                    Write-Host "[$timestamp] " -NoNewline -ForegroundColor Gray
                    Write-Host "$component." -NoNewline -ForegroundColor Cyan
                    Write-Host "$metric" -NoNewline -ForegroundColor Yellow
                    Write-Host " = " -NoNewline -ForegroundColor White
                    Write-Host "$value $unit" -ForegroundColor Green
                }
            }
        }
    } else {
        Write-Host "Archivo de metricas no encontrado: $METRICS_LOG" -ForegroundColor Red
    }
}

function Clear-BackgroundLogs {
    Write-ASCIIHeader "LIMPIANDO LOGS DE SEGUNDO PLANO"
    
    $logFiles = @(
        $METRICS_LOG,
        (Join-Path $LOG_DIR "backend.log"),
        (Join-Path $LOG_DIR "error.log")
    )
    
    foreach ($logFile in $logFiles) {
        if (Test-Path $logFile) {
            Remove-Item $logFile -Force
            Write-ASCIIStatus "CLEANUP" "DELETED" $logFile
        }
    }
    
    Write-Host "Limpieza completada" -ForegroundColor Green
}

# Funcion principal
function Main {
    Write-Host ""
    Write-Host "QBTC Background Metrics Configuration" -ForegroundColor Cyan
    Write-Host "Compatible con Windows PowerShell y ASCII" -ForegroundColor Gray
    
    switch ($Action.ToLower()) {
        "configure" {
            Initialize-BackgroundDirectories
            Create-BackgroundConfig
            if ($EnableReporting) {
                Create-MetricsCollector
            }
            Write-Host "`nConfiguracion completada. Para iniciar procesos ejecuta:" -ForegroundColor Green
            Write-Host ".\configure-background-metrics.ps1 -Action start" -ForegroundColor Yellow
        }
        "start" {
            Start-BackgroundProcesses
        }
        "status" {
            Get-BackgroundStatus
        }
        "logs" {
            Show-MetricsLogs
        }
        "cleanup" {
            Clear-BackgroundLogs
        }
        default {
            Write-Host "Acciones disponibles: configure, start, status, logs, cleanup" -ForegroundColor Yellow
            Write-Host "Ejemplo: .\configure-background-metrics.ps1 -Action configure -EnableReporting" -ForegroundColor Gray
        }
    }
}

# Ejecutar
Main
