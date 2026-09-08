@echo off
title ALEM CRM - Database Setup
color 0A
cls

echo ========================================
echo    ALEM CRM - Database Setup
echo ========================================
echo.

set PGPATH=C:\Program Files\PostgreSQL\18\bin
set PGUSER=postgres
set DBNAME=alem_crm

echo [1/3] Checking PostgreSQL...
if not exist "%PGPATH%\psql.exe" (
    echo [X] PostgreSQL not found!
    echo.
    echo Please install PostgreSQL or update the path in this script.
    pause
    exit /b 1
)
echo [OK] PostgreSQL found
echo.

echo [2/3] Creating database...
echo.
echo You will be prompted for PostgreSQL password.
echo Default password is usually: postgres
echo.

"%PGPATH%\createdb.exe" -U %PGUSER% %DBNAME%

if errorlevel 1 (
    echo.
    echo [!] Database creation failed or already exists
    echo [!] Will try to load schema anyway...
    echo.
) else (
    echo [OK] Database created!
    echo.
)

echo [3/3] Loading database schema...
echo.
"%PGPATH%\psql.exe" -U %PGUSER% -d %DBNAME% -f "%~dp0database\schema.sql"

if errorlevel 1 (
    echo.
    echo [X] Schema loading failed!
    echo.
    echo Please check:
    echo   1. PostgreSQL password is correct
    echo   2. Database alem_crm exists
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
echo Database: %DBNAME%
echo Tables: 18 created
echo Views: 3 created
echo Roles: Admin, Sales User
echo.
echo Next steps:
echo   1. Install NestJS CLI: cd backend ^&^& npm install --save-dev @nestjs/cli
echo   2. Install frontend: cd frontend ^&^& npm install --legacy-peer-deps
echo   3. Start backend: cd backend ^&^& npm run start:dev
echo   4. Start frontend: cd frontend ^&^& npm run dev
echo.
pause
