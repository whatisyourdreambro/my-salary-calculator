import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { NextThemesProvider } from "./providers";
import Script from "next/script"; // Script 컴포넌트를 임포트합니다.

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "실수령액 계산기 | Moneysalary",
  description:
    "연봉, 월급, 주급, 시급, 퇴직금의 세후 실수령액을 가장 정확하게 계산하세요. 2025년 최신 4대보험, 소득세 기준이 적용되었습니다.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={notoSansKr.className} suppressHydrationWarning>
      <head>
        {/* 1. 스크린샷에 보이는 당신의 애드센스 코드를 복사합니다.
          2. 아래 Script 태그 안에 붙여넣습니다. 
             (client=... 부분의 ID가 당신의 고유 ID인지 다시 한번 확인하세요)
        */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2873403048341290"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-200">
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <div className="flex flex-col items-center w-full">
            <Header />
            {children}
          </div>
        </NextThemesProvider>
      </body>
    </html>
  );
}
