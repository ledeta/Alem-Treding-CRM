@echo off
title ALEM CRM - Setup Status Check
color 0E
cls

echo ========================================
echo    ALEM CRM - Setup Status Check
echo ========================================
echo.

REM Check PostgreSQL
echo [1/6] Checking PostgreSQL...
netstat -an | findstr ":5432" >nul 2>&1
if errorlevel 1 (
    echo [X] PostgreSQL is NOT running on port 5432
    echo     Run: START_POSTGRESQL.bat
) else (
    echo [OK] PostgreSQL is running
)
echo.

REM Check Database
echo [2/6] Checking Database...
set PGPASSWORD=postgres
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -lqt 2>nul | findstr "alem_crm" >nul 2>&1
if errorlevel 1 (
    echo [X] Database 'alem_crm' not found
    echo     Use DBeaver or pgAdmin to create it
) else (
    echo [OK] Database 'alem_crm' exists
)
echo.

REM Check Backend Dependencies
echo [3/6] Checking Backend Dependencies...
if exist "backend\node_modules" (
    echo [OK] Backend dependencies installed
) else (
    echo [X] Backend dependencies NOT installed
    echo     Run: cd backend ^&^& npm install --legacy-peer-deps
)
echo.

REM Check NestJS CLI
echo [4/6] Checking NestJS CLI...
cd backend
npm list @nestjs/cli 2>nul | findstr "@nestjs/cli" >nul 2>&1
if errorlevel 1 (
    echo [X] NestJS CLI not installed
    echo     Run: cd backend ^&^& npm install --save-dev @nestjs/cli
) else (
    echo [OK] NestJS CLI installed
)
cd ..
echo.

REM Check @nestjs/swagger
echo [5/6] Checking @nestjs/swagger...
cd backend
npm list @nestjs/swagger 2>nul | findstr "@nestjs/swagger" >nul 2>&1
if errorlevel 1 (
    echo [X] @nestjs/swagger not installed
    echo     Run: cd backend ^&^& npm install @nestjs/swagger swagger-ui-express --legacy-peer-deps
) else (
    echo [OK] @nestjs/swagger installed
)
cd ..
echo.

REM Check Frontend Dependencies
echo [6/6] Checking Frontend Dependencies...
if exist "frontend\node_modules" (
    echo [OK] Frontend dependencies installed
) else (
    echo [X] Frontend dependencies NOT installed
    echo     Run: cd frontend ^&^& npm install --legacy-peer-deps
)
echo.

echo ========================================
echo    Setup Status Check Complete
echo ========================================
echo.
echo Next Steps:
echo   1. Fix any [X] items above
echo   2. Run: START_BACKEND_FIXED.bat
echo   3. Run: START_FRONTEND_FIXED.bat (in a new window)
echo   4. Open: http://localhost:3000
echo.
pause
