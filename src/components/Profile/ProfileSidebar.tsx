import React, { useRef } from "react";
import { User, Camera, Shield, LogOut, Check } from "lucide-react";
import Image from "next/image";
import colors from "../../Utils/Color";
import VerifiedBadge from "../common/VerifiedBadge";
import { useI18nContext } from "../../providers/I18nProvider";
import { type User as UserType } from "../../services";

interface ProfileSidebarProps {
  user: UserType | null;
  activeTab: string;
  uploadingAvatar: boolean;
  onTabChange: (tab: string) => void;
  onAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onLogout: () => void;
}

function ProfileSidebar({
  user,
  activeTab,
  uploadingAvatar,
  onTabChange,
  onAvatarUpload,
  onLogout,
}: ProfileSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18nContext();

  const tabs = [
    {
      id: "profile",
      name: t("profile.sidebar.profile", "Profile"),
      icon: User,
    },
    {
      id: "security",
      name: t("profile.sidebar.security", "Security"),
      icon: Shield,
    },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 flex flex-col items-center gap-8">
      {/* User Avatar & Info */}
      <div className="text-center w-full">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-blue-500 shadow-lg border-4 border-blue-100">
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt="Avatar"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200 disabled:opacity-50"
            title={
              uploadingAvatar
                ? t("profile.sidebar.uploading", "Uploading...")
                : t("profile.sidebar.uploadAvatar", "Upload new avatar")
            }
          >
            {uploadingAvatar ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Camera size={18} />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onAvatarUpload}
            className="hidden"
          />
        </div>
        <h3 className="mt-5 font-bold text-xl text-blue-900">{user?.name}</h3>
        <p className="text-sm text-slate-500">{user?.email}</p>
        {user?.isVerified && (
          <div className="mt-2 flex justify-center">
            <VerifiedBadge width={80} height={22} />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="w-full space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left font-semibold transition-all duration-300 shadow-sm border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 ${
                isActive
                  ? "text-blue-700 bg-blue-100 scale-[1.03] shadow-lg"
                  : "text-slate-600"
              }`}
              style={!isActive ? { color: colors.Text } : {}}
            >
              <Icon size={22} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="mt-6 w-full px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow transition-all duration-300 flex items-center justify-center gap-2"
      >
        <LogOut size={20} />
        {t("profile.sidebar.logout", "Logout")}
      </button>
    </div>
  );
}

export default ProfileSidebar;
