"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18nContext } from "../../providers/I18nProvider";
import {
  Transaction,
  getStatusColor,
  getPaymentGatewayName,
  confirmReceipt,
  disputeTransaction,
} from "../../services/Transaction";
import { formatCurrency } from "../../services/Wallet";
import { useToast } from "../../hooks/useToast";
import Image from "next/image";

interface TransactionCardProps {
  transaction: Transaction;
  onTransactionUpdate?: () => void;
}

export default function TransactionCard({
  transaction,
  onTransactionUpdate,
}: TransactionCardProps) {
  const { t } = useI18nContext();
  const toast = useToast();
  const [isConfirming, setIsConfirming] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeImages, setDisputeImages] = useState<File[]>([]);
  const [isDisputing, setIsDisputing] = useState(false);

  const product = transaction.vehicle || transaction.battery;
  const productType = transaction.vehicle ? "vehicle" : "battery";

  const statusLabels: Record<string, string> = {
    COMPLETED: t("purchaseHistory.status.completed", "Completed"),
    PENDING: t("purchaseHistory.status.pending", "Pending"),
    PAID: t("purchaseHistory.status.paid", "Paid"),
    SHIPPED: t("purchaseHistory.status.shipped", "Shipped"),
    CANCELLED: t("purchaseHistory.status.cancelled", "Cancelled"),
    REFUNDED: t("purchaseHistory.status.refunded", "Refunded"),
    DISPUTED: t("purchaseHistory.status.disputed", "Disputed"),
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

  const handleConfirmReceipt = async () => {
    if (isConfirming) return;

    try {
      setIsConfirming(true);
      await confirmReceipt(transaction.id);

      toast.success(
        t(
          "purchaseHistory.confirmReceiptSuccess",
          "Order confirmed successfully! Transaction completed."
        )
      );

      // Notify parent to refresh data
      if (onTransactionUpdate) {
        onTransactionUpdate();
      }
    } catch (error) {
      console.error("Failed to confirm receipt:", error);
      toast.error(
        t(
          "purchaseHistory.confirmReceiptError",
          "Failed to confirm receipt. Please try again."
        )
      );
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDisputeSubmit = async () => {
    if (!disputeReason.trim()) {
      toast.error(
        t(
          "purchaseHistory.disputeReasonRequired",
          "Please provide a reason for the dispute"
        )
      );
      return;
    }

    if (disputeImages.length === 0) {
      toast.error(
        t(
          "purchaseHistory.disputeImagesRequired",
          "Please upload at least one image"
        )
      );
      return;
    }

    try {
      setIsDisputing(true);
      await disputeTransaction(transaction.id, disputeReason, disputeImages);

      toast.success(
        t(
          "purchaseHistory.disputeSuccess",
          "Transaction has been disputed. Admin will review it."
        )
      );

      setShowDisputeModal(false);
      setDisputeReason("");
      setDisputeImages([]);

      // Notify parent to refresh data
      if (onTransactionUpdate) {
        onTransactionUpdate();
      }
    } catch (error) {
      console.error("Failed to dispute transaction:", error);
      toast.error(
        t(
          "purchaseHistory.disputeError",
          "Failed to submit dispute. Please try again."
        )
      );
    } finally {
      setIsDisputing(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + disputeImages.length > 5) {
      toast.warning(
        t("purchaseHistory.maxImagesWarning", "You can upload maximum 5 images")
      );
      return;
    }
    setDisputeImages([...disputeImages, ...files]);
  };

  const removeImage = (index: number) => {
    setDisputeImages(disputeImages.filter((_, i) => i !== index));
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
              <div className="flex items-center gap-2 mb-3 flex-wrap">
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
                <span
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${getStatusColor(
                    transaction.status
                  )}`}
                >
                  {statusLabels[transaction.status] || transaction.status}
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
            {/* Confirm Receipt Button - Only show when SHIPPED */}
            {transaction.status === "SHIPPED" && (
              <>
                <motion.button
                  whileHover={{
                    scale: 1.04,
                    backgroundColor: "#10b981",
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleConfirmReceipt}
                  disabled={isConfirming}
                  className="flex-1 px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConfirming ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>
                        {t("purchaseHistory.confirming", "Confirming...")}
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>
                        {t("purchaseHistory.confirmReceipt", "Confirm Receipt")}
                      </span>
                    </>
                  )}
                </motion.button>

                {/* Dispute Button */}
                <motion.button
                  whileHover={{
                    scale: 1.04,
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowDisputeModal(true)}
                  className="flex-1 px-5 py-3 bg-white border-2 border-red-600 text-red-600 rounded-xl hover:bg-red-50 transition-all text-base font-semibold flex items-center justify-center gap-2"
                >
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>{t("purchaseHistory.disputeOrder", "Dispute")}</span>
                </motion.button>
              </>
            )}

            {/* Write Review Button - Only show when COMPLETED and no review */}
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

            {/* Reviewed Badge - Only show when COMPLETED and has review */}
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

      {/* Dispute Modal */}
      <AnimatePresence>
        {showDisputeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDisputeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {t("purchaseHistory.disputeTitle", "Dispute Transaction")}
                </h3>
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Reason */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("purchaseHistory.disputeReason", "Reason for Dispute")}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder={t(
                      "purchaseHistory.disputeReasonPlaceholder",
                      "Please describe the issue with the product..."
                    )}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Images Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("purchaseHistory.disputeImages", "Evidence Images")}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    id="dispute-images"
                  />
                  <label
                    htmlFor="dispute-images"
                    className="block w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-500 transition-colors cursor-pointer text-center"
                  >
                    <svg
                      className="w-12 h-12 mx-auto text-gray-400 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-gray-600">
                      {t(
                        "purchaseHistory.uploadImages",
                        "Click to upload images (Max 5)"
                      )}
                    </span>
                  </label>

                  {/* Preview Images */}
                  {disputeImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {disputeImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Evidence ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowDisputeModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                  >
                    {t("purchaseHistory.cancel", "Cancel")}
                  </button>
                  <button
                    onClick={handleDisputeSubmit}
                    disabled={isDisputing}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDisputing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>
                          {t("purchaseHistory.submitting", "Submitting...")}
                        </span>
                      </>
                    ) : (
                      <span>
                        {t("purchaseHistory.submitDispute", "Submit Dispute")}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
