@echo off
title Kaushal Kumar - Portfolio Production Server Launcher
color 0B

echo =====================================================================
echo    🎬 KAUSHAL KUMAR - PORTFOLIO PRODUCTION SERVER LAUNCHER
echo =====================================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed or not found in PATH!
    pause
    exit /b 1
)

if not exist "server\.env" (
    echo [INFO] Creating server\.env from .env.example...
    copy ".env.example" "server\.env" >nul
)

if not exist "client\dist" (
    echo [INFO] Building production bundle...
    call npm run build
)

echo.
echo =====================================================================
echo    🚀 Launching Express Production Server on port 5000...
echo.
echo    📡 Website: http://localhost:5000
echo    🛡️ Admin  : http://localhost:5000/admin
echo.
echo    Press Ctrl+C to stop the production server.
echo =====================================================================
echo.

start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:5000"

call npm start

pause
