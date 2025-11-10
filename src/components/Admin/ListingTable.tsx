"use client";
import React, { useState, memo } from "react";
import { Listing } from "@/types/admin";
import { 
  CheckCircle, 
  XCircle, 
  Calendar, 
  DollarSign, 
  Tag, 
  Eye,
  Car,
  Battery
} from "lucide-react";
import Image from "next/image";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface ListingTableProps {
  listings: Listing[];
  onVerify: (type: "VEHICLE" | "BATTERY", listingId: string, isVerified: boolean) => Promise<void>;
}

// Memoized row component để tối ưu performance
const ListingRow = memo(({ 
  listing, 
  onVerifyClick 
}: { 
  listing: Listing; 
  onVerifyClick: (listing: Listing, isVerified: boolean) => void;
}) => {
  const [imageError, setImageError] = useState(false);

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

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Image & Title */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            {listing.images && listing.images.length > 0 && !imageError ? (
              <Image
                src={listing.images[0]}
                alt={listing.title}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                sizes="64px"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                {listing.type === "VEHICLE" ? (
                  <Car className="w-6 h-6" />
                ) : (
                  <Battery className="w-6 h-6" />
                )}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 truncate max-w-xs">
              {listing.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                listing.type === "VEHICLE" 
                  ? "bg-blue-100 text-blue-700" 
                  : "bg-purple-100 text-purple-700"
              }`}>
                {listing.type === "VEHICLE" ? (
                  <>
                    <Car className="w-3 h-3" />
                    Xe điện
                  </>
                ) : (
                  <>
                    <Battery className="w-3 h-3" />
                    Pin
                  </>
                )}
              </span>
              {listing.isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  <CheckCircle className="w-3 h-3" />
                  Đã xác thực
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Brand & Model */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2 text-sm">
          <Tag className="w-4 h-4 text-gray-400" />
          <div>
            <p className="font-semibold text-gray-900">{listing.brand}</p>
            {listing.model && (
              <p className="text-gray-500 text-xs">{listing.model}</p>
            )}
          </div>
        </div>
      </td>

      {/* Year */}
      <td className="px-6 py-4 whitespace-nowrap">
        <p className="text-sm text-gray-700 font-medium">{listing.year}</p>
      </td>

      {/* Price */}
      <td className="px-6 py-4 whitespace-nowrap">
        <p className="text-sm font-bold text-green-600">
          {formatPrice(listing.price)}
        </p>
      </td>

      {/* Seller */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {listing.seller.avatar ? (
            <Image
              src={listing.seller.avatar}
              alt={listing.seller.name}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">
              {listing.seller.name}
            </p>
          </div>
        </div>
      </td>

      {/* Date */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          {formatDate(listing.createdAt)}
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2">
          {listing.isVerified ? (
            <button
              onClick={() => onVerifyClick(listing, false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:shadow-md active:scale-95 transition-all duration-200 font-medium text-sm border border-red-200 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              Gỡ
            </button>
          ) : (
            <button
              onClick={() => onVerifyClick(listing, true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 hover:shadow-md active:scale-95 transition-all duration-200 font-medium text-sm border border-green-200 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              Xác thực
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});

ListingRow.displayName = "ListingRow";

export default function ListingTable({ listings, onVerify }: ListingTableProps) {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionType, setActionType] = useState<"verify" | "unverify">("verify");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyClick = (listing: Listing, isVerified: boolean) => {
    setSelectedListing(listing);
    setActionType(isVerified ? "verify" : "unverify");
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!selectedListing) return;

    setIsLoading(true);
    try {
      await onVerify(
        selectedListing.type,
        selectedListing.id,
        actionType === "verify"
      );
      setShowConfirm(false);
      setSelectedListing(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (listings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Tag className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Không có tin đăng
        </h3>
        <p className="text-gray-600">
          Không tìm thấy tin đăng nào với bộ lọc hiện tại
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Sản phẩm
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Thương hiệu
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Năm
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Giá
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Người bán
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ngày đăng
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {listings.map((listing) => (
              <ListingRow
                key={listing.id}
                listing={listing}
                onVerifyClick={handleVerifyClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setSelectedListing(null);
        }}
        onConfirm={handleConfirm}
        title={
          actionType === "verify"
            ? "Xác thực tin đăng"
            : "Gỡ xác thực tin đăng"
        }
        message={
          actionType === "verify"
            ? `Bạn có chắc chắn muốn xác thực tin đăng "${selectedListing?.title}"? Tin đăng sẽ được gắn nhãn "Đã kiểm định" và hiển thị ưu tiên cho người mua.`
            : `Bạn có chắc chắn muốn gỡ xác thực tin đăng "${selectedListing?.title}"? Tin đăng sẽ mất nhãn "Đã kiểm định".`
        }
        confirmText={actionType === "verify" ? "Xác thực" : "Gỡ xác thực"}
        type={actionType === "verify" ? "info" : "warning"}
        isLoading={isLoading}
      />
    </div>
  );
}
