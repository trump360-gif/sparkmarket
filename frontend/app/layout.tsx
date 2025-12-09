import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import { Toaster } from "sonner";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: {
    default: "스파크마켓 - 중고거래 플랫폼",
    template: "%s | 스파크마켓",
  },
  description: "안전하고 빠른 중고거래, 스파크마켓에서 시작하세요. 디지털 기기부터 패션, 가구까지 다양한 중고 상품을 거래하세요.",
  keywords: ["중고거래", "중고마켓", "스파크마켓", "중고물품", "당근마켓", "번개장터"],
  authors: [{ name: "SparkMarket Team" }],
  creator: "SparkMarket",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://sparkmarket.vercel.app",
    siteName: "스파크마켓",
    title: "스파크마켓 - 중고거래 플랫폼",
    description: "안전하고 빠른 중고거래, 스파크마켓에서 시작하세요.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "스파크마켓",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "스파크마켓 - 중고거래 플랫폼",
    description: "안전하고 빠른 중고거래, 스파크마켓에서 시작하세요.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${outfit.className} bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors`}>
        <ThemeProvider>
          <Suspense fallback={<div className="h-16 bg-white dark:bg-slate-900 shadow-sm" />}>
            <Navbar />
          </Suspense>
          {children}
          <Toaster position="top-right" richColors closeButton duration={2000} />
        </ThemeProvider>
      </body>
    </html>
  );
}
