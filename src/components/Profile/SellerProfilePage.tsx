"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, ImageIcon } from 'lucide-react'
import colors from '../../Utils/Color'
import { useI18nContext } from '../../providers/I18nProvider'
import { getSellerProfile, type SellerProfile as SellerProfileType, type Review } from '../../services'
import SellerProfileHeader from './SellerProfile/SellerProfileHeader'
import SellerStatistics from './SellerProfile/SellerStatistics'
import ReviewCard from './SellerProfile/ReviewCard'

function SellerProfilePage() {
  const params = useParams()
  const { t } = useI18nContext()
  const [sellerData, setSellerData] = useState<{seller: SellerProfileType, reviews: Review[]} | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        const sellerId = params.id as string
        const response = await getSellerProfile(sellerId)
        
        if (response.success && response.data) {
          setSellerData(response.data)
        } else {
          setError(response.message || 'Failed to fetch seller profile')
        }
      } catch (err) {
        setError('Failed to fetch seller profile')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchSellerProfile()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen" style={{backgroundColor: colors.Background}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          {/* Skeleton UI for Seller Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column - Seller Info Skeleton */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 lg:sticky lg:top-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 animate-pulse mb-4"></div>
                  <div className="h-5 md:h-6 bg-gray-200 animate-pulse rounded w-28 md:w-32 mb-2"></div>
                  <div className="h-3 md:h-4 bg-gray-200 animate-pulse rounded w-20 md:w-24"></div>
                </div>
                <div className="space-y-4">
                  {[1,2,3,4].map(i => (
                    <div key={i}>
                      <div className="h-3 md:h-4 bg-gray-200 animate-pulse rounded w-16 md:w-20 mb-2"></div>
                      <div className="h-4 md:h-5 bg-gray-200 animate-pulse rounded w-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Right Column - Stats & Reviews Skeleton */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6 order-1 lg:order-2">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                    <div className="h-3 md:h-4 bg-gray-200 animate-pulse rounded w-20 md:w-24 mb-2"></div>
                    <div className="h-6 md:h-8 bg-gray-200 animate-pulse rounded w-12 md:w-16"></div>
                  </div>
                ))}
              </div>
              {/* Reviews Section */}
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                <div className="h-5 md:h-6 bg-gray-200 animate-pulse rounded w-40 md:w-48 mb-4"></div>
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="border-b pb-4">
                      <div className="h-3 md:h-4 bg-gray-200 animate-pulse rounded w-full mb-2"></div>
                      <div className="h-3 md:h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !sellerData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || t('sellerProfile.profileNotFound')}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('sellerProfile.goBack')}
          </button>
        </div>
      </div>
    )
  }

  const { seller, reviews } = sellerData

  return (
    <div className="min-h-screen" style={{backgroundColor: colors.Background}}>


      {/* Hero Section */}
      <SellerProfileHeader seller={seller} reviews={reviews} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Statistics Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <SellerStatistics reviews={reviews} />
          </div>

          {/* Reviews Section */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold" style={{color: colors.Text}}>
                {t('sellerProfile.customerReviews')}
              </h2>
              <p className="mt-2 text-sm md:text-base" style={{color: colors.SubText}}>
                {t('sellerProfile.reviewsDescription')}
              </p>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-4 md:space-y-6">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 md:p-12 shadow-sm border border-gray-200 text-center">
                <ImageIcon size={40} className="mx-auto mb-4 text-gray-400 md:w-12 md:h-12" />
                <h3 className="text-base md:text-lg font-medium mb-2" style={{color: colors.Text}}>
                  {t('sellerProfile.noReviewsYet')}
                </h3>
                <p className="text-sm md:text-base" style={{color: colors.SubText}}>
                  {t('sellerProfile.noReviewsDescription')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellerProfilePage