import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "연봉 MBTI 테스트 — 나의 머니 성향 유형 분석",
  description:
    "간단한 질문으로 나의 소비·저축·투자 성향을 머니 유형으로 진단합니다. 유형별 강점과 추천 재테크 전략까지 한 번에 확인해 보세요.",
  path: "/mbti-salary",
  keywords: [
    "연봉 MBTI",
    "머니 MBTI",
    "재테크 성향 테스트",
    "소비 성향 테스트",
    "돈 성향 테스트",
  ],
});

export default function MbtiSalaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
