# Quick Test Guide - Shop Upload Feature

## 🚀 Quick Start (5 Minutes)

### Step 1: Access the Application
1. Open browser: **http://localhost:3000**
2. Login with Sales credentials:
   - Username: `sales`
   - Password: `Sales@2024!`

### Step 2: Navigate to Shop
1. After login, you'll see the bottom navigation
2. Click the **purple "Shop" button** (shopping bag icon)
3. You should see the Shop page with "Items" and "Transactions" tabs

### Step 3: Test Empty State
✅ **What you should see:**
- "No items uploaded" message centered
- Large file/spreadsheet icon
- **Green "Upload Sales Excel" button centered below**
- "Supported formats: .xlsx, .xls" text

### Step 4: Create Test Excel File

#### Option A: Using Excel/LibreOffice
1. Open Excel or LibreOffice Calc
2. Create a new spreadsheet
3. Add headers in Row 1:
   ```
   Name | Category | Quantity | Price | Total
   ```
4. Add sample data (rows 2-6):
   ```
   Ethiopian Coffee | Beverages | 15 | 250 | 3750
   Green Tea | Beverages | 25 | 120 | 3000
   White Rice | Grains | 30 | 90 | 2700
   Brown Rice | Grains | 20 | 110 | 2200
   Cooking Oil | Oils | 12 | 280 | 3360
   ```
5. Save as: `test_sales.xlsx`

#### Option B: Quick Copy-Paste
1. Open Excel
2. Copy this data including headers:
   ```
   Name	Category	Quantity	Price	Total
   Ethiopian Coffee	Beverages	15	250	3750
   Green Tea	Beverages	25	120	3000
   White Rice	Grains	30	90	2700
   Brown Rice	Grains	20	110	2200
   Cooking Oil	Oils	12	280	3360
   Olive Oil	Oils	8	450	3600
   White Sugar	Sugar	40	45	1800
   Brown Sugar	Sugar	15	60	900
   ```
3. Paste into Excel starting at cell A1
4. Save as: `test_sales.xlsx`

### Step 5: Upload Excel File
1. Click **"Upload Sales Excel"** button
2. Select your `test_sales.xlsx` file
3. Click Open

### Step 6: Verify Upload Success

✅ **What you should see:**

#### Summary Card (Top - Green Gradient):
- "Sales Summary" heading
- File/spreadsheet icon
- "5 items uploaded" (or however many you added)
- Total amount box showing grand total in ബര്

#### Category: Beverages
- White card header with purple package icon
- "Beverages" heading
- "2 items" count
- Total: "6,750 ብር"
- Two item cards:
  - Ethiopian Coffee (Qty: 15, Price: 250, Total: 3,750)
  - Green Tea (Qty: 25, Price: 120, Total: 3,000)

#### Category: Grains
- White card header
- "Grains" heading
- "2 items" count
- Total: "4,900 ብር"
- Two item cards

#### Category: Oils
- "1 item" count
- Item cards

### Step 7: Test Clear Function
1. Look at top-right of screen
2. Click **red "Clear" button** with X icon
3. All uploaded data should disappear
4. Back to empty state with centered upload button

### Step 8: Test File Type Validation
1. Try uploading a `.txt` or `.csv` file
2. ✅ **Should see red error message:**
   - "Please upload only Excel files (.xlsx or .xls)"
   - Message disappears after 3 seconds

## 🎯 What to Look For

### ✅ Success Indicators
- [ ] Upload button centered in empty state
- [ ] Upload button hidden after successful upload
- [ ] Clear button appears in header
- [ ] Items grouped by category
- [ ] Summary card shows correct totals
- [ ] Category headers show item counts
- [ ] Item cards display all information
- [ ] Currency shown as ብር (Ethiopian Birr)
- [ ] Professional gradient designs
- [ ] Smooth scrolling on mobile
- [ ] Error message for wrong file types

### ❌ Potential Issues

**Issue**: Button not centered
- **Check**: Make sure no items are uploaded (try Clear button)

**Issue**: File not uploading
- **Check**: File must be .xlsx or .xls format (not CSV)

**Issue**: Data not displaying
- **Check**: Excel file must have correct column headers

**Issue**: Totals incorrect
- **Check**: Ensure Price and Quantity are numbers, not text

## 📱 Mobile Testing

### On Phone/Tablet:
1. Access: **http://[YOUR-IP]:3000**
2. Login as sales user
3. Navigate to Shop
4. Test upload with Excel file from cloud storage
5. Verify:
   - Touch-friendly buttons (easy to tap)
   - Cards stack nicely
   - Text is readable
   - No horizontal scrolling
   - Smooth scrolling

## 🎨 Visual Checklist

### Empty State:
- [ ] White background for shop icon
- [ ] Purple gradient background page
- [ ] Large centered spreadsheet icon (white, semi-transparent)
- [ ] "No items uploaded" text (white, bold)
- [ ] Green gradient upload button (centered)
- [ ] Shadow effect on button

### With Data:
- [ ] Green gradient summary card at top
- [ ] White category header cards
- [ ] Purple gradient category icons
- [ ] White item cards with shadows
- [ ] Gray badges for quantity and price
- [ ] Purple gradient for item totals
- [ ] Professional spacing between elements

### Header:
- [ ] Shopping bag icon (purple)
- [ ] "Shop" title (black, bold)
- [ ] Clear button (red gradient) when data exists

### Tabs:
- [ ] "Items" tab with shopping bag icon
- [ ] "Transactions" tab with receipt icon
- [ ] Active tab: purple gradient
- [ ] Inactive tab: white with gray border

## 🔧 Technical Verification

### Browser Console (F12):
- Check for errors (should be none)
- localStorage key: `uploaded_sales_items`
- Data structure should be JSON array

### Network Tab:
- No API calls on upload (local processing)
- Page loads correctly

### Responsive Design:
- Test on different screen sizes
- Use Chrome DevTools Device Mode
- Try different zoom levels

## 📊 Sample Test Data

### Minimal Test (3 items):
```
Name,Category,Quantity,Price,Total
Coffee,Beverages,10,100,1000
Tea,Beverages,20,50,1000
Sugar,Groceries,5,80,400
```

### Full Test (10 items, 4 categories):
```
Name,Category,Quantity,Price,Total
Ethiopian Coffee,Beverages,15,250,3750
Green Tea,Beverages,25,120,3000
Black Tea,Beverages,30,80,2400
White Rice,Grains,30,90,2700
Brown Rice,Grains,20,110,2200
Cooking Oil,Oils,12,280,3360
Olive Oil,Oils,8,450,3600
White Sugar,Sugar,40,45,1800
Brown Sugar,Sugar,15,60,900
Honey,Sugar,10,350,3500
```

## ✅ Test Complete Checklist

- [ ] Application loads at localhost:3000
- [ ] Sales login works
- [ ] Shop page accessible from bottom nav
- [ ] Empty state shows centered upload button
- [ ] Excel file uploads successfully
- [ ] Items display grouped by category
- [ ] Summary card shows correct totals
- [ ] Category headers show counts and totals
- [ ] Item cards show all details correctly
- [ ] Clear button removes all data
- [ ] Upload button reappears after clear
- [ ] Non-Excel files are rejected
- [ ] Error messages display and dismiss
- [ ] Mobile layout looks professional
- [ ] No console errors
- [ ] Data persists on page refresh

## 🎉 Expected Final Result

After uploading the full test data (10 items), you should see:

**Summary Card:**
- 10 items uploaded
- Total: 26,210 ብር

**Categories (4):**
1. **Beverages** - 3 items, 9,150 ብር
2. **Grains** - 2 items, 4,900 ብር
3. **Oils** - 2 items, 6,960 ብር
4. **Sugar** - 3 items, 6,200 ብር

**UI Quality:**
- Professional gradients
- Clean white cards
- Good spacing
- Easy to read
- Touch-friendly
- Fast and responsive

---

**Test Duration**: 5-10 minutes  
**Difficulty**: Easy  
**Status**: Ready to Test ✅
