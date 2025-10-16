"use client";
import React, { useState, useEffect } from "react";
import colors from "../Utils/Color";
import Image from "next/image";
import { User, List, LogOut, Wallet } from "lucide-react";
import { useI18nContext } from "../providers/I18nProvider";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated, logoutUser } from "../services";

function Header() {
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Track logout process
  const { locale, changeLocale, t } = useI18nContext();
  const pathname = usePathname();
  const router = useRouter();

  // Check login status on component mount and when pathname changes
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, [pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout fails, we still redirect
      logoutUser();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navigationItems = [
    { name: t("navigation.home"), href: "/" },
    { name: t("navigation.browse"), href: "/browse" },
    { name: t("navigation.sell"), href: "/sell" },
  ];

  // Function to check if a path is active
  const isActivePath = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "/home";
    }

    // Exact match for /sell to avoid matching /seller/[id]
    if (href === "/sell") {
      return pathname === "/sell";
    }

    // For other paths, use startsWith but ensure it's not a longer path
    // that just happens to start with the same characters
    if (pathname.startsWith(href)) {
      // Check if it's an exact match or the next character is '/'
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

  // Get current language info
  const currentLanguage =
    languages.find((lang) => lang.code === locale) || languages[0];

  // Handle navigation with authentication check
  const handleNavigation = (href: string, requireAuth: boolean = false) => {
    if (requireAuth && !isLoggedIn) {
      // Redirect to login page if authentication is required but user is not logged in
      router.push("/login");
      return;
    }
    // Navigate normally using Next.js router for smooth transitions
    router.push(href);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Logo */}
          <div className="flex items-center">
            {/* Logo - Always visible */}
            <a
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-300"
            >
              <Image
                src="/logo.svg"
                alt="EcoTrade EV"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                EcoTrade EV
              </span>
            </a>
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
                  className={`text-sm font-medium transition-colors duration-300 cursor-pointer hover:cursor-pointer ${
                    isActive ? "text-blue-600" : "hover:text-blue-600"
                  }`}
                  style={!isActive ? { color: colors.Text } : {}}
                >
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* Right Side - Icons & Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Desktop Icons */}
            <div className="hidden md:flex items-center gap-4">
              {/* Language */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full transition-colors duration-300"
                  onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                >
                  <Image
                    src="/Language.svg"
                    alt="Language"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                  <span className="text-lg text-black">
                    {currentLanguage.flag}
                  </span>
                </button>

                {/* Language Dropdown */}
                {languageDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {languages.map((language, index) => (
                      <button
                        key={index}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors duration-300 first:rounded-t-lg last:rounded-b-lg"
                        onClick={() =>
                          handleLanguageChange(language.code as "en" | "vn")
                        }
                        style={{ color: colors.Text }}
                      >
                        <span className="text-lg">{language.flag}</span>
                        <span>{language.name}</span>
                        {locale === language.code && (
                          <span className="ml-auto text-blue-600">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Overlay to close dropdown */}
                {languageDropdownOpen && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLanguageDropdownOpen(false)}
                  />
                )}
              </div>

              {/* Notifications - Only show when logged in */}
              {isLoggedIn && (
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-300 relative">
                  <Image
                    src="/Notifications.svg"
                    alt="Notifications"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                  {/* Notification dot */}
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                </button>
              )}

              {/* Profile / Login */}
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-300"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  >
                    <Image
                      src="/Profile.svg"
                      alt="Profile"
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="py-2">
                        <a
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-300"
                          style={{ color: colors.Text }}
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <User size={16} />
                          {t("header.profileSettings", "Profile Settings")}
                        </a>
                        <a
                          href="/purchase-history"
                          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-300"
                          style={{ color: colors.Text }}
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          {t("header.purchaseHistory", "Purchase History")}
                        </a>
                        <a
                          href="/wallet"
                          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-300"
                          style={{ color: colors.Text }}
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <Wallet size={16} />
                          {t("header.walletManagement")}
                        </a>
                        <a
                          href="/sell"
                          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-300"
                          style={{ color: colors.Text }}
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <List size={16} />
                          {t("header.myListings", "My Listings")}
                        </a>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={() => {
                            handleLogout();
                            setProfileDropdownOpen(false);
                          }}
                          disabled={isLoggingOut}
                          className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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

                  {/* Overlay to close dropdown */}
                  {profileDropdownOpen && (
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                  )}
                </div>
              ) : (
                <a
                  href="/login"
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-300 inline-block shadow-lg"
                >
                  {t("common.login")}
                </a>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: colors.Text }}
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
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-3">
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
                      className={`block w-full text-left py-2 text-sm font-medium transition-colors duration-300 cursor-pointer hover:cursor-pointer ${
                        isActive ? "text-blue-600" : "hover:text-blue-600"
                      }`}
                      style={!isActive ? { color: colors.Text } : {}}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Actions */}
              <div className="pt-3 border-t border-gray-200 space-y-3">
                {/* Language Selector */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm font-medium"
                    style={{ color: colors.Text }}
                  >
                    {t("header.language", "Language")}
                  </span>
                  <div className="flex gap-2">
                    {languages.map((language, index) => (
                      <button
                        key={index}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors duration-300 ${
                          locale === language.code
                            ? "bg-blue-600 text-white border-blue-600"
                            : "hover:bg-gray-50"
                        }`}
                        style={
                          locale !== language.code
                            ? {
                                borderColor: colors.Border,
                                color: colors.Text,
                              }
                            : {}
                        }
                        onClick={() =>
                          handleLanguageChange(language.code as "en" | "vn")
                        }
                      >
                        {language.flag} {language.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Icons */}
                <div className="flex flex-col gap-3 pt-2">
                  {isLoggedIn ? (
                    <>
                      {/* Profile Links */}
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href="/profile"
                          className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <User size={18} />
                          <span className="text-sm font-medium" style={{ color: colors.Text }}>
                            {t("header.profile", "Profile")}
                          </span>
                        </a>
                        <a
                          href="/wallet"
                          className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Wallet size={18} />
                          <span className="text-sm font-medium" style={{ color: colors.Text }}>
                            {t("header.wallet", "Ví của tôi")}
                          </span>
                        </a>
                        <a
                          href="/purchase-history"
                          className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          <span className="text-sm font-medium" style={{ color: colors.Text }}>
                            {t("header.purchaseHistory", "Orders")}
                          </span>
                        </a>
                        <a
                          href="/sell"
                          className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <List size={18} />
                          <span className="text-sm font-medium" style={{ color: colors.Text }}>
                            {t("header.myListings", "Listings")}
                          </span>
                        </a>
                      </div>

                      {/* Logout Button */}
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        disabled={isLoggingOut}
                        className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    <a
                      href="/login"
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-300 inline-block shadow-lg text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("common.login")}
                    </a>
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
