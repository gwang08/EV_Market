// Auction service for auction-related API calls
import type {
  LiveAuctionsResponse,
  BidResponse,
  AuctionDepositResponse,
  PlaceBidRequest,
  PayDepositRequest
} from '../types/auction'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://evmarket-api-staging.onrender.com/api/v1'

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
    console.error('🚨 API Error:', {
      status: response.status,
      statusText: response.statusText,
      data,
      errorMessage
    })
    throw new Error(errorMessage)
  }

  return data
}

/**
 * Get all live auctions
 * No authentication required
 */
export const getLiveAuctions = async (page = 1, limit = 10): Promise<LiveAuctionsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auctions/live?time=future`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    const data = await handleApiResponse(response)
    return data
  } catch (error) {
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
    throw new Error(error instanceof Error ? error.message : 'Failed to place bid')
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
    throw new Error(error instanceof Error ? error.message : 'Failed to pay deposit')
  }
}

/**
 * Format currency for display
 */
export const formatAuctionPrice = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
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
  // Parse end date and current time in UTC to avoid timezone issues
  const endTime = new Date(endDate).getTime()
  const now = new Date().getTime()
  const total = endTime - now
  
  // Debug log
  console.log('⏰ Time Calculation:', {
    endDate,
    endTime: new Date(endTime).toISOString(),
    now: new Date(now).toISOString(),
    nowLocal: new Date(now).toLocaleString('vi-VN'),
    endLocal: new Date(endTime).toLocaleString('vi-VN'),
    diffMs: total,
    diffMinutes: Math.floor(total / 1000 / 60)
  })
  
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
