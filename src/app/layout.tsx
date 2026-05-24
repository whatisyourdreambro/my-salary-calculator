// src/app/layout.tsx

import type { Metadata, Viewport } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";
import { NextThemesProvider } from "@/app/providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import InstallPwaBanner from "@/components/InstallPwaBanner";
import AutoBreadcrumb from "@/components/AutoBreadcrumb";
import { organizationLd, webSiteLd, webApplicationLd } from "@/lib/structuredData";

// Pretendard 가변 폰트 — self-host (next/font/local).
// 외부 CDN render-blocking stylesheet 제거 + font-display: swap + 자동 폴백 매칭.
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard-local",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EDF1F5" },
    { media: "(prefers-color-scheme: dark)", color: "#0A1829" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.moneysalary.com"),
  title: {
    default: "2026 연봉 계산기 | 실수령액·세후월급·4대보험 즉시 계산 — 머니샐러리",
    template: "%s | 머니샐러리",
  },
  // SERP CTR 강화(7차): 숫자 hook + 차별점 명시. 데스크톱 CTR 1.3%→3%+ 목표.
  description:
    "연봉 5000만원이면 월 357만원, 1억이면 월 678만원. 2026 최신 세법 4대보험·소득세 자동 계산. 회사별 연봉 DB 300+개사 비교·실수령액 계산기 200+개 무료 제공.",
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
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
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
    title: "2026 연봉 계산기 | 실수령액·세후월급·4대보험 즉시 계산 — 머니샐러리",
    description:
      "연봉 5000만원이면 월 357만원, 1억이면 월 678만원. 2026 최신 세법 4대보험·소득세 자동 계산. 회사별 연봉 DB 300+개사 비교.",
  },
  twitter: {
    card: "summary_large_image",
    title: "2026 연봉 계산기 | 실수령액·세후월급·4대보험 즉시 계산 — 머니샐러리",
    description:
      "연봉 5000만원→월 357만원, 1억→월 678만원. 2026 최신 세법 자동 계산. 회사별 연봉 DB·계산기 200+개 무료.",
  },
  alternates: {
    canonical: "https://www.moneysalary.com",
    languages: {
      "ko-KR": "https://www.moneysalary.com",
      "en": "https://www.moneysalary.com/en",
      "x-default": "https://www.moneysalary.com",
    },
    types: {
      "application/rss+xml": [
        {
          url: "https://www.moneysalary.com/rss.xml",
          title: "머니샐러리 금융 가이드 RSS",
        },
      ],
    },
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
  return (
    <html lang="ko" suppressHydrationWarning className={pretendard.variable}>
      <head>
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <JsonLd data={[organizationLd(), webSiteLd(), webApplicationLd()]} />
      </head>
      <body className="antialiased bg-canvas text-navy dark:bg-canvas-950 dark:text-canvas-50">
        <a href="#main-content" className="skip-to-content">
          본문으로 바로가기
        </a>
        <NextThemesProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
        >
          {/* 모든 페이지 자동 빵부스러기(BreadcrumbList JSON-LD).
              홈(/) 에서는 컴포넌트 내부에서 null 반환 — 안전.
              개별 page.tsx 에서 명시적 breadcrumbLd 가 있어도 중복 OK (Google 처리). */}
          <AutoBreadcrumb />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main id="main-content" className="flex-grow w-full">
              {children}
            </main>
            <Footer />
          </div>
          <InstallPwaBanner />
        </NextThemesProvider>

        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EZ8GT7RPEZ"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EZ8GT7RPEZ', { send_page_view: true });
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