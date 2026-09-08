# ALEM CRM System - Quick Start Guide (5 Minutes)

## Prerequisites Check

Ensure you have installed:
- [ ] Node.js 18+ (Download from https://nodejs.org/)
- [ ] PostgreSQL 14+ (Download from https://www.postgresql.org/download/)

---

## Step 1: Create Database (2 minutes)

Open Command Prompt and run:

```cmd
psql -U postgres -c "CREATE DATABASE alem_crm;"
```

**If you get an error**, make sure:
1. PostgreSQL is running (Start → Services → PostgreSQL)
2. Default password is "postgres"

---

## Step 2: Initialize Database Schema (1 minute)

```cmd
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system"
psql -U postgres -d alem_crm -f database/schema.sql
```

**Expected Output**: Lots of SQL statements running, ends with no errors.

---

## Step 3: Start Backend (1 minute)

**Open a NEW Command Prompt and run**:

```cmd
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\backend"
npm install
npm run start:dev
```

**Expected Output** (wait for this message):
```
[NestApplication] Nest application successfully started
```

✅ Backend is running on **http://localhost:3001**

---

## Step 4: Start Frontend (1 minute)

**Open ANOTHER NEW Command Prompt and run**:

```cmd
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\frontend"
npm install
npm run dev
```

**Expected Output**:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

✅ Frontend is running on **http://localhost:3000**

---

## Step 5: Access Application

1. Open your browser
2. Go to: **http://localhost:3000**
3. You should see the ALEM CRM login page

---

## Troubleshooting

### Issue: "Database does not exist"
```cmd
psql -U postgres -c "CREATE DATABASE alem_crm;"
psql -U postgres -d alem_crm -f database/schema.sql
```

### Issue: "Port 3000/3001 already in use"
```cmd
# Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: "npm: command not found"
- Reinstall Node.js from https://nodejs.org/
- Restart Command Prompt

### Issue: "psql: command not found"
- Reinstall PostgreSQL from https://www.postgresql.org/download/
- Restart Command Prompt

---

## Next Steps

### Create Test Data (Optional)

Access your database and create a test user:

```cmd
psql -U postgres -d alem_crm
```

Then run:

```sql
-- Insert admin role
INSERT INTO roles (name, description) 
VALUES ('admin', 'Administrator') 
ON CONFLICT DO NOTHING;

-- Exit psql
\q
```

### Test API Endpoints

Open Command Prompt and try:

```bash
# Get dashboard
curl http://localhost:3001/api/dashboard/kpis

# Get customers
curl http://localhost:3001/api/customers

# Get items
curl http://localhost:3001/api/items
```

### Stop Services

**Press Ctrl+C** in each terminal to stop the services.

---

## Project Structure

```
alem-crm-system/
├── backend/           # NestJS API (Port 3001)
├── frontend/          # Next.js App (Port 3000)
├── database/          # PostgreSQL Schema
└── docker-compose.yml # Optional: Docker setup
```

---

## Default Credentials

After schema initialization:
- **Username**: Check backend logs or create via database
- **Password**: Set via database insert

---

## Available Endpoints

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **WebSocket**: ws://localhost:3001 (for chat/notifications)

---

## Useful Commands

```bash
# View backend logs
npm run start:dev           # Terminal 1 (backend)

# View frontend logs  
npm run dev                 # Terminal 2 (frontend)

# Format code
npm run format

# Type checking
npm run type-check

# Run tests
npm run test
```

---

## Got Stuck?

1. Check **LOCAL_SETUP.md** for detailed troubleshooting
2. Check **SYSTEM_COMPLETE.md** for system overview
3. Check backend logs for errors
4. Check browser console (F12) for frontend errors

---

## Keep Services Running

Once started, services keep running until you press Ctrl+C.

**Do NOT close the terminals** while developing.

---

**Status**: Ready to run! 🚀
