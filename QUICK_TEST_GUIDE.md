# 🧪 QUICK TEST GUIDE - Users Page Edit Modal

## Start Dev Server

```bash
cd frontend
npm run dev
```

Wait for: `ready - started server on 0.0.0.0:3000`

---

## Test Edit Modal (NEW)

### Step 1: Navigate to Users Page
1. Go to `http://localhost:3000/admin/users`
2. Should see 3 user cards (System Administrator, Sales Representative, Million Tiruneh)

### Step 2: Click Edit Button
1. Click **Edit** button on any user card
2. ✅ Modal should open with title "Edit User"
3. ✅ Modal should be pre-filled with user's current data:
   - Full Name field has their name
   - Username field has their username
   - Phone field has their phone number
   - Role shows current role

### Step 3: Edit User Details
1. Change **Full Name** to something like "John Smith"
2. ✅ Field should update as you type
3. Leave **Password** blank (to keep current)
4. Click on **User Role** dropdown
5. ✅ Should show both options: "Sales Representative" and "Administrator"

### Step 4: Click "Update User" Button
1. Button is green at bottom of modal
2. ✅ Should show success message: "User updated successfully!"
3. ✅ Modal should close
4. ✅ User card should now show "John Smith" instead of old name

### Step 5: Try with Password Change
1. Click **Edit** button on same user
2. In **Password** field, enter a new password (e.g., "NewPass123")
3. ✅ **Confirm Password** field should appear below
4. Enter same password in confirm field
5. Click **Update User**
6. ✅ Should update successfully

### Step 6: Try Password Validation
1. Click **Edit** again
2. Enter password "123" (less than 6 chars)
3. Click **Update User**
4. ✅ Should show red error: "Password must be at least 6 characters long"
5. Enter 6+ character password in both fields
6. ✅ Should update successfully

---

## Test Delete Button

1. Click **Del** button on a user card
2. ✅ Should show confirmation: "Are you sure you want to delete this user? This action cannot be undone."
3. Click OK
4. ✅ User should disappear from list

---

## Test Suspend Button

1. Click **Suspend** button on any user
2. ✅ User's status should change from ● Active to ○ Suspend
3. Button text should change to "Activate"
4. Click **Activate** button
5. ✅ Status should return to ● Active

---

## Test Add User (Should Still Work)

1. Click **+ Add User** button at top right
2. ✅ Modal should open with title "Create New User"
3. Fill in fields: Full Name, Username, Phone
4. Enter password (6+ chars) in both password fields
5. Select at least one permission
6. Click **Create User**
7. ✅ User should be added to the list
8. ✅ Should show success message

---

## What's Working

| Feature | Status | Notes |
|---------|--------|-------|
| Edit Modal Opens | ✅ | Shows when Edit button clicked |
| Pre-filled Data | ✅ | User data loads into form |
| Update Button | ✅ | Validates and updates user |
| Delete Button | ✅ | Shows confirmation |
| Suspend Button | ✅ | Toggles active/suspended |
| Add User Modal | ✅ | Original functionality intact |
| Professional UI | ✅ | Enterprise gradient styling |

---

## UI Elements

### Edit Modal Header
- Blue gradient background: #0F3460 → #1B4FA5 → #16366d
- White title: "Edit User"
- White close (X) button

### Edit Modal Sections
1. **Personal Information** - Full Name, Username, Phone
2. **Security & Password** - Optional password change
3. **Access & Permissions** - Role & permissions selection

### Buttons
- **Update User** - Green gradient (#10B981)
- **Cancel** - Gray

---

## Hard Refresh (If Needed)

If you don't see changes:
- **Windows/Linux**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Edit button doesn't open modal | Restart dev server: `npm run dev` |
| Modal opens but empty | Hard refresh: `Ctrl+F5` |
| Can't see changes after update | Hard refresh browser |
| TypeScript errors | Run `npm run build` to see details |

---

## Expected Behavior Summary

✅ All 3 buttons (Edit, Delete, Suspend) now work correctly
✅ Edit modal opens with pre-filled user data
✅ Can edit user details or change password
✅ Professional error handling with validation
✅ Changes appear immediately in user list
✅ Delete requires confirmation
✅ Suspend toggles active status

**Status: READY FOR TESTING**
