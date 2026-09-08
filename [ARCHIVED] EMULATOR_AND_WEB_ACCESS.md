# 🚀 ALEM TRADING CRM - EMULATOR & WEB ACCESS GUIDE

## ⚡ QUICK START: ACCESS YOUR APP RIGHT NOW

### Option 1: Web Browser (Fastest - Use This Now!)
Open your web browser and go to:
```
http://localhost:3000
```

### Option 2: Android Emulator (Booting in Background)
The Android emulator is currently starting. Once ready (2-5 minutes), the APK will auto-install.

---

## 🌐 WEB ACCESS (Available Right Now)

### Frontend Interface
**URL:** http://localhost:3000

### Backend API
**URL:** http://localhost:3001/api

---

## 🔓 LOGIN CREDENTIALS

### Admin Account (Full System Access)
```
Username: admin
Password 1: Admin@2024!
Password 2: AdminSecure#2024
```
⚠️ **Note:** Two-factor authentication requires BOTH passwords!

### Sales Account (Limited Access)
```
Username: sales
Password 1: Sales@2024!
Password 2: SalesSecure#2024
```

---

## 📱 14 FEATURES TO EXPLORE

### 1. 📊 Dashboard
- Sales summary and analytics
- Revenue trends
- Customer overview
- Quick actions

### 2. 👥 Customers
- View all customers
- Add new customer
- Update customer info
- Search & filter customers
- Customer details and history

### 3. 💰 Transactions
- View all transactions
- Filter by date range
- Export transaction data
- Transaction details
- Payment history

### 4. 💳 Payments
- Track payment status
- Create payment requests
- Manage payment methods
- Payment receipts
- Payment schedules

### 5. 💬 Chat
- Send messages to customers
- Real-time messaging (WebSocket)
- Chat history
- Message notifications
- File attachments

### 6. 🔔 Notifications
- Real-time alerts
- Notification center
- Mark as read
- Push notifications (Android)
- Notification settings

### 7. 📦 Items/Products
- Manage inventory
- Update pricing
- Track stock levels
- Product categories
- Bulk operations

### 8. ✅ Approvals
- Pending approvals
- Approve/reject requests
- Approval history
- Comment on approvals
- Bulk approval actions

### 9. 💳 Credits
- Customer credit accounts
- Credit limits
- Credit usage
- Credit statements
- Credit adjustments

### 10. ↩️ Refunds
- Process refunds
- Refund history
- Refund status tracking
- Refund policies
- Partial refunds

### 11. ⚠️ No Visits Alert
- Alert system for customers
- Last visit tracking
- Automatic notifications
- Custom alert thresholds
- Alert configuration

### 12. 👤 Account Settings
- Personal profile
- Password management
- Two-factor auth settings
- Notification preferences
- App settings

### 13. ⚙️ Admin Panel
- User management
- System settings
- Activity logs
- Data backup
- System configuration

### 14. ✅ Paid Approvals
- Approval payment tracking
- Paid vs unpaid approvals
- Payment confirmation
- Financial reports
- Revenue tracking

---

## 🎯 TEST SCENARIOS

### Scenario 1: Login and Explore Dashboard
1. Go to http://localhost:3000
2. Login with admin account
3. Enter both passwords
4. View dashboard metrics
5. Check recent transactions

### Scenario 2: Add a Customer
1. Click "Customers" menu
2. Click "Add Customer"
3. Fill in customer details
4. Save customer
5. View customer profile

### Scenario 3: Create a Transaction
1. Go to "Transactions"
2. Click "New Transaction"
3. Select customer
4. Enter amount and details
5. Process payment
6. View confirmation

### Scenario 4: Send a Chat Message
1. Go to "Chat"
2. Select a customer
3. Type a message
4. Send message
5. See real-time delivery

### Scenario 5: Create an Approval
1. Go to "Approvals"
2. Click "New Approval"
3. Select customer and amount
4. Add notes
5. Submit for approval
6. Check approval status

---

## 📊 SAMPLE DATA AVAILABLE

The system comes pre-loaded with:

### Customers
- Multiple test customers
- Various credit limits
- Transaction history
- Contact information

### Products/Items
- Sample inventory
- Pricing data
- Stock levels
- Categories

### Transactions
- Historical data
- Payment records
- Refund records
- Payment methods

### Reports
- Sales reports
- Customer reports
- Payment reports
- Inventory reports

---

## 🛠️ SYSTEM STATUS

### Frontend
- **Status:** ✅ RUNNING
- **URL:** http://localhost:3000
- **Framework:** Next.js 14.2.35
- **Port:** 3000

### Backend
- **Status:** ✅ RUNNING
- **URL:** http://localhost:3001/api
- **Framework:** NestJS (Node.js)
- **Port:** 3001
- **Database:** PostgreSQL (may need connection restart)

### Android Emulator
- **Status:** ⏳ BOOTING (in background)
- **Device:** Pixel 4a
- **OS:** Android 9.0 (API 28)
- **APK:** 4.1 MB (debug build)
- **Auto-install:** Yes (when ready)

---

## 💡 KEYBOARD SHORTCUTS (Web)

### Navigation
- `Ctrl + K` - Quick search
- `Esc` - Close modals/dialogs
- `Enter` - Submit forms
- `Tab` - Navigate between fields

### Common Actions
- `Ctrl + S` - Save form
- `Ctrl + R` - Refresh page
- `Ctrl + L` - Focus URL bar
- `F12` - Open developer tools

---

## 📡 API ENDPOINTS (Backend)

### Authentication
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
```

### Customers
```
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id
```

### Transactions
```
GET    /api/transactions
POST   /api/transactions
GET    /api/transactions/:id
PUT    /api/transactions/:id
```

### Other Resources
```
/api/payments
/api/approvals
/api/credits
/api/refunds
/api/items
/api/chat
/api/notifications
```

---

## 🔍 DEVELOPER TOOLS

### Browser DevTools
Press `F12` to open browser developer tools:
- **Console** - View logs and errors
- **Network** - Monitor API calls
- **Application** - Check localStorage
- **Performance** - Measure speed

### Backend Logs
Check backend terminal (Terminal 5) for:
- API request logs
- Database queries
- Error messages
- Warning messages

### Frontend Logs
Check browser console for:
- Component errors
- API errors
- Navigation issues
- State changes

---

## 🔐 SECURITY FEATURES

### Two-Factor Authentication
- Required on login
- Two passwords needed
- Session timeout after 1 hour
- IP-based verification (when configured)

### Rate Limiting
- 100 requests per minute per IP
- Automatic throttling
- Clear error messages

### Authorization
- Role-based access control (RBAC)
- Admin vs Sales access
- Feature-level permissions
- Data-level security

---

## 📱 ANDROID EMULATOR STATUS

### Current Process
1. ⏳ Emulator booting in background (Terminal 12)
2. ⏳ Waiting for adb connection
3. ⏳ Auto-install script monitoring (Terminal 10)
4. ⏳ Will auto-launch app when ready

### What to Expect
- Emulator window will open (may be behind other windows)
- Android boot animation will play
- Home screen will appear
- APK will auto-install
- App will auto-launch
- You'll see login screen

### Time Estimate
- First boot: 3-5 minutes
- Subsequent boots: 1-2 minutes
- We're at: ~5 minutes elapsed

### When Ready
- You'll receive notification
- Check your running processes
- App will be available on emulator

---

## 🚀 RECOMMENDED WORKFLOW

### Right Now:
1. ✅ Open browser: http://localhost:3000
2. ✅ Login with admin account
3. ✅ Explore web interface
4. ✅ Test all 14 features

### In 5 Minutes:
- Check if emulator has started
- If started, emulator will show app
- Compare web vs emulator experience
- Test mobile-specific features

### Mobile Testing:
- Rotation testing
- Touch gestures
- Mobile notifications
- Network simulation
- Performance on device

---

## 📞 SUPPORT

### If App Won't Load:
1. Check URL is correct: http://localhost:3000
2. Check browser console for errors (F12)
3. Verify backend is running (Terminal 5)
4. Check network connection
5. Try clearing browser cache

### If Login Fails:
1. Verify credentials are correct
2. Check BOTH passwords are required
3. Check for caps lock
4. Try incognito/private mode
5. Clear localStorage and try again

### If Emulator Doesn't Boot:
1. Check disk space (need 2GB)
2. Check RAM available (need 4GB)
3. Try restarting emulator: `taskkill /F /IM emulator.exe`
4. Check no other emulators running
5. Verify AVD created: `adb devices`

---

## 📋 CHECKLIST

- [ ] Web frontend accessible at http://localhost:3000
- [ ] Backend API accessible at http://localhost:3001/api
- [ ] Admin login successful (both passwords entered)
- [ ] Dashboard loads and shows data
- [ ] Navigation menu works
- [ ] Customer list displays
- [ ] Transaction list displays
- [ ] Chat feature works
- [ ] Create new entry possible
- [ ] Search/filter works
- [ ] Admin panel accessible
- [ ] Settings page loads
- [ ] Logout works

---

## 🎉 YOU'RE READY!

**Start testing now:** Open http://localhost:3000 in your browser!

The emulator will continue booting in the background and will be ready in a few minutes.

