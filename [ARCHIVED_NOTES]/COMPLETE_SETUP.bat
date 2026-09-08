@echo off
title ALEM CRM - Complete Setup
color 0B
cls

echo ========================================
echo    ALEM CRM - Complete Setup
echo ========================================
echo.
echo This will:
echo   1. Create database (requires PostgreSQL password)
echo   2. Install NestJS CLI
echo   3. Install frontend dependencies
echo.
echo Time required: ~15 minutes
echo.
pause

REM Step 1: Database Setup
echo.
echo ========================================
echo Step 1/3: Creating Database
echo ========================================
echo.

set PGPATH=C:\Program Files\PostgreSQL\18\bin
set PGUSER=postgres
set DBNAME=alem_crm

if exist "%PGPATH%\createdb.exe" (
    echo Creating database...
    "%PGPATH%\createdb.exe" -U %PGUSER% %DBNAME% 2>nul
    
    echo Loading schema...
    "%PGPATH%\psql.exe" -U %PGUSER% -d %DBNAME% -f "%~dp0database\schema.sql"
    
    if errorlevel 1 (
        echo [X] Database setup failed!
        echo.
        echo Please run SETUP_DATABASE_SIMPLE.bat separately
        echo or use pgAdmin to create database and load schema.
        echo.
        pause
    ) else (
        echo [OK] Database ready!
    )
) else (
    echo [!] PostgreSQL not found at expected location.
    echo [!] Please use pgAdmin to create database manually:
    echo     1. Open pgAdmin
    echo     2. Create database: alem_crm
    echo     3. Run SQL file: database\schema.sql
    echo.
    pause
)

REM Step 2: Install NestJS CLI
echo.
echo ========================================
echo Step 2/3: Installing NestJS CLI
echo ========================================
echo.

cd /d "%~dp0backend"
echo Installing NestJS CLI...
call npm install --save-dev @nestjs/cli

if errorlevel 1 (
    echo [X] NestJS CLI installation failed!
    pause
    exit /b 1
)
echo [OK] NestJS CLI installed!

REM Step 3: Install Frontend Dependencies
echo.
echo ========================================
echo Step 3/3: Installing Frontend Dependencies
echo ========================================
echo.
echo This may take 5-10 minutes...
echo.

cd /d "%~dp0frontend"
call npm install --legacy-peer-deps

if errorlevel 1 (
    echo [X] Frontend installation failed!
    echo.
    echo Please try manually:
    echo   cd frontend
    echo   npm cache clean --force
    echo   npm install --legacy-peer-deps
    echo.
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed!

REM Complete
cls
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo Your ALEM CRM is ready to run!
echo.
echo To start the system:
echo.
echo   Option 1 - Use helper scripts:
echo     1. Double-click: START_BACKEND.bat
echo     2. Double-click: START_FRONTEND.bat
echo.
echo   Option 2 - Use Command Prompt:
echo     Terminal 1: cd backend ^&^& npm run start:dev
echo     Terminal 2: cd frontend ^&^& npm run dev
echo.
echo Then open: http://localhost:3000
echo.
echo Login:
echo   Email: admin@alemcrm.com
echo   Password: Admin123!
echo.
echo ========================================
pause
