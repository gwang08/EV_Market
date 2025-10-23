"use client";
import Image from "next/image";
import HomePage from "./home/page";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  // Homepage Structured Data - Marketplace
  const marketplaceSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "EV Market - Sàn Giao Dịch Xe Điện",
    "description": "Nền tảng mua bán xe điện, pin EV và đấu giá trực tuyến",
    "brand": {
      "@type": "Brand",
      "name": "EV Market"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "VND",
      "offerCount": "1000+",
      "availability": "https://schema.org/InStock"
    }
  };

  // Breadcrumb for Homepage
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Trang chủ",
        "item": "https://evmarket.com"
      }
    ]
  };

  return (
    
      <div>
        {/* Structured Data for Homepage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(marketplaceSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        
        <Header/>
        <HomePage />
        <Footer/>
      </div>
   
  );
}
