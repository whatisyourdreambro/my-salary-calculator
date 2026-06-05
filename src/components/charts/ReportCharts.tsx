"use client";

// 종합 금융 리포트 차트(PieChart + BarChart) — recharts 지연 로드용 분리 컴포넌트.
// report/page 에서 next/dynamic(ssr:false)으로 불러 First Load JS 에서 recharts 제외.

import {
 PieChart,
 Pie,
 Cell,
 ResponsiveContainer,
 Tooltip,
 Legend,
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
} from "recharts";

const formatNumber = (num: number) => num.toLocaleString('ko-KR');

const COLORS = ["#0052ff", "#ffc82c", "#00C49F", "#FF8042", "#8884d8"];

const RADIAN = Math.PI / 180;

// 타입 단언에 사용할 인터페이스를 정의합니다. (인덱스 시그니처 제거)
interface PieCustomLabelProps {
 cx: number;
 cy: number;
 midAngle: number;
 innerRadius: number;
 outerRadius: number;
 percent: number;
 name: string;
}

// 1. 함수의 인자 타입을 일반 object로 변경하여 타입 호환성 문제를 해결합니다.
const renderCustomizedLabel = (props: object) => {
 // 2. 함수 내부에서 'as'를 사용해 props의 타입을 단언해줍니다.
 const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } =
 props as PieCustomLabelProps;

 const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
 const x = cx + radius * Math.cos(-midAngle * RADIAN);
 const y = cy + radius * Math.sin(-midAngle * RADIAN);

 return (
 <text
 x={x}
 y={y}
 fill="white"
 textAnchor={x > cx ? "start" : "end"}
 dominantBaseline="central"
 className="font-bold text-xs"
 >
 {`${name} ${(percent * 100).toFixed(0)}%`}
 </text>
 );
};

interface CompositionDatum {
 name: string;
 value: number;
}

interface ProjectionDatum {
 year: number;
 "내 연봉": number;
}

export function AnnualCompositionPieChart({
 data,
}: {
 data: CompositionDatum[];
}) {
 return (
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={data}
 dataKey="value"
 nameKey="name"
 cx="50%"
 cy="50%"
 outerRadius={80}
 labelLine={false}
 label={renderCustomizedLabel}
 >
 {data.map((entry, index) => (
 <Cell
 key={`cell-${index}`}
 fill={COLORS[index % COLORS.length]}
 />
 ))}
 </Pie>
 <Tooltip
 formatter={(value: number) => `${formatNumber(value)}원`}
 />
 <Legend />
 </PieChart>
 </ResponsiveContainer>
 );
}

export function FutureProjectionBarChart({
 data,
}: {
 data: ProjectionDatum[];
}) {
 return (
 <ResponsiveContainer width="100%" height="100%">
 <BarChart
 data={data}
 margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
 >
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="year" />
 <YAxis tickFormatter={(value) => `${value / 10000}만원`} />
 <Tooltip
 formatter={(value: number) => `${formatNumber(value)}원`}
 />
 <Legend />
 <Bar dataKey="내 연봉" fill="#0052ff" />
 </BarChart>
 </ResponsiveContainer>
 );
}
