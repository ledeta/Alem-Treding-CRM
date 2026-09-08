# 🚀 ALEM CRM System - Quick Start Guide

## ✅ What's Been Set Up

- ✅ PostgreSQL installed and configured
- ✅ Database `alem_crm` created
- ✅ Backend dependencies installed
- ✅ Frontend dependencies installed
- ✅ @nestjs/swagger installed (API documentation)
- ✅ All TypeScript errors fixed

## 🎯 How to Start the Application

### Option 1: Start Everything at Once (Easiest!)

**Double-click: `START_ALL.bat`**

This will:
1. Check/start PostgreSQL
2. Start the backend server (new window)
3. Start the frontend server (new window)
4. Wait 30-60 seconds, then open http://localhost:3000

### Option 2: Start Individually

1. **Start Backend:**
   - Double-click: `START_BACKEND_FIXED.bat`
   - Wait for message: "Application is running on: http://localhost:3001"

2. **Start Frontend (in a NEW terminal):**
   - Double-click: `START_FRONTEND_FIXED.bat`
   - Wait for message: "ready - started server on http://localhost:3000"

3. **Open Browser:**
   - Go to: http://localhost:3000

## 🔐 Default Login Credentials

```
Email: admin@alemcrm.com
Password: Admin123!
```

## 🛠️ Troubleshooting

### Check Setup Status

Double-click: `CHECK_SETUP_STATUS.bat`

This will verify:
- PostgreSQL is running
- Database exists
- All dependencies installed

### Common Issues

**1. PostgreSQL not running:**
```
Double-click: START_POSTGRESQL.bat
```

**2. Port 3000 or 3001 already in use:**
```cmd
netstat -ano | findstr ":3000"
taskkill /PID <number> /F
```

**3. Backend compilation errors:**
- Already fixed! UpdateUserDto now has all required properties
- @nestjs/swagger is now installed

**4. Frontend won't start:**
```cmd
cd frontend
npm install --legacy-peer-deps
npm run dev
```

## 📁 Project Structure

```
alem-crm-system/
├── backend/          # NestJS API server (Port 3001)
│   ├── src/         # Source code
│   └── .env         # Backend configuration
├── frontend/         # Next.js web app (Port 3000)
│   ├── src/         # Source code
│   └── .env.local   # Frontend configuration
└── database/         # Database schemas
```

## 🔗 Important URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Documentation:** http://localhost:3001/api
- **PostgreSQL:** localhost:5432

## 📚 Database Tools

- **DBeaver:** Already connected to localhost:5432
- **pgAdmin:** Available at PostgreSQL 18 installation

## 🎉 Next Steps

1. Run `START_ALL.bat` to start everything
2. Wait 60 seconds for services to initialize
3. Open http://localhost:3000 in your browser
4. Login with admin@alemcrm.com / Admin123!
5. Explore the CRM system!

## 💡 Development Tips

**Backend logs:** Check the green terminal window
**Frontend logs:** Check the blue terminal window
**Hot reload:** Both backend and frontend auto-reload on file changes

**Stop servers:** Press `Ctrl+C` in each terminal window

## 🐛 If Something Goes Wrong

1. Close all terminal windows
2. Run: `CHECK_SETUP_STATUS.bat`
3. Fix any [X] items shown
4. Try `START_ALL.bat` again

## ✨ All Fixed Issues

- ✅ UpdateUserDto missing email/password properties
- ✅ @nestjs/swagger dependency missing
- ✅ Database creation completed
- ✅ PostgreSQL connection verified

---

**You're all set! Just run START_ALL.bat and enjoy! 🎊**
