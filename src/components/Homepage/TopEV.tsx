"use client"
import React, { useEffect, useState } from 'react'
import colors from '../../Utils/Color'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useI18nContext } from '../../providers/I18nProvider'
import { useDataContext } from '../../contexts/DataContext'
import { type Vehicle, getCurrentUserId } from '../../services'
import { GridSkeleton } from '../common/Skeleton'

export default function TopEV() {
  const { t } = useI18nContext()
  const router = useRouter()
  const { vehicles: allVehicles, isLoadingVehicles, fetchVehicles } = useDataContext()
  const [displayVehicles, setDisplayVehicles] = useState<Vehicle[]>([])
  
  const handleCarClick = (carId: string) => {
    router.push(`/vehicle/${carId}`)
  }

  // Fetch vehicles on mount (will use cache if available)
  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  // Filter vehicles when data changes
  useEffect(() => {
    const filterVehicles = async () => {
      if (!allVehicles) return
      
      const currentUserId = await getCurrentUserId()
      
      const filteredVehicles = allVehicles.filter(vehicle => {
        const isAvailable = vehicle.status === 'AVAILABLE'
        const isNotSold = vehicle.status !== 'SOLD'
        const isNotOwnVehicle = !currentUserId || vehicle.sellerId !== currentUserId
        return isAvailable && isNotSold && isNotOwnVehicle
      })
      
      // Take only first 4 vehicles for top deals
      setDisplayVehicles(filteredVehicles.slice(0, 4))
    }
    
    filterVehicles()
  }, [allVehicles])

  if (isLoadingVehicles) {
    return (
      <div className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold" style={{color: colors.Text}}>
              {t('homepage.topEV.title')}
            </h2>
          </div>
          <GridSkeleton count={4} columns={4} showBadge={true} />
        </div>
      </div>
    )
  }
  
  return (
    <div className="py-16 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold" style={{color: colors.Text}}>
            {t('homepage.topEV.title')}
          </h2>
          <button 
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300 cursor-pointer"
            onClick={() => router.push('/vehicles')}
          >
            {t('common.viewAll')}
          </button>
        </div>

        {/* Empty State */}
        {displayVehicles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
              <h3 className="text-xl font-semibold mb-2" style={{color: colors.Text}}>
                {t('vehicles.noVehicles', 'Không có xe nào khả dụng')}
              </h3>
              <p className="text-sm" style={{color: colors.SubText}}>
                {t('vehicles.noVehiclesDesc', 'Hiện tại không có xe điện nào. Vui lòng quay lại sau.')}
              </p>
            </div>
          </div>
        ) : (
          /* EV Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayVehicles.map((vehicle) => (
            <div 
              key={vehicle.id} 
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
              onClick={() => handleCarClick(vehicle.id)}
            >
              {/* Image Container */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                {/* Car Image */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <Image
                    src={vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : '/Homepage/TopCar.png'}
                    alt={vehicle.title}
                    width={200}
                    height={120}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    unoptimized={true}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/Homepage/TopCar.png';
                    }}
                  />
                </div>

                {/* Badges - Top Right (higher z-index to show above car) */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-20">
                  {vehicle.isVerified && (
                    <div className="flex items-center">
                      <Image
                        src="/Verified.svg"
                        alt="Verified"
                        width={81}
                        height={20}
                        className="h-5 w-auto"
                        unoptimized={true}
                      />
                    </div>
                  )}
                  {vehicle.status === 'AVAILABLE' && (
                    <div className="flex items-center">
                      <Image
                        src="/Homepage/Sale.svg"
                        alt="Available"
                        width={89}
                        height={20}
                        className="h-5 w-auto"
                        unoptimized={true}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Name and Price */}
                <div className="flex justify-between items-start mb-2">
                  <h3 
                    className="font-semibold text-lg truncate pr-2 max-w-[180px]" 
                    style={{color: colors.Text}}
                    title={vehicle.title}
                  >
                    {vehicle.title}
                  </h3>
                  <span className="text-lg font-bold whitespace-nowrap" style={{color: colors.PriceText}}>
                    ${vehicle.price.toLocaleString()}
                  </span>
                </div>

                {/* Year and Battery Capacity */}
                <p className="text-sm mb-3" style={{color: colors.Description}}>
                  {vehicle.year} • {vehicle.specifications?.batteryAndCharging?.batteryCapacity?.replace(' kWh', '') || Math.floor(Math.random() * (100 - 60) + 60)} kWh
                </p>

                {/* Bottom Row */}
                <div className="flex justify-between items-center">
                  {/* Battery Health with Pin (Mock Data since not in API) */}
                  <div className="flex items-center gap-1">
                    <Image
                      src="/Homepage/Pin.svg"
                      alt="Battery"
                      width={16}
                      height={16}
                      className="w-4 h-4"
                      unoptimized={true}
                    />
                    <span className="text-sm" style={{color: colors.SubText}}>
                      {Math.floor(Math.random() * (95 - 85) + 85)}% SoH
                    </span>
                  </div>

                  {/* Rating (Mock Data) */}
                  <div className="flex items-center gap-1">
                    <Image
                      src="/Homepage/Star.svg"
                      alt="Star"
                      width={16}
                      height={16}
                      className="w-4 h-4"
                      unoptimized={true}
                    />
                    <span className="text-sm font-medium" style={{color: colors.Text}}>
                      {(Math.random() * (5 - 4) + 4).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  )
}
