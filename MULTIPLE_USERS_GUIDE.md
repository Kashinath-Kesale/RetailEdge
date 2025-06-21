# Multiple User Sessions Guide

## Problem Solved
Previously, RetailEdge had issues with multiple users not being able to login simultaneously. This was caused by:

1. **Global Token Management**: The axios instance was setting global authorization headers
2. **Session Conflicts**: No unique session identifiers for different login sessions
3. **Cross-Tab Interference**: Multiple browser tabs/windows could interfere with each other

## Solutions Implemented

### 1. Per-Request Token Management
- **Before**: Global axios headers were set once and reused
- **After**: Each request gets the token from localStorage dynamically
- **File**: `pos-frontend/src/api/axiosInstance.js`

### 2. Unique Session Identifiers
- **Before**: JWT tokens only contained userId
- **After**: JWT tokens include unique sessionId and loginTimestamp
- **File**: `pos-backend/server/controllers/authController.js`

### 3. Multi-Tab Synchronization
- **Before**: No synchronization between browser tabs
- **After**: Storage events and custom events for tab synchronization
- **File**: `pos-frontend/src/context/AuthContext.jsx`

### 4. Enhanced Session Logging
- **Before**: Basic login/logout logging
- **After**: Detailed session tracking with IP, user agent, and session IDs
- **Files**: 
  - `pos-backend/server/controllers/authController.js`
  - `pos-backend/server/middleware/auth.js`

## Testing Multiple User Sessions

### Method 1: Different Browser Windows/Tabs
1. Open RetailEdge in one browser window
2. Login with User A (e.g., admin@example.com)
3. Open a new incognito/private window
4. Login with User B (e.g., cashier@example.com)
5. Both sessions should work independently

### Method 2: Different Browsers
1. Open RetailEdge in Chrome
2. Login with User A
3. Open RetailEdge in Firefox/Edge
4. Login with User B
5. Both sessions should work independently

### Method 3: Using Browser Console
Open browser console and use these utility functions:

```javascript
// Check current session info
window.getSessionInfo()

// Test multiple sessions
window.testMultipleSessions()

// Clear auth data (for testing)
window.clearAuthData()
```

## Session Information

Each login now includes:
- **Session ID**: Unique identifier for each login session
- **Login Timestamp**: When the session was created
- **IP Address**: Client IP address
- **User Agent**: Browser/client information
- **Token Expiry**: 24 hours from login

## Activity Logging

All login/logout activities are now logged with session information:
- `User logged in: admin@example.com (Session: abc123...)`
- `User logged out: cashier@example.com (Session: def456...)`

## Benefits

1. **Concurrent Access**: Multiple users can login simultaneously
2. **Session Isolation**: Each session is independent
3. **Better Security**: Unique session tracking
4. **Improved Debugging**: Detailed session information
5. **Multi-Tab Support**: Proper synchronization across tabs

## Technical Details

### Frontend Changes
- Removed global axios header setting
- Added per-request token retrieval
- Implemented storage event listeners
- Added session synchronization

### Backend Changes
- Enhanced JWT payload with session data
- Improved login/logout logging
- Added session tracking in middleware
- Better error handling for concurrent requests

### Database Impact
- No schema changes required
- Activity logs now include session information
- Better audit trail for user sessions

## Troubleshooting

If you still experience issues:

1. **Clear Browser Data**: Clear localStorage and cookies
2. **Check Console**: Look for authentication errors
3. **Verify Network**: Ensure no network connectivity issues
4. **Check Backend Logs**: Look for session-related errors

## Security Considerations

- Each session has a unique identifier
- Sessions expire after 24 hours
- IP and user agent information is logged
- No session conflicts between different users
- Proper token validation on each request 