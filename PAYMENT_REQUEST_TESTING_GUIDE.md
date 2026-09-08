# Payment Request Feature - Testing Guide
**Date**: July 30, 2026  
**Status**: Ready for Testing

---

## Quick Start

### Prerequisites
- ✅ Backend running on port 3001
- ✅ Frontend running on port 3000
- ✅ Database with customers loaded

---

## Step 1: Access Customer Search Page

1. Open browser and navigate to: `http://localhost:3000/sales/customer-search`
2. You should see:
   - Search box at top
   - "📋 All Customers (45)" section showing customer list
   - Customer cards in a grid format

---

## Step 2: Select a Customer

1. **Option A - Search**:
   - Type customer name in search box (e.g., "Fatima Ali")
   - Click "Search" button
   - Customer details appear below search box

2. **Option B - Click from List**:
   - Scroll down to "All Customers" section
   - Click on any customer card
   - Customer details appear below

---

## Step 3: Open Payment Request Modal

1. After selecting a customer, you'll see:
   - Customer info card (name, phone, address)
   - Balance, Credit, Refund cards
   - Two action buttons: **"Create Payment Request"** and **"View History"**

2. Click the **"Create Payment Request"** button

3. A modal dialog should open with title: **"Create Payment Request"**

---

## Step 4: Fill Payment Request Form

The form has these fields:

### **Customer** (Display only)
- Shows selected customer name

### **Amount** * (Required)
- Enter payment amount (e.g., 5000)
- Must be a positive number

### **Select Bank** * (Required)
- Click dropdown to see available banks:
  - Commercial Bank of Ethiopia
  - Dashen Bank
  - Awash International Bank
  - Bank of Abyssinia
  - Addis International Bank
  - Abyssinia Bank
  - United Bank
  - Wegagen Bank
  - **Telebirr** ← Mobile money option
  - **Sinqqee** ← Mobile money option
  - **Cash** ← Cash payment option
  - Other

### **Reason** * (Required)
- Enter payment reason (e.g., "Payment for goods sold")
- Textarea field

### **Date & Time** * (Required)
- Click datetime-local input
- Select date and time (e.g., today at 2:30 PM)
- Format: YYYY-MM-DDTHH:MM

### **Description** (Optional)
- Add additional notes about the payment
- Textarea field

---

## Step 5: Submit Payment Request

1. After filling all required fields, click **"Submit Request"** button

2. **Expected Result**:
   - Alert message appears: "Payment request created for [Customer Name]!"
   - Modal closes automatically
   - Form fields are cleared

3. **If validation fails**:
   - Alert shows specific error message
   - Modal remains open
   - Complete the missing required field and try again

---

## Step 6: Verify Payment Request Created

1. **Check Backend** (Optional):
   - Open terminal and run:
   ```bash
   curl http://localhost:3001/api/payments
   ```
   - Should return list of payment requests with status code 200

2. **Database Check** (Optional):
   - Use PgAdmin or psql to query:
   ```sql
   SELECT * FROM payment_requests ORDER BY createdAt DESC LIMIT 5;
   ```

---

## Test Cases

### ✅ Test 1: Basic Payment Request
- Customer: "Fatima Ali"
- Amount: 5000
- Bank: Telebirr
- Reason: Payment for goods
- Date: Today at 2:00 PM
- **Expected**: Success message

### ✅ Test 2: Payment with Cash
- Customer: "John Doe"
- Amount: 10000
- Bank: Cash
- Reason: Cash payment received
- Date: Today at 1:00 PM
- **Expected**: Success message

### ✅ Test 3: Sinqqee Mobile Money
- Customer: "Jane Smith"
- Amount: 2500
- Bank: Sinqqee
- Reason: Mobile money transfer
- Date: Today at 3:30 PM
- **Expected**: Success message

### ✅ Test 4: Validation - Missing Amount
- Select customer
- Leave Amount empty
- Try to submit
- **Expected**: "Please enter payment amount" alert

### ✅ Test 5: Validation - Missing Bank
- Customer: any
- Amount: 5000
- Leave Bank blank
- Try to submit
- **Expected**: "Please select a bank" alert

### ✅ Test 6: Validation - Missing Reason
- Customer: any
- Amount: 5000
- Bank: Telebirr
- Leave Reason empty
- Try to submit
- **Expected**: "Please enter reason" alert

### ✅ Test 7: Validation - Missing DateTime
- Customer: any
- Amount: 5000
- Bank: Telebirr
- Reason: any reason
- Leave Date & Time empty
- Try to submit
- **Expected**: "Please select date and time" alert

### ✅ Test 8: Optional Description
- Fill all required fields
- Add description: "Test description"
- Submit
- **Expected**: Success message

### ✅ Test 9: View History Modal
- Select customer
- Click "View History" button
- Modal should show transaction history
- **Expected**: Table of past transactions

### ✅ Test 10: Cancel Modal
- Click "Create Payment Request"
- Modal opens
- Click "Cancel" button or X button
- **Expected**: Modal closes without saving

---

## Troubleshooting

### Issue: Payment Request modal doesn't open
**Solution**:
1. Refresh page: `Ctrl+Shift+R` (hard refresh)
2. Check browser console for errors: `F12 → Console`
3. Verify backend is running: `http://localhost:3001/api/health`

### Issue: "Failed to create payment request" alert
**Solution**:
1. Check backend is running on port 3001
2. Verify customer ID is valid
3. Check browser console for network error details
4. Review backend logs: `npm run start:dev` output

### Issue: Bank dropdown shows no options
**Solution**:
1. Hard refresh: `Ctrl+Shift+R`
2. Clear browser cache
3. Check frontend code has all 12 banks

### Issue: Date picker doesn't work
**Solution**:
1. Use format: YYYY-MM-DDTHH:MM (e.g., 2024-07-30T14:30)
2. Try different browser if issue persists
3. Check browser console for JavaScript errors

---

## Success Indicators

✅ **Payment Request Feature is Working When**:
1. Modal opens without errors
2. All form fields render correctly
3. Bank dropdown shows all 12 options (including Telebirr, Sinqqee, Cash)
4. Validation messages appear for missing fields
5. Success alert appears after submission
6. Backend receives POST to `/api/payments` with status 201

---

## Performance Notes

- Modal should open instantly (<500ms)
- Form submission should complete within 1-2 seconds
- No console errors or warnings
- Smooth user experience

---

## Next Steps

1. ✅ **Complete all test cases above**
2. ✅ **Verify payment requests appear in database**
3. ✅ **Test Excel import with customer name detection**
4. ✅ **Deploy to production when all tests pass**

---

**Testing Completed**: [Date & Time]  
**Tester Name**: _______________  
**Status**: [ ] Pass [ ] Fail  
**Notes**: _______________________________________________

---

## Support

For issues or questions:
1. Check backend logs: Terminal running `npm run start:dev`
2. Check frontend logs: `F12 → Console tab`
3. Review database: PgAdmin at `http://localhost:5050`
4. Check API directly: `http://localhost:3001/api/payments`
