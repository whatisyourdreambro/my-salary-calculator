import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

// simulator는 "use client" 페이지라 metadata export 불가 → layout에서 부여.
// (종전에는 company/layout의 canonical=/company(301 URL)를 상속받던 것을 정정, 2026-08-24)
export const metadata: Metadata = buildPageMetadata({
  title: "중소기업 vs 대기업 실수령액 시뮬레이터 — 청년 소득세 감면 반영",
  description:
    "중소기업 취업 청년 소득세 감면(90%, 연 200만원 한도)을 반영해 중소기업과 대기업의 월 실수령액을 나란히 비교합니다. 2026년 최신 세법 기준.",
  path: "/company/simulator",
  keywords: [
    "중소기업 대기업 실수령액",
    "중소기업 청년 소득세 감면",
    "중기청 소득세 감면 계산",
    "대기업 중소기업 연봉 비교",
  ],
});

export default function SimulatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
