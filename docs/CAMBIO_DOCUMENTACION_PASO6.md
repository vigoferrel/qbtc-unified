# Cambios de Documentación – Paso 6

Este documento resume los cambios realizados en el Paso 6: "Actualizar Documentación e Instrucciones de Uso". Se prioriza el uso de Windows/PowerShell conforme a la preferencia del usuario y no se incluyen emojis en el nuevo contenido.

Resumen de cambios
- README.md
  - Nueva sección: "Windows/PowerShell: Uso y Puertos sin Conflictos"
- Franja de puertos anti-conflictos ajustada a 18020–18022 (válidos TCP):
    - Dashboard: 18020
    - API: 18021
    - Métricas/Monitoreo: 18022
  - Comandos PowerShell para definir y persistir variables de entorno (Set-ExecutionPolicy, $env:*, setx)
  - Lanzamiento en segundo plano con Start-Process, ventana oculta y redirección de logs a ./logs
  - Verificación post-lanzamiento con Invoke-WebRequest y Test-NetConnection
  - Enlaces a nuevas guías detalladas en docs/

- docs/USO_WINDOWS_POWERSHELL.md (nuevo)
  - Guía de uso en Windows con PowerShell (primer plano/segundo plano)
  - Configuración de puertos 80200–80202 (vía .env y variables de entorno)
  - Comprobaciones rápidas de salud y tareas de parada/reinicio

- docs/TESTING_WINDOWS_POWERSHELL.md (nuevo)
  - Guía de pruebas con Pester en Windows/PowerShell
  - Casos de prueba de ejemplo para endpoints en puertos 80200–80202
  - Ejecución de pruebas y exportación de resultados

- docs/OPERACIONES_WINDOWS_POWERSHELL.md (nuevo)
  - Checklist post-lanzamiento (procesos, endpoints, puertos)
  - Validación de métricas estilo Prometheus, filtros qbtc_*
  - Revisión de logs y Event Log de Windows, diagnóstico de puertos y triage

- docs/CONFIGURACION_WINDOWS_POWERSHELL.md (nuevo)
  - Variables de entorno y ejemplos .env con puertos 80200–80202
  - Manejo de secretos con Microsoft.PowerShell.SecretManagement
  - Sugerencia de franjas por entorno (dev/staging/prod)

Notas importantes
- Preferencia del usuario: Todas las nuevas instrucciones están enfocadas a PowerShell en Windows. No se agregaron emojis al contenido nuevo.
- Scripts PowerShell: En este paso se documentó su uso previsto, pero no se han creado scripts .ps1. A petición del usuario, se podrán agregar scripts (Start-System.ps1, Stop-System.ps1, Test-All.ps1) en un paso posterior.

Próximos pasos sugeridos (fuera de este paso)
- Implementar scripts PowerShell equivalentes a los .bat existentes y actualizarlos para respetar los puertos 80200–80202 automáticamente.
- Integrar pruebas Pester en CI y publicar artefactos de resultados.

