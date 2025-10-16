// Transaction service for transaction-related API calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://evmarket-api-staging.onrender.com/api/v1'

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
}

export interface TransactionBattery {
  id: string
  title: string
  images: string[]
}

export interface Transaction {
  id: string
  buyerId: string
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'
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

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    case 'REFUNDED':
      return 'bg-blue-100 text-blue-800'
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
