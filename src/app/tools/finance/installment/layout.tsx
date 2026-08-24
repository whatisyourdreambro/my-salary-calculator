import type { Metadata } from "next";
import { buildToolMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, softwareApplicationLd } from "@/lib/structuredData";
import ToolPageContent from "@/components/tool/ToolPageContent";

// buildToolMetadata 수렴 (2026-08-24): "{name} 2026 — {tagline}" 표준 패턴 + type=tool OG
export const metadata: Metadata = buildToolMetadata({
 name: "할부 이자 계산기",
 tagline: "신용카드·캐피탈·카드론 월 납부액",
 description:
 "할부 원금, 기간, 이자율을 입력하면 월 납부액·총 이자·실질 이자율을 즉시 계산합니다. 신용카드 할부, 카드론, 캐피탈 비교까지 한 번에.",
 path: "/tools/finance/installment",
 keywords: ["할부 이자 계산기", "신용카드 할부", "카드론 이자", "캐피탈 이자"],
});

export default function InstallmentLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd
 data={[
 autoBreadcrumbLd("/tools/finance/installment", { leafName: "할부 이자 계산기" }),
 softwareApplicationLd({
 name: "할부 이자 계산기",
 description: "할부 원금·기간·이자율로 월 납부액과 총 이자 계산",
 url: "/tools/finance/installment",
 }),
 ]}
 />
 {children}
 <ToolPageContent path="/tools/finance/installment" />
 </>
 );
}
