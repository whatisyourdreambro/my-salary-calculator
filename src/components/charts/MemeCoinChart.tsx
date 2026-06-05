"use client";

// 밈코인 모의투자 평가액 추이 LineChart — recharts 지연 로드용 분리 컴포넌트.
// /fun/meme-coin 에서 next/dynamic(ssr:false)으로 불러 First Load JS 에서 recharts 제외.

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts";

const fmt = (n: number) => n.toLocaleString("ko-KR");

interface MemeCoinChartDatum {
  time: string;
  value: number;
}

export default function MemeCoinChart({
  data,
  totalInvested,
  isProfit,
}: {
  data: MemeCoinChartDatum[];
  totalInvested: number;
  isProfit: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis dataKey="time" stroke="#555" tick={{ fontSize: 11 }} />
        <YAxis stroke="#555" tick={{ fontSize: 10 }} tickFormatter={v => `${Math.round(v / 10000)}만`} />
        <Tooltip
          contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D", borderRadius: "8px" }}
          labelStyle={{ color: "#888" }}
          formatter={(v: number) => [`${fmt(Math.round(v))}원`, "평가액"]}
        />
        <ReferenceLine y={totalInvested} stroke="#555" strokeDasharray="4 4" label={{ value: "투자액", fill: "#666", fontSize: 10 }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={isProfit ? "#4ade80" : "#f87171"}
          strokeWidth={2.5}
          dot={{ r: 4, fill: isProfit ? "#4ade80" : "#f87171" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
