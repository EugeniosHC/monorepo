Write-Host "Reinstalando dependências do monorepo..."

# Remover diretórios node_modules
Get-ChildItem -Path . -Filter node_modules -Recurse -Directory | ForEach-Object {
    Write-Host "Removendo $($_.FullName)"
    Remove-Item -Path $_.FullName -Recurse -Force
}

# Limpar caches
Write-Host "Limpando cache do PNPM..."
pnpm store prune

# Reinstalar dependências
Write-Host "Reinstalando dependências..."
pnpm install

Write-Host "Reinstalação concluída com sucesso!"
