"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useI18nContext } from '../../providers/I18nProvider'
import { useDataContext } from '../../contexts/DataContext'
import { type Battery, getCurrentUserId } from '../../services'
import colors from '../../Utils/Color'
import VerifiedBadge from '../common/VerifiedBadge'
import { ListSkeleton } from '../common/Skeleton'
import { useToast } from '../../providers/ToastProvider'

export default function BatteriesList() {
  const { t } = useI18nContext()
  const router = useRouter()
  const toast = useToast()
  const { batteries: allBatteries, isLoadingBatteries, fetchBatteries } = useDataContext()
  const [batteries, setBatteries] = useState<Battery[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [filteredBatteries, setFilteredBatteries] = useState<Battery[]>([])

  // Fetch batteries on mount (will use cache if available)
  useEffect(() => {
    fetchBatteries()
  }, [fetchBatteries])

  // Filter for available batteries when data loads
  useEffect(() => {
    const filterAvailableBatteries = async () => {
      if (!allBatteries) return
      
      const currentUserId = await getCurrentUserId()
      
      const availableBatteries = allBatteries.filter(battery => {
        const isAvailable = battery.status === 'AVAILABLE'
        const isNotSold = battery.status !== 'SOLD'
        const isNotOwnBattery = !currentUserId || battery.sellerId !== currentUserId
        return isAvailable && isNotSold && isNotOwnBattery
      })
      
      setBatteries(availableBatteries)
      setFilteredBatteries(availableBatteries)
      
      if (availableBatteries.length === 0) {
        toast.info(t('batteries.noBatteries', 'Hiện tại không có pin nào khả dụng'))
      }
    }
    
    filterAvailableBatteries()
  }, [allBatteries, toast, t])

  // Get unique brands from batteries
  const uniqueBrands = React.useMemo(() => {
    const brands = batteries
      .map(battery => battery.brand)
      .filter(brand => brand && brand.trim() !== '')
    return [...new Set(brands)].sort()
  }, [batteries])

  const handleBatteryClick = (batteryId: string) => {
    router.push(`/pin/${batteryId}`)
  }

  // Filter and sort batteries
  useEffect(() => {
    let filtered = batteries.filter(battery => {
      const matchesSearch = battery.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        battery.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesBrand = selectedBrand === '' || battery.brand === selectedBrand
      
      return matchesSearch && matchesBrand
    })

    // Sort batteries
    switch (sortBy) {
      case 'priceLow':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'priceHigh':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      default:
        break
    }

    setFilteredBatteries(filtered)
  }, [batteries, searchTerm, sortBy, selectedBrand])

  if (isLoadingBatteries) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8 space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="h-12 bg-gray-200 rounded flex-1 animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>
        
        {/* Grid Skeleton */}
        <ListSkeleton count={8} showBadge={true} />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mt-40 mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-4" style={{color: colors.Text}}>
          {t('browse.title')}
        </h1>
        <p className="text-lg" style={{color: colors.Description}}>
          {t('browse.subtitle')}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder={t('browse.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('browse.brands')} - All</option>
              {uniqueBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">{t('browse.sortOptions.newest')}</option>
              <option value="priceLow">{t('browse.sortOptions.priceLow')}</option>
              <option value="priceHigh">{t('browse.sortOptions.priceHigh')}</option>
            </select>
          </div>
        </div>

        {/* Results count and Clear filters */}
        <div className="mt-4 flex justify-between items-center">
          <p style={{color: colors.SubText}}>
            {filteredBatteries.length} {t('browse.results')}
          </p>
          {(searchTerm || selectedBrand) && (
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedBrand('')
              }}
              className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            >
              {t('browse.clearAll')}
            </button>
          )}
        </div>
      </div>

      {/* Batteries Grid */}
      {filteredBatteries.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">{t('browse.noResults')}</h3>
            <p className="mt-2 text-gray-500">{t('browse.noResultsDesc')}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBatteries.map((battery) => (
            <div
              key={battery.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-200"
              onClick={() => handleBatteryClick(battery.id)}
            >
              {/* Image Container */}
              <div className="relative h-48 bg-gradient-to-br from-blue-50 to-cyan-50">
                <Image
                  src={battery.images && battery.images.length > 0 ? battery.images[0] : '/Homepage/Pin.png'}
                  alt={battery.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  unoptimized={true}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/Homepage/Pin.png';
                  }}
                />

                {/* Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-10">
                  {battery.isVerified && (
                    <div className="flex items-center">
                      <VerifiedBadge width={81} height={20} />
                    </div>
                  )}
                  {battery.status === 'AVAILABLE' && (
                    <div className="flex items-center">
                      <Image
                        src="/Homepage/Popular.svg"
                        alt="Popular"
                        width={80}
                        height={24}
                        className="h-6 w-auto"
                        unoptimized={true}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Title and Price */}
                <div className="flex justify-between items-start mb-2">
                  <h3 
                    className="font-semibold text-lg truncate pr-2 flex-1" 
                    style={{color: colors.Text}}
                    title={battery.title}
                  >
                    {battery.title}
                  </h3>
                  <span className="text-lg font-bold text-green-600 whitespace-nowrap">
                    {battery.price.toLocaleString()} VNĐ
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1 mb-3">
                  <p className="text-sm" style={{color: colors.Description}}>
                    {battery.year} • {battery.capacity} kWh
                  </p>
                  <p className="text-sm" style={{color: colors.Description}}>
                    {battery.brand || 'Battery Pack'}
                  </p>
                  <p className="text-sm" style={{color: colors.Description}}>
                    Chemistry: {battery.specifications?.chemistry || 'Li-ion'}
                  </p>
                </div>

                {/* Bottom Row */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Image
                      src="/Homepage/Pin.svg"
                      alt="Battery Health"
                      width={16}
                      height={16}
                      className="w-4 h-4"
                      unoptimized={true}
                    />
                    <span className="text-sm" style={{color: colors.SubText}}>
                      {battery.health}% SoH
                    </span>
                  </div>

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
  )
}
