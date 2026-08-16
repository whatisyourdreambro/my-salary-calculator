"use client";

// /insights 리포트용 업종별 신입 초봉 가로 막대 차트.
// recharts는 반드시 next/dynamic(ssr:false)으로만 로드한다 (First Load JS 제외).
// 데이터는 서버 컴포넌트(리포트 페이지)가 집계해 props로 전달 — 이 파일은 렌더만.

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export interface IndustryChartDatum {
  /** 업종 한글 라벨 */
  name: string;
  /** 신입 영끌 평균 (만원) */
  avgManwon: number;
}

export function InsightEntrySalaryChart({ data }: { data: IndustryChartDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 40, left: 8, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="currentColor"
          strokeOpacity={0.15}
          horizontal={false}
        />
        <XAxis
          type="number"
          stroke="currentColor"
          fontSize={11}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}천만`}
        />
        <YAxis
          type="category"
          dataKey="name"
          stroke="currentColor"
          fontSize={11}
          width={104}
          interval={0}
        />
        <Tooltip
          formatter={(value) => [
            `평균 ${Number(value).toLocaleString("ko-KR")}만원`,
            "신입 초봉(영끌)",
          ]}
          contentStyle={{
            backgroundColor: "rgba(30,30,30,0.85)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 8,
            color: "#fff",
          }}
        />
        <Bar dataKey="avgManwon" fill="#0145F2" radius={[0, 6, 6, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}
