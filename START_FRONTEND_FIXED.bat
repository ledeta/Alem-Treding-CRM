@echo off
title ALEM CRM - Frontend Server
color 0B
cls

echo ========================================
echo    ALEM CRM - Starting Frontend
echo ========================================
echo.

cd /d "%~dp0frontend"

echo [1/2] Checking dependencies...
if not exist "node_modules" (
    echo [!] Dependencies not found. Installing...
    call npm install --legacy-peer-deps
)

echo.
echo [2/2] Starting frontend server...
echo.
echo Frontend will be available at: http://localhost:3000
echo.
echo Default Login:
echo   Email: admin@alemcrm.com
echo   Password: Admin123!
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

npm run dev

pause
