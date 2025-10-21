"use client";
import React from "react";
import { useI18nContext } from "../../providers/I18nProvider";
import { Vehicle } from "../../services";
import { motion } from "framer-motion";

interface CarDescriptionProps {
  vehicle: Vehicle;
}

function CarDescription({ vehicle }: CarDescriptionProps) {
  const { t } = useI18nContext();

  return (
    <motion.div
      className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl shadow-xl border border-blue-100"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="p-8">
        <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
          {t("vehicleDetail.description")}
        </h3>

        {/* Main Description */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <p className="text-base leading-relaxed text-slate-700">
            {vehicle.description || t("vehicleDetail.noDescription")}
          </p>
        </motion.div>

        {/* Vehicle Details */}
        <div className="mb-8">
          <h4 className="font-semibold mb-4 text-blue-900">
            {t("vehicleDetail.vehicleDetails")}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between items-center py-2 border-b border-blue-50">
              <span className="text-sm font-medium text-slate-500">
                {t("vehicleDetail.brand")}
              </span>
              <span className="text-sm text-slate-900">{vehicle.brand}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-blue-50">
              <span className="text-sm font-medium text-slate-500">
                {t("vehicleDetail.model")}
              </span>
              <span className="text-sm text-slate-900">{vehicle.model}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-blue-50">
              <span className="text-sm font-medium text-slate-500">
                {t("vehicleDetail.year")}
              </span>
              <span className="text-sm text-slate-900">{vehicle.year}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-blue-50">
              <span className="text-sm font-medium text-slate-500">
                {t("vehicleDetail.mileage")}
              </span>
              <span className="text-sm text-slate-900">
                {vehicle.mileage.toLocaleString()} km
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-blue-50">
              <span className="text-sm font-medium text-slate-500">
                {t("vehicleDetail.status")}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full font-semibold
                ${
                  vehicle.status === "AVAILABLE"
                    ? "bg-green-100 text-green-700"
                    : vehicle.status === "SOLD"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {vehicle.status}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-blue-50">
              <span className="text-sm font-medium text-slate-500">
                {t("vehicleDetail.verified")}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full font-semibold
                ${
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

        {/* Listing Information */}
        <div>
          <h4 className="font-semibold mb-4 text-blue-900">
            {t("vehicleDetail.listingInformation")}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              className="p-4 bg-white/80 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <div className="font-medium mb-1 text-slate-500">
                {t("vehicleDetail.listedOn")}
              </div>
              <div className="text-sm text-slate-900">
                {new Date(vehicle.createdAt).toLocaleDateString()}
              </div>
            </motion.div>
            <motion.div
              className="p-4 bg-white/80 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.22 }}
            >
              <div className="font-medium mb-1 text-slate-500">
                {t("vehicleDetail.lastUpdated")}
              </div>
              <div className="text-sm text-slate-900">
                {new Date(vehicle.updatedAt).toLocaleDateString()}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default CarDescription;
