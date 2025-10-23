"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, Shield, MapPin, Calendar, Car, Zap } from "lucide-react";
import { useI18nContext } from "../../providers/I18nProvider";
import VerifiedBadge from "../common/VerifiedBadge";
import {
  Vehicle,
  getSellerProfile,
  type SellerProfile,
  type Review,
} from "../../services";
import { motion } from "framer-motion";

interface SellerInfoProps {
  vehicle: Vehicle;
}

function SellerInfo({ vehicle }: SellerInfoProps) {
  const { t } = useI18nContext();
  const router = useRouter();
  const [sellerData, setSellerData] = useState<{
    seller: SellerProfile;
    reviews: Review[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!vehicle.sellerId) return;
      setLoading(true);
      try {
        const response = await getSellerProfile(vehicle.sellerId);
        if (response.success && response.data) {
          setSellerData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch seller data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSellerData();
  }, [vehicle.sellerId]);

  const getRatingData = () => {
    if (sellerData?.reviews && sellerData.reviews.length > 0) {
      const averageRating =
        sellerData.reviews.reduce((sum, review) => sum + review.rating, 0) /
        sellerData.reviews.length;
      return {
        rating: Number(averageRating.toFixed(1)),
        reviewCount: sellerData.reviews.length,
      };
    }
    return {
      rating: 0,
      reviewCount: 0,
    };
  };

  const ratingData = getRatingData();

  const seller = {
    name: sellerData?.seller?.name || vehicle.seller?.name || "EVMarket Seller",
    avatar: sellerData?.seller?.avatar || vehicle.seller?.avatar || "",
    rating: ratingData.rating,
    reviewCount: ratingData.reviewCount,
    verified: sellerData?.seller?.isVerified ?? vehicle.isVerified ?? false,
    joinDate: sellerData?.seller?.createdAt
      ? new Date(sellerData.seller.createdAt).getFullYear().toString()
      : new Date(vehicle.createdAt).getFullYear().toString(),
    location: "Vietnam",
    activeListings: 1,
    responseTime: "1 hour",
    description:
      "Professional electric vehicle seller with expertise in EVs and sustainable transportation solutions.",
  };

  const handleViewProfile = () => {
    router.push(`/seller/${vehicle.sellerId}`);
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl shadow-xl border border-blue-100 mt-10 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 shadow border-2 border-white flex-shrink-0">
            {seller.avatar ? (
              <Image
                src={seller.avatar}
                alt={seller.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
                <span className="text-white text-xl font-bold">
                  {seller.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {seller.verified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow border-2 border-white">
                <Shield size={12} className="text-white" />
              </div>
            )}
          </div>
          {/* Seller Name & Rating */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg truncate bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                {seller.name}
              </span>
              {seller.verified && <VerifiedBadge width={50} height={14} />}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {loading ? (
                <div className="animate-pulse bg-gray-300 h-4 w-16 rounded"></div>
              ) : (
                <>
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      size={15}
                      className={
                        index < Math.round(seller.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }
                    />
                  ))}
                  <span className="font-medium ml-1 text-slate-900 text-sm">
                    {seller.rating}
                  </span>
                  <span className="text-xs text-slate-500 ml-2">
                    ({seller.reviewCount} reviews)
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Seller Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 mb-4">
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span>{seller.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>
              {t("vehicleDetail.memberSince")} {seller.joinDate}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Car size={14} />
            <span>
              {seller.activeListings} {t("vehicleDetail.activeListings")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={14} />
            <span>
              {t("vehicleDetail.usuallyResponds")} {seller.responseTime}
            </span>
          </div>
        </div>

        {/* Seller Description */}
        <motion.div
          className="mb-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <p className="text-base text-slate-700 line-clamp-3">
            {seller.description}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleViewProfile}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow"
          >
            {t("vehicleDetail.viewProfile")}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 border-2 border-gray-300 hover:border-blue-400 text-gray-700 font-semibold py-2 px-4 rounded-xl transition-colors duration-200 bg-white"
          >
            {t("vehicleDetail.report")}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default SellerInfo;
