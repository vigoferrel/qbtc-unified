@echo off
title QBTC Unified System - Quick Start
echo.
echo ==============================================
echo    QBTC UNIFIED SYSTEM - QUICK START
echo    Copyright 2025 VIGOLEONROCKS QUANTUM
echo ==============================================
echo.

echo [INFO] Iniciando sistema cuantico unificado...
echo [INFO] Puerto principal: 18020
echo [INFO] Puerto metricas: 18022
echo.

cd /d "%~dp0"
cd core\quantum-engine

echo [INFO] Verificando dependencias...
if not exist "node_modules" (
    echo [WARN] Dependencias no encontradas. Instalando...
    npm install
    if errorlevel 1 (
        echo [ERROR] Error instalando dependencias.
        pause
        exit /b 1
    )
)

echo [INFO] Lanzando sistema unificado...
node unified-system-launcher.js

if errorlevel 1 (
    echo.
    echo [ERROR] Error al iniciar el sistema.
    echo [HINT] Verifica las variables de entorno en .env
    echo [HINT] Ejecuta: node test-unified-system.js para modo demo
    pause
)

echo.
echo [INFO] Sistema detenido.
pause
