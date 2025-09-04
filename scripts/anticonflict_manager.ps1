# ANTICONFLICT MANAGER - QBTC-UNIFIED SYSTEM
# Sistema automatizado para deteccion y resolucion de conflictos
# Gestiona puertos, PIDs, archivos temporales y recursos del sistema

param(
    [switch]$CheckOnly,
    [switch]$ForceCleanup,
    [switch]$Verbose,
    [string]$Action = "full"  # full, ports, pids, temp, services
)

$ErrorActionPreference = "Continue"

# =============================================
# CONFIGURACION ANTICONFLICTO
# =============================================

$global:ANTICONFLICT_CONFIG = @{
    BaseDir = "C:\Users\DELL\Desktop\QBTC-UNIFIED"
    LogsDir = "C:\Users\DELL\Desktop\QBTC-UNIFIED\logs"
    PidsDir = "C:\Users\DELL\Desktop\QBTC-UNIFIED\pids"
    TempDir = "C:\Users\DELL\Desktop\QBTC-UNIFIED\temp"
    LockDir = "C:\Users\DELL\Desktop\QBTC-UNIFIED\locks"
    BackupDir = "C:\Users\DELL\Desktop\QBTC-UNIFIED\backup"
}

# Puertos reservados para QBTC-UNIFIED
$global:RESERVED_PORTS = @{
    "QBTCKernel" = 3000
    "LeonardoConsciousness" = 3003
    "QuantumCore" = 3001
    "QuantumCache" = 3005
    "MarketMaker" = 3101
    "RiskManager" = 3103
    "FundsManager" = 3105
    "UnifiedSystem" = 3201
    "MasterDashboard" = 3203
    "UnifiedAPI" = 3205
    "HealthMonitor" = 3301
    "MetricsCollector" = 3303
    "SystemMonitor" = 3305
    "MainFrontend" = 8080
    "SimplifiedFrontend" = 8081
    "DashboardFrontend" = 8082
}

# Procesos conocidos del sistema QBTC
$global:QBTC_PROCESSES = @(
    "python",
    "node",
    "qbtc_kernel_server",
    "leonardo-consciousness",
    "quantum-core"
)

# Estado del sistema anticonflicto
$global:CONFLICT_STATE = @{
    PortConflicts = @()
    ProcessConflicts = @()
    FileConflicts = @()
    ResolvedConflicts = @()
    FailedResolutions = @()
    SystemHealth = "UNKNOWN"
}

# =============================================
# FUNCIONES DE LOGGING Y UTILIDADES
# =============================================

function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$Component = "ANTICONFLICT"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] [$Component] $Message"
    
    # Colorear output segun nivel
    switch ($Level) {
        "ERROR" { Write-Host $logMessage -ForegroundColor Red }
        "WARN" { Write-Host $logMessage -ForegroundColor Yellow }
        "INFO" { Write-Host $logMessage -ForegroundColor Green }
        "DEBUG" { 
            if ($Verbose) { Write-Host $logMessage -ForegroundColor Cyan }
        }
        "SUCCESS" { Write-Host $logMessage -ForegroundColor Magenta }
        default { Write-Host $logMessage }
    }
    
    # Escribir a archivo de log
    $logFile = Join-Path $global:ANTICONFLICT_CONFIG.LogsDir "anticonflict.log"
    $logMessage | Out-File -FilePath $logFile -Append -Encoding ASCII
}

function Initialize-AnticonflictEnvironment {
    Write-Log "Inicializando entorno anticonflicto..."
    
    # Crear directorios necesarios
    $dirs = @(
        $global:ANTICONFLICT_CONFIG.LogsDir,
        $global:ANTICONFLICT_CONFIG.PidsDir,
        $global:ANTICONFLICT_CONFIG.TempDir,
        $global:ANTICONFLICT_CONFIG.LockDir,
        $global:ANTICONFLICT_CONFIG.BackupDir
    )
    
    foreach ($dir in $dirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Log "Creado directorio: $dir" -Level "DEBUG"
        }
    }
}

# =============================================
# DETECCION DE CONFLICTOS DE PUERTOS
# =============================================

function Get-PortUsage {
    param([int]$Port)
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($connections) {
            $processInfo = @()
            foreach ($conn in $connections) {
                $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    $processInfo += @{
                        PID = $process.Id
                        ProcessName = $process.ProcessName
                        StartTime = $process.StartTime
                        State = $conn.State
                    }
                }
            }
            return $processInfo
        }
    } catch {
        Write-Log "Error verificando puerto ${Port}: $_" -Level "DEBUG"
    }
    
    return $null
}

function Test-PortConflicts {
    Write-Log "Detectando conflictos de puertos..." -Component "PORT_CHECK"
    
    $conflicts = @()
    
    foreach ($service in $global:RESERVED_PORTS.GetEnumerator()) {
        $serviceName = $service.Key
        $port = $service.Value
        
        Write-Log "Verificando puerto $port para servicio $serviceName" -Level "DEBUG"
        
        $usage = Get-PortUsage -Port $port
        if ($usage) {
            foreach ($proc in $usage) {
                # Verificar si es un proceso QBTC conocido
                $isQBTCProcess = $global:QBTC_PROCESSES -contains $proc.ProcessName
                
                $conflict = @{
                    Service = $serviceName
                    Port = $port
                    ConflictingPID = $proc.PID
                    ConflictingProcess = $proc.ProcessName
                    StartTime = $proc.StartTime
                    State = $proc.State
                    IsQBTCProcess = $isQBTCProcess
                    Severity = if ($isQBTCProcess) { "LOW" } else { "HIGH" }
                }
                
                $conflicts += $conflict
                Write-Log "CONFLICTO DETECTADO: Puerto $port ocupado por $($proc.ProcessName) (PID: $($proc.PID))" -Level "WARN"
            }
        }
    }
    
    $global:CONFLICT_STATE.PortConflicts = $conflicts
    return $conflicts
}

function Resolve-PortConflicts {
    param([array]$Conflicts)
    
    if ($Conflicts.Count -eq 0) {
        Write-Log "No hay conflictos de puertos que resolver" -Component "PORT_RESOLVER"
        return
    }
    
    Write-Log "Resolviendo $($Conflicts.Count) conflictos de puertos..." -Component "PORT_RESOLVER"
    
    foreach ($conflict in $Conflicts) {
        Write-Log "Resolviendo conflicto en puerto $($conflict.Port)..." -Level "WARN"
        
        try {
            # Si es proceso QBTC, ser mas cuidadoso
            if ($conflict.IsQBTCProcess) {
                Write-Log "Proceso QBTC detectado, verificando si es instancia antigua..." -Level "DEBUG"
                
                # Verificar si hay archivo PID correspondiente
                $expectedPidFile = Join-Path $global:ANTICONFLICT_CONFIG.PidsDir "$($conflict.Service).pid"
                
                if (Test-Path $expectedPidFile) {
                    $expectedPid = Get-Content $expectedPidFile -Raw
                    $expectedPid = $expectedPid.Trim()
                    
                    if ($expectedPid -ne $conflict.ConflictingPID.ToString()) {
                        Write-Log "PID no coincide (esperado: $expectedPid, actual: $($conflict.ConflictingPID)) - proceso huerfano detectado" -Level "WARN"
                        $shouldTerminate = $true
                    } else {
                        Write-Log "PID coincide - proceso legitimo en ejecucion" -Level "INFO"
                        $shouldTerminate = $false
                    }
                } else {
                    Write-Log "No hay archivo PID - proceso huerfano probable" -Level "WARN"
                    $shouldTerminate = $true
                }
            } else {
                $shouldTerminate = $true
            }
            
            if ($shouldTerminate -or $ForceCleanup) {
                Write-Log "Terminando proceso $($conflict.ConflictingProcess) (PID: $($conflict.ConflictingPID))" -Level "WARN"
                
                # Intentar cierre graceful primero
                $process = Get-Process -Id $conflict.ConflictingPID -ErrorAction SilentlyContinue
                if ($process) {
                    $process.CloseMainWindow() | Out-Null
                    Start-Sleep -Seconds 3
                    
                    # Si sigue activo, forzar terminacion
                    if (-not $process.HasExited) {
                        Stop-Process -Id $conflict.ConflictingPID -Force
                        Write-Log "Proceso terminado forzosamente" -Level "WARN"
                    } else {
                        Write-Log "Proceso terminado gracefully" -Level "SUCCESS"
                    }
                    
                    # Verificar que el puerto quede libre
                    Start-Sleep -Seconds 2
                    $stillUsed = Get-PortUsage -Port $conflict.Port
                    if (-not $stillUsed) {
                        Write-Log "Puerto $($conflict.Port) liberado exitosamente" -Level "SUCCESS"
                        $global:CONFLICT_STATE.ResolvedConflicts += $conflict
                    } else {
                        Write-Log "ADVERTENCIA: Puerto $($conflict.Port) aun ocupado" -Level "WARN"
                        $global:CONFLICT_STATE.FailedResolutions += $conflict
                    }
                }
            } else {
                Write-Log "Manteniendo proceso legitimo $($conflict.ConflictingProcess)" -Level "INFO"
            }
            
        } catch {
            Write-Log "Error resolviendo conflicto en puerto $($conflict.Port): $_" -Level "ERROR"
            $global:CONFLICT_STATE.FailedResolutions += $conflict
        }
    }
}

# =============================================
# DETECCION DE PROCESOS HUERFANOS
# =============================================

function Test-ProcessConflicts {
    Write-Log "Detectando procesos huerfanos..." -Component "PROCESS_CHECK"
    
    $conflicts = @()
    
    # Buscar procesos QBTC sin archivo PID
    foreach ($processName in $global:QBTC_PROCESSES) {
        $processes = Get-Process -Name $processName -ErrorAction SilentlyContinue
        
        foreach ($process in $processes) {
            # Verificar si tiene archivo PID correspondiente
            $pidFiles = Get-ChildItem $global:ANTICONFLICT_CONFIG.PidsDir -Filter "*.pid" -ErrorAction SilentlyContinue
            $hasPidFile = $false
            
            foreach ($pidFile in $pidFiles) {
                $pidContent = Get-Content $pidFile.FullName -Raw
                if ($pidContent.Trim() -eq $process.Id.ToString()) {
                    $hasPidFile = $true
                    break
                }
            }
            
            if (-not $hasPidFile) {
                $conflict = @{
                    PID = $process.Id
                    ProcessName = $process.ProcessName
                    StartTime = $process.StartTime
                    CommandLine = $process.Path
                    IsOrphan = $true
                }
                
                $conflicts += $conflict
                Write-Log "PROCESO HUERFANO: $($process.ProcessName) (PID: $($process.Id))" -Level "WARN"
            }
        }
    }
    
    $global:CONFLICT_STATE.ProcessConflicts = $conflicts
    return $conflicts
}

function Resolve-ProcessConflicts {
    param([array]$Conflicts)
    
    if ($Conflicts.Count -eq 0) {
        Write-Log "No hay procesos huerfanos que resolver" -Component "PROCESS_RESOLVER"
        return
    }
    
    Write-Log "Resolviendo $($Conflicts.Count) procesos huerfanos..." -Component "PROCESS_RESOLVER"
    
    foreach ($conflict in $Conflicts) {
        try {
            Write-Log "Terminando proceso huerfano $($conflict.ProcessName) (PID: $($conflict.PID))" -Level "WARN"
            
            $process = Get-Process -Id $conflict.PID -ErrorAction SilentlyContinue
            if ($process) {
                $process.CloseMainWindow() | Out-Null
                Start-Sleep -Seconds 3
                
                if (-not $process.HasExited) {
                    Stop-Process -Id $conflict.PID -Force
                    Write-Log "Proceso huerfano terminado forzosamente" -Level "SUCCESS"
                } else {
                    Write-Log "Proceso huerfano terminado gracefully" -Level "SUCCESS"
                }
                
                $global:CONFLICT_STATE.ResolvedConflicts += $conflict
            }
            
        } catch {
            Write-Log "Error terminando proceso huerfano PID $($conflict.PID): $_" -Level "ERROR"
            $global:CONFLICT_STATE.FailedResolutions += $conflict
        }
    }
}

# =============================================
# LIMPIEZA DE ARCHIVOS TEMPORALES
# =============================================

function Test-FileConflicts {
    Write-Log "Detectando conflictos de archivos..." -Component "FILE_CHECK"
    
    $conflicts = @()
    
    # Verificar PIDs obsoletos
    $pidFiles = Get-ChildItem $global:ANTICONFLICT_CONFIG.PidsDir -Filter "*.pid" -ErrorAction SilentlyContinue
    foreach ($pidFile in $pidFiles) {
        try {
            $pid = Get-Content $pidFile.FullName -Raw
            $pid = $pid.Trim()
            
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if (-not $process) {
                $conflict = @{
                    Type = "STALE_PID"
                    File = $pidFile.FullName
                    PID = $pid
                    Service = $pidFile.BaseName
                }
                
                $conflicts += $conflict
                Write-Log "ARCHIVO PID OBSOLETO: $($pidFile.Name) (PID: $pid no existe)" -Level "WARN"
            }
        } catch {
            Write-Log "Error procesando archivo PID $($pidFile.Name): $_" -Level "DEBUG"
        }
    }
    
    # Verificar archivos de lock antiguos
    $lockFiles = Get-ChildItem $global:ANTICONFLICT_CONFIG.LockDir -Filter "*.lock" -ErrorAction SilentlyContinue
    foreach ($lockFile in $lockFiles) {
        # Si el archivo de lock tiene mas de 1 hora, considerarlo obsoleto
        if ($lockFile.CreationTime -lt (Get-Date).AddHours(-1)) {
            $conflict = @{
                Type = "STALE_LOCK"
                File = $lockFile.FullName
                Age = (Get-Date) - $lockFile.CreationTime
                Service = $lockFile.BaseName
            }
            
            $conflicts += $conflict
            Write-Log "ARCHIVO LOCK OBSOLETO: $($lockFile.Name) (edad: $($conflict.Age))" -Level "WARN"
        }
    }
    
    # Verificar logs muy grandes (> 100MB)
    $logFiles = Get-ChildItem $global:ANTICONFLICT_CONFIG.LogsDir -Filter "*.log" -ErrorAction SilentlyContinue
    foreach ($logFile in $logFiles) {
        $sizeMB = [math]::Round($logFile.Length / 1MB, 2)
        if ($sizeMB -gt 100) {
            $conflict = @{
                Type = "LARGE_LOG"
                File = $logFile.FullName
                SizeMB = $sizeMB
                Service = $logFile.BaseName
            }
            
            $conflicts += $conflict
            Write-Log "LOG GRANDE DETECTADO: $($logFile.Name) ($sizeMB MB)" -Level "WARN"
        }
    }
    
    $global:CONFLICT_STATE.FileConflicts = $conflicts
    return $conflicts
}

function Resolve-FileConflicts {
    param([array]$Conflicts)
    
    if ($Conflicts.Count -eq 0) {
        Write-Log "No hay conflictos de archivos que resolver" -Component "FILE_RESOLVER"
        return
    }
    
    Write-Log "Resolviendo $($Conflicts.Count) conflictos de archivos..." -Component "FILE_RESOLVER"
    
    foreach ($conflict in $Conflicts) {
        try {
            switch ($conflict.Type) {
                "STALE_PID" {
                    Write-Log "Eliminando PID obsoleto: $($conflict.File)" -Level "WARN"
                    Remove-Item $conflict.File -Force
                    Write-Log "PID obsoleto eliminado" -Level "SUCCESS"
                }
                
                "STALE_LOCK" {
                    Write-Log "Eliminando lock obsoleto: $($conflict.File)" -Level "WARN"
                    Remove-Item $conflict.File -Force
                    Write-Log "Lock obsoleto eliminado" -Level "SUCCESS"
                }
                
                "LARGE_LOG" {
                    $backupFile = Join-Path $global:ANTICONFLICT_CONFIG.BackupDir "$($conflict.Service)_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
                    Write-Log "Respaldando log grande: $($conflict.File) -> $backupFile" -Level "WARN"
                    
                    Move-Item $conflict.File $backupFile
                    Write-Log "Log respaldado y rotado" -Level "SUCCESS"
                }
            }
            
            $global:CONFLICT_STATE.ResolvedConflicts += $conflict
            
        } catch {
            Write-Log "Error resolviendo conflicto de archivo $($conflict.File): $_" -Level "ERROR"
            $global:CONFLICT_STATE.FailedResolutions += $conflict
        }
    }
}

# =============================================
# FUNCIONES PRINCIPALES
# =============================================

function Invoke-SystemCleanup {
    Write-Log "=== INICIANDO LIMPIEZA COMPLETA DEL SISTEMA ===" -Level "INFO"
    
    # Detener todos los procesos QBTC primero
    Write-Log "Deteniendo todos los procesos QBTC..." -Level "WARN"
    
    foreach ($processName in $global:QBTC_PROCESSES) {
        $processes = Get-Process -Name $processName -ErrorAction SilentlyContinue
        foreach ($process in $processes) {
            try {
                Write-Log "Deteniendo $($process.ProcessName) (PID: $($process.Id))"
                $process.CloseMainWindow() | Out-Null
                Start-Sleep -Seconds 2
                
                if (-not $process.HasExited) {
                    Stop-Process -Id $process.Id -Force
                }
            } catch {
                Write-Log "Error deteniendo proceso $($process.Id): $_" -Level "ERROR"
            }
        }
    }
    
    # Limpiar todos los archivos
    Write-Log "Limpiando archivos del sistema..." -Level "WARN"
    
    $filesToClean = @(
        Join-Path $global:ANTICONFLICT_CONFIG.PidsDir "*.pid",
        Join-Path $global:ANTICONFLICT_CONFIG.LockDir "*.lock",
        Join-Path $global:ANTICONFLICT_CONFIG.TempDir "*"
    )
    
    foreach ($pattern in $filesToClean) {
        Get-ChildItem $pattern -ErrorAction SilentlyContinue | Remove-Item -Force -Recurse
    }
    
    Write-Log "=== LIMPIEZA COMPLETA FINALIZADA ===" -Level "SUCCESS"
}

function Show-ConflictReport {
    Write-Log "=== REPORTE DE CONFLICTOS QBTC-UNIFIED ===" -Level "INFO"
    
    $totalConflicts = $global:CONFLICT_STATE.PortConflicts.Count + 
                     $global:CONFLICT_STATE.ProcessConflicts.Count + 
                     $global:CONFLICT_STATE.FileConflicts.Count
                     
    $resolvedCount = $global:CONFLICT_STATE.ResolvedConflicts.Count
    $failedCount = $global:CONFLICT_STATE.FailedResolutions.Count
    
    Write-Log "Conflictos detectados: $totalConflicts"
    Write-Log "Conflictos resueltos: $resolvedCount"
    Write-Log "Resoluciones fallidas: $failedCount"
    
    Write-Log "CONFLICTOS DE PUERTOS: $($global:CONFLICT_STATE.PortConflicts.Count)" -Level "INFO"
    foreach ($conflict in $global:CONFLICT_STATE.PortConflicts) {
        Write-Log "  Puerto $($conflict.Port) -> $($conflict.ConflictingProcess) (PID: $($conflict.ConflictingPID))" -Level "WARN"
    }
    
    Write-Log "PROCESOS HUERFANOS: $($global:CONFLICT_STATE.ProcessConflicts.Count)" -Level "INFO"
    foreach ($conflict in $global:CONFLICT_STATE.ProcessConflicts) {
        Write-Log "  $($conflict.ProcessName) (PID: $($conflict.PID))" -Level "WARN"
    }
    
    Write-Log "CONFLICTOS DE ARCHIVOS: $($global:CONFLICT_STATE.FileConflicts.Count)" -Level "INFO"
    foreach ($conflict in $global:CONFLICT_STATE.FileConflicts) {
        Write-Log "  $($conflict.Type): $($conflict.File)" -Level "WARN"
    }
    
    # Calcular salud del sistema
    if ($totalConflicts -eq 0) {
        $global:CONFLICT_STATE.SystemHealth = "HEALTHY"
        Write-Log "ESTADO DEL SISTEMA: SALUDABLE" -Level "SUCCESS"
    } elseif ($failedCount -eq 0) {
        $global:CONFLICT_STATE.SystemHealth = "RESOLVED"
        Write-Log "ESTADO DEL SISTEMA: CONFLICTOS RESUELTOS" -Level "SUCCESS"
    } else {
        $global:CONFLICT_STATE.SystemHealth = "DEGRADED"
        Write-Log "ESTADO DEL SISTEMA: DEGRADADO - REQUIERE ATENCION" -Level "ERROR"
    }
}

function Start-AnticonflictProcess {
    Write-Log "ANTICONFLICT MANAGER - QBTC-UNIFIED" -Level "INFO"
    Write-Log "====================================" -Level "INFO"
    
    try {
        # Inicializar entorno
        Initialize-AnticonflictEnvironment
        
        # Limpieza completa si se solicita
        if ($ForceCleanup) {
            Invoke-SystemCleanup
            return
        }
        
        # Ejecutar verificaciones segun accion
        switch ($Action.ToLower()) {
            "full" {
                $portConflicts = Test-PortConflicts
                $processConflicts = Test-ProcessConflicts
                $fileConflicts = Test-FileConflicts
                
                if (-not $CheckOnly) {
                    Resolve-PortConflicts -Conflicts $portConflicts
                    Resolve-ProcessConflicts -Conflicts $processConflicts
                    Resolve-FileConflicts -Conflicts $fileConflicts
                }
            }
            "ports" {
                $portConflicts = Test-PortConflicts
                if (-not $CheckOnly) {
                    Resolve-PortConflicts -Conflicts $portConflicts
                }
            }
            "pids" {
                $processConflicts = Test-ProcessConflicts
                if (-not $CheckOnly) {
                    Resolve-ProcessConflicts -Conflicts $processConflicts
                }
            }
            "temp" {
                $fileConflicts = Test-FileConflicts
                if (-not $CheckOnly) {
                    Resolve-FileConflicts -Conflicts $fileConflicts
                }
            }
        }
        
        # Mostrar reporte final
        Show-ConflictReport
        
    } catch {
        Write-Log "Error critico en anticonflict manager: $_" -Level "ERROR"
        return 1
    }
    
    return 0
}

# Ejecutar si se llama directamente
if ($MyInvocation.InvocationName -eq $MyInvocation.MyCommand.Name) {
    exit (Start-AnticonflictProcess)
}
