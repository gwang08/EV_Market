import React from "react";
import { motion } from "framer-motion";

interface PaymentMethod {
  id: string;
  type: "credit" | "bank" | "paypal";
  name: string;
  details: string;
  isDefault?: boolean;
}

interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[];
  onManagePaymentMethods: () => void;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  paymentMethods,
  onManagePaymentMethods,
}) => {
  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case "credit":
        return (
          <div className="w-12 h-12 bg-gradient-to-br from-blue-200 via-blue-100 to-white rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-7 h-7 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="7" width="18" height="10" rx="2" strokeWidth={2} />
              <rect x="7" y="15" width="2" height="2" rx="1" strokeWidth={2} />
            </svg>
          </div>
        );
      case "bank":
        return (
          <div className="w-12 h-12 bg-gradient-to-br from-green-200 via-green-100 to-white rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-7 h-7 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeWidth={2}
                d="M3 10l9-7 9 7v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2z"
              />
              <rect x="7" y="15" width="2" height="2" rx="1" strokeWidth={2} />
            </svg>
          </div>
        );
      case "paypal":
        return (
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-200 via-yellow-100 to-white rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-7 h-7 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeWidth={2} d="M6 12a6 6 0 1112 0 6 6 0 01-12 0z" />
              <rect x="7" y="15" width="2" height="2" rx="1" strokeWidth={2} />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 bg-gradient-to-br from-gray-200 via-gray-100 to-white rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-7 h-7 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="7" width="18" height="10" rx="2" strokeWidth={2} />
            </svg>
          </div>
        );
    }
  };

  const getStatusIndicator = (isDefault?: boolean) => {
    if (isDefault) {
      return (
        <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full font-semibold shadow">
          Default
        </span>
      );
    }
    return null;
  };

  return (
    <section className="relative py-10 px-4 sm:px-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent drop-shadow-lg tracking-tight">
          Payment Methods
        </h2>
        <button
          onClick={onManagePaymentMethods}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all text-base"
        >
          Manage Payment Methods
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {paymentMethods.map((method, idx) => (
          <motion.div
            key={method.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
              scale: 1.04,
              boxShadow: "0 8px 32px 0 rgba(59,130,246,0.15)",
            }}
            transition={{
              duration: 0.5,
              delay: idx * 0.1,
              type: "spring",
            }}
            className="relative bg-white/80 backdrop-blur-lg border border-blue-100 rounded-2xl shadow-xl p-7 flex flex-col items-center justify-center gap-4 hover:bg-blue-50/60"
          >
            <div className="mb-2">{getPaymentMethodIcon(method.type)}</div>
            <div className="text-center">
              <h3 className="font-bold text-lg text-slate-900 mb-1">
                {method.name}
              </h3>
              <p className="text-sm text-slate-500 mb-2">{method.details}</p>
              {getStatusIndicator(method.isDefault)}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default PaymentMethods;
