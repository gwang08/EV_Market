"use client";
import React, { useState, useCallback, useEffect } from "react";
import {
  validateField,
  validateForm,
  getFieldError,
  hasFieldError,
  ValidationError,
} from "../../Utils/validation";
import { useI18nContext } from "../../providers/I18nProvider";
import { useToast } from "../../hooks/useToast";
import { useCurrencyInput } from "../../hooks/useCurrencyInput";
import { ToastContainer } from "../common/Toast";
import { createVehicle } from "../../services/Vehicle";
import { createBattery } from "../../services/Battery";
import { useDataContext } from "../../contexts/DataContext";
import { FiBatteryCharging, FiTruck } from "react-icons/fi";
import { getUserInfo } from "../../services/Auth";

interface FormData {
  title: string;
  make: string;
  model: string;
  year: string;
  price: string;
  mileage: string;
  location: string;
  bodyType: string;
  exteriorColor: string;
  interiorColor: string;
  batteryHealth: string;
  range: string;
  batteryCapacity: string;
  description: string;
  spec_weight: string;
  spec_voltage: string;
  spec_chemistry: string;
  spec_degradation: string;
  spec_chargingTime: string;
  spec_installation: string;
  spec_warrantyPeriod: string;
  spec_temperatureRange: string;
}

interface SelectOption {
  value: string;
  label: string;
}

interface InputProps {
  field: keyof FormData;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  form: FormData;
  errors: ValidationError[];
  handleChange: (field: keyof FormData, value: string) => void;
  handleBlur: (field: keyof FormData) => void;
  currencyInput?: ReturnType<typeof useCurrencyInput>; // Add currency input hook
}

interface SelectProps {
  field: keyof FormData;
  label: string;
  options: SelectOption[];
  required?: boolean;
  form: FormData;
  errors: ValidationError[];
  handleChange: (field: keyof FormData, value: string) => void;
  handleBlur: (field: keyof FormData) => void;
}

interface AddListingProps {
  onSuccess?: () => void;
}

// Input component - nâng cấp giao diện
const Input = ({
  field,
  label,
  placeholder,
  type = "text",
  required = false,
  form,
  errors,
  handleChange,
  handleBlur,
  currencyInput,
}: InputProps) => {
  const { t } = useI18nContext();
  const errorMessage = getFieldError(errors, field);
  const translatedError = errorMessage ? t(errorMessage, errorMessage) : null;

  // If currency input hook is provided, use it
  const value = currencyInput ? currencyInput.displayValue : form[field];
  const onChange = currencyInput
    ? (e: React.ChangeEvent<HTMLInputElement>) =>
        currencyInput.handleChange(e.target.value)
    : (e: React.ChangeEvent<HTMLInputElement>) =>
        handleChange(field, e.target.value);

  return (
    <div className="mb-6">
      <label className="block text-base font-semibold mb-2 text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={currencyInput ? "text" : type}
          value={value}
          onChange={onChange}
          onBlur={() => handleBlur(field)}
          placeholder={placeholder}
          className={`w-full px-5 py-3 rounded-xl border-2 text-base font-medium transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 placeholder-gray-400
            ${
              hasFieldError(errors, field)
                ? "border-red-400"
                : "border-blue-100"
            }
            hover:border-blue-400`}
        />
        {translatedError && (
          <p className="mt-2 text-sm text-red-600">{translatedError}</p>
        )}
      </div>
    </div>
  );
};

// Select component - nâng cấp giao diện
const Select = ({
  field,
  label,
  options,
  required = false,
  form,
  errors,
  handleChange,
  handleBlur,
}: SelectProps) => {
  const { t } = useI18nContext();
  const errorMessage = getFieldError(errors, field);
  const translatedError = errorMessage ? t(errorMessage, errorMessage) : null;

  return (
    <div className="mb-6">
      <label className="block text-base font-semibold mb-2 text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          value={form[field]}
          onChange={(e) => handleChange(field, e.target.value)}
          onBlur={() => handleBlur(field)}
          className={`w-full px-5 py-3 rounded-xl border-2 text-base font-medium transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50
            ${
              hasFieldError(errors, field)
                ? "border-red-400"
                : "border-blue-100"
            }
            hover:border-blue-400 appearance-none`}
        >
          <option value="" className="text-gray-400">
            {label}
          </option>
          {options.map((opt: SelectOption) => (
            <option key={opt.value} value={opt.value} className="text-gray-900">
              {opt.label}
            </option>
          ))}
        </select>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 9l6 6 6-6"
            />
          </svg>
        </span>
        {translatedError && (
          <p className="mt-2 text-sm text-red-600">{translatedError}</p>
        )}
      </div>
    </div>
  );
};

function AddListing({ onSuccess }: AddListingProps = {}) {
  const { t } = useI18nContext();
  const { toasts, success, error: showError, removeToast } = useToast();
  const { refreshVehicles, refreshBatteries } = useDataContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [listingType, setListingType] = useState<"vehicle" | "battery">(
    "vehicle"
  );
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Currency input hooks for formatted fields
  const priceInput = useCurrencyInput("");
  const mileageInput = useCurrencyInput("");
  const batteryCapacityInput = useCurrencyInput("");

  const [form, setForm] = useState<FormData>({
    title: "",
    make: "",
    model: "",
    year: "",
    price: "", // Will be managed by priceInput hook
    mileage: "", // Will be managed by mileageInput hook
    location: "",
    bodyType: "",
    exteriorColor: "",
    interiorColor: "",
    batteryHealth: "",
    range: "",
    batteryCapacity: "", // Will be managed by batteryCapacityInput hook
    description: "",
    spec_weight: "",
    spec_voltage: "",
    spec_chemistry: "",
    spec_degradation: "",
    spec_chargingTime: "",
    spec_installation: "",
    spec_warrantyPeriod: "",
    spec_temperatureRange: "",
  });

  // Keep form values in sync with currency input hooks so the review screen shows data
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      price: priceInput.rawValue,
    }));
  }, [priceInput.rawValue]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      mileage: mileageInput.rawValue,
    }));
  }, [mileageInput.rawValue]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      batteryCapacity: batteryCapacityInput.rawValue,
    }));
  }, [batteryCapacityInput.rawValue]);

  // Handle input change (no validation on change)
  const handleChange = useCallback((field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Handle validation on blur (when user leaves the field)
  const handleBlur = useCallback(
    (field: keyof FormData) => {
      // Get value from currency hooks or form
      let value = form[field];
      if (field === "price") value = priceInput.rawValue;
      if (field === "mileage") value = mileageInput.rawValue;
      if (field === "batteryCapacity") value = batteryCapacityInput.rawValue;

      const error = validateField(field, value, listingType);

      if (error) {
        setErrors((prev) => [
          ...prev.filter((e) => e.field !== field),
          { field, message: error },
        ]);
      } else {
        setErrors((prev) => prev.filter((e) => e.field !== field));
      }
    },
    [
      form,
      listingType,
      priceInput.rawValue,
      mileageInput.rawValue,
      batteryCapacityInput.rawValue,
    ]
  );

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    const previews = newFiles.map((f) => URL.createObjectURL(f));
    setUploadedImages((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => [...prev, ...previews]);
    success(
      t(
        "toast.imageUploadSuccess",
        `Uploaded ${newFiles.length} image${
          newFiles.length > 1 ? "s" : ""
        } successfully!`
      )
    );
  };

  const removeImage = (idx: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    success(t("toast.imageRemoveSuccess", "Image removed successfully!"));
  };

  const handleSubmit = async () => {
    if (!uploadedImages.length) {
      showError(t("seller.addListing.validation.uploadImageRequired"));
      return;
    }

    // Require description at create time; stay on Review & Submit (step 5)
    if (!form.description || !form.description.trim()) {
      setErrors([
        {
          field: "description",
          message: t("seller.addListing.validation.required"),
        },
      ]);
      setCurrentStep(5);
      showError(t("seller.addListing.validation.required"));
      return;
    }

    // Update form with currency input values before validation
    const formToValidate = {
      ...form,
      price: priceInput.rawValue,
      mileage: mileageInput.rawValue,
      batteryCapacity: batteryCapacityInput.rawValue,
    };

    const validation = validateForm(formToValidate, listingType);
    if (!validation.isValid) {
      setErrors(validation.errors);
      const hasDescriptionError = validation.errors.some(
        (e) => e.field === "description"
      );
      // If description is missing, keep user on review step
      setCurrentStep(hasDescriptionError ? 5 : 1);
      return;
    }

    setSubmitting(true);
    try {
      // API call - Create listing with auction if enabled
      let result;

      if (listingType === "vehicle") {
        const vehiclePayload: any = {
          title: form.title,
          description: form.description,
          price: Number(priceInput.rawValue),
          brand: form.make,
          model: form.model,
          year: Number(form.year),
          mileage: Number(mileageInput.rawValue),
          images: uploadedImages,
          specifications: {
            batteryAndCharging: {
              range: form.range || "",
            },
            performance: {
              acceleration: "",
              topSpeed: "",
              horsepower: "",
            },
            dimensions: {
              length: "",
              width: "",
              height: "",
              weight: "",
              cargoSpace: "",
            },
            warranty: {
              basic: "",
              powertrain: "",
              battery: "",
            },
          },
        };

        result = await createVehicle(vehiclePayload);
      } else {
        const batteryPayload: any = {
          title: form.title,
          description: form.description,
          price: Number(priceInput.rawValue),
          brand: form.make,
          capacity: Number(batteryCapacityInput.rawValue),
          year: Number(form.year),
          health: Number(form.batteryHealth),
          images: uploadedImages,
          specifications: {
            weight: form.spec_weight || undefined,
            voltage: form.spec_voltage || undefined,
            chemistry: form.spec_chemistry || undefined,
            degradation: form.spec_degradation || undefined,
            chargingTime: form.spec_chargingTime || undefined,
            installation: form.spec_installation || undefined,
            warrantyPeriod: form.spec_warrantyPeriod || undefined,
            temperatureRange: form.spec_temperatureRange || undefined,
          },
        };

        result = await createBattery(batteryPayload);
      }

      if (!result.success) {
        showError(
          result.message || t("toast.createFailed", "Failed to create listing")
        );
        return;
      }

      // Success - show message and refresh
      success(
        result.message ||
          t("toast.createSuccess", "Listing created successfully!")
      );

      // Refresh cache to show new listing immediately
      if (listingType === "vehicle") {
        await refreshVehicles();
      } else {
        await refreshBatteries();
      }

      // Reset form
      setForm({
        title: "",
        make: "",
        model: "",
        year: "",
        price: "",
        mileage: "",
        location: "",
        bodyType: "",
        exteriorColor: "",
        interiorColor: "",
        batteryHealth: "",
        range: "",
        batteryCapacity: "",
        description: "",
        spec_weight: "",
        spec_voltage: "",
        spec_chemistry: "",
        spec_degradation: "",
        spec_chargingTime: "",
        spec_installation: "",
        spec_warrantyPeriod: "",
        spec_temperatureRange: "",
      });
      priceInput.reset();
      mileageInput.reset();
      batteryCapacityInput.reset();
      setUploadedImages([]);
      setImagePreviews([]);
      setCurrentStep(1);
      setErrors([]);

      // Call onSuccess callback to switch to MyListings tab
      if (onSuccess) {
        onSuccess();
      }
    } catch (e) {
      console.error("Error in handleSubmit:", e);
      const errorMessage =
        e instanceof Error
          ? e.message
          : t("toast.createFailed", "Failed to create listing");
      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const steps =
    listingType === "vehicle"
      ? [
          t("seller.addListing.steps.basicInfo"),
          t("seller.addListing.steps.details"),
          t("seller.addListing.steps.battery"),
          t("seller.addListing.steps.photos"),
          t("seller.addListing.steps.reviewSubmit"),
        ]
      : [
          t("seller.addListing.steps.basicInfo"),
          t("seller.addListing.steps.batteryDetails"),
          t("seller.addListing.steps.specifications"),
          t("seller.addListing.steps.photos"),
          t("seller.addListing.steps.reviewSubmit"),
        ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              field="title"
              label={t("seller.addListing.fields.listingTitle")}
              placeholder={t("seller.addListing.placeholders.listingTitle")}
              required
              form={form}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
            />
            <Input
              field="price"
              label={t("seller.addListing.fields.price")}
              placeholder={t("seller.addListing.placeholders.price")}
              required
              form={form}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
              currencyInput={priceInput}
            />
            {listingType === "vehicle" ? (
              <Select
                field="make"
                label={t("seller.addListing.fields.make")}
                required
                options={[
                  { value: "tesla", label: "Tesla" },
                  { value: "nissan", label: "Nissan" },
                  { value: "bmw", label: "BMW" },
                  { value: "mercedes", label: "Mercedes-Benz" },
                  { value: "audi", label: "Audi" },
                  { value: "volkswagen", label: "Volkswagen" },
                  { value: "hyundai", label: "Hyundai" },
                  { value: "kia", label: "Kia" },
                  { value: "ford", label: "Ford" },
                  { value: "chevrolet", label: "Chevrolet" },
                  { value: "toyota", label: "Toyota" },
                  { value: "honda", label: "Honda" },
                  { value: "mazda", label: "Mazda" },
                  { value: "porsche", label: "Porsche" },
                  { value: "jaguar", label: "Jaguar" },
                  { value: "volvo", label: "Volvo" },
                  { value: "polestar", label: "Polestar" },
                  { value: "rivian", label: "Rivian" },
                  { value: "lucid", label: "Lucid Motors" },
                  { value: "byd", label: "BYD" },
                  { value: "vinfast", label: "VinFast" },
                  { value: "mg", label: "MG" },
                  { value: "other", label: "Other" },
                ]}
                form={form}
                errors={errors}
                handleChange={handleChange}
                handleBlur={handleBlur}
              />
            ) : (
              <Input
                field="make"
                label={t("seller.addListing.fields.brand")}
                placeholder={t("seller.addListing.placeholders.brand")}
                required
                form={form}
                errors={errors}
                handleChange={handleChange}
                handleBlur={handleBlur}
              />
            )}
            {listingType === "vehicle" && (
              <Input
                field="model"
                label={t("seller.addListing.fields.model")}
                placeholder={t("seller.addListing.placeholders.model")}
                required
                form={form}
                errors={errors}
                handleChange={handleChange}
                handleBlur={handleBlur}
              />
            )}
            <Select
              field="year"
              label={t("seller.addListing.fields.year")}
              required
              options={Array.from({ length: 10 }, (_, i) => 2025 - i).map(
                (y) => ({ value: y.toString(), label: y.toString() })
              )}
              form={form}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
            />
            {listingType === "vehicle" && (
              <Input
                field="mileage"
                label={t("seller.addListing.fields.mileage")}
                placeholder={t("seller.addListing.placeholders.mileage")}
                required
                form={form}
                errors={errors}
                handleChange={handleChange}
                handleBlur={handleBlur}
                currencyInput={mileageInput}
              />
            )}
          </div>
        );

      case 2:
        if (listingType === "vehicle")
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                field="location"
                label={t("seller.addListing.fields.location")}
                placeholder="San Francisco, CA"
                form={form}
                errors={errors}
                handleChange={handleChange}
                handleBlur={handleBlur}
              />
              <Select
                field="bodyType"
                label={t("seller.addListing.fields.bodyType")}
                options={[
                  { value: "sedan", label: "Sedan" },
                  { value: "suv", label: "SUV" },
                  { value: "hatchback", label: "Hatchback" },
                  { value: "coupe", label: "Coupe" },
                  { value: "wagon", label: "Wagon" },
                  { value: "truck", label: "Truck" },
                ]}
                form={form}
                errors={errors}
                handleChange={handleChange}
                handleBlur={handleBlur}
              />
              <Input
                field="exteriorColor"
                label={t("seller.addListing.fields.exteriorColor")}
                placeholder="Pearl White"
                form={form}
                errors={errors}
                handleChange={handleChange}
                handleBlur={handleBlur}
              />
              <Input
                field="interiorColor"
                label={t("seller.addListing.fields.interiorColor")}
                placeholder="Black"
                form={form}
                errors={errors}
                handleChange={handleChange}
                handleBlur={handleBlur}
              />
            </div>
          );
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              field="batteryCapacity"
              label={t("seller.addListing.fields.batteryCapacity")}
              placeholder="75"
              required
              form={form}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
              currencyInput={batteryCapacityInput}
            />
            <Input
              field="batteryHealth"
              label={t("seller.addListing.fields.batteryHealth")}
              placeholder={t("seller.addListing.placeholders.batteryHealth")}
              type="number"
              form={form}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
            />
          </div>
        );

      case 3:
        if (listingType === "vehicle")
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                field="batteryHealth"
                label={t("seller.addListing.fields.batteryHealth")}
                placeholder={t("seller.addListing.placeholders.batteryHealth")}
                type="number"
                form={form}
                errors={errors}
                handleChange={handleChange}
                handleBlur={handleBlur}
              />
              <Input
                field="range"
                label={t("seller.addListing.fields.range")}
                placeholder={t("seller.addListing.placeholders.range")}
                type="number"
                form={form}
                errors={errors}
                handleChange={handleChange}
                handleBlur={handleBlur}
              />
            </div>
          );
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              field="spec_weight"
              label={t("seller.addListing.batterySpecs.weight")}
              placeholder={t("seller.addListing.placeholders.weight")}
              type="number"
              form={form}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
            />
            <Input
              field="spec_voltage"
              label={t("seller.addListing.batterySpecs.voltage")}
              placeholder={t("seller.addListing.placeholders.voltage")}
              type="number"
              form={form}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
            />
            <Input
              field="spec_chemistry"
              label={t("seller.addListing.batterySpecs.chemistry")}
              placeholder={t("seller.addListing.placeholders.chemistry")}
              form={form}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
            />
            <Input
              field="spec_degradation"
              label={t("seller.addListing.batterySpecs.degradation")}
              placeholder={t("seller.addListing.placeholders.degradation")}
              type="number"
              form={form}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
            />
            <Input
              field="spec_chargingTime"
              label={t("seller.addListing.batterySpecs.chargingTime")}
              placeholder={t("seller.addListing.placeholders.chargingTime")}
              form={form}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
            />
            <Input
              field="spec_installation"
              label={t("seller.addListing.batterySpecs.installation")}
              placeholder={t("seller.addListing.placeholders.installation")}
              form={form}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
            />
            <Input
              field="spec_warrantyPeriod"
              label={t("seller.addListing.batterySpecs.warrantyPeriod")}
              placeholder={t("seller.addListing.placeholders.warrantyPeriod")}
              type="number"
              form={form}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
            />
            <Input
              field="spec_temperatureRange"
              label={t("seller.addListing.batterySpecs.temperatureRange")}
              placeholder={t("seller.addListing.placeholders.temperatureRange")}
              form={form}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 justify-center mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-center text-gray-800">
                {t("seller.addListing.fields.uploadPhotos")}
              </h3>
            </div>
            {imagePreviews.length === 0 ? (
              // Centered layout when no photos
              <div className="flex justify-center">
                <label className="w-64 h-48 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <svg
                    className="w-16 h-16 text-blue-600 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="text-sm text-gray-600 font-medium">
                    {t("seller.addListing.fields.selectPhotos")}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {t("seller.addListing.fields.clickOrDrag")}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files)}
                  />
                </label>
              </div>
            ) : (
              // Grid layout when photos are present
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={src}
                      alt=""
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
                <label className="w-full h-32 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="text-xs text-gray-600">
                    {t("seller.addListing.fields.selectPhotos")}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files)}
                  />
                </label>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-gray-900">
              {t("seller.addListing.steps.reviewSubmit")}
            </h3>

            {/* Basic Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                {t("seller.addListing.steps.basicInfo")}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-semibold text-gray-700 min-w-[110px]">
                    {t("seller.addListing.fields.listingTitle")}:
                  </span>
                  <span className="text-base font-semibold text-gray-900">
                    {form.title || "-"}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-semibold text-gray-700 min-w-[110px]">
                    {t("seller.addListing.fields.price")}:
                  </span>
                  <span className="text-base font-bold text-gray-900">
                    {form.price
                      ? `${Number(form.price).toLocaleString()} VNĐ`
                      : "-"}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-semibold text-gray-700 min-w-[110px]">
                    {t("seller.addListing.fields.year")}:
                  </span>
                  <span className="text-base font-semibold text-gray-900">
                    {form.year || "-"}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-semibold text-gray-700 min-w-[110px]">
                    {t("seller.addListing.fields.brand")}:
                  </span>
                  <span className="text-base font-semibold text-gray-900">
                    {form.make || "-"}
                  </span>
                </div>
                {listingType === "vehicle" && (
                  <>
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-semibold text-gray-700 min-w-[110px]">
                        {t("seller.addListing.fields.model")}:
                      </span>
                      <span className="text-base font-semibold text-gray-900">
                        {form.model || "-"}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-semibold text-gray-700 min-w-[110px]">
                        {t("seller.addListing.fields.mileage")}:
                      </span>
                      <span className="text-base font-semibold text-gray-900">
                        {form.mileage
                          ? `${Number(form.mileage).toLocaleString()} km`
                          : "-"}
                      </span>
                    </div>
                  </>
                )}
                {listingType === "battery" && (
                  <>
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-semibold text-gray-700 min-w-[110px]">
                        {t("seller.addListing.fields.batteryCapacity")}:
                      </span>
                      <span className="text-base font-semibold text-gray-900">
                        {form.batteryCapacity
                          ? `${form.batteryCapacity} kWh`
                          : "-"}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-semibold text-gray-700 min-w-[110px]">
                        {t("seller.addListing.fields.batteryHealth")}:
                      </span>
                      <span className="text-base font-semibold text-gray-900">
                        {form.batteryHealth ? `${form.batteryHealth}%` : "-"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Vehicle Specific Details */}
            {listingType === "vehicle" && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  {t("seller.addListing.steps.details")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-700 min-w-[110px]">
                      {t("seller.addListing.fields.location")}:
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      {form.location || "-"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-700 min-w-[110px]">
                      {t("seller.addListing.fields.bodyType")}:
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      {form.bodyType || "-"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-700 min-w-[110px]">
                      {t("seller.addListing.fields.exteriorColor")}:
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      {form.exteriorColor || "-"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-700 min-w-[110px]">
                      {t("seller.addListing.fields.interiorColor")}:
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      {form.interiorColor || "-"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Battery Specific Details */}
            {listingType === "vehicle" && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  {t("seller.addListing.steps.battery")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-700 min-w-[110px]">
                      {t("seller.addListing.fields.batteryHealth")}:
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      {form.batteryHealth ? `${form.batteryHealth}%` : "-"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-700 min-w-[110px]">
                      {t("seller.addListing.fields.range")}:
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      {form.range ? `${form.range} km` : "-"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Battery Specifications */}
            {listingType === "battery" && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  {t("seller.addListing.steps.specifications")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-700 min-w-[110px]">
                      {t("seller.addListing.batterySpecs.weight")}:
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      {form.spec_weight ? `${form.spec_weight} kg` : "-"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-700 min-w-[110px]">
                      {t("seller.addListing.batterySpecs.voltage")}:
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      {form.spec_voltage ? `${form.spec_voltage} V` : "-"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-700 min-w-[110px]">
                      {t("seller.addListing.batterySpecs.chemistry")}:
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      {form.spec_chemistry || "-"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-700 min-w-[110px]">
                      {t("seller.addListing.batterySpecs.degradation")}:
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      {form.spec_degradation
                        ? `${form.spec_degradation}%`
                        : "-"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-700 min-w-[110px]">
                      {t("seller.addListing.batterySpecs.chargingTime")}:
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      {form.spec_chargingTime || "-"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-700 min-w-[110px]">
                      {t("seller.addListing.batterySpecs.installation")}:
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      {form.spec_installation || "-"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-700 min-w-[110px]">
                      {t("seller.addListing.batterySpecs.warrantyPeriod")}:
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      {form.spec_warrantyPeriod
                        ? `${form.spec_warrantyPeriod} years`
                        : "-"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-700 min-w-[110px]">
                      {t("seller.addListing.batterySpecs.temperatureRange")}:
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      {form.spec_temperatureRange || "-"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Images */}
            {imagePreviews.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  {t("seller.addListing.fields.uploadPhotos")}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={src}
                        alt=""
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                {t("seller.addListing.fields.description")} *
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={5}
                placeholder={t("seller.addListing.placeholders.description")}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 placeholder-gray-600 text-base font-medium ${
                  hasFieldError(errors, "description")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {getFieldError(errors, "description") && (
                <p className="mt-1 text-sm text-red-600">
                  {t(
                    getFieldError(errors, "description") || "",
                    getFieldError(errors, "description") || ""
                  )}
                </p>
              )}
            </div>
          </div>
        );
    }
  };

  const handleNextStep = () => {
    // Xác định các field bắt buộc cho từng bước
    let requiredFields: (keyof FormData)[] = [];
    if (currentStep === 1) {
      requiredFields =
        listingType === "vehicle"
          ? ["title", "price", "make", "model", "year", "mileage"]
          : ["title", "price", "make", "year"]; // Battery step 1: only basic info
    }
    if (currentStep === 2) {
      requiredFields =
        listingType === "vehicle"
          ? ["location", "bodyType", "exteriorColor", "interiorColor"]
          : ["batteryCapacity", "batteryHealth"]; // Battery step 2: capacity and health
    }
    if (currentStep === 3) {
      requiredFields =
        listingType === "vehicle"
          ? ["batteryHealth", "range"]
          : [
              "spec_weight",
              "spec_voltage",
              "spec_chemistry",
              "spec_degradation",
            ];
    }
    if (currentStep === 4) {
      if (imagePreviews.length === 0) {
        showError(t("seller.addListing.validation.uploadImageRequired"));
        return;
      }
    }

    // Kiểm tra field rỗng - phải check cả currency input hooks
    const emptyFields = requiredFields.filter((field) => {
      // Check currency input hooks for price, mileage, batteryCapacity
      if (field === "price") return !priceInput.rawValue;
      if (field === "mileage") return !mileageInput.rawValue;
      if (field === "batteryCapacity") return !batteryCapacityInput.rawValue;
      // Otherwise check form
      return !form[field];
    });

    if (emptyFields.length > 0) {
      setErrors(
        emptyFields.map((field) => ({
          field,
          message: t("seller.addListing.validation.required"),
        }))
      );
      showError(t("seller.addListing.validation.required"));
      return;
    }

    setErrors([]);
    setCurrentStep(currentStep + 1);
  };

  return (
    <div className="max-w-5xl mx-auto px-0 sm:px-8 py-12">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header & Type Selection */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mb-12">
        <div>
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            {t("seller.addListing.title")}
          </h2>
          <p className="text-lg text-slate-500">
            {t("seller.addListing.subtitle")}
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setListingType("vehicle");
              // Reset form when switching type
              setForm({
                title: "",
                make: "",
                model: "",
                year: "",
                price: "",
                mileage: "",
                location: "",
                bodyType: "",
                exteriorColor: "",
                interiorColor: "",
                batteryHealth: "",
                range: "",
                batteryCapacity: "",
                description: "",
                spec_weight: "",
                spec_voltage: "",
                spec_chemistry: "",
                spec_degradation: "",
                spec_chargingTime: "",
                spec_installation: "",
                spec_warrantyPeriod: "",
                spec_temperatureRange: "",
              });
              priceInput.reset();
              mileageInput.reset();
              batteryCapacityInput.reset();
              setUploadedImages([]);
              setImagePreviews([]);
              setCurrentStep(1);
              setErrors([]);
            }}
            className={`flex items-center gap-3 px-7 py-4 rounded-xl border-2 transition-all duration-300 font-semibold text-lg
              ${
                listingType === "vehicle"
                  ? "bg-blue-700 text-white border-blue-700 shadow-lg scale-105"
                  : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-400"
              }`}
          >
            <FiTruck className="w-7 h-7" />
            {t("seller.listings.vehicle")}
          </button>
          <button
            onClick={() => {
              setListingType("battery");
              // Reset form when switching type
              setForm({
                title: "",
                make: "",
                model: "",
                year: "",
                price: "",
                mileage: "",
                location: "",
                bodyType: "",
                exteriorColor: "",
                interiorColor: "",
                batteryHealth: "",
                range: "",
                batteryCapacity: "",
                description: "",
                spec_weight: "",
                spec_voltage: "",
                spec_chemistry: "",
                spec_degradation: "",
                spec_chargingTime: "",
                spec_installation: "",
                spec_warrantyPeriod: "",
                spec_temperatureRange: "",
              });
              priceInput.reset();
              mileageInput.reset();
              batteryCapacityInput.reset();
              setUploadedImages([]);
              setImagePreviews([]);
              setCurrentStep(1);
              setErrors([]);
            }}
            className={`flex items-center gap-3 px-7 py-4 rounded-xl border-2 transition-all duration-300 font-semibold text-lg
              ${
                listingType === "battery"
                  ? "bg-blue-700 text-white border-blue-700 shadow-lg scale-105"
                  : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-400"
              }`}
          >
            <FiBatteryCharging className="w-7 h-7" />
            {t("seller.listings.battery")}
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-0 mb-12">
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold transition-all duration-200
                  ${
                    i + 1 < currentStep
                      ? "bg-green-600 text-white"
                      : i + 1 === currentStep
                      ? "bg-blue-700 text-white scale-110 shadow-lg"
                      : "bg-gray-200 text-gray-600"
                  }`}
              >
                {i + 1 < currentStep ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium text-center ${
                  i + 1 <= currentStep ? "text-blue-700" : "text-gray-500"
                }`}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-16 h-1 mx-2 rounded-full transition-all duration-200 ${
                  i + 1 < currentStep ? "bg-green-600" : "bg-gray-300"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form Section */}
      <div className="bg-transparent mb-8">{renderStep()}</div>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4 pt-4">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all shadow-sm hover:shadow-md disabled:hover:shadow-none flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {t("seller.addListing.buttons.previous")}
        </button>

        {currentStep < steps.length ? (
          <button
            onClick={handleNextStep}
            className="px-8 py-3 bg-blue-700 text-white rounded-xl font-bold shadow-lg hover:bg-blue-800 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            {t("seller.addListing.buttons.next")}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {t("seller.addListing.buttons.creating")}
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {t("seller.addListing.buttons.createListing")}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default AddListing;
