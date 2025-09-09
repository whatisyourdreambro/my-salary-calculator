"use client";

import { useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { FutureSalaryResult } from "@/lib/futureCalculator"; // 타입을 임포트합니다.

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// 컴포넌트의 props 타입을 명확히 정의합니다.
interface FutureSalaryChartProps {
  data: FutureSalaryResult[];
}

export default function FutureSalaryChart({ data }: FutureSalaryChartProps) {
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  const chartData = {
    labels: data.map((d) => `${d.year}년`),
    datasets: [
      {
        label: "예상 연봉",
        data: data.map((d) => d.salary),
        borderColor: "#007FFF",
        backgroundColor: "rgba(0, 127, 255, 0.5)",
        tension: 0.1,
      },
    ],
  };

  const options: ChartOptions<"line" | "bar"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "연도별 연봉 성장 추이",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("ko-KR", {
                style: "currency",
                currency: "KRW",
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(128, 128, 128, 0.2)",
        },
      },
      y: {
        grid: {
          color: "rgba(128, 128, 128, 0.2)",
        },
        ticks: {
          callback: function (value) {
            return (
              new Intl.NumberFormat("ko-KR", {
                notation: "compact",
                maximumFractionDigits: 1,
              }).format(Number(value)) + "원"
            );
          },
        },
      },
    },
  };

  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={() => setChartType("line")}
          className={`px-3 py-1 text-xs rounded-md ${
            chartType === "line"
              ? "bg-signature-blue text-white"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          Line
        </button>
        <button
          onClick={() => setChartType("bar")}
          className={`px-3 py-1 text-xs rounded-md ${
            chartType === "bar"
              ? "bg-signature-blue text-white"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          Bar
        </button>
      </div>
      {chartType === "line" ? (
        <Line options={options} data={chartData} />
      ) : (
        <Bar options={options} data={chartData} />
      )}
    </div>
  );
}
