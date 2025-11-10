"use client";
import React from "react";
import { useI18nContext } from "../../providers/I18nProvider";
import {
  FiEye,
  FiMessageSquare,
  FiTrendingUp,
  FiDollarSign,
  FiList,
} from "react-icons/fi";

function StatsCards() {
  const { t } = useI18nContext();

  const stats = [
    {
      title: t("seller.stats.activeListings"),
      value: "2",
      change: `+5 ${t("seller.stats.active")}`,
      changeType: "positive",
      icon: <FiList className="w-7 h-7" />,
      iconBg: "bg-gradient-to-br from-green-100 via-white to-green-200",
      iconColor: "text-green-600",
    },
    {
      title: t("seller.stats.totalViews"),
      value: "435",
      change: `+87 ${t("seller.stats.thisWeek")}`,
      changeType: "positive",
      icon: <FiEye className="w-7 h-7" />,
      iconBg: "bg-gradient-to-br from-blue-100 via-white to-indigo-100",
      iconColor: "text-blue-600",
    },
    {
      title: t("seller.stats.messages"),
      value: "23",
      change: `+5 ${t("seller.stats.thisWeek")}`,
      changeType: "positive",
      icon: <FiMessageSquare className="w-7 h-7" />,
      iconBg: "bg-gradient-to-br from-purple-100 via-white to-indigo-100",
      iconColor: "text-purple-600",
    },
    {
      title: t("seller.stats.totalEarnings"),
      value: "19.900.000 VNĐ",
      change: `+3 ${t("seller.stats.itemsSold")}`,
      changeType: "positive",
      icon: <FiDollarSign className="w-7 h-7" />,
      iconBg: "bg-gradient-to-br from-green-100 via-white to-blue-100",
      iconColor: "text-green-600",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-3xl shadow-lg border border-blue-100 hover:shadow-2xl transition-all duration-300 p-8 flex flex-col gap-4 group relative overflow-hidden"
          >
            {/* Animated gradient background */}
            <div className="absolute inset-0 pointer-events-none opacity-60 group-hover:opacity-80 transition duration-300">
              <div className={`w-full h-full ${stat.iconBg} rounded-3xl`} />
            </div>
            {/* Icon */}
            <div
              className={`relative z-10 inline-flex items-center justify-center w-14 h-14 rounded-xl ${stat.iconColor} bg-white shadow group-hover:scale-110 transition-transform duration-300`}
            >
              {stat.icon}
            </div>
            {/* Title */}
            <h3 className="relative z-10 text-sm font-semibold text-slate-500 mb-1">
              {stat.title}
            </h3>
            {/* Value */}
            <p className="relative z-10 text-4xl font-bold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors duration-200 drop-shadow">
              {stat.value}
            </p>
            {/* Change */}
            <div className="relative z-10 flex items-center text-sm mt-1">
              <FiTrendingUp className="w-4 h-4 text-green-500 mr-1 animate-bounce" />
              <span className="text-green-600 font-medium">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StatsCards;
