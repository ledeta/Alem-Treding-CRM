@echo off
title ALEM CRM - Emergency Fix (Clear Cache & Restart)
color 0C
cls

echo ================================================================================
echo               ALEM CRM - EMERGENCY FIX (Clear Cache & Restart)
echo ================================================================================
echo.
echo This script will:
echo 1. Kill all running node processes
echo 2. Clear all caches (Next.js, npm, browser data)
echo 3. Restart both services fresh
echo 4. Force environment variables to reload
echo.
pause

cls
echo [1/6] Killing all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
if errorlevel 1 (
    echo [INFO] No Node processes running (OK)
) else (
    echo [OK] Node processes terminated
)
timeout /t 2 /nobreak >nul
echo.

echo [2/6] Clearing Next.js cache...
if exist "frontend\.next" (
    rmdir /S /Q "frontend\.next"
    echo [OK] Deleted frontend/.next
) else (
    echo [INFO] No cache to delete
)
echo.

echo [3/6] Clearing npm cache...
call npm cache clean --force >nul 2>&1
echo [OK] npm cache cleared
echo.

echo [4/6] Checking backend environment...
if exist "backend\.env" (
    findstr /c:"PORT=3001" "backend\.env" >nul 2>&1
    if errorlevel 1 (
        echo [WARNING] backend/.env PORT might not be 3001
    ) else (
        echo [OK] backend/.env has PORT=3001
    )
) else (
    echo [ERROR] backend/.env not found!
)
echo.

echo [5/6] Checking frontend environment...
if exist "frontend\.env.local" (
    findstr /c:"NEXT_PUBLIC_API_URL=http://localhost:3001" "frontend\.env.local" >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] frontend/.env.local API URL is WRONG!
        echo [FIX] Setting correct URL...
        (
            echo NEXT_PUBLIC_API_URL=http://localhost:3001
            echo NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
            echo NODE_ENV=development
            echo PORT=3000
        ) > "frontend\.env.local"
        echo [OK] frontend/.env.local fixed with correct URL
    ) else (
        echo [OK] frontend/.env.local has correct API URL
    )
) else (
    echo [ERROR] frontend/.env.local not found!
    echo [FIX] Creating frontend/.env.local...
    (
        echo NEXT_PUBLIC_API_URL=http://localhost:3001
        echo NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
        echo NODE_ENV=development
        echo PORT=3000
    ) > "frontend\.env.local"
    echo [OK] frontend/.env.local created
)
echo.

echo [6/6] Starting services...
echo.
echo ================================================================================
echo Starting Backend in new window...
echo ================================================================================
start "ALEM CRM - Backend (FIXED)" cmd /k "cd /d "%~dp0backend" && npm run start:dev"
timeout /t 5 /nobreak >nul

echo.
echo ================================================================================
echo Starting Frontend in new window...
echo ================================================================================
start "ALEM CRM - Frontend (FIXED)" cmd /k "cd /d "%~dp0frontend" && npm run dev"
timeout /t 5 /nobreak >nul

cls
echo ================================================================================
echo                    ✅ EMERGENCY FIX COMPLETE!
echo ================================================================================
echo.
echo Services are starting in new windows...
echo.
echo Backend (Green window):
echo   - Will be ready on: http://localhost:3001
echo   - API Docs: http://localhost:3001/api
echo.
echo Frontend (Blue window):
echo   - Will be ready on: http://localhost:3000
echo   - Wait for: "ready - started server on ..."
echo.
echo Next steps:
echo 1. Wait 30-60 seconds for both services to fully start
echo 2. When you see "ready" in the frontend window, proceed
echo 3. Open browser: http://localhost:3000
echo 4. Check console (F12) for errors
echo 5. If still seeing errors, this means backend is not responding
echo.
echo If the errors persist:
echo - Check the terminal windows for error messages
echo - Make sure backend database is configured properly
echo - Run: netstat -ano | findstr :3001 (to check backend is listening)
echo.
echo ================================================================================
echo.
pause
