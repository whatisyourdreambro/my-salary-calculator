import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "가계부 자동 분석 — 카테고리별 비중 + 권장 비교",
 description:
 "월 소득·카테고리별 지출 입력 → 권장 비중 대비 분석 + 절약 가능액 자동 산출. 7개 카테고리 점수 + 가계 건강 점수.",
 path: "/tools/life/budget-analyzer",
 keywords: ["가계부 분석", "지출 분석", "월 가계부"],
});

export default function BudgetAnalyzerLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/life/budget-analyzer", { leafName: "가계부 자동 분석" }),
 softwareApplicationLd({ name: "가계부 자동 분석", description: "카테고리별 비중 + 권장 비교 + 절약 가능액.", url: "/tools/life/budget-analyzer" }),
 faqLd([
 { question: "권장 비중 기준은?", answer: "주거 30% + 식비 15% + 교통 10% + 공과금 7% + 여가 8% + 저축 20% + 기타 10%. 개인 상황 따라 ±5%p 가능." },
 { question: "주거 30% 초과면?", answer: "연 소득 대비 주거비 부담 큼. 저축률 우선 확인 후 더 작은 주택 또는 외곽 이주 검토." },
 { question: "저축 20% 권장 이유?", answer: "비상금 + 노후 + 자산 형성 동시 가능. 10% 미만은 노후 위험, 30%+는 가속 자산 형성." },
 ]),
 ]} />
 {children}
 </>
 );
}
