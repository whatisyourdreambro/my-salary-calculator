import type { Metadata } from "next";
import IRPCalculatorClient from "./IRPCalculatorClient";

export const metadata: Metadata = {
  title: "IRP·연금저축 세액공제 계산기 2026 | 노후 자산 시뮬레이터 - 머니샐러리",
  description: "2026년 기준 IRP(개인형 퇴직연금)와 연금저축 세액공제 환급액을 즉시 계산하세요. 소득 구간별 최적 납입 전략과 연금 수령 시뮬레이션까지 제공합니다.",
};

export default function IRPPage() {
  return <IRPCalculatorClient />;
}