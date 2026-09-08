# ALEM Trading CRM - Complete Render Deployment Guide

## Overview
This guide provides complete environment setup for deploying Alem Trading CRM to Render with both frontend and backend services.

---

## Part 1: Prepare Your Project

### 1.1 Ensure Git Repository
```bash
cd C:\Users\Milion's\Desktop\Alem-Treding-main
git init
git remote add origin https://github.com/YOUR_USERNAME/alem-trading-crm.git
```

### 1.2 Add Render Configuration
Your `render.yaml` is already configured. Check it's present in the root directory.

### 1.3 Check Dockerfiles
- ✅ Backend Dockerfile: `backend/Dockerfile`
- ✅ Frontend Dockerfile: `frontend/Dockerfile`

---

## Part 2: Environment Variables Required

### 2.1 Backend Environment Variables (.env)

Create `.env` file in `backend/` directory with:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/alem_crm
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
DB_NAME=alem_crm

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_required_here_12345
JWT_EXPIRES_IN=24h

# Application
NODE_ENV=production
PORT=3001
API_URL=https://alem-crm-backend.onrender.com
FRONTEND_URL=https://alem-crm-frontend.onrender.com

# Email (Optional - for notifications)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM=noreply@alemtrading.com

# Redis (Optional - for caching)
REDIS_URL=redis://localhost:6379

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# CORS
CORS_ORIGIN=https://alem-crm-frontend.onrender.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### 2.2 Frontend Environment Variables (.env.local)

Create `.env.local` file in `frontend/` directory with:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://alem-crm-backend.onrender.com
NEXT_PUBLIC_API_TIMEOUT=30000

# Application
NEXT_PUBLIC_APP_NAME=ALEM Trading CRM
NEXT_PUBLIC_APP_VERSION=1.0.0

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true

# Environment
NODE_ENV=production
```

---

## Part 3: Render Service Configuration

### 3.1 On Render.com Dashboard

#### Step 1: Create Backend Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configuration:
   - **Name**: `alem-crm-backend`
   - **Environment**: `Docker`
   - **Region**: Select closest to your users
   - **Plan**: Start with Standard ($7/month)
4. Click "Create Web Service"

#### Step 2: Set Backend Environment Variables
In Render Dashboard → Backend Service → Environment:

```
NODE_ENV: production
DATABASE_URL: (Auto-populated from PostgreSQL database)
JWT_SECRET: your_super_secret_jwt_key_min_32_chars_required_here_12345
PORT: 3001
API_URL: https://alem-crm-backend.onrender.com
FRONTEND_URL: https://alem-crm-frontend.onrender.com
CORS_ORIGIN: https://alem-crm-frontend.onrender.com
LOG_LEVEL: info
```

#### Step 3: Create PostgreSQL Database
1. Click "New +" → "PostgreSQL"
2. Configuration:
   - **Name**: `alem-crm-db`
   - **Database**: `alem_crm`
   - **Region**: Same as backend
   - **Plan**: Standard ($15/month)
3. Click "Create Database"
4. **Note the connection string** - it will auto-populate in backend env vars

#### Step 4: Create Frontend Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configuration:
   - **Name**: `alem-crm-frontend`
   - **Environment**: `Docker`
   - **Region**: Same as backend
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Starter ($7/month)
4. Click "Create Web Service"

#### Step 5: Set Frontend Environment Variables
In Render Dashboard → Frontend Service → Environment:

```
NODE_ENV: production
NEXT_PUBLIC_API_URL: https://alem-crm-backend.onrender.com
PORT: 3000
```

### 3.2 Update render.yaml (Optional - Manual Configuration)

If using manual deployment instead of GitHub, update your `render.yaml`:

```yaml
services:
  - type: web
    name: alem-crm-frontend
    dockerfilePath: ./frontend/Dockerfile
    buildCommand: "npm install && npm run build"
    startCommand: "npm start"
    envVars:
      - key: NODE_ENV
        value: production
      - key: NEXT_PUBLIC_API_URL
        value: https://alem-crm-backend.onrender.com
      - key: PORT
        value: "3000"

  - type: web
    name: alem-crm-backend
    dockerfilePath: ./backend/Dockerfile
    buildCommand: "npm ci && npm run build"
    startCommand: "npm run start:prod"
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: "3001"
      - key: API_URL
        value: https://alem-crm-backend.onrender.com
      - key: FRONTEND_URL
        value: https://alem-crm-frontend.onrender.com
      - key: DATABASE_URL
        fromDatabase:
          name: alem-crm-db
          property: connectionString
      - key: JWT_SECRET
        fromEnv: JWT_SECRET
      - key: CORS_ORIGIN
        value: https://alem-crm-frontend.onrender.com
      - key: LOG_LEVEL
        value: info

  - type: postgresql
    name: alem-crm-db
    ipAllowList:
      - source: 0.0.0.0/0
        description: "Allow all (backend will have specific access)"
```

---

## Part 4: Database Migration & Seeding

### 4.1 Run Migrations on Render

After deployment, connect to the database and run migrations:

```bash
# Via Render's web terminal or local machine
npm run migration:run

# Or seed database (if seeding script exists)
node seed-database.js
```

### 4.2 Initial Data Setup

**Default Login Accounts** (Already in localStorage):
```
Admin Account:
  Email: admin
  Password 1: Admin@2024!
  Password 2: AdminSecure#2024

Sales Account:
  Email: sales
  Password 1: Sales@2024!
  Password 2: SalesSecure#2024

Test Account:
  Email: million
  Password 1: million123
  Password 2: million456
```

All accounts have full permissions (15 features):
- Dashboard
- Users Management
- Customers
- Payments
- Reports
- Settings
- Audit Logs
- Transactions
- Add Sale
- View Sales
- Export
- Items
- + 3 more advanced features

---

## Part 5: Deployment Steps

### 5.1 Push to GitHub

```bash
cd C:\Users\Milion's\Desktop\Alem-Treding-main

# Stage all changes
git add .

# Commit
git commit -m "Initial deployment to Render"

# Push to main branch
git push -u origin main
```

### 5.2 Deploy on Render

1. Go to https://render.com
2. Sign up / Login
3. Click "New +" → "Web Service"
4. Connect GitHub
5. Select `alem-trading-crm` repository
6. Follow the deployment steps in Part 3

### 5.3 Monitor Deployment

- Backend build log: Check for successful compile
- Frontend build log: Should show "Build successful"
- Database: Verify connection
- Services: All should show "Live" status

---

## Part 6: Post-Deployment Verification

### 6.1 Check Services

```bash
# Frontend URL (from Render Dashboard)
https://alem-crm-frontend.onrender.com

# Backend Health Check
https://alem-crm-backend.onrender.com/api/health

# API Endpoint
https://alem-crm-backend.onrender.com/api
```

### 6.2 Test Login

1. Open frontend URL
2. Login with test account:
   - Email: `million`
   - Password 1: `million123`
   - Password 2: `million456`

### 6.3 Verify Features

- Dashboard loads (Items, Inventory Value display)
- Users page shows all 15 permissions checked
- Can create new users
- Can edit user permissions
- Can delete users
- Permissions persist after page refresh

### 6.4 Check Backend Logs

```bash
# View real-time logs
# In Render Dashboard → Backend Service → Logs

# Expected startup message:
# [Nest] 1234  - 09/08/2026, 10:15:30 AM     LOG [NestFactory] Nest application successfully started +5ms
# HTTP Server listening on port 3001
```

---

## Part 7: Environment Variables Reference

### 7.1 Critical Variables (Must Have)

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Enables production optimizations |
| `JWT_SECRET` | Min 32 chars | Signing key for JWT tokens |
| `DATABASE_URL` | PostgreSQL connection | Full connection string |
| `NEXT_PUBLIC_API_URL` | Backend URL | Frontend uses this to call API |

### 7.2 Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_LEVEL` | `info` | Logging verbosity |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | API rate limit per 15min |
| `MAX_FILE_SIZE` | `10485760` | Max upload size (bytes) |

---

## Part 8: Troubleshooting

### 8.1 Frontend Build Fails

**Error**: `next build` fails with webpack errors

**Solution**:
1. Check Node version: `node --version` (should be 20+)
2. Clear cache: `rm -rf .next node_modules && npm install`
3. Check for missing env vars: `echo $NEXT_PUBLIC_API_URL`

### 8.2 Backend Connection Fails

**Error**: `DATABASE_URL is not defined`

**Solution**:
1. Add PostgreSQL database in Render
2. Wait 2-3 minutes for connection string to populate
3. Add `DATABASE_URL` to backend env vars

### 8.3 API Calls Return 403

**Error**: CORS error in browser console

**Solution**:
1. Check `CORS_ORIGIN` matches frontend URL exactly
2. In backend: Ensure CORS middleware is configured
3. Restart backend service

### 8.4 Permissions Not Showing

**Error**: All permissions not checked when creating user

**Solution**:
- This is by design - all 15 permissions are assigned by default
- Check: `frontend/src/app/admin/users/page.tsx` for `getAllFeatureIds()`
- Should return all 15 feature IDs

### 8.5 User Persistence Issues

**Error**: Users disappear after page refresh

**Solution**:
- Uses `localStorage` for persistence
- Check: Browser DevTools → Application → Local Storage
- Key: `users_data` should contain user array
- Clear cache and hard refresh: `Ctrl+Shift+Delete` then reload

---

## Part 9: Performance & Security

### 9.1 Optimization Tips

1. **Backend**:
   - Enable Redis caching: Add `REDIS_URL` env var
   - Use database connection pooling
   - Enable Helmet middleware for security headers

2. **Frontend**:
   - Next.js auto-optimizes images
   - Static generation for dashboard
   - Code splitting for routes

### 9.2 Security Checklist

- ✅ JWT_SECRET: Min 32 chars, random
- ✅ CORS_ORIGIN: Exact match only
- ✅ Database: Strong password, encrypted
- ✅ Non-root user: Both services run as unprivileged user
- ✅ Health checks: Enabled on both services
- ✅ HTTPS: Render provides automatic SSL

### 9.3 Monitoring

Set up alerts in Render:
1. Backend service → Alerts
2. Configure: CPU > 80%, Memory > 512MB, restart failures
3. Email notifications when triggered

---

## Part 10: Local Development (Optional)

### 10.1 Local Setup

```bash
# Backend
cd backend
npm install
npm run start:dev

# Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

### 10.2 Local Environment Files

**backend/.env.local**:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/alem_crm_local
JWT_SECRET=local_dev_secret_at_least_32_chars_long_here
NODE_ENV=development
PORT=3001
```

**frontend/.env.local**:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NODE_ENV=development
```

### 10.3 Access Locally

- Frontend: http://localhost:3000
- Backend: http://localhost:3001/api
- Database: `localhost:5432`

---

## Part 11: Maintenance & Updates

### 11.1 Regular Tasks

- **Weekly**: Check logs for errors
- **Monthly**: Review database size and performance
- **Quarterly**: Update dependencies with `npm update`
- **As Needed**: Monitor error rates

### 11.2 Updating Deployment

```bash
# Make code changes locally
git add .
git commit -m "Feature: Add new feature"
git push origin main

# Render auto-deploys on main branch push
# Monitor: Render Dashboard → Deployment History
```

### 11.3 Rollback (If Needed)

1. Render Dashboard → Previous Deployments
2. Click the desired previous deployment
3. Click "Redeploy"
4. Confirm

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **NestJS Docs**: https://docs.nestjs.com
- **PostgreSQL Docs**: https://www.postgresql.org/docs

---

## Final Checklist ✅

Before going live:

- [ ] GitHub repository created and configured
- [ ] render.yaml present in root
- [ ] Backend Dockerfile verified
- [ ] Frontend Dockerfile verified
- [ ] `.env` files created with all required variables
- [ ] PostgreSQL database created on Render
- [ ] Backend service deployed and running
- [ ] Frontend service deployed and running
- [ ] Database migrations completed
- [ ] Test login works with credentials
- [ ] All 15 permissions appear in admin users page
- [ ] User creation/edit/delete works
- [ ] Permissions persist after page refresh
- [ ] Backend health check responds
- [ ] CORS configured correctly
- [ ] SSL certificate active (automatic on Render)

---

## Deployment URLs (After Deployment)

```
Frontend: https://alem-crm-frontend.onrender.com
Backend API: https://alem-crm-backend.onrender.com/api
Database: (Managed by Render)
```

**Last Updated**: September 8, 2026
**Status**: Complete and Ready for Production Deployment
