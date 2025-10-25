"use client";
import React, { useState, useEffect } from "react";
import RoleAuthWrapper from "@/components/common/RoleAuthWrapper";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import AdminTopbar from "@/components/Admin/AdminTopbar";
import AuctionRequestCard from "@/components/Admin/AuctionRequestCard";
import { getAuctionRequests, reviewAuctionRequest } from "@/services/Admin";
import { AuctionRequest } from "@/types/admin";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/providers/ToastProvider";

function AuctionManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<AuctionRequest[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { success, error } = useToast();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    loadRequests();
  }, [page]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await getAuctionRequests(page, 9);
      if (response.success && response.data) {
        // Filter only PENDING requests
        const pendingRequests = response.data.requests.filter(
          (req: AuctionRequest) => req.status === "AUCTION_PENDING_APPROVAL"
        );
        setRequests(pendingRequests);
        setTotalPages(response.data.totalPages);
      }
    } catch (err) {
      console.error("Error loading auction requests:", err);
      error("Không thể tải danh sách yêu cầu đấu giá");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (
    id: string,
    listingType: "VEHICLE" | "BATTERY",
    startTime: string,
    endTime: string
  ) => {
    try {
      const response = await reviewAuctionRequest(
        listingType,
        id,
        true,
        startTime,
        endTime
      );
      if (response.success) {
        success("Đã phê duyệt yêu cầu đấu giá thành công!");
        loadRequests();
      } else {
        error(response.message || "Phê duyệt thất bại");
      }
    } catch (err) {
      console.error("Error approving auction:", err);
      error("Có lỗi xảy ra khi phê duyệt");
    }
  };

  const handleReject = async (
    id: string,
    listingType: "VEHICLE" | "BATTERY",
    reason: string
  ) => {
    try {
      const response = await reviewAuctionRequest(
        listingType,
        id,
        false,
        undefined,
        undefined,
        reason
      );
      if (response.success) {
        success("Đã từ chối yêu cầu đấu giá");
        loadRequests();
      } else {
        error(response.message || "Từ chối thất bại");
      }
    } catch (err) {
      console.error("Error rejecting auction:", err);
      error("Có lỗi xảy ra khi từ chối");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Topbar */}
        <AdminTopbar toggleSidebar={toggleSidebar} />

        {/* Content */}
        <main className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Duyệt yêu cầu đấu giá
            </h2>
            <p className="text-gray-600">
              Phê duyệt hoặc từ chối các yêu cầu đấu giá đang chờ duyệt từ người bán
            </p>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : requests.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Không có yêu cầu đấu giá nào
              </h3>
              <p className="text-gray-600">
                Hiện tại không có yêu cầu đấu giá nào đang chờ duyệt
              </p>
            </div>
          ) : (
            <>
              {/* Auction Requests Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map((request) => (
                  <AuctionRequestCard
                    key={request.id}
                    request={request}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700"
                  >
                    Trước
                  </button>
                  <span className="px-4 py-2 text-gray-700 font-medium">
                    Trang {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function AuctionsPage() {
  return (
    <RoleAuthWrapper
      allowedRoles={["ADMIN"]}
      roleRedirectMap={{
        MEMBER: "/",
      }}
    >
      <AuctionManagementPage />
    </RoleAuthWrapper>
  );
}
