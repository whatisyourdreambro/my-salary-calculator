import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import AutoShareSection from "@/components/AutoShareSection";

export const metadata: Metadata = buildPageMetadata({
  title: "내 재무 리포트 — 저장한 연봉·자산 분석",
  description:
    "저장한 연봉 계산 결과를 바탕으로 자체 연봉 참고표와 비교하고 소득 구성, 상환액 비율을 보여주는 개인 리포트입니다.",
  path: "/report",
  // 개인 localStorage 데이터 기반 페이지 → 색인 의도 없음 (/dashboard 와 동일 정책).
  noIndex: true,
});

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <AutoShareSection contentType="page" maxWidth="3xl" />
    </>
  );
}
