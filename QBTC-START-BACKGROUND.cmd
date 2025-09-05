@echo off
REM ========================================================================
REM QBTC-UNIFIED BACKGROUND LAUNCHER
REM Lanza el sistema en segundo plano sin interfaz de monitoreo
REM ========================================================================

title QBTC-UNIFIED Background Launcher

echo.
echo ======================================
echo  QBTC-UNIFIED BACKGROUND LAUNCHER
echo ======================================
echo.
echo Lanzando sistema en segundo plano...
echo Frontend: Puerto 8080
echo Backend: Puerto 3003
echo.

cd /d "C:\Users\DELL\Desktop\QBTC-UNIFIED"

REM Ejecutar en segundo plano
powershell -ExecutionPolicy Bypass -File "LAUNCH-QBTC-UNIFIED.ps1" -Background

echo.
echo Sistema lanzado en segundo plano.
echo Accede a: http://localhost:8080
echo.

timeout /t 5 /nobreak >nul
