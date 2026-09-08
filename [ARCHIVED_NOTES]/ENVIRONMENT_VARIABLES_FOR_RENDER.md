# ALEM CRM - Complete Environment Variables for Render Deployment

This document contains all the environment variables needed to deploy the ALEM CRM system on Render.com or similar hosting platforms.

## Table of Contents
1. [Backend Environment Variables](#backend-environment-variables)
2. [Frontend Environment Variables](#frontend-environment-variables)
3. [Render Deployment Setup](#render-deployment-setup)
4. [Important Notes](#important-notes)

---

## Backend Environment Variables

### Database Configuration
```
DB_HOST=your-postgres-database-host.onrender.com
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=YOUR_SECURE_PASSWORD_HERE
DB_NAME=alem_crm
```

### Server Configuration
```
NODE_ENV=production
PORT=3001
API_URL=https://your-backend-domain.onrender.com
FRONTEND_URL=https://your-frontend-domain.onrender.com
```

### JWT Configuration (IMPORTANT: Generate secure keys)
```
# Generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=generate-a-random-32-character-string-here
JWT_EXPIRATION=3600
JWT_REFRESH_SECRET=generate-another-random-32-character-string
JWT_REFRESH_EXPIRATION=604800
```

### Redis Configuration (Optional, use Render Redis)
```
REDIS_HOST=your-redis-host.onrender.com
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_REDIS_PASSWORD_HERE
```

### File Upload Configuration
```
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=xlsx,xls
```

### Email Configuration (Using Gmail or SendGrid)
**Option 1: Gmail (Recommended for production)**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SMTP_SECURE=false
SMTP_FROM=ALEM TRADING <noreply@alem-trading.com>
SMTP_FROM_NAME=ALEM TRADING Management System
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=ALEM TRADING <noreply@alem-trading.com>
```

**Option 2: SendGrid**
```
SENDGRID_API_KEY=your-sendgrid-api-key-here
SMTP_FROM=noreply@alem-trading.com
SMTP_FROM_NAME=ALEM TRADING Management System
```

### Logging Configuration
```
LOG_LEVEL=info
LOG_FORMAT=json
```

### Rate Limiting Configuration
```
RATE_LIMIT=100
RATE_LIMIT_WINDOW=60
```

### Security Configuration
```
ENABLE_HELMET=true
ENABLE_CSRF=true
```

### CORS Configuration
```
CORS_ORIGINS=https://your-frontend-domain.onrender.com,https://www.your-domain.com
```

### AWS S3 Configuration (Optional - for file storage)
```
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=alem-crm-uploads-prod
```

### Backup Configuration
```
BACKUP_ENABLED=true
BACKUP_INTERVAL_HOURS=24
BACKUP_RETENTION_DAYS=30
```

---

## Frontend Environment Variables

### API Configuration
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.onrender.com
```

### Authentication Configuration
```
NEXTAUTH_URL=https://your-frontend-domain.onrender.com
NEXTAUTH_SECRET=generate-a-random-32-character-string-here
```

### Optional: Analytics
```
NEXT_PUBLIC_ANALYTICS_ID=your-google-analytics-id
```

### Optional: Environment
```
NEXT_PUBLIC_ENV=production
```

---

## Render Deployment Setup

### Backend Service on Render

1. **Create a New Web Service:**
   - Connect your GitHub repository
   - Select the backend directory (if monorepo)
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
   - Environment: Node.js

2. **Add Environment Variables:**
   - Go to Environment tab
   - Add all backend environment variables from above
   - Use PostgreSQL database URL from Render Database

3. **Database:**
   - Use Render PostgreSQL
   - Database URL: `postgresql://user:password@host:port/database`

4. **Redis (Optional):**
   - Create Render Redis instance
   - Add connection details to environment

### Frontend Service on Render

1. **Create a New Static Site or Web Service:**
   - Connect your GitHub repository
   - Select the frontend directory
   - Build Command: `npm install && npm run build`
   - Start Command (if Web Service): `npm run dev`
   - Publish Directory (if Static Site): `.next/static`

2. **Add Environment Variables:**
   - Go to Environment tab
   - Add all frontend environment variables
   - Set `NEXT_PUBLIC_API_URL` to your backend URL

3. **Configure for Next.js:**
   - Use Node.js Web Service (not Static Site) for SSR
   - Environment: Node.js
   - Node Version: 18+ (or latest LTS)

---

## Important Notes

### Security Best Practices

1. **Never commit `.env` files to version control**
   - Use `.env.local` for local development
   - Use Render environment variables for production

2. **Use Strong Secrets**
   - Generate JWT secrets with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Use different secrets for development and production
   - Rotate secrets periodically in production

3. **Database Credentials**
   - Use Render-managed PostgreSQL
   - Enable SSL connections
   - Use strong, randomly generated passwords
   - Restrict database access to services only

4. **API Keys**
   - Store API keys (SendGrid, AWS, etc.) as environment variables
   - Never expose API keys in frontend code (use `NEXT_PUBLIC_` prefix only for public data)
   - Rotate keys periodically

### Environment Variable Precedence

**Backend:**
```
1. .env.local (local development)
2. .env (local development)
3. Render Environment Variables (production)
4. Hard-coded defaults (if applicable)
```

**Frontend:**
```
1. .env.local (local development)
2. .env (local development)
3. Build-time variables (passed during build)
4. Runtime variables (only for NEXT_PUBLIC_* prefix)
```

### Deployment Checklist

- [ ] All environment variables configured in Render
- [ ] Database migrations run
- [ ] JWT secrets are strong (32+ characters)
- [ ] API URLs point to correct domains
- [ ] CORS_ORIGINS includes frontend domain
- [ ] Email service configured (Gmail/SendGrid)
- [ ] SSL/HTTPS enabled
- [ ] Database backups enabled
- [ ] Monitoring/logging configured
- [ ] Error tracking (Sentry) optional but recommended

### Email Configuration for Gmail

1. Enable 2-Factor Authentication on Gmail account
2. Generate App Password at: https://myaccount.google.com/apppasswords
3. Use the generated 16-character password in `EMAIL_PASSWORD`
4. Set `SMTP_USER` to your Gmail address

### Email Configuration for SendGrid

1. Create SendGrid account
2. Generate API key
3. Set `SENDGRID_API_KEY` environment variable
4. Configure sender email in `SMTP_FROM`

### Monitoring & Logging

For production monitoring, consider adding:

```
SENTRY_DSN=your-sentry-project-dsn
SENTRY_ENVIRONMENT=production
```

Then install Sentry in your application for error tracking.

---

## Testing Environment Variables

Before deploying, test your environment variables locally:

```bash
# Backend
node -e "
  require('dotenv').config();
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('API_URL:', process.env.API_URL);
"

# Frontend
npx next build
npm run dev
```

---

## Production Domains Example

Replace these with your actual domains:

**Backend:**
- Development: `http://localhost:3001`
- Production: `https://api.alem-trading.com` or `https://alem-crm-api.onrender.com`

**Frontend:**
- Development: `http://localhost:3000`
- Production: `https://alem-trading.com` or `https://alem-crm.onrender.com`

**Database:**
- Development: `localhost:5432`
- Production: `your-postgres.onrender.com:5432`

---

## Emergency Contacts & Support

If you encounter issues with environment variables:

1. Check Render logs: `render.com > Services > Logs`
2. Verify environment variables are set correctly
3. Restart the service after updating variables
4. Check database connectivity
5. Review application error logs for specific errors

---

**Last Updated:** July 2026
**Application:** ALEM CRM System
**Version:** 1.0.0
