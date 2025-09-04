<#
.SYNOPSIS
  Create Desktop shortcuts to Start and Stop the system on Windows.

.DESCRIPTION
  - Detects the Desktop path for the current user
  - Creates two .lnk shortcuts:
    * QBTC Start (Background 802xx)
    * QBTC Stop
  - Shortcuts launch PowerShell non-interactively and call the scripts in this repo
  - No secrets are printed; environment is inherited by PowerShell

.NOTES
  - Run this script once. You can delete/recreate shortcuts anytime.
#>
[CmdletBinding()]
param(
  [string]$RepoRoot = (Resolve-Path ".").Path,
  [string]$DesktopPath = [Environment]::GetFolderPath('Desktop'),
  [switch]$Overwrite
)

$ErrorActionPreference = 'Stop'

function Get-PwshPath {
  # Prefer pwsh.exe if available, else powershell.exe
  try {
    $cmd = Get-Command pwsh -ErrorAction Stop
    if ($cmd -and $cmd.Source) { return $cmd.Source }
  } catch {}
  return (Get-Command powershell -ErrorAction Stop).Source
}

function New-Shortcut {
  param(
    [string]$Path,
    [string]$Target,
    [string]$Arguments,
    [string]$WorkingDirectory,
    [string]$Description,
    [string]$IconLocation
  )
  if ((Test-Path -LiteralPath $Path) -and -not $Overwrite) {
    Write-Host "Existe: $Path (usa -Overwrite para reemplazar)"
    return
  }
  $shell = New-Object -ComObject WScript.Shell
  $sc = $shell.CreateShortcut($Path)
  $sc.TargetPath = $Target
  $sc.Arguments = $Arguments
  $sc.WorkingDirectory = $WorkingDirectory
  if ($Description) { $sc.Description = $Description }
  if ($IconLocation) { $sc.IconLocation = $IconLocation }
  $sc.Save()
  Write-Host "Creado acceso directo: $Path"
}

# Resolve script paths
$startScript = Join-Path $RepoRoot 'scripts/Start-System.ps1'
$stopScript  = Join-Path $RepoRoot 'scripts/Stop-System.ps1'

if (-not (Test-Path -LiteralPath $startScript)) { throw "No se encontró $startScript" }
if (-not (Test-Path -LiteralPath $stopScript))  { throw "No se encontró $stopScript" }

$pwshPath = Get-PwshPath

# Shortcut 1: Start (background 802xx)
$startLnk = Join-Path $DesktopPath 'QBTC Start (Background).lnk'
$startArgs = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$startScript`" -Background -UseDefaultPorts802xx"
New-Shortcut -Path $startLnk -Target $pwshPath -Arguments $startArgs -WorkingDirectory $RepoRoot -Description 'Inicia QBTC en segundo plano (puertos 18020-18022)' -IconLocation "$pwshPath,0"

# Shortcut 2: Stop
$stopLnk = Join-Path $DesktopPath 'QBTC Stop.lnk'
$stopArgs = "-NoProfile -ExecutionPolicy Bypass -File `"$stopScript`""
New-Shortcut -Path $stopLnk -Target $pwshPath -Arguments $stopArgs -WorkingDirectory $RepoRoot -Description 'Detiene QBTC (gracioso, con opción -Force manual)' -IconLocation "$pwshPath,0"

