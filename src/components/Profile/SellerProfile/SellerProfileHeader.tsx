"use client";
import React from "react";
import Image from "next/image";
import { Star, Shield, Calendar, MapPin, Mail } from "lucide-react";
import { useI18nContext } from "../../../providers/I18nProvider";
import VerifiedBadge from "../../common/VerifiedBadge";
import { type SellerProfile, type Review } from "../../../services";
import { motion } from "framer-motion";

interface SellerProfileHeaderProps {
  seller: SellerProfile;
  reviews: Review[];
}

function SellerProfileHeader({ seller, reviews }: SellerProfileHeaderProps) {
  const { t } = useI18nContext();

  // Calculate statistics
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  const memberSince = new Date(seller.createdAt).getFullYear();

  return (
    <div className="relative md:pt-30">
      {/* Gradient background with glassmorphism overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-80 blur-2xl"></div>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring" }}
        className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-12 md:py-16"
      >
        <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12">
          {/* Seller Avatar */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, type: "spring", delay: 0.2 }}
            className="relative mx-auto md:mx-0"
          >
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden bg-white/30 ring-4 ring-blue-300 shadow-xl">
              {seller.avatar ? (
                <Image
                  src={seller.avatar}
                  alt={seller.name}
                  width={144}
                  height={144}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500">
                  <span className="text-white text-4xl md:text-5xl font-extrabold">
                    {seller.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {seller.isVerified && (
              <div className="absolute -bottom-3 -right-3 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center ring-4 ring-white shadow-lg">
                <Shield size={20} className="text-white md:w-6 md:h-6" />
              </div>
            )}
          </motion.div>
          {/* Seller Info */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, type: "spring", delay: 0.3 }}
            className="flex-1 text-center md:text-left w-full"
          >
            <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
              <h1 className="text-3xl md:text-4xl font-extrabold drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900">
                <span
                  className="text-blue-900 bg-none"
                  style={{ WebkitTextFillColor: "#1e293b" }}
                >
                  {seller.name}
                </span>
              </h1>
              {seller.isVerified && (
                <div className="hidden md:block">
                  <VerifiedBadge width={100} height={28} />
                </div>
              )}
            </div>
            <div className="space-y-2 text-slate-100 text-base md:text-lg">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Mail size={16} className="md:w-5 md:h-5 flex-shrink-0" />
                <span className="truncate font-medium">{seller.email}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Calendar size={16} className="md:w-5 md:h-5 flex-shrink-0" />
                <span>
                  {t("sellerProfile.memberSince")} {memberSince}
                </span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <MapPin size={16} className="md:w-5 md:h-5 flex-shrink-0" />
                <span>Vietnam</span>
              </div>
            </div>
            {/* Rating Summary */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      size={22}
                      className={`md:w-6 md:h-6 ${
                        index < Math.round(averageRating)
                          ? "text-yellow-400 fill-current"
                          : "text-white/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xl md:text-2xl font-bold text-yellow-300">
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <div className="text-slate-100 text-lg">
                <span className="font-bold">{reviews.length}</span>{" "}
                {t("sellerProfile.reviews")}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default SellerProfileHeader;
