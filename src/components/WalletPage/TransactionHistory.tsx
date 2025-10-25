import React, { useState, useMemo, useEffect } from 'react';
import { useI18nContext } from '@/providers/I18nProvider';
import { getAuthToken } from '@/services';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://beevmarket-production.up.railway.app/api/v1';

interface Transaction {
  id: string;
  walletId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'PURCHASE';
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
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
  onRefresh 
}) => {
  const { t } = useI18nContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');
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
          throw new Error('No authentication token found - please login again');
        }

        const response = await fetch(`${API_BASE_URL}/wallet/history`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
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
        console.error('Error fetching transaction history:', err);
        setError(err instanceof Error ? err.message : 'Failed to load transaction history');
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionHistory();
  }, []);

  // Filter transactions based on filter
  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter(transaction => {
      switch (filter) {
        case 'deposit':
          return transaction.type === 'DEPOSIT';
        case 'withdrawal':
          return transaction.type === 'WITHDRAWAL';
        case 'purchase':
          return transaction.type === 'PURCHASE';
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

  const getStatusBadgeColor = (status: Transaction['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAmountColor = (amount: number) => {
    return amount > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getTransactionTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'DEPOSIT':
        return t('wallet.depositType', 'Nạp tiền');
      case 'WITHDRAWAL':
        return t('wallet.withdrawalType', 'Rút tiền');
      case 'PURCHASE':
        return t('wallet.purchaseType', 'Mua hàng');
      default:
        return type;
    }
  };

  const getStatusLabel = (status: Transaction['status']) => {
    switch (status) {
      case 'COMPLETED':
        return t('wallet.statusCompleted', 'Hoàn thành');
      case 'PENDING':
        return t('wallet.statusPending', 'Đang xử lý');
      case 'FAILED':
        return t('wallet.statusFailed', 'Thất bại');
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{t('wallet.transactionHistory')}</h2>
            <p className="text-gray-600 text-sm mt-1">{t('wallet.transactionHistoryDesc', 'Lịch sử các giao dịch gần đây')}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">{t('wallet.filter', 'Lọc')}:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
            >
              <option value="all">{t('wallet.allTransactions', 'Tất cả giao dịch')}</option>
              <option value="deposit">{t('wallet.deposits', 'Nạp tiền')}</option>
              <option value="withdrawal">{t('wallet.withdrawals', 'Rút tiền')}</option>
              <option value="purchase">{t('wallet.purchases', 'Mua hàng')}</option>
            </select>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title={t('wallet.refresh', 'Làm mới')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">{t('wallet.loadingTransactions', 'Đang tải lịch sử giao dịch...')}</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium">{t('wallet.errorLoadingData', 'Lỗi tải dữ liệu')}</p>
              <p className="text-gray-500 text-sm mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {t('wallet.tryAgain', 'Thử lại')}
              </button>
            </div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">{t('wallet.noTransactions', 'Chưa có giao dịch nào')}</p>
              <p className="text-gray-400 text-sm mt-1">{t('wallet.noTransactionsDesc', 'Các giao dịch của bạn sẽ hiển thị ở đây')}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">{t('wallet.date')}</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">{t('wallet.type')}</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm hidden sm:table-cell">{t('wallet.description')}</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">{t('wallet.amount')}</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">{t('wallet.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTransactions.map((transaction: Transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-600">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-900">
                        <div className="truncate max-w-[80px] sm:max-w-none" title={getTransactionTypeLabel(transaction.type)}>
                          {getTransactionTypeLabel(transaction.type)}
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                        <div className="truncate max-w-[150px]" title={transaction.description}>
                          {transaction.description}
                        </div>
                      </td>
                      <td className={`py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium ${getAmountColor(transaction.amount)}`}>
                        <div className="truncate">
                          {formatAmount(transaction.amount)}
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(transaction.status)}`}>
                          <span className="truncate max-w-[60px] sm:max-w-none">{getStatusLabel(transaction.status)}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6 pt-4 border-t border-gray-100 gap-3 text-sm text-gray-600">
              <span className="text-center sm:text-left">
                {t('wallet.showingTransactions', 'Hiển thị {start} đến {end} của {total} giao dịch')
                  .replace('{start}', (startIndex + 1).toString())
                  .replace('{end}', Math.min(endIndex, filteredTransactions.length).toString())
                  .replace('{total}', filteredTransactions.length.toString())}
              </span>
              <div className="flex gap-1 justify-center sm:justify-end">
                <button 
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className={`px-2 sm:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-xs sm:text-sm ${
                    currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {t('wallet.previous')}
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors ${
                      currentPage === page
                        ? 'bg-green-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button 
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className={`px-2 sm:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-xs sm:text-sm ${
                    currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {t('wallet.next')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;