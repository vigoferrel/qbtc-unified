# Guía de Uso en Windows con PowerShell

Esta guía prioriza PowerShell conforme a las reglas de preferencia del usuario (PowerShell como CLI). No se utilizan emojis.

Índice
- Prerrequisitos
- Configuración de entorno
- Lanzamiento del sistema (primer plano y segundo plano)
- Configuración de puertos anti-conflictos (franja 80200+)
- Parada y reinicio
- Verificación rápida de salud

Prerrequisitos
- Windows 10/11
- PowerShell 5.1 o PowerShell 7+
- Git instalado y en PATH
- Node.js compatible con el proyecto (ver README principal)

Configuración de entorno
1) Permitir ejecución de scripts para el usuario actual:
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
2) Clonar e instalar dependencias (adaptar rutas según estructura actual):
   # Quantum Core
   Set-Location quantum-core
   npm install
   Set-Location ..
   # Coordinator
   Set-Location coordinator
   npm install
   Set-Location ..
3) Variables de entorno y secretos (ejemplos):
   # Sesión actual
   $env:BINANCE_API_KEY = "<tu_api_key>"
   $env:BINANCE_API_SECRET = "<tu_api_secret>"
   # Persistente para nuevas sesiones
   setx BINANCE_API_KEY "<tu_api_key>"
   setx BINANCE_API_SECRET "<tu_api_secret>"

Lanzamiento del sistema
- Modo Universal (todos los símbolos) usando los .bat existentes desde PowerShell:
  Start-Process -FilePath "cmd.exe" -ArgumentList "/c","./launch-quantum-universal.bat"
- Modo Clásico:
  Start-Process -FilePath "cmd.exe" -ArgumentList "/c","./launch-qbtc-unified.bat"

Primer plano (visible en la consola actual)
- También puedes ejecutar directamente en la sesión actual:
  cmd /c ./launch-quantum-universal.bat

Segundo plano (no bloquea la consola)
- Oculto, con logs redirigidos a archivo:
  $log = Join-Path $PWD "logs\universal_$(Get-Date -Format yyyyMMdd_HHmmss).log"
  New-Item -ItemType Directory -Path (Split-Path $log) -Force | Out-Null
  Start-Process -FilePath "cmd.exe" -ArgumentList "/c","./launch-quantum-universal.bat" -WindowStyle Hidden -RedirectStandardOutput $log -RedirectStandardError $log

Configuración de puertos anti-conflictos (franja 80200+)
- Asigna puertos específicos para evitar conflictos con servicios comunes:
  - Dashboard: 80200
  - API: 80201
  - Monitoreo/Métricas: 80202
- Si el proyecto usa .env, añade las claves en quantum-core/.env (o el archivo correspondiente):
  DASHBOARD_PORT=80200
  API_PORT=80201
  METRICS_PORT=80202
- Alternativamente, establece variables de entorno en PowerShell antes del lanzamiento:
  $env:DASHBOARD_PORT = "80200"
  $env:API_PORT = "80201"
  $env:METRICS_PORT = "80202"
  # Para persistir
  setx DASHBOARD_PORT 80200
  setx API_PORT 80201
  setx METRICS_PORT 80202

Parada y reinicio
- Identificar procesos Node asociados (ejemplo):
  Get-Process node | Select-Object Id,ProcessName,StartTime | Sort-Object StartTime -Descending | Select-Object -First 5
- Finalizar por Id:
  Stop-Process -Id <PID> -Force
- Reiniciar repitiendo el paso de lanzamiento.

Verificación rápida de salud
- Endpoints esperados (ajustados a la franja 80200):
  - Dashboard: http://localhost:80200
  - API: http://localhost:80201
  - Monitoreo: http://localhost:80202/metrics
- Comprobación con PowerShell:
  Invoke-WebRequest -Uri http://localhost:80200 -UseBasicParsing | Select-Object StatusCode
  Invoke-WebRequest -Uri http://localhost:80201/health -UseBasicParsing | Select-Object StatusCode
  Invoke-WebRequest -Uri http://localhost:80202/metrics -UseBasicParsing | Select-Object StatusCode
- Verificar puertos abiertos:
  Test-NetConnection -ComputerName localhost -Port 80200
  Test-NetConnection -ComputerName localhost -Port 80201
  Test-NetConnection -ComputerName localhost -Port 80202

