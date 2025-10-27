"use client";
import React from "react";
import WalletManagement from "../../components/WalletPage/WalletManagement";
import MemberOnlyWrapper from "../../components/common/MemberOnlyWrapper";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function WalletPage() {
  return (
    <MemberOnlyWrapper>
      <Header />
      <WalletManagement />
      <Footer />
    </MemberOnlyWrapper>
  );
}