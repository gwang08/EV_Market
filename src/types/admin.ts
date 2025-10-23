// Admin types
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN";
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
