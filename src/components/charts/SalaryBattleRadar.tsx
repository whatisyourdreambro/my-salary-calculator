"use client";

// 연봉 배틀 RadarChart — recharts 지연 로드용 분리 컴포넌트.
// /fun/salary-battle 에서 next/dynamic(ssr:false)으로 불러 First Load JS 에서 recharts 제외.

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

export default function SalaryBattleRadar({
  data,
  nameA,
  nameB,
}: {
  data: any[];
  nameA: string;
  nameB: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="#333" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "#888", fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          name={nameA}
          dataKey="A"
          stroke="#3b82f6"
          strokeWidth={3}
          fill="#3b82f6"
          fillOpacity={0.3}
        />
        <Radar
          name={nameB}
          dataKey="B"
          stroke="#ef4444"
          strokeWidth={3}
          fill="#ef4444"
          fillOpacity={0.3}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
