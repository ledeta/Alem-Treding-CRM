# ALEM CRM - Manual Setup Steps

## Current Status

✅ Node.js v26.5.0 installed  
✅ PostgreSQL 18 installed  
✅ Backend .env configured  
⚠️ Dependencies need manual installation  

---

## Step-by-Step Manual Setup

### Step 1: Setup PostgreSQL Database

#### Option A: Using pgAdmin (Recommended)

1. Open **pgAdmin 4**
2. Connect to your local PostgreSQL server (usually localhost)
3. Right-click **Databases** → **Create** → **Database**
4. Name: `alem_crm`
5. Click **Save**
6. Right-click `alem_crm` database → **Query Tool**
7. Click **Open File** icon
8. Navigate to: `c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\database\schema.sql`
9. Click **Execute** (lightning bolt icon or F5)
10. You should see "Query returned successfully"

#### Option B: Using Command Line

```cmd
# Set PostgreSQL path (adjust version number if needed)
set PATH=%PATH%;C:\Program Files\PostgreSQL\18\bin

# Create database
psql -U postgres -c "CREATE DATABASE alem_crm;"

# Load schema
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system"
psql -U postgres -d alem_crm -f database\schema.sql
```

---

### Step 2: Install Backend Dependencies

```cmd
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\backend"

# Clear cache first
npm cache clean --force

# Install dependencies (takes 5-10 minutes)
npm install

# If you get errors, try:
npm install --legacy-peer-deps

# Or if still failing:
npm install --force
```

**Expected Result:** `node_modules` folder created with 1000+ packages

---

### Step 3: Install Frontend Dependencies

```cmd
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\frontend"

# Clear cache
npm cache clean --force

# Install dependencies (takes 5-10 minutes)
npm install --legacy-peer-deps
```

**Expected Result:** `node_modules` folder created with 1000+ packages

---

### Step 4: Verify Configuration

Check that `backend\.env` has correct PostgreSQL password:

```cmd
notepad "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\backend\.env"
```

Verify these settings:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alem_crm
DB_USER=postgres
DB_PASSWORD=postgres    ← Change if your password is different
PORT=3001
FRONTEND_URL=http://localhost:3000
```

---

### Step 5: Start Backend Server

Open **Command Prompt Window 1**:

```cmd
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\backend"
npm run start:dev
```

**Wait for these messages:**
```
[Nest] LOG [InstanceLoader] AppModule dependencies initialized
[Nest] LOG [RoutesResolver] Controllers mapped
[Nest] LOG [NestApplication] Nest application successfully started
```

**Success indicator:** "Nest application successfully started +XXms"

**Keep this window open!**

---

### Step 6: Start Frontend Server

Open **Command Prompt Window 2**:

```cmd
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\frontend"
npm run dev
```

**Wait for this message:**
```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
- Ready in 2.5s
```

**Keep this window open!**

---

### Step 7: Access the Application

Open your web browser:
```
http://localhost:3000
```

**Default Login:**
```
Email: admin@alemcrm.com
Password: Admin123!
```

---

## Troubleshooting npm install issues

### Error: "ETARGET No matching version"

**Solution:**
```cmd
npm config set registry https://registry.npmjs.org/
npm cache clean --force
npm install --legacy-peer-deps
```

### Error: "Network timeout" or "ECONNRESET"

**Solutions:**
1. Check internet connection
2. Disable VPN/proxy temporarily
3. Try:
```cmd
npm config set fetch-retries 5
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000
npm install
```

### Error: "Module not found" when starting

**Solution:**
```cmd
# Delete node_modules and reinstall
rmdir /s /q node_modules
del package-lock.json
npm install --legacy-peer-deps
```

### Error: "nest command not found"

**Solution:**
```cmd
# Install NestJS CLI locally
npm install --save-dev @nestjs/cli

# Or run directly:
npx nest start --watch
```

---

## Database Connection Issues

### Error: "Connection refused"

**Solutions:**
1. Check PostgreSQL service is running:
   - Win+R → `services.msc`
   - Find "postgresql-x64-18"
   - Status should be "Running"
   - If not, right-click → Start

2. Verify database exists:
```cmd
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "\l"
```

3. Test connection:
```cmd
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d alem_crm -c "SELECT count(*) FROM roles;"
```

Should return: `2` (Admin and Sales User roles)

### Error: "Authentication failed"

**Solution:**
Update password in `backend\.env` to match your PostgreSQL password.

---

## Port Conflicts

### Port 3001 already in use (Backend)

```cmd
# Find process
netstat -ano | findstr :3001

# Kill process (replace <PID> with number from above)
taskkill /PID <PID> /F

# Restart backend
npm run start:dev
```

### Port 3000 already in use (Frontend)

```cmd
# Find process
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F

# Restart frontend
npm run dev
```

---

## Verification Checklist

After setup:

- [ ] Database `alem_crm` created in PostgreSQL
- [ ] Schema loaded (18 tables created)
- [ ] Backend `node_modules` folder exists (1000+ packages)
- [ ] Frontend `node_modules` folder exists (1000+ packages)
- [ ] Backend `.env` file has correct password
- [ ] Backend terminal shows "Nest application successfully started"
- [ ] Frontend terminal shows "Ready on http://localhost:3000"
- [ ] Browser can access http://localhost:3000
- [ ] Login page visible

---

## Quick Commands Reference

```cmd
# Backend
cd backend
npm run start:dev          # Start with hot reload
npm run build              # Build for production
npm run start:prod         # Run production build

# Frontend
cd frontend
npm run dev                # Start dev server
npm run build              # Build for production
npm run start              # Run production build

# Database
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d alem_crm

# Check if services are running
netstat -ano | findstr :3001  # Backend
netstat -ano | findstr :3000  # Frontend
```

---

## Alternative: Use Helper Scripts

Once dependencies are installed, use these batch files:

1. **START_BACKEND.bat** - Quick start backend
2. **START_FRONTEND.bat** - Quick start frontend
3. **CHECK_STATUS.bat** - Check system status

---

## Database Tables Created

After schema is loaded, you should have:

1. `roles` - User roles (Admin, Sales User)
2. `users` - System users
3. `refresh_tokens` - JWT tokens
4. `customers` - Customer records
5. `customer_balances` - Balance tracking
6. `items` - Inventory items
7. `stock` - Stock levels
8. `stock_transactions` - Stock movements
9. `sales_transactions` - Sales records
10. `payment_requests` - Payment approvals
11. `credit_requests` - Credit approvals
12. `refund_requests` - Refund approvals
13. `uploaded_files` - File uploads
14. `chat_messages` - Group chat
15. `chat_reactions` - Chat emojis
16. `notifications` - User notifications
17. `audit_logs` - Activity tracking
18. `customer_no_visits` - Inactive customers

Plus 3 views for reporting.

---

## Success Indicators

### Backend Started Successfully:
```
[Nest] LOG [InstanceLoader] AppModule dependencies initialized +X ms
[Nest] LOG [InstanceLoader] TypeOrmModule dependencies initialized +X ms
[Nest] LOG [InstanceLoader] TypeOrmCoreModule dependencies initialized +X ms
[Nest] LOG [RoutesResolver] AuthController {/auth} +X ms
[Nest] LOG [RoutesResolver] CustomersController {/customers} +X ms
... (more controllers)
[Nest] LOG [NestApplication] Nest application successfully started +X ms
```

### Frontend Started Successfully:
```
  ▲ Next.js 14.1.0
  - Local:        http://localhost:3000
  
  ✓ Ready in 2.5s
```

### Database Connected:
Backend logs will show:
```
[TypeORM] Connection to database established
```

---

## Next Steps After Installation

1. **Login** to the system
2. **Change admin password** immediately
3. **Create users** for your team
4. **Test Excel upload** with sample data
5. **Explore features**:
   - Dashboard
   - Customer management
   - Payment requests
   - Group chat

---

## Need More Help?

- **PostgreSQL Issues:** See database\schema.sql
- **API Documentation:** See BACKEND_MODULES.md
- **Architecture:** See ARCHITECTURE.md
- **Full Setup Guide:** See LOCAL_SETUP_INSTRUCTIONS.md

---

**Good luck with the installation! Take it step by step and check the console for error messages.**
