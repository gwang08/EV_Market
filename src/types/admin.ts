// Admin types
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN";
}

export interface UsersResponse {
  message: string;
  data: {
    users: User[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
  };
}

export interface AuctionRequest {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  status: string;
  brand: string;
  model?: string;
  capacity?: number;
  year: number;
  mileage?: number;
  health?: number;
  specifications?: any;
  isAuction: boolean;
  auctionStartsAt?: string;
  auctionEndsAt?: string;
  startingPrice?: number;
  bidIncrement?: number;
  depositAmount?: number;
  isVerified: boolean;
  auctionRejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  sellerId: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
  };
  listingType: "VEHICLE" | "BATTERY";
}

export interface AuctionRequestsResponse {
  message: string;
  data: {
    requests: AuctionRequest[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
  };
}

export interface PendingListing {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  status: string;
  brand: string;
  model?: string;
  capacity?: number;
  year: number;
  mileage?: number;
  health?: number;
  isVerified: boolean;
  createdAt: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
  };
  listingType: "VEHICLE" | "BATTERY";
}

export interface AdminStats {
  totalUsers: number;
  totalListings: number;
  pendingListings: number;
  totalTransactions: number;
  revenue: number;
  pendingAuctions: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: "ADMIN" | "MEMBER" | "STAFF";
  isVerified: boolean;
  isActive?: boolean;
  isLocked: boolean;
  lockReason: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    vehicles: number;
    batteries: number;
  };
}

export interface Fee {
  id: string;
  type: "REGULAR_SALE" | "AUCTION_SALE";
  percentage: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  status: string;
  brand: string;
  model?: string;
  capacity?: number;
  year: number;
  mileage?: number;
  health?: number | null;
  specifications?: any;
  isAuction: boolean;
  auctionStartsAt: string | null;
  auctionEndsAt: string | null;
  startingPrice: number | null;
  bidIncrement: number | null;
  depositAmount: number | null;
  isVerified: boolean;
  auctionRejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  sellerId: string;
  seller: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    role: string;
    isVerified: boolean;
    isLocked: boolean;
    lockReason: string | null;
    createdAt: string;
    updatedAt: string;
  };
  type: "VEHICLE" | "BATTERY";
}
