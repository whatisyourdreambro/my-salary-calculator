import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, howToLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "BMI 계산기 — 체질량지수 + 한국·아시아 기준",
 description: "키·몸무게 입력 → BMI 자동 계산 + 저체중·정상·과체중·비만 판정. 한국·아시아 기준 적용.",
 path: "/tools/health/bmi",
 keywords: ["BMI 계산기", "체질량지수", "비만 기준", "한국 BMI"],
});

const FAQ_ITEMS = [
 { question: "BMI 계산식은?", answer: "BMI = 몸무게(kg) / 키(m)². 예: 키 170cm + 몸무게 65kg → 65 / 1.7² = 22.5." },
 { question: "한국 비만 기준은?", answer: "WHO 아시아 기준: 18.5 미만 저체중, 18.5~22.9 정상, 23~24.9 과체중, 25 이상 비만. 서양보다 엄격." },
 { question: "BMI의 한계?", answer: "근육량·체지방률 미반영. 운동선수는 근육 많아 BMI 높지만 비만 아님. 정확한 평가는 체성분 분석(InBody) 권장." },
 { question: "건강 위험 신호?", answer: "BMI 25+ 또는 18.5- 시 건강 위험. 25+ 는 당뇨·고혈압·심혈관 위험, 18.5- 는 골밀도·면역력 저하." },
];

export default function BmiLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/health/bmi", { leafName: "BMI 계산기" }),
 softwareApplicationLd({ name: "BMI 계산기", description: "체질량지수 한국·아시아 기준 무료 계산기.", url: "/tools/health/bmi" }),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "BMI 산출 3단계", description: "키·몸무게 → BMI 판정", totalTime: "PT1M", steps: [
 { name: "Step 1. 키·몸무게 입력", text: "키(cm), 몸무게(kg)." },
 { name: "Step 2. BMI 자동 산출", text: "몸무게 / 키² (m 단위)." },
 { name: "Step 3. 한국 기준 판정", text: "18.5/23/25 분기점 기준." },
 ] }),
 ]} />
 {children}
 </>
 );
}
