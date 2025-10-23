"use client";
import Header from "@/components/Header";
import PurchaseHistory from "../../components/PurchaseHistory/PurchaseHistory";
import Footer from "@/components/Footer";
import MemberOnlyWrapper from "../../components/common/MemberOnlyWrapper";

export default function PurchaseHistoryPage() {
  return (
    <MemberOnlyWrapper>
      <Header />
      <PurchaseHistory />
      <Footer />
    </MemberOnlyWrapper>
  );
}
