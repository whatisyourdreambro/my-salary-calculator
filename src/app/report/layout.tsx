import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "내 재무 리포트 — 저장한 연봉·자산 분석",
  description:
    "저장한 연봉 계산 결과를 바탕으로 소득 순위, 자산 구성, 재무 현황을 한눈에 보여주는 개인 리포트입니다.",
  path: "/report",
  // 개인 localStorage 데이터 기반 페이지 → 색인 의도 없음 (/dashboard 와 동일 정책).
  noIndex: true,
});

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
