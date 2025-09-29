"use client"
import React from 'react'
import Image from 'next/image'
import { 
  Star, 
  Shield, 
  Calendar, 
  MapPin, 
  Mail
} from 'lucide-react'
import { useI18nContext } from '../../../providers/I18nProvider'
import VerifiedBadge from '../../common/VerifiedBadge'
import { type SellerProfile, type Review } from '../../../services'

interface SellerProfileHeaderProps {
  seller: SellerProfile
  reviews: Review[]
}

function SellerProfileHeader({ seller, reviews }: SellerProfileHeaderProps) {
  const { t } = useI18nContext()
  
  // Calculate statistics
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

  const memberSince = new Date(seller.createdAt).getFullYear()

  return (
    <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Seller Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-white/20 ring-4 ring-white/30">
              {seller.avatar ? (
                <Image
                  src={seller.avatar}
                  alt={seller.name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/30">
                  <span className="text-white text-4xl font-bold">
                    {seller.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {seller.isVerified && (
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center ring-4 ring-white">
                <Shield size={20} className="text-white" />
              </div>
            )}
          </div>

          {/* Seller Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{seller.name}</h1>
              {seller.isVerified && (
                <VerifiedBadge width={90} height={22} />
              )}
            </div>
            
            <div className="space-y-2 text-white/90">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>{seller.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{t('sellerProfile.memberSince')} {memberSince}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Vietnam</span>
              </div>
            </div>

            {/* Rating Summary */}
            <div className="mt-6 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star 
                      key={index}
                      size={20} 
                      className={index < Math.round(averageRating) ? "text-yellow-400 fill-current" : "text-white/30"}
                    />
                  ))}
                </div>
                <span className="text-xl font-semibold">
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <div className="text-white/90">
                <span className="font-semibold">{reviews.length}</span> {t('sellerProfile.reviews')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellerProfileHeader