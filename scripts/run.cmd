@echo off
setlocal
set "task=cli"
if not "%~1"=="" set "task=%~1"
if /i not "%task%"=="cli" if /i not "%task%"=="test" if /i not "%task%"=="demo" (
    echo Usage: scripts\run.cmd [cli^|test^|demo]
    exit /b 1
)
pushd "%~dp0.." || exit /b 1
if exist ".tools\node-v22.23.4-win-x64\node.exe" set "PATH=%CD%\.tools\node-v22.23.4-win-x64;%PATH%"
where npm.cmd >nul 2>nul
if errorlevel 1 (
    echo Node.js 22 or newer is required. Install it and run npm ci first.
    popd
    exit /b 1
)
call npm.cmd run "%task%"
set "result=%errorlevel%"
popd
exit /b %result%
