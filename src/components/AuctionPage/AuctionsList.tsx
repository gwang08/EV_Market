"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Sparkles,
  Plus,
} from "lucide-react";
import { getLiveAuctions, isAuthenticated } from "@/services";
import { LiveAuction } from "@/types/auction";
import AuctionCard from "./AuctionCard";
import CreateAuctionModal from "./CreateAuctionModal";
import { useI18nContext } from "@/providers/I18nProvider";
import { GridSkeleton } from "@/components/common/Skeleton";
import colors from "@/Utils/Color";
import { useRouter } from "next/navigation";

export default function AuctionsList() {
  const { t } = useI18nContext();
  const router = useRouter();
  const [auctions, setAuctions] = useState<LiveAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "VEHICLE" | "BATTERY">(
    "ALL"
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadAuctions();
  }, [page]);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔍 Fetching auctions - Page:", page);
      const response = await getLiveAuctions(page, 12);
      console.log("✅ Auctions response:", response);
      console.log("📊 Total results:", response.data.results.length);
      setAuctions(response.data.results);
      setTotalPages(response.data.totalPages);
      setTotalResults(response.data.totalResults);
    } catch (err) {
      console.error("❌ Error loading auctions:", err);
      setError(err instanceof Error ? err.message : "Failed to load auctions");
    } finally {
      setLoading(false);
    }
  };

  const filteredAuctions = auctions.filter((auction) => {
    const matchesSearch =
      searchQuery === "" ||
      auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      auction.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      filterType === "ALL" || auction.listingType === filterType;

    return matchesSearch && matchesType;
  });

  const handleCreateAuction = () => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleAuctionCreated = () => {
    loadAuctions();
  };

  if (loading && auctions.length === 0) {
    return (
      <div
        className="min-h-screen mt-20"
        style={{ backgroundColor: colors.Background }}
      >
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="text-center space-y-6">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium mb-4 border"
                style={{ borderColor: colors.Border }}
              >
                <Sparkles className="w-4 h-4" style={{ color: colors.Price }} />
                <span style={{ color: colors.SubText }}>
                  {t("auctions.liveNow", "Live Now")}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 drop-shadow-sm">
                {t("auctions.title", "Live Auctions")}
              </h1>

              <div className="flex items-center justify-center gap-3">
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-blue-500 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
                <div className="w-16 h-0.5 bg-gradient-to-l from-transparent via-blue-500 to-blue-500 rounded-full"></div>
              </div>

              <p
                className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
                style={{ color: colors.Description }}
              >
                {t("common.loading", "Loading auctions...")}
              </p>
            </div>
          </div>
        </div>

        {/* Skeleton Loading */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <GridSkeleton count={6} columns={3} showBadge={true} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: colors.Background }}
      >
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold" style={{ color: colors.Text }}>
            {t("browse.loadError", "Failed to Load Auctions")}
          </h3>
          <p style={{ color: colors.Description }}>{error}</p>
          <button
            onClick={loadAuctions}
            className="px-6 py-3 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg"
            style={{ backgroundColor: colors.Price }}
          >
            {t("wallet.tryAgain", "Try Again")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-20"
      style={{ backgroundColor: colors.Background }}
    >
      {/* Hero Section - Giống homepage với gradient */}
      <div className="relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-16 md:py-20">
          <div className="text-center space-y-6">
            {/* Badge giống homepage */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium mb-4 border"
              style={{ borderColor: colors.Border }}
            >
              <Sparkles className="w-4 h-4" style={{ color: colors.Price }} />
              <span style={{ color: colors.SubText }}>
                {t("auctions.liveNow", "Live Now")}
              </span>
            </div>

            {/* Title với gradient giống homepage */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 drop-shadow-sm">
              {t("auctions.title", "Live Auctions")}
            </h1>

            {/* Elegant separator giống homepage */}
            <div className="flex items-center justify-center gap-3">
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
              <div className="w-16 h-0.5 bg-gradient-to-l from-transparent via-blue-500 to-blue-500 rounded-full"></div>
            </div>

            <p
              className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
              style={{ color: colors.Description }}
            >
              {t(
                "auctions.subtitle",
                "Bid on premium electric vehicles and batteries in real-time"
              )}
            </p>

            <div className="flex items-center justify-center gap-4 text-sm">
              <div
                className="flex items-center gap-2"
                style={{ color: colors.SubText }}
              >
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: colors.PriceText }}
                ></div>
                <span>
                  {totalResults}{" "}
                  {t("auctions.activeAuctions", "Active Auctions")}
                </span>
              </div>
            </div>

            {/* Create Auction Button */}
            <div className="mt-6">
              <button
                onClick={handleCreateAuction}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                {t("auctions.createNew", "Create New Auction")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search - Compact version */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-6">
        <motion.div
          className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          {/* Search - Shorter */}
          <motion.div className="flex-1 relative" whileFocus={{ scale: 1.03 }}>
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: colors.Description }}
            />
            <input
              type="text"
              placeholder={t("browse.searchPlaceholder", "Search auctions...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-lg"
              style={{
                backgroundColor: colors.Background,
                border: `1px solid ${colors.Border}`,
                color: colors.Text,
              }}
            />
          </motion.div>

          {/* Type Filter - Compact */}
          <div className="flex gap-2 flex-shrink-0">
            {["ALL", "VEHICLE", "BATTERY"].map((type) => (
              <motion.button
                key={type}
                onClick={() => setFilterType(type as any)}
                whileHover={{
                  scale: 1.08,
                  backgroundColor: colors.Price,
                  color: "#fff",
                }}
                whileTap={{ scale: 0.97 }}
                className={`px-5 py-3 rounded-xl font-medium transition-all duration-300 shadow-sm ${
                  filterType === type ? "shadow-md" : "hover:shadow-md"
                }`}
                style={
                  filterType === type
                    ? { backgroundColor: colors.Price, color: "white" }
                    : {
                        backgroundColor: colors.Background,
                        border: `1px solid ${colors.Border}`,
                        color: colors.SubText,
                      }
                }
              >
                {type === "ALL" && t("browse.allProducts", "All")}
                {type === "VEHICLE" && t("browse.vehicles", "Vehicles")}
                {type === "BATTERY" && t("browse.batteries", "Batteries")}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 md:py-12">
        {/* Results Count */}
        <div className="mb-6">
          <p style={{ color: colors.Description }}>
            {t("browse.results", "Showing")}{" "}
            <span className="font-semibold" style={{ color: colors.Text }}>
              {filteredAuctions.length}
            </span>{" "}
            {t("auctions.auctions", "auctions")}
          </p>
        </div>

        {/* Auctions Grid */}
        {filteredAuctions.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: colors.Background }}
            >
              <Filter
                className="w-8 h-8"
                style={{ color: colors.Description }}
              />
            </div>
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: colors.Text }}
            >
              {t("browse.noResults", "No auctions found")}
            </h3>
            <p style={{ color: colors.Description }}>
              {t(
                "browse.noResultsDesc",
                "Try adjusting your filters or search terms"
              )}
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
          >
            <AnimatePresence>
              {filteredAuctions.map((auction) => (
                <motion.div
                  key={auction.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  <AuctionCard auction={auction} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white rounded-lg hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              style={{
                border: `1px solid ${colors.Border}`,
                color: colors.SubText,
              }}
            >
              {t("browse.previous", "Previous")}
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all duration-300 ${
                      page === pageNum
                        ? "bg-blue-700 text-white shadow-lg"
                        : "bg-white hover:bg-blue-50"
                    }`}
                    style={
                      page !== pageNum
                        ? {
                            border: `1px solid ${colors.Border}`,
                            color: colors.SubText,
                          }
                        : {}
                    }
                  >
                    {pageNum}
                  </button>
                )
              )}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white rounded-lg hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              style={{
                border: `1px solid ${colors.Border}`,
                color: colors.SubText,
              }}
            >
              {t("browse.next", "Next")}
            </button>
          </div>
        )}
      </div>

      {/* Create Auction Modal */}
      <CreateAuctionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleAuctionCreated}
      />
    </div>
  );
}
