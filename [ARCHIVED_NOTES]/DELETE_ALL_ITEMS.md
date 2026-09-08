# Delete All Items from Database

## Overview
This guide explains how to delete all items (products) from your ALEM CRM database.

## ⚠️ WARNING
**This action is PERMANENT and CANNOT BE UNDONE. Make sure you have a backup if needed.**

## Current Status
- **Items in Database**: 33
- **Customers**: 53 (will be preserved)
- **Transactions**: 315+ (will be deleted - linked to items)

---

## Option 1: Using Windows Batch Script (Easiest)

### Steps:
1. Navigate to: `c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system`
2. Double-click: `CLEAN_ITEMS.bat`
3. When prompted, type `yes` to confirm deletion
4. Wait for the script to complete

### What Gets Deleted:
- ✅ All 33 items/products
- ✅ All 315+ sales transactions (linked to items)
- ❌ Customers will NOT be deleted (preserved)

---

## Option 2: Using PowerShell Script

### Steps:
1. Open PowerShell in the project directory
2. Run: `.\CLEAN_ITEMS.ps1`
3. Type `yes` when prompted
4. Wait for completion

---

## Option 3: Manual SQL

### Steps:
1. Open pgAdmin 4
2. Connect to `alem_crm_db`
3. Open and run: `CLEAN_ITEMS.sql`

---

## After Cleanup

1. **Items page will be empty**: http://127.0.0.1:3000/items
2. **Customers remain intact**: All 53 customers preserved
3. **Transaction history cleared**: But customer data stays
4. Database is ready for fresh item imports

---

## Verification

After running the cleanup:
- Items in database: **0**
- Customers in database: **53** (unchanged)
- Transactions in database: **0**

---

## Files Created

1. **CLEAN_ITEMS.bat** - Windows batch script (easiest)
2. **CLEAN_ITEMS.ps1** - PowerShell script
3. **CLEAN_ITEMS.sql** - Raw SQL script

Choose whichever method you prefer!
