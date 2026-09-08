# 🚀 Excel Import - Quick Start Guide

## 📊 How to Use

### For Sales Users
1. **Go to:** `/sales/upload`
2. **Prepare Excel file** with columns:
   - Customer Name
   - Item Name
   - Quantity
   - Selling Price
   - Sold By
   - Branch (Warehouse/Shop)
   - Date
3. **Upload:** Drag-drop or click to select
4. **Review:** Check preview & summaries
5. **Done!** Transactions auto-created with stock updated

### For Admin Users
1. **Go to:** `/admin/uploads`
2. **Follow same steps as Sales Users**
3. **Access:** Allows bulk imports across all salespeople

---

## 📋 Required Excel Columns

| Column | Type | Example |
|--------|------|---------|
| Customer Name | Text | "John Doe" |
| Item Name | Text | "Rice" |
| Quantity | Number | 50 |
| Selling Price | Number | 35000 |
| Sold By | Text | "Ahmed" |
| Branch | Text | "Warehouse" or "Shop" |

**Optional Columns:**
- Date (defaults to today)
- Discount
- Tax
- Notes

---

## ✅ What Happens After Upload

1. ✓ System validates all rows
2. ✓ Auto-creates missing customers
3. ✓ Auto-creates missing items with category detection
4. ✓ Creates transaction records
5. ✓ Updates stock levels
6. ✓ Marks as imported for tracking

---

## 📊 Results Summary

You'll see:
- ✅ Count of successful imports
- ❌ Count of failed rows with reasons
- 📦 Items by category
- 🏢 Distribution by branch
- 👤 Transactions by salesperson

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| File won't upload | Ensure it's .xlsx or .xls format |
| Missing columns error | Check your Excel has all required headers |
| "Quantity must be positive" | Verify numbers are entered correctly |
| Branch not recognized | Use exactly "Warehouse" or "Shop" |
| Salesperson not found | Uses current user; create user first |

---

## 💡 Pro Tips

- ✓ Use consistent branch names ("Warehouse" / "Shop")
- ✓ Item names with keywords (rice, oil, etc.) auto-categorize
- ✓ Upload history saves 5 most recent imports
- ✓ View past imports anytime to check details
- ✓ Errors show row number for quick fixing

---

## 📱 View Modes

After upload:
- **Table View:** See all data in grid
- **Grid View:** See data as cards
- **Summary Panel:** Category/Branch breakdown

---

**Ready to bulk import? Head to `/sales/upload` or `/admin/uploads`! 🎉**
