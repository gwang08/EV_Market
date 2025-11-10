"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18nContext } from "../../providers/I18nProvider";
import { useToast } from "../../hooks/useToast";
import { getDisputedTransactions, resolveDispute } from "../../services/Admin";
import { formatCurrency } from "../../services/Wallet";
import Image from "next/image";

interface DisputedTransaction {
  id: string;
  buyerId: string;
  status: string;
  disputeReason: string;
  disputeImages: string[];
  vehicleId: string | null;
  batteryId: string | null;
  finalPrice: number;
  paymentGateway: string;
  createdAt: string;
  updatedAt: string;
  buyer: {
    id: string;
    name: string;
    email: string;
  };
  vehicle?: {
    id: string;
    title: string;
    seller: {
      id: string;
      name: string;
      email: string;
    };
  };
  battery?: {
    id: string;
    title: string;
    seller: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export default function DisputesTable() {
  const { t } = useI18nContext();
  const toast = useToast();
  const [disputes, setDisputes] = useState<DisputedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDispute, setSelectedDispute] =
    useState<DisputedTransaction | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [resolving, setResolving] = useState(false);

  const fetchDisputes = async (page: number) => {
    try {
      setLoading(true);
      const result = await getDisputedTransactions(page, 10);

      if (result.success && result.data) {
        setDisputes(result.data.transactions);
        setTotalPages(result.data.totalPages);
        setCurrentPage(result.data.page);
      } else {
        toast.error(
          result.message ||
            t("admin.disputes.loadError", "Failed to load disputes")
        );
      }
    } catch (error) {
      console.error("Failed to fetch disputes:", error);
      toast.error(t("admin.disputes.loadError", "Failed to load disputes"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes(currentPage);
  }, []);

  const handleViewDetails = (dispute: DisputedTransaction) => {
    setSelectedDispute(dispute);
    setShowModal(true);
  };

  const handleResolve = async (approved: boolean) => {
    if (!selectedDispute) return;

    try {
      setResolving(true);
      const result = await resolveDispute(selectedDispute.id, approved);

      if (result.success) {
        toast.success(
          approved
            ? t(
                "admin.disputes.approveSuccess",
                "Dispute approved. Transaction refunded."
              )
            : t(
                "admin.disputes.rejectSuccess",
                "Dispute rejected. Transaction remains."
              )
        );
        setShowModal(false);
        setSelectedDispute(null);
        fetchDisputes(currentPage);
      } else {
        toast.error(
          result.message ||
            t("admin.disputes.resolveError", "Failed to resolve dispute")
        );
      }
    } catch (error) {
      console.error("Failed to resolve dispute:", error);
      toast.error(
        t("admin.disputes.resolveError", "Failed to resolve dispute")
      );
    } finally {
      setResolving(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchDisputes(page);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (disputes.length === 0) {
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-4 text-xl font-semibold text-gray-900">
          {t("admin.disputes.noDisputes", "No Disputes")}
        </h3>
        <p className="mt-2 text-gray-600">
          {t(
            "admin.disputes.noDisputesDesc",
            "All disputes have been resolved"
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Disputes List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.disputes.transaction", "Transaction")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.disputes.buyer", "Buyer")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.disputes.seller", "Seller")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.disputes.reason", "Reason")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.disputes.amount", "Amount")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.disputes.actions", "Actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {disputes.map((dispute) => {
                const product = dispute.vehicle || dispute.battery;
                const seller = product?.seller;

                return (
                  <tr key={dispute.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 line-clamp-1">
                            {product?.title || "N/A"}
                          </div>
                          <div className="text-gray-500 text-xs">
                            ID: {dispute.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {dispute.buyer.name}
                        </div>
                        <div className="text-gray-500">
                          {dispute.buyer.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {seller?.name || "N/A"}
                        </div>
                        <div className="text-gray-500">
                          {seller?.email || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2 max-w-xs">
                        {dispute.disputeReason}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(dispute.finalPrice)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(dispute)}
                        className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                      >
                        {t("admin.disputes.viewDetails", "View Details")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("admin.disputes.previous", "Previous")}
          </button>
          <span className="px-4 py-2 text-gray-700">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("admin.disputes.next", "Next")}
          </button>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {showModal && selectedDispute && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => !resolving && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {t("admin.disputes.disputeDetails", "Dispute Details")}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={resolving}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
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
                {/* Product Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {t("admin.disputes.productInfo", "Product Information")}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        {t("admin.disputes.productName", "Product Name")}
                      </p>
                      <p className="font-medium">
                        {(selectedDispute.vehicle || selectedDispute.battery)
                          ?.title || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        {t("admin.disputes.amount", "Amount")}
                      </p>
                      <p className="font-medium text-green-600">
                        {formatCurrency(selectedDispute.finalPrice)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Parties */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {t("admin.disputes.buyer", "Buyer")}
                    </h4>
                    <p className="font-medium">{selectedDispute.buyer.name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedDispute.buyer.email}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {t("admin.disputes.seller", "Seller")}
                    </h4>
                    <p className="font-medium">
                      {(selectedDispute.vehicle || selectedDispute.battery)
                        ?.seller.name || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {(selectedDispute.vehicle || selectedDispute.battery)
                        ?.seller.email || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Dispute Reason */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {t("admin.disputes.reason", "Dispute Reason")}
                  </h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">
                    {selectedDispute.disputeReason}
                  </p>
                </div>

                {/* Evidence Images */}
                {selectedDispute.disputeImages &&
                  selectedDispute.disputeImages.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        {t("admin.disputes.evidence", "Evidence Images")}
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {selectedDispute.disputeImages.map(
                          (imageUrl, index) => (
                            <a
                              key={index}
                              href={imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative group"
                            >
                              <Image
                                src={imageUrl}
                                alt={`Evidence ${index + 1}`}
                                width={200}
                                height={200}
                                className="w-full h-40 object-cover rounded-lg hover:opacity-90 transition-opacity"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                                <svg
                                  className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                  />
                                </svg>
                              </div>
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => handleResolve(false)}
                    disabled={resolving}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("admin.disputes.reject", "Reject Dispute")}
                  </button>
                  <button
                    onClick={() => handleResolve(true)}
                    disabled={resolving}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resolving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>
                          {t("admin.disputes.resolving", "Resolving...")}
                        </span>
                      </>
                    ) : (
                      t("admin.disputes.approve", "Approve & Refund")
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
