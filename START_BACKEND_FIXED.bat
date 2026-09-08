@echo off
title ALEM CRM - Backend Server
color 0A
cls

echo ========================================
echo    ALEM CRM - Starting Backend
echo ========================================
echo.

cd /d "%~dp0backend"

echo [1/3] Checking dependencies...
if not exist "node_modules" (
    echo [!] Dependencies not found. Installing...
    call npm install --legacy-peer-deps
)

echo.
echo [2/3] Checking @nestjs/swagger...
npm list @nestjs/swagger >nul 2>&1
if errorlevel 1 (
    echo [!] Installing missing @nestjs/swagger...
    call npm install @nestjs/swagger swagger-ui-express --legacy-peer-deps
)

echo.
echo [3/3] Starting backend server...
echo.
echo Backend will be available at: http://localhost:3001
echo API Documentation: http://localhost:3001/api
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

npm run start:dev

pause
