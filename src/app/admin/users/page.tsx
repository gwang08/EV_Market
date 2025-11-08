"use client";
import React, { useState, useEffect } from "react";
import RoleAuthWrapper from "@/components/common/RoleAuthWrapper";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import AdminTopbar from "@/components/Admin/AdminTopbar";
import UserTable from "@/components/Admin/UserTable";
import Pagination from "@/components/common/Pagination";
import { getUsers, lockUser, unlockUser } from "@/services/Admin";
import { User } from "@/types/admin";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/providers/ToastProvider";

function UsersManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const { success, error } = useToast();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    loadUsers();
  }, [page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers(page, 10);
      if (response.success && response.data) {
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
        setTotalResults(response.data.totalResults);
      }
    } catch (err) {
      console.error("Error loading users:", err);
      error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleLockUser = async (userId: string, reason: string) => {
    try {
      const response = await lockUser(userId, reason);
      if (response.success) {
        success("Đã khóa tài khoản người dùng");
        loadUsers();
      } else {
        error(response.message || "Khóa tài khoản thất bại");
      }
    } catch (err) {
      console.error("Error locking user:", err);
      error("Có lỗi xảy ra khi khóa tài khoản");
    }
  };

  const handleUnlockUser = async (userId: string) => {
    try {
      const response = await unlockUser(userId);
      if (response.success) {
        success("Đã mở khóa tài khoản người dùng");
        loadUsers();
      } else {
        error(response.message || "Mở khóa tài khoản thất bại");
      }
    } catch (err) {
      console.error("Error unlocking user:", err);
      error("Có lỗi xảy ra khi mở khóa tài khoản");
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
              Quản lý người dùng
            </h2>
            <p className="text-gray-600">
              Phê duyệt, khóa tài khoản và quản lý người dùng
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : users.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Không có người dùng
              </h3>
              <p className="text-gray-600">
                Chưa có người dùng nào trong hệ thống
              </p>
            </div>
          ) : (
            <>
              <UserTable
                users={users}
                onLockUser={handleLockUser}
                onUnlockUser={handleUnlockUser}
              />

              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  disabled={loading}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <RoleAuthWrapper allowedRoles={["ADMIN"]} roleRedirectMap={{ MEMBER: "/" }}>
      <UsersManagementPage />
    </RoleAuthWrapper>
  );
}
