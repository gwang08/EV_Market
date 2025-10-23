"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useI18nContext } from "../../providers/I18nProvider";
import { getVehicles, Vehicle } from "../../services/Vehicle";
import { motion, AnimatePresence, easeOut, easeIn } from "framer-motion";

function ProductShowcase() {
  const { t } = useI18nContext();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<1 | -1>(1);

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

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? vehicles.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === vehicles.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const currentVehicle = vehicles[currentIndex];
  const currentImageUrl = currentVehicle?.images?.[0] || "/Homepage/Car.png";

  // Animation variants
  const imageVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: easeOut },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.96,
      transition: { duration: 0.4, ease: easeIn },
    }),
  };

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
    <section className="absolute bottom-8 lg:-bottom-35 left-1/2 -translate-x-1/2 w-full max-w-6xl px-4 lg:px-6 z-30">
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
        <div className="relative w-full h-[280px] sm:h-[350px] lg:h-[500px] flex items-center justify-center">
          <AnimatePresence custom={direction} initial={false} mode="wait">
            <motion.div
              key={currentVehicle.id}
              className="absolute inset-0"
              custom={direction}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "tween" }}
              style={{ willChange: "transform, opacity" }}
            >
              <Image
                src={currentImageUrl}
                alt={currentVehicle.title || "Electric Vehicle"}
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Price Tag */}
        <motion.div
          key={currentVehicle.price}
          className="absolute top-8 sm:top-1/4 left-4 sm:left-1/4 bg-white/90 backdrop-blur-sm text-slate-900 px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-xl border-2 border-blue-200"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-base sm:text-xl font-bold">
            ${currentVehicle.price.toLocaleString()}
          </p>
        </motion.div>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrevious}
          className="absolute left-2 sm:-left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-700 text-lg sm:text-xl hover:bg-white transition-all duration-300 z-30 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          disabled={vehicles.length <= 1}
          aria-label="Previous vehicle"
        >
          ←
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 sm:-right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-700 text-lg sm:text-xl hover:bg-white transition-all duration-300 z-30 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          disabled={vehicles.length <= 1}
          aria-label="Next vehicle"
        >
          →
        </button>
      </div>

      {/* Navigation dots */}
      {/* <div className="flex justify-center gap-2 sm:gap-3 mt-4 sm:mt-6">
        {vehicles.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-blue-600 scale-125" : "bg-slate-400"
            }`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 + index * 0.07, duration: 0.3 }}
            aria-label={`Go to vehicle ${index + 1}`}
          />
        ))}
      </div> */}
    </section>
  );
}

export default ProductShowcase;
