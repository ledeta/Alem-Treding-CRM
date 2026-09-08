# Database Cleanup Guide

## Overview
This guide explains how to delete all customers and items from your ALEM CRM database to start fresh.

## ⚠️ WARNING
**This action is PERMANENT and CANNOT BE UNDONE. Make sure you have a backup if needed.**

---

## Option 1: Using Windows Batch Script (Easiest)

### Steps:
1. Make sure PostgreSQL is running
2. Double-click: `CLEAN_DATABASE.bat`
3. When prompted, type `yes` to confirm deletion
4. Wait for the script to complete
5. The database will be emptied and ready for new data

### What Gets Deleted:
- ✅ All customers (43 items removed)
- ✅ All items/products
- ✅ All sales transactions
- ✅ All customer balance records

---

## Option 2: Manual SQL Script

### Steps:
1. Open pgAdmin 4 or your PostgreSQL client
2. Connect to `alem_crm_db` database
3. Open `CLEAN_ALL_DATA.sql`
4. Execute the script

### File Location:
`c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system\CLEAN_ALL_DATA.sql`

---

## Option 3: Using Command Line

### Steps:
```bash
cd "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system"
psql -U postgres -d alem_crm_db -f CLEAN_ALL_DATA.sql
```

---

## After Cleanup

1. All customer records will be deleted
2. All items will be deleted
3. The database will be clean and empty
4. You can upload new customer data via the Sales Dashboard
5. The system will be ready for fresh use

---

## Verification

After running the cleanup, you should see:
- ✅ 0 customers in the database
- ✅ 0 items in the database
- ✅ 0 transactions

Visit **http://127.0.0.1:3000/customers** and the customer list should be empty.

---

## Troubleshooting

**Error: "psql: command not found"**
- PostgreSQL is not installed or not in PATH
- Solution: Run `psql` from PostgreSQL bin directory or install PostgreSQL

**Error: "FATAL: database does not exist"**
- Database name is incorrect
- Solution: Verify database name is `alem_crm_db`

**Error: "password authentication failed"**
- Wrong password for postgres user
- Solution: Check your PostgreSQL credentials

---

## Reverting Cleanup

**Cannot undo this operation.** If needed:
1. Restore from a backup
2. Reseed the database using `SEED_DATABASE.sql`

---

## Questions?
For support, contact the development team.
