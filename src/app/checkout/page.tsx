"use client"
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Checkout from '@/components/CheckOutpage/Checkout'
import MemberOnlyWrapper from '@/components/common/MemberOnlyWrapper'

export default function CheckoutPage() {
  return (
    <MemberOnlyWrapper>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Checkout />
        <Footer />
      </div>
    </MemberOnlyWrapper>
  )
}
