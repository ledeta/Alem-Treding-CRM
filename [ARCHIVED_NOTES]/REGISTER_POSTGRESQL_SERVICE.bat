@echo off
title Register and Start PostgreSQL Service
color 0A
cls

echo ========================================
echo    PostgreSQL Service Registration
echo ========================================
echo.
echo This will register PostgreSQL as a Windows service
echo and start it.
echo.
pause

echo.
echo [1/3] Registering PostgreSQL service...
echo.

REM Register the service
"C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" register -N "postgresql-18" -D "C:\Program Files\PostgreSQL\18\data" -S auto

if errorlevel 1 (
    echo [!] Service registration may have failed, but continuing...
) else (
    echo [OK] Service registered successfully!
)

echo.
echo [2/3] Starting PostgreSQL service...
echo.

REM Start the service
net start postgresql-18

if errorlevel 1 (
    echo.
    echo [!] Service start via 'net start' failed.
    echo [!] Trying alternative method...
    echo.
    
    REM Try starting directly with pg_ctl
    "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" -D "C:\Program Files\PostgreSQL\18\data" start
    
    if errorlevel 1 (
        echo.
        echo [X] Could not start PostgreSQL!
        echo.
        echo Possible issues:
        echo   1. Data directory not initialized
        echo   2. Port 5432 already in use
        echo   3. Permission issues
        echo.
        echo Try running this as Administrator!
        echo.
        pause
        exit /b 1
    ) else (
        echo [OK] PostgreSQL started directly!
    )
) else (
    echo [OK] PostgreSQL service started!
)

echo.
echo [3/3] Verifying PostgreSQL is running...
echo.

timeout /t 3 /nobreak >nul

netstat -ano | findstr :5432 >nul
if errorlevel 1 (
    echo [!] Port 5432 not listening yet...
    echo [!] Waiting a bit longer...
    timeout /t 5 /nobreak >nul
    netstat -ano | findstr :5432 >nul
    if errorlevel 1 (
        echo [X] PostgreSQL doesn't seem to be listening on port 5432
        pause
        exit /b 1
    )
)

echo [OK] PostgreSQL is listening on port 5432!

echo.
echo ========================================
echo    Success!
echo ========================================
echo.
echo PostgreSQL is now running!
echo.
echo You can now:
echo   1. Go back to DBeaver
echo   2. Right-click the "postgres" connection
echo   3. Select "Test Connection"
echo   4. It should work now!
echo.
echo Then create database and load schema.
echo.
pause
