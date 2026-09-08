# Database Setup Workaround

Both pgAdmin and psql are having issues. Here are **3 alternative solutions**:

---

## ✅ Solution 1: Use createdb Command (Simplest!)

### Step 1: Open Command Prompt as Administrator
- Right-click Start → Command Prompt (Admin)

### Step 2: Set PostgreSQL Password
```cmd
set PGPASSWORD=postgres
```

### Step 3: Create Database
```cmd
"C:\Program Files\PostgreSQL\18\bin\createdb.exe" -U postgres alem_crm
```

If successful, you'll see nothing (no error = success!)

### Step 4: Load Schema
```cmd
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system"
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d alem_crm -f database\schema.sql
```

You should see lots of "CREATE TABLE" and "CREATE INDEX" messages.

✅ **Done!**

---

## ✅ Solution 2: Use DBeaver (Free Database Tool)

If PostgreSQL command-line tools aren't working:

1. **Download DBeaver** (free): https://dbeaver.io/download/
2. **Install and open it**
3. **Create New Connection:**
   - Database: PostgreSQL
   - Host: localhost
   - Port: 5432
   - Database: postgres
   - Username: postgres
   - Password: postgres
   - Click "Test Connection"
   - Click "Finish"

4. **Create Database:**
   - Right-click connection → SQL Editor → New SQL Script
   - Type: `CREATE DATABASE alem_crm;`
   - Click Execute (Ctrl+Enter)

5. **Create new connection to alem_crm database**
   - Same as step 3, but Database: alem_crm

6. **Load Schema:**
   - Right-click alem_crm connection → SQL Editor → Open SQL Script
   - Navigate to: `database\schema.sql`
   - Click Execute Script

✅ **Done!**

---

## ✅ Solution 3: Use Node.js Script (Automated)

I can create a Node.js script that will do everything automatically!

Let me know if you want this option.

---

## 🎯 After Database is Created

Once database is ready, continue with:

```cmd
REM Install NestJS CLI
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\backend"
npm install --save-dev @nestjs/cli

REM Install Frontend  
cd ..\frontend
npm install --legacy-peer-deps

REM Start Backend
cd ..\backend
npm run start:dev

REM Start Frontend (new terminal)
cd frontend
npm run dev

REM Open browser
start http://localhost:3000
```

---

## 💡 Recommended Right Now

**Try Solution 1 first** (Command Prompt with Administrator).

If that doesn't work due to the DLL error, **download DBeaver** (Solution 2) - it's a much better tool than pgAdmin anyway and very easy to use!

---

## 🆘 Still Stuck?

If all solutions fail, there may be an issue with your PostgreSQL installation. You might need to:

1. Uninstall PostgreSQL 18
2. Reinstall PostgreSQL 18 (make sure to install all components)
3. During installation, set password to: `postgres`
4. Then try Solution 1 again

---

**Let me know which solution you'd like to try!**
