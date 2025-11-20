"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface SalaryPieChartProps {
    netPay: number;
    totalDeduction: number;
}

export default function SalaryPieChart({ netPay, totalDeduction }: SalaryPieChartProps) {
    const data = [
        { name: "실수령액", value: netPay, color: "hsl(var(--primary))" },
        { name: "공제액(세금)", value: totalDeduction, color: "hsl(var(--destructive))" },
    ];

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(value);

    return (
        <div className="w-full h-[300px] bg-card rounded-xl border border-border p-4 shadow-sm">
            <h3 className="text-lg font-bold mb-4 text-center">실수령액 vs 공제액 비율</h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ backgroundColor: "hsl(var(--popover))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                        itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
