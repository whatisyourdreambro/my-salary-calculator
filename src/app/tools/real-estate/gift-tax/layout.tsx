import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, howToLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "증여세 계산기 - 가족 간 공제한도·세율 (2026)",
 description:
 "배우자 6억, 직계존비속 5천만(미성년 2천만), 기타친족 1천만 공제한도 자동 적용. 누진세율 10~50% 단계별 계산 + 절세 분할 증여 시뮬까지.",
 path: "/tools/real-estate/gift-tax",
 keywords: ["증여세 계산기", "가족 증여세", "증여 공제 한도", "직계존비속 증여", "배우자 증여"],
});

const FAQ_ITEMS = [
 { question: "증여세 공제 한도는 얼마인가요?", answer: "10년 합산 기준: 배우자 6억, 직계존비속 5천만(미성년 자녀 2천만), 기타 친족 1천만. 10년 후 다시 공제 가능. 부부 + 부모 + 자녀 분할 증여로 절세 효과 극대화." },
 { question: "10년 합산이 무슨 의미인가요?", answer: "동일인으로부터 10년 내 받은 증여를 모두 합산해 공제 한도 적용. 5년 전 5천만 + 지금 5천만 = 1억 증여로 본 후 5천만 공제 → 5천만 과세. 10년 단위로 분할이 핵심." },
 { question: "현금 vs 부동산 vs 주식 증여 차이?", answer: "현금: 즉시 평가, 단순. 부동산: 공시지가·시가 평가, 평가 시점에 따라 절세 가능. 주식: 평가일 전후 4개월 평균. 부동산은 가격 하락 시점에 증여하면 절세 효과 큼." },
 { question: "결혼 자금 증여세 면제는?", answer: "직계존속이 자녀 결혼 전후 2년 내 1억 증여 시 추가 비과세 (2024년 신설). 기존 5천만 + 결혼증여 1억 = 1.5억까지 비과세. 부부 합산 3억까지 가능." },
];

const HOWTO_STEPS = [
 { name: "Step 1. 증여자·수증자 관계 확인", text: "배우자/직계존비속/기타친족 — 공제 한도가 10배 이상 차이." },
 { name: "Step 2. 10년 내 기존 증여 확인", text: "본 증여 직전 10년 내 동일인에게서 받은 증여 합산. 합산 한도 초과면 과세표준 발생." },
 { name: "Step 3. 평가액 산출", text: "현금: 액면가. 부동산: 공시지가/시가. 주식: 평가일 전후 4개월 평균. 평가일 선택이 절세 핵심." },
 { name: "Step 4. 누진세율 적용 + 분할 전략", text: "1억 이하 10%, 30억 초과 50%. 큰 자산은 10년 단위 분할 + 부모 + 배우자 분할로 한도 초기화." },
];

export default function GiftTaxLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/real-estate/gift-tax", { leafName: "증여세 계산기" }),
 softwareApplicationLd({ name: "증여세 계산기", description: "가족 간 공제한도·누진세율 자동 적용 무료 계산기.", url: "/tools/real-estate/gift-tax" }),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "증여세 절세하는 4단계", description: "관계 확인부터 분할 증여 전략까지", totalTime: "PT30M", steps: HOWTO_STEPS }),
 ]} />
 {children}
 </>
 );
}
