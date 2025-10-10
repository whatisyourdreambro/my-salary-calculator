// src/app/layout.tsx
"use client"; // 훅 사용을 위해 클라이언트 컴포넌트로 전환합니다.

import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { NextThemesProvider } from "./providers";
import Script from "next/script";
import Footer from "@/components/Footer";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation"; // usePathname 훅을 import 합니다.

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// window 객체에 adfit 타입을 선언해줍니다.
declare global {
  interface Window {
    adfit?: {
      render: (el: HTMLElement) => void;
      destroy: (el: HTMLElement) => void;
    };
  }
}

// 1. 광고 렌더링 로직을 담당하는 별도의 컴포넌트를 만듭니다.
const KakaoAdRenderer = ({
  adUnit,
  adWidth,
  adHeight,
  style,
}: {
  adUnit: string;
  adWidth: string;
  adHeight: string;
  style?: React.CSSProperties;
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const adContainer = adRef.current;
    if (!adContainer) return;

    // 스크립트 로드 확인
    if (typeof window.adfit?.render !== "function") return;

    // 이전에 렌더링된 광고가 있다면 제거
    while (adContainer.firstChild) {
      adContainer.removeChild(adContainer.firstChild);
    }

    const ins = document.createElement("ins");
    ins.className = "kakao_ad_area";
    ins.style.display = "none";
    ins.setAttribute("data-ad-unit", adUnit);
    ins.setAttribute("data-ad-width", adWidth);
    ins.setAttribute("data-ad-height", adHeight);
    adContainer.appendChild(ins);

    try {
      window.adfit.render(adContainer);
    } catch (e) {
      console.error("Kakao AdFit 렌더링 실패:", e);
    }

    // 컴포넌트가 사라질 때 리소스 정리
    return () => {
      if (adContainer && typeof window.adfit?.destroy === "function") {
        try {
          window.adfit.destroy(adContainer);
        } catch (e) {
          console.error("Kakao AdFit 리소스 정리 실패:", e);
        }
      }
    };
  }, [adUnit, adWidth, adHeight]); // 광고 정보가 바뀔 때마다 재실행

  return (
    <div
      ref={adRef}
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        ...style,
      }}
    />
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDesktop, setIsDesktop] = useState(false);
  const pathname = usePathname(); // 현재 페이지 경로를 가져옵니다.

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2. 페이지 경로(pathname)에 따라 어떤 광고를 보여줄지 결정합니다.
  const adsForThisPage = () => {
    // 모든 페이지에 공통적으로 보여줄 광고 (헤더, 푸터, 사이드바)
    const commonAds = (
      <>
        {isDesktop ? (
          <>
            <KakaoAdRenderer
              adUnit="DAN-7DJN8QMp6O5Kayn7"
              adWidth="728"
              adHeight="90"
            />{" "}
            {/* 7) 데스크톱 헤더 */}
            <KakaoAdRenderer
              adUnit="DAN-7DJN8QMp6O5Kayn7"
              adWidth="728"
              adHeight="90"
            />{" "}
            {/* 7) 데스크톱 푸터 */}
            <KakaoAdRenderer
              adUnit="DAN-O4kzbtdd9NleD4P6"
              adWidth="160"
              adHeight="600"
              style={{
                position: "fixed",
                left: "4px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
              }}
            />{" "}
            {/* 5) 왼쪽 사이드바 */}
            <KakaoAdRenderer
              adUnit="DAN-HVBNRsdPlneE3Uxn"
              adWidth="160"
              adHeight="600"
              style={{
                position: "fixed",
                right: "4px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
              }}
            />{" "}
            {/* 6) 오른쪽 사이드바 */}
          </>
        ) : (
          <>
            <KakaoAdRenderer
              adUnit="DAN-WgV2d248sf3mJoB2"
              adWidth="320"
              adHeight="100"
            />{" "}
            {/* 3) 모바일 헤더 */}
            <KakaoAdRenderer
              adUnit="DAN-lpJFw6yqHhzOXIfV"
              adWidth="320"
              adHeight="50"
            />{" "}
            {/* 4) 모바일 푸터1 */}
            <KakaoAdRenderer
              adUnit="DAN-no5HCWDFKDsohy4c"
              adWidth="320"
              adHeight="50"
            />{" "}
            {/* 2) 모바일 푸터2 */}
          </>
        )}
      </>
    );

    // 특정 페이지 그룹(예: 가이드 페이지)에만 보여줄 광고
    if (pathname.startsWith("/guides")) {
      return (
        <>
          {commonAds}
          <KakaoAdRenderer
            adUnit="DAN-4eRqZLQIGjrNcXj6"
            adWidth="300"
            adHeight="250"
            style={{ margin: "40px auto" }}
          />{" "}
          {/* 8) 콘텐츠 내부 광고 */}
        </>
      );
    }

    // 메인 페이지에만 보여줄 광고
    if (pathname === "/") {
      return (
        <>
          {commonAds}
          <KakaoAdRenderer
            adUnit="DAN-gtL0uD65wrODCXRh"
            adWidth="300"
            adHeight="250"
            style={{ margin: "40px auto" }}
          />{" "}
          {/* 1) 콘텐츠 내부 광고2 */}
        </>
      );
    }

    // 그 외 페이지는 공통 광고만 노출
    return commonAds;
  };

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
        <Script
          async
          src="https://t1.daumcdn.net/kas/static/ba.min.js"
          strategy="afterInteractive"
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

            {/* 3. key={pathname}으로 페이지 이동 시마다 광고를 새로 렌더링합니다. */}
            <div key={pathname}>{adsForThisPage()}</div>

            <main className="w-full flex-grow">{children}</main>

            <Footer />
          </div>
        </NextThemesProvider>
      </body>
    </html>
  );
}
