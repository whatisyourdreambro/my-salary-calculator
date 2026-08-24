import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, softwareApplicationLd } from "@/lib/structuredData";
import ToolPageContent from "@/components/tool/ToolPageContent";

// buildToolMetadata 수렴 (2026-08-24): "{name} 2026 — {tagline}" 표준 패턴 + type=tool OG
export const metadata: Metadata = buildToolMetadata({
 name: "주식 양도소득세 계산기",
 tagline: "해외주식·대주주 세금 계산",
 description:
 "해외주식·대주주 양도소득세 계산기. 250만원 기본공제, 22% 세율(지방세 포함) 자동 적용. 매수가·매도가 입력만으로 절세 시뮬까지 한 번에.",
 path: "/tools/finance/stock-tax",
 keywords: ["주식 양도세 계산기", "해외주식 세금", "대주주 양도세", "주식 세금", "양도소득세"],
});

export default function StockTaxLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd
 data={[
 autoBreadcrumbLd("/tools/finance/stock-tax", { leafName: "주식 양도소득세 계산기" }),
 softwareApplicationLd({
 name: "주식 양도소득세 계산기",
 description: "해외주식 250만원 공제·대주주 양도소득세 계산",
 url: "/tools/finance/stock-tax",
 }),
 ]}
 />
 {children}
 <ToolPageContent path="/tools/finance/stock-tax" />
 </>
 );
}
