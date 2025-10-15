"use client"
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import colors from '../../Utils/Color'
import { useI18nContext } from '../../providers/I18nProvider'
import Image from 'next/image'
import {
  getMyVehicles,
  updateVehicle,
  deleteVehicle,
  type Vehicle
} from '../../services/Vehicle'
import {
  getMyBatteries,
  updateBattery,
  deleteBattery,
  type Battery,
  // getBatteries
} from '../../services/Battery'
import { useToast } from '../../hooks/useToast'
import { ToastContainer } from '../common/Toast'
import { 
  validateField,
  validateForm,
  getFieldError,
  hasFieldError,
  parseApiValidationErrors,
  ValidationError
} from '../../Utils/validation'
import { useDataContext } from '../../contexts/DataContext'
import { GridSkeleton } from '../common/Skeleton'

type ListingType = 'vehicle' | 'battery'

function MyListings() {
  const { t } = useI18nContext()
  const { toasts, success, error: showError, removeToast } = useToast()
  const { refreshVehicles, refreshBatteries } = useDataContext()
  const [filter, setFilter] = useState<'all' | 'active' | 'sold'>('all')
  const [tab, setTab] = useState<ListingType>('vehicle')
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [batteries, setBatteries] = useState<Battery[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editType, setEditType] = useState<ListingType>('vehicle')
  const [editId, setEditId] = useState<string | null>(null)
  const [editImages, setEditImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  
  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    year: '',
    mileage: '',
    description: '',
    brand: '',
    model: '',
    status: 'AVAILABLE',
    capacity: '',
    health: ''
  })

  const setApiErrors = (errors: Record<string, string>) => {
    const validationErrors = Object.entries(errors).map(([field, message]) => ({ field, message }))
    setValidationErrors(validationErrors)
  }

  // Helper functions for styling
  const getInputClass = (fieldName: string) => {
    const baseClass = "w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-all font-medium"
    const errorClass = "border-red-500 focus:ring-red-500"
    return hasFieldError(validationErrors, fieldName) ? `${baseClass} ${errorClass}` : baseClass
  }

  const ErrorMessage = ({ fieldName }: { fieldName: string }) => {
    const error = getFieldError(validationErrors, fieldName)
    const translatedError = error ? t(error, error) : null
    return translatedError ? (
      <p className="mt-1 text-sm text-red-600">{translatedError}</p>
    ) : null
  }

  // Handle input change (no validation on change)
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  // Handle number input - only allow numbers for specific fields
  const handleNumberInput = useCallback((field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Check if field should only accept numbers
    const numberFields = ['price', 'year', 'mileage', 'capacity', 'health']
    
    if (numberFields.includes(field)) {
      // Allow empty string, numbers, and decimal point
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        handleInputChange(field, value)
      }
    } else {
      handleInputChange(field, value)
    }
  }, [handleInputChange])

  // Handle key press for number fields - prevent non-numeric characters
  const handleNumberKeyPress = useCallback((field: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    const numberFields = ['price', 'year', 'mileage', 'capacity', 'health']
    
    if (numberFields.includes(field)) {
      // Allow: backspace, delete, tab, escape, enter, decimal point
      if ([8, 9, 27, 13, 46, 110, 190].indexOf(e.keyCode) !== -1 ||
          // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
          (e.keyCode === 65 && e.ctrlKey === true) ||
          (e.keyCode === 67 && e.ctrlKey === true) ||
          (e.keyCode === 86 && e.ctrlKey === true) ||
          (e.keyCode === 88 && e.ctrlKey === true)) {
        return
      }
      // Ensure that it is a number and stop the keypress
      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault()
      }
    }
  }, [])

  // Handle validation on blur (when user leaves the field)
  const handleInputBlur = useCallback((field: string) => {
    const value = formData[field as keyof typeof formData]
    const error = validateField(field, value, editType)
    
    if (error) {
      setValidationErrors(prev => [...prev.filter(err => err.field !== field), { field, message: error }])
    } else {
      setValidationErrors(prev => prev.filter(err => err.field !== field))
    }
  }, [formData, editType])

  // Image handling functions
  const openFilePicker = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = () => {
      const files = Array.from(input.files || [])
      handleNewFiles(files)
    }
    input.click()
  }

  const handleNewFiles = (files: File[]) => {
    if (!files.length) return
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setNewImages(prev => [...prev, ...files])
    setImagePreviews(prev => [...prev, ...newPreviews])
    success(t('toast.imageUploadSuccess', `Uploaded ${files.length} image${files.length > 1 ? 's' : ''} successfully!`))
  }

  const removeExistingImage = (index: number) => {
    setEditImages(prev => prev.filter((_, i) => i !== index))
    success(t('toast.imageRemoveSuccess', 'Image removed successfully!'))
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
    success(t('toast.imageRemoveSuccess', 'Image removed successfully!'))
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [vRes, bRes] = await Promise.all([getMyVehicles(), getMyBatteries()])
        if (vRes.success) setVehicles(vRes.data?.vehicles || [])
        if (bRes.success) setBatteries(bRes.data?.batteries || [])
        if (!vRes.success || !bRes.success) setError(vRes.message || bRes.message)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load listings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const listings = useMemo(() => {
    if (tab === 'vehicle') return vehicles.map(v => ({
      id: v.id,
      type: 'vehicle' as const,
      title: v.title,
      price: `$${Number(v.price).toLocaleString()}`,
      status: v.status === 'SOLD' ? 'sold' : 'active',
      image: v.images?.[0] || '/Homepage/TopCar.png',
      specs: { 
        mileage: `${v.mileage?.toLocaleString()} km`, 
        battery: v.specifications?.batteryAndCharging?.range ? `${v.specifications.batteryAndCharging.range} km range` : '', 
        year: v.year ? `${v.year}` : '',
        brand: v.brand || '',
        model: v.model || ''
      }
    }))
    return batteries.map(b => ({
      id: b.id,
      type: 'battery' as const,
      title: b.title,
      price: `$${Number(b.price).toLocaleString()}`,
      status: b.status === 'SOLD' ? 'sold' : 'active',
      image: b.images?.[0] || '/Homepage/Car.png',
      specs: { 
        capacity: b.capacity ? `${b.capacity} kWh` : '', 
        health: `${b.health}% health`, 
        year: b.year ? `${b.year}` : '',
        brand: b.brand || ''
      }
    }))
  }, [tab, vehicles, batteries])

  const filteredListings = listings.filter(l => (filter === 'all' ? true : l.status === filter))

  const openEdit = (item: { id: string, type: ListingType }) => {
    setEditType(item.type)
    setEditId(item.id)
    
    if (item.type === 'vehicle') {
      const v = vehicles.find(v => v.id === item.id)
      const formData = {
        title: v?.title || '',
        price: String(v?.price ?? ''),
        year: String(v?.year ?? ''),
        mileage: String(v?.mileage ?? ''),
        description: v?.description || '',
        brand: v?.brand || '',
        model: v?.model || '',
        status: v?.status || 'AVAILABLE',
        capacity: '',
        health: ''
      }
      setFormData(formData)
      setEditImages(v?.images || [])
    } else {
      const b = batteries.find(b => b.id === item.id)
      const formData = {
        title: b?.title || '',
        price: String(b?.price ?? ''),
        year: String(b?.year ?? ''),
        mileage: '',
        description: b?.description || '',
        brand: b?.brand || '',
        model: '',
        status: 'AVAILABLE',
        capacity: String(b?.capacity ?? ''),
        health: String(b?.health ?? '')
      }
      setFormData(formData)
      setEditImages(b?.images || [])
    }
    
    setNewImages([])
    setImagePreviews([])
    setValidationErrors([])
    setIsModalOpen(true)
  }

  const onDelete = async (item: { id: string, type: ListingType }) => {
    if (!confirm(t('seller.listings.deleteConfirm'))) return
    try {
      if (item.type === 'vehicle') {
        const res = await deleteVehicle(item.id)
        if (!res.success) throw new Error(res.message)
        setVehicles(prev => prev.filter(v => v.id !== item.id))
        await refreshVehicles() // Refresh cache
        success(t('toast.vehicleDeleteSuccess', 'Vehicle deleted successfully!'))
      } else {
        const res = await deleteBattery(item.id)
        if (!res.success) throw new Error(res.message)
        setBatteries(prev => prev.filter(b => b.id !== item.id))
        await refreshBatteries() // Refresh cache
        success(t('toast.batteryDeleteSuccess', 'Battery deleted successfully!'))
      }
    } catch (e) {
      showError(e instanceof Error ? e.message : t('toast.deleteFailed', 'Delete failed'))
    }
  }

  const onSave = async () => {
    if (!editId) {
      showError('Không tìm thấy ID để cập nhật')
      return
    }
    
      console.log('onSave called with:', { editId, editType, formData })

      try {
        // Map formData fields to validation format based on editType
        let validationData
        if (editType === 'vehicle') {
          validationData = {
            title: formData.title,
            description: formData.description,
            price: formData.price,
            make: formData.brand, // Map brand to make for validation
            model: formData.model,
            year: formData.year,
            mileage: formData.mileage
          }
        } else {
          validationData = {
            title: formData.title,
            description: formData.description,
            price: formData.price,
            year: formData.year,
            batteryCapacity: formData.capacity, // Map capacity to batteryCapacity for validation
            batteryHealth: formData.health,
            ...(formData.brand && { make: formData.brand }) // Only add make if brand has value
          }
        }
        
        console.log('validationData mapped:', validationData)
        
        // Validate form data
        const validationResult = validateForm(validationData, editType)
        console.log('Validation result:', validationResult)

      if (!validationResult.isValid) {
        console.log('Validation failed:', validationResult.errors)
        console.log('Validation errors details:', validationResult.errors.map(e => ({ field: e.field, message: e.message })))
        setValidationErrors(validationResult.errors)
        showError(`Validation failed: ${validationResult.errors.map(e => `${e.field}: ${e.message}`).join(', ')}`)
        return
      }

      let result
      if (editType === 'vehicle') {
        const payload = {
          title: formData.title,
          price: Number(formData.price) || undefined,
          year: Number(formData.year) || undefined,
          mileage: Number(formData.mileage) || undefined,
          description: formData.description,
          brand: formData.brand,
          model: formData.model,
          status: formData.status as 'AVAILABLE' | 'SOLD' | 'DELISTED',
          images: newImages.length > 0 ? newImages : undefined
        }
        console.log('Updating vehicle with payload:', payload)
        result = await updateVehicle(editId, payload)
      } else {
        const payload = {
          title: formData.title,
          price: Number(formData.price) || undefined,
          year: Number(formData.year) || undefined,
          capacity: Number(formData.capacity) || undefined,
          health: Number(formData.health) || undefined,
          description: formData.description,
          brand: formData.brand,
          images: newImages.length > 0 ? newImages : undefined
        }
        console.log('Updating battery with payload:', payload)
        result = await updateBattery(editId, payload)
      }

      console.log('API result:', result)

      if (!result.success) {
        console.log('API call failed:', result)
        // Handle API validation errors
        if ((result as any).errors || (result as any).details) {
          const apiErrors = parseApiValidationErrors(result as any)
          const apiValidationErrors = Object.entries(apiErrors).map(([field, message]) => ({
            field,
            message
          }))
          setValidationErrors(apiValidationErrors)
        } else {
          showError(result.message || t('seller.listings.updateError'))
        }
        return
      }

      // Update local state
      if (editType === 'vehicle') {
        const updatedVehicle = (result.data as any)?.vehicle || result.data
        setVehicles(prev => prev.map(v => v.id === editId ? { ...v, ...updatedVehicle } : v))
        await refreshVehicles() // Refresh cache
        success(t('toast.vehicleUpdateSuccess', 'Xe được cập nhật thành công!'))
      } else {
        const updatedBattery = (result.data as any)?.battery || result.data
        setBatteries(prev => prev.map(b => b.id === editId ? { ...b, ...updatedBattery } : b))
        await refreshBatteries() // Refresh cache
        success(t('toast.batteryUpdateSuccess', 'Pin được cập nhật thành công!'))
      }
      
      setIsModalOpen(false)
    } catch (e) {
      console.error('Error in onSave:', e)
      showError(e instanceof Error ? e.message : t('toast.updateFailed', 'Cập nhật thất bại'))
    }
  }

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'active':
  //       return 'bg-green-100 text-green-800'
  //     case 'sold':
  //       return 'bg-gray-100 text-gray-800'
  //     default:
  //       return 'bg-gray-100 text-gray-800'
  //   }
  // }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 bg-white min-h-screen">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          {t('seller.listings.title')}
        </h2>
        <p className="text-sm mt-2" style={{ color: colors.SubText }}>
          {t('seller.listings.subtitle')}
        </p>
      </div>

      {/* Tabs and Filters Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Product Type Tabs */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setTab('vehicle')} 
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                tab==='vehicle'
                  ?'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105'
                  :'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
              {t('seller.listings.vehicle')}
            </button>
            <button 
              onClick={() => setTab('battery')} 
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                tab==='battery'
                  ?'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105'
                  :'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {t('seller.listings.battery')}
            </button>
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              onClick={() => setFilter('all')} 
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 flex items-center gap-1.5 ${
                filter==='all'
                  ?'bg-blue-600 text-white shadow-md'
                  :'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-blue-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              {t('seller.listings.all')}
            </button>
            <button 
              onClick={() => setFilter('active')} 
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 flex items-center gap-1.5 ${
                filter==='active'
                  ?'bg-green-600 text-white shadow-md'
                  :'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-green-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('seller.listings.active')}
            </button>
            <button 
              onClick={() => setFilter('sold')} 
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 flex items-center gap-1.5 ${
                filter==='sold'
                  ?'bg-gray-600 text-white shadow-md'
                  :'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {t('seller.listings.sold')}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <GridSkeleton count={6} columns={3} showBadge={true} />
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Listings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredListings.map((item) => (
          <div key={item.id} className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1">
            {/* Image Section */}
            <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
              <Image 
                src={item.image} 
                alt={item.title} 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-500" 
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-4 py-1.5 text-xs font-bold rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1.5 ${
                  item.status === 'active' 
                    ? 'bg-green-500/90 text-white border-2 border-green-300' 
                    : 'bg-red-500/90 text-white border-2 border-red-300'
                }`}>
                  {item.status === 'active' ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t('seller.listings.available')}
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {t('seller.listings.soldStatus')}
                    </>
                  )}
                </span>
              </div>
              
              {/* Type Badge */}
              <div className="absolute bottom-4 left-4">
                <span className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/20 flex items-center gap-1.5">
                  {item.type === 'vehicle' ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                      {t('seller.listings.electricVehicle')}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {t('seller.listings.battery')}
                    </>
                  )}
                </span>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="p-6">
              {/* Header */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                {item.specs.brand && (
                  <p className="text-sm text-gray-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                    {item.specs.brand} 
                    {'model' in item.specs && item.specs.model ? ` • ${item.specs.model}` : ''}
                  </p>
                )}
                <div className="mt-3">
                  <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                    {item.price}
                  </span>
                </div>
              </div>
              
              {/* Specifications */}
              <div className="space-y-2.5 mb-6 bg-gray-50 rounded-lg p-4 border border-gray-100">
                {item.type === 'vehicle' ? (
                  <>
                    {item.specs.year && (
                      <div className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">{item.specs.year}</span>
                      </div>
                    )}
                    {item.specs.mileage && (
                      <div className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="font-medium">{item.specs.mileage}</span>
                      </div>
                    )}
                    {item.specs.battery && (
                      <div className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="font-medium">{item.specs.battery}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {item.specs.year && (
                      <div className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">{item.specs.year}</span>
                      </div>
                    )}
                    {item.specs.capacity && (
                      <div className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="font-medium">{item.specs.capacity}</span>
                      </div>
                    )}
                    {item.specs.health && (
                      <div className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{item.specs.health}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => openEdit({ id: item.id, type: tab })} 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl text-sm font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg transform hover:scale-105 duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {t('seller.listings.edit')}
                </button>
                <button 
                  onClick={() => onDelete({ id: item.id, type: tab })} 
                  className="px-5 py-3 border-2 border-red-300 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 hover:border-red-400 transition-all hover:scale-105 duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredListings.length === 0 && !loading && (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('seller.listings.noListings')}</h3>
            <p className="text-base text-gray-600 mb-6">{t('seller.listings.noListingsDesc')}</p>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-6 rounded-t-2xl shadow-lg z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    {editType === 'vehicle' ? (
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                    ) : (
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                    {editType === 'vehicle' ? t('seller.listings.editVehicle') : t('seller.listings.editBattery')}
                  </h3>
                  <p className="text-blue-100 text-sm mt-1">Update your listing information</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    {t('seller.listings.form.title')} <span className="text-red-600 font-bold">*</span>
                  </label>
                  <input
                    className={getInputClass('title')}
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    onBlur={() => handleInputBlur('title')}
                    placeholder={t('seller.listings.form.titlePlaceholder')} 
                  />
                  <ErrorMessage fieldName="title" />
                </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  {t('seller.listings.form.price')} <span className="text-red-600 font-bold">*</span>
                </label>
                <input type="number" className={getInputClass('price')} value={formData.price} onChange={(e) => handleNumberInput('price', e)} onKeyDown={(e) => handleNumberKeyPress('price', e)} onBlur={() => handleInputBlur('price')} placeholder={t('seller.listings.form.pricePlaceholder')} />
                <ErrorMessage fieldName="price" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  {t('seller.listings.form.year')} <span className="text-red-600 font-bold">*</span>
                </label>
                <input type="number" className={getInputClass('year')} value={formData.year} onChange={(e) => handleNumberInput('year', e)} onKeyDown={(e) => handleNumberKeyPress('year', e)} onBlur={() => handleInputBlur('year')} placeholder={t('seller.listings.form.yearPlaceholder')} />
                <ErrorMessage fieldName="year" />
              </div>
              {editType === 'vehicle' ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      {t('seller.listings.form.mileage')} <span className="text-red-600 font-bold">*</span>
                    </label>
                    <input type="number" className={getInputClass('mileage')} value={formData.mileage || ''} onChange={(e) => handleNumberInput('mileage', e)} onKeyDown={(e) => handleNumberKeyPress('mileage', e)} onBlur={() => handleInputBlur('mileage')} placeholder={t('seller.listings.form.mileagePlaceholder')} />
                    <ErrorMessage fieldName="mileage" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      {t('seller.listings.form.brand')} <span className="text-red-600 font-bold">*</span>
                    </label>
                    <input className={getInputClass('brand')} value={formData.brand || ''} onChange={(e) => handleInputChange('brand', e.target.value)} onBlur={() => handleInputBlur('brand')} placeholder={t('seller.listings.form.brandPlaceholder')} />
                    <ErrorMessage fieldName="brand" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      {t('seller.listings.form.model')} <span className="text-red-600 font-bold">*</span>
                    </label>
                    <input className={getInputClass('model')} value={formData.model || ''} onChange={(e) => handleInputChange('model', e.target.value)} onBlur={() => handleInputBlur('model')} placeholder={t('seller.listings.form.modelPlaceholder')} />
                    <ErrorMessage fieldName="model" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      {t('seller.listings.form.capacity')} <span className="text-red-600 font-bold">*</span>
                    </label>
                    <input type="number" className={getInputClass('capacity')} value={formData.capacity || ''} onChange={(e) => handleNumberInput('capacity', e)} onKeyDown={(e) => handleNumberKeyPress('capacity', e)} onBlur={() => handleInputBlur('capacity')} placeholder={t('seller.listings.form.capacityPlaceholder')} />
                    <ErrorMessage fieldName="capacity" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      {t('seller.listings.form.health')} <span className="text-red-600 font-bold">*</span>
                    </label>
                    <input type="number" className={getInputClass('health')} value={formData.health || ''} onChange={(e) => handleNumberInput('health', e)} onKeyDown={(e) => handleNumberKeyPress('health', e)} onBlur={() => handleInputBlur('health')} placeholder={t('seller.listings.form.healthPlaceholder')} />
                    <ErrorMessage fieldName="health" />
                  </div>
                </>
              )}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  {t('seller.listings.form.description')} <span className="text-red-600 font-bold">*</span>
                </label>
                <textarea className={getInputClass('description')} rows={4} value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} onBlur={() => handleInputBlur('description')} placeholder={t('seller.listings.form.descriptionPlaceholder')} />
                <ErrorMessage fieldName="description" />
              </div>
              
              {/* Image Management Section */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-3">{t('seller.addListing.fields.uploadPhotos')}</label>
                
                {/* Existing Images */}
                {editImages.length > 0 && (
                  <div className="mb-4">
                    {/* <h4 className="text-sm font-medium mb-2">Hình ảnh hiện tại:</h4> */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {editImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`existing-${index}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <button
                            onClick={() => removeExistingImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* New Images */}
                {imagePreviews.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">{t('seller.listings.newImages')}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`new-${index}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <button
                            onClick={() => removeNewImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Add Images Button */}
                <button
                  onClick={openFilePicker}
                  className="w-full py-4 px-6 border-2 border-dashed border-gray-400 rounded-lg text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>{t('seller.listings.addNewImages')}</span>
                </button>
              </div>
            </div>
          </div>
            
            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-8 py-6 rounded-b-2xl border-t border-gray-200 flex justify-end gap-4">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all font-bold shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {t('seller.listings.cancel')}
              </button>
              <button 
                onClick={onSave} 
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-bold shadow-md hover:shadow-lg transform hover:scale-105 duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('seller.listings.saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyListings
