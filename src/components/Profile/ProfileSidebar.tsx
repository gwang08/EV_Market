import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 flex flex-col items-center gap-8"
    >
      {/* User Avatar & Info */}
      <div className="text-center w-full">
        <div className="relative inline-block">
          <motion.div
            initial={{ scale: 0.9, rotate: -8, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-blue-500 shadow-lg border-4 border-blue-100"
          >
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
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
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
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onAvatarUpload}
            className="hidden"
          />
        </div>
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-5 font-bold text-xl text-blue-900"
        >
          {user?.name}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm text-slate-500"
        >
          {user?.email}
        </motion.p>
        {user?.isVerified && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-2 flex justify-center"
          >
            <VerifiedBadge width={80} height={22} />
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="w-full space-y-2">
        <AnimatePresence>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                layout
                initial={false}
                whileHover={{
                  scale: 1.04,
                  boxShadow: "0 4px 24px rgba(60,130,246,0.08)",
                }}
                whileTap={{ scale: 0.98 }}
                animate={
                  isActive
                    ? { scale: 1.08, backgroundColor: "#DBEAFE" }
                    : { scale: 1, backgroundColor: "#F1F5FF" }
                }
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left font-semibold shadow-sm border border-blue-100 focus:outline-none ${
                  isActive
                    ? "text-blue-700 bg-blue-100 shadow-lg"
                    : "text-slate-600 bg-gradient-to-r from-blue-50 to-indigo-50"
                }`}
                style={!isActive ? { color: colors.Text } : {}}
              >
                <Icon size={22} />
                <span>{tab.name}</span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </nav>

      {/* Logout Button */}
      <motion.button
        whileHover={{
          scale: 1.04,
          boxShadow: "0 4px 24px rgba(246,60,60,0.12)",
        }}
        whileTap={{ scale: 0.98 }}
        onClick={onLogout}
        className="mt-6 w-full px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow transition-all duration-300 flex items-center justify-center gap-2"
      >
        <LogOut size={20} />
        {t("profile.sidebar.logout", "Logout")}
      </motion.button>
    </motion.div>
  );
}

export default ProfileSidebar;
