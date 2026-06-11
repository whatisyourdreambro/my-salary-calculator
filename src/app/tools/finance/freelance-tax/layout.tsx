import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, softwareApplicationLd } from "@/lib/structuredData";
import ToolPageContent from "@/components/tool/ToolPageContent";

export const metadata: Metadata = buildPageMetadata({
 title: "프리랜서 종합소득세 계산기 - 사업소득·필요경비 (2026)",
 description:
 "프리랜서·N잡러 종합소득세 계산기. 사업소득에서 필요경비 차감, 종합소득공제 적용 후 누진세율 자동 계산. 5월 종소세 신고 전 미리 확인하세요.",
 path: "/tools/finance/freelance-tax",
 keywords: ["프리랜서 세금 계산기", "종합소득세 계산기", "사업소득세", "N잡 세금", "5월 종소세"],
});

export default function FreelanceTaxLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd
 data={[
 autoBreadcrumbLd("/tools/finance/freelance-tax", { leafName: "프리랜서 종합소득세 계산기" }),
 softwareApplicationLd({
 name: "프리랜서 종합소득세 계산기",
 description: "사업소득·필요경비 기반 2026 종합소득세 계산",
 url: "/tools/finance/freelance-tax",
 }),
 ]}
 />
 {children}
 <ToolPageContent path="/tools/finance/freelance-tax" />
 </>
 );
}
