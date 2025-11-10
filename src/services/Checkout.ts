import { ensureValidToken } from './Auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://evmarket-api-staging-backup.onrender.com/api/v1'

export type ListingType = 'VEHICLE' | 'BATTERY'
export type PaymentMethod = 'MOMO' | 'WALLET'

export interface CheckoutRequest {
  listingId: string
  listingType: ListingType
  paymentMethod: PaymentMethod
  redirectUrl?: string
}

// Complete payment with wallet using a transactionId returned from checkout()
export interface WalletPaymentResponse {
  message: string
  data?: {
    id: string
    buyerId: string
    status: string
    vehicleId?: string | null
    batteryId?: string | null
    finalPrice: number
    paymentGateway: 'WALLET' | string
    paymentDetail?: any
    createdAt: string
    updatedAt: string
    [key: string]: any
  }
}

export const payWithWallet = async (transactionId: string): Promise<WalletPaymentResponse> => {
  try {
    const token = await ensureValidToken()

    const response = await fetch(`${API_BASE_URL}/checkout/${transactionId}/pay-with-wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        'Accept': 'application/json'
      },
      credentials: 'omit'
    })

    const text = await response.text()
    let json: any
    try {
      json = text ? JSON.parse(text) : {}
    } catch {
      json = { message: text }
    }

    if (!response.ok) {
      throw new CheckoutError(json?.message || 'Wallet payment failed', response.status)
    }

    return json as WalletPaymentResponse
  } catch (err: any) {
    if (err instanceof CheckoutError) throw err
    if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
      throw new CheckoutError('Cannot connect to server. Please try again later.')
    }
    throw new CheckoutError(err?.message || 'Unknown wallet payment error')
  }
}

export interface CheckoutResponse {
  message: string
  data?: {
    payUrl?: string
    deeplink?: string
    qrCodeUrl?: string
    paymentInfo?: {
      partnerCode?: string
      orderId?: string
      requestId?: string
      amount?: number
      responseTime?: number
      message?: string
      resultCode?: number
      payUrl?: string
      deeplink?: string
      qrCodeUrl?: string
      deeplinkMiniApp?: string
      [key: string]: any
    }
    [key: string]: any
  }
}

export class CheckoutError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'CheckoutError'
  }
}

export const checkout = async (payload: CheckoutRequest): Promise<CheckoutResponse> => {
  try {
    const token = await ensureValidToken()

    const response = await fetch(`${API_BASE_URL}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        'Accept': 'application/json'
      },
      credentials: 'omit',
      body: JSON.stringify(payload)
    })

    const text = await response.text()
    let json: any
    try {
      json = text ? JSON.parse(text) : {}
    } catch {
      json = { message: text }
    }

    if (!response.ok) {
      throw new CheckoutError(json?.message || 'Checkout failed', response.status)
    }

    return json as CheckoutResponse
  } catch (err: any) {
    if (err instanceof CheckoutError) throw err
    if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
      throw new CheckoutError('Cannot connect to server. Please try again later.')
    }
    throw new CheckoutError(err?.message || 'Unknown checkout error')
  }
}
