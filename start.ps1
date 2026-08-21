Set-Location $PSScriptRoot
if (-not (Test-Path node_modules)) { npm install; if ($LASTEXITCODE -ne 0) { throw 'npm install failed.' } }
npm start
