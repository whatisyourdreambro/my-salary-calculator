import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import {
 autoBreadcrumbLd,
 faqLd,
 howToLd,
 softwareApplicationLd,
} from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "FIRE 조기은퇴 계산기 - 경제적 자유 시뮬레이션 (2026)",
 description:
 "현재 자산, 월 저축액, 목표 생활비를 입력하면 조기은퇴(FIRE) 가능 시점을 시뮬레이션합니다. 4% 룰 기반 은퇴 자산 목표, 연 수익률별 경로 비교 무료 제공.",
 path: "/fire-calculator",
 keywords: [
 "FIRE 계산기",
 "조기은퇴 계산기",
 "경제적 자유",
 "은퇴 자산 시뮬레이션",
 "4% 룰",
 "재테크 계산기",
 ],
});

const FAQ_ITEMS = [
 {
 question: "FIRE의 4% 룰이 뭔가요?",
 answer:
 "은퇴 자산의 4%만 매년 인출하면 평생 원금이 마르지 않는다는 트리니티 연구 기반 법칙. 즉, 연 생활비 × 25배가 FIRE 자산 목표. 연 4,000만 생활비면 10억이 목표. 단, 인플레이션 + 변동성 고려 시 안전한 인출률은 3.5%(28.5배)로 봄.",
 },
 {
 question: "Lean FIRE / Fat FIRE / Coast FIRE 차이는?",
 answer:
 "Lean FIRE는 최소 생활비(연 2,500만)로 검소 은퇴 (자산 목표 6.25억). Fat FIRE는 풍족한 생활비(연 1억) 은퇴 (25억). Coast FIRE는 더 이상 추가 저축 안 해도 정년에 자산이 충분해지는 시점 (보통 30대 후~40대 초). 본인 라이프스타일 기준 선택.",
 },
 {
 question: "한국에서 FIRE는 가능한가요?",
 answer:
 "가능하지만 미국보다 어려움. 이유: (1) 부동산 비중 높아 유동자산 적음 (2) 의료비·자녀 교육비·노후 의료보험 부담 (3) 한국 주식 변동성 큼. 한국형 FIRE는 연 6,000~8,000만 생활비 + 자산 20~25억 + 부동산 자산 별도 가져가는 게 안전.",
 },
 {
 question: "월 얼마 저축해야 40대에 FIRE 가능한가요?",
 answer:
 "30대 초반 시작, 연 7% 수익률 가정. 월 200만 저축하면 50대 초 FIRE. 월 300만이면 40대 후. 월 500만이면 40대 초. 핵심은 저축률 — 소득의 50% 이상 저축이 FIRE의 본질이지 절대 금액이 아님.",
 },
 {
 question: "은퇴 후 인출 전략은?",
 answer:
 "버킷 전략: (1) 비상금 1~2년치 현금 (2) 5년치는 채권·예적금 (3) 나머지는 주식·ETF. 매년 4% 인출하되 시장 폭락 시 인출 줄이기. 한국은 연금저축·IRP 55세 후 분할 인출이 세금 5.5%로 가장 유리.",
 },
];

const HOWTO_STEPS = [
 {
 name: "Step 1. 연 목표 생활비 산정",
 text: "본인이 은퇴 후 원하는 라이프스타일의 연간 생활비. 식비·주거비·여행·자녀 지원 등. 검소 2,500만 / 보통 5,000만 / 풍족 1억 수준에서 선택.",
 },
 {
 name: "Step 2. FIRE 자산 목표 산출",
 text: "연 생활비 × 25배 = FIRE 자산 (4% 룰). 보수적이면 28.5배. 한국은 부동산 + 추가 의료비 고려해 30배가 안전.",
 },
 {
 name: "Step 3. 저축률 + 수익률 시뮬",
 text: "현재 자산 + 월 저축 + 연 수익률(보통 5~7%) 입력하여 FIRE 도달 시점 계산. 연 수익률 1%p 차이가 5~10년 시간 차이.",
 },
 {
 name: "Step 4. 인출 전략 사전 설계",
 text: "은퇴 후 5년치 안전자산 + 주식·ETF 분리 (버킷 전략). 연금저축·IRP는 55세 이후 분할 인출 시 5.5% 세율 적용.",
 },
];

export default function FireCalculatorLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd
 data={[
 autoBreadcrumbLd("/fire-calculator", { leafName: "FIRE 조기은퇴 계산기" }),
 softwareApplicationLd({
 name: "FIRE 조기은퇴 계산기",
 description:
 "4% 룰 기반 은퇴 자산 목표와 도달 시점을 시뮬레이션하는 무료 계산기.",
 url: "/fire-calculator",
 }),
 faqLd(FAQ_ITEMS),
 howToLd({
 name: "FIRE 조기은퇴 4단계 설계",
 description: "본인의 목표 생활비부터 인출 전략까지 FIRE 시뮬을 설계하는 절차",
 totalTime: "PT1H",
 steps: HOWTO_STEPS,
 }),
 ]}
 />
 {children}
 </>
 );
}
