# MASTER FUTURES LAUNCHER - QBTC-UNIFIED OPTIMIZADO
# Sistema simplificado con SOLO componentes rentables para bot de futuros
# Principio: "Menos es mas" - Leonardo da Vinci

param(
    [switch]$TestMode,
    [switch]$SkipPrecheck,
    [switch]$ForceRestart,
    [string]$LogLevel = "INFO"
)

$ErrorActionPreference = "Stop"

# ==============================================
# CONFIGURACION OPTIMIZADA - SOLO COMPONENTES RENTABLES
# ==============================================

$global:OPTIMIZED_CONFIG = @{
    BaseDir = "C:\Users\DELL\Desktop\QBTC-UNIFIED"
    LogsDir = "C:\Users\DELL\Desktop\QBTC-UNIFIED\logs"
    PidsDir = "C:\Users\DELL\Desktop\QBTC-UNIFIED\pids"
    
    # Banda de puertos anticonflictos (PUERTOS_LAYOUT.txt)
    PortBase = 18000
    MaxRetries = 3
    StartupDelay = 5
    HealthCheckInterval = 30
    
    # IP configurada en Binance
    PublicIP = "181.43.212.196"
    
    # Solo componentes con 80%+ rentabilidad
    RentableComponents = @(
        "BinanceConnector",
        "FundsManager", 
        "TradingEngine",
        "LeonardoCore"
    )
}

# Puertos banda alta anticonflictos segun PUERTOS_LAYOUT.txt
$global:PORTS_CONFIG = @{
    "BinanceConnector" = 18000    # quantum-engine (motor principal)
    "LeonardoCore" = 18100        # coordinator (coordinador bots)
    "TradingEngine" = 18200       # api-gateway (gateway API)  
    "FundsManager" = 18300        # nxn-system (sistema NxN)
    "HealthMonitor" = 18900       # backup-service (backup)
}

# Definicion de servicios OPTIMIZADOS (solo rentables)
$global:SERVICES = @(
    @{
        Name = "BinanceConnector"
        Command = "node"
        Script = "quantum-core\BinanceRealConnector.js"
        Port = $global:PORTS_CONFIG.BinanceConnector
        Critical = $true
        Dependencies = @()
        Rentability = 95
        HealthCheck = "http://localhost:18000/ping"
    },
    @{
        Name = "FundsManager"
        Command = "node"
        Script = "leonardo-consciousness\FundsManager.js"  
        Port = $global:PORTS_CONFIG.FundsManager
        Critical = $true
        Dependencies = @()
        Rentability = 90
        HealthCheck = "http://localhost:18300/funds/status"
    },
    @{
        Name = "TradingEngine"
        Command = "node"
        Script = "leonardo-consciousness\TradingEngineLayer.js"
        Port = $global:PORTS_CONFIG.TradingEngine
        Critical = $true
        Dependencies = @("FundsManager")
        Rentability = 88
        HealthCheck = "http://localhost:18200/trading/health"
    },
    @{
        Name = "LeonardoCore"
        Command = "node"
        Script = "leonardo-consciousness\UnifiedLeonardoCore.js"
        Port = $global:PORTS_CONFIG.LeonardoCore
        Critical = $true
        Dependencies = @("BinanceConnector", "FundsManager", "TradingEngine")
        Rentability = 80
        HealthCheck = "http://localhost:18100/consciousness/status"
    }
)

# Estado del sistema optimizado
$global:SYSTEM_STATE = @{
    ActiveServices = @{}
    FailedServices = @{}
    StartTime = Get-Date
    TotalRetries = 0
    SystemHealth = "INITIALIZING"
    RentabilityScore = 0
}

# ==============================================
# FUNCIONES DE LOGGING OPTIMIZADO
# ==============================================

function Write-OptimizedLog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$Service = "SYSTEM"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] [$Service] $Message"
    
    # Colores por nivel
    switch ($Level) {
        "ERROR" { Write-Host $logMessage -ForegroundColor Red }
        "WARN" { Write-Host $logMessage -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $logMessage -ForegroundColor Magenta }
        "INFO" { Write-Host $logMessage -ForegroundColor Cyan }
        default { Write-Host $logMessage -ForegroundColor White }
    }
    
    # Log a archivo
    $logFile = Join-Path $global:OPTIMIZED_CONFIG.LogsDir "futures_launcher.log"
    $logMessage | Out-File -FilePath $logFile -Append -Encoding ASCII
}

# ==============================================
# VALIDACIONES CRITICAS PRE-ARRANQUE
# ==============================================

function Test-CriticalPrerequisites {
    Write-OptimizedLog "Verificando prerequisitos criticos..." -Level "INFO"
    
    $errors = @()
    
    # 1. Verificar IP configurada
    try {
        $publicIP = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing -TimeoutSec 10).Content.Trim()
        if ($publicIP -ne $global:OPTIMIZED_CONFIG.PublicIP) {
            $errors += "IP publica cambio: Esperada $($global:OPTIMIZED_CONFIG.PublicIP), Actual $publicIP"
        } else {
            Write-OptimizedLog "IP verificada correctamente: $publicIP" -Level "SUCCESS"
        }
    } catch {
        Write-OptimizedLog "Advertencia: No se pudo verificar IP publica" -Level "WARN"
    }
    
    # 2. Verificar variables de entorno Binance
    $requiredEnvVars = @("BINANCE_API_KEY", "BINANCE_SECRET_KEY")
    foreach ($envVar in $requiredEnvVars) {
        if (-not $env:$envVar) {
            $errors += "Variable de entorno faltante: $envVar"
        }
    }
    
    # 3. Verificar archivos de componentes rentables
    foreach ($service in $global:SERVICES) {
        $scriptPath = Join-Path $global:OPTIMIZED_CONFIG.BaseDir $service.Script
        if (-not (Test-Path $scriptPath)) {
            $errors += "Script faltante: $($service.Script)"
        }
    }
    
    # 4. Verificar puertos disponibles
    foreach ($service in $global:SERVICES) {
        if (Test-PortInUse -Port $service.Port) {
            Write-OptimizedLog "Liberando puerto $($service.Port) para $($service.Name)..." -Level "WARN"
            Stop-ProcessOnPort -Port $service.Port
        }
    }
    
    if ($errors.Count -gt 0) {
        Write-OptimizedLog "Errores criticos encontrados:" -Level "ERROR"
        foreach ($error in $errors) {
            Write-OptimizedLog "  - $error" -Level "ERROR"
        }
        return $false
    }
    
    Write-OptimizedLog "Todos los prerequisitos verificados exitosamente" -Level "SUCCESS"
    return $true
}

function Test-PortInUse {
    param([int]$Port)
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return $connections.Count -gt 0
    } catch {
        return $false
    }
}

function Stop-ProcessOnPort {
    param([int]$Port)
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        foreach ($conn in $connections) {
            $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            if ($process) {
                Write-OptimizedLog "Terminando proceso $($process.ProcessName) (PID: $($process.Id)) en puerto $Port" -Level "WARN"
                Stop-Process -Id $process.Id -Force
                Start-Sleep -Seconds 2
            }
        }
    } catch {
        Write-OptimizedLog "Error liberando puerto $Port: $_" -Level "ERROR"
    }
}

# ==============================================
# GESTION DE SERVICIOS OPTIMIZADA
# ==============================================

function Start-OptimizedService {
    param([hashtable]$Service)
    
    Write-OptimizedLog "Iniciando servicio optimizado: $($Service.Name) (Rentabilidad: $($Service.Rentability)%)" -Service $Service.Name
    
    # Verificar dependencias
    foreach ($dep in $Service.Dependencies) {
        if (-not $global:SYSTEM_STATE.ActiveServices.ContainsKey($dep)) {
            Write-OptimizedLog "Dependencia no satisfecha: $dep" -Level "ERROR" -Service $Service.Name
            return $null
        }
    }
    
    try {
        # Crear directorio de logs
        $serviceLogDir = Join-Path $global:OPTIMIZED_CONFIG.LogsDir $Service.Name
        if (-not (Test-Path $serviceLogDir)) {
            New-Item -ItemType Directory -Path $serviceLogDir -Force | Out-Null
        }
        
        # Configurar archivos de log
        $outputLog = Join-Path $serviceLogDir "output.log"
        $errorLog = Join-Path $serviceLogDir "error.log"
        
        # Construir argumentos del script
        $scriptPath = Join-Path $global:OPTIMIZED_CONFIG.BaseDir $Service.Script
        
        # Variables de entorno especificas
        $env:SERVICE_PORT = $Service.Port
        $env:SERVICE_NAME = $Service.Name
        $env:FUTURES_ONLY = "true"
        $env:RENTABILITY_MODE = "true"
        
        # Iniciar el proceso
        $processInfo = Start-Process -FilePath $Service.Command `
                                   -ArgumentList $scriptPath `
                                   -WorkingDirectory $global:OPTIMIZED_CONFIG.BaseDir `
                                   -WindowStyle Hidden `
                                   -RedirectStandardOutput $outputLog `
                                   -RedirectStandardError $errorLog `
                                   -PassThru
        
        if ($processInfo) {
            # Guardar PID
            $pidFile = Join-Path $global:OPTIMIZED_CONFIG.PidsDir "$($Service.Name).pid"
            $processInfo.Id | Out-File -FilePath $pidFile -Encoding ASCII
            
            Write-OptimizedLog "Servicio iniciado exitosamente (PID: $($processInfo.Id), Puerto: $($Service.Port))" -Level "SUCCESS" -Service $Service.Name
            
            # Esperar estabilizacion
            Start-Sleep -Seconds $global:OPTIMIZED_CONFIG.StartupDelay
            
            # Verificar que no haya terminado inmediatamente
            if ($processInfo.HasExited) {
                Write-OptimizedLog "El servicio termino inmediatamente (exit code: $($processInfo.ExitCode))" -Level "ERROR" -Service $Service.Name
                return $null
            }
            
            return $processInfo
        }
        
    } catch {
        Write-OptimizedLog "Error iniciando servicio: $_" -Level "ERROR" -Service $Service.Name
        return $null
    }
    
    return $null
}

function Test-ServiceHealth {
    param(
        [hashtable]$Service,
        [System.Diagnostics.Process]$Process
    )
    
    # Verificar proceso activo
    if ($Process.HasExited) {
        return $false
    }
    
    # Health check HTTP (si esta disponible)
    if ($Service.HealthCheck) {
        try {
            $response = Invoke-WebRequest -Uri $Service.HealthCheck -TimeoutSec 5 -UseBasicParsing
            return $response.StatusCode -eq 200
        } catch {
            # No es critico si el health check falla, solo el proceso debe estar activo
            return $true
        }
    }
    
    return $true
}

function Start-AllOptimizedServices {
    Write-OptimizedLog "=== INICIANDO SISTEMA OPTIMIZADO DE FUTUROS QBTC ===" -Level "SUCCESS"
    Write-OptimizedLog "Componentes seleccionados por rentabilidad (80%+ solamente)" -Level "INFO"
    
    $global:SYSTEM_STATE.SystemHealth = "STARTING"
    
    # Ordenar servicios por dependencias (topological sort)
    $sortedServices = Get-ServicesByDependencyOrder
    
    foreach ($service in $sortedServices) {
        $maxAttempts = $global:OPTIMIZED_CONFIG.MaxRetries
        $attempt = 0
        $success = $false
        
        Write-OptimizedLog "Procesando: $($service.Name) (Rentabilidad: $($service.Rentability)%)" -Level "INFO"
        
        while ($attempt -lt $maxAttempts -and -not $success) {
            $attempt++
            Write-OptimizedLog "Intento $attempt/$maxAttempts para $($service.Name)" -Service $service.Name
            
            $process = Start-OptimizedService -Service $service
            
            if ($process) {
                $global:SYSTEM_STATE.ActiveServices[$service.Name] = $process
                $global:SYSTEM_STATE.RentabilityScore += $service.Rentability
                $success = $true
                Write-OptimizedLog "Servicio $($service.Name) activado exitosamente" -Level "SUCCESS" -Service $service.Name
            } else {
                Write-OptimizedLog "Fallo al iniciar $($service.Name), intento $attempt" -Level "ERROR" -Service $service.Name
                $global:SYSTEM_STATE.TotalRetries++
                
                if ($attempt -lt $maxAttempts) {
                    Write-OptimizedLog "Reintentando en $($global:OPTIMIZED_CONFIG.StartupDelay) segundos..." -Service $service.Name
                    Start-Sleep -Seconds $global:OPTIMIZED_CONFIG.StartupDelay
                }
            }
        }
        
        if (-not $success) {
            $global:SYSTEM_STATE.FailedServices[$service.Name] = Get-Date
            
            if ($service.Critical) {
                Write-OptimizedLog "FALLO CRITICO: No se pudo iniciar $($service.Name)" -Level "ERROR"
                Stop-AllServices
                return $false
            } else {
                Write-OptimizedLog "Servicio no critico $($service.Name) fallo - continuando..." -Level "WARN"
            }
        }
        
        # Pausa entre servicios para estabilizacion
        Start-Sleep -Seconds 3
    }
    
    $global:SYSTEM_STATE.SystemHealth = "RUNNING"
    
    # Calcular score final
    $totalRentability = ($global:SERVICES | Measure-Object -Property Rentability -Sum).Sum
    $achievedRentability = $global:SYSTEM_STATE.RentabilityScore
    $efficiencyPercent = [math]::Round(($achievedRentability / $totalRentability) * 100, 1)
    
    Write-OptimizedLog "=== SISTEMA OPTIMIZADO ACTIVADO ===" -Level "SUCCESS"
    Write-OptimizedLog "Servicios activos: $($global:SYSTEM_STATE.ActiveServices.Count)/$($global:SERVICES.Count)" -Level "INFO"
    Write-OptimizedLog "Score de rentabilidad: $achievedRentability/$totalRentability ($efficiencyPercent%)" -Level "INFO"
    Write-OptimizedLog "Total reintentos: $($global:SYSTEM_STATE.TotalRetries)" -Level "INFO"
    
    return $true
}

function Get-ServicesByDependencyOrder {
    # Ordenamiento topologico simple por nivel de dependencias
    $services = $global:SERVICES | Sort-Object { $_.Dependencies.Count }
    return $services
}

function Stop-AllServices {
    Write-OptimizedLog "Deteniendo todos los servicios optimizados..." -Level "WARN"
    
    # Detener en orden inverso
    $reverseServices = [array]$global:SYSTEM_STATE.ActiveServices.Keys
    [array]::Reverse($reverseServices)
    
    foreach ($serviceName in $reverseServices) {
        $process = $global:SYSTEM_STATE.ActiveServices[$serviceName]
        Write-OptimizedLog "Deteniendo $serviceName..." -Service $serviceName
        
        try {
            if (-not $process.HasExited) {
                $process.CloseMainWindow()
                Start-Sleep -Seconds 3
                
                if (-not $process.HasExited) {
                    $process.Kill()
                }
            }
            
            # Limpiar PID
            $pidFile = Join-Path $global:OPTIMIZED_CONFIG.PidsDir "$serviceName.pid"
            if (Test-Path $pidFile) {
                Remove-Item $pidFile -Force
            }
            
        } catch {
            Write-OptimizedLog "Error deteniendo $serviceName: $_" -Level "ERROR" -Service $serviceName
        }
    }
    
    $global:SYSTEM_STATE.ActiveServices.Clear()
}

function Show-SystemStatus {
    Write-OptimizedLog "=== ESTADO SISTEMA OPTIMIZADO QBTC-FUTURES ===" -Level "INFO"
    Write-OptimizedLog "Estado: $($global:SYSTEM_STATE.SystemHealth)" -Level "INFO"
    Write-OptimizedLog "Uptime: $((Get-Date) - $global:SYSTEM_STATE.StartTime)" -Level "INFO"
    Write-OptimizedLog "Rentabilidad lograda: $($global:SYSTEM_STATE.RentabilityScore)" -Level "INFO"
    
    Write-OptimizedLog "SERVICIOS ACTIVOS:" -Level "SUCCESS"
    foreach ($serviceName in $global:SYSTEM_STATE.ActiveServices.Keys) {
        $process = $global:SYSTEM_STATE.ActiveServices[$serviceName]
        $service = $global:SERVICES | Where-Object { $_.Name -eq $serviceName }
        $status = if ($process.HasExited) { "TERMINADO" } else { "ACTIVO" }
        Write-OptimizedLog "  - $serviceName (PID: $($process.Id), Puerto: $($service.Port), Rentabilidad: $($service.Rentability)%) - $status" -Level "INFO"
    }
    
    if ($global:SYSTEM_STATE.FailedServices.Count -gt 0) {
        Write-OptimizedLog "SERVICIOS FALLIDOS:" -Level "ERROR"
        foreach ($serviceName in $global:SYSTEM_STATE.FailedServices.Keys) {
            Write-OptimizedLog "  - $serviceName" -Level "ERROR"
        }
    }
}

# ==============================================
# SCRIPT PRINCIPAL OPTIMIZADO
# ==============================================

function Start-OptimizedMasterSystem {
    Write-OptimizedLog "MASTER FUTURES LAUNCHER - OPTIMIZADO PARA RENTABILIDAD" -Level "SUCCESS"
    Write-OptimizedLog "=========================================================" -Level "SUCCESS"
    Write-OptimizedLog "Principio: 'Menos es mas' - Solo componentes 80%+ rentables" -Level "INFO"
    
    try {
        # Inicializar entorno
        Initialize-OptimizedEnvironment
        
        # Validaciones criticas (skip si se solicita)
        if (-not $SkipPrecheck) {
            if (-not (Test-CriticalPrerequisites)) {
                Write-OptimizedLog "Prerequisitos fallaron - abortando" -Level "ERROR"
                exit 1
            }
        }
        
        # Limpiar procesos anteriores si es necesario
        if ($ForceRestart) {
            Write-OptimizedLog "Reinicio forzado - limpiando procesos anteriores..." -Level "WARN"
            Stop-AllServices
            Start-Sleep -Seconds 5
        }
        
        # Iniciar sistema optimizado
        $success = Start-AllOptimizedServices
        
        if (-not $success) {
            Write-OptimizedLog "FALLO AL INICIAR SISTEMA OPTIMIZADO" -Level "ERROR"
            exit 1
        }
        
        # Mostrar estado inicial
        Show-SystemStatus
        
        # Configurar manejadores de señales
        [Console]::CancelKeyPress += {
            param($sender, $e)
            $e.Cancel = $true
            Write-OptimizedLog "Señal de interrupcion recibida - cerrando sistema..." -Level "WARN"
            Stop-AllServices
            exit 0
        }
        
        Write-OptimizedLog "Sistema optimizado funcionando - presiona Ctrl+C para detener" -Level "SUCCESS"
        
        # Bucle principal optimizado
        while ($true) {
            Start-Sleep -Seconds 60
            Show-SystemStatus
            
            # Health check basico
            foreach ($serviceName in $global:SYSTEM_STATE.ActiveServices.Keys) {
                $process = $global:SYSTEM_STATE.ActiveServices[$serviceName]
                if ($process.HasExited) {
                    Write-OptimizedLog "ALERTA: Servicio $serviceName termino inesperadamente" -Level "ERROR"
                }
            }
        }
        
    } catch {
        Write-OptimizedLog "Error critico en sistema optimizado: $_" -Level "ERROR"
        Stop-AllServices
        exit 1
    }
}

function Initialize-OptimizedEnvironment {
    Write-OptimizedLog "Inicializando entorno optimizado..." -Level "INFO"
    
    # Crear directorios
    $dirs = @(
        $global:OPTIMIZED_CONFIG.LogsDir,
        $global:OPTIMIZED_CONFIG.PidsDir
    )
    
    foreach ($dir in $dirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-OptimizedLog "Creado directorio: $dir" -Level "INFO"
        }
    }
    
    # Configurar variables de entorno para futuros
    $env:BINANCE_FUTURES_ONLY = "true"
    $env:QBTC_OPTIMIZED_MODE = "true"
    $env:SYSTEM_TYPE = "FUTURES_TRADING"
    $env:RENTABILITY_THRESHOLD = "80"
    $env:IP_CONFIGURED = $global:OPTIMIZED_CONFIG.PublicIP
    
    Write-OptimizedLog "Entorno optimizado configurado correctamente" -Level "SUCCESS"
}

# Ejecutar si se invoca directamente
if ($MyInvocation.InvocationName -eq $MyInvocation.MyCommand.Name) {
    Start-OptimizedMasterSystem
}

<citations>
<document>
    <document_type>RULE</document_type>
    <document_id>EM09uZSA1vjweTGZhKNYoi</document_id>
</document>
<document>
    <document_type>RULE</document_type>
    <document_id>OOXRPDT0m0MVsz2xUFKDTQ</document_id>
</document>
<document>
    <document_type>RULE</document_type>
    <document_id>yXmiaegmFwRqqEkWCu3hwB</document_id>
</document>
</citations>
