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
});

export const metadata: Metadata = {
  title: "연봉/퇴직금/미래연봉 계산기 | Moneysalary",
  description:
    "연봉, 월급, 주급, 시급, 퇴직금, 미래연봉의 세후 실수령액을 가장 정확하게 계산하세요. 2025년 최신 4대보험, 소득세 기준이 적용되었습니다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={notoSansKr.className} suppressHydrationWarning>
      <head>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2873403048341290"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* Kakao AdFit */}
        <Script
          async
          src="https://t1.daumcdn.net/kas/static/ba.min.js"
          strategy="afterInteractive"
        />

        {/* 👇 [추가된 부분] Google Analytics 스크립트 */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
        {/* 👆 [추가된 부분] 여기까지 */}
      </head>
      <body className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <div className="flex flex-col items-center w-full min-h-screen">
            <Header />

            {/* --- 광고를 포함한 메인 레이아웃 --- */}
            <div className="w-full flex-grow">
              {/* ... (기존 광고 코드) ... */}
              <div className="hidden md:flex justify-center my-4">
                <KakaoAdFit
                  unit="DAN-7DJN8QMp6O5Kayn7"
                  width="728"
                  height="90"
                />
              </div>

              <div className="md:hidden flex justify-center my-4">
                <KakaoAdFit
                  unit="DAN-lpJFw6yqHhzOXIfV"
                  width="320"
                  height="50"
                />
              </div>

              <div className="flex justify-center w-full">
                <aside className="hidden xl:flex sticky top-20 h-screen justify-center w-[160px] flex-shrink-0 mx-4">
                  <KakaoAdFit
                    unit="DAN-HVBNRsdPlneE3Uxn"
                    width="160"
                    height="600"
                  />
                </aside>

                <main className="w-full">{children}</main>

                <aside className="hidden xl:flex sticky top-20 h-screen justify-center w-[160px] flex-shrink-0 mx-4">
                  <KakaoAdFit
                    unit="DAN-O4kzbtdd9NleD4P6"
                    width="160"
                    height="600"
                  />
                </aside>
              </div>

              <div className="flex justify-center my-4">
                <KakaoAdFit
                  unit="DAN-WgV2d248sf3mJoB2"
                  width="320"
                  height="100"
                />
              </div>

              <div className="flex justify-center my-4">
                <KakaoAdFit
                  unit="DAN-4eRqZLQIGjrNcXj6"
                  width="300"
                  height="250"
                />
              </div>

              <div className="flex justify-center my-4">
                <KakaoAdFit
                  unit="DAN-no5HCWDFKDsohy4c"
                  width="320"
                  height="50"
                />
              </div>
            </div>

            <Footer />
          </div>
        </NextThemesProvider>
      </body>
    </html>
  );
}
