"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Clock, Zap, Battery, Car, ShieldCheck } from "lucide-react";
import { LiveAuction } from "@/types/auction";
import { formatAuctionPrice, getTimeRemaining } from "@/services";

interface AuctionCardProps {
  auction: LiveAuction;
}

export default function AuctionCard({ auction }: AuctionCardProps) {
  const [timeLeft, setTimeLeft] = useState(
    getTimeRemaining(auction.auctionEndsAt)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(auction.auctionEndsAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [auction.auctionEndsAt]);

  const formatTimeLeft = () => {
    if (timeLeft.isExpired) return "Đã kết thúc";
    if (timeLeft.days > 0) return `${timeLeft.days}d ${timeLeft.hours}h`;
    if (timeLeft.hours > 0) return `${timeLeft.hours}h ${timeLeft.minutes}m`;
    return `${timeLeft.minutes}m ${timeLeft.seconds}s`;
  };

  const isVehicle = auction.listingType === "VEHICLE";
  const Icon = isVehicle ? Car : Battery;

  return (
    <motion.div
      whileHover={{
        scale: 1.03,
        boxShadow: "0 8px 32px 0 rgba(59,130,246,0.10)",
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer border border-slate-100 hover:border-blue-300 flex flex-col h-full"
    >
      <Link href={`/auction/${auction.id}`} className="flex flex-col h-full">
        {/* Image Section */}
        <motion.div
          className="relative h-56 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {auction.images && auction.images.length > 0 ? (
            <Image
              src={auction.images[0]}
              alt={auction.title}
              fill
              className="object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/Homepage/TopCar.png";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon className="w-16 h-16 text-slate-300" />
            </div>
          )}
          {/* Badges */}
          <div className="absolute bottom-3 left-3 flex gap-2">
            <motion.span
              className="inline-flex items-center px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold shadow"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Zap className="w-3.5 h-3.5 mr-1" fill="currentColor" />
              LIVE
            </motion.span>
            {auction.isVerified && (
              <motion.span
                className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-600/90 text-white text-xs font-semibold shadow"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Verified
              </motion.span>
            )}
          </div>
          <div className="absolute bottom-3 right-3 flex gap-2">
            <motion.span
              className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-900/90 text-white text-xs font-bold shadow animate-pulse"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Clock className="w-3.5 h-3.5 mr-1" />
              {formatTimeLeft()}
            </motion.span>
            <motion.span
              className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/90 text-slate-700 text-xs font-semibold shadow"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <Icon className="w-3.5 h-3.5 mr-1" />
              {isVehicle ? "Vehicle" : "Battery"}
            </motion.span>
          </div>
        </motion.div>
        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-between p-6">
          {/* Title & Price */}
          <motion.div
            className="flex flex-col items-center mb-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
          >
            <h3
              className="font-semibold text-lg text-slate-900 text-center truncate w-full group-hover:text-blue-700 transition-colors duration-200"
              title={auction.title}
            >
              {auction.title}
            </h3>
            <span className="text-2xl font-bold text-indigo-700 group-hover:text-blue-700 transition-colors duration-200 mt-1">
              {formatAuctionPrice(auction.startingPrice)}
            </span>
          </motion.div>
          {/* Info row */}
          <motion.div
            className="flex justify-between items-center text-xs text-slate-500 mt-2 mb-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
          >
            <span>{auction.year}</span>
            <span>{auction.capacity ? `${auction.capacity} kWh` : "-"}</span>
            <span>{auction.health ? `${auction.health}% SoH` : "-"}</span>
            <span>{auction.brand}</span>
          </motion.div>
          {/* Pricing & Deposit */}
          <motion.div
            className="flex justify-between items-center mt-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.26 }}
          >
            <div className="flex flex-col items-start">
              <span className="text-xs text-slate-500">Deposit</span>
              <span className="text-sm font-semibold text-blue-600">
                {formatAuctionPrice(auction.depositAmount)}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-500">Bid increment</span>
              <span className="text-sm font-semibold text-slate-700">
                {formatAuctionPrice(auction.bidIncrement)}
              </span>
            </div>
          </motion.div>
          {/* Seller Info */}
          {auction.seller && (
            <motion.div
              className="pt-3 border-t border-slate-100 flex items-center gap-2 mt-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                {auction.seller.avatar ? (
                  <Image
                    src={auction.seller.avatar}
                    alt={auction.seller.name}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-semibold">
                    {auction.seller.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate">
                  {auction.seller.name}
                </p>
                <p className="text-xs text-slate-500">Seller</p>
              </div>
            </motion.div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
