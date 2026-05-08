import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "첫 주택 자금 시뮬 — 자기자본·LTV·DSR·정책자금 통합",
 description:
 "목표 주택가·소득·저축 입력 → 대출 한도 + 자기자본 부족분 + 매수 시점 + 디딤돌·보금자리 자격 자동 진단.",
 path: "/tools/real-estate/first-home-plan",
 keywords: ["첫 주택", "주택 매수 시뮬", "디딤돌 대출", "보금자리론"],
});

const FAQ_ITEMS = [
 { question: "LTV 80%가 누구에게 적용?", answer: "생애최초 + 무주택 + 30세 이상 또는 기혼. 일반은 70% (조정지역 60%)." },
 { question: "DSR 40% 한도는?", answer: "연 소득의 40%까지 모든 대출 원리금 상환. 기존 부채 있으면 신규 한도 감소." },
 { question: "디딤돌 대출 자격?", answer: "소득 7천 이하 + 주택 6억 이하 + 만 30세 이상 (또는 기혼). 우대금리 2.5% + 30년 만기." },
 { question: "보금자리론 vs 디딤돌?", answer: "보금자리: 소득 7천 + 주택 9억 이하 (더 큰 주택 가능). 디딤돌: 6억 한도지만 더 우대금리." },
 { question: "취득세 7%란?", answer: "비영업용 주택 취득세 7%. 5억 주택 = 3,500만 별도. 자기자본에 포함해 계획해야." },
];

export default function FirstHomePlanLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/real-estate/first-home-plan", { leafName: "첫 주택 자금 시뮬" }),
 softwareApplicationLd({ name: "첫 주택 자금 시뮬", description: "자기자본·대출·청약·정책자금 통합 시뮬.", url: "/tools/real-estate/first-home-plan" }),
 faqLd(FAQ_ITEMS),
 ]} />
 {children}
 </>
 );
}
