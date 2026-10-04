import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, softwareApplicationLd } from "@/lib/structuredData";
import ToolPageContent from "@/components/tool/ToolPageContent";

export const metadata: Metadata = buildPageMetadata({
 title: "취득세 계산기 - 주택·토지·교육세·농특세 (2026)",
 description:
 "주택·토지 취득가액과 일반·8% 중과 가정으로 취득세, 지방교육세, 농어촌특별세를 계산합니다. 지역·주택 수별 적용 여부와 감면은 자동 판정하지 않는 간이 계산기입니다.",
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
