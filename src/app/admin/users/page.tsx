"use client";
import React, { useState, useEffect } from "react";
import RoleAuthWrapper from "@/components/common/RoleAuthWrapper";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import AdminTopbar from "@/components/Admin/AdminTopbar";
import UsersTable from "@/components/Admin/UsersTable";
import UserTable from "@/components/Admin/UserTable";
import Pagination from "@/components/common/Pagination";
import { getUsers, lockUser, unlockUser } from "@/services/Admin";
import { User } from "@/types/admin";
import {
  Loader2,
  AlertCircle,
  Search,
  Filter,
  Users as UsersIcon,
} from "lucide-react";
import { useToast } from "@/providers/ToastProvider";

function UsersManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "locked">(
    "all"
  );
  const [currentPage, setCurrentPage] = useState(1);
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

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    setErrorMessage(null); // Reset error
    try {
      const result = await getUsers(page, 10);
      if (result.success && result.data) {
        setUsers(result.data.users);
        setTotalPages(result.data.totalPages);
        setCurrentPage(result.data.page);
      } else {
        setErrorMessage(result.message || "Không thể tải danh sách người dùng");
      }
    } catch (err) {
      setErrorMessage("Có lỗi xảy ra khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserUpdate = () => {
    fetchUsers(currentPage);
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page);
  };

  // Filter users based on search term and status
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && !user.isLocked) ||
      (filterStatus === "locked" && user.isLocked);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="lg:ml-64">
        <AdminTopbar toggleSidebar={toggleSidebar} />
        <main className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Quản lý người dùng
            </h2>
            <p className="text-gray-600">
              Phê duyệt, khóa tài khoản và quản lý người dùng
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang hoạt động</option>
                <option value="locked">Đã khóa</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Tổng người dùng
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : users.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Đang hoạt động
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : users.filter((u) => !u.isLocked).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Đã khóa</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : users.filter((u) => u.isLocked).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {errorMessage ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Có lỗi xảy ra
              </h3>
              <p className="text-gray-600 mb-4">{errorMessage}</p>
              <button
                onClick={() => fetchUsers()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              <UsersTable
                users={filteredUsers}
                onUserUpdate={handleUserUpdate}
                loading={loading}
              />

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Trước
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 border text-sm font-medium rounded-md ${
                            currentPage === page
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Sau
                    </button>
                  </div>
                </div>
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
