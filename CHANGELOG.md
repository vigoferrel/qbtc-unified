# CHANGELOG

All notable changes to this repository are documented here.

## 2025-08-08
- Added Windows/PowerShell operational scripts:
  - scripts/Start-System.ps1: Foreground/background launcher with anti-conflict port defaults (18020–18022), .env loading, logging, and metrics health check
- Corrected documentation and scripts to use valid TCP port range (18020–18022 instead of 80200–80202)
  - scripts/Stop-System.ps1: Graceful stop with PID discovery via meta logs or process command line
  - scripts/Test-All.ps1: Pester v5 bootstrapper and unified test runner with artifacts
- Added documentation consolidation for Windows users:
  - docs/INDEX.md: Documentation entrypoint and map
  - docs/README_WINDOWS_CONSOLIDADO.md: End-to-end Windows/PowerShell guide
- Added step-specific changelog: docs/CAMBIO_DOCUMENTACION_PASO6.md

## 2025-08-07
- Added Quantum diagnostics and Windows/PowerShell validations:
  - scripts/Validate-BinancePermissions.ps1 with robust connectivity, IP whitelist, and futures permission checks
  - Server endpoint /quantum/binance/ps-validate to run diagnostics and return JSON
- Introduced metrics server and universal system launcher enhancements:
  - quantum-core/metrics-server.js providing /metrics and /health with IP whitelist
  - quantum-core/universal-system-launcher.js now starts metrics server, verifies endpoint, and prints actionable logs
  - quantum-core/config/config.json includes metrics_port and metrics_ip_whitelist
- Windows documentation added:
  - docs/USO_WINDOWS_POWERSHELL.md: Execution policy, env vars, running modes, port ranges, health checks
  - docs/TESTING_WINDOWS_POWERSHELL.md: Pester tests usage, CI mode, artifacts
  - docs/OPERACIONES_WINDOWS_POWERSHELL.md: Ops procedures, troubleshooting, metrics
  - docs/CONFIGURACION_WINDOWS_POWERSHELL.md: Config and secret management on Windows

## 2025-08-06
- README updated with Windows/PowerShell section covering anti-conflict port range (80200–80202), background launching, and health checks
- Initial Windows-friendly instructions to avoid port conflicts and ensure smooth operations

