"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useI18nContext } from "../../providers/I18nProvider";
import { shipTransaction, getStatusColor } from "../../services/Transaction";
import { getMyVehicles, Vehicle } from "../../services/Vehicle";
import { getMyBatteries, Battery } from "../../services/Battery";
import { formatCurrency } from "../../services/Wallet";
import Image from "next/image";

// Combined type for sold products
type SoldProduct = (Vehicle | Battery) & {
  productType: "vehicle" | "battery";
  transactionId?: string;
};

export default function SellerOrders() {
  const { t } = useI18nContext();
  const [soldProducts, setSoldProducts] = useState<SoldProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load seller's sold products
  useEffect(() => {
    const loadSoldProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const [vehiclesRes, batteriesRes] = await Promise.all([
          getMyVehicles(),
          getMyBatteries(),
        ]);

        const products: SoldProduct[] = [];

        // Add sold vehicles
        if (vehiclesRes.data?.vehicles) {
          const soldVehicles = vehiclesRes.data.vehicles
            .filter((v) => v.status === "SOLD")
            .map((v) => ({ ...v, productType: "vehicle" as const }));
          products.push(...soldVehicles);
        }

        // Add sold batteries
        if (batteriesRes.data?.batteries) {
          const soldBatteries = batteriesRes.data.batteries
            .filter((b) => b.status === "SOLD")
            .map((b) => ({ ...b, productType: "battery" as const }));
          products.push(...soldBatteries);
        }

        // Sort by updatedAt (most recent first)
        products.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        console.log("Sold products:", products);
        setSoldProducts(products);
      } catch (err) {
        console.error("Failed to load sold products:", err);
        setError(t("seller.orders.loadError", "Failed to load orders"));
      } finally {
        setLoading(false);
      }
    };

    loadSoldProducts();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleShipOrder = async (productId: string) => {
    try {
      // Note: We need the transaction ID to ship, not just product ID
      // For now, just show a message that we need transaction integration
      alert(
        t(
          "seller.orders.needTransactionId",
          "Transaction ID needed. This feature requires backend transaction lookup by product ID."
        )
      );

      // TODO: Need backend endpoint like GET /transactions/product/{productId}
      // Then: await shipTransaction(transactionId);
    } catch (error) {
      console.error("Failed to ship order:", error);
      alert(
        t(
          "seller.orders.shipError",
          "Failed to mark order as shipped. Please try again."
        )
      );
    }
  };

  // Pagination
  const totalPages = Math.ceil(soldProducts.length / itemsPerPage);
  const paginatedProducts = soldProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {t("seller.orders.retry", "Retry")}
        </button>
      </div>
    );
  }

  if (soldProducts.length === 0) {
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
            "You haven't received any orders yet."
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
        {paginatedProducts.map((product) => {
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-all"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Product Image */}
                <div className="w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                  <Image
                    src={product.images[0] || "/placeholder.png"}
                    alt={product.title}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {product.title}
                  </h3>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                        product.productType === "vehicle"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {product.productType === "vehicle"
                        ? t("seller.orders.productType.vehicle", "Vehicle")
                        : t("seller.orders.productType.battery", "Battery")}
                    </span>

                    {/* Product Status Badge */}
                    <span className="px-3 py-1 rounded-lg text-sm font-semibold bg-orange-100 text-orange-700">
                      {product.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">
                        {t("seller.orders.price", "Price")}:
                      </span>
                      <span className="ml-2 font-bold text-green-600">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        {t("seller.orders.soldDate", "Sold Date")}:
                      </span>
                      <span className="ml-2 font-semibold">
                        {new Date(product.updatedAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        {t("seller.orders.productId", "Product ID")}:
                      </span>
                      <span className="ml-2 font-mono text-xs">
                        {product.id.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShipOrder(product.id)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-semibold flex items-center gap-2"
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
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      />
                    </svg>
                    <span>{t("seller.orders.shipOrder", "Ship Order")}</span>
                  </motion.button>
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
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("seller.orders.previous", "Previous")}
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("seller.orders.next", "Next")}
          </button>
        </div>
      )}
    </div>
  );
}
