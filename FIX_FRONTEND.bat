@echo off
echo ====================================
echo FIXING FRONTEND BUILD ISSUES
echo ====================================
echo.

cd frontend

echo Step 1: Cleaning build artifacts...
if exist .next (
    echo   - Removing .next folder...
    rmdir /s /q .next 2>nul
)

if exist node_modules\.cache (
    echo   - Removing node_modules cache...
    rmdir /s /q node_modules\.cache 2>nul
)

if exist .swc (
    echo   - Removing .swc folder...
    rmdir /s /q .swc 2>nul
)

echo.
echo Step 2: Cleaning npm cache...
call npm cache clean --force

echo.
echo Step 3: Reinstalling dependencies...
call npm install

echo.
echo ====================================
echo FRONTEND FIX COMPLETE!
echo ====================================
echo.
echo You can now start the frontend with:
echo   npm run dev
echo.
echo Or use START_FRONTEND.bat
echo.

pause
