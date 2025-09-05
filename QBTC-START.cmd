@echo off
REM ========================================================================
REM QBTC-UNIFIED ONE-CLICK LAUNCHER
REM Comando ultra-simple para lanzar todo el sistema
REM ========================================================================

title QBTC-UNIFIED System Launcher

echo.
echo ================================
echo  QBTC-UNIFIED SYSTEM LAUNCHER
echo ================================
echo.
echo Iniciando sistema completo...
echo Frontend: Puerto 8080
echo Backend: Puerto 3003
echo.

REM Cambiar al directorio correcto
cd /d "C:\Users\DELL\Desktop\QBTC-UNIFIED"

REM Ejecutar el script PowerShell maestro
powershell -ExecutionPolicy Bypass -File "LAUNCH-QBTC-UNIFIED.ps1" -Monitor

pause
