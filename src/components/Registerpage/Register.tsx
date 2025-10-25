"use client";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import colors from "../../Utils/Color";
import { useI18nContext } from "../../providers/I18nProvider";
import { registerUser, storeAuthToken } from "../../services";
import { useToast } from "../../providers/ToastProvider";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, easeOut, easeIn } from "framer-motion";
import Link from "next/link";

// Helper function to map server errors to i18n keys
const getLocalizedErrorMessage = (serverMessage: string, t: any): string => {
  const lowerMessage = serverMessage.toLowerCase();
  if (lowerMessage.includes("email") && lowerMessage.includes("exist")) {
    return t("auth.register.emailExists", "Email này đã được sử dụng");
  }
  if (lowerMessage.includes("password") && lowerMessage.includes("short")) {
    return t(
      "auth.register.passwordTooShort",
      "Mật khẩu phải có ít nhất 8 ký tự"
    );
  }
  if (lowerMessage.includes("email") && lowerMessage.includes("invalid")) {
    return t("auth.register.invalidEmail", "Định dạng email không hợp lệ");
  }
  if (lowerMessage.includes("network") || lowerMessage.includes("server")) {
    return t(
      "auth.register.networkError",
      "Lỗi mạng hoặc server không khả dụng"
    );
  }
  return t("auth.register.registerFailed", "Đăng ký thất bại");
};

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18nContext();
  const toast = useToast();
  const router = useRouter();

  const handleGoogleLoginClick = () => {
    // TODO: Implement Google login later
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (password !== confirmPassword) {
      toast.error(
        t("auth.register.passwordMismatch", "Mật khẩu xác nhận không khớp!")
      );
      setIsLoading(false);
      return;
    }
    try {
      const response = await registerUser({
        email,
        password,
        name,
      });
      if (response.success) {
        const accessToken = response.data?.accessToken;
        if (accessToken) {
          // Use JWT's own expiration time for new registrations
          storeAuthToken(accessToken);
          console.log('🔐 Registration - using JWT expiration');
          toast.success(
            t(
              "auth.register.registerSuccess",
              "Đăng ký thành công! Đang chuyển hướng đến trang chủ..."
            )
          );
          setTimeout(() => {
            router.push("/");
          }, 1500);
        } else {
          toast.success(
            t(
              "auth.register.registerSuccess",
              "Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập..."
            )
          );
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      } else {
        toast.error(getLocalizedErrorMessage(response.message || "", t));
      }
    } catch (error) {
      toast.error(
        t("auth.register.unexpectedError", "Đã xảy ra lỗi không mong muốn")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fade up animation for page transition and fields
  const fadeUpPage = {
    initial: { opacity: 0, y: 60 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: easeOut },
    },
    exit: { opacity: 0, y: 60, transition: { duration: 0.5, ease: easeIn } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 32 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: easeOut, delay: i * 0.08 },
    }),
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="register-page"
        variants={fadeUpPage}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden"
      >
        {/* Decorative background shapes */}
        <div className="absolute top-0 left-0 w-1/2 h-1/2 pointer-events-none z-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-blue-400/30 via-blue-300/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-40 left-40 w-60 h-60 bg-gradient-to-tr from-green-300/20 via-blue-200/10 to-transparent rounded-full blur-2xl" />
        </div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 pointer-events-none z-0">
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-tr from-indigo-400/30 via-blue-200/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-40 w-60 h-60 bg-gradient-to-br from-blue-300/20 via-green-200/10 to-transparent rounded-full blur-2xl" />
        </div>

        <motion.div
          className="w-full max-w-lg bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-10 border border-blue-100 relative z-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Back to Home Button */}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="absolute left-6 top-6 flex items-center gap-2 px-2 py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium shadow transition-colors duration-200"
          >
            <svg width={18} height={18} fill="none" viewBox="0 0 24 24">
              <path
                d="M15.75 19.5L8.25 12l7.5-7.5"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.09 } },
              hidden: {},
            }}
          >
            <motion.div
              className="mb-8 text-center"
              variants={fadeUp}
              custom={0}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-4xl font-extrabold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent tracking-tight drop-shadow">
                  {t("brand", "EcoTrade EV")}
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                {t("auth.register.title", "Đăng ký tài khoản")}
              </h2>
              <p className="text-slate-500">
                {t(
                  "auth.register.subtitle",
                  "Hãy nhập tên và địa chỉ email của bạn"
                )}
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <motion.div variants={fadeUp} custom={1}>
                <label className="block text-sm font-medium mb-2 text-slate-700">
                  {t("auth.register.nameLabel", "Họ và tên")}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50 text-slate-700 shadow-sm"
                  style={{
                    borderColor: colors.Border,
                  }}
                  placeholder={t(
                    "auth.register.namePlaceholder",
                    "Nhập họ và tên của bạn"
                  )}
                  required
                />
              </motion.div>

              {/* Email Field */}
              <motion.div variants={fadeUp} custom={2}>
                <label className="block text-sm font-medium mb-2 text-slate-700">
                  {t("auth.register.emailLabel", "Địa chỉ Email")}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50 text-slate-700 shadow-sm"
                    style={{
                      borderColor: colors.Border,
                    }}
                    placeholder={t(
                      "auth.register.emailPlaceholder",
                      "example@email.com"
                    )}
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400">
                    <svg width={20} height={20} fill="none" viewBox="0 0 24 24">
                      <path
                        d="M2.25 6.75A2.25 2.25 0 0 1 4.5 4.5h15a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-15A2.25 2.25 0 0 1 2.25 17.25V6.75Zm0 0 9.75 6.75 9.75-6.75"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div variants={fadeUp} custom={3}>
                <label className="block text-sm font-medium mb-2 text-slate-700">
                  {t("auth.register.passwordLabel", "Mật khẩu")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50 text-slate-700 shadow-sm"
                    style={{
                      borderColor: colors.Border,
                    }}
                    placeholder={t(
                      "auth.register.passwordPlaceholder",
                      "Nhập mật khẩu"
                    )}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-blue-50 transition-colors duration-200 text-slate-400"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div variants={fadeUp} custom={4}>
                <label className="block text-sm font-medium mb-2 text-slate-700">
                  {t("auth.register.confirmPasswordLabel", "Xác nhận mật khẩu")}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50 text-slate-700 shadow-sm"
                    style={{
                      borderColor: colors.Border,
                    }}
                    placeholder={t(
                      "auth.register.confirmPasswordPlaceholder",
                      "Nhập lại mật khẩu"
                    )}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-blue-50 transition-colors duration-200 text-slate-400"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Terms Agreement */}
              <motion.div
                className="flex items-start"
                variants={fadeUp}
                custom={5}
              >
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  required
                />
                <label className="ml-2 text-sm cursor-pointer text-slate-500">
                  {t("auth.register.agreeTerms", "Tôi đồng ý với")}{" "}
                  <Link
                    href="#"
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    {t("auth.register.terms", "Điều khoản")}
                  </Link>{" "}
                  và{" "}
                  <Link
                    href="#"
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    {t("auth.register.privacy", "Chính sách bảo mật")}
                  </Link>
                </label>
              </motion.div>

              {/* Register Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                variants={fadeUp}
                custom={6}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {t("common.loading", "Đang tải...")}
                  </div>
                ) : (
                  t("auth.register.registerButton", "Đăng ký ngay")
                )}
              </motion.button>

              {/* Or divider */}
              <motion.div
                className="relative my-6"
                variants={fadeUp}
                custom={7}
              >
                <div className="absolute inset-0 flex items-center">
                  <div
                    className="w-full border-t"
                    style={{ borderColor: colors.Border }}
                  ></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 text-slate-400 bg-white">
                    {t("auth.register.orRegisterWith", "Hoặc đăng ký bằng")}
                  </span>
                </div>
              </motion.div>

              {/* Social Register */}
              <motion.div
                className="flex justify-center"
                variants={fadeUp}
                custom={8}
              >
                <button
                  type="button"
                  onClick={handleGoogleLoginClick}
                  className="flex items-center justify-center px-6 py-3 border rounded-xl hover:bg-blue-50 transition-colors duration-200 w-full max-w-xs shadow-sm"
                  style={{ borderColor: colors.Border }}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-slate-700">
                    Google
                  </span>
                </button>
              </motion.div>

              {/* Login Link */}
              <motion.div
                className="text-center mt-6"
                variants={fadeUp}
                custom={9}
              >
                <p className="text-sm text-slate-500">
                  {t("auth.register.haveAccount", "Đã có tài khoản?")}{" "}
                  <Link
                    href="login"
                    className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  >
                    {t("auth.register.signIn", "Đăng nhập")}
                  </Link>
                </p>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default Register;
