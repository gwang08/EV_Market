import React from "react";
import { motion } from "framer-motion";

export default function TransactionSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl shadow-xl overflow-hidden animate-pulse"
    >
      <div className="p-6 md:p-8">
        {/* Header Skeleton */}
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex-1">
            <div className="h-4 md:h-5 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-3 md:h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="h-7 md:h-8 w-24 bg-gray-200 rounded-full"></div>
        </div>

        {/* Product Info Skeleton */}
        <div className="flex gap-4 mb-4">
          {/* Image Skeleton */}
          <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-gray-200 rounded-xl"></div>

          {/* Details Skeleton */}
          <div className="flex-1 min-w-0">
            <div className="h-5 md:h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-6 md:h-7 bg-gray-200 rounded w-20 mb-3"></div>
            <div className="h-7 md:h-8 bg-gray-200 rounded w-32"></div>
          </div>
        </div>

        {/* Payment Info Skeleton */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Skeleton */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex gap-3">
            <div className="flex-1 h-10 md:h-11 bg-gray-200 rounded-xl"></div>
            <div className="flex-1 h-10 md:h-11 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
