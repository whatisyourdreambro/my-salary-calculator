import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "내 연봉 대시보드 - 저장한 결과 비교·시각화",
 description:
 "이 브라우저에 저장한 최신 연봉 계산 결과와 즐겨찾기한 회사·계산기를 한 곳에서 다시 확인하세요. 회원가입 없이 이 브라우저에만 저장되며, 과거 이력 비교나 기기 간 동기화는 제공하지 않습니다.",
 path: "/dashboard",
 keywords: ["연봉 대시보드", "저장한 연봉 결과", "연봉 즐겨찾기"],
 // 개인 localStorage 데이터 페이지 → 색인 의도 없음 (사용자별 결과 표시).
 // 색인되면 thin user-generated content 신호 발생 위험.
 noIndex: true,
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
 return <>{children}</>;
}
