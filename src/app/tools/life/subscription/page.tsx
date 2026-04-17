import type { Metadata } from "next";
import SubscriptionCalcClient from "./SubscriptionCalcClient";

export const metadata: Metadata = {
  title: "구독 서비스 비용 계산기 | 월 구독료 총합 분석 - 머니샐러리",
  description: "넷플릭스, 유튜브 프리미엄, 멜론, 쿠팡로켓와우 등 모든 구독 서비스의 월 / 연간 총 지출을 계산하고 절약 포인트를 찾아드립니다.",
};
export default function SubscriptionPage() { return <SubscriptionCalcClient />; }