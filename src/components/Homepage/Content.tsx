"use client";
import React from "react";
import Link from "next/link";
import { useI18nContext } from "../../providers/I18nProvider";
import { isAuthenticated } from "../../services";
import { useRouter } from "next/navigation";
import { easeOut, motion } from "framer-motion";

function Content() {
  const { t } = useI18nContext();
  const router = useRouter();

  const handleSellNavigation = () => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    router.push("/sell");
  };

  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: easeOut },
    },
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Content Container */}
      <motion.div
        className="relative h-full flex items-start justify-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40 2xl:pt-45 z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          className="text-center space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-8 max-w-5xl w-full"
          variants={containerVariants}
        >
          {/* Main Heading with enhanced styling */}
          <motion.div
            className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-5 xl:space-y-6"
            variants={containerVariants}
          >
            <motion.h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 drop-shadow-sm px-2 sm:px-4"
              variants={fadeUp}
            >
              {t("homepage.hero.title", "Design & High Quality")}
            </motion.h1>

            {/* Elegant separator */}
            <motion.div
              className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3"
              variants={fadeUp}
            >
              <div className="w-8 sm:w-12 md:w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-blue-500 rounded-full"></div>
              <motion.div
                className="w-1.5 sm:w-1.5 md:w-2 h-1.5 sm:h-1.5 md:h-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.6,
                  ease: "easeInOut",
                }}
              ></motion.div>
              <div className="w-8 sm:w-12 md:w-16 h-0.5 bg-gradient-to-l from-transparent via-blue-500 to-blue-500 rounded-full"></div>
            </motion.div>
          </motion.div>

          {/* Description with better spacing */}
          <motion.p
            className="text-slate-600 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl max-w-xl mx-auto leading-relaxed font-normal px-4 sm:px-6 md:px-8 lg:px-4"
            variants={fadeUp}
          >
            {t(
              "homepage.hero.description1",
              "Sale of high-quality branded sneakers in a wide range with unique designs."
            )}
          </motion.p>

          {/* Enhanced CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-3 lg:gap-4 justify-center items-stretch sm:items-center pt-2 sm:pt-3 md:pt-4 lg:pt-5 xl:pt-6 px-4"
            variants={fadeUp}
          >
            <Link
              href="/browse"
              className="group relative px-5 sm:px-7 md:px-9 lg:px-11 xl:px-12 py-2 sm:py-2.5 md:py-3 lg:py-3.5 xl:py-4 bg-blue-600 text-white font-medium text-xs sm:text-sm md:text-sm lg:text-base rounded-full overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.02] text-center w-full sm:w-auto sm:flex-initial"
            >
              <span className="relative z-10">
                {t("homepage.hero.browseBtn", "Open Store")}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Link>

            <button
              onClick={handleSellNavigation}
              className="group relative px-5 sm:px-7 md:px-9 lg:px-11 xl:px-12 py-2 sm:py-2.5 md:py-3 lg:py-3.5 xl:py-4 bg-white/70 backdrop-blur-sm text-slate-700 font-medium text-xs sm:text-sm md:text-sm lg:text-base rounded-full transition-all duration-500 hover:bg-white hover:shadow-xl hover:scale-[1.02] text-center border border-slate-200/50 w-full sm:w-auto sm:flex-initial"
            >
              <span className="relative z-10">
                {t("homepage.hero.sellBtn", "Explore More")}
              </span>
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default Content;
