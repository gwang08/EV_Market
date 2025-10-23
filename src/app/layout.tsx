import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "../providers/I18nProvider";
import { ToastProvider } from "../providers/ToastProvider";
import { DataProvider } from "../contexts/DataContext";
import { Analytics } from "@vercel/analytics/next"
import ChatbotWidget from "../components/ChatbotWidget/ChatbotWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://evmarket.com'),
  title: {
    default: "EV Market - Sàn Giao Dịch Xe Điện & Pin EV Chính Hãng",
    template: "%s | EV Market"
  },
  description: "Nền tảng mua bán, đấu giá xe điện (EV) và pin lithium hàng đầu Việt Nam. Uy tín, minh bạch, đa dạng sản phẩm từ Tesla, VinFast, BYD và nhiều thương hiệu khác.",
  keywords: [
    "xe điện",
    "EV",
    "electric vehicle",
    "pin EV",
    "pin lithium",
    "đấu giá xe điện",
    "mua bán xe điện",
    "Tesla",
    "VinFast",
    "BYD",
    "pin xe điện",
    "battery EV",
    "sạc xe điện",
    "năng lượng xanh"
  ],
  authors: [{ name: "EV Market Team" }],
  creator: "EV Market",
  publisher: "EV Market",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://evmarket.com',
    siteName: 'EV Market',
    title: 'EV Market - Sàn Giao Dịch Xe Điện & Pin EV Chính Hãng',
    description: 'Nền tảng mua bán, đấu giá xe điện (EV) và pin lithium hàng đầu Việt Nam. Uy tín, minh bạch, đa dạng sản phẩm.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'EV Market - Electric Vehicle Marketplace',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EV Market - Sàn Giao Dịch Xe Điện & Pin EV',
    description: 'Nền tảng mua bán, đấu giá xe điện và pin lithium hàng đầu Việt Nam',
    images: ['/twitter-image.jpg'],
    creator: '@evmarket',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://evmarket.com',
    languages: {
      'vi-VN': 'https://evmarket.com/vn',
      'en-US': 'https://evmarket.com/en',
    },
  },
  verification: {
    google: '2Ulo10TsRQXKtS6XjQvejn9D--2QeIO0SLwUrIcr_9Q',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Structured Data for Organization
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "EV Market",
    "url": "https://evmarket.com",
    "logo": "https://evmarket.com/logo.svg",
    "description": "Nền tảng mua bán, đấu giá xe điện (EV) và pin lithium hàng đầu Việt Nam",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+84-xxx-xxx-xxx",
      "contactType": "Customer Service",
      "areaServed": "VN",
      "availableLanguage": ["Vietnamese", "English"]
    },
    "sameAs": [
      "https://facebook.com/evmarket",
      "https://twitter.com/evmarket",
      "https://instagram.com/evmarket",
      "https://linkedin.com/company/evmarket"
    ]
  };

  // Structured Data for Website
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "EV Market",
    "url": "https://evmarket.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://evmarket.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="vi">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        <I18nProvider>
          <ToastProvider>
            <DataProvider>
              {children}
              <ChatbotWidget />
            </DataProvider>
          </ToastProvider>
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
