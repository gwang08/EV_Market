import React from "react";
import { useI18nContext } from "@/providers/I18nProvider";
import { formatCurrency } from "@/services";
import { motion } from "framer-motion";

interface AccrualFundsHoldProps {
  holdAmount: number;
  description: string;
}

const AccrualFundsHold: React.FC<AccrualFundsHoldProps> = ({
  holdAmount,
  description,
}) => {
  const { t } = useI18nContext();

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        scale: 1.03,
        boxShadow: "0 8px 32px 0 rgba(99,102,241,0.15)",
      }}
      className="bg-white/80 backdrop-blur-lg border border-indigo-100 rounded-3xl shadow-2xl p-8 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/40 rounded-full -translate-y-12 translate-x-12 opacity-50"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-indigo-800 tracking-tight drop-shadow-lg">
            {t("wallet.auctionFundsHold")}
          </h2>
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-4 mb-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-bold text-indigo-900 block">
                {formatCurrency(holdAmount)}
              </span>
              <p className="text-indigo-700 text-base font-medium">
                {t("wallet.temporarilyLocked", "Số tiền tạm giữ")}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-blue-900 mb-2">
                💡 {t("wallet.importantNote")}
              </p>
              <p className="text-base text-blue-700 leading-relaxed">
                {t("wallet.warningMessage")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default AccrualFundsHold;
