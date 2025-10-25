"use client";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import colors from "../../Utils/Color";
import { useI18nContext } from "../../providers/I18nProvider";
import { loginUser, storeAuthToken, loginWithGoogle } from "../../services";
import { useToast } from "../../providers/ToastProvider";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, easeOut } from "framer-motion";
import Link from "next/link";

const getLocalizedErrorMessage = (serverMessage: string, t: any): string => {
  const lowerMessage = serverMessage.toLowerCase();
  if (lowerMessage.includes("invalid") || lowerMessage.includes("credential")) {
    return t("auth.login.invalidCredentials", "Email hoặc mật khẩu không đúng");
  }
  if (lowerMessage.includes("network") || lowerMessage.includes("server")) {
    return t("auth.login.networkError", "Lỗi mạng hoặc server không khả dụng");
  }
  return t("auth.login.loginFailed", "Đăng nhập thất bại");
};

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18nContext();
  const toast = useToast();
  const router = useRouter();

  const handleGoogleLoginClick = () => {
    loginWithGoogle();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await loginUser({ email, password });
      const token =
        response.data?.token ||
        response.data?.accessToken ||
        response.data?.access_token;
      
      if (response.success && token) {
        // Use JWT's own expiration time (more accurate)
        // Only use custom expiration if rememberMe is checked
        if (rememberMe) {
          // If remember me is checked, let JWT expiration handle it
          storeAuthToken(token);
          console.log('🔐 Remember me enabled - using JWT expiration');
        } else {
          // If remember me is NOT checked, limit session to 1 hour
          storeAuthToken(token, 1);
          console.log('🔐 Remember me disabled - session limited to 1 hour');
        }
        
        // Get user info from response.data.user if available
        const userFromLogin = response.data?.user;
        
        if (userFromLogin && userFromLogin.role) {
          // Store user info immediately from login response
          const { storeUserInfo } = await import("../../services/Auth");
          storeUserInfo(userFromLogin);
        }
        
        toast.success(t("auth.login.loginSuccess", "Đăng nhập thành công!"));
        
        // Redirect based on role
        const userRole = userFromLogin?.role;
        
        setTimeout(() => {
          if (userRole === "ADMIN") {
            router.push("/admin");
          } else {
            router.push("/");
          }
        }, 1200);
      } else {
        toast.error(getLocalizedErrorMessage(response.message || "", t));
      }
    } catch (error) {
      console.error("❌ Login - Error:", error);
      toast.error(
        t("auth.login.unexpectedError", "Đã xảy ra lỗi không mong muốn")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 32 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: easeOut, delay: i * 0.08 },
    }),
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
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
        <AnimatePresence>
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
                {t("auth.login.title", "Đăng nhập tài khoản")}
              </h2>
              <p className="text-slate-500">
                {t("auth.login.subtitle", "Chào mừng bạn quay lại!")}
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Email Field */}
              <motion.div variants={fadeUp} custom={1}>
                <label className="block text-sm font-medium mb-2 text-slate-700">
                  {t("auth.login.emailLabel", "Địa chỉ Email")}
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
                      "auth.login.emailPlaceholder",
                      "Nhập email của bạn"
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
              <motion.div variants={fadeUp} custom={2}>
                <label className="block text-sm font-medium mb-2 text-slate-700">
                  {t("auth.login.passwordLabel", "Mật khẩu")}
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
                      "auth.login.passwordPlaceholder",
                      "Nhập mật khẩu của bạn"
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

              {/* Remember Me & Forgot Password */}
              <motion.div
                className="flex items-center justify-between"
                variants={fadeUp}
                custom={3}
              >
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-slate-500">
                    {t("auth.login.rememberMe", "Ghi nhớ đăng nhập")}
                  </span>
                </label>
                <Link
                  href="#"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
                >
                  {t("auth.login.forgotPassword", "Quên mật khẩu?")}
                </Link>
              </motion.div>

              {/* Login Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                variants={fadeUp}
                custom={4}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {t("common.loading", "Đang tải...")}
                  </div>
                ) : (
                  t("auth.login.loginButton", "Đăng nhập ngay")
                )}
              </motion.button>

              {/* Or divider */}
              <motion.div
                className="relative my-6"
                variants={fadeUp}
                custom={5}
              >
                <div className="absolute inset-0 flex items-center">
                  <div
                    className="w-full border-t"
                    style={{ borderColor: colors.Border }}
                  ></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 text-slate-400 bg-white">
                    {t("auth.login.orLoginWith", "Hoặc đăng nhập với")}
                  </span>
                </div>
              </motion.div>

              {/* Social Login */}
              <motion.div
                className="flex justify-center"
                variants={fadeUp}
                custom={6}
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

              {/* Sign Up Link */}
              <motion.div
                className="text-center mt-6"
                variants={fadeUp}
                custom={7}
              >
                <p className="text-sm text-slate-500">
                  {t("auth.login.noAccount", "Chưa có tài khoản?")}{" "}
                  <Link
                    href="register"
                    className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  >
                    {t("auth.login.signUpFree", "Đăng ký miễn phí")}
                  </Link>
                </p>
              </motion.div>
            </form>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default Login;
