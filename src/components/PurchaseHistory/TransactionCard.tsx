"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useI18nContext } from "../../providers/I18nProvider";
import {
  Transaction,
  getStatusColor,
  getPaymentGatewayName,
} from "../../services/Transaction";
import { formatCurrency } from "../../services/Wallet";
import Image from "next/image";

interface TransactionCardProps {
  transaction: Transaction;
}

export default function TransactionCard({ transaction }: TransactionCardProps) {
  const { t } = useI18nContext();

  const product = transaction.vehicle || transaction.battery;
  const productType = transaction.vehicle ? "vehicle" : "battery";

  const statusLabels: Record<string, string> = {
    COMPLETED: t("purchaseHistory.status.completed", "Completed"),
    PENDING: t("purchaseHistory.status.pending", "Pending"),
    CANCELLED: t("purchaseHistory.status.cancelled", "Cancelled"),
    REFUNDED: t("purchaseHistory.status.refunded", "Refunded"),
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
    >
      <div className="p-6 md:p-8">
        {product && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex gap-6 mb-6"
          >
            {/* Image */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              className="w-28 h-28 md:w-36 md:h-36 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100 cursor-pointer shadow-lg"
            >
              <Image
                src={product.images[0] || "/placeholder.png"}
                alt={product.title}
                width={144}
                height={144}
                className="w-full h-full object-cover"
              />
            </motion.div>
            {/* Details */}
            <div className="flex-1 min-w-0">
              <motion.button
                whileHover={{ scale: 1.03, color: "#2563eb" }}
                className="text-lg md:text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors mb-2 text-left line-clamp-2"
              >
                {product.title}
              </motion.button>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${
                    productType === "vehicle"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {productType === "vehicle"
                    ? t("purchaseHistory.productType.vehicle", "Vehicle")
                    : t("purchaseHistory.productType.battery", "Battery")}
                </span>
              </div>
              {/* Price */}
              <p className="text-2xl md:text-3xl font-extrabold text-green-600">
                {formatCurrency(transaction.finalPrice)}
              </p>
            </div>
          </motion.div>
        )}

        {/* Payment Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="border-t border-gray-200 pt-6 mt-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500">
                  {t("purchaseHistory.paymentMethod", "Payment Method")}
                </p>
                <p className="text-sm md:text-base font-semibold text-gray-900 truncate">
                  {getPaymentGatewayName(transaction.paymentGateway)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-green-600"
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
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500">
                  {t("purchaseHistory.transactionDate", "Transaction Date")}
                </p>
                <p className="text-sm md:text-base font-semibold text-gray-900 truncate">
                  {new Date(transaction.updatedAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="border-t border-gray-200 pt-6 mt-6"
        >
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            {transaction.status === "COMPLETED" && !transaction.review && (
              <motion.button
                whileHover={{
                  scale: 1.04,
                  backgroundColor: "#2563eb",
                  color: "#fff",
                }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 px-5 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all text-base font-semibold"
              >
                {t("purchaseHistory.writeReview", "Write Review")}
              </motion.button>
            )}
            {transaction.status === "COMPLETED" && transaction.review && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-yellow-50 border border-yellow-200 rounded-xl"
              >
                <svg
                  className="w-5 h-5 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-semibold text-yellow-700">
                  {t("purchaseHistory.reviewed", "Reviewed")}
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
