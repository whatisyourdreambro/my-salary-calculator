import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "밈코인 모의투자 시뮬레이션 (CRYPTO PANIC) - 100만원으로 인생역전?",
 description: "가상 자금 100만원을 밈코인 3종에 배분하고 랜덤 시장 이벤트를 체험하는 모의투자 시뮬레이션. -99% 폭락의 공포를 안전하게 미리 경험해보세요.",
 path: "/fun/meme-coin",
 keywords: ["밈코인 모의투자", "코인 시뮬레이션", "가상 투자 게임", "코인게임", "모의투자"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
 const jsonLd = {
 "@context": "https://schema.org",
 "@type": "VideoGame",
 "name": "CRYPTO PANIC - 밈코인 모의투자",
 "description": "가상 자금 100만원으로 밈코인 포트폴리오를 구성하고 랜덤 시장 이벤트를 체험하는 모의투자 시뮬레이션 게임",
 "genre": "Simulation",
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
