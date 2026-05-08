import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "포트폴리오 자산 배분 — 나이·성향·목표별 추천",
 description:
 "나이·투자 성향·목표 기간 입력 → 주식·채권·현금 비율 + 미국·한국·신흥국·국채·회사채 세부 추천 + 목표 달성 시뮬.",
 path: "/tools/finance/portfolio-allocator",
 keywords: ["자산 배분", "포트폴리오 추천", "ETF 비율", "주식 채권 비중"],
});

const FAQ_ITEMS = [
 { question: "주식 비중 110-나이 룰은?", answer: "보수적 투자자는 100-나이, 공격적은 120-나이. 본 도구는 110-나이를 기준으로 성향·기간 가감." },
 { question: "왜 미국 50%?", answer: "S&P500 30년 CAGR 약 10% (한국 5%, 신흥국 6%). 분산 + 글로벌 환차익 가능. 단, 환율 리스크 별도." },
 { question: "리밸런싱 주기?", answer: "분기 1회 권장. 단, 5%p 이상 차이날 때만. 너무 자주는 거래비용 ↑." },
 { question: "ETF vs 펀드?", answer: "ETF (수수료 0.1~0.3%) 압도적 유리. 30년 누적 차이 1억+ 가능. 펀드는 1.5%+ 수수료로 비효율." },
 { question: "절세 계좌 활용은?", answer: "ISA → 연금저축 → IRP → 일반 순으로 우선 활용. 동일 ETF여도 절세 계좌가 30%+ 절세." },
];

export default function PortfolioAllocatorLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/finance/portfolio-allocator", { leafName: "포트폴리오 자산 배분" }),
 softwareApplicationLd({ name: "포트폴리오 자산 배분", description: "나이·성향·목표별 추천 포트폴리오.", url: "/tools/finance/portfolio-allocator" }),
 faqLd(FAQ_ITEMS),
 ]} />
 {children}
 </>
 );
}
