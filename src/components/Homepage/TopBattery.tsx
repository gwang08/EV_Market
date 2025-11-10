"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useI18nContext } from "../../providers/I18nProvider";
import { useDataContext } from "../../contexts/DataContext";
import { type Battery, getCurrentUserId } from "../../services";
import { GridSkeleton } from "../common/Skeleton";
import { motion } from "framer-motion";

function TopBattery() {
  const { t } = useI18nContext();
  const router = useRouter();
  const {
    batteries: allBatteries,
    isLoadingBatteries,
    fetchBatteries,
  } = useDataContext();
  const [displayBatteries, setDisplayBatteries] = useState<Battery[]>([]);

  const handleBatteryClick = (batteryId: string) => {
    router.push(`/pin/${batteryId}`);
  };

  useEffect(() => {
    fetchBatteries();
  }, [fetchBatteries]);

  useEffect(() => {
    const filterBatteries = async () => {
      if (!allBatteries) return;

      const currentUserId = await getCurrentUserId();

      const filteredBatteries = allBatteries.filter((battery) => {
        const isAvailable = battery.status === "AVAILABLE";
        const isNotSold = battery.status !== "SOLD";
        const isNotOwnBattery =
          !currentUserId || battery.sellerId !== currentUserId;
        const isVerified = battery.isVerified === true; // Chỉ lấy pin đã verified

        return isAvailable && isNotSold && isNotOwnBattery && isVerified;
      });

      setDisplayBatteries(filteredBatteries.slice(0, 4)); // Giới hạn 4 pin
    };

    filterBatteries();
  }, [allBatteries]);

  if (isLoadingBatteries) {
    return (
      <div className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent drop-shadow-sm">
              {t("homepage.topBattery.title")}
            </h2>
          </div>
          <GridSkeleton count={4} columns={4} showBadge={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 px-4 sm:px-">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent drop-shadow-sm">
            {t("homepage.topBattery.title")}
          </h2>
          <button
            className="group relative px-6 py-2 bg-blue-600 text-white font-medium rounded-full overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.02] text-center"
            onClick={() => router.push("/batteries")}
          >
            <span className="relative z-10">{t("common.viewAll")}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </button>
        </div>

        {/* Empty State */}
        {displayBatteries.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl shadow-sm border border-gray-200">
            <div className="max-w-md mx-auto">
              <svg
                className="mx-auto h-16 w-16 text-blue-200 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                {t("batteries.noBatteries", "Không có pin nào khả dụng")}
              </h3>
              <p className="text-sm text-slate-500">
                {t(
                  "batteries.noBatteriesDesc",
                  "Hiện tại không có pin nào. Vui lòng quay lại sau."
                )}
              </p>
            </div>
          </div>
        ) : (
          /* Battery Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayBatteries.map((battery, idx) => (
              <motion.div
                key={battery.id}
                className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer border border-slate-100 hover:border-blue-300 flex flex-col"
                onClick={() => handleBatteryClick(battery.id)}
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.7,
                  ease: "easeOut",
                  delay: idx * 0.12,
                }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 8px 32px 0 rgba(59,130,246,0.10)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Image */}
                <motion.div
                  className="relative h-56 flex items-center justify-center bg-white"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.1 + idx * 0.12 }}
                >
                  <Image
                    src={
                      battery.images && battery.images.length > 0
                        ? battery.images[0]
                        : "/Homepage/Pin.png"
                    }
                    alt={battery.title}
                    fill
                    className="object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-105 bg-white"
                    loading="lazy"
                    unoptimized
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/Homepage/Pin.png";
                    }}
                  />
                  {/* Badge bottom left/right */}
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    {battery.isVerified && (
                      <motion.span
                        className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold shadow"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 + idx * 0.12 }}
                      >
                        <Image
                          src="/Verified.svg"
                          alt="Verified"
                          width={16}
                          height={16}
                          className="mr-1"
                          unoptimized
                        />
                        {t("battery.verified", "Verified")}
                      </motion.span>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    {battery.status === "AVAILABLE" && (
                      <motion.span
                        className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold shadow"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.25 + idx * 0.12 }}
                      >
                        <Image
                          src="/Homepage/Popular.svg"
                          alt="Popular"
                          width={16}
                          height={16}
                          className="mr-1"
                          unoptimized
                        />
                        {t("battery.available", "Available")}
                      </motion.span>
                    )}
                  </div>
                </motion.div>
                {/* Content */}
                <div className="flex-1 flex flex-col justify-between p-6">
                  <motion.div
                    className="flex flex-col items-center mb-2"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.18 + idx * 0.12 }}
                  >
                    <h3
                      className="font-semibold text-lg text-slate-900 text-center truncate w-full group-hover:text-blue-700 transition-colors duration-200"
                      title={battery.title}
                    >
                      {battery.title}
                    </h3>
                    <span className="text-2xl font-bold text-indigo-700 group-hover:text-blue-700 transition-colors duration-200 mt-1">
                      {battery.price.toLocaleString()} VNĐ
                    </span>
                  </motion.div>
                  <motion.div
                    className="flex justify-between items-center text-xs text-slate-500 mt-2 mb-1"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.22 + idx * 0.12 }}
                  >
                    <span>{battery.year}</span>
                    <span>{battery.capacity} kWh</span>
                  </motion.div>
                  <motion.div
                    className="flex justify-between items-center mt-2"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.26 + idx * 0.12 }}
                  >
                    <div className="flex items-center gap-1">
                      <Image
                        src="/Homepage/Pin.svg"
                        alt="Pin"
                        width={16}
                        height={16}
                        className="w-4 h-4"
                        unoptimized
                      />
                      <span className="text-xs text-slate-400">
                        {battery.health}% SoH
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Image
                        src="/Homepage/Star.svg"
                        alt="Star"
                        width={16}
                        height={16}
                        className="w-4 h-4"
                        unoptimized
                      />
                      <span className="text-xs font-medium text-yellow-500">
                        {(Math.random() * (5 - 4) + 4).toFixed(1)}
                      </span>
                    </div>
                    <span className="inline-block px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-700 font-semibold shadow-sm ml-2">
                      {battery.brand || "Battery"}
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TopBattery;
