# 📱 ALEM TRADING CRM - ANDROID EMULATOR SETUP GUIDE

## Current Status
- ✅ Android Emulator: **BOOTING** (Takes 2-5 minutes on first startup)
- ✅ Frontend Server: Running at http://localhost:3000
- ✅ Backend Server: Running at http://localhost:3001  
- ✅ Debug APK: Built and ready at `android-app/android/app/build/outputs/apk/debug/app-debug.apk`

---

## Option 1: Wait for Emulator to Complete (Recommended)

The Android emulator (`alem-crm-emulator`) is currently starting. This is normal and may take:
- **First boot**: 3-5 minutes
- **Subsequent boots**: 1-2 minutes

### What's Happening Right Now:
1. Android virtual device is initializing
2. System partition is being unpacked
3. Boot process is running
4. adb connection is being established

### Signs of Success:
- You'll see the Android boot logo
- Home screen will appear
- Status bar will show at the top

**Just wait patiently - it will connect automatically!**

---

## Option 2: Manual Emulator Installation (If Needed)

If you want to manually set up the emulator, follow these steps:

### Step 1: Create Android Virtual Device
```bash
cd android-app
create-emulator.bat
```

### Step 2: Start Emulator
```bash
start-emulator.bat
```

This will:
1. Launch the Android emulator
2. Wait for it to boot
3. Install the debug APK
4. Launch the app automatically

---

## Emulator Installation Process (Manual)

If you need to install the APK manually:

### Using Command Prompt:
```batch
REM Set up environment
set ANDROID_SDK=%LOCALAPPDATA%\Android\Sdk
set ADB=%ANDROID_SDK%\platform-tools\adb.exe

REM Check if emulator is ready
%ADB% devices

REM Install APK (when emulator shows as "device")
cd android-app\android\app\build\outputs\apk\debug
%ADB% install -r app-debug.apk

REM Launch app
%ADB% shell am start -n com.alemtrading.crm/com.getcapacitor.myapp.MainActivity
```

---

## Web Alternative: Test in Browser First

While waiting for the emulator, you can test the app in your web browser:

### 1. Open Your Browser
Go to: **http://localhost:3000**

You'll see the ALEM Trading CRM login screen.

### 2. Login Credentials

**Admin Account:**
```
Username: admin
Password 1: Admin@2024!
Password 2: AdminSecure#2024
```

**Sales Account:**
```
Username: sales
Password 1: Sales@2024!
Password 2: SalesSecure#2024
```

### 3. Try All 14 Features:
1. 📊 Dashboard
2. 👥 Customers  
3. 💰 Transactions
4. 💳 Payments
5. 💬 Chat
6. 🔔 Notifications
7. 📦 Items/Products
8. ✅ Approvals
9. 💳 Credits
10. ↩️ Refunds
11. ⚠️ No Visits Alert
12. 👤 Account Settings
13. ⚙️ Admin Panel
14. ✅ Paid Approvals

---

## Troubleshooting Emulator

### Issue: Emulator Won't Start
**Solution:**
```batch
REM Kill all emulator processes
taskkill /F /IM emulator.exe

REM Check AVD exists
%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe -list-avds

REM Start with verbose output
%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe -avd alem-crm-emulator -verbose
```

### Issue: "Device Not Found" in adb
**Solution:**
```batch
REM Wait 30 seconds and try again
timeout /t 30

REM List connected devices
%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe devices

REM If still nothing, restart adb server
%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe kill-server
%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe start-server
```

### Issue: APK Installation Fails
**Solution:**
```batch
REM Make sure emulator is fully booted
REM Run this command and see the full response:
%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe shell getprop ro.build.version.release

REM Then try installing again
%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe install -r app-debug.apk
```

### Issue: App Won't Launch
**Solution:**
```batch
REM Check if app is installed
%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe shell pm list packages | findstr alem

REM Try launching with error output
%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe shell am start -v -n com.alemtrading.crm/com.getcapacitor.myapp.MainActivity
```

---

## Emulator Features You Can Use

Once the emulator is running, you can:

### Simulate Phone Actions:
- **Rotate device**: Keyboard shortcut or emulator menu
- **Adjust network**: Simulate slow connection
- **GPS location**: Simulate different locations
- **SMS/Calls**: Send test messages
- **Battery level**: Simulate low battery

### View Logs:
```batch
REM See real-time app logs
%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe logcat | findstr "alemtrading"

REM Clear logs
%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe logcat -c
```

### Screen Recording:
```batch
REM Record 60 seconds of video
%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe shell screenrecord --time-limit=60 /sdcard/recording.mp4

REM Pull recording to PC
%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe pull /sdcard/recording.mp4 recording.mp4
```

---

## App Features to Test

### 1. Dashboard
- View sales summary
- See recent transactions
- Check customer overview

### 2. Customers
- Add new customer
- View customer details
- Update customer info
- Search customers

### 3. Transactions
- View all transactions
- Filter by date range
- Export transaction data

### 4. Payments
- Track payment status
- Create payment requests
- Mark payments as received

### 5. Chat
- Send messages to customers
- Real-time messaging (WebSocket)
- Chat history

### 6. Notifications
- Real-time updates
- Push notifications (Android)
- Notification history

### 7. Items/Products
- Manage inventory
- Update pricing
- Track stock levels

### 8. Admin Features
- User management
- System settings
- Activity logs
- Reports

---

## System Information

### Frontend
- Framework: Next.js 14.2.35
- Language: TypeScript/React
- Port: 3000
- URL: http://localhost:3000

### Backend
- Framework: NestJS (Node.js)
- Language: TypeScript
- Port: 3001
- API: http://localhost:3001/api

### Database
- Type: PostgreSQL 18
- Default name: alem_crm
- Default user: postgres
- Default password: postgres

### Android App
- Min SDK: Android 8.0 (API 26)
- Target SDK: Android 14+ (API 34+)
- Size: Debug APK 4.1 MB, Release APK 3.2 MB
- Framework: Capacitor + React Native

---

## Next Steps

1. **Wait for emulator to boot** (3-5 minutes)
2. **APK will auto-install** when emulator is ready
3. **App will auto-launch**
4. **Login with admin credentials**
5. **Explore all 14 features**

---

## Quick Reference Commands

```batch
REM Emulator status
adb devices

REM Install APK
adb install -r app-debug.apk

REM Uninstall app
adb uninstall com.alemtrading.crm

REM Launch app
adb shell am start -n com.alemtrading.crm/com.getcapacitor.myapp.MainActivity

REM View logs
adb logcat

REM Take screenshot
adb shell screencap /sdcard/screenshot.png
adb pull /sdcard/screenshot.png

REM Reboot emulator
adb reboot

REM Enter app shell
adb shell
```

---

## Support Information

**Emulator Configuration:**
- AVD Name: alem-crm-emulator
- Android Version: 9.0 (API 28)
- Device: Pixel 4a
- RAM: 4096 MB
- Storage: 2 GB

**App Package Info:**
- Package Name: com.alemtrading.crm
- Main Activity: MainActivity
- Activity Path: com.getcapacitor.myapp.MainActivity

---

## Status Update Requested

Check back in **5 minutes** - the emulator should be fully booted and the app should be running!

For immediate testing, open your browser to: **http://localhost:3000**

