# Configuración y Secretos en Windows/PowerShell

Esta guía resume cómo definir configuración por entorno y gestionar secretos en Windows, priorizando el uso de PowerShell. No se utilizan emojis.

Índice
- Variables de entorno
- Archivos .env
- Secretos
- Perfiles por entorno

Variables de entorno
- Sesión actual:
  $env:ENVIRONMENT = "dev"
  $env:DASHBOARD_PORT = "80200"
  $env:API_PORT = "80201"
  $env:METRICS_PORT = "80202"
- Persistentes (nuevas sesiones):
  setx ENVIRONMENT dev
  setx DASHBOARD_PORT 80200
  setx API_PORT 80201
  setx METRICS_PORT 80202

Archivos .env
- Si los componentes Node.js usan dotenv, crea/edita quantum-core/.env y otros módulos:
  ENVIRONMENT=dev
  DASHBOARD_PORT=80200
  API_PORT=80201
  METRICS_PORT=80202
  BINANCE_API_KEY=
  BINANCE_API_SECRET=

Secretos
- Evita colocar secretos en texto plano.
- Usa Microsoft.PowerShell.SecretManagement cuando sea posible:
  Install-Module Microsoft.PowerShell.SecretManagement -Scope CurrentUser -Force
  Register-SecretVault -Name QBTC -ModuleName Microsoft.PowerShell.SecretStore -DefaultVault
  Set-Secret -Name BINANCE_API_KEY -Secret (Read-Host -AsSecureString)
  Set-Secret -Name BINANCE_API_SECRET -Secret (Read-Host -AsSecureString)
  # Recuperación en tiempo de ejecución
  $BINANCE_API_KEY = (Get-Secret -Name BINANCE_API_KEY)
  $BINANCE_API_SECRET = (Get-Secret -Name BINANCE_API_SECRET)

Perfiles por entorno
- Usa perfiles por variable ENVIRONMENT para dev/staging/prod y ajusta puertos si corren en la misma máquina:
  dev: 80200-80202
  staging: 80300-80302
  prod: 80400-80402

