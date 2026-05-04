import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "성과급·인센티브 세금 계산기 - 2026 연봉합산 세율",
 description:
 "성과급·인센티브 받으면 세금 얼마 떼나? 2026 연봉합산 방식 세율 자동 적용. 4대보험·소득세·지방소득세 즉시 계산하고 절세 전략까지 한 번에.",
 path: "/tools/finance/bonus",
 keywords: ["성과급 세금 계산기", "인센티브 세금", "보너스 세금", "연봉합산 세율"],
});

export default function BonusLayout({ children }: { children: React.ReactNode }) {
 return <>{children}</>;
}
