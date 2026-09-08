# ⚡ ALEM CRM - QUICK REFERENCE CARD

## 🎯 RIGHT NOW (TODAY)

### 1. Backend Security (DO THIS FIRST - 2-3 hours)
```bash
# Critical files to update:
backend/src/modules/auth/auth.service.ts          # Add Argon2 hashing
backend/src/main.ts                               # Add ThrottlerModule, CSRF
backend/src/modules/audit/audit.service.ts        # Hook everywhere
backend/src/modules/email/email.service.ts        # Configure SMTP
```

### 2. Start Frontend (IN PARALLEL)
```bash
cd frontend
npm install
npm run dev
# Open: http://localhost:3000
```

---

## 📂 PROJECT STRUCTURE

```
alem-crm-system/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/          ← Password hashing here
│   │   │   ├── audit/         ← NEW: Hook to all actions
│   │   │   ├── email/         ← NEW: Configure SMTP
│   │   │   ├── reports/       ← NEW: Export reports
│   │   │   └── ...
│   │   └── main.ts            ← Add security config
│   └── package.json           ← ✅ Dependencies updated
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/
│   │   │   │   ├── approvals/     ✅ NEW
│   │   │   │   ├── payments/      ✅ NEW
│   │   │   │   ├── credits/       ✅ NEW
│   │   │   │   ├── refunds/       ✅ NEW
│   │   │   │   ├── uploads/       ✅ NEW
│   │   │   │   ├── settings/      ✅ NEW
│   │   │   │   ├── users/         ✅ NEW
│   │   │   │   └── no-visits/     ✅ NEW
│   │   │   └── sales/             ⏳ Build next
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx      ✅ NEW
│   │   │   │   └── Card.tsx        ✅ NEW
│   │   │   └── Sidebar.tsx         ⏳ Build next
│   │   ├── lib/
│   │   │   ├── api-client.ts       ✅ NEW
│   │   │   └── utils.ts            ✅ NEW
│   │   └── store/
│   │       └── auth-store.ts       ✅ NEW
│   ├── tailwind.config.ts          ✅ NEW
│   ├── postcss.config.js           ✅ NEW
│   └── package.json                ✅ Updated
│
└── 📚 Documentation/
    ├── AGGRESSIVE_IMPLEMENTATION_LOG.md
    ├── SECURITY_IMPLEMENTATION_GUIDE.md
    ├── NEXT_STEPS_AGGRESSIVE.md
    └── 🎯_AGGRESSIVE_IMPLEMENTATION_SUMMARY.md
```

---

## 🔐 SECURITY CHECKLIST

| Task | File | Time | Status |
|------|------|------|--------|
| Argon2 hashing | auth.service.ts | 1hr | 🔴 |
| Rate limiting | main.ts | 1hr | 🔴 |
| CSRF tokens | main.ts | 1.5hrs | 🔴 |
| Audit hooks | all services | 2hrs | 🔴 |
| Email config | .env | 30min | 🔴 |

---

## 🏗️ ARCHITECTURE LAYERS

```
┌─────────────────────────────────────┐
│   Frontend (Next.js)                │
│   ├─ Pages (Admin/Sales)            │
│   ├─ Components (UI Library)        │
│   ├─ Stores (Zustand)               │
│   └─ API Client                     │
├─────────────────────────────────────┤
│   HTTP/WebSocket                    │
├─────────────────────────────────────┤
│   Backend (NestJS)                  │
│   ├─ Controllers                    │
│   ├─ Services                       │
│   ├─ Guards (Auth, Rate Limit)      │
│   └─ Interceptors                   │
├─────────────────────────────────────┤
│   Database (PostgreSQL)             │
│   Cache (Redis)                     │
└─────────────────────────────────────┘
```

---

## 📊 IMPLEMENTATION PHASES

```
PHASE 1: Security (24-48 hours)
├─ Password hashing
├─ Rate limiting
├─ CSRF protection
├─ Audit logging hooks
└─ Email configuration

PHASE 2: Frontend Core (48-72 hours)
├─ Sidebar navigation
├─ DataTable component
├─ Admin pages polish
└─ Form components

PHASE 3: Real-time (24-36 hours)
├─ WebSocket setup
├─ Chat UI
├─ Notifications UI
└─ Dashboard updates

PHASE 4: Mobile (18-24 hours)
├─ Responsive layouts
├─ Touch optimization
└─ Mobile features

PHASE 5: Testing (16-20 hours)
├─ Unit tests
├─ Integration tests
└─ E2E tests
```

---

## 🚀 QUICK START

### Start Backend
```bash
cd backend
npm install
npm run start:dev
# API running on http://localhost:3001
```

### Start Frontend
```bash
cd frontend
npm install
npm run dev
# App running on http://localhost:3000
```

### Start Database (Docker)
```bash
docker-compose up -d
# PostgreSQL on localhost:5432
# Redis on localhost:6379
```

---

## 🔗 KEY ENDPOINTS

```
Auth:
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh
POST   /api/auth/logout

Admin:
GET    /api/approvals/payment
POST   /api/approvals/{id}/approve
POST   /api/approvals/{id}/reject
GET    /api/reports/sales?startDate=&endDate=
GET    /api/audit/logs

User:
GET    /api/users
POST   /api/users
PUT    /api/users/{id}
DELETE /api/users/{id}

Data:
GET    /api/customers
GET    /api/items
POST   /api/payments
GET    /api/credits
```

---

## 💾 ENVIRONMENT VARIABLES

### Backend (.env)
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=alem_crm

# JWT
JWT_SECRET=your-secret-min-32-characters-long
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_REFRESH_EXPIRATION=7d

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-password
EMAIL_FROM=ALEM CRM <noreply@alemcrm.com>

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Security
RATE_LIMIT=100
RATE_LIMIT_WINDOW=60
NODE_ENV=development
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

---

## 🧪 TESTING

### Backend Tests
```bash
cd backend
npm test
npm run test:cov
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:watch
```

### E2E Tests
```bash
cd frontend
npm run test:e2e
```

---

## 🎨 DESIGN TOKENS

```typescript
// Colors
primary    = #0F172A  (Dark Navy)
secondary  = #2563EB  (Blue)
success    = #22C55E  (Green)
warning    = #F59E0B  (Amber)
danger     = #EF4444  (Red)

// Typography
font-family: Inter (body), Poppins (headings)
font-size: 12px (sm), 14px (base), 16px (lg)

// Spacing
gap: 4px, 8px, 12px, 16px, 24px, 32px

// Shadows
soft: 0 1px 3px rgba(0,0,0,0.08)
lg:   0 10px 30px rgba(0,0,0,0.1)
```

---

## 📋 PRIORITY TASKS

### TODAY (🔴 Do Now)
- [ ] Read SECURITY_IMPLEMENTATION_GUIDE.md
- [ ] Update auth.service.ts with Argon2
- [ ] Configure ThrottlerModule
- [ ] Add CSRF middleware

### THIS WEEK (🟠 High Priority)
- [ ] Build Sidebar component
- [ ] Build DataTable component
- [ ] Complete form validation
- [ ] Connect all API endpoints

### NEXT WEEK (🟡 Medium Priority)
- [ ] WebSocket chat UI
- [ ] Mobile responsiveness
- [ ] Excel upload UI
- [ ] Unit tests

---

## 🐛 DEBUGGING

### Backend Issues
```bash
# Check logs
docker logs [container-name]

# Database connection
psql -h localhost -U postgres -d alem_crm

# Redis connection
redis-cli
> ping
```

### Frontend Issues
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run dev

# Check console errors
F12 → Console tab
```

---

## 📈 PERFORMANCE TARGETS

| Metric | Target | Current |
|--------|--------|---------|
| API response | < 500ms | ⏳ Test |
| Page load | < 2s | ⏳ Test |
| Bundle size | < 500KB | ⏳ Test |
| Core Web Vitals | Green | ⏳ Test |
| Uptime | 99.9% | ⏳ Test |

---

## 🚨 EMERGENCY PROCEDURES

### Database Connection Lost
```bash
# Reset database
docker-compose down
docker-compose up -d
npm run migration:run
```

### Frontend Build Fails
```bash
# Clean rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Backend Won't Start
```bash
# Check ports
lsof -i :3001
kill -9 [PID]
npm run start:dev
```

---

## 📚 DOCUMENTATION LINKS

| Document | Purpose |
|----------|---------|
| AGGRESSIVE_IMPLEMENTATION_LOG.md | What was built |
| SECURITY_IMPLEMENTATION_GUIDE.md | How to harden |
| NEXT_STEPS_AGGRESSIVE.md | Detailed roadmap |
| 🎯_SUMMARY.md | Executive overview |
| ⚡_QUICK_REFERENCE.md | This file |
| API_DOCUMENTATION.md | API endpoints |
| ARCHITECTURE.md | System design |

---

## 💬 COMMON QUESTIONS

**Q: Where do I start?**
A: Start with SECURITY_IMPLEMENTATION_GUIDE.md, then do Phase 1 backend fixes.

**Q: How long until production?**
A: 2-3 weeks at full-time development pace.

**Q: What's the most critical missing piece?**
A: Password hashing integration - do this first!

**Q: Should I test as I go?**
A: YES! Add tests in parallel with development.

**Q: Can I deploy to staging now?**
A: Not yet - security fixes needed first. 3-4 days.

---

## ✅ DONE CHECKLIST

```
✅ Backend architecture complete
✅ Database schema designed
✅ 8 admin pages created
✅ Tailwind + UI components
✅ API client configured
✅ Auth store created
✅ 3 new backend modules
✅ Security guide written
✅ Roadmap documented

⏳ Security hardening
⏳ Frontend components polish
⏳ Sales user pages
⏳ Mobile responsiveness
⏳ Real-time features
⏳ Testing
⏳ Deployment
```

---

## 🎯 YOUR NEXT ACTION

1. **Read** SECURITY_IMPLEMENTATION_GUIDE.md (10 minutes)
2. **Review** NEXT_STEPS_AGGRESSIVE.md (10 minutes)
3. **Code** Phase 1 security fixes (2-3 hours)
4. **Test** everything (30 minutes)
5. **Commit** and push (5 minutes)

**Time this hour:** Yes ✅
**Ready?** Let's go! 🚀

---

*Last Updated: July 20, 2026*
*Project Completion: 50%*
*Estimated Time to Production: 2-3 weeks*

**Questions? Check the detailed guides in the root directory.**
