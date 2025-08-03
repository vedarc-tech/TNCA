// Session Management Utility
// Provides consistent storage across tabs and browsers

// Storage keys - consistent across the application
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  SESSION_ID: 'session_id'
}

// Generate a unique session ID for this browser instance
export const getSessionId = () => {
  let sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID)
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId)
  }
  return sessionId
}

// Session storage operations
export const sessionManager = {
  // Get item from localStorage
  getItem: (key) => {
    return localStorage.getItem(key)
  },
  
  // Set item in localStorage
  setItem: (key, value) => {
    localStorage.setItem(key, value)
  },
  
  // Remove item from localStorage
  removeItem: (key) => {
    localStorage.removeItem(key)
  },
  
  // Clear all authentication data
  clearAuthData: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
  },
  
  // Get all auth-related keys
  getAuthKeys: () => {
    return Object.values(STORAGE_KEYS)
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (!token) return false
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp > currentTime
    } catch (error) {
      console.error('Error parsing token:', error)
      return false
    }
  },
  
  // Get current user data
  getCurrentUser: () => {
    const userData = localStorage.getItem(STORAGE_KEYS.USER)
    if (!userData) return null
    
    try {
      return JSON.parse(userData)
    } catch (error) {
      console.error('Error parsing user data:', error)
      return null
    }
  },
  
  // Set current user data
  setCurrentUser: (userData) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
  },
  
  // Get access token
  getAccessToken: () => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  },
  
  // Set access token
  setAccessToken: (token) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
  },
  
  // Get refresh token
  getRefreshToken: () => {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  },
  
  // Set refresh token
  setRefreshToken: (token) => {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token)
  }
}

// Debug functions
export const debugSession = () => {
  const sessionId = getSessionId()
  const user = sessionManager.getCurrentUser()
  const isAuth = sessionManager.isAuthenticated()
  
  console.log('=== Session Debug ===')
  console.log('Session ID:', sessionId)
  console.log('Authenticated:', isAuth)
  console.log('User:', user)
  console.log('Access Token:', sessionManager.getAccessToken() ? 'Present' : 'Missing')
  console.log('Refresh Token:', sessionManager.getRefreshToken() ? 'Present' : 'Missing')
  console.log('====================')
}

// Clean up old tab-specific data
export const cleanupOldData = () => {
  console.log('🧹 Cleaning up old tab-specific data...')
  
  const keysToRemove = []
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (
      key.includes('_tab_') ||
      key.includes('tab_id') ||
      key === 'student_token'
    )) {
      keysToRemove.push(key)
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key)
    console.log(`🧹 Removed: ${key}`)
  })
  
  // Clear sessionStorage (browser's built-in)
  window.sessionStorage.clear()
  console.log('🧹 Cleared sessionStorage')
  
  console.log('✅ Cleanup completed')
}

// Initialize session management
export const initializeSession = () => {
  // Clean up any old tab-specific data
  cleanupOldData()
  
  // Initialize session ID
  getSessionId()
  
  console.log('✅ Session management initialized')
}

export default sessionManager 