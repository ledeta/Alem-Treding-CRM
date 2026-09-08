@echo off
color 0A
title ALEM CRM - Local Setup Wizard
cls

echo ========================================
echo    ALEM CRM - Local Setup Wizard
echo ========================================
echo.

:check_node
echo [1/5] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [X] Node.js NOT found! Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [✓] Node.js found: %NODE_VERSION%
)
echo.

:check_postgres
echo [2/5] Checking PostgreSQL...
echo.
echo Please ensure PostgreSQL is running.
echo If you haven't created the database yet:
echo.
echo   1. Open Command Prompt as Administrator
echo   2. Run: psql -U postgres
echo   3. Run: CREATE DATABASE alem_crm;
echo   4. Run: \q
echo.
echo Then run the schema:
echo   psql -U postgres -d alem_crm -f "%~dp0database\schema.sql"
echo.
set /p DB_READY="Have you created the database and loaded the schema? (y/n): "
if /i not "%DB_READY%"=="y" (
    echo.
    echo Please set up the database first, then run this script again.
    pause
    exit /b 0
)
echo [✓] Database ready
echo.

:install_backend
echo [3/5] Installing Backend Dependencies...
cd /d "%~dp0backend"
if exist node_modules (
    echo [i] Dependencies already installed, skipping...
) else (
    echo This may take a few minutes...
    call npm install
    if errorlevel 1 (
        echo [X] Failed to install backend dependencies!
        pause
        exit /b 1
    )
    echo [✓] Backend dependencies installed
)
echo.

:install_frontend
echo [4/5] Installing Frontend Dependencies...
cd /d "%~dp0frontend"
if exist node_modules (
    echo [i] Dependencies already installed, skipping...
) else (
    echo This may take a few minutes...
    call npm install
    if errorlevel 1 (
        echo [X] Failed to install frontend dependencies!
        pause
        exit /b 1
    )
    echo [✓] Frontend dependencies installed
)
echo.

:create_dirs
echo [5/5] Creating upload directories...
cd /d "%~dp0backend"
if not exist uploads mkdir uploads
echo [✓] Upload directories created
echo.

:complete
cls
echo ========================================
echo    SETUP COMPLETE! 🎉
echo ========================================
echo.
echo Your ALEM CRM system is ready to run!
echo.
echo TO START THE SYSTEM:
echo.
echo   1. Open TWO Command Prompt windows
echo.
echo   2. In Terminal 1 (Backend):
echo      cd "%~dp0backend"
echo      npm run start:dev
echo.
echo   3. In Terminal 2 (Frontend):
echo      cd "%~dp0frontend"
echo      npm run dev
echo.
echo   4. Open browser: http://localhost:3000
echo.
echo ========================================
echo.
echo Press any key to open START_BACKEND.bat and START_FRONTEND.bat helper scripts...
pause >nul

echo Creating helper scripts...
cd /d "%~dp0"

echo @echo off > START_BACKEND.bat
echo title ALEM CRM - Backend Server >> START_BACKEND.bat
echo cd /d "%~dp0backend" >> START_BACKEND.bat
echo echo Starting Backend Server... >> START_BACKEND.bat
echo echo Backend will run on http://localhost:3001 >> START_BACKEND.bat
echo echo. >> START_BACKEND.bat
echo npm run start:dev >> START_BACKEND.bat
echo pause >> START_BACKEND.bat

echo @echo off > START_FRONTEND.bat
echo title ALEM CRM - Frontend Server >> START_FRONTEND.bat
echo cd /d "%~dp0frontend" >> START_FRONTEND.bat
echo echo Starting Frontend Server... >> START_FRONTEND.bat
echo echo Frontend will run on http://localhost:3000 >> START_FRONTEND.bat
echo echo. >> START_FRONTEND.bat
echo npm run dev >> START_FRONTEND.bat
echo pause >> START_FRONTEND.bat

echo.
echo [✓] Helper scripts created:
echo     - START_BACKEND.bat
echo     - START_FRONTEND.bat
echo.
echo You can double-click these files to start the servers!
echo.
pause
