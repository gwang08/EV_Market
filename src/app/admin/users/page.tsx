"use client";
import React, { useState } from "react";
import RoleAuthWrapper from "@/components/common/RoleAuthWrapper";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import AdminTopbar from "@/components/Admin/AdminTopbar";
import { Users } from "lucide-react";

function UsersManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Đang phát triển
            </h3>
            <p className="text-gray-600">
              Tính năng quản lý người dùng đang được phát triển
            </p>
          </div>
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
