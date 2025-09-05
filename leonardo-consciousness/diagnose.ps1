# Leonardo Consciousness System - Herramientas de Diagnóstico Avanzado
# Script PowerShell para análisis detallado del sistema y detección de problemas

param(
    [string]$Command = "help",
    [int]$Samples = 10,
    [int]$Interval = 2
)

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                LEONARDO CONSCIOUSNESS DIAGNOSTICS                ║" -ForegroundColor Yellow
Write-Host "║                    Herramientas de Diagnóstico                   ║" -ForegroundColor Yellow
Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Función para medir latencia de la API
function Test-APILatency {
    Write-Host "═══ MIDIENDO LATENCIA DE API ═══" -ForegroundColor Yellow
    Write-Host ""
    
    $latencies = @()
    $errors = 0
    
    for ($i = 1; $i -le $Samples; $i++) {
        Write-Host "Muestra $i/$Samples..." -ForegroundColor Cyan
        
        try {
            $measurement = Measure-Command {
                $response = Invoke-RestMethod -Uri "http://localhost:3003/api/status" -Method GET -TimeoutSec 10
            }
            
            $latencyMs = [Math]::Round($measurement.TotalMilliseconds, 2)
            $latencies += $latencyMs
            
            $color = "Green"
            if ($latencyMs -gt 1000) { $color = "Red" }
            elseif ($latencyMs -gt 500) { $color = "Yellow" }
            
            Write-Host "  └─ Latencia: $latencyMs ms" -ForegroundColor $color
            
        } catch {
            $errors++
            Write-Host "  └─ ERROR: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        if ($i -lt $Samples) { Start-Sleep -Seconds $Interval }
    }
    
    if ($latencies.Count -gt 0) {
        $avgLatency = [Math]::Round(($latencies | Measure-Object -Average).Average, 2)
        $minLatency = ($latencies | Measure-Object -Minimum).Minimum
        $maxLatency = ($latencies | Measure-Object -Maximum).Maximum
        
        Write-Host ""
        Write-Host "RESULTADOS DE LATENCIA:" -ForegroundColor Green
        Write-Host "├─ Promedio: $avgLatency ms" -ForegroundColor White
        Write-Host "├─ Mínimo: $minLatency ms" -ForegroundColor Green
        Write-Host "├─ Máximo: $maxLatency ms" -ForegroundColor $(if ($maxLatency -gt 1000) { "Red" } else { "White" })
        Write-Host "├─ Errores: $errors/$Samples" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })
        Write-Host "└─ Tasa de éxito: $([Math]::Round((($Samples - $errors) / $Samples) * 100, 2))%" -ForegroundColor Green
    }
    Write-Host ""
}

# Función para analizar uso de memoria en detalle
function Test-MemoryUsage {
    Write-Host "═══ ANÁLISIS DE MEMORIA ═══" -ForegroundColor Yellow
    Write-Host ""
    
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    
    if ($nodeProcesses) {
        foreach ($process in $nodeProcesses) {
            Write-Host "Proceso Node.js - PID: $($process.Id)" -ForegroundColor Green
            
            # Memoria virtual y física
            $workingSetMB = [Math]::Round($process.WorkingSet64 / 1MB, 2)
            $virtualMemoryMB = [Math]::Round($process.VirtualMemorySize64 / 1MB, 2)
            $privateMemoryMB = [Math]::Round($process.PrivateMemorySize64 / 1MB, 2)
            
            Write-Host "├─ Working Set (RAM física): $workingSetMB MB" -ForegroundColor White
            Write-Host "├─ Virtual Memory: $virtualMemoryMB MB" -ForegroundColor White  
            Write-Host "├─ Private Memory: $privateMemoryMB MB" -ForegroundColor White
            Write-Host "├─ Threads: $($process.Threads.Count)" -ForegroundColor Cyan
            Write-Host "├─ Handles: $($process.HandleCount)" -ForegroundColor Cyan
            
            # Análisis de threads
            $threadInfo = $process.Threads | Group-Object ThreadState | Sort-Object Count -Descending
            Write-Host "├─ Estados de threads:" -ForegroundColor Yellow
            foreach ($state in $threadInfo) {
                Write-Host "│  └─ $($state.Name): $($state.Count) threads" -ForegroundColor Gray
            }
            
            # Tiempo de CPU
            $cpuTime = $process.TotalProcessorTime
            Write-Host "└─ Tiempo total de CPU: $($cpuTime.TotalSeconds.ToString('F2')) segundos" -ForegroundColor White
            Write-Host ""
        }
    } else {
        Write-Host "No se encontraron procesos Node.js" -ForegroundColor Red
    }
    
    # Información del sistema
    Write-Host "MEMORIA DEL SISTEMA:" -ForegroundColor Green
    try {
        $computerInfo = Get-ComputerInfo
        $totalRAM = [Math]::Round($computerInfo.TotalPhysicalMemory / 1GB, 2)
        $availableRAM = [Math]::Round($computerInfo.AvailablePhysicalMemory / 1GB, 2)
        $usedRAM = $totalRAM - $availableRAM
        $usedPercent = [Math]::Round(($usedRAM / $totalRAM) * 100, 2)
        
        Write-Host "├─ Total: $totalRAM GB" -ForegroundColor White
        Write-Host "├─ Disponible: $availableRAM GB" -ForegroundColor Green
        Write-Host "├─ En uso: $usedRAM GB" -ForegroundColor White
        Write-Host "└─ Uso: $usedPercent%" -ForegroundColor $(if ($usedPercent -gt 90) { "Red" } elseif ($usedPercent -gt 80) { "Yellow" } else { "Green" })
    } catch {
        Write-Host "├─ Error obteniendo información del sistema" -ForegroundColor Red
    }
    Write-Host ""
}

# Función para analizar conexiones de red
function Test-NetworkConnections {
    Write-Host "═══ ANÁLISIS DE CONEXIONES DE RED ═══" -ForegroundColor Yellow
    Write-Host ""
    
    # Puertos específicos de Leonardo
    $leonardoPorts = @(3003, 8080, 3000)
    
    foreach ($port in $leonardoPorts) {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        
        if ($connections) {
            Write-Host "Puerto $port - Estado: ACTIVO" -ForegroundColor Green
            foreach ($conn in $connections) {
                Write-Host "├─ Estado: $($conn.State)" -ForegroundColor White
                Write-Host "├─ Dirección local: $($conn.LocalAddress):$($conn.LocalPort)" -ForegroundColor Cyan
                if ($conn.RemoteAddress -ne "0.0.0.0" -and $conn.RemoteAddress -ne "::") {
                    Write-Host "├─ Dirección remota: $($conn.RemoteAddress):$($conn.RemotePort)" -ForegroundColor Cyan
                }
                Write-Host "└─ PID propietario: $($conn.OwningProcess)" -ForegroundColor Gray
            }
        } else {
            Write-Host "Puerto $port - Estado: INACTIVO" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    # Estadísticas de red generales
    Write-Host "ESTADÍSTICAS DE RED:" -ForegroundColor Green
    try {
        $netStats = Get-NetTCPConnection | Group-Object State | Sort-Object Count -Descending
        foreach ($stat in $netStats) {
            Write-Host "├─ $($stat.Name): $($stat.Count) conexiones" -ForegroundColor White
        }
    } catch {
        Write-Host "├─ No se pudieron obtener estadísticas de red" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Función para buscar bloqueos y locks
function Test-FileLocks {
    Write-Host "═══ ANÁLISIS DE LOCKS Y BLOQUEOS ═══" -ForegroundColor Yellow
    Write-Host ""
    
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    
    if ($nodeProcesses) {
        foreach ($process in $nodeProcesses) {
            Write-Host "Proceso Node.js - PID: $($process.Id)" -ForegroundColor Green
            
            # Intentar obtener información de handles
            try {
                # Usar Get-Process para obtener información básica de handles
                Write-Host "├─ Total de handles: $($process.HandleCount)" -ForegroundColor White
                
                # Verificar archivos abiertos en el directorio del proyecto
                $currentDir = Get-Location
                $openFiles = @()
                
                # Buscar archivos de log que podrían estar bloqueados
                $logFiles = Get-ChildItem -Path "logs" -File -ErrorAction SilentlyContinue
                if ($logFiles) {
                    Write-Host "├─ Archivos de log encontrados:" -ForegroundColor Cyan
                    foreach ($file in $logFiles) {
                        try {
                            # Intentar abrir el archivo para verificar si está bloqueado
                            $stream = [System.IO.File]::Open($file.FullName, 'Open', 'Read', 'ReadWrite')
                            $stream.Close()
                            Write-Host "│  ├─ $($file.Name): LIBRE" -ForegroundColor Green
                        } catch {
                            Write-Host "│  ├─ $($file.Name): BLOQUEADO" -ForegroundColor Red
                            $openFiles += $file.Name
                        }
                    }
                } else {
                    Write-Host "├─ No se encontraron archivos de log" -ForegroundColor Yellow
                }
                
                Write-Host "└─ Archivos potencialmente bloqueados: $($openFiles.Count)" -ForegroundColor $(if ($openFiles.Count -gt 0) { "Yellow" } else { "Green" })
                
            } catch {
                Write-Host "└─ Error analizando handles: $($_.Exception.Message)" -ForegroundColor Red
            }
            Write-Host ""
        }
    } else {
        Write-Host "No se encontraron procesos Node.js para analizar" -ForegroundColor Red
    }
}

# Función para análisis de rendimiento de CPU
function Test-CPUPerformance {
    Write-Host "═══ ANÁLISIS DE RENDIMIENTO DE CPU ═══" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "Recolectando muestras de CPU durante $($Samples * $Interval) segundos..." -ForegroundColor Cyan
    
    $cpuSamples = @()
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    
    for ($i = 1; $i -le $Samples; $i++) {
        Write-Host "Muestra $i/$Samples..." -ForegroundColor Gray
        
        # CPU del sistema
        try {
            $systemCpu = Get-Counter "\Processor(_Total)\% Processor Time" -SampleInterval 1 -ErrorAction SilentlyContinue
            $systemCpuPercent = [Math]::Round($systemCpu.CounterSamples[0].CookedValue, 2)
            
            Write-Host "  ├─ CPU del sistema: $systemCpuPercent%" -ForegroundColor White
            
        } catch {
            Write-Host "  ├─ No se pudo obtener CPU del sistema" -ForegroundColor Yellow
        }
        
        # CPU de procesos Node.js
        if ($nodeProcesses) {
            foreach ($process in $nodeProcesses) {
                try {
                    $processName = $process.ProcessName
                    $processCpu = Get-Counter "\Process($processName)\% Processor Time" -SampleInterval 1 -ErrorAction SilentlyContinue
                    $processCpuPercent = [Math]::Round($processCpu.CounterSamples[0].CookedValue, 2)
                    
                    Write-Host "  └─ CPU Node.js (PID: $($process.Id)): $processCpuPercent%" -ForegroundColor Cyan
                    $cpuSamples += $processCpuPercent
                    
                } catch {
                    Write-Host "  └─ Error obteniendo CPU del proceso $($process.Id)" -ForegroundColor Red
                }
            }
        }
        
        if ($i -lt $Samples) { Start-Sleep -Seconds $Interval }
    }
    
    if ($cpuSamples.Count -gt 0) {
        $avgCpu = [Math]::Round(($cpuSamples | Measure-Object -Average).Average, 2)
        $maxCpu = ($cpuSamples | Measure-Object -Maximum).Maximum
        
        Write-Host ""
        Write-Host "RESUMEN DE CPU:" -ForegroundColor Green
        Write-Host "├─ CPU promedio Node.js: $avgCpu%" -ForegroundColor White
        Write-Host "├─ CPU máximo Node.js: $maxCpu%" -ForegroundColor $(if ($maxCpu -gt 80) { "Red" } elseif ($maxCpu -gt 50) { "Yellow" } else { "Green" })
        Write-Host "└─ Muestras analizadas: $($cpuSamples.Count)" -ForegroundColor Gray
    }
    Write-Host ""
}

# Función para verificar logs y errores
function Test-LogAnalysis {
    Write-Host "═══ ANÁLISIS DE LOGS ═══" -ForegroundColor Yellow
    Write-Host ""
    
    $logDirectory = "logs"
    if (Test-Path -Path $logDirectory) {
        $logFiles = Get-ChildItem -Path $logDirectory -File | Sort-Object LastWriteTime -Descending
        
        Write-Host "ARCHIVOS DE LOG ENCONTRADOS:" -ForegroundColor Green
        foreach ($file in $logFiles) {
            $sizeKB = [Math]::Round($file.Length / 1KB, 2)
            $age = (Get-Date) - $file.LastWriteTime
            
            Write-Host "├─ $($file.Name)" -ForegroundColor Cyan
            Write-Host "│  ├─ Tamaño: $sizeKB KB" -ForegroundColor White
            Write-Host "│  ├─ Modificado: $($file.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Gray
            Write-Host "│  └─ Antigüedad: $($age.Days)d $($age.Hours)h $($age.Minutes)m" -ForegroundColor Gray
        }
        Write-Host ""
        
        # Analizar errores en los logs más recientes
        $recentLogs = $logFiles | Select-Object -First 3
        foreach ($logFile in $recentLogs) {
            Write-Host "ANALIZANDO: $($logFile.Name)" -ForegroundColor Yellow
            
            try {
                $content = Get-Content -Path $logFile.FullName -ErrorAction SilentlyContinue
                $errorLines = $content | Where-Object { $_ -match "\[ERROR\]|\bERROR\b|\bFAILED\b|\bCRITICAL\b" }
                $warningLines = $content | Where-Object { $_ -match "\[WARNING\]|\[WARN\]|\bWARNING\b" }
                
                Write-Host "├─ Total de líneas: $($content.Count)" -ForegroundColor White
                Write-Host "├─ Errores encontrados: $($errorLines.Count)" -ForegroundColor $(if ($errorLines.Count -gt 0) { "Red" } else { "Green" })
                Write-Host "└─ Warnings encontrados: $($warningLines.Count)" -ForegroundColor $(if ($warningLines.Count -gt 0) { "Yellow" } else { "Green" })
                
                if ($errorLines.Count -gt 0) {
                    Write-Host "   ERRORES RECIENTES:" -ForegroundColor Red
                    $errorLines | Select-Object -Last 3 | ForEach-Object {
                        Write-Host "   └─ $_" -ForegroundColor Red
                    }
                }
                
            } catch {
                Write-Host "└─ Error leyendo archivo: $($_.Exception.Message)" -ForegroundColor Red
            }
            Write-Host ""
        }
        
    } else {
        Write-Host "Directorio de logs no encontrado: $logDirectory" -ForegroundColor Yellow
    }
}

# Función para generar reporte completo
function New-CompleteReport {
    $reportFile = "logs/diagnostics-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
    
    Write-Host "═══ GENERANDO REPORTE COMPLETO ═══" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Generando reporte en: $reportFile" -ForegroundColor Cyan
    
    # Crear directorio si no existe
    if (!(Test-Path -Path "logs")) {
        New-Item -ItemType Directory -Path "logs" -Force | Out-Null
    }
    
    $report = @"
LEONARDO CONSCIOUSNESS SYSTEM - REPORTE DE DIAGNÓSTICO
======================================================
Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Ejecutado desde: $(Get-Location)

"@
    
    Add-Content -Path $reportFile -Value $report
    
    # Ejecutar todas las pruebas y capturar salida
    Write-Host "LATENCIA DE API:" -ForegroundColor Yellow
    Test-APILatency | Out-String | Add-Content -Path $reportFile
    
    Write-Host "USO DE MEMORIA:" -ForegroundColor Yellow
    Test-MemoryUsage | Out-String | Add-Content -Path $reportFile
    
    Write-Host "CONEXIONES DE RED:" -ForegroundColor Yellow
    Test-NetworkConnections | Out-String | Add-Content -Path $reportFile
    
    Write-Host "RENDIMIENTO DE CPU:" -ForegroundColor Yellow
    Test-CPUPerformance | Out-String | Add-Content -Path $reportFile
    
    Write-Host "ANÁLISIS DE LOGS:" -ForegroundColor Yellow
    Test-LogAnalysis | Out-String | Add-Content -Path $reportFile
    
    Write-Host "Reporte completo generado en: $reportFile" -ForegroundColor Green
}

# Función de ayuda
function Show-Help {
    Write-Host "LEONARDO CONSCIOUSNESS DIAGNOSTICS - Comandos disponibles:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  latency       Medir latencia de API (samples: $Samples, interval: $Interval)" -ForegroundColor Green
    Write-Host "  memory        Análisis detallado de uso de memoria" -ForegroundColor Green
    Write-Host "  network       Análisis de conexiones de red" -ForegroundColor Green
    Write-Host "  locks         Detectar bloqueos y locks de archivos" -ForegroundColor Green
    Write-Host "  cpu           Análisis de rendimiento de CPU" -ForegroundColor Green
    Write-Host "  logs          Análisis de logs y errores" -ForegroundColor Green
    Write-Host "  report        Generar reporte completo" -ForegroundColor Green
    Write-Host "  help          Mostrar esta ayuda" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ejemplos de uso:" -ForegroundColor Cyan
    Write-Host "  .\diagnose.ps1 -Command latency -Samples 20 -Interval 1" -ForegroundColor Gray
    Write-Host "  .\diagnose.ps1 -Command cpu -Samples 15" -ForegroundColor Gray
    Write-Host "  .\diagnose.ps1 -Command report" -ForegroundColor Gray
    Write-Host ""
}

# Router principal
switch ($Command.ToLower()) {
    "latency" { Test-APILatency }
    "memory" { Test-MemoryUsage }
    "network" { Test-NetworkConnections }
    "locks" { Test-FileLocks }
    "cpu" { Test-CPUPerformance }
    "logs" { Test-LogAnalysis }
    "report" { New-CompleteReport }
    "help" { Show-Help }
    default {
        Write-Host "Comando no reconocido: $Command" -ForegroundColor Red
        Write-Host ""
        Show-Help
    }
}
