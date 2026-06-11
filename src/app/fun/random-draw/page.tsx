import RandomDrawGame from "@/components/RandomDrawGame";
import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "랜덤 추첨 (Marble Race) - 3D 구슬 레이스 뽑기",
 description: "공정하고 스릴 넘치는 3D 마블 레이스 추첨 게임. 당직 뽑기, 점심 내기, 경품 추첨을 더 재미있게!",
 path: "/fun/random-draw",
 keywords: ["랜덤 추첨", "마블 레이스", "뽑기 게임", "사다리타기 대체"],
});

export default function RandomDrawPage() {
 return (
 <div className="min-h-screen pt-24 pb-20 bg-electric pt-28">
 <div className="page-width">
 <RandomDrawGame />
 </div>
 </div>
 );
}
