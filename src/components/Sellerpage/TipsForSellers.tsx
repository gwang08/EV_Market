"use client";
import React from "react";
import { useI18nContext } from "../../providers/I18nProvider";
import { FiFileText, FiCamera, FiZap, FiCheckCircle } from "react-icons/fi";

function TipsForSellers() {
  const { t } = useI18nContext();

  const tips = [
    {
      title: t("seller.tips.detailedDesc"),
      description: t("seller.tips.detailedDescTip"),
      icon: <FiFileText className="w-6 h-6" />,
      iconBg: "bg-gradient-to-br from-blue-100 via-white to-indigo-100",
      iconColor: "text-blue-700",
    },
    {
      title: t("seller.tips.qualityPhotos"),
      description: t("seller.tips.qualityPhotosTip"),
      icon: <FiCamera className="w-6 h-6" />,
      iconBg: "bg-gradient-to-br from-indigo-100 via-white to-blue-100",
      iconColor: "text-indigo-700",
    },
    {
      title: t("seller.tips.respondQuickly"),
      description: t("seller.tips.respondTip"),
      icon: <FiZap className="w-6 h-6" />,
      iconBg: "bg-gradient-to-br from-yellow-100 via-white to-blue-100",
      iconColor: "text-yellow-600",
    },
    {
      title: t("seller.tips.batteryReports"),
      description: t("seller.tips.batteryTip"),
      icon: <FiCheckCircle className="w-6 h-6" />,
      iconBg: "bg-gradient-to-br from-green-100 via-white to-blue-100",
      iconColor: "text-green-600",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
          {t("seller.tips.title")}
        </h3>
        <button className="text-sm font-semibold px-5 py-2 rounded-lg border border-blue-100 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors duration-200 shadow-sm">
          {t("seller.tips.viewGuide")}
        </button>
      </div>

      {/* Tips List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tips.map((tip, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-5 rounded-xl bg-gradient-to-br from-white via-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-300 group border border-blue-50"
          >
            {/* Icon */}
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-xl shadow ${tip.iconBg} ${tip.iconColor} group-hover:scale-110 transition-transform duration-300`}
            >
              {tip.icon}
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-semibold mb-1 text-slate-900 group-hover:text-blue-700 transition-colors">
                {tip.title}
              </h4>
              <p className="text-sm text-slate-500">{tip.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TipsForSellers;
