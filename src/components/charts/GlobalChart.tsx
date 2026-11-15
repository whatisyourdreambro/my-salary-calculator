"use client";

// 국가별 실수령액 BarChart — recharts 지연 로드용 분리 컴포넌트.
// /global 에서 next/dynamic(ssr:false)으로 불러 First Load JS 에서 recharts 제외.

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface GlobalChartDatum {
  name: string;
  net: number;
  gross: number;
  color: string;
}

export default function GlobalChart({ data }: { data: GlobalChartDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          dataKey="name"
          type="category"
          stroke="rgba(255,255,255,0.8)"
          tick={{ fontSize: 12, fontWeight: "bold" }}
          width={110}
        />
        {/* 툴팁 상자는 globals.css 가 카드색으로 칠한다 — 값 줄은 상자 글자색을 물려받아야 다크 테마에서도 읽힌다
            (recharts 기본 '#000' 은 다크 카드 위 1.25:1; 2026-11-15 N2-components-05, components-b01-F01) */}
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.05)" }}
          contentStyle={{ border: "none", borderRadius: "12px" }}
          itemStyle={{ color: "inherit" }}
          formatter={(value: number) => [`${Math.round(value).toLocaleString("ko-KR")}원`, "실수령액"]}
        />
        <Bar dataKey="net" radius={[0, 10, 10, 0]} barSize={40}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
