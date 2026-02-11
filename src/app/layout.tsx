// src/app/layout.tsx

import type { Metadata } from "next";
import Script from "next/script"; // Import next/script
import "./globals.css";
import { NextThemesProvider } from "@/app/providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "머니샐러리 | 2026 연봉계산기 & 자산 플래닝",
  description: "대한민국 No.1 연봉 및 자산 관리 플랫폼. 가장 정확한 2026 실수령액 계산과 자산 성장 시뮬레이션을 경험하세요.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0", // Mobile App feel
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ... (Structured Data remains same)
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
        {/* Load AdSense with afterInteractive to prevent UI blocking while ensuring ads show */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5492837410"
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
      <body className="antialiased text-slate-900 bg-slate-100 selection:bg-primary/10">
        <NextThemesProvider attribute="class" defaultTheme="light">
          <div className="flex flex-col min-h-screen">
            <Header />
            {/* 
               Extreme UX: Universal App Shell 
               Centered max-width on desktop to look like a high-fidelity mobile app 
            */}
            <div className="flex-grow w-full flex flex-col items-center py-0 sm:py-12">
              <main className="w-full max-w-lg bg-white sm:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] sm:rounded-[3rem] overflow-hidden relative min-h-screen sm:min-h-[85vh] flex flex-col">
                {children}
              </main>
            </div>
            <Footer />
          </div>
        </NextThemesProvider>
      </body>
    </html>
  );
}
