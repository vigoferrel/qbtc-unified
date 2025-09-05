@echo off
REM ========================================================================
REM 🌊 LEONARDO CONSCIOUSNESS MONITORING SCRIPT - BATCH
REM Script para ejecutar y monitorizar el sistema Leonardo en Windows CMD
REM ========================================================================

echo.
echo 🌊 LEONARDO CONSCIOUSNESS MONITORING INICIADO
echo ========================================================================
echo.

REM Configuración
set SCRIPT_DIR=%~dp0
set NODE_SCRIPT=UnifiedLeonardoServer.js
set POWERSHELL_SCRIPT=monitor-leonardo-powershell.ps1
set LOG_FILE=%SCRIPT_DIR%leonardo-batch-%date:~6,4%%date:~3,2%%date:~0,2%-%time:~0,2%%time:~3,2%%time:~6,2%.log

echo 📁 Directorio de trabajo: %SCRIPT_DIR%
echo 📝 Log de monitoreo: %LOG_FILE%
echo ⚡ Script Node.js: %NODE_SCRIPT%
echo.

REM Verificar que Node.js está instalado
echo 🔍 Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js no está instalado o no está en el PATH
    echo    Instale Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detectado: 
node --version
echo.

REM Verificar que el script de Node.js existe
echo 🔍 Verificando archivo %NODE_SCRIPT%...
if not exist "%SCRIPT_DIR%%NODE_SCRIPT%" (
    echo ❌ ERROR: No se encuentra %NODE_SCRIPT% en el directorio actual
    echo    Asegúrese de estar ejecutando desde el directorio correcto
    dir *.js
    pause
    exit /b 1
)

echo ✅ Script Node.js encontrado
echo.

REM Verificar que PowerShell está disponible
echo 🔍 Verificando PowerShell...
powershell -Command "Get-Host" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  PowerShell no disponible, usando monitoreo básico...
    goto BASIC_MONITORING
) else (
    echo ✅ PowerShell disponible
    echo.
)

REM Verificar si el script de PowerShell existe
if exist "%SCRIPT_DIR%%POWERSHELL_SCRIPT%" (
    echo ✅ Script de PowerShell encontrado
    echo.
    goto POWERSHELL_MONITORING
) else (
    echo ⚠️  Script de PowerShell no encontrado, usando monitoreo básico...
    goto BASIC_MONITORING
)

:POWERSHELL_MONITORING
echo 🚀 INICIANDO MONITOREO AVANZADO CON POWERSHELL...
echo ========================================================================
echo.

REM Preguntar al usuario qué hacer
echo Opciones disponibles:
echo   1 - Iniciar Leonardo y monitorear
echo   2 - Solo monitorear (Leonardo debe estar ya ejecutándose)
echo   3 - Limpiar procesos zombie
echo   4 - Salir
echo.
set /p choice="Seleccione una opción (1-4): "

if "%choice%"=="1" (
    echo 🚀 Iniciando Leonardo y monitoreo...
    powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%%POWERSHELL_SCRIPT%" Start
) else if "%choice%"=="2" (
    echo 👁️  Solo monitoreo...
    powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%%POWERSHELL_SCRIPT%" Monitor
) else if "%choice%"=="3" (
    echo 🧹 Limpiando procesos zombie...
    powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%%POWERSHELL_SCRIPT%" Clean
    pause
) else if "%choice%"=="4" (
    echo 👋 Saliendo...
    exit /b 0
) else (
    echo ❌ Opción inválida, usando modo automático...
    powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%%POWERSHELL_SCRIPT%"
)

goto END

:BASIC_MONITORING
echo 🔧 INICIANDO MONITOREO BÁSICO...
echo ========================================================================
echo.

REM Función para logging básico
echo [%date% %time%] Iniciando monitoreo básico Leonardo >> "%LOG_FILE%"

REM Verificar si Leonardo ya está ejecutándose
echo 🔍 Verificando procesos Leonardo existentes...
tasklist /FI "IMAGENAME eq node.exe" | findstr "node.exe" >nul
if errorlevel 1 (
    echo ⚠️  No se encontraron procesos Node.js activos
    echo 🚀 Iniciando %NODE_SCRIPT%...
    
    REM Cambiar al directorio del script
    cd /d "%SCRIPT_DIR%"
    
    REM Iniciar Leonardo en segundo plano
    start "Leonardo Server" /MIN cmd /c "node %NODE_SCRIPT% > leonardo-output.log 2>&1"
    
    echo ✅ Leonardo iniciado en segundo plano
    echo 📝 Output guardado en leonardo-output.log
    echo.
    
    REM Esperar un poco para que inicie
    echo ⏳ Esperando 10 segundos para que inicie...
    timeout /t 10 /nobreak >nul
    
) else (
    echo ✅ Procesos Node.js ya ejecutándose
    echo.
)

REM Monitor básico en bucle
echo 🔄 INICIANDO BUCLE DE MONITOREO BÁSICO
echo    Presione Ctrl+C para salir
echo.

:MONITOR_LOOP
echo ============= MONITOR LEONARDO - %date% %time% =============

REM Mostrar procesos Node.js
echo 📊 PROCESOS NODE.JS:
tasklist /FI "IMAGENAME eq node.exe" /FO TABLE

REM Mostrar uso de memoria
echo.
echo 💾 USO DE MEMORIA SISTEMA:
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value | findstr "="

REM Mostrar conexiones de red en puertos Leonardo
echo.
echo 🌐 CONEXIONES DE RED (puertos 3000, 8080, 9090):
netstat -an | findstr ":3000\|:8080\|:9090"

REM Log de la iteración
echo [%date% %time%] Monitor básico - Iteración completada >> "%LOG_FILE%"

echo.
echo ⏳ Esperando 10 segundos para próxima iteración...
echo    (Ctrl+C para salir)
timeout /t 10 /nobreak >nul

REM Verificar si el usuario quiere salir
if errorlevel 1 goto END

goto MONITOR_LOOP

:END
echo.
echo 🏁 MONITOREO LEONARDO FINALIZADO
echo 📝 Log guardado en: %LOG_FILE%
echo.

REM Preguntar si quiere ver el log
set /p viewlog="¿Desea ver el archivo de log? (s/n): "
if /i "%viewlog%"=="s" (
    if exist "%LOG_FILE%" (
        type "%LOG_FILE%"
    ) else (
        echo ⚠️  Archivo de log no encontrado
    )
)

echo.
echo 👋 ¡Hasta luego!
pause
