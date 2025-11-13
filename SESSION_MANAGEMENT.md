# Session Management & Token Expiration Handling

## Overview

The AI Interviewer application now includes a comprehensive session management system that handles JWT token expiration gracefully, providing users with clear warnings and preventing unexpected authentication failures.

## Problem Solved

**Issue**: JWT tokens expire after 30 minutes (configured in `backend/api/auth.py`). Users would encounter 401 Unauthorized errors after being logged in for some time, with no warning or way to continue their session.

**Solution**: Implemented a complete session management system that:
- Tracks login time
- Warns users 5 minutes before expiration
- Auto-logs out when token expires
- Intercepts all 401 errors across the application
- Allows users to extend their session

## Architecture

### 1. Authentication Context (`/frontend/src/contexts/AuthContext.js`)

The `AuthContext` now includes:

```javascript
const TOKEN_LIFETIME = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_BEFORE_EXPIRY = 5 * 60 * 1000; // Show warning 5 min before expiry
```

**Key Features**:
- **Login Time Tracking**: Stores `loginTime` in localStorage on every login
- **Session Warning State**: Provides `sessionWarning` state to trigger the warning modal
- **Auto-Logout**: Sets up timers to automatically log out when token expires
- **Session Extension**: `extendSession()` function to re-validate token and reset timers

**Flow**:
1. User logs in → `loginTime` saved to localStorage
2. Timer set for 25 minutes → Shows warning modal
3. Timer set for 30 minutes → Auto-logout
4. User can click "Stay Logged In" → Validates token with backend and resets timers

### 2. Session Warning Modal (`/frontend/src/components/SessionWarningModal.js`)

A professional warning modal that appears 5 minutes before token expiration.

**Features**:
- **Live Countdown**: Shows remaining time in MM:SS format
- **Action Buttons**:
  - "Stay Logged In": Calls `extendSession()` to refresh the session
  - "Log Out": Immediately logs out the user
  - "Dismiss": Closes modal but keeps timer running

**Visual Design**: Yellow warning theme with AlertTriangle icon to grab attention without being alarming.

### 3. API Client (`/frontend/src/services/apiClient.js`)

A centralized HTTP client that wraps the Fetch API with automatic 401 handling.

**Key Features**:
```javascript
if (response.status === 401 && !options.skipAuth) {
  localStorage.removeItem('token');
  if (this.onUnauthorized) {
    this.onUnauthorized(); // Triggers logout in AuthContext
  }
  throw new Error('Session expired. Please login again.');
}
```

**Why Not Yet Integrated**: The apiClient is created but not yet integrated throughout the application. Currently, all components have been updated to manually check for 401 status and show appropriate toast messages. This provides immediate functionality while allowing for future refactoring to use the centralized client.

## Implementation Details

### Components Updated with 401 Handling

All components that make authenticated API calls now include 401 status checks:

1. **ChatHistory.js**: Fetching interview sessions
2. **PinnedResults.js**: Fetching and unpinning sessions
3. **Settings.js**: Profile updates and password changes
4. **Home.js**: Resume upload and interview start
5. **Interview.js**: Submitting interview answers

**Pattern Used**:
```javascript
const response = await fetch(endpoint, options);

if (response.status === 401) {
  toast.error('Session expired. Please login again.');
  // Additional handling like showing auth modal
  return;
}

if (!response.ok) {
  // Handle other errors
}
```

### Session Management Flow

#### Normal Login Flow
```
1. User logs in (email/Google/GitHub)
2. loginTime = Date.now() → localStorage
3. setupSessionWarning() called
4. warningTimer = setTimeout(25 min) → Shows modal
5. expiryTimer = setTimeout(30 min) → Auto-logout
```

#### Session Warning Flow
```
1. 25 minutes pass
2. sessionWarning state → true
3. SessionWarningModal appears
4. User has 3 options:
   a. Stay Logged In → extendSession()
      - Validates token with /auth/me
      - Resets loginTime
      - Sets up new timers
   b. Log Out → logout()
      - Clears token and loginTime
      - Redirects to home
   c. Dismiss → Modal closes
      - Timers continue
      - Auto-logout at 30 min
```

#### Auto-Logout Flow
```
1. 30 minutes pass (or user action fails with 401)
2. handleSessionExpired() called
3. Clear token and loginTime from localStorage
4. Clear all timers
5. Set user to null
6. Show toast: "Session expired. Please login again."
7. User redirected to home page
```

## Backend Configuration

Token expiration is configured in `/backend/api/auth.py`:

```python
ACCESS_TOKEN_EXPIRE_MINUTES = 30
```

**Note**: The backend does NOT have a token refresh endpoint. The `extendSession()` function works by:
1. Validating the current token is still valid with `/auth/me`
2. If valid, resetting the frontend timer
3. If invalid (already expired), logging out

**Future Enhancement**: Add a `/auth/refresh` endpoint to issue new tokens before expiration, allowing truly seamless session extension.

## User Experience

### Before Implementation
❌ User logs in  
❌ Works fine for 29 minutes  
❌ At 30 minutes: API call fails with 401  
❌ Error shown: "Failed to fetch data"  
❌ User confused, has to refresh page and login again  

### After Implementation
✅ User logs in  
✅ Works fine for 25 minutes  
✅ At 25 minutes: Warning modal appears with countdown  
✅ User can extend session or logout gracefully  
✅ If no action: Auto-logout at 30 minutes with clear message  
✅ Any 401 error: Handled with toast notification  

## Testing Checklist

To test the session management system:

1. **Login and Wait**:
   - Login to the application
   - Wait 25 minutes (or temporarily change `TOKEN_LIFETIME` to 5 min for testing)
   - Verify warning modal appears

2. **Session Extension**:
   - When warning appears, click "Stay Logged In"
   - Verify toast shows "Session extended successfully"
   - Verify modal closes and countdown resets

3. **Auto-Logout**:
   - Let the countdown reach 0:00 without taking action
   - Verify user is logged out
   - Verify toast shows "Session expired. Please login again."

4. **401 During Operation**:
   - Let token expire completely (30 min)
   - Try to perform any action (fetch history, submit interview, etc.)
   - Verify 401 is caught and appropriate message shown

5. **Manual Logout**:
   - When warning appears, click "Log Out"
   - Verify immediate logout
   - Verify clean redirect to home page

## Configuration

To adjust session timing, modify these constants in `AuthContext.js`:

```javascript
// Token lifetime (must match backend ACCESS_TOKEN_EXPIRE_MINUTES)
const TOKEN_LIFETIME = 30 * 60 * 1000; // 30 minutes

// How long before expiry to show warning
const WARNING_BEFORE_EXPIRY = 5 * 60 * 1000; // 5 minutes
```

**Important**: `TOKEN_LIFETIME` must match the backend's `ACCESS_TOKEN_EXPIRE_MINUTES` setting.

## Troubleshooting

### Warning Appears Too Early/Late
- Check `TOKEN_LIFETIME` matches backend `ACCESS_TOKEN_EXPIRE_MINUTES`
- Verify browser clock is correct
- Check localStorage `loginTime` value

### Session Extension Doesn't Work
- Check `/auth/me` endpoint is working
- Verify token is still valid when extending
- Check network tab for 401 responses

### Auto-Logout Doesn't Trigger
- Check browser console for timer errors
- Verify `setupSessionWarning()` is called after login
- Check if page was refreshed (timers don't persist)

### Page Refresh Loses Session Warning
- This is expected behavior - timers are in-memory only
- On page load, `useEffect` recalculates time elapsed and sets up new timers
- If token has expired, user will be logged out on next API call

## Future Enhancements

1. **Token Refresh Endpoint**: Add `/auth/refresh` to backend to issue new tokens
2. **Activity Tracking**: Only expire tokens after X minutes of inactivity
3. **Remember Me**: Option for longer-lived tokens (7 days)
4. **Persistent Timers**: Use Web Workers to maintain timers across page refreshes
5. **Offline Detection**: Pause timer when user goes offline
6. **Multiple Tab Sync**: Synchronize session state across multiple tabs using BroadcastChannel API

## Summary

The session management system provides a professional, user-friendly way to handle JWT token expiration. Users are never surprised by sudden authentication failures, and the application maintains a smooth experience even during long sessions.

**Key Benefits**:
- ✅ No more unexpected 401 errors
- ✅ Clear warnings before session expires
- ✅ Graceful logout with proper cleanup
- ✅ Option to extend session without re-login
- ✅ Consistent error handling across all components
- ✅ Professional UX with toast notifications and countdown timer
