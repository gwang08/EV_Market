"use client";
import React, { useState } from "react";
import { AuctionRequest } from "@/types/admin";
import { Check, X, Clock, Calendar } from "lucide-react";
import { useI18nContext } from "@/providers/I18nProvider";
import Image from "next/image";

interface AuctionRequestCardProps {
  request: AuctionRequest;
  onApprove: (
    id: string,
    listingType: "VEHICLE" | "BATTERY",
    startTime: string,
    endTime: string
  ) => void;
  onReject: (
    id: string,
    listingType: "VEHICLE" | "BATTERY",
    reason: string
  ) => void;
}

export default function AuctionRequestCard({
  request,
  onApprove,
  onReject,
}: AuctionRequestCardProps) {
  const { t } = useI18nContext();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Get current datetime in local timezone for min attribute
  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleApprove = () => {
    if (!startTime || !endTime) {
      alert("Vui lòng chọn thời gian bắt đầu và kết thúc");
      return;
    }

    // Kiểm tra logic thời gian (so sánh string)
    if (endTime <= startTime) {
      alert("Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }

    // GỬI THỜI GIAN ĐÚNG NHƯ NGƯỜI DÙNG CHỌN (KHÔNG CONVERT)
    // User chọn: "2025-11-10T21:55"
    // Gửi API: "2025-11-10T21:55:00.000Z" (coi như UTC, nhưng thực ra là giờ local)
    const startISO = startTime + ":00.000Z";
    const endISO = endTime + ":00.000Z";

    onApprove(request.id, request.listingType, startISO, endISO);
    setShowApproveModal(false);
    setStartTime("");
    setEndTime("");
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }
    onReject(request.id, request.listingType, rejectionReason);
    setShowRejectModal(false);
    setRejectionReason("");
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="relative h-48 bg-gray-100">
          <Image
            src={request.images[0] || "/placeholder.png"}
            alt={request.title}
            fill
            className="object-cover"
          />
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
              Chờ duyệt
            </span>
          </div>
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
              {request.listingType === "VEHICLE" ? "Xe điện" : "Pin"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title & Seller */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
            {request.title}
          </h3>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
              {request.seller.avatar ? (
                <img
                  src={request.seller.avatar}
                  alt={request.seller.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-600" />
              )}
            </div>
            <span className="text-sm text-gray-600">{request.seller.name}</span>
          </div>

          {/* Auction Details */}
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Giá khởi điểm:</span>
              <span className="font-semibold text-gray-900">
                {request.startingPrice?.toLocaleString()} VND
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bước giá:</span>
              <span className="font-semibold text-gray-900">
                {request.bidIncrement?.toLocaleString()} VND
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Đặt cọc:</span>
              <span className="font-semibold text-gray-900">
                {request.depositAmount?.toLocaleString() || 0} VND
              </span>
            </div>
          </div>

          {/* Created Date */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
              <Clock className="w-4 h-4" />
              <span>Ngày tạo yêu cầu</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {new Date(request.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowApproveModal(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <Check className="w-4 h-4" />
              Phê duyệt
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Từ chối
            </button>
          </div>
        </div>
      </div>

      {/* Approve Modal with Time Settings */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Phê duyệt đấu giá
            </h3>
            <p className="text-gray-600 mb-6">
              Thiết lập thời gian đấu giá cho <strong>{request.title}</strong>
            </p>

            <div className="space-y-4">
              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Thời gian bắt đầu
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  min={getCurrentDateTime()}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Thời gian kết thúc
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  min={startTime || getCurrentDateTime()}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Quick Options */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-900 font-medium mb-2">
                  Lựa chọn nhanh:
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const start = new Date(now);
                      const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                      start.setMinutes(
                        start.getMinutes() - start.getTimezoneOffset()
                      );
                      end.setMinutes(
                        end.getMinutes() - end.getTimezoneOffset()
                      );
                      setStartTime(start.toISOString().slice(0, 16));
                      setEndTime(end.toISOString().slice(0, 16));
                    }}
                    className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 text-xs rounded-md hover:bg-blue-50"
                  >
                    24 giờ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const start = new Date(now);
                      const end = new Date(
                        now.getTime() + 3 * 24 * 60 * 60 * 1000
                      );
                      start.setMinutes(
                        start.getMinutes() - start.getTimezoneOffset()
                      );
                      end.setMinutes(
                        end.getMinutes() - end.getTimezoneOffset()
                      );
                      setStartTime(start.toISOString().slice(0, 16));
                      setEndTime(end.toISOString().slice(0, 16));
                    }}
                    className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 text-xs rounded-md hover:bg-blue-50"
                  >
                    3 ngày
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const start = new Date(now);
                      const end = new Date(
                        now.getTime() + 7 * 24 * 60 * 60 * 1000
                      );
                      start.setMinutes(
                        start.getMinutes() - start.getTimezoneOffset()
                      );
                      end.setMinutes(
                        end.getMinutes() - end.getTimezoneOffset()
                      );
                      setStartTime(start.toISOString().slice(0, 16));
                      setEndTime(end.toISOString().slice(0, 16));
                    }}
                    className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 text-xs rounded-md hover:bg-blue-50"
                  >
                    7 ngày
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setStartTime("");
                  setEndTime("");
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Xác nhận phê duyệt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Từ chối đấu giá
            </h3>
            <p className="text-gray-600 mb-4">
              Vui lòng nhập lý do từ chối yêu cầu đấu giá này:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              rows={4}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
