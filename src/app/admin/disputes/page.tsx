"use client";
import React, { useState } from "react";
import RoleAuthWrapper from "@/components/common/RoleAuthWrapper";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import AdminTopbar from "@/components/Admin/AdminTopbar";
import DisputesTable from "@/components/Admin/DisputesTable";

function AdminDisputesContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Topbar */}
        <AdminTopbar toggleSidebar={toggleSidebar} />

        {/* Content */}
        <main className="p-4 lg:p-8">
          <DisputesTable />
        </main>
      </div>
    </div>
  );
}

export default function AdminDisputesPage() {
  return (
    <RoleAuthWrapper
      allowedRoles={["ADMIN"]}
      roleRedirectMap={{
        MEMBER: "/",
      }}
    >
      <AdminDisputesContent />
    </RoleAuthWrapper>
  );
}
