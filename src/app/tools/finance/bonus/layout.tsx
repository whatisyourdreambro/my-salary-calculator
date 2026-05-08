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
 title: "성과급·인센티브 세금 계산기 - 2026 연봉합산 세율",
 description:
 "성과급·인센티브 받으면 세금 얼마 떼나? 2026 연봉합산 방식 세율 자동 적용. 4대보험·소득세·지방소득세 즉시 계산하고 절세 전략까지 한 번에.",
 path: "/tools/finance/bonus",
 keywords: ["성과급 세금 계산기", "인센티브 세금", "보너스 세금", "연봉합산 세율"],
});

const FAQ_ITEMS = [
 { question: "성과급은 왜 세금이 많이 떼이나요?", answer: "한 달에 큰 금액 한꺼번에 받으면 그 달 세율이 누진 구간 위로 점프. 예: 평소 24% 구간이 성과급 한 달에 35% 적용. 다만 연말정산에서 연봉합산 시 일부 환급되어 실효세율은 비슷." },
 { question: "성과급 절세 방법은?", answer: "받기 전: IRP·연금저축 추가 납입 (연 900만 한도, 16.5% 환급). 받은 후: 연말정산에서 의료비·신용카드 공제 적극 활용. 회사가 분할 지급 가능하면 12월 + 1월 분할 요청 가능." },
 { question: "성과급도 4대보험 떼나요?", answer: "네. 성과급도 보수에 포함되어 4대보험료 부과 (월 보수 상한 590만 초과분은 국민연금 면제). 다만 일회성 비정기 상여는 4대보험에서 제외 가능 — 회사 규정 확인." },
 { question: "비과세로 받을 수 있는 방법?", answer: "주식보상(RSU·스톡옵션)은 행사 시점에 과세 — 주가가 낮을 때 행사하면 절세. 회사가 자기주식 무상지급하면 비과세. 사이닝 보너스도 일부 분할 지급 가능." },
];

const HOWTO_STEPS = [
 { name: "Step 1. 성과급 금액 입력", text: "회사가 통보한 성과급 금액 (세전). 분할 지급 여부도 확인." },
 { name: "Step 2. 본인 연봉 입력", text: "성과급 제외한 기본 연봉 (성과급 합산해야 정확한 세율 산출)." },
 { name: "Step 3. 합산 후 누진세율 적용", text: "연봉 + 성과급 = 새 과세표준. 누진세율로 세액 산출." },
 { name: "Step 4. 절세 전략 적용", text: "IRP·연금저축 추가 납입 + 연말정산 공제 항목 사전 점검." },
];

export default function BonusLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/finance/bonus", { leafName: "성과급 세금 계산기" }),
 softwareApplicationLd({ name: "성과급·인센티브 세금 계산기", description: "2026 연봉합산 방식 성과급 세금 무료 계산기.", url: "/tools/finance/bonus" }),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "성과급 세금 계산하고 절세 4단계", description: "성과급 입력부터 IRP 절세까지", totalTime: "PT15M", steps: HOWTO_STEPS }),
 ]} />
 {children}
 </>
 );
}
