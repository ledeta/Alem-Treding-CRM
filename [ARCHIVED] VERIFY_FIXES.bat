@echo off
title ALEM CRM - Verify Port Configuration Fixes
color 0F
cls

echo ================================================================================
echo                  ALEM CRM - VERIFY PORT CONFIGURATION FIXES
echo ================================================================================
echo.

setlocal enabledelayedexpansion

REM Initialize counters
set /a passed=0
set /a failed=0
set /a total=0

REM Function to check if file contains text
REM Usage: call :checkfile "filename" "search_text" "description"

echo [VERIFYING CONFIGURATION FILES]
echo.

REM Check 1: Nginx frontend port
echo [1/8] Checking nginx configuration...
set /a total+=1
findstr /c:"server frontend:3000" "nginx\conf.d\default.conf" >nul 2>&1
if errorlevel 1 (
    echo ❌ FAIL: nginx routes to wrong port
    echo    Expected: server frontend:3000;
    set /a failed+=1
) else (
    echo ✅ PASS: nginx correctly routes to frontend:3000
    set /a passed+=1
)
echo.

REM Check 2: Nginx backend configuration
echo [2/8] Checking nginx backend upstream...
set /a total+=1
findstr /c:"upstream backend" "nginx\conf.d\default.conf" >nul 2>&1
if errorlevel 1 (
    echo ❌ FAIL: backend upstream not found
    set /a failed+=1
) else (
    echo ✅ PASS: nginx backend upstream configured
    set /a passed+=1
)
echo.

REM Check 3: Backend port in docker-compose
echo [3/8] Checking docker-compose backend port...
set /a total+=1
findstr /c:"- '3001:3001'" "docker-compose.yml" >nul 2>&1
if errorlevel 1 (
    echo ❌ FAIL: docker-compose backend port mapping wrong
    echo    Expected: - '3001:3001'
    set /a failed+=1
) else (
    echo ✅ PASS: docker-compose backend port is 3001:3001
    set /a passed+=1
)
echo.

REM Check 4: Frontend port in docker-compose
echo [4/8] Checking docker-compose frontend port...
set /a total+=1
findstr /c:"- '3000:3000'" "docker-compose.yml" >nul 2>&1
if errorlevel 1 (
    echo ❌ FAIL: docker-compose frontend port mapping wrong
    echo    Expected: - '3000:3000'
    set /a failed+=1
) else (
    echo ✅ PASS: docker-compose frontend port is 3000:3000
    set /a passed+=1
)
echo.

REM Check 5: Backend PORT env in docker-compose
echo [5/8] Checking docker-compose backend PORT env...
set /a total+=1
findstr /c:"PORT: 3001" "docker-compose.yml" >nul 2>&1
if errorlevel 1 (
    echo ❌ FAIL: docker-compose backend PORT env wrong
    echo    Expected: PORT: 3001
    set /a failed+=1
) else (
    echo ✅ PASS: docker-compose backend PORT env is 3001
    set /a passed+=1
)
echo.

REM Check 6: Frontend API URL in docker-compose
echo [6/8] Checking docker-compose frontend API URL...
set /a total+=1
findstr /c:"NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://localhost:3001}" "docker-compose.yml" >nul 2>&1
if errorlevel 1 (
    echo ⚠ WARNING: frontend API URL might be wrong
    echo    Expected: http://localhost:3001
    set /a failed+=1
) else (
    echo ✅ PASS: docker-compose frontend API URL is correct
    set /a passed+=1
)
echo.

REM Check 7: Backend FRONTEND_URL env
echo [7/8] Checking docker-compose backend FRONTEND_URL...
set /a total+=1
findstr /c:"FRONTEND_URL: ${FRONTEND_URL:-http://localhost:3000}" "docker-compose.yml" >nul 2>&1
if errorlevel 1 (
    echo ⚠ WARNING: backend FRONTEND_URL might be wrong
    echo    Expected: http://localhost:3000
    set /a failed+=1
) else (
    echo ✅ PASS: docker-compose backend FRONTEND_URL is correct
    set /a passed+=1
)
echo.

REM Check 8: Backend .env PORT
echo [8/8] Checking backend .env PORT...
set /a total+=1
if exist "backend\.env" (
    findstr /c:"PORT=3001" "backend\.env" >nul 2>&1
    if errorlevel 1 (
        echo ⚠ WARNING: backend .env PORT might not be 3001
        set /a failed+=1
    ) else (
        echo ✅ PASS: backend .env PORT is 3001
        set /a passed+=1
    )
) else (
    echo ⚠ WARNING: backend .env file not found
    set /a failed+=1
)
echo.

echo ================================================================================
echo                              TEST RESULTS
echo ================================================================================
echo.
echo Total Checks:  %total%
echo Passed:        %passed% ✅
echo Failed:        %failed% ❌
echo.

if %failed% equ 0 (
    echo ✅ ALL TESTS PASSED! Configuration is correct.
    echo.
    echo Next steps:
    echo 1. Restart your services (START_ALL.bat)
    echo 2. Open http://localhost:3000 in browser
    echo 3. Check for errors in browser console
    echo 4. Login with admin@alemcrm.com / Admin123!
    echo.
    color 0A
) else (
    echo ❌ SOME TESTS FAILED! Please review the issues above.
    echo.
    echo Action required:
    echo 1. Review the failed tests above
    echo 2. Check the files mentioned
    echo 3. Apply corrections if needed
    echo 4. Run this verification again
    echo.
    color 0C
)

echo ================================================================================
echo                         PORT CONFIGURATION STATUS
echo ================================================================================
echo.
echo Frontend (Next.js):    http://localhost:3000
echo Backend (NestJS):      http://localhost:3001
echo Database (PostgreSQL): http://localhost:5432
echo Nginx (Docker):        http://localhost
echo.
echo ================================================================================
echo.
pause
