"use client";
import React, { useState } from "react";
import { AuctionRequest } from "@/types/admin";
import {
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Tag,
} from "lucide-react";
import Image from "next/image";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface AuctionTableProps {
  requests: AuctionRequest[];
  onApprove: (
    id: string,
    listingType: "VEHICLE" | "BATTERY",
    startTime: string,
    endTime: string
  ) => Promise<void>;
  onReject: (
    id: string,
    listingType: "VEHICLE" | "BATTERY",
    reason: string
  ) => Promise<void>;
}

export default function AuctionTable({
  requests,
  onApprove,
  onReject,
}: AuctionTableProps) {
  const [selectedRequest, setSelectedRequest] =
    useState<AuctionRequest | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleApproveClick = (request: AuctionRequest) => {
    setSelectedRequest(request);
    // Set default times (tomorrow to next week)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const nextWeek = new Date(tomorrow);
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(18, 0, 0, 0);

    setStartTime(tomorrow.toISOString().slice(0, 16));
    setEndTime(nextWeek.toISOString().slice(0, 16));
    setShowApproveDialog(true);
  };

  const handleRejectClick = (request: AuctionRequest) => {
    setSelectedRequest(request);
    setRejectReason("");
    setShowRejectDialog(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedRequest || !startTime || !endTime) return;

    setIsLoading(true);
    try {
      await onApprove(selectedRequest.id, selectedRequest.listingType, startTime, endTime);
      setShowApproveDialog(false);
      setSelectedRequest(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) return;

    setIsLoading(true);
    try {
      await onReject(selectedRequest.id, selectedRequest.listingType, rejectReason);
      setShowRejectDialog(false);
      setSelectedRequest(null);
      setRejectReason("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Người bán
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Giá khởi điểm
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Bước giá
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
              {requests.map((request) => (
                <tr
                  key={request.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {request.images?.[0] ? (
                          <Image
                            src={request.images[0]}
                            alt={request.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            N/A
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">
                          {request.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Tag className="w-3 h-3" />
                          <span className="font-medium">{request.brand}</span>
                          {request.model && <span>• {request.model}</span>}
                          <span>• {request.year}</span>
                        </div>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            request.listingType === "VEHICLE"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {request.listingType === "VEHICLE" ? "Xe điện" : "Pin"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {request.seller.avatar ? (
                        <Image
                          src={request.seller.avatar}
                          alt={request.seller.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {request.seller.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm font-bold text-green-600">
                      <DollarSign className="w-4 h-4" />
                      {formatPrice(request.startingPrice || request.price)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">
                      {formatPrice(request.bidIncrement || 0)}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {formatDate(request.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleApproveClick(request)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-all font-medium text-sm border border-green-200 cursor-pointer active:scale-95"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Duyệt
                      </button>
                      <button
                        onClick={() => handleRejectClick(request)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-all font-medium text-sm border border-red-200 cursor-pointer active:scale-95"
                      >
                        <XCircle className="w-4 h-4" />
                        Từ chối
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Dialog with Time Selection */}
      {showApproveDialog && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full animate-slideUp">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Phê duyệt yêu cầu đấu giá
              </h3>
              <p className="text-gray-600 mt-1">{selectedRequest.title}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Thời gian bắt đầu
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Thời gian kết thúc
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Đấu giá sẽ bắt đầu vào{" "}
                  <strong>
                    {new Date(startTime).toLocaleString("vi-VN")}
                  </strong>{" "}
                  và kết thúc vào{" "}
                  <strong>{new Date(endTime).toLocaleString("vi-VN")}</strong>
                </p>
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => {
                  setShowApproveDialog(false);
                  setSelectedRequest(null);
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmApprove}
                disabled={isLoading || !startTime || !endTime}
                className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Xác nhận phê duyệt
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      {showRejectDialog && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-slideUp">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Từ chối yêu cầu đấu giá
              </h3>
              <p className="text-gray-600 mt-1">{selectedRequest.title}</p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lý do từ chối
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                placeholder="Nhập lý do từ chối yêu cầu đấu giá..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => {
                  setShowRejectDialog(false);
                  setSelectedRequest(null);
                  setRejectReason("");
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={isLoading || !rejectReason.trim()}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Xác nhận từ chối
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
