@echo off
title Kaushal Kumar - Video Editing Portfolio Launcher
color 0A

echo =====================================================================
echo    🎬 KAUSHAL KUMAR - VIDEO EDITING PORTFOLIO LAUNCHER
echo =====================================================================
echo.

:: 1. Verify Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed or not found in PATH!
    echo Please download and install Node.js (v18+) from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 2. Ensure environment file exists in server directory
if not exist "server\.env" (
    echo [INFO] server\.env not found. Creating from .env.example...
    if exist "server\.env.example" (
        copy "server\.env.example" "server\.env" >nul
    ) else if exist ".env.example" (
        copy ".env.example" "server\.env" >nul
    )
    echo [SUCCESS] server\.env initialized.
)

:: 3. Check if dependencies are installed
if not exist "node_modules" (
    echo [INFO] Installing root dependencies...
    call npm install
)

if not exist "server\node_modules" (
    echo [INFO] Installing server dependencies...
    cd server
    call npm install
    cd ..
)

if not exist "client\node_modules" (
    echo [INFO] Installing client dependencies...
    cd client
    call npm install
    cd ..
)

echo.
echo =====================================================================
echo    🚀 Launching Backend API (:5000) & Vite Frontend (:5173)...
echo.
echo    📡 Public Portfolio : http://localhost:5173
echo    🛡️ Admin Dashboard   : http://localhost:5173/admin
echo    ⚙️ Backend Health   : http://localhost:5000/api/health
echo.
echo    Press Ctrl+C in this terminal window to stop the servers.
echo =====================================================================
echo.

:: 4. Auto-open browser after 3 seconds in background
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

:: 5. Start development servers using concurrently
call npm run dev

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [NOTICE] Development server stopped or encountered an issue.
    pause
)
