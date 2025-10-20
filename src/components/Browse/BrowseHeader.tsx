"use client";
import React from "react";
import { useI18nContext } from "../../providers/I18nProvider";
import { easeOut, motion } from "framer-motion";

interface BrowseHeaderProps {
  onToggleFilter: () => void;
  isFilterOpen: boolean;
}

function BrowseHeader({ onToggleFilter, isFilterOpen }: BrowseHeaderProps) {
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
        <div className="flex items-center justify-between">
          <motion.div className="space-y-2" variants={fadeUp}>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              {t("browse.title")}
            </h1>
            <p className="text-base lg:text-lg text-slate-500">
              {t("browse.subtitle")}
            </p>
          </motion.div>

          {/* Mobile Filter Toggle */}
          <motion.button
            onClick={onToggleFilter}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 shadow-sm"
            variants={fadeUp}
            whileTap={{ scale: 0.96 }}
            aria-pressed={isFilterOpen}
          >
            <svg
              className="w-5 h-5 text-blue-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="text-sm font-medium text-blue-700">
              {t("browse.filters")}
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default BrowseHeader;
