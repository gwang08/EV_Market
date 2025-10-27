import React from "react";
import { Eye, EyeOff } from "lucide-react";
import colors from "../../Utils/Color";
import { useI18nContext } from "../../providers/I18nProvider";

interface SecurityTabProps {
  formData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  showPasswords: {
    current: boolean;
    new: boolean;
    confirm: boolean;
  };
  onInputChange: (field: string, value: string) => void;
  onTogglePassword: (field: "current" | "new" | "confirm") => void;
  onUpdatePassword: () => void;
}

function SecurityTab({
  formData,
  showPasswords,
  onInputChange,
  onTogglePassword,
  onUpdatePassword,
}: SecurityTabProps) {
  const { t } = useI18nContext();

  return (
    <div className="w-full">
      <h2 className="text-3xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900">
        {t("profile.securityTab.title", "Security Settings")}
      </h2>
      <div className="space-y-8">
        {/* Change Password */}
        <div>
          <h3 className="text-xl font-bold mb-5 text-blue-900">
            {t("profile.securityTab.changePassword", "Change Password")}
          </h3>
          <div className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-base font-semibold mb-2 text-blue-900">
                {t("profile.securityTab.currentPassword", "Current Password")}
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) =>
                    onInputChange("currentPassword", e.target.value)
                  }
                  className="w-full px-5 py-4 pr-14 rounded-xl border-2 border-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg font-medium text-blue-900 bg-gradient-to-r from-blue-50 to-indigo-50"
                  placeholder={t(
                    "profile.securityTab.currentPasswordPlaceholder",
                    "Enter your current password"
                  )}
                />
                <button
                  type="button"
                  onClick={() => onTogglePassword("current")}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600"
                  title={
                    showPasswords.current
                      ? t("profile.securityTab.hidePassword", "Hide password")
                      : t("profile.securityTab.showPassword", "Show password")
                  }
                >
                  {showPasswords.current ? (
                    <EyeOff size={22} />
                  ) : (
                    <Eye size={22} />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-base font-semibold mb-2 text-blue-900">
                {t("profile.securityTab.newPassword", "New Password")}
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => onInputChange("newPassword", e.target.value)}
                  className="w-full px-5 py-4 pr-14 rounded-xl border-2 border-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg font-medium text-blue-900 bg-gradient-to-r from-blue-50 to-indigo-50"
                  placeholder={t(
                    "profile.securityTab.newPasswordPlaceholder",
                    "Enter your new password"
                  )}
                />
                <button
                  type="button"
                  onClick={() => onTogglePassword("new")}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600"
                  title={
                    showPasswords.new
                      ? t("profile.securityTab.hidePassword", "Hide password")
                      : t("profile.securityTab.showPassword", "Show password")
                  }
                >
                  {showPasswords.new ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-base font-semibold mb-2 text-blue-900">
                {t(
                  "profile.securityTab.confirmPassword",
                  "Confirm New Password"
                )}
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    onInputChange("confirmPassword", e.target.value)
                  }
                  className="w-full px-5 py-4 pr-14 rounded-xl border-2 border-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg font-medium text-blue-900 bg-gradient-to-r from-blue-50 to-indigo-50"
                  placeholder={t(
                    "profile.securityTab.confirmPasswordPlaceholder",
                    "Confirm your new password"
                  )}
                />
                <button
                  type="button"
                  onClick={() => onTogglePassword("confirm")}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600"
                  title={
                    showPasswords.confirm
                      ? t("profile.securityTab.hidePassword", "Hide password")
                      : t("profile.securityTab.showPassword", "Show password")
                  }
                >
                  {showPasswords.confirm ? (
                    <EyeOff size={22} />
                  ) : (
                    <Eye size={22} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onUpdatePassword}
            className="mt-6 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg"
          >
            {t("profile.securityTab.updatePassword", "Update Password")}
          </button>
        </div>

        {/* Two-Factor Authentication */}
        <div className="border-t-2 pt-8 mt-8 border-blue-100">
          <h3 className="text-xl font-bold mb-5 text-blue-900">
            {t(
              "profile.securityTab.twoFactorAuth",
              "Two-Factor Authentication"
            )}
          </h3>
          <p className="mb-5 text-blue-700">
            {t(
              "profile.securityTab.twoFactorDesc",
              "Add an extra layer of security to your account"
            )}
          </p>
          <button className="px-8 py-4 border-2 border-green-600 text-green-700 hover:bg-green-600 hover:text-white font-bold rounded-xl transition-all duration-300 shadow">
            {t("profile.securityTab.enable2FA", "Enable 2FA")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SecurityTab;
