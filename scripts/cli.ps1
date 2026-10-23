# Project-local Node fallback for this Windows workspace; no global PATH changes.
$ErrorActionPreference = 'Stop'
$projectDirectory = Split-Path -Parent $PSScriptRoot
$previousPath = $env:PATH
Push-Location $projectDirectory
try {
    $localNode = Join-Path $projectDirectory '.tools\node-v22.23.4-win-x64'
    if (Test-Path (Join-Path $localNode 'node.exe')) {
        $env:PATH = $localNode + ';' + $env:PATH
    }
    & npm.cmd run cli
    if ($LASTEXITCODE -ne 0) { throw 'CLI exited with an error' }
} finally {
    $env:PATH = $previousPath
    Pop-Location
}
