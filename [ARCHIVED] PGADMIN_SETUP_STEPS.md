# PostgreSQL Database Setup Using pgAdmin

Since the command-line approach isn't working, follow these **exact steps** in pgAdmin:

---

## Method 1: Simple GUI Method (Easiest!)

### Step 1: Open pgAdmin
- Wait for pgAdmin to fully load (may take 30-60 seconds)

### Step 2: Create Database
1. In the left panel, expand **Servers**
2. Expand **PostgreSQL 18** (you may be prompted for password - enter: `postgres`)
3. Right-click on **Databases**
4. Select **Create** → **Database...**

### Step 3: Configure Database
1. In the "Database" field, type: `alem_crm`
2. Leave "Owner" as: `postgres`
3. Click **Save**

### Step 4: Load Schema
1. In the left panel, click on the `alem_crm` database you just created
2. Click **Tools** menu at the top
3. Select **Query Tool**
4. In the Query Tool window, click the **folder icon** (Open File)
5. Navigate to: `c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\database\schema.sql`
6. Click **Open**
7. Click the **▶ Execute** button (or press F5)
8. Wait for completion (~5 seconds)
9. You should see: "Query returned successfully"

### Step 5: Verify
In the Query Tool, run this command:
```sql
SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';
```

You should see: **18** (meaning 18 tables were created)

---

## Method 2: Copy-Paste SQL Method

If Method 1 is confusing, use this simpler approach:

### Step 1: Create Database Using Query Tool

1. Open pgAdmin
2. In left panel, expand **Servers** → **PostgreSQL 18**
3. Click on **postgres** database (not Databases, but the actual postgres database)
4. Click **Tools** → **Query Tool**
5. Copy this command:
   ```sql
   CREATE DATABASE alem_crm;
   ```
6. Paste into the Query Tool
7. Click **▶ Execute** (F5)
8. You should see: "CREATE DATABASE"

### Step 2: Connect to New Database

1. In the left panel, right-click **Databases**
2. Click **Refresh**
3. You should now see `alem_crm` in the list
4. Click on `alem_crm` database
5. Click **Tools** → **Query Tool**

### Step 3: Load Schema

**Option A - Load File:**
1. Click folder icon → Open File
2. Select: `database\schema.sql`
3. Click Execute

**Option B - Copy-Paste:**
1. Open `database\schema.sql` in Notepad
2. Select All (Ctrl+A)
3. Copy (Ctrl+C)
4. Paste into pgAdmin Query Tool
5. Click Execute

---

## After Database is Created

Once you see "Query returned successfully", the database is ready!

### Next Steps:

**1. Install NestJS CLI** (in Command Prompt):
```cmd
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\backend"
npm install --save-dev @nestjs/cli
```

**2. Install Frontend Dependencies** (in Command Prompt):
```cmd
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\frontend"
npm install --legacy-peer-deps
```

**3. Start Backend** (Terminal 1):
```cmd
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\backend"
npm run start:dev
```

**4. Start Frontend** (Terminal 2):
```cmd
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\frontend"
npm run dev
```

**5. Open Browser:**
```
http://localhost:3000
```

---

## Troubleshooting

### Can't connect to PostgreSQL 18 in pgAdmin?

1. Right-click **PostgreSQL 18** in left panel
2. Select **Connect Server**
3. Enter password (default: `postgres`)

### Password doesn't work?

1. You may have set a different password during PostgreSQL installation
2. Try your Windows password
3. Try leaving it blank

### "Database already exists" error?

That's OK! It means the database was created. Skip to Step 4 (Load Schema).

### Schema loading fails?

Make sure you:
1. Are connected to `alem_crm` database (not postgres)
2. The schema.sql file path is correct
3. You have the file open in the Query Tool

---

## Visual Guide

### Finding the Query Tool:
```
pgAdmin Window
├── Menu Bar
│   └── Tools
│       └── Query Tool ← Click here
```

### Creating Database:
```
Left Panel
└── Servers
    └── PostgreSQL 18
        └── Databases ← Right-click here
            └── Create
                └── Database... ← Click here
```

### Loading Schema:
```
Query Tool Window
├── Toolbar
│   └── 📁 (folder icon) ← Click to open file
└── Or paste SQL code here
```

---

## Expected Result

After completing all steps, you should have:

- ✅ Database: `alem_crm` created
- ✅ Tables: 18 tables created
  - roles
  - users
  - refresh_tokens
  - customers
  - customer_balances
  - items
  - stock
  - stock_transactions
  - sales_transactions
  - payment_requests
  - credit_requests
  - refund_requests
  - uploaded_files
  - chat_messages
  - chat_reactions
  - notifications
  - audit_logs
  - customer_no_visits
- ✅ Views: 3 views created
  - customer_summary
  - dashboard_kpis
  - pending_approvals
- ✅ Indexes: 30+ indexes created
- ✅ Initial Data: 2 roles (Admin, Sales User)

---

## Quick Verification

Run this in pgAdmin Query Tool (connected to alem_crm):

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check roles
SELECT * FROM roles;
```

You should see:
- 18 table names listed
- 2 roles: Admin and Sales User

---

## If Everything Fails

If pgAdmin is too confusing or not working:

**Alternative: Use SQL Shell (psql)**

1. Search Windows for "SQL Shell (psql)"
2. Press Enter 4 times (accept defaults)
3. Enter your PostgreSQL password
4. Run these commands:

```sql
CREATE DATABASE alem_crm;
\c alem_crm
\i 'c:/Users/Milion''s/Desktop/Alem Trading/alem-crm-system/database/schema.sql'
```

---

## Need More Help?

If you're still stuck, take a screenshot of the error message and I can help you troubleshoot.

Common issues:
- Wrong password
- PostgreSQL service not running
- File path incorrect
- Not connected to the right database

---

**Once database is created, you're 80% done! The rest is just npm install and starting servers.** 🚀
