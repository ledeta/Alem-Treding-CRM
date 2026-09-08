# Quick Test - Approvals Page API Integration

**Status**: ✅ Ready to Test  
**Time to Complete**: 5-10 minutes  

---

## Testing Instructions

### 1. Verify Backend is Running

```bash
# Check if backend is running on port 3001
curl http://localhost:3001/api/approvals -H "Authorization: Bearer YOUR_TOKEN"

# Or check in browser DevTools Console:
# Navigate to approvals page and check Network tab
```

### 2. Test Approvals Page

**Step 1**: Open Approvals page  
```
URL: http://localhost:3000/approvals
```

**Step 2**: Verify page loads without 401 error  
- Page should load with loading spinner
- After 2-3 seconds, should display approval data
- Stats cards should show totals

**Step 3**: Check Network requests  
**Browser DevTools** → **Network** tab:
- Should see GET request to `/api/approvals?page=1&limit=50`
- Response status: **200** (not 401)
- Response headers should contain: `authorization: Bearer eyJ...`

### 3. Test Search & Filters

**Search Test**:
```
Type in search box: "credit"
Expected: Should filter to matching approvals
```

**Status Filter Test**:
```
Click "Pending" button
Expected: Only pending approvals shown

Click "Approved" button
Expected: Only approved approvals shown

Click "All" button
Expected: All approvals shown
```

### 4. Test Approve/Reject

**Approve Test**:
```
1. Find a Pending approval
2. Click "✓ Approve" button
3. Expected: 
   - Button disappears
   - Status badge shows "Approved"
   - Stats update (Pending -1, Approved +1)
   - Network tab shows PUT request to /api/approvals/{id}/approve
```

**Reject Test**:
```
1. Find another Pending approval
2. Click "✕ Reject" button
3. Expected:
   - Button disappears
   - Status badge shows "Rejected"
   - Stats update (Pending -1, Rejected +1)
   - Network tab shows PUT request with decision: 'rejected'
```

### 5. Test 401 Redirect

**Without Token**:
```
1. Clear localStorage
localStorage.clear()

2. Refresh approvals page
3. Expected: Redirects to /login
```

**With Expired Token**:
```
1. Backend returns 401
2. Expected: Token cleared and redirected to login
```

---

## Expected Network Requests

### Successful Flow

**Request 1**: List Approvals
```
GET /api/approvals?page=1&limit=50
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json

Response 200:
{
  "data": [
    {
      "id": 1,
      "type": "Credit Request",
      "description": "Customer credit limit increase",
      "amount": 50000,
      "requesterName": "Almaz Teshome",
      "status": "Pending",
      "createdAt": "2026-08-17T10:30:00Z",
      "dueDate": "2026-08-20T23:59:59Z"
    }
  ]
}
```

**Request 2**: Approve (After clicking approve button)
```
PUT /api/approvals/1/approve
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json

Body:
{
  "decision": "approved",
  "notes": ""
}

Response 200:
{
  "id": 1,
  "status": "Approved",
  ...
}
```

---

## Troubleshooting

### Issue: 401 Unauthorized Error Still Shows

**Solution 1**: Ensure backend is running
```bash
cd backend
npm run start:prod
```

**Solution 2**: Clear browser cache
- DevTools → Application → Storage → Clear all

**Solution 3**: Check token is in localStorage
```javascript
// In browser console:
localStorage.getItem('token')
// Should return a JWT token starting with "eyJ"
```

### Issue: Page Shows "No approvals found"

**Possible Causes**:
1. No approvals in database yet
2. API returns empty array
3. Response structure different than expected

**Debug**:
```javascript
// In browser console, check Network response
// Or add temporary console.log in code
console.log('Approvals received:', data);
```

### Issue: Approve/Reject Not Working

**Check**:
1. Button should disable during request
2. Check Network tab for PUT request
3. Verify response status is 200
4. Check error console for exceptions

---

## What to Look For

### ✅ Success Indicators
- Page loads without errors
- Approval data displays
- Stats cards show correct counts
- Search and filters work
- Approve/Reject buttons respond
- Network requests show 200 status
- Token visible in Authorization header

### ❌ Failure Indicators
- 401 Unauthorized in Network tab
- Page redirects to login unexpectedly
- Data shows as "undefined" or missing
- Buttons disabled or non-responsive
- Console shows JavaScript errors
- No Authorization header in requests

---

## Browser Console Debugging

**Check token**:
```javascript
localStorage.getItem('token')
```

**Check if token sent**:
```javascript
// Network tab → Request Headers → Authorization
```

**Inspect API response**:
```javascript
// Network tab → Response tab → View JSON
```

**Test API directly**:
```javascript
const token = localStorage.getItem('token');
fetch('http://localhost:3001/api/approvals?page=1&limit=50', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(d => console.log('Success:', d))
.catch(e => console.error('Error:', e))
```

---

## Expected Page UI

```
╔════════════════════════════════════════════════════════════╗
║ View Approvals                                             ║
║ Manage pending requests and approvals                      ║
╚════════════════════════════════════════════════════════════╝

┌─────────────┬──────────────┬──────────────┬──────────────┐
│Total: 3     │Pending: 1    │Approved: 1   │Rejected: 1   │
└─────────────┴──────────────┴──────────────┴──────────────┘

[Search...] [All] [Pending] [Approved] [Rejected]

┌─ Approval Item ─────────────────────────────────────────────┐
│ 📋 Credit Request                                            │
│ Almaz Teshome                                                │
│ Customer credit limit increase request                       │
│ Amount: ብር 50,000 | Created: 08/17/2026 | Due: 08/20/2026 │
│                         [✓ Approve] [✕ Reject]              │
└──────────────────────────────────────────────────────────────┘

┌─ Approved Item ──────────────────────────────────────────────┐
│ ✅ Payment Plan                                              │
│ Girma Solomon                                                │
│ Extended payment plan request                                │
│ Amount: ብር 75,000 | Created: 08/15/2026 | Due: 08/18/2026 │
│                              [Approved]                      │
└──────────────────────────────────────────────────────────────┘
```

---

## Test Results Checklist

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Page loads | No 401 error | | ☐ |
| Token sent | Authorization header present | | ☐ |
| Data displays | Approvals shown | | ☐ |
| Search works | Filters by text | | ☐ |
| Status filter | Shows only selected | | ☐ |
| Approve works | Status changes to Approved | | ☐ |
| Reject works | Status changes to Rejected | | ☐ |
| 401 redirect | Goes to login | | ☐ |

---

## Next Steps

✅ If all tests pass:
- Deploy to production
- Monitor API response times
- Check user feedback

❌ If any test fails:
- Check error console
- Verify backend is running
- Check authentication flow
- Review Network requests
- Contact support with details

---

**Test Duration**: ~10 minutes  
**Success Rate Target**: 100% (all tests pass)  
**Status**: Ready to test  

**Happy Testing!** 🚀
