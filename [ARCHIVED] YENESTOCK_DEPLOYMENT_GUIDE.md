# 🚀 YeneStock Deployment Guide

**Version**: 1.0.0  
**Date**: July 28, 2026  
**Environments**: Local → Staging → Production

---

## 📋 Pre-Deployment Checklist

### Code Readiness
- [ ] All tests passing (unit, integration, frontend)
- [ ] No console errors or warnings
- [ ] TypeScript compilation successful
- [ ] Code review completed
- [ ] Version number updated
- [ ] Changelog updated

### Infrastructure
- [ ] PostgreSQL database accessible
- [ ] Database backups created
- [ ] Environment variables prepared
- [ ] SSL certificates valid (prod)
- [ ] Firewall rules configured
- [ ] Load balancer configured (if applicable)

### Documentation
- [ ] API documentation updated
- [ ] User guides reviewed
- [ ] Deployment notes prepared
- [ ] Rollback procedures documented
- [ ] Support team briefed

---

## 🔧 Local Development Deployment

### Step 1: Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Set environment variables
cp .env.example .env
# Edit .env with local values:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=postgres
# DB_NAME=alem_crm
# JWT_SECRET=your_secret_key

# 4. Run database migrations
npm run typeorm migration:run

# 5. Start backend development server
npm run start:dev

# Expected output:
# [Nest] 12345 - 01/15/2024, 10:30:00 AM LOG [NestFactory] 
# Starting Nest application...
# [Nest] 12345 - 01/15/2024, 10:30:02 AM LOG [InstanceLoader] 
# YeneStockModule dependencies initialized
```

### Step 2: Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Set environment variables
cp .env.local.example .env.local
# Edit .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:3001

# 4. Start development server
npm run dev

# Expected output:
# ▲ Next.js 14.x.x
# - Local:        http://localhost:3000
# ○ Listening on port 3000
```

### Step 3: Verify Deployment

```bash
# Check backend
curl http://localhost:3001/health

# Check frontend
curl http://localhost:3000

# Try creating location
curl -X POST http://localhost:3001/yenestock/locations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"WH001","warehouseName":"Test","city":"Addis"}'
```

---

## 🌐 Staging Deployment (Render)

### Step 1: Prepare Backend for Staging

```bash
# 1. Build backend
cd backend
npm run build

# 2. Verify build
ls -la dist/

# 3. Create .env.staging
cp .env .env.staging
# Update with staging values:
# DB_HOST=staging-db.render.com
# DB_PORT=5432
# DB_USER=staging_user
# DB_PASSWORD=staging_password
# DB_NAME=alem_crm_staging
# NODE_ENV=staging
```

### Step 2: Deploy Backend to Render

```bash
# 1. Create Render service (if not exists)
# Go to https://render.com
# Create new Web Service
# Repository: your-repo
# Root Directory: backend
# Build Command: npm install && npm run build
# Start Command: npm run start:prod
# Environment: Node.js

# 2. Set environment variables in Render
# PORT=3001
# NODE_ENV=staging
# DATABASE_URL=postgresql://user:pass@host:5432/dbname
# JWT_SECRET=your_staging_secret

# 3. Deploy
# Push to staging branch: git push origin staging
# Render auto-deploys

# 4. Verify deployment
curl https://your-app-staging.onrender.com/health
```

### Step 3: Deploy Frontend to Render

```bash
# 1. Build frontend
cd frontend
npm run build

# 2. Export for static hosting
npm run export

# 3. Create Render service for frontend
# Root Directory: frontend
# Build Command: npm install && npm run build
# Start Command: npm start
# Environment: Node.js

# 4. Set environment variables
# NEXT_PUBLIC_API_URL=https://your-app-staging-backend.onrender.com

# 5. Deploy
# git push origin staging
```

### Step 4: Database Setup (Staging)

```bash
# 1. Connect to staging database
psql -h staging-db.render.com -U staging_user -d alem_crm_staging

# 2. Run migrations
npm run typeorm migration:run -- --database staging

# 3. Seed data (optional)
psql -h staging-db.render.com -U staging_user -d alem_crm_staging < SEED_DATABASE.sql

# 4. Verify tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'yenestock%';
```

### Step 5: Test Staging

```bash
# Test API endpoints
curl https://your-app-staging-backend.onrender.com/yenestock/analytics/summary \
  -H "Authorization: Bearer $STAGING_TOKEN"

# Test frontend
open https://your-app-staging.onrender.com

# Login and verify:
# - Navigate to YeneStock
# - Create test location
# - Generate test report
```

---

## 🏭 Production Deployment

### ⚠️ Pre-Production Verification

```bash
# 1. Staging tests passed
# 2. Performance benchmarks acceptable
# 3. Security review completed
# 4. Disaster recovery plan in place
# 5. Rollback procedure tested
# 6. Team sign-off obtained
```

### Step 1: Production Database Backup

```bash
# Create full backup before deployment
pg_dump -h production-db.onrender.com \
  -U production_user \
  -d alem_crm_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
du -sh backup_*.sql

# Store backup securely
# Upload to S3 or backup service
```

### Step 2: Deploy Backend to Production

```bash
# 1. Tag release version
git tag -a v1.0.0 -m "YeneStock Production Release"
git push origin v1.0.0

# 2. Set production environment variables
# PORT=3001
# NODE_ENV=production
# DATABASE_URL=postgresql://prod_user:password@prod-db:5432/alem_crm
# JWT_SECRET=production_secret_key
# LOG_LEVEL=info

# 3. Deploy to Render production service
# Render deploys automatically on tag
# Monitor deployment: https://render.com/dashboard

# 4. Verify backend online
curl https://alem-treding-backend.onrender.com/health
```

### Step 3: Deploy Frontend to Production

```bash
# 1. Update version number
vim frontend/package.json  # Update version to 1.0.0

# 2. Build production
cd frontend
npm run build
npm run export

# 3. Deploy to production
# Render deploys automatically
# Monitor: https://render.com/dashboard

# 4. Verify frontend online
curl https://alem-trading.onrender.com
```

### Step 4: Production Database Migration

```bash
# 1. Connect to production database
psql -h production-db.onrender.com \
  -U production_user \
  -d alem_crm_prod

# 2. Run migrations
npm run typeorm migration:run -- --database production

# 3. Create required tables if not exists
-- Create yenestock_stock table
CREATE TABLE IF NOT EXISTS yenestock_stock (
  id SERIAL PRIMARY KEY,
  itemId INTEGER NOT NULL,
  locationId INTEGER NOT NULL,
  currentQuantity DECIMAL(15,2) DEFAULT 0,
  minimumLevel DECIMAL(15,2) DEFAULT 0,
  maximumLevel DECIMAL(15,2) DEFAULT 0,
  reorderPoint DECIMAL(15,2) DEFAULT 0,
  warehouseCode VARCHAR,
  batchNumber VARCHAR,
  expiryDate TIMESTAMP,
  isExpired BOOLEAN DEFAULT FALSE,
  hasAlert BOOLEAN DEFAULT FALSE,
  lowStockAlertCount INTEGER DEFAULT 0,
  lastRestocked TIMESTAMP,
  notes TEXT,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(itemId, locationId)
);

-- Create yenestock_locations table
CREATE TABLE IF NOT EXISTS yenestock_locations (
  id SERIAL PRIMARY KEY,
  code VARCHAR UNIQUE NOT NULL,
  warehouseName VARCHAR NOT NULL,
  address VARCHAR,
  city VARCHAR,
  country VARCHAR,
  isMainWarehouse BOOLEAN DEFAULT FALSE,
  maxCapacity INTEGER DEFAULT 0,
  currentLoad INTEGER DEFAULT 0,
  managerName VARCHAR,
  managerPhone VARCHAR,
  managerEmail VARCHAR,
  description TEXT,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create yenestock_movements table
CREATE TABLE IF NOT EXISTS yenestock_movements (
  id SERIAL PRIMARY KEY,
  itemId INTEGER NOT NULL,
  locationId INTEGER NOT NULL,
  movementType VARCHAR NOT NULL,
  quantity DECIMAL(15,2),
  beforeQuantity DECIMAL(15,2),
  afterQuantity DECIMAL(15,2),
  referenceNo VARCHAR,
  fromLocationId INTEGER,
  toLocationId INTEGER,
  reason TEXT,
  createdBy INTEGER,
  approvedBy INTEGER,
  approvedAt TIMESTAMP,
  isApproved BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_yenestock_stock_itemId ON yenestock_stock(itemId);
CREATE INDEX idx_yenestock_stock_locationId ON yenestock_stock(locationId);
CREATE INDEX idx_yenestock_movements_itemId ON yenestock_movements(itemId);
CREATE INDEX idx_yenestock_movements_createdAt ON yenestock_movements(createdAt);
```

### Step 5: Production Verification

```bash
# 1. Check backend health
curl https://alem-treding-backend.onrender.com/health

# 2. Test API endpoint
curl https://alem-treding-backend.onrender.com/yenestock/analytics/summary \
  -H "Authorization: Bearer $PROD_TOKEN"

# 3. Check frontend
curl https://alem-trading.onrender.com | grep "Alem"

# 4. Monitor logs
tail -f backend_logs.txt
tail -f frontend_logs.txt

# 5. Performance check
# Load test: ab -n 100 -c 10 https://alem-treding-backend.onrender.com/health
```

---

## 🔄 Post-Deployment Tasks

### Immediate (First Hour)
```bash
# 1. Monitor error logs
# Check Render dashboard for errors
# Check browser console for frontend errors

# 2. Test core functionality
# Login as admin
# Navigate to YeneStock
# Create test warehouse
# Create test inventory
# Generate test report

# 3. Verify integrations
# Check Items module integration
# Check Transactions integration
# Check Notifications integration

# 4. Performance monitoring
# Check response times
# Check database performance
# Monitor resource usage
```

### First Day
```bash
# 1. Load testing
# Simulate typical user load
# Monitor performance metrics

# 2. User feedback
# Collect feedback from team
# Verify all features working

# 3. Documentation
# Update any deployment notes
# Document any issues
# Update runbooks

# 4. Backup verification
# Verify backups working
# Test restore procedure
```

### First Week
```bash
# 1. Performance optimization
# Analyze slow queries
# Optimize database queries
# Tune application settings

# 2. Security review
# Run security scan
# Check for vulnerabilities
# Review access logs

# 3. User training
# Conduct training sessions
# Provide documentation
# Answer questions
```

---

## 🔙 Rollback Procedures

### If Issues Detected (Before User Impact)

```bash
# 1. Immediately stop deployment
# Contact deployment team
# Stop new traffic to backend

# 2. Revert code changes
git revert HEAD
git push origin main

# 3. Wait for auto-redeploy
# Render detects new push
# Auto-deploys previous version
# Monitor health check: https://render.com/dashboard

# 4. Verify rollback complete
curl https://alem-treding-backend.onrender.com/health
# Should return status: running

# 5. Notify team
# Update status page
# Send notification
# Document issue for analysis
```

### Emergency Database Rollback

```bash
# 1. Stop application
# Go to Render dashboard
# Stop backend service
# Stop frontend service

# 2. Restore from backup
psql -h production-db.onrender.com \
  -U production_user \
  -d alem_crm_prod < backup_YYYYMMDD_HHMMSS.sql

# 3. Restart application
# Start backend service
# Start frontend service

# 4. Verify data integrity
# Check record counts
# Verify recent transactions
# Test critical flows
```

---

## 📊 Deployment Status Monitoring

### Real-time Monitoring

```bash
# Monitor backend
watch -n 2 'curl -s https://alem-treding-backend.onrender.com/health | jq .'

# Monitor frontend
watch -n 2 'curl -s https://alem-trading.onrender.com | wc -l'

# Monitor database connection
psql -h production-db.onrender.com -U production_user -d alem_crm_prod \
  -c "SELECT version();"
```

### Health Checks

```bash
# API response time
time curl https://alem-treding-backend.onrender.com/yenestock/analytics/summary

# Database response
psql -h production-db.onrender.com -U production_user -d alem_crm_prod \
  -c "SELECT COUNT(*) FROM yenestock_stock;"

# Frontend page load
curl -o /dev/null -s -w "%{time_total}\n" https://alem-trading.onrender.com
```

---

## 📝 Deployment Checklist Template

```markdown
# Deployment Checklist - YeneStock v1.0.0

## Pre-Deployment
- [ ] All tests passing
- [ ] Code review complete
- [ ] Backups created
- [ ] Team notified
- [ ] Maintenance window scheduled

## Deployment Steps
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Database migrations run
- [ ] Environment variables set
- [ ] SSL certificates verified

## Post-Deployment
- [ ] Health checks passing
- [ ] Core functionality tested
- [ ] Performance acceptable
- [ ] No error logs
- [ ] Users notified

## Sign-off
- Deployment Manager: _____________
- Date: _____________
- Time: _____________
- Status: [ ] Success [ ] Rolled back
```

---

## 🆘 Troubleshooting Common Deployment Issues

### Database Connection Failed
```bash
# Check database is running
psql -h production-db.onrender.com -U production_user -d alem_crm_prod -c "SELECT 1;"

# Check connection string
echo $DATABASE_URL

# Verify credentials
# Check .env file
# Verify database user exists
```

### Backend Won't Start
```bash
# Check logs
tail -f /var/log/backend.log

# Check dependencies
npm list --all

# Verify environment variables
env | grep DB_

# Rebuild if needed
npm run build
npm run start:prod
```

### Frontend Page Blank
```bash
# Check browser console for errors
# F12 → Console tab

# Check Network tab
# F12 → Network tab
# Look for failed requests

# Check if API is accessible
curl https://alem-treding-backend.onrender.com/health

# Check frontend logs
tail -f /var/log/frontend.log
```

### Slow Performance After Deployment
```bash
# Check database query performance
EXPLAIN ANALYZE SELECT * FROM yenestock_stock WHERE locationId = 1;

# Check indexes
SELECT * FROM pg_stat_user_indexes;

# Monitor CPU usage
top -b | head -20

# Check memory usage
free -h
```

---

## 📞 Support Contact Information

**Deployment Team**: [Your Team Email]  
**On-call Engineer**: [Phone Number]  
**Incident Channel**: [Slack Channel]  
**Status Page**: https://status.alem-trading.com

---

## 📚 Additional Resources

- [Render Deployment Docs](https://render.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Deployment Guide Version**: 1.0.0  
**Last Updated**: July 28, 2026  
**Maintained By**: DevOps Team
