@echo off
title ALEM CRM - One-Click Launch
color 0D
cls

echo.
echo    ╔═══════════════════════════════════════════════════════╗
echo    ║                                                       ║
echo    ║          🚀 ALEM CRM SYSTEM - LAUNCHER 🚀             ║
echo    ║                                                       ║
echo    ╚═══════════════════════════════════════════════════════╝
echo.
echo.

REM Quick startup check
echo    ⚡ Pre-flight Check...
echo.

set /a checks_passed=0
set /a total_checks=4

REM Check 1: PostgreSQL
netstat -an | findstr ":5432" >nul 2>&1
if errorlevel 1 (
    echo    [⏳] PostgreSQL - Starting...
    call START_POSTGRESQL.bat >nul 2>&1
    timeout /t 3 /nobreak >nul
) else (
    echo    [✓] PostgreSQL - Running
    set /a checks_passed+=1
)

REM Check 2: Backend Dependencies
if exist "backend\node_modules" (
    echo    [✓] Backend - Ready
    set /a checks_passed+=1
) else (
    echo    [⏳] Backend - Installing dependencies...
    cd backend
    call npm install --legacy-peer-deps >nul 2>&1
    cd ..
)

REM Check 3: @nestjs/swagger
cd backend
npm list @nestjs/swagger 2>nul | findstr "@nestjs/swagger" >nul 2>&1
if errorlevel 1 (
    echo    [⏳] Installing @nestjs/swagger...
    call npm install @nestjs/swagger swagger-ui-express --legacy-peer-deps >nul 2>&1
)
cd ..
echo    [✓] Backend - Configured
set /a checks_passed+=1

REM Check 4: Frontend Dependencies
if exist "frontend\node_modules" (
    echo    [✓] Frontend - Ready
    set /a checks_passed+=1
) else (
    echo    [⏳] Frontend - Installing dependencies...
    cd frontend
    call npm install --legacy-peer-deps >nul 2>&1
    cd ..
)

echo.
echo    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo    Checks Passed: %checks_passed%/%total_checks%
echo    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

if %checks_passed% LSS 4 (
    echo    [⚠] Some checks failed. Run CHECK_SETUP_STATUS.bat for details.
    echo.
    pause
    exit /b 1
)

echo.
echo    🚀 Launching Services...
echo.

REM Start Backend
echo    [1/2] Starting Backend Server...
start "ALEM CRM - Backend" cmd /k "cd /d "%~dp0backend" && color 0A && echo. && echo ═══════════════════════════════════════════════ && echo    ALEM CRM - BACKEND SERVER && echo ═══════════════════════════════════════════════ && echo. && npm run start:dev"
timeout /t 2 /nobreak >nul

REM Start Frontend
echo    [2/2] Starting Frontend Server...
start "ALEM CRM - Frontend" cmd /k "cd /d "%~dp0frontend" && color 0B && echo. && echo ═══════════════════════════════════════════════ && echo    ALEM CRM - FRONTEND SERVER && echo ═══════════════════════════════════════════════ && echo. && npm run dev"

echo.
echo.
echo    ╔═══════════════════════════════════════════════════════╗
echo    ║                                                       ║
echo    ║              ✨ SERVICES LAUNCHING! ✨                ║
echo    ║                                                       ║
echo    ╚═══════════════════════════════════════════════════════╝
echo.
echo    Two new windows have opened:
echo      • Backend Server  (Green Window)
echo      • Frontend Server (Blue Window)
echo.
echo    ⏱️  Please wait 30-60 seconds for services to start...
echo.
echo    Then open your browser to:
echo.
echo        👉 http://localhost:3000 👈
echo.
echo    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo    🔐 Login Credentials:
echo.
echo       Email:    admin@alemcrm.com
echo       Password: Admin123!
echo.
echo    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo    📚 Useful URLs:
echo.
echo       Frontend:  http://localhost:3000
echo       Backend:   http://localhost:3001
echo       API Docs:  http://localhost:3001/api
echo.
echo    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo    💡 To stop: Press Ctrl+C in each server window
echo.
echo    🎉 Enjoy your ALEM CRM System!
echo.

timeout /t 30 /nobreak
start http://localhost:3000

pause
