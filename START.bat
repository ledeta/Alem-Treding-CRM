@echo off
REM ALEM CRM System - Local Development Startup
REM Run this batch file to start both backend and frontend

setlocal enabledelayedexpansion

cls
echo.
echo ========================================
echo  ALEM CRM System - Local Development
echo ========================================
echo.

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found!
    echo Please download and install from: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js found
echo.

REM Check PostgreSQL
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] PostgreSQL not found!
    echo Please download and install from: https://www.postgresql.org/download/
    echo.
    echo After installation, run this script again.
    pause
    exit /b 1
)

echo [OK] PostgreSQL found
echo.

REM Create database if not exists
echo [INFO] Checking database...
psql -U postgres -c "SELECT datname FROM pg_database WHERE datname='alem_crm';" >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Creating database...
    psql -U postgres -c "CREATE DATABASE alem_crm;" >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] Could not create database
        echo Make sure PostgreSQL is running and password is 'postgres'
        pause
        exit /b 1
    )
    echo [OK] Database created
    
    echo [INFO] Initializing schema...
    psql -U postgres -d alem_crm -f database\schema.sql >nul 2>&1
    if %errorlevel% neq 0 (
        echo [WARNING] Could not initialize schema
        echo Please run manually: psql -U postgres -d alem_crm -f database\schema.sql
    ) else (
        echo [OK] Schema initialized
    )
) else (
    echo [OK] Database already exists
)

echo.
echo ========================================
echo Setup complete! Starting services...
echo ========================================
echo.
echo Next steps:
echo 1. This window will START THE BACKEND
echo 2. Open another Command Prompt and run:
echo    cd backend
echo    npm run start:dev
echo 3. Open a third Command Prompt and run:
echo    cd frontend
echo    npm run dev
echo.
echo Or use these commands in parallel terminals:
echo.
echo Terminal 1 (Backend):
echo   cd backend ^&^& npm install ^&^& npm run start:dev
echo.
echo Terminal 2 (Frontend):
echo   cd frontend ^&^& npm install ^&^& npm run dev
echo.
echo After startup:
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:3001/api
echo.
pause
