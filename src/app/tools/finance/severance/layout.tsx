import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "퇴직금 세금 계산기 - 환산급여 방식 퇴직소득세 (2026)",
 description:
 "퇴직금 받으면 세금 얼마? 2026 환산급여 방식 4단계 계산법 자동 적용. 근속연수공제·환산급여공제 반영한 정확한 퇴직소득세, IRP 절세 효과까지.",
 path: "/tools/finance/severance",
 keywords: ["퇴직금 계산기", "퇴직소득세", "환산급여 방식", "IRP 절세", "퇴직금 세금"],
});

export default function SeveranceLayout({ children }: { children: React.ReactNode }) {
 return <>{children}</>;
}
