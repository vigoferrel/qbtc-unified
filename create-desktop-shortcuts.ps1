# ========================================================================
# GENERADOR DE ACCESOS DIRECTOS QBTC-UNIFIED
# Crea accesos directos en el escritorio para lanzar el sistema
# ========================================================================

$Host.UI.RawUI.OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "CREANDO ACCESOS DIRECTOS QBTC-UNIFIED EN ESCRITORIO" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Yellow

# Rutas
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$QBTC_ROOT = "C:\Users\DELL\Desktop\QBTC-UNIFIED"
$Shell = New-Object -ComObject WScript.Shell

Write-Host "Desktop: $DesktopPath" -ForegroundColor Green
Write-Host "QBTC Root: $QBTC_ROOT" -ForegroundColor Green
Write-Host ""

function Create-Shortcut {
    param(
        [string]$ShortcutName,
        [string]$TargetPath,
        [string]$Arguments = "",
        [string]$Description,
        [string]$IconLocation = "",
        [string]$WindowStyle = "1"
    )
    
    try {
        $ShortcutPath = Join-Path $DesktopPath "$ShortcutName.lnk"
        $Shortcut = $Shell.CreateShortcut($ShortcutPath)
        $Shortcut.TargetPath = $TargetPath
        $Shortcut.Arguments = $Arguments
        $Shortcut.WorkingDirectory = $QBTC_ROOT
        $Shortcut.Description = $Description
        $Shortcut.WindowStyle = [int]$WindowStyle  # 1=Normal, 3=Maximized, 7=Minimized
        
        if ($IconLocation -ne "") {
            $Shortcut.IconLocation = $IconLocation
        }
        
        $Shortcut.Save()
        Write-Host "✓ Creado: $ShortcutName.lnk" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "✗ Error creando $ShortcutName : $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "Creando accesos directos..." -ForegroundColor Yellow
Write-Host ""

# 1. Acceso directo principal - Lanzamiento completo con monitoreo
$success1 = Create-Shortcut -ShortcutName "🚀 QBTC-UNIFIED (Monitor)" `
    -TargetPath "powershell.exe" `
    -Arguments "-ExecutionPolicy Bypass -NoExit -Command `"cd '$QBTC_ROOT'; .\LAUNCH-QBTC-UNIFIED.ps1 -Monitor`"" `
    -Description "Lanza QBTC-UNIFIED completo con monitoreo en tiempo real" `
    -WindowStyle "3"

# 2. Acceso directo en segundo plano
$success2 = Create-Shortcut -ShortcutName "⚡ QBTC-UNIFIED (Background)" `
    -TargetPath "powershell.exe" `
    -Arguments "-ExecutionPolicy Bypass -WindowStyle Hidden -Command `"cd '$QBTC_ROOT'; .\LAUNCH-QBTC-UNIFIED.ps1 -Background`"" `
    -Description "Lanza QBTC-UNIFIED en segundo plano silencioso" `
    -WindowStyle "7"

# 3. Acceso directo ultra-simple usando CMD
$success3 = Create-Shortcut -ShortcutName "🌊 QBTC-START (Simple)" `
    -TargetPath "$QBTC_ROOT\QBTC-START.cmd" `
    -Description "Lanzamiento ultra-simple de QBTC-UNIFIED" `
    -WindowStyle "3"

# 4. Acceso directo solo frontend
$success4 = Create-Shortcut -ShortcutName "🎯 QBTC Frontend (8080)" `
    -TargetPath "powershell.exe" `
    -Arguments "-ExecutionPolicy Bypass -NoExit -Command `"cd '$QBTC_ROOT'; .\LAUNCH-QBTC-UNIFIED.ps1 -Mode Frontend -Monitor`"" `
    -Description "Solo frontend QBTC en puerto 8080 con monitoreo" `
    -WindowStyle "1"

# 5. Acceso directo solo backend
$success5 = Create-Shortcut -ShortcutName "🔧 QBTC Backend (3003)" `
    -TargetPath "powershell.exe" `
    -Arguments "-ExecutionPolicy Bypass -NoExit -Command `"cd '$QBTC_ROOT'; .\LAUNCH-QBTC-UNIFIED.ps1 -Mode Backend -Monitor`"" `
    -Description "Solo backend Leonardo en puerto 3003 con monitoreo" `
    -WindowStyle "1"

# 6. Acceso directo rapido
$success6 = Create-Shortcut -ShortcutName "⚡ QBTC-QUICK" `
    -TargetPath "powershell.exe" `
    -Arguments "-ExecutionPolicy Bypass -Command `"cd '$QBTC_ROOT'; .\LAUNCH-QBTC-UNIFIED.ps1 -Quick -Background; Start-Sleep 3`"" `
    -Description "Lanzamiento ultra-rapido de QBTC-UNIFIED" `
    -WindowStyle "7"

# 7. Acceso directo al frontend web
$success7 = Create-Shortcut -ShortcutName "🌐 QBTC Web Interface" `
    -TargetPath "http://localhost:8080" `
    -Description "Abrir interfaz web QBTC-UNIFIED en navegador" `
    -WindowStyle "1"

# 8. Acceso directo para detener todos los procesos
$success8 = Create-Shortcut -ShortcutName "🛑 STOP QBTC Processes" `
    -TargetPath "powershell.exe" `
    -Arguments "-ExecutionPolicy Bypass -Command `"Get-Process -Name 'node' | Stop-Process -Force; Write-Host 'Todos los procesos QBTC detenidos' -ForegroundColor Green; Start-Sleep 3`"" `
    -Description "Detener todos los procesos QBTC-UNIFIED" `
    -WindowStyle "1"

Write-Host ""
Write-Host "RESUMEN DE ACCESOS DIRECTOS CREADOS:" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Yellow

$shortcuts = @(
    @{ Name = "🚀 QBTC-UNIFIED (Monitor)"; Desc = "Lanzamiento completo con monitoreo visual"; Success = $success1 },
    @{ Name = "⚡ QBTC-UNIFIED (Background)"; Desc = "Lanzamiento en segundo plano"; Success = $success2 },
    @{ Name = "🌊 QBTC-START (Simple)"; Desc = "Lanzamiento ultra-simple"; Success = $success3 },
    @{ Name = "🎯 QBTC Frontend (8080)"; Desc = "Solo frontend puerto 8080"; Success = $success4 },
    @{ Name = "🔧 QBTC Backend (3003)"; Desc = "Solo backend puerto 3003"; Success = $success5 },
    @{ Name = "⚡ QBTC-QUICK"; Desc = "Lanzamiento ultra-rapido"; Success = $success6 },
    @{ Name = "🌐 QBTC Web Interface"; Desc = "Abrir en navegador"; Success = $success7 },
    @{ Name = "🛑 STOP QBTC Processes"; Desc = "Detener todos los procesos"; Success = $success8 }
)

foreach ($shortcut in $shortcuts) {
    $status = if ($shortcut.Success) { "✓" } else { "✗" }
    $color = if ($shortcut.Success) { "Green" } else { "Red" }
    Write-Host "$status $($shortcut.Name)" -ForegroundColor $color
    Write-Host "   $($shortcut.Desc)" -ForegroundColor Gray
}

$successCount = ($shortcuts | Where-Object { $_.Success }).Count
$totalCount = $shortcuts.Count

Write-Host ""
Write-Host "RESULTADO: $successCount/$totalCount accesos directos creados exitosamente" -ForegroundColor $(if($successCount -eq $totalCount){"Green"}else{"Yellow"})
Write-Host ""
Write-Host "Los accesos directos estan disponibles en el escritorio." -ForegroundColor Cyan
Write-Host "¡Ahora puedes hacer doble click para lanzar QBTC-UNIFIED!" -ForegroundColor Green
Write-Host ""

# Crear archivo README en el escritorio
$ReadmePath = Join-Path $DesktopPath "QBTC-SHORTCUTS-README.txt"
$ReadmeContent = @"
QBTC-UNIFIED - ACCESOS DIRECTOS DEL ESCRITORIO
==============================================

Se han creado los siguientes accesos directos en tu escritorio:

🚀 QBTC-UNIFIED (Monitor)     - Lanzamiento completo con monitoreo
⚡ QBTC-UNIFIED (Background)  - Lanzamiento en segundo plano  
🌊 QBTC-START (Simple)        - Lanzamiento ultra-simple
🎯 QBTC Frontend (8080)       - Solo frontend puerto 8080
🔧 QBTC Backend (3003)        - Solo backend puerto 3003
⚡ QBTC-QUICK                 - Lanzamiento ultra-rapido
🌐 QBTC Web Interface         - Abrir en navegador
🛑 STOP QBTC Processes        - Detener todos los procesos

COMO USAR:
- Haz DOBLE CLICK en cualquier acceso directo
- El sistema se iniciara automaticamente
- Accede a http://localhost:8080 cuando este listo

RECOMENDADO PARA USO DIARIO:
🚀 QBTC-UNIFIED (Monitor) - Para desarrollo y monitoreo
⚡ QBTC-UNIFIED (Background) - Para uso automatico

Generado: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
"@

try {
    $ReadmeContent | Out-File -FilePath $ReadmePath -Encoding UTF8
    Write-Host "✓ README creado en escritorio: QBTC-SHORTCUTS-README.txt" -ForegroundColor Green
}
catch {
    Write-Host "✗ Error creando README: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "ACCESOS DIRECTOS LISTOS PARA USAR!" -ForegroundColor Green
Write-Host "Revisa tu escritorio y haz doble click en cualquier acceso." -ForegroundColor Cyan
