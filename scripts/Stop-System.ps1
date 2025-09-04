<#
.SYNOPSIS
  Stop running system processes launched by Start-System.ps1.

.DESCRIPTION
  - Finds Node.js processes associated with quantum-core/universal-system-launcher.js.
  - Attempts graceful termination first; if not successful, can force kill with -Force.
  - Optionally reads meta JSON files in the log directory to target specific PIDs.

.PARAMETER LogDir
  Directory where meta JSONs are stored. Defaults to ./logs

.PARAMETER Force
  If set, force kill remaining processes.

.PARAMETER Pid
  Optional specific PID to stop. Overrides discovery by meta files.

.EXAMPLE
  ./scripts/Stop-System.ps1

.EXAMPLE
  ./scripts/Stop-System.ps1 -Force

.EXAMPLE
  ./scripts/Stop-System.ps1 -Pid 12345
#>
param(
  [string]$LogDir = "./logs",
  [switch]$Force,
  [int]$Pid
)

$ErrorActionPreference = 'Stop'

function Get-TargetPids {
  param([string]$LogDir,[int]$Pid)
  $pids = @()
  if ($Pid) { return ,$Pid }
  if (Test-Path -LiteralPath $LogDir) {
    $metaFiles = Get-ChildItem -LiteralPath $LogDir -Filter 'system_*.meta.json' -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
    foreach ($f in $metaFiles) {
      try {
        $obj = Get-Content -LiteralPath $f.FullName -Raw | ConvertFrom-Json
        if ($obj.pid) { $pids += [int]$obj.pid }
      } catch {}
    }
  }
  if (-not $pids) {
    # Fallback: any node running our launcher path
    $launcher = "quantum-core/universal-system-launcher.js"
    $procs = Get-CimInstance Win32_Process | Where-Object { $_.Name -match '^node(\.exe)?$' -and $_.CommandLine -like "*${launcher.Replace('/','\')}*" }
    $pids = $procs.ProcessId
  }
  return $pids | Sort-Object -Unique
}

$pids = Get-TargetPids -LogDir $LogDir -Pid $Pid
if (-not $pids) {
  Write-Host "No se encontraron procesos para detener."
  return
}

Write-Host "Procesos objetivo: $($pids -join ', ')"

foreach ($id in $pids) {
  try {
    $p = Get-Process -Id $id -ErrorAction Stop
  } catch {
    Write-Warning "PID $id no existe."
    continue
  }

  Write-Host "Deteniendo PID $id de forma amigable..."
  try {
    # Try CTRL+C via Stop-Process -Id with -PassThru check
    Stop-Process -Id $id -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
  } catch {}

  $still = $false
  try { Get-Process -Id $id -ErrorAction Stop | Out-Null; $still = $true } catch { $still = $false }

  if ($still) {
    if ($Force) {
      Write-Warning "Forzando terminación de PID $id"
      Stop-Process -Id $id -Force -ErrorAction SilentlyContinue
    } else {
      Write-Warning "PID $id sigue activo. Reintente con -Force si es necesario."
    }
  } else {
    Write-Host "PID $id detenido."
  }
}

