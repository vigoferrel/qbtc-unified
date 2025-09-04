<#!
.SYNOPSIS
    Robust background launcher for NxN on Windows.

.DESCRIPTION
    Starts a specified executable/command for NxN in the background with:
      - Hidden window
      - Working directory control
      - Stdout/stderr redirection to rotating log files
      - Pre-launch API key validation (required env var not empty)
      - Optional custom validation command

.PARAMETER Executable
    The path to the executable or command to start (e.g., node, python, nxn.exe).

.PARAMETER Arguments
    Arguments to pass through to the executable.

.PARAMETER WorkingDirectory
    Working directory to set for the process. Defaults to the current directory.

.PARAMETER LogDirectory
    Directory to write logs to. Defaults to ./logs.

.PARAMETER ApiKeyEnvVar
    Name of the environment variable that contains the required API key (e.g., NXN_API_KEY).

.PARAMETER ValidateCommand
    Optional command (string) to run for deeper API key validation before launch.
    Example: "powershell -NoProfile -File scripts/Validate-BinancePermissions.ps1"

.PARAMETER ProcessNameTag
    Optional short name to tag the log files with (e.g., "nxn-core"). If not set,
    a sanitized version of the Executable will be used.

.EXAMPLE
    # Launch a Node-based NxN service
    .\scripts\Start-NxN.ps1 -Executable "node" -Arguments "server.js" -ApiKeyEnvVar "NXN_API_KEY" -WorkingDirectory "." -LogDirectory ".\logs" -ProcessNameTag "nxn-server"

.EXAMPLE
    # Launch with an extra validation step
    .\scripts\Start-NxN.ps1 -Executable "python" -Arguments "-m nxn.app" -ApiKeyEnvVar "NXN_API_KEY" -ValidateCommand "powershell -NoProfile -File scripts/Validate-BinancePermissions.ps1" -ProcessNameTag "nxn-app"

.NOTES
    This script is compatible with Windows PowerShell 5.1 and PowerShell 7+.
    It uses Start-Process -WindowStyle Hidden and redirects stdout/stderr to files.
#>

[CmdletBinding(SupportsShouldProcess=$true, ConfirmImpact='Low')]
param(
    [Parameter(Mandatory=$true)]
    [string]$Executable,

    [Parameter(Mandatory=$false)]
    [string]$Arguments,

    [Parameter(Mandatory=$false)]
    [string]$WorkingDirectory = (Get-Location).Path,

    [Parameter(Mandatory=$false)]
    [string]$LogDirectory = (Join-Path -Path (Get-Location).Path -ChildPath 'logs'),

    [Parameter(Mandatory=$true)]
    [string]$ApiKeyEnvVar,

    [Parameter(Mandatory=$false)]
    [string]$ValidateCommand,

    [Parameter(Mandatory=$false)]
    [string]$ProcessNameTag
)

function New-DirectoryIfMissing {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Get-SafeTagFromExecutable {
    param([string]$Exe)
    $base = Split-Path -Leaf $Exe
    # Replace non-alphanumeric with hyphens
    return ($base -replace '[^a-zA-Z0-9]+','-').Trim('-')
}

function Test-ApiKeyPresent {
    param([string]$EnvVarName)
    try {
        $val = [Environment]::GetEnvironmentVariable($EnvVarName, 'Process')
        if ([string]::IsNullOrWhiteSpace($val)) {
            # Also check User and Machine scopes to be thorough
            $val = [Environment]::GetEnvironmentVariable($EnvVarName, 'User')
        }
        if ([string]::IsNullOrWhiteSpace($val)) {
            $val = [Environment]::GetEnvironmentVariable($EnvVarName, 'Machine')
        }
        return -not [string]::IsNullOrWhiteSpace($val)
    } catch {
        return $false
    }
}

try {
    # 1) Validate required API key env var is present
    if (-not (Test-ApiKeyPresent -EnvVarName $ApiKeyEnvVar)) {
        throw "Required API key environment variable '$ApiKeyEnvVar' is not set or is empty. Aborting launch."
    }

    # 2) Optional: run additional validation command
    if ($ValidateCommand) {
        Write-Verbose "Running custom validation command: $ValidateCommand"
        $validation = & powershell -NoProfile -Command $ValidateCommand
        if ($LASTEXITCODE -ne 0) {
            throw "Custom validation failed with exit code $LASTEXITCODE. Aborting launch."
        }
    }

    # 3) Prepare logs
    New-DirectoryIfMissing -Path $LogDirectory
    $tag = if ($ProcessNameTag) { $ProcessNameTag } else { Get-SafeTagFromExecutable -Exe $Executable }
    $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'

    $stdoutPath = Join-Path $LogDirectory "${tag}-${timestamp}.out.log"
    $stderrPath = Join-Path $LogDirectory "${tag}-${timestamp}.err.log"
    $metaPath   = Join-Path $LogDirectory "${tag}-${timestamp}.meta.json"

    # 4) Compose Start-Process parameters
    $startInfo = @{
        FilePath               = $Executable
        WorkingDirectory       = $WorkingDirectory
        WindowStyle            = 'Hidden'
        PassThru               = $true
        RedirectStandardOutput = $stdoutPath
        RedirectStandardError  = $stderrPath
        # NoNewWindow omitted since we want detached hidden window
    }
    if ($Arguments) { $startInfo.Arguments = $Arguments }

    if ($PSCmdlet.ShouldProcess("$Executable $Arguments", "Start in background")) {
        $p = Start-Process @startInfo
        # 5) Write a small metadata file for later introspection
        $meta = [ordered]@{
            time                = (Get-Date).ToString('o')
            executable          = $Executable
            arguments           = $Arguments
            workingDirectory    = $WorkingDirectory
            apiKeyEnvVar        = $ApiKeyEnvVar
            validateCommand     = $ValidateCommand
            pid                 = $p.Id
            stdout              = $stdoutPath
            stderr              = $stderrPath
            windowStyle         = 'Hidden'
        } | ConvertTo-Json -Depth 4
        Set-Content -Path $metaPath -Value $meta -Encoding UTF8

        Write-Host "Started '$Executable' (PID: $($p.Id)) in background."
        Write-Host "Logs:"
        Write-Host "  Stdout: $stdoutPath"
        Write-Host "  Stderr: $stderrPath"
        Write-Host "  Meta:   $metaPath"
    }

    exit 0
}
catch {
    Write-Error $_.Exception.Message
    exit 1
}

