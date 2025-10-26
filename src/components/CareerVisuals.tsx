// src/components/CareerVisuals.tsx
"use client";

import { SimulationYearOutput } from "@/lib/careerPlanner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const formatYAxis = (tick: any) => {
    if (tick >= 100000000) return `${(tick / 100000000).toFixed(1)}억`;
    if (tick >= 10000) return `${Math.round(tick / 10000)}만`;
    return tick;
};

interface CareerVisualsProps {
    results: SimulationYearOutput[];
}

export default function CareerVisuals({ results }: CareerVisualsProps) {
    if (results.length === 0) {
        return (
            <div className="text-center p-10 border-2 border-dashed border-border rounded-xl min-h-[600px] flex items-center justify-center">
                <p className="text-muted-foreground">입력값을 설정하고 '결과 보기'를 눌러주세요. 📊</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <h3 className="text-lg font-bold mb-2">순자산 성장 추이</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={results}>
                    <defs>
                        <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="age" label={{ value: "나이", position: "insideBottom", offset: -5 }} fontSize={12} />
                    <YAxis tickFormatter={formatYAxis} fontSize={12} />
                    <Tooltip formatter={(value: number) => [value.toLocaleString() + '원', '순자산']} />
                    <Area type="monotone" dataKey="netWorth" strokeWidth={2} stroke="hsl(var(--primary))" fill="url(#colorNetWorth)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div>
                <h3 className="text-lg font-bold mb-2">연봉 및 총 수입 변화</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={results}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="age" label={{ value: "나이", position: "insideBottom", offset: -5 }} fontSize={12} />
                    <YAxis tickFormatter={formatYAxis} fontSize={12} />
                    <Tooltip formatter={(value: number) => value.toLocaleString() + '원'} />
                    <Legend />
                    <Line type="monotone" dataKey="salary" name="연봉" strokeWidth={2} stroke="hsl(var(--primary))" />
                    <Line type="monotone" dataKey="sideIncome" name="부수입" strokeWidth={2} stroke="hsl(var(--accent))" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="totalIncome" name="총 수입" strokeWidth={2} stroke="hsl(var(--secondary-foreground))" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
