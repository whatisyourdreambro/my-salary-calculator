"use client";

// David vs Goliath 실수령액 비교 BarChart — recharts 지연 로드용 분리 컴포넌트.
// company/simulator 에서 next/dynamic(ssr:false)으로 불러 First Load JS 에서 recharts 제외.

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ChartDatum {
 name: string;
 net: number;
 gross: number;
 color: string;
}

export default function SimulatorChart({ data }: { data: ChartDatum[] }) {
 return (
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
 <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 14, fontWeight: 'bold' }} />
 <YAxis hide />
 <Tooltip
 cursor={{ fill: 'rgba(255,255,255,0.05)' }}
 contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px' }}
 formatter={(value: number) => [`${value.toLocaleString('ko-KR')}원`, '월 실수령액']}
 />
 <Bar dataKey="net" radius={[10, 10, 0, 0]} barSize={80}>
 {data.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 );
}
