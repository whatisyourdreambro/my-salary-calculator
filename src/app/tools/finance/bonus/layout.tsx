import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, softwareApplicationLd } from "@/lib/structuredData";

// buildToolMetadata 수렴 (2026-08-24): "{name} 2026 — {tagline}" 표준 패턴 + type=tool OG
export const metadata: Metadata = buildToolMetadata({
 name: "성과급·인센티브 세금 계산기",
 tagline: "연봉합산 세율·실수령액 계산",
 description:
 "성과급·인센티브 받으면 세금 얼마 떼나? 2026 연봉합산 방식 세율 자동 적용. 4대보험·소득세·지방소득세 즉시 계산하고 절세 전략까지 한 번에.",
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
