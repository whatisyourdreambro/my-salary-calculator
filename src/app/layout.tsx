// src/app/layout.tsx

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/app/providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Load Pretendard Variable Font
const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2", // Assuming font is in public/fonts
  display: "swap",
  variable: "--font-pretendard",
});

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
  // Structured Data for SEO
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
    <html lang="ko" suppressHydrationWarning className={`${pretendard.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased text-slate-900 bg-slate-50 selection:bg-primary/10">
        <ThemeProvider attribute="class" defaultTheme="light">
          <div className="flex flex-col min-h-screen">
            <Header />
            {/* Native App View Container: Centered max-width for desktop */}
            <main className="flex-grow w-full max-w-lg mx-auto bg-white sm:shadow-2xl sm:min-h-[90vh] sm:my-8 sm:rounded-[3rem] overflow-hidden relative">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}