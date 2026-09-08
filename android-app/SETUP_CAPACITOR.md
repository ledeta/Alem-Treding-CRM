# 📱 Capacitor Setup Guide - ALEM Trading CRM Android App

**Status**: Capacitor CLI and packages installed ✅

---

## Current Setup Status

✅ Capacitor CLI installed globally
✅ @capacitor/core package installed
✅ package.json created with necessary dependencies
✅ capacitor.config.json configured

---

## Prerequisites Required on Your Machine

Before proceeding, ensure you have installed:

### 1. **Java Development Kit (JDK) 11+**
```bash
# Check if installed
java -version

# Download from:
# https://www.oracle.com/java/technologies/downloads/
# Or use: choco install openjdk (Windows + Chocolatey)
```

### 2. **Android Studio**
```bash
# Download from:
# https://developer.android.com/studio

# After installation, ensure Android SDK is set up:
# - Open Android Studio
# - Go to Tools > SDK Manager
# - Install:
#   - Android SDK Platform 34 (or latest)
#   - Android SDK Tools
#   - Android Emulator
```

### 3. **Set JAVA_HOME Environment Variable**
```bash
# Windows Command Prompt (run as admin):
setx JAVA_HOME "C:\Program Files\Java\jdk-11.x.x"

# Or set for current session:
set JAVA_HOME=C:\Program Files\Java\jdk-11.x.x
java -version
```

### 4. **Set ANDROID_HOME Environment Variable**
```bash
# Windows Command Prompt (run as admin):
setx ANDROID_HOME "C:\Users\<YourUsername>\AppData\Local\Android\Sdk"

# Or set for current session:
set ANDROID_HOME=C:\Users\<YourUsername>\AppData\Local\Android\Sdk
```

---

## Quick Start (After Prerequisites)

### Step 1: Build Next.js Frontend

```bash
cd frontend
npm run build
```

### Step 2: Initialize Capacitor

```bash
cd android-app
npx cap init
```

When prompted, provide:
- **App name**: ALEM Trading CRM
- **App Package ID**: com.alemtrading.crm
- **Web asset directory**: ../frontend/out

### Step 3: Add Android Platform

```bash
npx cap add android
```

This creates the Android project structure.

### Step 4: Copy Web Assets

```bash
npx cap copy android
```

### Step 5: Open in Android Studio

```bash
npx cap open android
```

Android Studio will open with the project.

### Step 6: Configure & Build in Android Studio

1. **Select Build Variant**: Change to `release` build
2. **Build APK**: Build → Build Bundle(s)/APK(s) → Build APK(s)
3. **Sign APK**: Build → Generate Signed Bundle/APK
4. **Test**: Run → Run 'app'

---

## Build Scripts (Add to android-app/package.json)

```json
"scripts": {
  "build": "cd ../frontend && npm run build && cd ../android-app && npx cap copy android",
  "sync": "npx cap sync android",
  "run": "npx cap run android",
  "open": "npx cap open android"
}
```

---

## Troubleshooting

### Error: "JAVA_HOME not set"
```
Solution: Set JAVA_HOME environment variable
setx JAVA_HOME "C:\Program Files\Java\jdk-11.x.x"
```

### Error: "ANDROID_HOME not set"
```
Solution: Set ANDROID_HOME environment variable
setx ANDROID_HOME "C:\Users\<YourUsername>\AppData\Local\Android\Sdk"
```

### Error: "Gradle build failed"
```
Solution: Update Gradle and SDK tools
- Open Android Studio
- Tools > SDK Manager
- Update all tools to latest
```

### White screen after app launch
```
Solution: Rebuild and copy web assets
npm run build
npx cap copy android
```

---

## Next Steps

1. ✅ Install prerequisites (Java, Android Studio)
2. ✅ Set environment variables (JAVA_HOME, ANDROID_HOME)
3. Run the Quick Start steps above
4. Test on Android emulator or physical device
5. Customize app icon and splash screen
6. Generate signed APK for distribution

---

## Resources

- **Capacitor Documentation**: https://capacitorjs.com
- **Android Developer Guide**: https://developer.android.com
- **Play Store Console**: https://play.google.com/console
- **Oracle JDK Download**: https://www.oracle.com/java/technologies/downloads/
- **Android Studio Download**: https://developer.android.com/studio

---

## Important Notes

⚠️ **Prerequisites are MANDATORY**: The app cannot be built without JDK and Android Studio installed locally.

⚠️ **Environment Variables**: Must be set for Gradle and Android tools to work.

⚠️ **Backend URL**: Configured to use `https://alem-crm-api.onrender.com`

⚠️ **Frontend Output**: Next.js build output goes to `frontend/out` directory

---

**Ready to build your Android app? Follow the Quick Start steps after installing prerequisites!** 🚀

