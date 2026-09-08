# 🔧 Environment Setup Guide - Windows

**Platform**: Windows 10/11 with PowerShell/Command Prompt
**Target**: Building Android app with Capacitor

---

## ✅ Prerequisites Checklist

- [ ] Java Development Kit (JDK) 11 or higher
- [ ] Android Studio installed
- [ ] Node.js & npm installed
- [ ] JAVA_HOME environment variable set
- [ ] ANDROID_HOME environment variable set
- [ ] ANDROID_SDK_ROOT environment variable set (optional)

---

## 🔽 Installation Steps

### Step 1: Install Java Development Kit (JDK)

#### Option A: Manual Download
1. Go to: https://www.oracle.com/java/technologies/downloads/
2. Select **Java SE 21** (or latest LTS version)
3. Download **Windows x64 Installer**
4. Run installer and follow instructions
5. Default location: `C:\Program Files\Java\jdk-21.x.x`

#### Option B: Using Chocolatey (if installed)
```bash
choco install openjdk
```

#### Verify Installation
```bash
java -version
javac -version
```

---

### Step 2: Set JAVA_HOME Environment Variable

#### Method 1: Using Windows GUI
1. Press `Win + X` and select "System"
2. Click "Advanced system settings"
3. Click "Environment Variables" button
4. Click "New" under "System variables"
5. Variable name: `JAVA_HOME`
6. Variable value: `C:\Program Files\Java\jdk-21.x.x` (adjust version)
7. Click OK and apply

#### Method 2: Using Command Prompt (Admin)
```bash
setx JAVA_HOME "C:\Program Files\Java\jdk-21.x.x"
```

#### Method 3: Using PowerShell (Admin)
```powershell
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-21.x.x", "Machine")
```

#### Verify Setup
```bash
echo %JAVA_HOME%
java -version
```

---

### Step 3: Install Android Studio

1. Go to: https://developer.android.com/studio
2. Click **Download Android Studio**
3. Run the installer
4. Accept default settings and complete installation
5. Default location: `C:\Program Files\Android\Android Studio`

#### Initial Android Studio Setup
1. Open Android Studio
2. Complete welcome wizard
3. Choose "Standard" installation
4. Accept license agreements
5. Wait for Gradle sync to complete

#### Install Required SDK Components

In Android Studio:
1. Go to **Tools → SDK Manager**
2. Under **SDK Platforms**, install:
   - [ ] Android SDK Platform 34
   - [ ] Android SDK Platform 33
   - [ ] Android SDK Platform 32
3. Under **SDK Tools**, install:
   - [ ] Android SDK Build-Tools (latest)
   - [ ] Android Emulator
   - [ ] Android SDK Platform-Tools
   - [ ] Android SDK Tools
4. Click **Apply** and wait for download/installation

---

### Step 4: Set ANDROID_HOME Environment Variable

The Android SDK is typically installed at:
```
C:\Users\<YourUsername>\AppData\Local\Android\Sdk
```

#### Method 1: Using Command Prompt (Admin)
```bash
setx ANDROID_HOME "C:\Users\<YourUsername>\AppData\Local\Android\Sdk"
```

Replace `<YourUsername>` with your Windows username.

#### Method 2: Using PowerShell (Admin)
```powershell
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk", "Machine")
```

#### Verify Setup
```bash
echo %ANDROID_HOME%
dir %ANDROID_HOME%
```

You should see: `platforms`, `tools`, `ndk-bundle`, etc.

---

### Step 5: Update PATH Variable (Optional but Recommended)

Add Android tools to PATH for easier command-line access.

#### Command Prompt (Admin)
```bash
setx PATH "%PATH%;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools"
```

#### Verify
```bash
adb --version
emulator -version
```

---

## ✅ Verification Checklist

Run these commands to verify everything is set up:

```bash
REM Check Java
java -version
javac -version

REM Check JAVA_HOME
echo %JAVA_HOME%

REM Check Node.js
node -v
npm -v

REM Check Android SDK
echo %ANDROID_HOME%
dir %ANDROID_HOME%

REM Check platform-tools
adb --version

REM Check Capacitor
npx cap --version
```

Expected output should show versions without errors.

---

## 🔄 Restart Requirements

**Important**: After setting environment variables, you must:

1. Close all Command Prompt / PowerShell windows
2. Close Visual Studio Code (if open)
3. Restart your computer (recommended)
4. Or: Restart the terminal/IDE to pick up new variables

---

## 📱 Emulator Setup (Optional)

To test the app without a physical device:

### Create Android Virtual Device (AVD)

In Android Studio:
1. Go to **Tools → AVD Manager**
2. Click **Create Virtual Device**
3. Select a device (e.g., Pixel 6)
4. Select Android version (API 34 recommended)
5. Click **Finish**

### Start Emulator

```bash
emulator -avd Pixel_6_API_34
```

Or use Android Studio → AVD Manager → Play button

---

## 🚨 Common Issues & Solutions

### "JAVA_HOME not set or invalid"
```
Solution: 
1. Verify Java installation path
2. Set JAVA_HOME correctly
3. Restart terminal/IDE
4. Run: echo %JAVA_HOME%
```

### "ANDROID_HOME not set or invalid"
```
Solution:
1. Verify Android SDK location
2. Set ANDROID_HOME correctly
3. Restart terminal/IDE
4. Run: echo %ANDROID_HOME%
```

### "Gradle build failed"
```
Solution:
1. Open Android Studio
2. Tools → SDK Manager
3. Update all tools
4. Re-run build
```

### "Cannot find adb"
```
Solution:
1. Verify ANDROID_HOME is set
2. Check PATH includes platform-tools
3. Restart terminal
4. Run: %ANDROID_HOME%\platform-tools\adb.exe --version
```

### "Emulator not starting"
```
Solution:
1. Check ANDROID_HOME is correct
2. Open AVD Manager in Android Studio
3. Create new virtual device
4. Start from AVD Manager
```

---

## 📋 Environment Variables Summary

| Variable | Value | Purpose |
|----------|-------|---------|
| JAVA_HOME | C:\Program Files\Java\jdk-21.x.x | Java compiler location |
| ANDROID_HOME | C:\Users\<User>\AppData\Local\Android\Sdk | Android SDK location |
| PATH | (includes above tools) | Command-line access |

---

## 🔗 Useful Paths

```
Java Installation:
  C:\Program Files\Java\jdk-21.x.x

Android SDK:
  C:\Users\<Username>\AppData\Local\Android\Sdk

Android SDK Platforms:
  %ANDROID_HOME%\platforms

Android SDK Tools:
  %ANDROID_HOME%\tools

Platform Tools (adb, etc):
  %ANDROID_HOME%\platform-tools

Android Studio:
  C:\Program Files\Android\Android Studio
```

---

## 🎯 Next Steps

After environment setup:

1. ✅ Verify all prerequisites are installed
2. ✅ Set all environment variables
3. ✅ Restart computer
4. ✅ Run verification commands
5. ✅ Proceed with Capacitor setup (see SETUP_CAPACITOR.md)

---

## 📚 Official Resources

- [Oracle JDK Download](https://www.oracle.com/java/technologies/downloads/)
- [Android Studio Download](https://developer.android.com/studio)
- [Android Developer Docs](https://developer.android.com)
- [Capacitor Documentation](https://capacitorjs.com)
- [Windows Environment Variables Guide](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_environment_variables)

---

## ✨ System Ready!

Once all environment variables are set and verified, your system is ready for Android app development!

Proceed to: [SETUP_CAPACITOR.md](./SETUP_CAPACITOR.md)

