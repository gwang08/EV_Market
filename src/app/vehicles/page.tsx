import React from "react";
import VehiclesList from "../../components/VehiclesList/VehiclesList";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function VehiclesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <VehiclesList />
      <Footer />
    </div>
  );
}
