@echo off
title ALEM CRM - System Status Check
color 0E
cls

echo ========================================
echo    ALEM CRM - System Status Check
echo ========================================
echo.

echo [1/5] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [X] Node.js NOT found!
) else (
    for /f "tokens=*" %%i in ('node --version') do echo [✓] Node.js: %%i
)
echo.

echo [2/5] Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo [X] npm NOT found!
) else (
    for /f "tokens=*" %%i in ('npm --version') do echo [✓] npm: %%i
)
echo.

echo [3/5] Checking Backend Dependencies...
cd /d "%~dp0backend"
if exist node_modules (
    echo [✓] Backend dependencies installed
) else (
    echo [X] Backend dependencies NOT installed
    echo     Run: cd backend ^&^& npm install
)
echo.

echo [4/5] Checking Frontend Dependencies...
cd /d "%~dp0frontend"
if exist node_modules (
    echo [✓] Frontend dependencies installed
) else (
    echo [X] Frontend dependencies NOT installed
    echo     Run: cd frontend ^&^& npm install
)
echo.

echo [5/5] Checking Running Services...
echo.
echo Checking port 3001 (Backend):
netstat -ano | findstr :3001 >nul 2>&1
if errorlevel 1 (
    echo [i] Backend is NOT running
) else (
    echo [✓] Backend is running on port 3001
)
echo.
echo Checking port 3000 (Frontend):
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    echo [i] Frontend is NOT running
) else (
    echo [✓] Frontend is running on port 3000
)
echo.

echo ========================================
echo    Database Connection Test
echo ========================================
echo.
echo Checking if alem_crm database exists...
psql -U postgres -c "\l" 2>nul | findstr "alem_crm" >nul 2>&1
if errorlevel 1 (
    echo [X] Database NOT found or PostgreSQL not accessible
    echo     Make sure PostgreSQL is running
    echo     Create database: psql -U postgres -c "CREATE DATABASE alem_crm;"
) else (
    echo [✓] Database alem_crm exists
)
echo.

echo ========================================
echo Status check complete!
echo ========================================
echo.
pause
