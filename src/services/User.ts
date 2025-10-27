// User service for profile and user-related API calls
// Import auth functions from Auth service
import { getAuthToken, isAuthenticated, logoutUser } from './Auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://evmarket-api-staging-backup.onrender.com/api/v1'

// Types for User API
export interface User {
  id: string
  email: string
  name: string
  avatar: string | null
  role: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface UserProfileResponse {
  success: boolean
  message: string
  data?: {
    user: User
  }
  error?: string
}

export interface UpdateProfileRequest {
  name?: string
  email?: string
  avatar?: string
}

export interface UpdateProfileResponse {
  success: boolean
  message: string
  data?: {
    user: User
  }
  error?: string
}

export interface Review {
  id: string
  rating: number
  comment: string
  mediaUrls: string[]
  hasBeenEdited: boolean
  createdAt: string
  updatedAt: string
  type: string
  productId: string
  productTitle: string
  buyer: {
    id: string
    name: string
    avatar: string
  }
}

export interface SellerProfile {
  id: string
  name: string
  avatar: string
  email: string
  isVerified: boolean
  createdAt: string
}

export interface SellerProfileResponse {
  success: boolean
  message: string
  data?: {
    seller: SellerProfile
    reviews: Review[]
  }
  error?: string
}

export interface VerifiedSeller {
  id: string
  name: string
  avatar: string
  isVerified: boolean
  averageRating: number
  reviewCount: number
}

export interface VerifiedSellersResponse {
  success: boolean
  message: string
  data?: {
    sellers: VerifiedSeller[]
  }
  error?: string
}

// Helper function to handle expired tokens
const handleExpiredToken = () => {
  console.warn('Token expired, logging out user')
  logoutUser() // Use the logout function from Auth.ts
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
 
    
    // Handle 401 Unauthorized specifically
    if (response.status === 401) {
      handleExpiredToken()
      throw new Error('Authentication failed. Please login again.')
    }
    
    throw new Error(data.message || data.error || 'Something went wrong')
  }

  return data
}

// Get user profile
export const getUserProfile = async (): Promise<UserProfileResponse> => {
  try {
    
    const token = getAuthToken()
    

    
    if (!token) {
      throw new Error('No authentication token found')
    }
    
    
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include' // Include cookies
    })

    
    const data = await handleApiResponse(response)
    
  
    
    return {
      success: true,
      message: data.message || 'Profile fetched successfully',
      data: data.data || data
    }
  } catch (error) {
    console.error('❌ Get User Profile - Error occurred:', error)
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Update user profile
export const updateUserProfile = async (profileData: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
  try {
    const token = getAuthToken()
    
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include', // Include cookies
      body: JSON.stringify(profileData)
    })

    const data = await handleApiResponse(response)
    
    return {
      success: true,
      message: data.message || 'Profile updated successfully',
      data: data.data || data
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Upload avatar
export const uploadAvatar = async (file: File): Promise<UpdateProfileResponse> => {
  try {
    const token = getAuthToken()
    
    if (!token) {
      throw new Error('No authentication token found')
    }

    const formData = new FormData()
    formData.append('avatar', file)

    const response = await fetch(`${API_BASE_URL}/users/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include', // Include cookies
      body: formData
    })

    const data = await handleApiResponse(response)
    
    return {
      success: true,
      message: data.message || 'Avatar updated successfully',
      data: data.data || data
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to upload avatar',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Get seller profile by ID
export const getSellerProfile = async (sellerId: string): Promise<SellerProfileResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${sellerId}/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    const data = await handleApiResponse(response)
    
    return {
      success: true,
      message: data.message || 'Seller profile fetched successfully',
      data: data.data || data
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch seller profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Get verified sellers list
