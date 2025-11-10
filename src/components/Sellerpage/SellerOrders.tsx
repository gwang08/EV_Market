"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg">{error}</p>
        <button
          onClick={() => fetchSales(currentPage)}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {t("seller.orders.retry", "Retry")}
        </button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-24 w-24 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 className="mt-4 text-xl font-semibold text-gray-900">
          {t("seller.orders.noOrders", "No Orders Yet")}
        </h3>
        <p className="mt-2 text-gray-600">
          {t(
            "seller.orders.noOrdersDesc",
            "When customers purchase your products, they will appear here."
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {t("seller.orders.title", "My Orders")}
        </h2>
        <p className="text-gray-600 mt-2">
          {t("seller.orders.subtitle", "Manage and ship your orders")}
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {transactions.map((transaction) => {
          const product = transaction.vehicle || transaction.battery;
          const productType = transaction.vehicle ? "vehicle" : "battery";

          if (!product) return null;

          return (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-all"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Product Image */}
                <div className="w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                  <Image
                    src={product.images?.[0] || "/placeholder.png"}
                    alt={product.title}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product & Transaction Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {product.title}
                  </h3>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                        productType === "vehicle"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {productType === "vehicle"
                        ? t("seller.orders.productType.vehicle", "Vehicle")
                        : t("seller.orders.productType.battery", "Battery")}
                    </span>

                    {/* Transaction Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-semibold ${getStatusColor(
                        transaction.status
                      )}`}
                    >
                      {t(
                        `seller.orders.status.${transaction.status.toLowerCase()}`,
                        transaction.status
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">
                        {t("seller.orders.price", "Price")}:
                      </span>
                      <span className="ml-2 font-bold text-green-600">
                        {formatCurrency(transaction.finalPrice)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        {t("seller.orders.buyer", "Buyer")}:
                      </span>
                      <span className="ml-2 font-semibold">
                        {transaction.buyerId || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        {t("seller.orders.transactionDate", "Date")}:
                      </span>
                      <span className="ml-2 font-semibold">
                        {new Date(transaction.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        {t("seller.orders.paymentMethod", "Payment")}:
                      </span>
                      <span className="ml-2 font-semibold">
                        {getPaymentGatewayName(transaction.paymentGateway)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center">
                  {transaction.status === "PAID" && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleShipOrder(transaction.id)}
                      disabled={shippingTransactionId === transaction.id}
                      className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {shippingTransactionId === transaction.id ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>
                            {t("seller.orders.shipping", "Shipping...")}
                          </span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                            />
                          </svg>
                          <span>
                            {t("seller.orders.shipOrder", "Ship Order")}
                          </span>
                        </>
                      )}
                    </motion.button>
                  )}
                  {transaction.status === "SHIPPED" && (
                    <div className="px-6 py-3 bg-green-100 text-green-700 rounded-xl font-semibold flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{t("seller.orders.shipped", "Shipped")}</span>
                    </div>
                  )}
                  {transaction.status === "COMPLETED" && (
                    <div className="px-6 py-3 bg-blue-100 text-blue-700 rounded-xl font-semibold flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
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
                      <span>{t("seller.orders.completed", "Completed")}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("seller.orders.previous", "Previous")}
          </button>

          <div className="flex items-center gap-2">
            <span className="px-4 py-2 text-gray-700">
              {t("seller.orders.page", "Page")} {currentPage} / {totalPages}
            </span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("seller.orders.next", "Next")}
          </button>
        </div>
      )}
    </div>
  );
}
