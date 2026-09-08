@echo off
title ALEM CRM - Backend Server
color 0A
cls

echo ========================================
echo    ALEM CRM - Backend Server
echo ========================================
echo.
echo Starting backend on http://localhost:3001
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

cd /d "%~dp0backend"

if not exist node_modules (
    echo [!] Dependencies not installed yet!
    echo [!] Please run RUN_ME_FIRST.bat first
    echo.
    pause
    exit /b 1
)

if not exist uploads mkdir uploads

npm run start:dev

pause
