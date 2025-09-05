# Test manual de API de Binance desde PowerShell
# Script para validar peticiones y depuracion del backend

param(
    [string]$ApiKey = $env:BINANCE_API_KEY,
    [string]$ApiSecret = $env:BINANCE_API_SECRET,
    [string]$Symbol = "BTCUSDT",
    [switch]$TestAccount = $false,
    [switch]$TestBalance = $false,
    [switch]$TestPrice = $false,
    [switch]$Verbose = $false
)

# Funcion para calcular firma HMAC SHA256
function Get-HMACSignature {
    param(
        [string]$Message,
        [string]$Secret
    )
    
    $hmacsha = New-Object System.Security.Cryptography.HMACSHA256
    $hmacsha.Key = [System.Text.Encoding]::ASCII.GetBytes($Secret)
    $signature = $hmacsha.ComputeHash([System.Text.Encoding]::ASCII.GetBytes($Message))
    $hmacsha.Dispose()
    
    return [System.BitConverter]::ToString($signature).Replace("-", "").ToLower()
}

# Funcion para obtener timestamp en milisegundos
function Get-TimestampMs {
    return [int64]((Get-Date).ToUniversalTime() - (Get-Date "1/1/1970")).TotalMilliseconds
}

# Funcion para realizar peticion GET con autenticacion
function Invoke-BinanceAPI {
    param(
        [string]$Endpoint,
        [string]$QueryParams = "",
        [string]$ApiKey,
        [string]$ApiSecret,
        [bool]$RequireSignature = $true,
        [bool]$ShowDetails = $false
    )
    
    $timestamp = Get-TimestampMs
    $baseUrl = "https://fapi.binance.com"
    
    if ($RequireSignature) {
        if ($QueryParams) {
            $queryString = "$QueryParams&timestamp=$timestamp"
        } else {
            $queryString = "timestamp=$timestamp"
        }
        
        $signature = Get-HMACSignature -Message $queryString -Secret $ApiSecret
        $fullUrl = "$baseUrl$Endpoint" + "?" + $queryString + "&signature=" + $signature
    } else {
        if ($QueryParams) {
            $fullUrl = "$baseUrl$Endpoint" + "?" + $QueryParams
        } else {
            $fullUrl = "$baseUrl$Endpoint"
        }
    }
    
    $headers = @{}
    if ($ApiKey) {
        $headers["X-MBX-APIKEY"] = $ApiKey
    }
    
    if ($ShowDetails) {
        Write-Host "=== DETALLES DE LA PETICION ===" -ForegroundColor Yellow
        Write-Host "URL: $fullUrl" -ForegroundColor Cyan
        Write-Host "Headers: $($headers | ConvertTo-Json)" -ForegroundColor Cyan
        Write-Host "Timestamp: $timestamp" -ForegroundColor Cyan
        if ($RequireSignature) {
            Write-Host "Query String para firma: $queryString" -ForegroundColor Cyan
            Write-Host "Signature: $signature" -ForegroundColor Cyan
        }
        Write-Host "================================" -ForegroundColor Yellow
    }
    
    try {
        $response = Invoke-WebRequest -Uri $fullUrl -Headers $headers -Method GET
        return @{
            Success = $true
            StatusCode = $response.StatusCode
            Content = $response.Content | ConvertFrom-Json
            RawResponse = $response
        }
    } catch {
        $errorDetails = $_.Exception.Response
        $errorContent = ""
        
        if ($errorDetails -and $errorDetails.GetResponseStream) {
            $stream = $errorDetails.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $errorContent = $reader.ReadToEnd()
            $reader.Close()
            $stream.Close()
        }
        
        return @{
            Success = $false
            StatusCode = $errorDetails.StatusCode
            Error = $_.Exception.Message
            ErrorContent = $errorContent
        }
    }
}

# Validar parametros
if (-not $ApiKey) {
    Write-Host "ERROR: No se encontro BINANCE_API_KEY. Configurar variable de entorno o parametro -ApiKey" -ForegroundColor Red
    exit 1
}

if (-not $ApiSecret) {
    Write-Host "ERROR: No se encontro BINANCE_API_SECRET. Configurar variable de entorno o parametro -ApiSecret" -ForegroundColor Red
    exit 1
}

Write-Host "=== PRUEBAS MANUALES API BINANCE ===" -ForegroundColor Green
Write-Host "API Key: $($ApiKey.Substring(0,8))..." -ForegroundColor Gray
Write-Host "Timestamp actual: $(Get-TimestampMs)" -ForegroundColor Gray
Write-Host ""

# Test 1: Ping (sin autenticacion)
Write-Host "1. TEST PING (sin autenticacion)..." -ForegroundColor Yellow
$pingResult = Invoke-BinanceAPI -Endpoint "/fapi/v1/ping" -RequireSignature $false -ShowDetails $Verbose
if ($pingResult.Success) {
    Write-Host "   EXITO - Status: $($pingResult.StatusCode)" -ForegroundColor Green
} else {
    Write-Host "   ERROR - Status: $($pingResult.StatusCode), Error: $($pingResult.Error)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Server Time (sin autenticacion)
Write-Host "2. TEST SERVER TIME (sin autenticacion)..." -ForegroundColor Yellow
$timeResult = Invoke-BinanceAPI -Endpoint "/fapi/v1/time" -RequireSignature $false -ShowDetails $Verbose
if ($timeResult.Success) {
    $serverTime = $timeResult.Content.serverTime
    $localTime = Get-TimestampMs
    $timeDiff = [math]::Abs($serverTime - $localTime)
    
    Write-Host "   EXITO - Status: $($timeResult.StatusCode)" -ForegroundColor Green
    Write-Host "   Server Time: $serverTime" -ForegroundColor Gray
    Write-Host "   Local Time:  $localTime" -ForegroundColor Gray
    Write-Host "   Diferencia:  $timeDiff ms" -ForegroundColor Gray
    
    if ($timeDiff -gt 5000) {
        Write-Host "   ADVERTENCIA: Diferencia de tiempo > 5000ms. Puede causar errores de firma" -ForegroundColor Red
    }
} else {
    Write-Host "   ERROR - Status: $($timeResult.StatusCode), Error: $($timeResult.Error)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Account Information (con autenticacion y firma)
if ($TestAccount) {
    Write-Host "3. TEST ACCOUNT INFO (con autenticacion y firma)..." -ForegroundColor Yellow
    $accountResult = Invoke-BinanceAPI -Endpoint "/fapi/v2/account" -ApiKey $ApiKey -ApiSecret $ApiSecret -ShowDetails $Verbose
    if ($accountResult.Success) {
        $account = $accountResult.Content
        Write-Host "   EXITO - Status: $($accountResult.StatusCode)" -ForegroundColor Green
        Write-Host "   Total Wallet Balance: $($account.totalWalletBalance) USDT" -ForegroundColor Gray
        Write-Host "   Available Balance: $($account.availableBalance) USDT" -ForegroundColor Gray
        Write-Host "   Can Trade: $($account.canTrade)" -ForegroundColor Gray
        Write-Host "   Can Deposit: $($account.canDeposit)" -ForegroundColor Gray
        Write-Host "   Can Withdraw: $($account.canWithdraw)" -ForegroundColor Gray
        
        if ($account.assets.Count -gt 0) {
            Write-Host "   Assets con balance:" -ForegroundColor Gray
            foreach ($asset in $account.assets | Where-Object { [double]$_.walletBalance -gt 0 }) {
                Write-Host "     $($asset.asset): $($asset.walletBalance)" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "   ERROR - Status: $($accountResult.StatusCode)" -ForegroundColor Red
        Write-Host "   Error: $($accountResult.Error)" -ForegroundColor Red
        if ($accountResult.ErrorContent) {
            $errorJson = $accountResult.ErrorContent | ConvertFrom-Json -ErrorAction SilentlyContinue
            if ($errorJson) {
                Write-Host "   Codigo: $($errorJson.code), Mensaje: $($errorJson.msg)" -ForegroundColor Red
            } else {
                Write-Host "   Error Content: $($accountResult.ErrorContent)" -ForegroundColor Red
            }
        }
    }
    Write-Host ""
}

# Test 4: Balance (con autenticacion y firma)
if ($TestBalance) {
    Write-Host "4. TEST BALANCE (con autenticacion y firma)..." -ForegroundColor Yellow
    $balanceResult = Invoke-BinanceAPI -Endpoint "/fapi/v2/balance" -ApiKey $ApiKey -ApiSecret $ApiSecret -ShowDetails $Verbose
    if ($balanceResult.Success) {
        $balances = $balanceResult.Content
        Write-Host "   EXITO - Status: $($balanceResult.StatusCode)" -ForegroundColor Green
        
        $usdtBalance = $balances | Where-Object { $_.asset -eq "USDT" }
        if ($usdtBalance) {
            Write-Host "   Balance USDT: $($usdtBalance.balance)" -ForegroundColor Gray
            Write-Host "   Available USDT: $($usdtBalance.availableBalance)" -ForegroundColor Gray
        }
        
        $nonZeroBalances = $balances | Where-Object { [double]$_.balance -gt 0 }
        if ($nonZeroBalances.Count -gt 0) {
            Write-Host "   Balances no cero:" -ForegroundColor Gray
            foreach ($balance in $nonZeroBalances) {
                Write-Host "     $($balance.asset): $($balance.balance)" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "   ERROR - Status: $($balanceResult.StatusCode)" -ForegroundColor Red
        Write-Host "   Error: $($balanceResult.Error)" -ForegroundColor Red
        if ($balanceResult.ErrorContent) {
            Write-Host "   Error Content: $($balanceResult.ErrorContent)" -ForegroundColor Red
        }
    }
    Write-Host ""
}

# Test 5: Symbol Price (sin autenticacion)
if ($TestPrice) {
    Write-Host "5. TEST SYMBOL PRICE $Symbol (sin autenticacion)..." -ForegroundColor Yellow
    $priceResult = Invoke-BinanceAPI -Endpoint "/fapi/v1/ticker/price" -QueryParams "symbol=$Symbol" -RequireSignature $false -ShowDetails $Verbose
    if ($priceResult.Success) {
        $price = $priceResult.Content
        Write-Host "   EXITO - Status: $($priceResult.StatusCode)" -ForegroundColor Green
        Write-Host "   Symbol: $($price.symbol)" -ForegroundColor Gray
        Write-Host "   Price: $($price.price)" -ForegroundColor Gray
    } else {
        Write-Host "   ERROR - Status: $($priceResult.StatusCode)" -ForegroundColor Red
        Write-Host "   Error: $($priceResult.Error)" -ForegroundColor Red
    }
    Write-Host ""
}

# Test comparativo con el backend (si esta corriendo)
Write-Host "6. TEST COMPARATIVO CON BACKEND..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/real-balance" -Method GET -TimeoutSec 5
    $backendData = $backendResponse.Content | ConvertFrom-Json
    
    Write-Host "   BACKEND RESPUESTA - Status: $($backendResponse.StatusCode)" -ForegroundColor Green
    Write-Host "   Backend Balance: $($backendData | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
    
    # Si tambien ejecutamos test de balance, comparar resultados
    if ($TestBalance -and $balanceResult.Success) {
        Write-Host "   COMPARACION:" -ForegroundColor Cyan
        Write-Host "   - Ambas peticiones exitosas" -ForegroundColor Green
        Write-Host "   - Validar que los balances coincidan manualmente" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "   BACKEND NO DISPONIBLE - $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Asegurate que el servidor este corriendo en localhost:3000" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== RESUMEN DE PRUEBAS ===" -ForegroundColor Green
Write-Host "Para ejecutar pruebas especificas usar:" -ForegroundColor Gray
Write-Host "  .\test-binance-api.ps1 -TestAccount -TestBalance -TestPrice -Verbose" -ForegroundColor Gray
Write-Host "Para comparar con backend:" -ForegroundColor Gray
Write-Host "  1. Iniciar: node qbtc-real-trading-server.js" -ForegroundColor Gray
Write-Host "  2. Ejecutar: .\test-binance-api.ps1 -TestBalance" -ForegroundColor Gray
Write-Host ""
