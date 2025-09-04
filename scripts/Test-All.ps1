<#
.SYNOPSIS
  Run repository tests on Windows/PowerShell with Pester v5+.

.DESCRIPTION
  - Ensures TLS 1.2 and NuGet provider availability.
  - Installs Pester v5 (CurrentUser scope) if missing, without prompts.
  - Runs tests in CI mode when $env:CI is defined, otherwise normal mode.
  - Exits with non-zero code on failures (useful for CI/CD).

.PARAMETER Path
  Test path to run. Default: tests directory if exists; otherwise, repository root.

.PARAMETER OutputDir
  Where to write test result artifacts (NUnit XML and text log). Default: ./test-results

.EXAMPLE
  ./scripts/Test-All.ps1

.EXAMPLE
  ./scripts/Test-All.ps1 -Path ./quantum-core/tests
#>
param(
  [string]$Path,
  [string]$OutputDir = './test-results'
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

function Ensure-NuGetProvider {
  try {
    $prov = Get-PackageProvider -Name NuGet -ListAvailable -ErrorAction SilentlyContinue
    if (-not $prov) {
      Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force -Scope CurrentUser | Out-Null
    }
  } catch {
    Write-Warning "No se pudo instalar el proveedor NuGet: $($_.Exception.Message)"
  }
}

function Ensure-PesterV5 {
  $pester = Get-Module -ListAvailable -Name Pester | Sort-Object Version -Descending | Select-Object -First 1
  if (-not $pester -or $pester.Version.Major -lt 5) {
    try {
      Install-Module Pester -MinimumVersion 5.0.0 -Scope CurrentUser -Force -SkipPublisherCheck -AllowClobber
    } catch {
      Write-Warning "Fallo al instalar Pester v5: $($_.Exception.Message)"
    }
  }
  Import-Module Pester -MinimumVersion 5.0.0 -Force
}

function Ensure-Directory {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path | Out-Null
  }
}

Set-Tls12IfNeeded
Ensure-NuGetProvider
Ensure-PesterV5

if (-not $Path) {
  if (Test-Path -LiteralPath './tests') { $Path = './tests' } else { $Path = '.' }
}

Ensure-Directory -Path $OutputDir
$xmlOut = Join-Path $OutputDir 'TestResults.xml'
$txtOut = Join-Path $OutputDir 'TestResults.txt'

$ci = [bool]$env:CI

$configuration = New-PesterConfiguration
$configuration.Run.Path = $Path
$configuration.Run.Exit = $true
$configuration.Run.Throw = $false
$configuration.Output.Verbosity = if ($ci) { 'Minimal' } else { 'Normal' }
$configuration.TestResult.Enabled = $true
$configuration.TestResult.OutputPath = $xmlOut
$configuration.TestResult.OutputFormat = 'NUnitXml'

# Run tests and tee output to file
try {
  Invoke-Pester -Configuration $configuration 2>&1 | Tee-Object -FilePath $txtOut
} catch {
  Write-Error $_
  exit 1
}

