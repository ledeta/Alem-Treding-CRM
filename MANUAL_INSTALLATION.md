# ALEM CRM - Manual Installation Guide

Since you have Node.js 18+ and PostgreSQL 14+ installed, here's the step-by-step manual process:

## Current Status

✅ Node.js v26.5.0 installed  
✅ Backend `.env` file configured  
⏳ Dependencies need to be installed  
⏳ Database needs to be created

---

## Installation Steps

### Step 1: Create PostgreSQL Database

#### Method 1: Using Command Line

```cmd
REM Connect to PostgreSQL
psql -U postgres

REM In psql prompt:
CREATE DATABASE alem_crm;
\q

REM Load the schema
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system"
psql -U postgres -d alem_crm -f database\schema.sql
```

#### Method 2: Using pgAdmin (if psql not in PATH)

1. Open **pgAdmin**
2. Connect to your PostgreSQL server (localhost)
3. Right-click **Databases** → **Create** → **Database**
4. Enter name: `alem_crm`
5. Click **Save**
6. Right-click `alem_crm` → **Query Tool**
7. Click **Open File** → Select `database\schema.sql`
8. Click **Execute** (F5)

---

### Step 2: Install Backend Dependencies

Open **Command Prompt** or **PowerShell**:

```cmd
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\backend"

REM This will take 5-10 minutes on first run
npm install

REM Create uploads directory
mkdir uploads
```

**Note:** The npm install command downloads ~200MB of dependencies. Be patient!

---

### Step 3: Install Frontend Dependencies

In the same or a new terminal:

```cmd
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\frontend"

REM This will take 5-10 minutes on first run
npm install
```

---

### Step 4: Verify Configuration

The backend `.env` file is already configured with these settings:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alem_crm
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3001
FRONTEND_URL=http://localhost:3000
```

**Important:** If your PostgreSQL password is different from `postgres`, update it:

```cmd
notepad "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\backend\.env"

REM Change this line:
DB_PASSWORD=your_actual_password
```

---

### Step 5: Start Backend Server

Open **Terminal 1** (Command Prompt):

```cmd
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\backend"
npm run start:dev
```

**Wait for these messages:**
```
[Nest] Application successfully started
[TypeORM] Database connection established
[Nest] Server running on http://localhost:3001
```

**Keep this terminal open!**

---

### Step 6: Start Frontend Server

Open **Terminal 2** (New Command Prompt):

```cmd
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\frontend"
npm run dev
```

**Wait for this message:**
```
✓ Ready on http://localhost:3000
```

**Keep this terminal open!**

---

### Step 7: Access the Application

Open your web browser and navigate to:

```
http://localhost:3000
```

---

## Default Login Credentials

```
Email: admin@alemcrm.com
Password: Admin123!
```

**Change these immediately after first login!**

---

## Troubleshooting

### Issue: npm install fails

**Error:** `ECONNRESET` or network timeout

**Solution:**
```cmd
npm config set registry https://registry.npmjs.org/
npm cache clean --force
npm install
```

---

### Issue: Database connection fails

**Error:** `Connection refused` or `authentication failed`

**Solutions:**

1. Check if PostgreSQL is running:
   - Open **Services** (Win+R → `services.msc`)
   - Find **postgresql-x64-15** (or your version)
   - Status should be "Running"
   - If not, right-click → **Start**

2. Verify database exists:
```cmd
psql -U postgres -c "\l" | findstr alem_crm
```

3. Check password in `.env`:
```cmd
notepad backend\.env
```

---

### Issue: Port already in use

**Error:** `Port 3001 is already in use`

**Solution:**
```cmd
REM Find process using port 3001
netstat -ano | findstr :3001

REM Kill the process (replace <PID> with the number from above)
taskkill /PID <PID> /F

REM Restart the server
npm run start:dev
```

---

### Issue: Module not found

**Error:** `Cannot find module '@nestjs/common'`

**Solution:**
```cmd
REM Delete node_modules and reinstall
cd backend
rmdir /s /q node_modules
npm install
```

---

### Issue: PostgreSQL not in PATH

**Error:** `'psql' is not recognized as an internal or external command`

**Solution:**

Add PostgreSQL to PATH or use full path:

```cmd
REM Find PostgreSQL installation (usually one of these):
dir "C:\Program Files\PostgreSQL" /ad

REM Use full path (replace 15 with your version):
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres
```

**Or:** Use pgAdmin instead (see Step 1, Method 2)

---

## Verification Checklist

After completing all steps:

- [ ] Database `alem_crm` exists in PostgreSQL
- [ ] Backend `node_modules` folder exists (1000+ packages)
- [ ] Frontend `node_modules` folder exists (1000+ packages)
- [ ] Backend terminal shows "Server running on http://localhost:3001"
- [ ] Frontend terminal shows "Ready on http://localhost:3000"
- [ ] Browser can access http://localhost:3000
- [ ] Login page is visible

---

## Quick Start Next Time

After initial setup, you only need steps 5-7:

**Use the helper scripts:**
1. Double-click `START_BACKEND.bat`
2. Double-click `START_FRONTEND.bat`
3. Open http://localhost:3000

---

## System Architecture

```
┌──────────────┐
│   Browser    │  http://localhost:3000
│  (You use)   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Frontend   │  Next.js on port 3000
│   (Terminal  │  Serves the UI
│    Window 2) │
└──────┬───────┘
       │ API calls
       ▼
┌──────────────┐
│   Backend    │  NestJS on port 3001
│   (Terminal  │  Business logic & API
│    Window 1) │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  PostgreSQL  │  Database
│   alem_crm   │  Stores all data
└──────────────┘
```

---

## Development Tips

### Hot Reload
Both servers support hot reload:
- **Backend:** Edit any `.ts` file → Server auto-restarts
- **Frontend:** Edit any component → Browser auto-refreshes

### View Logs
- **Backend:** Check Terminal 1 for API logs
- **Frontend:** Check Terminal 2 for build logs
- **Browser:** Press F12 → Console for client logs

### Stop Servers
Press `Ctrl+C` in each terminal window

### Restart Servers
```cmd
REM In each terminal:
Ctrl+C  (stop)
npm run start:dev  (backend)
npm run dev        (frontend)
```

---

## What's Installed

### Backend Dependencies (~200MB)
- NestJS framework
- TypeORM (database ORM)
- PostgreSQL driver
- JWT authentication
- Socket.io (real-time features)
- ExcelJS (Excel processing)
- And ~190 more packages

### Frontend Dependencies (~400MB)
- Next.js framework
- React
- TypeScript
- Tailwind CSS
- And ~200 more packages

---

## Next Steps After Installation

1. **Login** with default credentials
2. **Change admin password** in settings
3. **Create users** for your team
4. **Upload data** via Excel import
5. **Explore features**:
   - Dashboard with KPIs
   - Customer management
   - Payment requests
   - Group chat
   - Notifications

---

## Need More Help?

📖 **Documentation:**
- `LOCAL_SETUP_INSTRUCTIONS.md` - Detailed guide
- `BACKEND_MODULES.md` - API documentation
- `SETUP_GUIDE.md` - Backend setup
- `API_DOCUMENTATION.md` - API reference

🛠️ **Helper Scripts:**
- `RUN_ME_FIRST.bat` - Setup wizard
- `CHECK_STATUS.bat` - System status check
- `START_BACKEND.bat` - Quick start backend
- `START_FRONTEND.bat` - Quick start frontend

---

## Success Indicators

✅ Backend terminal shows:
```
[Nest] LOG [InstanceLoader] AppModule dependencies initialized
[Nest] LOG [RoutesResolver] AuthController {/auth}
[Nest] LOG [RouterExplorer] Mapped {/auth/login, POST} route
...
[Nest] LOG Application is running on: http://localhost:3001
```

✅ Frontend terminal shows:
```
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
  - Ready in 3.2s
```

✅ Browser shows ALEM CRM login page

---

**You're all set! Follow these steps and you'll have ALEM CRM running locally.** 🚀

The first npm install will take time, but afterwards starting the servers is fast!
