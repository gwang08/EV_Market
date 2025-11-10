"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18nContext } from "../../providers/I18nProvider";
import { motion, AnimatePresence } from "framer-motion";

function ProductShowcase() {
  const { t } = useI18nContext();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Array of vehicles with images and prices
  const vehicles = [
    { image: "/car/1.png", price: 89999, name: "Tesla Model S" },
    { image: "/car/2.png", price: 75000, name: "BMW iX" },
    { image: "/car/3.png", price: 65000, name: "Mercedes EQS" },
    { image: "/car/4.png", price: 55000, name: "Audi e-tron GT" },
    { image: "/car/5.png", price: 45000, name: "VinFast VF8" },
  ];

  // Auto-slide functionality
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentIndex((prev) => (prev + 1) % vehicles.length);
  //   }, 6000);

  //   return () => clearInterval(interval);
  // }, [vehicles.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % vehicles.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + vehicles.length) % vehicles.length);
  };

  // const goToSlide = (index: number) => {
  //   setCurrentIndex(index);
  // };

  return (
    <section className="absolute bottom-3 sm:bottom-4 md:bottom-6 lg:hidden xl:block xl:-bottom-12 2xl:-bottom-15 left-1/2 -translate-x-1/2 w-full max-w-6xl px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 z-30">
      {/* Badge - Hidden on mobile and small tablets */}
      <div className="hidden md:block absolute -top-3 md:-top-4 lg:-top-5 xl:-top-6 right-4 md:right-8 lg:right-12 xl:right-16 bg-white rounded-2xl md:rounded-2xl lg:rounded-3xl px-4 md:px-5 lg:px-6 xl:px-8 py-2.5 md:py-3 lg:py-4 xl:py-5 shadow-2xl z-40 transform rotate-2">
        <div className="text-center">
          <p className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            {currentIndex + 1}
          </p>
          <p className="text-slate-800 font-semibold text-[10px] md:text-xs lg:text-sm mt-0.5 lg:mt-1 whitespace-nowrap">
            {t("homepage.hero.badge", "Premium EV Design")}
          </p>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-1 sm:left-2 md:left-2 lg:left-3 xl:left-4 top-1/2 -translate-y-1/2 z-50 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full p-1.5 sm:p-2 md:p-2 lg:p-2.5 xl:p-3 shadow-lg transition-all duration-200 hover:scale-110"
        aria-label="Previous vehicle"
      >
        <ChevronLeft size={16} className="sm:w-5 sm:h-5 text-slate-700" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-1 sm:right-2 md:right-2 lg:right-3 xl:right-4 top-1/2 -translate-y-1/2 z-50 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full p-1.5 sm:p-2 md:p-2 lg:p-2.5 xl:p-3 shadow-lg transition-all duration-200 hover:scale-110"
        aria-label="Next vehicle"
      >
        <ChevronRight size={16} className="sm:w-5 sm:h-5 text-slate-700" />
      </button>

      {/* Main Image Container */}
      <div className="relative">
        <div className="relative w-full h-[180px] sm:h-[240px] md:h-[300px] lg:h-[380px] xl:h-[450px] 2xl:h-[500px] flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ willChange: "transform, opacity" }}
            >
              <Image
                src={vehicles[currentIndex].image}
                alt={vehicles[currentIndex].name}
                fill
                className="object-contain drop-shadow-2xl"
                priority={currentIndex === 0}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Price Tag */}
        <motion.div
          key={`price-${currentIndex}`}
          className="absolute top-3 sm:top-4 md:top-6 lg:top-8 xl:top-1/4 left-2 sm:left-3 md:left-6 lg:left-12 xl:left-1/4 bg-white/90 backdrop-blur-sm text-slate-900 px-2.5 sm:px-3 md:px-4 lg:px-5 xl:px-6 py-1.5 sm:py-1.5 md:py-2 lg:py-2.5 xl:py-3 rounded-full shadow-xl border-2 border-blue-200"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold">
            {vehicles[currentIndex].price.toLocaleString()} VNĐ
          </p>
        </motion.div>
      </div>

      {/* Dots Indicator */}
      {/* <div className="flex justify-center mt-6 gap-2">
        {vehicles.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
              index === currentIndex
                ? "bg-blue-600 scale-125"
                : "bg-white/60 hover:bg-white/80"
            }`}
            aria-label={`Go to vehicle ${index + 1}`}
          />
        ))}
      </div> */}
    </section>
  );
}

export default ProductShowcase;
