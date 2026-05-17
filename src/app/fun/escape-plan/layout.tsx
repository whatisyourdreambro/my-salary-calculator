import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "노비 탈출 계산기 - 나는 언제 은퇴할 수 있을까?",
 description: "현재 월급·저축액·생활비를 입력하면 경제적 자유(FIRE) 달성 시기를 자동 계산. 직장인 노비 탈출까지 남은 햇수와 매월 더 저축해야 할 금액을 한 번에 확인하세요 (2026 기준).",
 path: "/fun/escape-plan",
 keywords: ["은퇴계산기", "파이어족", "경제적자유", "노비탈출", "저축계산기", "복리계산기"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
 const jsonLd = {
 "@context": "https://schema.org",
 "@type": "SoftwareApplication",
 "name": "Escape Plan Calculator",
 "description": "경제적 자유 달성 시기 및 은퇴 자금 계산 도구",
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
