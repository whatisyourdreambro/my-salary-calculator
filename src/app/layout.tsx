import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { NextThemesProvider } from "./providers";
import Script from "next/script";
import Footer from "@/components/Footer";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "2025년 연봉 실수령액 계산기 | Moneysalary",
  description:
    "2025년 최신 세법(4대보험, 소득세) 기준 연봉 실수령액을 가장 빠르고 정확하게 계산하세요. 연봉, 월급, 퇴직금 세후 금액을 바로 확인할 수 있습니다.",
  // [수정] 아래 icons 부분을 삭제하거나 주석 처리합니다.
  /*
  icons: {
    icon: "/favicon.svg",
  },
  */
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

declare global {
  interface Window {
    gtag: (param1: string, param2: string, param3: object) => void;
    AdFit?: {
      createIns: (ins: HTMLModElement) => void;
      destroyIns: (ins: HTMLModElement) => void;
      showAd?: (unitId: string) => void;
    };
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
          src="https://t1.daumcdn.net/kas/static/ba.min.js"
          strategy="afterInteractive"
        />

        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-EZ8GT7RPEZ"
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
              gtag('config', 'G-EZ8GT7RPEZ');
            `,
          }}
        />
      </head>
      <body className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
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
          <div className="flex flex-col items-center w-full min-h-screen">
            <Header />
            <main className="w-full flex-grow">{children}</main>
            <Footer />
          </div>
        </NextThemesProvider>
      </body>
    </html>
  );
}
