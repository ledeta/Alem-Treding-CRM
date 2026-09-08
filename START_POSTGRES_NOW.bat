@echo off
echo Starting PostgreSQL...
"C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" -D "C:\Program Files\PostgreSQL\18\data" -l logfile.log start
timeout /t 3 /nobreak
echo PostgreSQL started. Testing connection...
psql -h localhost -U postgres -d postgres -c "SELECT 1"
if errorlevel 0 (
    echo PostgreSQL is running!
) else (
    echo PostgreSQL connection failed
)
pause
