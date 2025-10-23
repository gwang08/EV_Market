"use client";
import React from "react";
import BatteriesList from "../../components/BatteriesList/BatteriesList";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MemberOnlyWrapper from "../../components/common/MemberOnlyWrapper";

export default function BatteriesPage() {
  return (
    <MemberOnlyWrapper>
      <div className="min-h-screen bg-white">
        <Header />
        <BatteriesList />
        <Footer />
      </div>
    </MemberOnlyWrapper>
  );
}
