"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import colors from "../../Utils/Color";
import Image from "next/image";
import { useI18nContext } from "../../providers/I18nProvider";
import { Product } from "../../types/product";
import { ListSkeleton } from "../common/Skeleton";
import { motion, AnimatePresence, easeOut } from "framer-motion";

interface ProductGridProps {
  products?: Product[];
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

function ProductGrid({
  products = [],
  isLoading = false,
  error = null,
  className = "",
}: ProductGridProps) {
  const { t } = useI18nContext();
  const router = useRouter();
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    setCurrentPage(1);
  }, [products, sortBy]);

  const handleProductClick = (product: Product) => {
    if (product.type === "vehicle") {
      router.push(`/vehicle/${product.id}`);
    } else {
      router.push(`/pin/${product.id}`);
    }
  };

  // Always use products from props if available, never fallback to mock when filtering
  const displayProducts = products || [];

  // Filter only verified products
  const verifiedProducts = displayProducts.filter(
    (product) => product.verified === true
  );

  // Use mock data only if no products prop is passed at all (for demo purposes)
  const shouldUseMockData = products === undefined && !isLoading && !error;
  const mockProducts: Product[] = []; // ...your mock data here...
  const finalProducts = shouldUseMockData ? mockProducts : verifiedProducts;

  // Sort products based on sortBy
  const sortedProducts = [...finalProducts].sort((a, b) => {
    switch (sortBy) {
      case "priceLow":
        return (
          (parseFloat(a.price.replace(/[,VNĐ\s]/g, "")) || 0) -
          (parseFloat(b.price.replace(/[,VNĐ\s]/g, "")) || 0)
        );
      case "priceHigh":
        return (
          (parseFloat(b.price.replace(/[,VNĐ\s]/g, "")) || 0) -
          (parseFloat(a.price.replace(/[,VNĐ\s]/g, "")) || 0)
        );
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "newest":
      default:
        const yearA =
          typeof a.year === "string" ? parseInt(a.year) || 0 : a.year || 0;
        const yearB =
          typeof b.year === "string" ? parseInt(b.year) || 0 : b.year || 0;
        if (yearA !== yearB) {
          return yearB - yearA;
        }
        return a.name.localeCompare(b.name);
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = sortedProducts.slice(startIndex, endIndex);

  const sortOptions = [
    { value: "newest", label: t("browse.sortOptions.newest") },
    { value: "priceLow", label: t("browse.sortOptions.priceLow") },
    { value: "priceHigh", label: t("browse.sortOptions.priceHigh") },
    { value: "rating", label: t("browse.sortOptions.rating") },
  ];

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 32, scale: 0.97 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: easeOut,
        delay: i * 0.07,
      },
    }),
    hover: {
      scale: 1.03,
      boxShadow: "0 8px 32px 0 rgba(59,130,246,0.10)",
      transition: { type: "spring" as const, stiffness: 350, damping: 22 },
    },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="h-5 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>
        <ListSkeleton count={9} showBadge={true} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              style={{ color: colors.SubText }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3
            className="text-lg font-medium mb-2"
            style={{ color: colors.Text }}
          >
            Error Loading Products
          </h3>
          <p className="text-sm" style={{ color: colors.SubText }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white ${className}`}>
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <p className="text-sm text-slate-500">
            {t("browse.showing")}{" "}
            <span className="font-medium text-slate-900">
              {sortedProducts.length > 0 ? startIndex + 1 : 0}-
              {Math.min(endIndex, sortedProducts.length)}
            </span>{" "}
            {t("browse.of")}{" "}
            <span className="font-medium text-slate-900">
              {sortedProducts.length}
            </span>{" "}
            {t("browse.results")}
          </p>
        </div>
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">
            {t("browse.sortBy")}:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 text-slate-700"
            style={{
              borderColor: colors.Border,
            }}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {currentProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-sm mx-auto">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                style={{ color: colors.SubText }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: colors.Text }}
            >
              {shouldUseMockData
                ? t("browse.noResults")
                : "Không tìm thấy sản phẩm nào"}
            </h3>
            <p className="text-sm" style={{ color: colors.SubText }}>
              {shouldUseMockData
                ? t("browse.noResultsDesc")
                : "Thử điều chỉnh bộ lọc để tìm thấy kết quả phù hợp"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          <AnimatePresence>
            {currentProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer border border-slate-100 hover:border-blue-300 flex flex-col"
                initial="hidden"
                animate="visible"
                exit="hidden"
                custom={idx}
                variants={cardVariants}
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
              >
                {/* Image Container */}
                <div className="relative h-48 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={200}
                      height={120}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-20">
                    {product.verified && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="flex items-center"
                      >
                        <Image
                          src="/Homepage/Verified.svg"
                          alt="Verified"
                          width={81}
                          height={20}
                          className="h-5 w-auto"
                        />
                      </motion.div>
                    )}
                    {product.fastSale && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                        className="flex items-center"
                      >
                        <Image
                          src="/Homepage/Sale.svg"
                          alt="Fast Sale"
                          width={89}
                          height={20}
                          className="h-5 w-auto"
                        />
                      </motion.div>
                    )}
                    {product.popular && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="flex items-center"
                      >
                        <Image
                          src="/Homepage/Popular.svg"
                          alt="Popular"
                          width={89}
                          height={20}
                          className="h-5 w-auto"
                        />
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  {/* Name and Price */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-slate-900 truncate max-w-[70%]">
                      {product.name}
                    </h3>
                    <span className="text-lg font-bold text-indigo-700">
                      {product.price}
                    </span>
                  </div>

                  {/* Year and Mileage/Capacity */}
                  <p className="text-sm mb-3 text-slate-500">
                    {product.year} {product.mileage && `• ${product.mileage}`}
                    {product.capacity && `• ${product.capacity}`}
                  </p>

                  {/* Bottom Row */}
                  <div className="flex justify-between items-center">
                    {/* Battery Health or Sell Percentage with Pin */}
                    <div className="flex items-center gap-1">
                      <Image
                        src="/Homepage/Pin.svg"
                        alt="Pin"
                        width={16}
                        height={16}
                        className="w-4 h-4"
                      />
                      <span className="text-xs text-slate-400">
                        {product.sellPercentage ||
                          (product.batteryHealth
                            ? `${product.batteryHealth}% SoH`
                            : "")}
                      </span>
                    </div>
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <Image
                        src="/Homepage/Star.svg"
                        alt="Star"
                        width={16}
                        height={16}
                        className="w-4 h-4"
                      />
                      <span className="text-xs font-medium text-yellow-500">
                        {product.rating}
                      </span>
                    </div>
                    {/* Brand */}
                    <span className="inline-block px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-700 font-semibold shadow-sm ml-2">
                      {product.brand || ""}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          {/* Previous Button */}
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors duration-200 text-slate-700"
            style={{
              borderColor: colors.Border,
            }}
          >
            {t("browse.previous")}
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded-lg border transition-colors duration-200 ${
                currentPage === page
                  ? "bg-blue-600 text-white border-blue-600"
                  : "hover:bg-blue-50 text-slate-700"
              }`}
              style={{
                borderColor: currentPage === page ? "#2563eb" : colors.Border,
              }}
            >
              {page}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors duration-200 text-slate-700"
            style={{
              borderColor: colors.Border,
            }}
          >
            {t("browse.next")}
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductGrid;
