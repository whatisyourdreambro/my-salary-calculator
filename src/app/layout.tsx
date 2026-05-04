// src/app/layout.tsx

import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { NextThemesProvider } from "@/app/providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.moneysalary.com"),
  title: {
    default: "머니샐러리 | 2026 연봉 실수령액 계산기 — 세후 월급·4대보험 계산",
    template: "%s | 머니샐러리",
  },
  description:
    "2026년 최신 세법 반영! 연봉 실수령액 계산기로 세후 월급, 국민연금·건강보험·고용보험·소득세 공제액을 즉시 계산하세요. 연봉 3000만원~1억 실수령액 표, FIRE 은퇴 계산기, 연말정산까지 무료 제공.",
  keywords: [
    "연봉 계산기",
    "실수령액 계산기",
    "2026 연봉 계산기",
    "세후 월급 계산기",
    "연봉 실수령액",
    "4대보험 계산기",
    "국민연금 계산",
    "건강보험 계산",
    "소득세 계산기",
    "연봉 3000 실수령액",
    "연봉 5000 실수령액",
    "연봉 1억 실수령액",
    "연말정산 계산기",
    "퇴직금 계산기",
    "FIRE 계산기",
  ].join(", "),
  authors: [{ name: "머니샐러리", url: "https://www.moneysalary.com" }],
  creator: "머니샐러리",
  publisher: "머니샐러리",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://www.moneysalary.com",
    siteName: "머니샐러리",
    title: "머니샐러리 | 2026 연봉 실수령액 계산기",
    description:
      "2026년 최신 세법 반영! 연봉 실수령액 계산기로 세후 월급, 국민연금·건강보험·소득세 공제액을 즉시 계산하세요.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "머니샐러리 — 연봉 실수령액 계산기",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "머니샐러리 | 2026 연봉 실수령액 계산기",
    description:
      "2026년 최신 세법! 세후 월급·4대보험 즉시 계산. 연봉 3000~1억 실수령액 표 무료 제공.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://www.moneysalary.com",
  },
  verification: {
    google: "1yqyEwZxIAcqg8XFd2AjmAfEEJ4R9Es3tuqaQKerI1A",
    other: {
      "naver-site-verification": "34115e50f205aed3725f94e2400aaddef8c1b691",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "머니샐러리",
    url: "https://www.moneysalary.com",
    description:
      "2026년 최신 세법 기준 연봉 실수령액 계산기. 세후 월급, 4대보험, 소득세를 즉시 계산.",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    inLanguage: "ko",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KRW",
    },
    provider: {
      "@type": "Organization",
      name: "머니샐러리",
      url: "https://www.moneysalary.com",
    },
    featureList: [
      "연봉 실수령액 계산",
      "4대보험 공제 계산",
      "연말정산 계산기",
      "FIRE 은퇴 계산기",
      "퇴직금 계산기",
    ],
  };

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
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
      <body
        className="antialiased"
        style={{ backgroundColor: "#EDF1F5", color: "#0A1829" }}
      >
        <NextThemesProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
        >
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow w-full">
              {children}
            </main>
            <Footer />
          </div>
        </NextThemesProvider>

        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-QSGXV6T86R"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QSGXV6T86R', { send_page_view: true });
          `}
        </Script>

        {/* Google AdSense Auto Ads — 모든 페이지 자동 광고 적용 */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2873403048341290"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}