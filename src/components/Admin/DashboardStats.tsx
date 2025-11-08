"use client";
import React, { memo, useMemo } from "react";
import {
  Users,
  FileText,
  DollarSign,
  Gavel,
  TrendingUp,
  Clock,
} from "lucide-react";
import dynamic from "next/dynamic";

// Lazy load Chart components để giảm initial bundle size
const Line = dynamic(() => import("react-chartjs-2").then(mod => mod.Line), {
  ssr: false,
  loading: () => <div className="h-80 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
});

const Bar = dynamic(() => import("react-chartjs-2").then(mod => mod.Bar), {
  ssr: false,
  loading: () => <div className="h-80 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
});

const Doughnut = dynamic(() => import("react-chartjs-2").then(mod => mod.Doughnut), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
});

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  change?: string;
  changeType?: "increase" | "decrease";
  color: string;
}

// Memoized StatCard để tránh re-render
const StatCard = memo(({
  icon: Icon,
  title,
  value,
  change,
  changeType,
  color,
}: StatCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-default">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center transition-transform hover:scale-110 duration-200`}
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
});

StatCard.displayName = "StatCard";

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
  // Memoize chart data để tránh tính toán lại mỗi lần render
  const lineChartData = useMemo(() => ({
    labels: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"],
    datasets: [
      {
        label: "Doanh thu (VND)",
        data: [
          stats.revenue * 0.6,
          stats.revenue * 0.7,
          stats.revenue * 0.65,
          stats.revenue * 0.8,
          stats.revenue * 0.75,
          stats.revenue * 0.85,
          stats.revenue * 0.9,
          stats.revenue * 0.88,
          stats.revenue * 0.95,
          stats.revenue * 0.92,
          stats.revenue * 0.98,
          stats.revenue,
        ],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  }), [stats.revenue]);

  const barChartData = useMemo(() => ({
    labels: ["Đang hoạt động", "Chờ duyệt", "Đã bán", "Từ chối"],
    datasets: [
      {
        label: "Số lượng",
        data: [
          stats.totalListings - stats.pendingListings,
          stats.pendingListings,
          Math.floor(stats.totalTransactions * 0.8),
          Math.floor(stats.totalListings * 0.05),
        ],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(234, 179, 8, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: [
          "rgb(34, 197, 94)",
          "rgb(234, 179, 8)",
          "rgb(59, 130, 246)",
          "rgb(239, 68, 68)",
        ],
        borderWidth: 2,
      },
    ],
  }), [stats.totalListings, stats.pendingListings, stats.totalTransactions]);

  const doughnutChartData = useMemo(() => ({
    labels: ["Bán thường", "Đấu giá", "Chưa hoàn thành"],
    datasets: [
      {
        label: "Giao dịch",
        data: [
          Math.floor(stats.totalTransactions * 0.6),
          Math.floor(stats.totalTransactions * 0.3),
          Math.floor(stats.totalTransactions * 0.1),
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(147, 51, 234, 0.8)",
          "rgba(156, 163, 175, 0.8)",
        ],
        borderColor: ["rgb(59, 130, 246)", "rgb(147, 51, 234)", "rgb(156, 163, 175)"],
        borderWidth: 2,
      },
    ],
  }), [stats.totalTransactions]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  }), []);

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
          value={`${stats.revenue.toLocaleString()} VND`}
          change="+23%"
          changeType="increase"
          color="bg-emerald-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Line Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Doanh thu theo tháng
          </h3>
          <div className="h-80">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Thống kê tin đăng
          </h3>
          <div className="h-80">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Doughnut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Phân loại giao dịch
          </h3>
          <div className="h-64">
            <Doughnut data={doughnutChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </>
  );
}

