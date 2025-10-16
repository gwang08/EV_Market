"use client"
import React from 'react'
import { Star } from 'lucide-react'
import colors from '../../../Utils/Color'
import { useI18nContext } from '../../../providers/I18nProvider'
import { type Review } from '../../../services'

interface SellerStatisticsProps {
  reviews: Review[]
}

function SellerStatistics({ reviews }: SellerStatisticsProps) {
  const { t } = useI18nContext()
  
  // Calculate statistics
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0
  
  const ratingDistribution = reviews.reduce((dist, review) => {
    dist[review.rating] = (dist[review.rating] || 0) + 1
    return dist
  }, {} as {[key: number]: number})

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 lg:sticky lg:top-6">
      <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6" style={{color: colors.Text}}>
        {t('sellerProfile.statistics')}
      </h3>
      
      {/* Rating Breakdown */}
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-bold" style={{color: colors.Text}}>
            {averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center items-center gap-1 mb-2">
            {Array.from({ length: 5 }, (_, index) => (
              <Star 
                key={index}
                size={14} 
                className={`md:w-4 md:h-4 ${index < Math.round(averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
              />
            ))}
          </div>
          <div className="text-xs md:text-sm" style={{color: colors.SubText}}>
            {t('sellerProfile.basedOnReviews').replace('{count}', reviews.length.toString())}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating] || 0
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
            
            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-xs md:text-sm w-6 md:w-8" style={{color: colors.SubText}}>
                  {rating}★
                </span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs md:text-sm w-6 md:w-8 text-right" style={{color: colors.SubText}}>
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold" style={{color: colors.PriceText}}>
              {reviews.length}
            </div>
            <div className="text-xs md:text-sm" style={{color: colors.SubText}}>
              {t('sellerProfile.totalReviews')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold" style={{color: colors.PriceText}}>
              {new Set(reviews.map(r => r.type)).size}
            </div>
            <div className="text-xs md:text-sm" style={{color: colors.SubText}}>
              {t('sellerProfile.productTypes')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellerStatistics