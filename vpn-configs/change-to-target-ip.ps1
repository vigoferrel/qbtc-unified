# QBTC VPN IP Changer - Target: 181.43.212.196
# Created for QBTC Unified System
# Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

$ErrorActionPreference = 'Stop'

# Configuration
$targetIP = "181.43.212.196"
$currentIP = $null
$maxAttempts = 10
$waitTime = 3

Write-Host "QBTC VPN IP CHANGER - Target: $targetIP" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Function to get current IP
function Get-CurrentIP {
    try {
        $response = Invoke-RestMethod -Uri "https://ipv4.icanhazip.com" -UseBasicParsing -TimeoutSec 5
        return $response.Trim()
    } catch {
        Write-Host "Error getting current IP: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Function to check if target IP is reached
function Test-TargetIP {
    param([string]$ip)
    return $ip -eq $targetIP
}

# Main process
Write-Host "Checking current IP..." -ForegroundColor Yellow
$currentIP = Get-CurrentIP

if ($currentIP) {
    Write-Host "Current IP: $currentIP" -ForegroundColor Cyan
    
    if (Test-TargetIP -ip $currentIP) {
        Write-Host "Already on target IP: $targetIP" -ForegroundColor Green
        Write-Host "Ready to run system-integrator.js" -ForegroundColor Green
        return
    } else {
        Write-Host "Need to change from $currentIP to $targetIP" -ForegroundColor Yellow
    }
}

Write-Host "Instructions to change IP:" -ForegroundColor Yellow
Write-Host "1. Open your VPN client (NordVPN/OpenVPN)" -ForegroundColor White
Write-Host "2. Disconnect from current server" -ForegroundColor White
Write-Host "3. Connect to a server that provides IP: $targetIP" -ForegroundColor White
Write-Host "4. Common locations: Chile, Argentina, Brazil" -ForegroundColor White
Write-Host "5. Wait for connection to stabilize" -ForegroundColor White

Write-Host "`nWaiting for IP change..." -ForegroundColor Yellow
Write-Host "Press Enter when you've changed the IP, or Ctrl+C to cancel" -ForegroundColor Yellow

try {
    Read-Host
    
    # Verify IP change
    Write-Host "Verifying IP change..." -ForegroundColor Yellow
    
    for ($i = 1; $i -le $maxAttempts; $i++) {
        Write-Host "   Attempt $i/$maxAttempts..." -ForegroundColor Cyan
        
        $newIP = Get-CurrentIP
        if ($newIP) {
            Write-Host "   Current IP: $newIP" -ForegroundColor Cyan
            
            if (Test-TargetIP -ip $newIP) {
                Write-Host "SUCCESS! IP changed to: $targetIP" -ForegroundColor Green
                Write-Host "Ready to run system-integrator.js" -ForegroundColor Green
                return
            }
        }
        
        if ($i -lt $maxAttempts) {
            Write-Host "   Waiting $waitTime seconds..." -ForegroundColor Yellow
            Start-Sleep -Seconds $waitTime
        }
    }
    
    Write-Host "Failed to reach target IP after $maxAttempts attempts" -ForegroundColor Red
    Write-Host "Please check your VPN connection manually" -ForegroundColor Yellow
    
} catch {
    Write-Host "Operation cancelled by user" -ForegroundColor Red
}
