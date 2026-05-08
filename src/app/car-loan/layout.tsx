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
 title: "자동차 할부 계산기 - 월 납부액·잔금·총 이자 (2026)",
 description:
 "차량 가격, 선납금, 할부 기간, 이자율을 입력하면 월 납부액과 총 상환 금액, 총 이자를 즉시 계산합니다. 신차·중고차 할부 비교부터 캐피탈 vs 카드론까지 한 번에.",
 path: "/car-loan",
 keywords: [
 "자동차 할부 계산기",
 "자동차 할부",
 "차량 할부",
 "신차 할부 계산",
 "월 납부액 계산",
 "캐피탈 이자",
 ],
});

const FAQ_ITEMS = [
 {
 question: "자동차 할부 이자율은 어떻게 결정되나요?",
 answer:
 "신용점수, 차량 종류(신차/중고차), 할부 기간, 캐피탈사에 따라 달라집니다. 신차는 보통 연 4~9%, 중고차는 6~13% 수준. 신용점수 850 이상이면 우대금리 0.5~1%p 가능. 차량 제조사 캡티브 캐피탈(현대캐피탈·KB·신한 등)이 보통 가장 낮습니다.",
 },
 {
 question: "현금 일시불 vs 할부, 어느 쪽이 유리한가요?",
 answer:
 "현금 보유 자금의 기회비용을 고려해야 합니다. 할부 이자가 7%인데 본인 투자 수익률이 10%면 할부가 유리. 반대로 현금이 통장에 묶여 있다면 일시불이 이자 부담 0. 보통 무이자 할부가 가능하면 무조건 할부, 아니면 본인 투자 성향 기준.",
 },
 {
 question: "선납금은 얼마가 적당한가요?",
 answer:
 "최소 차량가의 20%, 권장 30~40%. 선납이 적으면 월 부담은 낮지만 총 이자가 늘어나고 차량가 하락 시 깡통대출(차값 < 잔금) 위험 있음. 선납 30%면 사고·매각 시에도 안전 마진 확보.",
 },
 {
 question: "할부 기간은 몇 년이 좋나요?",
 answer:
 "60개월(5년)이 일반적. 36개월(3년)은 월 부담 크지만 총 이자 절반. 84개월(7년) 이상은 총 이자가 차량가의 30%+로 비효율적. 본인 월 가처분 소득의 15% 이내로 월 납부액 맞추는 게 안전.",
 },
 {
 question: "중도상환 수수료는 얼마인가요?",
 answer:
 "캐피탈은 보통 잔금의 1~2%. 1년 미만 조기상환은 수수료 면제 안 되는 경우 많음. 3년 이후 중도상환은 면제되는 곳 많아 약관 확인 필수. 잔금이 클수록 수수료 부담도 큰데, 그래도 이자 절감액이 더 크면 유리.",
 },
];

const HOWTO_STEPS = [
 {
 name: "Step 1. 차량 가격 + 선납금 결정",
 text: "사고 싶은 차량의 출고가에서 본인 선납금(20~40%)을 빼서 할부 원금 산출. 신차는 출고가, 중고차는 매물가 기준.",
 },
 {
 name: "Step 2. 이자율 비교 (3~4곳)",
 text: "캡티브 캐피탈(현대·KB·신한)·은행 자동차론·증권사 마이너스통장 이자 비교. 신용점수에 따라 0.5~3%p 차이 가능.",
 },
 {
 name: "Step 3. 할부 기간 시뮬레이션",
 text: "36/48/60/72개월별 월 납부액 + 총 이자 시뮬. 월 가처분 소득의 15% 이내 월 납부액으로 기간 결정.",
 },
 {
 name: "Step 4. 총비용 vs 본인 투자 수익률 비교",
 text: "할부 이자 vs 본인 투자 수익률 비교. 무이자 가능하면 무조건 할부, 아니면 보유 현금 활용 결정.",
 },
];

export default function CarLoanLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd
 data={[
 autoBreadcrumbLd("/car-loan", { leafName: "자동차 할부 계산기" }),
 softwareApplicationLd({
 name: "자동차 할부 계산기",
 description:
 "차량 가격, 선납금, 이자율 기반 월 납부액과 총 이자를 즉시 계산하는 무료 계산기.",
 url: "/car-loan",
 }),
 faqLd(FAQ_ITEMS),
 howToLd({
 name: "자동차 할부 계산하고 가장 유리한 조건 고르는 4단계",
 description: "차량 가격·선납금·이자율·할부 기간을 비교해 본인에게 가장 유리한 자동차 할부 조건을 결정하는 절차",
 totalTime: "PT30M",
 steps: HOWTO_STEPS,
 }),
 ]}
 />
 {children}
 </>
 );
}
