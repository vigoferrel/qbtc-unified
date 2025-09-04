<#
.SYNOPSIS
    Activar el núcleo cuántico de trading y coordinador NxN en segundo plano (PowerShell compatible)

.DESCRIPTION
    Este script utiliza la infraestructura EXISTENTE de QBTC-UNIFIED para lanzar los servicios
    en segundo plano. Aprovecha los scripts launch-nxn-background.js ya optimizados y el
    sistema unificado en puerto 18020. Implementa logging y métricas usando ASCII-friendly.

.PARAMETER Mode
    Modo: start, stop, status, logs, monitor

.PARAMETER UseTestMode
    Si se especifica, usa test-system.bat en lugar de producción

.EXAMPLE
    .\scripts\Start-QuantumCore-Background.ps1
    .\scripts\Start-QuantumCore-Background.ps1 -Mode start -UseTestMode
    .\scripts\Start-QuantumCore-Background.ps1 -Mode status
    .\scripts\Start-QuantumCore-Background.ps1 -Mode monitor

.NOTES
    - Usa infraestructura existente (puerto 18020/18030)
    - Compatible con Windows PowerShell (ASCII-friendly)
    - Aprovecha scripts optimizados ya implementados
    - No duplica funcionalidad existente
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("start", "stop", "status", "logs", "monitor")]
    [string]$Mode = "start",
    
    [Parameter(Mandatory=$false)]
    [switch]$UseTestMode,
    
    [Parameter(Mandatory=$false)]
    [switch]$UseExistingLauncher
)

# ASCII Art Header (sin emojis)
$Header = @"
=====================================
  QBTC QUANTUM CORE BACKGROUND 
  Nucleo Cuantico + Coordinador NxN
=====================================
"@

# Configuración basada en infraestructura existente
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$LogDir = Join-Path $ProjectRoot "logs"
$CoreDir = Join-Path $ProjectRoot "core\quantum-engine"
$CoordinatorDir = Join-Path $ProjectRoot "coordinator"

# Scripts existentes que vamos a usar
$TestSystemBat = Join-Path $ProjectRoot "test-system.bat"
$StartUnifiedBat = Join-Path $ProjectRoot "start-unified-system.bat"
$CoreLauncherJs = Join-Path $CoreDir "launch-nxn-background.js"
$CoreMonitorPs1 = Join-Path $CoreDir "scripts\monitor.ps1"

# Archivos de log y métricas existentes
$CoreLogFile = Join-Path $LogDir "nxn-background.log"
$CoordinatorLogFile = Join-Path $LogDir "coordinator-background.log"
$MetricsFile = Join-Path $LogDir "system-metrics.json"
$ExistingMetricsDir = Join-Path $CoreDir "quantum-metrics"

# Archivos de PID
$CorePidFile = Join-Path $LogDir "quantum-core.pid"
$CoordinatorPidFile = Join-Path $LogDir "coordinator.pid"

# Puertos según documentación existente
$ProductionPort = 18020
$TestPort = 18030
$MetricsPort = 18022

# Crear directorios necesarios
function New-DirectoryIfMissing {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

# Función de logging con timestamp ASCII
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$LogFile = $null
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    Write-Host $logMessage
    
    if ($LogFile -and (Test-Path -Path (Split-Path $LogFile -Parent))) {
        Add-Content -Path $LogFile -Value $logMessage -Encoding UTF8
    }
}

# Verificar si un puerto está en uso
function Test-PortInUse {
    param([int]$Port)
    
    try {
        $listener = [System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties()
        $tcpListeners = $listener.GetActiveTcpListeners()
        $portInUse = $tcpListeners | Where-Object { $_.Port -eq $Port }
        return ($portInUse -ne $null)
    }
    catch {
        # Fallback: intentar conectar al puerto
        try {
            $client = New-Object System.Net.Sockets.TcpClient
            $client.Connect('localhost', $Port)
            $client.Close()
            return $true
        }
        catch {
            return $false
        }
    }
}

# Verificar estado del sistema vía API
function Test-SystemHealth {
    param([int]$Port)
    
    try {
        $uri = "http://localhost:$Port/unified/health"
        $response = Invoke-RestMethod -Uri $uri -Method Get -TimeoutSec 10 -ErrorAction Stop
        return ($response.status -eq "ok" -or $response.status -eq "running")
    }
    catch {
        return $false
    }
}

# Verificar si un proceso está ejecutándose por PID
function Test-ProcessRunning {
    param([int]$ProcessId)
    
    try {
        $process = Get-Process -Id $ProcessId -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Leer PID desde archivo
function Get-ProcessIdFromFile {
    param([string]$PidFile)
    
    if (Test-Path $PidFile) {
        try {
            $pid = [int](Get-Content $PidFile -Raw).Trim()
            if (Test-ProcessRunning -ProcessId $pid) {
                return $pid
            }
            else {
                Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
                return $null
            }
        }
        catch {
            return $null
        }
    }
    return $null
}

# Guardar PID en archivo
function Save-ProcessIdToFile {
    param(
        [int]$ProcessId,
        [string]$PidFile
    )
    
    New-DirectoryIfMissing -Path (Split-Path $PidFile -Parent)
    Set-Content -Path $PidFile -Value $ProcessId.ToString() -Encoding UTF8
}

# Validar entorno y dependencias
function Test-Environment {
    Write-Log "Validando entorno y dependencias..." "INFO"
    
    # Verificar Node.js
    try {
        $nodeVersion = & node --version 2>$null
        if ($LASTEXITCODE -ne 0) {
            throw "Node.js no encontrado"
        }
        Write-Log "Node.js version: $nodeVersion" "INFO"
    }
    catch {
        Write-Log "ERROR: Node.js no está instalado o no está en PATH" "ERROR"
        return $false
    }
    
    # Verificar directorios de proyecto
    if (-not (Test-Path $CoreDir)) {
        Write-Log "ERROR: Directorio del núcleo cuántico no encontrado: $CoreDir" "ERROR"
        return $false
    }
    
    if (-not (Test-Path $CoordinatorDir)) {
        Write-Log "ERROR: Directorio del coordinador no encontrado: $CoordinatorDir" "ERROR"
        return $false
    }
    
    # Verificar archivos principales
    $coreMainFile = Join-Path $CoreDir "index.js"
    $coordinatorMainFile = Join-Path $CoordinatorDir "index.js"
    
    if (-not (Test-Path $coreMainFile)) {
        Write-Log "ERROR: Archivo principal del núcleo no encontrado: $coreMainFile" "ERROR"
        return $false
    }
    
    if (-not (Test-Path $coordinatorMainFile)) {
        Write-Log "ERROR: Archivo principal del coordinador no encontrado: $coordinatorMainFile" "ERROR"
        return $false
    }
    
    Write-Log "Validación del entorno completada exitosamente" "INFO"
    return $true
}

# Usar scripts batch existentes para iniciar el sistema completo
function Start-UnifiedSystem {
    Write-Log "Iniciando sistema unificado en segundo plano..." "INFO"
    
    # Verificar si ya hay procesos corriendo en los puertos
    if (Test-PortInUse -Port $ProductionPort) {
        Write-Log "Sistema ya está ejecutándose en puerto $ProductionPort" "WARN"
        return $true
    }
    
    try {
        # Usar script batch existente según el modo
        $scriptToUse = if ($UseTestMode) { $TestSystemBat } else { $StartUnifiedBat }
        
        if (-not (Test-Path $scriptToUse)) {
            throw "Script no encontrado: $scriptToUse"
        }
        
        Write-Log "Usando script existente: $(Split-Path $scriptToUse -Leaf)" "INFO"
        
        # Lanzar en segundo plano con redirección de logs
        $process = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "$scriptToUse" -WindowStyle Hidden -PassThru -RedirectStandardOutput $CoreLogFile -RedirectStandardError $CoreLogFile -WorkingDirectory $ProjectRoot
        
        if ($process.Id) {
            # Esperar un momento para que el sistema se inicie
            Start-Sleep -Seconds 5
            
            # Verificar que el sistema realmente esté corriendo
            $targetPort = if ($UseTestMode) { $TestPort } else { $ProductionPort }
            $maxWait = 30 # segundos
            $waited = 0
            
            while ($waited -lt $maxWait -and -not (Test-PortInUse -Port $targetPort)) {
                Start-Sleep -Seconds 2
                $waited += 2
                Write-Log "Esperando que el sistema inicie en puerto $targetPort..." "INFO"
            }
            
            if (Test-PortInUse -Port $targetPort) {
                Write-Log "Sistema unificado iniciado exitosamente en puerto $targetPort" "INFO"
                Write-Log "Logs en: $CoreLogFile" "INFO"
                return $process.Id
            }
            else {
                throw "Sistema no respondió en puerto $targetPort después de $maxWait segundos"
            }
        }
        else {
            throw "No se pudo obtener PID del proceso"
        }
    }
    catch {
        Write-Log "ERROR iniciando sistema unificado: $($_.Exception.Message)" "ERROR"
        return $null
    }
}

# Iniciar el coordinador NxN en segundo plano
function Start-Coordinator {
    Write-Log "Iniciando coordinador NxN en segundo plano..." "INFO"
    
    $existingPid = Get-ProcessIdFromFile -PidFile $CoordinatorPidFile
    if ($existingPid) {
        Write-Log "Coordinador NxN ya está ejecutándose (PID: $existingPid)" "WARN"
        return $existingPid
    }
    
    try {
        $process = Start-Process -FilePath "node" -ArgumentList "index.js" -WorkingDirectory $CoordinatorDir -WindowStyle Hidden -PassThru -RedirectStandardOutput $CoordinatorLogFile -RedirectStandardError $CoordinatorLogFile
        
        if ($process.Id) {
            Save-ProcessIdToFile -ProcessId $process.Id -PidFile $CoordinatorPidFile
            Write-Log "Coordinador NxN iniciado exitosamente (PID: $($process.Id))" "INFO"
            Write-Log "Logs en: $CoordinatorLogFile" "INFO"
            return $process.Id
        }
        else {
            throw "No se pudo obtener PID del proceso"
        }
    }
    catch {
        Write-Log "ERROR iniciando coordinador NxN: $($_.Exception.Message)" "ERROR"
        return $null
    }
}

# Detener procesos
function Stop-Component {
    param(
        [string]$ComponentName,
        [string]$PidFile
    )
    
    $pid = Get-ProcessIdFromFile -PidFile $PidFile
    if ($pid) {
        try {
            Stop-Process -Id $pid -Force
            Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
            Write-Log "$ComponentName detenido exitosamente (PID: $pid)" "INFO"
            return $true
        }
        catch {
            Write-Log "ERROR deteniendo $ComponentName (PID: $pid): $($_.Exception.Message)" "ERROR"
            return $false
        }
    }
    else {
        Write-Log "$ComponentName no está ejecutándose" "INFO"
        return $true
    }
}

# Obtener estado de los servicios
function Get-SystemStatus {
    $corePid = Get-ProcessIdFromFile -PidFile $CorePidFile
    $coordinatorPid = Get-ProcessIdFromFile -PidFile $CoordinatorPidFile
    
    $status = @{
        Core = @{
            Running = ($corePid -ne $null)
            PID = $corePid
            LogFile = $CoreLogFile
        }
        Coordinator = @{
            Running = ($coordinatorPid -ne $null)
            PID = $coordinatorPid
            LogFile = $CoordinatorLogFile
        }
    }
    
    return $status
}

# Recopilar métricas del sistema
function Collect-SystemMetrics {
    $status = Get-SystemStatus()
    $timestamp = Get-Date -Format "o"
    
    $metrics = @{
        Timestamp = $timestamp
        Components = @{
            Core = $status.Core
            Coordinator = $status.Coordinator
        }
        System = @{
            TotalProcesses = (Get-Process).Count
            AvailableMemoryMB = [math]::Round((Get-WmiObject Win32_OperatingSystem).FreePhysicalMemory / 1024, 2)
            CPUUsage = (Get-WmiObject Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average
        }
    }
    
    # Guardar métricas en archivo JSON
    New-DirectoryIfMissing -Path (Split-Path $MetricsFile -Parent)
    $metrics | ConvertTo-Json -Depth 4 | Set-Content -Path $MetricsFile -Encoding UTF8
    
    return $metrics
}

# Mostrar logs en tiempo real
function Show-Logs {
    param([string]$Component = "all")
    
    $logFiles = @()
    
    if ($Component -eq "all" -or $Component -eq "core") {
        if (Test-Path $CoreLogFile) {
            $logFiles += $CoreLogFile
        }
    }
    
    if ($Component -eq "all" -or $Component -eq "coordinator") {
        if (Test-Path $CoordinatorLogFile) {
            $logFiles += $CoordinatorLogFile
        }
    }
    
    if ($logFiles.Count -eq 0) {
        Write-Log "No hay archivos de log disponibles" "WARN"
        return
    }
    
    Write-Log "Mostrando logs en tiempo real. Presione Ctrl+C para salir" "INFO"
    Write-Log "Archivos de log monitoreados:" "INFO"
    $logFiles | ForEach-Object { Write-Log "  - $_" "INFO" }
    
    # Mostrar últimas 50 líneas de cada archivo
    foreach ($logFile in $logFiles) {
        Write-Host ""
        Write-Host "=== $(Split-Path $logFile -Leaf) ===" -ForegroundColor Cyan
        Get-Content $logFile -Tail 50 -ErrorAction SilentlyContinue
    }
    
    # Monitorear archivos en tiempo real (simulación)
    Write-Host ""
    Write-Host "Monitoreando logs... (Presione Ctrl+C para salir)" -ForegroundColor Yellow
    
    try {
        while ($true) {
            Start-Sleep -Seconds 2
            foreach ($logFile in $logFiles) {
                if (Test-Path $logFile) {
                    $newLines = Get-Content $logFile -Tail 1 -ErrorAction SilentlyContinue
                    if ($newLines) {
                        Write-Host "[$(Split-Path $logFile -Leaf)] $newLines"
                    }
                }
            }
        }
    }
    catch {
        Write-Log "Monitoreo de logs finalizado" "INFO"
    }
}

# Función principal
function Main {
    Clear-Host
    Write-Host $Header -ForegroundColor Cyan
    Write-Host ""
    
    New-DirectoryIfMissing -Path $LogDir
    
    switch ($Mode) {
        "start" {
            Write-Log "Iniciando activación del sistema cuántico en segundo plano..." "INFO"
            
            if (-not (Test-Environment)) {
                Write-Log "Validación del entorno falló. Abortando..." "ERROR"
                exit 1
            }
            
            # Usar el sistema unificado existente
            $systemPid = Start-UnifiedSystem
            
            if ($systemPid) {
                # Opcional: Iniciar coordinador por separado si se requiere
                $coordinatorPid = Start-Coordinator
                
                Start-Sleep -Seconds 3
                $metrics = Collect-SystemMetrics
                Write-Log "Sistema iniciado exitosamente" "INFO"
                Write-Log "Métricas guardadas en: $MetricsFile" "INFO"
                
                $targetPort = if ($UseTestMode) { $TestPort } else { $ProductionPort }
                
                Write-Host ""
                Write-Host "=== SISTEMA ACTIVO ===" -ForegroundColor Green
                Write-Host "Puerto principal: http://localhost:$targetPort"
                Write-Host "Frontend: http://localhost:$targetPort/frontend/simplified/"
                Write-Host "Health: http://localhost:$targetPort/unified/health"
                Write-Host "Métricas: http://localhost:$MetricsPort/metrics"
                Write-Host ""
                Write-Host "=== COMANDOS UTILES ===" -ForegroundColor Green
                Write-Host "Ver estado:    .\scripts\Start-QuantumCore-Background.ps1 -Mode status"
                Write-Host "Ver logs:      .\scripts\Start-QuantumCore-Background.ps1 -Mode logs"
                Write-Host "Monitorear:    .\scripts\Start-QuantumCore-Background.ps1 -Mode monitor"
                Write-Host "Detener:       .\scripts\Start-QuantumCore-Background.ps1 -Mode stop"
                Write-Host ""
            }
            else {
                Write-Log "ERROR: No se pudo iniciar el sistema" "ERROR"
                exit 1
            }
        }
        
        "stop" {
            Write-Log "Deteniendo sistema cuántico..." "INFO"
            
            $coreSuccess = Stop-Component -ComponentName "Núcleo Cuántico" -PidFile $CorePidFile
            $coordinatorSuccess = Stop-Component -ComponentName "Coordinador NxN" -PidFile $CoordinatorPidFile
            
            if ($coreSuccess -and $coordinatorSuccess) {
                Write-Log "Sistema detenido exitosamente" "INFO"
            }
            else {
                Write-Log "Algunos componentes no pudieron detenerse correctamente" "WARN"
            }
        }
        
        "status" {
            Write-Log "Obteniendo estado del sistema..." "INFO"
            
            $status = Get-SystemStatus
            $metrics = Collect-SystemMetrics
            
            Write-Host ""
            Write-Host "=== ESTADO DEL SISTEMA ===" -ForegroundColor Yellow
            
            Write-Host ""
            Write-Host "NUCLEO CUANTICO:" -ForegroundColor Cyan
            if ($status.Core.Running) {
                Write-Host "  Estado: EJECUTANDOSE" -ForegroundColor Green
                Write-Host "  PID: $($status.Core.PID)"
                Write-Host "  Log: $($status.Core.LogFile)"
            }
            else {
                Write-Host "  Estado: DETENIDO" -ForegroundColor Red
            }
            
            Write-Host ""
            Write-Host "COORDINADOR NxN:" -ForegroundColor Cyan
            if ($status.Coordinator.Running) {
                Write-Host "  Estado: EJECUTANDOSE" -ForegroundColor Green
                Write-Host "  PID: $($status.Coordinator.PID)"
                Write-Host "  Log: $($status.Coordinator.LogFile)"
            }
            else {
                Write-Host "  Estado: DETENIDO" -ForegroundColor Red
            }
            
            Write-Host ""
            Write-Host "METRICAS DEL SISTEMA:" -ForegroundColor Cyan
            Write-Host "  Procesos totales: $($metrics.System.TotalProcesses)"
            Write-Host "  Memoria disponible: $($metrics.System.AvailableMemoryMB) MB"
            Write-Host "  Uso de CPU: $($metrics.System.CPUUsage)%"
            Write-Host "  Ultima actualizacion: $($metrics.Timestamp)"
            Write-Host ""
        }
        
        "logs" {
            Show-Logs -Component $Component
        }
        
        "monitor" {
            Write-Log "Iniciando monitoreo del sistema..." "INFO"
            
            # Usar el script de monitor existente si está disponible
            if (Test-Path $CoreMonitorPs1) {
                Write-Log "Usando monitor existente del core..." "INFO"
                & powershell -NoProfile -ExecutionPolicy Bypass -File $CoreMonitorPs1
            }
            else {
                Write-Log "Monitor personalizado - mostrando estado cada 5 segundos" "INFO"
                Write-Host "Presione Ctrl+C para detener el monitoreo" -ForegroundColor Yellow
                
                try {
                    while ($true) {
                        Clear-Host
                        Write-Host $Header -ForegroundColor Cyan
                        Write-Host ""
                        
                        $status = Get-SystemStatus
                        $metrics = Collect-SystemMetrics
                        
                        $targetPort = if ($UseTestMode) { $TestPort } else { $ProductionPort }
                        $isSystemHealthy = Test-PortInUse -Port $targetPort
                        
                        Write-Host "=== MONITOREO EN TIEMPO REAL ===" -ForegroundColor Green
                        Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
                        Write-Host ""
                        
                        if ($isSystemHealthy) {
                            Write-Host "SISTEMA: ACTIVO" -ForegroundColor Green
                            Write-Host "Puerto: $targetPort" -ForegroundColor Green
                        }
                        else {
                            Write-Host "SISTEMA: INACTIVO" -ForegroundColor Red
                        }
                        
                        Write-Host ""
                        Write-Host "COMPONENTES:" -ForegroundColor Cyan
                        Write-Host "  Core: $(if ($status.Core.Running) { 'RUNNING' } else { 'STOPPED' })" -ForegroundColor $(if ($status.Core.Running) { 'Green' } else { 'Red' })
                        Write-Host "  Coordinator: $(if ($status.Coordinator.Running) { 'RUNNING' } else { 'STOPPED' })" -ForegroundColor $(if ($status.Coordinator.Running) { 'Green' } else { 'Red' })
                        
                        Write-Host ""
                        Write-Host "RECURSOS:" -ForegroundColor Cyan
                        Write-Host "  Memoria libre: $($metrics.System.AvailableMemoryMB) MB"
                        Write-Host "  CPU promedio: $($metrics.System.CPUUsage)%"
                        Write-Host "  Procesos: $($metrics.System.TotalProcesses)"
                        
                        Write-Host ""
                        Write-Host "Actualizando cada 5 segundos..." -ForegroundColor Gray
                        
                        Start-Sleep -Seconds 5
                    }
                }
                catch {
                    Write-Log "Monitoreo detenido por el usuario" "INFO"
                }
            }
        }
        
        default {
            Write-Log "Modo no reconocido: $Mode" "ERROR"
            exit 1
        }
    }
}

# Manejo de errores y señales
trap {
    Write-Log "ERROR INESPERADO: $($_.Exception.Message)" "ERROR"
    exit 1
}

# Ejecutar función principal
Main
