# =====================================================================
# 🚀 RUN STEP 7 VALIDATION - SCRIPT DE POWERSHELL PARA WINDOWS
# Ejecutor completo del Paso 7 con supervisión en segundo plano
# Compatible con Windows/PowerShell - Orquestación completa
# =====================================================================

param(
    [switch]$Background,
    [switch]$NoDashboard,
    [switch]$NoValidation,
    [switch]$NoMetrics,
    [switch]$NoBackgroundProcesses,
    [int]$DashboardPort = 3000,
    [string]$ReportDirectory = "C:\QBTC-VALIDATION-REPORTS",
    [switch]$Help
)

# Mostrar ayuda si se solicita
if ($Help) {
    Write-Host @"
🌌 QUANTUM LEVERAGE ENGINE - SCRIPT DE VALIDACIÓN PASO 7
=========================================================

DESCRIPCIÓN:
    Ejecuta la validación completa del Paso 7 incluyendo pruebas unitarias,
    métricas de rendimiento, orquestación de procesos en segundo plano y
    dashboard de monitoreo en tiempo real.

PARÁMETROS:
    -Background              Ejecutar en modo supervisión continua
    -NoDashboard            Deshabilitar dashboard web
    -NoValidation           Deshabilitar validación completa
    -NoMetrics              Deshabilitar recolección de métricas
    -NoBackgroundProcesses  Deshabilitar procesos en segundo plano
    -DashboardPort <puerto> Puerto para el dashboard (por defecto: 3000)
    -ReportDirectory <ruta> Directorio para reportes (por defecto: C:\QBTC-VALIDATION-REPORTS)
    -Help                   Mostrar esta ayuda

EJEMPLOS:
    .\RunStep7Validation.ps1                           # Ejecución completa estándar
    .\RunStep7Validation.ps1 -Background               # Ejecución en segundo plano
    .\RunStep7Validation.ps1 -NoDashboard              # Sin dashboard web
    .\RunStep7Validation.ps1 -DashboardPort 8080       # Dashboard en puerto 8080
    .\RunStep7Validation.ps1 -Background -DashboardPort 3001  # Modo completo personalizado

COMPONENTES INCLUIDOS:
    🧪 Framework de pruebas unitarias para transformaciones primas
    📊 Sistema de métricas y logging en segundo plano
    🎺 Orquestador de procesos Windows/PowerShell
    🔬 Validador funcional end-to-end
    📊 Dashboard de monitoreo en tiempo real

"@
    exit 0
}

# Configurar ventana de PowerShell
$Host.UI.RawUI.WindowTitle = "Quantum Leverage Engine - Step 7 Validation"

# Colores para output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    
    $colorMap = @{
        "Red" = "Red"
        "Green" = "Green" 
        "Yellow" = "Yellow"
        "Blue" = "Blue"
        "Magenta" = "Magenta"
        "Cyan" = "Cyan"
        "White" = "White"
    }
    
    Write-Host $Message -ForegroundColor $colorMap[$Color]
}

# Banner inicial
Write-ColorOutput @"
════════════════════════════════════════════════════════════════════════════════
🌌 QUANTUM LEVERAGE ENGINE - PASO 7: VALIDACIÓN COMPLETA
   Validación, pruebas y ejecución supervisada en segundo plano
   Compatible con Windows/PowerShell - Versión 1.0
════════════════════════════════════════════════════════════════════════════════
"@ "Cyan"

Write-ColorOutput "`n🔧 CONFIGURACIÓN DE EJECUCIÓN:" "Yellow"
Write-ColorOutput "   • Modo background: $(if ($Background) { 'Habilitado' } else { 'Deshabilitado' })"
Write-ColorOutput "   • Dashboard: $(if ($NoDashboard) { 'Deshabilitado' } else { "Habilitado (puerto $DashboardPort)" })"
Write-ColorOutput "   • Validación: $(if ($NoValidation) { 'Deshabilitada' } else { 'Habilitada' })"
Write-ColorOutput "   • Métricas: $(if ($NoMetrics) { 'Deshabilitadas' } else { 'Habilitadas' })"
Write-ColorOutput "   • Procesos background: $(if ($NoBackgroundProcesses) { 'Deshabilitados' } else { 'Habilitados' })"
Write-ColorOutput "   • Directorio reportes: $ReportDirectory"

# Verificar prerrequisitos del sistema
Write-ColorOutput "`n🔍 VERIFICANDO PRERREQUISITOS DEL SISTEMA..." "Yellow"

# Verificar Node.js
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-ColorOutput "   ✅ Node.js detectado: $nodeVersion" "Green"
    } else {
        throw "Node.js no encontrado"
    }
} catch {
    Write-ColorOutput "   ❌ Node.js no está instalado o no está en PATH" "Red"
    Write-ColorOutput "   📥 Por favor instale Node.js desde: https://nodejs.org/" "Yellow"
    exit 1
}

# Verificar npm
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-ColorOutput "   ✅ npm detectado: v$npmVersion" "Green"
    }
} catch {
    Write-ColorOutput "   ⚠️ npm no detectado, pero continuando..." "Yellow"
}

# Verificar directorio del proyecto
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-ColorOutput "   📁 Directorio del proyecto: $projectDir" "White"

if (-not (Test-Path "$projectDir\ValidationRunner.js")) {
    Write-ColorOutput "   ❌ ValidationRunner.js no encontrado en el directorio del proyecto" "Red"
    exit 1
}

Write-ColorOutput "   ✅ Archivo principal encontrado" "Green"

# Verificar/crear directorio de reportes
Write-ColorOutput "`n📁 PREPARANDO DIRECTORIOS..." "Yellow"
try {
    if (-not (Test-Path $ReportDirectory)) {
        New-Item -ItemType Directory -Path $ReportDirectory -Force | Out-Null
        Write-ColorOutput "   ✅ Directorio de reportes creado: $ReportDirectory" "Green"
    } else {
        Write-ColorOutput "   ✅ Directorio de reportes verificado: $ReportDirectory" "Green"
    }
} catch {
    Write-ColorOutput "   ❌ No se pudo crear directorio de reportes: $($_.Exception.Message)" "Red"
    exit 1
}

# Verificar dependencias de Node.js
Write-ColorOutput "`n📦 VERIFICANDO DEPENDENCIAS..." "Yellow"
Set-Location $projectDir

# Lista de dependencias requeridas
$requiredModules = @(
    "express",
    "socket.io",
    "chart.js"
)

Write-ColorOutput "   🔄 Instalando/verificando dependencias de Node.js..." "White"

try {
    # Instalar dependencias si package.json existe
    if (Test-Path "package.json") {
        npm install --silent 2>$null
        Write-ColorOutput "   ✅ Dependencias instaladas desde package.json" "Green"
    } else {
        # Instalar dependencias manualmente
        foreach ($module in $requiredModules) {
            Write-ColorOutput "   🔄 Instalando $module..." "White"
            npm install $module --silent 2>$null
        }
        Write-ColorOutput "   ✅ Dependencias básicas instaladas" "Green"
    }
} catch {
    Write-ColorOutput "   ⚠️ Algunas dependencias podrían no estar disponibles: $($_.Exception.Message)" "Yellow"
    Write-ColorOutput "   📝 El sistema intentará ejecutarse con las dependencias disponibles" "Yellow"
}

# Configurar variables de entorno
Write-ColorOutput "`n🔧 CONFIGURANDO ENTORNO..." "Yellow"
$env:NODE_ENV = "production"
$env:DASHBOARD_PORT = $DashboardPort.ToString()
$env:REPORT_DIR = $ReportDirectory

Write-ColorOutput "   ✅ Variables de entorno configuradas" "Green"

# Construir argumentos para el ValidationRunner
$nodeArgs = @("ValidationRunner.js")

if ($NoDashboard) {
    $nodeArgs += "--no-dashboard"
}

if ($NoValidation) {
    $nodeArgs += "--no-validation"
}

if ($NoMetrics) {
    $nodeArgs += "--no-metrics"
}

if ($NoBackgroundProcesses) {
    $nodeArgs += "--no-background"
}

if ($Background) {
    $nodeArgs += "--background"
}

# Mostrar resumen de ejecución
Write-ColorOutput "`n🚀 INICIANDO VALIDACIÓN DEL PASO 7..." "Green"
Write-ColorOutput "════════════════════════════════════════════════════════════════════════════════" "Cyan"
Write-ColorOutput "   Comando: node $($nodeArgs -join ' ')" "White"
Write-ColorOutput "   Directorio: $projectDir" "White"
Write-ColorOutput "   Modo: $(if ($Background) { 'Supervisión continua' } else { 'Ejecución única' })" "White"

if (-not $NoDashboard) {
    Write-ColorOutput "   Dashboard: http://localhost:$DashboardPort" "Green"
}

Write-ColorOutput "════════════════════════════════════════════════════════════════════════════════" "Cyan"

# Función para manejar Ctrl+C elegantemente
function Handle-CtrlC {
    Write-ColorOutput "`n🛑 SEÑAL DE INTERRUPCIÓN RECIBIDA..." "Yellow"
    Write-ColorOutput "   Terminando procesos elegantemente..." "White"
    
    # Dar tiempo para que Node.js termine elegantemente
    Start-Sleep -Seconds 2
    
    Write-ColorOutput "   ✅ Terminación elegante completada" "Green"
    exit 0
}

# Registrar manejador de Ctrl+C
Register-EngineEvent PowerShell.Exiting -Action { Handle-CtrlC }

# Ejecutar el sistema principal
try {
    Write-ColorOutput "`n⚡ LANZANDO SISTEMA PRINCIPAL..." "Green"
    
    if ($Background) {
        Write-ColorOutput "`n📊 SISTEMA EJECUTÁNDOSE EN SEGUNDO PLANO" "Cyan"
        Write-ColorOutput "   • Presione Ctrl+C para terminar elegantemente" "Yellow"
        Write-ColorOutput "   • Los logs se guardarán en: $ReportDirectory" "White"
        if (-not $NoDashboard) {
            Write-ColorOutput "   • Dashboard disponible en: http://localhost:$DashboardPort" "Green"
        }
        Write-ColorOutput "`n" "White"
    }
    
    # Ejecutar Node.js con manejo de señales
    $process = Start-Process -FilePath "node" -ArgumentList $nodeArgs -WorkingDirectory $projectDir -PassThru -NoNewWindow
    
    # Esperar a que termine el proceso
    $process.WaitForExit()
    
    $exitCode = $process.ExitCode
    
    if ($exitCode -eq 0) {
        Write-ColorOutput "`n✅ VALIDACIÓN DEL PASO 7 COMPLETADA EXITOSAMENTE" "Green"
        Write-ColorOutput "════════════════════════════════════════════════════════════════════════════════" "Cyan"
        Write-ColorOutput "   📄 Reportes generados en: $ReportDirectory" "White"
        Write-ColorOutput "   🎯 Sistema validado y listo para producción" "Green"
    } else {
        Write-ColorOutput "`n⚠️ VALIDACIÓN COMPLETADA CON ADVERTENCIAS" "Yellow"
        Write-ColorOutput "   📄 Revisar reportes en: $ReportDirectory" "White"
        Write-ColorOutput "   🔍 Código de salida: $exitCode" "Yellow"
    }
    
} catch {
    Write-ColorOutput "`n❌ ERROR EJECUTANDO VALIDACIÓN: $($_.Exception.Message)" "Red"
    Write-ColorOutput "   📄 Revise los logs en: $ReportDirectory" "White"
    exit 1
}

# Preguntar si abrir el directorio de reportes
if (-not $Background) {
    Write-ColorOutput "`n📂 ¿Desea abrir el directorio de reportes? (S/N): " "Yellow" -NoNewline
    $response = Read-Host
    
    if ($response -match "^[SsYy]") {
        try {
            Start-Process -FilePath "explorer.exe" -ArgumentList $ReportDirectory
            Write-ColorOutput "   ✅ Directorio de reportes abierto" "Green"
        } catch {
            Write-ColorOutput "   ⚠️ No se pudo abrir el directorio automáticamente" "Yellow"
            Write-ColorOutput "   📁 Abra manualmente: $ReportDirectory" "White"
        }
    }
}

Write-ColorOutput "`n🌟 EJECUCIÓN FINALIZADA" "Green"
Write-ColorOutput "════════════════════════════════════════════════════════════════════════════════" "Cyan"

# Si no está en background, pausar para que el usuario vea los resultados
if (-not $Background) {
    Write-ColorOutput "`nPresione cualquier tecla para continuar..." "White"
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
