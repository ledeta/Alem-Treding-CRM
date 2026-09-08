# 🔐 ALEM TRADING - Login Accounts & Role-Based Access Guide

## 📋 Quick Reference - Test Accounts

### ✅ ADMIN ACCOUNT
```
🎯 Role: Administrator (Full System Access)

Username:  admin
Password:  Admin123!

Email:     admin@alem-trading.com
Full Name: System Administrator
Phone:     +251911000000
Status:    Active
```

### 👤 SALES USER ACCOUNT
```
🎯 Role: Sales User (Limited Access - Sales Operations Only)

Username:  salesman
Password:  Sales123!

Email:     sales@alem-trading.com
Full Name: Sales Representative
Phone:     +251922000000
Status:    Active
```

---

## 🔑 Additional Test Accounts

### Sales User #2
```
Username:  agent01
Password:  Agent@2024!

Email:     agent01@alem-trading.com
Full Name: John Doe
Phone:     +251933000000
Status:    Active
```

### Sales User #3
```
Username:  agent02
Password:  Agent@2024!

Email:     agent02@alem-trading.com
Full Name: Jane Smith
Phone:     +251944000000
Status:    Active
```

---

## 📊 Role-Based Access Matrix

### ADMIN ROLE (Full Access ✅)

| Feature | Access | Details |
|---------|--------|---------|
| **Dashboard** | ✅ Full | View all KPIs, analytics, real-time data |
| **User Management** | ✅ Full | Create, edit, delete users; assign roles |
| **Customer Management** | ✅ Full | CRUD operations, view all customers |
| **Item/Stock Management** | ✅ Full | CRUD operations, stock adjustments |
| **Payment Requests** | ✅ Full | View all, approve, reject, process |
| **Credit Requests** | ✅ Full | View all, approve, reject, manage |
| **Refund Requests** | ✅ Full | View all, approve, reject, process |
| **Sales Transactions** | ✅ Full | View all, edit, delete, export |
| **File Uploads** | ✅ Full | View all uploads, reprocess, delete |
| **Inactive Customers** | ✅ Full | View list, send reminders |
| **Approval Center** | ✅ Full | Approve/reject all pending items |
| **Activity Log** | ✅ Full | View all user actions and changes |
| **Chat** | ✅ Full | Send/receive, moderate conversations |
| **Notifications** | ✅ Full | View all, manage notification settings |
| **Settings** | ✅ Full | System configuration, email setup |
| **Export/Reports** | ✅ Full | Export any data, generate reports |

---

### SALES USER ROLE (Limited Access ⚠️)

| Feature | Access | Details |
|---------|--------|---------|
| **Dashboard** | ✅ Partial | View only their own sales metrics |
| **User Management** | ❌ None | Cannot access |
| **Customer Management** | ✅ Partial | View only, search; cannot delete |
| **Item/Stock Management** | ✅ Read | View items and stock levels |
| **Payment Requests** | ✅ Limited | Create requests, cannot approve |
| **Credit Requests** | ✅ Limited | Create requests, cannot approve |
| **Refund Requests** | ✅ Limited | Create requests, cannot approve |
| **Sales Transactions** | ✅ Partial | View own transactions only |
| **File Uploads** | ✅ Limited | Upload files, view status |
| **Inactive Customers** | ❌ None | Cannot access |
| **Approval Center** | ❌ None | Cannot approve (can only request) |
| **Activity Log** | ❌ None | Cannot access |
| **Chat** | ✅ Full | Send/receive messages |
| **Notifications** | ✅ Full | View their notifications |
| **Settings** | ✅ Partial | Profile settings only |
| **Export/Reports** | ✅ Limited | Export own data only |

---

## 🌐 Login Instructions

### Step 1: Access Login Page
```
URL: http://localhost:3000/login
or
URL: http://localhost:3002/login
```

### Step 2: Enter Credentials
```
1. Username field: admin (or salesman)
2. Password field: Admin123! (or Sales123!)
3. Click "Sign In" button
```

### Step 3: Verify Login
You should see:
- ✅ Redirect to dashboard
- ✅ Sidebar with role-appropriate menu items
- ✅ Welcome message with user name
- ✅ Notification bell (top right)
- ✅ User profile dropdown (top right)

---

## 🎨 Login Page Features

### Admin Login Screen
```
┌─────────────────────────────────────┐
│                                     │
│          ALEM TRADING               │
│                                     │
│   Username: [admin          ]       │
│   Password: [●●●●●●●●●●●●]        │
│                                     │
│   [Sign In]                         │
│                                     │
│   Default Login:                    │
│   Username: admin                   │
│   Password: Admin123!               │
└─────────────────────────────────────┘
```

---

## 🔄 Session & Token Management

### Session Details
```
Access Token:
- Expiration: 1 hour (3600 seconds)
- Type: JWT (JSON Web Token)
- Format: Bearer token in Authorization header

Refresh Token:
- Expiration: 7 days
- Stored: Browser localStorage
- Auto-refresh: Before access token expires

Example Header:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Refresh Flow
```
1. User logs in → Receives access_token + refresh_token
2. User makes requests with access_token
3. After 55 minutes → Auto-refresh triggered
4. New access_token issued (no logout required)
5. After 7 days → User must re-login
```

---

## 📱 Dashboard View by Role

### ADMIN DASHBOARD
Shows:
- ✅ Total customers (all)
- ✅ Total sales (company-wide)
- ✅ Total assets
- ✅ Net profit
- ✅ Pending payments (all)
- ✅ Outstanding credits
- ✅ Pending refunds
- ✅ All charts and analytics
- ✅ Top customers (all)
- ✅ Top items (all)
- ✅ No-visit customers
- ✅ Pending approvals count
- ✅ Real-time KPIs

### SALES USER DASHBOARD
Shows:
- ⚠️ Total customers (customers they work with)
- ⚠️ Personal sales (their transactions only)
- ⚠️ Their pending requests
- ✅ Quick links to upload files
- ✅ Quick links to customer search
- ⚠️ Limited analytics
- ⚠️ Own performance metrics

---

## 🗂️ Menu Navigation by Role

### ADMIN SIDEBAR MENU
```
📊 Dashboard
👥 Users
👤 Customers
📦 Items
💳 Payments
💰 Credits
🔙 Refunds
💹 Transactions
📤 Uploads
⚠️  No-Visit Customers
✅ Approvals
📋 Activity Log
💬 Chat
🔔 Notifications
⚙️  Settings
```

### SALES SIDEBAR MENU
```
📊 Dashboard
👤 Customers
📦 Items
🛒 Sales
💬 Chat
🔔 Notifications
⚙️  Settings (profile only)
```

---

## 🔒 Security Considerations

### Password Requirements
```
✓ Minimum 8 characters
✓ At least one uppercase letter (A-Z)
✓ At least one lowercase letter (a-z)
✓ At least one number (0-9)
✓ At least one special character (!@#$%^&*)
✓ No spaces allowed
```

### Example Valid Passwords
```
✅ Admin123!        ← Used in system
✅ Sales@2024       ← Alternative format
✅ SecureP@ss99     ← Complex format
✅ Trading#2024     ← Complex format
```

### Example Invalid Passwords
```
❌ password         ← No uppercase, no number, no special char
❌ 12345678         ← Only numbers
❌ abcdefgh         ← Only lowercase letters
❌ Admin            ← Too short, no number, no special char
❌ Admin 123!       ← Contains space (not allowed)
```

---

## 🚀 First Login Workflow

### Admin First Login
```
1. Go to http://localhost:3000/login
2. Enter: admin / Admin123!
3. Click Sign In
4. See Admin Dashboard
5. Navigation shows all admin features
6. Can create additional users immediately
```

### Sales User First Login
```
1. Go to http://localhost:3000/login
2. Enter: salesman / Sales123!
3. Click Sign In
4. See Sales Dashboard
5. Navigation shows limited features
6. Can search customers and upload files
7. Cannot approve requests
```

---

## 👤 User Profile Management

### Access Profile
```
1. Click user avatar (top right corner)
2. Select "Profile" from dropdown
3. View current user information

OR

Admin Menu → Users → Click user row
```

### Update Profile (Self-Service)
```
Users can update:
✅ Full Name
✅ Phone Number
✅ Email Address
❌ Username (immutable)
❌ Role (admin only)
```

### Change Password
```
Menu → Settings → Change Password

Requirements:
- Current password (for verification)
- New password (must meet complexity rules)
- Confirm new password
```

---

## 🔐 Account Status Types

### Active ✅
- Account is fully functional
- User can login and use system

### Suspended ⏸️
- User cannot login
- Admin can unsuspend

### Released 📤
- User account deactivated
- Cannot login
- Admin can reactivate

### Terminated 🚫
- User account permanently disabled
- Cannot be reactivated

### Deleted 🗑️
- User records soft-deleted
- Still in database, marked inactive

---

## 📊 Creating Additional Users (Admin Only)

### Navigate to User Management
```
Admin Dashboard → Users → Create New User
```

### User Creation Form
```
Username:        [required, unique]
Email:           [required, valid email]
Full Name:       [required]
Phone:           [required]
Password:        [required, complex]
Role:            [Admin / Sales User]
Status:          [Active / Suspended]
```

### Example: Create New Sales User
```
Username:   agent03
Email:      agent03@alem-trading.com
Full Name:  Ahmed Hassan
Phone:      +251955000000
Password:   Agent@2024!
Role:       Sales User
Status:     Active

→ Click Create
→ New user receives confirmation
→ Can immediately login
```

---

## 🔄 Login Session Timeout

### Session Duration
```
Activity Timeout:   30 minutes of inactivity
Token Expiration:   1 hour
Auto-logout:        After 30 min inactivity
```

### Keep Session Active
```
Any action keeps session active:
✅ Click any button
✅ Type in form field
✅ Navigate to new page
✅ Send message in chat
✅ Load any data
```

### Force Logout
```
Click "Logout" in user menu
or
Close browser window
or
Let session timeout expire
```

---

## 🛡️ Multi-Device Login

### How It Works
```
✅ Same user can login from multiple devices
✅ Each device gets separate access token
✅ Logout on one device doesn't affect others
✅ Max concurrent sessions: Unlimited
```

### Example
```
Admin can be logged in from:
- Desktop browser
- Laptop browser  
- Mobile browser
- All simultaneously

Each has independent session/token
```

---

## 🔗 API Authentication

### Using Access Token
```bash
# After login, get accessToken
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123!"
  }'

# Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... }
}

# Use accessToken for API calls
curl -X GET http://localhost:3001/api/customers \
  -H "Authorization: Bearer eyJhbGc..."
```

### Refresh Expired Token
```bash
curl -X POST http://localhost:3001/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGc..."
  }'

# Response with new accessToken
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

---

## 🆘 Troubleshooting Login Issues

### Issue: "Invalid Credentials"
```
✓ Check username is correct
✓ Check password is correct
✓ Check CAPS LOCK is off
✓ Try copying/pasting credentials
✓ Verify user account status (not suspended)
```

### Issue: "User Not Found"
```
✓ Ensure user exists (check user list)
✓ Check username spelling
✓ Case-sensitive username check
✓ Ask admin to create user if needed
```

### Issue: "Token Expired"
```
✓ Automatic: System will refresh token
✓ If still shows: Logout and login again
✓ Clear browser cache (Ctrl+Shift+Del)
```

### Issue: "Cannot Access Feature"
```
✓ Check your user role
✓ That role may not have access
✓ Contact admin to change role
✓ Admins have full access
```

### Issue: "Session Timeout"
```
✓ Session expires after 30 minutes of inactivity
✓ Click anywhere to keep active
✓ Just login again if needed
✓ No data is lost
```

---

## 📞 Account Management Requests

### Request New Account (User)
```
Contact Admin:
1. Ask admin to create new user account
2. Provide: Full name, email, phone, desired role
3. Admin will send credentials
4. Change password on first login
```

### Reset Password (Admin Can Do)
```
Admin Dashboard → Users → Select User → Reset Password

User will:
1. Receive notification
2. Login with temporary password
3. Forced to change password immediately
```

### Unlock Account (Admin Can Do)
```
If account locked due to failed attempts:
1. Admin navigates to Users
2. Finds locked account
3. Clicks "Unlock"
4. Account becomes active again
```

---

## 🎓 Training Guide for New Users

### For New Admin
```
Day 1:
- Login with admin / Admin123!
- Explore all dashboard sections
- Create test user accounts
- Review activity log

Day 2:
- Manage customers
- Manage items/inventory
- Process test transactions

Day 3:
- Approve payment/credit/refund requests
- View analytics and reports
- Test email notifications
```

### For New Sales User
```
Day 1:
- Login with salesman / Sales123!
- Explore dashboard (limited view)
- Search for existing customers

Day 2:
- Learn file upload feature
- Upload sample Excel file
- Create payment requests

Day 3:
- Create customer entries
- Create item requests
- Practice chat messaging
```

---

## 📋 Complete Account Reference Table

| Role | Username | Password | Email | Full Name | Access Level |
|------|----------|----------|-------|-----------|--------------|
| Admin | admin | Admin123! | admin@alem-trading.com | System Administrator | 100% |
| Sales | salesman | Sales123! | sales@alem-trading.com | Sales Representative | 30% |
| Sales | agent01 | Agent@2024! | agent01@alem-trading.com | John Doe | 30% |
| Sales | agent02 | Agent@2024! | agent02@alem-trading.com | Jane Smith | 30% |

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Admin can login
- [ ] Sales user can login
- [ ] Admin sees full menu
- [ ] Sales user sees limited menu
- [ ] Dashboard displays correctly per role
- [ ] Admin can create new users
- [ ] Sales user cannot create users
- [ ] Both can access chat
- [ ] Both can access notifications
- [ ] Logout works for both
- [ ] Re-login works after logout
- [ ] Session management works
- [ ] Real-time features work (chat, notifications)

---

## 🎯 Summary

**You now have:**
✅ Two role-based test accounts
✅ Full understanding of access levels
✅ Login instructions
✅ Account management guide
✅ Security information
✅ Troubleshooting help

**Ready to use ALEM TRADING!** 🚀

Login now with:
- **Admin**: admin / Admin123!
- **Sales**: salesman / Sales123!
