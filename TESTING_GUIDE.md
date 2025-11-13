# Quick Testing Guide - Session Management

## Setup for Testing (5-Minute Timeline)

To test quickly without waiting 30 minutes, modify these values in `/frontend/src/contexts/AuthContext.js`:

```javascript
// Find these lines (around line 28-29):
const TOKEN_LIFETIME = 30 * 60 * 1000; 
const WARNING_BEFORE_EXPIRY = 5 * 60 * 1000;

// Replace with:
const TOKEN_LIFETIME = 5 * 60 * 1000; // 5 minutes
const WARNING_BEFORE_EXPIRY = 2 * 60 * 1000; // 2 minutes
```

**Timeline with test values**:
- **0:00** - Login
- **3:00** - Warning modal appears (2 min before expiry)
- **5:00** - Auto-logout (if no action taken)

---

## Test Cases

### Test 1: Session Warning Modal Appears ✅

**Steps**:
1. Start the app: `cd frontend && npm start`
2. Login with any method (email/Google/GitHub)
3. Wait 3 minutes (with test values)

**Expected**:
- Warning modal appears with yellow AlertTriangle icon
- Title: "Session Expiring Soon"
- Message: "Your session will expire in..."
- Countdown shows: 2:00 → 1:59 → 1:58...
- Three buttons visible: "Stay Logged In", "Log Out", "Dismiss"

**Pass Criteria**: Modal appears at exactly 3 minutes ✓

---

### Test 2: "Stay Logged In" Extends Session ✅

**Steps**:
1. Wait for warning modal (3 min)
2. Click "Stay Logged In" button
3. Wait another 3 minutes

**Expected**:
- Toast message: "Session extended successfully!"
- Modal closes
- Warning reappears after another 3 minutes
- Session continues to work

**Pass Criteria**: Session extends and warning reappears after 3 more minutes ✓

---

### Test 3: "Log Out" Works Immediately ✅

**Steps**:
1. Wait for warning modal (3 min)
2. Click "Log Out" button

**Expected**:
- Immediate logout
- Redirected to home page
- User state cleared
- No warnings or errors

**Pass Criteria**: Clean logout and redirect ✓

---

### Test 4: "Dismiss" Continues Countdown ✅

**Steps**:
1. Wait for warning modal (3 min)
2. Click "Dismiss" button (X icon)
3. Wait 2 more minutes (total 5 min)

**Expected**:
- Modal closes
- After 2 more minutes (at 5 min total):
  - User automatically logged out
  - Toast: "Session expired. Please login again."
  - Redirected to home page

**Pass Criteria**: Auto-logout at 5 minutes even after dismissing ✓

---

### Test 5: Page Refresh Preserves Session ✅

**Steps**:
1. Login
2. Wait 1 minute
3. Refresh page (F5 or Cmd+R)
4. Wait 2 more minutes (total 3 min elapsed)

**Expected**:
- After refresh, session continues
- Warning appears at 3 min mark (not reset to 3 min from refresh)
- Session tracking based on original login time

**Pass Criteria**: Warning appears at correct time after refresh ✓

---

### Test 6: 401 Handling - Fetch History ✅

**Steps**:
1. Login
2. Wait 5 minutes (full expiration)
3. Click on "Chat History" or "History" tab

**Expected**:
- Toast error: "Session expired. Please login again."
- No crash or console errors
- History doesn't load (expected)

**Pass Criteria**: Clean error message, no crashes ✓

---

### Test 7: 401 Handling - Pin/Unpin ✅

**Steps**:
1. Login
2. Complete an interview to create a session
3. Wait 5 minutes (full expiration)
4. Try to pin/unpin a result

**Expected**:
- Toast error: "Session expired. Please login again."
- No crash or console errors

**Pass Criteria**: Clean error message, no crashes ✓

---

### Test 8: 401 Handling - Update Profile ✅

**Steps**:
1. Login
2. Go to Settings page
3. Wait 5 minutes (full expiration)
4. Try to change name or password

**Expected**:
- Toast error: "Session expired. Please login again."
- No crash or console errors
- Form not submitted (expected)

**Pass Criteria**: Clean error message, no crashes ✓

---

### Test 9: 401 Handling - Start Interview ✅

**Steps**:
1. Login
2. Fill in role and company
3. Wait 5 minutes (full expiration)
4. Upload resume and start interview

**Expected**:
- Toast error: "Session expired. Please login again."
- Auth modal appears (allows immediate re-login)
- No crash or console errors

**Pass Criteria**: Clean error message, auth modal shows ✓

---

### Test 10: 401 Handling - Submit Interview ✅

**Steps**:
1. Login
2. Start an interview
3. Wait 5 minutes while answering questions
4. Try to submit interview

**Expected**:
- Error message: "Session expired. Please login again."
- Redirected to home page after 2 seconds
- Interview not submitted (user needs to re-login and restart)

**Pass Criteria**: Clean error message and redirect ✓

---

## Console Checks

Open browser console (F12) and verify:

### Should See (Normal):
```
✓ User logged in successfully
✓ Login time: [timestamp]
✓ Session warning setup complete
```

### Should NOT See (Errors):
```
✗ Cannot read property of null
✗ TypeError: undefined is not a function
✗ Failed to fetch
✗ Unhandled Promise Rejection
```

---

## Network Tab Checks

Open Network tab (F12 → Network) and verify:

### When Session Valid:
```
GET /auth/me → 200 OK
GET /interview/sessions → 200 OK
POST /interview/start → 200 OK
```

### When Session Expired:
```
GET /interview/sessions → 401 Unauthorized
  - App shows toast error ✓
  - No crash ✓
```

---

## localStorage Checks

Open Application tab (F12 → Application → localStorage) and verify:

### After Login:
```
token: "eyJ..." (JWT token)
loginTime: "1703001234567" (timestamp)
```

### After Logout:
```
token: (removed)
loginTime: (removed)
```

---

## Quick Test Script

Run this in your terminal to automatically test the full flow:

```bash
# 1. Start the app
cd frontend && npm start

# 2. In browser console, run this to track session:
setInterval(() => {
  const loginTime = localStorage.getItem('loginTime');
  if (loginTime) {
    const elapsed = Date.now() - parseInt(loginTime);
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    console.log(`Session time: ${minutes}:${seconds.toString().padStart(2, '0')}`);
  }
}, 1000);
```

This will print session time every second:
```
Session time: 0:01
Session time: 0:02
...
Session time: 2:59
Session time: 3:00  ← Warning should appear
...
Session time: 4:59
Session time: 5:00  ← Auto-logout should trigger
```

---

## Reset to Production Values

After testing, **remember to restore the original values**:

```javascript
// In /frontend/src/contexts/AuthContext.js:
const TOKEN_LIFETIME = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_EXPIRY = 5 * 60 * 1000; // 5 minutes
```

---

## Common Issues

### Warning Doesn't Appear
- Check console for errors
- Verify `loginTime` in localStorage
- Verify browser clock is correct
- Check if test values are set correctly

### Warning Appears Too Early/Late
- Verify `TOKEN_LIFETIME` matches backend `ACCESS_TOKEN_EXPIRE_MINUTES`
- Check if page was refreshed (timers recalculate)
- Verify system clock is accurate

### "Stay Logged In" Doesn't Work
- Check Network tab for `/auth/me` response
- Verify token hasn't already expired
- Check console for errors

### Page Refresh Resets Timer
- This should NOT happen
- Check if `useEffect` in AuthContext is running
- Verify `loginTime` persists in localStorage after refresh

---

## Success Checklist

Before marking as complete, verify:

- [ ] Warning modal appears at correct time
- [ ] Countdown is accurate and updates every second
- [ ] "Stay Logged In" extends session properly
- [ ] "Log Out" logs out immediately
- [ ] "Dismiss" allows auto-logout
- [ ] Auto-logout works at expiration time
- [ ] All 401 errors show toast messages
- [ ] No console errors during any flow
- [ ] Page refresh preserves session correctly
- [ ] Production values restored (30 min / 5 min)

---

## Expected Timeline (Production)

With production values (30 min token, 5 min warning):

```
00:00 ──────────────────────────────── 25:00 ─── 30:00
 ↑                                        ↑        ↑
Login                              Warning Modal   Auto-logout
                                   Appears         (if no action)
```

User has **5 minutes** to take action after warning appears.

---

## Done! 🎉

If all tests pass, the session management system is working correctly!

**Remember**: This is a critical feature that prevents user frustration from unexpected authentication failures. Take time to test thoroughly.
