"use client";
import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MyListingsComponent from '@/components/Profile/MyListings'
import MemberOnlyWrapper from '@/components/common/MemberOnlyWrapper'

function MyListingsPage() {
  return (
    <MemberOnlyWrapper>
      <Header />
      <MyListingsComponent />
      <Footer />
    </MemberOnlyWrapper>
  )
}

export default MyListingsPage
