"use client";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Download,
  Check,
  Shield,
  Award,
  Stamp,
  User,
  Mail,
  Car,
  Calendar,
  Gauge,
  Battery,
  DollarSign,
  Building2,
  Hash,
  Clock,
  Edit3,
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface ContractData {
  vehicleInfo: {
    title: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    mileage?: number;
    batteryCapacity?: string;
    description?: string;
  };
  seller: {
    name: string;
    email: string;
    signedAt?: string;
    signature?: string;
  };
  buyer?: {
    name: string;
    email: string;
    signedAt?: string;
    signature?: string;
  };
  contractId?: string;
  createdAt?: string;
}

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: (signature: string) => void;
  contractData: ContractData;
  signerRole: "seller" | "buyer";
  currentUserName: string;
}

export default function ContractModal({
  isOpen,
  onClose,
  onSign,
  contractData,
  signerRole,
  currentUserName,
}: ContractModalProps) {
  const [signature, setSignature] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const contractRef = useRef<HTMLDivElement>(null);

  const handleSign = () => {
    if (!signature.trim() || !agreed) return;
    setIsSigning(true);
    setTimeout(() => {
      onSign(signature);
      setIsSigning(false);
    }, 500);
  };

  const handleExportPDF = async () => {
    if (!contractRef.current) return;

    try {
      const canvas = await html2canvas(contractRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(
        `Hop-Dong-Mua-Ban-${contractData.vehicleInfo.title}-${Date.now()}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Không thể xuất PDF. Vui lòng thử lại.");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
  };

  const formatDate = (date?: string) => {
    if (!date) return new Date().toLocaleDateString("vi-VN");
    return new Date(date).toLocaleDateString("vi-VN");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
            className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden border-2 border-blue-100/50 backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8 shadow-lg">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
                    <FileText className="w-8 h-8" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold tracking-tight drop-shadow-lg">
                      Hợp Đồng Mua Bán Xe Điện
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold border border-white/30">
                        {signerRole === "seller"
                          ? "Người Bán Xác Nhận"
                          : "Người Mua Xác Nhận"}
                      </span>
                      <span className="px-3 py-1 bg-yellow-400/90 text-yellow-900 rounded-full text-sm font-bold border border-yellow-500">
                        Hợp Đồng Điện Tử
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-sm border border-white/20"
                >
                  <X className="w-7 h-7" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Contract Content */}
            <div className="relative overflow-y-auto max-h-[calc(92vh-250px)] p-8 bg-white/60 backdrop-blur-sm">
              <div ref={contractRef} className="space-y-8">
                {/* Contract Header */}
                <div className="relative text-center border-b-4 border-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 pb-8 mb-8">
                  <div className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg">
                    <Shield className="w-5 h-5 inline mr-2" />
                    <span className="font-bold">
                      Hợp Đồng Có Giá Trị Pháp Lý
                    </span>
                  </div>

                  <div className="mt-6 space-y-2">
                    <h3 className="text-4xl font-black bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent drop-shadow-sm">
                      HỢP ĐỒNG MUA BÁN XE ĐIỆN
                    </h3>
                    <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-gray-700">Số:</span>
                        <span className="font-mono font-bold text-blue-700">
                          {contractData.contractId || `HD-${Date.now()}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 shadow-sm">
                        <Award className="w-4 h-4 text-indigo-600" />
                        <span className="font-semibold text-gray-700">
                          Ngày:
                        </span>
                        <span className="font-bold text-indigo-700">
                          {formatDate(contractData.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parties - Enhanced Design */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Seller */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                    <div className="relative bg-gradient-to-br from-blue-50 via-blue-50/80 to-indigo-50/60 rounded-2xl p-6 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-blue-200/50">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg">
                          A
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-blue-900">
                            BÊN BÁN
                          </h4>
                          <p className="text-xs text-blue-600 font-semibold">
                            (Bên A - The Seller)
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="font-bold text-blue-900 block mb-1">
                              Họ tên:
                            </span>
                            <span className="text-gray-800 font-semibold">
                              {contractData.seller.name}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="font-bold text-blue-900 block mb-1">
                              Email:
                            </span>
                            <span className="text-gray-700 text-sm break-all">
                              {contractData.seller.email}
                            </span>
                          </div>
                        </div>
                        {contractData.seller.signature && (
                          <>
                            <div className="mt-4 pt-4 border-t-2 border-blue-200/50">
                              <div className="flex items-start gap-2 mb-2">
                                <Stamp className="w-5 h-5 text-blue-600 mt-1" />
                                <span className="font-bold text-blue-900">
                                  Chữ ký:
                                </span>
                              </div>
                              <div className="ml-7 p-4 bg-white rounded-xl border-2 border-blue-300 shadow-inner">
                                <span className="text-2xl font-signature text-blue-700 block">
                                  {contractData.seller.signature}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <Check className="w-4 h-4" />
                              <span className="font-semibold">
                                Đã ký:{" "}
                                {formatDate(contractData.seller.signedAt)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Buyer */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative group"
                  >
                    <div
                      className={`absolute inset-0 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity ${
                        contractData.buyer
                          ? "bg-gradient-to-br from-green-400 to-emerald-500"
                          : "bg-gradient-to-br from-gray-300 to-gray-400"
                      }`}
                    />
                    <div
                      className={`relative rounded-2xl p-6 border-2 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm ${
                        contractData.buyer
                          ? "bg-gradient-to-br from-green-50 via-emerald-50/80 to-teal-50/60 border-green-200"
                          : "bg-gradient-to-br from-gray-50 via-gray-50/80 to-slate-50/60 border-gray-300"
                      }`}
                    >
                      <div
                        className={`flex items-center gap-3 mb-5 pb-4 border-b-2 ${
                          contractData.buyer
                            ? "border-green-200/50"
                            : "border-gray-200/50"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-lg text-white ${
                            contractData.buyer
                              ? "bg-gradient-to-br from-green-600 to-emerald-600"
                              : "bg-gradient-to-br from-gray-400 to-gray-500"
                          }`}
                        >
                          B
                        </div>
                        <div>
                          <h4
                            className={`text-lg font-black ${
                              contractData.buyer
                                ? "text-green-900"
                                : "text-gray-600"
                            }`}
                          >
                            BÊN MUA
                          </h4>
                          <p
                            className={`text-xs font-semibold ${
                              contractData.buyer
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            (Bên B - The Buyer)
                          </p>
                        </div>
                      </div>
                      {contractData.buyer ? (
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <span className="font-bold text-green-900 block mb-1">
                                Họ tên:
                              </span>
                              <span className="text-gray-800 font-semibold">
                                {contractData.buyer.name}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <span className="font-bold text-green-900 block mb-1">
                                Email:
                              </span>
                              <span className="text-gray-700 text-sm break-all">
                                {contractData.buyer.email}
                              </span>
                            </div>
                          </div>
                          {contractData.buyer.signature && (
                            <>
                              <div className="mt-4 pt-4 border-t-2 border-green-200/50">
                                <div className="flex items-start gap-2 mb-2">
                                  <Stamp className="w-5 h-5 text-green-600 mt-1" />
                                  <span className="font-bold text-green-900">
                                    Chữ ký:
                                  </span>
                                </div>
                                <div className="ml-7 p-4 bg-white rounded-xl border-2 border-green-300 shadow-inner">
                                  <span className="text-2xl font-signature text-green-700 block">
                                    {contractData.buyer.signature}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-green-600">
                                <Check className="w-4 h-4" />
                                <span className="font-semibold">
                                  Đã ký:{" "}
                                  {formatDate(contractData.buyer.signedAt)}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                            <Clock className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 italic text-sm font-medium">
                            Chờ người mua xác nhận
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Vehicle Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-indigo-50 via-purple-50/80 to-pink-50/60 rounded-2xl p-8 border-2 border-indigo-200 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-indigo-200/50">
                      <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg">
                        <FileText className="w-6 h-6" />
                      </div>
                      <h4 className="text-2xl font-black bg-gradient-to-r from-indigo-900 to-purple-900 bg-clip-text text-transparent">
                        THÔNG TIN XE
                      </h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                      <div className="flex items-start gap-3 p-4 bg-white/70 rounded-xl border border-indigo-100 shadow-sm">
                        <Car className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="font-bold text-indigo-900 block mb-1">
                            Tên xe:
                          </span>
                          <span className="text-gray-800 font-semibold">
                            {contractData.vehicleInfo.title}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-white/70 rounded-xl border border-indigo-100 shadow-sm">
                        <Building2 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="font-bold text-indigo-900 block mb-1">
                            Hãng:
                          </span>
                          <span className="text-gray-800 font-semibold">
                            {contractData.vehicleInfo.brand}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-white/70 rounded-xl border border-indigo-100 shadow-sm">
                        <Hash className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="font-bold text-indigo-900 block mb-1">
                            Model:
                          </span>
                          <span className="text-gray-800 font-semibold">
                            {contractData.vehicleInfo.model}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-white/70 rounded-xl border border-indigo-100 shadow-sm">
                        <Calendar className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="font-bold text-indigo-900 block mb-1">
                            Năm sản xuất:
                          </span>
                          <span className="text-gray-800 font-semibold">
                            {contractData.vehicleInfo.year}
                          </span>
                        </div>
                      </div>
                      {contractData.vehicleInfo.mileage && (
                        <div className="flex items-start gap-3 p-4 bg-white/70 rounded-xl border border-indigo-100 shadow-sm">
                          <Gauge className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="font-bold text-indigo-900 block mb-1">
                              Số km đã đi:
                            </span>
                            <span className="text-gray-800 font-semibold">
                              {contractData.vehicleInfo.mileage.toLocaleString()}{" "}
                              km
                            </span>
                          </div>
                        </div>
                      )}
                      {contractData.vehicleInfo.batteryCapacity && (
                        <div className="flex items-start gap-3 p-3 bg-white/70 rounded-xl border border-indigo-100 shadow-sm">
                          <Battery className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="block font-bold text-indigo-900">
                              Pin:
                            </span>
                            <span className="text-gray-800 font-semibold">
                              {contractData.vehicleInfo.batteryCapacity}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-6 p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border-2 border-yellow-300 shadow-inner">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-6 h-6 text-amber-600 flex-shrink-0" />
                          <span className="text-lg font-bold text-amber-900">
                            Giá bán:
                          </span>
                        </div>
                        <span className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent drop-shadow-sm">
                          {formatCurrency(contractData.vehicleInfo.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Terms and Conditions - Enhanced */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="relative"
                >
                  <div className="bg-gradient-to-br from-slate-50 to-gray-100/80 rounded-2xl p-8 border-2 border-gray-200 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-300">
                      <div className="p-2 bg-gradient-to-br from-slate-700 to-gray-800 text-white rounded-xl shadow-lg">
                        <Shield className="w-6 h-6" />
                      </div>
                      <h4 className="text-2xl font-black text-gray-800">
                        ĐIỀU KHOẢN HỢP ĐỒNG
                      </h4>
                    </div>
                    <div className="space-y-4 text-sm text-gray-700">
                      {[
                        {
                          title: "Điều 1: Đối tượng hợp đồng",
                          content: `Bên A đồng ý bán và Bên B đồng ý mua xe điện như mô tả trên với giá trị là ${formatCurrency(
                            contractData.vehicleInfo.price
                          )}.`,
                        },
                        {
                          title: "Điều 2: Nghĩa vụ của Bên A (Người bán)",
                          content:
                            "- Giao xe đúng tình trạng như mô tả trong hợp đồng.\n- Cung cấp đầy đủ giấy tờ hợp lệ liên quan đến xe.\n- Đảm bảo xe không có tranh chấp về quyền sở hữu.\n- Hỗ trợ hoàn tất thủ tục sang tên đổi chủ.",
                        },
                        {
                          title: "Điều 3: Nghĩa vụ của Bên B (Người mua)",
                          content:
                            "- Thanh toán đầy đủ số tiền theo thỏa thuận.\n- Nhận xe và kiểm tra tình trạng xe khi giao nhận.\n- Hoàn tất thủ tục sang tên đổi chủ trong vòng 30 ngày.",
                        },
                        {
                          title: "Điều 4: Bảo hành và bảo trì",
                          content:
                            "- Xe được bảo hành theo chính sách của nhà sản xuất (nếu còn).\n- Người mua chịu trách nhiệm bảo trì xe sau khi nhận.",
                        },
                        {
                          title: "Điều 5: Điều khoản thanh toán",
                          content:
                            "- Thanh toán qua hệ thống ví điện tử hoặc chuyển khoản ngân hàng.\n- Xe được giao sau khi xác nhận thanh toán thành công.",
                        },
                        {
                          title: "Điều 6: Giải quyết tranh chấp",
                          content:
                            "Mọi tranh chấp phát sinh sẽ được giải quyết thông qua thương lượng. Nếu không thỏa thuận được, các bên sẽ đưa ra cơ quan pháp luật có thẩm quyền giải quyết.",
                        },
                        {
                          title: "Điều 7: Hiệu lực hợp đồng",
                          content:
                            "Hợp đồng có hiệu lực kể từ ngày hai bên ký kết và được lưu trữ trên hệ thống.",
                        },
                      ].map((term, index) => (
                        <div
                          key={index}
                          className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <p className="font-bold text-gray-900 mb-2">
                            {term.title}
                          </p>
                          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                            {term.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Signature Section (if not signed yet) */}
                {((signerRole === "seller" && !contractData.seller.signature) ||
                  (signerRole === "buyer" &&
                    contractData.buyer &&
                    !contractData.buyer.signature)) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl blur-xl opacity-20" />
                    <div className="relative bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50/80 rounded-2xl p-8 border-2 border-yellow-300 shadow-lg backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-yellow-300/50">
                        <div className="p-2 bg-gradient-to-br from-yellow-600 to-amber-600 text-white rounded-xl shadow-lg">
                          <Stamp className="w-6 h-6" />
                        </div>
                        <h4 className="text-2xl font-black text-yellow-900">
                          XÁC NHẬN VÀ KÝ TÊN
                        </h4>
                      </div>

                      {/* Signature Input */}
                      <div className="mb-6">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
                          <Edit3 className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                          Nhập họ tên của bạn để ký:
                        </label>
                        <input
                          type="text"
                          value={signature}
                          onChange={(e) => setSignature(e.target.value)}
                          placeholder={currentUserName}
                          className="w-full px-6 py-4 border-2 border-yellow-300 rounded-xl focus:ring-4 focus:ring-yellow-500/30 focus:border-yellow-500 text-xl font-signature bg-white shadow-inner transition-all"
                        />
                        {signature && (
                          <div className="mt-3 p-4 bg-white rounded-xl border-2 border-yellow-300 shadow-sm">
                            <p className="text-xs font-semibold text-gray-600 mb-2">
                              Xem trước chữ ký:
                            </p>
                            <p className="text-3xl font-signature text-yellow-700">
                              {signature}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Agreement Checkbox */}
                      <div className="flex items-start gap-4 p-5 bg-white/80 rounded-xl border-2 border-yellow-200 shadow-sm">
                        <input
                          type="checkbox"
                          id="agree"
                          checked={agreed}
                          onChange={(e) => setAgreed(e.target.checked)}
                          className="mt-1.5 w-6 h-6 text-yellow-600 border-2 border-gray-300 rounded focus:ring-4 focus:ring-yellow-500/30 cursor-pointer"
                        />
                        <label
                          htmlFor="agree"
                          className="text-sm text-gray-700 cursor-pointer leading-relaxed"
                        >
                          <span className="font-bold text-gray-900">
                            Tôi xác nhận
                          </span>{" "}
                          đã đọc, hiểu rõ và đồng ý với{" "}
                          <span className="font-bold text-yellow-700">
                            tất cả các điều khoản
                          </span>{" "}
                          trong hợp đồng này. Tôi cam kết thực hiện đầy đủ các
                          nghĩa vụ của mình theo hợp đồng.
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Footer Actions - Enhanced */}
            <div className="relative bg-gradient-to-r from-gray-50 via-white to-gray-50 p-6 flex items-center justify-between border-t-2 border-gray-200 shadow-lg">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-bold shadow-lg hover:shadow-xl active:scale-95"
              >
                <Download className="w-5 h-5" />
                Tải PDF
              </button>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-bold shadow-md hover:shadow-lg active:scale-95"
                >
                  Đóng
                </button>

                {((signerRole === "seller" && !contractData.seller.signature) ||
                  (signerRole === "buyer" &&
                    contractData.buyer &&
                    !contractData.buyer.signature)) && (
                  <button
                    onClick={handleSign}
                    disabled={!signature.trim() || !agreed || isSigning}
                    className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 ${
                      !signature.trim() || !agreed || isSigning
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                        : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700"
                    }`}
                  >
                    {isSigning ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang ký...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Ký tên & Xác nhận
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
