"use client";
import React from "react";
import { motion } from "framer-motion";
import { useI18nContext } from "../../providers/I18nProvider";
import { useRouter } from "next/navigation";

export default function EmptyState() {
  const { t } = useI18nContext();
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl shadow-xl p-10 md:p-16 text-center"
    >
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 md:w-12 md:h-12 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>

        {/* Text */}
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
          {t("purchaseHistory.noPurchases", "No Purchases Yet")}
        </h3>
        <p className="text-sm md:text-base text-gray-600 mb-8">
          {t(
            "purchaseHistory.noPurchasesDesc",
            "You haven't made any purchases yet. Start exploring our electric vehicles and batteries!"
          )}
        </p>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "#2563eb" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/browse")}
          className="inline-flex items-center gap-2 px-7 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg font-semibold text-lg"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {t("purchaseHistory.browseCatalog", "Browse Catalog")}
        </motion.button>
      </div>
    </motion.div>
  );
}
