# Sales Upload Excel Template Guide

## Overview
This guide explains how to format your Excel file for uploading sales data to the Shop section.

## Excel File Format

### Required Columns
Your Excel file should contain the following columns (column names are case-insensitive):

| Column Name | Alternative Names | Description | Example |
|------------|-------------------|-------------|---------|
| **Name** | name, ItemName, Item Name | Product/item name | "Coffee Beans" |
| **Category** | category | Product category | "Beverages" |
| **Quantity** | quantity, Qty | Number of items sold | 10 |
| **Price** | price, UnitPrice, Unit Price | Price per unit | 150 |
| **Total** | total | Total amount (optional, auto-calculated if missing) | 1500 |

### Example Excel Structure

```
| Name          | Category   | Quantity | Price | Total |
|---------------|------------|----------|-------|-------|
| Coffee Beans  | Beverages  | 10       | 150   | 1500  |
| Tea Bags      | Beverages  | 20       | 50    | 1000  |
| Sugar         | Groceries  | 15       | 30    | 450   |
| Rice          | Groceries  | 25       | 80    | 2000  |
| Cooking Oil   | Groceries  | 8        | 200   | 1600  |
```

## Features

### ✅ Automatic Calculations
- If the **Total** column is missing or empty, the system will automatically calculate it as `Quantity × Price`

### ✅ Category Grouping
- Items are automatically grouped by category
- Each category shows its total amount
- Professional mobile-optimized display

### ✅ Summary Display
- Total number of items uploaded
- Grand total amount across all categories
- Category-wise breakdown

### ✅ File Validation
- Only Excel files (.xlsx, .xls) are accepted
- Clear error messages for invalid files
- File type validation before processing

## How to Upload

1. **Navigate to Shop Page**
   - Log in as Sales user
   - Click on "Shop" button in bottom navigation

2. **Upload Excel File**
   - Click the green "Upload Sales Excel" button
   - Select your Excel file (.xlsx or .xls)
   - File will be processed automatically

3. **View Uploaded Data**
   - Items are displayed grouped by category
   - Each category shows:
     - Number of items
     - Category total amount
     - Individual item details
   - Summary card at the top shows grand total

4. **Clear Data**
   - Click the red "Clear" button in the header to remove all uploaded items
   - Upload a new file to replace existing data

## Tips

### ✅ Best Practices
- Use clear, descriptive product names
- Keep category names consistent (e.g., always use "Beverages" not "beverage" or "Drinks")
- Ensure quantities and prices are numeric values
- Double-check totals before uploading

### ⚠️ Common Mistakes
- Using non-Excel file formats (CSV, TXT) - Convert to .xlsx first
- Missing required columns (Name, Category, Quantity, Price)
- Non-numeric values in Quantity, Price, or Total columns
- Blank rows in the middle of data

### 🎯 Column Name Flexibility
The system accepts multiple column name variations:
- **Name**: name, ItemName, Item Name
- **Category**: category
- **Quantity**: quantity, Qty
- **Price**: price, UnitPrice, Unit Price
- **Total**: total

## Sample Data for Testing

Create an Excel file with this sample data to test the upload feature:

```excel
Name                Category        Quantity    Price   Total
Ethiopian Coffee    Beverages       15          250     3750
Green Tea          Beverages       25          120     3000
White Rice         Grains          30          90      2700
Brown Rice         Grains          20          110     2200
Cooking Oil        Oils            12          280     3360
Olive Oil          Oils            8           450     3600
White Sugar        Sugar           40          45      1800
Brown Sugar        Sugar           15          60      900
```

## Mobile Optimization

The upload interface is fully optimized for mobile devices:
- ✅ Touch-friendly buttons
- ✅ Responsive layout
- ✅ Clear, large fonts
- ✅ Professional gradient designs
- ✅ Easy-to-read item cards
- ✅ Smooth scrolling
- ✅ Category-based organization

## Data Persistence

- Uploaded data is saved to browser localStorage
- Data persists across page refreshes
- Use the "Clear" button to remove uploaded data
- Uploading a new file replaces the previous upload

## Troubleshooting

### File Not Uploading
- Ensure file is .xlsx or .xls format
- Check that file is not corrupted
- Try re-saving the Excel file

### Data Not Displaying Correctly
- Verify column names match the required format
- Check for blank rows or columns
- Ensure numeric columns contain only numbers

### "Error Processing File" Message
- Open the Excel file and check for formatting issues
- Remove any merged cells
- Ensure data starts from row 1 (header row)

## Support

For issues or questions about the upload feature:
1. Check this guide first
2. Verify your Excel file format
3. Try the sample data template above
4. Contact system administrator if problems persist
