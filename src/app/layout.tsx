// src/app/layout.tsx

import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { NextThemesProvider } from "@/app/providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ADSENSE_ID = "ca-pub-5492837410"; // User can swap this easily

export const metadata: Metadata = {
  title: "머니샐러리 | 2026 연봉계산기 & 자산 플래닝",
  description: "대한민국 No.1 연봉 및 자산 관리 플랫폼. 가장 정확한 2026 실수령액 계산과 자산 성장 시뮬레이션을 경험하세요.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialApplication",
    "name": "MoneySalary",
    "description": "Premium Salary & Wealth Planning Platform",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "KRW"
    }
  };

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin=""
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased text-slate-900 bg-slate-50 selection:bg-primary/10">
        <NextThemesProvider attribute="class" defaultTheme="light">
          <div className="flex flex-col min-h-screen">
            <Header />
            {/* 
               Hybrid Responsive Layout: 
               On Mobile: Full width
               On Desktop: Ad - App - Ad
            */}
            <div className="flex-grow w-full">
              {children}
            </div>
            <Footer />
          </div>
        </NextThemesProvider>
      </body>
    </html>
  );
}
