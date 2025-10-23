"use client";
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import ProfileSettings from '@/components/Profile/ProfileSettings'
import RoleAuthWrapper from '@/components/common/RoleAuthWrapper'
import React from 'react'

function page() {
  return (
    <RoleAuthWrapper allowedRoles={['MEMBER', 'ADMIN']}>
      <Header />
      <ProfileSettings />
      <Footer />
    </RoleAuthWrapper>
  )
}

export default page