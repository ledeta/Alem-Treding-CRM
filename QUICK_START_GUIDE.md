# ALEM TRADING - Quick Start Guide

## Prerequisites
- Node.js (v18+)
- npm or yarn
- PostgreSQL (running locally on port 5432)
- Git

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
# Navigate to project directory
cd alem-crm-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### 2. Database Setup

```bash
# Start PostgreSQL (if not running)
# Windows: Run PostgreSQL service or use pgAdmin

# Create database (using psql or pgAdmin)
createdb alem_crm

# Run migrations (from backend directory)
cd backend
npm run migration:run
```

### 3. Environment Configuration

**Backend (.env)** - Already configured with:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alem_crm
DB_USER=postgres
DB_PASSWORD=postgres
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Email configured with Ethereal test service (development)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
```

**Frontend (.env.local)** - Already configured:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Start the Application

#### Option A: Run Separately (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
# Backend running on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend running on http://localhost:3000
```

#### Option B: Run Together (Mac/Linux)
```bash
# From root directory
npm start  # If available, runs both concurrently
```

### 5. Access the System

**Login URL**: http://localhost:3000

### 📋 Test Credentials

#### Admin Account
```
Username: admin
Password: Admin@2024!
```
- Full system access
- Can see Admin panel
- Can approve/reject requests
- Can manage all users

#### Sales User Account (Option 1)
```
Username: salesman
Password: Sales123!
```
- Limited to Sales role features
- Can create sales orders
- Can view customers & items
- Can access dashboard & chat
- Cannot access Admin panel

#### Sales User Accounts (Option 2)
```
Username: agent01
Password: Agent@2024!

Username: agent02
Password: Agent@2024!
```

---

## 🎯 Key Features to Try

### 1. **Real-Time Dashboard**
- Go to `/dashboard`
- Charts update in real-time via WebSocket
- See KPIs, revenue trends, customer data

### 2. **Customer Management**
- Navigate to Customers
- Add new customers
- View customer balance & history
- **Export to Excel**: Click "📊 Export" button

### 3. **Transaction Tracking**
- Go to Transactions
- Filter by Sale/Purchase/Return
- View transaction details
- **Export to Excel**: Click "📊 Export to Excel" button

### 4. **Chat & Notifications**
- Open Chat panel for real-time messaging
- View Notifications for system alerts
- Both update in real-time via WebSocket

### 5. **Payment Approvals**
- Admin: Go to Admin → Approvals
- View payment, credit, refund requests
- Approve/Reject with email notifications

### 6. **Email Notifications**
- Tests use Ethereal service (development)
- View preview URLs in backend logs
- For production: Configure Gmail/SMTP

### 7. **Role-Based Access**
- **Admin User**: See full menu + Admin section
- **Sales User**: Limited menu - no Admin access
- Logout and login with different accounts to see difference

---

## 🔧 Common Tasks

### Create a Test Customer
1. Go to Customers page
2. Click "+ Add Customer"
3. Fill in name, phone, email, city
4. Click Create
5. New customer appears in list

### Create a Sales Transaction
1. Go to Sales
2. Select customer
3. Select items and quantities
4. Confirm amount
5. Transaction is recorded in Transaction list

### Export Data
1. Go to Customers or Transactions
2. Click "📊 Export" button
3. File downloads as .xlsx
4. Open in Excel to view formatted data

### View Audit Logs
1. Admin only feature
2. Go to Admin → Audit Logs
3. See all system operations with timestamps
4. Filter by user or operation type

### Send Test Email
1. Admin only
2. Go to Admin section
3. Look for Email Test endpoint
4. Or use backend API: `POST /email/send-test`
5. Check logs for Ethereal preview URL

---

## 📊 Dashboard Overview

The dashboard displays:
- **KPI Cards**: Total sales, customers, profit, pending payments
- **Sales Trend**: 7-day sales performance with targets
- **Revenue Breakdown**: Sales vs Credits comparison
- **Customer Distribution**: Active vs Inactive customers
- **Payment Status**: Completed, pending, failed payments
- **Top Items**: Best selling items by units
- **Top Customers**: Biggest spenders by revenue
- **Recent Transactions**: Latest 5 transactions

All charts update in real-time via WebSocket connection.

---

## 🔐 Security Features

### Role-Based Access Control
- Admin menu items hidden from Sales users
- Admin pages protected by RoleGuard component
- API endpoints enforce role checks

### Audit Logging
- Every operation is logged with:
  - User who performed it
  - What action was taken
  - When it occurred
  - Related records

### Authentication
- JWT-based login (1 hour expiration)
- Refresh tokens for extended sessions
- Password stored as hashed values

### Rate Limiting
- 100 requests per minute per IP
- Prevents abuse and DoS attacks

---

## 🛠️ Troubleshooting

### Frontend Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend Connection Error
```bash
# Check if backend is running
# Should see: "Server running on http://localhost:3001"

# Verify database connection
# Check PostgreSQL is running

# Check environment variables
cat backend/.env
```

### WebSocket Not Connecting
```bash
# Check browser console (F12)
# Should see: "WebSocket connected" message

# If error: Check CORS in backend
# Verify port 3001 is accessible
```

### Database Already Exists
```bash
# Drop and recreate database
dropdb alem_crm
createdb alem_crm
npm run migration:run
```

### Login Not Working
```bash
# Verify test accounts exist
# Check backend logs for errors

# Try admin account:
Username: admin
Password: Admin@2024!

# Check JWT_SECRET in .env matches
```

---

## 📱 Responsive Design

The system is optimized for:
- **Desktop** (1920px+): Full layout with sidebar
- **Tablet** (768px-1024px): Responsive grid layout
- **Mobile** (320px-767px): Stacked layout with hamburger menu

Test responsive design in browser (F12 → Toggle device toolbar)

---

## 🔗 Important URLs

| Feature | URL | Access |
|---------|-----|--------|
| Dashboard | http://localhost:3000/dashboard | All users |
| Customers | http://localhost:3000/customers | All users |
| Items | http://localhost:3000/items | All users |
| Sales | http://localhost:3000/sales | All users |
| Transactions | http://localhost:3000/transactions | All users |
| Notifications | http://localhost:3000/notifications | All users |
| Chat | http://localhost:3000/chat | All users |
| Admin | http://localhost:3000/admin | Admin only |
| Settings | http://localhost:3000/settings | All users |

---

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Example API Call
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2024!"}'

# Response includes JWT token
# Use token in Authorization header for subsequent requests

# Get customers
curl -X GET http://localhost:3001/api/customers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🚦 System Status Checks

### Verify Backend is Ready
```bash
curl http://localhost:3001/api/auth/csrf-token
# Should return CSRF token
```

### Verify Database Connection
```bash
# Check in backend logs during startup
# Should see: "Database connection established"
```

### Verify WebSocket Connection
Open http://localhost:3000/dashboard  
Check browser console (F12):
```javascript
// Should see:
// "WebSocket connected successfully"
// or "Dashboard WebSocket event received"
```

---

## 📋 Production Deployment Checklist

- [ ] Change all default passwords
- [ ] Set NODE_ENV=production
- [ ] Generate new JWT_SECRET
- [ ] Configure production database
- [ ] Set up production SMTP (Gmail/SendGrid)
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up backups
- [ ] Enable monitoring & logging
- [ ] Test all features in production
- [ ] Document access procedures
- [ ] Create disaster recovery plan

---

## 💡 Tips & Tricks

### Clear Browser Cache
- If changes don't appear
- Press Ctrl+Shift+Delete → Clear Browsing Data → Clear All
- Or use Ctrl+F5 for hard refresh

### Check Network Activity
- Open DevTools (F12) → Network tab
- See all API calls and responses
- Check for 404 or 500 errors

### Debug Backend Logs
- Backend logs appear in terminal where `npm run start:dev` runs
- Look for error messages and timestamps
- Enable debug logging: `LOG_LEVEL=debug` in .env

### Monitor Performance
- DevTools → Performance tab → Record
- Check Main thread usage
- Look for long-running tasks

### Test Email Preview
- Ethereal test emails have preview URLs
- Check backend logs after email is sent
- Click preview URL to see email formatting

---

## 📞 Support

### Common Issues
See **Troubleshooting** section above

### Development Help
- Check component source in `frontend/src/components/`
- Review API examples in `backend/src/modules/`
- See database schema in entities files

### Feature Questions
- Check IMPLEMENTATION_STATUS.md for feature list
- Review specific module documentation
- Check inline code comments

---

## 🎉 You're Ready!

Your ALEM TRADING Management System is now ready to use.

**Next steps:**
1. Login with admin account
2. Explore the dashboard
3. Try creating customers and transactions
4. Test export functionality
5. Try different user roles

**Enjoy your premium trading management system!** 🚀

---

*For detailed technical documentation, see IMPLEMENTATION_STATUS.md*
