import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

// /guides 허브 페이지 전용 메타데이터.
// /guides/[slug] 글 페이지는 자체 generateMetadata 가 우선 적용된다.
export const metadata: Metadata = buildPageMetadata({
  title: "금융·연봉 가이드 — 연말정산·재테크·세금 절약 실전 가이드",
  description:
    "연봉 협상, 연말정산, 4대보험, 재테크까지 직장인이 꼭 알아야 할 금융 지식을 쉽게 풀어낸 가이드 모음입니다. 2026년 최신 세법 기준으로 업데이트됩니다.",
  path: "/guides",
  keywords: [
    "금융 가이드",
    "연봉 가이드",
    "연말정산 가이드",
    "재테크 가이드",
    "직장인 재무 가이드",
  ],
});

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
