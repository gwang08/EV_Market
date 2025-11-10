// Auction types for type-safe auction data handling

export interface AuctionSeller {
  id: string
  name: string
  avatar: string
}

export interface AuctionSpecifications {
  weight?: string
  voltage?: string
  chemistry?: string
  degradation?: string
  chargingTime?: string
  installation?: string
  warrantyPeriod?: string
  temperatureRange?: string
}

export interface Bid {
  id: string
  amount: number
  createdAt: string
  bidderId: string
  bidder?: {
    id: string
    name: string
    avatar?: string
  }
  vehicleId: string | null
  batteryId: string | null
}

export interface LiveAuction {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  status: 'AUCTION_LIVE' | 'AVAILABLE' | 'SOLD' | 'DELISTED'
  brand: string
  capacity?: number
  year: number
  health?: number
  model?: string
  mileage?: number
  specifications?: AuctionSpecifications
  isAuction: boolean
  auctionStartsAt: string
  auctionEndsAt: string
  startingPrice: number
  bidIncrement: number
  depositAmount: number
  isVerified: boolean
  auctionRejectionReason: string | null
  createdAt: string
  updatedAt: string
  sellerId: string
  seller: AuctionSeller
  listingType?: 'BATTERY' | 'VEHICLE'
  bids?: Bid[]
  currentBid?: number
  hasUserDeposit?: boolean
  userDeposit?: Deposit
  userAuctionResult?: 'WON' | 'LOST' | 'NO_BIDS' | null
}

export interface BidResponse {
  message: string
  data: Bid
}

export interface Deposit {
  id: string
  amount: number
  status: 'PAID' | 'PENDING' | 'REFUNDED'
  userId: string
  vehicleId: string | null
  batteryId: string | null
  createdAt: string
  updatedAt: string
}

export interface AuctionDepositResponse {
  message: string
  data: Deposit
}

export interface PlaceBidRequest {
  amount: number
}

export interface PayDepositRequest {
  amount: number
}

export interface LiveAuctionsResponse {
  message: string
  data: {
    results: LiveAuction[]
    page: number
    limit: number
    totalPages: number
    totalResults: number
  }
}
