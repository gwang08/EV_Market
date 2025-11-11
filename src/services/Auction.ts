// Auction service for auction-related API calls
import type {
  LiveAuctionsResponse,
  BidResponse,
  AuctionDepositResponse,
  PlaceBidRequest,
  PayDepositRequest
} from '../types/auction'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://evmarket-api-staging-backup.onrender.com/api/v1'

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
    // Enhanced error message extraction
    const errorMessage = data.message || data.error || data.errors?.[0]?.message || 'Something went wrong'
   
    throw new Error(errorMessage)
  }

  return data
}

/**
 * Get all live auctions
 * Requires authentication
 */
export const getLiveAuctions = async (page = 1, limit = 10): Promise<LiveAuctionsResponse> => {
  try {
    const { ensureValidToken } = await import('./Auth')
    const token = await ensureValidToken()

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // Thêm query parameters để lấy đấu giá đang diễn ra hoặc sắp diễn ra
    const url = `${API_BASE_URL}/auctions/live`
    // console.log("🔗 Fetching auctions from:", url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
    })

    console.log("📡 Auction API response status:", response.status);
    const data = await handleApiResponse(response)
    console.log("📦 Auction API data:", data);
    return data
  } catch (error) {
    console.error("❌ Auction API error:", error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch live auctions')
  }
}

/**
 * Get auction detail by ID
 * Requires authentication
 */
export const getAuctionDetail = async (
  listingType: 'VEHICLE' | 'BATTERY',
  itemId: string
): Promise<any> => {
  try {
    const { ensureValidToken } = await import('./Auth')
    const token = await ensureValidToken()

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/auctions/${listingType}/${itemId}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    })

    const data = await handleApiResponse(response)
    return data
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch auction detail')
  }
}

/**
 * Place a bid on an auction item
 * Requires authentication
 * @param listingType - 'VEHICLE' or 'BATTERY'
 * @param itemId - The ID of the vehicle or battery
 * @param bidData - The bid amount
 */
export const placeBid = async (
  listingType: 'VEHICLE' | 'BATTERY',
  itemId: string,
  bidData: PlaceBidRequest
): Promise<BidResponse> => {
  try {
    const { ensureValidToken } = await import('./Auth')
    const token = await ensureValidToken()

    if (!token) {
      throw new Error('Authentication required to place a bid')
    }

    const response = await fetch(`${API_BASE_URL}/auctions/${listingType}/${itemId}/bids`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify(bidData)
    })

    const data = await handleApiResponse(response)
    return data
  } catch (error) {
    // Re-throw the error to preserve the original message from handleApiResponse
    throw error
  }
}

/**
 * Pay deposit for an auction item
 * Requires authentication
 * @param listingType - 'VEHICLE' or 'BATTERY'
 * @param itemId - The ID of the vehicle or battery
 * @param depositData - The deposit amount
 */
export const payDeposit = async (
  listingType: 'VEHICLE' | 'BATTERY',
  itemId: string,
  depositData: PayDepositRequest
): Promise<AuctionDepositResponse> => {
  try {
    const { ensureValidToken } = await import('./Auth')
    const token = await ensureValidToken()

    if (!token) {
      throw new Error('Authentication required to pay deposit')
    }

    const response = await fetch(`${API_BASE_URL}/auctions/${listingType}/${itemId}/deposit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify(depositData)
    })

    const data = await handleApiResponse(response)
    return data
  } catch (error) {
    // Re-throw the error to preserve the original message from handleApiResponse
    throw error
  }
}

/**
 * Format currency for display - VNĐ format
 */
export const formatAuctionPrice = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ'
}

/**
 * Calculate time remaining for auction
 */
export const getTimeRemaining = (endDate: string): {
  total: number
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
} => {
  // API trả về: "2025-11-10T21:55:00.000Z" 
  // Nhưng thực chất đó là 21:55 giờ local (VN), không phải UTC
  // Nên phải parse như local time
  
  // Remove 'Z' để parse như local time thay vì UTC
  const endDateLocal = endDate.replace('Z', '')
  const endTime = new Date(endDateLocal).getTime()
  const now = Date.now()
  
  const total = endTime - now

  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))

  return {
    total,
    days: Math.max(0, days),
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
    isExpired: total <= 0
  }
}

/**
 * Request auction for a listing
 * Requires authentication
 * @param listingType - 'VEHICLE' or 'BATTERY'
 * @param listingId - The ID of the vehicle or battery
 * @param auctionData - Auction configuration
 */
export interface RequestAuctionData {
  startingPrice: number
  bidIncrement: number
  depositAmount?: number
  auctionStartsAt: string
  auctionEndsAt: string
}

export interface RequestAuctionResponse {
  message: string
  data: {
    id: string
    title: string
    status: string
    isAuction: boolean
    startingPrice: number
    bidIncrement: number
    depositAmount: number
    auctionStartsAt?: string
    auctionEndsAt: string
    [key: string]: any
  }
}

export const requestAuction = async (
  listingType: 'VEHICLE' | 'BATTERY',
  listingId: string,
  auctionData: RequestAuctionData
): Promise<RequestAuctionResponse> => {
  try {
    const { ensureValidToken } = await import('./Auth')
    const token = await ensureValidToken()

    if (!token) {
      throw new Error('Authentication required to request auction')
    }

    const response = await fetch(
      `${API_BASE_URL}/auctions/listings/${listingType}/${listingId}/request-auction`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(auctionData)
      }
    )

    const data = await handleApiResponse(response)
    return data
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to request auction')
  }
}

/**
 * Create a new auction listing (vehicle or battery)
 * Requires authentication
 * @param listingType - 'vehicles' or 'batteries'
 * @param formData - FormData with all auction fields including images
 */
export interface CreateAuctionResponse {
  message: string
  data: {
    id: string
    title: string
    status: string
    isAuction: boolean
    startingPrice: number
    bidIncrement: number
    depositAmount: number
    [key: string]: any
  }
}

export const createAuction = async (
  listingType: 'vehicles' | 'batteries',
  formData: FormData
): Promise<CreateAuctionResponse> => {
  try {
    const { ensureValidToken } = await import('./Auth')
    const token = await ensureValidToken()

    if (!token) {
      throw new Error('Authentication required to create auction')
    }

    const response = await fetch(`${API_BASE_URL}/auctions/${listingType}/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: formData
    })

    const data = await handleApiResponse(response)
    return data
  } catch (error) {
    // Re-throw the error to preserve the original message from handleApiResponse
    throw error
  }
}
