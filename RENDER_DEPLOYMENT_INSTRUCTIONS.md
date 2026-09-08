# Render Deployment Instructions

**Status**: Ready to Deploy  
**Date**: August 19, 2026  
**Services**: Frontend (Next.js) + Backend (NestJS) + Database (PostgreSQL)

---

## Quick Start - Deploy in 5 Minutes

### Step 1: Push Latest Code to GitHub
```bash
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system"
git status
git push origin main
```

✅ **Current Status**: Latest code is already pushed (commit: `ff37d7e4`)

---

### Step 2: Go to Render Dashboard

1. Visit: https://dashboard.render.com
2. Sign in with your account
3. Click "New +" → "Blueprint"
4. Select your GitHub repository: `miliyee/Alem-Treding`
5. Click "Connect"

---

### Step 3: Render Will Auto-Detect Configuration

Render will automatically find `render.yaml` in your repository with:
- ✅ Frontend service (Next.js)
- ✅ Backend service (NestJS)
- ✅ PostgreSQL database

---

### Step 4: Set Environment Variables

Click "Apply" and Render will show required environment variables:

**Backend (alem-crm-backend)**:
- `DATABASE_URL` - Auto-filled from PostgreSQL service
- `JWT_SECRET` - Set to: `your-secret-key-here` (generate a random string)
- `PORT` - Already set to `3001`
- `NODE_ENV` - Already set to `production`

**Frontend (alem-crm-frontend)**:
- `NEXT_PUBLIC_API_URL` - Auto-set to backend URL
- `NODE_ENV` - Already set to `production`

---

### Step 5: Deploy Services

1. Click "Create Blueprint"
2. Render will deploy all 3 services:
   - PostgreSQL database (takes ~2-3 minutes)
   - Backend service (takes ~5-8 minutes)
   - Frontend service (takes ~8-10 minutes)

**Total deployment time**: ~15-20 minutes

---

## Service Details

### Frontend (alem-crm-frontend)
- **Runtime**: Node 18
- **Build**: `cd frontend && npm install && npm run build`
- **Start**: `cd frontend && npm run start`
- **URL**: https://alem-crm-frontend.onrender.com
- **Port**: 3000

### Backend (alem-crm-backend)
- **Runtime**: Node 18
- **Build**: `cd backend && npm install && npm run build`
- **Start**: `cd backend && npm run start:prod`
- **URL**: https://alem-crm-backend.onrender.com
- **Port**: 3001

### Database (alem-crm-db)
- **Type**: PostgreSQL 14
- **Plan**: Free/Pro (as chosen)
- **Auto-backups**: Enabled

---

## Environment Variables Reference

### render.yaml Configuration
```yaml
services:
  - type: web
    name: alem-crm-frontend
    runtime: node
    buildCommand: "cd frontend && npm install && npm run build"
    startCommand: "cd frontend && npm run start"
    envVars:
      - key: NODE_ENV
        value: production
      - key: NEXT_PUBLIC_API_URL
        value: "https://alem-crm-backend.onrender.com"

  - type: web
    name: alem-crm-backend
    runtime: node
    buildCommand: "cd backend && npm install && npm run build"
    startCommand: "cd backend && npm run start:prod"
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: alem-crm-db
          property: connectionString
      - key: JWT_SECRET
        sync: false
      - key: PORT
        value: "3001"

  - type: postgresql
    name: alem-crm-db
    ipAllowList: []
```

---

## Post-Deployment Verification

### ✅ Check Frontend
```
Visit: https://alem-crm-frontend.onrender.com
Expected: Dashboard page loads
```

### ✅ Check Backend
```
URL: https://alem-crm-backend.onrender.com/api/customers
Expected: 200 response with customer data or empty array
```

### ✅ Check Database Connection
```
Backend should successfully connect to PostgreSQL
Check Render logs for confirmation
```

### ✅ Test Authentication
1. Navigate to login page
2. Enter credentials
3. Should receive JWT token
4. Should be able to access dashboard

### ✅ Test Navigation
- Click through all 5 buttons:
  - Dashboard ✓
  - Chat ✓
  - Customers ✓
  - Payments ✓
  - Account ✓

---

## If Deployment Fails

### Build Error - Frontend
**Problem**: `npm run build` fails
**Solution**:
1. Check TypeScript errors: `npx tsc --noEmit`
2. Verify all imports are correct
3. Check `.env` variables

### Build Error - Backend
**Problem**: `npm run build` fails
**Solution**:
1. Check for missing dependencies
2. Verify database connection string
3. Check JWT_SECRET is set

### Database Connection Error
**Problem**: Backend can't connect to PostgreSQL
**Solution**:
1. Verify `DATABASE_URL` is set in environment
2. Check PostgreSQL service is running
3. Run migrations if needed

### Frontend Can't Reach Backend
**Problem**: `NEXT_PUBLIC_API_URL` not set correctly
**Solution**:
1. Verify frontend has correct backend URL
2. Check CORS settings on backend
3. Verify backend is responding to requests

---

## Update Deployment After Changes

After making code changes:

1. **Commit and push to GitHub**:
   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```

2. **Trigger Render redeployment**:
   - Option A: Push to main (auto-redeploy)
   - Option B: Manual redeploy from Render dashboard

3. **Monitor deployment**:
   - Go to Render dashboard
   - Click service name
   - Watch logs in real-time

---

## Monitoring & Logs

### Access Logs
1. Go to https://dashboard.render.com
2. Select service (frontend/backend)
3. Click "Logs" tab
4. View real-time logs

### Common Log Messages

**Healthy Frontend**:
```
> npm run start
> alem-crm-frontend@1.0.0 start
> next start -p 3000
▲ Next.js 14.2.35
```

**Healthy Backend**:
```
[Nest] 2026-08-19 - 10:30:45     LOG [NestFactory]
Starting Nest application...
[Nest] 2026-08-19 - 10:30:46     LOG [InstanceLoader]
TypeOrmModule dependencies initialized
[Nest] 2026-08-19 - 10:30:47     LOG [NestApplication]
Nest application successfully started on port 3001
```

---

## Production Checklist

Before deploying to production:

- [ ] All code committed to main branch
- [ ] Latest code pushed to GitHub
- [ ] render.yaml is present in root
- [ ] Environment variables configured
- [ ] Database migrations planned
- [ ] API endpoints tested locally
- [ ] Frontend builds successfully
- [ ] Backend starts without errors
- [ ] Authentication flows work
- [ ] Navigation buttons work

---

## Support & Documentation

**Render Documentation**: https://render.com/docs  
**GitHub Repository**: https://github.com/miliyee/Alem-Treding  
**Render Dashboard**: https://dashboard.render.com  

---

## Current Status

✅ Code ready for deployment  
✅ render.yaml configured  
✅ Latest changes pushed to GitHub  
✅ Environment variables documented  
✅ Database schema ready  
✅ Backend migration scripts prepared  

**READY TO DEPLOY** 🚀

---

## Deployment Timeline

| Step | Duration | Status |
|------|----------|--------|
| 1. Create Blueprint | 1 min | ⏳ Manual |
| 2. Configure vars | 2 min | ⏳ Manual |
| 3. PostgreSQL deploy | 3 min | 🔄 Auto |
| 4. Backend deploy | 5-8 min | 🔄 Auto |
| 5. Frontend deploy | 8-10 min | 🔄 Auto |
| **Total** | **~20 min** | ✅ |

---

**Last Updated**: August 19, 2026  
**Deployment Version**: ff37d7e4  
**Ready**: YES ✅
