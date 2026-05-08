import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "세금 절세 진단 — 놓치는 공제·세제 혜택 자동 발견",
 description:
 "총급여·신용카드·의료비·기부금·결혼·자녀·청년 정보 입력 → 잠재 환급액 + 우선 액션 7개. IRP·ISA·월세·중소기업 감면까지.",
 path: "/tools/tax/savings-checkup",
 keywords: ["세금 절세", "절세 진단", "공제 누락", "환급 받는 법"],
});

const FAQ_ITEMS = [
 { question: "잠재 환급액 정확한가요?", answer: "최대치 추정. 실제는 본인 다른 공제·소득 구조에 따라 ±20% 변동. 우선순위 가이드로만 활용." },
 { question: "직장인 vs 사업자?", answer: "본 진단은 직장인 위주. 사업자는 별도 종합소득세 + 부가세 신고 필요. 노란우산공제는 사업자 전용." },
 { question: "월세 공제 자격?", answer: "총급여 7천만 이하 + 무주택 세대주 + 임대차계약서 본인 명의. 부모 명의면 본인 공제 X." },
 { question: "신용카드 vs 체크카드?", answer: "신용 15% / 체크·현금영수증 30% / 전통시장·대중교통 40%. 25% 임계 초과 후 체크카드 비중 늘리면 환급 ↑." },
 { question: "중소기업 감면 신청?", answer: "회사 인사팀에 '중소기업 청년 취업자 감면 신청서' 제출. 자동 적용 X. 5년간 한도 200만/년." },
];

export default function TaxSavingsCheckupLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/tax/savings-checkup", { leafName: "세금 절세 진단", overrides: { tax: "세금 도구" } }),
 softwareApplicationLd({ name: "세금 절세 진단", description: "놓치는 공제·세제 혜택 자동 발견.", url: "/tools/tax/savings-checkup" }),
 faqLd(FAQ_ITEMS),
 ]} />
 {children}
 </>
 );
}
