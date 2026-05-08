import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, howToLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "D-day 계산기 — 기념일·시험·전역일 카운트다운",
 description: "목표 날짜 입력 → 남은 일수·주·월 자동 계산. 시험·전역·결혼·생일 카운트다운.",
 path: "/tools/date/d-day",
 keywords: ["D-day 계산기", "디데이", "남은 일수", "카운트다운"],
});

const FAQ_ITEMS = [
 { question: "D-day 계산은 어떻게?", answer: "목표 날짜와 오늘 날짜의 차이 (일수). 오늘이 D-day 100일 전이면 D-100, 100일 후면 D+100." },
 { question: "주말·공휴일 제외하고 싶다면?", answer: "별도 '근무일 계산기' 사용. 주말·공휴일 제외한 영업일 산출." },
 { question: "여러 D-day 동시 관리?", answer: "본 계산기는 1개 D-day. 다중 관리는 캘린더 앱(Google·Apple) 권장." },
 { question: "윤년 자동 반영?", answer: "네. 자동 반영. 2024·2028 윤년 (2/29) 자동 처리." },
];

export default function DdayLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/date/d-day", { leafName: "D-day 계산기" }),
 softwareApplicationLd({ name: "D-day 계산기", description: "목표 날짜 카운트다운 무료 계산기.", url: "/tools/date/d-day" }),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "D-day 계산 3단계", description: "목표 날짜 → 남은 일수", totalTime: "PT1M", steps: [
 { name: "Step 1. 목표 날짜 입력", text: "시험·전역·결혼 등." },
 { name: "Step 2. 남은 일수 자동 산출", text: "오늘 날짜와 차이." },
 { name: "Step 3. 주·월 단위 환산", text: "일수 / 7 = 주, / 30 ≈ 월." },
 ] }),
 ]} />
 {children}
 </>
 );
}
