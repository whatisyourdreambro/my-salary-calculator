import IdealTypeWorldCup from "@/components/IdealTypeWorldCup";
import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "기업 이상형 월드컵 - 나의 꿈의 직장 찾기",
 description: "당신의 꿈의 직장은 어디인가요? 16강 토너먼트로 알아보는 나의 최애 기업 찾기!",
 path: "/fun/worldcup",
 keywords: ["기업 이상형 월드컵", "꿈의 직장", "회사 월드컵", "이상형 월드컵"],
});

export default function WorldCupPage() {
 return (
 <div className="min-h-screen pt-20 pb-20 pt-28">
 <IdealTypeWorldCup />
 </div>
 );
}
