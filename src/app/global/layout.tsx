import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
  title: "2026 국가별 연봉 비교 — 한국·미국·일본·싱가포르 세후 실수령액",
  description:
    "연봉 6,000만원이면 한국 세후 약 5,040만원, 미국 약 5,500만원, 싱가포르 약 5,520만원. 4개국 세금 효율을 한눈에 비교하고 해외 취업·이직 가치를 즉시 확인.",
  path: "/global",
  keywords: [
    "국가별 연봉 비교",
    "해외 연봉 계산기",
    "미국 세후 연봉",
    "일본 세후 연봉",
    "싱가포르 세후 연봉",
    "한국 vs 미국 연봉",
    "글로벌 세금 비교",
    "해외 취업 연봉",
    "해외 이직 연봉",
  ],
});

export default function GlobalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* 9차 점검 — JsonLd 추가 (Breadcrumb + SoftwareApplication) */}
      <JsonLd
        data={[
          autoBreadcrumbLd("/global", { leafName: "국가별 연봉 비교" }),
          softwareApplicationLd({
            name: "국가별 연봉 비교 계산기",
            description: "한국·미국·일본·싱가포르 세후 수령액 비교",
            url: "/global",
          }),
        ]}
      />
      {children}
    </>
  );
}
