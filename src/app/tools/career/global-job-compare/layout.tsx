import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "글로벌 직업 비교 — 한국 vs 미국·일본·싱가포르 연봉·세금",
 description:
 "한국 vs 미국·일본·싱가포르·독일·영국 직업별 연봉 + 세금 + 사회보험 + 생활비 종합 비교. 월 실 가용액 순위.",
 path: "/tools/career/global-job-compare",
 keywords: ["글로벌 연봉", "해외 취업", "미국 연봉", "싱가포르 연봉"],
});

export default function GlobalJobCompareLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/career/global-job-compare", { leafName: "글로벌 직업 비교", overrides: { career: "커리어 도구" } }),
 softwareApplicationLd({ name: "글로벌 직업 비교", description: "한국 vs 글로벌 5개국 직업 연봉·세금·생활비 비교.", url: "/tools/career/global-job-compare" }),
 faqLd([
 { question: "환율은 언제 기준?", answer: "2026년 4월 기준 추정값. USD 1380, EUR 1480, JPY 8.8, SGD 1020. 실시간 환율은 변동." },
 { question: "미국 세금이 정말 30%?", answer: "연방세 + 주세 + Social Security + Medicare 합산 평균. 캘리포니아·뉴욕은 더 높음. 텍사스·플로리다는 주세 X로 더 낮음." },
 { question: "비자·이주 정보?", answer: "본 시뮬은 연봉만. 실제 해외 취업은 비자 + 영어/현지어 + 채용 시장 별도 검토 필수. H1B(미국)·Tech.Pass(싱가포르) 등." },
 ]),
 ]} />
 {children}
 </>
 );
}
