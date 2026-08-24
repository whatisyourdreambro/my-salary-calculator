import RandomDrawGame from "@/components/RandomDrawGame";
import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { softwareApplicationLd } from "@/lib/structuredData";
import { InArticleAd } from "@/components/AdPlacement";

export const metadata: Metadata = buildPageMetadata({
 title: "랜덤 추첨 (Marble Race) - 3D 구슬 레이스 뽑기",
 description: "공정하고 스릴 넘치는 3D 마블 레이스 추첨 게임. 당직 뽑기, 점심 내기, 경품 추첨을 더 재미있게!",
 path: "/fun/random-draw",
 keywords: ["랜덤 추첨", "마블 레이스", "뽑기 게임", "사다리타기 대체"],
});

export default function RandomDrawPage() {
 return (
 <div className="min-h-screen pt-24 pb-20 bg-electric pt-28">
 <JsonLd
 data={softwareApplicationLd({
 name: "랜덤 추첨 마블 레이스",
 description: "당직 뽑기·점심 내기·경품 추첨을 위한 3D 구슬 레이스 랜덤 추첨 게임",
 url: "/fun/random-draw",
 })}
 />
 <div className="page-width">
 <RandomDrawGame />
 {/* 실험 #3d: fun 21종 중 유일하게 누락돼 있던 InArticleAd 균일화 (C3 배치 누락분).
 fun/layout 상속 광고(CalcResult·쿠팡·HomeTop)와 슬롯 비충돌 */}
 <div className="mt-10">
 <InArticleAd />
 </div>
 </div>
 </div>
 );
}
