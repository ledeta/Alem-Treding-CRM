# 🚀 Run ALEM CRM Locally - Quick Reference

## You Have Everything You Need!

✅ **Node.js v26.5.0** installed  
✅ **PostgreSQL 14+** installed  
✅ **Backend configured** (`.env` file ready)  
✅ **Helper scripts** created

---

## 📋 3-Step Quick Start

### 1️⃣ Setup Database (One-time)

**Option A - pgAdmin (Easiest):**
1. Open pgAdmin
2. Create database: `alem_crm`
3. Run SQL file: `database\schema.sql`

**Option B - Command Line:**
```cmd
psql -U postgres -c "CREATE DATABASE alem_crm;"
psql -U postgres -d alem_crm -f "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\database\schema.sql"
```

### 2️⃣ Install Dependencies (One-time)

**Double-click:** `RUN_ME_FIRST.bat`

OR manually:
```cmd
cd backend
npm install    (takes 5-10 minutes)

cd ..\frontend
npm install    (takes 5-10 minutes)
```

### 3️⃣ Start System (Every time)

**Double-click both:**
- `START_BACKEND.bat`
- `START_FRONTEND.bat`

Then open: **http://localhost:3000**

---

## 📁 Helper Files Created

| File | Purpose |
|------|---------|
| 🚀 **START_HERE.txt** | Visual quick start guide |
| 📖 **MANUAL_INSTALLATION.md** | Complete step-by-step instructions |
| 📖 **LOCAL_SETUP_INSTRUCTIONS.md** | Detailed setup with troubleshooting |
| ✅ **CHECK_STATUS.bat** | Check if everything is working |
| 🎯 **START_BACKEND.bat** | Quick start backend server |
| 🎯 **START_FRONTEND.bat** | Quick start frontend server |
| 🔧 **RUN_ME_FIRST.bat** | Setup wizard |

---

## ⚡ Default Credentials

```
Email: admin@alemcrm.com
Password: Admin123!
```

---

## 🆘 Common Issues

**Database connection fails:**
- Check PostgreSQL service is running (Services → postgresql)
- Verify password in `backend\.env`

**Port already in use:**
```cmd
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**npm install is slow:**
- First install takes 5-10 minutes, be patient
- Check internet connection

---

## 📚 More Help

- See **MANUAL_INSTALLATION.md** for detailed troubleshooting
- See **LOCAL_SETUP_INSTRUCTIONS.md** for complete guide
- Run **CHECK_STATUS.bat** to diagnose issues

---

## System Ready! 🎉

Your ALEM CRM system is fully configured and ready to run locally.

**Next:** Follow the 3 steps above or open `🚀 START_HERE.txt` for visual guide.
