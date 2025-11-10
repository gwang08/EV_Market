"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18nContext } from "../../providers/I18nProvider";
import { getMyTransactions, Transaction } from "../../services/Transaction";
import TransactionCard from "./TransactionCard";
import TransactionSkeleton from "./TransactionSkeleton";
import EmptyState from "./EmptyState";

export default function PurchaseHistory() {
  const { t } = useI18nContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const fetchTransactions = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getMyTransactions(page, 10);
      setTransactions(response.data.transactions);
      setTotalPages(response.data.totalPages);
      setTotalResults(response.data.totalResults);
      setCurrentPage(response.data.page);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setError(
        t("purchaseHistory.loadError", "Failed to load purchase history")
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(currentPage);
  }, []);

  const handlePageChange = (page: number) => {
    fetchTransactions(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 md:py-8 md:pt-30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-6 md:mb-8">
            <div className="h-8 md:h-10 bg-gray-200 rounded-lg w-64 mb-2 animate-pulse"></div>
            <div className="h-4 md:h-5 bg-gray-200 rounded-lg w-96 max-w-full animate-pulse"></div>
          </div>
          {/* Cards Skeleton */}
          <div className="space-y-4 md:space-y-6">
            {[1, 2, 3].map((i) => (
              <TransactionSkeleton key={i} />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 md:py-8 md:pt-30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 md:w-12 md:h-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              {t("purchaseHistory.errorTitle", "Error")}
            </h3>
            <p className="text-base md:text-lg text-gray-600 mb-6">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => fetchTransactions(currentPage)}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg text-base md:text-lg font-semibold"
            >
              {t("purchaseHistory.tryAgain", "Try Again")}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 md:py-8 md:pt-30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="mb-10 text-center"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-900 to-indigo-900 drop-shadow-lg mb-3">
            {t("purchaseHistory.title", "Purchase History")}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 font-medium">
            {t(
              "purchaseHistory.subtitle",
              "View and manage your purchase history"
            )}
          </p>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-10 flex items-center justify-between flex-wrap gap-6"
        >
          <div>
            <p className="text-sm text-gray-500 mb-1">
              {t("purchaseHistory.totalPurchases", "Total Purchases")}
            </p>
            <p className="text-3xl md:text-4xl font-extrabold text-blue-700">
              {totalResults}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-blue-50 px-5 py-3 rounded-xl">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-base font-semibold text-blue-700">
              {transactions.filter((t) => t.status === "COMPLETED").length}{" "}
              {t("purchaseHistory.completed", "Completed")}
            </span>
          </div>
        </motion.div>

        {/* Transactions List */}
        <AnimatePresence mode="wait">
          {transactions.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5 }}
            >
              <EmptyState />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-6">
                {transactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onTransactionUpdate={() => fetchTransactions(currentPage)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-10 flex items-center justify-center gap-2"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-3 bg-white border border-gray-300 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {t("purchaseHistory.previous", "Previous")}
                  </motion.button>
                  <div className="flex items-center gap-2">
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <motion.button
                            key={page}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                              currentPage === page
                                ? "bg-blue-600 text-white shadow-lg"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </motion.button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="text-gray-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-3 bg-white border border-gray-300 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {t("purchaseHistory.next", "Next")}
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
