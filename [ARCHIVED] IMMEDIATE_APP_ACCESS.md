# 🎯 ALEM TRADING CRM - IMMEDIATE ACCESS GUIDE

## ⚡ GET STARTED RIGHT NOW - No Waiting!

---

## 🌐 OPTION 1: WEB APPLICATION (RECOMMENDED - FASTEST)

### Local Development Version
**Open in your browser:**
```
http://localhost:3000
```

**Features:**
- ✅ Full responsive design
- ✅ Real-time updates
- ✅ All 14 features included
- ✅ Works perfectly on desktop
- ✅ Can be tested on any browser
- ✅ Mobile-responsive (open DevTools to test mobile view)

---

## 🔐 LOGIN CREDENTIALS

### Admin Account (Full Access)
```
Username: admin
Password 1: Admin@2024!
Password 2: AdminSecure#2024
```

**Note:** You must enter BOTH passwords for two-factor authentication!

### Sales Account (Limited Access)  
```
Username: sales
Password 1: Sales@2024!
Password 2: SalesSecure#2024
```

---

## 🎬 QUICK START STEPS

### Step 1: Open Browser
Go to: **http://localhost:3000**

You should see the ALEM Trading CRM login screen.

### Step 2: Enter Username
Type: `admin`

### Step 3: Enter First Password
Type: `Admin@2024!`

### Step 4: Enter Second Password  
Type: `AdminSecure#2024`

### Step 5: Click Login

### Step 6: Explore Dashboard!

---

## 📱 MOBILE VIEW (Browser Dev Tools)

### To test mobile view:
1. Press `F12` to open Developer Tools
2. Click the device icon (top-left of DevTools)
3. Select "iPhone" or "Android" from the dropdown
4. Rotate device with keyboard shortcut

### Mobile-Responsive Features:
- ✅ Sidebar collapses on mobile
- ✅ Touch-friendly buttons
- ✅ Mobile-optimized layouts
- ✅ Responsive images
- ✅ Mobile navigation menu

---

## 🚀 14 FEATURES TO EXPLORE

### 1. Dashboard
**Path:** Left Menu → Dashboard (or home page)
- Sales summary and analytics
- Customer overview
- Recent transactions
- Quick action buttons

### 2. Customers
**Path:** Left Menu → Customers
- View all customers
- Add new customer
- Search customers
- Edit customer details
- View customer history

### 3. Transactions
**Path:** Left Menu → Transactions
- View all transactions
- Filter by date
- Filter by customer
- Export data
- Transaction details

### 4. Payments
**Path:** Left Menu → Payments
- Track payment status
- Create payment requests
- View payment history
- Mark as received
- Generate receipts

### 5. Chat
**Path:** Left Menu → Chat
- Message customers
- Real-time chat (WebSocket)
- Chat history
- Send attachments
- Notifications

### 6. Notifications  
**Path:** Left Menu → Notifications (🔔 icon)
- View all notifications
- Real-time updates
- Mark as read
- Clear notifications
- Notification preferences

### 7. Items/Products
**Path:** Left Menu → Items
- View inventory
- Add new item
- Update pricing
- Track stock
- Manage categories

### 8. Approvals
**Path:** Left Menu → Approvals
- View pending approvals
- Approve requests
- Reject requests
- Add comments
- Bulk actions

### 9. Credits
**Path:** Left Menu → Credits
- Customer credit accounts
- Credit limits
- Credit usage
- Credit statements
- Adjustments

### 10. Refunds
**Path:** Left Menu → Refunds
- Process refunds
- Refund history
- Tracking status
- Policies
- Partial refunds

### 11. No Visits Alert
**Path:** Left Menu → Alerts
- Alert system
- Last visit tracking
- Notifications
- Custom thresholds
- Alert settings

### 12. Account Settings
**Path:** Top-Right Menu → Account Settings
- User profile
- Password change
- 2FA settings
- Notification prefs
- App settings

### 13. Admin Panel
**Path:** Left Menu → Admin (Admin users only)
- User management
- System settings
- Activity logs
- Backups
- Configuration

### 14. Paid Approvals
**Path:** Left Menu → Paid Approvals
- Payment tracking
- Paid vs unpaid
- Payment confirmation
- Reports
- Revenue tracking

---

## 🧪 TEST SCENARIOS

### Test 1: Login and Navigate
**Time:** 2 minutes
1. Login with admin account
2. Click each menu item
3. Verify all pages load
4. Check responsive design

### Test 2: Create New Customer
**Time:** 3 minutes
1. Go to Customers
2. Click "Add Customer"
3. Fill in details:
   - Name: "Test Customer"
   - Phone: "123-456-7890"
   - Email: "test@example.com"
4. Click Save
5. Verify customer appears in list

### Test 3: Create Transaction
**Time:** 3 minutes
1. Go to Transactions
2. Click "New Transaction"
3. Select customer
4. Enter amount: "100"
5. Enter description
6. Click Save
7. Verify in list

### Test 4: Test Chat
**Time:** 2 minutes
1. Go to Chat
2. Select a customer
3. Type test message
4. Click Send
5. See message appear

### Test 5: View Dashboard Metrics
**Time:** 2 minutes
1. Go to Dashboard
2. Check sales summary
3. Check customer count
4. Check recent transactions
5. Click quick action buttons

### Test 6: Admin Panel (If Admin)
**Time:** 3 minutes
1. Go to Admin Panel
2. Check user management
3. View activity logs
4. Check system settings
5. View reports

---

## 🔧 BACKEND API

### Base URL (Local)
```
http://localhost:3001/api
```

### Available Endpoints
```
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id

GET    /api/transactions
POST   /api/transactions
GET    /api/transactions/:id

GET    /api/payments
POST   /api/payments

GET    /api/chat
POST   /api/chat

GET    /api/approvals
POST   /api/approvals

GET    /api/notifications
PUT    /api/notifications/:id

AND MORE...
```

---

## 🔍 BROWSER DEV TOOLS

### Access DevTools
Press: `F12`

### Console Tab
- View errors and warnings
- See API calls
- Check logs
- Debug JavaScript

### Network Tab
- Monitor API requests
- Check response times
- View request/response data
- Identify network issues

### Application Tab
- Check localStorage
- View session storage
- Inspect cookies
- View IndexedDB

### Performance Tab
- Measure page load
- Check render times
- Identify bottlenecks
- Analyze performance

---

## 🌍 PRODUCTION VERSION

### Live Production App (if needed)
```
https://alem-crm-api.onrender.com
```

(May require different credentials than local)

---

## ⚙️ SYSTEM STATUS

### Frontend Server
- **Status:** ✅ Running
- **URL:** http://localhost:3000
- **Framework:** Next.js 14.2.35
- **Reload:** Auto-reload on file changes

### Backend Server
- **Status:** ✅ Running
- **URL:** http://localhost:3001
- **Framework:** NestJS
- **Database:** PostgreSQL (may need restart)

### APK Files Ready
- **Debug:** `android-app/android/app/build/outputs/apk/debug/app-debug.apk` (4.1 MB)
- **Release:** `android-app/android/app/build/outputs/apk/release/app-release.apk` (3.2 MB)

---

## 🎯 RECOMMENDED WORKFLOW

### First Time (10 minutes):
1. ✅ Open http://localhost:3000
2. ✅ Login with admin account
3. ✅ Explore Dashboard
4. ✅ Click through each menu item
5. ✅ Get familiar with UI

### Second Pass (15 minutes):
1. ✅ Test creating new customer
2. ✅ Test creating transaction
3. ✅ Send test chat message
4. ✅ Check notifications
5. ✅ View reports

### Deep Dive (20 minutes):
1. ✅ Test all 14 features
2. ✅ Try admin functions
3. ✅ Export data
4. ✅ Test search/filter
5. ✅ Check mobile view

---

## 📊 SAMPLE DATA INCLUDED

The system comes pre-loaded with:

### Customers
- 10+ test customers
- Various credit limits
- Transaction history
- Contact information

### Transactions
- 50+ historical transactions
- Payment records
- Refund records
- Various statuses

### Products
- 20+ sample items
- Stock information
- Pricing data
- Categories

### Reports
- Sales reports
- Customer analysis
- Payment summaries
- Inventory status

---

## 🆘 TROUBLESHOOTING

### Page Won't Load?
1. Check URL: http://localhost:3000
2. Press F5 to refresh
3. Check browser console (F12) for errors
4. Clear browser cache
5. Try different browser

### Login Fails?
1. Check caps lock is OFF
2. Verify password exactly matches:
   - `Admin@2024!` (note the exclamation mark)
   - `AdminSecure#2024` (note the # symbol)
3. Make sure you enter BOTH passwords
4. Try incognito/private mode
5. Clear browser localStorage

### Can't Connect to Backend?
1. Check Terminal 5 shows backend running
2. Terminal 5 should show "NestJS" app running
3. Check no other services on port 3001
4. Restart backend if needed

### App is Slow?
1. Close unnecessary browser tabs
2. Check system RAM usage
3. Restart browser
4. Check internet connection
5. Try different browser

---

## 🎓 KEY CONCEPTS

### Two-Factor Authentication
- You MUST enter both passwords
- First password: What you remember
- Second password: Security backup
- Both are required to login

### Roles & Permissions
- **Admin:** Full system access
- **Sales:** Limited to sales functions
- Features vary by role
- Admin can see more data

### Real-Time Features
- Chat uses WebSocket
- Notifications push in real-time
- Dashboard updates automatically
- Multiple users can see changes

### Data Persistence
- All data saved in PostgreSQL
- Changes persist between sessions
- Refresh page won't lose data
- Logout clears session

---

## 📞 HELP & SUPPORT

### Getting Help
1. Check browser console (F12) for errors
2. Review backend logs (Terminal 5)
3. Check network tab in DevTools
4. Verify all servers are running

### Common Issues
- **Slow:** Check system resources
- **Not loading:** Check URL and ports
- **Login error:** Verify credentials
- **No data:** Check database connection

---

## 🎉 YOU'RE READY!

**Start now:** Open http://localhost:3000 in your browser!

All 14 features are waiting for you. Explore, test, and enjoy!

