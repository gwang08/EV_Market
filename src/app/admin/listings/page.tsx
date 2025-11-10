"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import RoleAuthWrapper from "@/components/common/RoleAuthWrapper";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import AdminTopbar from "@/components/Admin/AdminTopbar";
import ListingTable from "@/components/Admin/ListingTable";
import Pagination from "@/components/common/Pagination";
import { getListings, verifyListing } from "@/services/Admin";
import { Listing } from "@/types/admin";
import { Loader2, AlertCircle, Filter, Search } from "lucide-react";
import { useToast } from "@/providers/ToastProvider";

// Debounce hook để tối ưu search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function ListingsManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allListings, setAllListings] = useState<Listing[]>([]); // Toàn bộ data
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"ALL" | "VERIFIED" | "UNVERIFIED">(
    "ALL"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "VEHICLE" | "BATTERY">(
    "ALL"
  );
  const { success, error } = useToast();

  // Debounce search term để giảm số lần filter
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  // Kiểm tra có đang filter hay không
  const isFiltering =
    filter !== "ALL" || typeFilter !== "ALL" || debouncedSearchTerm !== "";

  // Load TẤT CẢ data khi component mount hoặc sau khi verify
  useEffect(() => {
    loadAllListings();
  }, []);

  // Reset page về 1 khi filter thay đổi
  useEffect(() => {
    setPage(1);
  }, [filter, typeFilter, debouncedSearchTerm]);

  const loadAllListings = async () => {
    try {
      setLoading(true);
      // Load data với limit hợp lý
      const response = await getListings(1, 100); // Giảm xuống 100
      console.log("API Response:", response);

      if (response.success && response.data) {
        console.log("Listings data:", response.data.listings);
        console.log("Total listings:", response.data.listings.length);

        // Sắp xếp theo thời gian MỚI NHẤT lên đầu (b - a để ngày mới lên trước)
        const sortedListings = [...response.data.listings].sort(
          (a: Listing, b: Listing) => {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          }
        );

        console.log("Sorted listings:", sortedListings.length);
        setAllListings(sortedListings);
      } else {
        console.error("API returned no data:", response);
        error("API không trả về dữ liệu");
      }
    } catch (err) {
      console.error("Error loading listings:", err);
      error("Không thể tải danh sách tin đăng");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = useCallback(
    async (
      type: "VEHICLE" | "BATTERY",
      listingId: string,
      isVerified: boolean
    ) => {
      try {
        const response = await verifyListing(type, listingId, isVerified);
        if (response.success) {
          success(
            isVerified
              ? "Đã xác thực tin đăng thành công"
              : "Đã gỡ xác thực tin đăng"
          );
          loadAllListings(); // Reload tất cả data
        } else {
          error(response.message || "Thao tác thất bại");
        }
      } catch (err) {
        console.error("Error verifying listing:", err);
        error("Có lỗi xảy ra khi xác thực tin đăng");
      }
    },
    [success, error]
  );

  // Filter listings
  const filteredListings = useMemo(() => {
    return allListings.filter((listing) => {
      // Filter by verification status
      if (filter === "VERIFIED" && !listing.isVerified) return false;
      if (filter === "UNVERIFIED" && listing.isVerified) return false;

      // Filter by type
      if (typeFilter === "VEHICLE" && listing.type !== "VEHICLE") return false;
      if (typeFilter === "BATTERY" && listing.type !== "BATTERY") return false;

      // Filter by search term
      if (debouncedSearchTerm) {
        const search = debouncedSearchTerm.toLowerCase();
        return (
          listing.title.toLowerCase().includes(search) ||
          listing.brand.toLowerCase().includes(search) ||
          listing.seller.name.toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [allListings, filter, typeFilter, debouncedSearchTerm]);

  // Pagination cho filtered data
  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);

  const paginatedListings = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredListings.slice(startIndex, endIndex);
  }, [filteredListings, page]);

  const stats = useMemo(
    () => ({
      total: allListings.length,
      verified: allListings.filter((l) => l.isVerified).length,
      unverified: allListings.filter((l) => !l.isVerified).length,
      vehicles: allListings.filter((l) => l.type === "VEHICLE").length,
      batteries: allListings.filter((l) => l.type === "BATTERY").length,
    }),
    [allListings]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="lg:ml-64">
        <AdminTopbar toggleSidebar={toggleSidebar} />
        <main className="p-4 lg:p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Quản lý tin đăng
            </h2>
            <p className="text-gray-600">
              Kiểm duyệt, lọc spam và gán nhãn "đã kiểm định"
            </p>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Tổng số</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600 mb-1">Đã xác thực</p>
              <p className="text-2xl font-bold text-green-700">
                {stats.verified}
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-600 mb-1">Chưa xác thực</p>
              <p className="text-2xl font-bold text-yellow-700">
                {stats.unverified}
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-600 mb-1">Xe điện</p>
              <p className="text-2xl font-bold text-blue-700">
                {stats.vehicles}
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-600 mb-1">Pin</p>
              <p className="text-2xl font-bold text-purple-700">
                {stats.batteries}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, thương hiệu, người bán..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            <div className="flex gap-2">
              <span className="text-sm font-medium text-gray-700 py-2">
                Trạng thái:
              </span>
              {[
                { value: "ALL", label: "Tất cả" },
                { value: "VERIFIED", label: "Đã xác thực" },
                { value: "UNVERIFIED", label: "Chưa xác thực" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                    filter === option.value
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="border-l border-gray-300 mx-2"></div>

            <div className="flex gap-2">
              <span className="text-sm font-medium text-gray-700 py-2">
                Loại:
              </span>
              {[
                { value: "ALL", label: "Tất cả" },
                { value: "VEHICLE", label: "Xe điện" },
                { value: "BATTERY", label: "Pin" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTypeFilter(option.value as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                    typeFilter === option.value
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : paginatedListings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg">
                {debouncedSearchTerm
                  ? `Không tìm thấy kết quả cho "${debouncedSearchTerm}"`
                  : "Chưa có tin đăng nào"}
              </p>
            </div>
          ) : (
            <>
              <ListingTable
                listings={paginatedListings}
                onVerify={handleVerify}
              />

              {/* Pagination - luôn hiển thị nếu có nhiều hơn 1 trang */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    disabled={loading}
                  />
                  <p className="text-center text-sm text-gray-500 mt-2">
                    Hiển thị {paginatedListings.length} /{" "}
                    {filteredListings.length} kết quả
                    {isFiltering && " (đã lọc)"}
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <RoleAuthWrapper allowedRoles={["ADMIN"]} roleRedirectMap={{ MEMBER: "/" }}>
      <ListingsManagementPage />
    </RoleAuthWrapper>
  );
}
