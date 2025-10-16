"use client"
import React from 'react'
import { useI18nContext } from '../../providers/I18nProvider'
import { useRouter } from 'next/navigation'

export default function EmptyState() {
  const { t } = useI18nContext()
  const router = useRouter()

  return (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-6 md:p-12 text-center">
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 md:w-12 md:h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>

        {/* Text */}
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
          {t('purchaseHistory.noPurchases', 'No Purchases Yet')}
        </h3>
        <p className="text-sm md:text-base text-gray-600 mb-8">
          {t('purchaseHistory.noPurchasesDesc', 'You haven\'t made any purchases yet. Start exploring our electric vehicles and batteries!')}
        </p>

        {/* CTA Button */}
        <button
          onClick={() => router.push('/browse')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {t('purchaseHistory.browseCatalog', 'Browse Catalog')}
        </button>
      </div>
    </div>
  )
}
