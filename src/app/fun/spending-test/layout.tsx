import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "과소비 위험도 테스트 - 나는 스튜핏? 그레잇?",
 description: "나의 소비 습관을 분석하여 과소비 위험도를 진단합니다. 텅장 탈출을 위한 첫걸음, 당신의 소비 패턴을 점검하세요.",
 path: "/fun/spending-test",
 keywords: ["과소비테스트", "소비습관", "절약팁", "짠테크", "심리테스트", "재무진단"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
 const jsonLd = {
 "@context": "https://schema.org",
 "@type": "SoftwareApplication",
 "name": "Spending Habit Test",
 "description": "개인의 소비 패턴을 분석하여 과소비 위험도를 진단하는 도구",
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
