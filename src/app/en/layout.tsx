import type { Metadata } from "next";
import EnglishLocaleSync from "./LocaleSync";
import PageFooterAds from "@/components/PageFooterAds";
import AutoShareSection from "@/components/AutoShareSection";

export const metadata: Metadata = {
 // absolute — 루트 layout 의 "%s | 머니샐러리" 타이틀 템플릿(한국어) 상속 차단
 title: { absolute: "Salary, Stocks & Tax for Working in Korea | Moneysalary" },
 description: "Net pay calculator, Samsung Electronics & SK Hynix stock analysis, ESOP and ISA strategies — English guides for professionals working in Korea.",
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
 "korea salary calculator, korea net pay, korea income tax, expat korea tax, samsung salary, sk hynix salary, korea take home pay",
 openGraph: {
 title: "Salary, Stocks & Tax for Working in Korea | Moneysalary",
 description: "Net pay, Samsung & SK Hynix stocks, ESOP, ISA — English guides for working in Korea.",
 type: "website",
 locale: "en_US",
 url: "https://www.moneysalary.com/en",
 images: [{ url: "https://www.moneysalary.com/api/og?lang=en&title=Korea%20Salary%20%26%20Tax%20Calculator", width: 1200, height: 630 }],
 },
 twitter: {
 card: "summary_large_image",
 title: "Salary, Stocks & Tax for Working in Korea | Moneysalary",
 description: "Net pay calculator, Samsung & SK Hynix stock analysis, ESOP and ISA strategies in English.",
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
 {/* 영어권 트래픽도 AdSense 가 자동 매칭 (지역별 광고 송출 — Cloudflare 엣지) */}
 <PageFooterAds maxWidth="3xl" />
 {/* 공유 fallback은 광고 아래 — 광고 밀림 방지 (2026-08-16 수익 대응) */}
 <AutoShareSection contentType="page" locale="en" maxWidth="3xl" className="pb-16" />
 </div>
 );
}
