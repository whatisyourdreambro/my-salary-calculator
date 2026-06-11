import LoanCalculator from "@/components/calculators/LoanCalculator";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, softwareApplicationLd } from "@/lib/structuredData";
import { buildPageMetadata } from "@/lib/seo";
import { Metadata } from "next";

// 9차 점검 — buildPageMetadata로 표준화 + 숫자 hook + JsonLd 추가
export const metadata: Metadata = buildPageMetadata({
 title: "2026 대출 이자 계산기 — 원리금균등·원금균등·만기일시 월 상환액",
 description:
 "1억 대출 연 4.5% 30년 원리금균등 시 월 약 507,000원. 2026 대출 이자 + 원리금균등/원금균등/만기일시 3가지 상환 방식별 월 상환액·총 이자 즉시 비교.",
 path: "/tools/loan",
 keywords: [
 "대출 이자 계산기",
 "원리금균등 상환",
 "원금균등 상환",
 "만기일시 상환",
 "대출 월 상환액",
 "주택담보대출 이자",
 "신용대출 이자",
 "대출 총 이자",
 ],
});

export default function LoanCalculatorPage() {
 return (
 <div className="min-h-screen pt-24 pb-20">
 <JsonLd
 data={[
 autoBreadcrumbLd("/tools/loan", { leafName: "대출 이자 계산기" }),
 softwareApplicationLd({
 name: "대출 이자 계산기",
 description: "원리금균등·원금균등·만기일시 3가지 방식 월 상환액 계산",
 url: "/tools/loan",
 }),
 ]}
 />
 <div className="page-width">
 <div className="text-center mb-12">
 <h1 className="text-4xl md:text-5xl font-black text-navy mb-4 tracking-tight">
 대출 이자 계산기
 </h1>
 <p className="text-lg text-muted-blue max-w-2xl mx-auto">
 가장 합리적인 상환 계획을 세워보세요. <br className="hidden sm:block" />
 원리금균등, 원금균등, 만기일시 방식을 모두 지원합니다.
 </p>
 </div>
 <LoanCalculator />
 </div>
 </div>
 );
}
