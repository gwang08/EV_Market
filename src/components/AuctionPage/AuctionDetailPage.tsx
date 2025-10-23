"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Clock,
  Zap,
  Battery,
  Car,
  ShieldCheck,
  User,
  Gavel,
  Wallet,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Info
} from "lucide-react";
import { LiveAuction } from "@/types/auction";
import {
  formatAuctionPrice,
  getTimeRemaining,
  placeBid,
  payDeposit,
  isAuthenticated,
  getAuctionDetail,
} from "@/services";
import { useI18nContext } from "@/providers/I18nProvider";
import { useToast } from "@/hooks/useToast";

interface AuctionDetailPageProps {
  auctionId: string;
}

export default function AuctionDetailPage({ auctionId }: AuctionDetailPageProps) {
  const { t } = useI18nContext();
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  
  const [auction, setAuction] = useState<LiveAuction | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, isExpired: false });
  
  // Bidding state
  const [bidAmount, setBidAmount] = useState(0);
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [isPayingDeposit, setIsPayingDeposit] = useState(false);
  const [hasDeposit, setHasDeposit] = useState(false);
  const [currentBid, setCurrentBid] = useState(0);
  
  const [activeTab, setActiveTab] = useState<"details" | "specs" | "bids">("details");

  useEffect(() => {
    const fetchAuctionDetail = async () => {
      try {
        setLoading(true);
        // Try VEHICLE first, then BATTERY if fails
        let data;
        try {
          data = await getAuctionDetail('VEHICLE', auctionId);
        } catch (error) {
          data = await getAuctionDetail('BATTERY', auctionId);
        }
        
        if (data && data.data) {
          const auctionData = data.data;
          setAuction(auctionData);
          setCurrentBid(auctionData.currentBid || auctionData.startingPrice);
          setBidAmount((auctionData.currentBid || auctionData.startingPrice) + auctionData.bidIncrement);
        }
      } catch (error) {
        showError(
          error instanceof Error ? error.message : 'Failed to load auction details'
        );
        console.error('Failed to fetch auction:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionDetail();
  }, [auctionId, showError]);

  useEffect(() => {
    if (!auction) return;
    
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(auction.auctionEndsAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [auction]);

  const handlePayDeposit = async () => {
    if (!isAuthenticated()) {
      showError(t("auctions.loginToDeposit"));
      router.push("/login");
      return;
    }

    if (!auction) return;

    try {
      setIsPayingDeposit(true);
      await payDeposit(
        auction.listingType,
        auction.id,
        { amount: auction.depositAmount }
      );
      setHasDeposit(true);
      showSuccess(t("auctions.depositSuccess"));
    } catch (error) {
      showError(
        error instanceof Error ? error.message : t("auctions.depositError")
      );
    } finally {
      setIsPayingDeposit(false);
    }
  };

  const handlePlaceBid = async () => {
    if (!isAuthenticated()) {
      showError(t("auctions.loginToBid"));
      router.push("/login");
      return;
    }

    if (!hasDeposit) {
      showError(t("auctions.depositRequired"));
      return;
    }

    if (!auction) return;

    if (bidAmount < currentBid + auction.bidIncrement) {
      showError(`Minimum bid is ${formatAuctionPrice(currentBid + auction.bidIncrement)}`);
      return;
    }

    try {
      setIsPlacingBid(true);
      await placeBid(auction.listingType, auction.id, { amount: bidAmount });
      setCurrentBid(bidAmount);
      setBidAmount(bidAmount + auction.bidIncrement);
      showSuccess(t("auctions.bidPlaced"));
    } catch (error) {
      showError(
        error instanceof Error ? error.message : t("auctions.bidError")
      );
    } finally {
      setIsPlacingBid(false);
    }
  };

  if (loading || !auction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  const isVehicle = auction.listingType === "VEHICLE";
  const Icon = isVehicle ? Car : Battery;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push("/auctions")}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{t("auctions.title", "Back to Auctions")}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              <div className="relative aspect-[16/10] bg-slate-100">
                {auction.images && auction.images.length > 0 ? (
                  <Image
                    src={auction.images[0]}
                    alt={auction.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon className="w-24 h-24 text-slate-300" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-2 backdrop-blur-sm">
                    <Zap className="w-4 h-4" fill="currentColor" />
                    LIVE AUCTION
                  </span>
                  {auction.isVerified && (
                    <span className="px-4 py-2 bg-blue-600/90 backdrop-blur-sm text-white text-sm font-semibold rounded-full shadow-lg flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      {t("common.verified")}
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {auction.images && auction.images.length > 1 && (
                <div className="p-4 grid grid-cols-4 gap-3">
                  {auction.images.slice(0, 4).map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border-2 border-slate-200 hover:border-blue-500 cursor-pointer transition-all">
                      <Image src={img} alt={`View ${idx + 1}`} fill className="object-cover" sizes="150px" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Quick Info */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-semibold rounded-full">
                      {auction.brand}
                    </span>
                    {auction.year && (
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-full">
                        {auction.year}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                    {auction.title}
                  </h1>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {auction.mileage && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">Mileage</p>
                    <p className="text-sm font-bold text-slate-900">{auction.mileage.toLocaleString()} km</p>
                  </div>
                )}
                {auction.capacity && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">Battery</p>
                    <p className="text-sm font-bold text-slate-900">{auction.capacity} kWh</p>
                  </div>
                )}
                {auction.health && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">Health</p>
                    <p className="text-sm font-bold text-green-600">{auction.health}%</p>
                  </div>
                )}
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Type</p>
                  <p className="text-sm font-bold text-slate-900">{isVehicle ? "Vehicle" : "Battery"}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-200">
                <div className="flex">
                  {[
                    { key: "details" as const, label: t("auctions.auctionDetails", "Details") },
                    { key: "specs" as const, label: t("auctions.specifications", "Specifications") },
                    { key: "bids" as const, label: t("auctions.biddingHistory", "Bidding History") },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.key
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {activeTab === "details" && (
                  <div className="prose max-w-none">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                      {auction.description}
                    </p>
                  </div>
                )}

                {activeTab === "specs" && auction.specifications && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(auction.specifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-sm font-semibold text-slate-900">{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "bids" && (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-500 mb-4">Recent bidding activity</p>
                    {/* Mock bid history */}
                    {[
                      { user: "Current High Bid", amount: currentBid, time: "Now" },
                    ].map((bid, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">{bid.user}</p>
                            <p className="text-xs text-slate-500">{bid.time}</p>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-blue-600">{formatAuctionPrice(bid.amount)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Seller Info */}
            {auction.seller && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">{t("vehicleDetail.sellerInfo")}</h3>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                    {auction.seller.avatar ? (
                      <Image
                        src={auction.seller.avatar}
                        alt={auction.seller.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-xl font-bold">
                        {auction.seller.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-slate-900">{auction.seller.name}</p>
                    <p className="text-sm text-slate-500">{t("vehicleDetail.sellerInfo", "Verified Seller")}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Bidding Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Countdown Timer */}
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium">{t("auctions.timeRemaining")}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { value: timeLeft.days, label: "Days" },
                    { value: timeLeft.hours, label: "Hrs" },
                    { value: timeLeft.minutes, label: "Mins" },
                    { value: timeLeft.seconds, label: "Secs" },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                      <div className="text-2xl font-bold">{String(item.value).padStart(2, "0")}</div>
                      <div className="text-xs opacity-80">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bidding Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{t("auctions.currentBid")}</p>
                  <p className="text-3xl font-bold text-slate-900">{formatAuctionPrice(currentBid)}</p>
                </div>

                {!hasDeposit ? (
                  <>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900 mb-1">{t("auctions.depositRequired")}</p>
                          <p className="text-xs text-blue-700">
                            Pay a deposit of {formatAuctionPrice(auction.depositAmount)} to start bidding
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handlePayDeposit}
                      disabled={isPayingDeposit}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isPayingDeposit ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t("wallet.processing")}
                        </>
                      ) : (
                        <>
                          <Wallet className="w-5 h-5" />
                          {t("auctions.payDeposit")} - {formatAuctionPrice(auction.depositAmount)}
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{t("auctions.depositPaid")}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t("auctions.bidAmount")}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(Number(e.target.value))}
                          min={currentBid + auction.bidIncrement}
                          step={auction.bidIncrement}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">VND</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        {t("auctions.minimumBid")}: {formatAuctionPrice(currentBid + auction.bidIncrement)}
                      </p>
                    </div>

                    <button
                      onClick={handlePlaceBid}
                      disabled={isPlacingBid || bidAmount < currentBid + auction.bidIncrement}
                      className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isPlacingBid ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t("wallet.processing")}
                        </>
                      ) : (
                        <>
                          <Gavel className="w-5 h-5" />
                          {t("auctions.placeBid")}
                        </>
                      )}
                    </button>
                  </>
                )}

                {/* Auction Info */}
                <div className="pt-4 border-t border-slate-200 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t("auctions.startingPrice")}</span>
                    <span className="font-semibold text-slate-900">{formatAuctionPrice(auction.startingPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t("auctions.bidIncrement")}</span>
                    <span className="font-semibold text-slate-900">{formatAuctionPrice(auction.bidIncrement)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
