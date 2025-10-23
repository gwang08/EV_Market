"use client";
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import ProfileSettings from '@/components/Profile/ProfileSettings'
import MemberOnlyWrapper from '@/components/common/MemberOnlyWrapper'
import React from 'react'

function page() {
  return (
    <MemberOnlyWrapper>
      <Header />
      <ProfileSettings />
      <Footer />
    </MemberOnlyWrapper>
  )
}

export default page