import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, softwareApplicationLd } from "@/lib/structuredData";
import ToolPageContent from "@/components/tool/ToolPageContent";

export const metadata: Metadata = buildPageMetadata({
 title: "증여세 계산기 - 가족 간 공제한도·세율 (2026)",
 description:
 "배우자 6억, 직계존비속 5천만(미성년 2천만), 기타친족 1천만 공제한도 자동 적용. 혼인·출산 1억 추가 공제, 신고세액공제 3%까지 반영한 증여세 계산.",
 path: "/tools/real-estate/gift-tax",
 keywords: ["증여세 계산기", "가족 증여세", "증여 공제 한도", "직계존비속 증여", "배우자 증여", "혼인 증여공제"],
});

export default function GiftTaxLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd
 data={[
 autoBreadcrumbLd("/tools/real-estate/gift-tax", { leafName: "증여세 계산기" }),
 softwareApplicationLd({
 name: "증여세 계산기",
 description: "가족 간 증여 공제한도·누진세율·신고세액공제 계산",
 url: "/tools/real-estate/gift-tax",
 }),
 ]}
 />
 {children}
 <ToolPageContent path="/tools/real-estate/gift-tax" />
 </>
 );
}
