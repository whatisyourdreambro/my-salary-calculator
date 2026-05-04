import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "커리어 플래너 - 승진·이직 시나리오별 연봉 시뮬",
 description:
 "승진, 이직, 학위, 사이드 프로젝트 등 커리어 이벤트를 입력하면 향후 10년 연봉 변화를 시뮬레이션합니다. 연봉 상승 곡선과 누적 자산 차트로 한눈에.",
 path: "/pro/career-planner",
 keywords: ["커리어 플래너", "연봉 시뮬레이션", "이직 시나리오", "승진 연봉"],
});

export default function CareerPlannerLayout({ children }: { children: React.ReactNode }) {
 return <>{children}</>;
}
