# QBTC Log Management Utilities
# Copyright © 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES
# Utilidades para gestión y análisis de logs del sistema QBTC

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("tail", "analyze", "export", "clean", "rotate", "search")]
    [string]$Action = "tail",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("backend", "trading", "binance", "health", "error", "all")]
    [string]$LogType = "backend",
    
    [Parameter(Mandatory=$false)]
    [int]$Lines = 100,
    
    [Parameter(Mandatory=$false)]
    [string]$SearchTerm = "",
    
    [Parameter(Mandatory=$false)]
    [int]$Days = 7
)

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Definition
$LOG_DIR = Join-Path $SCRIPT_DIR "logs"

# Mapeo de tipos de log a archivos
$LOG_FILES = @{
    "backend" = "general.log"
    "trading" = "trading.log"
    "binance" = "binance.log"
    "health" = "health.log"
    "error" = "error.log"
}

# Colores para output
$Colors = @{
    "Success" = "Green"
    "Warning" = "Yellow"
    "Error" = "Red"
    "Info" = "Cyan"
    "Debug" = "Magenta"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    
    if ($Colors.ContainsKey($Color)) {
        $ForegroundColor = $Colors[$Color]
    } else {
        $ForegroundColor = $Color
    }
    
    Write-Host $Message -ForegroundColor $ForegroundColor
}

function Get-LogFile {
    param([string]$Type)
    
    if ($Type -eq "all") {
        return Get-ChildItem -Path $LOG_DIR -Filter "*.log" | Select-Object -ExpandProperty FullName
    }
    
    if ($LOG_FILES.ContainsKey($Type)) {
        $logPath = Join-Path $LOG_DIR $LOG_FILES[$Type]
        if (Test-Path $logPath) {
            return $logPath
        }
    }
    
    return $null
}

function Show-LogTail {
    param(
        [string]$LogType,
        [int]$Lines
    )
    
    Write-ColorOutput "📜 Mostrando últimas $Lines líneas de logs: $LogType" "Info"
    Write-ColorOutput "================================================" "Info"
    
    if ($LogType -eq "all") {
        $logFiles = Get-LogFile "all"
        
        foreach ($logFile in $logFiles) {
            $fileName = Split-Path -Leaf $logFile
            Write-ColorOutput "`n--- $fileName ---" "Debug"
            
            if (Test-Path $logFile) {
                try {
                    $content = Get-Content $logFile -Tail $Lines -ErrorAction Stop
                    foreach ($line in $content) {
                        Format-LogLine $line
                    }
                } catch {
                    Write-ColorOutput "Error leyendo $fileName : $($_.Exception.Message)" "Error"
                }
            }
        }
    } else {
        $logFile = Get-LogFile $LogType
        
        if (-not $logFile) {
            Write-ColorOutput "Archivo de log no encontrado para tipo: $LogType" "Error"
            return
        }
        
        try {
            $content = Get-Content $logFile -Tail $Lines -ErrorAction Stop
            foreach ($line in $content) {
                Format-LogLine $line
            }
        } catch {
            Write-ColorOutput "Error leyendo log: $($_.Exception.Message)" "Error"
        }
    }
}

function Format-LogLine {
    param([string]$Line)
    
    # Colorear según el nivel de log
    if ($Line -match "\[ERROR\]") {
        Write-ColorOutput $Line "Error"
    } elseif ($Line -match "\[WARN\]") {
        Write-ColorOutput $Line "Warning"
    } elseif ($Line -match "\[INFO\]") {
        Write-ColorOutput $Line "Info"
    } elseif ($Line -match "\[DEBUG\]") {
        Write-ColorOutput $Line "Debug"
    } elseif ($Line -match "ORDER-\d+") {
        # Resaltar líneas de órdenes
        Write-ColorOutput $Line "Success"
    } elseif ($Line -match "BINANCE.*Request|Response") {
        # Resaltar comunicación con Binance
        Write-ColorOutput $Line "Info"
    } else {
        Write-Host $Line
    }
}

function Analyze-Logs {
    param([string]$LogType)
    
    Write-ColorOutput "📊 Analizando logs: $LogType" "Info"
    Write-ColorOutput "=========================" "Info"
    
    $logFiles = @()
    
    if ($LogType -eq "all") {
        $logFiles = Get-LogFile "all"
    } else {
        $logFile = Get-LogFile $LogType
        if ($logFile) {
            $logFiles = @($logFile)
        }
    }
    
    if ($logFiles.Count -eq 0) {
        Write-ColorOutput "No se encontraron archivos de log para analizar" "Warning"
        return
    }
    
    $analysis = @{
        TotalLines = 0
        ErrorCount = 0
        WarningCount = 0
        InfoCount = 0
        DebugCount = 0
        TradingOrders = 0
        BinanceRequests = 0
        TimeRange = @{ Start = $null; End = $null }
        TopErrors = @{}
        Performance = @{}
    }
    
    foreach ($logFile in $logFiles) {
        $fileName = Split-Path -Leaf $logFile
        Write-ColorOutput "Analizando $fileName..." "Debug"
        
        try {
            $lines = Get-Content $logFile -ErrorAction Stop
            $analysis.TotalLines += $lines.Count
            
            foreach ($line in $lines) {
                # Contar niveles de log
                if ($line -match "\[ERROR\]") { $analysis.ErrorCount++ }
                elseif ($line -match "\[WARN\]") { $analysis.WarningCount++ }
                elseif ($line -match "\[INFO\]") { $analysis.InfoCount++ }
                elseif ($line -match "\[DEBUG\]") { $analysis.DebugCount++ }
                
                # Contar órdenes de trading
                if ($line -match "ORDER-\d+") { $analysis.TradingOrders++ }
                
                # Contar requests a Binance
                if ($line -match "BINANCE.*Request") { $analysis.BinanceRequests++ }
                
                # Extraer timestamps para rango de tiempo
                if ($line -match "\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[^\]]*)\]") {
                    try {
                        $timestamp = [DateTime]::Parse($matches[1])
                        if (-not $analysis.TimeRange.Start -or $timestamp -lt $analysis.TimeRange.Start) {
                            $analysis.TimeRange.Start = $timestamp
                        }
                        if (-not $analysis.TimeRange.End -or $timestamp -gt $analysis.TimeRange.End) {
                            $analysis.TimeRange.End = $timestamp
                        }
                    } catch {
                        # Ignorar errores de parsing de timestamp
                    }
                }
                
                # Analizar errores específicos
                if ($line -match "\[ERROR\].*: (.*?)(\s|$)") {
                    $errorType = $matches[1]
                    if ($analysis.TopErrors.ContainsKey($errorType)) {
                        $analysis.TopErrors[$errorType]++
                    } else {
                        $analysis.TopErrors[$errorType] = 1
                    }
                }
                
                # Analizar tiempos de respuesta
                if ($line -match "(\d+)ms\)") {
                    $responseTime = [int]$matches[1]
                    if (-not $analysis.Performance.ContainsKey('ResponseTimes')) {
                        $analysis.Performance['ResponseTimes'] = @()
                    }
                    $analysis.Performance['ResponseTimes'] += $responseTime
                }
            }
        } catch {
            Write-ColorOutput "Error analizando $fileName : $($_.Exception.Message)" "Error"
        }
    }
    
    # Mostrar resultados del análisis
    Write-ColorOutput "`n📈 Resumen del Análisis:" "Success"
    Write-ColorOutput "Total de líneas: $($analysis.TotalLines)" "Info"
    Write-ColorOutput "Errores: $($analysis.ErrorCount)" "Error"
    Write-ColorOutput "Advertencias: $($analysis.WarningCount)" "Warning"
    Write-ColorOutput "Info: $($analysis.InfoCount)" "Info"
    Write-ColorOutput "Debug: $($analysis.DebugCount)" "Debug"
    Write-ColorOutput "Órdenes de trading: $($analysis.TradingOrders)" "Success"
    Write-ColorOutput "Requests a Binance: $($analysis.BinanceRequests)" "Info"
    
    if ($analysis.TimeRange.Start -and $analysis.TimeRange.End) {
        $duration = $analysis.TimeRange.End - $analysis.TimeRange.Start
        Write-ColorOutput "Rango de tiempo: $($analysis.TimeRange.Start) - $($analysis.TimeRange.End)" "Debug"
        Write-ColorOutput "Duración: $($duration.TotalHours.ToString('F2')) horas" "Debug"
    }
    
    # Top errores
    if ($analysis.TopErrors.Count -gt 0) {
        Write-ColorOutput "`n🔥 Top Errores:" "Warning"
        $analysis.TopErrors.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 5 | ForEach-Object {
            Write-ColorOutput "  $($_.Key): $($_.Value) veces" "Error"
        }
    }
    
    # Estadísticas de performance
    if ($analysis.Performance.ContainsKey('ResponseTimes') -and $analysis.Performance['ResponseTimes'].Count -gt 0) {
        $responseTimes = $analysis.Performance['ResponseTimes']
        $avgResponse = ($responseTimes | Measure-Object -Average).Average
        $maxResponse = ($responseTimes | Measure-Object -Maximum).Maximum
        $minResponse = ($responseTimes | Measure-Object -Minimum).Minimum
        
        Write-ColorOutput "`n⚡ Estadísticas de Performance:" "Success"
        Write-ColorOutput "  Tiempo de respuesta promedio: $($avgResponse.ToString('F2'))ms" "Info"
        Write-ColorOutput "  Tiempo máximo: ${maxResponse}ms" "Warning"
        Write-ColorOutput "  Tiempo mínimo: ${minResponse}ms" "Success"
    }
}

function Search-Logs {
    param(
        [string]$LogType,
        [string]$SearchTerm
    )
    
    if ([string]::IsNullOrEmpty($SearchTerm)) {
        Write-ColorOutput "Término de búsqueda requerido" "Error"
        return
    }
    
    Write-ColorOutput "🔍 Buscando '$SearchTerm' en logs: $LogType" "Info"
    Write-ColorOutput "============================================" "Info"
    
    $logFiles = @()
    
    if ($LogType -eq "all") {
        $logFiles = Get-LogFile "all"
    } else {
        $logFile = Get-LogFile $LogType
        if ($logFile) {
            $logFiles = @($logFile)
        }
    }
    
    if ($logFiles.Count -eq 0) {
        Write-ColorOutput "No se encontraron archivos de log" "Warning"
        return
    }
    
    $matchCount = 0
    
    foreach ($logFile in $logFiles) {
        $fileName = Split-Path -Leaf $logFile
        
        try {
            $matches = Select-String -Path $logFile -Pattern $SearchTerm -AllMatches
            
            if ($matches.Count -gt 0) {
                Write-ColorOutput "`n--- Resultados en $fileName ($($matches.Count) coincidencias) ---" "Success"
                
                foreach ($match in $matches) {
                    $lineNumber = $match.LineNumber
                    $line = $match.Line
                    
                    # Resaltar el término buscado
                    $highlightedLine = $line -replace "($SearchTerm)", ">>$1<<"
                    Write-ColorOutput "[$lineNumber]: $highlightedLine" "Info"
                }
                
                $matchCount += $matches.Count
            }
        } catch {
            Write-ColorOutput "Error buscando en $fileName : $($_.Exception.Message)" "Error"
        }
    }
    
    if ($matchCount -eq 0) {
        Write-ColorOutput "No se encontraron coincidencias para '$SearchTerm'" "Warning"
    } else {
        Write-ColorOutput "`n✅ Total de coincidencias encontradas: $matchCount" "Success"
    }
}

function Export-Logs {
    param([string]$LogType)
    
    $exportDir = Join-Path $SCRIPT_DIR "exports"
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $exportFile = Join-Path $exportDir "qbtc_logs_${timestamp}.zip"
    
    if (-not (Test-Path $exportDir)) {
        New-Item -ItemType Directory -Path $exportDir -Force | Out-Null
    }
    
    Write-ColorOutput "📦 Exportando logs a: $exportFile" "Info"
    
    try {
        if ($LogType -eq "all") {
            # Comprimir todo el directorio de logs
            Compress-Archive -Path "$LOG_DIR\*" -DestinationPath $exportFile -Force
        } else {
            $logFile = Get-LogFile $LogType
            if ($logFile) {
                Compress-Archive -Path $logFile -DestinationPath $exportFile -Force
            } else {
                Write-ColorOutput "Archivo de log no encontrado para tipo: $LogType" "Error"
                return
            }
        }
        
        $exportInfo = Get-Item $exportFile
        $sizeKB = [math]::Round($exportInfo.Length / 1KB, 2)
        
        Write-ColorOutput "✅ Exportación completada" "Success"
        Write-ColorOutput "Archivo: $exportFile" "Info"
        Write-ColorOutput "Tamaño: ${sizeKB} KB" "Debug"
        
    } catch {
        Write-ColorOutput "Error durante la exportación: $($_.Exception.Message)" "Error"
    }
}

function Clean-Logs {
    param([int]$Days)
    
    Write-ColorOutput "🧹 Limpiando logs anteriores a $Days días..." "Info"
    
    $cutoffDate = (Get-Date).AddDays(-$Days)
    $deletedCount = 0
    $freedSpace = 0
    
    try {
        $oldLogFiles = Get-ChildItem -Path $LOG_DIR -Filter "*.log.*" | Where-Object {
            $_.LastWriteTime -lt $cutoffDate
        }
        
        foreach ($file in $oldLogFiles) {
            $freedSpace += $file.Length
            Remove-Item $file.FullName -Force
            $deletedCount++
            Write-ColorOutput "Eliminado: $($file.Name)" "Debug"
        }
        
        if ($deletedCount -gt 0) {
            $freedSpaceMB = [math]::Round($freedSpace / 1MB, 2)
            Write-ColorOutput "✅ Limpieza completada" "Success"
            Write-ColorOutput "Archivos eliminados: $deletedCount" "Info"
            Write-ColorOutput "Espacio liberado: ${freedSpaceMB} MB" "Success"
        } else {
            Write-ColorOutput "No se encontraron archivos antiguos para limpiar" "Info"
        }
        
    } catch {
        Write-ColorOutput "Error durante la limpieza: $($_.Exception.Message)" "Error"
    }
}

function Rotate-Logs {
    Write-ColorOutput "🔄 Rotando archivos de log..." "Info"
    
    $rotatedCount = 0
    
    foreach ($logType in $LOG_FILES.Keys) {
        $logFile = Join-Path $LOG_DIR $LOG_FILES[$logType]
        
        if (Test-Path $logFile) {
            try {
                $fileInfo = Get-Item $logFile
                $sizeKB = [math]::Round($fileInfo.Length / 1KB, 2)
                
                # Rotar si el archivo es mayor a 10MB
                if ($fileInfo.Length -gt 10MB) {
                    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
                    $backupFile = "$logFile.$timestamp"
                    
                    Move-Item $logFile $backupFile
                    New-Item $logFile -ItemType File | Out-Null
                    
                    Write-ColorOutput "Rotado: $($LOG_FILES[$logType]) (${sizeKB} KB)" "Success"
                    $rotatedCount++
                }
                
            } catch {
                Write-ColorOutput "Error rotando $($LOG_FILES[$logType]): $($_.Exception.Message)" "Error"
            }
        }
    }
    
    if ($rotatedCount -gt 0) {
        Write-ColorOutput "✅ Rotación completada: $rotatedCount archivos rotados" "Success"
    } else {
        Write-ColorOutput "No se requirió rotación de archivos" "Info"
    }
}

# Función principal
function Main {
    Write-ColorOutput "`n🛠️  QBTC Log Utilities v1.0" "Info"
    Write-ColorOutput "Acción: $Action | Tipo: $LogType" "Debug"
    
    if (-not (Test-Path $LOG_DIR)) {
        Write-ColorOutput "Directorio de logs no encontrado: $LOG_DIR" "Error"
        return
    }
    
    switch ($Action.ToLower()) {
        "tail" {
            Show-LogTail -LogType $LogType -Lines $Lines
        }
        "analyze" {
            Analyze-Logs -LogType $LogType
        }
        "search" {
            Search-Logs -LogType $LogType -SearchTerm $SearchTerm
        }
        "export" {
            Export-Logs -LogType $LogType
        }
        "clean" {
            Clean-Logs -Days $Days
        }
        "rotate" {
            Rotate-Logs
        }
        default {
            Write-ColorOutput "Acción no reconocida: $Action" "Error"
            Write-ColorOutput "Acciones disponibles: tail, analyze, search, export, clean, rotate" "Info"
        }
    }
}

# Ejecutar función principal
Main
