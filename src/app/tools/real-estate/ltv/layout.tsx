import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, howToLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "LTV 담보인정비율 계산기 - 주택담보대출 한도 (2026)",
 description:
 "주택가격 + 지역(투기·조정·일반) + 1주택자/다주택자 입력 → LTV 한도 자동 산출. 생애최초 80%, 일반 70%, 조정대상 60% 등 차등 적용.",
 path: "/tools/real-estate/ltv",
 keywords: ["LTV 계산기", "담보인정비율", "주담대 한도", "LTV 70%", "조정대상지역 LTV"],
});

const FAQ_ITEMS = [
 { question: "LTV가 뭔가요?", answer: "Loan To Value. 주택가격 대비 대출 가능 비율. LTV 70%면 10억 주택에 7억까지 대출 가능. 본인 자기자본은 30% 필요. 정부 정책에 따라 지역·주택 수별 차등." },
 { question: "지역별 LTV 한도는?", answer: "투기지역·투기과열지구: 40~50%. 조정대상지역: 50~60%. 일반지역: 70%. 생애최초 무주택자: 모든 지역 80%까지 가능. 정부 발표에 따라 변동 — 2026년 기준 적용." },
 { question: "1주택자 vs 다주택자 차이?", answer: "1주택자(생애최초 포함): 정상 LTV 적용. 2주택자: LTV 10~20%p 감면. 3주택 이상: 일반·조정·투기 모두 LTV 0% (대출 불가). 다주택자 매수 시 자기자본 100% 필요." },
 { question: "LTV와 DSR 동시 적용 시?", answer: "둘 중 더 작은 값 적용. 주담대는 LTV가 한도, 본인 연봉이 작으면 DSR 40%가 한도. 보통 고소득자는 LTV가, 저소득자는 DSR이 한도." },
];

const HOWTO_STEPS = [
 { name: "Step 1. 주택가격 입력", text: "매매가(실거래가). 시가가 다를 경우 매매가 기준 적용." },
 { name: "Step 2. 지역 + 주택 수 확인", text: "투기·조정·일반 지역 분류 + 본인 보유 주택 수. 지역은 부동산 공시·KB부동산 확인." },
 { name: "Step 3. LTV 한도 산출", text: "지역·주택 수에 따른 LTV 비율 적용. 생애최초·신혼부부 우대 검토." },
 { name: "Step 4. DSR 한도와 비교", text: "LTV 한도 vs DSR 한도 중 작은 값이 실제 대출 한도. DSR 한도 부족하면 추가 자기자본 필요." },
];

export default function LtvLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/real-estate/ltv", { leafName: "LTV 담보인정비율 계산기" }),
 softwareApplicationLd({ name: "LTV 담보인정비율 계산기", description: "주택담보대출 한도 무료 계산기.", url: "/tools/real-estate/ltv" }),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "LTV 기반 주담대 한도 산출 4단계", description: "주택가격·지역·주택 수부터 DSR 비교까지", totalTime: "PT15M", steps: HOWTO_STEPS }),
 ]} />
 {children}
 </>
 );
}
