# ========================================================================
# VERIFICACION DE CONEXIONES SISTEMAS UNIFICADOS
# Script para verificar rutas y conectividad con todos los sistemas
# ========================================================================

$Host.UI.RawUI.OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "VERIFICACION SISTEMAS UNIFICADOS QBTC" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Yellow

# Configuracion de sistemas basada en config.js
$Systems = @{
    "Frontend_Local" = @{
        URL = "http://localhost:8080"
        Description = "Frontend Unificado (Local)"
        Endpoints = @("/", "/index.html")
        Critical = $true
    }
    "Backend_Leonardo" = @{
        URL = "http://localhost:3003"
        Description = "Backend Leonardo Consciousness"
        Endpoints = @("/health", "/api/status", "/api/trading")
        Critical = $true
    }
    "Unified_API" = @{
        URL = "https://qbtc-api.com:18020"
        Description = "API Unificada QBTC"
        Endpoints = @("/unified/health", "/quantum/consciousness", "/quantum/trading")
        Critical = $false
    }
    "Quantum_Core" = @{
        URL = "https://qbtc-api.com:9090"
        Description = "Nucleo Cuantico"
        Endpoints = @("/quantum/state", "/quantum/validate", "/quantum/analysis")
        Critical = $false
    }
    "Trading_Engine" = @{
        URL = "https://qbtc-api.com:9091"
        Description = "Motor Trading"
        Endpoints = @("/api/real-trading/execute", "/api/real-balance", "/api/orders")
        Critical = $false
    }
    "Market_Data" = @{
        URL = "https://qbtc-api.com:9092"
        Description = "Datos de Mercado"
        Endpoints = @("/market/prices", "/market/book", "/market/trades")
        Critical = $false
    }
    "Monitoring" = @{
        URL = "https://qbtc-api.com:9093"
        Description = "Sistema de Monitoreo"
        Endpoints = @("/monitoring/metrics", "/monitoring/logs", "/monitoring/alerts")
        Critical = $false
    }
}

$LOG_FILE = "$PSScriptRoot\connectivity-check-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "HH:mm:ss.fff"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    Write-Output $logEntry | Out-File -FilePath $LOG_FILE -Append -Encoding utf8
    
    switch($Level) {
        "ERROR" { Write-Host $logEntry -ForegroundColor Red }
        "WARN"  { Write-Host $logEntry -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $logEntry -ForegroundColor Green }
        "INFO" { Write-Host $logEntry -ForegroundColor White }
    }
}

function Test-SystemConnectivity {
    param([string]$URL, [array]$Endpoints, [int]$TimeoutSec = 10)
    
    $results = @()
    
    # Test basico de URL principal
    try {
        $uri = [System.Uri]$URL
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $connectTask = $tcpClient.ConnectAsync($uri.Host, $uri.Port)
        $connectTask.Wait($TimeoutSec * 1000)
        
        if ($connectTask.IsCompleted -and -not $connectTask.IsFaulted) {
            $tcpClient.Close()
            $baseConnectivity = $true
        } else {
            $tcpClient.Close()
            $baseConnectivity = $false
        }
    }
    catch {
        $baseConnectivity = $false
    }
    
    $results += @{
        Endpoint = $URL
        Status = $baseConnectivity
        ResponseTime = if($baseConnectivity) { "TCP-OK" } else { "TCP-FAIL" }
        StatusCode = if($baseConnectivity) { "CONN" } else { "FAIL" }
    }
    
    # Test de endpoints especificos
    foreach ($endpoint in $Endpoints) {
        $fullURL = "$URL$endpoint"
        $endpointResult = @{
            Endpoint = $fullURL
            Status = $false
            ResponseTime = "N/A"
            StatusCode = "N/A"
        }
        
        try {
            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            $response = Invoke-WebRequest -Uri $fullURL -TimeoutSec $TimeoutSec -UseBasicParsing -ErrorAction Stop
            $stopwatch.Stop()
            
            $endpointResult.Status = $true
            $endpointResult.ResponseTime = "$($stopwatch.ElapsedMilliseconds)ms"
            $endpointResult.StatusCode = $response.StatusCode
        }
        catch {
            if ($stopwatch) { $stopwatch.Stop() }
            $endpointResult.Status = $false
            $endpointResult.ResponseTime = "$($stopwatch.ElapsedMilliseconds)ms"
            $endpointResult.StatusCode = $_.Exception.Message.Split("`n")[0].Substring(0, [Math]::Min(50, $_.Exception.Message.Length))
        }
        
        $results += $endpointResult
    }
    
    return $results
}

function Show-ConnectionSummary {
    param([hashtable]$Results)
    
    Clear-Host
    Write-Host "RESUMEN CONECTIVIDAD SISTEMAS UNIFICADOS" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
    Write-Host ""
    
    $totalSystems = $Results.Keys.Count
    $connectedSystems = 0
    $criticalSystemsDown = @()
    
    foreach ($systemName in $Results.Keys) {
        $system = $Systems[$systemName]
        $testResults = $Results[$systemName]
        
        # Determinar si el sistema esta conectado
        $systemConnected = $false
        $workingEndpoints = 0
        
        foreach ($result in $testResults) {
            if ($result.Status) {
                $workingEndpoints++
                $systemConnected = $true
            }
        }
        
        if ($systemConnected) { $connectedSystems++ }
        
        # Mostrar status del sistema
        $statusColor = if($systemConnected) { "Green" } else { "Red" }
        $statusText = if($systemConnected) { "ONLINE" } else { "OFFLINE" }
        
        Write-Host "$systemName [$($system.Description)]:" -ForegroundColor Cyan
        Write-Host "   Status: $statusText ($workingEndpoints/$($testResults.Count) endpoints)" -ForegroundColor $statusColor
        
        # Mostrar detalles de endpoints
        foreach ($result in $testResults) {
            $endpointColor = if($result.Status) { "Green" } else { "Red" }
            $statusIcon = if($result.Status) { "OK" } else { "FAIL" }
            Write-Host "   $statusIcon $($result.Endpoint) [$($result.ResponseTime)] [$($result.StatusCode)]" -ForegroundColor $endpointColor
        }
        
        Write-Host ""
        
        # Verificar sistemas criticos
        if ($system.Critical -and -not $systemConnected) {
            $criticalSystemsDown += $systemName
        }
    }
    
    # Resumen general
    Write-Host "RESUMEN GENERAL:" -ForegroundColor Green
    Write-Host "   Sistemas conectados: $connectedSystems/$totalSystems" -ForegroundColor White
    Write-Host "   Porcentaje conectividad: $([Math]::Round(($connectedSystems / $totalSystems) * 100, 2))%" -ForegroundColor White
    
    # Alertas sistemas criticos
    if ($criticalSystemsDown.Count -gt 0) {
        Write-Host ""
        Write-Host "SISTEMAS CRITICOS DESCONECTADOS:" -ForegroundColor Red
        foreach ($system in $criticalSystemsDown) {
            Write-Host "   ! $system - $($Systems[$system].Description)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Log detallado: $LOG_FILE" -ForegroundColor Gray
}

# Funcion principal
Write-Log "INICIANDO VERIFICACION DE CONECTIVIDAD" "INFO"
Write-Log "Sistemas a verificar: $($Systems.Keys.Count)" "INFO"
Write-Log "Log: $LOG_FILE" "INFO"

$AllResults = @{}

foreach ($systemName in $Systems.Keys) {
    $system = $Systems[$systemName]
    
    Write-Host "Verificando $systemName..." -ForegroundColor Yellow
    Write-Log "Verificando sistema: $systemName [$($system.Description)]" "INFO"
    Write-Log "URL base: $($system.URL)" "INFO"
    
    try {
        $results = Test-SystemConnectivity -URL $system.URL -Endpoints $system.Endpoints
        $AllResults[$systemName] = $results
        
        $workingEndpoints = ($results | Where-Object { $_.Status }).Count
        Write-Log "Resultado: $workingEndpoints/$($results.Count) endpoints funcionando" "INFO"
        
        foreach ($result in $results) {
            $logLevel = if($result.Status) { "SUCCESS" } else { "WARN" }
            Write-Log "  $($result.Endpoint): $($result.StatusCode) [$($result.ResponseTime)]" $logLevel
        }
    }
    catch {
        Write-Log "Error verificando sistema $systemName : $($_.Exception.Message)" "ERROR"
        $AllResults[$systemName] = @(@{
            Endpoint = $system.URL
            Status = $false
            ResponseTime = "ERROR"
            StatusCode = "EXCEPTION"
        })
    }
}

# Mostrar resumen
Show-ConnectionSummary -Results $AllResults

# Generar reporte JSON
$reportData = @{
    Timestamp = Get-Date
    Systems = $AllResults
    Summary = @{
        TotalSystems = $Systems.Keys.Count
        ConnectedSystems = ($AllResults.Keys | Where-Object { 
            ($AllResults[$_] | Where-Object { $_.Status }).Count -gt 0 
        }).Count
        CriticalSystemsDown = @($Systems.Keys | Where-Object {
            $Systems[$_].Critical -and ($AllResults[$_] | Where-Object { $_.Status }).Count -eq 0
        })
    }
}

$reportPath = "$PSScriptRoot\connectivity-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$reportData | ConvertTo-Json -Depth 10 | Out-File $reportPath -Encoding utf8

Write-Host ""
Write-Log "VERIFICACION COMPLETA" "SUCCESS"
Write-Log "Reporte JSON: $reportPath" "INFO"

# Guardar status para otros scripts
$statusData = @{
    LastCheck = Get-Date
    ConnectedSystems = ($AllResults.Keys | Where-Object { 
        ($AllResults[$_] | Where-Object { $_.Status }).Count -gt 0 
    }).Count
    TotalSystems = $Systems.Keys.Count
    CriticalSystemsOK = $Systems.Keys | Where-Object { 
        $Systems[$_].Critical 
    } | ForEach-Object { 
        ($AllResults[$_] | Where-Object { $_.Status }).Count -gt 0 
    }
}

$statusData | ConvertTo-Json | Out-File "$PSScriptRoot\last-connectivity-status.json" -Encoding utf8

pause
