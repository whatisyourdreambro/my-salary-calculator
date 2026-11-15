"use client";

// 공제 비율 BarChart — recharts 지연 로드용 분리 컴포넌트.
// InteractiveTable 등에서 next/dynamic(ssr:false)으로 불러 First Load JS 에서 recharts 제외.

import {
 BarChart,
 Bar,
 XAxis,
 Tooltip,
 ResponsiveContainer,
 LabelList,
 Cell,
} from "recharts";

interface ChartDatum {
 name: string;
 value: number;
 color: string;
}

interface CustomBarLabelProps {
 x?: number;
 y?: number;
 width?: number;
 value?: number;
}

const CustomBarLabel = (props: CustomBarLabelProps) => {
 const { x, y, width, value } = props as Required<CustomBarLabelProps>;
 // recharts-label 클래스로 globals.css 의 차트 글자색(--content-muted)을 받는다 — fill 은 CSS 없을 때의 대체값.
 // 종전 #7A9AB5 그대로는 밝은 패널 위 2.79:1 (2026-11-15 N2-components-05, components-b01-F02). 크기·굵기 그대로.
 return (
 <text
 className="recharts-label"
 x={x + width / 2}
 y={y}
 fill="#7A9AB5"
 dy={-6}
 textAnchor="middle"
 fontSize={11}
 fontWeight="700"
 >
 {`${value}%`}
 </text>
 );
};

export default function DeductionBarChart({ data }: { data: ChartDatum[] }) {
 return (
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }} barSize={28}>
 <XAxis
 dataKey="name"
 stroke="#cbd5e1"
 fontSize={11}
 tickLine={false}
 axisLine={false}
 dy={8}
 />
 <Tooltip
 cursor={{ fill: "rgba(0,0,0,0.03)" }}
 contentStyle={{
 backgroundColor: "#fff",
 borderColor: "#e2e8f0",
 borderRadius: "14px",
 fontSize: "13px",
 fontWeight: 600,
 boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
 }}
 itemStyle={{ color: "inherit" }}
 formatter={(value: number) => [`${value}%`, "비중"]}
 />
 <Bar dataKey="value" radius={[6, 6, 0, 0]}>
 {data.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 <LabelList dataKey="value" content={<CustomBarLabel />} />
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 );
}
