# ALEM CRM - Complete Local Setup Guide

## Prerequisites Check

You mentioned you have installed:
- ✅ Node.js 18+ 
- ✅ PostgreSQL 14+

Let's verify:

```bash
# Check Node.js version
node --version
# Should show v18.0.0 or higher (you have v26.5.0 ✅)

# Check npm version
npm --version

# Check PostgreSQL (may need to add to PATH)
psql --version
```

---

## Step 1: Setup PostgreSQL Database

### Option A: Using pgAdmin (GUI)
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click "Databases" → "Create" → "Database"
4. Name: `alem_crm`
5. Click "Save"
6. Right-click `alem_crm` → "Query Tool"
7. Open and run: `database\schema.sql`

### Option B: Using Command Line
```bash
# Open Command Prompt as Administrator

# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE alem_crm;

# Exit psql
\q

# Load the schema
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system"
psql -U postgres -d alem_crm -f database\schema.sql
```

### Option C: If psql is not in PATH
```bash
# Find your PostgreSQL installation (usually):
# C:\Program Files\PostgreSQL\<version>\bin\

# Add to PATH or use full path:
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE DATABASE alem_crm;"
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d alem_crm -f database\schema.sql
```

---

## Step 2: Install Backend Dependencies

```bash
# Navigate to backend folder
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\backend"

# Install dependencies (takes 2-5 minutes)
npm install

# Create uploads directory
mkdir uploads
```

---

## Step 3: Verify Backend Configuration

Your `.env` file is already configured at:
`backend\.env`

Current settings (good for local dev):
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alem_crm
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3001
FRONTEND_URL=http://localhost:3000
```

**Important:** If your PostgreSQL password is different, update `DB_PASSWORD` in `backend\.env`

---

## Step 4: Install Frontend Dependencies

```bash
# Navigate to frontend folder
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\frontend"

# Install dependencies (takes 2-5 minutes)
npm install
```

---

## Step 5: Start the Application

You need **TWO Command Prompt windows**:

### Terminal 1: Start Backend
```bash
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\backend"
npm run start:dev
```

Wait for:
```
✅ Application is running on: http://localhost:3001
✅ Database connected successfully
```

### Terminal 2: Start Frontend
```bash
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\frontend"
npm run dev
```

Wait for:
```
✅ Ready on http://localhost:3000
```

---

## Step 6: Access the Application

Open your browser and go to:
```
http://localhost:3000
```

---

## Quick Start Scripts

I've created helper batch files for you:

### **RUN_ME_FIRST.bat**
- Full setup wizard
- Guides you through all steps

### **START_BACKEND.bat** (will be created)
- Starts backend server quickly

### **START_FRONTEND.bat** (will be created)
- Starts frontend server quickly

---

## Troubleshooting

### Problem: "Cannot find module" errors
**Solution:**
```bash
# Delete node_modules and reinstall
cd backend
rmdir /s /q node_modules
npm install

cd ..\frontend
rmdir /s /q node_modules
npm install
```

### Problem: "Database connection failed"
**Solution:**
```bash
# Check if PostgreSQL is running
# Windows: Open Services → PostgreSQL should be "Running"

# Check if database exists
psql -U postgres -c "\l"

# Should show alem_crm in the list
```

### Problem: "Port 3001 already in use"
**Solution:**
```bash
# Find and kill the process using port 3001
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F
```

### Problem: "Port 3000 already in use"
**Solution:**
```bash
# Find and kill the process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Problem: PostgreSQL password incorrect
**Solution:**
Edit `backend\.env` and change:
```env
DB_PASSWORD=your_actual_postgres_password
```

### Problem: npm install is very slow
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

---

## Verification Steps

After starting both servers:

### 1. Check Backend API
Open in browser or use curl:
```bash
curl http://localhost:3001
```

Should return API information.

### 2. Check Frontend
```bash
curl http://localhost:3000
```

Should return HTML.

### 3. Check Database Connection
Backend logs should show:
```
[TypeORM] Database connection established
```

---

## Default Credentials

The system will create a default admin user:
```
Username: admin@alemcrm.com
Password: Admin123!
```

**Change this immediately in production!**

---

## Next Steps

Once running:

1. **Login** with default credentials
2. **Create users** for your team
3. **Upload customer data** via Excel
4. **Explore features**:
   - Dashboard
   - Customer management
   - Payment requests
   - Group chat
   - Notifications

---

## Development Tips

### Hot Reload
Both servers support hot reload:
- Backend: Changes auto-restart the server
- Frontend: Changes auto-refresh the browser

### Logs
- Backend logs: Check Terminal 1
- Frontend logs: Check Terminal 2 and browser console (F12)

### Stopping Servers
- Press `Ctrl+C` in each terminal window

---

## Production Deployment

When ready for production, see:
- `DEPLOYMENT.md` for full deployment guide
- `docker-compose.yml` for Docker deployment

---

## Support

If you encounter issues:

1. Check the terminal logs for error messages
2. Check `SETUP_GUIDE.md` for module-specific help
3. Check `BACKEND_MODULES.md` for API documentation
4. Verify all prerequisites are installed
5. Ensure PostgreSQL service is running

---

## Quick Command Reference

```bash
# Backend
cd backend
npm run start:dev      # Start with hot reload
npm run build          # Build for production
npm run start:prod     # Run production build

# Frontend  
cd frontend
npm run dev            # Start dev server
npm run build          # Build for production
npm run start          # Run production build

# Database
psql -U postgres -d alem_crm                    # Connect
psql -U postgres -d alem_crm -f database\schema.sql  # Load schema
```

---

## File Structure

```
alem-crm-system/
├── backend/              ← NestJS API server
│   ├── src/             ← Source code
│   ├── .env             ← Configuration (already set up ✅)
│   └── package.json     
├── frontend/            ← Next.js web app
│   ├── src/            ← Source code
│   └── package.json
├── database/           
│   └── schema.sql       ← Database schema
└── This guide
```

---

## System Architecture

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   Browser   │ ───> │  Frontend   │ ───> │   Backend    │
│ :3000       │ <─── │  Next.js    │ <─── │   NestJS     │
└─────────────┘      │  :3000      │      │   :3001      │
                     └─────────────┘      └──────┬───────┘
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │  PostgreSQL  │
                                          │   alem_crm   │
                                          └──────────────┘
```

---

**You're all set! Follow the steps above and you'll have ALEM CRM running locally in 10 minutes.** 🚀

If npm install is currently running in the background, let it finish (it may take 5-10 minutes for first install).
