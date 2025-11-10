import React, { useState, useMemo, useEffect } from "react";
import { useI18nContext } from "@/providers/I18nProvider";
import { getAuthToken } from "@/services";
import { motion } from "framer-motion";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_ENDPOINT ||
  "https://beevmarket-production.up.railway.app/api/v1";

interface Transaction {
  id: string;
  walletId: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "PURCHASE";
  amount: number;
  status: "COMPLETED" | "PENDING" | "FAILED";
  gateway: string;
  gatewayTransId: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface TransactionHistoryData {
  transactions: Transaction[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

interface TransactionHistoryProps {
  onRefresh?: () => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  onRefresh,
}) => {
  const { t } = useI18nContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Fetch transaction history from API
  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = getAuthToken();
        if (!token) {
          throw new Error("No authentication token found - please login again");
        }

        const response = await fetch(`${API_BASE_URL}/wallet/history`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.data && data.data.transactions) {
          setTransactions(data.data.transactions);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        console.error("Error fetching transaction history:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load transaction history"
        );
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionHistory();
  }, []);

  // Filter transactions based on filter
  const filteredTransactions = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((transaction) => {
      switch (filter) {
        case "deposit":
          return transaction.type === "DEPOSIT";
        case "withdrawal":
          return transaction.type === "WITHDRAWAL";
        case "purchase":
          return transaction.type === "PURCHASE";
        default:
          return true;
      }
    });
  }, [transactions, filter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getStatusBadgeColor = (status: Transaction["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAmountColor = (amount: number) => {
    return amount > 0 ? "text-green-600" : "text-red-600";
  };

  const getTransactionTypeLabel = (type: Transaction["type"]) => {
    switch (type) {
      case "DEPOSIT":
        return t("wallet.depositType", "Nạp tiền");
      case "WITHDRAWAL":
        return t("wallet.withdrawalType", "Rút tiền");
      case "PURCHASE":
        return t("wallet.purchaseType", "Mua hàng");
      default:
        return type;
    }
  };

  const getStatusLabel = (status: Transaction["status"]) => {
    switch (status) {
      case "COMPLETED":
        return t("wallet.statusCompleted", "Hoàn thành");
      case "PENDING":
        return t("wallet.statusPending", "Đang xử lý");
      case "FAILED":
        return t("wallet.statusFailed", "Thất bại");
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <section className="relative py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg border border-blue-100 rounded-3xl shadow-2xl p-8 overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent drop-shadow-lg tracking-tight mb-2">
              {t("wallet.transactionHistory")}
            </h2>
            <p className="text-base text-slate-500 font-medium">
              {t(
                "wallet.transactionHistoryDesc",
                "Lịch sử các giao dịch gần đây"
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-base font-medium text-blue-700">
              {t("wallet.filter", "Lọc")}:
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-blue-300 rounded-xl px-4 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            >
              <option value="all">
                {t("wallet.allTransactions", "Tất cả giao dịch")}
              </option>
              <option value="deposit">
                {t("wallet.deposits", "Nạp tiền")}
              </option>
              <option value="withdrawal">
                {t("wallet.withdrawals", "Rút tiền")}
              </option>
              <option value="purchase">
                {t("wallet.purchases", "Mua hàng")}
              </option>
            </select>
            {onRefresh && (
              <motion.button
                onClick={onRefresh}
                whileHover={{ scale: 1.1, backgroundColor: "#e0e7ff" }}
                className="p-3 text-blue-600 hover:text-blue-800 bg-blue-50 rounded-xl shadow transition-colors"
                title={t("wallet.refresh", "Làm mới")}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </motion.button>
            )}
          </div>
        </div>
        <div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-blue-50">
                <th className="px-6 py-3 text-slate-700 font-bold">
                  {t("wallet.type")}
                </th>
                <th className="px-6 py-3 text-slate-700 font-bold">
                  {t("wallet.amount")}
                </th>
                <th className="px-6 py-3 text-slate-700 font-bold">
                  {t("wallet.status")}
                </th>
                <th className="px-6 py-3 text-slate-700 font-bold">
                  {t("wallet.date")}
                </th>
                <th className="px-6 py-3 text-slate-700 font-bold">
                  {t("wallet.description")}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8 text-blue-600 font-semibold"
                  >
                    {t("common.loading", "Đang tải...")}
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8 text-slate-500 font-medium"
                  >
                    {t("wallet.noTransactions", "Không có giao dịch nào")}
                  </td>
                </tr>
              ) : (
                transactions.map((tx, idx) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02, backgroundColor: "#f0f9ff" }}
                    transition={{
                      duration: 0.3,
                      delay: idx * 0.05,
                      type: "spring",
                    }}
                    className="border-b border-blue-100"
                  >
                    <td className="px-6 py-4 font-semibold text-blue-700">
                      {tx.type}
                    </td>
                    <td className="px-6 py-4 text-indigo-700 font-bold">
                      {tx.amount}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          tx.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : tx.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {tx.description}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </section>
  );
};

export default TransactionHistory;
