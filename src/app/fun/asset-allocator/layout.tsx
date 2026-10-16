import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = buildPageMetadata({
 title: "자산 배분 마스터 (Asset Allocator) - 투자 미니게임",
 description: "떨어지는 금·다이아·동전을 잡고 폭탄을 피하는 60초 미니게임. 실제 투자나 자산 배분을 평가하는 도구가 아닌 재미용 게임입니다. 친구와 점수 공유 가능.",
 path: "/fun/asset-allocator",
 keywords: ["투자게임", "주식게임", "미니게임", "재테크게임", "자산관리", "순발력게임"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
 const jsonLd = {
 "@context": "https://schema.org",
 "@type": "VideoGame",
 "name": "자산 배분 마스터 (Asset Allocator)",
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
 <JsonLd data={jsonLd} />
 {children}
 </>
 );
}
