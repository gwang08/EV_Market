"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Heart, Share2, Flag, Battery as BatteryIcon, Zap } from "lucide-react";
import colors from "../../Utils/Color";
import VerifiedBadge from "../common/VerifiedBadge";
import { useI18nContext } from "../../providers/I18nProvider";
import { useRouter } from "next/navigation";
import { Battery } from "../../services";
import { motion } from "framer-motion";

interface PinDetailHeroProps {
  battery: Battery;
}

function PinDetailHero({ battery }: PinDetailHeroProps) {
  const { t } = useI18nContext();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const router = useRouter();

  return (
    <div className="">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left Side - Images */}
          <div className="relative">
            <motion.div
              className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl overflow-hidden aspect-[4/3] shadow-xl group flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <Image
                src={battery.images[selectedImageIndex] || "/Homepage/Pin.png"}
                alt={battery.title}
                fill
                className="object-cover transition-all duration-300 group-hover:scale-105"
                unoptimized={true}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/Homepage/Pin.png";
                }}
                priority
              />

              {/* Badges */}
              <div className="absolute top-5 right-5 flex flex-col gap-2 z-10">
                {battery.isVerified && <VerifiedBadge width={81} height={20} />}
              </div>

              {/* Thumbnails inside main image */}
              {battery.images && battery.images.length > 1 && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3 bg-white/70 rounded-xl px-3 py-2 shadow backdrop-blur z-10">
                  {battery.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200
                        ${
                          selectedImageIndex === index
                            ? "border-blue-500 ring-2 ring-blue-400"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      style={{ outline: "none" }}
                      tabIndex={0}
                    >
                      <Image
                        src={image || "/Homepage/Pin.png"}
                        alt={`${battery.title} ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized={true}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/Homepage/Pin.png";
                        }}
                      />
                      {selectedImageIndex === index && (
                        <span className="absolute inset-0 rounded-lg ring-2 ring-blue-400 pointer-events-none" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Side - Details */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1
                className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent"
                style={{ letterSpacing: "-0.02em" }}
              >
                {battery.title} {battery.year && `(${battery.year})`}
              </h1>
              <div className="text-4xl font-bold text-indigo-700 drop-shadow-sm">
                {battery.price.toLocaleString()} VNĐ
              </div>
            </div>

            {/* Key Stats - Gọn gàng hơn */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[140px] bg-white/80 rounded-xl shadow p-4 flex flex-col items-center justify-center">
                <BatteryIcon size={20} className="text-blue-600 mb-1" />
                <span className="text-xs text-gray-500">
                  {t("vehicleDetail.capacity")}
                </span>
                <span className="text-lg font-bold text-blue-900">
                  {battery.capacity} kWh
                </span>
              </div>
              <div className="flex-1 min-w-[140px] bg-white/80 rounded-xl shadow p-4 flex flex-col items-center justify-center">
                <Zap size={20} className="text-blue-600 mb-1" />
                <span className="text-xs text-gray-500">
                  {t("vehicleDetail.voltage")}
                </span>
                <span className="text-lg font-bold text-blue-900">
                  {battery.specifications?.voltage || t("vehicleDetail.na")}
                </span>
              </div>
              <div className="flex-1 min-w-[140px] bg-green-50 rounded-xl shadow p-4 flex flex-col items-center justify-center">
                <span className="text-xs text-gray-500">
                  {t("vehicleDetail.health")}
                </span>
                <span className="text-lg font-bold text-green-600">
                  {battery.health}% {t("vehicleDetail.soh")}
                </span>
              </div>
            </div>

            {/* Battery Type */}
            <div className="p-5 bg-white/80 rounded-xl shadow">
              <div className="text-sm text-gray-600 mb-1">
                {t("vehicleDetail.batteryType")}
              </div>
              <div className="text-lg font-semibold text-blue-900">
                {battery.specifications?.chemistry || t("vehicleDetail.na")}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() =>
                  router.push(
                    `/checkout?listingId=${battery.id}&listingType=BATTERY`
                  )
                }
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
              >
                {t("vehicleDetail.buyNow")}
              </button>
              <button className="flex-1 border-2 border-blue-500 text-blue-700 hover:bg-white font-bold py-4 px-6 rounded-xl transition-colors duration-200">
                {t("vehicleDetail.makeOffer")}
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 border-2 rounded-xl transition-all duration-200 font-semibold
                  ${
                    isWishlisted
                      ? "border-red-500 text-red-500 bg-red-50"
                      : "border-gray-300 text-gray-700 hover:border-blue-400"
                  }`}
              >
                <Heart
                  size={18}
                  fill={isWishlisted ? "currentColor" : "none"}
                />
                {isWishlisted
                  ? t("vehicleDetail.saved")
                  : t("vehicleDetail.save")}
              </button>

              <button className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-gray-300 text-gray-700 hover:border-blue-400 rounded-xl transition-all duration-200 font-semibold">
                <Share2 size={18} />
                {t("vehicleDetail.share")}
              </button>

              <button className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-gray-300 text-gray-700 hover:border-blue-400 rounded-xl transition-all duration-200 font-semibold">
                <Flag size={18} />
                {t("vehicleDetail.report")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PinDetailHero;
