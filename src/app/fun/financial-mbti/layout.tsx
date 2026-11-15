import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = buildPageMetadata({
 title: "금융 MBTI 테스트 - 나의 투자 성향 분석",
 description: "4가지 질문으로 알아보는 16가지 투자 취향 캐릭터 — 퀀트 전략가, 장기 적립식 투자자, 테마 투자 선구자 중 나는 어디? 1분이면 끝나는 재미용 테스트로, 공식 MBTI 검사나 투자성향 진단이 아닙니다. 결과는 SNS로 공유할 수 있습니다.",
 path: "/fun/financial-mbti",
 keywords: ["금융MBTI", "투자성향테스트", "부자테스트", "MBTI검사", "재테크성향", "심리테스트"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
 const jsonLd = {
 "@context": "https://schema.org",
 "@type": "SoftwareApplication",
 "name": "금융 MBTI 테스트",
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
 <JsonLd data={jsonLd} />
 {children}
 </>
 );
}
