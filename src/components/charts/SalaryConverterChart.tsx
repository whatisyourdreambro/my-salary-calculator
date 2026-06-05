"use client";

// 국가별 실질 구매력(PPP) BarChart — recharts 지연 로드용 분리 컴포넌트.
// /en/salary-converter 에서 next/dynamic(ssr:false)으로 불러 First Load JS 에서 recharts 제외.

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function SalaryConverterChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#DDE4EC" horizontal={false} />
        <XAxis type="number" stroke="#7A9AB5" tickFormatter={(val) => `$${val / 1000}k`} />
        <YAxis dataKey="country" type="category" stroke="#3D5E78" width={40} />
        <Tooltip
          cursor={{ fill: '#EDF1F5', opacity: 0.8 }}
          contentStyle={{ backgroundColor: '#fff', borderColor: '#DDE4EC', color: '#0A1829', borderRadius: '8px' }}
          formatter={(val: number) => [`$${Math.round(val).toLocaleString('ko-KR')}`, 'Real Value (USD)']}
        />
        <Bar dataKey="pppAdjustedNetUSD" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.country === 'KR' ? '#0145F2' : '#7A9AB5'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
