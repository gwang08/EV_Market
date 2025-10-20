"use client";
import React from "react";
import Image from "next/image";
import { useI18nContext } from "../providers/I18nProvider";
import { easeOut, motion } from "framer-motion";

function Footer() {
  const { t } = useI18nContext();

  const quickLinks = [
    { name: t("navigation.home"), href: "/" },
    { name: t("footer.marketplace.browse"), href: "/browse-evs" },
    { name: t("footer.marketplace.batteries"), href: "/browse-batteries" },
    { name: t("navigation.sell"), href: "/sell" },
    { name: "My Account", href: "/account" },
  ];

  const resources = [
    { name: t("footer.support.help"), href: "/guide/buying" },
    { name: t("footer.support.contact"), href: "/guide/battery" },
    { name: t("footer.support.safety"), href: "/safety" },
    { name: t("footer.support.faq"), href: "/faq" },
    { name: t("footer.company.blog"), href: "/blog" },
  ];

  const socialMedia = [
    { name: "Facebook", icon: "/facebook.png", href: "#" },
    { name: "Twitter", icon: "/twitter.png", href: "#" },
    { name: "Instagram", icon: "/instagram.png", href: "#" },
    { name: "LinkedIn", icon: "/linkedin.png", href: "#" },
  ];

  const legalLinks = [
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Cookie Policy", href: "/cookies" },
  ];

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
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: easeOut },
    },
  };

  return (
    <footer className="bg-gradient-to-t from-blue-50 via-white to-white pt-20 pb-8 border-t border-blue-100">
      <motion.div
        className="max-w-7xl mx-auto px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Company Info */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center gap-3 mb-5">
              <Image
                src="/logo.svg"
                alt="EcoTrade EV"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent tracking-tight">
                EcoTrade EV
              </span>
            </div>
            <p className="text-base mb-7 leading-relaxed text-slate-500">
              {t("footer.tagline")}
            </p>
            <div className="flex gap-3 mt-2">
              {socialMedia.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className="w-9 h-9 rounded-full bg-blue-100 hover:bg-blue-600 flex items-center justify-center transition-colors duration-300 group"
                  aria-label={social.name}
                  variants={fadeUp}
                  whileHover={{ scale: 1.13 }}
                >
                  <Image
                    src={social.icon}
                    alt={social.name}
                    width={18}
                    height={18}
                    className="w-5 h-5 group-hover:filter group-hover:brightness-0 group-hover:invert transition-all duration-300"
                  />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={fadeUp}>
            <h3 className="font-semibold mb-5 text-slate-800 text-lg">
              {t("footer.marketplace.title")}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index} className="group flex items-center">
                  <span className="mr-2 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 text-blue-600 text-lg">
                    •
                  </span>
                  <a
                    href={link.href}
                    className="text-base text-slate-500 hover:text-blue-700 transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div variants={fadeUp}>
            <h3 className="font-semibold mb-5 text-slate-800 text-lg">
              {t("footer.support.title")}
            </h3>
            <ul className="space-y-3">
              {resources.map((resource, index) => (
                <li key={index} className="group flex items-center">
                  <span className="mr-2 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 text-blue-600 text-lg">
                    •
                  </span>
                  <a
                    href={resource.href}
                    className="text-base text-slate-500 hover:text-blue-700 transition-colors duration-300"
                  >
                    {resource.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Us */}
          <motion.div variants={fadeUp}>
            <h3 className="font-semibold mb-5 text-slate-800 text-lg">
              {t("footer.company.title")}
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 mt-0.5 text-blue-600">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <span className="text-base text-slate-500">
                  {t("footer.contact.address")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 text-blue-600">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                  </svg>
                </div>
                <span className="text-base text-slate-500">
                  {t("footer.contact.phone")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 text-blue-600">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </div>
                <span className="text-base text-slate-500">
                  {t("footer.contact.email")}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Footer */}
        <motion.div
          className="pt-8 border-t border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4"
          variants={fadeUp}
        >
          <p className="text-sm text-slate-500">{t("footer.copyright")}</p>
          <div className="flex gap-6">
            {legalLinks.map((link, index) => (
              <span key={index} className="group flex items-center">
                <span className="mr-2 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 text-blue-600 text-lg">
                  •
                </span>
                <a
                  href={link.href}
                  className="text-sm text-slate-500 hover:text-blue-700 transition-colors duration-300"
                >
                  {link.name}
                </a>
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}

export default Footer;
