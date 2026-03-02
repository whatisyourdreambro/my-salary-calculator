// src/app/layout.tsx

import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { NextThemesProvider } from "@/app/providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdUnit from "@/components/AdUnit";

// 대표님의 실제 애드센스 퍼블리셔 ID
const ADSENSE_ID = "ca-pub-2873403048341290";

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
      {/* Toss Style Root Body:
        기본 배경색을 아주 밝은 회색(#F2F4F6)으로 설정하고, 텍스트를 진한 네이비/블랙으로 잡습니다.
        모바일 앵커 광고를 위해 pb-20 여백을 부여합니다.
      */}
      <body className="antialiased text-slate-900 bg-background selection:bg-blue-600/10 pb-20 md:pb-0">
        <NextThemesProvider attribute="class" defaultTheme="light">
          <div className="flex flex-col min-h-screen">
            <Header />

            {/* 수익 최적화 하이브리드 레이아웃: Ad - App - Ad */}
            <div className="flex-grow w-full flex justify-center max-w-[1600px] mx-auto">

              {/* 데스크탑 왼쪽 날개 광고 */}
              <aside className="hidden xl:flex w-[160px] flex-shrink-0 sticky top-28 h-[calc(100vh-7rem)] pt-6 justify-center">
                <AdUnit slotId="1397486615" format="vertical" className="w-[160px] h-[600px] rounded-2xl overflow-hidden shadow-sm" label="PC 날개 광고" />
              </aside>

              {/* 메인 콘텐츠 영역 */}
              <main className="flex-grow w-full min-w-0">
                {children}
              </main>

              {/* 데스크탑 오른쪽 날개 광고 */}
              <aside className="hidden xl:flex w-[160px] flex-shrink-0 sticky top-28 h-[calc(100vh-7rem)] pt-6 justify-center">
                <AdUnit slotId="1397486615" format="vertical" className="w-[160px] h-[600px] rounded-2xl overflow-hidden shadow-sm" label="PC 날개 광고" />
              </aside>

            </div>

            <Footer />

            {/* 전역 모바일 하단 고정 앵커 광고 */}
            <div className="block md:hidden">
              <AdUnit slotId="6458241606" sticky={true} format="auto" label="모바일 앵커" />
            </div>

          </div>
        </NextThemesProvider>
      </body>
    </html>
  );
}