# ALEM CRM System - Local Setup Guide

## Prerequisites

### 1. PostgreSQL Database
- **Download**: https://www.postgresql.org/download/windows/
- **Version**: PostgreSQL 14+ recommended
- **Default Port**: 5432
- **Default User**: postgres
- **Default Password**: postgres

### 2. Node.js
- **Download**: https://nodejs.org/ (LTS version recommended)
- **Version**: 18.0.0 or higher
- **Includes**: npm package manager

### 3. Git (Optional but recommended)
- **Download**: https://git-scm.com/download/win

---

## Local Setup Steps

### Step 1: Install PostgreSQL

1. Download PostgreSQL installer from https://www.postgresql.org/download/windows/
2. Run the installer and follow the wizard
3. When prompted:
   - **Installation Directory**: Leave default or choose custom path
   - **Port**: Keep default (5432)
   - **Superuser**: postgres (default)
   - **Password**: postgres (or your choice)
   - **Locale**: Default
4. Complete installation
5. PostgreSQL should start automatically as a service

**Verify Installation**:
```cmd
psql -U postgres -c "SELECT version();"
```

### Step 2: Create Database

1. Open Command Prompt or PowerShell
2. Connect to PostgreSQL:
```cmd
psql -U postgres
```

3. Create database:
```sql
CREATE DATABASE alem_crm;
\c alem_crm
```

4. Exit psql:
```sql
\q
```

### Step 3: Setup Backend

```cmd
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\backend"

# Install dependencies (first time only)
npm install

# Build the project
npm run build

# Start development server (with auto-reload)
npm run start:dev
```

**Expected Output**:
```
[NestFactory] Starting Nest application...
[InstanceLoader] TypeOrmModule dependencies initialized
[InstanceLoader] ConfigModule dependencies initialized
...
[NestApplication] Nest application successfully started
```

Backend will be available at: **http://localhost:3001**

### Step 4: Setup Frontend

In a NEW terminal/command prompt:

```cmd
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\frontend"

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Expected Output**:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

Frontend will be available at: **http://localhost:3000**

---

## Database Initialization

### Option 1: Using SQL File (Recommended)

1. In a new PowerShell/CMD:
```cmd
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system"

psql -U postgres -d alem_crm -f database/schema.sql
```

### Option 2: Let NestJS Auto-Create (Development Mode)

With `synchronize: true` in development .env, NestJS will auto-create tables on startup.

---

## Access the Application

### Frontend
- **URL**: http://localhost:3000
- **Browser**: Chrome, Firefox, Safari, Edge

### API Documentation
- **Base URL**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

### Example API Calls

```bash
# Get all customers
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/customers

# Get dashboard KPIs
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/dashboard/kpis

# Get items
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/items
```

---

## First Time Login (Create Admin User)

The system needs an initial admin user. You can either:

### Option 1: Create via Database
```sql
-- Connect to database
psql -U postgres -d alem_crm

-- Insert admin role
INSERT INTO roles (name, description) VALUES ('admin', 'Administrator') ON CONFLICT DO NOTHING;

-- Insert admin user
INSERT INTO users (username, email, full_name, password_hash, role_id, status)
VALUES ('admin', 'admin@alemcrm.com', 'System Administrator', 
        '$argon2id$v=19$m=19456,t=2,p=1$abcdefghijklmnop$HASH_HERE', 
        (SELECT id FROM roles WHERE name='admin'), 'Active');
```

### Option 2: Create via API Seed Script
```bash
npm run seed:dev  # (If seed script is available)
```

For now, use credentials:
- **Username**: admin
- **Password**: (set via database)

---

## Troubleshooting

### Issue: "Cannot connect to database"
**Solution**:
1. Verify PostgreSQL is running: `Services > PostgreSQL`
2. Check connection string in backend/.env
3. Create database: `psql -U postgres -c "CREATE DATABASE alem_crm;"`

### Issue: "Port 3000 already in use"
**Solution**:
```cmd
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual PID)
taskkill /PID <PID> /F

# Or use different port
npm run dev -- -p 3001
```

### Issue: "Port 3001 already in use"
**Solution**:
```cmd
# Find process using port 3001
netstat -ano | findstr :3001

# Kill process
taskkill /PID <PID> /F
```

### Issue: "npm install fails"
**Solution**:
```cmd
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rmdir /s /q node_modules
del package-lock.json

# Reinstall
npm install
```

### Issue: "TypeScript compilation errors"
**Solution**:
```cmd
# Clear build
npm run build

# Check types
npm run type-check

# Rebuild
npm run build
```

### Issue: "Database tables not created"
**Solution**:
```cmd
# Manually run schema
psql -U postgres -d alem_crm -f database/schema.sql

# Or restart backend with synchronize: true in .env
```

---

## Development Workflow

### Running Both Services

**Terminal 1 - Backend**:
```cmd
cd backend
npm run start:dev
```

**Terminal 2 - Frontend**:
```cmd
cd frontend
npm run dev
```

**Terminal 3 - Optional: Database GUI (pgAdmin)**:
```cmd
# If installed
pgAdmin4
# Access: http://localhost:5050
```

### Making Changes

**Backend Changes**:
- Changes are auto-reloaded with `npm run start:dev`
- Check terminal for errors

**Frontend Changes**:
- Changes are auto-reloaded with hot module replacement
- Check browser console for errors

### Testing API Endpoints

**Using Postman**:
1. Download: https://www.postman.com/downloads/
2. Create new request
3. Set URL: http://localhost:3001/api/customers
4. Set Auth: Bearer Token
5. Paste JWT token

**Using curl**:
```bash
curl -X GET http://localhost:3001/api/customers \
  -H "Authorization: Bearer <token>"
```

---

## Environment Variables

### Backend (.env)
```
DB_HOST=localhost          # PostgreSQL host
DB_PORT=5432              # PostgreSQL port
DB_NAME=alem_crm          # Database name
DB_USER=postgres          # Database user
DB_PASSWORD=postgres      # Database password
JWT_SECRET=...            # JWT signing key
NODE_ENV=development      # Environment
PORT=3001                 # Backend port
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

---

## Performance Tips

1. **Database Queries**: Check development logs for slow queries
2. **API Responses**: Monitor in browser DevTools Network tab
3. **Frontend Bundle**: `npm run build` and check bundle size
4. **Memory Usage**: Monitor in Task Manager

---

## Useful Commands

### Backend
```bash
npm run build          # Build for production
npm run start:dev      # Development with auto-reload
npm run start:debug    # Debug mode
npm run lint           # Lint code
npm run format         # Format code
npm run test           # Run tests
npm run test:cov       # Test coverage
```

### Frontend
```bash
npm run dev            # Development server
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Lint code
npm run format         # Format code
npm run type-check     # Type checking
npm run test           # Run tests
```

### Database
```bash
# Backup database
pg_dump -U postgres alem_crm > backup.sql

# Restore database
psql -U postgres alem_crm < backup.sql

# Connect to database
psql -U postgres -d alem_crm

# List databases
psql -U postgres -l

# Drop database
dropdb -U postgres alem_crm
```

---

## Next Steps After Setup

1. **Create Initial Data**: Seed database with test data
2. **Test API Endpoints**: Use Postman to test backend
3. **Test Frontend Pages**: Navigate through pages
4. **Test Real-time Features**: Open chat in multiple browsers
5. **Check Browser Console**: Look for errors
6. **Check Backend Logs**: Look for API errors

---

## Project Structure Quick Reference

```
alem-crm-system/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── modules/     # Feature modules
│   │   └── app.module.ts
│   ├── package.json
│   ├── .env             # Backend config
│   └── tsconfig.json
├── frontend/             # Next.js App
│   ├── src/
│   │   ├── app/         # Next.js pages
│   │   ├── components/  # React components
│   │   └── lib/         # API client
│   ├── package.json
│   ├── .env.local       # Frontend config
│   └── tsconfig.json
├── database/
│   └── schema.sql       # PostgreSQL schema
└── docker-compose.yml   # Docker setup (optional)
```

---

## Support Resources

- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **NestJS Docs**: https://docs.nestjs.com/
- **Next.js Docs**: https://nextjs.org/docs
- **TypeScript Docs**: https://www.typescriptlang.org/docs/
- **Socket.IO Docs**: https://socket.io/docs/

---

## Stopping Services

### Backend
- Press `Ctrl + C` in backend terminal

### Frontend
- Press `Ctrl + C` in frontend terminal

### PostgreSQL
- Windows: Services > PostgreSQL > Stop
- Or: `net stop postgresql-x64-14` (replace version)

---

**Status**: ✅ Ready to run locally
**Last Updated**: 2024
