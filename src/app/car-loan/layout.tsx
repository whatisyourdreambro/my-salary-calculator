import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "자동차 할부 계산기 - 월 납부액·잔금·총 이자 (2026)",
 description:
 "차량 가격, 선납금, 할부 기간, 이자율을 입력하면 월 납부액과 총 상환 금액, 총 이자를 즉시 계산합니다. 신차·중고차 할부 비교부터 캐피탈 vs 카드론까지 한 번에.",
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
 return <>{children}</>;
}
