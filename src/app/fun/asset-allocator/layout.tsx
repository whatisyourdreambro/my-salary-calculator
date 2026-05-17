import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "자산 배분 마스터 (Asset Allocator) - 투자 미니게임",
 description: "떨어지는 금·주식·달러·코인을 잡고 세금폭탄을 피하는 60초 투자 미니게임. 회사가 정해주지 않은 내 자산 분배 본능을 무료로 시험해보세요. 친구와 점수 공유 가능.",
 path: "/fun/asset-allocator",
 keywords: ["투자게임", "주식게임", "미니게임", "재테크게임", "자산관리", "순발력게임"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
 const jsonLd = {
 "@context": "https://schema.org",
 "@type": "VideoGame",
 "name": "Asset Allocator",
 "description": "자산 배분 및 투자 시뮬레이션 미니게임",
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
