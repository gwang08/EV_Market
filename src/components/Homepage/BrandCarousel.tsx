"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useI18nContext } from "../../providers/I18nProvider";
import { getAllVehicles, Vehicle } from "../../services/Vehicle";

interface BrandData {
  name: string;
  logo: string;
  count: number;
  vehicles: Vehicle[];
}

function BrandCarousel() {
  const { t } = useI18nContext();
  const router = useRouter();
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [loading, setLoading] = useState(true);

  // Brand logos mapping
  const brandLogos: { [key: string]: string } = {
    tesla: "/brands/tesla.png",
    nissan: "/brands/nissan.png",
    chevrolet: "/brands/chevrolet.png",
    bmw: "/brands/bmw.png",
    vinfast: "/brands/vinfast.png",
    hyundai: "/brands/hyundai.png",
    ford: "/brands/ford.png",
    audi: "/brands/audi.png",
    mercedes: "/brands/mercedes.png",
    "mercedes-benz": "/brands/mercedes.png",
    volkswagen: "/brands/volkswagen.png",
    rivian: "/brands/rivian.png",
    lucid: "/brands/lucid.png",
    kia: "/brands/kia.png",
  };

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await getAllVehicles();
        if (response.success && response.data?.vehicles) {
          // Group vehicles by brand
          const brandMap = new Map<string, Vehicle[]>();

          response.data.vehicles.forEach((vehicle) => {
            const brandName = vehicle.brand.toLowerCase().trim();
            if (!brandMap.has(brandName)) {
              brandMap.set(brandName, []);
            }
            brandMap.get(brandName)?.push(vehicle);
          });

          // Convert to BrandData array
          const brandsData: BrandData[] = Array.from(brandMap.entries()).map(
            ([name, vehicles]) => ({
              name: name.charAt(0).toUpperCase() + name.slice(1),
              logo: brandLogos[name] || "/brands/default.png",
              count: vehicles.length,
              vehicles: vehicles,
            })
          );

          // Sort by count (most vehicles first)
          brandsData.sort((a, b) => b.count - a.count);

          setBrands(brandsData);
        }
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const handleBrandClick = (brandName: string) => {
    router.push(`/browse?brand=${encodeURIComponent(brandName)}`);
  };

  if (loading) {
    return (
      <section className="relative py-16 sm:py-20 lg:py-24">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden py-8">
            {/* Gradient overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />

            {/* Skeleton Carousel */}
            <div className="flex gap-12 sm:gap-16 md:gap-20 lg:gap-24">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-32 sm:w-40 md:w-48 lg:w-56 animate-pulse"
                >
                  <div className="relative h-20 sm:h-24 md:h-28 lg:h-32 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (brands.length === 0) {
    return (
      <section className="relative py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <p className="text-slate-600 text-base lg:text-lg">
              {t("homepage.brands.noBrands", "No brands available")}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Duplicate brands for infinite scroll effect
  const duplicatedBrands = [...brands, ...brands];

  return (
    <section className="relative py-16 sm:py-20 lg:py-24">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Infinite Scroll Carousel */}
        <div className="relative overflow-hidden py-8">
          {/* Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />

          {/* Scrolling container */}
          <motion.div
            animate={{
              x: [0, -50 * brands.length],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 25,
                ease: "linear",
              },
            }}
            className="flex gap-12 sm:gap-16 md:gap-20 lg:gap-24"
          >
            {duplicatedBrands.map((brand, index) => (
              <motion.div
                key={`${brand.name}-${index}`}
                onClick={() => handleBrandClick(brand.name)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 w-32 sm:w-40 md:w-48 lg:w-56 cursor-pointer"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="relative h-20 sm:h-24 md:h-28 lg:h-32"
                >
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                    priority={index < 10}
                  />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default BrandCarousel;
