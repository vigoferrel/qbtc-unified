@echo off
title QBTC Unified System - Test Mode
echo.
echo ==============================================
echo    QBTC UNIFIED SYSTEM - TEST MODE
echo    Copyright 2025 VIGOLEONROCKS QUANTUM
echo ==============================================
echo.

echo [INFO] Ejecutando modo de prueba (sin API keys)...
echo [INFO] Puerto de prueba: 18030
echo [INFO] Duracion: 30 segundos
echo.

cd /d "%~dp0"
cd core\quantum-engine

echo [INFO] Iniciando test del sistema unificado...
node test-unified-system.js

if errorlevel 1 (
    echo.
    echo [ERROR] Error en el test del sistema.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Test completado exitosamente!
echo [INFO] El sistema esta listo para uso en produccion.
pause
