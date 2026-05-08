import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, howToLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "할부 이자 계산기 - 신용카드·캐피탈·카드론",
 description:
 "할부 원금, 기간, 이자율을 입력하면 월 납부액·총 이자·실질 이자율을 즉시 계산합니다. 신용카드 할부, 카드론, 캐피탈 비교까지 한 번에.",
 path: "/tools/finance/installment",
 keywords: ["할부 이자 계산기", "신용카드 할부", "카드론 이자", "캐피탈 이자"],
});

const FAQ_ITEMS = [
 { question: "신용카드 할부 이자는 어떻게 계산되나요?", answer: "원리금균등상환 — 매월 동일 금액 납부, 초기엔 이자 비중 큼. 24개월 12% 할부의 실질 이자는 약 6.7% (잔액 감소 효과). 무이자 할부는 가맹점 부담." },
 { question: "카드론과 신용카드 할부의 차이?", answer: "신용카드 할부는 가맹점 결제 즉시 분할. 카드론은 본인 계좌로 현금 대출. 카드론은 보통 14~20% 고금리. 신용대출(은행) > 신용카드 할부 > 카드론 순으로 유리." },
 { question: "중도상환 수수료는?", answer: "신용카드 할부는 보통 무료 (잔금 일시 결제 가능). 캐피탈·카드론은 잔금의 1~3% 수수료. 1년 내 중도상환은 수수료 면제 안 되는 경우 많음." },
 { question: "무이자 할부 vs 일시불, 어느 쪽?", answer: "무이자 할부 무조건 유리 — 원금 분할 + 이자 0. 일시불 시 동일 금액 즉시 결제 vs 무이자 할부 시 원금만 분할. 다만 카드 한도 차감되는 점 주의." },
];

const HOWTO_STEPS = [
 { name: "Step 1. 할부 원금 + 이자율 입력", text: "결제 금액 + 신용카드사 명시 이자율 (보통 5.9~19.9%)." },
 { name: "Step 2. 할부 기간 시뮬", text: "3/6/12/24/36개월별 월 납부액 + 총 이자 비교." },
 { name: "Step 3. 무이자 할부 가능 여부", text: "백화점·온라인몰 무이자 행사 + 카드사 자체 이벤트 확인. 가능하면 무조건 활용." },
 { name: "Step 4. 본인 신용대출과 비교", text: "신용대출 금리(5~7%) vs 할부 이자 비교. 신용대출이 더 싸면 일시불 + 신용대출이 유리." },
];

export default function InstallmentLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/finance/installment", { leafName: "할부 이자 계산기" }),
 softwareApplicationLd({ name: "할부 이자 계산기", description: "신용카드·캐피탈·카드론 할부 이자 무료 계산기.", url: "/tools/finance/installment" }),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "할부 이자 비교하고 가장 싼 옵션 고르는 4단계", description: "할부 vs 신용대출 vs 무이자 할부 비교", totalTime: "PT10M", steps: HOWTO_STEPS }),
 ]} />
 {children}
 </>
 );
}
