"use client";
import { useParams } from "next/navigation";
import AuctionDetailPage from "@/components/AuctionPage/AuctionDetailPage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AuctionDetail() {
  const params = useParams();
  const auctionId = params.id as string;

  return (
    <>
      <Header />
      <AuctionDetailPage auctionId={auctionId} />;
      <Footer />
    </>
  );
}
