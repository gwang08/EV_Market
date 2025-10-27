"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useI18nContext } from "../../providers/I18nProvider";

interface BrandData {
  name: string;
  logo: string;
}

function BrandCarousel() {
  const { t } = useI18nContext();
  const router = useRouter();

  // Hardcoded brands from your logo collection
  const brands: BrandData[] = [
    { name: "Tesla", logo: "/brands/tesla.png" },
    { name: "Nissan", logo: "/brands/nissan.png" },
    { name: "Chevrolet", logo: "/brands/chevrolet.png" },
    { name: "BMW", logo: "/brands/bmw.png" },
    { name: "VinFast", logo: "/brands/vinfast.png" },
    { name: "Ford", logo: "/brands/ford.png" },
    { name: "Audi", logo: "/brands/audi.png" },
    { name: "Mercedes", logo: "/brands/mercedes.png" },
    { name: "Volkswagen", logo: "/brands/volkswagen.png" },
    { name: "Rivian", logo: "/brands/rivian.png" },
    { name: "Lucid", logo: "/brands/lucid.png" },
    { name: "Kia", logo: "/brands/kia.png" },
    { name: "BYD", logo: "/brands/byd.png" },
    { name: "Polestar", logo: "/brands/polestar.png" },
  ];

  const handleBrandClick = (brandName: string) => {
    router.push(`/browse?brand=${encodeURIComponent(brandName)}`);
  };

  // Duplicate brands for infinite scroll effect
  const duplicatedBrands = [...brands, ...brands];

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 lg:mt-15">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden py-8">
          {/* Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />

          {/* Scrolling container with infinite animation */}
          <motion.div
            className="flex gap-12 sm:gap-16 md:gap-20 lg:gap-24"
            initial={{ x: 0 }}
            animate={{ x: [`0%`, `-${100 / 2}%`] }} // scroll half, since duplicated
            transition={{
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            }}
          >
            {duplicatedBrands.map((brand, index) => (
              <motion.div
                key={`${brand.name}-${index}`}
                onClick={() => handleBrandClick(brand.name)}
                className="flex-shrink-0 w-32 sm:w-40 md:w-48 lg:w-56 cursor-pointer group"
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: (index % brands.length) * 0.08,
                  ease: "easeOut",
                }}
              >
                <div className="relative h-20 sm:h-24 md:h-28 lg:h-32 flex items-center justify-center">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    className="object-contain filter grayscale-0 transition-all duration-300 drop-shadow-xl hover:scale-110"
                    priority={index < 14}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default BrandCarousel;
