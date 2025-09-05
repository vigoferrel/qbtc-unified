@echo off
echo ======================================
echo Conectando VPN QBTC - IP 181.43.212.196
echo ======================================
echo.

REM Verificar IP actual
echo Verificando IP actual...
for /f "tokens=*" %%i in ('curl -s ipinfo.io/ip') do set "CURRENT_IP=%%i"
echo IP actual: %CURRENT_IP%

if "%CURRENT_IP%"=="181.43.212.196" (
    echo.
    echo SUCCESS! Ya tienes la IP objetivo: 181.43.212.196
    echo Sistema QBTC listo para ejecutar
    goto :end
)

echo.
echo Necesitas cambiar de %CURRENT_IP% a 181.43.212.196
echo.

echo INSTRUCCIONES PARA CONECTAR VPN QBTC:
echo =====================================
echo.
echo 1. Abre OpenVPN GUI (ya está ejecutándose)
echo 2. Haz clic derecho en el ícono de OpenVPN en la bandeja del sistema
echo 3. Selecciona "Import file..."
echo 4. Selecciona el archivo: qbtc-openvpn-config.ovpn
echo 5. Haz clic en "Connect"
echo 6. Ingresa las credenciales si es necesario:
echo    Usuario: qbtc_trading_system
echo    Contraseña: qbtc_181_43_212_196_parallel
echo.
echo NOTA: Si el servidor 181.43.212.196 no está disponible,
echo       necesitarás usar un servidor VPN que proporcione esa IP
echo       Ubicaciones recomendadas: Chile, Argentina, Brasil, México
echo.

echo Presiona Enter cuando hayas conectado la VPN...
pause >nul

echo.
echo Verificando cambio de IP...
for /f "tokens=*" %%i in ('curl -s ipinfo.io/ip') do set "NEW_IP=%%i"
echo Nueva IP: %NEW_IP%

if "%NEW_IP%"=="181.43.212.196" (
    echo.
    echo SUCCESS! IP cambiada exitosamente a: 181.43.212.196
    echo Sistema QBTC listo para ejecutar
    echo.
    echo Ejecutando sistema QBTC...
    node system-integrator.js
) else (
    echo.
    echo ADVERTENCIA: IP no cambio a la objetivo
    echo IP actual: %NEW_IP%
    echo IP objetivo: 181.43.212.196
    echo.
    echo Verifica la conexion VPN manualmente
)

:end
echo.
echo Estado del sistema:
echo - IP actual: %CURRENT_IP%
echo - IP objetivo: 181.43.212.196
echo - Sistema QBTC: Listo para ejecutar

pause
