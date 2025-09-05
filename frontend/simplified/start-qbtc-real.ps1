# QBTC Real System Startup Script
Write-Host "🚀 Iniciando QBTC Real System..."

# Configuración de puertos
$PORTS = @{
    MAIN_SERVER = 8080          # Frontend y Backend principal
    QUANTUM_CORE = 9090         # Núcleo cuántico
    TRADING_ENGINE = 9091       # Motor de trading
    MARKET_DATA = 9092          # Datos de mercado
    MONITORING = 9093           # Sistema de monitoreo
}

# Verificar que los puertos estén disponibles
foreach ($port in $PORTS.Values) {
    $testConnection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
    if ($testConnection.TcpTestSucceeded) {
        Write-Host "❌ Error: Puerto $port ya está en uso"
        exit 1
    }
}

# Iniciar servicios en orden correcto
try {
    # 1. Iniciar núcleo cuántico
    Write-Host "📡 Iniciando Núcleo Cuántico..."
    Start-Process node -ArgumentList "../quantum-core/index.js" -WindowStyle Hidden

    # 2. Iniciar coordinator
    Write-Host "💹 Iniciando Coordinador..."
    Start-Process node -ArgumentList "../coordinator/index.js" -WindowStyle Hidden

    # 3. Iniciar frontend
    Write-Host "🖥️ Iniciando Frontend..."
    Start-Process "http://localhost:$($PORTS.MAIN_SERVER)"

    Write-Host "✅ Sistema QBTC iniciado correctamente"
    Write-Host "📊 Dashboard disponible en: http://localhost:$($PORTS.MAIN_SERVER)"

} catch {
    Write-Host "❌ Error iniciando servicios: $_"
    exit 1
}
