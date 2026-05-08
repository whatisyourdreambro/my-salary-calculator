import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, howToLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "근무일 계산기 — 주말·공휴일 제외 영업일 산출",
 description: "시작일·종료일 입력 → 주말·공휴일 제외한 실제 근무일수. 한국 공휴일 자동 반영.",
 path: "/tools/date/work-days",
 keywords: ["근무일 계산", "영업일 계산", "주말 제외", "공휴일 제외"],
});

const FAQ_ITEMS = [
 { question: "근무일 계산이 무엇?", answer: "시작일~종료일 사이에서 주말(토·일)과 공휴일을 제외한 영업일수. 인사·총무·계약서에서 자주 사용." },
 { question: "공휴일은 어떻게?", answer: "한국 법정 공휴일 자동 반영. 설·추석 연휴, 어린이날, 광복절, 한글날 등. 임시공휴일은 별도." },
 { question: "월차·연차 계산에 사용?", answer: "근로계약서·연차 계산은 보통 일수 기준. 본 계산기는 영업일 기준 — 회사 규정 확인 후 사용." },
 { question: "1년 영업일은?", answer: "한국 평균 약 250일 (365일 - 주말 104일 - 공휴일 11일). 연도별 변동 약 ±5일." },
];

export default function WorkDaysLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/date/work-days", { leafName: "근무일 계산기" }),
 softwareApplicationLd({ name: "근무일 계산기", description: "주말·공휴일 제외 영업일 무료 계산기.", url: "/tools/date/work-days" }),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "근무일 산출 3단계", description: "시작·종료일 → 영업일", totalTime: "PT2M", steps: [
 { name: "Step 1. 기간 입력", text: "시작일·종료일." },
 { name: "Step 2. 주말·공휴일 자동 제외", text: "한국 법정 공휴일 반영." },
 { name: "Step 3. 영업일수 산출", text: "근로계약·연차 산정에 활용." },
 ] }),
 ]} />
 {children}
 </>
 );
}
