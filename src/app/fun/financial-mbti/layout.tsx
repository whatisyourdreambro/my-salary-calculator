import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "금융 MBTI 테스트 - 나의 투자 성향 분석",
 description: "16가지 유형으로 알아보는 나의 금융 DNA — 워렌 버핏형, 욜로족, 짠돌이형 중 나는 어디? 3분 만에 끝내는 무료 투자 성향 테스트. 결과는 친구와 SNS로 공유 가능합니다.",
 path: "/fun/financial-mbti",
 keywords: ["금융MBTI", "투자성향테스트", "부자테스트", "MBTI검사", "재테크성향", "심리테스트"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
 const jsonLd = {
 "@context": "https://schema.org",
 "@type": "SoftwareApplication",
 "name": "Financial MBTI Test",
 "description": "개인의 투자 성향과 금융 습관을 분석하는 MBTI 기반 테스트",
 "applicationCategory": "FinanceApplication",
 "operatingSystem": "Any",
 "offers": {
 "@type": "Offer",
 "price": "0",
 "priceCurrency": "KRW"
 }
 };

 return (
 <>
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
 />
 {children}
 </>
 );
}
