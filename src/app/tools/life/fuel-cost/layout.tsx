import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, howToLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "유류비 계산기 — 거리·연비 → 주유비용 자동 산출",
 description: "주행 거리·연비·유가 입력 → 총 유류비. 휘발유·경유·LPG 비교. 출장·여행 비용 시뮬.",
 path: "/tools/life/fuel-cost",
 keywords: ["유류비 계산기", "주유비 계산", "연비 계산", "왕복 주유비"],
});

const FAQ_ITEMS = [
 { question: "유류비 계산식?", answer: "거리(km) ÷ 연비(km/L) × 유가(원/L) = 총 유류비. 예: 100km ÷ 12km/L × 1700원 = 약 14,167원." },
 { question: "휘발유·경유 차이는?", answer: "경유 차량은 연비 약 1.3~1.5배 좋아 km당 비용 ~30% 적음. 단, 차량 가격·정비비 차이 고려 필수." },
 { question: "전기차 비용?", answer: "전기료 약 100원/kWh + 연비 약 5km/kWh → km당 약 20원 (휘발유 약 140원의 1/7). 단, 충전소 인프라·시간 고려." },
 { question: "왕복 출장 비용은?", answer: "거리 × 2 + 톨비 + 주차비. 본 계산기는 거리만. 톨비는 한국도로공사 사이트 참조." },
];

export default function FuelCostLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/life/fuel-cost", { leafName: "유류비 계산기" }),
 softwareApplicationLd({ name: "유류비 계산기", description: "거리·연비 기반 주유비 무료 계산기.", url: "/tools/life/fuel-cost" }),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "유류비 산출 3단계", description: "거리·연비·유가 → 총 비용", totalTime: "PT1M", steps: [
 { name: "Step 1. 거리 입력", text: "주행 km (왕복 시 ×2)." },
 { name: "Step 2. 연비·유가 입력", text: "본인 차량 연비 + 현재 유가." },
 { name: "Step 3. 총 비용 산출", text: "거리 / 연비 × 유가." },
 ] }),
 ]} />
 {children}
 </>
 );
}
