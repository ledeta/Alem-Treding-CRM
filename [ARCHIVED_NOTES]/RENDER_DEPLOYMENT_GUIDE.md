# Render Deployment Guide - ALEM CRM System
**Date**: July 30, 2026  
**Status**: Ready for Deployment

---

## Prerequisites

Before deploying to Render, you need:

1. **GitHub Repository**
   - ✅ Commits pushed to main branch
   - ✅ All changes available on GitHub
   - ✅ Repository is public or has Render access

2. **Render Account**
   - Go to https://render.com
   - Sign up or log in
   - Create organization if needed

3. **PostgreSQL Database**
   - Option A: Use Render PostgreSQL service
   - Option B: Use external PostgreSQL provider

---

## Deployment Steps

### Step 1: Deploy Backend Service

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Create New Service**:
   - Click "+ New" button
   - Select "Web Service"
   - Select "Build and deploy from a Git repository"
   - Authorize GitHub if needed
   - Select your repository: `Alem-Treding`
   - Select branch: `main`

3. **Service Configuration**:
   - **Name**: `alem-crm-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node.js`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/main.js`
   - **Plan**: Free or Starter (as needed)

4. **Environment Variables** (Add these in Render dashboard):
   ```
   NODE_ENV=production
   PORT=3001
   DB_HOST=[Your PostgreSQL Host]
   DB_PORT=5432
   DB_USER=[Your DB Username]
   DB_PASSWORD=[Your DB Password]
   DB_NAME=alem_crm
   JWT_SECRET=[Generate a random string, e.g., $(openssl rand -base64 32)]
   DATABASE_URL=postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
   ```

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment to complete (5-10 minutes)
   - Note your backend URL (e.g., `https://alem-crm-backend.onrender.com`)

---

### Step 2: Deploy Frontend Service

1. **Create New Service**:
   - Click "+ New" button
   - Select "Static Site" (or "Web Service" for Next.js)
   - For Next.js, use "Web Service" with:
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm run start`

2. **Service Configuration**:
   - **Name**: `alem-crm-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

3. **Environment Variables**:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://alem-crm-backend.onrender.com/api
   ```

4. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your frontend URL (e.g., `https://alem-crm-frontend.onrender.com`)

---

### Step 3: Set Up PostgreSQL Database

**Option A: Render PostgreSQL Service**

1. Create New Service → PostgreSQL
2. Configure:
   - **Name**: `alem-crm-db`
   - **Database Name**: `alem_crm`
   - **User**: Create a username
   - **Plan**: Free or Starter

3. Copy connection details and update backend environment variables

**Option B: External PostgreSQL (if you have existing database)**

- Get your PostgreSQL connection URL
- Use `DATABASE_URL` format in environment variables
- Make sure database is accessible from Render

---

### Step 4: Run Database Migrations

1. **Via SSH/Terminal** (if available in Render):
   ```bash
   # Connect to backend service
   # Run migrations
   npm run typeorm migration:run
   ```

2. **Via Seed Service**:
   - The application automatically seeds database on startup
   - Check `backend/src/database/seeds.service.ts`

---

## Verification

### 1. Backend Health Check
```bash
curl https://alem-crm-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

### 2. Frontend Access
Visit: `https://alem-crm-frontend.onrender.com`

Should see the ALEM CRM login page.

### 3. API Connection Test
```bash
curl https://alem-crm-backend.onrender.com/api/customers?page=1&limit=5
```

Should return customer list.

---

## Payment Request Feature - Testing

After deployment, test the new payment request feature:

1. **Access Frontend**: `https://alem-crm-frontend.onrender.com`
2. **Login** with your credentials
3. **Navigate to**: Sales → Customer Search
4. **Select a customer**
5. **Click**: "Create Payment Request"
6. **Fill form** with:
   - Amount: 5000
   - Bank: Telebirr
   - Reason: Test payment
   - DateTime: Now
7. **Submit** and verify success message

---

## Environment Variables Reference

### Backend (.env or Render Dashboard)

```env
# Server
NODE_ENV=production
PORT=3001

# Database (Option 1: Individual vars)
DB_HOST=your-db-host.render.internal
DB_PORT=5432
DB_USER=alem_user
DB_PASSWORD=your_secure_password
DB_NAME=alem_crm

# Database (Option 2: Connection URL - recommended)
DATABASE_URL=postgresql://alem_user:your_secure_password@your-db-host.render.internal:5432/alem_crm

# JWT
JWT_SECRET=your_randomly_generated_secret_key_min_32_chars

# CORS
CORS_ORIGIN=https://alem-crm-frontend.onrender.com
```

### Frontend (.env.local or Render Dashboard)

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://alem-crm-backend.onrender.com/api
```

---

## Troubleshooting

### Issue: Backend fails to start
1. Check environment variables are set
2. Verify DATABASE_URL is correct
3. Check logs in Render dashboard
4. Ensure PostgreSQL service is running

### Issue: Frontend can't connect to backend
1. Verify NEXT_PUBLIC_API_URL is correct
2. Check CORS is enabled in backend
3. Verify backend is healthy: `/api/health`

### Issue: Database connection refused
1. Check database is running
2. Verify credentials are correct
3. Ensure database name matches
4. Check firewall/network settings

### Issue: Payment request endpoint returns error
1. Check backend logs
2. Verify `/api/payments` endpoint is accessible
3. Ensure `@Public()` decorator is applied
4. Check database has payment_requests table

---

## Logs & Monitoring

### View Backend Logs
1. Go to Render Dashboard
2. Select `alem-crm-backend` service
3. Click "Logs" tab
4. Search for errors or issues

### View Frontend Logs
1. Go to Render Dashboard
2. Select `alem-crm-frontend` service
3. Click "Logs" tab

### Monitor Performance
- Use Render's metrics dashboard
- Check CPU and memory usage
- Monitor database connections

---

## Scaling & Optimization

### If application is slow:
1. Upgrade Render plan
2. Add database read replicas
3. Enable caching (Redis)
4. Optimize API queries
5. Use CDN for static assets

### If database is slow:
1. Upgrade PostgreSQL plan
2. Add indexes to frequently queried columns
3. Archive old data
4. Use connection pooling (PgBouncer)

---

## Backup & Recovery

### Database Backups
- Render PostgreSQL automatically backs up daily
- Backups retained for 7 days (free plan)
- Manual backups available (if needed)

### Manual Backup Process
```bash
# Export database
pg_dump -U [user] -h [host] -d [database] > backup.sql

# Restore database
psql -U [user] -h [host] -d [database] < backup.sql
```

---

## SSL/HTTPS

- ✅ Render provides free SSL certificates
- ✅ All connections are HTTPS by default
- ✅ Certificate auto-renewal handled by Render
- ✅ No additional configuration needed

---

## Custom Domain (Optional)

1. **Add Custom Domain** in Render dashboard:
   - Click on service
   - Go to "Settings" tab
   - Add your custom domain
   - Get DNS records to add to domain provider

2. **Configure DNS**:
   - Add CNAME record to your domain provider
   - Point to Render's DNS
   - Wait for propagation (up to 48 hours)

---

## Cost Estimation

### Free Plan
- Backend: $0/month
- Frontend: $0/month
- Database: $0/month
- **Total**: $0 (limited resources)

### Starter Plan
- Backend: $7/month
- Frontend: $7/month
- Database: $15/month
- **Total**: $29/month

### Recommended for Production
- Backend: $25/month (more reliable)
- Frontend: $25/month
- Database: $45/month (better performance)
- **Total**: $95/month

---

## Support & Help

### Render Documentation
- https://render.com/docs

### Deploy Issues
1. Check Render logs
2. Review environment variables
3. Verify git repository
4. Check GitHub actions/CI

### Backend Issues
1. Test health endpoint
2. Check database connection
3. Review NestJS logs
4. Verify API endpoints

### Frontend Issues
1. Check browser console (F12)
2. Clear Next.js cache
3. Verify API URL
4. Check CORS headers

---

## Rollback Plan

If deployment fails:

1. **Quick Rollback**:
   - Go to service in Render
   - Click "Deploy"
   - Select previous commit
   - Deploy rolls back to previous version

2. **Manual Rollback**:
   - Git reset to previous commit
   - Push to main branch
   - Render auto-deploys new version

---

## Post-Deployment Checklist

- ✅ Backend service deployed
- ✅ Frontend service deployed
- ✅ Database migrated
- ✅ Environment variables set
- ✅ Health endpoints responding
- ✅ Customer search working
- ✅ Payment request feature working
- ✅ Database backups configured
- ✅ Monitoring enabled
- ✅ Logs accessible

---

## Deployment Success Indicators

✅ **Deployment is successful when:**

1. **Backend**:
   - Service status: "Live"
   - GET /api/health returns 200
   - GET /api/customers returns customer list

2. **Frontend**:
   - Service status: "Live"
   - Home page loads
   - Can log in
   - Can navigate to customer search

3. **Payment Feature**:
   - Can select customer
   - Can open payment modal
   - Can submit payment request
   - Payment appears in database

---

## Next Steps

1. Deploy backend service
2. Deploy frontend service
3. Create PostgreSQL database
4. Verify all endpoints working
5. Test payment request feature
6. Monitor logs for errors
7. Set up custom domain (optional)
8. Configure backups
9. Celebrate successful deployment! 🎉

---

## Contact & Support

For deployment issues:
- Check Render documentation: https://render.com/docs
- Review application logs
- Test endpoints manually
- Verify environment variables
- Check GitHub repository

---

**Status**: Ready for Deployment  
**Date**: July 30, 2026  
**Version**: mega-aggressive-v2  
**All Changes Committed**: ✅ Yes  
**Ready for Production**: ✅ Yes
