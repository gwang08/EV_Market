"use client";
import React from "react";
import {
  Users,
  FileText,
  DollarSign,
  Gavel,
  TrendingUp,
  Clock,
} from "lucide-react";

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  change?: string;
  changeType?: "increase" | "decrease";
  color: string;
}

function StatCard({
  icon: Icon,
  title,
  value,
  change,
  changeType,
  color,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <span
            className={`text-sm font-medium ${
              changeType === "increase" ? "text-green-600" : "text-red-600"
            }`}
          >
            {change}
          </span>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

interface DashboardStatsProps {
  stats: {
    totalUsers: number;
    totalListings: number;
    pendingListings: number;
    totalTransactions: number;
    revenue: number;
    pendingAuctions: number;
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        icon={Users}
        title="Tổng người dùng"
        value={stats.totalUsers.toLocaleString()}
        change="+12%"
        changeType="increase"
        color="bg-blue-600"
      />
      <StatCard
        icon={FileText}
        title="Tổng tin đăng"
        value={stats.totalListings.toLocaleString()}
        change="+8%"
        changeType="increase"
        color="bg-green-600"
      />
      <StatCard
        icon={Clock}
        title="Tin đăng chờ duyệt"
        value={stats.pendingListings.toLocaleString()}
        color="bg-yellow-600"
      />
      <StatCard
        icon={Gavel}
        title="Đấu giá chờ duyệt"
        value={stats.pendingAuctions.toLocaleString()}
        color="bg-purple-600"
      />
      <StatCard
        icon={TrendingUp}
        title="Giao dịch"
        value={stats.totalTransactions.toLocaleString()}
        change="+15%"
        changeType="increase"
        color="bg-indigo-600"
      />
      <StatCard
        icon={DollarSign}
        title="Doanh thu"
        value={`${(stats.revenue / 1000000).toFixed(1)}M VND`}
        change="+23%"
        changeType="increase"
        color="bg-emerald-600"
      />
    </div>
  );
}
