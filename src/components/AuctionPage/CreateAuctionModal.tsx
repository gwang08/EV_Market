"use client";
import React, { useState, useCallback } from "react";
import { X, Upload, Car, Battery, Loader2, Trash2, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { createAuction } from "@/services";
import { useI18nContext } from "@/providers/I18nProvider";
import { useToast } from "@/hooks/useToast";
import { useCurrencyInput } from "@/hooks/useCurrencyInput";
import { ToastContainer } from "@/components/common/Toast";
import colors from "@/Utils/Color";
import {
  validateField,
  getFieldError,
  hasFieldError,
  ValidationError,
} from "@/Utils/validation";

interface CreateAuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AuctionType = "vehicles" | "batteries";
type Step = 1 | 2 | 3;

export default function CreateAuctionModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateAuctionModalProps) {
  const { t } = useI18nContext();
  const { success: showSuccess, error: showError, toasts, removeToast } = useToast();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [auctionType, setAuctionType] = useState<AuctionType>("vehicles");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  // Validation errors - sử dụng ValidationError[] giống AddListing
  const [errors, setErrors] = useState<ValidationError[]>([]);

  // Common fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [year, setYear] = useState("");
  const startingPriceInput = useCurrencyInput("");
  const bidIncrementInput = useCurrencyInput("");
  const depositAmountInput = useCurrencyInput("");
  
  // Auto-calculate bid increment as 10% of starting price
  React.useEffect(() => {
    const startingPrice = Number(startingPriceInput.rawValue);
    if (startingPrice > 0) {
      const autoIncrement = Math.round(startingPrice * 0.1);
      bidIncrementInput.setValue(String(autoIncrement));
    }
  }, [startingPriceInput.rawValue]);

  // Vehicle specific
  const [model, setModel] = useState("");
  const mileageInput = useCurrencyInput("");

  // Battery specific
  const [capacity, setCapacity] = useState("");
  const [health, setHealth] = useState("");

  const steps = [
    { number: 1, title: t("seller.addListing.steps.basicInfo", "Basic Info") },
    { number: 2, title: t("seller.addListing.fields.uploadPhotos", "Photos") },
    { number: 3, title: t("auctions.settings", "Auction Settings") },
  ];
  
  // Handle input change
  const handleInputChange = useCallback((field: string, value: string, setter: (val: string) => void) => {
    setter(value);
  }, []);

  // Handle validation on blur - giống AddListing
  const handleInputBlur = useCallback(
    (field: string, value: string) => {
      const error = validateField(field, value, auctionType === "vehicles" ? "vehicle" : "battery");

      if (error) {
        setErrors((prev) => [
          ...prev.filter((err) => err.field !== field),
          { field, message: error },
        ]);
      } else {
        setErrors((prev) => prev.filter((err) => err.field !== field));
      }
    },
    [auctionType]
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 10) {
      showError(t("seller.addListing.maxImages", "Maximum 10 images allowed"));
      return;
    }

    setImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only submit when on step 3
    if (currentStep !== 3) return;

    // Validate step 1 fields
    if (!title || !description || !brand || !year) {
      showError(t("seller.addListing.fillRequired", "Please fill all required fields"));
      return;
    }

    // Validate type-specific fields
    if (auctionType === "vehicles" && (!model || !mileageInput.rawValue)) {
      showError(t("seller.addListing.fillRequired", "Please fill all required fields"));
      return;
    }

    if (auctionType === "batteries" && (!capacity || !health)) {
      showError(t("seller.addListing.fillRequired", "Please fill all required fields"));
      return;
    }

    // Validate step 2 - images
    if (images.length === 0) {
      showError(t("seller.addListing.uploadImage", "Please upload at least one image"));
      return;
    }

    // Validate step 3 - auction settings
    if (!startingPriceInput.rawValue || !bidIncrementInput.rawValue) {
      showError(t("seller.addListing.fillRequired", "Please fill all required fields"));
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      formData.append("brand", brand);
      formData.append("year", year);
      formData.append("startingPrice", startingPriceInput.rawValue);
      formData.append("bidIncrement", bidIncrementInput.rawValue);
      if (depositAmountInput.rawValue) formData.append("depositAmount", depositAmountInput.rawValue);

      images.forEach((image) => {
        formData.append("images", image);
      });

      if (auctionType === "vehicles") {
        formData.append("model", model);
        formData.append("mileage", mileageInput.rawValue);

        const specs = {
          warranty: { basic: "Standard warranty", battery: "8 years / 120,000 miles", drivetrain: "8 years / 120,000 miles" },
          dimensions: { width: "Standard", height: "Standard", length: "Standard", curbWeight: "Standard" },
          performance: { topSpeed: "N/A", motorType: "Electric", horsepower: "N/A", acceleration: "N/A" },
          batteryAndCharging: { range: "N/A", chargeTime: "N/A", chargingSpeed: "N/A", batteryCapacity: "N/A" },
        };
        formData.append("specifications", JSON.stringify(specs));
      } else {
        formData.append("capacity", capacity);
        formData.append("health", health);

        const specs = {
          weight: "N/A", voltage: "N/A", chemistry: "Lithium-ion",
          chargingTime: "N/A", temperatureRange: "-20°C to 60°C", installation: "Professional required",
        };
        formData.append("specifications", JSON.stringify(specs));
      }

      await createAuction(auctionType, formData);
      
      showSuccess(t("auctions.createSuccess", "Auction created successfully and is pending approval!"));
      onSuccess();
      handleClose();
    } catch (error) {
      showError(error instanceof Error ? error.message : t("auctions.createError", "Failed to create auction"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    setImages([]);
    setImagePreviews([]);
    setTitle("");
    setDescription("");
    setBrand("");
    setYear("");
    setModel("");
    mileageInput.reset();
    setCapacity("");
    setHealth("");
    startingPriceInput.reset();
    bidIncrementInput.reset();
    depositAmountInput.reset();
    setCurrentStep(1);
    onClose();
  };

  const canProceedToStep2 = 
    title && description && brand && year && 
    (auctionType === "vehicles" ? (model && mileageInput.rawValue) : (capacity && health)) &&
    !hasFieldError(errors, 'title') && !hasFieldError(errors, 'description') && 
    !hasFieldError(errors, 'brand') && !hasFieldError(errors, 'year') &&
    (auctionType === "vehicles" 
      ? (!hasFieldError(errors, 'model') && !hasFieldError(errors, 'mileage')) 
      : (!hasFieldError(errors, 'capacity') && !hasFieldError(errors, 'health'))
    );
    
  const canProceedToStep3 = images.length > 0;
  
  const canSubmit = 
    startingPriceInput.rawValue && bidIncrementInput.rawValue &&
    !hasFieldError(errors, 'startingPrice') && !hasFieldError(errors, 'bidIncrement');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      <div className="relative w-full max-w-3xl my-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div>
              <h2 className="text-xl font-bold text-white">
                {t("auctions.createNew", "Create New Auction")}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {t("auctions.step", "Step")} {currentStep} {t("auctions.of", "of")} 3
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {/* Type Selector */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.Text }}>
                    {t("seller.addListing.selectType", "Select Type")}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAuctionType("vehicles")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        auctionType === "vehicles"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <Car className={`w-8 h-8 mx-auto mb-2 ${auctionType === "vehicles" ? "text-blue-600" : "text-gray-400"}`} />
                      <p className={`font-semibold text-sm ${auctionType === "vehicles" ? "text-blue-600" : "text-gray-700"}`}>
                        {t("browse.vehicle", "Xe điện")}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAuctionType("batteries")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        auctionType === "batteries"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <Battery className={`w-8 h-8 mx-auto mb-2 ${auctionType === "batteries" ? "text-blue-600" : "text-gray-400"}`} />
                      <p className={`font-semibold text-sm ${auctionType === "batteries" ? "text-blue-600" : "text-gray-700"}`}>
                        {t("browse.battery", "Pin")}
                      </p>
                    </button>
                  </div>
                </div>

                {/* Basic Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: colors.Text }}>
                      {t("seller.addListing.fields.title")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onBlur={() => handleInputBlur('title', title)}
                      className={`w-full px-3 py-2 text-sm rounded-lg border transition-all ${
                        hasFieldError(errors, 'title') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      } focus:ring-1`}
                      placeholder="Tesla Model 3 2024"
                    />
                    {getFieldError(errors, 'title') && <p className="text-xs text-red-600 mt-1">{t(getFieldError(errors, 'title')!)}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: colors.Text }}>
                      {t("seller.addListing.fields.brand")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      onBlur={() => handleInputBlur('brand', brand)}
                      className={`w-full px-3 py-2 text-sm rounded-lg border transition-all ${
                        hasFieldError(errors, 'brand') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      } focus:ring-1`}
                      placeholder="Tesla, BYD"
                    />
                    {getFieldError(errors, 'brand') && <p className="text-xs text-red-600 mt-1">{t(getFieldError(errors, 'brand')!)}</p>}
                  </div>

    

                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: colors.Text }}>
                      {t("seller.addListing.fields.year")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      onBlur={() => handleInputBlur('year', year)}
                      className={`w-full px-3 py-2 text-sm rounded-lg border transition-all ${
                        hasFieldError(errors, 'year') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      } focus:ring-1`}
                      placeholder="2024"
                    />
                    {getFieldError(errors, 'year') && <p className="text-xs text-red-600 mt-1">{t(getFieldError(errors, 'year')!)}</p>}
                  </div>

                  {auctionType === "vehicles" ? (
                    <>
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: colors.Text }}>
                          {t("seller.addListing.fields.model")} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={model}
                          onChange={(e) => setModel(e.target.value)}
                          onBlur={() => handleInputBlur('model', model)}
                          className={`w-full px-3 py-2 text-sm rounded-lg border transition-all ${
                            hasFieldError(errors, 'model') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                          } focus:ring-1`}
                          placeholder="Model 3"
                        />
                        {getFieldError(errors, 'model') && <p className="text-xs text-red-600 mt-1">{t(getFieldError(errors, 'model')!)}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: colors.Text }}>
                          {t("seller.addListing.fields.mileage")} (km) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={mileageInput.displayValue}
                          onChange={(e) => mileageInput.handleChange(e.target.value)}
                          onBlur={() => handleInputBlur('mileage', mileageInput.rawValue)}
                          className={`w-full px-3 py-2 text-sm rounded-lg border transition-all ${
                            hasFieldError(errors, 'mileage') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                          } focus:ring-1`}
                          placeholder="25,000"
                        />
                        {getFieldError(errors, 'mileage') && <p className="text-xs text-red-600 mt-1">{t(getFieldError(errors, 'mileage')!)}</p>}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: colors.Text }}>
                          {t("seller.addListing.fields.capacity")} (kWh) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={capacity}
                          onChange={(e) => setCapacity(e.target.value)}
                          onBlur={() => handleInputBlur('capacity', capacity)}
                          className={`w-full px-3 py-2 text-sm rounded-lg border transition-all ${
                            hasFieldError(errors, 'capacity') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                          } focus:ring-1`}
                          placeholder="95"
                        />
                        {getFieldError(errors, 'capacity') && <p className="text-xs text-red-600 mt-1">{t(getFieldError(errors, 'capacity')!)}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: colors.Text }}>
                          {t("seller.addListing.fields.health")} (%) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={health}
                          onChange={(e) => setHealth(e.target.value)}
                          onBlur={() => handleInputBlur('health', health)}
                          className={`w-full px-3 py-2 text-sm rounded-lg border transition-all ${
                            hasFieldError(errors, 'health') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                          } focus:ring-1`}
                          placeholder="90"
                          min="0"
                          max="100"
                        />
                        {getFieldError(errors, 'health') && <p className="text-xs text-red-600 mt-1">{t(getFieldError(errors, 'health')!)}</p>}
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: colors.Text }}>
                    {t("seller.addListing.fields.description")} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={() => handleInputBlur('description', description)}
                    rows={3}
                    className={`w-full px-3 py-2 text-sm rounded-lg border transition-all resize-none ${
                      hasFieldError(errors, 'description') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } focus:ring-1`}
                    placeholder={t("seller.addListing.descriptionPlaceholder", "Describe your item...")}
                  />
                  {getFieldError(errors, 'description') && <p className="text-xs text-red-600 mt-1">{t(getFieldError(errors, 'description')!)}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Photos */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.Text }}>
                    {t("seller.addListing.fields.uploadPhotos")} <span className="text-red-500">*</span>
                  </label>
                  
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all">
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-600">
                      {t("seller.addListing.clickToUpload", "Click to upload images")}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{images.length}/10</p>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Step 3: Auction Settings */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: colors.Text }}>
                      {t("auctions.startingPrice")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={startingPriceInput.displayValue}
                      onChange={(e) => startingPriceInput.handleChange(e.target.value)}
                      onBlur={() => handleInputBlur('startingPrice', startingPriceInput.rawValue)}
                      className={`w-full px-3 py-2 text-sm rounded-lg border transition-all ${
                        hasFieldError(errors, 'startingPrice') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      } focus:ring-1`}
                      placeholder="5,000,000"
                    />
                    {getFieldError(errors, 'startingPrice') && <p className="text-xs text-red-600 mt-1">{t(getFieldError(errors, 'startingPrice')!)}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: colors.Text }}>
                      {t("auctions.bidIncrement")} <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 ml-2">(Tự động = 10% giá khởi điểm)</span>
                    </label>
                    <input
                      type="text"
                      value={bidIncrementInput.displayValue}
                      onChange={(e) => bidIncrementInput.handleChange(e.target.value)}
                      onBlur={() => handleInputBlur('bidIncrement', bidIncrementInput.rawValue)}
                      className={`w-full px-3 py-2 text-sm rounded-lg border transition-all ${
                        hasFieldError(errors, 'bidIncrement') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      } focus:ring-1`}
                      placeholder="Tự động tính toán"
                    />
                    {getFieldError(errors, 'bidIncrement') && <p className="text-xs text-red-600 mt-1">{t(getFieldError(errors, 'bidIncrement')!)}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: colors.Text }}>
                      {t("auctions.depositAmount")} ({t("common.optional", "Optional")})
                    </label>
                    <input
                      type="text"
                      value={depositAmountInput.displayValue}
                      onChange={(e) => depositAmountInput.handleChange(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      placeholder="300,000"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-900">
                     {t("seller.addListing.auctionNote", "Your auction will be reviewed by admin before going live. You'll be notified once approved.")}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={() => currentStep > 1 ? setCurrentStep((currentStep - 1) as Step) : handleClose()}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                {currentStep === 1 ? t("common.cancel", "Cancel") : t("seller.addListing.buttons.previous", "Previous")}
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((currentStep + 1) as Step)}
                  disabled={currentStep === 1 ? !canProceedToStep2 : !canProceedToStep3}
                  className="flex items-center gap-1.5 px-5 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("seller.addListing.buttons.next", "Next")}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !canSubmit}
                  className="flex items-center gap-1.5 px-5 py-2 text-sm bg-green-600 text-white rounded-lg font-medium transition-all hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("wallet.processing", "Processing...")}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      {t("auctions.createAuction", "Create Auction")}
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
