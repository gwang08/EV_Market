"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Zap, Battery, Car, ShieldCheck } from "lucide-react";
import { LiveAuction } from "@/types/auction";
import { formatAuctionPrice, getTimeRemaining } from "@/services";

interface AuctionCardProps {
  auction: LiveAuction;
}

export default function AuctionCard({ auction }: AuctionCardProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(auction.auctionEndsAt));

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
    <Link
      href={`/auction/${auction.id}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-blue-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {auction.images && auction.images.length > 0 ? (
          <Image
            src={auction.images[0]}
            alt={auction.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="w-16 h-16 text-slate-300" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5" fill="currentColor" />
            LIVE AUCTION
          </span>
          {auction.isVerified && (
            <span className="px-3 py-1.5 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full shadow-lg flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified
            </span>
          )}
        </div>

        {/* Time Countdown */}
        <div className="absolute top-3 right-3">
          <div className="px-3 py-1.5 bg-slate-900/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {formatTimeLeft()}
          </div>
        </div>

        {/* Type Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold rounded-full shadow-md flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5" />
            {isVehicle ? "Vehicle" : "Battery"}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-4">
        {/* Title & Brand */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded">
              {auction.brand}
            </span>
            {auction.year && (
              <span className="text-xs text-slate-500">{auction.year}</span>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {auction.title}
          </h3>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-3 text-xs text-slate-600">
          {auction.capacity && (
            <div className="flex items-center gap-1">
              <Battery className="w-3.5 h-3.5" />
              <span>{auction.capacity} kWh</span>
            </div>
          )}
          {auction.health && (
            <div className="flex items-center gap-1">
              <div className="w-3.5 h-3.5 rounded-full bg-green-500/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              </div>
              <span>{auction.health}% Health</span>
            </div>
          )}
          {auction.mileage && (
            <div className="flex items-center gap-1">
              <span>{auction.mileage.toLocaleString()} km</span>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Starting Price</p>
              <p className="text-xl font-bold text-slate-900">
                {formatAuctionPrice(auction.startingPrice)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-0.5">Deposit</p>
              <p className="text-sm font-semibold text-blue-600">
                {formatAuctionPrice(auction.depositAmount)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-1 h-1 rounded-full bg-blue-500"></div>
            <span>Bid increment: {formatAuctionPrice(auction.bidIncrement)}</span>
          </div>
        </div>

        {/* Seller Info */}
        {auction.seller && (
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
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
          </div>
        )}
      </div>
    </Link>
  );
}
