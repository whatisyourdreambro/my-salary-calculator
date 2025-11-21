// src/app/layout.tsx

import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { NextThemesProvider } from "./providers";
import Script from "next/script";
import Footer from "@/components/Footer";
import AdUnit from "@/components/AdUnit";

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
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#10b981", // Emerald-500
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
      <body className={`${notoSansKr.className} min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary`}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W9KTVSQH"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        <div className="aurora-bg" />
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
            <Header />

            {/* Main Layout Container with Sidebars */}
            <div className="flex justify-center w-full max-w-[1920px] mx-auto relative">
              {/* Left Sidebar Ad */}
              <aside className="hidden 3xl:flex flex-col w-[160px] sticky top-24 h-fit mr-4 z-10">
                <div className="w-[160px] h-[600px]">
                  <AdUnit
                    slotId="LEFT_SIDEBAR_SLOT_ID"
                    format="vertical"
                    label="Left Sidebar"
                  />
                </div>
              </aside>

              {/* Main Content - Centered Single Column */}
              <div className="w-full flex-grow max-w-5xl px-4 sm:px-6 lg:px-8 py-12 pt-24">
                <main className="w-full flex flex-col animate-fade-in-up">
                  {children}
                </main>
              </div>

              {/* Right Sidebar Ad */}
              <aside className="hidden 3xl:flex flex-col w-[160px] sticky top-24 h-fit ml-4 z-10">
                <div className="w-[160px] h-[600px]">
                  <AdUnit
                    slotId="RIGHT_SIDEBAR_SLOT_ID"
                    format="vertical"
                    label="Right Sidebar"
                  />
                </div>
              </aside>
            </div>

            <Footer />
          </div>
        </NextThemesProvider>
      </body>
    </html>
  );
}
