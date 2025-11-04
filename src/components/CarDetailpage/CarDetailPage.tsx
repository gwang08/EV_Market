"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getVehicleById,
  type Vehicle,
  type VehicleResponse,
} from "../../services";
import CarDetailHero from "./CarDetailHero";
import CarDetailTabs from "./CarDetailTabs";
import SellerInfo from "./SellerInfo";
import colors from "../../Utils/Color";
import { useRouter } from "next/navigation";

function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const vehicleId = params.id as string;
        const response = await getVehicleById(vehicleId);

        if (response.success && response.data) {
          // Handle both possible response structures
          const vehicleData = (response.data as any).vehicle || response.data;
          setVehicle(vehicleData as Vehicle);
        } else {
          setError(response.message || "Failed to fetch vehicle details");
        }
      } catch (err) {
        setError("Failed to fetch vehicle details");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchVehicle();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white mt-25">
        {/* Skeleton UI for Vehicle Detail */}
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
          {/* Tabs Skeleton */}
          <div className="flex gap-4 mb-4">
            <div className="h-10 bg-gray-200 animate-pulse rounded w-32"></div>
            <div className="h-10 bg-gray-200 animate-pulse rounded w-32"></div>
          </div>
          {/* Content Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-4/5"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || "Vehicle not found"}</p>
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

  return (
    <div className="min-h-screen pt-25">
      {/* Hero Section */}
      <CarDetailHero vehicle={vehicle} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <CarDetailTabs vehicle={vehicle} />
          </div>

          {/* Right Column - Seller Info */}
          <div className="lg:col-span-1">
            <SellerInfo vehicle={vehicle} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarDetailPage;
