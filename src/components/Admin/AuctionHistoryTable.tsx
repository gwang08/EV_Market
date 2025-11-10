"use client";
import React, { useState } from "react";
import { AuctionRequest } from "@/types/admin";
import {
  Eye,
  ExternalLink,
  Calendar,
  DollarSign,
  TrendingUp,
  XCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface AuctionHistoryTableProps {
  auctions: AuctionRequest[];
}

export default function AuctionHistoryTable({
  auctions,
}: AuctionHistoryTableProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " VNĐ";
  };

  const formatDate = (dateString: string) => {
    // HIỂN THỊ ĐÚNG THỜI GIAN TỪ API (KHÔNG CONVERT TIMEZONE)
    // API trả về: "2025-11-10T21:55:00.000Z" (coi như UTC nhưng thực ra là giờ local)
    // Hiển thị: "21:55 10/11/2025" (giữ nguyên)
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");

    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: {
      [key: string]: {
        label: string;
        className: string;
        icon: React.ReactNode;
      };
    } = {
      AUCTION_LIVE: {
        label: "Đang diễn ra",
        className: "bg-green-100 text-green-800 border-green-200",
        icon: <Clock className="w-3.5 h-3.5" />,
      },
      AUCTION_ENDED: {
        label: "Đã kết thúc",
        className: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <CheckCircle className="w-3.5 h-3.5" />,
      },
      AUCTION_REJECTED: {
        label: "Đã từ chối",
        className: "bg-red-100 text-red-800 border-red-200",
        icon: <XCircle className="w-3.5 h-3.5" />,
      },
      AUCTION_PAYMENT_PENDING: {
        label: "Chờ thanh toán",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Clock className="w-3.5 h-3.5" />,
      },
    };

    const config = statusConfig[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800 border-gray-200",
      icon: null,
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getListingTypeBadge = (type: "VEHICLE" | "BATTERY") => {
    return type === "VEHICLE" ? (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
        Xe
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
        Pin
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Sản phẩm
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Giá khởi điểm
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Bước giá
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Thời gian
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Người bán
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {auctions.map((auction) => (
              <tr
                key={auction.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Product Info */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {auction.images && auction.images.length > 0 ? (
                        <img
                          src={auction.images[0]}
                          alt={auction.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ExternalLink className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-sm font-semibold text-gray-900 truncate max-w-xs"
                        title={auction.title}
                      >
                        {auction.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {auction.brand} {auction.model && `• ${auction.model}`}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Listing Type */}
                <td className="px-6 py-4">
                  {getListingTypeBadge(auction.listingType)}
                </td>

                {/* Starting Price */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    {formatPrice(auction.startingPrice || 0)}
                  </div>
                </td>

                {/* Bid Increment */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-700">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    {formatPrice(auction.bidIncrement || 0)}
                  </div>
                </td>

                {/* Time */}
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Calendar className="w-3.5 h-3.5" />
                      {auction.auctionStartsAt &&
                        formatDate(auction.auctionStartsAt)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Calendar className="w-3.5 h-3.5" />
                      {auction.auctionEndsAt &&
                        formatDate(auction.auctionEndsAt)}
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  {getStatusBadge(auction.status)}
                  {auction.status === "AUCTION_REJECTED" &&
                    auction.auctionRejectionReason && (
                      <p
                        className="text-xs text-red-600 mt-1 max-w-xs truncate"
                        title={auction.auctionRejectionReason}
                      >
                        {auction.auctionRejectionReason}
                      </p>
                    )}
                </td>

                {/* Seller */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {auction.seller?.avatar ? (
                        <img
                          src={auction.seller.avatar}
                          alt={auction.seller.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-semibold">
                          {auction.seller?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {auction.seller?.name}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  {auction.status !== "AUCTION_REJECTED" && (
                    <Link
                      href={`/auction/${auction.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Xem
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {auctions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Chưa có lịch sử đấu giá
          </h3>
          <p className="text-gray-600">
            Các phiên đấu giá đã kết thúc sẽ hiển thị ở đây
          </p>
        </div>
      )}
    </div>
  );
}
