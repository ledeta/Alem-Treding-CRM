@echo off
setlocal enabledelayedexpansion

REM Set Android SDK path
set "ANDROID_SDK=%LOCALAPPDATA%\Android\Sdk"
set "ADB=%ANDROID_SDK%\platform-tools\adb.exe"
set "APK_PATH=android-app\android\app\build\outputs\apk\debug\app-debug.apk"

echo.
echo ========================================
echo ALEM TRADING CRM - AUTO INSTALL APK
echo ========================================
echo.
echo Waiting for emulator to boot...
echo This script will auto-install the APK when ready.
echo.

REM Counter for timeout
set /a counter=0
set /a max_attempts=120

:WAIT_FOR_DEVICE
REM Check if device is connected
"!ADB!" devices | findstr /c:"emulator-5554" > nul
if errorlevel 1 (
    REM Device not found
    set /a counter=!counter!+1
    if !counter! gtr !max_attempts! (
        echo.
        echo ERROR: Emulator did not boot within 10 minutes!
        echo Please check:
        echo 1. Android Emulator is running
        echo 2. System has enough disk space
        echo 3. Try restarting the emulator
        echo.
        pause
        exit /b 1
    )
    
    if !counter! equ 1 (
        echo Emulator not ready yet. Waiting...
    )
    if !counter! equ 30 (
        echo Still booting... (been waiting 1 minute)
    )
    if !counter! equ 60 (
        echo Still booting... (been waiting 2 minutes)
    )
    
    timeout /t 5 /nobreak > nul
    goto WAIT_FOR_DEVICE
)

echo.
echo ✓ Emulator found!
echo.

REM Wait for device to be fully online
:WAIT_FOR_ONLINE
"!ADB!" shell getprop ro.boot.serialno > nul 2>&1
if errorlevel 1 (
    echo Waiting for emulator to fully boot...
    timeout /t 3 /nobreak > nul
    goto WAIT_FOR_ONLINE
)

echo ✓ Emulator is online!
echo.
echo Installing APK...
echo.

REM Install the APK
"!ADB!" install -r "!APK_PATH!"

if errorlevel 1 (
    echo.
    echo ERROR: Failed to install APK
    echo Please check that the APK exists at: !APK_PATH!
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
echo The ALEM Trading CRM app is now running on the emulator!
echo.
echo Login with:
echo   Username: admin
echo   Password 1: Admin@2024!
echo   Password 2: AdminSecure#2024
echo.
echo Or use the Sales account:
echo   Username: sales
echo   Password 1: Sales@2024!
echo   Password 2: SalesSecure#2024
echo.
echo You can now interact with the app on the emulator.
echo.
echo Press any key to close this window...
pause

