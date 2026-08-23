"use client";

// 주가 시나리오 시뮬레이터 래퍼 — 본체는 별도 청크로 지연 로드 (ssr:false).
// 이 래퍼의 heading·소개 문단은 서버 HTML에 포함되어 크롤러에 보인다.

import dynamic from "next/dynamic";

const StockScenarioSimulator = dynamic(() => import("./StockScenarioSimulator"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-canvas-deep bg-canvas/30 p-5 text-center text-xs text-faint">
      주가 시나리오 시뮬레이터 불러오는 중…
    </div>
  ),
});

export default function StockScenarioSection() {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-black mb-1">
        📉📈 주가 시나리오 시뮬레이터 — 자사주 수령 가치
      </h3>
      <p className="text-xs text-faint mb-3 leading-relaxed">
        내 PS 산정액과 기준가(3개 시점 종가 중 최저가), 지급 시점별 주가
        변동률을 입력하면 트랜치별 주식 수·지급일 가치·하방 보전 발동액을
        계산합니다. 지급 첫날 기준으로는 보전 덕에 산정액 이상이 보장되고,
        주가가 오르면 상승분은 그대로 수령액이 됩니다.
      </p>
      <StockScenarioSimulator />
    </div>
  );
}
