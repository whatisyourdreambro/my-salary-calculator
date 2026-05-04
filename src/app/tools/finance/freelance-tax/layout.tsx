import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "프리랜서 종합소득세 계산기 - 사업소득·필요경비 (2026)",
 description:
 "프리랜서·N잡러 종합소득세 계산기. 사업소득에서 필요경비 차감, 종합소득공제 적용 후 누진세율 자동 계산. 5월 종소세 신고 전 미리 확인하세요.",
 path: "/tools/finance/freelance-tax",
 keywords: ["프리랜서 세금 계산기", "종합소득세 계산기", "사업소득세", "N잡 세금", "5월 종소세"],
});

export default function FreelanceTaxLayout({ children }: { children: React.ReactNode }) {
 return <>{children}</>;
}
