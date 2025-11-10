import React, { useState } from "react";
import { useI18nContext } from "@/providers/I18nProvider";
import {
  makeDeposit,
  formatCurrency,
  openPaymentUrl,
  DepositResponse,
} from "@/services";
import { useToast } from "@/hooks/useToast";
import { motion } from "framer-motion";

interface PaymentMethod {
  id: string;
  type: string;
  name: string;
  details?: string;
  isDefault?: boolean;
}

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess: () => void;
  paymentMethods: PaymentMethod[];
}

const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onDepositSuccess,
  paymentMethods,
}) => {
  const { t } = useI18nContext();
  const { success, error } = useToast();
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>(
    paymentMethods?.[0]?.id || "momo"
  );

  // Preset amounts in VND
  const presetAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

  // Format currency for display
  const formattedAmount = amount
    ? formatCurrency(Number(amount))
    : formatCurrency(0);

  // Format input value as currency
  const formatInputValue = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    if (!numericValue) return "";
    return Number(numericValue).toLocaleString("vi-VN");
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers, format as currency
    const numericValue = value.replace(/[^0-9]/g, "");
    setAmount(numericValue);
  };

  const handleInputBlur = () => {
    // Optionally format on blur (not needed if formatting on change)
  };

  const handlePresetAmount = (presetAmount: number) => {
    setAmount(presetAmount.toString());
  };

  const handleDeposit = async () => {
    const depositAmount = parseInt(amount);
    if (!depositAmount || depositAmount < 10000) {
      error(t("wallet.minimumAmount"));
      return;
    }
    if (depositAmount > 50000000) {
      error(t("wallet.maximumAmount"));
      return;
    }
    setIsLoading(true);
    try {
      const response: DepositResponse = await makeDeposit({
        amount: depositAmount,
        paymentMethod: "MOMO",
        redirectUrl: `${window.location.origin}/wallet`,
      });
      if (response.data.resultCode === 0) {
        success(t("wallet.depositRequestCreated"));
        openPaymentUrl(response.data.payUrl);
        onClose();
        onDepositSuccess();
        setAmount("");
      } else {
        error(response.data.message || t("wallet.depositFailed"));
      }
    } catch (err) {
      console.error("Deposit error:", err);
      error(t("wallet.depositError"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-blue-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <motion.form
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="bg-white/90 backdrop-blur-lg rounded-3xl max-w-xl w-full max-h-[95vh] shadow-2xl transform transition-all duration-300 scale-100 flex flex-col p-10 gap-8"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          handleDeposit();
        }}
      >
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent drop-shadow-lg tracking-tight mb-4 text-center">
          {t("wallet.depositFunds", "Nạp tiền vào ví")}
        </h2>
        {/* Payment method selection - only Momo */}
        <div className="mb-6">
          <label className="block text-lg font-semibold text-blue-700 mb-2">
            {t("wallet.paymentMethod", "Phương thức thanh toán")}
          </label>
          <div className="flex gap-4">
            {paymentMethods.map((method) => (
              <motion.button
                key={method.id}
                type="button"
                whileHover={{ scale: 1.08, backgroundColor: "#e0e7ff" }}
                className={`px-6 py-3 rounded-xl font-bold text-pink-700 bg-pink-50 border border-pink-200 shadow transition-all flex items-center gap-2 ${
                  selectedMethod === method.id ? "ring-2 ring-pink-500" : ""
                }`}
                onClick={() => setSelectedMethod(method.id)}
                disabled={isLoading}
              >
                <span className="text-xl">🟣</span>
                <span>{method.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
        {/* Amount input */}
        <div className="mb-6">
          <label className="block text-lg font-semibold text-blue-700 mb-2">
            {t("wallet.enterAmount", "Nhập số tiền muốn nạp")}
          </label>
          <div className="flex gap-3 flex-wrap justify-center mb-2">
            {presetAmounts.map((amt) => (
              <motion.button
                key={amt}
                type="button"
                whileHover={{ scale: 1.08, backgroundColor: "#e0e7ff" }}
                className={`px-5 py-2 rounded-full font-bold text-blue-700 bg-blue-50 border border-blue-200 shadow transition-all ${
                  amount === amt.toString() ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => handlePresetAmount(amt)}
                disabled={isLoading}
              >
                {formatCurrency(amt)}
              </motion.button>
            ))}
          </div>
          <input
            type="text"
            value={formatInputValue(amount)}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder={t("wallet.enterAmount", "Nhập số tiền")}
            className="w-full px-6 py-3 rounded-xl border border-blue-300 text-lg font-bold text-blue-700 bg-white shadow focus:ring-2 focus:ring-blue-500 focus:outline-none mt-2"
            disabled={isLoading}
            inputMode="numeric"
            autoComplete="off"
            onBlur={handleInputBlur}
          />
          <div className="text-right text-blue-700 font-bold mt-2 text-lg">
            {t("wallet.formattedAmount", "Số tiền sẽ nạp")}: {formattedAmount}
          </div>
        </div>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05, backgroundColor: "#e0e7ff" }}
          className="w-full px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-full shadow-lg text-lg transition-all disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading
            ? t("common.loading", "Đang xử lý...")
            : t("wallet.depositFunds", "Nạp tiền")}
        </motion.button>
      </motion.form>
    </motion.div>
  );
};

export default DepositModal;
