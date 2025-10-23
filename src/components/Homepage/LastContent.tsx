"use client";
import React from "react";
import { useI18nContext } from "../../providers/I18nProvider";
import { isAuthenticated } from "../../services";
import { useRouter } from "next/navigation";
import { easeOut, motion } from "framer-motion";

function LastContent() {
  const { t } = useI18nContext();
  const router = useRouter();

  // Handle navigation with authentication check for browsing
  const handleBrowseNavigation = () => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    router.push("/browse");
  };

  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.13,
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
    <section className="relative py-24 px-4 sm:px-6 overflow-hidden bg-transparent">
      <motion.div
        className="relative max-w-4xl mx-auto text-center z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={containerVariants}
      >
        {/* Main Heading */}
        <motion.h2
          className="text-3xl lg:text-5xl font-extrabold mb-6 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent drop-shadow-lg tracking-tight"
          variants={fadeUp}
        >
          {t("homepage.cta.title")}
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          className="text-lg lg:text-xl text-slate-600 mb-12 leading-relaxed font-medium"
          variants={fadeUp}
        >
          {t("homepage.cta.description")}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          variants={fadeUp}
        >
          {/* Browse Listings Button */}
          <motion.button
            onClick={handleBrowseNavigation}
            className="group relative px-10 py-4 bg-blue-600 text-white font-semibold rounded-full overflow-hidden transition-all duration-500 shadow-lg hover:shadow-2xl hover:scale-[1.03] text-center text-base"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="relative z-10">
              {t("homepage.hero.browseBtn")}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </motion.button>

          {/* Create Account Button */}
          <motion.a
            href="/register"
            className="px-10 py-4 bg-white/80 border-2 border-blue-600 text-blue-700 font-semibold rounded-full hover:bg-blue-50 hover:text-blue-800 transition-all duration-300 shadow text-base"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            {t("homepage.cta.startBtn")}
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default LastContent;
