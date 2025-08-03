import axios from 'axios'
import { sessionManager, STORAGE_KEYS } from '../utils/sessionManager'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Utility function to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    return payload.exp < currentTime
  } catch (error) {
    console.error('Error parsing token:', error)
    return true
  }
}

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = sessionManager.getAccessToken()
    
    if (token) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        try {
          const refreshToken = sessionManager.getRefreshToken()
          if (refreshToken) {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            })
            
            const { access_token } = response.data.data
            sessionManager.setAccessToken(access_token)
            config.headers.Authorization = `Bearer ${access_token}`
          } else {
            throw new Error('No refresh token available')
          }
        } catch (error) {
          console.error('Token refresh failed in request interceptor:', error)
          // Clear auth data
          sessionManager.clearAuthData()
          
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          return Promise.reject(error)
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = sessionManager.getRefreshToken()
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        })

        const { access_token } = response.data.data
        sessionManager.setAccessToken(access_token)

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return api(originalRequest)
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        // Refresh failed, clear all auth data and redirect to login
        sessionManager.clearAuthData()
        
        // Only redirect if we're not already on the login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export const authService = {
  // Login user
  login: async (identifier, password) => {
    const response = await api.post('/auth/login', { identifier, password })
    return response.data
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data.data
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    })
    return response.data
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
    return response.data
  },

  // Check username availability
  checkUsernameAvailability: async (username) => {
    const response = await api.post('/admin/users/check-username', { username })
    return response.data
  },

  // Clear expired tokens
  clearExpiredTokens: () => {
    const accessToken = sessionManager.getAccessToken()
    const refreshToken = sessionManager.getRefreshToken()
    
    if (accessToken && isTokenExpired(accessToken)) {
      sessionManager.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      console.log('Removed expired access token')
    }
    
    if (refreshToken && isTokenExpired(refreshToken)) {
      sessionManager.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      console.log('Removed expired refresh token')
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return sessionManager.isAuthenticated()
  },

  // Get current session ID
  getSessionId: () => {
    return sessionManager.getItem(STORAGE_KEYS.SESSION_ID)
  },

  // Clear all authentication data
  clearAuthData: () => {
    sessionManager.clearAuthData()
  }
}

export default api 