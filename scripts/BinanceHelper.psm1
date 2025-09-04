function Initialize-BinanceConfig {
    # Cargar variables del .env
    $envContent = Get-Content "quantum-core/.env"
    $script:BINANCE_API_KEY = ($envContent | Where-Object {$_ -match '^BINANCE_API_KEY='}).Split('=')[1].Trim()
    $script:BINANCE_SECRET_KEY = ($envContent | Where-Object {$_ -match '^BINANCE_SECRET_KEY='}).Split('=')[1].Trim()
    $script:IS_TESTNET = ($envContent | Where-Object {$_ -match '^BINANCE_TESTNET='}).Split('=')[1].Trim() -eq 'true'
    
    # Configurar URLs base
    $script:PROD_URL = 'https://fapi.binance.com'
    $script:TESTNET_URL = 'https://testnet.binancefuture.com'
}

function Get-BinanceBaseUrl {
    if ($script:IS_TESTNET) {
        return $script:TESTNET_URL
    }
    return $script:PROD_URL
}

function Get-BinanceSignature {
    param(
        [string]$queryString
    )
    
    $hmacsha = New-Object System.Security.Cryptography.HMACSHA256
    $hmacsha.key = [Text.Encoding]::ASCII.GetBytes($script:BINANCE_SECRET_KEY)
    return [BitConverter]::ToString($hmacsha.ComputeHash([Text.Encoding]::ASCII.GetBytes($queryString))).Replace('-','').ToLower()
}

function Get-CurrentTimestamp {
    return [int64](([datetime]::UtcNow)-(get-date "1/1/1970")).TotalMilliseconds
}

function Invoke-BinanceRequest {
    param(
        [Parameter(Mandatory=$true)]
        [string]$endpoint,
        
        [Parameter(Mandatory=$false)]
        [Microsoft.PowerShell.Commands.WebRequestMethod]$method = [Microsoft.PowerShell.Commands.WebRequestMethod]::Get,
        
        [Parameter(Mandatory=$false)]
        [hashtable]$additionalParams = @{},
        
        [Parameter(Mandatory=$false)]
        [int]$recvWindow = 5000,
        
        [Parameter(Mandatory=$false)]
        [switch]$requiresSignature = $true
    )
    
    # Asegurar que la configuración está inicializada
    if (-not $script:BINANCE_API_KEY) {
        Initialize-BinanceConfig
    }
    
    # Preparar parámetros base
    $timestamp = Get-CurrentTimestamp
    $queryParams = @{
        "timestamp" = $timestamp
    }
    
    if ($recvWindow -gt 0) {
        $queryParams["recvWindow"] = $recvWindow
    }
    
    # Agregar parámetros adicionales
    foreach ($key in $additionalParams.Keys) {
        $queryParams[$key] = $additionalParams[$key]
    }
    
    # Construir query string
    $queryString = ($queryParams.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join '&'
    
    # Agregar firma si es requerida
    if ($requiresSignature) {
        $signature = Get-BinanceSignature -queryString $queryString
        $queryString = "$queryString&signature=$signature"
    }
    
    # Construir URL completa
    $baseUrl = Get-BinanceBaseUrl
    $url = "$baseUrl$endpoint"
    if ($queryString) {
        $url = "$url`?$queryString"
    }
    
    # Preparar headers
    $headers = @{
        'X-MBX-APIKEY' = $script:BINANCE_API_KEY
    }
    
    Write-Verbose "Making $method request to $url"
    Write-Verbose "Headers: $($headers | ConvertTo-Json)"
    
    # Hacer la petición
    $response = Invoke-WebRequest -Uri $url -Headers $headers -Method $method -UseBasicParsing
    
    # Convertir y retornar la respuesta
    return $response.Content | ConvertFrom-Json
}

# Funciones específicas para endpoints comunes

function Get-BinanceAccountInfo {
    return Invoke-BinanceRequest -endpoint "/fapi/v2/account" -method Get
}

function Get-BinancePositionRisk {
    param(
        [string]$symbol = $null
    )
    
    $params = @{}
    if ($symbol) {
        $params["symbol"] = $symbol
    }
    
    return Invoke-BinanceRequest -endpoint "/fapi/v2/positionRisk" -method Get -additionalParams $params
}

function Get-BinanceBalance {
    return Invoke-BinanceRequest -endpoint "/fapi/v2/balance" -method Get
}

function Get-BinanceOpenOrders {
    param(
        [string]$symbol = $null
    )
    
    $params = @{}
    if ($symbol) {
        $params["symbol"] = $symbol
    }
    
    return Invoke-BinanceRequest -endpoint "/fapi/v1/openOrders" -method Get -additionalParams $params
}

function Test-BinanceConnection {
    try {
        # Primero hacer un ping simple
        $pingResponse = Invoke-BinanceRequest -endpoint "/fapi/v1/ping" -method Get
        Write-Host "[OK] Ping exitoso a $(Get-BinanceBaseUrl)"
        
        # Luego probar autenticación con account info
        $accountInfo = Get-BinanceAccountInfo
        Write-Host "[OK] Autenticación exitosa - Account Info recibida"
        $modoTexto = if ($script:IS_TESTNET) { 'TESTNET' } else { 'PRODUCCION' }
        Write-Host "[INFO] Modo: $modoTexto"
        Write-Host "[INFO] Total Balance USDT: $($accountInfo.totalWalletBalance)"
        
        return $true
    }
    catch {
        Write-Host "[ERROR] Error en la conexión: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Exportar las funciones que queremos disponibles
Export-ModuleMember -Function Initialize-BinanceConfig, 
                             Get-BinanceAccountInfo, 
                             Get-BinancePositionRisk, 
                             Get-BinanceBalance, 
                             Get-BinanceOpenOrders,
                             Test-BinanceConnection
