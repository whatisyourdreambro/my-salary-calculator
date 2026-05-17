import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "플래피 샐러리맨 (Flappy Salaryman) - 월급 지키기 게임",
 description: "세금과 물가를 피해 월급을 지키세요! 중독성 있는 무료 미니게임. 당신의 순발력을 테스트해보세요.",
 path: "/fun/flappy",
 keywords: ["플래피게임", "미니게임", "직장인게임", "월급게임", "무료게임", "심심풀이"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
 const jsonLd = {
 "@context": "https://schema.org",
 "@type": "VideoGame",
 "name": "Flappy Salaryman",
 "description": "세금과 물가를 피해 월급을 지키는 서바이벌 미니게임",
 "genre": "Arcade",
 "applicationCategory": "Game",
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
