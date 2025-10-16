"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { useI18nContext } from '../../providers/I18nProvider'
import colors from '../../Utils/Color'
import Image from 'next/image'
import { ChevronDown, Shield, RotateCcw, Headphones, Wallet as WalletIcon, QrCode } from 'lucide-react'
import { getWalletBalance, formatCurrency, openPaymentUrl } from '@/services/Wallet'
import { ensureValidToken } from '@/services/Auth'
import { checkout, payWithWallet } from '@/services/Checkout'
import { useSearchParams, useRouter } from 'next/navigation'
import { getVehicleById, type Vehicle } from '@/services/Vehicle'
import { getBatteryById, type Battery } from '@/services/Battery'
import { useToast } from '../../providers/ToastProvider'

export default function Checkout() {
  const { t } = useI18nContext()
  const toast = useToast()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'wallet' | 'qr'>('wallet')
  const [isOrderSummaryExpanded, setIsOrderSummaryExpanded] = useState(true)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    billingAddress: '',
    // Card fields removed; not used anymore
  })

  const [termsAccepted, setTermsAccepted] = useState(false)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [balanceError, setBalanceError] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [processing, setProcessing] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  const listingId = searchParams.get('listingId') || ''
  const rawListingType = (searchParams.get('listingType') || '').toUpperCase()
  const listingType: 'VEHICLE' | 'BATTERY' | '' =
    rawListingType === 'VEHICLE' || rawListingType === 'BATTERY' ? (rawListingType as any) : ''

  // Product state
  const [productLoading, setProductLoading] = useState(false)
  const [productError, setProductError] = useState<string | null>(null)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [battery, setBattery] = useState<Battery | null>(null)

  const [qrOpen, setQrOpen] = useState(false)
  const [paymentLinks, setPaymentLinks] = useState<{ payUrl?: string; deeplink?: string; qrCodeUrl?: string } | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Pricing derived from product price
  const [orderPricing, setOrderPricing] = useState({
    productPrice: 0,
    serviceFee: 0,
    vat: 0,
    discount: 0,
  })
  const totalAmount = useMemo(() => {
    return orderPricing.productPrice + orderPricing.serviceFee + orderPricing.vat - orderPricing.discount
  }, [orderPricing])

  const orderData = {
    product: {
      name:
        listingType === 'VEHICLE'
          ? vehicle?.title || '--'
          : listingType === 'BATTERY'
          ? battery?.title || '--'
          : '--',
      brand:
        listingType === 'VEHICLE'
          ? vehicle?.brand || '--'
          : listingType === 'BATTERY'
          ? battery?.brand || '--'
          : '--',
      year:
        listingType === 'VEHICLE'
          ? vehicle?.year || '--'
          : listingType === 'BATTERY'
          ? battery?.year || '--'
          : '--',
      batteryCapacity:
        listingType === 'VEHICLE'
          ? vehicle?.specifications?.batteryAndCharging?.batteryCapacity || '--'
          : listingType === 'BATTERY'
          ? `${battery?.capacity ?? '--'} kWh`
          : '--',
      mileage: listingType === 'VEHICLE' ? `${vehicle?.mileage?.toLocaleString() ?? '--'} km` : '--',
      condition: listingType === 'VEHICLE' ? (vehicle?.status ?? '--') : listingType === 'BATTERY' ? (battery?.status ?? '--') : '--',
      price: formatCurrency(orderPricing.productPrice)
    },
    breakdown: {
      productPrice: formatCurrency(orderPricing.productPrice),
      serviceFee: formatCurrency(orderPricing.serviceFee),
      vat: formatCurrency(orderPricing.vat),
      discount: orderPricing.discount > 0 ? `-${formatCurrency(orderPricing.discount)}` : formatCurrency(0),
      total: formatCurrency(totalAmount)
    }
  }

  // Load product by listingId and listingType
  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!listingId || !listingType) return
      try {
        setProductLoading(true)
        setProductError(null)
        if (listingType === 'VEHICLE') {
          const res = await getVehicleById(listingId)
          if (!mounted) return
          const v = (res.data && (res.data as any).vehicle) ? (res.data as any).vehicle : (res.data as any)
          
          // Check if vehicle is already sold
          if (v?.status === 'SOLD') {
            toast.error('Sản phẩm này đã được bán. Vui lòng chọn sản phẩm khác.')
            setTimeout(() => router.push('/vehicles'), 1500)
            return
          }
          
          setVehicle(v as Vehicle)
          const price = (v?.price as number) || 0
          // Simple fee model: 1% service fee, 10% VAT on product price, no discount
          setOrderPricing({
            productPrice: price,
            serviceFee: Math.round(price * 0.01),
            vat: Math.round(price * 0.1),
            discount: 0,
          })
        } else if (listingType === 'BATTERY') {
          const res = await getBatteryById(listingId)
          if (!mounted) return
          const b = (res.data && (res.data as any).battery) ? (res.data as any).battery : (res.data as any)
          
          // Check if battery is already sold
          if (b?.status === 'SOLD') {
            toast.error('Sản phẩm này đã được bán. Vui lòng chọn sản phẩm khác.')
            setTimeout(() => router.push('/batteries'), 1500)
            return
          }
          
          setBattery(b as Battery)
          const price = (b?.price as number) || 0
          setOrderPricing({
            productPrice: price,
            serviceFee: Math.round(price * 0.01),
            vat: Math.round(price * 0.1),
            discount: 0,
          })
        }
      } catch (err: any) {
        if (!mounted) return
        setProductError(err?.message || 'Failed to load product')
      } finally {
        if (mounted) setProductLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [listingId, listingType, toast, router])

  // Load wallet balance on mount
  useEffect(() => {
    let mounted = true
    
    // Check if this is a MoMo callback (has resultCode param)
    const resultCode = searchParams.get('resultCode')
    const orderId = searchParams.get('orderId')
    
    if (resultCode !== null) {
      // This is a MoMo payment callback
      if (resultCode === '0') {
        // Success
        toast.success('Thanh toán MoMo thành công! Đơn hàng của bạn đã được xác nhận.')
        setTimeout(() => router.push('/'), 1500)
      } else {
        // Failed
        toast.error(`Thanh toán MoMo thất bại. Mã lỗi: ${resultCode}`)
        setTimeout(() => router.push('/'), 2000)
      }
      return // Don't proceed with normal auth check
    }
    
    // Normal flow: Client-side auth guard
    (async () => {
      try {
        const token = await ensureValidToken()
        if (!token) {
          const redirectUrl = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/checkout'
          router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
          return
        }
      } catch {
        const redirectUrl = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/checkout'
        router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
        return
      }
    })()
    
    const loadBalance = async () => {
      try {
        setBalanceLoading(true)
        setBalanceError(null)
        const res = await getWalletBalance()
        if (!mounted) return
        setWalletBalance(res.data?.availableBalance ?? null)
      } catch (err: any) {
        if (!mounted) return
        setBalanceError(err?.message || 'Failed to load wallet balance')
      } finally {
        if (mounted) setBalanceLoading(false)
      }
    }
    loadBalance()
    return () => { mounted = false }
  }, [searchParams, router])

  const sufficientBalance = useMemo(() => {
    if (walletBalance == null) return false
    return walletBalance >= totalAmount
  }, [walletBalance, totalAmount])

  const handlePay = async () => {
    if (!termsAccepted) return
    if (!listingId || !listingType) {
      toast.error('Thiếu thông tin sản phẩm. Vui lòng quay lại trang chi tiết và thử lại.')
      return
    }
    setProcessing(true)
    try {
      const res = await checkout({
        listingId,
        listingType: listingType as 'VEHICLE' | 'BATTERY',
        paymentMethod: selectedPaymentMethod === 'qr' ? 'MOMO' : 'WALLET'
      })

      if (selectedPaymentMethod === 'qr') {
        const source = (res?.data && (res.data as any).paymentInfo) ? (res.data as any).paymentInfo : (res?.data as any)
        const payUrl = source?.payUrl
        const deeplink = source?.deeplink
        const qrCodeUrl = source?.qrCodeUrl
        if (payUrl) {
          openPaymentUrl(payUrl, '_blank')
        } else if (deeplink || qrCodeUrl) {
          setPaymentLinks({ payUrl, deeplink, qrCodeUrl })
          setQrOpen(true)
        } else {
          toast.error('Không tìm thấy liên kết thanh toán MoMo.')
        }
      } else {
        // WALLET flow: two-step, requires transactionId
        const transactionId = (res as any)?.data?.transactionId
        if (!transactionId) {
          toast.error('Không tìm thấy transactionId để thanh toán ví.')
          return
        }
        try {
          const payRes = await payWithWallet(transactionId)
          try {
            const bal = await getWalletBalance()
            setWalletBalance(bal.data?.availableBalance ?? null)
          } catch {}
          toast.success(payRes?.message || 'Thanh toán bằng ví thành công!')
          setTimeout(() => router.push('/'), 1500)
        } catch (e: any) {
          toast.error(e?.message || 'Thanh toán ví thất bại')
        }
      }
    } catch (error: any) {
      toast.error(error?.message || 'Thanh toán thất bại')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <div className="space-y-8">
        {/* Checkout Content */}
        <div className="space-y-8">
          {/* Checkout Title */}
          <h1 className="text-3xl font-bold" style={{color: colors.Text}}>
            {t('checkout.title')}
          </h1>

          {/* Order Summary Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setIsOrderSummaryExpanded(!isOrderSummaryExpanded)}
            >
              <h2 className="text-lg font-semibold" style={{color: colors.Text}}>
                {t('checkout.orderSummary')}
              </h2>
              <ChevronDown 
                className={`w-5 h-5 transition-transform duration-200 ${
                  isOrderSummaryExpanded ? 'rotate-180' : ''
                }`}
                style={{color: colors.SubText}}
              />
            </div>
            
            {isOrderSummaryExpanded && (
              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <Image
                      src={
                        listingType === 'VEHICLE'
                          ? (vehicle?.images?.[0] || '/Homepage/TopCar.png')
                          : listingType === 'BATTERY'
                          ? (battery?.images?.[0] || '/Homepage/Pin.png')
                          : '/Homepage/TopCar.png'
                      }
                      alt={orderData.product.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded">
                        {orderData.product.brand}
                      </span>
                      <h3 className="font-semibold" style={{color: colors.Text}}>
                        {orderData.product.name}
                      </h3>
                    </div>
                    <div className="space-y-1 text-sm" style={{color: colors.SubText}}>
                      <p>{t('checkout.productDetails.year')}: {orderData.product.year}</p>
                      <p>{t('checkout.productDetails.batteryCapacity')}: {orderData.product.batteryCapacity}</p>
                      {listingType === 'VEHICLE' && (
                        <p>{t('checkout.productDetails.mileage')}: {orderData.product.mileage}</p>
                      )}
                      <p>{t('checkout.productDetails.condition')}: {orderData.product.condition}</p>
                    </div>
                    {productError && (
                      <p className="text-sm text-red-600 mt-2">{productError}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">
                      {orderData.product.price}
                    </p>
                  </div>
                </div>
                {productLoading && (
                  <div className="text-sm text-gray-500">Đang tải sản phẩm...</div>
                )}
              </div>
            )}
          </div>

          

          {/* Payment Method */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-6" style={{color: colors.Text}}>
              {t('checkout.paymentMethod')}
            </h2>
            
            <div className="space-y-4">
              {/* Wallet Method */}
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  selectedPaymentMethod === 'wallet' 
                    ? 'border-green-500 bg-green-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPaymentMethod('wallet')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                      <WalletIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium" style={{color: colors.Text}}>
                      Thanh toán bằng số dư ví
                    </span>
                  </div>
                  <div className="text-right">
                    {balanceLoading ? (
                      <span className="text-sm text-gray-500">Đang tải số dư...</span>
                    ) : balanceError ? (
                      <span className="text-sm text-red-600">{balanceError}</span>
                    ) : (
                      <span className={`text-sm font-medium ${sufficientBalance ? 'text-green-600' : 'text-yellow-600'}`}>
                        Số dư: {walletBalance != null ? formatCurrency(walletBalance) : '--'}
                      </span>
                    )}
                  </div>
                </div>
                {walletBalance != null && (
                  <p className={`mt-2 text-sm ${sufficientBalance ? 'text-green-600' : 'text-red-600'}`}>
                    {sufficientBalance ? 'Số dư đủ để thanh toán đơn này.' : 'Số dư chưa đủ cho đơn này.'}
                  </p>
                )}
              </div>

              {/* QR Method */}
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  selectedPaymentMethod === 'qr' 
                    ? 'border-green-500 bg-green-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPaymentMethod('qr')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <QrCode className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium" style={{color: colors.Text}}>
                    Quét mã QR để thanh toán
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500">Chúng tôi sẽ mở trang thanh toán của đối tác (VD: MoMo) với số tiền tương ứng.</p>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mt-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <span className="text-sm" style={{color: colors.SubText}}>
                  Tôi đồng ý với{' '}
                  <a href="#" className="text-green-600 hover:text-green-700 underline">
                    Điều khoản và Điều kiện
                  </a>
                  {' '}cũng như{' '}
                  <a href="#" className="text-green-600 hover:text-green-700 underline">
                    Chính sách Bảo mật
                  </a>
                  {' '}của EV Market.
                </span>
              </label>
            </div>

            {/* Complete Payment Button */}
            <button
              disabled={!termsAccepted || processing}
              onClick={handlePay}
              className={`w-full mt-6 py-3 px-6 text-white font-semibold rounded-lg transition-all duration-300 ${
                !termsAccepted || processing
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transform hover:scale-105'
              }`}
            >
              {processing ? 'Đang xử lý...' : t('checkout.completePayment')}
            </button>
          </div>
        </div>

        {/* Security Information */}
        <div className="space-y-4">
          {/* Secure Payment */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">
                  {t('checkout.security.securePayment')}
                </h3>
                <p className="text-sm text-green-600">
                  {t('checkout.security.secureDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Refund Policy */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-800">
                  {t('checkout.security.refundPolicy')}
                </h3>
                <p className="text-sm text-blue-600">
                  {t('checkout.security.refundDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* 24/7 Support */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Headphones className="w-5 h-5 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-800">
                  {t('checkout.security.support24')}
                </h3>
                <p className="text-sm text-yellow-600">
                  {t('checkout.security.supportDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {qrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4" style={{color: colors.Text}}>Quét mã QR để thanh toán</h3>
            <div className="flex flex-col items-center">
              <div className="p-4 bg-white rounded-lg border">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(paymentLinks?.qrCodeUrl || paymentLinks?.deeplink || paymentLinks?.payUrl || '')}`}
                  alt="MoMo QR"
                  className="w-64 h-64"
                />
              </div>
              <div className="mt-4 w-full space-y-2">
                <button
                  onClick={() => openPaymentUrl(paymentLinks?.deeplink || paymentLinks?.payUrl || '', '_blank')}
                  className="w-full py-2.5 rounded-lg text-white font-medium bg-gradient-to-r from-[#22C55E] to-[#2563EB] hover:opacity-90"
                >
                  Mở MoMo
                </button>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(paymentLinks?.deeplink || paymentLinks?.payUrl || '')
                      toast.success('Đã sao chép liên kết thanh toán')
                    } catch {
                      toast.error('Không thể sao chép liên kết')
                    }
                  }}
                  className="w-full py-2.5 rounded-lg font-medium border hover:bg-gray-50"
                >
                  Sao chép liên kết
                </button>
                <button
                  onClick={() => setQrOpen(false)}
                  className="w-full py-2.5 rounded-lg font-medium border"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
