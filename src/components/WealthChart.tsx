// src/components/WealthChart.tsx

"use client";

import React, { useState, useMemo } from "react";
import {
 AreaChart,
 Area,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
 ReferenceLine,
 Label,
} from "recharts";
import { calculateWealthProjection } from "@/lib/wealthCalculator";
import { TrendingUp, Target, PiggyBank } from "lucide-react";

interface WealthChartProps {
 monthlyNetSalary: number;
}

const formatKRW = (value: number) => {
 if (value >= 100000000) {
 return `${(value / 100000000).toFixed(1)}억`;
 }
 return `${(value / 10000).toLocaleString('ko-KR')}만`;
};

// Custom Mung Marker for the Goal
const MungGoalMarker = (props: any) => {
 const { viewBox } = props;
 return (
 <svg
 x={viewBox.x - 20}
 y={viewBox.y - 45}
 width="40"
 height="40"
 viewBox="0 0 100 100"
 className="animate-bounce"
 >
 <circle cx="50" cy="50" r="45" fill="#FFD700" stroke="#b57642" strokeWidth="2" />
 <text x="50" y="65" fontSize="40" textAnchor="middle">🏆</text>
 </svg>
 );
};

export default function WealthChart({ monthlyNetSalary }: WealthChartProps) {
 const [savingsRate, setSavingsRate] = useState(50); // %
 const [annualReturn, setAnnualReturn] = useState(8); // %
 const [fireGoal, setFireGoal] = useState(1000000000); // Default 10억 (1 Billion KRW)

 const monthlySavings = (monthlyNetSalary * savingsRate) / 100;
 
 const data = useMemo(() => {
 return calculateWealthProjection(monthlySavings, annualReturn / 100, 30, 30);
 }, [monthlySavings, annualReturn]);

 // Find the year we hit the FIRE goal
 const fireYear = data.find((d) => d.compoundGrowth >= fireGoal);

 return (
 <div className="bg-white p-6 rounded-2xl border border-canvas shadow-xl space-y-8">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h2 className="text-2xl font-bold text-[#0F4C81] flex items-center gap-2">
 <TrendingUp /> 자산 성장 시뮬레이션
 </h2>
 <p className="text-faint-blue text-sm">월 {formatKRW(monthlySavings)}원씩 투자하면 미래의 내 자산은?</p>
 </div>
 <div className="flex items-center gap-2 bg-canvas px-4 py-2 rounded-xl border border-electric">
 <Target className="text-electric" size={20} />
 <span className="text-sm font-semibold text-blue-800">목표: {formatKRW(fireGoal)}원</span>
 </div>
 </div>

 {/* Sliders Area */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="space-y-3">
 <div className="flex justify-between">
 <label className="text-sm font-bold text-muted-blue">저축률</label>
 <span className="text-sm font-bold text-[#0F4C81]">{savingsRate}%</span>
 </div>
 <input
 type="range"
 min="0"
 max="100"
 value={savingsRate}
 onChange={(e) => setSavingsRate(Number(e.target.value))}
 className="w-full h-2 bg-canvas-deeper rounded-lg appearance-none cursor-pointer accent-[#0F4C81]"
 />
 </div>

 <div className="space-y-3">
 <div className="flex justify-between">
 <label className="text-sm font-bold text-muted-blue">기대 수익률 (연)</label>
 <span className="text-sm font-bold text-primary">{annualReturn}%</span>
 </div>
 <input
 type="range"
 min="1"
 max="20"
 value={annualReturn}
 onChange={(e) => setAnnualReturn(Number(e.target.value))}
 className="w-full h-2 bg-canvas-deeper rounded-lg appearance-none cursor-pointer accent-green-500"
 />
 </div>

 <div className="space-y-3">
 <div className="flex justify-between">
 <label className="text-sm font-bold text-muted-blue">은퇴 목표액</label>
 <span className="text-sm font-bold text-[#FFD700] bg-electric/5 px-2 rounded">{formatKRW(fireGoal)}</span>
 </div>
 <select 
 className="w-full p-2 bg-canvas border border-canvas rounded-lg text-sm font-semibold"
 value={fireGoal}
 onChange={(e) => setFireGoal(Number(e.target.value))}
 >
 <option value={500000000}>5억 (반파이어)</option>
 <option value={1000000000}>10억 (국민 목표)</option>
 <option value={2000000000}>20억 (여유로운 삶)</option>
 <option value={5000000000}>50억 (부자의 상징)</option>
 <option value={10000000000}>100억 (Mung's Dream)</option>
 </select>
 </div>
 </div>

 {/* Chart */}
 <div className="h-[350px] w-full">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
 <defs>
 <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#FFD700" stopOpacity={0.4} />
 <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
 </linearGradient>
 <linearGradient id="colorSimple" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#7A9AB5" stopOpacity={0.2} />
 <stop offset="95%" stopColor="#7A9AB5" stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
 <XAxis 
 dataKey="year" 
 axisLine={false} 
 tickLine={false} 
 tick={{ fontSize: 12, fill: '#7A9AB5' }}
 label={{ value: '경과 년수', position: 'insideBottom', offset: -5, fontSize: 12 }}
 />
 <YAxis 
 axisLine={false} 
 tickLine={false} 
 tick={{ fontSize: 12, fill: '#7A9AB5' }}
 tickFormatter={formatKRW}
 />
 <Tooltip 
 content={({ active, payload, label }) => {
 if (active && payload && payload.length) {
 return (
 <div className="bg-white p-4 border border-canvas shadow-xl rounded-xl">
 <p className="font-bold text-navy mb-2">{label}년 후 (나이: {payload[0].payload.age}세)</p>
 <div className="space-y-1">
 <p className="text-sm text-electric flex justify-between gap-4">
 <span>단순 저축:</span> 
 <span className="font-bold">{formatKRW(payload[0].value as number)}원</span>
 </p>
 <p className="text-sm text-primary flex justify-between gap-4">
 <span>복리 성장:</span> 
 <span className="font-bold">{formatKRW(payload[1].value as number)}원</span>
 </p>
 </div>
 </div>
 );
 }
 return null;
 }}
 />
 <Area
 type="monotone"
 dataKey="simpleSavings"
 stroke="#7A9AB5"
 strokeWidth={2}
 fillOpacity={1}
 fill="url(#colorSimple)"
 name="단순 저축"
 animationDuration={1500}
 />
 <Area
 type="monotone"
 dataKey="compoundGrowth"
 stroke="#FFD700"
 strokeWidth={4}
 fillOpacity={1}
 fill="url(#colorGrowth)"
 name="복리 성장"
 animationDuration={2000}
 />
 
 {/* Fire Goal Reference Line */}
 {fireYear && (
 <ReferenceLine 
 x={fireYear.year} 
 stroke="#FFD700" 
 strokeDasharray="5 5"
 label={({ viewBox }) => (
 <g>
 <MungGoalMarker viewBox={viewBox} />
 <text 
 x={viewBox.x + 5} 
 y={viewBox.y + 20} 
 fill="#b57642" 
 fontSize="12" 
 fontWeight="bold"
 >
 {fireYear.year}년 뒤 달성!
 </text>
 </g>
 )}
 />
 )}
 </AreaChart>
 </ResponsiveContainer>
 </div>

 <div className="bg-primary/5 rounded-xl p-4 flex gap-3 items-start border border-primary">
 <div className="text-2xl">💡</div>
 <div>
 <h4 className="font-bold text-primary text-sm">Mung's Wealth Tip</h4>
 <p className="text-primary text-xs mt-1 leading-relaxed">
 {fireYear 
 ? `현재 저축과 수익률을 유지하면 ${fireYear.age}세에 목표액 ${formatKRW(fireGoal)}원을 달성합니다. 복리의 힘은 시간이 지날수록 거대해집니다!`
 : `목표액에 도달하기 위해 저축률을 높이거나 투자 수익률을 개선해보세요. 일찍 시작할수록 유리합니다.`}
 </p>
 </div>
 </div>
 </div>
 );
}
