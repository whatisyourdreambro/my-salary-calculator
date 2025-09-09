"use client";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DeductionPieChartProps {
  data: {
    pension: number;
    health: number;
    longTermCare: number;
    employment: number;
    incomeTax: number;
    localTax: number;
  };
}

export default function DeductionPieChart({ data }: DeductionPieChartProps) {
  const chartData = {
    labels: [
      "국민연금",
      "건강보험",
      "장기요양",
      "고용보험",
      "소득세",
      "지방소득세",
    ],
    datasets: [
      {
        label: "공제액 상세",
        data: [
          data.pension,
          data.health,
          data.longTermCare,
          data.employment,
          data.incomeTax,
          data.localTax,
        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
        ],
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  return <Pie data={chartData} />;
}
