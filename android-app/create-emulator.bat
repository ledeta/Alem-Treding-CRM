@echo off
setlocal enabledelayedexpansion

REM Set Android SDK path
set "ANDROID_SDK=%LOCALAPPDATA%\Android\Sdk"
set "EMULATOR=%ANDROID_SDK%\emulator\emulator.exe"
set "ADB=%ANDROID_SDK%\platform-tools\adb.exe"
set "AVD_PATH=%USERPROFILE%\.android\avd\alem-crm-emulator.avd"

REM Create AVD directory if it doesn't exist
if not exist "!AVD_PATH!" mkdir "!AVD_PATH!"

REM Create config.ini file
echo Creating AVD configuration...
(
echo AvdId=alem-crm-emulator
echo PlayStore.enabled=false
echo abi.type=arm64-v8a
echo avd.ini.displayname=Alem CRM Emulator
echo avd.ini.encoding=UTF-8
echo disk.dataPartition.size=2G
echo hw.accelerometer=yes
echo hw.audioInput=yes
echo hw.battery=yes
echo hw.camera.back=virtualscene
echo hw.camera.front=emulated
echo hw.cpu.ncore=4
echo hw.dPad=yes
echo hw.device.manufacturer=Google
echo hw.device.model=Pixel 4a
echo hw.device.name=Pixel 4a
echo hw.gps=yes
echo hw.gpu.enabled=yes
echo hw.gpu.mode=auto
echo hw.initialOrientation=Portrait
echo hw.keyboard=yes
echo hw.lcd.density=420
echo hw.lcd.height=2340
echo hw.lcd.width=1080
echo hw.mainKeys=no
echo hw.maxRam=4096
echo hw.ramSize=4096
echo hw.sensors.orientation=yes
echo hw.sensors.proximity=yes
echo hw.sdCard=yes
echo hw.sdCard.size=512M
echo hw.trackBall=no
echo hw.useext4=yes
echo image.sysdir.1=system-images/android-28/default/arm64-v8a/
echo showDeviceFrame=yes
echo skin.dynamic=yes
echo skin.name=pixel_4a
echo vm.heapSize=512
) > "!AVD_PATH!\config.ini"

REM Create hardware-qemu.ini if it doesn't exist
if not exist "!AVD_PATH!\hardware-qemu.ini" (
    echo Creating hardware configuration...
    (
        echo hw.cpu.ncore=4
        echo hw.dPad=yes
        echo hw.mainKeys=no
        echo hw.sensors.orientation=yes
        echo hw.sensors.proximity=yes
        echo hw.trackBall=no
    ) > "!AVD_PATH!\hardware-qemu.ini"
)

echo AVD created successfully at: !AVD_PATH!
echo.
echo Starting emulator...
echo This may take 1-2 minutes to fully boot...
echo.

REM Start the emulator
"!EMULATOR!" -avd alem-crm-emulator -no-snapshot-load -verbose 2>&1

pause
