import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "성과급·인센티브 세금 계산기 - 2026 연봉합산 세율",
 description:
 "연말·1월 성과급(PS·OPI·인센티브) 세금은 몇 %일까? 2026 연봉합산 방식으로 소득세·지방소득세·4대보험과 총 공제율·한계세율을 바로 계산하고 절세 팁까지 확인하세요.",
 path: "/tools/finance/bonus",
 keywords: ["성과급 세금 계산기", "인센티브 세금", "보너스 세금", "연봉합산 세율"],
});

export default function BonusLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd
 data={[
 autoBreadcrumbLd("/tools/finance/bonus", { leafName: "성과급 세금 계산기" }),
 softwareApplicationLd({
 name: "성과급·인센티브 세금 계산기",
 description: "2026 연봉합산 방식 성과급 소득세·4대보험 실수령액 계산",
 url: "/tools/finance/bonus",
 }),
 ]}
 />
 {children}
 </>
 );
}
