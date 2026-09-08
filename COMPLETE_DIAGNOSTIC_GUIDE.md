# 🔧 COMPLETE DIAGNOSTIC GUIDE

## Root Cause Analysis: Why You Got 500 Errors

### The Problem Flow

```
1. Browser requests http://localhost:3000
   ↓
2. Nginx tries to route to "frontend:3001" ❌ WRONG PORT
   ↓
3. No service listening on 3001 (frontend is on 3000)
   ↓
4. Connection refused / Nginx returns 500 error
   ↓
5. Browser gets HTML error page instead of JS bundle
   ↓
6. Scripts fail to load due to MIME type mismatch (text/html instead of text/javascript)
```

## Fixes Applied

### Fix 1: Nginx Configuration
**File**: `nginx/conf.d/default.conf`

**Before:**
```nginx
upstream frontend {
    server frontend:3001;  # ← WRONG! Frontend runs on 3000
    keepalive 32;
}
```

**After:**
```nginx
upstream frontend {
    server frontend:3000;  # ✅ CORRECT!
    keepalive 32;
}
```

### Fix 2: Docker-Compose Port Mapping
**File**: `docker-compose.yml`

**Before:**
```yaml
backend:
  ports:
    - '3000:3000'  # ← WRONG! Should be 3001
  environment:
    PORT: 3000  # ← WRONG! NestJS needs 3001
    FRONTEND_URL: http://localhost:3001  # ← WRONG!

frontend:
  ports:
    - '3001:3001'  # ← WRONG! Should be 3000
  environment:
    NEXT_PUBLIC_API_URL: http://localhost:3000  # ← WRONG! Should be 3001
```

**After:**
```yaml
backend:
  ports:
    - '3001:3001'  # ✅ CORRECT!
  environment:
    PORT: 3001  # ✅ CORRECT!
    FRONTEND_URL: http://localhost:3000  # ✅ CORRECT!

frontend:
  ports:
    - '3000:3000'  # ✅ CORRECT!
  environment:
    NEXT_PUBLIC_API_URL: http://localhost:3001  # ✅ CORRECT!
```

## How to Verify Fixes

### Test 1: Port Availability Check
```bash
# Windows Command Prompt
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5432

# Should show:
# Port 3000: NODE.EXE (Frontend)
# Port 3001: NODE.EXE (Backend)
# Port 5432: postgres.exe (Database)
```

### Test 2: Direct API Call
```bash
# Test Backend is responding
curl http://localhost:3001/api/health
# Expected response: { "status": "ok", "timestamp": "...", ... }

# Test Frontend is responding
curl http://localhost:3000
# Expected response: HTML page content (no 500 error)
```

### Test 3: Proxy Call (if using Nginx)
```bash
# Test Nginx is routing correctly
curl http://localhost/api/health
# Should reach backend through nginx

curl http://localhost
# Should reach frontend through nginx
```

### Test 4: Browser Inspection
1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Refresh page (F5)
4. Look for JavaScript files:
   - `main.js` - Should show 200, not 500
   - `react-refresh.js` - Should show 200, not 500
   - `_app.js` - Should show 200, not 500
5. If any show 500, then nginx/backend routing is wrong

### Test 5: Console Check
1. Open Browser DevTools (F12)
2. Go to **Console** tab
3. Should NOT see:
   ```
   ❌ Failed to load resource: 500 (Internal Server Error)
   ❌ Refused to execute script from X because MIME type 'text/html' is not executable
   ```
4. If you see these, caches haven't cleared yet:
   - Clear browser cache: Ctrl+Shift+Delete
   - Clear Next.js build: Delete `/frontend/.next`
   - Restart both services

## Service Port Mapping Reference

### Local Development (No Docker)
```
Frontend (Next.js)
  └─ Listens on: 127.0.0.1:3000
     Configured via: frontend/.env.local (PORT=3000)
     Start: npm run dev
     
Backend (NestJS)
  └─ Listens on: 127.0.0.1:3001
     Configured via: backend/.env (PORT=3001)
     Start: npm run start:dev
     
Database (PostgreSQL)
  └─ Listens on: 127.0.0.1:5432
     Configured via: backend/.env (DB_PORT=5432)
```

### Docker Compose
```
Frontend Container
  └─ Internal: frontend:3000
     External: localhost:3000 (mapped)
     Through Nginx: localhost/
     
Backend Container
  └─ Internal: backend:3001
     External: localhost:3001 (mapped)
     Through Nginx: localhost/api/
     
Nginx Reverse Proxy
  └─ External: localhost:80 / 443
     Routes "/" → frontend:3000
     Routes "/api/" → backend:3001
```

## Common Error Messages & Solutions

### Error: "500 Internal Server Error"
**Cause**: Nginx or app not running on correct port
**Solution**:
```bash
# Check what's running on port 3001
netstat -ano | findstr :3001

# If nothing: Start backend
cd backend && npm run start:dev

# If something else: Kill it
taskkill /PID <PID> /F

# Or use different port
SET PORT=3002
npm run start:dev
```

### Error: "Refused to execute script because MIME type 'text/html'"
**Cause**: Browser received HTML error page instead of JavaScript
**Solution**:
1. Check nginx routing: `grep -n "frontend:" nginx/conf.d/default.conf`
2. Should show: `server frontend:3000;`
3. If wrong, update and restart nginx: `docker-compose restart nginx`
4. Clear browser cache: Ctrl+Shift+Delete

### Error: "Cannot GET /api/health"
**Cause**: Backend not running or on wrong port
**Solution**:
```bash
# Test if backend is listening
netstat -ano | findstr :3001

# If yes, test direct connection
curl http://localhost:3001/api/health

# If no response, backend is down
cd backend && npm run start:dev
```

### Error: "CORS error" or "Request blocked"
**Cause**: Backend CORS configuration issue
**Solution**:
1. Check CORS configuration in `backend/src/app.module.ts`
2. Verify frontend URL in backend `.env`:
   ```
   FRONTEND_URL=http://localhost:3000
   ```
3. Restart backend to apply changes

## Configuration Validation Checklist

### Backend (.env)
- [ ] `PORT=3001` (not 3000)
- [ ] `DB_HOST=localhost` (or your DB host)
- [ ] `DB_PORT=5432`
- [ ] `FRONTEND_URL=http://localhost:3000`
- [ ] Database credentials match

### Frontend (.env.local)
- [ ] `PORT=3000` (not 3001)
- [ ] `NEXT_PUBLIC_API_URL=http://localhost:3001`
- [ ] `NODE_ENV=development`

### Docker-Compose (docker-compose.yml)
- [ ] Backend section has `ports: - '3001:3001'`
- [ ] Frontend section has `ports: - '3000:3000'`
- [ ] Backend environment has `PORT: 3001`
- [ ] Frontend environment has `PORT: 3000`
- [ ] Nginx routes `/` to `frontend:3000`
- [ ] Nginx routes `/api/` to `backend:3001`

### Nginx (nginx/conf.d/default.conf)
- [ ] `upstream frontend { server frontend:3000; }`
- [ ] `upstream backend { server backend:3001; }`
- [ ] `location / { proxy_pass http://frontend; }`
- [ ] `location /api/ { proxy_pass http://backend; }`

## Debugging Steps

### Step 1: Identify Where The Error Occurs
```bash
# In terminal where backend is running, look for errors
# In terminal where frontend is running, look for errors
# In browser console (F12), check for specific errors
```

### Step 2: Check Port Conflicts
```bash
# Find what's using the ports
netstat -ano | findstr LISTEN | findstr ":300\|:300\|:543"

# Kill a process using the port
taskkill /PID <PID> /F
```

### Step 3: Clear All Caches
```bash
# Frontend
del /S frontend\.next
del /S frontend\node_modules\.cache

# Backend
del /S backend\dist
del /S backend\node_modules\.cache

# Browser
# Ctrl+Shift+Delete in browser
```

### Step 4: Restart Everything
```bash
# Kill all node processes
taskkill /F /IM node.exe

# Start fresh
START_ALL.bat

# Wait 30-60 seconds
# Then open http://localhost:3000
```

## Performance Monitoring

### Check Resource Usage
```bash
# See what ports are listening
netstat -an | findstr LISTEN

# See process details
tasklist /v | findstr node

# Monitor in real-time
tasklist /v | findstr node & timeout /t 2 & cls & goto :
```

### View Service Logs

**Backend Logs:**
- Check the terminal window running `npm run start:dev`
- Look for `Application is running on: http://localhost:3001`

**Frontend Logs:**
- Check the terminal window running `npm run dev`
- Look for `ready - started server on http://localhost:3000`

**Docker Logs:**
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx
```

## Quick Fix Reference

| Issue | Command | Expected Result |
|-------|---------|-----------------|
| Backend not starting | `cd backend && npm run start:dev` | Port 3001 listening |
| Frontend not starting | `cd frontend && npm run dev` | Port 3000 listening |
| Port conflict | `netstat -ano \| findstr :3001` | Shows what's using it |
| Kill process | `taskkill /PID <PID> /F` | Process terminated |
| Clear cache | `del /S .next` | Cache removed |
| Restart all | `taskkill /F /IM node.exe` | All node processes stopped |

## Success Criteria

✅ You're good to go when:
1. Backend runs on `http://localhost:3001`
2. Frontend runs on `http://localhost:3000`
3. No 500 errors in browser console
4. No MIME type warnings
5. API calls show 200 status
6. Login page loads
7. Can log in with admin@alemcrm.com / Admin123!
8. Dashboard displays data correctly

---

**Last Updated**: August 4, 2026  
**Status**: ✅ All diagnostics provided and fixes applied
