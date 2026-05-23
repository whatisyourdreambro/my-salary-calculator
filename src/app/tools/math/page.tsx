import MathCalculators from "@/components/calculators/MathCalculators";
import RelatedCalculators from "@/components/RelatedCalculators";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, softwareApplicationLd } from "@/lib/structuredData";
import { buildPageMetadata } from "@/lib/seo";
import { Metadata } from "next";

// 9차 점검 — buildPageMetadata로 표준화 + JsonLd + RelatedCalculators 추가
export const metadata: Metadata = buildPageMetadata({
 title: "퍼센트 계산기 & 단위 변환기 — 할인율·증감율·기본 환산 한 번에",
 description:
 "30,000원 → 20% 할인 = 24,000원, 작년 대비 +15% 증가율 즉시 계산. 비율·비중·증감율·할인율·단위 변환(길이·무게·온도)까지 한 페이지에서.",
 path: "/tools/math",
 keywords: [
 "퍼센트 계산기",
 "비율 계산기",
 "할인율 계산기",
 "증감율 계산기",
 "단위 변환기",
 "비중 계산",
 "퍼센트 환산",
 "수학 계산기",
 ],
});

export default function MathPage() {
 return (
 <div className="min-h-screen pt-24 pb-20">
 <JsonLd
 data={[
 autoBreadcrumbLd("/tools/math", { leafName: "퍼센트 계산기 & 단위 변환" }),
 softwareApplicationLd({
 name: "퍼센트·단위 변환 계산기",
 description: "비율·할인율·증감율·단위 변환 한 페이지",
 url: "/tools/math",
 }),
 ]}
 />
 <div className="page-width">
 <div className="text-center mb-12">
 <h1 className="text-4xl md:text-5xl font-black text-navy mb-4 tracking-tight">
 수학 도구 모음
 </h1>
 <p className="text-lg text-muted-blue max-w-2xl mx-auto">
 일상 생활에 필요한 퍼센트 계산과 단위 변환을 <br className="hidden sm:block" />
 직관적인 UI로 해결하세요.
 </p>
 </div>
 <MathCalculators />
 <RelatedCalculators currentPath="/tools/math" title="이런 계산기도 함께 보세요" />
 </div>
 </div>
 );
}
