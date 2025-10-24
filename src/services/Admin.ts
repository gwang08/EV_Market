import { ensureValidToken } from "./Auth";

const API_BASE_URL = "https://evmarket-api-staging.onrender.com/api/v1";

// Get pending auction requests
export const getAuctionRequests = async (page = 1, limit = 10) => {
  try {
    const token = await ensureValidToken();
    const response = await fetch(
      `${API_BASE_URL}/admin/auction-requests?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch auction requests");
    }

    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    console.error("Error fetching auction requests:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
};

// Approve or reject auction request
export const reviewAuctionRequest = async (
  listingType: "VEHICLE" | "BATTERY",
  listingId: string,
  approved: boolean,
  rejectionReason?: string
) => {
  try {
    const token = await ensureValidToken();
    const response = await fetch(
      `${API_BASE_URL}/admin/listings/${listingType}/${listingId}/review-auction`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approved,
          ...(rejectionReason && { rejectionReason }),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to review auction request");
    }

    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    console.error("Error reviewing auction request:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
};

// Approve listing
export const approveListing = async (
  listingType: "VEHICLE" | "BATTERY",
  listingId: string
) => {
  try {
    const token = await ensureValidToken();
    const response = await fetch(
      `${API_BASE_URL}/admin/listings/${listingType}/${listingId}/approve`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to approve listing");
    }

    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    console.error("Error approving listing:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
};

// Mock data for dashboard stats (will be replaced with real API later)
export const getAdminStats = async () => {
  // Mock data
  return {
    success: true,
    data: {
      totalUsers: 1234,
      totalListings: 567,
      pendingListings: 23,
      totalTransactions: 890,
      revenue: 45600000,
      pendingAuctions: 12,
    },
  };
};

// Mock data for pending listings (will be replaced with real API later)
export const getPendingListings = async (page = 1, limit = 10) => {
  // Mock data - will be replaced with real API
  return {
    success: true,
    data: {
      listings: [],
      page,
      limit,
      totalPages: 0,
      totalResults: 0,
    },
  };
};

// Get auction history (all statuses except pending)
export const getAuctionHistory = async (page = 1, limit = 10, status?: string) => {
  try {
    const token = await ensureValidToken();
    
    const response = await fetch(
      `${API_BASE_URL}/admin/auction-requests?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch auction history");
    }

    // Filter out PENDING requests and apply status filter if provided
    let filteredAuctions = data.data.requests.filter(
      (auction: any) => auction.status !== "AUCTION_PENDING_APPROVAL"
    );

    if (status && status !== "ALL") {
      filteredAuctions = filteredAuctions.filter(
        (auction: any) => auction.status === status
      );
    }

    return {
      success: true,
      data: {
        auctions: filteredAuctions,
        page: data.data.page,
        limit: data.data.limit,
        totalPages: data.data.totalPages,
        totalResults: filteredAuctions.length,
      },
      message: data.message,
    };
  } catch (error) {
    console.error("Error fetching auction history:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
};
