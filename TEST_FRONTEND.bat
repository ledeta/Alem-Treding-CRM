@echo off
echo ====================================
echo TESTING FRONTEND SETUP
echo ====================================
echo.

cd frontend

echo [1/5] Checking if node_modules exists...
if exist node_modules (
    echo   ✓ node_modules found
) else (
    echo   ✗ node_modules NOT found - run 'npm install'
    pause
    exit /b 1
)

echo.
echo [2/5] Checking if .env.local exists...
if exist .env.local (
    echo   ✓ .env.local found
    type .env.local
) else (
    echo   ✗ .env.local NOT found
)

echo.
echo [3/5] Checking Next.js version...
call npm list next --depth=0

echo.
echo [4/5] Checking app structure...
if exist src\app\login\page.tsx (
    echo   ✓ Login page exists: src\app\login\page.tsx
) else (
    echo   ✗ Login page NOT found
)

if exist src\app\dashboard\page.tsx (
    echo   ✓ Dashboard page exists: src\app\dashboard\page.tsx
) else (
    echo   ✗ Dashboard page NOT found
)

echo.
echo [5/5] Checking if build artifacts exist...
if exist .next (
    echo   ✓ .next folder exists (previous build)
    echo   Note: Will be rebuilt on next start
) else (
    echo   ○ .next folder does not exist (first build will create it)
)

echo.
echo ====================================
echo TEST COMPLETE
echo ====================================
echo.
echo To start the frontend:
echo   START_FRONTEND.bat
echo.
echo Or manually:
echo   npm run dev
echo.

pause
