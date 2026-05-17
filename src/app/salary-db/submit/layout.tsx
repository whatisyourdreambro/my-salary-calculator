import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

// 익명 연봉 제보 폼 — 검색 유입 가치가 없고 /salary-db 와 중복 신호를 주므로 noindex.
export const metadata: Metadata = buildPageMetadata({
  title: "내 연봉 제보하기",
  description:
    "내 회사 연봉 정보를 익명으로 제보해 머니샐러리 연봉 데이터베이스를 함께 만들어주세요.",
  path: "/salary-db/submit",
  noIndex: true,
});

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
