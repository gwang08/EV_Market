"use client";
import React, { useState } from "react";
import { User } from "@/types/admin";
import { Lock, Unlock, Shield, User as UserIcon, Calendar } from "lucide-react";
import Image from "next/image";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface UserTableProps {
  users: User[];
  onLockUser: (userId: string, reason: string) => Promise<void>;
  onUnlockUser: (userId: string) => Promise<void>;
}

export default function UserTable({
  users,
  onLockUser,
  onUnlockUser,
}: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [lockReason, setLockReason] = useState("");
  const [showLockModal, setShowLockModal] = useState(false);
  const [showUnlockConfirm, setShowUnlockConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLockClick = (user: User) => {
    setSelectedUser(user);
    setLockReason("");
    setShowLockModal(true);
  };

  const handleUnlockClick = (user: User) => {
    setSelectedUser(user);
    setShowUnlockConfirm(true);
  };

  const handleConfirmLock = async () => {
    if (!selectedUser || !lockReason.trim()) return;

    setIsLoading(true);
    try {
      await onLockUser(selectedUser.id, lockReason);
      setShowLockModal(false);
      setSelectedUser(null);
      setLockReason("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmUnlock = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      await onUnlockUser(selectedUser.id);
      setShowUnlockConfirm(false);
      setSelectedUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
      STAFF: "bg-blue-100 text-blue-800 border-blue-200",
      MEMBER: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
          styles[role as keyof typeof styles] || styles.MEMBER
        }`}
      >
        <Shield className="w-3 h-3" />
        {role}
      </span>
    );
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Trạng thái
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
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {user.name}
                        </p>
                        {user.isVerified && (
                          <span className="text-xs text-green-600 font-medium">
                            ✓ Đã xác thực
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-700">{user.email}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isLocked ? (
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                          <Lock className="w-3 h-3" />
                          Đã khóa
                        </span>
                        {user.lockReason && (
                          <p className="text-xs text-gray-500 italic">
                            {user.lockReason}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                        <Unlock className="w-3 h-3" />
                        Hoạt động
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {formatDate(user.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {user.role !== "ADMIN" && (
                      <>
                        {user.isLocked ? (
                          <button
                            onClick={() => handleUnlockClick(user)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 hover:shadow-md active:scale-95 transition-all duration-200 font-medium text-sm cursor-pointer"
                          >
                            <Unlock className="w-4 h-4" />
                            Mở khóa
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLockClick(user)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 hover:shadow-md active:scale-95 transition-all duration-200 font-medium text-sm cursor-pointer"
                          >
                            <Lock className="w-4 h-4" />
                            Khóa
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lock Modal */}
      {showLockModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-slideUp">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Khóa tài khoản người dùng
            </h3>
            <p className="text-gray-600 mb-2">
              Bạn đang khóa tài khoản: <strong>{selectedUser.name}</strong>
            </p>
            <p className="text-gray-600 mb-4">
              Vui lòng nhập lý do khóa tài khoản:
            </p>
            <textarea
              value={lockReason}
              onChange={(e) => setLockReason(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Nhập lý do khóa tài khoản..."
              disabled={isLoading}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowLockModal(false);
                  setSelectedUser(null);
                  setLockReason("");
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 active:scale-95 transition-all duration-200 font-medium cursor-pointer disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmLock}
                disabled={!lockReason.trim() || isLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 hover:shadow-md active:scale-95 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Xác nhận khóa"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unlock Confirm Dialog */}
      <ConfirmDialog
        isOpen={showUnlockConfirm}
        onClose={() => {
          setShowUnlockConfirm(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmUnlock}
        title="Mở khóa tài khoản"
        message={`Bạn có chắc chắn muốn mở khóa tài khoản "${selectedUser?.name}"? Người dùng này sẽ có thể truy cập vào hệ thống trở lại.`}
        confirmText="Mở khóa"
        type="info"
        isLoading={isLoading}
      />
    </>
  );
}
