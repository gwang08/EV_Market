"use client";
import { useParams } from "next/navigation";
import AuctionDetailPage from "@/components/AuctionPage/AuctionDetailPage";

export default function AuctionDetail() {
  const params = useParams();
  const auctionId = params.id as string;

  return <AuctionDetailPage auctionId={auctionId} />;
}
