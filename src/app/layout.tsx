// src/app/layout.tsx

import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { NextThemesProvider } from "@/app/providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import InstallPwaBanner from "@/components/InstallPwaBanner";
import { organizationLd, webSiteLd, webApplicationLd } from "@/lib/structuredData";

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
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin=""
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @font-face {
                font-family: "Pretendard Variable";
                font-display: swap;
              }
            `,
          }}
        />
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