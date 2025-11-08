"use client";
import React, { useState, useEffect } from "react";
import RoleAuthWrapper from "@/components/common/RoleAuthWrapper";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import AdminTopbar from "@/components/Admin/AdminTopbar";
import Pagination from "@/components/common/Pagination";
import { getContracts, getContractUrl } from "@/services/Admin";
import { Contract } from "@/types/admin";
import { FileCheck, Search, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/providers/ToastProvider";

function ContractsManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingContract, setLoadingContract] = useState<string | null>(null);
  const { success, error } = useToast();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    loadContracts();
  }, [page]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const response = await getContracts(page, 20);
      if (response.success && response.data) {
        setContracts(response.data.contracts || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error loading contracts:", err);
      error("Không thể tải danh sách hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  const handleViewContract = async (contractId: string) => {
    try {
      setLoadingContract(contractId);
      const response = await getContractUrl(contractId);
      
      if (response.success && response.data?.url) {
        // Open contract in new tab
        window.open(response.data.url, '_blank', 'noopener,noreferrer');
        success("Đang mở hợp đồng...");
      } else {
        error(response.message || "Không thể tải hợp đồng");
      }
    } catch (err) {
      console.error("Error viewing contract:", err);
      error("Có lỗi xảy ra khi xem hợp đồng");
    } finally {
      setLoadingContract(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const filteredContracts = contracts.filter((contract) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      contract.buyer.name.toLowerCase().includes(search) ||
      contract.seller.name.toLowerCase().includes(search) ||
      contract.listing.title.toLowerCase().includes(search) ||
      contract.id.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="lg:ml-64">
        <AdminTopbar toggleSidebar={toggleSidebar} />
        <main className="p-4 lg:p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Quản lý hợp đồng
            </h2>
            <p className="text-gray-600">
              Xem và quản lý tất cả hợp đồng mua bán trong hệ thống
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm hợp đồng theo tên người mua, người bán, hoặc sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Contracts Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Mã hợp đồng
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Người mua
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Người bán
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Giá trị
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredContracts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <p className="text-gray-500 text-lg">
                          {searchTerm
                            ? `Không tìm thấy hợp đồng nào cho "${searchTerm}"`
                            : "Chưa có hợp đồng nào trong hệ thống"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredContracts.map((contract) => (
                      <tr
                        key={contract.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-mono text-gray-900">
                            {contract.id.substring(0, 12)}...
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-gray-900">
                            {contract.listingTitle}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-900">
                            {contract.buyerName}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-900">
                            {contract.sellerName}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-bold text-green-600">
                            {formatPrice(contract.amount)}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-600">
                            {formatDate(contract.createdAt)}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleViewContract(contract.id)}
                            disabled={loadingContract === contract.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all font-medium text-sm border border-blue-200 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loadingContract === contract.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                                Đang tải...
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4" />
                                Xem
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <FileCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">
                Lưu ý về hợp đồng
              </p>
              <p className="text-sm text-blue-700">
                Tất cả hợp đồng được lưu trữ an toàn và có giá trị pháp lý.
                Để xem chi tiết hợp đồng, vui lòng nhấn nút "Xem" tương ứng.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ContractsPage() {
  return (
    <RoleAuthWrapper allowedRoles={["ADMIN"]} roleRedirectMap={{ MEMBER: "/" }}>
      <ContractsManagementPage />
    </RoleAuthWrapper>
  );
}
