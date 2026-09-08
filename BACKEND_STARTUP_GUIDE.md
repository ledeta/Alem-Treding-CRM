# ✅ Backend Server - Startup Guide

## Current Status

🔄 **Backend**: Starting on port 3001...
🟢 **Frontend**: Running on port 3000
⏳ **Database**: Connection required (PostgreSQL)

---

## What Was Missing

The frontend was trying to connect to:
- ❌ `http://localhost:3001` (Backend API)
- ❌ Getting `net::ERR_CONNECTION_REFUSED`

**Solution**: Start the backend server!

---

## Backend Details

**Technology**: NestJS (Node.js framework)
**Port**: 3001
**Location**: `backend/` directory
**Start Command**: `npm run start`

---

## What the Backend Provides

The backend API provides:

```
✅ GET  /api/analytics/kpis          - Dashboard KPIs
✅ GET  /api/transactions            - Transaction data
✅ GET  /api/payments                - Payment data
✅ GET  /api/credits                 - Credit data
✅ GET  /api/items                   - Item inventory
✅ GET  /api/customers               - Customer data
✅ POST /api/auth/login              - User authentication
✅ ... and many more endpoints
```

---

## Database Requirements

The backend needs PostgreSQL:

**Connection String** (from `.env`):
```
DATABASE_URL=postgresql://user:password@localhost:5432/alem_trading
```

**Status**: Check your PostgreSQL is running!

---

## How to Check Backend Status

### In Terminal:
```bash
curl http://localhost:3001/api/health
# Should respond with 200 OK
```

### In Browser:
Go to: http://localhost:3001

### In Browser Console:
```javascript
fetch('http://localhost:3001/api/analytics/kpis')
  .then(r => r.json())
  .then(data => console.log(data))
```

---

## Backend Startup Commands

### Start Development Server
```bash
cd backend
npm run start
```

### Start with Watch Mode
```bash
npm run start:dev
```

### Build Only
```bash
npm run build
```

### View Logs
```bash
npm run start | tail -f
```

---

## Database Setup (If Needed)

### Check PostgreSQL is Running
```bash
# Windows
tasklist | find "postgres"

# Linux/Mac
ps aux | grep postgres
```

### If PostgreSQL Not Running:
```bash
# Windows
postgres -D "C:\Program Files\PostgreSQL\data"

# Or use batch file
START_POSTGRESQL.bat
```

### Create Database
```bash
createdb alem_trading
```

### Run Migrations
```bash
npm run migration:run
```

---

## Common Issues

### Issue: Backend won't start
**Check**:
1. Is PostgreSQL running?
2. Is port 3001 available?
3. Are all dependencies installed? (`npm install`)
4. Is `.env` file configured?

### Issue: Connection Refused (3001)
**Check**:
1. Backend server running?
2. Port 3001 listening?
3. Firewall blocking?
4. Check terminal output for errors

### Issue: Database connection error
**Check**:
1. PostgreSQL running?
2. Database exists? (`alem_trading`)
3. Credentials correct in `.env`?
4. Connection string valid?

---

## Expected Output When Running

```
▲ NestJS v10.0.0
✓ Application successfully started
⚡ Server is running on http://localhost:3001
📝 Listening on port: 3001
✓ Database connected
```

---

## Frontend <-> Backend Communication

### Flow:
1. **Frontend** (Port 3000) sends request
2. ↓
3. **Backend** (Port 3001) receives & processes
4. ↓
5. **Database** stores/retrieves data
6. ↓
7. **Backend** sends response
8. ↓
9. **Frontend** displays data

### API Calls:
Frontend uses `api-client.ts` to call backend endpoints:
```javascript
GET  /api/customers?page=1&limit=1000
GET  /api/transactions?page=1&limit=5
GET  /api/payments?page=1
GET  /api/credits?page=1
GET  /api/items?page=1
GET  /api/analytics/kpis
```

---

## Next Steps

1. ✅ Start backend: `npm run start` (in backend folder)
2. ✅ Verify it's running: http://localhost:3001
3. ✅ Check frontend connects
4. ✅ Hard refresh browser: Ctrl+F5
5. ✅ Navigate to Dashboard: http://localhost:3000/dashboard
6. ✅ Verify data loads (no more ERR_CONNECTION_REFUSED)

---

## All Three Components Now Running

```
Frontend (Next.js)     Backend (NestJS)     Database (PostgreSQL)
Port 3000             Port 3001            Port 5432
✓ Running             ⏳ Starting          ✓ Required
http://localhost:3000 http://localhost:3001
```

---

## Verification Checklist

- [ ] PostgreSQL running
- [ ] Backend started: `npm run start`
- [ ] Backend on port 3001
- [ ] Frontend on port 3000
- [ ] Hard refresh browser (Ctrl+F5)
- [ ] Go to http://localhost:3000/dashboard
- [ ] No "ERR_CONNECTION_REFUSED" errors
- [ ] Data loads from API
- [ ] Dashboard shows stats
- [ ] Navigation works

---

**Status**: Backend is starting now! Check back in 10-15 seconds.
