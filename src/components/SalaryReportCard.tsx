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
  S: "from-yellow-400 to-amber-500 text-white",
  A: "from-blue-500 to-indigo-600 text-white",
  B: "from-green-500 to-emerald-600 text-white",
  C: "from-gray-400 to-gray-500 text-white",
  D: "from-slate-600 to-slate-700 text-white",
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
            <PolarGrid stroke="rgba(255, 255, 255, 0.3)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "white", fontSize: 14 }}
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
              stroke="#ffffff"
              fill="#ffffff"
              fillOpacity={0.6}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                borderColor: "rgba(255, 255, 255, 0.3)",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "white", fontWeight: "bold" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
