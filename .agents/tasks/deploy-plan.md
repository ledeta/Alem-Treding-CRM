# Render Deployment Plan - Alem Trading CRM

## Executive Summary

The Alem Trading CRM system is a full-stack TypeScript application with Next.js 14 frontend and NestJS backend, currently configured for Render deployment. A `render.yaml` file exists but is incomplete. The backend includes PostgreSQL support with DATABASE_URL parsing and SSL configuration for production.

---

## Backend Configuration

### Build & Start Commands
- **Build Command**: `npm run build` (runs `npx nest build`)
- **Start Command**: `npm run start:prod` (runs `node dist/main`)
- **Node Version**: 20 (Alpine in Dockerfile)
- **Port**: 3001 (configurable via PORT env var)
- **Framework**: NestJS 10.0.0

### Backend Dependencies
- **Database ORM**: TypeORM 0.3.17 with PostgreSQL driver (pg 8.11.0)
- **Alternative**: Mongoose 10.0.0 for MongoDB (if MONGODB_URI provided)
- **Authentication**: @nestjs/jwt 10.0.0, passport-jwt 4.0.1
- **Security**: helmet 8.3.0, @nestjs/throttler 5.0.0, argon2 0.31.2
- **Real-time**: @nestjs/websockets 10.0.0, socket.io 4.6.0

### Dockerfile
**Location**: `backend/Dockerfile`
**Strategy**: Multi-stage build (builder + production)
- Builder stage: Installs all deps, runs `npm run build`
- Production stage: Only production deps, copies built `dist/` folder
- Non-root user: `nestjs` (uid 1001)
- Health check: `http://localhost:3001/api/health` (30s interval)
- Entrypoint: Uses `dumb-init` for proper signal handling

---

## Frontend Configuration

### Build & Start Commands
- **Build Command**: `npm run build` (runs `next build`)
- **Start Command**: `npm run start` (runs `next start`)
- **Node Version**: 20 (Alpine in Dockerfile)
- **Port**: 3000 (hardcoded in Dockerfile ENV)
- **Framework**: Next.js 14.2.18

### Frontend Dependencies
- **React**: 18.2.0
- **State Management**: zustand 4.4.1, jotai 2.6.0, @tanstack/react-query 5.25.0
- **UI**: Radix UI components, Tailwind CSS 3.4.1, lucide-react 0.294.0
- **API Client**: axios 1.6.5
- **Real-time**: socket.io-client 4.7.2

### Dockerfile
**Location**: `frontend/Dockerfile`
**Strategy**: Multi-stage build (builder + production)
- Builder stage: Installs all deps, runs `npm run build`, creates `.next` folder
- Production stage: Only production deps, copies `.next` and `public` folders
- Non-root user: `nextjs` (uid 1001)
- Health check: `http://localhost:3000` (30s interval)
- Environment: `PORT=3000`, `NODE_ENV=production`

---

## Environment Variables

### Backend - Mandatory Variables

| Variable | Purpose | Example | Notes |
|----------|---------|---------|-------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/alem_crm` | Render provides this automatically from database service |
| `JWT_SECRET` | JWT signing key | `your_super_secret_jwt_key_min_32_chars` | Must be 32+ chars, keep secret |
| `NODE_ENV` | Environment flag | `production` | Controls logging, CORS, SSL |
| `PORT` | Server port | `3001` | Render assigns dynamically if omitted |

### Backend - Optional Variables

| Variable | Purpose | Default | Notes |
|----------|---------|---------|-------|
| `CORS_ORIGIN` | Allowed frontend origin | `*` (wide open) | Currently set to allow all origins in main.ts |
| `JWT_EXPIRES_IN` | JWT token lifespan | `24h` | Can use `7d`, `30d` etc |
| `DB_SYNCHRONIZE` | Auto-sync schema | `true` | Set to `false` in production after initial setup |
| `DB_LOGGING` | SQL query logging | `false` | Useful for debugging |
| `RATE_LIMIT_MAX_REQUESTS` | Throttle limit | `100` | Requests per minute |
| `SESSION_SECRET` | Session signing key | (none) | For session-based auth if used |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS` | Email sending | (none) | Optional email notifications |
| `REDIS_URL` | Redis cache | (none) | Optional caching layer |
| `SENTRY_DSN` | Error tracking | (none) | Optional monitoring |
| `ENABLE_EMAIL_NOTIFICATIONS` | Feature flag | `true` | Toggle email feature |
| `ENABLE_AUDIT_LOGS` | Feature flag | `true` | Toggle audit logging |

### Frontend - Mandatory Variables

| Variable | Purpose | Example | Notes |
|----------|---------|---------|-------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://alem-crm-backend.onrender.com` | Must include protocol, no trailing slash |
| `NODE_ENV` | Environment flag | `production` | Next.js optimization |

### Frontend - Optional Variables

| Variable | Purpose | Default | Notes |
|----------|---------|---------|-------|
| `PORT` | Server port | `3000` | Render assigns dynamically |

---

## Database Configuration (PostgreSQL)

### DATABASE_URL Parsing

**Location**: `backend/src/app.module.ts` lines 54-76

The backend parses Render's `DATABASE_URL` automatically:

```typescript
function getDbConfig() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (databaseUrl) {
    // PRODUCTION: Parse Render DATABASE_URL
    // Format: postgresql://user:password@host:port/database
    const url = new URL(databaseUrl);
    return {
      type: 'postgres',
      host: url.hostname,
      port: parseInt(url.port || '5432'),
      username: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading '/'
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
      synchronize: true,
      logging: process.env.NODE_ENV !== 'production',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  }
  
  // DEVELOPMENT: Use individual env vars
  return { /* individual DB_HOST, DB_PORT, etc */ };
}
```

### SSL Configuration

**Status**: ✅ **Already Present**

- **SSL Enabled**: When `NODE_ENV=production`
- **Configuration**: `{ rejectUnauthorized: false }`
- **Reason**: Render PostgreSQL requires SSL but uses self-signed certificates
- **Location**: `app.module.ts` line 70

### Database Synchronize

**Current Setting**: `synchronize: true` (line 68)

**⚠️ Risk**: Auto-sync can cause data loss in production if schema changes unexpectedly

**Recommendation**: 
- Keep `synchronize: true` for initial deployment (creates tables automatically)
- After deployment stabilizes, set to `false` and use migrations (`npm run migration:generate`, `npm run migration:run`)

---

## CORS Configuration

### Current Setup (Very Permissive)

**Location**: `backend/src/main.ts` lines 21-38

The backend has **TWO layers of CORS configuration**:

1. **Raw Express Middleware** (lines 21-34):
   - `Access-Control-Allow-Origin: *` (allows ALL origins)
   - Methods: GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS
   - Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization
   - Handles preflight OPTIONS requests

2. **NestJS CORS** (lines 36-42):
   - `origin: '*'`
   - `credentials: false`
   - Same methods and headers as above

### Security Note

**Current State**: Wide open - any website can call the API

**Production Recommendation**: Restrict to specific frontend domain:
```typescript
res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'https://alem-crm-frontend.onrender.com');
```

**Why It's Open**: Comment on line 18 says "ULTIMATE CORS FIX - NO HELMET, NO CSRF, JUST CORS" - suggests past CORS issues led to this permissive approach

---

## Health Endpoint

### Endpoint Details

**Path**: `/api/health` (with global prefix)
**Full URL**: `https://your-backend.onrender.com/api/health`
**Controller**: `backend/src/modules/health/health.controller.ts`
**Authentication**: Public (no JWT required - uses `@Public()` decorator)

### Response Format

```json
{
  "status": "ok",
  "timestamp": "2025-01-13T12:34:56.789Z",
  "uptime": 123.456,
  "environment": "production"
}
```

### Additional Diagnostic Endpoint

**Path**: `/api/health/diagnose`
**Response**:
```json
{
  "status": "ok",
  "message": "Backend is working",
  "timestamp": "2025-01-13T12:34:56.789Z",
  "environment": "production",
  "port": "3001",
  "nodeVersion": "v20.x.x",
  "database": "Configured (Render)"
}
```

---

## Existing render.yaml Analysis

### Current Configuration

**Location**: `c:\Users\Milion's\Desktop\Alem-Treding-main\render.yaml`

```yaml
services:
  - type: web
    name: alem-crm-frontend
    dockerfilePath: ./frontend/Dockerfile
    envVars:
      - key: NODE_ENV
        value: production
      - key: NEXT_PUBLIC_API_URL
        value: "https://alem-crm-backend.onrender.com"

  - type: web
    name: alem-crm-backend
    dockerfilePath: ./backend/Dockerfile
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: alem-crm-db
          property: connectionString
      - key: JWT_SECRET
        sync: false
      - key: PORT
        value: "3001"

  - type: postgresql
    name: alem-crm-db
```

### Issues & Gaps in Existing render.yaml

1. **❌ Missing Health Check Path**: Backend service doesn't specify `healthCheckPath: /api/health`
2. **❌ Missing Build/Start Commands**: Render will auto-detect from Dockerfile CMD, but explicit commands are clearer
3. **❌ No Database Plan**: PostgreSQL service doesn't specify `plan` (defaults to free starter)
4. **❌ No Database Name/User**: PostgreSQL service doesn't specify `databaseName` or `databaseUser`
5. **⚠️ JWT_SECRET Sync**: `sync: false` means it won't be synced from Render dashboard - must be set manually as secret
6. **⚠️ Hardcoded URLs**: Frontend references `alem-crm-backend.onrender.com` - will only work if backend is named exactly this
7. **❌ Missing CORS_ORIGIN**: Backend doesn't have CORS_ORIGIN set (currently allows all origins)
8. **❌ No Region Specified**: Services will deploy to default region (may cause latency)
9. **❌ Missing Optional Env Vars**: No DB_SYNCHRONIZE, RATE_LIMIT, feature flags, etc.

---

## Deployment Risks & Mitigations

### High Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| **JWT_SECRET not set** | Authentication will fail | Must manually add as secret env var in Render dashboard before deploy |
| **Database synchronize=true** | Potential data loss on schema changes | Monitor first deployment closely; switch to migrations after stable |
| **CORS allows all origins** | Security vulnerability | Add CORS_ORIGIN env var restricting to frontend domain |

### Medium Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| **No health check configured** | Render won't know if service is healthy | Add `healthCheckPath: /api/health` to backend service |
| **Hardcoded backend URL** | Frontend breaks if backend name changes | Use environment variable or Render's internal URL |
| **No database backups specified** | Data loss risk | Verify Render's backup policy for chosen plan |

### Low Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| **No rate limiting configured** | Potential abuse | Backend has default 100 req/min, can adjust via RATE_LIMIT env var |
| **Email/Redis not configured** | Features won't work | Optional features; can add later if needed |
| **No monitoring/logging** | Hard to debug issues | Consider adding Sentry DSN or Render's built-in logs |

---

## MongoDB Alternative (Currently Unused)

The backend supports MongoDB as an alternative to PostgreSQL:

**Trigger**: Set `MONGODB_URI` environment variable
**Logic**: `app.module.ts` lines 34-36 checks for `MONGODB_URI`
**If present**: Uses Mongoose instead of TypeORM
**Current State**: Not configured in render.yaml, system expects PostgreSQL

**Note**: This is a fallback option. For Render deployment, PostgreSQL is the primary database.

---

## Deployment Checklist

### Pre-Deployment (Local Testing)

- [ ] Backend builds successfully: `cd backend && npm run build`
- [ ] Frontend builds successfully: `cd frontend && npm run build`
- [ ] Backend starts: `npm run start:prod` (with local DATABASE_URL)
- [ ] Frontend starts: `npm start` (with NEXT_PUBLIC_API_URL set)
- [ ] Health endpoint accessible: `curl http://localhost:3001/api/health`
- [ ] Login works with admin credentials
- [ ] Database tables created (check PostgreSQL with `\dt`)

### Render Setup

- [ ] Create Render account at https://dashboard.render.com
- [ ] Connect GitHub repository (miliyee/Alem-Treding)
- [ ] Generate JWT_SECRET (32+ random characters)
- [ ] Prepare CORS_ORIGIN value (will be frontend URL)

### Deployment Steps

- [ ] Create PostgreSQL database service first
  - Name: `alem-crm-db`
  - Plan: Choose appropriate plan (free starter or paid)
  - Region: Choose nearest to users
  - Note the internal database URL

- [ ] Create backend web service
  - Name: `alem-crm-backend`
  - Dockerfile path: `./backend/Dockerfile`
  - Add environment variables (see "Environment Variables" section)
  - **Critical**: Add JWT_SECRET as secret
  - Set DATABASE_URL from database service
  - Add health check path: `/api/health`
  - Wait for deployment to complete
  - Note the deployed URL

- [ ] Create frontend web service
  - Name: `alem-crm-frontend`
  - Dockerfile path: `./frontend/Dockerfile`
  - Set NEXT_PUBLIC_API_URL to backend URL from previous step
  - Wait for deployment to complete

### Post-Deployment Verification

- [ ] Backend health check returns 200: `curl https://your-backend.onrender.com/api/health`
- [ ] Frontend loads: Visit `https://your-frontend.onrender.com`
- [ ] Login works (test admin and sales users)
- [ ] Admin navigation: 6 blue buttons visible
- [ ] Sales navigation: 5 green buttons visible
- [ ] API calls work (check browser console for errors)
- [ ] Database persists data (create/read/update/delete operations)
- [ ] WebSocket connections work (real-time features)
- [ ] Check Render logs for any errors or warnings

---

## Service URLs & Naming

### Expected Service Names (from render.yaml)

- **Frontend**: `alem-crm-frontend` → `https://alem-crm-frontend.onrender.com`
- **Backend**: `alem-crm-backend` → `https://alem-crm-backend.onrender.com`
- **Database**: `alem-crm-db` (internal only)

### Internal Communication

Render provides internal hostnames for service-to-service communication:
- Format: `service-name:port`
- Example: Backend could use `alem-crm-db:5432` internally
- Database URL is provided automatically via `DATABASE_URL`

---

## Migration Strategy

### Initial Deployment (Current State)

- `synchronize: true` - TypeORM auto-creates tables
- No migrations needed
- Fast deployment
- ⚠️ Risk: Schema changes can cause data loss

### Post-Stabilization (Recommended)

1. Set `DB_SYNCHRONIZE=false` environment variable
2. Generate migrations for schema changes:
   ```bash
   npm run migration:generate -- -n DescriptiveNameOfChange
   ```
3. Run migrations on deployment:
   ```bash
   npm run migration:run
   ```
4. Add migration:run to deployment process (optional build hook)

---

## Monitoring & Debugging

### Render Built-in Tools

- **Logs**: Real-time logs in Render dashboard for each service
- **Metrics**: CPU, memory, request rate
- **Shell Access**: Web-based shell to running containers
- **Environment Variables**: Edit without redeployment

### Health Monitoring

- Backend health check: `https://your-backend.onrender.com/api/health`
- Backend diagnostics: `https://your-backend.onrender.com/api/health/diagnose`
- Frontend health: `https://your-frontend.onrender.com` (returns 200 if healthy)

### Common Debug Steps

1. Check Render logs for errors
2. Verify all environment variables are set
3. Test database connection: Check `health/diagnose` endpoint
4. Test CORS: Check browser console for CORS errors
5. Test authentication: Try login with known credentials
6. Check database tables exist: Use Render's database shell

---

## Cost Estimation (Render)

### Free Tier
- ✅ 750 hours/month free web services
- ✅ 90-day PostgreSQL free trial
- ⚠️ Services spin down after 15 min inactivity (cold starts)

### Paid Tiers (after free trial)
- **Starter**: $7/month per service + $7/month PostgreSQL = $21/month total
- **Standard**: $25/month per service + $20/month PostgreSQL = $70/month total
- **Pro**: $85/month per service + custom database = $170+/month total

### Recommendation
Start with free tier, monitor usage, upgrade when:
- Cold starts become problematic
- Need better performance
- Free PostgreSQL trial expires

---

## Next Steps After Deployment

1. **Security Hardening**
   - Restrict CORS to specific frontend origin
   - Rotate JWT_SECRET periodically
   - Enable 2FA for admin accounts (module already exists)
   - Review rate limiting settings

2. **Performance Optimization**
   - Enable Redis caching (module already exists)
   - Monitor slow queries
   - Add database indexes if needed
   - Consider CDN for static assets

3. **Monitoring Setup**
   - Add Sentry for error tracking
   - Set up uptime monitoring
   - Configure alerting for critical errors
   - Monitor database size and performance

4. **Backup Strategy**
   - Verify Render's automatic backups
   - Test restore procedure
   - Consider additional backup solution for critical data
   - Document backup/restore process

5. **Feature Configuration**
   - Configure email (if using notifications)
   - Set up payment gateway (if using Stripe)
   - Configure AWS S3 (if using file storage)
   - Enable audit logs for compliance

---

## Alternative Deployment Platforms

If Render doesn't meet requirements, these alternatives are compatible:

### Railway
- Similar to Render, GitHub integration
- Dockerfile support ✅
- Generous free tier
- DATABASE_URL provided automatically

### Fly.io
- Dockerfile-native platform
- Multiple regions easily
- Requires `fly.toml` instead of `render.yaml`

### DigitalOcean App Platform
- Dockerfile support ✅
- Managed PostgreSQL ✅
- Similar pricing to Render

### AWS/GCP/Azure
- Maximum control and scalability
- More complex setup (ECS, Cloud Run, App Service)
- Higher cost but enterprise features

All platforms will work with existing Dockerfiles - only configuration format differs.

---

## Summary

**✅ Ready to Deploy**: The application has all necessary configuration for Render deployment.

**⚠️ Must Do Before Deploy**:
1. Generate and set JWT_SECRET as secret environment variable
2. Update render.yaml to add health check path
3. Decide on CORS restriction (add CORS_ORIGIN env var)

**📋 Deployment Confidence**: High
- Dockerfiles are production-ready
- Database parsing handles Render's format
- SSL configuration is correct
- Health endpoints exist and work
- Existing render.yaml provides good foundation

**⏱️ Estimated Deployment Time**: 20-30 minutes
- 5 min: Render account setup
- 10 min: Service configuration
- 10 min: Build and deployment
- 5 min: Testing and verification
