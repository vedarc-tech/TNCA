# Tab-Specific Session Management

## Problem
The application was experiencing shared session management across browser tabs. When a user logged out in one tab, all other tabs would also get logged out because they were all using the same localStorage keys for authentication tokens.

## Solution
Implemented a tab-specific session management system that provides independent authentication sessions for each browser tab.

## How It Works

### 1. Tab ID Generation
Each tab gets a unique identifier when it loads:
```javascript
const generateTabId = () => {
  return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
```

### 2. Tab-Specific Storage Keys
All authentication data is stored with tab-specific keys:
```javascript
const getStorageKey = (key) => {
  const tabId = getTabId()
  return `${key}_${tabId}`
}
```

### 3. Storage Structure
Instead of:
- `access_token`
- `refresh_token`
- `user`

Now uses:
- `access_token_tab_1234567890_abc123def`
- `refresh_token_tab_1234567890_abc123def`
- `user_tab_1234567890_abc123def`

## Implementation Details

### Files Modified

1. **`frontend/src/utils/tabStorage.js`** - Centralized utility functions
2. **`frontend/src/contexts/AuthContext.jsx`** - Updated to use tab-specific storage
3. **`frontend/src/services/authService.js`** - Updated API interceptors
4. **`frontend/src/hooks/useWebSocket.js`** - Updated WebSocket authentication
5. **`frontend/src/components/common/TabSessionDebug.jsx`** - Debug component

### Key Features

#### Independent Sessions
- Each tab maintains its own authentication state
- Logging out in one tab doesn't affect other tabs
- Each tab can have different users logged in

#### Storage Event Handling
- Tabs can detect when other tabs change storage
- Useful for future features like session synchronization

#### Debug Tools
- TabSessionDebug component shows current tab's session info
- Console logging for debugging storage issues

## Usage

### Basic Usage
The system works automatically - no changes needed in existing code. All authentication operations now use tab-specific storage.

### Debug Information
The debug component shows:
- Current tab ID
- Authentication status
- User information
- Storage keys for the current tab

### Manual Debug
```javascript
import { debugTabStorage, getTabId, getTabStorageKeys } from '../utils/tabStorage'

// Log current tab's storage
debugTabStorage()

// Get current tab ID
const tabId = getTabId()

// Get all storage keys for current tab
const keys = getTabStorageKeys()
```

## Benefits

1. **Independent Sessions**: Each tab can have its own user session
2. **Better UX**: Users can work in multiple tabs without interference
3. **Security**: Tab isolation prevents cross-tab session hijacking
4. **Debugging**: Easy to track which tab has which session

## Testing

1. Open the application in two different browser tabs
2. Log in with different users in each tab
3. Verify that each tab maintains its own session
4. Log out in one tab and verify the other tab remains logged in
5. Use the debug component to see tab-specific storage

## Future Enhancements

1. **Session Synchronization**: Option to sync sessions across tabs
2. **Tab Communication**: Real-time updates between tabs
3. **Session Cleanup**: Automatic cleanup of orphaned tab sessions
4. **Cross-Tab Notifications**: Notify other tabs of important events

## Technical Notes

- Uses `sessionStorage` for tab ID persistence
- Uses `localStorage` for authentication data with tab-specific keys
- Tab ID is generated once per tab and persists until tab is closed
- Storage events are listened to for potential future features
- All existing authentication flows work without modification 