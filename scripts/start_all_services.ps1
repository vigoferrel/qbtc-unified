# Script para iniciar todos los servicios del sistema QBTC-UNIFIED
# Este script utiliza el MASTER-ANTICONFLICT-LAUNCHER.js como punto de entrada unico

$ErrorActionPreference = "Stop"

# Directorio base del proyecto
$baseDir = "C:\Users\DELL\Desktop\QBTC-UNIFIED"

# Archivo de log principal
$logFile = "$baseDir\logs\qbtc-unified-main-launch.log"

# Proceso a ejecutar
$processToRun = "node"
$processArgs = "$baseDir\MASTER-ANTICONFLICT-LAUNCHER.js"

# Funcion para escribir en el log
function Write-Log {
    param(
        [string]$message
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "[$timestamp] $message" | Tee-Object -FilePath $logFile -Append
}

# --- INICIO DEL SCRIPT ---

Write-Log "Iniciando el sistema QBTC-UNIFIED..."

# Crear un bucle para reiniciar el proceso si falla
while ($true) {
    try {
        Write-Log "Lanzando: $processToRun $processArgs"

        # Iniciar el proceso en segundo plano
        Start-Process -FilePath $processToRun -ArgumentList $processArgs -NoNewWindow -RedirectStandardOutput "$baseDir\logs\qbtc-unified-output.log" -RedirectStandardError "$baseDir\logs\qbtc-unified-error.log"

        Write-Log "El sistema se ha iniciado correctamente."

        # Esperar a que el proceso termine (lo cual no deberia pasar si es un servicio)
        # Si el proceso termina, el script continuara y lo reiniciara
        Wait-Process -Name $processToRun

    } catch {
        Write-Log "ERROR: Se produjo un error al intentar iniciar el sistema. Detalles: $_"
    }

    # Si el proceso falla, esperar 5 segundos antes de reiniciar
    Write-Log "El proceso principal ha terminado. Reiniciando en 5 segundos..."
    Start-Sleep -Seconds 5
}

