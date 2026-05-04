import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "FIRE 조기은퇴 계산기 - 경제적 자유 시뮬레이션 (2026)",
 description:
 "현재 자산, 월 저축액, 목표 생활비를 입력하면 조기은퇴(FIRE) 가능 시점을 시뮬레이션합니다. 4% 룰 기반 은퇴 자산 목표, 연 수익률별 경로 비교 무료 제공.",
 path: "/fire-calculator",
 keywords: [
 "FIRE 계산기",
 "조기은퇴 계산기",
 "경제적 자유",
 "은퇴 자산 시뮬레이션",
 "4% 룰",
 "재테크 계산기",
 ],
});

export default function FireCalculatorLayout({ children }: { children: React.ReactNode }) {
 return <>{children}</>;
}
