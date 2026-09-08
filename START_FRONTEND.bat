@echo off
echo ====================================
echo ALEM CRM - Starting Frontend
echo ====================================
echo.

cd frontend

echo Cleaning build cache...
if exist .next rmdir /s /q .next 2>nul
if exist node_modules\.cache rmdir /s /q node_modules\.cache 2>nul

echo.
echo Starting Next.js development server...
echo The frontend will be available at http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause
