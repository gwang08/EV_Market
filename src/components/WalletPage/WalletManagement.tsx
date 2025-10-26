import React, { useState, useEffect } from 'react';
import { useI18nContext } from '@/providers/I18nProvider';
import { getWalletBalance, formatCurrency, WalletData } from '@/services';
import { useToast } from '@/hooks/useToast';
import TransactionHistory from './TransactionHistory';

import DepositModal from './DepositModal';

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
      console.error('Error loading wallet data:', err);
      
      // Show more specific error message
      if (err instanceof Error) {
        error(err.message);
      } else {
        error(t('wallet.loadError'));
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
    // Implement withdraw logic
  };

  const handleDepositSuccess = () => {
    // Refresh wallet data after successful deposit
    loadWalletData();
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen mt-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="relative inline-block">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3">
              {t('wallet.management')}
            </h1>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
          </div>
          <p className="text-gray-600 mt-4 text-lg max-w-2xl mx-auto">
            {t('wallet.manageDescription')}
          </p>
          
          {/* Stats Overview */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">{t('wallet.secureTransactions', 'Giao dịch an toàn')}</span>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">{t('wallet.fastDeposit', 'Nạp tiền nhanh')}</span>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">{t('wallet.digitalWallet', 'Ví điện tử')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Layout - 1:2 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column (1/3) - Balance and Funds Hold */}
          <div className="xl:col-span-1 space-y-6">
            {/* Wallet Balance Section */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-10 -translate-x-10"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">{t('wallet.currentBalance')}</h2>
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                
                <div className="mb-6">
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span className="text-white/80">{t('common.loading', 'Đang tải...')}</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-3xl xl:text-4xl font-bold text-white block">
                        {walletData ? formatCurrency(walletData.availableBalance) : formatCurrency(0)}
                      </span>
                      <p className="text-green-100 text-sm mt-1">{t('wallet.availableBalance', 'Số dư khả dụng')}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleDeposit}
                    disabled={isLoading}
                    className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:bg-green-50 hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>{t('wallet.depositFunds')}</span>
                  </button>
                  
                  <button
                    onClick={handleWithdraw}
                    disabled={isLoading}
                    className="bg-white/20 border-2 border-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:bg-white/30 hover:border-white/50 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                    <span>{t('wallet.withdraw')}</span>
                  </button>
                </div>
              </div>
            </div>

        
          </div>

          {/* Right Column (2/3) - Transaction History */}
          <div className="xl:col-span-2">
            <TransactionHistory
              onRefresh={loadWalletData}
            />
          </div>
        </div>

        {/* Deposit Modal */}
        <DepositModal
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
          onDepositSuccess={handleDepositSuccess}
        />
      </div>
    </div>
  );
}

export default WalletManagement;