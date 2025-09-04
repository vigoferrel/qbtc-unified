<#
.SYNOPSIS
  Start the system in foreground or background with Windows-friendly logging and port configuration.

.DESCRIPTION
  - Loads environment from a .env file (if provided) and merges with current process env.
  - Applies an anti-conflict port range (80200+) optionally, or uses provided parameters.
  - Enforces TLS 1.2 for PowerShell 5.1 compatibility with HTTPS APIs.
  - Starts the Node.js universal launcher in the foreground, or as a background process with hidden window.
  - Redirects stdout/stderr to timestamped log files and writes a meta JSON for auditing in background mode.
  - Performs quick post-launch health checks for the metrics endpoint.

.PARAMETER Foreground
  Run in foreground (default). If not specified, use -Background to run detached.

.PARAMETER Background
  Run as a detached background process with hidden window style and log redirection.

.PARAMETER EnvFile
  Optional path to a .env file. Defaults to ./.env if present.

.PARAMETER LogDir
  Directory to write logs (background mode). Defaults to ./logs.

.PARAMETER UseDefaultPorts802xx
  If set, sets default ports Dashboard=80200, API=80201, Metrics=80202 unless already defined in environment.

.PARAMETER DashboardPort
  Override dashboard port.

.PARAMETER ApiPort
  Override API port.

.PARAMETER MetricsPort
  Override metrics port. If not set and not using 802xx defaults, falls back to 9100.

.PARAMETER ExtraArgs
  Additional arguments passed through to the Node launcher.

.EXAMPLE
  ./scripts/Start-System.ps1 -Background -UseDefaultPorts802xx

.EXAMPLE
  ./scripts/Start-System.ps1 -Foreground -EnvFile .env.dev -MetricsPort 80202

.NOTES
  - Requires Node.js. The launcher path defaults to quantum-core/universal-system-launcher.js
  - Does not echo secrets. Environment variables are inherited by the spawned process.
#>
param(
  [switch]$Foreground,
  [switch]$Background,
  [string]$EnvFile = "./.env",
  [string]$LogDir = "./logs",
  [switch]$UseDefaultPorts802xx,
  [int]$DashboardPort,
  [int]$ApiPort,
  [int]$MetricsPort,
  [string[]]$ExtraArgs
)

$ErrorActionPreference = 'Stop'

function Set-Tls12IfNeeded {
  try {
    if ([Net.ServicePointManager]::SecurityProtocol -band [Net.SecurityProtocolType]::Tls12) { return }
    [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
  } catch {
    Write-Warning "No se pudo forzar TLS 1.2: $($_.Exception.Message)"
  }
}

function Import-EnvFile {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) { return }
  Get-Content -LiteralPath $Path | ForEach-Object {
    $line = $_.Trim()
    if ($line.Length -eq 0) { return }
    if ($line.StartsWith('#')) { return }
    $idx = $line.IndexOf('=')
    if ($idx -lt 1) { return }
    $key = $line.Substring(0, $idx).Trim()
    $val = $line.Substring($idx + 1).Trim()
    # Remove surrounding quotes if present (PowerShell 5.1 safe)
    if ($val.Length -ge 2) {
      $first = $val.Substring(0,1)
      $last  = $val.Substring($val.Length-1,1)
      if ($first -eq '"' -and $last -eq '"') { $val = $val.Substring(1, $val.Length-2) }
      elseif ($first -eq "'" -and $last -eq "'") { $val = $val.Substring(1, $val.Length-2) }
    }
    if ($key) { Set-Item -Path "Env:$key" -Value $val -Force | Out-Null }
  }
}

function Ensure-Directory {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path | Out-Null
  }
}

function Get-Timestamp { Get-Date -Format 'yyyyMMdd_HHmmss' }

function Resolve-Ports {
  param([switch]$Use802xx,[int]$Dash,[int]$Api,[int]$Metrics)
  # Environment first
  $resolved = [ordered]@{}
  # NOTE: TCP port range is 1-65535. Use 18020-18022 as anti-conflict defaults.
  $resolved.Dashboard = if ($Dash) { $Dash } elseif ($env:DASHBOARD_PORT) { [int]$env:DASHBOARD_PORT } else { if ($Use802xx) { 18020 } else { 3000 } }
  $resolved.API       = if ($Api)  { $Api  } elseif ($env:API_PORT)       { [int]$env:API_PORT }       else { if ($Use802xx) { 18021 } else { 8080 } }
  $resolved.Metrics   = if ($Metrics) { $Metrics } elseif ($env:METRICS_PORT) { [int]$env:METRICS_PORT } else { if ($Use802xx) { 18022 } else { 9100 } }
  return $resolved
}

function Test-MetricsEndpoint {
  param([int]$Port)
  try {
    $uri = "http://localhost:$Port/metrics"
    $resp = Invoke-WebRequest -UseBasicParsing -Uri $uri -Method GET -TimeoutSec 5
    return ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 300)
  } catch {
    return $false
  }
}

# Entry
Set-Tls12IfNeeded

# Load .env if provided and exists
if ($EnvFile -and (Test-Path -LiteralPath $EnvFile)) {
  Write-Host "Cargando variables desde $EnvFile"
  Import-EnvFile -Path $EnvFile
}

# Apply 802xx default ports if requested
$ports = Resolve-Ports -Use802xx:$UseDefaultPorts802xx -Dash:$DashboardPort -Api:$ApiPort -Metrics:$MetricsPort
$env:DASHBOARD_PORT = $ports.Dashboard
$env:API_PORT       = $ports.API
$env:METRICS_PORT   = $ports.Metrics

# Node launcher (multi-path discovery)
$candidateLaunchers = @(
  "quantum-core/universal-system-launcher.js",
  "qbtc-unified-server.js",
  "QBTC-VIGOLEONROCKS-UNIFIED/qbtc-v3-quantum-revolution.js"
)
$launcher = $null
foreach ($c in $candidateLaunchers) {
  if (Test-Path -LiteralPath $c) { $launcher = $c; break }
}
if (-not $launcher) {
  throw "No se encontró un launcher. Busqué: $($candidateLaunchers -join ', '). Ajuste la ruta o cree uno de estos archivos."
}

# Basic env checks (no echo of secret values)
if (-not $env:BINANCE_API_KEY)   { Write-Warning "BINANCE_API_KEY no está definido en el entorno." }
if (-not $env:BINANCE_SECRET_KEY){ Write-Warning "BINANCE_SECRET_KEY no está definido en el entorno." }

# Compose node arguments
$nodeArgs = @($launcher)
if ($ExtraArgs) { $nodeArgs += $ExtraArgs }

if ($Background -and -not $Foreground) {
  Ensure-Directory -Path $LogDir
  $ts = Get-Timestamp
  $stdout = Join-Path $LogDir "system_$ts.out.log"
  $stderr = Join-Path $LogDir "system_$ts.err.log"
  $meta   = Join-Path $LogDir "system_$ts.meta.json"

  Write-Host "Iniciando en segundo plano (puertos: dashboard=$($ports.Dashboard), api=$($ports.API), metrics=$($ports.Metrics))"
  # Resolve Node.js executable path for reliability
  $nodeExe = $null
  try { $nodeCmd = Get-Command node -ErrorAction Stop; if ($nodeCmd -and $nodeCmd.Source) { $nodeExe = $nodeCmd.Source } } catch {}
  if (-not $nodeExe) { throw "Node.js no fue encontrado en PATH. Instala Node.js o añade su carpeta a PATH y reintenta." }

  # Build argument list with proper quoting
  $argList = @()
  $argList += (Resolve-Path -LiteralPath $launcher).Path
  if ($ExtraArgs) { $argList += $ExtraArgs }

  # Start hidden background process with output redirected to files
  $proc = Start-Process -FilePath $nodeExe -ArgumentList $argList -WindowStyle Hidden -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru

  Start-Sleep -Seconds 2

  # Write meta
  $metaObj = [ordered]@{
    started_at    = (Get-Date).ToString('o')
    pid           = $proc.Id
    launcher      = (Resolve-Path -LiteralPath $launcher).Path
    stdout_log    = (Resolve-Path -LiteralPath $stdout).Path
    stderr_log    = (Resolve-Path -LiteralPath $stderr).Path
    ports         = $ports
    env_summary   = @{
      DASHBOARD_PORT = $env:DASHBOARD_PORT
      API_PORT       = $env:API_PORT
      METRICS_PORT   = $env:METRICS_PORT
    }
  }
  $metaObj | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $meta -Encoding UTF8
  Write-Host "PID: $($proc.Id) | stdout: $stdout | stderr: $stderr"

  # Quick health check for metrics
  Start-Sleep -Seconds 2
  if (Test-MetricsEndpoint -Port $ports.Metrics) {
    Write-Host "Metrics OK en http://localhost:$($ports.Metrics)/metrics"
  } else {
    Write-Warning "No se pudo verificar /metrics en el puerto $($ports.Metrics). Revise whitelist o conflictos de puerto."
  }

} else {
  # Foreground
  Write-Host "Iniciando en primer plano (Ctrl+C para detener). Puertos: dashboard=$($ports.Dashboard), api=$($ports.API), metrics=$($ports.Metrics)"
  # Resolve Node path for reliability
  $nodeExe = $null
  try { $nodeCmd = Get-Command node -ErrorAction Stop; if ($nodeCmd -and $nodeCmd.Source) { $nodeExe = $nodeCmd.Source } } catch {}
  if (-not $nodeExe) { throw "Node.js no fue encontrado en PATH. Instala Node.js o añade su carpeta a PATH y reintenta." }
  # Use direct exec so the process receives Ctrl+C
  & $nodeExe @nodeArgs
}

