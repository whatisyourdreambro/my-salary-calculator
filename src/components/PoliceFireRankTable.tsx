// src/components/PoliceFireRankTable.tsx
//
// 경찰·소방 계급×호봉 봉급표 (서버 컴포넌트) — /police-pay-2026·/firefighter-pay-2026 공용.
// 별표 10은 경찰·소방 단일 통합표이므로 데이터는 하나, 계급 라벨만 변형.
// 데이터: src/lib/civilServantPay.ts POLICE_RANK_ROWS_2026 (3중 교차검증).

import { POLICE_RANK_ROWS_2026, POLICE_FIRE_RANK_LABELS } from "@/lib/civilServantPay";
import CivilPayHandoffButton from "@/components/CivilPayHandoffButton";
import { CIVIL_PAY_BASIS_VERSION, CIVIL_PAY_GRADES, CIVIL_PAY_SOURCES } from "@/lib/civilPayHandoff";

const fmt = (n: number) => n.toLocaleString("ko-KR");

export default function PoliceFireRankTable({ variant }: { variant: "police" | "fire" }) {
  const labels = POLICE_FIRE_RANK_LABELS.map((l) => (variant === "police" ? l.police : l.fire));
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[560px]">
        <thead>
          <tr className="border-b-2 border-canvas-200 text-navy">
            <th className="py-3 px-2 text-left font-black">호봉</th>
            {labels.map((name) => (
              <th key={name} className="py-3 px-2 text-right font-black">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {POLICE_RANK_ROWS_2026.map(([hobong, ...pays]) => (
            <tr key={hobong} className="border-b border-canvas-100">
              <td className="py-2.5 px-2 font-bold text-navy">{hobong}호봉</td>
              {/* 줄 높이 40px(호봉 칸 py-2.5 와 같음) — 금액 칸은 py-0 으로 전역 td 위아래 여백(0.75rem)을 없애고 버튼(min-h-10)이 높이를 낸다.
                  10/23 버튼 도입 때 줄마다 높아져 표 아래 결과창 광고(CalcResultAd)를 밀었다(2026-11-01 운영자 승인 B11). 줄을 다시 키우지 말 것. */}
              {pays.map((pay, i) => (
                <td key={labels[i]} className="px-2 py-0 text-right text-muted-blue tabular-nums">
                  <CivilPayHandoffButton gradeLabel={labels[i]} amountLabel={fmt(pay)} selection={{
                    source: CIVIL_PAY_SOURCES[variant], occupation: variant,
                    gradeId: CIVIL_PAY_GRADES[variant].find(grade => grade.label === labels[i])!.id,
                    step: hobong, payYear: 2026, basisVersion: CIVIL_PAY_BASIS_VERSION,
                  }}>{fmt(pay)}</CivilPayHandoffButton>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
