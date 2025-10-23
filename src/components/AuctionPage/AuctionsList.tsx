"use client";
import React, { useState, useEffect } from "react";
import { Search, Filter, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { getLiveAuctions } from "@/services";
import { LiveAuction } from "@/types/auction";
import AuctionCard from "./AuctionCard";
import { useI18nContext } from "@/providers/I18nProvider";
import { GridSkeleton } from "@/components/common/Skeleton";
import colors from "@/Utils/Color";

export default function AuctionsList() {
  const { t } = useI18nContext();
  const [auctions, setAuctions] = useState<LiveAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "VEHICLE" | "BATTERY">("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    loadAuctions();
  }, [page]);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLiveAuctions(page, 12);
      setAuctions(response.data.results);
      setTotalPages(response.data.totalPages);
      setTotalResults(response.data.totalResults);
    } catch (err) {
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

  if (loading && auctions.length === 0) {
    return (
      <div className="min-h-screen mt-20" style={{ backgroundColor: colors.Background }}>
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium mb-4 border" style={{ borderColor: colors.Border }}>
                <Sparkles className="w-4 h-4" style={{ color: colors.Price }} />
                <span style={{ color: colors.SubText }}>{t("auctions.liveNow", "Live Now")}</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 drop-shadow-sm">
                {t("auctions.title", "Live Auctions")}
              </h1>
              
              <div className="flex items-center justify-center gap-3">
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-blue-500 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
                <div className="w-16 h-0.5 bg-gradient-to-l from-transparent via-blue-500 to-blue-500 rounded-full"></div>
              </div>
              
              <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: colors.Description }}>
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
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: colors.Background }}>
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
    <div className="min-h-screen mt-20" style={{ backgroundColor: colors.Background }}>
      {/* Hero Section - Giống homepage với gradient */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center space-y-6">
            {/* Badge giống homepage */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium mb-4 border" style={{ borderColor: colors.Border }}>
              <Sparkles className="w-4 h-4" style={{ color: colors.Price }} />
              <span style={{ color: colors.SubText }}>{t("auctions.liveNow", "Live Now")}</span>
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
            
            <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: colors.Description }}>
              {t(
                "auctions.subtitle",
                "Bid on premium electric vehicles and batteries in real-time"
              )}
            </p>
            
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2" style={{ color: colors.SubText }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.PriceText }}></div>
                <span>{totalResults} {t("auctions.activeAuctions", "Active Auctions")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm" style={{ borderBottom: `1px solid ${colors.Border}` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: colors.Description }} />
              <input
                type="text"
                placeholder={t("browse.searchPlaceholder", "Search auctions...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                style={{ border: `1px solid ${colors.Border}`, color: colors.Text }}
              />
            </div>

            {/* Type Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType("ALL")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  filterType === "ALL"
                    ? "bg-blue-700 text-white shadow-lg"
                    : "bg-white hover:bg-blue-50"
                }`}
                style={filterType !== "ALL" 
                  ? { border: `1px solid ${colors.Border}`, color: colors.SubText }
                  : {}
                }
              >
                {t("browse.allProducts", "All")}
              </button>
              <button
                onClick={() => setFilterType("VEHICLE")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  filterType === "VEHICLE"
                    ? "bg-blue-700 text-white shadow-lg"
                    : "bg-white hover:bg-blue-50"
                }`}
                style={filterType !== "VEHICLE" 
                  ? { border: `1px solid ${colors.Border}`, color: colors.SubText }
                  : {}
                }
              >
                {t("browse.vehicles", "Vehicles")}
              </button>
              <button
                onClick={() => setFilterType("BATTERY")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  filterType === "BATTERY"
                    ? "bg-blue-700 text-white shadow-lg"
                    : "bg-white hover:bg-blue-50"
                }`}
                style={filterType !== "BATTERY" 
                  ? { border: `1px solid ${colors.Border}`, color: colors.SubText }
                  : {}
                }
              >
                {t("browse.batteries", "Batteries")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Results Count */}
        <div className="mb-6">
          <p style={{ color: colors.Description }}>
            {t("browse.results", "Showing")} <span className="font-semibold" style={{ color: colors.Text }}>{filteredAuctions.length}</span> {t("auctions.auctions", "auctions")}
          </p>
        </div>

        {/* Auctions Grid */}
        {filteredAuctions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: colors.Background }}>
              <Filter className="w-8 h-8" style={{ color: colors.Description }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: colors.Text }}>
              {t("browse.noResults", "No auctions found")}
            </h3>
            <p style={{ color: colors.Description }}>
              {t("browse.noResultsDesc", "Try adjusting your filters or search terms")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white rounded-lg hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              style={{ border: `1px solid ${colors.Border}`, color: colors.SubText }}
            >
              {t("browse.previous", "Previous")}
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all duration-300 ${
                    page === pageNum ? "bg-blue-700 text-white shadow-lg" : "bg-white hover:bg-blue-50"
                  }`}
                  style={page !== pageNum 
                    ? { border: `1px solid ${colors.Border}`, color: colors.SubText }
                    : {}
                  }
                >
                  {pageNum}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white rounded-lg hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              style={{ border: `1px solid ${colors.Border}`, color: colors.SubText }}
            >
              {t("browse.next", "Next")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
