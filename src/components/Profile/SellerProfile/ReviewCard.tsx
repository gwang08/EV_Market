"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import { 
  Star, 
  Play,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import colors from '../../../Utils/Color'
import { useI18nContext } from '../../../providers/I18nProvider'
import { type Review } from '../../../services'

interface ReviewCardProps {
  review: Review
}

function ReviewCard({ review }: ReviewCardProps) {
  const { t } = useI18nContext()
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [showMediaModal, setShowMediaModal] = useState(false)

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star 
        key={index}
        size={16} 
        className={index < rating ? "text-yellow-400 fill-current" : "text-gray-300"}
      />
    ))
  }

  const isVideo = (url: string) => {
    return url.includes('.mp4') || url.includes('video')
  }

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => 
      prev === review.mediaUrls.length - 1 ? 0 : prev + 1
    )
  }

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => 
      prev === 0 ? review.mediaUrls.length - 1 : prev - 1
    )
  }

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Review Header */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            {review.buyer.avatar ? (
              <Image
                src={review.buyer.avatar}
                alt={review.buyer.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
                <span className="text-white text-xs md:text-sm font-bold">
                  {review.buyer.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm md:text-base truncate" style={{color: colors.Text}}>
              {review.buyer.name}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                {renderStars(review.rating)}
              </div>
              <span className="text-xs md:text-sm whitespace-nowrap" style={{color: colors.SubText}}>
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        {review.hasBeenEdited && (
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full whitespace-nowrap flex-shrink-0">
            {t('sellerProfile.edited')}
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="mb-4 p-2 md:p-3 bg-gray-50 rounded-lg">
        <p className="text-xs md:text-sm font-medium truncate" style={{color: colors.Text}}>
          {t('sellerProfile.product')}: {review.productTitle}
        </p>
        <p className="text-xs" style={{color: colors.SubText}}>
          {t('sellerProfile.type')}: {review.type}
        </p>
      </div>

      {/* Review Comment */}
      <p className="mb-4 leading-relaxed text-sm md:text-base" style={{color: colors.Description}}>
        {/* Filter out transaction reference text */}
        {review.comment.replace(/Review for transaction [a-zA-Z0-9]+/g, '').trim() || t('sellerProfile.greatExperience')}
      </p>

      {/* Media Gallery */}
      {review.mediaUrls && review.mediaUrls.length > 0 && (
        <div className="space-y-3">
          <div className="relative">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {isVideo(review.mediaUrls[currentMediaIndex]) ? (
                <div className="relative w-full h-full flex items-center justify-center bg-black rounded-lg overflow-hidden">
                  <video 
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <source src={review.mediaUrls[currentMediaIndex]} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <Image
                  src={review.mediaUrls[currentMediaIndex]}
                  alt="Review media"
                  fill
                  className="object-cover cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setShowMediaModal(true)}
                />
              )}
            </div>
            
            {review.mediaUrls.length > 1 && (
              <>
                <button
                  onClick={prevMedia}
                  className="absolute left-1 md:left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1.5 md:p-2 shadow-lg transition-all"
                >
                  <ChevronLeft size={16} className="md:w-5 md:h-5" />
                </button>
                <button
                  onClick={nextMedia}
                  className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1.5 md:p-2 shadow-lg transition-all"
                >
                  <ChevronRight size={16} className="md:w-5 md:h-5" />
                </button>
              </>
            )}
          </div>
          
          {review.mediaUrls.length > 1 && (
            <div className="flex justify-center gap-1.5 md:gap-2">
              {review.mediaUrls.map((_: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentMediaIndex(index)}
                  className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors ${
                    index === currentMediaIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ReviewCard