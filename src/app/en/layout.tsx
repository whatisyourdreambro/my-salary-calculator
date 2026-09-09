import type { Metadata } from "next";
import EnglishLocaleSync from "./LocaleSync";
import EnglishPageExtras from "@/components/english/EnglishPageExtras";

export const metadata: Metadata = {
 manifest: "/manifest.en.webmanifest",
 // absolute — 루트 layout 의 "%s | 머니샐러리" 타이틀 템플릿(한국어) 상속 차단
 title: { absolute: "Korea Salary Calculator 2026 & Income Tax Tools | Moneysalary" },
 description: "Estimate Korean monthly take-home pay, compare income-tax methods and convert gross salary in English, with explicit assumptions and official sources.",
 alternates: {
 canonical: "https://www.moneysalary.com/en",
 languages: {
 "ko-KR": "https://www.moneysalary.com",
 "en": "https://www.moneysalary.com/en",
 "x-default": "https://www.moneysalary.com",
 },
 },
 // 루트 layout(한국어) 상속 차단 — EN 트리는 keywords·twitter·og:image 전부 영어 전용
 keywords:
 "korea salary calculator 2026, korean take home pay estimate, gross salary converter, korea income tax comparison, foreign employee flat tax",
 openGraph: {
 title: "Korea Salary Calculator 2026 & Income Tax Tools | Moneysalary",
 description: "Korean take-home salary estimates, gross currency conversion and income-tax comparison in English.",
 type: "website",
 locale: "en_US",
 url: "https://www.moneysalary.com/en",
 images: [{ url: "https://www.moneysalary.com/api/og?lang=en&title=Korea%20Salary%20%26%20Tax%20Calculator", width: 1200, height: 630 }],
 },
 twitter: {
 card: "summary_large_image",
 title: "Korea Salary Calculator 2026 & Income Tax Tools | Moneysalary",
 description: "Estimate Korean take-home pay and compare tax methods with explicit assumptions.",
 },
};

export default function EnglishLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
 <div className="en-locale" lang="en">
 <EnglishLocaleSync />
 {children}
 <EnglishPageExtras />
 </div>
 );
}
