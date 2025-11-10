"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Gavel,
  DollarSign,
  BarChart3,
  Menu,
  X,
  History,
  FileCheck,
  AlertTriangle,
} from "lucide-react";
import { useI18nContext } from "@/providers/I18nProvider";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function AdminSidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const { t } = useI18nContext();
  const pathname = usePathname();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Thống kê & Báo cáo",
      href: "/admin",
      key: "dashboard",
    },
    {
      icon: Users,
      label: "Quản lý người dùng",
      href: "/admin/users",
      key: "users",
    },
    {
      icon: FileText,
      label: "Quản lý tin đăng",
      href: "/admin/listings",
      key: "listings",
    },
    {
      icon: Gavel,
      label: "Duyệt đấu giá",
      href: "/admin/auctions",
      key: "auctions",
    },
    {
      icon: History,
      label: "Lịch sử đấu giá",
      href: "/admin/auction-history",
      key: "auction-history",
    },
    {
      icon: AlertTriangle,
      label: "Giải quyết khiếu nại",
      href: "/admin/disputes",
      key: "disputes",
    },
    {
      icon: DollarSign,
      label: "Quản lý phí & hoa hồng",
      href: "/admin/fees",
      key: "fees",
    },
    // {
    //   icon: FileCheck,
    //   label: "Quản lý hợp đồng",
    //   href: "/admin/contracts",
    //   key: "contracts",
    // },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out w-64 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Admin Panel</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => {
                  // Close sidebar on mobile after clicking
                  if (window.innerWidth < 1024) {
                    toggleSidebar();
                  }
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
            <p className="text-xs text-gray-600 mb-1">Admin Access</p>
            <p className="text-sm font-semibold text-gray-900">EcoTrade EV</p>
          </div>
        </div>
      </aside>
    </>
  );
}
