@echo off
echo ======================================
echo Activando VPN QBTC - IP 181.43.212.196
echo ======================================

echo.
echo Paso 1: Deteniendo conexiones VPN existentes...
taskkill /f /im openvpn.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Paso 2: Verificando IP actual...
for /f "tokens=*" %%i in ('powershell -Command "(Invoke-WebRequest -Uri 'https://api.ipify.org' -UseBasicParsing).Content"') do set CURRENT_IP=%%i
echo IP actual: %CURRENT_IP%

echo.
echo Paso 3: Conectando VPN QBTC (181.43.212.196)
if exist "qbtc-openvpn-config.ovpn" (
    if exist "qbtc-credentials.txt" (
        echo Iniciando VPN QBTC...
        start "VPN QBTC" /min "C:\Program Files\OpenVPN\bin\openvpn.exe" --config "qbtc-openvpn-config.ovpn" --auth-user-pass "qbtc-credentials.txt" --script-security 2
        echo VPN QBTC iniciada
    ) else (
        echo ERROR: No se encontro qbtc-credentials.txt
        exit /b 1
    )
) else (
    echo ERROR: No se encontro qbtc-openvpn-config.ovpn
    exit /b 1
)

echo.
echo Esperando establecimiento de conexion...
timeout /t 10 /nobreak >nul

echo.
echo Paso 4: Verificando cambio de IP...
for /f "tokens=*" %%i in ('powershell -Command "(Invoke-WebRequest -Uri 'https://api.ipify.org' -UseBasicParsing).Content"') do set NEW_IP=%%i
echo Nueva IP: %NEW_IP%

if "%NEW_IP%"=="181.43.212.196" (
    echo.
    echo ✅ EXITO: IP cambiada correctamente a 181.43.212.196
    echo.
    echo Paso 5: Ejecutando sistema QBTC...
    node system-integrator.js
) else (
    echo.
    echo ❌ ADVERTENCIA: IP no cambio a la objetivo
    echo IP actual: %NEW_IP%
    echo IP objetivo: 181.43.212.196
    echo.
    echo Verifica la configuracion VPN manualmente
)

echo.
echo Presione una tecla para continuar...
pause >nul
