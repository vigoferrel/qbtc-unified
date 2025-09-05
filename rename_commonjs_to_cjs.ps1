# Renombra todos los archivos CommonJS a .cjs para compatibilidad con ES modules
Get-ChildItem -Path . -Recurse -Include *.js | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file -Raw
    if ($content -match 'require\(|module\.exports') {
        $newFile = $file -replace '\.js$', '.cjs'
        Rename-Item -Path $file -NewName $newFile
        Write-Host "Renombrado: $file -> $newFile"
    }
}
Write-Host "Renombramiento completado."
