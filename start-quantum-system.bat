@echo off
REM Copyright © 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES.
REM Script de inicio del Sistema Cuántico Unificado

echo [QUANTUM SYSTEM] Iniciando Sistema Cuantico Unificado...
echo.

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no encontrado. Por favor instala Node.js
    pause
    exit /b 1
)

REM Establecer variables de entorno
set NODE_ENV=production
set QUANTUM_SYSTEM_ROOT=%~dp0
cd %QUANTUM_SYSTEM_ROOT%

REM Verificar dependencias
echo [QUANTUM SYSTEM] Verificando dependencias...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Error instalando dependencias
    pause
    exit /b 1
)

echo [QUANTUM SYSTEM] Dependencias verificadas
echo.

REM Iniciar sistema unificado
echo [QUANTUM SYSTEM] Iniciando sistema...
node start-quantum-unified.js

REM Si el sistema se detiene, esperar input
echo.
echo [QUANTUM SYSTEM] Sistema detenido
pause
