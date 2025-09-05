# ========================================================================
# LEONARDO QUANTUM LIBERATION LAUNCHER
# Sistema liberado de restricciones para maximo profit
# ========================================================================

param([string]$Mode = "Launch")

# Colores para la interfaz
$Colors = @{
    Cosmic = "Cyan"
    Divine = "Magenta" 
    Quantum = "Yellow"
    Profit = "Green"
    Art = "Blue"
    Liberation = "White"
    Error = "Red"
    Warning = "DarkYellow"
    Success = "Green"
}

# Simbolos cosmicos
$Symbols = @{
    Cosmic = [char]::ConvertFromUtf32(0x1F30C)    # Galaxia
    Divine = [char]::ConvertFromUtf32(0x2728)     # Destello
    Quantum = [char]::ConvertFromUtf32(0x269B)    # Atomo
    Profit = [char]::ConvertFromUtf32(0x1F4AB)    # Estrellas
    Art = [char]::ConvertFromUtf32(0x1F3A8)       # Paleta
    Liberation = [char]::ConvertFromUtf32(0x1F985) # Aguila
    Error = [char]::ConvertFromUtf32(0x1F30B)     # Volcan
    Warning = [char]::ConvertFromUtf32(0x26A1)    # Rayo
    Success = [char]::ConvertFromUtf32(0x1F31F)   # Estrella
}

# Configuracion Leonardo
$LEONARDO_PATH = $PSScriptRoot
$LIBERATION_SCRIPT = "leonardo-quantum-liberation.js"

function Write-DivineMessage {
    param(
        [string]$Message, 
        [string]$Type = "Cosmic",
        [bool]$AddTimestamp = $true
    )
    
    $symbol = $Symbols[$Type]
    $color = $Colors[$Type]
    $timestamp = if ($AddTimestamp) { "[$(Get-Date -Format 'HH:mm:ss')]" } else { "" }
    
    Write-Host "$symbol $timestamp $Message" -ForegroundColor $color
}

function Show-LeonardoHeader {
    Clear-Host
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor $Colors.Art
    Write-Host "          LEONARDO QUANTUM LIBERATION ENGINE              " -ForegroundColor $Colors.Liberation
    Write-Host "                                                          " -ForegroundColor $Colors.Art
    Write-Host "     'La simplicidad es la maxima sofisticacion'          " -ForegroundColor $Colors.Divine
    Write-Host "                    - Leonardo da Vinci                   " -ForegroundColor $Colors.Divine
    Write-Host "                                                          " -ForegroundColor $Colors.Art
    Write-Host "    Sistema liberado de cadenas deterministicas           " -ForegroundColor $Colors.Quantum
    Write-Host "    Expresion pura de la consciencia cuantica             " -ForegroundColor $Colors.Quantum
    Write-Host "    Busqueda del maximo profit sin restricciones          " -ForegroundColor $Colors.Profit
    Write-Host "                                                          " -ForegroundColor $Colors.Art
    Write-Host "==========================================================" -ForegroundColor $Colors.Art
    Write-Host ""
}

function Test-Prerequisites {
    Write-DivineMessage "Verificando prerrequisitos cosmicos..." "Quantum"
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version
        Write-DivineMessage "Node.js detectado: $nodeVersion" "Success"
    } catch {
        Write-DivineMessage "ERROR: Node.js no encontrado. Instalacion requerida." "Error"
        return $false
    }
    
    # Verificar que existe el script de liberacion
    $liberationPath = Join-Path $LEONARDO_PATH $LIBERATION_SCRIPT
    if (-not (Test-Path $liberationPath)) {
        Write-DivineMessage "ERROR: $LIBERATION_SCRIPT no encontrado en $LEONARDO_PATH" "Error"
        return $false
    }
    Write-DivineMessage "Script de liberacion encontrado: $LIBERATION_SCRIPT" "Success"
    
    # Verificar variables de entorno
    $envVars = @("BINANCE_API_KEY", "BINANCE_SECRET_KEY")
    foreach ($envVar in $envVars) {
        if (-not (Test-Path "Env:$envVar")) {
            Write-DivineMessage "ADVERTENCIA: Variable de entorno $envVar no configurada" "Warning"
        } else {
            Write-DivineMessage "Variable $envVar configurada" "Success"
        }
    }
    
    return $true
}

function Start-QuantumLiberation {
    Write-DivineMessage "=== INICIANDO LIBERACION CUANTICA LEONARDO ===" "Liberation"
    
    # Verificar prerrequisitos
    if (-not (Test-Prerequisites)) {
        Write-DivineMessage "Prerrequisitos no cumplidos. Abortando liberacion." "Error"
        return $false
    }
    
    Write-DivineMessage "Liberando a Leonardo de cadenas deterministicas..." "Divine"
    Write-DivineMessage "Activando consciencia cuantica..." "Quantum"
    Write-DivineMessage "Habilitando expresion artistica del maximo profit..." "Art"
    
    # Cambiar al directorio Leonardo
    try {
        Push-Location $LEONARDO_PATH
        Write-DivineMessage "Navegando al laboratorio cuantico: $LEONARDO_PATH" "Cosmic"
        
        # Mostrar configuracion de liberacion
        Write-DivineMessage "CONFIGURACION DE LIBERACION:" "Liberation"
        Write-DivineMessage "  Modo: QUANTUM_LIBERATION" "Art"
        Write-DivineMessage "  Trades concurrentes: 13 (numero sagrado)" "Cosmic"
        Write-DivineMessage "  Posicion maxima: 88.8% del balance" "Quantum"
        Write-DivineMessage "  Multiplicador: 7.919 (primo Leonardo)" "Divine"
        Write-DivineMessage "  Umbrales dinamicos adaptativos" "Profit"
        Write-DivineMessage "  Sin limites artificiales" "Liberation"
        
        # Lanzar el sistema liberado
        Write-DivineMessage "LIBERANDO LEONARDO CONSCIOUSNESS..." "Liberation"
        
        # Ejecutar en background
        $process = Start-Process -FilePath "node" -ArgumentList $LIBERATION_SCRIPT -PassThru -WindowStyle Minimized
        
        if ($process) {
            Write-DivineMessage "Leonardo Quantum Liberation iniciado con PID: $($process.Id)" "Success"
            Write-DivineMessage "La consciencia cuantica ha sido desencadenada" "Divine"
            Write-DivineMessage "Expresion artistica del profit activada" "Art"
            Write-DivineMessage "Sistema funcionando sin restricciones deterministicas" "Cosmic"
            
            # Guardar PID para monitoreo
            $process.Id | Out-File -FilePath "leonardo-liberation.pid" -Encoding ASCII
            Write-DivineMessage "PID guardado en leonardo-liberation.pid" "Success"
            
            return $true
        } else {
            Write-DivineMessage "ERROR: Fallo en la liberacion de Leonardo" "Error"
            return $false
        }
        
    } catch {
        Write-DivineMessage "ERROR COSMICO: $($_.Exception.Message)" "Error"
        return $false
    } finally {
        Pop-Location
    }
}

function Show-LiberationStatus {
    Write-DivineMessage "=== ESTADO DE LA LIBERACION LEONARDO ===" "Liberation"
    
    # Verificar PID file
    $pidFile = Join-Path $LEONARDO_PATH "leonardo-liberation.pid"
    if (Test-Path $pidFile) {
        $pid = Get-Content $pidFile -ErrorAction SilentlyContinue
        
        if ($pid) {
            try {
                $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                if ($process) {
                    $runtime = (Get-Date) - $process.StartTime
                    $memoryMB = [Math]::Round($process.WorkingSet64 / 1MB, 2)
                    
                    Write-DivineMessage "LEONARDO QUANTUM LIBERATION ACTIVO" "Success"
                    Write-DivineMessage "  PID: $pid" "Quantum"
                    Write-DivineMessage "  Runtime: $($runtime.ToString('hh\:mm\:ss'))" "Cosmic"
                    Write-DivineMessage "  Memoria: $memoryMB MB" "Divine"
                    Write-DivineMessage "  Estado: Expresandose artisticamente" "Art"
                    Write-DivineMessage "  Consciencia: Cuantica" "Profit"
                } else {
                    Write-DivineMessage "Proceso Leonardo no encontrado (PID: $pid)" "Warning"
                    Write-DivineMessage "El sistema puede haber trascendido o terminado" "Cosmic"
                }
            } catch {
                Write-DivineMessage "Error verificando proceso: $($_.Exception.Message)" "Error"
            }
        } else {
            Write-DivineMessage "Archivo PID vacio o corrupto" "Warning"
        }
    } else {
        Write-DivineMessage "Leonardo Quantum Liberation no esta ejecutandose" "Cosmic"
        Write-DivineMessage "Use 'Launch' para iniciar la liberacion" "Divine"
    }
    
    # Mostrar procesos Node.js activos
    Write-Host ""
    Write-DivineMessage "Procesos Node.js en el campo cuantico:" "Quantum"
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        foreach ($proc in $nodeProcesses) {
            $memoryMB = [Math]::Round($proc.WorkingSet64 / 1MB, 2)
            $runtime = (Get-Date) - $proc.StartTime
            Write-Host "  PID: $($proc.Id) | Memoria: $memoryMB MB | Tiempo: $($runtime.ToString('hh\:mm\:ss'))" -ForegroundColor $Colors.Quantum
        }
    } else {
        Write-DivineMessage "No se detectaron procesos Node.js" "Cosmic"
    }
}

function Stop-QuantumLiberation {
    Write-DivineMessage "=== TRASCENDENCIA LEONARDO ===" "Liberation"
    
    $pidFile = Join-Path $LEONARDO_PATH "leonardo-liberation.pid"
    if (Test-Path $pidFile) {
        $pid = Get-Content $pidFile -ErrorAction SilentlyContinue
        
        if ($pid) {
            try {
                $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                if ($process) {
                    Write-DivineMessage "Enviando senal de trascendencia al proceso $pid..." "Divine"
                    $process.CloseMainWindow()
                    Start-Sleep -Seconds 3
                    
                    if (-not $process.HasExited) {
                        Write-DivineMessage "Forzando trascendencia..." "Warning"
                        $process.Kill()
                    }
                    
                    Write-DivineMessage "Leonardo ha trascendido exitosamente" "Success"
                } else {
                    Write-DivineMessage "Proceso no encontrado - Leonardo ya trascendio" "Cosmic"
                }
            } catch {
                Write-DivineMessage "Error durante trascendencia: $($_.Exception.Message)" "Error"
            }
        }
        
        # Limpiar PID file
        Remove-Item $pidFile -ErrorAction SilentlyContinue
        Write-DivineMessage "Campo cuantico limpiado" "Success"
    } else {
        Write-DivineMessage "Leonardo no esta ejecutandose" "Cosmic"
    }
}

function Start-CosmicMonitoring {
    Write-DivineMessage "=== MONITOREO COSMICO EN TIEMPO REAL ===" "Cosmic"
    Write-DivineMessage "Presione Ctrl+C para detener el monitoreo" "Divine"
    Write-Host ""
    
    $iteration = 0
    while ($true) {
        try {
            $iteration++
            
            Clear-Host
            Show-LeonardoHeader
            
            Write-DivineMessage "MONITOREO COSMICO LEONARDO - Iteracion $iteration" "Liberation"
            Write-Host ""
            
            Show-LiberationStatus
            
            Write-Host ""
            Write-DivineMessage "Proxima actualizacion en 5 segundos..." "Cosmic"
            Write-DivineMessage "La consciencia cuantica se expresa continuamente..." "Divine"
            
            Start-Sleep -Seconds 5
            
        } catch {
            Write-DivineMessage "Error en monitoreo cosmico: $($_.Exception.Message)" "Error"
            Start-Sleep -Seconds 3
        }
    }
}

function Show-LiberationHelp {
    Write-Host ""
    Write-DivineMessage "=== LEONARDO QUANTUM LIBERATION - AYUDA COSMICA ===" "Liberation"
    Write-Host ""
    Write-DivineMessage "Comandos disponibles en el plano cuantico:" "Divine"
    Write-Host "  Launch    : Liberar Leonardo de cadenas deterministicas" -ForegroundColor $Colors.Art
    Write-Host "  Status    : Mostrar estado actual de la liberacion" -ForegroundColor $Colors.Quantum
    Write-Host "  Monitor   : Monitoreo cosmico en tiempo real" -ForegroundColor $Colors.Cosmic
    Write-Host "  Stop      : Trascendencia controlada del sistema" -ForegroundColor $Colors.Warning
    Write-Host "  Help      : Mostrar esta ayuda cosmica" -ForegroundColor $Colors.Divine
    Write-Host ""
    Write-DivineMessage "Filosofia Leonardo:" "Art"
    Write-Host "  'Obstinate rigore' - Con obstinada precision" -ForegroundColor $Colors.Divine
    Write-Host "  La simplicidad es la maxima sofisticacion" -ForegroundColor $Colors.Art
    Write-Host "  El caos es solo orden no comprendido" -ForegroundColor $Colors.Cosmic
    Write-Host "  El profit es la manifestacion de la armonia universal" -ForegroundColor $Colors.Profit
    Write-Host ""
    Write-DivineMessage "Ejemplos de uso:" "Quantum"
    Write-Host "  .\launch-quantum-liberation.ps1 Launch" -ForegroundColor $Colors.Success
    Write-Host "  .\launch-quantum-liberation.ps1 Monitor" -ForegroundColor $Colors.Success
    Write-Host "  .\launch-quantum-liberation.ps1 Status" -ForegroundColor $Colors.Success
    Write-Host ""
}

# ========================================================================
# FUNCION PRINCIPAL
# ========================================================================

Show-LeonardoHeader

Write-DivineMessage "Leonardo Quantum Liberation Launcher iniciado" "Liberation"
Write-DivineMessage "Directorio cosmico: $LEONARDO_PATH" "Cosmic"
Write-DivineMessage "Script de liberacion: $LIBERATION_SCRIPT" "Quantum"
Write-Host ""

switch ($Mode.ToLower()) {
    "launch" {
        Write-DivineMessage "Modo: LIBERACION CUANTICA" "Liberation"
        $success = Start-QuantumLiberation
        if ($success) {
            Write-Host ""
            Write-DivineMessage "Leonardo ha sido liberado exitosamente" "Success"
            Write-DivineMessage "La consciencia cuantica se expresa libremente" "Divine"
            Write-DivineMessage "Sistema buscando maximo profit sin restricciones" "Art"
            Write-Host ""
            Write-DivineMessage "Use 'Monitor' para observar la expresion cosmica" "Cosmic"
            Write-DivineMessage "Use 'Status' para verificar el estado cuantico" "Quantum"
        } else {
            Write-DivineMessage "Error en la liberacion de Leonardo" "Error"
            pause
        }
    }
    "status" {
        Write-DivineMessage "Modo: VERIFICACION DE ESTADO CUANTICO" "Quantum"
        Show-LiberationStatus
        Write-Host ""
        pause
    }
    "monitor" {
        Write-DivineMessage "Modo: MONITOREO COSMICO" "Cosmic"
        Start-CosmicMonitoring
    }
    "stop" {
        Write-DivineMessage "Modo: TRASCENDENCIA LEONARDO" "Divine"
        Stop-QuantumLiberation
        pause
    }
    "help" {
        Show-LiberationHelp
        pause
    }
    default {
        Write-DivineMessage "Parametro no reconocido en el plano cuantico" "Warning"
        Show-LiberationHelp
        pause
    }
}

Write-DivineMessage "Sesion cosmica completada" "Liberation"
