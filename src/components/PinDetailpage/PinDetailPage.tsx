"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBatteryById, type Battery } from "../../services";
import PinDetailHero from "./PinDetailHero";
import PinSpecifications from "./PinSpecifications";
import SellerInfo from "../CarDetailpage/SellerInfo";

function PinDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [battery, setBattery] = useState<Battery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBattery = async () => {
      try {
        const batteryId = params.id as string;
        const response = await getBatteryById(batteryId);

        if (response.success && response.data) {
          // Handle both possible response structures
          const batteryData = (response.data as any).battery || response.data;
          setBattery(batteryData as Battery);
        } else {
          setError(response.message || "Failed to fetch battery details");
        }
      } catch (err) {
        setError("Failed to fetch battery details");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBattery();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen mt-25">
        {/* Skeleton UI for Battery Detail */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Hero Section Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Image Skeleton */}
            <div className="bg-gray-200 animate-pulse rounded-xl h-96"></div>
            {/* Info Skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 animate-pulse rounded w-1/3"></div>
              <div className="space-y-2 mt-4">
                <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded w-5/6"></div>
              </div>
              <div className="flex gap-4 mt-6">
                <div className="h-12 bg-gray-200 animate-pulse rounded flex-1"></div>
                <div className="h-12 bg-gray-200 animate-pulse rounded flex-1"></div>
              </div>
            </div>
          </div>
          {/* Specifications Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="h-6 bg-gray-200 animate-pulse rounded w-48 mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div>
                  <div className="h-5 bg-gray-200 animate-pulse rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !battery) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || "Battery not found"}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Create a mock vehicle object for SellerInfo compatibility
  const mockVehicleForSeller = {
    id: battery.id,
    title: battery.title,
    description: battery.description,
    price: battery.price,
    images: battery.images,
    status: battery.status,
    brand: battery.brand,
    model: "",
    year: battery.year,
    mileage: 0,
    specifications: {},
    isVerified: battery.isVerified,
    createdAt: battery.createdAt,
    updatedAt: battery.updatedAt,
    sellerId: battery.sellerId,
    seller: {
      id: battery.sellerId,
      name: "EVMarket Battery Seller",
      avatar: "",
    },
  };
  return (
    <div className="min-h-screen pt-25">
      {/* Hero Section */}
      <PinDetailHero battery={battery} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <PinSpecifications battery={battery} />
          </div>

          {/* Right Column - Seller Info */}
          <div className="lg:col-span-1">
            <SellerInfo vehicle={mockVehicleForSeller} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PinDetailPage;
