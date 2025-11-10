"use client";
import React from "react";
import { Listing } from "@/types/admin";
import { CheckCircle, XCircle, Calendar, DollarSign, Tag } from "lucide-react";
import Image from "next/image";

interface ListingCardProps {
  listing: Listing;
  onVerify: (type: "VEHICLE" | "BATTERY", listingId: string, isVerified: boolean) => void;
}

export default function ListingCard({ listing, onVerify }: ListingCardProps) {
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {listing.images && listing.images.length > 0 ? (
          <Image
            src={listing.images[0]}
            alt={listing.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No Image
          </div>
        )}
        {listing.isVerified && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Đã xác thực
          </div>
        )}
        <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
          {listing.type === "VEHICLE" ? "Xe điện" : "Pin"}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
          {listing.title}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Tag className="w-4 h-4" />
            <span className="font-semibold">{listing.brand}</span>
            {listing.model && <span>• {listing.model}</span>}
            <span>• {listing.year}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="font-bold text-green-600">
              {formatPrice(listing.price)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Đăng ngày {formatDate(listing.createdAt)}</span>
          </div>
        </div>

        {/* Seller Info */}
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
          {listing.seller.avatar ? (
            <Image
              src={listing.seller.avatar}
              alt={listing.seller.name}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">
              {listing.seller.name}
            </p>
            <p className="text-xs text-gray-500">{listing.seller.email}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {listing.isVerified ? (
            <button
              onClick={() => onVerify(listing.type, listing.id, false)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:shadow-md active:scale-95 transition-all duration-200 font-medium border border-red-200 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              Gỡ xác thực
            </button>
          ) : (
            <button
              onClick={() => onVerify(listing.type, listing.id, true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 hover:shadow-md active:scale-95 transition-all duration-200 font-medium border border-green-200 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              Xác thực
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
