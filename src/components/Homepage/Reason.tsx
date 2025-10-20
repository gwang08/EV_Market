"use client";
import React from "react";
import Image from "next/image";
import { useI18nContext } from "../../providers/I18nProvider";
import { motion } from "framer-motion";

function Reason() {
  const { t } = useI18nContext();

  const features = [
    {
      id: 1,
      icon: "/Homepage/VerifiedLogo.png",
      title: t("homepage.reasons.quality.title"),
      description: t("homepage.reasons.quality.description"),
      bgColor: "from-green-200 via-green-100 to-white",
      glow: "shadow-[0_0_40px_0_rgba(34,197,94,0.15)]",
    },
    {
      id: 2,
      icon: "/Homepage/PinLogo.png",
      title: t("homepage.reasons.secure.title"),
      description: t("homepage.reasons.secure.description"),
      bgColor: "from-blue-200 via-blue-100 to-white",
      glow: "shadow-[0_0_40px_0_rgba(59,130,246,0.15)]",
    },
    {
      id: 3,
      icon: "/Homepage/SecurityLogo.png",
      title: t("homepage.reasons.support.title"),
      description: t("homepage.reasons.support.description"),
      bgColor: "from-purple-200 via-purple-100 to-white",
      glow: "shadow-[0_0_40px_0_rgba(139,92,246,0.15)]",
    },
  ];

  // Animation variants for cards
  const cardVariants: any = {
    offscreen: { opacity: 0, y: 60, scale: 0.95 },
    onscreen: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        bounce: 0.25,
        duration: 0.8,
        delay: i * 0.15,
      },
    }),
    hover: {
      scale: 1.04,
      boxShadow: "0 8px 32px 0 rgba(59,130,246,0.15)",
      transition: { type: "spring", stiffness: 400, damping: 20 },
    },
  };

  // Animation for icon float
  const iconVariants: any = {
    initial: { y: 0 },
    animate: {
      y: [0, -16, 0],
      transition: {
        repeat: Infinity,
        duration: 2.5,
        ease: "easeInOut",
      },
    },
    hover: { scale: 1.15 },
  };

  return (
    <section className="py-24 px-4 sm:px-6 ">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-extrabold mb-5 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent drop-shadow-lg tracking-tight">
            {t("homepage.reasons.title")}
          </h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            {t("homepage.reasons.subtitle", "Lý do bạn nên chọn chúng tôi")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.id}
              className={`
                group flex flex-col items-center bg-white rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-300 px-10 py-14 border border-slate-100 hover:border-blue-300 relative overflow-hidden
                before:content-[''] before:absolute before:inset-0 before:rounded-[2rem] before:pointer-events-none before:opacity-0 before:transition-opacity before:duration-500
                hover:before:opacity-100
                before:bg-gradient-to-br before:from-blue-200/30 before:via-white/0 before:to-indigo-200/30
                ${feature.glow}
              `}
              style={{
                boxShadow:
                  idx === 0
                    ? "0 0 40px 0 rgba(34,197,94,0.10)"
                    : idx === 1
                    ? "0 0 40px 0 rgba(59,130,246,0.10)"
                    : "0 0 40px 0 rgba(139,92,246,0.10)",
              }}
              custom={idx}
              initial="offscreen"
              whileInView="onscreen"
              whileHover="hover"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
            >
              {/* Animated floating icon */}
              <motion.div
                className={`relative z-10 w-24 h-24 rounded-2xl bg-gradient-to-br ${feature.bgColor} flex items-center justify-center mb-8 shadow-lg`}
                variants={iconVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
              >
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </motion.div>

              {/* Title */}
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent text-center tracking-tight">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-base leading-relaxed text-slate-500 text-center font-normal">
                {feature.description}
              </p>

              {/* Glow border on hover */}
              <span className="absolute inset-0 rounded-[2rem] pointer-events-none border-2 border-transparent group-hover:border-blue-300 group-hover:shadow-[0_0_32px_0_rgba(59,130,246,0.10)] transition-all duration-500"></span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Reason;
