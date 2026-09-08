# Render Deployment - Quick Checklist

## Pre-Deployment (Local)

### Environment Setup
- [ ] Backend `.env` file created with all variables
- [ ] Frontend `.env.local` file created with API URL
- [ ] JWT_SECRET generated (min 32 random characters)
- [ ] Database credentials prepared

### Code Verification
- [ ] All tests passing locally (`npm test`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] No console errors in frontend
- [ ] No TypeScript compilation errors
- [ ] No ESLint errors (`npm run lint`)

### Git Repository
- [ ] GitHub account created
- [ ] Repository created: `alem-trading-crm`
- [ ] All code committed: `git add . && git commit -m "Initial commit"`
- [ ] Pushed to main: `git push -u origin main`
- [ ] `.gitignore` excludes: `node_modules/`, `.env`, `.next/`, `dist/`

---

## Render Account Setup

### Account & Project
- [ ] Render account created at render.com
- [ ] GitHub connected to Render account
- [ ] Repository authorized for Render access

---

## Render Services Deployment

### Database Setup
- [ ] PostgreSQL database created
  - [ ] Name: `alem-crm-db`
  - [ ] Database: `alem_crm`
  - [ ] Region: `Singapore` (or closest)
  - [ ] Connection string noted: `postgresql://...`

### Backend Service
- [ ] Web Service created
  - [ ] Name: `alem-crm-backend`
  - [ ] Connected to GitHub repository
  - [ ] Dockerfile: `./backend/Dockerfile`
  - [ ] Auto-deploy enabled for main branch
  
- [ ] Environment Variables Set:
  ```
  NODE_ENV: production
  PORT: 3001
  DATABASE_URL: (from PostgreSQL)
  JWT_SECRET: (generated 32+ char string)
  API_URL: https://alem-crm-backend.onrender.com
  FRONTEND_URL: https://alem-crm-frontend.onrender.com
  CORS_ORIGIN: https://alem-crm-frontend.onrender.com
  LOG_LEVEL: info
  ```
  
- [ ] Build/Deployment Status
  - [ ] Initial build successful
  - [ ] No build errors in logs
  - [ ] Service shows "Live" status
  - [ ] Health check responding

### Frontend Service
- [ ] Web Service created
  - [ ] Name: `alem-crm-frontend`
  - [ ] Connected to GitHub repository
  - [ ] Dockerfile: `./frontend/Dockerfile`
  - [ ] Auto-deploy enabled for main branch
  
- [ ] Environment Variables Set:
  ```
  NODE_ENV: production
  NEXT_PUBLIC_API_URL: https://alem-crm-backend.onrender.com
  PORT: 3000
  ```
  
- [ ] Build/Deployment Status
  - [ ] Initial build successful
  - [ ] No build errors in logs
  - [ ] Service shows "Live" status
  - [ ] Health check responding

---

## Post-Deployment Testing

### Service Health
- [ ] Backend service responding
  - [ ] Health endpoint: `https://alem-crm-backend.onrender.com/api/health` → 200 OK
  - [ ] API accessible: `https://alem-crm-backend.onrender.com/api`
  
- [ ] Frontend service responding
  - [ ] Frontend URL loads: `https://alem-crm-frontend.onrender.com`
  - [ ] No 503/504 errors
  - [ ] Page not blank

### Login Verification
- [ ] Navigate to frontend URL
- [ ] Login with test credentials:
  - [ ] Email: `million`
  - [ ] Password 1: `million123`
  - [ ] Password 2: `million456`
- [ ] Successfully authenticated

### Feature Verification
- [ ] Dashboard displays
  - [ ] Items count shows (3 items: Samsung S26, rggh, sdfhg)
  - [ ] Inventory Value displays (233,778)
  
- [ ] Admin Users page works
  - [ ] Users list appears
  - [ ] All 15 permissions shown as checkboxes
  - [ ] Permissions appear checked by default
  
- [ ] User Management Functions
  - [ ] Can create new user
  - [ ] New user has all 15 permissions checked
  - [ ] Can edit user
  - [ ] All 15 permissions shown in edit modal
  - [ ] Can delete user
  - [ ] Changes persist after page refresh
  
- [ ] Login/Logout
  - [ ] Login works correctly
  - [ ] Logout works
  - [ ] Can create account and login with it

### Browser Console
- [ ] No JavaScript errors
- [ ] No CORS errors
- [ ] No network 4xx/5xx errors (except intentional)
- [ ] No TypeScript errors

### Performance
- [ ] Frontend loads in < 3 seconds
- [ ] API responses in < 1 second
- [ ] No console warnings (debug mode)

---

## Data & Configuration

### Database
- [ ] Migrations run successfully
- [ ] Initial data seeded (if applicable)
- [ ] Database connection stable

### Monitoring
- [ ] Error tracking configured (optional - Sentry)
- [ ] Logs accessible via Render dashboard
- [ ] Alerts configured (optional)

---

## Security Verification

- [ ] HTTPS enforced (automatic on Render)
- [ ] JWT_SECRET is strong (32+ chars, random)
- [ ] Database password is secure
- [ ] CORS properly configured (not wildcard)
- [ ] No secrets in code (using env vars)
- [ ] No sensitive data in logs

---

## Final Steps

### Cleanup
- [ ] Remove any test/debug files from repo
- [ ] Update README with deployment info
- [ ] Document access credentials securely
- [ ] Set up backup strategy for database

### Documentation
- [ ] README updated with deployment URLs
- [ ] Team informed of deployment
- [ ] Access credentials shared securely
- [ ] Maintenance plan documented

### Go-Live
- [ ] All checks passed ✅
- [ ] Team approval obtained
- [ ] Ready for production use

---

## Deployment URLs (Upon Success)

| Service | URL |
|---------|-----|
| Frontend | https://alem-crm-frontend.onrender.com |
| Backend API | https://alem-crm-backend.onrender.com/api |
| Database | Managed by Render (internal) |

---

## Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| Build fails | Check Node version 20+, clear cache |
| Database error | Add DATABASE_URL env var, wait 2-3 min |
| CORS error | Verify CORS_ORIGIN matches exactly |
| 503 Service Unavailable | Check backend logs, restart service |
| Frontend blank | Check NEXT_PUBLIC_API_URL env var |
| Permissions not showing | Verify `getAllFeatureIds()` returns all 15 |
| Users disappear on refresh | Check localStorage key: `users_data` |

---

## Sign-Off

- **Deployed By**: _________________
- **Date**: _________________
- **Environment**: Production
- **Status**: ✅ Ready for Production

---

**Reference**: RENDER_FULL_ENVIRONMENT_SETUP.md for detailed instructions
