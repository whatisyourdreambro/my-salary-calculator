import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, softwareApplicationLd } from "@/lib/structuredData";
import ToolPageContent from "@/components/tool/ToolPageContent";

// buildToolMetadata 수렴 (2026-08-24): "{name} 2026 — {tagline}" 표준 패턴 + type=tool OG
export const metadata: Metadata = buildToolMetadata({
 name: "복리 계산기",
 tagline: "적립식 투자 자산 시뮬레이션·단리 비교",
 description:
 "월 적립금, 연 수익률, 투자 기간만 입력하면 복리 효과로 늘어나는 미래 자산을 즉시 시뮬레이션합니다. 단리 vs 복리 비교, 세후 수익률까지 한눈에.",
 path: "/tools/finance/compound",
 keywords: ["복리 계산기", "적립식 투자", "자산 시뮬레이션", "미래 자산", "단리 복리 비교"],
});

export default function CompoundLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd
 data={[
 autoBreadcrumbLd("/tools/finance/compound", { leafName: "복리 계산기" }),
 softwareApplicationLd({
 name: "복리 계산기",
 description: "원금+월 적립+복리 수익률로 미래 자산 시뮬레이션",
 url: "/tools/finance/compound",
 }),
 ]}
 />
 {children}
 <ToolPageContent path="/tools/finance/compound" />
 </>
 );
}
