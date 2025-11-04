"use client";
import { useParams } from "next/navigation";
import AuctionDetailPage from "@/components/AuctionPage/AuctionDetailPage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthWrapper from "@/components/common/AuthWrapper";
import SharedBackground from "@/components/Homepage/SharedBackground";

export default function AuctionDetail() {
  const params = useParams();
  const auctionId = params.id as string;

  return (
    <AuthWrapper>
      <SharedBackground>
        <Header />
        <AuctionDetailPage auctionId={auctionId} />
      </SharedBackground>
      <Footer />
    </AuthWrapper>
  );
}
