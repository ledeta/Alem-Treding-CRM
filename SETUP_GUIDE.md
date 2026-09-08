# ALEM CRM System - Setup Guide

Complete step-by-step guide to set up and run the ALEM CRM System.

## 📋 System Requirements

### Minimum Requirements
- **CPU:** 2 cores
- **RAM:** 4GB
- **Storage:** 20GB
- **OS:** Windows 10+, macOS 10.15+, Ubuntu 20.04+

### Recommended Requirements
- **CPU:** 4 cores
- **RAM:** 8GB
- **Storage:** 50GB SSD
- **OS:** Ubuntu 20.04+ or Windows Server 2019+

## 🔧 Prerequisites Installation

### Windows

#### 1. Install Git
```bash
# Download from https://git-scm.com/download/win
# Or use Chocolatey
choco install git
```

#### 2. Install Docker
```bash
# Download Docker Desktop from https://www.docker.com/products/docker-desktop
# Or use Chocolatey
choco install docker-desktop
```

#### 3. Install Node.js (Optional for manual setup)
```bash
# Download from https://nodejs.org/
# Or use Chocolatey
choco install nodejs
```

### macOS

```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Git
brew install git

# Install Docker
brew install docker

# Install Node.js (optional)
brew install node
```

### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install Git
sudo apt install git

# Install Docker
sudo apt install docker.io docker-compose

# Add user to docker group
sudo usermod -aG docker $USER

# Install Node.js (optional)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs
```

## 🚀 Quick Start (5 Minutes)

### 1. Clone Repository

```bash
git clone https://github.com/your-repo/alem-crm-system.git
cd alem-crm-system
```

### 2. Setup Environment Variables

**Backend (.env):**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=alem_crm
DB_USER=alem_user
DB_PASSWORD=ChangeMe123!
JWT_SECRET=generate-a-random-secret-here
JWT_REFRESH_SECRET=generate-another-random-secret
NODE_ENV=development
```

Generate secure secrets:
```bash
# Linux/macOS
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Maximum 256)})) 
```

**Frontend (.env.local):**
```bash
cd ../frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Start Services

```bash
# From root directory
docker-compose up -d
```

Wait for services to start (30-60 seconds):

```bash
# Check status
docker-compose ps
```

Expected output:
```
NAME                    STATUS
alem-crm-postgres       Up (healthy)
alem-crm-redis          Up (healthy)
alem-crm-backend        Up
alem-crm-frontend       Up
alem-crm-nginx          Up
```

### 4. Access Application

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000
- **API Documentation:** http://localhost:3000/api/docs

### 5. Default Login Credentials

**Admin Account** (Create on first run):
```
Username: admin
Password: Admin123!
```

**Sales User Account** (Optional):
```
Username: sales
Password: Sales123!
```

## 📚 Detailed Setup Steps

### Step 1: Database Initialization

The database is automatically initialized when PostgreSQL starts. To verify:

```bash
# Connect to database
docker-compose exec postgres psql -U alem_user -d alem_crm

# List tables
\dt

# Exit
\q
```

### Step 2: Backend Setup (Manual)

```bash
cd backend

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start development server
npm run start:dev
```

Expected output:
```
🚀 Server running on http://localhost:3000
📚 API Documentation on http://localhost:3000/api/docs
```

### Step 3: Frontend Setup (Manual)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Expected output:
```
▲ Next.js 15.0.0
- Local: http://localhost:3001
```

### Step 4: Create Admin Account

Via API:
```bash
curl -X POST http://localhost:3000/api/auth/admin/setup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "fullName": "Admin User",
    "password": "Admin123!"
  }'
```

Or via database:
```bash
# Access database
docker-compose exec postgres psql -U alem_user -d alem_crm

# Insert admin role (if not exists)
INSERT INTO roles (name, description) 
VALUES ('Admin', 'Administrator with full system access')
ON CONFLICT DO NOTHING;

# Exit
\q
```

## 🧪 Verification

### Health Checks

```bash
# Backend API
curl http://localhost:3000/api/health

# Frontend
curl http://localhost:3001

# Database
docker-compose exec postgres pg_isready -U alem_user

# Redis
docker-compose exec redis redis-cli ping
```

### Test Login

```bash
# Request login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123!"
  }'

# You should receive a response with accessToken
```

## 🐛 Troubleshooting

### Services Won't Start

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Restart services
docker-compose restart

# Full rebuild
docker-compose down -v
docker-compose up -d
```

### Database Connection Error

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U alem_user -d alem_crm -c "SELECT 1;"

# Check network
docker network inspect alem-crm_alem-network
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000     # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>     # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in docker-compose.yml
```

### Out of Disk Space

```bash
# Clean Docker resources
docker system prune -a

# Remove containers
docker-compose down -v

# Free up space, then restart
docker-compose up -d
```

## 📦 File Structure

After setup, your directory structure should look like:

```
alem-crm-system/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── customers/
│   │   │   ├── items/
│   │   │   ├── payments/
│   │   │   ├── uploads/
│   │   │   ├── chat/
│   │   │   └── ...
│   │   ├── main.ts
│   │   └── app.module.ts
│   ├── .env
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   └── ...
│   ├── .env.local
│   ├── Dockerfile
│   └── package.json
├── database/
│   └── schema.sql
├── nginx/
│   └── conf.d/
├── docker-compose.yml
├── README.md
├── ARCHITECTURE.md
├── API_DOCUMENTATION.md
└── DEPLOYMENT.md
```

## 🔐 Security Setup

### Generate JWT Secrets

```bash
# Generate strong random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `.env`:
```env
JWT_SECRET=your-generated-secret-here
JWT_REFRESH_SECRET=your-generated-secret-here
DB_PASSWORD=YourStrongPassword123!
```

### Setup SSL/TLS (Optional)

See `DEPLOYMENT.md` for SSL setup with Let's Encrypt.

## 📊 Initial Data Setup

### Create Sample Data

```bash
# Via API (after login)
curl -X POST http://localhost:3000/api/customers \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sample Customer",
    "phone": "+251911234567",
    "address": "Addis Ababa, Ethiopia"
  }'
```

### Import Data from Excel

1. Login to frontend
2. Go to "Upload File" section
3. Select Excel file
4. Click upload
5. Wait for processing

## 🚦 Development Workflow

### Start Development

```bash
# Terminal 1: Database & Cache
docker-compose up postgres redis

# Terminal 2: Backend
cd backend
npm run start:dev

# Terminal 3: Frontend
cd frontend
npm run dev
```

### Make Changes

- **Backend:** Changes in `backend/src` auto-reload
- **Frontend:** Changes in `frontend/src` hot-reload

### Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# All tests
docker-compose exec backend npm test
docker-compose exec frontend npm test
```

## 📚 Next Steps

1. **Read Architecture:** See `ARCHITECTURE.md` for system design
2. **API Reference:** See `API_DOCUMENTATION.md` for all endpoints
3. **Deployment:** See `DEPLOYMENT.md` for production setup
4. **Development:** Start developing with your team

## 💡 Tips & Best Practices

### Development Tips
- Use Postman/Insomnia for API testing
- Check logs frequently: `docker-compose logs -f`
- Clear browser cache when frontend doesn't update
- Use VS Code extensions for debugging

### Performance Tips
- Enable Redis caching in production
- Use pagination for large datasets
- Monitor database with `EXPLAIN ANALYZE`
- Profile frontend performance with Chrome DevTools

### Security Tips
- Never commit `.env` files
- Rotate JWT secrets regularly
- Use strong passwords
- Enable HTTPS in production
- Regular backups recommended

## 🆘 Getting Help

### Common Issues

1. **Can't connect to database**
   - Check `DB_HOST` is set to `postgres`
   - Verify PostgreSQL is running: `docker-compose ps postgres`

2. **Frontend won't build**
   - Clear node_modules: `rm -rf frontend/node_modules && npm install`
   - Check Node version: `node --version` (should be 20.x)

3. **Port conflicts**
   - Change ports in `docker-compose.yml`
   - Or kill process using the port

### Support Resources
- GitHub Issues: https://github.com/your-repo/alem-crm-system/issues
- Documentation: See `README.md` and `*.md` files
- Community Slack: [Your community link]

## 🎉 Completed!

Your ALEM CRM System is now ready for development!

Next: 
1. Create your admin account
2. Upload sample Excel data
3. Test the complete workflow
4. Customize for your business needs

For production deployment, refer to `DEPLOYMENT.md`.
