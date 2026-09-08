# 📱 ALEM TRADING CRM - ANDROID APP BUILD GUIDE

**Version**: 1.0.0
**Date**: July 25, 2026
**Status**: Ready for Build

---

## 🎯 Overview

This guide explains how to build the ALEM Trading CRM as a native Android app using Capacitor. The app wraps your existing web application into a native Android package.

---

## 📋 Prerequisites

Before building the Android app, ensure you have:

1. **Java Development Kit (JDK)** 11 or higher
   ```bash
   java -version
   ```

2. **Android SDK** installed
   - Download from: https://developer.android.com/studio
   - Install Android Studio

3. **Node.js & npm**
   ```bash
   node -v
   npm -v
   ```

4. **Git**
   ```bash
   git --version
   ```

---

## 🚀 Step-by-Step Build Instructions

### Step 1: Install Capacitor CLI

```bash
npm install -g @capacitor/cli
```

### Step 2: Initialize Capacitor Project

```bash
cd frontend
npx cap init
```

When prompted, enter:
- **App name**: ALEM Trading CRM
- **App Package ID**: com.alemtrading.crm
- **App Directory**: out (Next.js build output)

### Step 3: Build the Next.js App

```bash
cd frontend
npm run build
```

### Step 4: Add Android Platform

```bash
npx cap add android
```

This creates the `android` folder with native Android project.

### Step 5: Copy Web Assets

```bash
npx cap copy android
```

### Step 6: Sync with Android Project

```bash
npx cap sync android
```

### Step 7: Open Android Studio

```bash
npx cap open android
```

This opens the Android project in Android Studio.

### Step 8: Configure Signing

1. In Android Studio, go to **Build → Generate Signed Bundle/APK**
2. Click **Next**
3. Select **APK** (for testing) or **Android App Bundle** (for production)
4. Create a new keystore:
   - **Key store path**: Choose a location (e.g., `alem-trading.keystore`)
   - **Password**: Create a strong password
   - **Alias**: `alem-trading-key`
   - **Key password**: Same or different
   - **Validity**: 25 years
5. Click **Create**

### Step 9: Build APK/AAB

1. Select **Release** build variant
2. Click **Finish**
3. Android Studio builds the APK or AAB file

### Step 10: Test APK

Connect an Android device and run:

```bash
npx cap run android
```

Or install manually:

```bash
adb install -r path/to/app-release.apk
```

---

## 📦 Build Output

After successful build, you'll have:

- **APK**: `android/app/release/app-release.apk` (for direct installation)
- **AAB**: `android/app/release/app-release.aab` (for Google Play Store)

---

## 📝 App Configuration

### App Name
**ALEM Trading CRM**

### Package ID
**com.alemtrading.crm**

### Version
- Version Code: 1
- Version Name: 1.0.0

### Minimum SDK
- API Level: 24 (Android 7.0)

### Target SDK
- API Level: 34 (Android 14)

### Permissions Needed

The following permissions are configured in `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

---

## 🔒 Security Features

✅ **HTTPS/SSL** - All API calls use secure HTTPS
✅ **Authentication** - Two-factor authentication system
✅ **Local Storage** - Secure token storage
✅ **Certificate Pinning** - Optional SSL pinning (can be added)
✅ **Obfuscation** - R8/ProGuard code obfuscation enabled

---

## 📱 App Features Available

✅ Dashboard with analytics
✅ Customer management
✅ Transaction tracking
✅ Payment processing
✅ Chat system
✅ Notifications
✅ Admin controls
✅ Two-factor authentication
✅ Offline support (cache)
✅ Push notifications (optional)

---

## 🌐 API Configuration

The app connects to:

**Backend API**: `https://alem-crm-api.onrender.com`

Configure in `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=https://alem-crm-api.onrender.com
NEXTAUTH_URL=https://alem-treding.onrender.com
```

---

## 📦 Distribution Options

### Option 1: Direct APK Installation
- Users download APK directly
- Install via `adb install app.apk` or Android file manager
- **Pros**: Quick distribution, no store approval
- **Cons**: Updates manual, less discoverable

### Option 2: Google Play Store
- Submit AAB (Android App Bundle) to Play Store
- Automatic updates, large audience
- **Pros**: Easy updates, official store
- **Cons**: Review process (usually 1-3 hours)

### Option 3: Internal Testing
- Use Firebase App Distribution
- Share with team members for testing
- **Pros**: Easy collaboration, phased rollout
- **Cons**: Limited to invited users

---

## 🛠️ Troubleshooting

### Build Fails - "Gradle Build Failed"
```
Solution: Update Android SDK tools
- Open Android Studio → SDK Manager
- Update Gradle and Android plugin
```

### APK Not Installing
```
Solution: Clear old app data
adb uninstall com.alemtrading.crm
adb install app-release.apk
```

### White Screen After Launch
```
Solution: Check web assets
- Verify npm run build completed successfully
- Run npx cap copy android again
```

### API Connection Fails
```
Solution: Check API URL
- Verify NEXT_PUBLIC_API_URL in .env
- Check internet permission in AndroidManifest.xml
- Test API is accessible from device
```

---

## 📋 Checklist Before Release

- [ ] App name and version updated
- [ ] Keystore created and backed up safely
- [ ] App tested on multiple Android versions
- [ ] All features tested and working
- [ ] Privacy policy added
- [ ] Terms of service added
- [ ] App icon designed (192x192, 512x512)
- [ ] Screenshots prepared for store
- [ ] Signed APK/AAB generated

---

## 📊 Android App Structure

```
android-app/
├── android/
│   ├── app/
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── AndroidManifest.xml
│   │   │   │   ├── java/
│   │   │   │   └── res/
│   │   │   ├── debug/
│   │   │   └── release/
│   │   ├── build.gradle
│   │   └── proguard-rules.pro
│   ├── gradle/
│   └── settings.gradle
├── capacitor.config.json
├── package.json
└── www/
    └── (Next.js build output)
```

---

## 🔄 Update Process

To release app updates:

1. Update frontend code
2. Run `npm run build` in frontend directory
3. Run `npx cap copy android`
4. Increment version in `android/app/build.gradle`
5. Generate new signed APK/AAB
6. Upload to Play Store or distribute via APK

---

## 📞 Support & Documentation

- **Capacitor Docs**: https://capacitorjs.com
- **Android Dev Docs**: https://developer.android.com
- **Play Store Console**: https://play.google.com/console

---

## 🎉 Next Steps

1. Install prerequisites (JDK, Android SDK)
2. Follow build instructions above
3. Test on Android emulator or device
4. Customize app icon and branding
5. Submit to Play Store or distribute APK

---

**Your ALEM Trading CRM Android app is ready to build!** 🚀

For questions, refer to official Capacitor and Android documentation.
