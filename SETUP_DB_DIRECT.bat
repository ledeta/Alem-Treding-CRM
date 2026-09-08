@echo off
title ALEM CRM - Database Setup
color 0A
cls

echo ========================================
echo    ALEM CRM - Database Setup
echo ========================================
echo.

REM Create a temporary SQL script
echo Creating setup script...

(
echo CREATE DATABASE alem_crm;
) > "%TEMP%\create_db.sql"

echo.
echo Attempting to create database...
echo.

REM Try using psql with full path
set PGPATH=C:\Program Files\PostgreSQL\18\bin
set PGPASSWORD=postgres

"%PGPATH%\psql.exe" -U postgres -f "%TEMP%\create_db.sql" 2>nul

if errorlevel 1 (
    echo.
    echo [!] Automatic creation failed.
    echo.
    echo Please create the database manually:
    echo   1. Open Command Prompt
    echo   2. Run: "C:\Program Files\PostgreSQL\18\bin\createdb.exe" -U postgres alem_crm
    echo   3. When prompted, enter password: postgres
    echo.
    pause
) else (
    echo [OK] Database created!
)

echo.
echo Loading schema...
echo.

"%PGPATH%\psql.exe" -U postgres -d alem_crm -f "%~dp0database\schema.sql"

if errorlevel 1 (
    echo.
    echo [X] Schema loading failed!
    echo.
    echo Please check:
    echo   1. PostgreSQL is running
    echo   2. Password is correct
    echo   3. File database\schema.sql exists
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Database Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. cd backend
echo   2. npm install --save-dev @nestjs/cli
echo   3. cd ..\frontend
echo   4. npm install --legacy-peer-deps
echo   5. cd ..\backend
echo   6. npm run start:dev
echo   7. (new terminal) cd frontend ^&^& npm run dev
echo.
pause
