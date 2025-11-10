"use client";
import React, { useState, useEffect } from "react";
import RoleAuthWrapper from "@/components/common/RoleAuthWrapper";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import AdminTopbar from "@/components/Admin/AdminTopbar";
import DashboardStats from "@/components/Admin/DashboardStats";
import { getAdminStats } from "@/services/Admin";
import { AdminStats } from "@/types/admin";
import { Loader2, RefreshCw } from "lucide-react";

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalListings: 0,
    pendingListings: 0,
    totalTransactions: 0,
    revenue: 0,
    pendingAuctions: 0,
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    loadStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await getAdminStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
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
          {/* Welcome Section */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Chào mừng trở lại!
              </h2>
              <p className="text-gray-600">
                Quản lý toàn bộ hệ thống EcoTrade EV tại đây
              </p>
            </div>
            <button
              onClick={loadStats}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Làm mới dữ liệu"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Làm mới
            </button>
          </div>

          {/* Stats */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <DashboardStats stats={stats} />
          )}

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Hành động nhanh
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/admin/listings"
                className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <span className="font-medium text-blue-900">
                  Duyệt tin đăng
                </span>
                <span className="text-blue-600">→</span>
              </a>
              <a
                href="/admin/auctions"
                className="flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <span className="font-medium text-purple-900">
                  Duyệt đấu giá
                </span>
                <span className="text-purple-600">→</span>
              </a>
              <a
                href="/admin/users"
                className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <span className="font-medium text-green-900">
                  Quản lý người dùng
                </span>
                <span className="text-green-600">→</span>
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RoleAuthWrapper
      allowedRoles={["ADMIN"]}
      roleRedirectMap={{
        MEMBER: "/",
      }}
    >
      <AdminDashboard />
    </RoleAuthWrapper>
  );
}
