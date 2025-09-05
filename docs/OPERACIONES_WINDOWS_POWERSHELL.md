# Operaciones en Windows/PowerShell: Métricas y Errores

Esta guía detalla cómo validar el sistema tras el lanzamiento, consultar métricas y diagnosticar errores usando PowerShell, con puertos en la franja 80200.

Índice
- Checklist post-lanzamiento
- Métricas
- Logs y errores
- Diagnóstico de red y puertos
- Procedimiento de triage

Checklist post-lanzamiento
1) Confirmar procesos en ejecución
   Get-Process node | Sort-Object StartTime -Descending | Select-Object -First 10 Id,ProcessName,StartTime
2) Validar endpoints
   Invoke-WebRequest -Uri http://localhost:80200 -UseBasicParsing | Select-Object StatusCode
   Invoke-WebRequest -Uri http://localhost:80201/health -UseBasicParsing | Select-Object StatusCode
   Invoke-WebRequest -Uri http://localhost:80202/metrics -UseBasicParsing | Select-Object StatusCode
3) Verificar puertos
   foreach ($p in 80200,80201,80202) { Test-NetConnection -ComputerName localhost -Port $p }

Métricas
- Endpoint Prometheus (ejemplo): http://localhost:80202/metrics
- Buscar prefijos del sistema (ej.: qbtc_)
  $metrics = Invoke-WebRequest -Uri http://localhost:80202/metrics -UseBasicParsing
  $metrics.Content -split "`n" | Where-Object { $_ -match '^qbtc_' } | Select-Object -First 20
- Ejemplos de métricas deseadas (adaptar):
  - qbtc_requests_total
  - qbtc_errors_total
  - qbtc_latency_seconds_bucket

Logs y errores
- Redirigir logs al lanzar en segundo plano (ver README)
- Revisar últimos 2000 caracteres del log más reciente:
  $lastLog = Get-ChildItem -Path .\logs -Filter *.log | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if ($lastLog) { Get-Content $lastLog.FullName -Tail 200 }
- Windows Event Log (si aplica):
  Get-WinEvent -LogName Application -MaxEvents 50 | Where-Object { $_.Message -match 'QBTC|quantum|coordinator' }

Diagnóstico de red y puertos
- Comprobar quién ocupa un puerto:
  Get-NetTCPConnection -LocalPort 80200 -State Listen | Select-Object LocalAddress,LocalPort,OwningProcess
  Get-Process -Id (Get-NetTCPConnection -LocalPort 80200 -State Listen).OwningProcess
- Liberar puerto (con cuidado):
  Stop-Process -Id <PID> -Force

Procedimiento de triage
1) Reproducir el error y capturar logs y métricas relevantes
2) Identificar si el fallo es de red (puertos), aplicación (stacktrace), o dependencia (API externa)
3) Mitigar:
   - Reinicio controlado del componente afectado
   - Aumentar nivel de logging temporalmente
   - Ajustar límites de recursos
4) Registrar el incidente (fecha, pasos, métricas afectadas) y la resolución aplicada

