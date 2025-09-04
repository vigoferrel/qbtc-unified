param(
  [switch]$SingleServer = $true
)

# Asegurar modo servidor único por defecto
if ($SingleServer) { $env:SINGLE_SERVER_MODE = 'true' } else { $env:SINGLE_SERVER_MODE = 'false' }

# Lanzar minimizado en segundo plano
Start-Process -WindowStyle Minimized -FilePath "cmd.exe" -ArgumentList "/c scripts\launch-feynman-quadrants.bat"

Write-Host "[QBTC] Lanzado en segundo plano (SINGLE_SERVER_MODE=$($env:SINGLE_SERVER_MODE))"


