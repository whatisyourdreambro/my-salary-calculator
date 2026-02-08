// src/app/layout.tsx

import type { Metadata, Viewport } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { NextThemesProvider } from "./providers";
import Script from "next/script";
import Footer from "@/components/Footer";
import AdUnit from "@/components/AdUnit";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  display: "swap",
  variable: "--font-lato",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.moneysalary.com"),
  title: {
    default: "MoneySalary | Premium Salary & Tax Calculator",
    template: "%s | MoneySalary",
  },
  // ... (rest of metadata remains mostly same, just updating title flavor if needed, but keeping it minimal for now)
  description:
    "Experience the most elegant and precise salary calculator. Check your 2025 net income with our premium financial tools.",
  keywords: ["연봉계산기", "2025연봉계산기", "실수령액계산기", "월급계산기", "퇴직금계산기", "연봉실수령액", "4대보험계산기", "연말정산", "Moneysalary", "머니샐러리"],
  twitter: {
    card: "summary_large_image",
    title: "MoneySalary - Premium Financial Tools",
    description: "Elegant, Precise, Professional. Calculate your 2025 net income instantly.",
    images: ["/logo-full.png"],
  },
  verification: {
    other: {
      "naver-site-verification": "34115e50f205aed3725f94e2400aaddef8c1b691",
    },
    google: "google-site-verification-placeholder", // User to replace if needed
  },
  openGraph: {
    title: "MoneySalary Premium Calculator",
    description: "2025 Standard Top-Tier Financial Tools.",
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
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://www.moneysalary.com",
    languages: {
      "ko-KR": "https://www.moneysalary.com",
      "en-US": "https://www.moneysalary.com/en",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1c1917", // Warm Dark Grey (Stone-900)
};

declare global {
  interface Window {
    gtag: (param1: string, param2: string, param3: object) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adsbygoogle?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Kakao?: any;
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${playfair.variable} ${lato.variable}`} suppressHydrationWarning>
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
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2873403048341290"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          id="cookieyes"
          type="text/javascript"
          src="https://cdn-cookieyes.com/client_data/9dcaa51591b1d01c1349ede6/script.js"
          strategy="beforeInteractive"
        ></Script>



        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4"
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
        <Script
          id="kakao-init"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              if (window.Kakao && !window.Kakao.isInitialized()) {
                // Replace with your actual JavaScript Key from Kakao Developers
                window.Kakao.init('${process.env.NEXT_PUBLIC_KAKAO_JS_KEY || "YOUR_KAKAO_JS_KEY"}');
              }
            `,
          }}
        />
      </head>
      <body className={`font-sans min-h-screen bg-background text-foreground antialiased selection:bg-accent/30 selection:text-accent-foreground overflow-x-hidden`}>
        <Script
          id="ld-json"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Moneysalary",
              "url": "https://www.moneysalary.com",
              "description": "2025년 최신 세법 기준 연봉 실수령액 계산기",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.moneysalary.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <Script
          id="ld-json-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Moneysalary",
              "url": "https://www.moneysalary.com",
              "logo": "https://www.moneysalary.com/logo.svg",
              "sameAs": []
            })
          }}
        />
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W9KTVSQH"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>

        {/* Global Aurora Background */}
        <div className="aurora-bg" />

        <NextThemesProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen relative">
            <Header />

            {/* Global Top Ad (Desktop/Mobile) */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-6 flex justify-center z-10 transition-all duration-300">
              <AdUnit slotId="3348584614" format="auto" label="Global Top Banner (Center 01)" />
            </div>

            {/* Main Layout Container with Sidebars */}
            <div className="flex justify-center w-full max-w-[1920px] mx-auto relative z-10">
              {/* Left Sidebar (Desktop Only) */}
              <aside className="hidden xl:block w-[300px] min-w-[300px] p-4">
                <div className="space-y-6 h-full">
                  {/* Left 01 - Static */}
                  <AdUnit slotId="2717302873" format="vertical" label="Left Sidebar 01" />
                  {/* Left 02 - Static */}
                  <AdUnit slotId="1464657303" format="vertical" label="Left Sidebar 02" />
                  {/* Left 03 - Sticky Follower */}
                  <AdUnit slotId="2717302873" format="vertical" label="Left Sidebar 03" sticky={true} />
                </div>
              </aside>

              {/* Main Content - Centered Single Column */}
              <div className="w-full flex-grow max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
                <main className="w-full flex flex-col animate-fade-in-up min-h-[60vh]">
                  {children}
                </main>
              </div>

              {/* Right Sidebar (Desktop Only) */}
              <aside className="hidden xl:block w-[300px] min-w-[300px] p-4">
                <div className="space-y-6 h-full">
                  {/* Right 01 - Static */}
                  <AdUnit slotId="2773143192" format="vertical" label="Right Sidebar 01" />
                  {/* Right 02 - Static */}
                  <AdUnit slotId="1404221203" format="vertical" label="Right Sidebar 02" />
                  {/* Right 03 - Sticky Follower */}
                  <AdUnit slotId="2773143192" format="vertical" label="Right Sidebar 03" sticky={true} />
                </div>
              </aside>
            </div>

            {/* Global Bottom Ad */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 flex justify-center z-10">
              <AdUnit slotId="3348584614" format="auto" label="Global Bottom Banner (Center 01 Duplicate)" />
            </div>

            <Footer />
          </div>
        </NextThemesProvider>
      </body>
    </html>
  );
}
