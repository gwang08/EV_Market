"use client";
import React, { useState, useEffect } from "react";
import RoleAuthWrapper from "@/components/common/RoleAuthWrapper";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import AdminTopbar from "@/components/Admin/AdminTopbar";
import AuctionHistoryTable from "@/components/Admin/AuctionHistoryTable";
import Pagination from "@/components/common/Pagination";
import { getAuctionHistory } from "@/services/Admin";
import { AuctionRequest } from "@/types/admin";
import { Loader2, AlertCircle, Filter, Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/common/Toast";

function AuctionHistoryManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [auctions, setAuctions] = useState<AuctionRequest[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const { toasts, error, removeToast } = useToast();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    loadAuctionHistory();
  }, [page, statusFilter]);

  const loadAuctionHistory = async () => {
    try {
      setLoading(true);
      const filterStatus = statusFilter === "ALL" ? undefined : statusFilter;
      const response = await getAuctionHistory(page, 20, filterStatus);
      if (response.success && response.data) {
        setAuctions(response.data.auctions);
        setTotalPages(response.data.totalPages);
        setTotalResults(response.data.totalResults);
      }
    } catch (err) {
      console.error("Error loading auction history:", err);
      error("Không thể tải lịch sử đấu giá");
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: "ALL", label: "Tất cả", icon: Filter, count: totalResults },
    { value: "AUCTION_LIVE", label: "Đang diễn ra", icon: Clock },
    { value: "AUCTION_ENDED", label: "Đã kết thúc", icon: CheckCircle },
    { value: "AUCTION_REJECTED", label: "Đã từ chối", icon: XCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
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
              Lịch sử phiên đấu giá
            </h2>
            <p className="text-gray-600">
              Xem tất cả các phiên đấu giá đang diễn ra, đã kết thúc và đã từ chối
            </p>
          </div>

          {/* Status Filter Tabs */}
          <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-2 inline-flex gap-2">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const isActive = statusFilter === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setStatusFilter(option.value);
                    setPage(1); // Reset to first page
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{option.label}</span>
                  {option.count !== undefined && isActive && (
                    <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold">
                      {option.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Stats Summary */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-600 font-medium">Đang diễn ra</p>
                  <p className="text-2xl font-bold text-green-900">
                    {auctions.filter(a => a.status === "AUCTION_LIVE").length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Đã kết thúc</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {auctions.filter(a => a.status === "AUCTION_ENDED").length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-red-600 font-medium">Đã từ chối</p>
                  <p className="text-2xl font-bold text-red-900">
                    {auctions.filter(a => a.status === "AUCTION_REJECTED").length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : auctions.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Không có dữ liệu
              </h3>
              <p className="text-gray-600">
                Không tìm thấy phiên đấu giá nào với bộ lọc hiện tại
              </p>
            </div>
          ) : (
            <>
              {/* Auction History Table */}
              <AuctionHistoryTable auctions={auctions} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    disabled={loading}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function AuctionHistoryPage() {
  return (
    <RoleAuthWrapper
      allowedRoles={["ADMIN"]}
      roleRedirectMap={{
        MEMBER: "/",
      }}
    >
      <AuctionHistoryManagementPage />
    </RoleAuthWrapper>
  );
}
