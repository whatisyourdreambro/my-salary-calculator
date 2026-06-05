import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "회사 연봉 비교 — 두 기업 1:1 맞대결",
  description:
    "삼성전자·SK하이닉스·네이버·카카오 등 한국 주요 기업 두 곳을 골라 신입 초봉·평균 연봉·복지·성장성을 1:1로 비교하세요.",
  path: "/company/compare",
  keywords: ["회사 연봉 비교", "기업 연봉 비교", "연봉 비교", "대기업 연봉 비교"],
  // 카니발 해소(전체 점검 2026-06): /salary-db/compare 가 더 풍부 → 색인 통합 위해 noindex.
  noIndex: true,
});

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
