import { ensureValidToken } from "./Auth";

const API_BASE_URL = "https://evmarket-api-staging-backup.onrender.com/api/v1";

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

// Approve or reject auction request with time settings
export const reviewAuctionRequest = async (
  listingType: "VEHICLE" | "BATTERY",
  listingId: string,
  approved: boolean,
  auctionStartsAt?: string,
  auctionEndsAt?: string,
  rejectionReason?: string
) => {
  try {
    const token = await ensureValidToken();
    
    const body: any = {
      approved,
    };

    // Add time fields if approving
    if (approved && auctionStartsAt && auctionEndsAt) {
      body.auctionStartsAt = auctionStartsAt;
      body.auctionEndsAt = auctionEndsAt;
    }

    // Add rejection reason if rejecting
    if (!approved && rejectionReason) {
      body.rejectionReason = rejectionReason;
    }

    const response = await fetch(
      `${API_BASE_URL}/admin/listings/${listingType}/${listingId}/review-auction`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
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

// Get dashboard stats
export const getAdminStats = async () => {
  try {
    const token = await ensureValidToken();
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch dashboard stats");
    }

    return {
      success: true,
      data: {
        totalUsers: data.data.totalUsers,
        totalListings: data.data.totalListings,
        pendingListings: data.data.pendingListings,
        totalTransactions: data.data.totalTransactions,
        revenue: data.data.totalRevenue,
        pendingAuctions: data.data.pendingAuctions,
      },
      message: data.message,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
};

// Get all listings
export const getListings = async (page = 1, limit = 10) => {
  try {
    const token = await ensureValidToken();
    const response = await fetch(
      `${API_BASE_URL}/admin/listings?page=${page}&limit=${limit}`,
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
      throw new Error(data.message || "Failed to fetch listings");
    }

    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    console.error("Error fetching listings:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
};

// Verify/Unverify listing
export const verifyListing = async (
  type: "VEHICLE" | "BATTERY",
  listingId: string,
  isVerified: boolean
) => {
  try {
    const token = await ensureValidToken();
    const response = await fetch(
      `${API_BASE_URL}/admin/listings/${type}/${listingId}/verify`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isVerified }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to verify listing");
    }

    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    console.error("Error verifying listing:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
};

// Get all users
export const getUsers = async (page = 1, limit = 10) => {
  try {
    const token = await ensureValidToken();
    const response = await fetch(
      `${API_BASE_URL}/admin/users?page=${page}&limit=${limit}`,
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
      throw new Error(data.message || "Failed to fetch users");
    }

    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
};

// Lock user
export const lockUser = async (userId: string, lockReason: string) => {
  try {
    const token = await ensureValidToken();
    const response = await fetch(
      `${API_BASE_URL}/admin/users/${userId}/lock`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lockReason }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to lock user");
    }

    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error("Error locking user:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Unlock user
export const unlockUser = async (userId: string) => {
  try {
    const token = await ensureValidToken();
    const response = await fetch(
      `${API_BASE_URL}/admin/users/${userId}/unlock`,
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
      throw new Error(data.message || "Failed to unlock user");
    }

    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error("Error unlocking user:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Get fees
export const getFees = async () => {
  try {
    const token = await ensureValidToken();
    const response = await fetch(`${API_BASE_URL}/admin/fees`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch fees");
    }

    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    console.error("Error fetching fees:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
};

// Update fee
export const updateFee = async (
  feeId: string,
  updates: {
    percentage?: number;
    description?: string;
    isActive?: boolean;
  }
) => {
  try {
    const token = await ensureValidToken();
    const response = await fetch(`${API_BASE_URL}/admin/fees/${feeId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update fee");
    }

    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    console.error("Error updating fee:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
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

// Get disputed transactions
export const getDisputedTransactions = async (page = 1, limit = 10) => {
  try {
    const token = await ensureValidToken();
    const response = await fetch(
      `${API_BASE_URL}/admin/transactions/disputed?page=${page}&limit=${limit}`,
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
      throw new Error(data.message || "Failed to fetch disputed transactions");
    }

    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    console.error("Error fetching disputed transactions:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
};

// Resolve dispute (approve or reject)
export const resolveDispute = async (
  transactionId: string,
  approved: boolean
) => {
  try {
    const token = await ensureValidToken();
    const response = await fetch(
      `${API_BASE_URL}/admin/transactions/${transactionId}/resolve-dispute`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approved }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to resolve dispute");
    }

    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    console.error("Error resolving dispute:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
};
