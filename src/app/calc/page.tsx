// src/app/calc/page.tsx
// 100개 계산기 인덱스 페이지 (검색·카테고리 점프는 CalcIndexClient에서)

import type { Metadata } from "next";
import { Calculator } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/structuredData";
import { allCalculators } from "@/lib/simpleCalculators";
import { HomeTopAd } from "@/components/AdPlacement";
import CalcIndexClient from "./CalcIndexClient";

export const metadata: Metadata = buildPageMetadata({
 title: "연봉·세금·대출 100가지 계산기 — 한 페이지에서 한눈에",
 description:
 "연봉·세금·대출·투자·부동산·보험·사업자·건강·생활까지 100가지 단순 계산기. 한 번에 입력하면 즉시 결과.",
 path: "/calc",
 keywords: ["연봉 계산기", "100가지 계산기", "금융 계산기 모음", "생활 계산기", "세금 계산기"],
});

const CATEGORY_ORDER = [
 { id: "tax", label: "세금" },
 { id: "salary", label: "연봉·근로" },
 { id: "loan", label: "대출" },
 { id: "investment", label: "투자·저축" },
 { id: "real-estate", label: "부동산" },
 { id: "insurance", label: "보험" },
 { id: "business", label: "사업자" },
 { id: "life", label: "생활·일상" },
 { id: "currency", label: "환율" },
 { id: "health", label: "건강" },
 { id: "family", label: "결혼·육아" },
];

// 8차 점검 — 정적 라우트로 신설된 시즌 핵심 계산기들을 인덱스 최상위에 노출.
// /calc/[slug] 동적 라우트와 별도 페이지라 allCalculators 배열에 없으므로 명시.
const FEATURED_CALCS: Array<{ href: string; title: string; description: string; season: string }> = [
 // 사이트 #1 유입·수익 페이지 — 계산기 인덱스에서 그동안 0회 노출이던 것을 최상단 배치
 {
   href: "/calc/samsung-bonus",
   title: "삼성전자 성과급 계산기 (OPI·TAI)",
   description: "사업부별 1인당·세후 실수령·RSU 매도까지 — 2026 상반기 TAI 반영",
   season: "1~2월 OPI·7/12월 TAI",
 },
 {
   href: "/calc/sk-hynix-bonus",
   title: "SK하이닉스 성과급 계산기 (PS·PI)",
   description: "PS 2964% 상한 폐지 반영 — 기준급 대비 세전·세후 즉시 계산",
   season: "2월 PS·반기 PI",
 },
 {
   href: "/income-tax-2026",
   title: "2026 종합소득세 계산기",
   description: "8단계 누진세율(6~45%) + 누진공제 + 지방소득세 10% 자동 산출",
   season: "5월 시즌",
 },
 {
   href: "/auto-tax-2026",
   title: "2026 자동차세 계산기",
   description: "배기량·차령·연납 5% 공제. 6·12월 분납 금액까지 비교",
   season: "6·12월 시즌",
 },
 {
   href: "/property-holding-tax-2026",
   title: "2026 부동산 보유세 계산기",
   description: "재산세(7·9월) + 종합부동산세(12월) 통합 자동 산출",
   season: "7·9·12월 시즌",
 },
 {
   href: "/health-insurance-fee-2026",
   title: "2026 건강보험료 계산기",
   description: "직장/지역 가입자별 본인 부담 + 장기요양보험료까지",
   season: "연중 핵심",
 },
 {
   href: "/national-pension-estimate-2026",
   title: "2026 국민연금 예상수령액",
   description: "가입기간·평균소득으로 만 65세부터 월 노령연금 추정",
   season: "노후 준비",
 },
 {
   href: "/weekly-holiday-allowance-2026",
   title: "2026 주휴수당 계산기",
   description: "최저시급 10,320원 주 40시간 → 82,560원. 근로기준법 제55조",
   season: "알바·파트타임",
 },
 {
   href: "/savings-interest-2026",
   title: "2026 적금·예금 이자 계산기",
   description: "정기적금/예금, 단리/복리, 세후 만기 원리금 + 비과세 옵션",
   season: "금융상품 비교",
 },
];

export default function CalcIndexPage() {
 const grouped = CATEGORY_ORDER.map((cat) => ({
 ...cat,
 items: allCalculators
 .filter((c) => c.category === cat.id)
 .map((c) => ({
 slug: c.slug,
 title: c.title,
 description: c.description,
 category: c.category,
 })),
 })).filter((g) => g.items.length > 0);

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "계산기 100", path: "/calc" },
 ])}
 />

 <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-8">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
 <Calculator className="w-4 h-4" />
 100가지 단순 계산기
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
 한 페이지로 끝내는 <span className="text-electric">계산기 모음</span>
 </h1>
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 세금·연봉·대출·투자·부동산·보험·사업자·일상까지
 자주 쓰는 100가지 계산기를 한곳에서.
 </p>
 </div>

 <CalcIndexClient grouped={grouped} featured={FEATURED_CALCS} />

 <div className="mt-8">
 <HomeTopAd />
 </div>
 </div>
 </main>
 );
}
