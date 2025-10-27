"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Star, Play, ChevronLeft, ChevronRight } from "lucide-react";
import colors from "../../../Utils/Color";
import { useI18nContext } from "../../../providers/I18nProvider";
import { type Review } from "../../../services";
import { motion } from "framer-motion";

interface ReviewCardProps {
  review: Review;
}

function ReviewCard({ review }: ReviewCardProps) {
  const { t } = useI18nContext();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showMediaModal, setShowMediaModal] = useState(false);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }
      />
    ));
  };

  const isVideo = (url: string) => {
    return url.includes(".mp4") || url.includes("video");
  };

  const nextMedia = () => {
    setCurrentMediaIndex((prev) =>
      prev === review.mediaUrls.length - 1 ? 0 : prev + 1
    );
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prev) =>
      prev === 0 ? review.mediaUrls.length - 1 : prev - 1
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: "spring" }}
      className="bg-white/80 rounded-3xl p-6 md:p-8 shadow-lg border border-blue-100 hover:shadow-xl transition-shadow"
    >
      {/* Review Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex-shrink-0">
            {review.buyer.avatar ? (
              <Image
                src={review.buyer.avatar}
                alt={review.buyer.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white text-lg md:text-xl font-bold">
                  {review.buyer.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-base md:text-lg truncate text-blue-900">
              {review.buyer.name}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                {renderStars(review.rating)}
              </div>
              <span className="text-xs md:text-sm whitespace-nowrap text-slate-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        {review.hasBeenEdited && (
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full whitespace-nowrap flex-shrink-0">
            {t("sellerProfile.edited")}
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="mb-4 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <p className="text-sm md:text-base font-medium truncate text-blue-900">
          {t("sellerProfile.product")}: {review.productTitle}
        </p>
        <p className="text-xs text-slate-500">
          {t("sellerProfile.type")}: {review.type}
        </p>
      </div>

      {/* Review Comment */}
      <p className="mb-4 leading-relaxed text-base md:text-lg text-slate-800">
        {/* Filter out transaction reference text */}
        {review.comment
          .replace(/Review for transaction [a-zA-Z0-9]+/g, "")
          .trim() || t("sellerProfile.greatExperience")}
      </p>

      {/* Media Gallery */}
      {review.mediaUrls && review.mediaUrls.length > 0 && (
        <div className="space-y-3">
          <div className="relative">
            <div className="aspect-video bg-blue-100 rounded-xl overflow-hidden">
              {isVideo(review.mediaUrls[currentMediaIndex]) ? (
                <div className="relative w-full h-full flex items-center justify-center bg-black rounded-xl overflow-hidden">
                  <video
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <source
                      src={review.mediaUrls[currentMediaIndex]}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <Image
                  src={review.mediaUrls[currentMediaIndex]}
                  alt="Review media"
                  fill
                  className="object-cover cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setShowMediaModal(true)}
                />
              )}
            </div>

            {review.mediaUrls.length > 1 && (
              <>
                <button
                  onClick={prevMedia}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                >
                  <ChevronLeft size={18} className="md:w-6 md:h-6" />
                </button>
                <button
                  onClick={nextMedia}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                >
                  <ChevronRight size={18} className="md:w-6 md:h-6" />
                </button>
              </>
            )}
          </div>

          {review.mediaUrls.length > 1 && (
            <div className="flex justify-center gap-2">
              {review.mediaUrls.map((_: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentMediaIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentMediaIndex ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default ReviewCard;
