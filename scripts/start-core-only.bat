@echo off
setlocal ENABLEDELAYEDEXPANSION
REM Lanzador simple del Quantum Core en segundo plano

REM Resolver ruta del directorio del Core
set SCRIPT_DIR=%~dp0
set CORE_DIR=%SCRIPT_DIR%..\core\quantum-engine

if not exist "%CORE_DIR%" (
  echo [ERROR] No se encuentra el directorio del Core: %CORE_DIR%
  exit /b 1
)

pushd "%CORE_DIR%" >nul 2>&1

REM Asegurar .env
if not exist ".env" (
  if exist "env-example.txt" (
    copy /Y "env-example.txt" ".env" >nul
  ) else (
    echo [WARN] No existe env-example.txt. Continuando sin .env
  )
)

REM Franja anti-conflictos por defecto
if "%QUANTUM_PORT%"=="" set QUANTUM_PORT=9090
if "%METRICS_PORT%"=="" set METRICS_PORT=9100
if "%COORDINATOR_PORT%"=="" set COORDINATOR_PORT=3000
if "%UNIFIED_SERVER_PORT%"=="" set UNIFIED_SERVER_PORT=18020
set SINGLE_SERVER_MODE=true

REM Resolver Node
set "NODEEXE=node"
if exist "C:\Program Files\nodejs\node.exe" set "NODEEXE=C:\Program Files\nodejs\node.exe"

REM Preparar logs
if not exist "logs" mkdir "logs" >nul 2>&1
set "LOGFILE=logs\core-boot.log"

REM Limpiar log de arranque para esta sesión
break > "%LOGFILE%"

echo [LAUNCH] %DATE% %TIME% ^| NODEEXE=%NODEEXE% ^| QUANTUM_PORT=%QUANTUM_PORT%>> "%LOGFILE%"

REM Iniciar en ventana minimizada y en segundo plano (quoting correcto)
start "QBTC-Core" /min cmd /c ""%NODEEXE%" index.js >> "%LOGFILE%" 2>&1"

popd >nul 2>&1

echo [OK] Lanzado Quantum Core en segundo plano. Logs: %CORE_DIR%\%LOGFILE%
exit /b 0
