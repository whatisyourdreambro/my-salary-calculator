// src/components/PayForecastTable.tsx
//
// 2027 대표 호봉 봉급 비교 표 (서버 컴포넌트) — /teacher-pay-2027·/police-pay-2027·/firefighter-pay-2027 공용.
// 행은 src/lib/payForecast2027.ts 가 만든다(확정 전: 2026 확정 × 예산안 3.9%, 천원 반올림). 전체 호봉표가 아니라
// 대표 몇 줄이며, 확정 전에는 열 머리글에 '예상'을 붙여 확정 봉급표처럼 읽히지 않게 한다.
// confirmed(12월 말 PAY_FULL_2027 입력 뒤)면 머리글만 '2027 확정'·'월 차이'로 바뀐다 — 행 수·열 수는 같다.

import type { PayForecastRow } from "@/lib/payForecast2027";

const fmt = (n: number) => n.toLocaleString("ko-KR");

type PayForecastTableProps = {
  caption: string;
  rows: ReadonlyArray<PayForecastRow>;
  /** 첫 열 머리글 — 교원 '호봉', 경찰·소방 '계급·호봉' */
  firstColumn: string;
  regionLabel: string;
  /** 2027 값이 확정 봉급표 금액인지 (기본 false = 예상) */
  confirmed?: boolean;
};

export default function PayForecastTable({
  caption,
  rows,
  firstColumn,
  regionLabel,
  confirmed = false,
}: PayForecastTableProps) {
  return (
    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={regionLabel}>
      <table className="w-full text-sm tabular-nums min-w-[520px]">
        <caption className="mb-3 text-left text-xs text-muted-blue">{caption}</caption>
        <thead>
          <tr className="border-b-2 border-canvas-200 text-navy">
            <th scope="col" className="py-3 px-2 text-left font-black">{firstColumn}</th>
            <th scope="col" className="py-3 px-2 text-right font-black whitespace-nowrap">2026 확정</th>
            <th scope="col" className="py-3 px-2 text-right font-black whitespace-nowrap">{confirmed ? "2027 확정" : "2027 예상"}</th>
            <th scope="col" className="py-3 px-2 text-right font-black whitespace-nowrap">{confirmed ? "월 차이" : "월 차이(예상)"}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-canvas-100">
              <th scope="row" className="py-2.5 px-2 text-left font-bold text-navy">
                <span className="whitespace-nowrap">{row.label}</span>
                {row.note && <span className="block text-xs font-normal text-faint-blue">{row.note}</span>}
              </th>
              <td className="py-2.5 px-2 text-right text-muted-blue whitespace-nowrap">{fmt(row.base2026)}</td>
              <td className="py-2.5 px-2 text-right font-bold text-navy whitespace-nowrap">{fmt(row.pay2027)}</td>
              <td className="py-2.5 px-2 text-right text-electric whitespace-nowrap">+{fmt(row.monthlyIncrease)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
