import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18nContext } from "@/providers/I18nProvider";
import { getWalletBalance, formatCurrency, WalletData } from "@/services";
import { useToast } from "@/hooks/useToast";
import TransactionHistory from "./TransactionHistory";
// import AccrualFundsHold from "./AccrualFundsHold";
import DepositModal from "./DepositModal";

function WalletManagement() {
  const { t } = useI18nContext();
  const { error } = useToast();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  // Load wallet data
  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      const response = await getWalletBalance();
      setWalletData(response.data);
    } catch (err) {
      console.error("Error loading wallet data:", err);

      // Show more specific error message
      if (err instanceof Error) {
        error(err.message);
      } else {
        error(t("wallet.loadError"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, []);

  const handleDeposit = () => {
    setIsDepositModalOpen(true);
  };

  const handleWithdraw = () => {
    console.log("Withdraw clicked");
    // Implement withdraw logic
  };

  const handleDepositSuccess = () => {
    // Refresh wallet data after successful deposit
    loadWalletData();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 md:pt-30"
    >
      {/* Elegant floating background orbs for luxury effect */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-[30vh] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16 py-16 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="mb-10 text-center"
        >
          <div className="relative inline-block">
            <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 drop-shadow-lg mb-4 tracking-tight">
              {t("wallet.management")}
            </h1>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
          </div>
          <p className="text-xl md:text-2xl text-slate-600 font-medium mt-6 max-w-2xl mx-auto">
            {t("wallet.manageDescription")}
          </p>
        </motion.div>
        {/* Wallet Sections - separate cards, wide layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          {/* Left Column: Balance & Accrual */}
          <div className="flex flex-col gap-12">
            <div>
              {/* Wallet Balance Section */}
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden border border-blue-200">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-10 -translate-x-10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white tracking-tight drop-shadow-lg">
                      {t("wallet.currentBalance")}
                    </h2>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="mb-8">
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <span className="text-white/80">
                          {t("common.loading", "Đang tải...")}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl xl:text-5xl font-extrabold text-white block drop-shadow-lg">
                          {walletData
                            ? formatCurrency(walletData.availableBalance)
                            : formatCurrency(0)}
                        </span>
                        <p className="text-blue-100 text-base mt-2 font-medium">
                          {t("wallet.availableBalance", "Số dư khả dụng")}
                        </p>

                        {/* Locked Balance */}
                        {walletData && walletData.lockedBalance > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/20">
                            <span className="text-2xl font-bold text-white/90 block">
                              {formatCurrency(walletData.lockedBalance)}
                            </span>
                            <p className="text-blue-100 text-sm mt-1 font-medium">
                              {t("wallet.lockedBalance", "Số dư đang bị khóa")}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-4 mt-4">
                    <button
                      onClick={handleDeposit}
                      disabled={isLoading}
                      className="bg-white text-blue-700 px-7 py-3 rounded-full font-bold text-lg shadow-lg transition-all duration-200 hover:bg-blue-50 hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span>{t("wallet.depositFunds")}</span>
                    </button>
                    <button
                      onClick={handleWithdraw}
                      disabled={isLoading}
                      className="bg-white/20 border-2 border-white/30 text-white px-7 py-3 rounded-full font-bold text-lg shadow-lg transition-all duration-200 hover:bg-white/30 hover:border-white/50 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                      <span>{t("wallet.withdraw")}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Right Column: Transaction History only */}
          <div className="flex flex-col gap-12 xl:col-span-2">
            <div>
              <h2 className="text-xl font-bold text-indigo-900 mb-4">
                {t("wallet.historySection", "Lịch sử giao dịch")}
              </h2>
              {/* Transaction History */}
              <TransactionHistory onRefresh={loadWalletData} />
            </div>
          </div>
        </div>

        {/* Deposit Modal - now includes payment method selection (only Momo) */}
        <DepositModal
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
          onDepositSuccess={handleDepositSuccess}
          paymentMethods={[
            {
              id: "momo",
              type: "momo",
              name: "Momo",
              details: "Ví điện tử Momo",
              isDefault: true,
            },
          ]}
        />
      </div>
    </motion.div>
  );
}

export default WalletManagement;
