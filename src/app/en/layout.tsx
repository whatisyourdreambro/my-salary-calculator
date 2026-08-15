import type { Metadata } from "next";
import EnglishLocaleSync from "./LocaleSync";
import PageFooterAds from "@/components/PageFooterAds";
import AutoShareSection from "@/components/AutoShareSection";

export const metadata: Metadata = {
 title: "Salary, Stocks & Tax for Working in Korea | Moneysalary",
 description: "Net pay calculator, Samsung Electronics & SK Hynix stock analysis, ESOP and ISA strategies — English guides for professionals working in Korea.",
 alternates: {
 canonical: "https://www.moneysalary.com/en",
 languages: {
 "ko-KR": "https://www.moneysalary.com",
 "en": "https://www.moneysalary.com/en",
 "x-default": "https://www.moneysalary.com",
 },
 },
 openGraph: {
 title: "Salary, Stocks & Tax for Working in Korea | Moneysalary",
 description: "Net pay, Samsung & SK Hynix stocks, ESOP, ISA — English guides for working in Korea.",
 type: "website",
 locale: "en_US",
 url: "https://www.moneysalary.com/en",
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
 {/* 영문 가이드 글은 자체 공유 UI 보유(자동 억제) — 미보유 페이지만 노출 */}
 <AutoShareSection contentType="page" locale="en" maxWidth="3xl" />
 {/* 영어권 트래픽도 AdSense 가 자동 매칭 (지역별 광고 송출 — Cloudflare 엣지) */}
 <PageFooterAds maxWidth="3xl" />
 </div>
 );
}
