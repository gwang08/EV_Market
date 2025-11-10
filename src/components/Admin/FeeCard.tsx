"use client";
import React, { useState } from "react";
import { Fee } from "@/types/admin";
import { DollarSign, Edit, Save, X, ShoppingCart, Gavel, ToggleLeft, ToggleRight } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface FeeCardProps {
  fee: Fee;
  onUpdate: (
    feeId: string,
    updates: { percentage?: number; description?: string; isActive?: boolean }
  ) => Promise<void>;
}

export default function FeeCard({ fee, onUpdate }: FeeCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [percentage, setPercentage] = useState(fee.percentage);
  const [description, setDescription] = useState(fee.description);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveClick = () => {
    // Kiểm tra xem có thay đổi gì không
    if (percentage === fee.percentage && description === fee.description) {
      setIsEditing(false);
      return;
    }
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = async () => {
    setIsLoading(true);
    try {
      await onUpdate(fee.id, { percentage, description });
      setShowSaveConfirm(false);
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPercentage(fee.percentage);
    setDescription(fee.description);
    setIsEditing(false);
  };

  const handleToggleClick = () => {
    setShowToggleConfirm(true);
  };

  const handleConfirmToggle = async () => {
    setIsLoading(true);
    try {
      await onUpdate(fee.id, { isActive: !fee.isActive });
      setShowToggleConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getFeeIcon = () => {
    if (fee.type === "REGULAR_SALE") {
      return <ShoppingCart className="w-6 h-6" />;
    }
    return <Gavel className="w-6 h-6" />;
  };

  const getFeeColor = () => {
    if (fee.type === "REGULAR_SALE") {
      return {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-600",
        icon: "bg-blue-100",
      };
    }
    return {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-600",
      icon: "bg-purple-100",
    };
  };

  const getFeeTitle = () => {
    if (fee.type === "REGULAR_SALE") {
      return "Bán thường";
    }
    return "Đấu giá";
  };

  const colors = getFeeColor();

  return (
    <>
    <div className={`${colors.bg} border ${colors.border} rounded-xl p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`${colors.icon} p-3 rounded-lg`}>
            {getFeeIcon()}
          </div>
          <div>
            <h3 className={`font-bold text-lg ${colors.text}`}>
              {getFeeTitle()}
            </h3>
            <p className="text-sm text-gray-600">
              {fee.type === "REGULAR_SALE"
                ? "Phí hoa hồng cho bán thường"
                : "Phí hoa hồng cho đấu giá"}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleClick}
          disabled={isLoading}
          className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
            fee.isActive
              ? "bg-green-100 text-green-600 hover:bg-green-200"
              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
          }`}
          title={fee.isActive ? "Đang hoạt động - Click để tắt" : "Đã tắt - Click để bật"}
        >
          {fee.isActive ? (
            <ToggleRight className="w-6 h-6" />
          ) : (
            <ToggleLeft className="w-6 h-6" />
          )}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          {/* Percentage Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phần trăm phí (%)
            </label>
            <div className="relative">
              <input
                type="number"
                value={percentage}
                onChange={(e) => setPercentage(parseFloat(e.target.value))}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                %
              </div>
            </div>
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSaveClick}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 hover:shadow-md active:scale-95 transition-all duration-200 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Lưu
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:scale-95 transition-all duration-200 font-medium cursor-pointer disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Hủy
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Display Mode */}
          <div className="mb-4">
            <div className={`text-4xl font-bold ${colors.text} mb-2`}>
              {fee.percentage}%
            </div>
            <p className="text-sm text-gray-600">{fee.description}</p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className={`text-xs ${colors.text} font-medium`}>
              {fee.isActive ? "🟢 Đang hoạt động" : "🔴 Đã tắt"}
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className={`flex items-center gap-2 px-4 py-2 ${colors.bg} ${colors.text} rounded-lg hover:opacity-80 hover:shadow-md active:scale-95 transition-all duration-200 font-medium border ${colors.border} cursor-pointer`}
            >
              <Edit className="w-4 h-4" />
              Chỉnh sửa
            </button>
          </div>
        </div>
      )}
    </div>

    {/* Confirm Dialog cho Save */}
    <ConfirmDialog
      isOpen={showSaveConfirm}
      onClose={() => setShowSaveConfirm(false)}
      onConfirm={handleConfirmSave}
      title="Xác nhận cập nhật phí"
      message={
        <div className="space-y-2">
          <p>Bạn có chắc chắn muốn cập nhật phí <strong>{getFeeTitle()}</strong>?</p>
          <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Phần trăm cũ:</span>
              <span className="font-semibold">{fee.percentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phần trăm mới:</span>
              <span className="font-semibold text-blue-600">{percentage}%</span>
            </div>
          </div>
          <p className="text-sm text-amber-600">⚠️ Thay đổi này sẽ ảnh hưởng đến tất cả giao dịch mới.</p>
        </div>
      }
      confirmText="Xác nhận cập nhật"
      type="warning"
      isLoading={isLoading}
    />

    {/* Confirm Dialog cho Toggle Active */}
    <ConfirmDialog
      isOpen={showToggleConfirm}
      onClose={() => setShowToggleConfirm(false)}
      onConfirm={handleConfirmToggle}
      title={fee.isActive ? "Tắt phí" : "Bật phí"}
      message={
        fee.isActive ? (
          <div className="space-y-2">
            <p>Bạn có chắc chắn muốn <strong className="text-red-600">TẮT</strong> phí <strong>{getFeeTitle()}</strong>?</p>
            <p className="text-sm text-red-600">⚠️ Khi tắt, hệ thống sẽ KHÔNG thu phí cho loại giao dịch này!</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p>Bạn có chắc chắn muốn <strong className="text-green-600">BẬT</strong> phí <strong>{getFeeTitle()}</strong>?</p>
            <p className="text-sm text-gray-600">Hệ thống sẽ thu {fee.percentage}% cho loại giao dịch này.</p>
          </div>
        )
      }
      confirmText={fee.isActive ? "Tắt phí" : "Bật phí"}
      type={fee.isActive ? "danger" : "info"}
      isLoading={isLoading}
    />
  </>
  );
}
