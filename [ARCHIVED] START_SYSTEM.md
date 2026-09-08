# ▶️ ALEM CRM System - Quick Start Guide

## 🎉 All Issues Resolved!

The Z22.js error has been fixed. The system is ready to use!

---

## 🚀 Starting the System (3 Easy Steps)

### Step 1: Start PostgreSQL Database
```cmd
START_POSTGRESQL.bat
```
**Wait for:** "database system is ready to accept connections"

### Step 2: Start Backend API
Open a **NEW** terminal window:
```cmd
cd backend
npm run start:dev
```
**Wait for:** "Nest application successfully started"
**Backend URL:** http://localhost:3001

### Step 3: Start Frontend
Open another **NEW** terminal window:
```cmd
START_FRONTEND.bat
```
**Wait for:** "Ready in XX seconds"
**Frontend URL:** http://localhost:3000

---

## 🎯 Quick Access

| Service | URL | Status Check |
|---------|-----|--------------|
| **Frontend** | http://localhost:3000 | Login page should load |
| **Backend API** | http://localhost:3001 | Returns "Hello World" |
| **Backend Docs** | http://localhost:3001/api | Swagger UI |
| **PostgreSQL** | localhost:5432 | Use pgAdmin |

---

## 👤 Default Login Credentials

```
Username: admin
Password: Admin123!
```

---

## ✅ Verification Checklist

Before logging in, verify all services:

```cmd
CHECK_SETUP_STATUS.bat
```

This checks:
- ✅ PostgreSQL is running
- ✅ Database exists
- ✅ Backend node_modules installed
- ✅ Frontend node_modules installed
- ✅ Environment files configured

---

## 🔧 If Something Goes Wrong

### Frontend Shows "Z22.js" or Module Errors
```cmd
FIX_FRONTEND.bat
```

### Backend Won't Start
```cmd
cd backend
npm install
npm run start:dev
```

### Database Connection Errors
1. Check PostgreSQL is running
2. Verify backend/.env file:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=alem_crm
   ```

### Can't Login
1. Make sure backend is running (check http://localhost:3001)
2. Check browser console for errors (F12)
3. Verify database has the admin user

---

## 📁 Helpful Scripts

| Script | Purpose |
|--------|---------|
| `START_ALL.bat` | Start all services in one go |
| `START_FRONTEND.bat` | Start just the frontend |
| `START_POSTGRESQL.bat` | Start just the database |
| `FIX_FRONTEND.bat` | Fix frontend build issues |
| `CHECK_SETUP_STATUS.bat` | Verify system status |
| `COMPLETE_SETUP.bat` | Full setup from scratch |

---

## 🎨 What You'll See

### 1. Login Page (localhost:3000/login)
- Purple gradient background
- Login form with username/password
- Default credentials shown

### 2. Dashboard (after login)
- Sales overview
- Customer statistics
- Recent transactions
- Quick actions

### 3. Main Features
- 📊 Dashboard - Analytics and overview
- 👥 Customers - Customer management
- 📦 Items - Product catalog
- 💰 Transactions - Sales history
- 🔧 Admin Panel - System management

---

## 🐛 Common Issues & Solutions

### Issue: "Port 3000 already in use"
**Solution:** Kill the process or use different port
```cmd
npx kill-port 3000
```

### Issue: "Cannot connect to database"
**Solution:** 
1. Check if PostgreSQL service is running
2. Verify credentials in backend/.env
3. Restart PostgreSQL service

### Issue: "CORS error in browser"
**Solution:** Backend is configured to allow localhost:3000
- Check backend is running
- Verify backend/src/main.ts has CORS enabled

### Issue: "Module not found" errors
**Solution:** Reinstall dependencies
```cmd
cd frontend
npm install
# OR use
FIX_FRONTEND.bat
```

---

## 📊 System Architecture

```
┌─────────────────────────────────────────┐
│         Browser (Port 3000)             │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │   Next.js Frontend (React)       │  │
│  │   - Login, Dashboard, CRUD       │  │
│  └──────────────────────────────────┘  │
└────────────────┬────────────────────────┘
                 │ HTTP/REST API
                 ↓
┌─────────────────────────────────────────┐
│      Backend API (Port 3001)            │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │   NestJS Application             │  │
│  │   - Auth, CRUD, Business Logic   │  │
│  └──────────────────────────────────┘  │
└────────────────┬────────────────────────┘
                 │ TypeORM
                 ↓
┌─────────────────────────────────────────┐
│     PostgreSQL Database (Port 5432)     │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │   alem_crm Database              │  │
│  │   - Users, Customers, Items, etc │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 🎓 Development Tips

### Hot Reload is Enabled
- Frontend: Changes auto-refresh in browser
- Backend: Changes auto-restart the server

### Debugging
- Frontend: Browser DevTools (F12)
- Backend: Check terminal output
- Database: Use pgAdmin 4

### API Documentation
Visit http://localhost:3001/api for interactive API docs

---

## 📞 Need More Help?

1. Check `🚀 START_HERE.md` for detailed setup
2. Check `✅ ALL_ISSUES_RESOLVED.md` for recent fixes
3. Check `🔧 FRONTEND_FIXED.md` for frontend-specific info
4. Review logs in terminal windows

---

## 🎉 You're All Set!

The system is configured and ready. Just follow the 3 steps above to start all services and begin using the ALEM CRM system!

**Happy coding! 🚀**
