"use client"
import React, { useState } from 'react'
import { useI18nContext } from '../../providers/I18nProvider'
import { Transaction, getStatusColor, getPaymentGatewayName } from '../../services/Transaction'
import { formatCurrency } from '../../services/Wallet'
import Image from 'next/image'

interface TransactionCardProps {
  transaction: Transaction
}

export default function TransactionCard({ transaction }: TransactionCardProps) {
  const { t } = useI18nContext()

  const product = transaction.vehicle || transaction.battery
  const productType = transaction.vehicle ? 'vehicle' : 'battery'

  const statusLabels: Record<string, string> = {
    'COMPLETED': t('purchaseHistory.status.completed', 'Completed'),
    'PENDING': t('purchaseHistory.status.pending', 'Pending'),
    'CANCELLED': t('purchaseHistory.status.cancelled', 'Cancelled'),
    'REFUNDED': t('purchaseHistory.status.refunded', 'Refunded')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs md:text-sm font-medium text-gray-500">
                {t('purchaseHistory.orderId', 'Order ID')}:
              </span>
              <code className="text-xs md:text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded truncate">
                {transaction.id.slice(0, 12)}...
              </code>
            </div>
            <p className="text-xs md:text-sm text-gray-500">
              {formatDate(transaction.createdAt)}
            </p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-medium whitespace-nowrap ${getStatusColor(transaction.status)}`}>
            {statusLabels[transaction.status] || transaction.status}
          </span>
        </div>

        {/* Product Info */}
        {product && (
          <div className="flex gap-4 mb-4">
            {/* Image */}
            <div 
              className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Image
                src={product.images[0] || '/placeholder.png'}
                alt={product.title}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <button
                className="text-base md:text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors mb-2 text-left line-clamp-2"
              >
                {product.title}
              </button>
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                  productType === 'vehicle' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {productType === 'vehicle' 
                    ? t('purchaseHistory.productType.vehicle', 'Vehicle')
                    : t('purchaseHistory.productType.battery', 'Battery')
                  }
                </span>
              </div>
              
              {/* Price */}
              <p className="text-xl md:text-2xl font-bold text-green-600">
                {formatCurrency(transaction.finalPrice)}
              </p>
            </div>
          </div>
        )}

        {/* Payment Info */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500">{t('purchaseHistory.paymentMethod', 'Payment Method')}</p>
                <p className="text-sm md:text-base font-semibold text-gray-900 truncate">
                  {getPaymentGatewayName(transaction.paymentGateway)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500">{t('purchaseHistory.transactionDate', 'Transaction Date')}</p>
                <p className="text-sm md:text-base font-semibold text-gray-900 truncate">
                  {new Date(transaction.updatedAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
          
            {transaction.status === 'COMPLETED' && !transaction.review && (
              <button className="flex-1 px-4 py-2.5 bg-white border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all text-sm md:text-base font-medium">
                {t('purchaseHistory.writeReview', 'Write Review')}
              </button>
            )}
            {transaction.status === 'COMPLETED' && transaction.review && (
              <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-50 border border-yellow-200 rounded-xl">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs md:text-sm font-medium text-yellow-700">
                  {t('purchaseHistory.reviewed', 'Reviewed')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

 
    </div>
  )
}
