"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  Lock,
  Unlock,
  Shield,
  User as UserIcon,
  Calendar,
  Car,
  Battery,
} from "lucide-react";
import { User } from "../../types/admin";
import { lockUser, unlockUser } from "../../services/Admin";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../common/Toast";

interface UsersTableProps {
  users: User[];
  onUserUpdate: () => void;
  loading?: boolean;
}

function UsersTable({ users, onUserUpdate, loading = false }: UsersTableProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lockReason, setLockReason] = useState("");
  const [showLockModal, setShowLockModal] = useState<string | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState<string | null>(null);
  const { toasts, success, error: showError, removeToast } = useToast();

  const handleLockUser = async (userId: string) => {
    if (!lockReason.trim()) {
      showError("Vui lòng nhập lý do khóa tài khoản");
      return;
    }

    setActionLoading(userId);
    try {
      const result = await lockUser(userId, lockReason);
      if (result.success) {
        success("Đã khóa tài khoản người dùng thành công");
        setShowLockModal(null);
        setLockReason("");
        onUserUpdate();
      } else {
        showError(result.message || "Không thể khóa tài khoản");
      }
    } catch (error) {
      showError("Có lỗi xảy ra khi khóa tài khoản");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnlockUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const result = await unlockUser(userId);
      if (result.success) {
        success("Đã mở khóa tài khoản người dùng thành công");
        setShowUnlockModal(null);
        onUserUpdate();
      } else {
        showError(result.message || "Không thể mở khóa tài khoản");
      }
    } catch (error) {
      showError("Có lỗi xảy ra khi mở khóa tài khoản");
    } finally {
      setActionLoading(null);
    }
  };

  // Skeleton Row Component
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
          <div className="ml-3 space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-3 w-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="h-4 w-12 bg-gray-200 rounded"></div>
          <div className="h-4 w-12 bg-gray-200 rounded"></div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-8 w-20 bg-gray-200 rounded-md"></div>
      </td>
    </tr>
  );

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Người dùng
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Vai trò
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Thống kê
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Ngày tham gia
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                // Show 5 skeleton rows while loading
                Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonRow key={index} />
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <UserIcon className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 text-sm">
                        Không tìm thấy người dùng nào
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                          {user.avatar ? (
                            <Image
                              src={user.avatar}
                              alt={user.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-500">
                              <span className="text-white text-sm font-bold">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {user.role === "ADMIN" ? (
                          <>
                            <Shield className="w-4 h-4 text-red-500 mr-1" />
                            <span className="text-sm font-medium text-red-700">
                              Admin
                            </span>
                          </>
                        ) : (
                          <>
                            <UserIcon className="w-4 h-4 text-blue-500 mr-1" />
                            <span className="text-sm font-medium text-blue-700">
                              Thành viên
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {user.isLocked ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <Lock className="w-3 h-3 mr-1" />
                            Đã khóa
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Unlock className="w-3 h-3 mr-1" />
                            Hoạt động
                          </span>
                        )}
                        {user.lockReason && (
                          <span
                            className="text-xs text-red-600 cursor-help"
                            title={user.lockReason}
                          >
                            Lý do: {user.lockReason}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Car className="w-3 h-3 mr-1" />
                          {user._count?.vehicles || 0} xe
                        </div>
                        <div className="flex items-center">
                          <Battery className="w-3 h-3 mr-1" />
                          {user._count?.batteries || 0} pin
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.role !== "ADMIN" && (
                        <div className="flex gap-2">
                          {user.isLocked ? (
                            <button
                              onClick={() => setShowUnlockModal(user.id)}
                              disabled={actionLoading === user.id}
                              className="inline-flex items-center px-3 py-1 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50"
                            >
                              <Unlock className="w-3 h-3 mr-1" />
                              {actionLoading === user.id
                                ? "Đang xử lý..."
                                : "Mở khóa"}
                            </button>
                          ) : (
                            <button
                              onClick={() => setShowLockModal(user.id)}
                              disabled={actionLoading === user.id}
                              className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                            >
                              <Lock className="w-3 h-3 mr-1" />
                              {actionLoading === user.id
                                ? "Đang xử lý..."
                                : "Khóa"}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lock Modal */}
      {showLockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Khóa tài khoản người dùng
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do khóa tài khoản <span className="text-red-500">*</span>
              </label>
              <textarea
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                placeholder="Nhập lý do khóa tài khoản..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowLockModal(null);
                  setLockReason("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => handleLockUser(showLockModal)}
                disabled={!lockReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Khóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unlock Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
              <Unlock className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
              Mở khóa tài khoản người dùng
            </h3>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Bạn có chắc chắn muốn mở khóa tài khoản này? Người dùng sẽ có thể
              đăng nhập và sử dụng hệ thống trở lại.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUnlockModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => handleUnlockUser(showUnlockModal)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Mở khóa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UsersTable;
