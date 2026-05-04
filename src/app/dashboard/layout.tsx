import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "내 연봉 대시보드 - 저장한 결과 비교·시각화",
 description:
 "저장한 연봉 계산 결과를 한 곳에서 비교하고 시간에 따른 자산 변화를 시각화하세요. 연봉 협상 전후, 회사 이직 시나리오, 목표 연봉 달성 경로까지 한눈에.",
 path: "/dashboard",
 keywords: ["연봉 대시보드", "연봉 비교", "내 연봉 추적", "자산 시뮬레이션"],
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
 return <>{children}</>;
}
