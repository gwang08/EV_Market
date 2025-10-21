"use client";
import React from "react";
import { useI18nContext } from "../../providers/I18nProvider";
import { motion, easeOut } from "framer-motion";

function SellerTitle() {
  const { t } = useI18nContext();

  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.13,
      },
    },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: easeOut },
    },
  };

  return (
    <motion.div
      className="bg-white border-b border-blue-100"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Title Section */}
        <motion.div className="space-y-2" variants={fadeUp}>
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            {t("seller.dashboard.title")}
          </h1>
          <p className="text-base lg:text-lg text-slate-500">
            {t("seller.dashboard.subtitle")}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default SellerTitle;
