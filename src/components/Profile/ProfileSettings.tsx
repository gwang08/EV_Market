"use client"
import React, { useState, useEffect } from 'react'
import { X, Check, AlertCircle } from 'lucide-react'
import colors from '../../Utils/Color'
import { useI18nContext } from '../../providers/I18nProvider'
import { getUserProfile, updateUserProfile, uploadAvatar, logoutUser, type User as UserType } from '../../services'
import ProfileSidebar from './ProfileSidebar'
import ProfileTab from './ProfileTab'
import SecurityTab from './SecurityTab'

interface ProfileSettingsProps {}

function ProfileSettings({}: ProfileSettingsProps) {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { t } = useI18nContext()

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Load user profile
  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    setLoading(true)
    
    
    try {
      const response = await getUserProfile()
      if (response.success && response.data?.user) {
        setUser(response.data.user)
        setFormData({
          name: response.data.user.name,
          email: response.data.user.email,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        setError(response.message || t('profile.settings.loadFailed', 'Failed to load profile'))
      }
    } catch (error) {
      setError(t('profile.settings.loadFailed', 'Failed to load profile'))
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(null)
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await updateUserProfile({
        name: formData.name,
        email: formData.email
      })

      if (response.success) {
        setSuccess(t('profile.settings.updateSuccess', 'Profile updated successfully!'))
        if (response.data?.user) {
          setUser(response.data.user)
        }
      } else {
        setError(response.message || t('profile.settings.updateFailed', 'Failed to update profile'))
      }
    } catch (error) {
      setError(t('profile.settings.updateFailed', 'Failed to update profile'))
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(t('profile.settings.invalidImageFile', 'Please select a valid image file'))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(t('profile.settings.fileSizeError', 'File size must be less than 5MB'))
      return
    }

    setUploadingAvatar(true)
    setError(null)

    try {
      const response = await uploadAvatar(file)
      if (response.success) {
        setSuccess(t('profile.settings.avatarUpdateSuccess', 'Avatar updated successfully!'))
        if (response.data?.user) {
          setUser(response.data.user)
        }
      } else {
        setError(response.message || t('profile.settings.avatarUploadFailed', 'Failed to upload avatar'))
      }
    } catch (error) {
      setError(t('profile.settings.avatarUploadFailed', 'Failed to upload avatar'))
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleTogglePassword = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleUpdatePassword = () => {
    // TODO: Implement password update logic
    console.log('Update password:', formData)
  }

  if (loading) {
    return (
      <div className="min-h-screen " style={{backgroundColor: colors.Background}}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Skeleton UI for Profile Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse mb-4"></div>
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div>
                </div>
                <div className="space-y-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-10 bg-gray-200 animate-pulse rounded"></div>
                  ))}
                </div>
              </div>
            </div>
            {/* Content Skeleton */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="h-8 bg-gray-200 animate-pulse rounded w-48 mb-6"></div>
                <div className="space-y-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i}>
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-24 mb-2"></div>
                      <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen mt-40" style={{backgroundColor: colors.Background}}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2" >
            {t('profile.settings.title', 'Profile Settings')}
          </h1>
          <p style={{color: colors.SubText}}>
            {t('profile.settings.subtitle', 'Manage your account settings and preferences')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ProfileSidebar
              user={user}
              activeTab={activeTab}
              uploadingAvatar={uploadingAvatar}
              onTabChange={setActiveTab}
              onAvatarUpload={handleAvatarUpload}
              onLogout={handleLogout}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border p-8" style={{borderColor: colors.Border}}>
              {/* Success/Error Messages */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <Check className="text-green-600" size={20} />
                  <span className="text-green-700">{success}</span>
                  <button 
                    onClick={() => setSuccess(null)}
                    className="ml-auto text-green-600 hover:text-green-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                  <AlertCircle className="text-red-600" size={20} />
                  <span className="text-red-700">{error}</span>
                  <button 
                    onClick={() => setError(null)}
                    className="ml-auto text-red-600 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Tab Content */}
              {activeTab === 'profile' && (
                <ProfileTab
                  user={user}
                  formData={{
                    name: formData.name,
                    email: formData.email
                  }}
                  saving={saving}
                  onInputChange={handleInputChange}
                  onSave={handleSaveProfile}
                />
              )}

              {activeTab === 'security' && (
                <SecurityTab
                  formData={{
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                    confirmPassword: formData.confirmPassword
                  }}
                  showPasswords={showPasswords}
                  onInputChange={handleInputChange}
                  onTogglePassword={handleTogglePassword}
                  onUpdatePassword={handleUpdatePassword}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileSettings
