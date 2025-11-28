import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import { Toaster } from "sonner";
import { Suspense } from "react";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "스파크마켓 - 중고거래 플랫폼",
  description: "빠르고 안전한 중고거래 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={outfit.className}>
        <Suspense fallback={<div className="h-16 bg-white shadow-sm" />}>
          <Navbar />
        </Suspense>
        {children}
        <Toaster position="top-right" richColors closeButton duration={2000} />
      </body>
    </html>
  );
}
