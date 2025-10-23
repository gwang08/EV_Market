"use client";
import React from "react";
import VehiclesList from "../../components/VehiclesList/VehiclesList";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MemberOnlyWrapper from "../../components/common/MemberOnlyWrapper";

export default function VehiclesPage() {
  return (
    <MemberOnlyWrapper>
      <div className="min-h-screen bg-white">
        <Header />
        <VehiclesList />
        <Footer />
      </div>
    </MemberOnlyWrapper>
  );
}
