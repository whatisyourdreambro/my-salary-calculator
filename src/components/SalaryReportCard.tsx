"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ReportCardData } from "@/lib/reportCardAnalysis";

interface Props {
  reportData: ReportCardData;
}

const gradeColorMap = {
  S: "from-accent to-accent/80 text-accent-foreground",
  A: "from-primary to-primary/80 text-primary-foreground",
  B: "from-green-500 to-green-600 text-white",
  C: "from-muted to-muted/80 text-muted-foreground",
  D: "from-destructive to-destructive/80 text-destructive-foreground",
};

export default function SalaryReportCard({ reportData }: Props) {
  const { grade, title, summary, stats } = reportData;

  return (
    <div
      className={`mt-8 p-6 rounded-2xl shadow-2xl bg-gradient-to-br ${gradeColorMap[grade]}`}
    >
      <div className="text-center mb-6">
        <p className="font-bold text-4xl tracking-widest">{grade}</p>
        <h3 className="font-semibold text-xl mt-1">{title}</h3>
        <p className="text-sm mt-2 opacity-80 max-w-md mx-auto">{summary}</p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "hsl(var(--primary-foreground))", fontSize: 14 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="나의 능력치"
              dataKey="value"
              stroke="hsl(var(--accent))"
              fill="hsl(var(--accent))"
              fillOpacity={0.6}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}