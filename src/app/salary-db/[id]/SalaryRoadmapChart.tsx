"use client";

// 회사 상세(/salary-db/[id]) 의 "커리어 연봉 로드맵" recharts 차트.
// CompanyDetailClient 에서 dynamic(ssr:false) 로 지연 로드되어 recharts(~60kB)를
// 432개 회사 페이지의 초기 번들(First Load JS)에서 분리한다. (WealthChart 와 동일 전략)

import {
 AreaChart,
 Area,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
} from "recharts";

const formatMoney = (val: number) =>
 `${(val / 10000).toLocaleString("ko-KR")}만원`;

export type SalaryRoadmapDatum = {
 level: string;
 base: number;
 total: number;
};

export default function SalaryRoadmapChart({
 data,
}: {
 data: SalaryRoadmapDatum[];
}) {
 return (
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={data}>
 <defs>
 <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
 <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
 <XAxis dataKey="level" />
 {/* 값은 원 단위 — 천만으로 나눴으므로 라벨도 '천만' (예: 6.3천만 = 6,300만원) */}
 <YAxis tickFormatter={(val) => `${val / 10000000}천만`} />
 <Tooltip
 formatter={(value: number) => formatMoney(value)}
 contentStyle={{
 backgroundColor: "hsl(var(--card))",
 borderColor: "hsl(var(--border))",
 borderRadius: "12px",
 }}
 />
 <Area
 type="monotone"
 dataKey="total"
 stroke="#3b82f6"
 fillOpacity={1}
 fill="url(#colorTotal)"
 name="총 보상"
 />
 <Area
 type="monotone"
 dataKey="base"
 stroke="#7A9AB5"
 fillOpacity={0.5}
 fill="transparent"
 strokeDasharray="5 5"
 name="기본급"
 />
 </AreaChart>
 </ResponsiveContainer>
 );
}
