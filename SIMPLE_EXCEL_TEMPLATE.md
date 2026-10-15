# 📊 Simple Excel Template for Shop Upload

## ⚠️ IMPORTANT: Required Columns

Your Excel file **MUST** have these exact column headers in **Row 1**:

```
Name | Category | Quantity | Price | Total | Sold By | Branch | Date
```

## ✅ Copy This Into Excel

**Just copy this text below (including headers) and paste into Excel:**

```
Name	Category	Quantity	Price	Total	Sold By	Branch	Date
Ethiopian Coffee	Beverages	15	250	3750	Ahmed Ali	Main Branch	10/13/2026
Green Tea	Beverages	25	120	3000	Fatima Hassan	North Branch	10/13/2026
White Rice	Grains	30	90	2700	Mohammed Yusuf	Main Branch	10/13/2026
Brown Rice	Grains	20	110	2200	Ahmed Ali	South Branch	10/12/2026
Cooking Oil	Oils	12	280	3360	Sara Ibrahim	Main Branch	10/13/2026
Olive Oil	Oils	8	450	3600	Fatima Hassan	North Branch	10/12/2026
White Sugar	Sugar	40	45	1800	Mohammed Yusuf	Main Branch	10/13/2026
Brown Sugar	Sugar	15	60	900	Ahmed Ali	Main Branch	10/13/2026
Milk	Dairy	50	35	1750	Sara Ibrahim	South Branch	10/12/2026
Cheese	Dairy	10	180	1800	Fatima Hassan	North Branch	10/13/2026
```

## 📝 Step-by-Step Instructions

### Step 1: Open Excel
- Open Microsoft Excel or LibreOffice Calc

### Step 2: Copy the Data
- **Select ALL the text above** (from "Name" to "10/13/2026")
- Press **Ctrl + C** to copy

### Step 3: Paste into Excel
- Click on cell **A1** in Excel
- Press **Ctrl + V** to paste
- The data should fill columns A through H

### Step 4: Save the File
- Click **File** → **Save As**
- Choose location: Desktop or Documents
- File name: `sales_data.xlsx`
- File type: **Excel Workbook (.xlsx)**
- Click **Save**

### Step 5: Upload to Shop
1. Open browser: http://localhost:3000
2. Login as sales user
3. Go to Shop page
4. Click "Upload Sales Excel"
5. Select your `sales_data.xlsx` file
6. Done! ✅

## 🎯 What You'll See After Upload

### List View:
```
┌─────────────────────────────────────────┐
│ 🛍️  Ethiopian Coffee                    │
│     Beverages                            │
│ [Qty: 15] [Ahmed Ali] [10/13/2026]     │
│                        3,750 ብር Details │
└─────────────────────────────────────────┘
```

### Click Item → Modal Shows:
```
✅ Quantity: 15 units
✅ Selling Price: 250 ብር per unit
✅ Total Price: 3,750 ብር
✅ Sold By: Ahmed Ali
✅ Branch: Main Branch
✅ Date: 10/13/2026
```

## 🔧 If Still Shows "0 units" or "N/A"

This means your Excel file doesn't have the correct column names. Please:

1. **Open your Excel file**
2. **Check Row 1** (the headers)
3. **Make sure it says EXACTLY:**
   - Column A: `Name`
   - Column B: `Category`
   - Column C: `Quantity`
   - Column D: `Price`
   - Column E: `Total`
   - Column F: `Sold By`
   - Column G: `Branch`
   - Column H: `Date`

4. **Capital letters don't matter**, but spelling does!
5. **No extra spaces** before or after column names

## ✅ Valid Column Name Variations

The system accepts these variations (case-insensitive):

**For Quantity:**
- Quantity, quantity, Qty, QTY

**For Price:**
- Price, price, Selling Price, Unit Price

**For Sold By:**
- Sold By, SoldBy, Sales, Sales Person, Seller

**For Branch:**
- Branch, Location, Store

**For Date:**
- Date, Sale Date, Sales Date

## 🚫 Common Mistakes

❌ **Wrong**: Using "Amount" instead of "Price"
✅ **Right**: Use "Price" or "Selling Price"

❌ **Wrong**: Using "Person" instead of "Sold By"
✅ **Right**: Use "Sold By" or "Sales" or "Sales Person"

❌ **Wrong**: Missing columns completely
✅ **Right**: All 8 columns must be present

❌ **Wrong**: Merged cells or complex formatting
✅ **Right**: Simple table with plain text

## 📞 Quick Test

**Easiest way to test:**
1. Copy the sample data above
2. Paste into Excel cell A1
3. Save as test.xlsx
4. Upload to Shop
5. Should work perfectly! ✅

---

**If it still doesn't work after following this guide, the issue is with your Excel file format, not the code!**

The system is working correctly - it just needs the proper Excel format with all 8 columns.
