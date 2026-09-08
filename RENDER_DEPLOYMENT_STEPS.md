# Deploy to Render - Step by Step Guide ✅

**Status**: Ready for Deployment  
**Date**: August 19, 2026  
**Repository**: https://github.com/miliyee/Alem-Treding

---

## Prerequisites

Before starting, ensure you have:
- ✅ GitHub account with repository access
- ✅ Render account (https://render.com)
- ✅ All code changes committed and pushed to main

---

## Step 1: Verify Git Status

Ensure all changes are committed and pushed:

```bash
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system"
git status
# Should show: "nothing to commit, working tree clean"

git log --oneline -1
# Latest commit should show your changes
```

---

## Step 2: Create Render PostgreSQL Database

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `alem-crm-db`
   - **Database**: `alem_crm`
   - **User**: `alem_user`
   - **Region**: Choose closest to you
   - **Plan**: Free (or paid if needed)
4. Click **"Create Database"**
5. Wait 2-3 minutes for creation
6. Copy the **Internal Database URL** (you'll need this)

**Database URL Format**:
```
postgresql://alem_user:PASSWORD@localhost:5432/alem_crm
```

---

## Step 3: Deploy Backend Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Select **"Deploy an existing repository"**

### Backend Configuration:

**Basic Settings**:
- **Name**: `alem-crm-backend`
- **Repository**: Select `https://github.com/miliyee/Alem-Treding`
- **Branch**: `main`
- **Runtime**: `Node`
- **Build Command**: 
  ```
  cd backend && npm install && npm run build
  ```
- **Start Command**: 
  ```
  cd backend && npm run start:prod
  ```
- **Plan**: Free (or paid if needed)

**Environment Variables** (Add these):
```
NODE_ENV=production
DATABASE_URL=postgresql://alem_user:PASSWORD@localhost:5432/alem_crm
JWT_SECRET=your-secure-random-secret-key-change-this
JWT_EXPIRATION=7d
PORT=3001
CORS_ORIGIN=https://alem-crm-frontend.onrender.com
LOG_LEVEL=info
```

**Important**:
- Replace `PASSWORD` with your database password
- Replace `alem-crm-frontend.onrender.com` with actual frontend URL (you'll get this from step 4)

4. Click **"Create Web Service"**
5. Wait for build to complete (~3-5 minutes)
6. Once deployed, copy the backend URL: `https://alem-crm-backend.onrender.com`

---

## Step 4: Deploy Frontend Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Select **"Deploy an existing repository"**

### Frontend Configuration:

**Basic Settings**:
- **Name**: `alem-crm-frontend`
- **Repository**: Select `https://github.com/miliyee/Alem-Treding`
- **Branch**: `main`
- **Runtime**: `Node`
- **Build Command**: 
  ```
  cd frontend && npm install && npm run build
  ```
- **Start Command**: 
  ```
  cd frontend && npm run start
  ```
- **Plan**: Free (or paid if needed)

**Environment Variables**:
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://alem-crm-backend.onrender.com
PORT=3000
```

4. Click **"Create Web Service"**
5. Wait for build to complete (~3-5 minutes)
6. Once deployed, you'll get frontend URL: `https://alem-crm-frontend.onrender.com`

---

## Step 5: Update Backend with Frontend URL

Since we now know the frontend URL:

1. Go back to **Backend Service** in Render
2. Click **"Environment"**
3. Edit `CORS_ORIGIN`:
   - Change from placeholder to: `https://alem-crm-frontend.onrender.com`
4. Click **"Save"**
5. Render will automatically redeploy backend

---

## Step 6: Run Database Migrations

The backend will automatically run migrations on startup, but you can verify:

1. Go to **Backend Service** → **Logs**
2. Look for messages like:
   ```
   Database connected successfully
   Migrations running...
   Migrations completed
   Server running on port 3001
   ```
3. If there are errors, check the logs for details

---

## Step 7: Verify Deployment

### Test Frontend
1. Open: https://alem-crm-frontend.onrender.com
2. Should see login page
3. Try logging in with test credentials:
   - **Email**: `admin@alemtrading.com`
   - **Password**: `password` (or your test password)

### Test Navigation
1. After login, verify 5 navigation buttons appear:
   - Dashboard (📊)
   - Chat (💬)
   - Customers (👥)
   - Payments (💳)
   - Account (👤)
2. Click each button and verify navigation works

### Test API Connection
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Click on Dashboard button
4. Should see API calls to:
   - `https://alem-crm-backend.onrender.com/api/dashboard`
5. Verify response status is **200** (not 401 or 5xx)

### Check Backend Logs
1. Go to Render → Backend Service → Logs
2. Should see:
   ```
   ✓ Database connected
   ✓ Server running on port 3001
   ✓ CORS enabled for https://alem-crm-frontend.onrender.com
   ```

---

## Step 8: Monitor Deployment

### Enable Notifications
1. Go to **Account Settings** → **Notifications**
2. Enable email notifications for:
   - Deployment failures
   - Service failures
   - Build failures

### Check Logs Regularly
- Backend: Render → Backend Service → Logs
- Frontend: Render → Frontend Service → Logs

### Common Issues & Solutions

**Issue: 504 Gateway Timeout**
- Check backend is running: `Render → Backend → Logs`
- Restart backend service if needed

**Issue: CORS Error**
- Verify `CORS_ORIGIN` in backend environment variables
- Ensure it matches frontend URL exactly

**Issue: 401 Unauthorized on API calls**
- Check backend logs for JWT validation errors
- Verify `JWT_SECRET` is set correctly
- Clear browser cache and re-login

**Issue: Blank page on frontend**
- Check frontend logs: `Render → Frontend → Logs`
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check if backend is running

---

## Deployment Complete! ✅

### What You Now Have:
- ✅ **Frontend**: https://alem-crm-frontend.onrender.com
- ✅ **Backend**: https://alem-crm-backend.onrender.com
- ✅ **Database**: PostgreSQL on Render
- ✅ **Navigation**: 5 buttons (Dashboard, Chat, Customers, Payments, Account)
- ✅ **API Integration**: Approvals page with JWT auth
- ✅ **Auto-Redeploy**: Pushes to main automatically trigger deployment

### Next Steps:
1. Test all features in production
2. Monitor logs for errors
3. Set up database backups
4. Configure custom domain (if desired)
5. Enable auto-scaling for high traffic

### Useful Links:
- **Frontend**: https://alem-crm-frontend.onrender.com
- **Backend**: https://alem-crm-backend.onrender.com
- **GitHub**: https://github.com/miliyee/Alem-Treding
- **Render Dashboard**: https://dashboard.render.com

---

## Quick Redeploy

If you need to redeploy after making changes:

```bash
# 1. Make changes locally
git add .
git commit -m "Your message"
git push origin main

# 2. Render automatically detects and redeploys
# Check status at: https://dashboard.render.com
```

---

## Support

For issues or questions:
1. Check Render logs first
2. Review deployment guide
3. Check GitHub repository
4. Contact Render support: https://support.render.com

---

**Deployment Status**: READY ✅  
**Date**: August 19, 2026  
**Last Updated**: Auto-deployed from main branch
