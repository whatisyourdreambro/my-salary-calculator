// /tools/finance/dividend-tax — 배당소득세 계산기 (2026-09-01 신설)
// 빈 디렉터리로만 남아 있던 미구현 도구를 채운다.
// 구조는 stock-tax 패턴 그대로: layout(메타+LD+본문) / page(use client 계산기).

import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, softwareApplicationLd } from "@/lib/structuredData";
import ToolPageContent from "@/components/tool/ToolPageContent";

export const metadata: Metadata = buildPageMetadata({
  title: "배당소득세 계산기 2026 | 금융소득종합과세 2천만원 기준 - 머니샐러리",
  description:
    "배당금에서 떼는 15.4% 원천징수부터 이자·배당 합계 2,000만원 초과 시 금융소득종합과세까지, 소득세법 제62조 비교과세 방식으로 계산합니다.",
  path: "/tools/finance/dividend-tax",
  keywords: ["배당소득세 계산기", "금융소득종합과세", "배당금 세금", "배당소득 2000만원", "이자소득세"],
});

export default function DividendTaxLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd("/tools/finance/dividend-tax", { leafName: "배당소득세 계산기" }),
          softwareApplicationLd({
            name: "배당소득세 계산기",
            description: "배당·이자 원천징수 15.4%와 금융소득종합과세 비교과세 계산",
            url: "/tools/finance/dividend-tax",
          }),
        ]}
      />
      {children}
      <ToolPageContent path="/tools/finance/dividend-tax" />
    </>
  );
}
