'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { storeAuthToken } from '../../../services'
import { useI18nContext } from '../../../providers/I18nProvider'

export default function AuthSuccess() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useI18nContext()
  const [status, setStatus] = useState('processing')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        // Get access token from query parameters
        const accessToken = searchParams.get('accessToken')

     

        if (accessToken) {
          
          // Store the access token using JWT's own expiration
          storeAuthToken(accessToken)
          console.log('🔐 Google Auth - using JWT expiration')
          
          setStatus('success')
          
          // Redirect to home page after a short delay
          setTimeout(() => {
            router.replace('/')
          }, 2000)
        } else {
          
          setErrorMessage(t('auth.google.noTokenError', 'Không tìm thấy token xác thực trong URL'))
          setStatus('error')
          
          // Redirect to login page after delay
          setTimeout(() => {
            router.replace('/login')
          }, 5000)
        }
      } catch (error) {
        console.error('❌ Google Auth - Error processing success:', error)
        setErrorMessage(t('auth.google.processingError', 'Có lỗi xảy ra khi xử lý xác thực'))
        setStatus('error')
        
        // Redirect to login page after delay
        setTimeout(() => {
          router.replace('/login')
        }, 5000)
      }
    }

    // Add a small delay to ensure searchParams are ready
    const timer = setTimeout(handleAuthSuccess, 100)
    
    return () => clearTimeout(timer)
  }, [searchParams, router, t])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center">
          {status === 'processing' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t('auth.google.processing', 'Đang xử lý đăng nhập...')}
              </h2>
              <p className="text-gray-600">
                {t('auth.google.processingDesc', 'Vui lòng đợi trong giây lát')}
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="rounded-full h-12 w-12 bg-green-100 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t('auth.google.success', 'Đăng nhập thành công!')}
              </h2>
              <p className="text-gray-600">
                {t('auth.google.successDesc', 'Đang chuyển hướng về trang chủ...')}
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="rounded-full h-12 w-12 bg-red-100 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t('auth.google.error', 'Đăng nhập thất bại')}
              </h2>
              <p className="text-gray-600 mb-4">
                {errorMessage || t('auth.google.errorDesc', 'Có lỗi xảy ra trong quá trình đăng nhập. Đang chuyển về trang đăng nhập...')}
              </p>
              
              <div className="space-y-2 text-sm text-gray-500 mb-4 p-3 bg-gray-100 rounded-lg">
                <p><strong>URL hiện tại:</strong></p>
                <p className="break-all text-xs">{typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
                <p><strong>Query params:</strong> {searchParams.toString() || 'Không có'}</p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.replace('/login')}
                  className="w-full bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  {t('auth.google.backToLogin', 'Quay lại đăng nhập')}
                </button>
                
                <p className="text-xs text-gray-400">
                  Tự động chuyển hướng sau 5 giây...
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
