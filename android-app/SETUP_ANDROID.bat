@echo off
REM =====================================================
REM ALEM Trading CRM - Android App Setup Script
REM =====================================================
REM This script automates the Capacitor setup process
REM Prerequisites: JDK, Android Studio, Node.js
REM =====================================================

echo.
echo ================================================
echo   ALEM Trading CRM - Android Setup
echo ================================================
echo.

REM Check if Node.js is installed
node -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Download from: https://nodejs.org
    pause
    exit /b 1
)

REM Check if npm is installed
npm -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed!
    echo Download from: https://nodejs.org
    pause
    exit /b 1
)

REM Check environment variables
if "%JAVA_HOME%"=="" (
    echo [WARNING] JAVA_HOME is not set!
    echo Run in Admin terminal: setx JAVA_HOME "C:\Program Files\Java\jdk-11.x.x"
    echo.
)

if "%ANDROID_HOME%"=="" (
    echo [WARNING] ANDROID_HOME is not set!
    echo Run in Admin terminal: setx ANDROID_HOME "C:\Users\<YourUsername>\AppData\Local\Android\Sdk"
    echo.
)

echo [1/5] Checking Node.js installation...
node -v
echo [OK] Node.js is installed
echo.

echo [2/5] Building frontend...
cd ..\frontend
call npm run build
if errorlevel 1 (
    echo [ERROR] Frontend build failed!
    pause
    exit /b 1
)
cd ..\android-app
echo [OK] Frontend build complete
echo.

echo [3/5] Installing Capacitor packages...
call npm install
if errorlevel 1 (
    echo [ERROR] npm install failed!
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

echo [4/5] Initializing Capacitor...
echo.
echo When prompted:
echo   App name: ALEM Trading CRM
echo   App Package ID: com.alemtrading.crm
echo   Web asset directory: ../frontend/out
echo.
call npx cap init
if errorlevel 1 (
    echo [ERROR] Capacitor init failed!
    echo Make sure to answer the prompts correctly
    pause
    exit /b 1
)
echo [OK] Capacitor initialized
echo.

echo [5/5] Adding Android platform...
call npx cap add android
if errorlevel 1 (
    echo [ERROR] Failed to add Android platform!
    echo Make sure JAVA_HOME and ANDROID_HOME are set
    pause
    exit /b 1
)
echo [OK] Android platform added
echo.

echo ================================================
echo   Setup Complete! 🎉
echo ================================================
echo.
echo Next steps:
echo   1. Sync with Android: npm run sync
echo   2. Open in Android Studio: npm run open
echo   3. Build APK in Android Studio
echo   4. Test on device or emulator
echo.
echo For more details, see README.md
echo.
pause
