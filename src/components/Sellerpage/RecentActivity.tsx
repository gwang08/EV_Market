"use client";
import React from "react";
import { useI18nContext } from "../../providers/I18nProvider";
import { FiMessageSquare, FiEye, FiUser, FiStar } from "react-icons/fi";

function RecentActivity() {
  const { t } = useI18nContext();

  const activities = [
    {
      type: "message",
      title: t("seller.activity.newMessage"),
      description: t("seller.activity.messageDesc"),
      time: `2 ${t("seller.activity.hoursAgo")}`,
      icon: <FiMessageSquare className="w-5 h-5" />,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      type: "view",
      title: t("seller.activity.listingViews"),
      description: t("seller.activity.viewsDesc"),
      time: `6 ${t("seller.activity.hoursAgo")}`,
      icon: <FiEye className="w-5 h-5" />,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      type: "profile",
      title: t("seller.activity.profileVisit"),
      description: t("seller.activity.profileDesc"),
      time: t("seller.activity.yesterday"),
      icon: <FiUser className="w-5 h-5" />,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      type: "review",
      title: t("seller.activity.newReview"),
      description: t("seller.activity.reviewDesc"),
      time: `2 ${t("seller.activity.daysAgo")}`,
      icon: <FiStar className="w-5 h-5" />,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
      {/* Header */}
      <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6">
        {t("seller.activity.title")}
      </h3>

      {/* Activity List */}
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-white via-blue-50 to-indigo-50 hover:shadow-md transition-all duration-300 group border border-blue-50"
          >
            {/* Icon */}
            <div
              className={`inline-flex items-center justify-center w-10 h-10 rounded-xl shadow ${activity.iconBg} ${activity.iconColor} group-hover:scale-110 transition-transform duration-300`}
            >
              {activity.icon}
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {activity.title}
                </h4>
                <span className="text-xs text-slate-500">{activity.time}</span>
              </div>
              <p className="text-sm mt-1 text-slate-500">
                {activity.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentActivity;
