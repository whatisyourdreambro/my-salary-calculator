import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = buildPageMetadata({
 title: "노비 탈출 계산기 - 나는 언제 은퇴할 수 있을까?",
 description: "현재 자산·월 저축액·희망 생활비를 입력하면 경제적 자유(FIRE) 목표액 달성까지 남은 햇수를 계산하는 노비 탈출 시뮬레이터. 4% 가정·연 단위 적립 모델이며 실제 은퇴·퇴사 가능 여부를 보장하지 않습니다.",
 path: "/fun/escape-plan",
 keywords: ["은퇴계산기", "파이어족", "경제적자유", "노비탈출", "저축계산기", "복리계산기"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
 const jsonLd = {
 "@context": "https://schema.org",
 "@type": "SoftwareApplication",
 "name": "노비 탈출 계산기",
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
 <JsonLd data={jsonLd} />
 {children}
 </>
 );
}
