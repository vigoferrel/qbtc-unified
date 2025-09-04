# MASTER LAUNCHER SCRIPT - QBTC-UNIFIED SYSTEM
# Script principal para lanzar todos los componentes del sistema en background
# con sistema anticonflicto, gestion de puertos y reinicio automatico

param(
    [switch]$SkipPortCheck,
    [switch]$ForceRestart,
    [string]$LogLevel = "INFO"
)

$ErrorActionPreference = "Continue"

# ==============================================
# CONFIGURACION GLOBAL
# ==============================================

$global:CONFIG = @{
    BaseDir = "C:\Users\DELL\Desktop\QBTC-UNIFIED"
    LogsDir = "C:\Users\DELL\Desktop\QBTC-UNIFIED\logs"
    PidsDir = "C:\Users\DELL\Desktop\QBTC-UNIFIED\pids"
    MaxRestartAttempts = 3
    RestartDelay = 10
    HealthCheckInterval = 30
    ProcessTimeout = 120
}

# Configuracion de puertos por servicio - BANDA ANTICONFLICTOS 18000+
$global:PORTS = @{
    "QBTCKernel" = 18000         # quantum-engine (motor principal)
    "LeonardoConsciousness" = 18100  # coordinator (coordinador bots)
    "QuantumCore" = 18200        # api-gateway (gateway API)
    "UnifiedSystem" = 18300      # nxn-system (sistema NxN)
    "FrontendMain" = 18600       # websocket-service (tiempo real)
    "FrontendUnified" = 18700    # metrics-monitor (metricas)
    "MasterDashboard" = 18800    # logs-monitor (logs)
    "HealthMonitor" = 18900      # backup-service (backup)
    "TradingBot" = 19000         # TRADER_BOT range start
    "ScalperBot" = 20000         # SCALPER_BOT range start
    "ArbitrageBot" = 21000       # ARBITRAGE_BOT range start
    "QuantumAnalyzer" = 22000    # QUANTUM_ANALYZER range start
}

# Definicion de servicios
$global:SERVICES = @(
    @{
        Name = "QBTCKernel"
        Command = "python"
        Args = @("C:\Users\DELL\Desktop\QBTC-UNIFIED\kernel\qbtc_pure_kernel.py")
        WorkingDir = "C:\Users\DELL\Desktop\QBTC-UNIFIED\kernel"
        Port = $global:PORTS.QBTCKernel
        Critical = $true
        Dependencies = @()
        HealthEndpoint = "http://localhost:3000/health"
    },
    @{
        Name = "MasterAnticonflict"
        Command = "node"
        Args = @("C:\Users\DELL\Desktop\QBTC-UNIFIED\MASTER-ANTICONFLICT-LAUNCHER.js")
        WorkingDir = "C:\Users\DELL\Desktop\QBTC-UNIFIED"
        Port = $null
        Critical = $true
        Dependencies = @("QBTCKernel")
        HealthEndpoint = $null
    },
    @{
        Name = "LeonardoConsciousness"
        Command = "node"
        Args = @("C:\Users\DELL\Desktop\QBTC-UNIFIED\leonardo-consciousness\UnifiedLeonardoCore.js")
        WorkingDir = "C:\Users\DELL\Desktop\QBTC-UNIFIED\leonardo-consciousness"
        Port = $global:PORTS.LeonardoConsciousness
        Critical = $true
        Dependencies = @("QBTCKernel")
        HealthEndpoint = "http://localhost:3003/health"
    },
    @{
        Name = "FrontendUnified"
        Command = "node"
        Args = @("C:\Users\DELL\Desktop\QBTC-UNIFIED\frontend-server.js")
        WorkingDir = "C:\Users\DELL\Desktop\QBTC-UNIFIED"
        Port = $global:PORTS.FrontendUnified
        Critical = $false
        Dependencies = @("LeonardoConsciousness")
        HealthEndpoint = "http://localhost:8081/health"
    }
)

# Estado global del sistema
$global:SYSTEM_STATE = @{
    RunningServices = @{}
    FailedServices = @{}
    StartTime = Get-Date
    TotalRestarts = 0
    LastHealthCheck = $null
    SystemStatus = "INITIALIZING"
}

# ==============================================
# FUNCIONES UTILES
# ==============================================

function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$Service = "SYSTEM"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] [$Service] $Message"
    
    # Escribir a consola con colores
    switch ($Level) {
        "ERROR" { Write-Host $logMessage -ForegroundColor Red }
        "WARN" { Write-Host $logMessage -ForegroundColor Yellow }
        "INFO" { Write-Host $logMessage -ForegroundColor Green }
        "DEBUG" { Write-Host $logMessage -ForegroundColor Cyan }
        default { Write-Host $logMessage }
    }
    
    # Escribir a archivo de log
    $logFile = Join-Path $global:CONFIG.LogsDir "master_launcher.log"
    $logMessage | Out-File -FilePath $logFile -Append -Encoding ASCII
}

function Initialize-Environment {
    Write-Log "Inicializando entorno del sistema..."
    
    # Crear directorios necesarios
    $dirs = @($global:CONFIG.LogsDir, $global:CONFIG.PidsDir)
    foreach ($dir in $dirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Log "Creado directorio: $dir"
        }
    }
    
    # Limpiar logs anteriores si es reinicio forzado
    if ($ForceRestart) {
        Write-Log "Limpiando logs anteriores..." -Level "WARN"
        Get-ChildItem $global:CONFIG.LogsDir -Filter "*.log" | Remove-Item -Force
    }
}

function Test-PortAvailability {
    param([int]$Port)
    
    try {
        $tcpListener = [System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners()
        return -not ($tcpListener | Where-Object { $_.Port -eq $Port })
    } catch {
        Write-Log "Error al verificar puerto ${Port}: $_" -Level "ERROR"
        return $false
    }
}

function Kill-ProcessOnPort {
    param([int]$Port)
    
    try {
        $processIds = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        foreach ($pid in $processIds) {
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($process) {
                Write-Log "Terminando proceso $($process.ProcessName) (PID: $pid) en puerto $Port" -Level "WARN"
                Stop-Process -Id $pid -Force
                Start-Sleep -Seconds 2
            }
        }
    } catch {
        Write-Log "Error al liberar puerto ${Port}: $_" -Level "ERROR"
    }
}

function Start-ServiceProcess {
    param(
        [hashtable]$Service
    )
    
    Write-Log "Iniciando servicio: $($Service.Name)" -Service $Service.Name
    
    # Verificar dependencias
    foreach ($dependency in $Service.Dependencies) {
        if (-not $global:SYSTEM_STATE.RunningServices.ContainsKey($dependency)) {
            Write-Log "Dependencia no satisfecha: $dependency" -Level "ERROR" -Service $Service.Name
            return $null
        }
    }
    
    # Verificar puerto si es necesario
    if ($Service.Port -and -not $SkipPortCheck) {
        if (-not (Test-PortAvailability -Port $Service.Port)) {
            Write-Log "Puerto $($Service.Port) ocupado, liberando..." -Level "WARN" -Service $Service.Name
            Kill-ProcessOnPort -Port $Service.Port
            Start-Sleep -Seconds 3
        }
    }
    
    try {
        # Configurar archivos de log del servicio
        $outputLog = Join-Path $global:CONFIG.LogsDir "$($Service.Name)_output.log"
        $errorLog = Join-Path $global:CONFIG.LogsDir "$($Service.Name)_error.log"
        
        # Iniciar el proceso
        $processInfo = Start-Process -FilePath $Service.Command `
                                   -ArgumentList $Service.Args `
                                   -WorkingDirectory $Service.WorkingDir `
                                   -WindowStyle Hidden `
                                   -RedirectStandardOutput $outputLog `
                                   -RedirectStandardError $errorLog `
                                   -PassThru
        
        if ($processInfo) {
            # Guardar PID
            $pidFile = Join-Path $global:CONFIG.PidsDir "$($Service.Name).pid"
            $processInfo.Id | Out-File -FilePath $pidFile -Encoding ASCII
            
            Write-Log "Servicio iniciado exitosamente (PID: $($processInfo.Id))" -Service $Service.Name
            
            # Esperar un momento para verificar que no falle inmediatamente
            Start-Sleep -Seconds 3
            
            if ($processInfo.HasExited) {
                Write-Log "El servicio termino inmediatamente!" -Level "ERROR" -Service $Service.Name
                return $null
            }
            
            return $processInfo
        }
    } catch {
        Write-Log "Error al iniciar servicio: $_" -Level "ERROR" -Service $Service.Name
        return $null
    }
    
    return $null
}

function Test-ServiceHealth {
    param(
        [hashtable]$Service,
        [System.Diagnostics.Process]$Process
    )
    
    # Verificar si el proceso sigue activo
    if ($Process.HasExited) {
        return $false
    }
    
    # Si hay endpoint de salud, verificarlo
    if ($Service.HealthEndpoint) {
        try {
            $response = Invoke-WebRequest -Uri $Service.HealthEndpoint -TimeoutSec 5 -UseBasicParsing
            return $response.StatusCode -eq 200
        } catch {
            Write-Log "Health check failed for $($Service.Name): $_" -Level "WARN" -Service $Service.Name
            return $false
        }
    }
    
    return $true
}

function Stop-AllServices {
    Write-Log "Deteniendo todos los servicios..." -Level "WARN"
    
    # Detener servicios en orden inverso
    $servicesToStop = $global:SERVICES | Sort-Object { $_.Dependencies.Count } -Descending
    
    foreach ($service in $servicesToStop) {
        if ($global:SYSTEM_STATE.RunningServices.ContainsKey($service.Name)) {
            $process = $global:SYSTEM_STATE.RunningServices[$service.Name]
            Write-Log "Deteniendo $($service.Name)..." -Service $service.Name
            
            try {
                if (-not $process.HasExited) {
                    $process.CloseMainWindow()
                    Start-Sleep -Seconds 5
                    
                    if (-not $process.HasExited) {
                        $process.Kill()
                    }
                }
                
                # Limpiar PID file
                $pidFile = Join-Path $global:CONFIG.PidsDir "$($service.Name).pid"
                if (Test-Path $pidFile) {
                    Remove-Item $pidFile -Force
                }
                
                Write-Log "Servicio detenido: $($service.Name)" -Service $service.Name
            } catch {
                Write-Log "Error al detener $($service.Name): $_" -Level "ERROR" -Service $service.Name
            }
        }
    }
    
    $global:SYSTEM_STATE.RunningServices.Clear()
}

function Start-HealthMonitor {
    Write-Log "Iniciando monitor de salud del sistema..."
    
    $healthMonitor = {
        param($Config, $Services, $SystemState)
        
        while ($true) {
            Start-Sleep -Seconds $Config.HealthCheckInterval
            
            foreach ($service in $Services) {
                if ($SystemState.RunningServices.ContainsKey($service.Name)) {
                    $process = $SystemState.RunningServices[$service.Name]
                    
                    if (-not (Test-ServiceHealth -Service $service -Process $process)) {
                        Write-Log "Servicio $($service.Name) no responde - reiniciando..." -Level "WARN"
                        
                        # Reiniciar servicio
                        $newProcess = Start-ServiceProcess -Service $service
                        if ($newProcess) {
                            $SystemState.RunningServices[$service.Name] = $newProcess
                            $SystemState.TotalRestarts++
                        } else {
                            $SystemState.FailedServices[$service.Name] = Get-Date
                        }
                    }
                }
            }
        }
    }
    
    Start-Job -ScriptBlock $healthMonitor -ArgumentList $global:CONFIG, $global:SERVICES, $global:SYSTEM_STATE | Out-Null
}

# ==============================================
# FUNCIONES PRINCIPALES
# ==============================================

function Start-AllServices {
    Write-Log "=== INICIANDO SISTEMA QBTC-UNIFIED ===" -Level "INFO"
    
    $global:SYSTEM_STATE.SystemStatus = "STARTING"
    
    # Iniciar servicios en orden de dependencias
    foreach ($service in $global:SERVICES) {
        $maxAttempts = if ($service.Critical) { $global:CONFIG.MaxRestartAttempts } else { 1 }
        $attempt = 0
        $success = $false
        
        while ($attempt -lt $maxAttempts -and -not $success) {
            $attempt++
            Write-Log "Intento $attempt/$maxAttempts para $($service.Name)" -Service $service.Name
            
            $process = Start-ServiceProcess -Service $service
            
            if ($process) {
                $global:SYSTEM_STATE.RunningServices[$service.Name] = $process
                $success = $true
                Write-Log "Servicio $($service.Name) iniciado exitosamente" -Service $service.Name
            } else {
                Write-Log "Fallo al iniciar $($service.Name), intento $attempt" -Level "ERROR" -Service $service.Name
                
                if ($attempt -lt $maxAttempts) {
                    Write-Log "Esperando $($global:CONFIG.RestartDelay) segundos antes del siguiente intento..." -Service $service.Name
                    Start-Sleep -Seconds $global:CONFIG.RestartDelay
                }
            }
        }
        
        if (-not $success) {
            $global:SYSTEM_STATE.FailedServices[$service.Name] = Get-Date
            
            if ($service.Critical) {
                Write-Log "FALLO CRITICO: No se pudo iniciar $($service.Name)" -Level "ERROR"
                Stop-AllServices
                return $false
            } else {
                Write-Log "Servicio no critico $($service.Name) fallo - continuando..." -Level "WARN"
            }
        }
        
        # Esperar entre servicios para estabilizacion
        Start-Sleep -Seconds 5
    }
    
    $global:SYSTEM_STATE.SystemStatus = "RUNNING"
    Write-Log "=== SISTEMA INICIADO EXITOSAMENTE ===" -Level "INFO"
    
    # Mostrar resumen
    Write-Log "Servicios activos: $($global:SYSTEM_STATE.RunningServices.Count)"
    Write-Log "Servicios fallidos: $($global:SYSTEM_STATE.FailedServices.Count)"
    
    return $true
}

function Show-SystemStatus {
    Write-Log "=== ESTADO DEL SISTEMA QBTC-UNIFIED ===" -Level "INFO"
    Write-Log "Estado: $($global:SYSTEM_STATE.SystemStatus)"
    Write-Log "Tiempo activo: $((Get-Date) - $global:SYSTEM_STATE.StartTime)"
    Write-Log "Total reinicios: $($global:SYSTEM_STATE.TotalRestarts)"
    
    Write-Log "SERVICIOS ACTIVOS:" -Level "INFO"
    foreach ($serviceName in $global:SYSTEM_STATE.RunningServices.Keys) {
        $process = $global:SYSTEM_STATE.RunningServices[$serviceName]
        $status = if ($process.HasExited) { "TERMINADO" } else { "ACTIVO" }
        Write-Log "  - $serviceName (PID: $($process.Id)) - $status"
    }
    
    if ($global:SYSTEM_STATE.FailedServices.Count -gt 0) {
        Write-Log "SERVICIOS FALLIDOS:" -Level "WARN"
        foreach ($serviceName in $global:SYSTEM_STATE.FailedServices.Keys) {
            $failTime = $global:SYSTEM_STATE.FailedServices[$serviceName]
            Write-Log "  - $serviceName (fallido: $failTime)" -Level "WARN"
        }
    }
}

# ==============================================
# MANEJADORES DE SENIALES
# ==============================================

function Register-SignalHandlers {
    # Registrar manejador para Ctrl+C
    [Console]::CancelKeyPress += {
        param($sender, $e)
        $e.Cancel = $true
        Write-Log "Recibida senal de interrupcion - cerrando sistema..." -Level "WARN"
        Stop-AllServices
        exit 0
    }
}

# ==============================================
# SCRIPT PRINCIPAL
# ==============================================

function Main {
    Write-Log "MASTER LAUNCHER - QBTC-UNIFIED SYSTEM" -Level "INFO"
    Write-Log "=======================================" -Level "INFO"
    
    try {
        # Inicializar entorno
        Initialize-Environment
        
        # Registrar manejadores de seniales
        Register-SignalHandlers
        
        # Limpiar procesos anteriores si es reinicio forzado
        if ($ForceRestart) {
            Write-Log "Reinicio forzado - deteniendo procesos anteriores..." -Level "WARN"
            Stop-AllServices
            Start-Sleep -Seconds 5
        }
        
        # Iniciar todos los servicios
        $success = Start-AllServices
        
        if (-not $success) {
            Write-Log "FALLO AL INICIAR EL SISTEMA" -Level "ERROR"
            exit 1
        }
        
        # Iniciar monitor de salud
        Start-HealthMonitor
        
        # Mostrar estado inicial
        Show-SystemStatus
        
        Write-Log "Sistema funcionando - presiona Ctrl+C para detener" -Level "INFO"
        
        # Bucle principal - mantener activo y mostrar estado periodicamente
        while ($true) {
            Start-Sleep -Seconds 60
            Show-SystemStatus
        }
        
    } catch {
        Write-Log "Error critico en el sistema: $_" -Level "ERROR"
        Stop-AllServices
        exit 1
    }
}

# Ejecutar script principal
if ($MyInvocation.InvocationName -eq $MyInvocation.MyCommand.Name) {
    Main
}
