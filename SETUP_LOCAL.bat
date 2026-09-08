@echo off
echo ========================================
echo ALEM CRM - Local Setup Script
echo ========================================
echo.

echo Step 1: Setting up Database...
echo.
echo Please ensure PostgreSQL is installed and running.
echo.
echo Run these commands in PostgreSQL (psql):
echo   1. Create database: CREATE DATABASE alem_crm;
echo   2. Run schema: \i 'c:/Users/Milion''s/Desktop/Alem Trading/alem-crm-system/database/schema.sql'
echo.
echo Or use this command in Command Prompt:
echo   psql -U postgres -c "CREATE DATABASE alem_crm;"
echo   psql -U postgres -d alem_crm -f "database\schema.sql"
echo.
pause

echo.
echo Step 2: Installing Backend Dependencies...
echo.
cd backend
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo Step 3: Installing Frontend Dependencies...
echo.
cd ..\frontend
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the system:
echo   1. Backend:  cd backend  ^&^& npm run start:dev
echo   2. Frontend: cd frontend ^&^& npm run dev
echo.
echo Then open: http://localhost:3000
echo.
pause
