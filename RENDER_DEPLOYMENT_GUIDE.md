# Render Deployment Guide - Alem Trading CRM

This guide walks you through deploying the Alem Trading CRM system to Render. The application consists of a Next.js 14 frontend, NestJS backend, and PostgreSQL database.

---

## Prerequisites

Before starting, ensure you have:
- GitHub account with access to the repository at https://github.com/ledeta/Alem-Treding-CRM
- Render account (sign up at https://dashboard.render.com - free tier works)
- Access to the repository with admin permissions (for connecting to Render)

---

## Step 1: Create PostgreSQL Database on Render

1. Log into your [Render dashboard](https://dashboard.render.com)
2. Click **New** → **PostgreSQL**
3. Configure the database:
   - **Name**: `alem-crm-db`
   - **Database**: `alem_crm` (auto-filled)
   - **User**: `alem_crm_user` (auto-filled)
   - **Region**: Frankfurt (EU Central) or closest to your users
   - **Plan**: Free (for testing) or Starter ($7/month for production)
4. Click **Create Database**
5. Wait for provisioning (usually 1-2 minutes)
6. **Copy the Internal Database URL**:
   - In the database dashboard, find **Connections** section
   - Copy the **Internal Database URL** (starts with `postgresql://`)
   - Format: `postgresql://user:password@host:5432/database`
   - ⚠️ **Important**: Use the **Internal** URL, not External (External is for tools like pgAdmin)
7. Keep this URL handy - you'll need it in Step 2

> **Note**: The Internal Database URL uses Render's private network for faster, secure connections between services.

---

## Step 2: Deploy the Backend (NestJS)

1. From Render dashboard, click **New** → **Web Service**
2. Connect your GitHub repository:
   - Click **Connect GitHub**
   - Authorize Render if prompted
   - Select the repository: `ledeta/Alem-Treding-CRM`
3. Configure the backend service:
   - **Name**: `alem-crm-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/main`
   - **Plan**: Free (or choose a paid plan)

4. **Add Environment Variables** - Click **Advanced** and add these variables:

   | Variable | Value | Description |
   |----------|-------|-------------|
   | `NODE_ENV` | `production` | Enables production optimizations, SSL for database |
   | `PORT` | `10000` | Default port (Render overrides this automatically) |
   | `DATABASE_URL` | *Paste Internal Database URL from Step 1* | PostgreSQL connection string from your database |
   | `JWT_SECRET` | *Generate with command below* | Secret key for JWT token signing (keep secure!) |
   | `JWT_EXPIRES_IN` | `24h` | Token expiration time (24 hours) |
   | `FRONTEND_URL` | *Leave blank for now* | Frontend URL - fill after Step 3 |
   | `CORS_ORIGIN` | *Leave blank for now* | Allowed CORS origin - fill after Step 3 |
   | `CORS_CREDENTIALS` | `true` | Allow cookies/credentials in CORS requests |
   | `DB_SYNCHRONIZE` | `true` | Auto-create database tables on first deploy |
   | `LOG_LEVEL` | `info` | Logging verbosity (error, warn, info, debug) |
   | `MAX_FILE_SIZE` | `10485760` | Max upload size in bytes (10MB) |

   **To generate a secure JWT_SECRET**, run this command locally:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Copy the output and paste it as the `JWT_SECRET` value.

   **Optional Variables** (add these if you need email, rate limiting, or monitoring):
   - `MAIL_HOST`: SMTP server for email notifications
   - `MAIL_PORT`: SMTP port (typically 587)
   - `MAIL_USER`: SMTP username
   - `MAIL_PASS`: SMTP password
   - `RATE_LIMIT_MAX_REQUESTS`: Maximum API requests per minute (default: 100)
   - `SENTRY_DSN`: Sentry error tracking URL
   - `REDIS_URL`: Redis connection string for caching

5. **Set Health Check Path**:
   - Scroll to **Health Check Path**
   - Enter: `/api/health`
   - This tells Render when your backend is ready

6. Click **Create Web Service**

7. Wait for deployment (usually 3-5 minutes):
   - Watch the logs for any errors
   - Wait for "Your service is live" message

8. **Copy the backend URL**:
   - Find your service URL at the top of the dashboard
   - Format: `https://alem-crm-backend-XXXX.onrender.com`
   - Save this URL for Step 3

> **Important Note**: After the first successful deployment, go back to environment variables and change `DB_SYNCHRONIZE` from `true` to `false`. This prevents accidental schema changes in production.

---

## Step 3: Deploy the Frontend (Next.js)

1. From Render dashboard, click **New** → **Web Service**
2. Select the same GitHub repository: `ledeta/Alem-Treding-CRM`
3. Configure the frontend service:
   - **Name**: `alem-crm-frontend`
   - **Root Directory**: `frontend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or choose a paid plan)

4. **Add Environment Variables**:

   | Variable | Value | Description |
   |----------|-------|-------------|
   | `NEXT_PUBLIC_API_URL` | *Backend URL from Step 2* + `/api` | Full backend API endpoint |
   | `NODE_ENV` | `production` | Next.js production mode |

   **Example**: If your backend URL is `https://alem-crm-backend-abc123.onrender.com`, set:
   ```
   NEXT_PUBLIC_API_URL=https://alem-crm-backend-abc123.onrender.com/api
   ```
   ⚠️ **Critical**: Make sure to add `/api` at the end!

5. Click **Create Web Service**

6. Wait for deployment (usually 4-6 minutes for Next.js build)

7. **Copy the frontend URL**:
   - Format: `https://alem-crm-frontend-XXXX.onrender.com`

8. **Update Backend Environment Variables**:
   - Go back to your backend service in Render dashboard
   - Find **Environment** section
   - Update these two variables:
     - `FRONTEND_URL`: Paste your frontend URL (no trailing slash)
     - `CORS_ORIGIN`: Paste the same frontend URL
   - Click **Save Changes**
   - Render will automatically redeploy the backend with new CORS settings

---

## Step 4: Verify Deployment

### Test Backend Health

Open a browser or use curl to test the backend health endpoint:

```bash
curl https://your-backend-url.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-13T12:34:56.789Z",
  "uptime": 123.456,
  "environment": "production"
}
```

For detailed diagnostics:
```bash
curl https://your-backend-url.onrender.com/api/health/diagnose
```

### Test Frontend

1. Open your frontend URL in a browser: `https://your-frontend-url.onrender.com`
2. You should see the login page
3. Open browser DevTools (F12) → Console tab
4. Check for any errors (especially CORS errors)

### Test Authentication

The system comes with default seeded users:

**Admin User:**
- Email: `admin@alemtrading.com`
- Password: `admin123`

**Sales User:**
- Email: `sales@alemtrading.com`
- Password: `sales123`

Try logging in with the admin credentials:
1. Enter email and password
2. Click **Sign In**
3. You should be redirected to the admin dashboard
4. Admin should see 6 blue navigation buttons
5. Try navigating through different sections

Log out and test the sales user:
1. Sales user should see 5 green navigation buttons
2. Verify different features work (customers, payments, shop, etc.)

### Verify API Communication

1. Open DevTools → Network tab
2. Navigate through the application
3. Check API calls are going to your backend URL
4. All requests should return 200 or appropriate status codes
5. No CORS errors should appear

### Check Database Persistence

1. Create a test customer or transaction
2. Refresh the page
3. Verify the data persists
4. Check Render logs for any database errors

---

## Step 5: Post-Deployment Hardening

### 1. Disable Database Synchronization

After confirming the database tables are created correctly:

1. Go to backend service in Render
2. Environment variables
3. Change `DB_SYNCHRONIZE` from `true` to `false`
4. Click **Save Changes**

This prevents automatic schema changes that could cause data loss.

### 2. Set Up Database Migrations (Optional)

For future schema changes, use TypeORM migrations:

```bash
# Generate a migration
npm run migration:generate -- -n DescriptiveName

# Run migrations
npm run migration:run
```

### 3. Rotate JWT Secret

Generate a new JWT_SECRET periodically:
1. Generate new secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
2. Update `JWT_SECRET` in backend environment variables
3. Save changes (service will redeploy)
4. ⚠️ **Note**: This will invalidate all existing user sessions

### 4. Enable Auto-Deploy

Configure automatic deployments when you push to GitHub:

1. Go to each service in Render dashboard
2. Settings → **Build & Deploy**
3. Enable **Auto-Deploy**
4. Select branch: `main` or `master`
5. Now every push to GitHub will trigger a deployment

### 5. Set Up Monitoring

Consider adding monitoring tools:
- **Sentry**: Add `SENTRY_DSN` environment variable for error tracking
- **Uptime Robot**: External monitoring service (free tier available)
- **Render Logs**: Review logs regularly for warnings and errors

---

## Troubleshooting

### Backend crashes on startup

**Symptom**: Backend service shows "Deploy failed" or keeps restarting

**Solutions**:
- Check you used the **Internal Database URL**, not External
- Verify `DATABASE_URL` is properly formatted: `postgresql://user:pass@host:5432/database`
- Check backend logs for specific error messages
- Ensure `JWT_SECRET` is set and at least 32 characters
- Verify all required environment variables are present

### CORS errors in browser console

**Symptom**: Console shows "blocked by CORS policy" errors

**Solutions**:
- Verify `CORS_ORIGIN` in backend matches your frontend URL exactly
- No trailing slash in `CORS_ORIGIN`
- Both URLs must use `https://`
- After updating, backend must be redeployed
- Clear browser cache and try again

### Frontend can't connect to backend (502 errors)

**Symptom**: API calls fail with 502 Bad Gateway

**Solutions**:
- Confirm `NEXT_PUBLIC_API_URL` ends with `/api`
- Verify backend is running (check backend service status)
- Test backend health endpoint directly
- Check backend logs for errors
- Ensure backend health check is passing

### SSL/TLS connection error to database

**Symptom**: Backend logs show "SSL connection failed" or "ECONNREFUSED"

**Solutions**:
- Verify you're using the Internal Database URL
- The backend already includes SSL configuration: `ssl: { rejectUnauthorized: false }`
- This is in `backend/src/app.module.ts` line 70
- Render PostgreSQL uses self-signed certificates, which the app handles
- If still failing, check database service is running

### Login fails / JWT errors

**Symptom**: Login returns 401 or JWT verification fails

**Solutions**:
- Verify `JWT_SECRET` is set correctly (check for typos)
- Ensure `JWT_SECRET` is at least 32 characters
- Check backend logs for JWT-related errors
- Try generating a new JWT secret
- Verify `JWT_EXPIRES_IN` format is correct (e.g., `24h`, `7d`)

### Database tables not created

**Symptom**: Backend starts but API calls fail with "relation does not exist"

**Solutions**:
- Verify `DB_SYNCHRONIZE=true` on first deployment
- Check backend logs during startup for table creation messages
- Ensure `NODE_ENV=production` is set
- Check database permissions (user must have CREATE TABLE rights)
- Try connecting to database with Render's shell to verify tables exist

### Slow first request (cold starts)

**Symptom**: First request after inactivity takes 30+ seconds

**Reason**: Render free tier spins down services after 15 minutes of inactivity

**Solutions**:
- Upgrade to paid plan ($7/month per service) for always-on
- Use external uptime monitoring to ping services every 10 minutes
- Warn users about potential first-load delay
- Consider serverless alternative if budget is tight

### Build fails during deployment

**Symptom**: Render shows "Build failed" with npm errors

**Solutions**:
- Check logs for specific error (missing dependency, TypeScript errors, etc.)
- Verify `package.json` and `package-lock.json` are committed
- Try building locally first: `npm install && npm run build`
- Clear Render build cache (Settings → Clear build cache)
- Check Node version compatibility (app uses Node 20)

---

## Useful Commands

### Local Testing Before Deploy

```bash
# Test backend build
cd backend
npm install
npm run build
npm run start:prod

# Test frontend build
cd frontend
npm install
npm run build
npm start

# Test backend health locally
curl http://localhost:3001/api/health
```

### Generate Secure Secrets

```bash
# JWT Secret (64 bytes)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Session Secret (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Check Database Connection

Use Render's database shell:
1. Go to your PostgreSQL service in Render
2. Click **Shell** tab
3. Run: `\dt` to list all tables
4. Should see tables like `user`, `customer`, `payment`, etc.

### View Real-Time Logs

```bash
# From Render dashboard:
1. Go to service (backend or frontend)
2. Click "Logs" tab
3. Watch real-time output

# Filter for errors:
Look for lines containing "ERROR", "Exception", or "Failed"
```

---

## Next Steps

After successful deployment:

1. **Change Default Passwords**:
   - Log in as admin
   - Go to user management
   - Update default admin and sales passwords
   - Consider adding 2FA (module exists in backend)

2. **Configure Email** (Optional):
   - Add SMTP credentials to backend env vars
   - Test email notifications

3. **Set Up Backups**:
   - Render provides automatic backups for paid PostgreSQL plans
   - Verify backup schedule in database settings
   - Test restore procedure

4. **Custom Domain** (Optional):
   - In Render service settings → Custom Domains
   - Add your domain (e.g., `crm.yourcompany.com`)
   - Follow DNS configuration instructions
   - SSL certificate auto-provisioned by Render

5. **Performance Monitoring**:
   - Add Sentry for error tracking
   - Set up uptime monitoring
   - Review Render metrics (CPU, memory, requests)

6. **Regular Maintenance**:
   - Review logs weekly for errors
   - Monitor database size and performance
   - Keep dependencies updated
   - Test backup restore procedure monthly

---

## Cost Summary

### Free Tier (Good for Testing)
- **Web Services**: 750 hours/month free (enough for 2 services)
- **PostgreSQL**: 90-day free trial, then $7/month
- **Limitations**: Services spin down after 15 min inactivity (cold starts)

### Starter Plan (Production Ready)
- **Backend**: $7/month (always-on)
- **Frontend**: $7/month (always-on)
- **PostgreSQL**: $7/month (500MB storage, 1GB RAM)
- **Total**: $21/month

### Standard Plan (Better Performance)
- **Backend**: $25/month
- **Frontend**: $25/month
- **PostgreSQL**: $20/month (10GB storage, 2GB RAM)
- **Total**: $70/month

---

## Support Resources

- **Render Documentation**: https://render.com/docs
- **Render Community**: https://community.render.com
- **NestJS Documentation**: https://docs.nestjs.com
- **Next.js Documentation**: https://nextjs.org/docs
- **TypeORM Documentation**: https://typeorm.io

For project-specific issues, check the GitHub repository issues page.

---

## Blueprint (render.yaml) Deployment

Alternatively, you can deploy using the included `render.yaml` file for automated setup:

1. In Render dashboard, click **New** → **Blueprint**
2. Connect your GitHub repository
3. Render will detect `render.yaml` and configure all services automatically
4. You'll still need to manually add the `JWT_SECRET` as a secret environment variable
5. Review the generated services and click **Create**

This method is faster but gives less control over individual settings.

---

**Congratulations!** Your Alem Trading CRM is now deployed on Render. If you encounter any issues not covered here, check the Render logs for detailed error messages and consult the troubleshooting section above.
