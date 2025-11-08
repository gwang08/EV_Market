"use client";
import React, { useState, useEffect } from "react";
import RoleAuthWrapper from "@/components/common/RoleAuthWrapper";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import AdminTopbar from "@/components/Admin/AdminTopbar";
import FeeCard from "@/components/Admin/FeeCard";
import { getFees, updateFee } from "@/services/Admin";
import { Fee } from "@/types/admin";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/providers/ToastProvider";

function FeesManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState<Fee[]>([]);
  const { success, error } = useToast();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      setLoading(true);
      const response = await getFees();
      if (response.success && response.data) {
        setFees(response.data);
      }
    } catch (err) {
      console.error("Error loading fees:", err);
      error("Không thể tải danh sách phí");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFee = async (
    feeId: string,
    updates: { percentage?: number; description?: string; isActive?: boolean }
  ) => {
    try {
      const response = await updateFee(feeId, updates);
      if (response.success) {
        success("Cập nhật phí thành công");
        loadFees();
      } else {
        error(response.message || "Cập nhật phí thất bại");
      }
    } catch (err) {
      console.error("Error updating fee:", err);
      error("Có lỗi xảy ra khi cập nhật phí");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="lg:ml-64">
        <AdminTopbar toggleSidebar={toggleSidebar} />
        <main className="p-4 lg:p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Quản lý phí & hoa hồng
            </h2>
            <p className="text-gray-600">
              Thiết lập phần trăm phí và hoa hồng của hệ thống
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : fees.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Không có dữ liệu
              </h3>
              <p className="text-gray-600">
                Chưa có phí nào được thiết lập trong hệ thống
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fees.map((fee) => (
                <FeeCard
                  key={fee.id}
                  fee={fee}
                  onUpdate={handleUpdateFee}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function FeesPage() {
  return (
    <RoleAuthWrapper allowedRoles={["ADMIN"]} roleRedirectMap={{ MEMBER: "/" }}>
      <FeesManagementPage />
    </RoleAuthWrapper>
  );
}
