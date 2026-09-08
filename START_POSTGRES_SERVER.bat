@echo off
echo ========================================
echo    Starting PostgreSQL Server
echo ========================================
echo.

set PGBIN=C:\Program Files\PostgreSQL\18\bin
set PGDATA=C:\Program Files\PostgreSQL\18\data

echo Checking PostgreSQL status...
"%PGBIN%\pg_ctl.exe" -D "%PGDATA%" status

if errorlevel 1 (
    echo.
    echo PostgreSQL is not running. Starting server...
    echo.
    "%PGBIN%\pg_ctl.exe" -D "%PGDATA%" -l "%PGDATA%\log\postgresql.log" start
    echo.
    echo Waiting for server to start...
    timeout /t 5 /nobreak > nul
    echo.
    "%PGBIN%\pg_ctl.exe" -D "%PGDATA%" status
) else (
    echo PostgreSQL is already running!
)

echo.
echo ========================================
echo If PostgreSQL started successfully,
echo you can now connect to it at:
echo   Host: localhost
echo   Port: 5432
echo   User: postgres
echo ========================================
echo.
pause
