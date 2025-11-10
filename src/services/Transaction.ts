// Transaction service for transaction-related API calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://evmarket-api-staging-backup.onrender.com/api/v1'

import { getAuthToken } from './Auth'

// Types for Transaction API
export interface TransactionReview {
  id: string
  rating: number
  comment: string
  createdAt: string
}

export interface TransactionVehicle {
  id: string
  title: string
  images: string[]
  sellerId: string
  status: 'AVAILABLE' | 'SOLD' | 'PENDING' | 'REJECTED'
}

export interface TransactionBattery {
  id: string
  title: string
  images: string[]
  sellerId: string
  status: 'AVAILABLE' | 'SOLD' | 'PENDING' | 'REJECTED'
}

export interface Transaction {
  id: string
  buyerId: string
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'
  vehicleId: string | null
  batteryId: string | null
  finalPrice: number
  paymentGateway: 'WALLET' | 'MOMO' | 'VNPAY'
  paymentDetail: string | null
  createdAt: string
  updatedAt: string
  vehicle: TransactionVehicle | null
  battery: TransactionBattery | null
  review: TransactionReview | null
}

export interface TransactionsResponse {
  message: string
  data: {
    transactions: Transaction[]
    page: number
    limit: number
    totalPages: number
    totalResults: number
  }
}

export const getMyTransactions = async (page: number = 1, limit: number = 10): Promise<TransactionsResponse> => {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/transactions/me?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
    throw error
  }
}

// Get seller's sales transactions
export const getMySales = async (page: number = 1, limit: number = 10): Promise<TransactionsResponse> => {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/transactions/sales?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch sales:', error)
    throw error
  }
}

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800'
    case 'PAID':
      return 'bg-blue-100 text-blue-800'
    case 'SHIPPED':
      return 'bg-purple-100 text-purple-800'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    case 'REFUNDED':
      return 'bg-gray-100 text-gray-800'
    case 'DISPUTED':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const getPaymentGatewayName = (gateway: string): string => {
  switch (gateway) {
    case 'WALLET':
      return 'Ví điện tử'
    case 'MOMO':
      return 'MoMo'
    case 'VNPAY':
      return 'VNPay'
    default:
      return gateway
  }
}

/**
 * Pay for auction transaction (for winner)
 * @param transactionId - The transaction ID
 * @param paymentMethod - WALLET, MOMO, or VNPAY
 * @param redirectUrl - Optional redirect URL for payment gateway
 */
export interface PayAuctionRequest {
  paymentMethod: 'WALLET' | 'MOMO' | 'VNPAY'
  redirectUrl?: string
}

export interface PayAuctionResponse {
  message: string
  data: {
    id: string
    buyerId: string
    status: string
    confirmationDeadline: string | null
    paymentDeadline: string
    type: string
    vehicleId: string | null
    batteryId: string | null
    finalPrice: number
    paymentGateway: string
    paymentDetail: {
      amount: number
      payUrl?: string
      message?: string
      orderId?: string
      deeplink?: string
      qrCodeUrl?: string
      requestId?: string
      resultCode?: number
      partnerCode?: string
      responseTime?: number
      deeplinkMiniApp?: string
    }
    createdAt: string
    updatedAt: string
    vehicle?: any
    battery?: any
    buyer?: any
  }
}

/**
 * Get pending auction transaction for an item (for winner payment)
 * @param itemId - The vehicle or battery ID
 * @param itemType - 'vehicle' or 'battery'
 */
export const getPendingAuctionTransaction = async (
  itemId: string,
  itemType: 'vehicle' | 'battery'
): Promise<Transaction | null> => {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    console.log('🔍 Searching for pending auction transaction:', { itemId, itemType })

    // Get all transactions
    const response = await getMyTransactions(1, 100)
    
    console.log('📋 All user transactions:', {
      total: response.data.transactions.length,
      transactions: response.data.transactions.map(tx => ({
        id: tx.id,
        status: tx.status,
        type: (tx as any).type,
        vehicleId: tx.vehicleId,
        batteryId: tx.batteryId,
        finalPrice: tx.finalPrice
      }))
    })
    
    // Find pending auction transaction for this item
    const pendingTransaction = response.data.transactions.find(tx => {
      const matchesItem = itemType === 'vehicle' 
        ? tx.vehicleId === itemId 
        : tx.batteryId === itemId
      
      const isPendingAuction = tx.status === 'PENDING' && (tx as any).type === 'AUCTION'
      
      console.log('🔎 Checking transaction:', {
        txId: tx.id,
        matchesItem,
        isPendingAuction,
        status: tx.status,
        type: (tx as any).type
      })
      
      return matchesItem && isPendingAuction
    })

    if (pendingTransaction) {
      console.log('✅ Found pending transaction:', pendingTransaction)
    } else {
      console.log('⚠️ No pending transaction found for this item')
    }

    return pendingTransaction || null
  } catch (error) {
    console.error('❌ Failed to get pending transaction:', error)
    return null
  }
}

export const payAuctionTransaction = async (
  transactionId: string,
  request: PayAuctionRequest
): Promise<PayAuctionResponse> => {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to pay auction transaction:', error)
    throw error
  }
}

/**
 * Mark transaction as shipped (for seller)
 * @param transactionId - The transaction ID
 */
export interface ShipTransactionResponse {
  message: string
  data: {
    transaction: {
      id: string
      buyerId: string
      status: string
      confirmationDeadline: string
      paymentDeadline: string
      type: string
      vehicleId: string | null
      batteryId: string | null
      finalPrice: number
      paymentGateway: string
      paymentDetail: any
      createdAt: string
      updatedAt: string
    }
  }
}

export const shipTransaction = async (
  transactionId: string
): Promise<ShipTransactionResponse> => {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}/ship`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to ship transaction:', error)
    throw error
  }
}

/**
 * Confirm receipt of order (for buyer)
 * @param transactionId - The transaction ID
 */
export interface ConfirmReceiptResponse {
  message: string
  data: {
    transaction: {
      id: string
      buyerId: string
      status: string
      confirmationDeadline: string
      paymentDeadline: string
      type: string
      vehicleId: string | null
      batteryId: string | null
      finalPrice: number
      paymentGateway: string
      paymentDetail: any
      createdAt: string
      updatedAt: string
    }
  }
}

export const confirmReceipt = async (
  transactionId: string
): Promise<ConfirmReceiptResponse> => {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}/confirm-receipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to confirm receipt:', error)
    throw error
  }
}

/**
 * Dispute a transaction (for buyer)
 * @param transactionId - The transaction ID
 * @param reason - Reason for dispute
 * @param images - Array of image files
 */
export interface DisputeTransactionResponse {
  message: string
  data: {
    transaction: {
      id: string
      buyerId: string
      status: string
      confirmationDeadline: string
      paymentDeadline: string | null
      type: string
      disputeReason: string
      disputeImages: string[]
      vehicleId: string | null
      batteryId: string | null
      finalPrice: number
      paymentGateway: string
      paymentDetail: any
      createdAt: string
      updatedAt: string
    }
  }
}

export const disputeTransaction = async (
  transactionId: string,
  reason: string,
  images: File[]
): Promise<DisputeTransactionResponse> => {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    const formData = new FormData()
    formData.append('reason', reason)
    
    // Append all images
    images.forEach((image) => {
      formData.append('images', image)
    })

    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}/dispute`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Note: Don't set Content-Type for FormData, browser will set it automatically with boundary
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to dispute transaction:', error)
    throw error
  }
}
