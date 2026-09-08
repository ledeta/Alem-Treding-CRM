@echo off
title Start PostgreSQL Service
color 0A
cls

echo ========================================
echo    Starting PostgreSQL Service
echo ========================================
echo.

REM Try different possible service names
echo Trying to start PostgreSQL service...
echo.

net start postgresql-x64-18 2>nul
if %errorlevel% == 0 (
    echo [OK] PostgreSQL started successfully!
    goto :success
)

net start "PostgreSQL 18 Server" 2>nul
if %errorlevel% == 0 (
    echo [OK] PostgreSQL started successfully!
    goto :success
)

net start postgresql 2>nul
if %errorlevel% == 0 (
    echo [OK] PostgreSQL started successfully!
    goto :success
)

REM Try to start directly using pg_ctl
echo.
echo Trying direct start method...
"C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" -D "C:\Program Files\PostgreSQL\18\data" start
if %errorlevel% == 0 (
    echo [OK] PostgreSQL started successfully!
    goto :success
)

echo.
echo [X] Could not start PostgreSQL automatically.
echo.
echo Please try manually:
echo   1. Open Services (services.msc)
echo   2. Find any service with "PostgreSQL" or "postgres" in the name
echo   3. Right-click and select "Start"
echo.
echo Or check if PostgreSQL is actually installed:
echo   - Look for folder: C:\Program Files\PostgreSQL\18
echo.
pause
exit /b 1

:success
echo.
echo ========================================
echo    PostgreSQL is Running!
echo ========================================
echo.
echo You can now:
echo   1. Go back to DBeaver
echo   2. Click "Test Connection" again
echo   3. It should connect successfully
echo.
echo Then continue with database setup!
echo.
pause
