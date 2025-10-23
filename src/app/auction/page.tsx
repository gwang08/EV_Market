"use client";
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import AuctionPage from "@/components/AuctionPage/AuctionPage"
import MemberOnlyWrapper from "../../components/common/MemberOnlyWrapper"

export default function Auction() {
  return (
    <MemberOnlyWrapper>
      <div className="bg-gray-50 min-h-screen">
        <Header />
        <main className="py-6">
          <AuctionPage />
        </main>
        <Footer />
      </div>
    </MemberOnlyWrapper>
  )
}

