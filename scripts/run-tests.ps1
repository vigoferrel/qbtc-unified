# Run Pester tests with minimal friction on Windows PowerShell 5.1 or PowerShell 7+
# - Ensures NuGet provider and Pester v5+
# - Uses process-scoped ExecutionPolicy bypass when invoked with -ExecutionPolicy Bypass
# - Runs tests in CI mode when supported

param(
    [string]$TestsPath = "tests"
)

$ErrorActionPreference = 'Stop'

# Ensure TLS 1.2 for PowerShellGet when downloading modules
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch { }

# Ensure NuGet provider for Install-Module
if (-not (Get-PackageProvider -Name NuGet -ListAvailable -ErrorAction SilentlyContinue)) {
    Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force | Out-Null
}

# Ensure PowerShellGet is recent enough (best-effort, ignore errors if not available)
try {
    if (-not (Get-Module -ListAvailable PowerShellGet | Where-Object Version -ge [version]'2.0.0')) {
        Install-Module PowerShellGet -Scope CurrentUser -Force -AllowClobber -ErrorAction SilentlyContinue
    }
} catch { }

# Ensure Pester v5+
$pester5 = Get-Module -ListAvailable -Name Pester | Where-Object { $_.Version -ge [version]'5.0.0' } | Select-Object -First 1
if (-not $pester5) {
    Install-Module Pester -Scope CurrentUser -Force -AllowClobber -SkipPublisherCheck -MinimumVersion 5.0.0
}

Import-Module Pester -MinimumVersion 5.0.0 -Force

# Prefer CI mode when available (Pester 5)
try {
    Invoke-Pester -Path $TestsPath -CI
} catch {
    # Fallback for environments where -CI switch is not recognized
    Invoke-Pester -Path $TestsPath
}

