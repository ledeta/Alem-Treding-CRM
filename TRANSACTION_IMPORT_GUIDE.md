# Transaction & Items Import Guide

## Overview
The Sales Dashboard now supports importing real transaction data (items purchased by customers) from Excel files. This allows you to populate the customer profile modal with actual purchase history.

## How It Works

### 1. Customer Import (First Step)
- Upload an Excel file with customer names in **Column B**
- System creates customers in the database
- Example: If your Excel has 10 customers, they'll be imported and appear in the "Customers List"

### 2. Transaction/Items Import (Second Step)
- Upload a **separate** Excel file with sales transaction data
- System automatically links transactions to customers by matching names
- Creates items in the database and associates them with the transactions

## Excel File Format for Transactions

Your Excel file should have the following columns (in any order):

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | Customer Name | Must match a customer name in the system | "Mame Negele" |
| B | Item Name | Product or item name | "SM LI plus s10" |
| C | Quantity | Number of units sold | 2 |
| D | Selling Price | Price per unit in ETB | 1000 |
| E | Sold By | Salesperson name | "Mame Negele" |
| F | Branch | Warehouse/branch location | "Warehouse 1" |
| G | Date | Transaction date | "2026-07-15" |

Additional optional columns (auto-detected):
- Discount (discount amount)
- Tax (tax amount)
- Notes (transaction notes)

## Step-by-Step Usage

### Step 1: Prepare Your Excel Files

**File 1: Customers (if not already imported)**
```
Name          Branch
Mame Negele   Warehouse 1
Hassan Mahmoud Shop 1
Abdulrahman Ahmed Warehouse 1
```

**File 2: Transactions**
```
Customer Name     Item Name          Qty  Price  Sold By      Branch       Date
Mame Negele       SM LI plus s10     2    1000   Mame Negele  Warehouse 1  2026-07-15
Mame Negele       SM A16 membrane    2    1000   Mame Negele  Warehouse 1  2026-07-15
Hassan Mahmoud    Oppo Reno 7 4g     7    5000   Mame Negele  Warehouse 1  2026-07-15
```

### Step 2: Upload Customers (if needed)
1. Click "📤 Choose File" in the "Import Customers from Excel" section
2. Select your customer Excel file
3. Wait for success message
4. Customers appear in the "Customers List"

### Step 3: Upload Transactions
1. Click "📦 Upload Transactions" in the "Import Sales Transactions & Items" section
2. Select your Excel file with transaction data
3. System automatically:
   - Reads all rows
   - Creates items (if they don't exist)
   - Links to matching customers
   - Records transactions as "Completed"

### Step 4: View Customer Purchase History
1. Click on any customer in the "Customers List"
2. Customer profile modal opens
3. Scroll to "Items Purchased" section
4. See all items purchased by that customer with full details:
   - Item name, SKU, Category
   - Quantity, Unit Price, Total Amount
   - Discount, Tax breakdown
   - Salesperson, Branch, Date

## API Endpoints

### Import Transactions
```
POST /api/transactions/import/sales
Content-Type: multipart/form-data

Body: File (Excel format)

Response: {
  success: true,
  message: "Successfully imported X transactions",
  data: {
    successCount: 15,
    failCount: 2,
    totalRows: 17,
    parseErrors: [...],
    importErrors: [...],
    categorySummary: {...},
    branchSummary: {...},
    salesPersonSummary: {...}
  }
}
```

## How Real Data is Displayed

### When User Clicks Customer Profile:
1. System calls `/api/transactions/by-customer/{customerId}`
2. If transactions found → Display real data
3. If no transactions found → Display demo/mock data (Mame Negele's 5 items)

### Transaction Data Includes:
- Item details (name, SKU, category)
- Quantity and pricing (unit price, discount, tax, total)
- Transaction metadata (date, branch, salesperson)
- Status (Completed, Pending, Cancelled)

## Troubleshooting

### "Missing required columns"
- Verify your Excel has: Customer Name, Item Name, Quantity, Selling Price, Sold By, Branch, Date
- Check column headers are exactly as specified (case-insensitive)

### "No matching customer found"
- Make sure customer name in transaction file matches exactly with imported customer names
- Import customers first, then import transactions
- Names are case-sensitive match

### "Import shows 0 transactions"
- Check that all required fields have values
- Verify no empty rows in the middle of data
- Ensure numeric fields (Qty, Price) are actually numbers, not text

### Transactions imported but not showing in profile
1. Refresh the browser (Ctrl+F5)
2. Click customer again to reload transactions
3. Check browser console for any errors (F12 → Console tab)
4. Verify transaction dates are valid

## Demo Mode

If no real transactions are imported, the system shows demo data (Mame Negele's 5 items) as an example of:
- How the UI looks
- What data structure to expect
- Transaction history format

This helps understand the feature even without real data.

## Creating Real Test Data

### Quick Test with Sample Data

**customers.xlsx:**
```
Name,Branch
Mame Negele,Warehouse 1
Hassan Mahmoud,Shop 1
```

**transactions.xlsx:**
```
Customer Name,Item Name,Quantity,Selling Price,Sold By,Branch,Date
Mame Negele,SM LI plus s10,2,1000,Mame Negele,Warehouse 1,2026-07-15
Mame Negele,SM A16 membrane,2,1000,Mame Negele,Warehouse 1,2026-07-15
Mame Negele,Oppo Reno 7 4g,7,1000,Mame Negele,Warehouse 1,2026-07-15
Mame Negele,REDMI 9T,2,1000,Mame Negele,Warehouse 1,2026-07-15
Mame Negele,SM A03 CORE,2,1000,Mame Negele,Warehouse 1,2026-07-15
Hassan Mahmoud,iPhone 13,1,15000,Mame Negele,Shop 1,2026-08-01
Hassan Mahmoud,Samsung Galaxy A21,2,8000,Mame Negele,Shop 1,2026-08-01
```

1. Create these files
2. Upload customers file first
3. Upload transactions file
4. View customer profiles to see items

## System Status

- ✅ Backend API: Ready for transaction imports
- ✅ Frontend: UI for transaction uploads implemented
- ✅ Database: Supports real transaction storage
- ✅ Mock Data: Demo data displays when no real data exists
- ✅ Auto-linking: Transactions linked to customers by name matching

## Next Steps

1. Prepare your Excel files with the correct format
2. Use the Sales Dashboard to import customers (if not done)
3. Use the Sales Dashboard to import transactions
4. Click on customer names to view their purchase history
5. Transactions are automatically linked and displayed beautifully

Need help? Check the column requirements above or contact support.
