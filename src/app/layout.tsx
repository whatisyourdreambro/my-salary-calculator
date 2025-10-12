// src/app/layout.tsx

import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { NextThemesProvider } from "./providers";
import Script from "next/script";
import Footer from "@/components/Footer";
import KakaoAdFit from "@/components/KakaoAdFit";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.moneysalary.com"),
  title: {
    default: "2025년 연봉 실수령액 계산기 | Moneysalary",
    template: "%s | Moneysalary",
  },
  description:
    "2025년 최신 세법(4대보험, 소득세) 기준 연봉 실수령액을 가장 빠르고 정확하게 계산하세요. 연봉, 월급, 퇴직금 세후 금액을 바로 확인할 수 있습니다.",
  verification: {
    other: {
      "naver-site-verification": "34115e50f205aed3725f94e2400aaddef8c1b691",
    },
  },
  openGraph: {
    title: "Moneysalary 연봉 계산기",
    description: "2025년 최신 기준, 가장 정확한 연봉 실수령액을 계산해보세요.",
    siteName: "Moneysalary",
    images: [
      {
        url: "/logo-full.png",
        width: 800,
        height: 600,
      },
    ],
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

declare global {
  interface Window {
    gtag: (param1: string, param2: string, param3: object) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adsbygoogle?: any[];
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={notoSansKr.className} suppressHydrationWarning>
      <head>
        <Script id="google-tag-manager-head" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-W9KTVSQH');
          `}
        </Script>
        <Script
          id="cookieyes"
          type="text/javascript"
          src="https://cdn-cookieyes.com/client_data/9dcaa51591b1d01c1349ede6/script.js"
          strategy="beforeInteractive"
        ></Script>

        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2873403048341290"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        <Script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script
          id="gtag-init-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              gtag('config', '${process.env.NEXT_PUBLIC_ADS_ID}');
            `,
          }}
        />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W9KTVSQH"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>

        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <div className="flex flex-col min-h-screen">
            <Header />

            {/* 상단 리더보드 광고 */}
            <div className="w-full flex justify-center py-4">
              <KakaoAdFit unit="DAN-7DJN8QMp6O5Kayn7" width="728" height="90" />
            </div>

            <div className="flex-grow w-full max-w-screen-xl mx-auto flex">
              {/* 좌측 사이드바 광고 */}
              <aside className="hidden md:block w-48 flex-shrink-0 py-8 pr-8">
                <div className="sticky top-20">
                  <KakaoAdFit unit="DAN-O4kzbtdd9NleD4P6" width="160" height="600" />
                </div>
              </aside>

              {/* 메인 컨텐츠 */}
              <main className="flex-grow w-full px-4">
                {/* 본문 상단 광고 */}
                <div className="w-full flex justify-center py-4">
                  <KakaoAdFit unit="DAN-gtL0uD65wrODCXRh" width="300" height="250" />
                </div>
                
                {children}

                {/* 본문 하단 광고 */}
                <div className="w-full flex justify-center py-4">
                  <KakaoAdFit unit="DAN-4eRqZLQIGjrNcXj6" width="300" height="250" />
                </div>
              </main>

              {/* 우측 사이드바 광고 */}
              <aside className="hidden md:block w-48 flex-shrink-0 py-8 pl-8">
                <div className="sticky top-20">
                  <KakaoAdFit unit="DAN-HVBNRsdPlneE3Uxn" width="160" height="600" />
                </div>
              </aside>
            </div>

            {/* 하단 배너 광고 */}
            <div className="w-full flex flex-col items-center space-y-4 py-4">
              <KakaoAdFit unit="DAN-WgV2d248sf3mJoB2" width="320" height="100" />
              <div className="flex space-x-4">
                <KakaoAdFit unit="DAN-no5HCWDFKDsohy4c" width="320" height="50" />
                <KakaoAdFit unit="DAN-lpJFw6yqHhzOXIfV" width="320" height="50" />
              </div>
            </div>

            <Footer />
          </div>
        </NextThemesProvider>
      </body>
    </html>
  );
}
