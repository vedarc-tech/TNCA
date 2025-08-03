import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'
import { sessionManager, STORAGE_KEYS, getSessionId, initializeSession } from '../utils/sessionManager'
import toast from 'react-hot-toast'
import SuspensionModal from '../components/common/SuspensionModal'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)
  const [suspensionModal, setSuspensionModal] = useState({
    isOpen: false,
    message: '',
    suspensionReason: '',
    suspendedBy: ''
  })

  // Initialize session management
  useEffect(() => {
    initializeSession()
  }, [])

  // Initialize token and user from localStorage
  useEffect(() => {
    const storedToken = sessionManager.getAccessToken()
    const storedUser = sessionManager.getCurrentUser()
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(storedUser)
    }
  }, [])

  // Listen for storage events from other tabs/browsers
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Only handle auth-related storage changes
      if (e.key && Object.values(STORAGE_KEYS).includes(e.key)) {
        console.log('Auth storage change detected:', e.key, e.newValue)
        
        // If another tab/browser logged in, update our state
        if (e.key === STORAGE_KEYS.ACCESS_TOKEN && e.newValue) {
          setToken(e.newValue)
        } else if (e.key === STORAGE_KEYS.USER && e.newValue) {
          try {
            setUser(JSON.parse(e.newValue))
          } catch (error) {
            console.error('Error parsing user data from storage event:', error)
          }
        } else if (e.key === STORAGE_KEYS.ACCESS_TOKEN && !e.newValue) {
          // Another tab logged out
          sessionManager.clearAuthData()
          setToken(null)
          setUser(null)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (token) {
          const userData = await authService.getCurrentUser()
          setUser(userData)
          // Update stored user data
          sessionManager.setCurrentUser(userData)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Try to refresh token if it's expired
        if (error.response?.status === 401) {
          try {
            const newToken = await refreshToken()
            if (newToken) {
              const userData = await authService.getCurrentUser()
              setUser(userData)
              sessionManager.setCurrentUser(userData)
              return
            }
          } catch (refreshError) {
            console.error('Token refresh failed during initialization:', refreshError)
          }
        }
        
        // Clear tokens and user data
        sessionManager.clearAuthData()
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [token])

  const login = async (email, password) => {
    try {
      setLoading(true)
      console.log('Attempting login with:', { email, password })
      const response = await authService.login(email, password)
      console.log('Login response:', response)
      // The response from authService.login is already the parsed data
      const { access_token, refresh_token, user: userData } = response.data
      console.log('Extracted user data:', userData)
      
      // Store tokens and user data with consistent keys
      sessionManager.setAccessToken(access_token)
      sessionManager.setRefreshToken(refresh_token)
      sessionManager.setCurrentUser(userData)
      setToken(access_token)
      setUser(userData)
      toast.success('Login successful!')
      return { success: true, user: userData }
    } catch (error) {
      console.error('Login error:', error)
      const errorData = error.response?.data
      
      // Check if this is a suspension error
      if (errorData?.suspended) {
        setSuspensionModal({
          isOpen: true,
          message: errorData.message,
          suspensionReason: errorData.suspension_reason || '',
          suspendedBy: errorData.suspended_by || ''
        })
        return { success: false, error: errorData.message, suspended: true }
      }
      
      const message = errorData?.message || 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear tokens and user data
      sessionManager.clearAuthData()
      setToken(null)
      setUser(null)
      toast.success('Logged out successfully')
    }
  }

  const updateUser = (userData) => {
    setUser(userData)
    // Update stored user data
    sessionManager.setCurrentUser(userData)
  }

  const refreshToken = async () => {
    try {
      const refresh_token = sessionManager.getRefreshToken()
      if (!refresh_token) {
        throw new Error('No refresh token')
      }

      const response = await authService.refreshToken(refresh_token)
      const { access_token } = response.data
      
      sessionManager.setAccessToken(access_token)
      setToken(access_token)
      
      return access_token
    } catch (error) {
      console.error('Token refresh failed:', error)
      sessionManager.clearAuthData()
      setToken(null)
      setUser(null)
      throw error
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authService.changePassword(currentPassword, newPassword)
      toast.success('Password changed successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    refreshToken,
    changePassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    isSuperAdmin: user?.role === 'super_admin',
    isDeveloper: user?.role === 'developer',
    sessionId: getSessionId()
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SuspensionModal
        isOpen={suspensionModal.isOpen}
        onClose={() => setSuspensionModal({ isOpen: false, message: '', suspensionReason: '', suspendedBy: '' })}
        message={suspensionModal.message}
        suspensionReason={suspensionModal.suspensionReason}
        suspendedBy={suspensionModal.suspendedBy}
      />
    </AuthContext.Provider>
  )
} 