# 🚀 How to Run ALEM CRM System Locally

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Prerequisites

**Option A: If you already have Node.js and PostgreSQL installed, skip to Step 2**

**Option B: If you don't have them yet, install:**

1. **Node.js LTS** - https://nodejs.org/
2. **PostgreSQL** - https://www.postgresql.org/download/

After installation, restart your computer or Command Prompt.

---

### Step 2: Create Database

Open **Command Prompt** and run:

```cmd
psql -U postgres -c "CREATE DATABASE alem_crm;"
```

Then initialize the schema:

```cmd
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system"
psql -U postgres -d alem_crm -f database\schema.sql
```

✅ **Database is ready!**

---

### Step 3: Start Backend Service

Open a **NEW Command Prompt** and run:

```cmd
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\backend"
npm install
npm run start:dev
```

**Wait for this message**:
```
[NestApplication] Nest application successfully started
```

✅ **Backend is running on http://localhost:3001**

---

### Step 4: Start Frontend Service

Open **ANOTHER NEW Command Prompt** and run:

```cmd
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\frontend"
npm install
npm run dev
```

**Wait for this message**:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

✅ **Frontend is running on http://localhost:3000**

---

### Step 5: Access the Application

1. Open your browser
2. Go to: **http://localhost:3000**
3. You should see the ALEM CRM login page

🎉 **SUCCESS! The system is running!**

---

## 📖 Detailed Instructions by OS

### Windows (Most Common)

#### Prerequisites Check
1. Open Command Prompt (Press `Win + R`, type `cmd`, press Enter)
2. Check Node.js: `node --version`
3. Check npm: `npm --version`
4. Check PostgreSQL: `psql --version`

If any command shows "not found", install that software first.

#### Setup Steps

1. **Create Database**:
```cmd
psql -U postgres -c "CREATE DATABASE alem_crm;"
psql -U postgres -d alem_crm -f database\schema.sql
```

2. **Terminal 1 - Backend**:
```cmd
cd backend
npm install
npm run start:dev
```

3. **Terminal 2 - Frontend**:
```cmd
cd frontend
npm install
npm run dev
```

4. **Open browser**: http://localhost:3000

---

## 🔧 Troubleshooting

### "psql: command not found"
- PostgreSQL is not installed or not in PATH
- Solution: Reinstall PostgreSQL from https://www.postgresql.org/download/
- After installation, restart Command Prompt

### "node: command not found"
- Node.js is not installed or not in PATH
- Solution: Reinstall Node.js from https://nodejs.org/
- After installation, restart Command Prompt

### "Port 3000 already in use"
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "Port 3001 already in use"
```cmd
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### "Cannot connect to database"
1. Make sure PostgreSQL is running
2. Check it's on port 5432: `netstat -ano | findstr :5432`
3. Create database again:
```cmd
psql -U postgres -c "CREATE DATABASE alem_crm;"
```

### npm install fails
```cmd
npm cache clean --force
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Backend won't start
1. Check database is created: `psql -U postgres -c "SELECT datname FROM pg_database WHERE datname='alem_crm';"`
2. Check schema is initialized: `psql -U postgres -d alem_crm -c "\dt"`
3. Reinstall dependencies: `npm install`
4. Try again: `npm run start:dev`

---

## 📋 What Each Terminal Should Show

### Terminal 1 (Backend - http://localhost:3001)
```
[NestFactory] Starting Nest application...
[InstanceLoader] TypeOrmModule dependencies initialized
[InstanceLoader] ConfigModule dependencies initialized
...
[NestApplication] Nest application successfully started
```

### Terminal 2 (Frontend - http://localhost:3000)
```
  ▲ Next.js 15.0.0
  - Local:        http://localhost:3000

 ✓ Ready in 2.5s
```

---

## 🌐 Access Points

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend API | http://localhost:3001/api | 3001 |
| WebSocket | ws://localhost:3001 | 3001 |
| Database | localhost | 5432 |

---

## 📁 Project Directories

```
c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\
├── backend/          # NestJS backend server
├── frontend/         # Next.js frontend application
├── database/         # PostgreSQL schema
└── nginx/            # Nginx configuration (for production)
```

---

## 🛑 Stopping Services

To stop the services:

1. **Backend Terminal**: Press `Ctrl + C`
2. **Frontend Terminal**: Press `Ctrl + C`

Both terminals will stop their respective services.

---

## 📚 After You Get It Running

### Test API Endpoints

Open Command Prompt and try:

```bash
# Get dashboard KPIs
curl http://localhost:3001/api/dashboard/kpis

# Get all customers
curl http://localhost:3001/api/customers

# Get all items
curl http://localhost:3001/api/items
```

### Explore Features

1. Login to http://localhost:3000
2. Navigate through the different pages
3. Try uploading Excel files (Uploads section)
4. Try creating customers, items, payments
5. Check real-time chat
6. View dashboard analytics

### Check Backend Logs

Look at Terminal 1 (Backend) for any errors or useful information.

### Check Frontend Console

In your browser, press `F12` to open Developer Tools and check:
- Console tab for errors
- Network tab for API calls
- Application tab for stored data

---

## 🚀 Next Steps for Development

### Code Changes Auto-Reload

- **Backend**: Changes auto-reload with `npm run start:dev`
- **Frontend**: Changes auto-reload with hot module replacement

Just edit files and save them!

### Create Test Data

```cmd
psql -U postgres -d alem_crm
```

Then insert test data (see BACKEND_MODULES.md for examples).

### Use Postman for API Testing

1. Download Postman from https://www.postman.com/downloads/
2. Import collection from backend documentation
3. Test different API endpoints

---

## 📞 Getting Help

If something goes wrong:

1. **Check LOCAL_SETUP.md** - Detailed troubleshooting guide
2. **Check BACKEND_MODULES.md** - API documentation
3. **Check FRONTEND_SETUP.md** - Frontend guide
4. **Read terminal output** - Look for error messages
5. **Check browser console** - Press F12 and check Console tab

---

## ✅ Checklist

- [ ] Node.js installed
- [ ] PostgreSQL installed
- [ ] Database created (`alem_crm`)
- [ ] Schema initialized
- [ ] Backend running on 3001
- [ ] Frontend running on 3000
- [ ] Can access http://localhost:3000 in browser
- [ ] Ready to develop!

---

## 🎯 Common Commands Reference

```bash
# Backend development
cd backend
npm install           # Install dependencies
npm run start:dev     # Start with auto-reload
npm run build         # Build for production
npm run format        # Format code
npm run lint          # Check code quality

# Frontend development
cd frontend
npm install           # Install dependencies
npm run dev           # Start development server
npm run build         # Build for production
npm run format        # Format code

# Database
psql -U postgres -d alem_crm    # Connect to database
\dt                             # List tables
\q                              # Quit psql

# Create fresh database
dropdb -U postgres alem_crm
createdb -U postgres alem_crm
psql -U postgres -d alem_crm -f database\schema.sql
```

---

**You're all set! Happy coding! 🎉**

For questions, see the other documentation files in the project root.
