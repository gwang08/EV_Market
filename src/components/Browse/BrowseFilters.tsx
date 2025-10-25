"use client";
import React from "react";
import colors from "../../Utils/Color";
import { useI18nContext } from "../../providers/I18nProvider";
import { FilterState } from "../../types/product";
import { easeOut, motion } from "framer-motion";

interface BrowseFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  isOpen?: boolean;
  availableBrands?: string[];
  className?: string;
}

function BrowseFilters({
  filters,
  onFilterChange,
  onClearFilters,
  isOpen = true,
  availableBrands = [],
  className = "",
}: BrowseFiltersProps) {
  const { t } = useI18nContext();

  const brands =
    availableBrands.length > 0
      ? availableBrands
      : [
          "Tesla",
          "Nissan",
          "Chevrolet",
          "BMW",
          "Audi",
          "Hyundai",
          "Volkswagen",
          "LG",
          "BYD",
          "Generic",
        ];

  const handleInputChange = (field: keyof FilterState, value: any) => {
    // Format price fields with commas
    if (field === "minPrice" || field === "maxPrice") {
      const numericValue = value.replace(/,/g, "");
      if (numericValue === "" || /^\d*$/.test(numericValue)) {
        const formatted = numericValue ? numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
        onFilterChange({ ...filters, [field]: formatted });
      }
    } else {
      onFilterChange({ ...filters, [field]: value });
    }
  };

  const handleBrandToggle = (brand: string) => {
    const updatedBrands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    handleInputChange("brands", updatedBrands);
  };

  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: easeOut },
    },
  };

  return (
    <motion.aside
      className={`bg-white lg:border-r shadow-none ${className} ${
        isOpen ? "block" : "hidden lg:block"
      } w-full lg:w-80 xl:w-96 2xl:w-[25rem] max-w-full`}
      style={{ borderColor: colors.Border }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="p-6 space-y-5">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-1"
          variants={fadeUp}
        >
          <h3 className="text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent tracking-tight">
            {t("browse.filters")}
          </h3>
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 font-medium"
          >
            {t("browse.clearAll")}
          </button>
        </motion.div>

        {/* Search */}
        <motion.div className="space-y-1" variants={fadeUp}>
          <label className="block text-sm font-medium text-slate-700">
            {t("browse.search")}
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleInputChange("search", e.target.value)}
              placeholder={t("browse.searchPlaceholder")}
              className="w-full pr-10 pl-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-500 placeholder:text-slate-400 bg-slate-50"
              style={{
                borderColor: colors.Border,
                color: colors.Text,
              }}
              maxLength={64}
            />
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200 pointer-events-none"
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
          </div>
        </motion.div>

        {/* Product Type */}
        <motion.div className="space-y-1" variants={fadeUp}>
          <label className="block text-sm font-medium text-slate-700">
            {t("browse.productType")}
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries({
              all: t("browse.allProducts"),
              vehicles: t("browse.vehicles"),
              batteries: t("browse.batteries"),
            }).map(([value, label]) => (
              <label
                key={value}
                className={`flex items-center px-4 py-2 rounded-full cursor-pointer transition-all duration-200 text-sm
                  ${
                    filters.productType === value
                      ? "bg-blue-50 border border-blue-500 font-semibold shadow"
                      : "hover:bg-blue-50 border border-transparent"
                  }
                `}
              >
                <input
                  type="radio"
                  name="productType"
                  value={value}
                  checked={filters.productType === value}
                  onChange={(e) =>
                    handleInputChange("productType", e.target.value)
                  }
                  className="mr-2 accent-blue-600"
                />
                <span className="text-slate-700">{label}</span>
              </label>
            ))}
          </div>
        </motion.div>

        {/* Price Range */}
        <motion.div className="space-y-1" variants={fadeUp}>
          <label className="block text-sm font-medium text-slate-700">
            {t("browse.priceRange")}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1 text-slate-400">Min</label>
              <input
                type="text"
                value={filters.minPrice}
                onChange={(e) => handleInputChange("minPrice", e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50"
                style={{
                  borderColor: colors.Border,
                  color: colors.Text,
                }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1 text-slate-400">Max</label>
              <input
                type="text"
                value={filters.maxPrice}
                onChange={(e) => handleInputChange("maxPrice", e.target.value)}
                placeholder="50,000,000"
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50"
                style={{
                  borderColor: colors.Border,
                  color: colors.Text,
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Brands */}
        <motion.div className="space-y-1" variants={fadeUp}>
          <label className="block text-sm font-medium text-slate-700">
            {t("browse.brands")}
          </label>
          <div className="flex flex-wrap gap-2">
            {brands.map((brand) => (
              <label
                key={brand}
                className={`flex items-center px-4 py-2 rounded-full cursor-pointer transition-all duration-200 text-sm
                  ${
                    filters.brands.includes(brand)
                      ? "bg-blue-50 border border-blue-500 font-semibold shadow"
                      : "hover:bg-blue-50 border border-transparent"
                  }
                `}
                style={{ minWidth: "fit-content" }}
              >
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand)}
                  onChange={() => handleBrandToggle(brand)}
                  className="mr-2 accent-blue-600"
                />
                <span className="text-slate-700">{brand}</span>
              </label>
            ))}
          </div>
        </motion.div>

        {/* Battery Health */}
        {(filters.productType === "all" ||
          filters.productType === "batteries") && (
          <motion.div className="space-y-1" variants={fadeUp}>
            <label className="block text-sm font-medium text-slate-700">
              {t("browse.batteryHealth")}
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                value={filters.batteryHealth}
                onChange={(e) =>
                  handleInputChange("batteryHealth", parseInt(e.target.value))
                }
                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer slider accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>0%</span>
                <span className="font-medium text-slate-700">
                  {filters.batteryHealth}%+
                </span>
                <span>100%</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Seller Verification */}
        <motion.div className="space-y-1" variants={fadeUp}>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.verifiedOnly}
              onChange={(e) =>
                handleInputChange("verifiedOnly", e.target.checked)
              }
              className="mr-2 accent-blue-600"
            />
            <span className="text-sm text-slate-700">
              {t("browse.verifiedOnly")}
            </span>
          </label>
        </motion.div>

        {/* Reset Filters */}
        <motion.div
          className="pt-4 mt-2 border-t"
          style={{ borderColor: colors.Border }}
          variants={fadeUp}
        >
          <button
            onClick={onClearFilters}
            className="w-full py-2 px-4 border rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium text-slate-700"
            style={{
              borderColor: colors.Border,
            }}
          >
            {t("browse.clearAll")}
          </button>
        </motion.div>
      </div>
    </motion.aside>
  );
}

export default BrowseFilters;
