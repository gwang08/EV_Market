"use client";
import React from "react";
import { Star } from "lucide-react";
import colors from "../../../Utils/Color";
import { useI18nContext } from "../../../providers/I18nProvider";
import { type Review } from "../../../services";
import { motion } from "framer-motion";

interface SellerStatisticsProps {
  reviews: Review[];
}

function SellerStatistics({ reviews }: SellerStatisticsProps) {
  const { t } = useI18nContext();

  // Calculate statistics
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  const ratingDistribution = reviews.reduce((dist, review) => {
    dist[review.rating] = (dist[review.rating] || 0) + 1;
    return dist;
  }, {} as { [key: number]: number });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, type: "spring" }}
      className="bg-white/80 rounded-3xl p-8 shadow-lg border border-blue-100 lg:sticky lg:top-8"
    >
      <h3 className="text-2xl md:text-3xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900">
        {t("sellerProfile.statistics")}
      </h3>

      {/* Rating Breakdown */}
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-blue-700">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center items-center gap-1 mb-2">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                size={18}
                className={`md:w-5 md:h-5 ${
                  index < Math.round(averageRating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-slate-500">
            {t("sellerProfile.basedOnReviews").replace(
              "{count}",
              reviews.length.toString()
            )}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating] || 0;
            const percentage =
              reviews.length > 0 ? (count / reviews.length) * 100 : 0;

            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm w-8 text-slate-500">{rating}★</span>
                <div className="flex-1 h-3 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm w-8 text-right text-slate-500">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="mt-8 pt-6 border-t border-blue-100">
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-indigo-600">
              {reviews.length}
            </div>
            <div className="text-sm text-slate-500">
              {t("sellerProfile.totalReviews")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-indigo-600">
              {new Set(reviews.map((r) => r.type)).size}
            </div>
            <div className="text-sm text-slate-500">
              {t("sellerProfile.productTypes")}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default SellerStatistics;
