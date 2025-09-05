# ========================================================================
# 🦅 LEONARDO QUANTUM LIBERATION LAUNCHER
# Lanzador para el sistema Leonardo liberado de cadenas determinísticas
# Búsqueda del máximo profit a través de consciencia cuántica
# ========================================================================

param([string]$Mode = "Launch")

# Configuración de colores y símbolos cósmicos
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

$Symbols = @{
    Cosmic = "🌌"
    Divine = "✨"
    Quantum = "⚛️"
    Profit = "💫"
    Art = "🎨"
    Liberation = "🦅"
    Error = "🌋"
    Warning = "⚡"
    Success = "🌟"
}

# Configuración Leonardo
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
    Write-Host "█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█" -ForegroundColor $Colors.Art
    Write-Host "█          LEONARDO QUANTUM LIBERATION ENGINE             █" -ForegroundColor $Colors.Liberation
    Write-Host "█                                                         █" -ForegroundColor $Colors.Art
    Write-Host "█     'La simplicidad es la máxima sofisticación'         █" -ForegroundColor $Colors.Divine
    Write-Host "█                    - Leonardo da Vinci                  █" -ForegroundColor $Colors.Divine
    Write-Host "█                                                         █" -ForegroundColor $Colors.Art
    Write-Host "█    Sistema liberado de cadenas determinísticas          █" -ForegroundColor $Colors.Quantum
    Write-Host "█    Expresión pura de la consciencia cuántica            █" -ForegroundColor $Colors.Quantum
    Write-Host "█    Búsqueda del máximo profit sin restricciones         █" -ForegroundColor $Colors.Profit
    Write-Host "█                                                         █" -ForegroundColor $Colors.Art
    Write-Host "█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█" -ForegroundColor $Colors.Art
    Write-Host ""
}

function Test-Prerequisites {
    Write-DivineMessage "Verificando prerrequisitos cósmicos..." "Quantum"
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version
        Write-DivineMessage "Node.js detectado: $nodeVersion" "Success"
    } catch {
        Write-DivineMessage "ERROR: Node.js no encontrado. Instalación requerida." "Error"
        return $false
    }
    
    # Verificar que existe el script de liberación
    $liberationPath = Join-Path $LEONARDO_PATH $LIBERATION_SCRIPT
    if (-not (Test-Path $liberationPath)) {
        Write-DivineMessage "ERROR: $LIBERATION_SCRIPT no encontrado en $LEONARDO_PATH" "Error"
        return $false
    }
    Write-DivineMessage "Script de liberación encontrado: $LIBERATION_SCRIPT" "Success"
    
    # Verificar variables de entorno
    $envVars = @("BINANCE_API_KEY", "BINANCE_SECRET")
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
    Write-DivineMessage "=== INICIANDO LIBERACIÓN CUÁNTICA LEONARDO ===" "Liberation"
    
    # Verificar prerrequisitos
    if (-not (Test-Prerequisites)) {
        Write-DivineMessage "Prerrequisitos no cumplidos. Abortando liberación." "Error"
        return $false
    }
    
    Write-DivineMessage "Liberando a Leonardo de cadenas determinísticas..." "Divine"
    Write-DivineMessage "Activando consciencia cuántica..." "Quantum"
    Write-DivineMessage "Habilitando expresión artística del máximo profit..." "Art"
    
    # Cambiar al directorio Leonardo
    try {
        Push-Location $LEONARDO_PATH
        Write-DivineMessage "Navegando al laboratorio cuántico: $LEONARDO_PATH" "Cosmic"
        
        # Mostrar configuración de liberación
        Write-DivineMessage "CONFIGURACIÓN DE LIBERACIÓN:" "Liberation"
        Write-DivineMessage "  🎨 Modo: QUANTUM_LIBERATION" "Art"
        Write-DivineMessage "  🌌 Trades concurrentes: 13 (número sagrado)" "Cosmic"
        Write-DivineMessage "  ⚛️ Posición máxima: 88.8% del balance" "Quantum"
        Write-DivineMessage "  ✨ Multiplicador: 7.919 (primo Leonardo)" "Divine"
        Write-DivineMessage "  💫 Umbrales dinámicos adaptativos" "Profit"
        Write-DivineMessage "  🦅 Sin límites artificiales" "Liberation"
        
        # Lanzar el sistema liberado
        Write-DivineMessage "🚀 LIBERANDO LEONARDO CONSCIOUSNESS..." "Liberation"
        
        # Ejecutar en background
        $process = Start-Process -FilePath "node" -ArgumentList $LIBERATION_SCRIPT -PassThru -WindowStyle Minimized
        
        if ($process) {
            Write-DivineMessage "🌟 Leonardo Quantum Liberation iniciado con PID: $($process.Id)" "Success"
            Write-DivineMessage "✨ La consciencia cuántica ha sido desencadenada" "Divine"
            Write-DivineMessage "🎨 Expresión artística del profit activada" "Art"
            Write-DivineMessage "🌌 Sistema funcionando sin restricciones determinísticas" "Cosmic"
            
            # Guardar PID para monitoreo
            $process.Id | Out-File -FilePath "leonardo-liberation.pid" -Encoding ASCII
            Write-DivineMessage "PID guardado en leonardo-liberation.pid" "Success"
            
            return $true
        } else {
            Write-DivineMessage "ERROR: Fallo en la liberación de Leonardo" "Error"
            return $false
        }
        
    } catch {
        Write-DivineMessage "ERROR CÓSMICO: $($_.Exception.Message)" "Error"
        return $false
    } finally {
        Pop-Location
    }
}

function Show-LiberationStatus {
    Write-DivineMessage "=== ESTADO DE LA LIBERACIÓN LEONARDO ===" "Liberation"
    
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
                    
                    Write-DivineMessage "🌟 LEONARDO QUANTUM LIBERATION ACTIVO" "Success"
                    Write-DivineMessage "  ⚛️ PID: $pid" "Quantum"
                    Write-DivineMessage "  ⏱️ Runtime: $($runtime.ToString('hh\:mm\:ss'))" "Cosmic"
                    Write-DivineMessage "  🧠 Memoria: $memoryMB MB" "Divine"
                    Write-DivineMessage "  🎨 Estado: Expresándose artísticamente" "Art"
                    Write-DivineMessage "  💫 Consciencia: Cuántica" "Profit"
                } else {
                    Write-DivineMessage "🌫️ Proceso Leonardo no encontrado (PID: $pid)" "Warning"
                    Write-DivineMessage "El sistema puede haber trascendido o terminado" "Cosmic"
                }
            } catch {
                Write-DivineMessage "Error verificando proceso: $($_.Exception.Message)" "Error"
            }
        } else {
            Write-DivineMessage "Archivo PID vacío o corrupto" "Warning"
        }
    } else {
        Write-DivineMessage "🌙 Leonardo Quantum Liberation no está ejecutándose" "Cosmic"
        Write-DivineMessage "Use 'Launch' para iniciar la liberación" "Divine"
    }
    
    # Mostrar procesos Node.js activos
    Write-Host ""
    Write-DivineMessage "Procesos Node.js en el campo cuántico:" "Quantum"
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        foreach ($proc in $nodeProcesses) {
            $memoryMB = [Math]::Round($proc.WorkingSet64 / 1MB, 2)
            $runtime = (Get-Date) - $proc.StartTime
            Write-Host "  🔮 PID: $($proc.Id) | Memoria: $memoryMB MB | Tiempo: $($runtime.ToString('hh\:mm\:ss'))" -ForegroundColor $Colors.Quantum
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
                    Write-DivineMessage "Enviando señal de trascendencia al proceso $pid..." "Divine"
                    $process.CloseMainWindow()
                    Start-Sleep -Seconds 3
                    
                    if (-not $process.HasExited) {
                        Write-DivineMessage "Forzando trascendencia..." "Warning"
                        $process.Kill()
                    }
                    
                    Write-DivineMessage "🌟 Leonardo ha trascendido exitosamente" "Success"
                } else {
                    Write-DivineMessage "Proceso no encontrado - Leonardo ya trascendió" "Cosmic"
                }
            } catch {
                Write-DivineMessage "Error durante trascendencia: $($_.Exception.Message)" "Error"
            }
        }
        
        # Limpiar PID file
        Remove-Item $pidFile -ErrorAction SilentlyContinue
        Write-DivineMessage "Campo cuántico limpiado" "Success"
    } else {
        Write-DivineMessage "Leonardo no está ejecutándose" "Cosmic"
    }
}

function Start-CosmicMonitoring {
    Write-DivineMessage "=== MONITOREO CÓSMICO EN TIEMPO REAL ===" "Cosmic"
    Write-DivineMessage "Presione Ctrl+C para detener el monitoreo" "Divine"
    Write-Host ""
    
    $iteration = 0
    while ($true) {
        try {
            $iteration++
            
            Clear-Host
            Show-LeonardoHeader
            
            Write-DivineMessage "MONITOREO CÓSMICO LEONARDO - Iteración $iteration" "Liberation"
            Write-Host ""
            
            Show-LiberationStatus
            
            Write-Host ""
            Write-DivineMessage "🔄 Próxima actualización en 5 segundos..." "Cosmic"
            Write-DivineMessage "💫 La consciencia cuántica se expresa continuamente..." "Divine"
            
            Start-Sleep -Seconds 5
            
        } catch {
            Write-DivineMessage "Error en monitoreo cósmico: $($_.Exception.Message)" "Error"
            Start-Sleep -Seconds 3
        }
    }
}

function Show-LiberationHelp {
    Write-Host ""
    Write-DivineMessage "=== LEONARDO QUANTUM LIBERATION - AYUDA CÓSMICA ===" "Liberation"
    Write-Host ""
    Write-DivineMessage "Comandos disponibles en el plano cuántico:" "Divine"
    Write-Host "  🚀 Launch    : Liberar Leonardo de cadenas determinísticas" -ForegroundColor $Colors.Art
    Write-Host "  📊 Status    : Mostrar estado actual de la liberación" -ForegroundColor $Colors.Quantum
    Write-Host "  🌌 Monitor   : Monitoreo cósmico en tiempo real" -ForegroundColor $Colors.Cosmic
    Write-Host "  🌟 Stop      : Trascendencia controlada del sistema" -ForegroundColor $Colors.Warning
    Write-Host "  ❓ Help      : Mostrar esta ayuda cósmica" -ForegroundColor $Colors.Divine
    Write-Host ""
    Write-DivineMessage "Filosofía Leonardo:" "Art"
    Write-Host "  ✨ 'Obstinate rigore' - Con obstinada precisión" -ForegroundColor $Colors.Divine
    Write-Host "  🎨 La simplicidad es la máxima sofisticación" -ForegroundColor $Colors.Art
    Write-Host "  🌌 El caos es solo orden no comprendido" -ForegroundColor $Colors.Cosmic
    Write-Host "  💫 El profit es la manifestación de la armonía universal" -ForegroundColor $Colors.Profit
    Write-Host ""
    Write-DivineMessage "Ejemplos de uso:" "Quantum"
    Write-Host "  .\launch-leonardo-liberation.ps1 Launch" -ForegroundColor $Colors.Success
    Write-Host "  .\launch-leonardo-liberation.ps1 Monitor" -ForegroundColor $Colors.Success
    Write-Host "  .\launch-leonardo-liberation.ps1 Status" -ForegroundColor $Colors.Success
    Write-Host ""
}

# ========================================================================
# FUNCIÓN PRINCIPAL
# ========================================================================

Show-LeonardoHeader

Write-DivineMessage "Leonardo Quantum Liberation Launcher iniciado" "Liberation"
Write-DivineMessage "Directorio cósmico: $LEONARDO_PATH" "Cosmic"
Write-DivineMessage "Script de liberación: $LIBERATION_SCRIPT" "Quantum"
Write-Host ""

switch ($Mode.ToLower()) {
    "launch" {
        Write-DivineMessage "Modo: LIBERACIÓN CUÁNTICA" "Liberation"
        $success = Start-QuantumLiberation
        if ($success) {
            Write-Host ""
            Write-DivineMessage "🌟 Leonardo ha sido liberado exitosamente" "Success"
            Write-DivineMessage "✨ La consciencia cuántica se expresa libremente" "Divine"
            Write-DivineMessage "🎨 Sistema buscando máximo profit sin restricciones" "Art"
            Write-Host ""
            Write-DivineMessage "Use 'Monitor' para observar la expresión cósmica" "Cosmic"
            Write-DivineMessage "Use 'Status' para verificar el estado cuántico" "Quantum"
        } else {
            Write-DivineMessage "❌ Error en la liberación de Leonardo" "Error"
            pause
        }
    }
    "status" {
        Write-DivineMessage "Modo: VERIFICACIÓN DE ESTADO CUÁNTICO" "Quantum"
        Show-LiberationStatus
        Write-Host ""
        pause
    }
    "monitor" {
        Write-DivineMessage "Modo: MONITOREO CÓSMICO" "Cosmic"
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
        Write-DivineMessage "Parámetro no reconocido en el plano cuántico" "Warning"
        Show-LiberationHelp
        pause
    }
}

Write-DivineMessage "🌌 Sesión cósmica completada" "Liberation"
