import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "퍼센트 계산기 — 할인·인상률·증감률 자동 산출",
 description: "원가·할인율·인상률 입력 → 할인가·인상가·차이 % 즉시 계산. 쇼핑·연봉 협상 시 활용.",
 path: "/tools/math/percent",
 keywords: ["퍼센트 계산기", "할인율 계산", "인상률 계산", "%"],
});

const FAQ_ITEMS = [
 { question: "할인율 계산식?", answer: "할인가 = 원가 × (1 - 할인율). 예: 10만원 30% 할인 = 100,000 × 0.7 = 70,000원." },
 { question: "인상률 계산?", answer: "인상가 = 원가 × (1 + 인상률). 연봉 5,000만원 5% 인상 = 5,000 × 1.05 = 5,250만원." },
 { question: "변화율 (전년 대비)?", answer: "(현재 - 과거) / 과거 × 100%. 작년 5,000만 → 올해 5,500만 = +10%." },
 { question: "복리 vs 단리 차이?", answer: "단리: 원금에만 이자. 복리: 원금+이자에 이자. 30년 차이 5~10배. 복리 계산은 별도 페이지." },
];

export default function PercentLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/math/percent", { leafName: "퍼센트 계산기" }),
 softwareApplicationLd({ name: "퍼센트 계산기", description: "할인율·인상률·변화율 무료 계산.", url: "/tools/math/percent" }),
 faqLd(FAQ_ITEMS),
 ]} />
 {children}
 </>
 );
}
