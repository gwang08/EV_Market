import React from "react";
import { Mail, Save } from "lucide-react";
import colors from "../../Utils/Color";
import { useI18nContext } from "../../providers/I18nProvider";
import { type User as UserType } from "../../services";

interface ProfileTabProps {
  user: UserType | null;
  formData: {
    name: string;
    email: string;
  };
  saving: boolean;
  onInputChange: (field: string, value: string) => void;
  onSave: () => void;
}

function ProfileTab({
  user,
  formData,
  saving,
  onInputChange,
  onSave,
}: ProfileTabProps) {
  const { t } = useI18nContext();

  return (
    <div className="w-full">
      <h2 className="text-3xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900">
        {t("profile.profileTab.title", "Profile Information")}
      </h2>
      <div className="space-y-8">
        {/* Name Field */}
        <div>
          <label className="block text-base font-semibold mb-2 text-blue-900">
            {t("profile.profileTab.fullName", "Full Name")}
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onInputChange("name", e.target.value)}
            className="w-full px-5 py-4 rounded-xl border-2 border-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg font-medium text-blue-900 bg-gradient-to-r from-blue-50 to-indigo-50"
            placeholder={t(
              "profile.profileTab.fullNamePlaceholder",
              "Enter your full name"
            )}
          />
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-base font-semibold mb-2 text-blue-900">
            {t("profile.profileTab.email", "Email Address")}
          </label>
          <div className="relative">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => onInputChange("email", e.target.value)}
              className="w-full px-5 py-4 pr-14 rounded-xl border-2 border-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg font-medium text-blue-900 bg-gradient-to-r from-blue-50 to-indigo-50"
              placeholder={t(
                "profile.profileTab.emailPlaceholder",
                "Enter your email address"
              )}
            />
            <Mail
              className="absolute right-5 top-1/2 transform -translate-y-1/2 text-blue-400"
              size={22}
            />
          </div>
        </div>

        {/* Account Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-base font-semibold mb-2 text-blue-900">
              {t("profile.profileTab.accountRole", "Account Role")}
            </label>
            <div className="px-5 py-4 rounded-xl border-2 border-blue-100 bg-blue-50">
              <span className="capitalize text-blue-700 font-semibold">
                {user?.role.toLowerCase()}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-base font-semibold mb-2 text-blue-900">
              {t("profile.profileTab.memberSince", "Member Since")}
            </label>
            <div className="px-5 py-4 rounded-xl border-2 border-blue-100 bg-blue-50">
              <span className="text-blue-700 font-semibold">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <button
            onClick={onSave}
            disabled={saving}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-300 flex items-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t("profile.profileTab.saving", "Saving...")}
              </>
            ) : (
              <>
                <Save size={18} />
                {t("profile.profileTab.saveChanges", "Save Changes")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileTab;
