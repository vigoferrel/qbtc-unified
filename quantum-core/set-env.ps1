# Script para configurar variables de entorno desde .env
$envFile = ".env"

if (Test-Path $envFile) {
    Write-Host "Cargando variables desde $envFile..." -ForegroundColor Green
    
    $envContent = Get-Content $envFile
    foreach ($line in $envContent) {
        if ($line -match "^\s*([^#][^=]*)\s*=\s*(.*)\s*$") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            
            # Remover comillas si las hay
            $value = $value -replace '^"(.*)"$', '$1'
            $value = $value -replace "^'(.*)'$", '$1'
            
            # Configurar variables específicas que necesitamos
            if ($name -eq "BINANCE_API_KEY" -or $name -eq "BINANCE_SECRET_KEY") {
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
                
                # También configurar BINANCE_API_SECRET para compatibilidad
                if ($name -eq "BINANCE_SECRET_KEY") {
                    [Environment]::SetEnvironmentVariable("BINANCE_API_SECRET", $value, "Process")
                }
                
                Write-Host "   $name configurado" -ForegroundColor Gray
            }
        }
    }
    
    Write-Host "Variables de entorno configuradas." -ForegroundColor Green
} else {
    Write-Host "Archivo .env no encontrado." -ForegroundColor Red
}
