"use client";

// 인생 연봉 그래프 LineChart — recharts 지연 로드용 분리 컴포넌트.
// mbti-salary/page 에서 next/dynamic(ssr:false)으로 불러 First Load JS 에서 recharts 제외.

import {
 LineChart,
 Line,
 XAxis,
 YAxis,
 Tooltip,
 ResponsiveContainer,
 CartesianGrid,
 Legend,
} from "recharts";

interface SalaryDatum {
 age: number;
 salary: number;
}

export default function MbtiSalaryChart({ data }: { data: SalaryDatum[] }) {
 return (
 <ResponsiveContainer width="100%" height="100%">
 <LineChart
 data={data}
 margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
 >
 <CartesianGrid
 strokeDasharray="3 3"
 stroke="currentColor"
 strokeOpacity={0.2}
 />
 <XAxis dataKey="age" stroke="currentColor" />
 <YAxis
 tickFormatter={(value) => `${value}억`}
 stroke="currentColor"
 />
 <Tooltip
 contentStyle={{
 backgroundColor: "rgba(30,30,30,0.8)",
 border: "1px solid rgba(255,255,255,0.3)",
 }}
 />
 <Legend />
 <Line
 type="monotone"
 dataKey="salary"
 name="예상 연봉(억)"
 stroke="#8884d8"
 strokeWidth={3}
 dot={{ r: 4 }}
 activeDot={{ r: 8 }}
 />
 </LineChart>
 </ResponsiveContainer>
 );
}
