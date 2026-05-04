import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 운세 — 직장인 재물·연봉 운세 한 번에",
 description:
 "2026년 직장인 재물 운세, 연봉 변화, 이직·승진 가능성을 띠별로 풀이. 머니샐러리 연봉 데이터와 함께 보는 2026년 직장 생활 가이드.",
 path: "/fortune-2026",
 keywords: ["2026 운세", "직장인 운세", "재물운", "연봉 운세", "이직 운세"],
});

export default function Fortune2026Layout({ children }: { children: React.ReactNode }) {
 return <>{children}</>;
}
