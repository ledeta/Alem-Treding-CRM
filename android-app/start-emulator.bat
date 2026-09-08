@echo off
setlocal enabledelayedexpansion

REM Set Android SDK path
set "ANDROID_SDK=%LOCALAPPDATA%\Android\Sdk"
set "EMULATOR=%ANDROID_SDK%\emulator\emulator.exe"
set "ADB=%ANDROID_SDK%\platform-tools\adb.exe"

echo.
echo ========================================
echo ALEM TRADING CRM - ANDROID EMULATOR
echo ========================================
echo.
echo Starting Android Emulator...
echo This may take 1-2 minutes to fully boot.
echo.

REM Start emulator in separate window
start "Android Emulator" "!EMULATOR!" -avd alem-crm-emulator -no-snapshot-load -verbose

REM Wait for emulator to boot
echo Waiting for emulator to boot...
timeout /t 15 /nobreak

REM Check if emulator is online
echo.
echo Checking emulator status...
:CHECK_LOOP
"!ADB!" wait-for-device
if errorlevel 1 (
    echo Emulator not ready yet, waiting...
    timeout /t 5 /nobreak
    goto CHECK_LOOP
)

echo.
echo ========================================
echo EMULATOR IS READY!
echo ========================================
echo.
echo Installing APK...
echo.

REM Navigate to the APK location
cd /d "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\android-app\android\app\build\outputs\apk\debug"

REM Install debug APK
"!ADB!" install -r app-debug.apk

if errorlevel 1 (
    echo.
    echo ERROR: Failed to install APK
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo APK INSTALLED SUCCESSFULLY!
echo ========================================
echo.
echo Launching app...
echo.

REM Launch the app
"!ADB!" shell am start -n com.alemtrading.crm/com.getcapacitor.myapp.MainActivity

echo.
echo ========================================
echo APP LAUNCHED!
echo ========================================
echo.
echo The app should now be running on the emulator.
echo Login with:
echo   Username: admin
echo   Password 1: Admin@2024!
echo   Password 2: AdminSecure#2024
echo.
echo Press any key to close this window...
pause

