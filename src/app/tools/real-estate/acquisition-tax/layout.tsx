import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, softwareApplicationLd } from "@/lib/structuredData";
import ToolPageContent from "@/components/tool/ToolPageContent";

export const metadata: Metadata = buildPageMetadata({
 title: "취득세 계산기 - 주택·토지·교육세·농특세 (2026)",
 description:
 "주택·토지 취득가액 입력 → 취득세, 지방교육세, 농어촌특별세 자동 계산. 1주택자/다주택자/조정대상지역 세율 자동 적용, 2026년 최신 기준.",
 path: "/tools/real-estate/acquisition-tax",
 keywords: ["취득세 계산기", "주택 취득세", "토지 취득세", "지방교육세", "농어촌특별세"],
});

export default function AcquisitionTaxLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd
 data={[
 autoBreadcrumbLd("/tools/real-estate/acquisition-tax", { leafName: "취득세 계산기" }),
 softwareApplicationLd({
 name: "부동산 취득세 계산기",
 description: "주택·토지 취득세, 지방교육세, 농어촌특별세 계산",
 url: "/tools/real-estate/acquisition-tax",
 }),
 ]}
 />
 {children}
 <ToolPageContent path="/tools/real-estate/acquisition-tax" />
 </>
 );
}
