"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { motion } from "framer-motion";

interface SalaryPieChartProps {
    netPay: number;
    totalDeduction: number;
}

export default function SalaryPieChart({ netPay, totalDeduction }: SalaryPieChartProps) {
    const data = [
        { name: "실수령액", value: netPay, color: "#10B981" }, // emerald-500
        { name: "공제액 (세금 등)", value: totalDeduction, color: "#EF4444" }, // red-500
    ];

    if (netPay === 0 && totalDeduction === 0) return null;

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.8, bounce: 0.3 }}
            className="w-full h-[300px] bg-card/30 rounded-xl border border-border p-4"
        >
            <h3 className="text-center font-bold mb-2 text-muted-foreground">급여 구성 비율</h3>
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
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) => `${value.toLocaleString()}원`}
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </motion.div>
    );
}
