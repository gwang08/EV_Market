"use client";
import React, { useState, useEffect } from "react";
import colors from "../Utils/Color";
import Image from "next/image";
import Link from "next/link";
import { User, List, LogOut, Wallet } from "lucide-react";
import { useI18nContext } from "../providers/I18nProvider";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated, logoutUser } from "../services";

function Header() {
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { locale, changeLocale, t } = useI18nContext();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, [pathname]);

  // Detect scroll for homepage
  useEffect(() => {
    if (pathname === "/" || pathname === "/home") {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 50);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setIsScrolled(true);
    }
  }, [pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout failed:", error);
      logoutUser();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navigationItems = [
    { name: t("navigation.home"), href: "/" },
    { name: t("navigation.browse"), href: "/browse" },
    { name: t("navigation.auctions"), href: "/auctions" },
    { name: t("navigation.sell"), href: "/sell" },
  ];

  const isActivePath = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "/home";
    }
    if (href === "/sell") {
      return pathname === "/sell";
    }
    if (pathname.startsWith(href)) {
      const nextChar = pathname[href.length];
      return nextChar === undefined || nextChar === "/";
    }
    return false;
  };

  const languages = [
    { name: "English", code: "en", flag: "🇺🇸" },
    { name: "Việt Nam", code: "vn", flag: "🇻🇳" },
  ];

  const handleLanguageChange = (languageCode: "en" | "vn") => {
    changeLocale(languageCode);
    setLanguageDropdownOpen(false);
  };

  const currentLanguage =
    languages.find((lang) => lang.code === locale) || languages[0];

  const handleNavigation = (href: string, requireAuth: boolean = false) => {
    if (requireAuth && !isLoggedIn) {
      router.push("/login");
      return;
    }
    router.push(href);
  };

  const isHomePage = pathname === "/" || pathname === "/home";
  const shouldBeTransparent = isHomePage && !isScrolled;

  const headerBg = shouldBeTransparent
    ? "bg-transparent border-transparent shadow-none"
    : "bg-white/80 backdrop-blur-md border-slate-200/50 shadow-lg";

  return (
    <header className="flex justify-center fixed w-full z-50 top-0 md:top-10">
      <div
        className={`w-full md:max-w-screen-2xl md:mx-6 border rounded-none md:rounded-2xl transition-all duration-300 ${headerBg}`}
      >
        <div className="flex items-center justify-between h-16 px-4 md:px-8">
          {/* Left Side - Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-300"
            >
              <Image
                src="/logo.png"
                alt="EcoTrade EV"
                width={128}
                height={128}
                className="w-8 h-8"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300">
                EcoTrade EV
              </span>
            </Link>
          </div>

          {/* Center - Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigationItems.map((item, index) => {
              const isActive = isActivePath(item.href);
              const requireAuth = item.href === "/sell";
              return (
                <button
                  key={index}
                  onClick={() => handleNavigation(item.href, requireAuth)}
                  className={`text-sm font-medium transition-all duration-300 cursor-pointer relative group
                    ${
                      isActive
                        ? "text-blue-600"
                        : "text-slate-700 hover:text-blue-600"
                    }
                  `}
                >
                  {item.name}
                  {/* Animated underline */}
                  <span
                    className={`
                      absolute -bottom-1 left-0 right-0 h-0.5 rounded-full
                      ${isActive ? "bg-blue-600" : ""}
                      overflow-hidden
                    `}
                  >
                    <span
                      className={`
                        block h-full w-full bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left
                        ${isActive ? "scale-x-100" : ""}
                      `}
                    ></span>
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Right Side - Icons & Mobile Menu */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Desktop Icons */}
            <div className="hidden md:flex items-center gap-2">
              {/* Language */}
              <div className="relative">
                <button
                  className={`flex items-center gap-2 p-2 rounded-xl transition-all duration-300 ${
                    shouldBeTransparent
                      ? "hover:bg-white/10"
                      : "hover:bg-slate-100"
                  }`}
                  onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                >
                  <Image
                    src="/Language.svg"
                    alt="Language"
                    width={32}
                    height={32}
                    className="w-6 h-6"
                  />
                  <span className="text-base">{currentLanguage.flag}</span>
                </button>

                {languageDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    {languages.map((language, index) => (
                      <button
                        key={index}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50 transition-colors duration-300"
                        onClick={() =>
                          handleLanguageChange(language.code as "en" | "vn")
                        }
                      >
                        <span className="text-base">{language.flag}</span>
                        <span className="text-slate-700">{language.name}</span>
                        {locale === language.code && (
                          <span className="ml-auto text-blue-600">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {languageDropdownOpen && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLanguageDropdownOpen(false)}
                  />
                )}
              </div>

              {/* Notifications - Only show when logged in */}
              {isLoggedIn && (
                <button
                  className={`p-2 rounded-xl transition-all duration-300 relative ${
                    shouldBeTransparent
                      ? "hover:bg-white/10"
                      : "hover:bg-slate-100"
                  }`}
                >
                  <Image
                    src="/Notifications.svg"
                    alt="Notifications"
                    width={32}
                    height={32}
                    className="w-6 h-6"
                  />
                  <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </button>
              )}

              {/* Profile / Login */}
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    className={`p-2 rounded-xl transition-all duration-300 ${
                      shouldBeTransparent
                        ? "hover:bg-white/10"
                        : "hover:bg-slate-100"
                    }`}
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  >
                    <Image
                      src="/Profile.svg"
                      alt="Profile"
                      width={32}
                      height={32}
                      className="w-6 h-6"
                    />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="py-2">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-300"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <User size={16} />
                          {t("header.profileSettings", "Profile Settings")}
                        </Link>
                        <Link
                          href="/purchase-history"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-300"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                          {t("header.purchaseHistory", "Purchase History")}
                        </Link>
                        <Link
                          href="/wallet"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-300"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <Wallet size={16} />
                          {t("header.walletManagement")}
                        </Link>
                        <Link
                          href="/sell"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-300"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <List size={16} />
                          {t("header.myListings", "My Listings")}
                        </Link>
                        <div className="border-t border-slate-200 my-1"></div>
                        <button
                          onClick={() => {
                            handleLogout();
                            setProfileDropdownOpen(false);
                          }}
                          disabled={isLoggingOut}
                          className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoggingOut ? (
                            <>
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              {t("header.loggingOut", "Logging out...")}
                            </>
                          ) : (
                            <>
                              <LogOut size={16} />
                              {t("header.logout", "Logout")}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {profileDropdownOpen && (
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 hover:bg-blue-700"
                >
                  {t("common.login")}
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className={`md:hidden p-2 rounded-xl transition-colors duration-300 ${
                shouldBeTransparent ? "hover:bg-white/10" : "hover:bg-slate-100"
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                className="w-6 h-6 text-slate-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md rounded-b-2xl">
            <div className="px-4 py-4 space-y-4">
              {/* Navigation Links */}
              <div className="space-y-2">
                {navigationItems.map((item, index) => {
                  const isActive = isActivePath(item.href);
                  const requireAuth = item.href === "/sell";
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        handleNavigation(item.href, requireAuth);
                        setMobileMenuOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Actions */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                {/* Language Selector */}
                <div className="flex items-center justify-between px-4">
                  <span className="text-sm font-medium text-slate-700">
                    {t("header.language", "Language")}
                  </span>
                  <div className="flex gap-2">
                    {languages.map((language, index) => (
                      <button
                        key={index}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-all duration-300 ${
                          locale === language.code
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                        onClick={() =>
                          handleLanguageChange(language.code as "en" | "vn")
                        }
                      >
                        {language.flag} {language.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Profile/Auth */}
                <div className="flex flex-col gap-2 pt-2">
                  {isLoggedIn ? (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <User size={18} className="text-slate-700" />
                          <span className="text-sm font-medium text-slate-700">
                            {t("header.profile", "Profile")}
                          </span>
                        </Link>
                        <Link
                          href="/wallet"
                          className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Wallet size={18} className="text-slate-700" />
                          <span className="text-sm font-medium text-slate-700">
                            {t("header.wallet", "Wallet")}
                          </span>
                        </Link>
                        <Link
                          href="/purchase-history"
                          className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <svg
                            className="w-[18px] h-[18px] text-slate-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                          <span className="text-sm font-medium text-slate-700">
                            {t("header.purchaseHistory", "Orders")}
                          </span>
                        </Link>
                        <Link
                          href="/sell"
                          className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <List size={18} className="text-slate-700" />
                          <span className="text-sm font-medium text-slate-700">
                            {t("header.myListings", "Listings")}
                          </span>
                        </Link>
                      </div>

                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        disabled={isLoggingOut}
                        className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                      >
                        {isLoggingOut ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            {t("header.loggingOut", "Logging out...")}
                          </>
                        ) : (
                          <>
                            <LogOut size={18} />
                            {t("header.logout", "Logout")}
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all duration-300 text-center shadow-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("common.login")}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
