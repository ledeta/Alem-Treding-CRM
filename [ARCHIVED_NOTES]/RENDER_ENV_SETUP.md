# Render.com Environment Variables Setup Guide

## Overview
This guide provides all environment variables needed to deploy Alem CRM System on Render.com.

---

## Backend Service Environment Variables

### Database Configuration
```
DATABASE_URL=postgresql://user:password@host:5432/alem_crm
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=alem_crm
```

### Redis Configuration
```
REDIS_URL=redis://user:password@host:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_redis_password
```

### JWT Configuration
```
JWT_SECRET=your_super_secret_jwt_key_change_me
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_me
JWT_EXPIRATION=7d
JWT_REFRESH_EXPIRATION=30d
```

### Application Configuration
```
NODE_ENV=production
PORT=3000
API_URL=https://alem-crm-backend.onrender.com
FRONTEND_URL=https://alem-crm-frontend.onrender.com
CORS_ORIGINS=https://alem-crm-frontend.onrender.com
LOG_LEVEL=info
```

### Email Configuration (Optional)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
MAIL_FROM=noreply@alem-crm.com
```

### AWS S3 Configuration (Optional for file uploads)
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your_bucket_name
```

### Payment Gateway (Optional)
```
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

---

## Frontend Service Environment Variables

### API Configuration
```
NEXT_PUBLIC_API_URL=https://alem-crm-backend.onrender.com
NEXT_PUBLIC_APP_NAME=Alem CRM
NEXT_PUBLIC_APP_URL=https://alem-crm-frontend.onrender.com
```

### NextAuth Configuration
```
NEXTAUTH_URL=https://alem-crm-frontend.onrender.com
NEXTAUTH_SECRET=your_super_secret_nextauth_secret_change_me
NEXTAUTH_DEBUG=false
```

### Application Configuration
```
NODE_ENV=production
NEXT_PUBLIC_LOG_LEVEL=info
```

### Analytics (Optional)
```
NEXT_PUBLIC_GA_ID=your_google_analytics_id
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

---

## Database Service Configuration

### PostgreSQL Database
- **Service Type**: Managed Database
- **Engine**: PostgreSQL 15
- **Version**: Latest
- **Plan**: Standard (or Starter for dev)

**Initial Database Settings:**
```
Database Name: alem_crm
Username: postgres
Password: [Strong password - 20+ chars, mix of upper/lower/numbers/symbols]
```

---

## Redis Service Configuration

### Redis Cache
- **Service Type**: Redis
- **Version**: 7-alpine
- **Plan**: Starter

---

## Step-by-Step Setup on Render

### 1. Create PostgreSQL Database
1. Go to https://dashboard.render.com/
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: alem-postgres
   - **Database Name**: alem_crm
   - **User**: postgres
   - **Region**: Choose closest to users
   - **Plan**: Standard (Starter for testing)
4. Copy the **Internal Database URL**

### 2. Create Redis Cache
1. Click "New +" → "Redis"
2. Configure:
   - **Name**: alem-redis
   - **Region**: Same as database
   - **Plan**: Starter
3. Copy the **Redis URL**

### 3. Deploy Backend Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: alem-crm-backend
   - **Environment**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
   - **Region**: Same as database
   - **Plan**: Starter
4. Add all Backend Environment Variables (see above)
5. Deploy

### 4. Deploy Frontend Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: alem-crm-frontend
   - **Environment**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
   - **Region**: Same as backend
   - **Plan**: Starter
4. Add all Frontend Environment Variables (see above)
5. Update `NEXT_PUBLIC_API_URL` with your backend service URL after it deploys
6. Deploy

---

## Important Security Notes

⚠️ **CRITICAL**: 
- Never commit `.env` files with real secrets
- Use strong, unique passwords (20+ characters)
- Rotate JWT secrets regularly
- Use different secrets for dev/staging/production
- Enable database encryption at rest
- Restrict database access to your services only

---

## Verification Steps

After all services are deployed:

1. **Test Backend Health Check**
   ```
   https://alem-crm-backend.onrender.com/api/health
   ```
   Should return: `{"status":"ok"}`

2. **Test Frontend Loading**
   ```
   https://alem-crm-frontend.onrender.com/
   ```
   Should load the login page

3. **Test Database Connection**
   - Go to Backend service logs
   - Should show successful DB connection

4. **Test Frontend-Backend Communication**
   - Login to the application
   - Check network tab in browser dev tools
   - API calls should go to backend service URL

---

## Troubleshooting

### Backend Won't Start
1. Check logs: Click service → "Logs" tab
2. Verify DATABASE_URL is correct
3. Run migrations: Add `npm run typeorm migration:run` to startup

### Frontend Shows 404
1. Check NEXT_PUBLIC_API_URL is correct
2. Verify build completed successfully
3. Check build logs for TypeScript errors

### Database Connection Failed
1. Verify DATABASE_URL format
2. Check database credentials
3. Ensure network access is allowed
4. Check PostgreSQL logs

### Redis Connection Failed
1. Verify REDIS_URL format
2. Check Redis service is running
3. Verify credentials if password protected

---

## Additional Resources

- [Render Docs](https://render.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Redis Docs](https://redis.io/documentation)
- [Next.js Deployment](https://nextjs.org/docs/deployment/render)
- [NestJS Production](https://docs.nestjs.com/deployment)

---

## Git Commands to Push

```bash
# Stage all files
git add .

# Commit with message
git commit -m "Add Render deployment configuration"

# Push to main branch
git push origin main
```

Once pushed, Render will automatically detect and deploy your services!
