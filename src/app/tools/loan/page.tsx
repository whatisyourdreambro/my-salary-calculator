import LoanCalculator from "@/components/calculators/LoanCalculator";
import JsonLd from "@/components/JsonLd";
import Link from "next/link";
import { autoBreadcrumbLd, softwareApplicationLd } from "@/lib/structuredData";
import { buildPageMetadata } from "@/lib/seo";
import { Metadata } from "next";

// 9차 점검 — buildPageMetadata로 표준화 + 숫자 hook + JsonLd 추가
// 2026-07-16 — 기준금리 2.50%→2.75% 인상 시의성 섹션 추가
export const metadata: Metadata = buildPageMetadata({
 title: "2026 대출 이자 계산기 — 원리금균등·원금균등·만기일시 월 상환액",
 description:
 "1억 대출 연 4.5% 30년 원리금균등 시 월 약 507,000원. 2026년 7월 기준금리 2.75% 인상 반영 — 원리금균등/원금균등/만기일시 3가지 상환 방식별 월 상환액·총 이자 즉시 비교.",
 path: "/tools/loan",
 ogType: "article",
 publishedTime: "2026-06-11",
 modifiedTime: "2026-07-16",
 keywords: [
 "대출 이자 계산기",
 "원리금균등 상환",
 "원금균등 상환",
 "만기일시 상환",
 "대출 월 상환액",
 "주택담보대출 이자",
 "신용대출 이자",
 "대출 총 이자",
 // 2026-07-16 기준금리 인상 시의성 쿼리
 "기준금리 인상",
 "기준금리 2.75%",
 "금리 인상 이자",
 ],
});

// 2026-07-16 한국은행 기준금리 2.50%→2.75% (+0.25%p) 인상 반영.
// 아래 수치는 원리금균등 공식 M = P·r·(1+r)^n / ((1+r)^n − 1), r=연이율/12, n=360으로
// node 실계산해 검증한 값 (3억원·30년, 연 4.00%→4.25%는 가정 예시).
const RATE_HIKE_EXAMPLE = {
 before: "1,432,246원",
 after: "1,475,820원",
 monthlyDiff: "+43,574원",
 totalInterestDiff: "약 1,569만원",
};

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

 {/* 2026-07-16 기준금리 인상 시의성 섹션 */}
 <section className="max-w-3xl mx-auto mt-14">
 <h2 className="text-2xl font-black text-navy mb-4">
 2026년 7월 기준금리 2.75% 시대 — 내 이자 부담은?
 </h2>
 <div className="rounded-2xl bg-white border border-canvas-200 p-6">
 <p className="text-sm text-muted-blue leading-relaxed mb-4">
 한국은행 금융통화위원회가 2026년 7월 16일 기준금리를 연 2.50%에서{" "}
 <strong className="text-navy">2.75%로 0.25%p 인상</strong>했습니다.
 2023년 1월 이후 3년 6개월 만의 인상이며, 한은이 &ldquo;금리인상
 기조를 이어나갈 필요&rdquo;가 있다며 추가 인상 가능성까지 시사한
 만큼, 변동금리 대출의 이자 부담은 더 커질 수 있는 국면입니다.
 </p>
 <p className="text-sm text-muted-blue leading-relaxed mb-4">
 예를 들어 <strong className="text-navy">3억원·30년·원리금균등</strong>{" "}
 대출에서 금리가 0.25%p 오르면(예: 연 4.00%→4.25% 가정) 월 상환액은{" "}
 {RATE_HIKE_EXAMPLE.before} → {RATE_HIKE_EXAMPLE.after}로{" "}
 <strong className="text-electric">
 월 {RATE_HIKE_EXAMPLE.monthlyDiff}
 </strong>
 , 30년 총 이자는{" "}
 <strong className="text-navy">
 {RATE_HIKE_EXAMPLE.totalInterestDiff}
 </strong>{" "}
 늘어납니다. 실제 시중 대출금리는 은행·상품·신용도별로 다르니, 위
 계산기에 본인의 현재 금리와 0.25%p 올린 금리를 각각 넣어 월
 상환액을 직접 비교해 보세요.
 </p>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
 <Link
 href="/tools/real-estate/dsr"
 className="block p-4 rounded-2xl bg-canvas border border-canvas-200 hover:border-electric transition-colors"
 >
 <p className="text-sm font-bold text-navy mb-1">DSR 한도 계산기</p>
 <p className="text-xs text-muted-blue">
 금리 인상·스트레스 DSR 반영 시 내 대출 한도 확인
 </p>
 </Link>
 <Link
 href="/home-loan"
 className="block p-4 rounded-2xl bg-canvas border border-canvas-200 hover:border-electric transition-colors"
 >
 <p className="text-sm font-bold text-navy mb-1">
 주택담보대출 계산기
 </p>
 <p className="text-xs text-muted-blue">
 DSR/LTV 한도 + 금리 인상 영향표까지 한 번에
 </p>
 </Link>
 </div>
 </div>
 </section>
 </div>
 </div>
 );
}
