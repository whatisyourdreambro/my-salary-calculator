import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "이직 결정 도구 — 현 직장 vs 새 오퍼 가중 점수 비교",
 description:
 "현 직장과 새 오퍼를 6개 영역(연봉·워라밸·성장·안정·통근·복지) 가중 점수로 비교. 5년 자산 차이까지 분석.",
 path: "/tools/career/job-change-decision",
 keywords: ["이직 결정", "이직 비교", "오퍼 비교", "이직 도구"],
});

const FAQ_ITEMS = [
 { question: "가중치 비율은?", answer: "연봉 30% + 워라밸 20% + 성장 15% + 안정 15% + 통근 10% + 복지 10%. 본인 우선순위 다르면 결과를 가이드로만 활용." },
 { question: "본인 점수 기준?", answer: "1=최악, 10=최고. 절대값 아닌 상대값. 워라밸 7점 = '주 50시간 근무, 휴가 20일' 정도. 정확한 기준은 개인 차이." },
 { question: "이직 후 5년 자산 계산?", answer: "연봉 차이 × 5년 × 60% (세후) × 50% (저축 가정). 단순 추정. 실제는 본인 저축률·투자 수익률에 따라 다름." },
 { question: "비슷한 점수면?", answer: "현 직장 유지 권장. 이직 자체에 비용 (학습·관계·적응 6개월). 큰 차이 없으면 안정성 우선." },
 { question: "여러 오퍼 비교는?", answer: "본 도구는 1:1 비교. 여러 오퍼는 각각 현 직장과 비교 후 점수 차이 큰 순으로 우선순위." },
];

export default function JobChangeDecisionLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/career/job-change-decision", { leafName: "이직 결정 도구", overrides: { career: "커리어 도구" } }),
 softwareApplicationLd({ name: "이직 결정 도구", description: "현 직장 vs 새 오퍼 가중 점수 비교 + 5년 자산 차이.", url: "/tools/career/job-change-decision" }),
 faqLd(FAQ_ITEMS),
 ]} />
 {children}
 </>
 );
}
