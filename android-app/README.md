# 📱 ALEM Trading CRM - Android App

Build the ALEM Trading CRM web application as a native Android app using **Capacitor**.

---

## 🚀 Quick Start

### Prerequisites
- Java Development Kit (JDK) 11+
- Android Studio
- Node.js & npm
- Environment variables set (JAVA_HOME, ANDROID_HOME)

### Setup (5 minutes)

```bash
# 1. Build frontend
cd ../frontend
npm run build
cd ../android-app

# 2. Initialize Capacitor
npx cap init

# 3. Add Android platform
npx cap add android

# 4. Sync with Android
npx cap sync android

# 5. Open in Android Studio
npx cap open android
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [SETUP_CAPACITOR.md](./SETUP_CAPACITOR.md) | Detailed setup with troubleshooting |
| [ANDROID_BUILD_GUIDE.md](./ANDROID_BUILD_GUIDE.md) | Complete build & distribution guide |
| [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) | Phase-by-phase checklist |

---

## 📋 Available Scripts

```bash
# Build frontend and copy to Android
npm run build

# Sync with Android project
npm run sync

# Run on connected device/emulator
npm run run

# Open in Android Studio
npm run open

# Initialize Android platform
npm run prepare-android
```

---

## 📦 App Details

| Property | Value |
|----------|-------|
| **App ID** | com.alemtrading.crm |
| **App Name** | ALEM Trading CRM |
| **Min SDK** | API 24 (Android 7.0) |
| **Target SDK** | API 34 (Android 14) |
| **Backend URL** | https://alem-crm-api.onrender.com |

---

## 🔐 Test Credentials

```
Admin Account:
  Username: admin
  Password 1: Admin@2024!
  Password 2: AdminSecure#2024

Sales Account:
  Username: sales
  Password 1: Sales@2024!
  Password 2: SalesSecure#2024
```

---

## 🎯 Development Workflow

1. **Develop** - Make changes in `frontend/src/`
2. **Build** - Run `npm run build` (from frontend)
3. **Sync** - Run `npm run sync` (from android-app)
4. **Test** - Open in Android Studio and run on device
5. **Release** - Generate signed APK/AAB in Android Studio

---

## 🔧 Project Structure

```
android-app/
├── node_modules/           # Dependencies
├── android/                # Android native project (after cap add)
├── capacitor.config.json   # Capacitor configuration
├── package.json            # NPM dependencies
├── SETUP_CAPACITOR.md      # Setup guide
├── ANDROID_BUILD_GUIDE.md  # Build documentation
└── IMPLEMENTATION_CHECKLIST.md # Implementation phases
```

---

## ⚠️ Important Notes

- **Prerequisites Required**: JDK and Android Studio must be installed
- **Environment Variables**: JAVA_HOME and ANDROID_HOME must be set
- **Backup Keystore**: Keep the signing keystore file safe!
- **Frontend Build**: Always run `npm run build` before syncing
- **API Connection**: App connects to `https://alem-crm-api.onrender.com`

---

## 🆘 Troubleshooting

### JAVA_HOME not set
```bash
setx JAVA_HOME "C:\Program Files\Java\jdk-11.x.x"
```

### ANDROID_HOME not set
```bash
setx ANDROID_HOME "C:\Users\<User>\AppData\Local\Android\Sdk"
```

### Gradle build failed
- Open Android Studio
- Tools → SDK Manager
- Update all tools and Gradle

### White screen after launch
```bash
npm run build
npx cap copy android
```

See [SETUP_CAPACITOR.md](./SETUP_CAPACITOR.md) for more troubleshooting.

---

## 📱 Supported Features

✅ Dashboard with analytics
✅ Customer management
✅ Transaction tracking
✅ Payment processing
✅ Chat system
✅ Notifications
✅ Admin controls
✅ Two-factor authentication
✅ Offline support (cache)
✅ Responsive mobile UI

---

## 🌐 Distribution Options

1. **Direct APK** - Share `app-release.apk` directly
2. **Google Play Store** - Upload `app-release.aab` for wider distribution
3. **Internal Testing** - Use Firebase App Distribution for team testing

---

## 📞 Getting Help

- [Capacitor Documentation](https://capacitorjs.com)
- [Android Developer Docs](https://developer.android.com)
- [Play Store Console](https://play.google.com/console)

---

## 📝 License

MIT

---

**Ready to build?** Start with [SETUP_CAPACITOR.md](./SETUP_CAPACITOR.md) 🚀

