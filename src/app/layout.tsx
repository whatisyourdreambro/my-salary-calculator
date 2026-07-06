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
import WebVitals from "@/components/WebVitals";
import { organizationLd, webSiteLd, webApplicationLd } from "@/lib/structuredData";

// Pretendard 가변 폰트 — self-host (next/font/local), 한글 서브셋판.
// 원본 2,009KB가 데스크톱 LCP를 3.0초로 밀어내던 주범(GSC 2026-07-06 이슈)이라
// KS X 1001 상용 2,350자 + 사이트 실사용 문자 + 기호로 서브셋 → 503KB (-75%).
// 재생성 방법은 src/app/fonts/README.md 참고. font-display: swap + 자동 폴백 매칭.
const pretendard = localFont({
  src: "./fonts/PretendardVariable-subset.woff2",
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
    "연봉 5000만원이면 월 353만원, 1억이면 월 650만원. 2026 최신 세법 4대보험·소득세 자동 계산. 회사별 연봉 DB 480+개사 비교·실수령액 계산기 200+개 무료 제공.",
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
      "연봉 5000만원이면 월 353만원, 1억이면 월 650만원. 2026 최신 세법 4대보험·소득세 자동 계산. 회사별 연봉 DB 480+개사 비교.",
  },
  twitter: {
    card: "summary_large_image",
    title: "2026 연봉 계산기 | 실수령액·세후월급·4대보험 즉시 계산 — 머니샐러리",
    description:
      "연봉 5000만원→월 353만원, 1억→월 650만원. 2026 최신 세법 자동 계산. 회사별 연봉 DB·계산기 200+개 무료.",
  },
  // canonical/hreflang은 홈 전용 값이라 src/app/page.tsx로 이동(2026-07-06) —
  // layout에 두면 alternates 미정의 페이지 전부가 "canonical: 홈"을 상속하는 사고 위험.
  // RSS 자동발견 링크만 전역 유지 (alternates를 자체 정의한 페이지에는 어차피 미상속).
  alternates: {
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
        {/* AdSense 오리진 — preconnect로 TCP+TLS 핸드셰이크 선행 (dns-prefetch는 폴백 병행) */}
        <link
          rel="preconnect"
          href="https://pagead2.googlesyndication.com"
          crossOrigin="anonymous"
        />
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
          {/* AutoBreadcrumb 전역 주입은 2026-07-06 감사에서 제거 — 페이지 자체
              breadcrumbLd와 잎 이름이 다른 BreadcrumbList가 1,443쪽에 2중 주입돼
              구글이 영문 슬러그 잎("bmi quick" 류)을 임의 선택하는 문제.
              ("중복 OK"였던 기존 주석은 이름 충돌 시 성립하지 않음) */}
          <div className="flex flex-col min-h-screen">
            <Header />
            <main id="main-content" className="flex-grow w-full">
              {children}
            </main>
            <Footer />
          </div>
          <InstallPwaBanner />
        </NextThemesProvider>

        {/* 실사용자 Core Web Vitals → GA4 (속도 개선 효과 측정) */}
        <WebVitals />

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