"use client";

// 연봉 분포 AreaChart — recharts 지연 로드용 분리 컴포넌트.
// /fun/rank RankClient 에서 next/dynamic(ssr:false)으로 불러 First Load JS 에서 recharts 제외.

import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface RankChartDatum {
  salary: number;
  density: number;
}

export default function RankChart({
  data,
  salary,
}: {
  data: RankChartDatum[];
  salary: number;
}) {
  // 숫자 X축(연봉, 화면에는 숨김)이 있어야 ReferenceLine x={연봉} 이 그려지고 툴팁 라벨이 금액이 된다.
  // 종전에는 XAxis 가 없어 recharts 가 인덱스(0~90) 축을 썼다 — 'ME' 선이 안 그려지고 툴팁이 '0만원'
  // (2026-10-05 감사 code27-02). 범위 밖 연봉은 양 끝에 붙여 그린다.
  const minX = data.length > 0 ? data[0].salary : 0;
  const maxX = data.length > 0 ? data[data.length - 1].salary : 0;
  const markerX = Math.min(Math.max(salary, minX), maxX);
  // ME 선·라벨은 카드 글자색(currentColor) — 흰 선(#fff)은 라이트 테마 흰 카드(duotone-card) 위에서 안 보였다.
  // 위 여백 24px: position top 라벨은 기준선이 그림 영역 위 끝 - 5px 에 놓이는데, 기본 여백 5px 이면 y=0 이라
  // SVG 밖으로 잘렸다. 좌우 16px: 양 끝에 붙은 ME 라벨도 잘리지 않게. 고정 높이(h-80) 상자 안 변경 (P4 검토 보정).
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 24, right: 16, bottom: 5, left: 16 }}>
        <XAxis dataKey="salary" type="number" domain={[minX, maxX]} hide />
        <defs>
          <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip
          contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '1rem', color: '#fff' }}
          itemStyle={{ color: '#e879f9' }}
          formatter={(value: number) => [`${value.toFixed(1)}%`, '가상 곡선값']}
          labelFormatter={(label) => `${(label / 10000).toLocaleString('ko-KR')}만원`}
        />
        <Area
          type="monotone"
          dataKey="density"
          stroke="#d946ef"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorDensity)"
        />
        <ReferenceLine x={markerX} stroke="currentColor" strokeDasharray="3 3" label={{ position: 'top', value: 'ME', fill: 'currentColor', fontWeight: 'bold' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
