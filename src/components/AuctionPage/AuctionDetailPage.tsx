"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  Info,
} from "lucide-react";
import { LiveAuction } from "@/types/auction";
import {
  formatAuctionPrice,
  getTimeRemaining,
  placeBid,
  payDeposit,
  getAuctionDetail,
} from "@/services";
import {
  payAuctionTransaction,
  getPendingAuctionTransaction,
} from "@/services/Transaction";
import { useI18nContext } from "@/providers/I18nProvider";
import { useToast } from "@/providers/ToastProvider";
import { useCurrencyInput } from "@/hooks/useCurrencyInput";
import { supabase } from "@/lib/supabase";

interface AuctionDetailPageProps {
  auctionId: string;
}

// Helper function to format date without timezone conversion
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// Helper function to map server errors to localized messages
const getLocalizedErrorMessage = (
  serverMessage: string,
  t: any,
  context: "deposit" | "bid"
): string => {
  const lowerMessage = serverMessage.toLowerCase();

  // Insufficient balance
  if (
    lowerMessage.includes("insufficient") ||
    lowerMessage.includes("not enough") ||
    lowerMessage.includes("balance")
  ) {
    return t(
      "auctions.errors.insufficientBalance",
      "Số dư không đủ để thực hiện giao dịch"
    );
  }

  // Deposit errors
  if (context === "deposit") {
    if (lowerMessage.includes("already") && lowerMessage.includes("deposit")) {
      return t(
        "auctions.errors.alreadyDeposited",
        "Bạn đã đặt cọc cho phiên đấu giá này"
      );
    }
    if (
      lowerMessage.includes("auction") &&
      (lowerMessage.includes("ended") || lowerMessage.includes("expired"))
    ) {
      return t(
        "auctions.errors.auctionAlreadyEnded",
        "Phiên đấu giá đã kết thúc"
      );
    }
    if (lowerMessage.includes("not") && lowerMessage.includes("start")) {
      return t(
        "auctions.errors.auctionNotStarted",
        "Phiên đấu giá chưa bắt đầu"
      );
    }
  }

  // Bid errors
  if (context === "bid") {
    if (
      lowerMessage.includes("must pay") ||
      (lowerMessage.includes("deposit") && lowerMessage.includes("before"))
    ) {
      return t(
        "auctions.errors.depositRequiredError",
        "Bạn phải đặt cọc trước khi đấu giá"
      );
    }
    if (lowerMessage.includes("cannot bid") && lowerMessage.includes("own")) {
      return t(
        "auctions.errors.ownAuctionError",
        "Bạn không thể đấu giá sản phẩm của chính mình"
      );
    }
    if (lowerMessage.includes("already") && lowerMessage.includes("highest")) {
      return t(
        "auctions.errors.alreadyHighestBidder",
        "Bạn đã là người đặt giá cao nhất"
      );
    }
    if (
      lowerMessage.includes("must be at least") ||
      lowerMessage.includes("minimum bid")
    ) {
      return t("auctions.errors.bidTooLow", "Giá đấu thấp hơn mức tối thiểu");
    }
  }

  // Network/Server errors
  if (
    lowerMessage.includes("network") ||
    lowerMessage.includes("fetch") ||
    lowerMessage.includes("timeout")
  ) {
    return t("auctions.errors.networkError", "Lỗi kết nối. Vui lòng thử lại");
  }

  if (
    lowerMessage.includes("unauthorized") ||
    lowerMessage.includes("authentication")
  ) {
    return t(
      "auctions.errors.unauthorized",
      "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại"
    );
  }

  // Default error
  return t(
    context === "deposit"
      ? "auctions.errors.depositFailed"
      : "auctions.errors.bidFailed",
    context === "deposit" ? "Đặt cọc thất bại" : "Đấu giá thất bại"
  );
};

export default function AuctionDetailPage({
  auctionId,
}: AuctionDetailPageProps) {
  const { t } = useI18nContext();
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();

  const [auction, setAuction] = useState<LiveAuction | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
    isExpired: false,
  });

  // Bidding state with currency formatting
  const bidAmountInput = useCurrencyInput("");
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [isPayingDeposit, setIsPayingDeposit] = useState(false);
  const [isPayingAuction, setIsPayingAuction] = useState(false);
  const [hasDeposit, setHasDeposit] = useState(false);
  const [currentBid, setCurrentBid] = useState(0);
  const [isNewBidFlash, setIsNewBidFlash] = useState(false);

  const [activeTab, setActiveTab] = useState<"details" | "specs" | "bids">(
    "details"
  );

  // Check if auction has started
  const isAuctionStarted = () => {
    if (!auction?.auctionStartsAt) return true; // Default to true if no start time
    // Remove 'Z' to parse as local time
    return new Date() >= new Date(auction.auctionStartsAt.replace("Z", ""));
  };

  useEffect(() => {
    const fetchAuctionDetail = async () => {
      try {
        setLoading(true);
        // Try VEHICLE first, then BATTERY if fails
        let data;
        let listingType: "VEHICLE" | "BATTERY" = "VEHICLE";
        try {
          data = await getAuctionDetail("VEHICLE", auctionId);
          listingType = "VEHICLE";
        } catch (error) {
          data = await getAuctionDetail("BATTERY", auctionId);
          listingType = "BATTERY";
        }

        if (data && data.data) {
          const auctionData = data.data;

          // Add listingType to auction data
          auctionData.listingType = listingType;

          // Calculate current bid from bids array
          const highestBid =
            auctionData.bids && auctionData.bids.length > 0
              ? Math.max(...auctionData.bids.map((bid: any) => bid.amount))
              : auctionData.startingPrice;

          auctionData.currentBid = highestBid;

          // Check if user has already paid deposit from API response
          const hasDeposit =
            auctionData.hasUserDeposit === true ||
            auctionData.userDeposit?.status === "PAID";

          setAuction(auctionData);
          setCurrentBid(highestBid);
          bidAmountInput.setValue(
            String(highestBid + auctionData.bidIncrement)
          );
          setHasDeposit(hasDeposit);

          console.log("✅ Auction data loaded:", {
            id: auctionId,
            type: listingType,
            title: auctionData.title,
            currentBid: highestBid,
            userAuctionResult: auctionData.userAuctionResult,
            hasUserDeposit: auctionData.hasUserDeposit,
            auctionEndsAt: auctionData.auctionEndsAt,
            totalBids: auctionData.bids?.length || 0,
          });
        }
      } catch (error) {
        showError(
          error instanceof Error
            ? error.message
            : "Failed to load auction details"
        );
        console.error("Failed to fetch auction:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionDetail();
  }, [auctionId, showError]);

  useEffect(() => {
    if (!auction) return;

    const timer = setInterval(() => {
      // Parse auction times như local time (remove 'Z' để không bị convert timezone)
      const startTime = new Date(auction.auctionStartsAt.replace("Z", ""));
      const endTime = new Date(auction.auctionEndsAt.replace("Z", ""));
      const now = new Date();

      // If auction hasn't started yet, countdown to start time
      if (now < startTime) {
        const remaining = getTimeRemaining(auction.auctionStartsAt);
        setTimeLeft(remaining);
      } else {
        // If auction has started, countdown to end time
        const remaining = getTimeRemaining(auction.auctionEndsAt);
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [auction]);

  // Realtime bidding subscription
  useEffect(() => {
    console.log(
      "🔄 Realtime effect triggered. Auction:",
      auction ? "loaded" : "not loaded",
      "ID:",
      auctionId
    );

    if (!auction) {
      console.log("⏸️ Auction not loaded yet, skipping subscription");
      return;
    }

    console.log("🔌 Setting up realtime subscription for auction:", auctionId);
    console.log("📊 Auction type:", auction.listingType);

    // Save listing type for client-side filtering
    const listingType = auction.listingType;

    console.log("🔍 Subscribing to all Bid events - client-side filtering");

    // Create a channel with server-side filtering
    const channel = supabase
      .channel(`auction-${auctionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Bid",
        },
        (payload) => {
          console.log("� Received payload:", payload);

          const newBid = payload.new as any;

          // Update current bid with the new bid amount
          if (newBid && typeof newBid.amount === "number") {
            const newBidAmount = newBid.amount;

            console.log("💰 New bid amount:", newBidAmount);

            setCurrentBid(newBidAmount);

            // Trigger flash animation
            setIsNewBidFlash(true);
            setTimeout(() => setIsNewBidFlash(false), 2000);

            // Update the bid input to next increment using the current auction data
            setAuction((prev) => {
              if (!prev) return prev;

              // Update bid input
              const nextBidAmount = newBidAmount + (prev.bidIncrement || 0);
              bidAmountInput.setValue(String(nextBidAmount));

              // Create a properly typed Bid object
              const bidEntry: any = {
                id: newBid.id || "",
                amount: newBid.amount,
                createdAt: newBid.createdAt || new Date().toISOString(),
                bidderId: newBid.bidderId || "",
                vehicleId: newBid.vehicleId || null,
                batteryId: newBid.batteryId || null,
                bidder: newBid.bidder,
              };

              return {
                ...prev,
                currentBid: newBidAmount,
                bids: [...(prev.bids || []), bidEntry],
              };
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("📡 Subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log(
            "✅ Successfully subscribed to Bid table (client-side filtering)"
          );
        } else if (status === "CHANNEL_ERROR") {
          console.error(
            "❌ Channel error - check Supabase Replication settings"
          );
        } else if (status === "TIMED_OUT") {
          console.error("⏱️ Subscription timed out");
        } else if (status === "CLOSED") {
          console.log("🔒 Channel closed");
        }
      });

    // Cleanup: unsubscribe when component unmounts or auction changes
    return () => {
      console.log("🧹 Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [auctionId, auction?.listingType]); // Depend on auctionId and listingType

  const handlePayDeposit = async () => {
    if (!auction || !auction.listingType) return;

    try {
      setIsPayingDeposit(true);
      const result = await payDeposit(auction.listingType, auction.id, {
        amount: auction.depositAmount,
      });

      // If no error thrown, deposit was successful
      setHasDeposit(true);
      showSuccess(t("auctions.depositSuccess", "Đặt cọc thành công!"));
    } catch (error) {
      console.error("❌ Deposit Error Details:", {
        error,
        message: error instanceof Error ? error.message : "Unknown",
        type: typeof error,
        errorObject: error,
      });

      const errorMessage =
        error instanceof Error
          ? error.message
          : t("auctions.errors.depositFailed", "Đặt cọc thất bại");

      const localizedError = getLocalizedErrorMessage(
        errorMessage,
        t,
        "deposit"
      );

      // Check for insufficient balance to show wallet link
      if (
        errorMessage.toLowerCase().includes("insufficient") ||
        errorMessage.toLowerCase().includes("not enough") ||
        errorMessage.toLowerCase().includes("balance")
      ) {
        showError(
          localizedError,
          6000,
          t("auctions.errors.goToWallet", "Nạp tiền"),
          () => router.push("/wallet")
        );
      } else {
        showError(localizedError);
      }
    } finally {
      setIsPayingDeposit(false);
    }
  };

  const handlePlaceBid = async () => {
    if (!hasDeposit) {
      showError(
        t(
          "auctions.errors.depositRequiredError",
          "Bạn phải đặt cọc trước khi đấu giá"
        )
      );
      return;
    }

    if (!auction || !auction.listingType) return;

    const bidValue = Number(bidAmountInput.rawValue);
    if (bidValue < currentBid + auction.bidIncrement) {
      showError(
        t(
          "auctions.errors.bidTooLow",
          "Giá đấu thấp hơn mức tối thiểu"
        ).replace(
          "{amount}",
          formatAuctionPrice(currentBid + auction.bidIncrement)
        )
      );
      return;
    }

    try {
      setIsPlacingBid(true);
      await placeBid(auction.listingType, auction.id, { amount: bidValue });

      // If no error thrown, bid was successful
      setCurrentBid(bidValue);
      bidAmountInput.setValue(String(bidValue + auction.bidIncrement));
      showSuccess(t("auctions.bidPlaced", "Đặt giá thành công!"));
    } catch (error) {
      console.error("❌ Bid Error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("auctions.errors.bidFailed", "Đấu giá thất bại");
      const localizedError = getLocalizedErrorMessage(errorMessage, t, "bid");

      // Check for insufficient balance to show wallet link
      if (
        errorMessage.toLowerCase().includes("insufficient") ||
        errorMessage.toLowerCase().includes("not enough") ||
        errorMessage.toLowerCase().includes("balance")
      ) {
        showError(
          localizedError,
          6000,
          t("auctions.errors.goToWallet", "Nạp tiền"),
          () => router.push("/wallet")
        );
      } else {
        showError(localizedError);
      }
    } finally {
      setIsPlacingBid(false);
    }
  };

  const handlePayAuction = async (transactionId: string) => {
    try {
      setIsPayingAuction(true);

      console.log("💰 Initiating auction payment:", {
        transactionId,
        auctionId: auction?.id,
        auctionTitle: auction?.title,
        finalPrice: currentBid || auction?.startingPrice,
        userAuctionResult: auction?.userAuctionResult,
      });

      const response = await payAuctionTransaction(transactionId, {
        paymentMethod: "WALLET",
      });

      console.log("✅ Payment response:", response);

      if (response.data.paymentGateway === "WALLET") {
        showSuccess(t("auctions.paymentSuccess", "Thanh toán thành công!"));
        // Refresh auction details
        const listingType = auction?.listingType;
        if (listingType) {
          const { data } = await getAuctionDetail(listingType, auctionId);
          setAuction(data);
          console.log("🔄 Auction refreshed after payment:", data);
        }
      } else if (response.data.paymentDetail?.payUrl) {
        console.log(
          "🔗 Redirecting to payment gateway:",
          response.data.paymentDetail.payUrl
        );
        // Redirect to payment gateway
        window.location.href = response.data.paymentDetail.payUrl;
      }
    } catch (error) {
      console.error("❌ Payment Error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("auctions.errors.paymentFailed", "Thanh toán thất bại");

      // Check for insufficient balance
      if (
        errorMessage.toLowerCase().includes("insufficient") ||
        errorMessage.toLowerCase().includes("not enough") ||
        errorMessage.toLowerCase().includes("balance")
      ) {
        showError(
          t(
            "auctions.errors.insufficientBalance",
            "Số dư không đủ để thanh toán"
          ),
          6000,
          t("auctions.errors.goToWallet", "Nạp tiền"),
          () => router.push("/wallet")
        );
      } else {
        showError(errorMessage);
      }
    } finally {
      setIsPayingAuction(false);
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
    <div className="min-h-screen pt-25 w-full bg-transparent">
      {/* Compact Header */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 pt-6 pb-4">
        <motion.button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors group"
          whileHover={{ x: -4 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeft className="w-5 h-5 group-hover:text-blue-600" />
          <span className="font-semibold">Back to Auctions</span>
        </motion.button>

        <div className="flex items-center gap-3">
          <motion.div
            className="px-4 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Zap className="w-3.5 h-3.5" fill="currentColor" />
            LIVE
          </motion.div>
          {auction.isVerified && (
            <motion.div
              className="px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-full shadow-md flex items-center gap-1.5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified
            </motion.div>
          )}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image Gallery */}
            <motion.div
              className="bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/40 shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-50 via-white to-blue-50">
                {auction.images && auction.images.length > 0 ? (
                  <Image
                    src={auction.images[0]}
                    alt={auction.title}
                    fill
                    className="object-contain p-8 drop-shadow-2xl"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon className="w-24 h-24 text-slate-300" />
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {auction.images && auction.images.length > 1 && (
                <div className="p-4 grid grid-cols-4 gap-3 bg-gradient-to-r from-slate-50 to-blue-50">
                  {auction.images.slice(0, 4).map((img, idx) => (
                    <motion.div
                      key={idx}
                      className="relative aspect-video rounded-xl overflow-hidden border-2 border-slate-200 hover:border-blue-400 cursor-pointer transition-all shadow-sm hover:shadow-md"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Image
                        src={img}
                        alt={`View ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="150px"
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Title and Info Card */}
            <motion.div
              className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/40 p-6 shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-full">
                    {auction.brand}
                  </span>
                  {auction.year && (
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
                      {auction.year}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Icon className="w-3 h-3" />
                    {isVehicle ? "Vehicle" : "Battery"}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  {auction.title}
                </h1>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {auction.mileage && (
                  <motion.div
                    className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm"
                    whileHover={{ scale: 1.03, y: -2 }}
                  >
                    <p className="text-xs text-blue-600 font-semibold mb-1">
                      Mileage
                    </p>
                    <p className="text-base font-bold text-slate-900">
                      {auction.mileage.toLocaleString()} km
                    </p>
                  </motion.div>
                )}
                {auction.capacity && (
                  <motion.div
                    className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 shadow-sm"
                    whileHover={{ scale: 1.03, y: -2 }}
                  >
                    <p className="text-xs text-green-600 font-semibold mb-1">
                      Battery
                    </p>
                    <p className="text-base font-bold text-slate-900">
                      {auction.capacity} kWh
                    </p>
                  </motion.div>
                )}
                {auction.health && (
                  <motion.div
                    className="p-3 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl border border-green-100 shadow-sm"
                    whileHover={{ scale: 1.03, y: -2 }}
                  >
                    <p className="text-xs text-green-600 font-semibold mb-1">
                      Health
                    </p>
                    <p className="text-base font-bold text-green-600">
                      {auction.health}%
                    </p>
                  </motion.div>
                )}
                <motion.div
                  className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 shadow-sm"
                  whileHover={{ scale: 1.03, y: -2 }}
                >
                  <p className="text-xs text-purple-600 font-semibold mb-1">
                    Type
                  </p>
                  <p className="text-base font-bold text-slate-900">
                    {isVehicle ? "Vehicle" : "Battery"}
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
              className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
                <div className="flex">
                  {[
                    {
                      key: "details" as const,
                      label: t("auctions.auctionDetails", "Details"),
                    },
                    {
                      key: "specs" as const,
                      label: t("auctions.specifications", "Specifications"),
                    },
                    {
                      key: "bids" as const,
                      label: t("auctions.biddingHistory", "Bidding History"),
                    },
                  ].map((tab) => (
                    <motion.button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 px-6 py-3 text-sm font-semibold border-b-2 transition-all ${
                        activeTab === tab.key
                          ? "border-blue-600 text-blue-600 bg-white/70"
                          : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/50"
                      }`}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {tab.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.div
                className="p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "details" && (
                  <motion.div
                    className="prose max-w-none"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                      {auction.description}
                    </p>
                  </motion.div>
                )}

                {activeTab === "specs" && auction.specifications && (
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {Object.entries(auction.specifications).map(
                      ([key, value], index) => {
                        // Handle nested objects (like warranty, dimensions, etc.)
                        const displayValue =
                          typeof value === "object" && value !== null
                            ? Object.entries(value)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(", ")
                            : String(value);

                        return (
                          <motion.div
                            key={key}
                            className="flex items-start justify-between p-3 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200 shadow-sm"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.03 }}
                            whileHover={{
                              scale: 1.01,
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                            }}
                          >
                            <span className="text-sm text-blue-700 capitalize font-semibold">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </span>
                            <span className="text-sm text-slate-900 text-right max-w-[60%] font-medium">
                              {displayValue}
                            </span>
                          </motion.div>
                        );
                      }
                    )}
                  </motion.div>
                )}

                {activeTab === "bids" && (
                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {auction.bids && auction.bids.length > 0 ? (
                      <>
                        <p className="text-sm text-slate-500 mb-3">
                          {auction.bids.length}{" "}
                          {t(
                            auction.bids.length === 1
                              ? "auctions.bidPlacedSingular"
                              : "auctions.bidsPlaced",
                            auction.bids.length === 1
                              ? "bid placed"
                              : "bids placed"
                          )}
                        </p>
                        {auction.bids
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt).getTime() -
                              new Date(a.createdAt).getTime()
                          )
                          .map((bid, idx) => (
                            <motion.div
                              key={bid.id}
                              className={`flex items-center justify-between p-3 rounded-xl border shadow-sm ${
                                idx === 0
                                  ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                                  : "bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200"
                              }`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: idx * 0.05 }}
                              whileHover={{
                                scale: 1.01,
                                boxShadow:
                                  idx === 0
                                    ? "0 6px 16px rgba(34, 197, 94, 0.15)"
                                    : "0 4px 12px rgba(0, 0, 0, 0.05)",
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <motion.div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center ${
                                    idx === 0 ? "bg-green-100" : "bg-blue-100"
                                  }`}
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                >
                                  {idx === 0 ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <User className="w-4 h-4 text-blue-600" />
                                  )}
                                </motion.div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {bid.bidder?.name ||
                                      `${t(
                                        "auctions.bidder",
                                        "Bidder"
                                      )} ${bid.bidderId.slice(0, 8)}...`}
                                    {idx === 0 && (
                                      <span className="ml-2 text-green-600 font-bold text-xs">
                                        •{" "}
                                        {t(
                                          "auctions.highestBid",
                                          "Highest Bid"
                                        )}
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {formatDateTime(bid.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <p
                                className={`text-base font-bold ${
                                  idx === 0 ? "text-green-600" : "text-blue-600"
                                }`}
                              >
                                {formatAuctionPrice(bid.amount)}
                              </p>
                            </motion.div>
                          ))}
                      </>
                    ) : (
                      <motion.div
                        className="text-center py-8"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Gavel className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">
                          {t(
                            "auctions.noBidsYet",
                            "No bids placed yet. Be the first to bid!"
                          )}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </motion.div>

            {/* Seller Info */}
            {auction.seller && (
              <motion.div
                className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/40 p-5 shadow-xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  {t("vehicleDetail.sellerInfo")}
                </h3>
                <div className="flex items-center gap-3">
                  <motion.div
                    className="relative w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 flex-shrink-0 shadow-md"
                    whileHover={{ scale: 1.05, rotate: 3 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {auction.seller.avatar ? (
                      <Image
                        src={auction.seller.avatar}
                        alt={auction.seller.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-blue-600 text-lg font-bold">
                        {auction.seller.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-base font-bold text-slate-900">
                      {auction.seller.name}
                    </p>
                    <p className="text-sm text-blue-600 font-medium">
                      {t("vehicleDetail.sellerInfo", "Verified Seller")}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Bidding Panel */}
          <div className="lg:col-span-1">
            <motion.div
              className="sticky top-24 space-y-4"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Countdown Timer */}
              <motion.div
                className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-3xl p-5 text-white shadow-xl"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 16px 32px rgba(245, 158, 11, 0.25)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Clock className="w-4 h-4" />
                  </motion.div>
                  <span className="text-xs font-semibold">
                    {!isAuctionStarted()
                      ? t(
                          "auctions.timeUntilStart",
                          "Thời gian đến khi bắt đầu"
                        )
                      : t("auctions.timeRemaining")}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center mb-3">
                  {[
                    { value: timeLeft.days, label: "Days" },
                    { value: timeLeft.hours, label: "Hrs" },
                    { value: timeLeft.minutes, label: "Mins" },
                    { value: timeLeft.seconds, label: "Secs" },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      className="bg-white/20 backdrop-blur-sm rounded-xl p-2 shadow-md"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      <div className="text-xl font-bold">
                        {String(item.value).padStart(2, "0")}
                      </div>
                      <div className="text-[10px] opacity-80 font-medium">
                        {item.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
                {/* Auction Start Time */}
                <div className="pt-3 border-t border-white/30 text-[11px] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="opacity-90 font-medium">
                      {!isAuctionStarted()
                        ? t("auctions.willStart", "Sẽ bắt đầu")
                        : t("auctions.started", "Đã bắt đầu")}
                      :
                    </span>
                    <span className="font-bold">
                      {formatDateTime(auction.auctionStartsAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-90 font-medium">
                      {!isAuctionStarted()
                        ? t("auctions.willEnd", "Sẽ kết thúc")
                        : t("auctions.endTime", "Kết thúc")}
                      :
                    </span>
                    <span className="font-bold">
                      {formatDateTime(auction.auctionEndsAt)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Bidding Card */}
              <motion.div
                className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/40 p-5 shadow-xl space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <motion.div
                  className={`transition-all duration-500 ${
                    isNewBidFlash
                      ? "bg-gradient-to-br from-green-50 to-emerald-50 -m-5 p-5 rounded-3xl"
                      : ""
                  }`}
                  animate={isNewBidFlash ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-xs text-slate-500 mb-1 font-medium">
                    {t("auctions.currentBid")}
                  </p>
                  <motion.p
                    className={`text-2xl font-bold transition-all duration-500 ${
                      isNewBidFlash ? "text-green-600" : "text-slate-900"
                    }`}
                    animate={isNewBidFlash ? { scale: [1, 1.08, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {formatAuctionPrice(currentBid)}
                  </motion.p>
                  {isNewBidFlash && (
                    <motion.p
                      className="text-xs text-green-600 mt-2 font-semibold flex items-center gap-1"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <span className="text-sm">🔥</span>{" "}
                      {t("auctions.newBid", "New bid placed!")}
                    </motion.p>
                  )}
                </motion.div>

                {timeLeft.isExpired ? (
                  /* 
                    Auction Ended - Show result based on userAuctionResult
                    
                    FLOW LOGIC:
                    ===========
                    Backend API trả về trường "userAuctionResult" với các giá trị:
                    
                    1. "WON" - Người dùng THẮNG đấu giá:
                       - Là người đặt giá cao nhất khi auction kết thúc
                       - Action: Phải thanh toán số tiền bid cuối cùng
                       - UI: Hiển thị nút "Thanh toán ngay"
                       - Payment flow: 
                         * Click button → Tìm pending transaction
                         * Gọi API /transactions/{id}/pay với paymentMethod: WALLET
                         * Nếu thành công → Hoàn tất mua hàng
                         * Nếu thiếu tiền → Link đến wallet để nạp tiền
                    
                    2. "LOST" - Người dùng THUA đấu giá:
                       - Đã đặt bid nhưng không phải người cao nhất
                       - Action: KHÔNG CẦN làm gì, backend tự động hoàn tiền cọc
                       - UI: Hiển thị thông báo "Tiền cọc sẽ được hoàn trả"
                    
                    3. "NO_BIDS" - Đã đặt cọc nhưng KHÔNG ĐẶT GIÁ:
                       - User đã pay deposit nhưng không bid lần nào
                       - Action: KHÔNG CẦN làm gì, backend tự động hoàn tiền cọc
                       - UI: Hiển thị thông báo "Tiền cọc sẽ được hoàn trả"
                    
                    4. null - CHƯA THAM GIA:
                       - User chưa đặt cọc cho auction này
                       - Action: Không có action nào
                       - UI: Chỉ hiển thị "Đấu giá đã kết thúc"
                    
                    Backend tự động xử lý:
                    - Xác định winner dựa trên highest bid
                    - Tạo transaction cho winner (status: PENDING)
                    - Hoàn tiền deposit cho losers (status: REFUNDED)
                    - Update vehicle/battery status
                  */
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    {auction.userAuctionResult === "WON" ? (
                      /* Winner - Show payment option */
                      <>
                        <motion.div
                          className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl shadow-lg"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-base font-bold text-green-900 mb-1">
                                🎉{" "}
                                {t(
                                  "auctions.congratulations",
                                  "Chúc mừng! Bạn đã thắng đấu giá!"
                                )}
                              </p>
                              <p className="text-sm text-green-700">
                                {t(
                                  "auctions.winnerMessage",
                                  "Vui lòng thanh toán để hoàn tất giao dịch"
                                )}
                              </p>
                              <p className="text-lg font-bold text-green-900 mt-2">
                                {t("auctions.finalPrice", "Giá cuối")}:{" "}
                                {formatAuctionPrice(
                                  currentBid || auction.startingPrice
                                )}
                              </p>
                            </div>
                          </div>
                        </motion.div>

                        <motion.button
                          onClick={async () => {
                            try {
                              setIsPayingAuction(true);
                              // Get pending transaction for this item
                              const itemType =
                                auction.listingType === "VEHICLE"
                                  ? "vehicle"
                                  : "battery";
                              const transaction =
                                await getPendingAuctionTransaction(
                                  auction.id,
                                  itemType
                                );

                              if (!transaction) {
                                showError(
                                  t(
                                    "auctions.errors.transactionNotFound",
                                    "Không tìm thấy giao dịch"
                                  )
                                );
                                return;
                              }

                              await handlePayAuction(transaction.id);
                            } catch (error) {
                              console.error("Payment error:", error);
                            } finally {
                              setIsPayingAuction(false);
                            }
                          }}
                          disabled={isPayingAuction}
                          className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isPayingAuction ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              {t("wallet.processing", "Đang xử lý...")}
                            </>
                          ) : (
                            <>
                              <Wallet className="w-5 h-5" />
                              {t("auctions.payNow", "Thanh toán ngay")}
                            </>
                          )}
                        </motion.button>
                      </>
                    ) : auction.userAuctionResult === "LOST" ? (
                      /* Lost - Show refund message */
                      <motion.div
                        className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-yellow-900 mb-1">
                              {t(
                                "auctions.auctionLost",
                                "Rất tiếc! Bạn đã không thắng đấu giá"
                              )}
                            </p>
                            <p className="text-xs text-yellow-700">
                              {t(
                                "auctions.depositRefunded",
                                "Tiền cọc sẽ được hoàn trả vào ví của bạn"
                              )}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ) : auction.userAuctionResult === "NO_BIDS" ? (
                      /* No bids - Show refund message */
                      <motion.div
                        className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-blue-900 mb-1">
                              {t(
                                "auctions.noBidsPlaced",
                                "Bạn chưa đặt giá nào"
                              )}
                            </p>
                            <p className="text-xs text-blue-700">
                              {t(
                                "auctions.depositRefunded",
                                "Tiền cọc sẽ được hoàn trả vào ví của bạn"
                              )}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      /* Default - Just auction ended */
                      <motion.div
                        className="p-4 bg-gradient-to-br from-gray-50 to-slate-100 border border-gray-200 rounded-2xl"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 mb-1">
                              {t("auctions.auctionEnded")}
                            </p>
                            <p className="text-xs text-gray-600">
                              {t("auctions.auctionEndedDesc")}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ) : !hasDeposit ? (
                  <>
                    {!isAuctionStarted() ? (
                      <motion.div
                        className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl shadow-sm"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-yellow-900 mb-1">
                              {t("auctions.auctionNotStarted")}
                            </p>
                            <p className="text-xs text-yellow-700">
                              {t("auctions.auctionNotStartedDesc")}{" "}
                              {formatDateTime(auction.auctionStartsAt)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl shadow-sm"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-blue-900 mb-1">
                              {t("auctions.depositRequired")}
                            </p>
                            <p className="text-xs text-blue-700">
                              {t(
                                "auctions.depositMessagePart1",
                                "Pay a deposit of"
                              )}{" "}
                              {formatAuctionPrice(auction.depositAmount)}{" "}
                              {t(
                                "auctions.depositMessagePart2",
                                "to start bidding"
                              )}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <motion.button
                      onClick={handlePayDeposit}
                      disabled={isPayingDeposit || !isAuctionStarted()}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isPayingDeposit ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t("wallet.processing")}
                        </>
                      ) : !isAuctionStarted() ? (
                        <>
                          <Clock className="w-5 h-5" />
                          {t("auctions.notStartedYet")}
                        </>
                      ) : (
                        <>
                          <Wallet className="w-5 h-5" />
                          {t("auctions.payDeposit")} -{" "}
                          {formatAuctionPrice(auction.depositAmount)}
                        </>
                      )}
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.div
                      className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl shadow-sm"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-semibold">
                          {t("auctions.depositPaid")}
                        </span>
                      </div>
                    </motion.div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {t("auctions.bidAmount")}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={bidAmountInput.displayValue}
                          onChange={(e) =>
                            bidAmountInput.handleChange(e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-bold bg-white/50 backdrop-blur-sm transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                          VND
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 font-medium">
                        {t("auctions.minimumBid")}:{" "}
                        {formatAuctionPrice(currentBid + auction.bidIncrement)}
                      </p>
                    </div>

                    <motion.button
                      onClick={handlePlaceBid}
                      disabled={
                        isPlacingBid ||
                        Number(bidAmountInput.rawValue) <
                          currentBid + auction.bidIncrement ||
                        timeLeft.isExpired
                      }
                      className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
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
                    </motion.button>
                  </>
                )}

                {/* Auction Info */}
                <div className="pt-4 border-t border-blue-200 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">
                      {t("auctions.startingPrice")}
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatAuctionPrice(auction.startingPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">
                      {t("auctions.bidIncrement")}
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatAuctionPrice(auction.bidIncrement)}
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
