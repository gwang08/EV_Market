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
  title: "Pin EV chính hãng | EcoTrade EV",
  description: "Chuyên phân phối pin EV, pin lithium và giải pháp năng lượng xanh, uy tín và chất lượng hàng đầu.",
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
