# Testing Guide - Excel Upload Feature

## 📋 Test Scenarios

### Test 1: Successful Upload with Valid Excel File

**Setup**:
1. Create a test Excel file (test-customers.xlsx)
2. In Column B, add customer names:
   - Row 1: Headers (e.g., "ID" in A1, "Customer Name" in B1)
   - Row 2: "Ahmed Hassan"
   - Row 3: "Fatima Ali"
   - Row 4: "Mohammed Ismail"
   - Row 5: "Zainab Yusuf"

**Steps**:
1. Navigate to Sales Dashboard (`/sales`)
2. Click "📤 Choose File" button
3. Select test-customers.xlsx
4. Observe upload progress

**Expected Results** ✅:
- [ ] File name appears: "test-customers.xlsx"
- [ ] Upload button shows spinner animation
- [ ] Success message appears: "✅ Successfully imported 4 customers from test-customers.xlsx"
- [ ] Customer count updates in search section
- [ ] All 4 customers appear as cards in the grid below
- [ ] Cards display with correct initials (A, F, M, Z)

---

### Test 2: Duplicate Prevention

**Setup**:
1. Create Excel file with duplicate names:
   - Row 1: Headers
   - Row 2: "Ahmed Hassan"
   - Row 3: "Ahmed Hassan"
   - Row 4: "Ahmed Hassan"
   - Row 5: "Fatima Ali"

**Steps**:
1. Click "📤 Choose File"
2. Select duplicate test file
3. Wait for completion

**Expected Results** ✅:
- [ ] Success message shows: "✅ Successfully imported 2 customers..."
- [ ] Only 2 unique customers appear (Ahmed Hassan, Fatima Ali)
- [ ] No duplicate cards displayed
- [ ] Message accurately reflects deduplicated count

---

### Test 3: File Type Validation

**Steps**:
1. Click "📤 Choose File"
2. Try to select a .txt file
3. Repeat with .pdf file

**Expected Results** ✅:
- [ ] Error message: "❌ Invalid file format. Please upload an Excel file..."
- [ ] No upload attempt made
- [ ] Error appears in red banner

---

### Test 4: Empty Column B Error

**Setup**:
1. Create Excel file without Column B data:
   - Row 1: Headers (e.g., "ID" in A1, empty B1)
   - Row 2-5: Data in Column A only, Column B empty

**Steps**:
1. Click "📤 Choose File"
2. Select the empty Column B file

**Expected Results** ✅:
- [ ] Error message: "❌ No customer names found in column B..."
- [ ] No customers added
- [ ] File input is reset (empty)

---

### Test 5: Search Functionality

**Steps**:
1. After successful upload (Test 1)
2. Click search box under "🔍 Find Customer"
3. Type "Ahmed"
4. Type "Fata"
5. Clear search

**Expected Results** ✅:
- [ ] Typing "Ahmed" shows only Ahmed Hassan card
- [ ] Typing "Fata" shows only Fatima Ali card
- [ ] Search is case-insensitive (try "AHMED", "fatima")
- [ ] Counter shows "X of Y customers"
- [ ] Clearing search shows all customers again

---

### Test 6: Customer Card Interactions

**Steps**:
1. Hover over a customer card
2. Observe hover effects
3. Click on the card

**Expected Results** ✅:
- [ ] Card scales up (105%)
- [ ] Shadow increases
- [ ] Top decorative bar appears (gradient)
- [ ] "View Full Profile" text appears
- [ ] Avatar border changes to yellow
- [ ] Background shines with gradient
- [ ] Modal opens when clicked

---

### Test 7: Customer Profile Modal

**Steps**:
1. Click any customer card (after successful upload)
2. Observe modal content
3. Test close button
4. Test contact button

**Expected Results** ✅:
- [ ] Large animated header appears with gradient
- [ ] Large customer avatar displays (5x card size)
- [ ] Customer name shown in white text
- [ ] "⭐ Premium Customer" badge visible
- [ ] Customer ID card displays with icon
- [ ] Status shows "🟢 Active" with pulsing dot
- [ ] "Recently" timestamp visible
- [ ] Both buttons functional
- [ ] Close button (✕) works
- [ ] Modal closes when buttons clicked
- [ ] Footer text: "Imported from Excel • Customer data verified"

---

### Test 8: Responsive Design

**Mobile (< 768px)**:
- [ ] Upload section displays fully
- [ ] Customer cards show 1 per row
- [ ] Modal fits screen with padding
- [ ] All buttons clickable

**Tablet (768px - 1024px)**:
- [ ] Customer cards show 2 per row
- [ ] Modal centered with padding
- [ ] All elements readable

**Desktop (1024px+)**:
- [ ] Customer cards show 3-4 per row
- [ ] Modal centered at max-width 2xl
- [ ] All animations smooth

**Expected Results** ✅:
- [ ] Responsive on all screen sizes
- [ ] No horizontal scroll
- [ ] All text readable
- [ ] Buttons accessible
- [ ] Modal properly positioned

---

### Test 9: Error Recovery

**Steps**:
1. Click upload, select invalid file
2. See error message
3. Click upload again, select valid file

**Expected Results** ✅:
- [ ] First attempt shows error
- [ ] Error message properly displayed
- [ ] Can upload again without issues
- [ ] Second upload succeeds normally
- [ ] No lingering error states

---

### Test 10: Large File Upload

**Setup**:
1. Create Excel file with 1000+ customer names in Column B

**Steps**:
1. Click upload
2. Select large file
3. Monitor browser performance

**Expected Results** ✅:
- [ ] File processes without hanging
- [ ] Success message with correct count
- [ ] No browser freezing
- [ ] Customers display in grid
- [ ] Animations still smooth

---

### Test 11: CSV File Upload

**Setup**:
1. Create CSV file with customer names in Column B
   ```
   ID,Customer Name
   1,Ahmed Hassan
   2,Fatima Ali
   3,Mohammed Ismail
   ```

**Steps**:
1. Click "📤 Choose File"
2. Select CSV file

**Expected Results** ✅:
- [ ] CSV file accepted
- [ ] Column B names extracted correctly
- [ ] Success message displays
- [ ] Customers added to system

---

### Test 12: Browser Console Check

**Steps**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Perform all upload tests
4. Look for errors

**Expected Results** ✅:
- [ ] No JavaScript errors
- [ ] No network errors (200 status for API)
- [ ] Clean console output
- [ ] Proper async/await handling

---

## 🎯 Manual Testing Checklist

### Visual Design
- [ ] Upload section has blue gradient
- [ ] Cards have purple/pink gradient
- [ ] Modal has multi-color header
- [ ] All icons display correctly
- [ ] Spacing looks professional
- [ ] Colors are vibrant and clear
- [ ] Text sizes are appropriate

### Functionality
- [ ] File upload works
- [ ] Column B detection works
- [ ] Duplicates prevented
- [ ] Search filters correctly
- [ ] Modal opens/closes
- [ ] Buttons are clickable
- [ ] Animations are smooth

### Performance
- [ ] Upload completes quickly
- [ ] UI responsive to clicks
- [ ] Animations smooth (60fps)
- [ ] No lag or stuttering
- [ ] Page loads quickly
- [ ] Search responds instantly

### Error Handling
- [ ] Invalid files rejected
- [ ] Empty column B caught
- [ ] API errors handled
- [ ] Network errors handled
- [ ] User feedback clear

---

## 📊 Sample Test Data

### Basic Test (4 customers):
```
ID | Customer Name
---|----------------
1  | Ahmed Hassan
2  | Fatima Ali
3  | Mohammed Ismail
4  | Zainab Yusuf
```

### Duplicate Test:
```
ID | Customer Name
---|----------------
1  | Ahmed Hassan
2  | Ahmed Hassan
3  | Ahmed Hassan
4  | Fatima Ali
```

### Large Test (10 customers):
```
ID | Customer Name
---|-------------------------
1  | Ahmed Hassan
2  | Fatima Ali
3  | Mohammed Ismail
4  | Zainab Yusuf
5  | Karim Abdallah
6  | Layla Hassan
7  | Hassan Mohammed
8  | Noor Mahmoud
9  | Salim Ahmed
10 | Hana Rashid
```

---

## 🐛 Common Issues & Solutions

### Issue: File not accepted
**Solution**: Check file is .xlsx, .xls, or .csv (not .xlsm)

### Issue: Column B not detected
**Solution**: Ensure customer names are in Column B, not elsewhere

### Issue: Upload shows error "HTTP 400"
**Solution**: Backend may not be running. Start with: `npm run start:dev` from backend folder

### Issue: Customers not appearing
**Solution**: Check browser console for errors. Verify API endpoint is correct.

### Issue: Modal doesn't open
**Solution**: Ensure customer card is fully rendered. Try refreshing page.

### Issue: Slow file processing
**Solution**: Large files (>10k rows) may take time. Is normal.

---

## ✅ Sign-off Checklist

Once all tests pass:

- [ ] All 12 test scenarios passed
- [ ] No console errors
- [ ] Responsive on mobile/tablet/desktop
- [ ] Performance acceptable
- [ ] Error messages clear
- [ ] UI looks professional
- [ ] Animations smooth
- [ ] Ready for production

---

**Ready to Test?** 🚀 Start with Test 1 and work through sequentially!

**Questions?** Check the `SALES_PAGE_EXCEL_UPLOAD_GUIDE.md` for detailed feature documentation.
