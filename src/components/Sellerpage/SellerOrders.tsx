"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18nContext } from "../../providers/I18nProvider";
import {
  getMySales,
  Transaction,
  shipTransaction,
  getStatusColor,
  getPaymentGatewayName,
} from "../../services/Transaction";
import { formatCurrency } from "../../services/Wallet";
import { useToast } from "../../hooks/useToast";
import Image from "next/image";
import {
  Package,
  TrendingUp,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Calendar,
  DollarSign,
  User,
  CreditCard,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";

export default function SellerOrders() {
  const { t } = useI18nContext();
  const toast = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [shippingTransactionId, setShippingTransactionId] = useState<
    string | null
  >(null);

  // Load seller's sales transactions
  const fetchSales = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getMySales(page, 10);

      console.log("Sales transactions:", response.data.transactions);

      setTransactions(response.data.transactions);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch sales:", err);
      setError(t("seller.orders.loadError", "Failed to load orders"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleShipOrder = async (transactionId: string) => {
    if (shippingTransactionId === transactionId) {
      return; // Prevent double click
    }

    try {
      setShippingTransactionId(transactionId);

      await shipTransaction(transactionId);

      toast.success(
        t(
          "seller.orders.shipSuccess",
          "Order has been marked as shipped successfully!"
        )
      );

      // Refresh transactions after shipping
      await fetchSales(currentPage);
    } catch (error) {
      console.error("Failed to ship order:", error);
      toast.error(
        t(
          "seller.orders.shipError",
          "Failed to mark order as shipped. Please try again."
        )
      );
    } finally {
      setShippingTransactionId(null);
    }
  };

  // Pagination
  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto px-6 py-8 bg-white min-h-screen"
      >
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 bg-gray-200 rounded-xl w-64 mb-3 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded-lg w-96 max-w-full animate-pulse"></div>
        </div>
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
        {/* Cards Skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse"
            >
              <div className="flex gap-6">
                <div className="w-32 h-32 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto px-6 py-8 bg-white min-h-screen"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-red-50 border border-red-200 rounded-3xl shadow-lg p-12 text-center"
        >
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {t("seller.orders.errorTitle", "Error")}
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchSales(currentPage)}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg flex items-center gap-2 mx-auto"
          >
            <RefreshCcw className="w-5 h-5" />
            {t("seller.orders.tryAgain", "Try Again")}
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  if (transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto px-6 py-8 bg-white min-h-screen"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-50 border border-gray-200 rounded-3xl shadow-lg p-12 text-center"
        >
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {t("seller.orders.noOrders", "No Orders Yet")}
          </h3>
          <p className="text-gray-600 text-lg">
            {t(
              "seller.orders.noOrdersDesc",
              "When customers purchase your products, they will appear here."
            )}
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-6 py-8 bg-white min-h-screen"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
          {t("seller.orders.title", "My Orders")}
        </h2>
        <p className="text-gray-600 mt-2">
          {t("seller.orders.subtitle", "Manage and ship your orders")}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {/* Total Orders */}
        <div className="bg-blue-50 rounded-2xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">
                {t("seller.orders.totalOrders", "Total Orders")}
              </p>
              <p className="text-3xl font-bold text-blue-900">
                {totalPages * 10}
              </p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Pending Shipment */}
        <div className="bg-orange-50 rounded-2xl shadow-sm border border-orange-200 p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">
                {t("seller.orders.pendingShipment", "Pending Shipment")}
              </p>
              <p className="text-3xl font-bold text-orange-900">
                {transactions.filter((t) => t.status === "PAID").length}
              </p>
            </div>
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
              <Package className="w-7 h-7 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-green-50 rounded-2xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">
                {t("seller.orders.completedOrders", "Completed")}
              </p>
              <p className="text-3xl font-bold text-green-900">
                {transactions.filter((t) => t.status === "COMPLETED").length}
              </p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Orders List */}
      <div className="space-y-6">
        <AnimatePresence>
          {transactions.map((transaction, index) => {
            const product = transaction.vehicle || transaction.battery;
            const productType = transaction.vehicle ? "vehicle" : "battery";

            if (!product) return null;

            return (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-3xl shadow-2xl hover:shadow-[0_8px_32px_0_rgba(59,130,246,0.10)] transition-all border border-blue-100 hover:border-blue-400 overflow-hidden"
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Product Image */}
                    <div className="relative w-full lg:w-48 h-48 flex-shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 group">
                      <Image
                        src={product.images?.[0] || "/placeholder.png"}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg ${
                            productType === "vehicle"
                              ? "bg-blue-600 text-white"
                              : "bg-green-600 text-white"
                          }`}
                        >
                          {productType === "vehicle"
                            ? t("seller.orders.productType.vehicle", "Vehicle")
                            : t("seller.orders.productType.battery", "Battery")}
                        </span>
                      </div>
                    </div>

                    {/* Product & Transaction Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0 pr-4">
                          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
                            {product.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Status Badge */}
                            <span
                              className={`px-4 py-1.5 rounded-xl text-sm font-bold shadow-sm ${getStatusColor(
                                transaction.status
                              )}`}
                            >
                              {t(
                                `seller.orders.status.${transaction.status.toLowerCase()}`,
                                transaction.status
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Price Badge */}
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm text-gray-600 mb-1">
                            {t("seller.orders.price", "Price")}
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(transaction.finalPrice)}
                          </p>
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-600 font-medium">
                              {t("seller.orders.buyer", "Buyer")}
                            </p>
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {transaction.buyerId || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-600 font-medium">
                              {t("seller.orders.transactionDate", "Date")}
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                              {new Date(
                                transaction.createdAt
                              ).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <CreditCard className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-600 font-medium">
                              {t("seller.orders.paymentMethod", "Payment")}
                            </p>
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {getPaymentGatewayName(
                                transaction.paymentGateway
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <DollarSign className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-600 font-medium">
                              {t("seller.orders.orderId", "Order ID")}
                            </p>
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {transaction.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-3">
                        {transaction.status === "PAID" && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleShipOrder(transaction.id)}
                            disabled={shippingTransactionId === transaction.id}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {shippingTransactionId === transaction.id ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                <span>
                                  {t("seller.orders.shipping", "Shipping...")}
                                </span>
                              </>
                            ) : (
                              <>
                                <Truck className="w-5 h-5" />
                                <span>
                                  {t("seller.orders.shipOrder", "Ship Order")}
                                </span>
                              </>
                            )}
                          </motion.button>
                        )}
                        {transaction.status === "SHIPPED" && (
                          <div className="px-6 py-3 bg-green-100 text-green-700 rounded-xl font-bold flex items-center gap-2 border-2 border-green-200">
                            <Truck className="w-5 h-5" />
                            <span>{t("seller.orders.shipped", "Shipped")}</span>
                          </div>
                        )}
                        {transaction.status === "COMPLETED" && (
                          <div className="px-6 py-3 bg-blue-100 text-blue-700 rounded-xl font-bold flex items-center gap-2 border-2 border-blue-200">
                            <CheckCircle2 className="w-5 h-5" />
                            <span>
                              {t("seller.orders.completed", "Completed")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center items-center gap-3 mt-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {t("seller.orders.previous", "Previous")}
          </motion.button>

          <div className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md">
            <span>
              {t("seller.orders.page", "Page")} {currentPage} / {totalPages}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {t("seller.orders.next", "Next")}
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
