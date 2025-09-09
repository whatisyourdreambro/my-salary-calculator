import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { NextThemesProvider } from "./providers";
import Script from "next/script";
import Footer from "@/components/Footer";

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
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ADSENSE_ID"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <div className="flex flex-col items-center w-full min-h-screen">
            <Header />
            <main className="flex-grow w-full">{children}</main>
            <Footer />
          </div>
        </NextThemesProvider>
      </body>
    </html>
  );
}
