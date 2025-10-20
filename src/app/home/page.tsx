"use client";
import BrandCarousel from "@/components/Homepage/BrandCarousel";
import Content from "@/components/Homepage/Content";
import LastContent from "@/components/Homepage/LastContent";
import ProductShowcase from "@/components/Homepage/ProductShowcase";
import Reason from "@/components/Homepage/Reason";
import SharedBackground from "@/components/Homepage/SharedBackground";
import TopBattery from "@/components/Homepage/TopBattery";
import TopEV from "@/components/Homepage/TopEV";

export default function HomePage() {
  return (
    <div>
      <main>
        <SharedBackground>
          <div className="relative min-h-screen">
            <Content />
            <ProductShowcase />
          </div>
          <BrandCarousel />
          <TopEV />
          <TopBattery />
          <Reason />
          <LastContent />
        </SharedBackground>
      </main>
    </div>
  );
}
