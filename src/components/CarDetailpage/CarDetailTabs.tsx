"use client";
import React, { useState } from "react";
import { Vehicle } from "../../services";
import { useI18nContext } from "../../providers/I18nProvider";
import { motion, AnimatePresence } from "framer-motion";

interface CarDetailTabsProps {
  vehicle: Vehicle;
}

function CarDetailTabs({ vehicle }: CarDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<"description" | "specifications">(
    "description"
  );
  const { t } = useI18nContext();

  // Function to get localized status
  const getLocalizedStatus = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return t("vehicleDetail.available");
      case "SOLD":
        return t("vehicleDetail.sold");
      case "DELISTED":
        return t("vehicleDetail.delisted");
      default:
        return status;
    }
  };

  return (
    <div className="bg-white/90 rounded-2xl shadow-xl border border-blue-100 w-full mt-10">
      {/* Tab Headers */}
      <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 rounded-t-2xl">
        <nav className="flex space-x-4 px-6">
          <button
            onClick={() => setActiveTab("description")}
            className={`py-4 px-2 border-b-2 font-semibold text-base transition-all duration-200 tracking-wide
              ${
                activeTab === "description"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-200"
              }`}
          >
            {t("vehicleDetail.description")}
          </button>
          <button
            onClick={() => setActiveTab("specifications")}
            className={`py-4 px-2 border-b-2 font-semibold text-base transition-all duration-200 tracking-wide
              ${
                activeTab === "specifications"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-200"
              }`}
          >
            {t("vehicleDetail.specifications")}
          </button>
        </nav>
      </div>

      {/* Tab Content with animation */}
      <div className="p-6 min-h-[260px]">
        <AnimatePresence mode="wait">
          {activeTab === "description" && (
            <motion.div
              key="desc"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              {/* Description Content */}
              <h3 className="text-xl font-bold mb-4 text-blue-900">
                {t("vehicleDetail.vehicleDescription")}
              </h3>
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        {t("vehicleDetail.brand")}
                      </span>
                      <span className="font-medium text-slate-900">
                        {vehicle.brand}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        {t("vehicleDetail.model")}
                      </span>
                      <span className="font-medium text-slate-900">
                        {vehicle.model}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        {t("vehicleDetail.year")}
                      </span>
                      <span className="font-medium text-slate-900">
                        {vehicle.year}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        {t("vehicleDetail.mileage")}
                      </span>
                      <span className="font-medium text-slate-900">
                        {vehicle.mileage.toLocaleString()} km
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        {t("vehicleDetail.status")}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          vehicle.status === "AVAILABLE"
                            ? "bg-green-100 text-green-700"
                            : vehicle.status === "SOLD"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {getLocalizedStatus(vehicle.status)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        {t("vehicleDetail.verified")}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          vehicle.isVerified
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {vehicle.isVerified
                          ? t("vehicleDetail.verified")
                          : t("vehicleDetail.notVerified")}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Description Text */}
                <div className="pt-3 border-t border-blue-100">
                  <h4 className="font-semibold mb-2 text-blue-900">
                    {t("vehicleDetail.aboutThisVehicle")}
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {vehicle.description || t("vehicleDetail.noDescription")}
                  </p>
                </div>
                {/* Dates */}
                <div className="pt-3 border-t border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-slate-500">
                      {t("vehicleDetail.listedOn")}
                    </span>
                    <p className="font-medium text-slate-900 text-sm">
                      {new Date(vehicle.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">
                      {t("vehicleDetail.lastUpdated")}
                    </span>
                    <p className="font-medium text-slate-900 text-sm">
                      {new Date(vehicle.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === "specifications" && (
            <motion.div
              key="spec"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              {/* Specifications Content */}
              <h3 className="text-xl font-bold mb-4 text-blue-900">
                {t("vehicleDetail.specifications")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Performance */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-600">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
                        <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                        <path d="M12 2v2" />
                        <path d="M12 20v2" />
                        <path d="m4.93 4.93 1.41 1.41" />
                        <path d="m17.66 17.66 1.41 1.41" />
                        <path d="M2 12h2" />
                        <path d="M20 12h2" />
                        <path d="m6.34 17.66-1.41 1.41" />
                        <path d="m19.07 4.93-1.41 1.41" />
                      </svg>
                    </span>
                    <span className="font-semibold text-blue-900">
                      {t("vehicleDetail.performance")}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        {t("vehicleDetail.topSpeed")}
                      </span>
                      <span className="font-medium text-slate-900 text-sm">
                        {vehicle.specifications?.performance?.topSpeed ||
                          t("vehicleDetail.na")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        {t("vehicleDetail.acceleration")}
                      </span>
                      <span className="font-medium text-slate-900 text-sm">
                        {vehicle.specifications?.performance?.acceleration ||
                          t("vehicleDetail.na")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        {t("vehicleDetail.motorType")}
                      </span>
                      <span className="font-medium text-slate-900 text-sm">
                        {vehicle.specifications?.performance?.motorType ||
                          t("vehicleDetail.na")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        {t("vehicleDetail.horsepower")}
                      </span>
                      <span className="font-medium text-slate-900 text-sm">
                        {vehicle.specifications?.performance?.horsepower ||
                          t("vehicleDetail.na")}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Battery & Charging */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-600">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          width="16"
                          height="10"
                          x="2"
                          y="7"
                          rx="2"
                          ry="2"
                        />
                        <line x1="22" x2="22" y1="11" y2="13" />
                      </svg>
                    </span>
                    <span className="font-semibold text-blue-900">
                      {t("vehicleDetail.batteryCharging")}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        {t("vehicleDetail.batteryCapacity")}
                      </span>
                      <span className="font-medium text-slate-900 text-sm">
                        {vehicle.specifications?.batteryAndCharging
                          ?.batteryCapacity || t("vehicleDetail.na")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        {t("vehicleDetail.range")}
                      </span>
                      <span className="font-medium text-slate-900 text-sm">
                        {vehicle.specifications?.batteryAndCharging?.range ||
                          t("vehicleDetail.na")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        {t("vehicleDetail.chargingSpeed")}
                      </span>
                      <span className="font-medium text-slate-900 text-sm">
                        {vehicle.specifications?.batteryAndCharging
                          ?.chargingSpeed || t("vehicleDetail.na")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        {t("vehicleDetail.chargeTime")}
                      </span>
                      <span className="font-medium text-slate-900 text-sm">
                        {vehicle.specifications?.batteryAndCharging
                          ?.chargeTime || t("vehicleDetail.na")}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Dimensions */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-600">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                      </svg>
                    </span>
                    <span className="font-semibold text-blue-900">
                      {t("vehicleDetail.dimensions")}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        {t("vehicleDetail.length")}
                      </span>
                      <span className="font-medium text-slate-900 text-sm">
                        {vehicle.specifications?.dimensions?.length ||
                          t("vehicleDetail.na")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        {t("vehicleDetail.width")}
                      </span>
                      <span className="font-medium text-slate-900 text-sm">
                        {vehicle.specifications?.dimensions?.width ||
                          t("vehicleDetail.na")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        {t("vehicleDetail.height")}
                      </span>
                      <span className="font-medium text-slate-900 text-sm">
                        {vehicle.specifications?.dimensions?.height ||
                          t("vehicleDetail.na")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        {t("vehicleDetail.curbWeight")}
                      </span>
                      <span className="font-medium text-slate-900 text-sm">
                        {vehicle.specifications?.dimensions?.curbWeight ||
                          t("vehicleDetail.na")}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Warranty */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-600">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </span>
                    <span className="font-semibold text-blue-900">
                      {t("vehicleDetail.warranty")}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        {t("vehicleDetail.basicWarranty")}
                      </span>
                      <span className="font-medium text-slate-900 text-sm">
                        {vehicle.specifications?.warranty?.basic ||
                          t("vehicleDetail.na")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        {t("vehicleDetail.batteryWarranty")}
                      </span>
                      <span className="font-medium text-slate-900 text-sm">
                        {vehicle.specifications?.warranty?.battery ||
                          t("vehicleDetail.na")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        {t("vehicleDetail.drivetrainWarranty")}
                      </span>
                      <span className="font-medium text-slate-900 text-sm">
                        {vehicle.specifications?.warranty?.drivetrain ||
                          t("vehicleDetail.na")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default CarDetailTabs;
