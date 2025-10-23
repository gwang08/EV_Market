"use client"
import React, { useEffect, useState } from 'react'
import { useI18nContext } from '../../providers/I18nProvider'
import { getMyTransactions, Transaction } from '../../services/Transaction'
import TransactionCard from './TransactionCard'
import TransactionSkeleton from './TransactionSkeleton'
import EmptyState from './EmptyState'

export default function PurchaseHistory() {
  const { t } = useI18nContext()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)

  const fetchTransactions = async (page: number) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getMyTransactions(page, 10)
      setTransactions(response.data.transactions)
      setTotalPages(response.data.totalPages)
      setTotalResults(response.data.totalResults)
      setCurrentPage(response.data.page)
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
      setError(t('purchaseHistory.loadError', 'Failed to load purchase history'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions(currentPage)
  }, [])

  const handlePageChange = (page: number) => {
    fetchTransactions(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-6 md:mb-8">
            <div className="h-8 md:h-10 bg-gray-200 rounded-lg w-64 mb-2 animate-pulse"></div>
            <div className="h-4 md:h-5 bg-gray-200 rounded-lg w-96 max-w-full animate-pulse"></div>
          </div>

          {/* Cards Skeleton */}
          <div className="space-y-4 md:space-y-6">
            {[1, 2, 3].map((i) => (
              <TransactionSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 md:w-10 md:h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{t('purchaseHistory.errorTitle', 'Error')}</h3>
            <p className="text-sm md:text-base text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => fetchTransactions(currentPage)}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg text-sm md:text-base"
            >
              {t('purchaseHistory.tryAgain', 'Try Again')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 md:py-8 mt-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
            {t('purchaseHistory.title', 'Purchase History')}
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            {t('purchaseHistory.subtitle', 'View and manage your purchase history')}
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs md:text-sm text-gray-500 mb-1">{t('purchaseHistory.totalPurchases', 'Total Purchases')}</p>
              <p className="text-2xl md:text-3xl font-bold text-blue-600">{totalResults}</p>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-3 md:px-4 py-2 rounded-lg">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs md:text-sm font-medium text-blue-700">
                {transactions.filter(t => t.status === 'COMPLETED').length} {t('purchaseHistory.completed', 'Completed')}
              </span>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        {transactions.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="space-y-4 md:space-y-6">
              {transactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 md:mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 md:px-4 md:py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {t('purchaseHistory.previous', 'Previous')}
                </button>
                
                <div className="flex items-center gap-1 md:gap-2">
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1
                    // Show first, last, current, and adjacent pages
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 md:px-4 md:py-2 rounded-lg text-sm font-medium transition-all ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="text-gray-400">...</span>
                    }
                    return null
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 md:px-4 md:py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {t('purchaseHistory.next', 'Next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
