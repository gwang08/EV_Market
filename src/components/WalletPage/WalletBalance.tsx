import React from "react";
import { motion } from "framer-motion";

interface WalletBalanceProps {
  balance: number;
  onDeposit: () => void;
  onWithdraw: () => void;
}

const WalletBalance: React.FC<WalletBalanceProps> = ({
  balance,
  onDeposit,
  onWithdraw,
}) => {
  return (
    <section className="relative py-8 px-4">
      <div className="bg-white/80 backdrop-blur-lg border border-blue-100 rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center gap-6">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent drop-shadow-lg tracking-tight mb-2">
          Current Balance
        </h2>
        <span className="text-5xl font-extrabold text-blue-700 drop-shadow-lg mb-2">
          {balance.toLocaleString("vi-VN", { minimumFractionDigits: 0 })} VNĐ
        </span>
        <div className="flex gap-6 mt-4">
          <motion.button
            onClick={onDeposit}
            whileHover={{
              scale: 1.07,
              boxShadow: "0 8px 32px 0 rgba(59,130,246,0.15)",
            }}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-full shadow-lg text-lg transition-all"
          >
            Deposit Funds
          </motion.button>
          <motion.button
            onClick={onWithdraw}
            whileHover={{
              scale: 1.07,
              boxShadow: "0 8px 32px 0 rgba(59,130,246,0.15)",
            }}
            className="px-8 py-3 bg-white border border-blue-300 text-blue-700 font-bold rounded-full shadow-lg text-lg transition-all"
          >
            Withdraw
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default WalletBalance;
