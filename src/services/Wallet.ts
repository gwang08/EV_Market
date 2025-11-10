import { ensureValidToken } from './Auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://beevmarket-production.up.railway.app/api/v1';

// Wallet Types
export interface WalletData {
  id: string;
  userId: string;
  availableBalance: number;
  lockedBalance: number;
  createdAt: string;
  updatedAt: string;
}
export interface WalletResponse {
  message: string;
  data: WalletData;
}

export interface DepositRequest {
  amount: number;
  paymentMethod: 'MOMO';
  redirectUrl?: string;
}

export interface DepositResponse {
  message: string;
  data: {
    partnerCode: string;
    orderId: string;
    requestId: string;
    amount: number;
    responseTime: number;
    message: string;
    resultCode: number;
    payUrl: string;
    deeplink: string;
    qrCodeUrl: string;
    deeplinkMiniApp: string;
  };
}

export class WalletError extends Error {
  constructor(public message: string, public statusCode?: number) {
    super(message);
    this.name = 'WalletError';
  }
}

// Get wallet balance
export const getWalletBalance = async (): Promise<WalletResponse> => {
  try {
    const token = await ensureValidToken();
    if (!token) {
      throw new WalletError('Not authenticated', 401);
    }
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/wallet/`, {
      method: 'GET',
      headers,
      mode: 'cors',
      credentials: 'omit',
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: 'Failed to fetch wallet balance' };
      }
      
      throw new WalletError(errorData.message || 'Failed to fetch wallet balance', response.status);
    }

    const data: WalletResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof WalletError) {
      throw error;
    }
    
    // Handle network errors specifically
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network error - possibly CORS or connection issue:', error);
      throw new WalletError('Cannot connect to server. Please check your internet connection or try again later.');
    }
    
    console.error('Unexpected error fetching wallet balance:', error);
    throw new WalletError('Network error occurred while fetching wallet balance');
  }
};

// Make a deposit
export const makeDeposit = async (depositData: DepositRequest): Promise<DepositResponse> => {
  try {
    const token = await ensureValidToken();
    if (!token) {
      throw new WalletError('Not authenticated', 401);
    }
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/wallet/deposit`, {
      method: 'POST',
      headers,
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify(depositData),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: 'Failed to create deposit request' };
      }
      
      throw new WalletError(errorData.message || 'Failed to create deposit request', response.status);
    }

    const data: DepositResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof WalletError) {
      throw error;
    }
    
    // Handle network errors specifically
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network error - possibly CORS or connection issue:', error);
      throw new WalletError('Cannot connect to server. Please check your internet connection or try again later.');
    }
    
    console.error('Unexpected error creating deposit request:', error);
    throw new WalletError('Network error occurred while creating deposit request');
  }
};

// Helper function to format currency - VNĐ format
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
};

// Helper function to open payment URL
export const openPaymentUrl = (payUrl: string, target: '_blank' | '_self' = '_blank'): void => {
  window.open(payUrl, target);
};

// Helper function to check if payment is MoMo
export const isMoMoPayment = (partnerCode: string): boolean => {
  return partnerCode === 'MOMO';
};