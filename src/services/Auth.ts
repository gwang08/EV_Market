// Auth service for login and register API calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://evmarket-api-staging.onrender.com/api/v1'

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
    console.log('🔄 Refresh Token - Starting refresh process...')
    console.log('🔄 Refresh Token - Using cookie-based refresh token')
    
    // Check if we're in browser and have cookies
    if (typeof document !== 'undefined') {
      console.log('🔄 Refresh Token - All cookies:', document.cookie)
      
      // Check if refreshToken cookie exists
      const refreshTokenExists =
        document.cookie.includes('refreshToken') ||
        document.cookie.includes('refresh_token') ||
        document.cookie.includes('rt=') ||
        document.cookie.includes('refresh=')
      console.log('🔄 Refresh Token - Refresh token cookie exists:', refreshTokenExists)
      
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
        console.log('🔄 Refresh Token - Token preview:', tokenValue ? `${tokenValue.substring(0, 20)}...` : 'Empty')
      }
    }
    
    console.log('🔄 Refresh Token - Making API call to:', `${API_BASE_URL}/auth/refresh-token`)
    
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: Include cookies in the request
      // No body needed since refreshToken is in cookie
    })

    console.log('🔄 Refresh Token - API response status:', response.status)
    console.log('🔄 Refresh Token - API response headers:', Object.fromEntries(response.headers.entries()))
    
    let data
    let responseText = ''
    
    // Read response text first if not ok
    if (!response.ok) {
      try {
        responseText = await response.clone().text()
        console.error('🔄 Refresh Token - Error response text:', responseText)
      } catch (textError) {
        console.error('🔄 Refresh Token - Could not read response text:', textError)
      }
    }
    
    try {
      data = await handleApiResponse(response)
    } catch (apiError) {
      console.error('🔄 Refresh Token - API Error:', apiError)
      console.error('🔄 Refresh Token - Response status:', response.status)
      if (responseText) {
        console.error('🔄 Refresh Token - Response text:', responseText)
      }
      throw apiError
    }
    
    console.log('🔄 Refresh Token - API response data:', {
      success: data.success,
      message: data.message,
      hasAccessToken: !!data.data?.accessToken,
      accessTokenPreview: data.data?.accessToken ? `${data.data.accessToken.substring(0, 20)}...` : null
    })
    
    // Store the new access token
    if (data.data?.accessToken) {
      console.log('✅ Refresh Token - Storing new access token')
      storeAuthToken(data.data.accessToken)
    } else {
      console.error('❌ Refresh Token - No access token in response')
    }
    
    return {
      success: true,
      message: data.message || 'Token refreshed successfully',
      data: data.data || data
    }
  } catch (error) {
    console.error('❌ Refresh Token - Error occurred:', error)
    
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

// Helper function to store auth token with expiration
// Default to 1 hour (60 minutes) instead of 7 days for better security
export const storeAuthToken = (token: string, expirationHours: number = 1) => {
  if (typeof window !== 'undefined') {
    const expirationTime = Date.now() + (expirationHours * 60 * 60 * 1000) // Convert hours to milliseconds
    localStorage.setItem('authToken', token)
    localStorage.setItem('tokenExpiration', expirationTime.toString())
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
export const extendSession = (additionalHours: number = 1): boolean => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken')
    
    if (token && !isJWTTokenExpired(token)) {
      // Only extend if JWT token itself is still valid
      const currentExpiration = localStorage.getItem('tokenExpiration')
      const newExpiration = (currentExpiration ? parseInt(currentExpiration) : Date.now()) + (additionalHours * 60 * 60 * 1000)
      localStorage.setItem('tokenExpiration', newExpiration.toString())
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
    if (isJWTTokenExpired(token)) {
      return true
    }
    
    // Then check localStorage expiration as backup
    const expiration = localStorage.getItem('tokenExpiration')
    if (!expiration) return true
    return Date.now() > parseInt(expiration)
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
    // Note: refreshToken is managed via HTTP-only cookies, not localStorage
  }
}

// Helper function to automatically refresh token if needed
export const ensureValidToken = async (): Promise<string | null> => {
  console.log('🔍 Ensure Valid Token - Starting validation...')
  
  const token = getAuthToken()
  
  console.log('🔍 Ensure Valid Token - Current token info:', {
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : null,
    isExpired: isTokenExpired()
  })
  
  // If we have a valid token, return it
  if (token && !isTokenExpired()) {
    console.log('✅ Ensure Valid Token - Current token is valid')
    return token
  }
  
  console.log('🔄 Ensure Valid Token - Token expired or missing, attempting refresh...')
  
  // If token is expired or doesn't exist, try to refresh it
  try {
    const refreshResponse = await refreshAccessToken()
    console.log('🔄 Ensure Valid Token - Refresh response:', {
      success: refreshResponse.success,
      message: refreshResponse.message,
      hasNewToken: !!refreshResponse.data?.accessToken
    })
    
    if (refreshResponse.success && refreshResponse.data?.accessToken) {
      console.log('✅ Ensure Valid Token - Successfully refreshed token')
      return refreshResponse.data.accessToken
    }
  } catch (error) {
    console.error('❌ Ensure Valid Token - Failed to refresh token:', error)
  }
  
  // If refresh failed, remove all tokens and return null
  console.log('❌ Ensure Valid Token - Refresh failed, clearing tokens')
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

    console.log('✅ Google Auth - Processing success with token')
    
    // Store the access token with default 1 hour expiration
    storeAuthToken(accessToken, 1)
    
    console.log('✅ Google Auth - Token stored successfully')
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
