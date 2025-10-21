"use client";
import React from "react";
import { Gauge, Battery, MapPin, Shield } from "lucide-react";
import colors from "../../Utils/Color";
import { useI18nContext } from "../../providers/I18nProvider";
import { Vehicle } from "../../services";
import { motion } from "framer-motion";

interface CarSpecificationsProps {
  vehicle: Vehicle;
}

function CarSpecifications({ vehicle }: CarSpecificationsProps) {
  const { t } = useI18nContext();

  const specs = vehicle.specifications;

  const specSections = [
    {
      title: t("vehicleDetail.performance"),
      icon: <Gauge size={20} />,
      items: [
        {
          label: t("vehicleDetail.topSpeed"),
          value: specs?.performance?.topSpeed || "N/A",
        },
        {
          label: t("vehicleDetail.acceleration"),
          value: specs?.performance?.acceleration || "N/A",
        },
        {
          label: t("vehicleDetail.motorType"),
          value: specs?.performance?.motorType || "N/A",
        },
        {
          label: t("vehicleDetail.horsepower"),
          value: specs?.performance?.horsepower || "N/A",
        },
      ],
    },
    {
      title: t("vehicleDetail.batteryCharging"),
      icon: <Battery size={20} />,
      items: [
        {
          label: t("vehicleDetail.batteryCapacity"),
          value: specs?.batteryAndCharging?.batteryCapacity || "N/A",
        },
        {
          label: t("vehicleDetail.range"),
          value: specs?.batteryAndCharging?.range || "N/A",
        },
        {
          label: t("vehicleDetail.chargingSpeed"),
          value: specs?.batteryAndCharging?.chargingSpeed || "N/A",
        },
        {
          label: t("vehicleDetail.chargeTime"),
          value: specs?.batteryAndCharging?.chargeTime || "N/A",
        },
      ],
    },
    {
      title: t("vehicleDetail.dimensions"),
      icon: <MapPin size={20} />,
      items: [
        {
          label: t("vehicleDetail.length"),
          value: specs?.dimensions?.length || "N/A",
        },
        {
          label: t("vehicleDetail.width"),
          value: specs?.dimensions?.width || "N/A",
        },
        {
          label: t("vehicleDetail.height"),
          value: specs?.dimensions?.height || "N/A",
        },
        {
          label: t("vehicleDetail.curbWeight"),
          value: specs?.dimensions?.curbWeight || "N/A",
        },
      ],
    },
    {
      title: t("vehicleDetail.warranty"),
      icon: <Shield size={20} />,
      items: [
        {
          label: t("vehicleDetail.basicWarranty"),
          value: specs?.warranty?.basic || "N/A",
        },
        {
          label: t("vehicleDetail.batteryWarranty"),
          value: specs?.warranty?.battery || "N/A",
        },
        {
          label: t("vehicleDetail.drivetrainWarranty"),
          value: specs?.warranty?.drivetrain || "N/A",
        },
      ],
    },
  ];

  return (
    <motion.div
      className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl shadow-xl border border-blue-100"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="p-8">
        <h3 className="text-2xl font-bold mb-8 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
          {t("vehicleDetail.specifications")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {specSections.map((section, index) => (
            <motion.div
              key={index}
              className="space-y-5 bg-white/80 rounded-xl p-6 shadow group hover:shadow-lg transition"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="text-blue-600">{section.icon}</div>
                <h4 className="font-semibold text-blue-900">{section.title}</h4>
              </div>
              <div className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex justify-between items-center border-b border-blue-50 pb-1 last:border-0"
                  >
                    <span className="text-sm text-slate-500">{item.label}</span>
                    <span className="font-medium text-slate-900 text-sm">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default CarSpecifications;
