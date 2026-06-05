"use client";

// 대출 잔액 추이 AreaChart — recharts 지연 로드용 분리 컴포넌트.
// LoanCalculator 에서 next/dynamic(ssr:false)으로 불러 First Load JS 에서 recharts 제외.

import {
 AreaChart,
 Area,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
} from "recharts";

interface ScheduleRow {
 month: number;
 payment: number;
 principal: number;
 interest: number;
 balance: number;
}

interface LoanChartProps {
 schedule: ScheduleRow[];
 formatMoney: (val: number) => string;
}

export default function LoanChart({ schedule, formatMoney }: LoanChartProps) {
 return (
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={schedule}>
 <defs>
 <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#0145F2" stopOpacity={0.3} />
 <stop offset="95%" stopColor="#0145F2" stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" stroke="#DDE4EC" vertical={false} />
 <XAxis dataKey="month" hide />
 <YAxis hide />
 <Tooltip
 contentStyle={{ backgroundColor: "#0A1829", border: "1px solid #294460", borderRadius: "0.75rem", color: "#EDF1F5" }}
 formatter={(value: number) => formatMoney(value)}
 labelFormatter={(label) => `${label}개월차`}
 />
 <Area
 type="monotone"
 dataKey="balance"
 stroke="#0145F2"
 strokeWidth={2}
 fillOpacity={1}
 fill="url(#colorBalance)"
 />
 </AreaChart>
 </ResponsiveContainer>
 );
}
