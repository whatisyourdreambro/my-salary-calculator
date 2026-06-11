import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "2026년 신년운세 - 재미로 보는 사주풀이",
 description: "2026년 병오년(丙午年) 당신의 운세는? 생년월일로 재미 삼아 보는 신년운세. 재물운, 직장운까지 무료로 확인하세요.",
 path: "/fun/fortune",
 keywords: ["2026년운세", "신년운세", "무료운세", "병오년운세", "재미운세", "재물운"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
 const jsonLd = {
 "@context": "https://schema.org",
 "@type": "SoftwareApplication",
 "name": "2026 New Year Fortune",
 "description": "생년월일 기반 2026년 병오년 재미용 운세 콘텐츠",
 "applicationCategory": "EntertainmentApplication",
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
