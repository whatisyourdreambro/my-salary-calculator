import type { Metadata } from "next";
import EnglishLocaleSync from "./LocaleSync";
import EnglishPageExtras from "@/components/english/EnglishPageExtras";
import EnglishAfterAdsLinks from "@/components/english/EnglishAfterAdsLinks";

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
 // openGraph 이미지와 같은 URL — 자체 twitter 를 선언하지 않는 하위 페이지의 twitter:image 누락 방지 (OG-17)
 images: ["https://www.moneysalary.com/api/og?lang=en&title=Korea%20Salary%20%26%20Tax%20Calculator"],
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
 {/* 도구·도움말·소개 페이지의 다음 단계 링크 — 반드시 맨 끝(EnglishPageExtras 광고·공유 아래, B12 운영자 승인 2026-11-01).
 맵에 없는 경로는 null (EnglishAfterAdsLinks.tsx) */}
 <EnglishAfterAdsLinks />
 </div>
 );
}
