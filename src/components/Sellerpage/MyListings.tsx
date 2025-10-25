"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useI18nContext } from "../../providers/I18nProvider";
import Image from "next/image";
import {
  getMyVehicles,
  updateVehicle,
  deleteVehicle,
  type Vehicle,
} from "../../services/Vehicle";
import {
  getMyBatteries,
  updateBattery,
  deleteBattery,
  type Battery,
  // getBatteries
} from "../../services/Battery";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../common/Toast";
import {
  validateField,
  validateForm,
  getFieldError,
  hasFieldError,
  parseApiValidationErrors,
  ValidationError,
} from "../../Utils/validation";
import { useDataContext } from "../../contexts/DataContext";
import { GridSkeleton } from "../common/Skeleton";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";

type ListingType = "vehicle" | "battery";

function MyListings() {
  const { t } = useI18nContext();
  const { toasts, success, error: showError, removeToast } = useToast();
  const { refreshVehicles, refreshBatteries } = useDataContext();
  const [filter, setFilter] = useState<"all" | "active" | "sold">("all");
  const [tab, setTab] = useState<ListingType>("vehicle");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editType, setEditType] = useState<ListingType>("vehicle");
  const [editId, setEditId] = useState<string | null>(null);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );

  // Form data state
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    year: "",
    mileage: "",
    description: "",
    brand: "",
    model: "",
    status: "AVAILABLE",
    capacity: "",
    health: "",
  });

  const setApiErrors = (errors: Record<string, string>) => {
    const validationErrors = Object.entries(errors).map(([field, message]) => ({
      field,
      message,
    }));
    setValidationErrors(validationErrors);
  };

  // Helper functions for styling
  const getInputClass = (fieldName: string) => {
    const baseClass =
      "w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-all font-medium";
    const errorClass = "border-red-500 focus:ring-red-500";
    return hasFieldError(validationErrors, fieldName)
      ? `${baseClass} ${errorClass}`
      : baseClass;
  };

  const ErrorMessage = ({ fieldName }: { fieldName: string }) => {
    const error = getFieldError(validationErrors, fieldName);
    const translatedError = error ? t(error, error) : null;
    return translatedError ? (
      <p className="mt-1 text-sm text-red-600">{translatedError}</p>
    ) : null;
  };

  // Handle input change (no validation on change)
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Handle number input - only allow numbers for specific fields
  const handleNumberInput = useCallback(
    (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // Check if field should only accept numbers
      const numberFields = ["price", "year", "mileage", "capacity", "health"];

      if (numberFields.includes(field)) {
        // Allow empty string, numbers, and decimal point
        if (value === "" || /^\d*\.?\d*$/.test(value)) {
          handleInputChange(field, value);
        }
      } else {
        handleInputChange(field, value);
      }
    },
    [handleInputChange]
  );

  // Handle key press for number fields - prevent non-numeric characters
  const handleNumberKeyPress = useCallback(
    (field: string, e: React.KeyboardEvent<HTMLInputElement>) => {
      const numberFields = ["price", "year", "mileage", "capacity", "health"];

      if (numberFields.includes(field)) {
        // Allow: backspace, delete, tab, escape, enter, decimal point
        if (
          [8, 9, 27, 13, 46, 110, 190].indexOf(e.keyCode) !== -1 ||
          // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
          (e.keyCode === 65 && e.ctrlKey === true) ||
          (e.keyCode === 67 && e.ctrlKey === true) ||
          (e.keyCode === 86 && e.ctrlKey === true) ||
          (e.keyCode === 88 && e.ctrlKey === true)
        ) {
          return;
        }
        // Ensure that it is a number and stop the keypress
        if (
          (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
          (e.keyCode < 96 || e.keyCode > 105)
        ) {
          e.preventDefault();
        }
      }
    },
    []
  );

  // Handle validation on blur (when user leaves the field)
  const handleInputBlur = useCallback(
    (field: string) => {
      const value = formData[field as keyof typeof formData];
      const error = validateField(field, value, editType);

      if (error) {
        setValidationErrors((prev) => [
          ...prev.filter((err) => err.field !== field),
          { field, message: error },
        ]);
      } else {
        setValidationErrors((prev) =>
          prev.filter((err) => err.field !== field)
        );
      }
    },
    [formData, editType]
  );

  // Image handling functions
  const openFilePicker = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = () => {
      const files = Array.from(input.files || []);
      handleNewFiles(files);
    };
    input.click();
  };

  const handleNewFiles = (files: File[]) => {
    if (!files.length) return;
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setNewImages((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    success(
      t(
        "toast.imageUploadSuccess",
        `Uploaded ${files.length} image${
          files.length > 1 ? "s" : ""
        } successfully!`
      )
    );
  };

  const removeExistingImage = (index: number) => {
    setEditImages((prev) => prev.filter((_, i) => i !== index));
    success(t("toast.imageRemoveSuccess", "Image removed successfully!"));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    success(t("toast.imageRemoveSuccess", "Image removed successfully!"));
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [vRes, bRes] = await Promise.all([
          getMyVehicles(),
          getMyBatteries(),
        ]);
        if (vRes.success) setVehicles(vRes.data?.vehicles || []);
        if (bRes.success) setBatteries(bRes.data?.batteries || []);
        if (!vRes.success || !bRes.success)
          setError(vRes.message || bRes.message);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load listings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const listings = useMemo(() => {
    if (tab === "vehicle")
      return vehicles
        .filter((v) => v.status !== "DELISTED") // Ẩn các sản phẩm DELISTED
        .map((v) => ({
          id: v.id,
          type: "vehicle" as const,
          title: v.title,
          price: `$${Number(v.price).toLocaleString()}`,
          status: v.status === "SOLD" ? "sold" : "active",
          image: v.images?.[0] || "/Homepage/TopCar.png",
          specs: {
            mileage: `${v.mileage?.toLocaleString()} km`,
            battery: v.specifications?.batteryAndCharging?.range
              ? `${v.specifications.batteryAndCharging.range} km range`
              : "",
            year: v.year ? `${v.year}` : "",
            brand: v.brand || "",
            model: v.model || "",
          },
        }));
    return batteries
      .filter((b) => b.status !== "DELISTED") // Ẩn các sản phẩm DELISTED
      .map((b) => ({
        id: b.id,
        type: "battery" as const,
        title: b.title,
        price: `$${Number(b.price).toLocaleString()}`,
        status: b.status === "SOLD" ? "sold" : "active",
        image: b.images?.[0] || "/Homepage/Car.png",
        specs: {
          capacity: b.capacity ? `${b.capacity} kWh` : "",
          health: `${b.health}% health`,
          year: b.year ? `${b.year}` : "",
          brand: b.brand || "",
        },
      }));
  }, [tab, vehicles, batteries]);

  const filteredListings = listings.filter((l) =>
    filter === "all" ? true : l.status === filter
  );

  const openEdit = (item: { id: string; type: ListingType }) => {
    setEditType(item.type);
    setEditId(item.id);

    if (item.type === "vehicle") {
      const v = vehicles.find((v) => v.id === item.id);
      const formData = {
        title: v?.title || "",
        price: String(v?.price ?? ""),
        year: String(v?.year ?? ""),
        mileage: String(v?.mileage ?? ""),
        description: v?.description || "",
        brand: v?.brand || "",
        model: v?.model || "",
        status: v?.status || "AVAILABLE",
        capacity: "",
        health: "",
      };
      setFormData(formData);
      setEditImages(v?.images || []);
    } else {
      const b = batteries.find((b) => b.id === item.id);
      const formData = {
        title: b?.title || "",
        price: String(b?.price ?? ""),
        year: String(b?.year ?? ""),
        mileage: "",
        description: b?.description || "",
        brand: b?.brand || "",
        model: "",
        status: "AVAILABLE",
        capacity: String(b?.capacity ?? ""),
        health: String(b?.health ?? ""),
      };
      setFormData(formData);
      setEditImages(b?.images || []);
    }

    setNewImages([]);
    setImagePreviews([]);
    setValidationErrors([]);
    setIsModalOpen(true);
  };

  const onDelete = async (item: { id: string; type: ListingType }) => {
    const result = await Swal.fire({
      title: t("seller.listings.deleteConfirmTitle", "Xác nhận xóa"),
      text: t("seller.listings.deleteConfirm", "Bạn có chắc muốn xóa tin này?"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("common.confirm", "Xác nhận"),
      cancelButtonText: t("common.cancel", "Hủy"),
    });

    if (!result.isConfirmed) return;

    try {
      if (item.type === "vehicle") {
        const res = await deleteVehicle(item.id);
        if (!res.success) throw new Error(res.message);
        setVehicles((prev) => prev.filter((v) => v.id !== item.id));
        await refreshVehicles();
        success(t("toast.vehicleDeleteSuccess", "Xóa xe thành công!"));
      } else {
        const res = await deleteBattery(item.id);
        if (!res.success) throw new Error(res.message);
        setBatteries((prev) => prev.filter((b) => b.id !== item.id));
        await refreshBatteries();
        success(t("toast.batteryDeleteSuccess", "Xóa pin thành công!"));
      }
    } catch (e) {
      showError(
        e instanceof Error ? e.message : t("toast.deleteFailed", "Xóa thất bại")
      );
    }
  };

  const onSave = async () => {
    if (!editId) {
      showError("Không tìm thấy ID để cập nhật");
      return;
    }


    try {
      // Map formData fields to validation format based on editType
      let validationData;
      if (editType === "vehicle") {
        validationData = {
          title: formData.title,
          description: formData.description,
          price: formData.price,
          make: formData.brand, // Map brand to make for validation
          model: formData.model,
          year: formData.year,
          mileage: formData.mileage,
        };
      } else {
        validationData = {
          title: formData.title,
          description: formData.description,
          price: formData.price,
          year: formData.year,
          batteryCapacity: formData.capacity, // Map capacity to batteryCapacity for validation
          batteryHealth: formData.health,
          ...(formData.brand && { make: formData.brand }), // Only add make if brand has value
        };
      }


      // Validate form data
      const validationResult = validateForm(validationData, editType);

      if (!validationResult.isValid) {
      ;
        setValidationErrors(validationResult.errors);
        showError(
          `Validation failed: ${validationResult.errors
            .map((e) => `${e.field}: ${e.message}`)
            .join(", ")}`
        );
        return;
      }

      let result;
      if (editType === "vehicle") {
        const payload = {
          title: formData.title,
          price: Number(formData.price) || undefined,
          year: Number(formData.year) || undefined,
          mileage: Number(formData.mileage) || undefined,
          description: formData.description,
          brand: formData.brand,
          model: formData.model,
          status: formData.status as "AVAILABLE" | "SOLD" | "DELISTED",
          images: newImages.length > 0 ? newImages : undefined,
        };
        result = await updateVehicle(editId, payload);
      } else {
        const payload = {
          title: formData.title,
          price: Number(formData.price) || undefined,
          year: Number(formData.year) || undefined,
          capacity: Number(formData.capacity) || undefined,
          health: Number(formData.health) || undefined,
          description: formData.description,
          brand: formData.brand,
          images: newImages.length > 0 ? newImages : undefined,
        };
        result = await updateBattery(editId, payload);
      }


      if (!result.success) {
        // Handle API validation errors
        if ((result as any).errors || (result as any).details) {
          const apiErrors = parseApiValidationErrors(result as any);
          const apiValidationErrors = Object.entries(apiErrors).map(
            ([field, message]) => ({
              field,
              message,
            })
          );
          setValidationErrors(apiValidationErrors);
        } else {
          showError(result.message || t("seller.listings.updateError"));
        }
        return;
      }

      // Update local state
      if (editType === "vehicle") {
        const updatedVehicle = (result.data as any)?.vehicle || result.data;
        setVehicles((prev) =>
          prev.map((v) => (v.id === editId ? { ...v, ...updatedVehicle } : v))
        );
        await refreshVehicles(); // Refresh cache
        success(
          t("toast.vehicleUpdateSuccess", "Xe được cập nhật thành công!")
        );
      } else {
        const updatedBattery = (result.data as any)?.battery || result.data;
        setBatteries((prev) =>
          prev.map((b) => (b.id === editId ? { ...b, ...updatedBattery } : b))
        );
        await refreshBatteries(); // Refresh cache
        success(
          t("toast.batteryUpdateSuccess", "Pin được cập nhật thành công!")
        );
      }

      setIsModalOpen(false);
    } catch (e) {
      console.error("Error in onSave:", e);
      showError(
        e instanceof Error
          ? e.message
          : t("toast.updateFailed", "Cập nhật thất bại")
      );
    }
  };

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'active':
  //       return 'bg-green-100 text-green-800'
  //     case 'sold':
  //       return 'bg-gray-100 text-gray-800'
  //     default:
  //       return 'bg-gray-100 text-gray-800'
  //   }
  // }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 bg-white min-h-screen">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
          {t("seller.listings.title")}
        </h2>
        <p className="text-base text-slate-500 mt-2">
          {t("seller.listings.subtitle")}
        </p>
      </div>

      {/* Tabs & Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-blue-100 pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("vehicle")}
            className={`relative px-5 py-2 font-semibold rounded-t-lg transition-colors duration-200
            ${
              tab === "vehicle"
                ? "text-blue-700 border-b-2 border-blue-700 bg-blue-50"
                : "text-slate-600 hover:text-blue-700"
            }
          `}
          >
            <span className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1"
                />
              </svg>
              {t("seller.listings.vehicle")}
            </span>
          </button>
          <button
            onClick={() => setTab("battery")}
            className={`relative px-5 py-2 font-semibold rounded-t-lg transition-colors duration-200
            ${
              tab === "battery"
                ? "text-blue-700 border-b-2 border-blue-700 bg-blue-50"
                : "text-slate-600 hover:text-blue-700"
            }
          `}
          >
            <span className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              {t("seller.listings.battery")}
            </span>
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors duration-200
            ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 hover:bg-blue-50"
            }
          `}
          >
            {t("seller.listings.all")}
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors duration-200
            ${
              filter === "active"
                ? "bg-green-600 text-white"
                : "bg-white text-slate-700 hover:bg-green-50"
            }
          `}
          >
            {t("seller.listings.active")}
          </button>
          <button
            onClick={() => setFilter("sold")}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors duration-200
            ${
              filter === "sold"
                ? "bg-gray-600 text-white"
                : "bg-white text-slate-700 hover:bg-gray-50"
            }
          `}
          >
            {t("seller.listings.sold")}
          </button>
        </div>
      </div>

      {/* Loading/Error */}
      {loading && <GridSkeleton count={6} columns={3} showBadge={true} />}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {filteredListings.map((item, idx) => (
          <div
            key={item.id}
            className="group relative flex flex-col bg-white rounded-3xl shadow-2xl border border-blue-100 hover:border-blue-400 hover:shadow-[0_8px_32px_0_rgba(59,130,246,0.10)] transition-all duration-300 overflow-hidden cursor-pointer"
            style={{ minHeight: "420px" }}
          >
            {/* Top Action Bar */}
            <div className="absolute top-5 right-5 flex gap-2 z-10">
              <button
                onClick={() => openEdit({ id: item.id, type: tab })}
                className="bg-white border border-blue-200 rounded-full p-3 shadow hover:bg-blue-600 hover:text-white transition-colors"
                title={t("seller.listings.edit")}
              >
                <FiEdit2 className="w-6 h-6" />
              </button>
              <button
                onClick={() => onDelete({ id: item.id, type: tab })}
                className="bg-white border border-red-200 rounded-full p-3 shadow hover:bg-red-600 hover:text-white transition-colors"
                title={t("seller.listings.delete")}
              >
                <FiTrash2 className="w-6 h-6" />
              </button>
            </div>
            {/* Image */}
            <div className="relative h-56 bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-contain rounded-2xl border border-blue-100 group-hover:scale-105 transition-transform duration-300"
              />
              {/* Status Badge */}
              <span
                className={`absolute bottom-5 left-5 flex items-center gap-1 px-4 py-1 text-sm font-semibold rounded-full shadow
            ${
              item.status === "active"
                ? "bg-green-500 text-white"
                : "bg-gray-400 text-white"
            }`}
              >
                {item.status === "active"
                  ? t("seller.listings.available")
                  : t("seller.listings.soldStatus")}
              </span>
            </div>
            {/* Info */}
            <div className="flex-1 flex flex-col justify-between p-7">
              {/* Title & Price */}
              <div className="flex justify-between items-start mb-3">
                <h3
                  className="font-bold text-2xl text-slate-900 truncate max-w-[70%] group-hover:text-blue-700 transition-colors duration-200"
                  title={item.title}
                >
                  {item.title}
                </h3>
                <span className="text-2xl font-bold text-indigo-700 group-hover:text-blue-700 transition-colors duration-200">
                  {item.price}
                </span>
              </div>
              {/* Brand & Model */}
              {item.specs.brand && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base text-slate-500 font-medium">
                    {item.specs.brand}
                  </span>
                  {"model" in item.specs && item.specs.model && (
                    <span className="text-base text-slate-400">
                      • {item.specs.model}
                    </span>
                  )}
                </div>
              )}
              {/* Specs */}
              <div className="flex flex-wrap gap-2 text-base text-slate-700 mb-4">
                {item.type === "vehicle" ? (
                  <>
                    {item.specs.year && (
                      <span className="bg-slate-100 px-3 py-1 rounded">
                        {item.specs.year}
                      </span>
                    )}
                    {item.specs.mileage && (
                      <span className="bg-slate-100 px-3 py-1 rounded">
                        {item.specs.mileage}
                      </span>
                    )}
                    {item.specs.battery && (
                      <span className="bg-slate-100 px-3 py-1 rounded">
                        {item.specs.battery}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    {item.specs.year && (
                      <span className="bg-slate-100 px-3 py-1 rounded">
                        {item.specs.year}
                      </span>
                    )}
                    {item.specs.capacity && (
                      <span className="bg-slate-100 px-3 py-1 rounded">
                        {item.specs.capacity}
                      </span>
                    )}
                    {item.specs.health && (
                      <span className="bg-slate-100 px-3 py-1 rounded">
                        {item.specs.health}
                      </span>
                    )}
                  </>
                )}
              </div>
              {/* Bottom Row */}
              <div className="flex items-center justify-between mt-auto">
                {/* Brand Badge */}
                {item.specs.brand && (
                  <span className="inline-block px-4 py-1 text-sm rounded-full bg-slate-100 text-slate-700 font-semibold shadow-sm">
                    {item.specs.brand}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredListings.length === 0 && !loading && (
        <div className="text-center py-20 bg-white rounded-xl shadow border border-gray-100 mt-8">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t("seller.listings.noListings")}
            </h3>
            <p className="text-base text-slate-500 mb-6">
              {t("seller.listings.noListingsDesc")}
            </p>
          </div>
        </div>
      )}

      {/* Modal giữ nguyên, có thể chỉnh lại header gradient, nút nổi bật, chia cột rõ ràng */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-3xl rounded-3xl shadow-2xl bg-white flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-10 py-7 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-t-3xl shadow-lg">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  {editType === "vehicle" ? (
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-blue-900/30">
                      <svg
                        className="w-7 h-7"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1"
                        />
                      </svg>
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-900/30">
                      <svg
                        className="w-7 h-7"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </span>
                  )}
                  <span>
                    {editType === "vehicle"
                      ? t("seller.listings.editVehicle")
                      : t("seller.listings.editBattery")}
                  </span>
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                  {t(
                    "seller.listings.editSubtitle",
                    "Cập nhật thông tin tin đăng của bạn"
                  )}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors focus:outline-none"
                aria-label={t("seller.listings.cancel")}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content with internal scroll */}
            <form
              className="flex-1 overflow-y-auto px-10 py-8 space-y-8"
              style={{ maxHeight: "calc(90vh - 112px)" }} // 112px là chiều cao header + footer
              onSubmit={(e) => {
                e.preventDefault();
                onSave();
              }}
              autoComplete="off"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    {t("seller.listings.form.title")}{" "}
                    <span className="text-red-600 font-bold">*</span>
                  </label>
                  <input
                    className={getInputClass("title")}
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    onBlur={() => handleInputBlur("title")}
                    placeholder={t("seller.listings.form.titlePlaceholder")}
                  />
                  <ErrorMessage fieldName="title" />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    {t("seller.listings.form.price")}{" "}
                    <span className="text-red-600 font-bold">*</span>
                  </label>
                  <input
                    type="number"
                    className={getInputClass("price")}
                    value={formData.price}
                    onChange={(e) => handleNumberInput("price", e)}
                    onKeyDown={(e) => handleNumberKeyPress("price", e)}
                    onBlur={() => handleInputBlur("price")}
                    placeholder={t("seller.listings.form.pricePlaceholder")}
                  />
                  <ErrorMessage fieldName="price" />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    {t("seller.listings.form.year")}{" "}
                    <span className="text-red-600 font-bold">*</span>
                  </label>
                  <input
                    type="number"
                    className={getInputClass("year")}
                    value={formData.year}
                    onChange={(e) => handleNumberInput("year", e)}
                    onKeyDown={(e) => handleNumberKeyPress("year", e)}
                    onBlur={() => handleInputBlur("year")}
                    placeholder={t("seller.listings.form.yearPlaceholder")}
                  />
                  <ErrorMessage fieldName="year" />
                </div>
                {editType === "vehicle" ? (
                  <>
                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-2">
                        {t("seller.listings.form.mileage")}{" "}
                        <span className="text-red-600 font-bold">*</span>
                      </label>
                      <input
                        type="number"
                        className={getInputClass("mileage")}
                        value={formData.mileage || ""}
                        onChange={(e) => handleNumberInput("mileage", e)}
                        onKeyDown={(e) => handleNumberKeyPress("mileage", e)}
                        onBlur={() => handleInputBlur("mileage")}
                        placeholder={t(
                          "seller.listings.form.mileagePlaceholder"
                        )}
                      />
                      <ErrorMessage fieldName="mileage" />
                    </div>
                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-2">
                        {t("seller.listings.form.brand")}{" "}
                        <span className="text-red-600 font-bold">*</span>
                      </label>
                      <input
                        className={getInputClass("brand")}
                        value={formData.brand || ""}
                        onChange={(e) =>
                          handleInputChange("brand", e.target.value)
                        }
                        onBlur={() => handleInputBlur("brand")}
                        placeholder={t("seller.listings.form.brandPlaceholder")}
                      />
                      <ErrorMessage fieldName="brand" />
                    </div>
                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-2">
                        {t("seller.listings.form.model")}{" "}
                        <span className="text-red-600 font-bold">*</span>
                      </label>
                      <input
                        className={getInputClass("model")}
                        value={formData.model || ""}
                        onChange={(e) =>
                          handleInputChange("model", e.target.value)
                        }
                        onBlur={() => handleInputBlur("model")}
                        placeholder={t("seller.listings.form.modelPlaceholder")}
                      />
                      <ErrorMessage fieldName="model" />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-2">
                        {t("seller.listings.form.capacity")}{" "}
                        <span className="text-red-600 font-bold">*</span>
                      </label>
                      <input
                        type="number"
                        className={getInputClass("capacity")}
                        value={formData.capacity || ""}
                        onChange={(e) => handleNumberInput("capacity", e)}
                        onKeyDown={(e) => handleNumberKeyPress("capacity", e)}
                        onBlur={() => handleInputBlur("capacity")}
                        placeholder={t(
                          "seller.listings.form.capacityPlaceholder"
                        )}
                      />
                      <ErrorMessage fieldName="capacity" />
                    </div>
                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-2">
                        {t("seller.listings.form.health")}{" "}
                        <span className="text-red-600 font-bold">*</span>
                      </label>
                      <input
                        type="number"
                        className={getInputClass("health")}
                        value={formData.health || ""}
                        onChange={(e) => handleNumberInput("health", e)}
                        onKeyDown={(e) => handleNumberKeyPress("health", e)}
                        onBlur={() => handleInputBlur("health")}
                        placeholder={t(
                          "seller.listings.form.healthPlaceholder"
                        )}
                      />
                      <ErrorMessage fieldName="health" />
                    </div>
                  </>
                )}
                <div className="md:col-span-2">
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    {t("seller.listings.form.description")}{" "}
                    <span className="text-red-600 font-bold">*</span>
                  </label>
                  <textarea
                    className={getInputClass("description")}
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    onBlur={() => handleInputBlur("description")}
                    placeholder={t(
                      "seller.listings.form.descriptionPlaceholder"
                    )}
                  />
                  <ErrorMessage fieldName="description" />
                </div>

                {/* Image Management Section */}
                <div className="md:col-span-2">
                  <label className="block text-base font-semibold text-gray-800 mb-3">
                    {t("seller.addListing.fields.uploadPhotos")}
                  </label>

                  {/* Existing Images */}
                  {editImages.length > 0 && (
                    <div className="mb-4">
                      {/* <h4 className="text-sm font-medium mb-2">Hình ảnh hiện tại:</h4> */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {editImages.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`existing-${index}`}
                              className="w-full h-20 object-cover rounded-lg border"
                            />
                            <button
                              onClick={() => removeExistingImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition"
                              aria-label={t("seller.listings.delete")}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Images */}
                  {imagePreviews.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-base font-semibold text-gray-800 mb-3">
                        {t("seller.listings.newImages")}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`new-${index}`}
                              className="w-full h-20 object-cover rounded-lg border"
                            />
                            <button
                              onClick={() => removeNewImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition"
                              aria-label={t("seller.listings.delete")}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Images Button */}
                  <button
                    type="button"
                    onClick={openFilePicker}
                    className="w-full py-4 px-6 border-2 border-dashed border-gray-400 rounded-xl text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 font-semibold"
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <span>{t("seller.listings.addNewImages")}</span>
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-4 pt-8 border-t border-gray-200 bg-white sticky bottom-0 px-10 pb-7">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all font-bold shadow-sm hover:shadow-md flex items-center gap-2"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  {t("seller.listings.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-bold shadow-md hover:shadow-lg transform hover:scale-105 duration-200 flex items-center gap-2"
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {t("seller.listings.saveChanges")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyListings;
