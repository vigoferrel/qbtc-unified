# Guía Consolidada Windows/PowerShell

Esta guía unifica uso, configuración, operación y pruebas en Windows con PowerShell.

1) Requisitos
- Windows 10/11, PowerShell 5.1+ o PowerShell 7+
- Node.js LTS
- Permisos para ejecutar scripts: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

2) Puertos anti-conflictos (recomendado)
- Dashboard: 18020
- API: 18021
- Métricas: 18022
Puedes forzar estos valores con Start-System.ps1 -UseDefaultPorts802xx (ajustado a un rango válido TCP)

3) Variables de entorno y .env
- Coloca tus claves en .env (no comillas si no son necesarias):
  BINANCE_API_KEY=...
  BINANCE_SECRET_KEY=...
  BINANCE_TESTNET=true
- Start-System.ps1 -EnvFile ./.env cargará automáticamente el archivo si existe

4) Iniciar el sistema
- Primer plano:
  ./scripts/Start-System.ps1 -Foreground -UseDefaultPorts802xx
- Segundo plano (recomendado para producción local):
  ./scripts/Start-System.ps1 -Background -UseDefaultPorts802xx
  Logs en ./logs con meta JSON (PID, puertos)

5) Verificaciones rápidas
- Métricas: http://localhost:18022/metrics
- Si 403, añade tu IP a la whitelist de métricas (config) o revisa puertos
- Revisa logs en ./logs

6) Detener el sistema
- Parada amigable:
  ./scripts/Stop-System.ps1
- Forzar detención si persiste:
  ./scripts/Stop-System.ps1 -Force

7) Pruebas
- Ejecutar Pester v5 automáticamente:
  ./scripts/Test-All.ps1
- Artefactos en ./test-results (NUnit XML y transcript)

8) Diagnóstico Binance (opcional si tu repo lo incluye)
- Ejecutar script de validación:
  ./scripts/Validate-BinancePermissions.ps1
- o vía endpoint del servidor /quantum/binance/ps-validate

9) Accesos directos en el Escritorio
- Ejecuta:
  ./scripts/Create-DesktopShortcuts.ps1
- Crea accesos directos: "QBTC Start" (segundo plano 802xx) y "QBTC Stop"

10) Buenas prácticas
- No expongas secretos en consola
- Usa .env y SecretManagement cuando sea posible
- Mantén puertos 802xx libres o ajusta variables DASHBOARD_PORT, API_PORT, METRICS_PORT

