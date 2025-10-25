// Auth service for login and register API calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://beevmarket-production.up.railway.app/api/v1'

// Types for API requests and responses
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data?: {
    token?: string
    accessToken?: string
    access_token?: string
    refreshToken?: string
    refresh_token?: string
    user: {
      id: string
      email: string
      fullName?: string
      name?: string
      role?: string
    }
  }
  error?: string
}

export interface RegisterResponse {
  success: boolean
  message: string
  data?: {
    user: {
      id: string
      email: string
      fullName?: string
    }
    accessToken?: string
    refreshToken?: string
  }
  error?: string
}

export interface LogoutResponse {
  success: boolean
  message: string
  error?: string
}

export interface RefreshTokenRequest {
  refreshToken?: string
}

export interface RefreshTokenResponse {
  success: boolean
  message: string
  data?: {
    accessToken: string
  }
  error?: string
}

// Google Auth Types
export interface GoogleAuthResponse {
  success: boolean
  message: string
  data?: {
    accessToken: string
    user: {
      id: string
      email: string
      fullName?: string
      name?: string
      avatar?: string
      role?: string
    }
  }
  error?: string
}

// Generic API error interface
export interface ApiError {
  message: string
  statusCode?: number
  details?: any
}

// Custom error class for API errors
export class AuthError extends Error {
  statusCode?: number
  details?: any

  constructor(message: string, statusCode?: number, details?: any) {
    super(message)
    this.name = 'AuthError'
    this.statusCode = statusCode
    this.details = details
  }
}

// Helper function to handle API responses
const handleApiResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type')
  
  let data
  if (contentType && contentType.includes('application/json')) {
    data = await response.json()
  } else {
    data = { message: await response.text() }
  }

  if (!response.ok) {
    throw new AuthError(
      data.message || data.error || 'Something went wrong',
      response.status,
      data
    )
  }

  return data
}

// Login API call
export const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for refresh token
      body: JSON.stringify(credentials),
    })

    const data = await handleApiResponse(response)
    
    return {
      success: true,
      message: data.message || 'Login successful',
      data: data.data || data
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        message: error.message,
        error: error.message
      }
    }
    
    return {
      success: false,
      message: 'Network error or server is unavailable',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Register API call
export const registerUser = async (userData: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for refresh token
      body: JSON.stringify(userData),
    })

    const data = await handleApiResponse(response)
    
    return {
      success: true,
      message: data.message || 'Registration successful',
      data: data.data || data
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        message: error.message,
        error: error.message
      }
    }
    
    return {
      success: false,
      message: 'Network error or server is unavailable',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Refresh Token API call
export const refreshAccessToken = async (refreshToken?: string): Promise<RefreshTokenResponse> => {
  try {
    
    // Check if we're in browser and have cookies
    if (typeof document !== 'undefined') {
      
      // Check if refreshToken cookie exists
      const refreshTokenExists =
        document.cookie.includes('refreshToken') ||
        document.cookie.includes('refresh_token') ||
        document.cookie.includes('rt=') ||
        document.cookie.includes('refresh=')
      
      if (!refreshTokenExists) {
        // Silently return failure without spamming console errors
        return {
          success: false,
          message: 'No refresh token cookie found',
          error: 'No refresh token cookie found - user needs to login again'
        }
      }
      
      // Extract refresh token value for debugging
      const cookies = document.cookie.split(';')
      const refreshCookie = cookies.find(c => c.trim().startsWith('refreshToken='))
      if (refreshCookie) {
        const tokenValue = refreshCookie.split('=')[1]
      }
    }
    
    
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: Include cookies in the request
      // No body needed since refreshToken is in cookie
    })

    
    let data
    let responseText = ''
    
    // Read response text first if not ok
    if (!response.ok) {
      try {
        responseText = await response.clone().text()
      } catch (textError) {
      }
    }
    
    try {
      data = await handleApiResponse(response)
    } catch (apiError) {
      if (responseText) {
      }
      throw apiError
    }
    
   
    
    // Store the new access token
    if (data.data?.accessToken) {
      storeAuthToken(data.data.accessToken)
    } else {
    }
    
    return {
      success: true,
      message: data.message || 'Token refreshed successfully',
      data: data.data || data
    }
  } catch (error) {
    
    if (error instanceof AuthError) {
      return {
        success: false,
        message: error.message,
        error: error.message
      }
    }
    
    return {
      success: false,
      message: 'Network error or server is unavailable',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Logout API call
export const logoutUserAPI = async (): Promise<LogoutResponse> => {
  try {
    const token = getAuthToken()
    
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include' // Include cookies to clear refresh token
    })

    const data = await handleApiResponse(response)
    
    // Always remove token from localStorage regardless of API response
    removeAuthToken()
    
    return {
      success: true,
      message: data.message || 'Logout successful'
    }
  } catch (error) {
    // Even if API fails, we still want to clear local token
    removeAuthToken()
    
    if (error instanceof AuthError) {
      return {
        success: false,
        message: error.message,
        error: error.message
      }
    }
    
    return {
      success: false,
      message: 'Network error during logout',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Helper function to store user info
export const storeUserInfo = (user: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userInfo', JSON.stringify(user))
  }
}

// Helper function to get user info
export const getUserInfo = (): any | null => {
  if (typeof window !== 'undefined') {
    const userInfo = localStorage.getItem('userInfo')
    return userInfo ? JSON.parse(userInfo) : null
  }
  return null
}

// Helper function to get user role
export const getUserRole = (): string | null => {
  const userInfo = getUserInfo()
  const role = userInfo?.role || null
  return role
}

// Helper function to remove user info
export const removeUserInfo = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userInfo')
  }
}

// Helper function to decode JWT token and get user info from it
export const decodeJWTToken = (token: string): any | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload
  } catch (error) {
    console.error('❌ Error decoding JWT token:', error)
    return null
  }
}

// Helper function to store auth token with expiration
// Now uses JWT's own expiration time if available for accuracy
export const storeAuthToken = (token: string, expirationHours?: number) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token)
    
    // Try to get expiration from JWT token itself
    const decoded = decodeJWTToken(token)
    let expirationTime: number
    
    if (decoded?.exp) {
      // Use JWT's expiration time (exp is in seconds, convert to milliseconds)
      expirationTime = decoded.exp * 1000
    } else if (expirationHours) {
      // Use custom expiration hours if provided
      expirationTime = Date.now() + (expirationHours * 60 * 60 * 1000)
    } else {
      // Default to 24 hours if nothing specified
      expirationTime = Date.now() + (24 * 60 * 60 * 1000)
    }
    
    localStorage.setItem('tokenExpiration', expirationTime.toString())
    
    // Try to decode JWT and store user info if available
    if (decoded) {
      // If JWT contains user info, store it (some backends include user data in JWT)
      if (decoded.userId || decoded.sub || decoded.email) {
        const userFromToken = {
          id: decoded.userId || decoded.sub,
          email: decoded.email,
          role: decoded.role,
          name: decoded.name
        }
        storeUserInfo(userFromToken)
      }
    }
  }
}

// Helper function to store refresh token
export const storeRefreshToken = (refreshToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('refreshToken', refreshToken)
  }
}

// Helper function to get refresh token
export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken')
  }
  return null
}

// Helper function to remove refresh token
export const removeRefreshToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('refreshToken')
  }
}

// Helper function to check if JWT token itself is expired
const isJWTTokenExpired = (token: string): boolean => {
  try {
    // Decode JWT token (base64 decode the payload part)
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000 // Convert to seconds
    return payload.exp < currentTime
  } catch (error) {
    console.error('Error parsing JWT token:', error)
    return true // Treat invalid tokens as expired
  }
}

// Helper function to extend current session (if token is still valid)
// Note: This only extends localStorage expiration, not JWT expiration
export const extendSession = (additionalHours: number = 1): boolean => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken')
    
    if (!token) return false
    
    // Check if JWT token is still valid
    const decoded = decodeJWTToken(token)
    if (decoded?.exp) {
      const jwtExpired = decoded.exp * 1000 < Date.now()
      if (jwtExpired) {
        console.log('⚠️ Cannot extend session: JWT token already expired')
        return false
      }
      
      // Extend localStorage expiration (but not beyond JWT expiration)
      const currentExpiration = localStorage.getItem('tokenExpiration')
      const newExpiration = (currentExpiration ? parseInt(currentExpiration) : Date.now()) + (additionalHours * 60 * 60 * 1000)
      const jwtExpiration = decoded.exp * 1000
      
      // Don't extend beyond JWT expiration
      const finalExpiration = Math.min(newExpiration, jwtExpiration)
      localStorage.setItem('tokenExpiration', finalExpiration.toString())
      
      console.log('✅ Session extended to:', new Date(finalExpiration).toLocaleString())
      return true
    }
  }
  return false
}

// Helper function to get remaining session time in minutes
export const getRemainingSessionTime = (): number => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken')
    
    if (token) {
      try {
        // Check JWT token expiry
        const payload = JSON.parse(atob(token.split('.')[1]))
        const jwtExpiry = payload.exp * 1000 // Convert to milliseconds
        const jwtRemaining = Math.max(0, (jwtExpiry - Date.now()) / (60 * 1000)) // Convert to minutes
        
        // Check localStorage expiry
        const localExpiration = localStorage.getItem('tokenExpiration')
        const localRemaining = localExpiration 
          ? Math.max(0, (parseInt(localExpiration) - Date.now()) / (60 * 1000))
          : 0
        
        // Return the shorter of the two (more restrictive)
        return Math.min(jwtRemaining, localRemaining)
      } catch (error) {
        console.error('Error calculating remaining time:', error)
      }
    }
  }
  return 0
}

// Helper function to check if token is expired (checks both localStorage and JWT expiry)
export const isTokenExpired = (): boolean => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken')
    
    if (!token) return true
    
    // Check JWT token expiry first (more accurate)
    const decoded = decodeJWTToken(token)
    if (decoded?.exp) {
      const jwtExpired = decoded.exp * 1000 < Date.now()
      if (jwtExpired) {
        console.log('⏰ JWT token expired at:', new Date(decoded.exp * 1000).toLocaleString())
        return true
      }
    }
    
    // Then check localStorage expiration as backup
    const expiration = localStorage.getItem('tokenExpiration')
    if (!expiration) {
      console.log('⚠️ No expiration time found in localStorage')
      return true
    }
    
    const localExpired = Date.now() > parseInt(expiration)
    if (localExpired) {
      console.log('⏰ localStorage expiration passed at:', new Date(parseInt(expiration)).toLocaleString())
    }
    
    return localExpired
  }
  return true
}

// Helper function to get auth token (only if not expired)
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    if (isTokenExpired()) {
      removeAuthToken() // Auto cleanup expired token
      return null
    }
    return localStorage.getItem('authToken')
  }
  return null
}

// Helper function to remove auth token and expiration
export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken')
    localStorage.removeItem('tokenExpiration')
    removeUserInfo() // Also remove user info when removing token
    // Note: refreshToken is managed via HTTP-only cookies, not localStorage
  }
}

// Helper function to automatically refresh token if needed
export const ensureValidToken = async (): Promise<string | null> => {
  
  const token = getAuthToken()
  
  
  
  // If we have a valid token, return it
  if (token && !isTokenExpired()) {
    return token
  }
  
  
  // If token is expired or doesn't exist, try to refresh it
  try {
    const refreshResponse = await refreshAccessToken()

    
    if (refreshResponse.success && refreshResponse.data?.accessToken) {
      return refreshResponse.data.accessToken
    }
  } catch (error) {
  }
  
  // If refresh failed, remove all tokens and return null
  removeAuthToken()
  return null
}

// Helper function to check if user is authenticated (with expiration check)
export const isAuthenticated = (): boolean => {
  const token = getAuthToken() // This already checks expiration
  return token !== null
}

// Logout function with API call
export const logoutUser = async () => {
  try {
    // Call logout API
    await logoutUserAPI()
  } catch (error) {
    // If API fails, we still proceed with local logout
    console.error('Logout API failed:', error)
  }
  
  // Always redirect to login page after logout
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

// Simple local logout (without API call) - for backwards compatibility
export const logoutUserLocal = () => {
  removeAuthToken()
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

// Google OAuth login function
export const loginWithGoogle = (): void => {
  if (typeof window !== 'undefined') {
    try {
      // Construct the URL safely and append query parameter
      const url = new URL(`${API_BASE_URL}/auth/google`)
      url.searchParams.set('client_type', 'web')
      const googleAuthUrl = url.toString()
      window.location.href = googleAuthUrl
    } catch (error) {
      // Fallback in case URL construction fails
      const fallbackUrl = `${API_BASE_URL}/auth/google?client_type=web`
      console.error('🔄 Google Auth - URL build failed, using fallback:', error)
      window.location.href = fallbackUrl
    }
  }
}

// Handle Google OAuth success callback
export const handleGoogleAuthSuccess = (accessToken: string): boolean => {
  try {
    if (!accessToken) {
      console.error('❌ Google Auth - No access token provided')
      return false
    }

    
    // Store the access token using JWT's own expiration
    storeAuthToken(accessToken)
    console.log('🔐 Google Auth - using JWT expiration')
    
    return true
  } catch (error) {
    console.error('❌ Google Auth - Error handling success:', error)
    return false
  }
}

// Check if user came from Google OAuth redirect
export const isGoogleAuthCallback = (): { isCallback: boolean; accessToken?: string } => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    const accessToken = urlParams.get('accessToken')
    
    return {
      isCallback: !!accessToken,
      accessToken: accessToken || undefined
    }
  }
  
  return { isCallback: false }
}

// Get current user ID from token or API
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const token = getAuthToken()
    if (!token) return null
    
    // Import getUserProfile from User service dynamically to avoid circular dependency
    const { getUserProfile } = await import('./User')
    const response = await getUserProfile()
    
    if (response.success && response.data?.user) {
      return response.data.user.id
    }
    
    return null
  } catch (error) {
    console.error('Failed to get current user ID:', error)
    return null
  }
}
