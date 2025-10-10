// src/app/layout.tsx
"use client"; // 페이지 경로 감지 및 광고 스크립트 실행을 위해 클라이언트 컴포넌트로 전환합니다.

import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { NextThemesProvider } from "./providers";
import Script from "next/script";
import Footer from "@/components/Footer";
import { useEffect, useRef, useState, useMemo } from "react"; // 필요한 React 훅을 모두 import 합니다.
import { usePathname } from "next/navigation"; // 현재 경로를 알기 위한 훅입니다.

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// 광고 렌더링을 담당하는 작은 컴포넌트를 이 파일 안에 만듭니다.
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

    // window.adfit 객체가 로드되었는지 확인합니다.
    if (typeof window.adfit?.render !== "function") {
      console.warn("Kakao AdFit 스크립트가 아직 로드되지 않았습니다.");
      return;
    }

    // 이전에 렌더링된 광고가 있다면 모두 제거합니다. (페이지 이동 시 중요)
    while (adContainer.firstChild) {
      adContainer.removeChild(adContainer.firstChild);
    }

    const ins = document.createElement("ins");
    ins.className = "kakao_ad_area";
    ins.style.display = "none";
    ins.setAttribute("data-ad-unit", adUnit);
    ins.setAttribute("data-ad-width", adWidth);
    ins.setAttribute("data-ad-height", adHeight);

    // 로컬 테스트를 위해 광고 로딩 실패 시 콜백 함수를 지정합니다.
    ins.setAttribute("data-ad-onfail", "onAdFitFail");

    adContainer.appendChild(ins);

    try {
      window.adfit.render(adContainer);
    } catch (e) {
      console.error("Kakao AdFit 렌더링 실패:", e);
    }

    // 컴포넌트가 사라질 때 리소스를 정리하여 메모리 누수를 방지합니다.
    return () => {
      if (adContainer && typeof window.adfit?.destroy === "function") {
        try {
          window.adfit.destroy(adContainer);
        } catch (e) {
          console.error("Kakao AdFit 리소스 정리 실패:", e);
        }
      }
    };
  }, [adUnit, adWidth, adHeight]);

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
    // 광고 로딩 실패 시 실행될 함수를 window 전역에 정의합니다.
    // 로컬 환경에서 이 함수가 실행되어 회색 박스가 보이면 정상입니다.
    window.onAdFitFail = (el) => {
      if (el) {
        el.style.backgroundColor = "#f0f0f0";
        el.style.color = "#888";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.fontSize = "14px";
        el.innerText = `광고 영역 (${el.dataset.adWidth}x${el.dataset.adHeight})`;
      }
    };

    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // useMemo를 사용해 페이지 경로가 바뀔 때만 광고 목록을 다시 계산합니다.
  const adsForThisPage = useMemo(() => {
    const commonAds = {
      header: isDesktop ? (
        <KakaoAdRenderer
          key={`${pathname}-header`}
          adUnit="DAN-7DJN8QMp6O5Kayn7"
          adWidth="728"
          adHeight="90"
        />
      ) : (
        <KakaoAdRenderer
          key={`${pathname}-header`}
          adUnit="DAN-WgV2d248sf3mJoB2"
          adWidth="320"
          adHeight="100"
        />
      ),
      footer1: isDesktop ? (
        <KakaoAdRenderer
          key={`${pathname}-footer1`}
          adUnit="DAN-7DJN8QMp6O5Kayn7"
          adWidth="728"
          adHeight="90"
        />
      ) : (
        <KakaoAdRenderer
          key={`${pathname}-footer1`}
          adUnit="DAN-lpJFw6yqHhzOXIfV"
          adWidth="320"
          adHeight="50"
        />
      ),
      footer2: !isDesktop && (
        <KakaoAdRenderer
          key={`${pathname}-footer2`}
          adUnit="DAN-no5HCWDFKDsohy4c"
          adWidth="320"
          adHeight="50"
        />
      ),
      sidebarLeft: isDesktop && (
        <KakaoAdRenderer
          key={`${pathname}-sidebar-left`}
          adUnit="DAN-O4kzbtdd9NleD4P6"
          adWidth="160"
          adHeight="600"
          style={{
            position: "fixed",
            left: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
          }}
        />
      ),
      sidebarRight: isDesktop && (
        <KakaoAdRenderer
          key={`${pathname}-sidebar-right`}
          adUnit="DAN-HVBNRsdPlneE3Uxn"
          adWidth="160"
          adHeight="600"
          style={{
            position: "fixed",
            right: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
          }}
        />
      ),
    };

    let contentAd = null;
    // 가이드 페이지들에는 300x250 광고(8번)를 표시합니다.
    if (pathname.startsWith("/guides")) {
      contentAd = (
        <KakaoAdRenderer
          key={`${pathname}-content`}
          adUnit="DAN-4eRqZLQIGjrNcXj6"
          adWidth="300"
          adHeight="250"
          style={{ margin: "40px auto" }}
        />
      );
    }
    // 메인 페이지에는 다른 300x250 광고(1번)를 표시합니다.
    else if (pathname === "/") {
      contentAd = (
        <KakaoAdRenderer
          key={`${pathname}-content`}
          adUnit="DAN-gtL0uD65wrODCXRh"
          adWidth="300"
          adHeight="250"
          style={{ margin: "40px auto" }}
        />
      );
    }

    return { ...commonAds, contentAd };
  }, [pathname, isDesktop]);

  return (
    <html lang="ko" className={notoSansKr.className} suppressHydrationWarning>
      <head>
        <Script
          id="google-tag-manager-head"
          strategy="afterInteractive"
        >{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-W9KTVSQH');`}</Script>
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
            __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}'); gtag('config', '${process.env.NEXT_PUBLIC_ADS_ID}');`,
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

            {/* 헤더 광고 */}
            {adsForThisPage.header}

            <main className="w-full flex-grow relative">
              {/* 사이드바 광고 (데스크톱에서만 렌더링됨) */}
              {adsForThisPage.sidebarLeft}
              {adsForThisPage.sidebarRight}

              {/* 콘텐츠 내부 광고 (해당 페이지에만 렌더링됨) */}
              {adsForThisPage.contentAd}

              {children}
            </main>

            {/* 푸터 광고 */}
            {adsForThisPage.footer1}
            {adsForThisPage.footer2}

            <Footer />
          </div>
        </NextThemesProvider>
      </body>
    </html>
  );
}
