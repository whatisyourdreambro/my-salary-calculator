import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "연봉 배틀 — 회사별 총보상·실질시급·워라벨 즉시 비교",
 description:
 "삼성전자 vs SK하이닉스 등 두 회사의 연봉·인센·4대보험 총보상과 실질 시급, 워라벨을 레이더 차트로 한눈에 비교. 직급별 AI 판정 무료.",
 path: "/fun/salary-battle",
 keywords: ["연봉 배틀", "회사 연봉 비교", "삼성전자 연봉", "SK하이닉스 연봉", "총보상 비교", "실질 시급", "워라벨 비교"],
});

export default function SalaryBattleLayout({ children }: { children: React.ReactNode }) {
 return <>{children}</>;
}
