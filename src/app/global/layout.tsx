import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "해외 연봉 실수령액 비교 — 한국·미국·일본·싱가포르 세후 월급",
  description:
    "같은 연봉이라도 나라마다 세후 실수령액은 다릅니다. 한국·미국·일본·싱가포르의 소득세·사회보험을 반영한 세후 월급을 한 번에 비교해 보세요.",
  path: "/global",
  keywords: [
    "해외 연봉 비교",
    "국가별 세후 월급",
    "미국 연봉 실수령액",
    "싱가포르 연봉",
    "해외 취업 연봉",
  ],
});

export default function GlobalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
