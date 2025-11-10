"use client";
import { useState } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SellerTitle from "@/components/Sellerpage/SellerTitile";
import TabNavigation from "@/components/Sellerpage/TabNavigation";
import StatsCards from "@/components/Sellerpage/StatsCards";
import RecentActivity from "@/components/Sellerpage/RecentActivity";
import TipsForSellers from "@/components/Sellerpage/TipsForSellers";
import MyListings from "@/components/Sellerpage/MyListings";
import AddListing from "@/components/Sellerpage/AddListing";
import SellerOrders from "@/components/Sellerpage/SellerOrders";
import MemberOnlyWrapper from "../../components/common/MemberOnlyWrapper";

export default function SellPage() {
  const [activeTab, setActiveTab] = useState("listings");

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="bg-white min-h-screen">
            <StatsCards />

            {/* Bottom Section */}
            <div className="max-w-7xl mx-auto px-6 pb-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RecentActivity />
                <TipsForSellers />
              </div>
            </div>
          </div>
        );

      case "listings":
        return <MyListings />;

      case "orders":
        return <SellerOrders />;

      case "add":
        return <AddListing onSuccess={() => setActiveTab("listings")} />;

      default:
        return null;
    }
  };

  return (
    <MemberOnlyWrapper>
      <div className="min-h-screen bg-white mt-25">
        <Header />
        <SellerTitle />
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        {renderTabContent()}

        <Footer />
      </div>
    </MemberOnlyWrapper>
  );
}
