import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import AutoShareSection from "@/components/AutoShareSection";

export const metadata: Metadata = buildPageMetadata({
 title: "자동차 할부 계산기 - 차량별 월 납부액·유지비 (2026)",
 description:
 "연봉·할부 기간·이자율로 목록의 차량별 월 할부금과 유지비를 비교합니다. 차량 가격 전액을 할부로 가정하며 선납금·잔금은 반영하지 않습니다.",
 path: "/car-loan",
 keywords: [
 "자동차 할부 계산기",
 "자동차 할부",
 "차량 할부",
 "신차 할부 계산",
 "월 납부액 계산",
 "캐피탈 이자",
 ],
});

export default function CarLoanLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 {children}
 <AutoShareSection contentType="tool" maxWidth="4xl" />
 </>
 );
}
