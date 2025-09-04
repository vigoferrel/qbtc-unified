<#
.SYNOPSIS
  Validates Binance API key IP restrictions and Futures permissions on Windows using PowerShell.

.DESCRIPTION
  - Detects current public IP via multiple providers.
  - Verifies general connectivity to Binance.
  - Performs signed calls (Spot and Futures) using HMAC-SHA256 without exposing secrets.
  - Classifies common error codes/messages to determine:
      * Whether the API key is restricted to a different IP (whitelist mismatch).
      * Whether the API key has "Enable Futures" permission active.
  - Handles Windows specifics: TLS 1.2 enforcement and time drift compensation.

.REQUIREMENTS
  - PowerShell 5.1+ or PowerShell 7+
  - Environment variables must be set prior to running:
      $env:BINANCE_API_KEY
      $env:BINANCE_API_SECRET
  Optionally:
      $env:BINANCE_BASE_URL_   (default: https://api.binance.com)
      $env:BINANCE_BASE_URL_FUT    (default: https://fapi.binance.com)
      $env:BINANCE_RECV_WINDOW_MS  (default: 5000)

.USAGE
  # Set secrets securely in the environment (do NOT echo them)
  # $env:BINANCE_API_KEY=... ; $env:BINANCE_API_SECRET=...
  # Then run:
  #   powershell -ExecutionPolicy Bypass -File scripts/Validate-BinancePermissions.ps1

.OUTPUT
  Emits a structured summary and detailed findings.

.SECURITY
  - Never prints API key/secret.
  - Uses environment variables only.
#>

[CmdletBinding()]
param(
  [switch]$AsJson
)

# ----- Safety and platform setup -----
try {
  # Enforce TLS 1.2 (Windows compatibility)
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
} catch { }

$ErrorActionPreference = 'Stop'

# ----- Config -----
$SpotBaseUrl   = $env:BINANCE_BASE_URL_; if (-not $SpotBaseUrl) { $SpotBaseUrl = 'https://api.binance.com' }
$FuturesBaseUrl= $env:BINANCE_BASE_URL_FUT ; if (-not $FuturesBaseUrl) { $FuturesBaseUrl = 'https://fapi.binance.com' }
$RecvWindowMs  = [int]($env:BINANCE_RECV_WINDOW_MS); if (-not $RecvWindowMs) { $RecvWindowMs = 5000 }

$ApiKey    = $env:BINANCE_API_KEY
$ApiSecret = $env:BINANCE_API_SECRET

if (-not $ApiKey -or -not $ApiSecret) {
  throw 'Environment variables BINANCE_API_KEY and BINANCE_API_SECRET must be set before running this script.'
}

# ----- Helpers -----
function Write-Note($msg) { Write-Host "[NOTE] $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "[OK]  $msg" -ForegroundColor Green }
function Write-Warn2($msg){ Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err2($msg) { Write-Host "[ERR] $msg" -ForegroundColor Red }

function Get-PublicIP {
  $providers = @(
    'https://api.ipify.org?format=json',
    'https://ifconfig.me/all.json',
    'https://ipinfo.io/json'
  )
  foreach ($p in $providers) {
    try {
      $resp = Invoke-RestMethod -Uri $p -Method GET -TimeoutSec 10
      if ($null -ne $resp) {
        if ($resp.ip) { return $resp.ip }
        if ($resp.ip_addr) { return $resp.ip_addr }
        if ($resp."ip_addr") { return $resp."ip_addr" }
      }
    } catch { }
  }
  return $null
}

function Get-BinanceServerTime($BaseUrl) {
  $u = "$BaseUrl/api/v3/time"
  return Invoke-RestMethod -Uri $u -Method GET -TimeoutSec 10
}

function New-BinanceSignature([string]$query, [string]$secret){
  $hmac = [System.Security.Cryptography.HMACSHA256]::new([Text.Encoding]::UTF8.GetBytes($secret))
  $hashBytes = $hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes($query))
  ($hashBytes | ForEach-Object { $_.ToString('x2') }) -join ''
}

function Invoke-BinanceSigned {
  param(
    [Parameter(Mandatory)][ValidateSet('','FUTURES')]$ApiType,
    [Parameter(Mandatory)][ValidateSet('GET','POST','DELETE')]$Method,
    [Parameter(Mandatory)][string]$Path,
    [hashtable]$Params
  )
  $baseUrl = if ($ApiType -eq '') { $SpotBaseUrl } else { $FuturesBaseUrl }
  $ts = [int64]([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())
  $params = @{}
  if ($Params) { $Params.GetEnumerator() | ForEach-Object { $params[$_.Key] = $_.Value } }
  $params['timestamp'] = $ts
  $params['recvWindow'] = $RecvWindowMs

  $query = ($params.GetEnumerator() | Sort-Object Key | ForEach-Object { "{0}={1}" -f $_.Key, [Uri]::EscapeDataString([string]$_.Value) }) -join '&'
  $sig = New-BinanceSignature -query $query -secret $ApiSecret
  $uri = "$baseUrl$Path?$query&signature=$sig"
  $headers = @{ 'X-MBX-APIKEY' = $ApiKey }

  try {
    $resp = Invoke-RestMethod -Uri $uri -Headers $headers -Method $Method -TimeoutSec 20
    return @{ ok=$true; data=$resp; status=200 }
  } catch {
    $e = $_.Exception
    $webResp = $e.Response
    $status = $null
    $body = $null
    if ($webResp) {
      $status = [int]$webResp.StatusCode
      try {
        $sr = New-Object System.IO.StreamReader($webResp.GetResponseStream())
        $raw = $sr.ReadToEnd()
        $sr.Close()
        if ($raw) { $body = try { $raw | ConvertFrom-Json } catch { @{ raw=$raw } } }
      } catch { }
    }
    return @{ ok=$false; status=$status; error=$body }
  }
}

function Classify-Error([int]$status, $errorBody, [string]$context){
  # Default result
  $result = [ordered]@{
    context      = $context
    status       = $status
    errorCode    = $null
    errorMessage = $null
    classification = 'unknown'
    hint         = $null
  }
  if ($null -ne $errorBody) {
    if ($errorBody.code) { $result.errorCode = $errorBody.code }
    if ($errorBody.msg)  { $result.errorMessage = $errorBody.msg }
    if ($errorBody.raw)  { $result.errorMessage = $errorBody.raw }
  }

  $msg = ($result.errorMessage | Out-String).ToLower()

  # Common patterns for IP whitelist and Futures permission
  if ($status -in 401,403) {
    if ($msg -like '*invalid api-key, ip, or permissions*' -or $msg -like '*ip*' -or $msg -like '*permission*') {
      $result.classification = 'likely_ip_whitelist_or_permission_issue'
      $result.hint = 'If Spot signed works but Futures fails, it is Futures permission. If both fail, likely IP whitelist mismatch.'
      return $result
    }
  }

  switch ($result.errorCode) {
    # Signature / timestamp issues
    -1022 { $result.classification='signature_error'; $result.hint='Check HMAC signature/params.'; return $result }
    -1021 { $result.classification='timestamp_out_of_range'; $result.hint='Adjust local time or recvWindow.'; return $result }

    # Generic invalid key/permission
    -2015 {
      if ($context -eq 'FUTURES') {
        $result.classification='futures_not_enabled_or_ip_restricted'
        $result.hint='Enable Futures for the API key and ensure the current IP is whitelisted.'
      } else {
        $result.classification='_invalid_or_ip_restricted'
        $result.hint='If key is correct, likely IP whitelist mismatch.'
      }
      return $result
    }
    -2014 { $result.classification='invalid_api_key_format'; $result.hint='Regenerate API key.'; return $result }

    # Observed futures-permission specific messages (not exhaustive)
    default {
      if ($context -eq 'FUTURES' -and ($msg -like '*futures*not*enabled*' -or $msg -like '*does not have futures permission*')) {
        $result.classification='futures_permission_missing'
        $result.hint='Enable Futures for this API key in Binance API Management.'
        return $result
      }
    }
  }

  if ($msg -like '*insufficient permissions*') {
    $result.classification='insufficient_permissions'
    $result.hint='Enable required permissions (Reading, Spot/Margin, Futures).'
  }
  return $result
}

# ----- Run checks -----
$findings = [ordered]@{}

# Public IP detection
$publicIP = Get-PublicIP
$findings.PublicIP = $publicIP
if ($publicIP) { Write-Ok "Public IP detected: $publicIP" } else { Write-Warn2 'Could not detect public IP.' }

# Connectivity checks
Write-Note 'Checking Binance connectivity (public time endpoints) ...'
$Time = $null; $futTime = $null
try { $Time = Get-BinanceServerTime -BaseUrl $SpotBaseUrl; Write-Ok 'Spot: reachable' } catch { Write-Err2 "Spot: unreachable ($($_.Exception.Message))" }
try { $futTime  = Get-BinanceServerTime -BaseUrl $FuturesBaseUrl; Write-Ok 'Futures: reachable' } catch { Write-Err2 "Futures: unreachable ($($_.Exception.Message))" }
$findings.Connectivity = @{ Spot = [bool]$Time; Futures = [bool]$futTime }

# Signed  check (account endpoint)
Write-Note 'Testing  signed endpoint (/api/v3/account) ...'
$Signed = Invoke-BinanceSigned -ApiType  -Method GET -Path '/api/v3/account' -Params @{}
$findings.SpotSignedRaw = $Signed

# Signed FUTURES check (account endpoint)
Write-Note 'Testing FUTURES signed endpoint (/fapi/v2/account) ...'
$futSigned  = Invoke-BinanceSigned -ApiType FUTURES -Method GET -Path '/fapi/v2/account' -Params @{}
$findings.FuturesSignedRaw = $futSigned

# ----- Classification logic -----
$diagnosis = [ordered]@{
  ApiKeyIpRestricted = $null
  FuturesEnabled     = $null
  Reasons            = @()
}

# Spot signed outcome
if ($Signed.ok) {
  $diagnosis.Reasons += ' signed endpoint succeeded: key and IP likely valid for .'
} else {
  $c = Classify-Error -status $Signed.status -errorBody $Signed.error -context ''
  $findings.SpotClassification = $c
  switch ($c.classification) {
    'timestamp_out_of_range' { $diagnosis.Reasons += 'Spot failed due to timestamp. Increase recvWindow or sync system time.' }
    'signature_error'        { $diagnosis.Reasons += 'Spot failed due to signature. Verify API secret and signing.' }
    '_invalid_or_ip_restricted' {
      $diagnosis.ApiKeyIpRestricted = $true
      $diagnosis.Reasons += 'Spot indicates IP whitelist or invalid key. If key is correct, IP whitelist mismatch is likely.'
    }
    default { $diagnosis.Reasons += "Spot failed: $($c.classification) - $($c.errorMessage)" }
  }
}

# Futures signed outcome
if ($futSigned.ok) {
  $diagnosis.FuturesEnabled = $true
  $diagnosis.Reasons += 'FUTURES signed endpoint succeeded: Futures permission active.'
} else {
  $c2 = Classify-Error -status $futSigned.status -errorBody $futSigned.error -context 'FUTURES'
  $findings.FuturesClassification = $c2
  switch ($c2.classification) {
    'timestamp_out_of_range' { $diagnosis.Reasons += 'Futures failed due to timestamp. Increase recvWindow or sync system time.' }
    'signature_error'        { $diagnosis.Reasons += 'Futures failed due to signature. Verify API secret and signing.' }
    'futures_permission_missing' {
      $diagnosis.FuturesEnabled = $false
      $diagnosis.Reasons += 'Futures permission missing for this API key.'
    }
    'futures_not_enabled_or_ip_restricted' {
      # Need to disambiguate with Spot result
      if ($Signed.ok) {
        $diagnosis.FuturesEnabled = $false
        $diagnosis.Reasons += 'Spot works but Futures fails: Futures permission likely disabled.'
      } else {
        $diagnosis.ApiKeyIpRestricted = $true
        $diagnosis.FuturesEnabled = $null
        $diagnosis.Reasons += 'Both Spot and Futures fail with permission/IP: likely IP whitelist mismatch.'
      }
    }
    default { $diagnosis.Reasons += "Futures failed: $($c2.classification) - $($c2.errorMessage)" }
  }
}

# If not set yet, infer ApiKeyIpRestricted
if ($null -eq $diagnosis.ApiKeyIpRestricted) {
  if (-not $Signed.ok -and ($Signed.status -in 401,403)) {
    $diagnosis.ApiKeyIpRestricted = $true
  } else {
    $diagnosis.ApiKeyIpRestricted = $false
  }
}

# ----- Output -----
$result = [ordered]@{
  Summary = [ordered]@{
    PublicIP            = $publicIP
    SpotConnectivity    = [bool]$Time
    FuturesConnectivity = [bool]$futTime
    ApiKeyIpRestricted  = $diagnosis.ApiKeyIpRestricted
    FuturesEnabled      = $diagnosis.FuturesEnabled
  }
  Details = $diagnosis.Reasons
  Raw     = [ordered]@{
    Spot   = $Signed
    Futures= $futSigned
    SpotClass    = $findings.SpotClassification
    FuturesClass = $findings.FuturesClassification
  }
}

if ($AsJson) {
  $result | ConvertTo-Json -Depth 6
} else {
  Write-Host '=== Binance API Validation Result ===' -ForegroundColor Magenta
  $s = $result.Summary
  Write-Host ("Public IP:               {0}" -f ($s.PublicIP ?? 'n/a'))
  Write-Host ("Spot Connectivity:       {0}" -f $s.SpotConnectivity)
  Write-Host ("Futures Connectivity:    {0}" -f $s.FuturesConnectivity)
  Write-Host ("API Key IP Restricted:   {0}" -f $s.ApiKeyIpRestricted)
  Write-Host ("Futures Enabled:         {0}" -f ($s.FuturesEnabled ?? 'unknown'))
  Write-Host ''
  Write-Host 'Details:' -ForegroundColor Gray
  $result.Details | ForEach-Object { Write-Host " - $_" }
  Write-Host ''
  Write-Host 'Hints:' -ForegroundColor Gray
  Write-Host ' - If Futures disabled: enable "Enable Futures" on the API key.'
  Write-Host ' - If IP restricted: whitelist the above Public IP in Binance API Management.'
  Write-Host ' - After changing Binance settings, wait a few minutes and re-run.'
}

