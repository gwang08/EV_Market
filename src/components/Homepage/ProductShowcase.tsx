"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useI18nContext } from "../../providers/I18nProvider";
import { getVehicles, Vehicle } from "../../services/Vehicle";
import { removeBackground } from "@imgly/background-removal";

function ProductShowcase() {
  const { t } = useI18nContext();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processedImages, setProcessedImages] = useState<Map<string, string>>(
    new Map()
  );
  const [processingImage, setProcessingImage] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        // Chỉ lấy trang đầu tiên với limit 10
        const response = await getVehicles(1, 10);
        if (response.success && response.data?.vehicles) {
          // Lấy 5 xe có giá cao nhất
          const topExpensiveVehicles = response.data.vehicles
            .sort((a, b) => b.price - a.price)
            .slice(0, 5);
          setVehicles(topExpensiveVehicles);
        }
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // Remove background from current vehicle image
  useEffect(() => {
    const processCurrentImage = async () => {
      if (!currentVehicle?.images?.[0]) return;

      const imageUrl = currentVehicle.images[0];

      // Check if already processed
      if (processedImages.has(imageUrl)) return;

      setProcessingImage(true);
      try {
        // Remove background
        const blob = await removeBackground(imageUrl);

        // Convert blob to data URL
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          setProcessedImages((prev) => new Map(prev).set(imageUrl, dataUrl));
          setProcessingImage(false);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Failed to remove background:", error);
        setProcessingImage(false);
        // Use original image on error
        setProcessedImages((prev) => new Map(prev).set(imageUrl, imageUrl));
      }
    };

    processCurrentImage();
  }, [currentIndex, vehicles]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? vehicles.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === vehicles.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  const currentVehicle = vehicles[currentIndex];
  const currentImageUrl = currentVehicle?.images?.[0] || "/Homepage/Car.png";
  const displayImageUrl =
    processedImages.get(currentImageUrl) || currentImageUrl;

  if (loading) {
    return (
      <div className="absolute bottom-8 lg:bottom-12 left-1/2 -translate-x-1/2 w-full max-w-6xl px-4 lg:px-6">
        <div className="flex items-center justify-center h-64 lg:h-96">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-400 text-base lg:text-lg">
              {t("homepage.loading", "Loading vehicles...")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentVehicle) {
    return (
      <div className="absolute bottom-8 lg:bottom-12 left-1/2 -translate-x-1/2 w-full max-w-6xl px-4 lg:px-6">
        <div className="flex items-center justify-center h-64 lg:h-96">
          <p className="text-slate-400 text-base lg:text-lg">
            {t("homepage.noVehicles", "No vehicles available")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="absolute bottom-8 lg:-bottom-30 left-1/2 -translate-x-1/2 w-full max-w-6xl px-4 lg:px-6 z-30">
      {/* Badge - Hidden on mobile */}
      <div className="hidden lg:block absolute -top-6 right-8 lg:right-16 bg-white rounded-3xl px-8 py-5 shadow-2xl z-40 transform rotate-2">
        <div className="text-center">
          <p className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            {vehicles.length}
          </p>
          <p className="text-slate-800 font-semibold text-sm mt-1 whitespace-nowrap">
            {t("homepage.hero.badge", "types with a unique design")}
          </p>
        </div>
      </div>

      {/* Main Image Container */}
      <div className="relative">
        <div className="relative w-full h-[280px] sm:h-[350px] lg:h-[500px]">
          {processingImage && !processedImages.has(currentImageUrl) ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-500 text-sm">
                  {t("homepage.processingImage", "Processing image...")}
                </p>
              </div>
            </div>
          ) : (
            <Image
              src={displayImageUrl}
              alt={currentVehicle.title || "Electric Vehicle"}
              fill
              className="object-contain drop-shadow-2xl transition-opacity duration-300"
              priority
            />
          )}
        </div>

        {/* Price Tag */}
        <div className="absolute top-8 sm:top-1/4 left-4 sm:left-1/4 bg-white/90 backdrop-blur-sm text-slate-900 px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-xl border-2 border-blue-200">
          <p className="text-base sm:text-xl font-bold">
            ${currentVehicle.price.toLocaleString()}
          </p>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrevious}
          className="absolute left-2 sm:-left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-700 text-lg sm:text-xl hover:bg-white transition-all duration-300 z-30 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          disabled={vehicles.length <= 1}
        >
          ←
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 sm:-right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-700 text-lg sm:text-xl hover:bg-white transition-all duration-300 z-30 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          disabled={vehicles.length <= 1}
        >
          →
        </button>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center gap-2 sm:gap-3 mt-4 sm:mt-6">
        {vehicles.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-blue-600 scale-125"
                : "bg-slate-400 hover:bg-slate-500"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

export default ProductShowcase;
