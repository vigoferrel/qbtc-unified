# Actualizar Layout de Puertos QBTC - Banda Alta
# Migra configuracion de banda 3000 a banda 18000+

param(
    [switch]$Force,
    [switch]$Backup
)

Write-Host "ACTUALIZANDO LAYOUT DE PUERTOS QBTC" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

if ($Backup) {
    $backupFile = "port-config-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    Write-Host "Creando backup: $backupFile" -ForegroundColor Yellow
}

# Nuevos puertos banda alta
$NewPorts = @{
    'quantum-engine' = 18000
    'coordinator' = 18100
    'api-gateway' = 18200
    'nxn-system' = 18300
    'futures-bot' = 18400
    'options-bot' = 18500
    'websocket-service' = 18600
    'metrics-monitor' = 18700
    'logs-monitor' = 18800
    'backup-service' = 18900
}

# Verificar puertos disponibles
Write-Host "Verificando disponibilidad puertos..." -ForegroundColor Yellow
$conflicts = @()

foreach ($service in $NewPorts.Keys) {
    $port = $NewPorts[$service]
    $netstatCheck = netstat -an | Select-String ":$port "
    if ($netstatCheck) {
        $conflicts += "$service : $port (ocupado)"
    }
    else {
        Write-Host "$service : $port (disponible)" -ForegroundColor Green
    }
}

if ($conflicts.Count -gt 0 -and !$Force) {
    Write-Host "CONFLICTOS DETECTADOS:" -ForegroundColor Red
    $conflicts | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    Write-Host "Use -Force para continuar" -ForegroundColor Yellow
    exit 1
}

# Actualizar PUERTOS_LAYOUT.txt
Write-Host "Actualizando PUERTOS_LAYOUT.txt..." -ForegroundColor Cyan
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"

$layoutContent = @"
QBTC-UNIFIED | LAYOUT PUERTOS E IPs
====================================

SERVICIOS CORE:
--------------
quantum-engine    : 18000  (motor principal)
coordinator       : 18100  (coordinador bots)
api-gateway       : 18200  (gateway API)
nxn-system        : 18300  (sistema NxN)

TRADING:
--------
futures-bot       : 18400  (futuros)
options-bot       : 18500  (opciones)

SOPORTE:
--------
websocket-service : 18600  (tiempo real)
metrics-monitor   : 18700  (metricas)
logs-monitor      : 18800  (logs)
backup-service    : 18900  (backup)

CONFIGURACION:
--------------
RED_BOTS   : 192.168.100.0/24
RANGO_IPS  : 192.168.100.10-250
GATEWAY    : 192.168.100.1
DNS        : 8.8.8.8, 8.8.4.4

PUERTOS_BOTS:
TRADER_BOT     : 19000-19999
SCALPER_BOT    : 20000-20999
ARBITRAGE_BOT  : 21000-21999
QUANTUM_ANALYZER: 22000-22999

VARIABLES_ENTORNO:
------------------
`$QBTC_PORT_QUANTUM_ENGINE = 18000
`$QBTC_PORT_COORDINATOR = 18100
`$QBTC_PORT_FUTURES_BOT = 18400
`$QBTC_PORT_OPTIONS_BOT = 18500

COMANDOS:
---------
Get-PortAssignments      # Ver estado
Test-PortConflicts       # Verificar
Start-PortMappingService # Iniciar

ACTUALIZADO: $timestamp
"@

$layoutContent | Out-File -FilePath "PUERTOS_LAYOUT.txt" -Encoding UTF8

# Configurar variables de entorno
Write-Host "Configurando variables de entorno..." -ForegroundColor Cyan
foreach ($service in $NewPorts.Keys) {
    $varName = "QBTC_PORT_$($service.ToUpper().Replace('-', '_'))"
    $varValue = $NewPorts[$service]
    [Environment]::SetEnvironmentVariable($varName, $varValue, 'Process')
    Write-Host "`$$varName = $varValue" -ForegroundColor White
}

Write-Host ""
Write-Host "ACTUALIZACION COMPLETADA" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host "Archivo: PUERTOS_LAYOUT.txt actualizado" -ForegroundColor White
Write-Host "Variables de entorno configuradas" -ForegroundColor White
Write-Host "Banda de puertos: 18000-18900 (servicios)" -ForegroundColor White
Write-Host "Banda de puertos: 19000+ (bots)" -ForegroundColor White
