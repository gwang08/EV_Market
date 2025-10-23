"use client";
import React from 'react';
import RoleAuthWrapper from '@/components/common/RoleAuthWrapper';
import { getUserInfo, logoutUser } from '@/services';

function AdminDashboard() {
  const userInfo = getUserInfo();

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              👑 Admin Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Đăng xuất
            </button>
          </div>

          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-emerald-700 font-medium">
                  Bạn đã đăng nhập với quyền ADMIN
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Thông tin User</h3>
              <div className="space-y-1">
                <p><strong>ID:</strong> {userInfo?.id || 'N/A'}</p>
                <p><strong>Email:</strong> {userInfo?.email || 'N/A'}</p>
                <p><strong>Tên:</strong> {userInfo?.name || 'N/A'}</p>
                <p className="text-yellow-300"><strong>Role:</strong> {userInfo?.role || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Quyền truy cập</h3>
              <ul className="space-y-1">
                <li>✅ Quản lý người dùng</li>
                <li>✅ Quản lý sản phẩm</li>
                <li>✅ Xem báo cáo</li>
                <li>✅ Cấu hình hệ thống</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Chỉ có ADMIN mới có thể truy cập trang này. Nếu bạn là MEMBER và cố gắng truy cập, bạn sẽ bị redirect về trang chủ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RoleAuthWrapper 
      allowedRoles={['ADMIN']}
      roleRedirectMap={{
        'MEMBER': '/', // If MEMBER tries to access, redirect to home
      }}
    >
      <AdminDashboard />
    </RoleAuthWrapper>
  );
}
