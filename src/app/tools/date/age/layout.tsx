import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, howToLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "나이 계산기 — 만 나이·연 나이·세는 나이 (2026)",
 description: "생년월일 입력 → 만 나이 + 연 나이 + 세는 나이 자동 계산. 한국 만 나이 통일법(2023.6.28) 적용.",
 path: "/tools/date/age",
 keywords: ["나이 계산기", "만 나이", "연 나이", "세는 나이", "한국 나이"],
});

const FAQ_ITEMS = [
 { question: "만 나이 통일법은 언제 시행됐나요?", answer: "2023년 6월 28일부터 모든 행정·법률에서 만 나이 사용 의무. 단, 음주·흡연 등은 '연 나이' 기준 유지." },
 { question: "만 나이 vs 연 나이 차이?", answer: "만 나이: 출생일 기준 정확한 나이 (생일 지나면 +1). 연 나이: 출생연도 - 현재연도 (생일 무관). 한국식 '세는 나이'는 출생 시 1세 + 매년 1월 1일 +1." },
 { question: "행정·법률은 어떤 나이?", answer: "2023년 6월 이후 모든 행정 서류·법률은 만 나이. 운전면허·여권·계약서 등 모두 만 나이." },
 { question: "음주·흡연 나이는?", answer: "청소년보호법상 '만 19세 이상'이지만 실제 운영은 '연 19세' (현재 연도 - 출생연도 ≥ 19). 즉, 2026년 기준 2007년생부터 가능." },
 { question: "병역은?", answer: "병역법은 별도 — 만 나이 X. 출생연도 기준. 2026년 기준 2006년생이 병역 의무 시작." },
];

export default function AgeLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/date/age", { leafName: "나이 계산기" }),
 softwareApplicationLd({ name: "나이 계산기", description: "만 나이·연 나이·세는 나이 무료 계산기.", url: "/tools/date/age" }),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "나이 계산 4단계", description: "생년월일 → 만 나이·연 나이·세는 나이", totalTime: "PT2M", steps: [
 { name: "Step 1. 생년월일 입력", text: "YYYY-MM-DD 형식으로 입력." },
 { name: "Step 2. 만 나이 산출", text: "현재 날짜 - 출생일 (생일 지나면 +1)." },
 { name: "Step 3. 연 나이·세는 나이 비교", text: "행정 만 나이, 음주 연 나이, 한국식 세는 나이." },
 { name: "Step 4. 본인 나이 적용", text: "행정 서류는 만 나이, 음주는 연 나이." },
 ] }),
 ]} />
 {children}
 </>
 );
}
