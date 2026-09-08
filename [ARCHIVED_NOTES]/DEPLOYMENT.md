# ALEM CRM System - Deployment Guide

## 📋 Prerequisites

- Docker and Docker Compose installed
- Git installed
- Minimum 4GB RAM
- Minimum 20GB disk space
- Port 80, 443, 3000, 3001, 5432, 6379 available

## 🚀 Quick Start with Docker

### 1. Clone Repository
```bash
git clone <repository-url>
cd alem-crm-system
```

### 2. Configure Environment
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit the `.env` files with your configuration:

**Backend `.env`:**
```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=alem_crm
DB_USER=alem_user
DB_PASSWORD=YourSecurePassword123!

# JWT
JWT_SECRET=your-super-secret-jwt-key-generate-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-generate-this

# Server
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3001
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Start Services
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Service URLs:**
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api/docs
- Nginx Proxy: http://localhost

### 4. Initialize Database

The database schema is automatically initialized on first run. To manually initialize:

```bash
# Access PostgreSQL
docker-compose exec postgres psql -U alem_user -d alem_crm

# Run migrations (if needed)
docker-compose exec backend npm run migration:run
```

## 🛠️ Manual Setup (Without Docker)

### Prerequisites for Manual Setup
- Node.js 20.x
- PostgreSQL 16
- Redis 7

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with local database credentials
# DB_HOST=localhost
# DB_PORT=5432
# etc.

# Build
npm run build

# Start development server
npm run start:dev

# Or start production server
npm run start:prod
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Update NEXT_PUBLIC_API_URL
# NEXT_PUBLIC_API_URL=http://localhost:3000

# Development
npm run dev

# Production build
npm run build
npm start
```

## 📦 Production Deployment

### AWS Deployment

#### 1. Prepare AWS Resources

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier alem-crm-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username alem_user \
  --allocated-storage 100 \
  --publicly-accessible false

# Create ElastiCache Redis
aws elasticache create-cache-cluster \
  --cache-cluster-id alem-crm-redis \
  --cache-node-type cache.t3.micro \
  --engine redis

# Create S3 bucket
aws s3 mb s3://alem-crm-uploads-prod
```

#### 2. Deploy to ECS/Fargate

```bash
# Build Docker images
docker build -t alem-crm-backend:latest ./backend
docker build -t alem-crm-frontend:latest ./frontend

# Tag for ECR
docker tag alem-crm-backend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/alem-crm-backend:latest
docker tag alem-crm-frontend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/alem-crm-frontend:latest

# Push to ECR
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/alem-crm-backend:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/alem-crm-frontend:latest

# Create ECS task definitions and services
# (Use AWS console or CLI)
```

### DigitalOcean App Platform

```bash
# Create app.yaml
cat > app.yaml << EOF
name: alem-crm
services:
- name: backend
  github:
    repo: your-repo/alem-crm-system
    branch: main
  build_command: cd backend && npm install && npm run build
  run_command: node dist/main
  environment_slug: node-js
  envs:
  - key: DB_HOST
    value: ${db.hostname}
  - key: DB_PORT
    value: "5432"
  - key: REDIS_HOST
    value: ${redis.hostname}
  http_port: 3000
- name: frontend
  github:
    repo: your-repo/alem-crm-system
    branch: main
  build_command: cd frontend && npm install && npm run build
  run_command: npm start
  environment_slug: node-js
  envs:
  - key: NEXT_PUBLIC_API_URL
    value: https://api.yourdomain.com
  http_port: 3001
databases:
- name: postgres
  engine: PG
  version: "16"
- name: redis
  engine: REDIS
  version: "7"
EOF

# Deploy
doctl apps create --spec app.yaml
```

### Heroku Deployment

```bash
# Login to Heroku
heroku login

# Create apps
heroku create alem-crm-backend
heroku create alem-crm-frontend

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0 -a alem-crm-backend

# Add Redis addon
heroku addons:create heroku-redis:premium-0 -a alem-crm-backend

# Set environment variables
heroku config:set JWT_SECRET=your-secret -a alem-crm-backend
heroku config:set NODE_ENV=production -a alem-crm-backend

# Deploy
git push heroku main

# View logs
heroku logs --tail -a alem-crm-backend
```

## 🔒 SSL/TLS Configuration

### Using Let's Encrypt with Nginx

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d yourdomain.com -d api.yourdomain.com

# Update nginx configuration
# Copy SSL certificate paths to nginx/conf.d/default.conf
```

### Update Nginx for SSL

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Rest of configuration...
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl http://localhost:3000/api/health

# Frontend health
curl http://localhost:3001

# Database connection
docker-compose exec backend npm run typeorm -- query --q "SELECT 1"
```

### Database Backup

```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U alem_user alem_crm > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U alem_user alem_crm < backup.sql
```

### Log Management

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Save logs to file
docker-compose logs > logs.txt
```

### Performance Monitoring

```bash
# Monitor Docker containers
docker stats

# Monitor PostgreSQL
docker-compose exec postgres psql -U alem_user -d alem_crm \
  -c "SELECT pid, usename, state, query FROM pg_stat_activity;"
```

## 🔧 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL status
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U alem_user -d alem_crm -c "SELECT 1;"
```

### Backend Won't Start

```bash
# Check logs
docker-compose logs backend

# Rebuild image
docker-compose build --no-cache backend

# Restart
docker-compose restart backend
```

### Frontend Build Issues

```bash
# Clear cache
docker-compose exec frontend rm -rf .next node_modules
docker-compose exec frontend npm install
docker-compose exec frontend npm run build
```

### Redis Connection Issues

```bash
# Check Redis status
docker-compose ps redis

# Test connection
docker-compose exec redis redis-cli ping

# Monitor Redis
docker-compose exec redis redis-cli monitor
```

## 🚀 Scaling Considerations

### Horizontal Scaling

1. **Use Load Balancer:**
   - AWS ALB/NLB
   - DigitalOcean Load Balancer
   - Nginx load balancing

2. **Database Scaling:**
   - Read replicas for PostgreSQL
   - Connection pooling with PgBouncer
   - Sharding for large datasets

3. **Cache Scaling:**
   - Redis cluster
   - Redis Sentinel for HA

### Performance Tuning

1. **PostgreSQL:**
   ```sql
   -- Analyze query performance
   EXPLAIN ANALYZE SELECT * FROM customers WHERE name LIKE '%John%';
   
   -- Vacuum and analyze
   VACUUM ANALYZE;
   ```

2. **Redis:**
   ```
   # Monitor memory usage
   INFO memory
   
   # Configure eviction policy
   maxmemory-policy allkeys-lru
   ```

3. **Application:**
   - Enable query caching
   - Implement pagination
   - Use indexes effectively
   - Compress responses

## 📝 Backup & Recovery

### Automated Backups

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/alem-crm"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup database
docker-compose exec -T postgres pg_dump -U alem_user alem_crm \
  | gzip > "$BACKUP_DIR/db_$TIMESTAMP.sql.gz"

# Backup application
tar -czf "$BACKUP_DIR/app_$TIMESTAMP.tar.gz" \
  backend frontend nginx

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "*.gz" -mtime +7 -delete

echo "Backup completed: $TIMESTAMP"
EOF

# Schedule with cron (daily at 2 AM)
0 2 * * * /path/to/backup.sh
```

### Recovery Procedure

```bash
# Stop services
docker-compose down

# Restore database
docker-compose up -d postgres
sleep 10
gunzip < backup.sql.gz | docker-compose exec -T postgres \
  psql -U alem_user alem_crm

# Start remaining services
docker-compose up -d

# Verify
docker-compose logs
```

## ✅ Deployment Checklist

- [ ] Environment variables configured
- [ ] SSL/TLS certificates obtained
- [ ] Database initialized
- [ ] Redis cache configured
- [ ] S3/storage configured
- [ ] Email service configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Security audit completed
- [ ] Performance testing passed
- [ ] Capacity planning done
- [ ] Disaster recovery plan documented
