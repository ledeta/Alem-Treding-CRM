# Alem CRM System - Deployment Guide

## System Overview
- **Frontend**: Next.js on port 3000 (Production: Render)
- **Backend**: NestJS on port 3001 (Production: Render)
- **Database**: PostgreSQL on port 5432 (Production: Render managed DB)

## Navigation Structure

### Admin Section (Blue Theme - #1B4FA5)
6 navigation buttons:
1. Dashboard (📊)
2. Chat (💬)
3. Customers (👥)
4. Payments (💳)
5. Requests (📋)
6. Approvals (✅)

**File**: `frontend/src/components/AdminLayout.tsx`

### Sales Section (Green Theme - #059669)
5 navigation buttons:
1. Sales (🛒)
2. Dashboard (📊)
3. Customers (👥)
4. Requests (📋)
5. Chat (💬)

**File**: `frontend/src/components/SalesLayout.tsx`

## Deployment Steps

### Option 1: Deploy to Render (Recommended)

#### Prerequisites
- GitHub account with repository access
- Render account (https://render.com)
- PostgreSQL database

#### Steps:
1. **Connect GitHub Repository**
   - Go to https://dashboard.render.com
   - Click "New+" → "Web Service"
   - Connect your GitHub repository

2. **Configure Frontend Service**
   - Name: `alem-crm-frontend`
   - Build Command: `cd frontend && npm install && npm run build`
   - Start Command: `cd frontend && npm run start`
   - Environment Variables:
     - `NODE_ENV`: production
     - `NEXT_PUBLIC_API_URL`: `https://alem-crm-backend.onrender.com`

3. **Configure Backend Service**
   - Name: `alem-crm-backend`
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm run start:prod`
   - Environment Variables:
     - `NODE_ENV`: production
     - `DATABASE_URL`: (provided by Render PostgreSQL)
     - `JWT_SECRET`: (set a secure secret)
     - `PORT`: 3001

4. **Create PostgreSQL Database**
   - In Render dashboard, create a new PostgreSQL database
   - Link it to the backend service
   - Run migrations if needed

5. **Deploy**
   - Push changes to main branch
   - Render will automatically build and deploy

### Option 2: Docker Deployment

#### Prerequisites
- Docker and Docker Compose installed
- Cloud hosting (AWS, DigitalOcean, Linode, etc.)

#### Steps:
1. Build Docker images
   ```bash
   docker-compose build
   ```

2. Push to Docker registry (optional)
   ```bash
   docker tag alem-crm-frontend:latest yourusername/alem-crm-frontend:latest
   docker push yourusername/alem-crm-frontend:latest
   ```

3. Deploy to your server
   ```bash
   docker-compose up -d
   ```

### Option 3: Traditional Server Deployment

#### Prerequisites
- Node.js 18+ installed
- PostgreSQL database
- Nginx or Apache reverse proxy

#### Steps:
1. **Clone repository** on your server
   ```bash
   git clone https://github.com/miliyee/Alem-Treding.git
   cd Alem-Treding
   ```

2. **Install dependencies**
   ```bash
   cd frontend && npm install && npm run build
   cd ../backend && npm install && npm run build
   ```

3. **Configure environment**
   - Create `.env` files with production settings
   - Set DATABASE_URL, JWT_SECRET, etc.

4. **Run migrations** (if needed)
   ```bash
   cd backend
   npm run typeorm -- migration:run
   ```

5. **Start services**
   ```bash
   # Frontend
   cd frontend && npm run start &
   
   # Backend
   cd backend && npm run start:prod &
   ```

6. **Configure reverse proxy** (Nginx example)
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
       }
       
       location /api {
           proxy_pass http://localhost:3001;
       }
   }
   ```

## Post-Deployment Verification

### Testing Navigation
1. **Admin Section**
   - Login as admin user
   - Verify all 6 buttons appear: Dashboard, Chat, Customers, Payments, Requests, Approvals
   - Click each button and confirm navigation works
   - Verify blue (#1B4FA5) top border on active button

2. **Sales Section**
   - Login as sales user
   - Verify exactly 5 buttons appear: Sales, Dashboard, Customers, Requests, Chat
   - Confirm green (#059669) top border on active button
   - Verify navigation stays within sales section (no cross-contamination)

3. **Role-Based Isolation**
   - Confirm admin users cannot access /sales/* routes
   - Confirm sales users cannot access /admin/* routes
   - Verify proper layout applied to each section

### API Verification
```bash
# Test backend health
curl https://alem-crm-backend.onrender.com/api/health

# Test authentication
curl -X POST https://alem-crm-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alemtrading.com","password":"password"}'
```

## Environment Variables Reference

### Frontend
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://alem-crm-backend.onrender.com
PORT=3000
```

### Backend
```
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/alem_crm
JWT_SECRET=your-secure-secret-key-here
JWT_EXPIRATION=7d
PORT=3001
LOG_LEVEL=info
CORS_ORIGIN=https://alem-crm-frontend.onrender.com
```

## Monitoring & Maintenance

- Monitor Render dashboard for deployment status
- Check logs for errors: `Render → Service → Logs`
- Set up email notifications for build failures
- Regular database backups (configure in Render)
- Monitor performance metrics

## Rollback Procedure

If deployment fails:
1. Go to Render dashboard
2. Select the service
3. Click "Manual Deploy" and select previous successful commit
4. Or use: `git revert <commit-hash>` and push new changes

## Support & Troubleshooting

### Common Issues

**504 Gateway Timeout**
- Check backend service is running: `Render → Backend Service → Logs`
- Verify DATABASE_URL is correct
- Check if migrations completed

**CORS Errors**
- Verify `CORS_ORIGIN` matches frontend URL
- Check backend CORS configuration

**Database Connection Failed**
- Verify DATABASE_URL in backend environment variables
- Confirm PostgreSQL service is running
- Check database credentials

**White Blank Page**
- Check frontend logs: `Render → Frontend Service → Logs`
- Verify NEXT_PUBLIC_API_URL is correct and backend is running
- Clear browser cache (Ctrl+Shift+Delete)

## Git Push to Production

```bash
# Check status
git status

# Stage changes
git add .

# Commit with message
git commit -m "Deploy with updated navigation layout"

# Push to main (triggers automatic deployment)
git push origin main
```

## Done!
Your Alem CRM System is now deployed with professional navigation:
- ✅ Admin section: 6 blue navigation buttons
- ✅ Sales section: 5 green navigation buttons
- ✅ Proper role-based separation
- ✅ Mobile-first responsive design
- ✅ Production-ready hosting

For questions or support, refer to the project documentation.
