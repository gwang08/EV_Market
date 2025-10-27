"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ImageIcon } from "lucide-react";
import colors from "../../Utils/Color";
import { useI18nContext } from "../../providers/I18nProvider";
import {
  getSellerProfile,
  type SellerProfile as SellerProfileType,
  type Review,
} from "../../services";
import SellerProfileHeader from "./SellerProfile/SellerProfileHeader";
import SellerStatistics from "./SellerProfile/SellerStatistics";
import ReviewCard from "./SellerProfile/ReviewCard";
import { motion } from "framer-motion";

function SellerProfilePage() {
  const params = useParams();
  const { t } = useI18nContext();
  const [sellerData, setSellerData] = useState<{
    seller: SellerProfileType;
    reviews: Review[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        const sellerId = params.id as string;
        const response = await getSellerProfile(sellerId);

        if (response.success && response.data) {
          setSellerData(response.data);
        } else {
          setError(response.message || "Failed to fetch seller profile");
        }
      } catch (err) {
        setError("Failed to fetch seller profile");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchSellerProfile();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/40 to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-16 relative">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
            {/* Left Column - Seller Info Skeleton */}
            <div className="xl:col-span-1 order-2 xl:order-1">
              <div className="bg-white/80 rounded-3xl shadow-lg p-8 lg:sticky lg:top-8 animate-pulse">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 animate-pulse mb-4"></div>
                  <div className="h-5 md:h-6 bg-gray-200 animate-pulse rounded w-28 md:w-32 mb-2"></div>
                  <div className="h-3 md:h-4 bg-gray-200 animate-pulse rounded w-20 md:w-24"></div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <div className="h-3 md:h-4 bg-gray-200 animate-pulse rounded w-16 md:w-20 mb-2"></div>
                      <div className="h-4 md:h-5 bg-gray-200 animate-pulse rounded w-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Right Column - Stats & Reviews Skeleton */}
            <div className="xl:col-span-2 space-y-8 order-1 xl:order-2">
              <div className="grid grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-sm p-4 md:p-6"
                  >
                    <div className="h-3 md:h-4 bg-gray-200 animate-pulse rounded w-20 md:w-24 mb-2"></div>
                    <div className="h-6 md:h-8 bg-gray-200 animate-pulse rounded w-12 md:w-16"></div>
                  </div>
                ))}
              </div>
              <div className="bg-white/80 rounded-3xl shadow-lg p-8">
                <div className="h-5 md:h-6 bg-gray-200 animate-pulse rounded w-40 md:w-48 mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border-b pb-4">
                      <div className="h-3 md:h-4 bg-gray-200 animate-pulse rounded w-full mb-2"></div>
                      <div className="h-3 md:h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !sellerData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">
            {error || t("sellerProfile.profileNotFound")}
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("sellerProfile.goBack")}
          </button>
        </div>
      </div>
    );
  }

  const { seller, reviews } = sellerData;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/40 to-purple-50/30"
    >
      {/* Hero Section */}
      <SellerProfileHeader seller={seller} reviews={reviews} />
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-16 relative">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          {/* Sidebar: Seller Statistics */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, type: "spring", delay: 0.2 }}
            className="xl:col-span-1 order-2 xl:order-1"
          >
            <div className="sticky top-8">
              <SellerStatistics reviews={reviews} />
            </div>
          </motion.div>
          {/* Main: Reviews Section */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, type: "spring", delay: 0.3 }}
            className="xl:col-span-2 order-1 xl:order-2"
          >
            <div className="mb-10">
              <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 drop-shadow-lg mb-4 tracking-tight">
                {t("sellerProfile.customerReviews")}
              </h2>
              <p className="text-lg md:text-xl text-slate-600 font-medium">
                {t("sellerProfile.reviewsDescription")}
              </p>
            </div>
            {reviews.length > 0 ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.15,
                    },
                  },
                }}
                className="space-y-6 md:space-y-8"
              >
                {reviews.map((review, idx) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      type: "spring",
                      delay: idx * 0.1,
                    }}
                  >
                    <ReviewCard review={review} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, type: "spring", delay: 0.4 }}
                className="bg-white/80 rounded-3xl p-12 shadow-lg border border-blue-100 text-center"
              >
                <ImageIcon size={48} className="mx-auto mb-6 text-blue-300" />
                <h3 className="text-lg md:text-xl font-bold mb-2 text-blue-900">
                  {t("sellerProfile.noReviewsYet")}
                </h3>
                <p className="text-base md:text-lg text-slate-500">
                  {t("sellerProfile.noReviewsDescription")}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default SellerProfilePage;
