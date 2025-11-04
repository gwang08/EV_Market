// Battery service for battery-related API calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://evmarket-api-staging-backup.onrender.com/api/v1'

// Types for Battery API
export interface Battery {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  status: 'AVAILABLE' | 'SOLD' | 'DELISTED' | 'AUCTION_PENDING_APPROVAL' | 'AUCTION_APPROVED' | 'AUCTION_REJECTED' | 'AUCTION_ACTIVE' | 'AUCTION_LIVE' | 'AUCTION_ENDED'
  brand: string
  capacity: number
  year: number
  health: number
  specifications: {
    weight: string
    voltage: string
    chemistry: string
    degradation: string
    chargingTime: string
    installation: string
    warrantyPeriod: string
    temperatureRange: string
  }
  isVerified: boolean
  isAuction?: boolean
  auctionRejectionReason?: string | null
  createdAt: string
  updatedAt: string
  sellerId: string
}

export interface BatteriesResponse {
  success: boolean
  message: string
  data?: {
    batteries: Battery[]
  }
  error?: string
}

export interface BatteryResponse {
  success: boolean
  message: string
  data?: Battery | { battery: Battery }
  error?: string
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
    throw new Error(data.message || data.error || 'Something went wrong')
  }

  return data
}

// Create battery
export interface CreateBatteryRequest {
  title: string
  description: string
  price: number
  images?: (string | File)[]
  brand: string
  capacity: number
  year: number
  health: number
  specifications?: Partial<Battery['specifications']>
}

export const createBattery = async (payload: CreateBatteryRequest): Promise<BatteryResponse> => {
  try {
    // Lazy import to avoid circular deps at module top-level
    const { ensureValidToken } = await import('./Auth')
    const token = await ensureValidToken()

    if (!token) {
      throw new Error('Not authenticated')
    }

    // If images include File objects, send as multipart/form-data
    const hasFileImages = Array.isArray(payload.images) && payload.images.some((img) => img instanceof File)

    let response: Response
    if (hasFileImages) {
      const formData = new FormData()
      formData.append('title', payload.title)
      formData.append('description', payload.description)
      formData.append('price', String(payload.price))
      formData.append('brand', payload.brand)
      formData.append('capacity', String(payload.capacity))
      formData.append('year', String(payload.year))
      formData.append('health', String(payload.health))
      if (payload.specifications) {
        formData.append('specifications', JSON.stringify(payload.specifications))
      }
      if (payload.images) {
        for (const img of payload.images) {
          if (img instanceof File) formData.append('images', img)
        }
      }

      response = await fetch(`${API_BASE_URL}/batteries/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: formData
      })
    } else {
      response = await fetch(`${API_BASE_URL}/batteries/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
    }

    const data = await handleApiResponse(response)

    return {
      success: true,
      message: data.message || 'Battery created successfully',
      data: data.data || data
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create battery',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Get batteries with pagination
export const getBatteries = async (page = 1, limit = 10): Promise<BatteriesResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/batteries/?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    const data = await handleApiResponse(response)
    
    return {
      success: true,
      message: data.message || 'Batteries fetched successfully',
      data: data.data || { batteries: [] }
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch batteries',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Get all batteries from all pages
export const getAllBatteries = async (): Promise<BatteriesResponse> => {
  try {
    // First, get the first page to know total pages
    const firstPageResponse = await getBatteries(1, 10)
    if (!firstPageResponse.success || !firstPageResponse.data) {
      return firstPageResponse
    }

    let allBatteries = firstPageResponse.data.batteries || []
    
    // Check if response includes pagination info
    const responseData = firstPageResponse.data as any
    const totalPages = responseData.totalPages || 1
    
    // If there are more pages, fetch them all
    if (totalPages > 1) {
      const pagePromises = []
      for (let page = 2; page <= totalPages; page++) {
        pagePromises.push(getBatteries(page, 10))
      }
      
      const pageResponses = await Promise.all(pagePromises)
      
      // Combine all batteries
      for (const response of pageResponses) {
        if (response.success && response.data?.batteries) {
          allBatteries = [...allBatteries, ...response.data.batteries]
        }
      }
    }
    
    return {
      success: true,
      message: 'All batteries fetched successfully',
      data: { batteries: allBatteries }
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch all batteries',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
export const getMyBatteries = async (): Promise<BatteriesResponse> => {
  try {
    const { ensureValidToken } = await import('./Auth')
    const token = await ensureValidToken()

    const response = await fetch(`${API_BASE_URL}/users/me/batteries`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    })

    const data = await handleApiResponse(response)

    return {
      success: true,
      message: data.message || 'My batteries fetched successfully',
      data: data.data || { batteries: data.batteries || [] }
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch my batteries',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Get battery by ID
export const getBatteryById = async (id: string): Promise<BatteryResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/batteries/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    const data = await handleApiResponse(response)
    
    return {
      success: true,
      message: data.message || 'Battery fetched successfully',
      data: data.data || data
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch battery',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Update battery interface
export interface UpdateBatteryRequest {
  title?: string;
  description?: string;
  price?: number;
  brand?: string;
  capacity?: number;
  year?: number;
  health?: number;
  images?: (string | File)[];
  specifications?: Partial<Battery['specifications']>;
  imagesToDelete?: string[];
}

// Update battery (multipart aware)
export const updateBattery = async (id: string, payload: UpdateBatteryRequest): Promise<BatteryResponse> => {
  try {
    const { ensureValidToken } = await import('./Auth')
    const token = await ensureValidToken()

    if (!token) {
      throw new Error('Not authenticated')
    }

    const hasFileImages = Array.isArray(payload.images) && payload.images.some((img) => img instanceof File)

    let response: Response
    if (hasFileImages) {
      const formData = new FormData()
      if (payload.title !== undefined) formData.append('title', String(payload.title))
      if (payload.description !== undefined) formData.append('description', String(payload.description))
      if (payload.price !== undefined) formData.append('price', String(payload.price))
      if (payload.brand !== undefined) formData.append('brand', String(payload.brand))
      if (payload.capacity !== undefined) formData.append('capacity', String(payload.capacity))
      if (payload.year !== undefined) formData.append('year', String(payload.year))
      if (payload.health !== undefined) formData.append('health', String(payload.health))
      if (payload.specifications !== undefined) formData.append('specifications', JSON.stringify(payload.specifications))
      if (payload.images) {
        for (const img of payload.images) {
          if (img instanceof File) formData.append('images', img)
        }
      }
      if (payload.imagesToDelete && payload.imagesToDelete.length > 0) {
        formData.append('imagesToDelete', JSON.stringify(payload.imagesToDelete))
      }

      response = await fetch(`${API_BASE_URL}/batteries/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: formData
      })
    } else {
      response = await fetch(`${API_BASE_URL}/batteries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
    }

    const data = await handleApiResponse(response)

    return {
      success: true,
      message: data.message || 'Battery updated successfully',
      data: data.data || data
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update battery',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Delete battery
export const deleteBattery = async (id: string): Promise<BatteryResponse> => {
  try {
    const { ensureValidToken } = await import('./Auth')
    const token = await ensureValidToken()

    if (!token) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(`${API_BASE_URL}/batteries/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    })

    const data = await handleApiResponse(response)
    return {
      success: true,
      message: data.message || 'Battery deleted successfully',
      data: data.data || data
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete battery',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
