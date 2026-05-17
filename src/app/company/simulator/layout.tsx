import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "중소기업 vs 대기업 실수령액 시뮬레이터 — 청년 소득세 감면 비교",
  description:
    "중소기업 청년 소득세 90% 감면을 적용하면 실수령액이 어떻게 달라질까요? 중소기업·대기업 연봉을 직접 조절해 월 실수령액 차이를 비교하세요.",
  path: "/company/simulator",
  keywords: [
    "중소기업 대기업 비교",
    "청년 소득세 감면",
    "실수령액 시뮬레이터",
    "중소기업 청년 세금감면",
  ],
});

export default function SimulatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
