import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "직장인 테트리스 (Salaryman Tetris) - 야근 탈출 게임",
 description: "업무 스트레스를 날려버릴 직장인 전용 테트리스! 블록을 쌓아 야근을 탈출하고 칼퇴하세요. PC/모바일 완벽 지원.",
 path: "/fun/tetris",
 keywords: ["테트리스", "무료게임", "직장인게임", "웹게임", "심심풀이", "고전게임"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
 const jsonLd = {
 "@context": "https://schema.org",
 "@type": "VideoGame",
 "name": "Salaryman Tetris",
 "description": "직장인 컨셉의 테트리스 퍼즐 게임",
 "genre": "Puzzle",
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
