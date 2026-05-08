import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, howToLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "재무 건강 진단 — 자산·부채·저축·비상금·보장 5영역 점수",
 description:
 "자산·부채·저축·비상금·보장 5영역 입력 → A+~D 등급 + 우선순위 액션 5개 자동 추천. 본인 재무 상태를 한 번에 진단.",
 path: "/tools/career/financial-health",
 keywords: ["재무 건강", "재무 진단", "자산 점검", "재무 점수"],
});

const FAQ_ITEMS = [
 { question: "재무 건강 점수는 어떻게 계산?", answer: "자산(25%) + 부채(20%) + 저축률(25%) + 비상금(15%) + 보장(15%) 가중평균. A+(85+)·A(75+)·B(65+)·C(50+)·D(50미만)." },
 { question: "나이 대비 권장 자산은?", answer: "연 소득 × (나이-22) × 0.5 = 권장 순자산. 예: 35세 연봉 6,000만 → 권장 약 2억. 본인 자산 대비 비율로 점수." },
 { question: "DTI(부채/소득)는?", answer: "총 부채 / 연소득. 100% 이하 안전, 200% 초과 위험. 주담대 포함 부채 합계로 계산. 200% 초과 시 점수 큰 폭 하락." },
 { question: "저축률은 얼마가 적정?", answer: "권장 20%+ (월 소득 대비). 30%+ 시 자산 형성 가속. 10% 미만은 노후 위험. 본 진단은 20%를 기준점으로." },
 { question: "비상금 6개월이 왜?", answer: "실직·질병·긴급 지출 대응. 평균 직장 공백 2~4개월 + 새 직장 적응 1~2개월. 6개월치는 안전 마진." },
];

export default function FinancialHealthLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/career/financial-health", { leafName: "재무 건강 진단", overrides: { career: "커리어 도구" } }),
 softwareApplicationLd({ name: "재무 건강 진단", description: "자산·부채·저축·비상금·보장 5영역 점수 + 액션 추천.", url: "/tools/career/financial-health" }),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "재무 건강 진단 4단계", description: "기본 정보부터 액션 추천까지", totalTime: "PT5M", steps: [
 { name: "Step 1. 기본 정보", text: "나이·연 소득 입력." },
 { name: "Step 2. 자산·부채", text: "총 자산·총 부채 입력." },
 { name: "Step 3. 저축·비상금", text: "월 저축액·비상금." },
 { name: "Step 4. 보장·절세", text: "보험·IRP 가입 여부." },
 ] }),
 ]} />
 {children}
 </>
 );
}
