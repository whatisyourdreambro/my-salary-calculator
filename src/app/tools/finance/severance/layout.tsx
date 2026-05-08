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
 title: "퇴직금 세금 계산기 - 환산급여 방식 퇴직소득세 (2026)",
 description:
 "퇴직금 받으면 세금 얼마? 2026 환산급여 방식 4단계 계산법 자동 적용. 근속연수공제·환산급여공제 반영한 정확한 퇴직소득세, IRP 절세 효과까지.",
 path: "/tools/finance/severance",
 keywords: ["퇴직금 계산기", "퇴직소득세", "환산급여 방식", "IRP 절세", "퇴직금 세금"],
});

const FAQ_ITEMS = [
 { question: "퇴직금은 어떻게 계산되나요?", answer: "법정 퇴직금 = 3개월 평균 월급 × (총 근속 개월 / 12). 1년 미만 근무는 미지급. 회사 별도 규정 있으면 그게 더 유리하면 적용." },
 { question: "퇴직소득세는 일반 소득세와 어떻게 다른가요?", answer: "환산급여 방식 적용 — 근속연수만큼 분할해 누진세율을 낮춤. 근속 10년 이상은 일반 소득세 대비 30~50% 절감. 근속 1년에 200만 공제 + 환산급여공제 추가." },
 { question: "IRP로 옮기면 세금은?", answer: "IRP 이전 시 퇴직소득세 즉시 부담 X (이연). 55세 후 연금으로 분할 인출하면 3.3~5.5% 저세율. 일시 인출보다 30%+ 절세 가능. 단, 55세 전 인출은 페널티 큼." },
 { question: "퇴직금이 큰 경우 분할 수령이 가능한가요?", answer: "회사 규정에 따라 다름. 큰 퇴직금은 IRP로 이전 후 분할 인출이 세금 측면 유리. 일시 수령 시 누진세율 점프 가능성." },
];

const HOWTO_STEPS = [
 { name: "Step 1. 평균 월급 산정", text: "퇴직 직전 3개월 평균 월급 (기본급 + 통상수당). 비과세 항목 포함." },
 { name: "Step 2. 법정 퇴직금 계산", text: "평균 월급 × (총 근속 개월수 / 12). 1년차는 0, 5년차는 5개월치 등." },
 { name: "Step 3. 퇴직소득세 산출", text: "근속연수공제 → 환산급여 → 환산급여공제 → 누진세율 → 다시 실세액 환산. 본 계산기가 자동 처리." },
 { name: "Step 4. IRP 이전 vs 일시 수령 비교", text: "IRP 이전 시 즉시 세금 0, 55세 후 분할 인출. 일시 수령 시 즉시 세금 부담. 본인 노후 자금 계획 기준 결정." },
];

export default function SeveranceLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/finance/severance", { leafName: "퇴직금 세금 계산기" }),
 softwareApplicationLd({ name: "퇴직금 세금 계산기", description: "환산급여 방식 2026 퇴직소득세 무료 계산기.", url: "/tools/finance/severance" }),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "퇴직금 세금 계산 4단계", description: "법정 퇴직금부터 IRP 이전 비교까지 절세 시뮬", totalTime: "PT15M", steps: HOWTO_STEPS }),
 ]} />
 {children}
 </>
 );
}
