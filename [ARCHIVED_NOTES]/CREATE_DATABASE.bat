@echo off
title ALEM CRM - Database Setup
color 0E
cls

echo ========================================
echo    ALEM CRM - Database Setup
echo ========================================
echo.

echo This script will create the alem_crm database.
echo.
echo Prerequisites:
echo   - PostgreSQL must be installed
echo   - PostgreSQL service must be running
echo.

set PGBIN=C:\Program Files\PostgreSQL\18\bin
set PGUSER=postgres

echo Checking PostgreSQL installation...
if not exist "%PGBIN%\psql.exe" (
    echo [X] PostgreSQL not found at: %PGBIN%
    echo.
    echo Please update PGBIN path in this script or use pgAdmin instead.
    echo.
    pause
    exit /b 1
)

echo [✓] PostgreSQL found
echo.

echo Creating database...
"%PGBIN%\psql.exe" -U %PGUSER% -c "CREATE DATABASE alem_crm;"
if errorlevel 1 (
    echo.
    echo [!] Database creation failed or already exists
    echo.
    echo If database already exists, we'll continue to load schema...
    echo.
)

echo.
echo Loading database schema...
echo.
"%PGBIN%\psql.exe" -U %PGUSER% -d alem_crm -f "%~dp0database\schema.sql"
if errorlevel 1 (
    echo.
    echo [X] Schema loading failed!
    echo.
    echo Please check:
    echo   1. PostgreSQL password is correct
    echo   2. Database alem_crm exists
    echo   3. schema.sql file exists
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Database Setup Complete! ✓
echo ========================================
echo.
echo Database: alem_crm
echo Tables: 18 created
echo Views: 3 created
echo Roles: Admin, Sales User
echo.
echo Next steps:
echo   1. Run: START_BACKEND.bat
echo   2. Run: START_FRONTEND.bat
echo   3. Open: http://localhost:3000
echo.
pause
