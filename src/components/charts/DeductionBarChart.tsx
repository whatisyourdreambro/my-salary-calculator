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

const CustomBarLabel = (props: any) => {
 const { x, y, width, value } = props;
 return (
 <text
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
 color: "#3D5E78",
 fontSize: "13px",
 fontWeight: 600,
 boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
 }}
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
