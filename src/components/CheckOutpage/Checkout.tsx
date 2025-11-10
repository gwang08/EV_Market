"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useI18nContext } from "../../providers/I18nProvider";
import colors from "../../Utils/Color";
import Image from "next/image";
import {
  ChevronDown,
  Shield,
  RotateCcw,
  Headphones,
  Wallet as WalletIcon,
  QrCode,
} from "lucide-react";
import {
  getWalletBalance,
  formatCurrency,
  openPaymentUrl,
} from "@/services/Wallet";
import { ensureValidToken, getUserInfo } from "@/services/Auth";
import { checkout, payWithWallet } from "@/services/Checkout";
import { useSearchParams, useRouter } from "next/navigation";
import { getVehicleById, type Vehicle } from "@/services/Vehicle";
import { getBatteryById, type Battery } from "@/services/Battery";
import { useToast } from "../../providers/ToastProvider";
import { getMyTransactions } from "@/services/Transaction";

export default function Checkout() {
  const { t } = useI18nContext();
  const toast = useToast();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "wallet" | "qr"
  >("wallet");
  const [isOrderSummaryExpanded, setIsOrderSummaryExpanded] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    billingAddress: "",
    // Card fields removed; not used anymore
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const listingId = searchParams.get("listingId") || "";
  const rawListingType = (searchParams.get("listingType") || "").toUpperCase();
  const listingType: "VEHICLE" | "BATTERY" | "" =
    rawListingType === "VEHICLE" || rawListingType === "BATTERY"
      ? (rawListingType as any)
      : "";

  // Product state
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [battery, setBattery] = useState<Battery | null>(null);

  const [qrOpen, setQrOpen] = useState(false);
  const [paymentLinks, setPaymentLinks] = useState<{
    payUrl?: string;
    deeplink?: string;
    qrCodeUrl?: string;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Pricing derived from product price
  const [orderPricing, setOrderPricing] = useState({
    productPrice: 0,
    serviceFee: 0,
    vat: 0,
    discount: 0,
  });
  const totalAmount = useMemo(() => {
    return (
      orderPricing.productPrice +
      orderPricing.serviceFee +
      orderPricing.vat -
      orderPricing.discount
    );
  }, [orderPricing]);

  const orderData = {
    product: {
      name:
        listingType === "VEHICLE"
          ? vehicle?.title || "--"
          : listingType === "BATTERY"
          ? battery?.title || "--"
          : "--",
      brand:
        listingType === "VEHICLE"
          ? vehicle?.brand || "--"
          : listingType === "BATTERY"
          ? battery?.brand || "--"
          : "--",
      year:
        listingType === "VEHICLE"
          ? vehicle?.year || "--"
          : listingType === "BATTERY"
          ? battery?.year || "--"
          : "--",
      batteryCapacity:
        listingType === "VEHICLE"
          ? vehicle?.specifications?.batteryAndCharging?.batteryCapacity || "--"
          : listingType === "BATTERY"
          ? `${battery?.capacity ?? "--"} kWh`
          : "--",
      mileage:
        listingType === "VEHICLE"
          ? `${vehicle?.mileage?.toLocaleString() ?? "--"} km`
          : "--",
      condition:
        listingType === "VEHICLE"
          ? vehicle?.status ?? "--"
          : listingType === "BATTERY"
          ? battery?.status ?? "--"
          : "--",
      price: formatCurrency(orderPricing.productPrice),
    },
    breakdown: {
      productPrice: formatCurrency(orderPricing.productPrice),
      serviceFee: formatCurrency(orderPricing.serviceFee),
      vat: formatCurrency(orderPricing.vat),
      discount:
        orderPricing.discount > 0
          ? `-${formatCurrency(orderPricing.discount)}`
          : formatCurrency(0),
      total: formatCurrency(totalAmount),
    },
  };

  // Load product by listingId and listingType
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!listingId || !listingType) return;
      try {
        setProductLoading(true);
        setProductError(null);

        // Check if user already purchased this product
        try {
          const transactionsRes = await getMyTransactions(1, 100); // Get enough to check
          const alreadyPurchased = transactionsRes.data.transactions.some(
            (t) =>
              (t.vehicleId === listingId || t.batteryId === listingId) &&
              t.status === "COMPLETED"
          );

          if (alreadyPurchased) {
            toast.error(
              "Bạn đã mua sản phẩm này rồi. Đang chuyển đến lịch sử mua hàng..."
            );
            setTimeout(() => router.push("/purchase-history"), 1500);
            return;
          }
        } catch (err) {
          console.log("Could not check purchase history:", err);
          // Continue anyway - don't block checkout if purchase history check fails
        }

        if (listingType === "VEHICLE") {
          const res = await getVehicleById(listingId);
          if (!mounted) return;
          const v =
            res.data && (res.data as any).vehicle
              ? (res.data as any).vehicle
              : (res.data as any);

          // Check if vehicle is already sold
          if (v?.status === "SOLD") {
            toast.error(
              "Sản phẩm này đã được bán. Vui lòng chọn sản phẩm khác."
            );
            setTimeout(() => router.push("/browse"), 1500);
            return;
          }

          setVehicle(v as Vehicle);
          const price = (v?.price as number) || 0;
          // Simple fee model: 1% service fee, 10% VAT on product price, no discount
          setOrderPricing({
            productPrice: price,
            serviceFee: Math.round(price * 0.01),
            vat: Math.round(price * 0.1),
            discount: 0,
          });
        } else if (listingType === "BATTERY") {
          const res = await getBatteryById(listingId);
          if (!mounted) return;
          const b =
            res.data && (res.data as any).battery
              ? (res.data as any).battery
              : (res.data as any);

          // Check if battery is already sold
          if (b?.status === "SOLD") {
            toast.error(
              "Sản phẩm này đã được bán. Vui lòng chọn sản phẩm khác."
            );
            setTimeout(() => router.push("/browse"), 1500);
            return;
          }

          setBattery(b as Battery);
          const price = (b?.price as number) || 0;
          setOrderPricing({
            productPrice: price,
            serviceFee: Math.round(price * 0.01),
            vat: Math.round(price * 0.1),
            discount: 0,
          });
        }
      } catch (err: any) {
        if (!mounted) return;
        setProductError(err?.message || "Failed to load product");
      } finally {
        if (mounted) setProductLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [listingId, listingType, toast, router]);

  // Load wallet balance on mount
  useEffect(() => {
    let mounted = true;

    // Check if this is a MoMo callback (has resultCode param)
    const resultCode = searchParams.get("resultCode");
    const orderId = searchParams.get("orderId");

    if (resultCode !== null) {
      // This is a MoMo payment callback
      if (resultCode === "0") {
        // Success
        toast.success(
          "Thanh toán MoMo thành công! Đơn hàng của bạn đã được xác nhận."
        );
        setTimeout(() => router.push("/purchase-history"), 1500);
      } else {
        // Failed
        toast.error(`Thanh toán MoMo thất bại. Mã lỗi: ${resultCode}`);
        setTimeout(() => router.push("/browse"), 2000);
      }
      return; // Don't proceed with normal auth check
    }

    // Normal flow: Client-side auth guard
    (async () => {
      try {
        const token = await ensureValidToken();
        if (!token) {
          const redirectUrl =
            typeof window !== "undefined"
              ? `${window.location.pathname}${window.location.search}`
              : "/checkout";
          router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
          return;
        }
      } catch {
        const redirectUrl =
          typeof window !== "undefined"
            ? `${window.location.pathname}${window.location.search}`
            : "/checkout";
        router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
        return;
      }
    })();

    const loadBalance = async () => {
      try {
        setBalanceLoading(true);
        setBalanceError(null);
        const res = await getWalletBalance();
        if (!mounted) return;
        setWalletBalance(res.data?.availableBalance ?? null);
      } catch (err: any) {
        if (!mounted) return;
        setBalanceError(err?.message || "Failed to load wallet balance");
      } finally {
        if (mounted) setBalanceLoading(false);
      }
    };
    loadBalance();
    return () => {
      mounted = false;
    };
  }, [searchParams, router]);

  const sufficientBalance = useMemo(() => {
    if (walletBalance == null) return false;
    return walletBalance >= totalAmount;
  }, [walletBalance, totalAmount]);

  const handlePay = async () => {
    if (!termsAccepted) return;
    if (!listingId || !listingType) {
      toast.error(
        "Thiếu thông tin sản phẩm. Vui lòng quay lại trang chi tiết và thử lại."
      );
      return;
    }

    // Proceed with payment directly without contract
    setProcessing(true);
    try {
      const res = await checkout({
        listingId,
        listingType: listingType as "VEHICLE" | "BATTERY",
        paymentMethod: selectedPaymentMethod === "qr" ? "MOMO" : "WALLET",
      });

      if (selectedPaymentMethod === "qr") {
        // MOMO payment
        const source =
          res?.data && (res.data as any).paymentInfo
            ? (res.data as any).paymentInfo
            : (res?.data as any);
        const payUrl = source?.payUrl;
        const deeplink = source?.deeplink;
        const qrCodeUrl = source?.qrCodeUrl;
        if (payUrl) {
          openPaymentUrl(payUrl, "_blank");
        } else if (deeplink || qrCodeUrl) {
          setPaymentLinks({ payUrl, deeplink, qrCodeUrl });
          setQrOpen(true);
        } else {
          toast.error("Không tìm thấy liên kết thanh toán MoMo.");
        }
      } else {
        // WALLET flow: two-step, requires transactionId
        const transactionId = (res as any)?.data?.transactionId;
        if (!transactionId) {
          toast.error("Không tìm thấy transactionId để thanh toán ví.");
          return;
        }
        try {
          const payRes = await payWithWallet(transactionId);
          try {
            const bal = await getWalletBalance();
            setWalletBalance(bal.data?.availableBalance ?? null);
          } catch {}
          toast.success(payRes?.message || "Thanh toán bằng ví thành công!");
          setTimeout(() => router.push("/purchase-history"), 1500);
        } catch (e: any) {
          toast.error(e?.message || "Thanh toán ví thất bại");
        }
      }
    } catch (error: any) {
      toast.error(error?.message || "Thanh toán thất bại");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/40 to-purple-50/30 md:pt-25"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-16 py-16 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring" }}
          className="space-y-12"
        >
          {/* Checkout Title */}
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 drop-shadow-lg mb-8 tracking-tight">
            {t("checkout.title")}
          </h1>
          {/* Order Summary Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, type: "spring", delay: 0.1 }}
            className="bg-white/90 backdrop-blur-lg rounded-3xl border border-blue-200 shadow-xl p-8"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setIsOrderSummaryExpanded(!isOrderSummaryExpanded)}
            >
              <h2 className="text-2xl font-bold text-blue-900">
                {t("checkout.orderSummary")}
              </h2>
              <ChevronDown
                className={`w-6 h-6 transition-transform duration-200 text-blue-600 ${
                  isOrderSummaryExpanded ? "rotate-180" : ""
                }`}
              />
            </div>

            {isOrderSummaryExpanded && (
              <div className="mt-6 space-y-6">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-md">
                    <Image
                      src={
                        listingType === "VEHICLE"
                          ? vehicle?.images?.[0] || "/Homepage/TopCar.png"
                          : listingType === "BATTERY"
                          ? battery?.images?.[0] || "/Homepage/Pin.png"
                          : "/Homepage/TopCar.png"
                      }
                      alt={orderData.product.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-2xl"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-full shadow-md">
                        {orderData.product.brand}
                      </span>
                      <h3 className="font-bold text-lg text-blue-900">
                        {orderData.product.name}
                      </h3>
                    </div>
                    <div className="space-y-2 text-base text-slate-600">
                      <p className="font-medium">
                        {t("checkout.productDetails.year")}:{" "}
                        <span className="text-slate-800">
                          {orderData.product.year}
                        </span>
                      </p>
                      <p className="font-medium">
                        {t("checkout.productDetails.batteryCapacity")}:{" "}
                        <span className="text-slate-800">
                          {orderData.product.batteryCapacity}
                        </span>
                      </p>
                      {listingType === "VEHICLE" && (
                        <p className="font-medium">
                          {t("checkout.productDetails.mileage")}:{" "}
                          <span className="text-slate-800">
                            {orderData.product.mileage}
                          </span>
                        </p>
                      )}
                      <p className="font-medium">
                        {t("checkout.productDetails.condition")}:{" "}
                        <span className="text-slate-800">
                          {orderData.product.condition}
                        </span>
                      </p>
                    </div>
                    {productError && (
                      <p className="text-sm text-red-600 mt-2 font-medium">
                        {productError}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-600">
                      {orderData.product.price}
                    </p>
                  </div>
                </div>
                {productLoading && (
                  <div className="text-base text-blue-600 font-medium">
                    Đang tải sản phẩm...
                  </div>
                )}
              </div>
            )}
          </motion.div>
          {/* Payment Method */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, type: "spring", delay: 0.2 }}
            className="bg-white/90 backdrop-blur-lg rounded-3xl border border-blue-200 shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-8 text-blue-900">
              {t("checkout.paymentMethod")}
            </h2>

            <div className="space-y-6">
              {/* Wallet Method */}
              <div
                className={`border-2 rounded-2xl p-6 cursor-pointer transition-all duration-200 ${
                  selectedPaymentMethod === "wallet"
                    ? "border-indigo-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg"
                    : "border-blue-200 hover:border-blue-300 bg-white"
                }`}
                onClick={() => setSelectedPaymentMethod("wallet")}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                      <WalletIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg text-blue-900">
                      Thanh toán bằng số dư ví
                    </span>
                  </div>
                  <div className="text-right">
                    {balanceLoading ? (
                      <span className="text-sm text-blue-600 font-medium">
                        Đang tải số dư...
                      </span>
                    ) : balanceError ? (
                      <span className="text-sm text-red-600 font-medium">
                        {balanceError}
                      </span>
                    ) : (
                      <span
                        className={`text-base font-bold ${
                          sufficientBalance
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        Số dư:{" "}
                        {walletBalance != null
                          ? formatCurrency(walletBalance)
                          : "--"}
                      </span>
                    )}
                  </div>
                </div>
                {walletBalance != null && (
                  <p
                    className={`mt-3 text-base font-medium ${
                      sufficientBalance ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {sufficientBalance
                      ? "Số dư đủ để thanh toán đơn này."
                      : "Số dư chưa đủ cho đơn này."}
                  </p>
                )}
              </div>

              {/* QR Method */}
              <div
                className={`border-2 rounded-2xl p-6 cursor-pointer transition-all duration-200 ${
                  selectedPaymentMethod === "qr"
                    ? "border-indigo-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg"
                    : "border-blue-200 hover:border-blue-300 bg-white"
                }`}
                onClick={() => setSelectedPaymentMethod("qr")}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                    <QrCode className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-lg text-blue-900">
                    Quét mã QR để thanh toán
                  </span>
                </div>
                <p className="mt-3 text-base text-slate-600">
                  Chúng tôi sẽ mở trang thanh toán của đối tác (VD: MoMo) với số
                  tiền tương ứng.
                </p>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <label className="flex items-start gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 w-5 h-5 text-indigo-600 border-blue-300 rounded focus:ring-indigo-500"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <span className="text-base text-slate-700">
                  Tôi đồng ý với{" "}
                  <a
                    href="#"
                    className="text-indigo-600 hover:text-indigo-700 underline font-medium"
                  >
                    Điều khoản và Điều kiện
                  </a>{" "}
                  cũng như{" "}
                  <a
                    href="#"
                    className="text-indigo-600 hover:text-indigo-700 underline font-medium"
                  >
                    Chính sách Bảo mật
                  </a>{" "}
                  của EV Market.
                </span>
              </label>
            </div>

            {/* Complete Payment Button */}
            <button
              disabled={!termsAccepted || processing}
              onClick={handlePay}
              className={`w-full mt-8 py-4 px-8 text-white text-lg font-bold rounded-2xl transition-all duration-300 shadow-lg ${
                !termsAccepted || processing
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105"
              }`}
            >
              {processing ? "Đang xử lý..." : t("checkout.completePayment")}
            </button>
          </motion.div>
          {/* Security Information */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, type: "spring", delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Secure Payment */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-md">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg text-green-800 mb-2">
                    {t("checkout.security.securePayment")}
                  </h3>
                  <p className="text-sm text-green-700">
                    {t("checkout.security.secureDesc")}
                  </p>
                </div>
              </div>
            </div>

            {/* Refund Policy */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-md">
              <div className="flex items-start gap-4">
                <RotateCcw className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg text-blue-800 mb-2">
                    {t("checkout.security.refundPolicy")}
                  </h3>
                  <p className="text-sm text-blue-700">
                    {t("checkout.security.refundDesc")}
                  </p>
                </div>
              </div>
            </div>

            {/* 24/7 Support */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 shadow-md">
              <div className="flex items-start gap-4">
                <Headphones className="w-6 h-6 text-purple-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg text-purple-800 mb-2">
                    {t("checkout.security.support24")}
                  </h3>
                  <p className="text-sm text-purple-700">
                    {t("checkout.security.supportDesc")}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
        {/* QR Modal */}
        {qrOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          >
            <div className="w-full max-w-md bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-blue-200">
              <h3 className="text-2xl font-bold mb-6 text-blue-900">
                Quét mã QR để thanh toán
              </h3>
              <div className="flex flex-col items-center">
                <div className="p-4 bg-white rounded-2xl border-2 border-blue-200 shadow-lg">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(
                      paymentLinks?.qrCodeUrl ||
                        paymentLinks?.deeplink ||
                        paymentLinks?.payUrl ||
                        ""
                    )}`}
                    alt="MoMo QR"
                    className="w-64 h-64"
                  />
                </div>
                <div className="mt-6 w-full space-y-3">
                  <button
                    onClick={() =>
                      openPaymentUrl(
                        paymentLinks?.deeplink || paymentLinks?.payUrl || "",
                        "_blank"
                      )
                    }
                    className="w-full py-3 rounded-2xl text-white font-bold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg transition-all"
                  >
                    Mở MoMo
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          paymentLinks?.deeplink || paymentLinks?.payUrl || ""
                        );
                        toast.success("Đã sao chép liên kết thanh toán");
                      } catch {
                        toast.error("Không thể sao chép liên kết");
                      }
                    }}
                    className="w-full py-3 rounded-2xl font-bold border-2 border-blue-200 hover:bg-blue-50 transition-all text-blue-900"
                  >
                    Sao chép liên kết
                  </button>
                  <button
                    onClick={() => setQrOpen(false)}
                    className="w-full py-3 rounded-2xl font-bold border-2 border-slate-200 hover:bg-slate-50 transition-all text-slate-700"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.main>
  );
}
