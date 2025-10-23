"use client";
import React, { useState } from "react";
import { AuctionRequest } from "@/types/admin";
import { Check, X, Clock, Eye } from "lucide-react";
import { useI18nContext } from "@/providers/I18nProvider";
import Image from "next/image";

interface AuctionRequestCardProps {
  request: AuctionRequest;
  onApprove: (id: string, listingType: "VEHICLE" | "BATTERY") => void;
  onReject: (id: string, listingType: "VEHICLE" | "BATTERY", reason: string) => void;
}

export default function AuctionRequestCard({
  request,
  onApprove,
  onReject,
}: AuctionRequestCardProps) {
  const { t } = useI18nContext();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

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

          {/* Auction Time */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
              <Clock className="w-4 h-4" />
              <span>Thời gian đấu giá</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {new Date(request.auctionStartsAt!).toLocaleDateString("vi-VN")} -{" "}
              {new Date(request.auctionEndsAt!).toLocaleDateString("vi-VN")}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onApprove(request.id, request.listingType)}
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
