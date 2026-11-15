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
 {/* 툴팁 상자는 globals.css 가 카드색(라이트 흰색)으로 칠한다 — 종전 글자색 #EDF1F5 는 흰 상자 위 1.14:1 로
 '{n}개월차' 가 안 보였다(축이 숨겨져 있어 유일한 월 표시). 글자색은 상자에서 물려받는다
 (2026-11-15 N2-components-05, components-b01-M01). name 은 툴팁 값 줄 이름(범례 없음). */}
 <Tooltip
 contentStyle={{ borderRadius: "0.75rem" }}
 itemStyle={{ color: "inherit" }}
 formatter={(value: number) => formatMoney(value)}
 labelFormatter={(label) => `${label}개월차`}
 />
 <Area
 name="잔액"
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
