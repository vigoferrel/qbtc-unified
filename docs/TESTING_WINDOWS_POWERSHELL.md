# Pruebas en Windows con PowerShell (Pester)

Esta guía explica cómo ejecutar y escribir pruebas en Windows con PowerShell, priorizando Pester. No se utilizan emojis.

Índice
- Requisitos
- Estructura de pruebas
- Ejecución de pruebas
- Ejemplos de casos de prueba
- Métricas de pruebas y cobertura
- Integración en CI (opcional)

Requisitos
- PowerShell 5.1 o 7+
- Pester
  Install-Module Pester -Scope CurrentUser -Force

Estructura de pruebas
- Ubicación sugerida: tests/ o en carpetas específicas del módulo (por ejemplo quantum-core/tests)
- Nombres: *.Tests.ps1 para que Pester los detecte automáticamente

Ejecución de pruebas
- Desde la raíz del repo o la carpeta con pruebas:
  Invoke-Pester -Output Detailed -PassThru
- Con reporte NUnit (útil en CI):
  $result = Invoke-Pester -Output Detailed -PassThru -CI
  $result | Export-Clixml ./.pester/last_run.xml

Ejemplos de casos de prueba
- Salud de endpoints tras el lanzamiento (ajustado a la franja 80200):
  Describe "Endpoints en franja 80200" {
    It "Dashboard responde 200" {
      $r = Invoke-WebRequest -Uri "http://localhost:80200" -UseBasicParsing
      $r.StatusCode | Should -Be 200
    }
    It "API /health responde 200" {
      $r = Invoke-WebRequest -Uri "http://localhost:80201/health" -UseBasicParsing
      $r.StatusCode | Should -Be 200
    }
    It "Métricas expuestas" {
      $r = Invoke-WebRequest -Uri "http://localhost:80202/metrics" -UseBasicParsing
      $r.StatusCode | Should -Be 200
      $r.Content | Should -Match "^# HELP|^# TYPE|^qbtc_"
    }
  }

Métricas de pruebas y cobertura
- Si se usa código PowerShell propio, considera Pester + PSCodeCov (o cobertura del runtime de Node/otros componentes por su propia herramienta).
- Guarda artefactos en ./.pester y publica en CI si aplica.

Integración en CI (opcional)
- Ejecuta Invoke-Pester como paso de prueba y recoge el artefacto .xml/.clixml.

