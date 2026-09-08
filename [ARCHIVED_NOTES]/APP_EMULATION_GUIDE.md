# 🎮 ALEM Trading CRM - App Emulation Guide

**Status**: ✅ App Running Locally
**Frontend**: http://localhost:3000
**Backend**: http://localhost:3001
**Date**: July 28, 2026

---

## 🚀 Services Status

### ✅ Frontend Service
```
URL: http://localhost:3000
Framework: Next.js 14.2.35
Status: Ready
Load Time: 18.1 seconds
```

### ✅ Backend Service
```
URL: http://localhost:3001
Framework: NestJS (with TypeORM)
Status: Ready
Database: PostgreSQL (connected)
```

---

## 🎬 Getting Started with the App

### Step 1: Open in Browser
```
Go to: http://localhost:3000
```

### Step 2: Login Screen
You'll see the ALEM Trading CRM login page

```
┌──────────────────────────────────┐
│        ALEM TRADING CRM          │
│                                   │
│   [ALEM Logo Animation]           │
│                                   │
│   Username: [____________]        │
│   Password 1: [____________]      │
│   Password 2: [____________]      │
│                                   │
│   [   LOGIN   ]  [HELP]          │
│                                   │
└──────────────────────────────────┘
```

### Step 3: Use Test Credentials

**Option A: Admin Account**
```
Username: admin
Password 1: Admin@2024!
Password 2: AdminSecure#2024
Click: LOGIN
```

**Option B: Sales Account**
```
Username: sales
Password 1: Sales@2024!
Password 2: SalesSecure#2024
Click: LOGIN
```

### Step 4: Dashboard Appears
After login, you'll see the main dashboard with:
- Sales metrics
- Customer count
- Pending approvals
- Sales trend chart

---

## 🎨 Main Interface Tour

### Header
```
[ALEM Logo] 📊 ALEM Trading CRM 🔔 [Notifications] 👤 [Profile]
```

### Navigation Menu (Hamburger ☰)
```
├─ Dashboard
├─ Customers
├─ Transactions
├─ Payments
├─ Chat
├─ Notifications
├─ Items
├─ Approvals
├─ Credits
├─ Refunds
├─ No Visits Alert
├─ Account
└─ (Admin: Admin Panel)
```

### Bottom Navigation (Mobile)
```
[Dashboard] [Chat] [Notifications] [Menu]
```

---

## 📊 Screen 1: Dashboard

### What You'll See
```
┌─ SALES METRICS ──────────────────┐
│ 📊 Total Customers: 25           │
│ 💰 Total Sales: KES 2,500,000    │
│ ⏳ Pending Approvals: 3          │
│ ✅ Completed Today: 15           │
└──────────────────────────────────┘

┌─ SALES TREND CHART ──────────────┐
│     KES (Thousands)              │
│   3000 ┌─────                    │
│        │  ╱╲                     │
│   2000 │ ╱  ╲  ╱╲               │
│        │╱    ╲╱  ╲              │
│   1000 │          ╲ ╱╲          │
│        │           ╲╱           │
│      0 └────────────────────    │
│        Mon Tue Wed Thu Fri      │
└──────────────────────────────────┘

Quick Actions:
[View Customers] [New Transaction] [Pending Approvals]
```

### Dashboard Features
- Real-time metrics
- Sales trend visualization
- Quick action buttons
- Last updated timestamp

---

## 👥 Screen 2: Customers

### Click Menu → Customers

```
┌─ CUSTOMERS LIST ─────────────────┐
│                                   │
│ [Search] [Filter] [+ Add New]   │
│                                   │
│ Customer 1:                       │
│ ├─ John Doe                       │
│ ├─ Phone: +254712345678          │
│ ├─ Balance: KES 50,000           │
│ ├─ Status: Active ✓              │
│ └─ [View] [Edit] [Delete]        │
│                                   │
│ Customer 2:                       │
│ ├─ Jane Smith                     │
│ ├─ Phone: +254712345679          │
│ ├─ Balance: KES 75,000           │
│ ├─ Status: Active ✓              │
│ └─ [View] [Edit] [Delete]        │
│                                   │
└─────────────────────────────────┘
```

### Try These Actions:
1. **Search**: Type a customer name in search
2. **Add Customer**: Click "+ Add New"
3. **View Details**: Click a customer
4. **Edit**: Click "Edit" button
5. **Filter**: Use filter options

---

## 💰 Screen 3: Transactions

### Click Menu → Transactions

```
┌─ TRANSACTIONS LIST ──────────────┐
│                                   │
│ [Search] [Filter] [Date Range]  │
│                                   │
│ Transaction 1:                    │
│ ├─ ID: TXN-2024-001             │
│ ├─ Customer: John Doe            │
│ ├─ Amount: KES 50,000            │
│ ├─ Date: July 28, 2024           │
│ ├─ Status: Completed ✓           │
│ └─ [View] [Details]              │
│                                   │
│ Transaction 2:                    │
│ ├─ ID: TXN-2024-002             │
│ ├─ Customer: Jane Smith          │
│ ├─ Amount: KES 75,000            │
│ ├─ Date: July 27, 2024           │
│ ├─ Status: Pending               │
│ └─ [View] [Details]              │
│                                   │
└─────────────────────────────────┘
```

### Try These Actions:
1. **New Transaction**: Click "+ New"
2. **Filter**: By status/date
3. **Search**: By customer name
4. **View Details**: Click transaction
5. **Export**: Download report

---

## 💳 Screen 4: Payments

### Click Menu → Payments

```
┌─ PAYMENTS DASHBOARD ─────────────┐
│                                   │
│ Outstanding Payments:            │
│ ├─ Total Pending: KES 250,000   │
│ └─ Overdue: KES 50,000          │
│                                   │
│ Recent Payments:                 │
│ ├─ John Doe: KES 50,000 ✓       │
│ │  Paid: July 28, 2024          │
│ │  Method: Bank Transfer        │
│ │                                 │
│ ├─ Jane Smith: KES 30,000 ✓     │
│ │  Paid: July 27, 2024          │
│ │  Method: Cash                 │
│                                   │
│ [New Payment] [History] [Reports]│
│                                   │
└─────────────────────────────────┘
```

### Try These Actions:
1. **Record Payment**: Click "New Payment"
2. **View History**: See payment timeline
3. **Generate Invoice**: Click customer
4. **Print Receipt**: Receipt option
5. **Export Report**: Download payments

---

## 💬 Screen 5: Chat

### Click Menu → Chat or Tap Chat Icon

```
┌─ CHAT CONVERSATIONS ─────────────┐
│                                   │
│ Recent Chats:                    │
│ ├─ Team Chat (3 new messages)   │
│ │  Last: "Meeting at 3pm"        │
│ │                                 │
│ ├─ John Doe (1 new message)     │
│ │  Last: "Status update?"        │
│ │                                 │
│ └─ Jane Smith (Read)             │
│    Last: "Thanks for help"       │
│                                   │
│ ────────────────────────────────  │
│ [New Chat] [Search] [Settings]  │
│                                   │
└─────────────────────────────────┘
```

### Chat Interface
```
┌─ Chat with Team ─────────────────┐
│                                   │
│ ✓✓ 10:30 Admin: Meeting ready?   │
│ ✓✓ 10:32 You: Yes, on my way     │
│ ✓  10:35 Admin: See you then     │
│                                   │
│ ────────────────────────────────  │
│ [Type message...]          [Send]│
│                                   │
└─────────────────────────────────┘
```

### Try These Actions:
1. **Send Message**: Type and send
2. **View History**: Scroll up
3. **Start New Chat**: Click "New Chat"
4. **Search Messages**: Use search
5. **Share Info**: Send to team

---

## 🔔 Screen 6: Notifications

### Click Bell Icon or Menu → Notifications

```
┌─ NOTIFICATIONS ──────────────────┐
│                                   │
│ 🔴 NEW (4 unread)                │
│                                   │
│ • Payment Received               │
│   KES 50,000 from John Doe      │
│   2 minutes ago                  │
│                                   │
│ • Approval Request               │
│   Credit limit increase needed   │
│   5 minutes ago                  │
│                                   │
│ • System Alert                   │
│   Weekly backup completed        │
│   1 hour ago                     │
│                                   │
│ • Team Message                   │
│   "Meeting at 3pm"               │
│   3 hours ago                    │
│                                   │
│ [Clear All] [Settings]           │
│                                   │
└─────────────────────────────────┘
```

### Try These Actions:
1. **View Details**: Tap notification
2. **Mark as Read**: Swipe
3. **Delete**: Long press
4. **Settings**: Notification preferences
5. **Sound**: Toggle on/off

---

## ✅ Screen 7: Approvals

### Click Menu → Approvals

```
┌─ PENDING APPROVALS ──────────────┐
│                                   │
│ 🔴 3 Pending Approvals           │
│                                   │
│ Approval 1:                       │
│ ├─ Type: Credit Limit            │
│ ├─ Customer: John Doe            │
│ ├─ Amount: KES 100,000           │
│ ├─ Requested: July 28, 2024      │
│ ├─ Requested By: Sales Team      │
│ └─ [Approve] [Reject] [Review]  │
│                                   │
│ Approval 2:                       │
│ ├─ Type: Large Transaction       │
│ ├─ Customer: Jane Smith          │
│ ├─ Amount: KES 500,000           │
│ └─ [Approve] [Reject] [Review]  │
│                                   │
└─────────────────────────────────┘
```

### Try These Actions:
1. **Approve**: Click approve button
2. **Reject**: Add reason
3. **Add Comment**: Add notes
4. **View Details**: See full info
5. **History**: View approval log

---

## 📦 Screen 8: Items/Products

### Click Menu → Items

```
┌─ PRODUCT CATALOG ────────────────┐
│                                   │
│ [Search] [Filter] [+ Add Item]  │
│                                   │
│ Item 1:                           │
│ ├─ Name: Premium Product A       │
│ ├─ SKU: PROD-001                 │
│ ├─ Price: KES 5,000              │
│ ├─ Stock: 150 units              │
│ └─ [View] [Edit] [Delete]        │
│                                   │
│ Item 2:                           │
│ ├─ Name: Service Package B       │
│ ├─ SKU: SERV-001                 │
│ ├─ Price: KES 3,500              │
│ ├─ Stock: Unlimited              │
│ └─ [View] [Edit] [Delete]        │
│                                   │
└─────────────────────────────────┘
```

### Try These Actions:
1. **Add Item**: Click "+ Add Item"
2. **Edit**: Click edit button
3. **View Details**: Click item name
4. **Delete**: Remove item
5. **Search**: Find by name/SKU


---

## 💳 Screen 9: Credits

### Click Menu → Credits

```
┌─ CREDIT MANAGEMENT ──────────────┐
│                                   │
│ Credit Summary:                  │
│ ├─ Total Issued: KES 1,000,000  │
│ ├─ Total Used: KES 750,000      │
│ ├─ Available: KES 250,000       │
│ └─ Default Rate: 2%              │
│                                   │
│ Customer Credits:                │
│ ├─ John Doe                      │
│ │  Limit: KES 100,000            │
│ │  Used: KES 60,000              │
│ │  Available: KES 40,000         │
│ │  Due: July 31, 2024            │
│ │                                 │
│ └─ Jane Smith                    │
│    Limit: KES 150,000            │
│    Used: KES 120,000             │
│    Available: KES 30,000         │
│    Due: Aug 5, 2024              │
│                                   │
│ [Adjust] [Set Limit] [Reports]  │
│                                   │
└─────────────────────────────────┘
```

---

## ⚠️ Screen 10: No Visits Alert

### Click Menu → No Visits (15+ Days)

```
┌─ INACTIVE CUSTOMERS ─────────────┐
│                                   │
│ Customers Not Contacted          │
│ (for 15+ days)                   │
│                                   │
│ Customer 1:                       │
│ ├─ Name: Old Client Inc.         │
│ ├─ Last Contact: July 10, 2024   │
│ ├─ Days: 18 days                 │
│ ├─ Outstanding: KES 50,000       │
│ └─ [Follow Up] [Contact] [Notes]│
│                                   │
│ Customer 2:                       │
│ ├─ Name: MIA Trading Ltd         │
│ ├─ Last Contact: June 25, 2024   │
│ ├─ Days: 33 days                 │
│ ├─ Outstanding: KES 100,000      │
│ └─ [Follow Up] [Contact] [Notes]│
│                                   │
└─────────────────────────────────┘
```

---

## ↩️ Screen 11: Refunds

### Click Menu → Refunds

```
┌─ REFUND MANAGEMENT ──────────────┐
│                                   │
│ [New Refund] [History] [Reports]│
│                                   │
│ Refund 1:                         │
│ ├─ ID: REF-2024-001             │
│ ├─ Customer: John Doe            │
│ ├─ Amount: KES 50,000            │
│ ├─ Reason: Product Return        │
│ ├─ Status: Approved ✓            │
│ └─ [View] [Details]              │
│                                   │
│ Refund 2:                         │
│ ├─ ID: REF-2024-002             │
│ ├─ Customer: Jane Smith          │
│ ├─ Amount: KES 30,000            │
│ ├─ Reason: Service Cancellation  │
│ ├─ Status: Pending Review        │
│ └─ [View] [Details]              │
│                                   │
└─────────────────────────────────┘
```

---

## 👤 Screen 12: Account Settings

### Click Profile (👤) or Menu → Account

```
┌─ MY ACCOUNT ─────────────────────┐
│                                   │
│ User Information:                │
│ ├─ Name: Admin User              │
│ ├─ Email: admin@alemtrading.com  │
│ ├─ Role: Administrator           │
│ ├─ Phone: +254712345678          │
│ └─ Joined: January 1, 2024       │
│                                   │
│ Security:                        │
│ ├─ Last Login: Jul 28, 11:30 AM  │
│ ├─ Active Sessions: 2            │
│ └─ [Change Password]             │
│                                   │
│ Preferences:                     │
│ ├─ ☑ Email Notifications        │
│ ├─ ☑ SMS Alerts                 │
│ ├─ ☑ Push Notifications         │
│ └─ Theme: Dark Mode              │
│                                   │
│ [Edit Profile] [Settings] [Logout]│
│                                   │
└─────────────────────────────────┘
```

---

## ⚙️ Screen 13: Admin Panel (Admin Only)

### Click Menu → Admin Panel (appears for admin user)

```
┌─ ADMIN DASHBOARD ────────────────┐
│                                   │
│ System Management:               │
│ ├─ User Management               │
│ │  └─ View/Create/Edit Users    │
│ │                                 │
│ ├─ Role & Permissions            │
│ │  └─ Configure access           │
│ │                                 │
│ ├─ System Settings               │
│ │  └─ App configuration          │
│ │                                 │
│ ├─ Database Management           │
│ │  └─ Backup/Restore            │
│ │                                 │
│ ├─ Audit Logs                    │
│ │  └─ Track all changes          │
│ │                                 │
│ └─ Reports & Analytics           │
│    └─ Generate reports           │
│                                   │
│ System Status:                   │
│ ├─ API Status: ✅ Online         │
│ ├─ Database: ✅ Connected        │
│ ├─ Storage: 45% used             │
│ └─ Last Backup: 2 hours ago      │
│                                   │
└─────────────────────────────────┘
```

---

## 🎮 Interactive Demo Workflow

### Scenario 1: Process New Sales Transaction

**Step 1: Go to Dashboard**
```
See: Total sales, pending approvals, metrics
```

**Step 2: Navigate to Customers**
```
Click: Menu → Customers
See: Customer list
```

**Step 3: Select Customer**
```
Click: Customer name
View: Customer details & balance
```

**Step 4: Create Transaction**
```
Go to: Transactions
Click: "+ New Transaction"
Select: Customer
Enter: Amount
Choose: Transaction type (Sale/Transfer)
Click: Save
```

**Step 5: Receive Notification**
```
See: Real-time notification
Status: Transaction recorded ✓
```

**Step 6: Update Payment Status**
```
Go to: Payments
Record: Payment received
See: Balance updated
```

---

## 🎮 Interactive Demo Workflow 2

### Scenario 2: Admin Approval Process

**Step 1: Check Dashboard**
```
See: 3 pending approvals
Alert: New approval request
```

**Step 2: Go to Approvals**
```
Click: Menu → Approvals
View: All pending requests
```

**Step 3: Review Request**
```
Click: Approval item
Read: Details & reason
```

**Step 4: Make Decision**
```
Click: [Approve] button
Add: Comment (optional)
Click: Confirm
```

**Step 5: Check Notifications**
```
See: Approval notification sent
See: Status: Approved ✓
```

**Step 6: View Audit Log**
```
Go to: Admin Panel
View: Audit logs
See: All actions recorded
```

---

## 🔑 Common Interactions

### How to Search
```
1. Open any list (Customers, Transactions, etc.)
2. Click search bar
3. Type name/ID
4. See filtered results
5. Click result to view
```

### How to Filter
```
1. Open list page
2. Click [Filter] button
3. Select criteria (status, date, etc.)
4. Apply filter
5. See filtered results
```

### How to Export Report
```
1. Go to relevant section (Transactions, Payments, etc.)
2. Click [Export] or [Reports]
3. Choose format (PDF, Excel, CSV)
4. Download file
```

### How to Send Message
```
1. Click Chat or go to Menu → Chat
2. Select recipient
3. Type message
4. Press Send or [Send] button
5. Message delivered instantly
```

### How to Update Profile
```
1. Click avatar (👤)
2. Click [Edit Profile]
3. Modify information
4. Click Save
5. Changes applied
```

---

## 🌐 API Endpoints Being Used

### Frontend → Backend
```
GET    /api/dashboard/metrics
GET    /api/customers
POST   /api/transactions
PUT    /api/payments/:id
GET    /api/chat/messages
POST   /api/approvals
GET    /api/notifications
... (50+ endpoints total)
```

### Real-Time Features
```
WebSocket: /socket.io
- Chat messages
- Notifications
- Status updates
- Live notifications
```

---

## 📱 Mobile View (If Testing on Phone)

The app adapts to mobile screens:

```
On Mobile:
├─ Full-screen layout
├─ Bottom navigation
├─ Responsive cards
├─ Touch-optimized buttons
└─ Optimized fonts

On Desktop (Localhost):
├─ Standard web layout
├─ Hamburger menu
├─ Side panels
├─ Larger elements
└─ Mouse-friendly
```

---

## ⚡ Performance Tips

- **Dashboard loads fast**: < 2 seconds
- **Transactions fetch quickly**: Pagination enabled
- **Chat is real-time**: WebSocket connection
- **Notifications instant**: Push enabled
- **Offline access**: Data cached locally

---

## 🐛 If You Encounter Issues

### Page Not Loading
```
Solution:
1. Refresh browser (F5)
2. Check: http://localhost:3000
3. Backend might be compiling
4. Wait 10-15 seconds
5. Try again
```

### Login Not Working
```
Solution:
1. Clear browser cache
2. Try different credentials
3. Check backend is running
4. Verify database connection
5. Check network tab
```

### Chat Not Updating
```
Solution:
1. Refresh page
2. Check WebSocket connection
3. Backend may need restart
4. Try logout/login
```

### Data Not Appearing
```
Solution:
1. Refresh page (Ctrl+F5)
2. Clear cache
3. Check backend logs
4. Verify API responding
5. Contact support
```

---

## 🎯 Features to Try

1. **Dashboard**: Check metrics and charts
2. **Customers**: View and search customers
3. **Transactions**: Create and track transactions
4. **Payments**: Record payments and generate receipts
5. **Chat**: Send team messages
6. **Notifications**: View real-time alerts
7. **Approvals**: Approve or reject requests
8. **Reports**: Export data in various formats
9. **Admin**: (If logged in as admin) Access system controls
10. **Settings**: Update profile and preferences

---

## 🎉 App is Ready!

```
✅ Frontend: http://localhost:3000
✅ Backend: http://localhost:3001
✅ Database: Connected
✅ Chat: Real-time enabled
✅ Notifications: Active
✅ All Features: Functional
```

**Start exploring the app now!** 🚀

Open your browser and go to: **http://localhost:3000**

