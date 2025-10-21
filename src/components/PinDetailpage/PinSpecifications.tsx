"use client";
import React from "react";
import {
  Battery as BatteryIcon,
  Zap,
  ThermometerSun,
  Shield,
} from "lucide-react";
import { useI18nContext } from "../../providers/I18nProvider";
import { Battery } from "../../services";
import { motion } from "framer-motion";

interface PinSpecificationsProps {
  battery: Battery;
}

function PinSpecifications({ battery }: PinSpecificationsProps) {
  const { t } = useI18nContext();

  const specs = battery.specifications;

  const specSections = [
    {
      title: t("batteryDetail.electricalSpecs"),
      icon: <Zap size={18} />,
      items: [
        { label: t("batteryDetail.voltage"), value: specs?.voltage || "N/A" },
        {
          label: t("batteryDetail.capacity"),
          value: `${battery.capacity} kWh`,
        },
        {
          label: t("batteryDetail.chemistry"),
          value: specs?.chemistry || "N/A",
        },
        {
          label: t("batteryDetail.chargingTime"),
          value: specs?.chargingTime || "N/A",
        },
      ],
    },
    {
      title: t("batteryDetail.physicalSpecs"),
      icon: <BatteryIcon size={18} />,
      items: [
        { label: t("batteryDetail.weight"), value: specs?.weight || "N/A" },
        {
          label: t("batteryDetail.installation"),
          value: specs?.installation || "N/A",
        },
        {
          label: t("batteryDetail.degradation"),
          value: specs?.degradation || "N/A",
        },
        { label: t("batteryDetail.health"), value: `${battery.health}% SoH` },
      ],
    },
    {
      title: t("batteryDetail.performance"),
      icon: <ThermometerSun size={18} />,
      items: [
        {
          label: t("batteryDetail.temperatureRange"),
          value: specs?.temperatureRange || "N/A",
        },
        {
          label: t("batteryDetail.batteryHealth"),
          value: `${battery.health}%`,
        },
        {
          label: t("batteryDetail.year"),
          value: battery.year?.toString() || "N/A",
        },
        { label: t("batteryDetail.status"), value: battery.status },
      ],
    },
    {
      title: t("batteryDetail.warrantySafety"),
      icon: <Shield size={18} />,
      items: [
        {
          label: t("batteryDetail.warrantyPeriod"),
          value: specs?.warrantyPeriod || "N/A",
        },
        {
          label: t("batteryDetail.verified"),
          value: battery.isVerified
            ? t("batteryDetail.yes")
            : t("batteryDetail.no"),
        },
        { label: t("batteryDetail.brand"), value: battery.brand },
        {
          label: t("batteryDetail.created"),
          value: new Date(battery.createdAt).toLocaleDateString(),
        },
      ],
    },
  ];

  return (
    <div className="bg-white/90 rounded-2xl shadow-xl border border-blue-100 w-full mt-10">
      <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 rounded-t-2xl">
        <h3 className="text-xl font-bold px-6 py-4 text-blue-900">
          {t("batteryDetail.technicalSpecifications")}
        </h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {specSections.map((section, idx) => (
            <motion.div
              key={idx}
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-600">{section.icon}</span>
                <span className="font-semibold text-blue-900 text-base">
                  {section.title}
                </span>
              </div>
              <div className="space-y-1">
                {section.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
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
    </div>
  );
}

export default PinSpecifications;
