"use client";
import React from "react";
import Link from "next/link";
import { useI18nContext } from "../../providers/I18nProvider";
import { isAuthenticated } from "../../services";
import { useRouter } from "next/navigation";

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

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Content Container */}
      <div className="relative h-full flex items-start justify-center px-4 sm:px-6 pt-32 sm:pt-36 md:pt-40 lg:pt-45 z-10">
        <div className="text-center space-y-6 sm:space-y-8 max-w-5xl w-full">
          {/* Main Heading with enhanced styling */}
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 drop-shadow-sm px-4">
              {t("homepage.hero.title", "Design & High Quality")}
            </h1>

            {/* Elegant separator */}
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <div className="w-12 sm:w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-blue-500 rounded-full"></div>
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 animate-pulse"></div>
              <div className="w-12 sm:w-16 h-0.5 bg-gradient-to-l from-transparent via-blue-500 to-blue-500 rounded-full"></div>
            </div>
          </div>

          {/* Description with better spacing */}
          <p className="text-slate-600 text-sm sm:text-base lg:text-lg max-w-xl mx-auto leading-relaxed font-normal px-6 sm:px-4">
            {t(
              "homepage.hero.description1",
              "Sale of high-quality branded sneakers in a wide range with unique designs."
            )}
          </p>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-row gap-3 sm:gap-4 justify-center pt-4 sm:pt-6 px-4">
            <Link
              href="/browse"
              className="group relative px-6 sm:px-12 py-3 sm:py-4 bg-blue-600 text-white font-medium text-sm sm:text-base rounded-full overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.02] text-center flex-1 sm:flex-initial"
            >
              <span className="relative z-10">
                {t("homepage.hero.browseBtn", "Open Store")}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Link>

            <button
              onClick={handleSellNavigation}
              className="group relative px-6 sm:px-12 py-3 sm:py-4 bg-white/70 backdrop-blur-sm text-slate-700 font-medium text-sm sm:text-base rounded-full transition-all duration-500 hover:bg-white hover:shadow-xl hover:scale-[1.02] text-center border border-slate-200/50 flex-1 sm:flex-initial"
            >
              <span className="relative z-10">
                {t("homepage.hero.sellBtn", "Explore More")}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Content;
