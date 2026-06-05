"use client";

// 연봉 분포 AreaChart — recharts 지연 로드용 분리 컴포넌트.
// /fun/rank RankClient 에서 next/dynamic(ssr:false)으로 불러 First Load JS 에서 recharts 제외.

import {
  AreaChart,
  Area,
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
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip
          contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '1rem', color: '#fff' }}
          itemStyle={{ color: '#e879f9' }}
          formatter={(value: number) => [`${value.toFixed(1)}%`, '인구 비율']}
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
        <ReferenceLine x={salary} stroke="#fff" strokeDasharray="3 3" label={{ position: 'top', value: 'ME', fill: 'white', fontWeight: 'bold' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
