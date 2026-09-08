@echo off
title ALEM CRM - Start All Services
color 0A
cls

echo ========================================
echo    ALEM CRM - Starting All Services
echo ========================================
echo.

REM Start PostgreSQL if not running
echo [1/3] Checking PostgreSQL...
netstat -an | findstr ":5432" >nul 2>&1
if errorlevel 1 (
    echo Starting PostgreSQL...
    call START_POSTGRESQL.bat
    timeout /t 5 /nobreak >nul
) else (
    echo [OK] PostgreSQL is already running
)
echo.

REM Start Backend in new window
echo [2/3] Starting Backend Server...
start "ALEM CRM - Backend" cmd /k "cd /d "%~dp0" && START_BACKEND_FIXED.bat"
echo [OK] Backend starting in new window...
echo Waiting for backend to initialize...
timeout /t 15 /nobreak >nul
echo.

REM Start Frontend in new window
echo [3/3] Starting Frontend Server...
start "ALEM CRM - Frontend" cmd /k "cd /d "%~dp0" && START_FRONTEND_FIXED.bat"
echo [OK] Frontend starting in new window...
echo.

echo ========================================
echo    All Services Starting!
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:3001/api
echo.
echo Default Login:
echo   Email: admin@alemcrm.com
echo   Password: Admin123!
echo.
echo Two new windows have opened:
echo   1. Backend Server (green)
echo   2. Frontend Server (blue)
echo.
echo Wait 30-60 seconds for services to fully start.
echo Then open: http://localhost:3000
echo.
pause
